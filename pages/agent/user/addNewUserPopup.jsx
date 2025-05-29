import { useState } from "react";
import comparecss from "../../../styles/popup_modals.module.css";
import { useFormik } from "formik";
import * as yup from "yup";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { AGENT, BASIC_DETAILS, COMMON_CONSTANTS, MONTHS, RM_JOURNEY_ERROR_MESSAGES,COMMON } from "../../../constants";
import range from "lodash/range";
import { getMonth, getYear } from "date-fns";
import appConfig from "../../../app.config";
import { PostApiHandler } from "../../api/apihandler";
import { useTranslation } from "react-i18next";
import {
  calculateAge,
  charWithNumberInput,
  convertUTCToYYYY_MM_DD,
  dateFormat,
  emailInput,
  
  numberInput,
} from "../../../lib/util";
import Link from "next/link";
import { useEffect } from "react";
import Loader from "../../../svg/Loader";
import ExclamationCircle from "../../../svg/ExclamationCircle";
import LoginAlertPopUp from "../../common/loginAlertPopUp";

const AddNewUserPopup = ({ updateModalState }) => {
  const [addNewUser, setAddNewUser] = useState(true);
  const [isCustomerDataFetched, setisCustomerDataFetched] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [displayError, setDisplayError] = useState(false);
  const [fetchedCustomerData, setFetchedCustomerData] = useState([]);
  const years = range(getYear(new Date()) - 101, getYear(new Date()) + 1, 1);
  const [getCurrentAgentEmail, setCurrentAgentEmail] = useState("");
  const { t: translate } = useTranslation();
 
  const initialValues = {
    panNumber: "",
    dateOfBirth: "",
    phone: "",
    email: "",
  };
  const validationSchema = yup.object({
    panNumber: yup
      .string()
      .max(10, translate(RM_JOURNEY_ERROR_MESSAGES.invalidPAN))
      .matches(
        /([A-Z]){5}([0-9]){4}([A-Z]){1}$/,
        translate(RM_JOURNEY_ERROR_MESSAGES.invalidPAN)
      )
      .required(""),
    dateOfBirth: yup
      .date()
      .nullable()
      .test(
        translate(RM_JOURNEY_ERROR_MESSAGES.isUserMinor),
        translate(RM_JOURNEY_ERROR_MESSAGES.minorNotAllowed),
        (value) => {
          if (!value) return true;
          const age = calculateAge(value);
          if (age < 18 || age > 100) {
            return false;
          } else {
            return true;
          }
        }
      )
      .required(""),
    phone: yup
      .string()
      .max(10, translate(RM_JOURNEY_ERROR_MESSAGES.invalidMobileNumberLength))
      .matches(/^[0-9]\d{9}$/, translate(RM_JOURNEY_ERROR_MESSAGES.invalidMobileNumber))
      .required(""),
    email: yup
      .string()
      .test(
        translate(RM_JOURNEY_ERROR_MESSAGES.isValidEmail),
        translate(RM_JOURNEY_ERROR_MESSAGES.isEmailInvalid),
        (value) => {
          if (!value) return true;

          if (value.length > 320) {
            return false;
          }
  
          const parts = value.split('@');
          if (parts.length !== 2) {
            return false;
          }
  
          const [localPart, domainPart] = parts;
  
          if (localPart.length > 64) {
            return false;
          }
  
  
          if (domainPart.length > 255) {
            return false;
          }
  
          return value.match(/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/) !== null;
        }
      )
      .required(""),
  });

  const formik = useFormik({ initialValues, validationSchema });
  const { values, touched, errors, setFieldValue } = formik;

  const fetchRecordFromNSDL = () => {
    setIsLoading(true);
    
    const addNewUserURL =
      appConfig?.deploy?.baseUrl + appConfig?.deploy?.rmAddNewCustomer;
    const requestBody = {
      pan_number: values.panNumber,
      date_of_birth: convertUTCToYYYY_MM_DD(values.dateOfBirth),
      mobile_no: values.phone,
      email_id: values.email,
    };

    PostApiHandler(addNewUserURL, "Post", requestBody).then((response) => {
      if (response?.data?.errors?.length) {
        const { errorMessage } = response.data.errors[0];
        setDisplayError(errorMessage);
        setAddNewUser(false);
        setisCustomerDataFetched(false);
        setIsLoading(false);
      } else if (response?.data?.data) {
        setisCustomerDataFetched(true);
        const { data } = response.data;
        setisCustomerDataFetched(true);
        setAddNewUser(false);
        setFetchedCustomerData(data);
        sessionStorage.setItem("rm_customer_data", JSON.stringify(data));
        setIsLoading(false);
      } else {
        setIsLoading(false);
        setisCustomerDataFetched(false);
        setAddNewUser(false);
        setDisplayError("Something went wrong");
      }
    });
  };

  const handleRetryBtnClick = () => {
    setAddNewUser(true);
  }

  useEffect(() => {
    setCurrentAgentEmail(sessionStorage.getItem("agentEmail"));
  }, []);

  return (
    <div className="fixed inset-0 z-10 overflow-y-auto" id="1">
      <div
        className="fixed inset-0 w-auto h-auto bg-black opacity-25"
        onClick={updateModalState}
      ></div>
      <div
        className={`flex items-center min-h-screen ${comparecss.compare_pop_size}`}
      >
        <div
          className={`relative h-max bg-white rounded-md shadow-lg ${comparecss.compare_popup_width}`}
        >
          {addNewUser ? (
            <>
              <div className="flex justify-center p-4">
                <h1 className="text-4xl text-medium text-black">{translate(COMMON.EnterCustomerDetails)}</h1>
              </div>
              <div className="flex flex-col p-4 px-10 gap-3">
                <input
                  type="text"
                  className="h-12 input-field text-black w-full"
                  placeholder={translate(BASIC_DETAILS.panNo) + " " + "*"}
                  maxLength={10}
                  value={values.panNumber}
                  name="panNumber"
                  onChange={(e) => {
                    const filteredText = charWithNumberInput(e.target.value);
                    setFieldValue("panNumber", filteredText.toUpperCase());
                  }}
                />
                {touched.panNumber || errors.panNumber ? (
                  <span className="text-base text-light-red">
                    {errors.panNumber}
                  </span>
                ) : null}
                <DatePicker
                  defaultValue={values.dateOfBirth}
                  selected={values.dateOfBirth}
                  dateFormat={[
                    "dd-MMM-yyyy",
                    "dd-MM-yyyy",
                    "dd/MMM/yyyy",
                    "dd/MM/yyyy",
                  ]}
                  maxDate={new Date()}
                  onChange={(e) => setFieldValue("dateOfBirth", e)}
                  onSelect={(e) => setFieldValue("dateOfBirth", e)}
                  placeholderText={translate(AGENT.dobDMY) +  " " + "*"}
                  className="py-2.5 w-full border border-gray-300 rounded h-12 text-black input-field"
                  renderCustomHeader={({
                    date,
                    changeYear,
                    changeMonth,
                    decreaseMonth,
                    increaseMonth,
                    prevMonthButtonDisabled,
                    nextMonthButtonDisabled,
                  }) => (
                    <div
                      style={{
                        margin: 10,
                        display: "flex",
                        justifyContent: "center",
                      }}
                    >
                      <button
                        onClick={decreaseMonth}
                        disabled={prevMonthButtonDisabled}
                      >
                        &nbsp;{"< "}&nbsp;
                      </button>
                      <select
                        value={MONTHS[getMonth(date)]}
                        onChange={({ target: { value } }) =>
                          changeMonth(MONTHS.indexOf(value))
                        }
                      >
                        {MONTHS.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                      &nbsp;
                      <select
                        value={getYear(date)}
                        onChange={({ target: { value } }) => changeYear(value)}
                      >
                        {years.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                      <button
                        onClick={increaseMonth}
                        disabled={nextMonthButtonDisabled}
                      >
                        &nbsp; {" > "} &nbsp;
                      </button>
                    </div>
                  )}
                />
                {touched.dateOfBirth || errors.dateOfBirth ? (
                  <span className="text-base text-light-red">
                    {errors.dateOfBirth}
                  </span>
                ) : null}
                <input
                  type="text"
                  className="h-12 input-field text-black w-full"
                  placeholder= {translate(AGENT.phone) + " " + "*"}
                  value={values.phone}
                  maxLength="10"
                  name="phone"
                  onChange={(e) => {
                    const filteredText = numberInput(e.target.value);
                    setFieldValue("phone", filteredText.toUpperCase());
                  }}
                />
                {touched.phone || errors.phone ? (
                  <span className="text-base text-light-red">
                    {errors.phone}
                  </span>
                ) : null}
                <input
                  type="text"
                  className="h-12 input-field text-black w-full"
                  placeholder={translate(AGENT.email) + " " + "*"}
                  value={values.email}
                  name="email"
                  onChange={(e) => {
                    const filteredText = emailInput(e.target.value);
                    setFieldValue("email", filteredText);
                  }}
                />
                {touched.email ||
                  errors.email ||
                  values.email === getCurrentAgentEmail ? (
                  <span className="text-base text-light-red">
                    {values.email === getCurrentAgentEmail
                      ? RM_JOURNEY_ERROR_MESSAGES.isEmailSameAsAgentEmail
                      : errors.email}
                  </span>
                ) : null}
                <div className="flex justify-center gap-5 mt-5">
                  <button
                    className="button-passive border-fd-primary text-fd-primary"
                    onClick={updateModalState}
                  >
                    {translate(COMMON_CONSTANTS.cancel)}
                  </button>
                  <button
                    className={(Object.keys(errors).length ||
                      values.email === getCurrentAgentEmail ||
                      !formik.dirty) ? "button-active  button-transition hover:bg-hover-primary text-medium text-xl lg:text-2xl w-fit   text-medium text-xl lg:text-2xl w-fit  hover:button-shadow"  : "button-active btn-gradient button-transition hover:bg-hover-primary text-medium text-xl lg:text-2xl w-fit   text-medium text-xl lg:text-2xl w-fit  hover:button-shadow"} 
                    disabled={
                      Object.keys(errors).length ||
                      values.email === getCurrentAgentEmail ||
                      !formik.dirty
                    }
                    onClick={fetchRecordFromNSDL}
                  >
                    {translate(AGENT.proceed)} {isLoading && <Loader />}
                  </button>
                </div>
              </div>{" "}
            </>
          ) : isCustomerDataFetched ? (
            <>
              <div className="flex justify-center p-4">
                <h1 className="text-4xl text-medium text-black">{translate(AGENT.customerDetails)}</h1>
              </div>
              <div className="flex flex-col p-4 gap-3 px-10">
                <div className="p-3 flex flex-col border-2 rounded">
                  <div className="mb-5">
                    <h2 className="text-light-gray">{translate(AGENT.nameAsPerPan)}</h2>
                    <h1 className="text-5xl text-medium text-black break-words">
                      {fetchedCustomerData?.first_name +
                        " " +
                        fetchedCustomerData?.last_name}
                    </h1>
                  </div>
                  <div className="mb-3">
                    <div className="flex gap-5">
                      <div className="w-1/6 text-light-gray">{translate(AGENT.dob)}</div>
                      <div className="w-5/6 break-words">
                        {dateFormat(values.dateOfBirth)}
                      </div>
                    </div>
                    <div className="flex gap-5">
                      <div className="w-1/6 text-light-gray">{translate(AGENT.phone)}</div>
                      <div className="w-5/6 break-words">{values.phone}</div>
                    </div>
                    <div className="flex gap-5">
                      <div className="w-1/6 text-light-gray">{translate(AGENT.email)}</div>
                      <div className="w-5/6 break-words">{values.email}</div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-center gap-5 mt-5">
                  <button
                    className="button-passive border-fd-primary text-fd-primary"
                    onClick={updateModalState}
                  >
                    {translate(COMMON_CONSTANTS.cancel)}
                  </button>
                  <Link href={{ pathname: "/product/product_list" }}>
                    <button
                      className="button-active btn-gradient button-transition hover:bg-hover-primary text-medium text-xl lg:text-2xl w-fit   text-medium text-xl lg:text-2xl w-fit  hover:button-shadow"
                      onClick={() => setIsLoading(true)}
                    >
                      Proceed {isLoading && <Loader />}
                    </button>
                  </Link>
                </div>
              </div>
            </>
          ) : displayError?.toLowerCase() === "session has expired" ? <LoginAlertPopUp/>:(
            <div className="flex flex-col gap-5 p-6">
              <div className="flex justify-center text-light-red">
                <ExclamationCircle />
              </div>
              <div className="flex flex-col gap-3">
                <h1 className="flex justify-center text-light-red">
                  {displayError}
                </h1>
              </div>
              <div className="flex justify-center gap-5">
                <button
                  className="button-passive border-fd-primary text-fd-primary"
                  onClick={updateModalState}
                >
                  {translate(COMMON_CONSTANTS.cancel)}
                </button>
                <button
                  className="button-active btn-gradient button-transition hover:bg-hover-primary text-medium text-xl lg:text-2xl w-fit   text-medium text-xl lg:text-2xl w-fit  hover:button-shadow"
                  onClick={handleRetryBtnClick}
                >
                  {translate(AGENT.retry)}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AddNewUserPopup;

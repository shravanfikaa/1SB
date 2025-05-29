
import { useState, useEffect } from "react";
import appConfig from "../../app.config";
import { GetApiHandler } from "../api/apihandler";
import {
  dateFormat,
  getCustomerAddressDetails,
  numberInput,
  handleInput, handleInputAddress,
  handleEventLogger,
  isMobile
} from "../../lib/util";
import styles from "../../styles/customerAddressDetails.module.css";
import { useFormik } from "formik";
import * as yup from "yup";
import Loader from "../../svg/Loader";
import { compareTwoStrings } from "string-similarity";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { ADDRESS_DETAILS, COMMON_CONSTANTS, MONTHS, REDIRECTION_MSG } from "../../constants";
import { getMonth, getYear } from "date-fns";
import range from "lodash/range";
import { useTranslation } from "react-i18next";

function CustomerAddressDetails(props) {
  const [pinCodeLoading, setPinCodeLoading] = useState(false);
  const years = range(getYear(new Date()) - 101, getYear(new Date()) + 1, 1);
  const [selectedManufactureId, setSelectedManufactureId] = useState(typeof window !== 'undefined' ? sessionStorage.getItem("selectedManufactureId") || "" : "");
  const [isUserTypeRM, setIsUserTypeRM] = useState(false);
  const { t: translate } = useTranslation();

  const initialValues = {
    permanent_address1: "",
    permanent_zip: "",
    permanent_city: "",
    permanent_country: "",
    permanent_state: "",
    communication_address1: "",
    communication_zip: "",
    communication_city: "",
    communication_country: "",
    communication_state: "",
    sameAddress: false,
    stayingSince: "",
    customerAddressPreferredCheck: true,
  };

  //Conditionally add schema
  const createSchema = (isCondition) => {
    let schemaData = yup.object({
    });
    if (isCondition === "usfb") {
      schemaData = schemaData.shape(
        {
          communication_address1: yup.string().required(""),
          stayingSince: yup.date().required(""),
          customerAddressPreferredCheck: yup.boolean().oneOf([true]).required(),
          communication_zip: yup
            .string()
            .matches(/^[1-9][0-9]{5}$/,)
            .min(6, translate(REDIRECTION_MSG.EnterAValidCommunicationZIPCode))
            .test("Is pin code valid", translate(REDIRECTION_MSG.InvalidZIPcode), (value) => {
              if (value?.length === 6 && values.communication_city === null) {
                return false;
              } else {
                return true;
              }
            })
            .required(""),


        }
      );
    }
    if (isCondition === "sib") {
      schemaData = schemaData.shape(
        {
          customerAddressPreferredCheck: yup.boolean()
            .oneOf([true], translate(REDIRECTION_MSG.CustomerAddressPreference)) // Enforce true if it exists
            .when('sameAddress', {
              is: true, // If sameAddress is true
              then: yup.boolean().notRequired(), // Make it not required if sameAddress is true
              otherwise: yup.boolean().required(translate(REDIRECTION_MSG.CustomerAddressPreferenceRequired)), // Otherwise, make it required
            }),
        }
      );
    }
    return schemaData;
  }

  const validationSchema = createSchema(selectedManufactureId?.toLowerCase())

  const formik = useFormik({
    initialValues,
    validationSchema,
    validateOnChange: true
  });

  const { values, errors, setFieldValue, validateField, handleChange } = formik;
  const getZipCodeDetails = (pinCode, filedType) => {
    setPinCodeLoading(true);

    const url =
      appConfig?.deploy?.baseUrl + appConfig?.deploy?.zipCode + pinCode;

    GetApiHandler(url, "GET")
      .then((response) => {
        if (response?.data?.errors?.length) {
          if (filedType.includes("communication")) {
            formik.setFieldError("communication_zip", "Invalid ZIP code");
          } else {
            formik.setFieldError("permanent_zip", "Invalid ZIP code");
          }
        }
        else if (response.data && response.data.data) {
          const { city, state, country } = response.data.data;
          if (filedType.includes("communication")) {
            setFieldValue("communication_city", city);
            setFieldValue("communication_state", state);
            setFieldValue("communication_country", country);
          } else {
            setFieldValue("permanent_city", city);
            setFieldValue("permanent_state", state);
            setFieldValue("permanent_country", country);
          }
        }
      })
      .finally(() => setPinCodeLoading(false));
  };

  useEffect(() => {
    setTimeout(() => {
      if (values.communication_address1) {
        validateField("communication_address1")
      }
    }, 100)

  }, [values.communication_address1])

  useEffect(() => {
    setTimeout(() => {
      values.communication_zip && validateField("communication_zip")
    }, 100)
  }, [values.communication_zip])

  const handleAddressCheckboxClick = (e) => {

    setFieldValue("sameAddress", e.target.checked);
    if (e.target.checked) {
      setFieldValue("communication_address1", values.permanent_address1);
      setFieldValue("communication_zip", values.permanent_zip);
      setFieldValue("communication_city", values.permanent_city);
      setFieldValue("communication_state", values.permanent_state);
      setFieldValue("communication_country", values.permanent_country);
      selectedManufactureId?.toLowerCase() === "sib" && setFieldValue("customerAddressPreferredCheck", true);
      selectedManufactureId?.toLowerCase() === "usfb" && setFieldValue("customerAddressPreferredCheck", true);
    } else {
      setFieldValue("communication_address1", "");
      setFieldValue("communication_zip", "");
      setFieldValue("communication_city", "");
      setFieldValue("communication_state", "");
      setFieldValue("communication_country", "");
      selectedManufactureId?.toLowerCase() === "usfb" && setFieldValue("customerAddressPreferredCheck", true);

    }
  };

  const getZipCode = (value, filedType) => {
    if (value.length === 6) {
      !values.sameAddress && getZipCodeDetails(value, filedType);
    }
    if (values.communication_zip === "") {
      setFieldValue("communication_city", "");
      setFieldValue("communication_state", "");
      setFieldValue("communication_country", "");
    }
  };

  const handlePermanentZipChange = (value) => {
    if (isAddressEditable) {
      const filteredText = numberInput(value);
      setFieldValue("permanent_zip", filteredText);
      getZipCode(filteredText, "permanent");
    }
  }

  const setOnboardingUserAddress = () => {
    if (props.componentData?.length) {
      props.componentData.forEach((val) => {
        const { customerAddressType, customerAddress1, customerAddress2, customerAddress3, customerAddressPincode, customerAddressState, customerAddressCity, customerAddressCountry, customerAddressDistrict } = val;
        let addrLine1 = customerAddress1;
        customerAddress2 && (addrLine1 = addrLine1 + ", " + customerAddress2);
        customerAddress3 && (addrLine1 = addrLine1 + ", " + customerAddress3);
        if (customerAddressType === "P") {
          setFieldValue("permanent_address1", addrLine1);
          setFieldValue("permanent_zip", customerAddressPincode);
          setFieldValue("permanent_city", customerAddressCity);
          setFieldValue("permanent_country", customerAddressCountry);
          setFieldValue("permanent_state", customerAddressState);
        } else {
          setFieldValue("communication_address1", addrLine1);
          setFieldValue("communication_zip", customerAddressPincode);
          setFieldValue("communication_city", customerAddressCity);
          setFieldValue("communication_country", customerAddressCountry);
          setFieldValue("communication_state", customerAddressState);
          setFieldValue("sameAddress", val.sameAddress ? val.sameAddress : "");
          setFieldValue("stayingSince", val.stayingSince ? val.stayingSince : "")
        }
      })
    };
  }

  const [isAddressEditable, setIsAddressEditable] = useState(false);
  const [shouldShowCommunicationAddr, setShouldShowCommunicationAddr] = useState(true);

  useEffect(() => {
    if (values.communication_zip === "") {
      setFieldValue("communication_city", "");
      setFieldValue("communication_state", "");
      setFieldValue("communication_country", "");
    }
  }, [values.communication_zip])

  useEffect(() => {
    if (!values.permanent_address1) {
      const selectedUserId = sessionStorage.getItem("selectedUserId");

      if (selectedUserId) {
        const familyDetails = JSON.parse(sessionStorage.getItem("familyDetails"));
        if (familyDetails?.payload?.investorDetails) {
          const investorDetails = familyDetails.payload.investorDetails.find(details => details.userId === Number(selectedUserId));
          if (investorDetails) {
            !investorDetails.isFamilyHead && setIsAddressEditable(true);
          }
        }
      }
    }
  }, [values]);

  useEffect(() => {
    if (selectedManufactureId) {
      selectedManufactureId?.toUpperCase() === "PNBHFC" && setShouldShowCommunicationAddr(false);
    }
  }, [selectedManufactureId]);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
    const selectedManufactureId = sessionStorage.getItem("selectedManufactureId");
    setSelectedManufactureId(selectedManufactureId);

    if (typeof window !== undefined) {
      const status = sessionStorage.getItem("isAssistedUser");
      if (status) {
        setIsUserTypeRM(true);
      }
    }

    if (props.isOnboardingUser) {
      setOnboardingUserAddress();
    } else {
      const details = getCustomerAddressDetails();
      if (details) {
        const keys = Object.keys(details);
        keys.length &&
          keys.filter(keysData => keysData.includes("permanent")).forEach((key) => {
            details[key] &&
              setFieldValue(key, details[key]);
          })
      }
      const productIdLocal = sessionStorage.getItem("selectedProductId");
      if (productIdLocal && sessionStorage[productIdLocal]) {
        const { customer_address } = JSON.parse(sessionStorage[productIdLocal]);

        if (customer_address) {
          const keys = Object.keys(customer_address);
          keys.length &&
            keys.forEach((key) => {
              if (key === "stayingSince" && customer_address[key]) {
                setFieldValue(key, new Date(customer_address[key]));
              } else {
                customer_address[key] &&
                  setFieldValue(key, customer_address[key]);
              }
            });
        }
      }
    }
  }, []);

  const handleBackButtonClick = () => {
    props.handle(props.prevPage, {}, { customer_address: values },);
  };

  const handleContinueButtonClick = () => {
    handleEventLogger("customer_address", "buttonClick", "Invest_Click", {
      action: "Address_Details_Completed",
      Screen_Name: "Address Details page",
      State: values.permanent_state,
      City: values.permanent_city,
      Country: values.permanent_country,
      Platform: isMobile()
    });
    props.handle(props.nextPage, {}, { customer_address: values }, "customer_address", values);
  };

  const handleSaveAddressDetails = () => {
    const { permanent_address1,
      permanent_zip,
      permanent_city,
      permanent_country,
      permanent_state,

      communication_address1,
      communication_zip,
      communication_city,
      communication_country,
      communication_state,
      sameAddress,
      stayingSince } = values;

    props.handleSaveDetails({
      customerAddress:
        [{
          corAddSameAsPer: sameAddress,
          customerAddress1: permanent_address1,
          customerAddress2: "",
          customerAddress3: "",
          customerAddressCity: permanent_city,
          customerAddressCountry: permanent_country,
          customerAddressDistrict: "",
          customerAddressPincode: permanent_zip,
          customerAddressPreferred: "P",
          customerAddressState: permanent_state,
          customerAddressType: "P",
          customerStayingSince: stayingSince ? dateFormat(stayingSince) : ""
        },
        {
          corAddSameAsPer: sameAddress,
          customerAddress1: communication_address1,
          customerAddress2: "",
          customerAddress3: "",
          customerAddressCity: communication_city,
          customerAddressCountry: communication_country,
          customerAddressDistrict: "",
          customerAddressPincode: communication_zip,
          customerAddressPreferred: "P",
          customerAddressState: communication_state,
          customerAddressType: "C",
          customerStayingSince: ""
        }]
    });
  }

  useEffect(() => {
    if (props?.journeyData && Object.keys(props?.journeyData).length) {
      const { journeyData: { payload } } = props;
      const payloadData = payload ? payload : {};
      if (Object.keys(payloadData).length) {
        formik.setValues(payloadData);
      }
    }
  }, [props]);

  return (
    <div>

      <div className="text-medium text-black text-3xl text-black">{translate(ADDRESS_DETAILS.addressDetails)}</div>
      <div className="text-regular text-xl mb-5 text-subcontent ">
        {translate(ADDRESS_DETAILS.addressSubHeading)}

      </div>
      <div
        className={`gap-6 text-regular text-2xl text-light-gray ${styles.address_header_hide}`}
      >
        <div className="mb-3 w-1/2">{translate(ADDRESS_DETAILS.permanentAddress)}</div>

      </div>
      <div
        className={`gap-6 text-regular text-2xl text-light-gray ${styles.address_details_parent} mb-3 text-regular text-2xl text-light-gray`}
      >
        <div className={styles.address_details_container}>
          <div className={`mb-3 ${styles.address_header_show}`}>
            {translate(ADDRESS_DETAILS.permanentAddress)}
          </div>
          <div className=" gap-3">
            <textarea
              disabled={!isAddressEditable}
              placeholder={translate(ADDRESS_DETAILS.permanentAddressLine)}
              value={values.permanent_address1}
              name="permanent_address1"
              onInput={handleInputAddress}
              onChange={handleChange}
              className={
                !isAddressEditable
                  ? "text-black   p-3 w-full h-28 rounded h-12 input-field  w-full cursor-not-allowed"
                  : "text-black   p-3 w-full h-28 rounded"
              }
            />
            <div className="flex flex-wrap sm:flex-nowrap  mt-3 gap-3">
              <input
                maxLength={6}
                disabled={!isAddressEditable}
                placeholder={translate(ADDRESS_DETAILS.zip)}
                value={values.permanent_zip}
                name="permanent_zip"
                onChange={(e) => {
                  handlePermanentZipChange(e.target.value)
                }}
                className={!isAddressEditable
                  ? "input-field  cursor-not-allowed text-black   p-3 w-full rounded"
                  : "input-field  cursor-not-allowed text-black   p-3 w-full rounded  "}
              />
              <input
                placeholder={translate(ADDRESS_DETAILS.city)}
                name="permanent_city"
                onChange={handleChange}
                value={values.permanent_city}
                className="input-field  cursor-not-allowed text-black   p-3 w-full rounded"
                disabled
              />
              <input
                placeholder={translate(ADDRESS_DETAILS.state)}
                name="permanent_state"
                onChange={handleChange}
                value={values.permanent_state}
                className="input-field  cursor-not-allowed text-black   p-3 w-full rounded"
                disabled
              />
              <input
                placeholder={translate(ADDRESS_DETAILS.country)}
                onChange={handleChange}
                value={values.permanent_country}
                className="input-field  cursor-not-allowed text-black   p-3 w-full rounded"
                disabled
              />
            </div>
            {shouldShowCommunicationAddr && 
        <div className="flex gap-3 mt-3 mb-3 w-full items-center">
          <input
            type="checkbox"
            onChange={handleAddressCheckboxClick}
            checked={values.sameAddress}
            value={values.sameAddress}
            name="sameAddress"
            disabled={pinCodeLoading}
            className="accent-primary-green h-4 w-4 hover:cursor-pointer"
          />
          <div className="" >{translate(ADDRESS_DETAILS.communicationAddressIsSameAsPermanent)}</div>
        </div>}
            {selectedManufactureId?.toLowerCase() === "usfb" && !isUserTypeRM ?
              <DatePicker
                placeholderText={`${translate(ADDRESS_DETAILS.stayingSince)} *`}
                defaultValue={values?.stayingSince ? new Date(values?.stayingSince) : ""}
                selected={values?.stayingSince ? new Date(values?.stayingSince) : ""}
                maxDate={new Date()}
                dateFormat={"MM/yyyy"}
                onSelect={(e) => setFieldValue("stayingSince", e)}
                onChange={(e) => setFieldValue("stayingSince", e)}
                renderCustomHeader={({
                  date,
                  changeYear,
                  changeMonth,
                  decreaseMonth,
                  increaseMonth,
                  prevMonthButtonDisabled,
                  nextMonthButtonDisabled,
                }) => (
                  <div className="flex justify-center">
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
                className={
                  "w-full py-2 input-field text-2xl border border-solid border-gray-300 text-black"
                }
              />
              : null}
          </div>
        </div>
        {shouldShowCommunicationAddr && <div className={styles.address_details_container}>
          <div
            className={`flex gap-3 mb-3 items-center ${styles.address_header_show}`}
          >
            <input
              type="checkbox"
              onChange={handleAddressCheckboxClick}
              checked={values.sameAddress}
              value={values.sameAddress}
              name="sameAddress"
              disabled={pinCodeLoading}
              className="accent-primary-green h-4 w-4 hover:cursor-pointer"
            />
            <div>{translate(ADDRESS_DETAILS.communicationAddressIsSameAsPermanent)}</div>
          </div>
          <div className="mb-3 mt-5 w-full">{translate(ADDRESS_DETAILS.communicationAddress)}</div>
          <div className="flex flex-col gap-3 mt-5">
            <textarea
              name="communication_address1"
              onChange={handleChange}
              value={values.communication_address1}
              onInput={handleInputAddress}
              placeholder={`${translate(ADDRESS_DETAILS.communicationAddressLine)} ${selectedManufactureId?.toLowerCase() === "usfb" ? "*" : ""}`}
              className={
                values.sameAddress
                  ? "input-field  cursor-not-allowed text-black   p-3 w-full rounded"
                  : "text-black   p-3 w-full h-28 rounded h-12 input-field "
              }
              disabled={values.sameAddress}
            />
            <div className="flex gap-3 flex-wrap sm:flex-nowrap items-start">
              <div className="w-full">
                <input
                  maxLength={6}
                  placeholder={`${translate(ADDRESS_DETAILS.zip)} ${selectedManufactureId?.toLowerCase() === "usfb" ? "*" : ""}`}
                  name="communication_zip"
                  onChange={(e) => {
                    const filteredText = numberInput(e.target.value);
                    setFieldValue("communication_zip", filteredText);
                    getZipCode(filteredText, "communication");
                  }}
                  value={values.communication_zip}
                  className={
                    values.sameAddress
                      ? "input-field  cursor-not-allowed text-black   p-3 w-full rounded"
                      : "input-field  cursor-not-allowed text-black   p-3 w-full rounded  "
                  }
                  disabled={values.sameAddress}
                />
                {errors.communication_zip ? (
                  <div className="text-base text-light-red">
                    {errors.communication_zip}
                  </div>
                ) : null}
              </div>
              <input
                name="communication_city"
                placeholder={translate(ADDRESS_DETAILS.city)}
                onChange={handleChange}
                value={values.communication_city}
                className="input-field  cursor-not-allowed text-black   p-3 w-full rounded"
                disabled
              />
              <input
                name="communication_state"
                placeholder={translate(ADDRESS_DETAILS.state)}
                onChange={handleChange}
                value={values.communication_state}
                className="input-field  cursor-not-allowed text-black   p-3 w-full rounded"
                disabled
              />
              <input
                name="communication_country"
                placeholder={translate(ADDRESS_DETAILS.country)}
                onChange={handleChange}
                value={values.communication_country}
                className="input-field  cursor-not-allowed text-black   p-3 w-full rounded"
                disabled
              />
            </div>

          </div>
        </div>}
        
      </div>

      {
        (selectedManufactureId?.toLowerCase() === "usfb" && values.sameAddress) || (selectedManufactureId?.toLowerCase() === "sib" && !values.sameAddress) ? <div className="flex flex-row gap-3">
          <div>
            <input
              type="checkbox"
              className="accent-primary-green h-4 w-4 hover:cursor-pointer"
              onChange={(e) => {
                setFieldValue("customerAddressPreferredCheck", e.target.checked)
              }}
              checked={values.customerAddressPreferredCheck}
              value={values.customerAddressPreferredCheck}
              name="customerAddressPreferredCheck"

            />
          </div>
          <div className="text-justify text-base text-light-gray">
            {(selectedManufactureId?.toLowerCase() === "sib" && !values.sameAddress) ? translate(ADDRESS_DETAILS.sibrequestText) : selectedManufactureId?.toLowerCase() === "usfb" ? translate(ADDRESS_DETAILS.requestText) : ""}          </div>
        </div> : null
      }
      {props.isOnboardingUser ? (
        <div className="flex justify-center mt-7 gap-5">
          <button
            className={(pinCodeLoading) ? "button-active  button-transition text-medium text-xl lg:text-2xl w-fit   text-medium text-xl lg:text-2xl w-fit  " : "button-active btn-gradient button-transition text-medium text-xl lg:text-2xl w-fit   text-medium text-xl lg:text-2xl w-fit  "}
            onClick={() => handleSaveAddressDetails()}
            disabled={pinCodeLoading}
          >
            {translate(ADDRESS_DETAILS.save)}
            {pinCodeLoading ? <Loader /> : null}
          </button>
          <button
            className="button-passive border-fd-primary text-fd-primary"
            onClick={props.handleClose}
          >
            {translate(ADDRESS_DETAILS.close)}
          </button>
        </div>
      ) : (
        <div className="flex justify-start mt-7 gap-5">
          <button
            className="button-passive border-fd-primary text-fd-primary"
            onClick={handleBackButtonClick}
          >
            {translate(ADDRESS_DETAILS.back)}
          </button>
          <button
            className={(pinCodeLoading || !formik.isValid || !formik.dirty) ? "button-active  button-transition  text-medium text-xl lg:text-2xl w-fit   text-medium text-xl lg:text-2xl w-fit  " : "button-active  button-transition btn-gradient text-medium text-xl lg:text-2xl w-fit   text-medium text-xl lg:text-2xl w-fit  "}
            onClick={handleContinueButtonClick}
            disabled={pinCodeLoading || !formik.isValid || !formik.dirty}
          >
            {translate(COMMON_CONSTANTS.continueLabel)}
            {pinCodeLoading ? <Loader /> : null}
          </button>
        </div>
      )}
    </div>
  );
}

export default CustomerAddressDetails;

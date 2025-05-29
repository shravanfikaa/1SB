import styles from "../../../styles/fd.module.css";
import { useFormik } from "formik";
import * as yup from "yup";
import { useEffect, useState } from "react";
import { IoMdClose } from "react-icons/io";
import Loader from "../../../svg/Loader";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { charInput, dateFormat } from "../../../lib/util";
import { getMonth, getYear } from "date-fns";
import range from "lodash/range";
import { ADDRESS_DETAILS, AGENT, COMMON_CONSTANTS, INTEREST_RATES_DROPDOWN, MONTHS, VALIDATION_CONSTANT } from "../../../constants";
import { useTranslation } from "react-i18next";

function  EditUser({ saveAgentData, data, rolesData }) {
  const [loading, setLoading] = useState(false);
  const years = range(getYear(new Date()) - 101, getYear(new Date()) + 1, 1);
  const {t:translate} = useTranslation();
  const initialValues = {
    employee_id: "",
    first_name: "",
    middle_name: "",
    last_name: "",
    designation: "",
    email_id: "",
    role_type: "",
    user_status: "",
    mobile_number: "",
    pan_number: "",
    gender: "",
    date_of_birth: "",
    user_title: "",
  };

  const validationSchema = yup.object({
    email_id: yup
      .string()
      .test("Is valid Email ID", translate(VALIDATION_CONSTANT.validEmail), (value) => {
        if (value) {
          return value.match(/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/) !== null;
        } else {
          return true;
        }
      })
      .required(""),
    first_name: yup
      .string()
      .matches(/^[a-zA-Z ]*$/, translate(VALIDATION_CONSTANT.invalidValue))
      .required(""),
    middle_name: yup.string().matches(/^[a-zA-Z ]*$/, translate(VALIDATION_CONSTANT.invalidValue)),
    last_name: yup
      .string()
      .matches(/^[a-zA-Z ]*$/, translate(VALIDATION_CONSTANT.invalidValue))
      .required(""),
    designation: yup
      .string()
      .matches(/^\w+([\s-_]\w+)*$/, translate(VALIDATION_CONSTANT.invalidValue))
      .required(""),
    employee_id: yup
      .string()
      .matches(/^\w+([\s-_]\w+)*$/, translate(VALIDATION_CONSTANT.invalidValue))
      .required(""),
    role_type: yup.string().required(""),
    user_status: yup.string().required(""),
    mobile_number: yup
      .string()
      .max(10, translate(VALIDATION_CONSTANT.mobileNoLength))
      .matches(/^[0-9]\d{9}$/, translate(VALIDATION_CONSTANT.invalidValue))
      .required(""),
    pan_number: yup
      .string()
      .max(10, translate(VALIDATION_CONSTANT.invalidPAN))
      .matches(/([A-Z]){5}([0-9]){4}([A-Z]){1}$/, translate(VALIDATION_CONSTANT.invalidPAN))
      .required(""),
    gender: yup.string().required(""),
    user_title: yup.string().required(""),
    date_of_birth: yup
      .date()
      .nullable()
      .test("Is user minor", translate(VALIDATION_CONSTANT.enterValidDOB), (value) => {
        if (!value) return true;
        const age = calculateAge(value);
        if (age < 18) {
          return false;
        } else {
          return true;
        }
      })
      .required(""),
  });

  function calculateAge(dob) {
    if (dob) {
      const ageDifMs = Date.now() - dob.getTime();
      const ageDate = new Date(ageDifMs);
      return Math.abs(ageDate.getUTCFullYear() - 1970);
    }
  }

  const formik = useFormik({
    initialValues,
    validationSchema,
  });

  const { values, errors, setFieldValue, handleChange } = formik;

  const handleSaveData = () => {
    setLoading(true);
    saveAgentData(values);
  };

  const handleInputChange = (e, filedName) => {
    const filteredText = charInput(e.target.value);
    setFieldValue(filedName, filteredText);
  };

  useEffect(() => {
    console.log("data-->", data);
    Object.keys(data).forEach((key) => {
      if (key === "date_of_birth") {
        data[key] && setFieldValue(key, new Date(dateFormat(data[key])));
      } else if (key === "user_status") {
        data[key] && setFieldValue(key, data[key].toLowerCase());
      } else {
        data[key] && setFieldValue(key, data[key]);
      }
    });
  }, [data]);

  return (
    <>
      <div className="fixed inset-0 z-10 overflow-y-auto">
        <div className="fixed inset-0 w-auto h-auto bg-black opacity-40"></div>
        <div className="flex items-center justify-center min-h-screen px-4 py-8">
          <div className={`p-6 bg-white rounded-md shadow-lg z-[1] w-2/3`}>
            <div
              className={`flex justify-between mb-3 ${styles.cardContainer}`}
            >
              <div className="text-6xl text-black text-medium">{translate(AGENT.editUser)}</div>
              <button onClick={() => saveAgentData({})}>
                <IoMdClose size={22} className="close-button" />
              </button>
            </div>
            <div className={`w-full ${styles.cardContainer} text-medium`}>
              <div className="bg-white text-font fd_details_container">
                <div className="flex my-6">
                  <div className="w-full flex-col space-y-5">
                    <div className="flex gap-x-5">
                      <div className="w-1/4">
                        <label className="text-black">{translate(AGENT.userTitle)} </label>
                        <label className="text-light-red">*</label>
                      </div>
                      <div className="w-2/3 flex-col">
                        <select
                          name="user_title"
                          value={values.user_title}
                          onChange={(e) => {
                            setFieldValue("user_title", e.target.value);
                          }}
                          selected={values.user_title}
                          className="text-regular text-2xl text-black border border-gray-300  bg-white p-3 w-full rounded mb-"
                        >
                           <option value="" disabled selected hidden>
                            {translate(AGENT.selectSalutation)} *
                          </option>
                          <option value="Mr">{translate(AGENT.mr)}</option>
                          <option value="Mrs">{translate(AGENT.mrs)}</option>
                          <option value="Ms">{translate(AGENT.ms)}</option>
                        </select>
                        <div>
                          {errors.user_title ? (
                            <div className="text-base text-light-red">
                              {errors.user_title}
                            </div>
                          ) : null}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-x-5">
                      <div className="w-1/4">
                        <label className="text-medium text-black text-2xl">
                        {translate(AGENT.firstName)}
                        </label>{" "}
                        <label className="text-light-red">*</label>
                      </div>
                      <div className="w-2/3 flex-col">
                        <input
                          type="text"
                          className="h-12 input-field text-black w-full"
                          placeholder={`${translate(AGENT.firstName)}*`}
                          name="first_name"
                          onChange={(e) => {
                            handleInputChange(e, "first_name")
                          }}
                          value={values.first_name}
                        />
                        <div>
                          {errors.first_name ? (
                            <div className="text-base text-light-red">
                              {errors.first_name}
                            </div>
                          ) : null}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-x-5">
                      <div className="w-1/4">
                        <label className="text-medium text-black text-2xl">
                          {translate(AGENT.middleName)}
                        </label>
                      </div>
                      <div className="w-2/3 flex-col">
                        <input
                          type="text"
                          className="h-12 input-field text-black w-full"
                          placeholder={translate(AGENT.middleName)}
                          name="middle_name"
                          onChange={(e) => {
                            handleInputChange(e, "middle_name")
                          }}
                          value={values.middle_name}
                        />
                        <div>
                          {errors.middle_name ? (
                            <div className="text-base text-light-red">
                              {errors.middle_name}
                            </div>
                          ) : null}
                        </div>
                      </div>
                    </div>{" "}
                    <div className="flex gap-x-5">
                      <div className="w-1/4">
                        <label className="text-medium text-black text-2xl">
                          {translate(AGENT.lastName)}
                        </label>{" "}
                        <label className="text-light-red">*</label>
                      </div>
                      <div className="w-2/3 flex-col">
                        <input
                          type="text"
                          className="h-12 input-field text-black w-full"
                          placeholder={`${translate(AGENT.lastName)} *`}
                          name="last_name"
                          onChange={(e) => {
                            handleInputChange(e, "last_name")
                          }}
                          value={values.last_name}
                        />
                        <div>
                          {errors.last_name ? (
                            <div className="text-base text-light-red">
                              {errors.last_name}
                            </div>
                          ) : null}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-x-5">
                      <div className="w-1/4">
                        <label className="text-medium text-black text-2xl">
                        {translate(AGENT.employeeEmailId)}
                        </label>{" "}
                        <label className="text-light-red">*</label>
                      </div>
                      <div className="w-2/3 flex-col">
                        <input
                          type="text"
                          className="h-12 input-field text-black w-full"
                          placeholder={`${translate(AGENT.employeeEmailId)} *`}
                          name="email_id"
                          value={values.email_id}
                          onChange={handleChange}
                        />
                        <div>
                          {errors.email_id ? (
                            <div className="text-base text-light-red">
                              {errors.email_id}
                            </div>
                          ) : null}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-x-5">
                      <div className="w-1/4">
                        <label className="text-medium text-black text-2xl">
                          {translate(AGENT.employeeId)}
                        </label>{" "}
                        <label className="text-light-red">*</label>
                      </div>
                      <div className="w-2/3 flex-col">
                        <input
                          type="text"
                          className="h-12 input-field text-black w-full"
                          placeholder={`${translate(AGENT.employeeId)} *`}
                          name="employee_id"
                          value={values.employee_id}
                          onChange={handleChange}
                        />
                        <div>
                          {errors.employee_id ? (
                            <div className="text-base text-light-red">
                              {errors.employee_id}
                            </div>
                          ) : null}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-x-5">
                      <div className="w-1/4">
                        <label className="text-medium text-black text-2xl">
                          {translate(AGENT.designation)}
                        </label>{" "}
                        <label className="text-light-red">*</label>
                      </div>
                      <div className="w-2/3 flex-col">
                        <input
                          type="text"
                          className="h-12 input-field text-black w-full"
                          placeholder="Employee Designation *"
                          name="designation"
                          value={values.designation}
                          onChange={handleChange}
                        />
                        <div>
                          {errors.designation ? (
                            <div className="text-base text-light-red">
                              {errors.designation}
                            </div>
                          ) : null}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-x-5">
                      <div className="w-1/4">
                        <label className="text-medium text-black text-2xl">{translate(AGENT.role)}</label>{" "}
                        <label className="text-light-red">*</label>
                      </div>
                      <div className="w-2/3 flex-col">
                        <select
                          name="role_type"
                          selected={values.role_type}
                          value={values.role_type}
                          onChange={handleChange}
                          className="h-12 input-field text-black w-full"
                        >
                          {rolesData &&
                            rolesData.map((item) => {
                              return <option>{item.role_type}</option>;
                            })}
                        </select>
                      </div>
                    </div>
                    <div className="flex gap-x-5">
                      <div className="w-1/4">
                        <label className="text-medium text-black text-2xl">{translate(AGENT.status)}</label>{" "}
                        <label className="text-light-red">*</label>
                      </div>
                      <div className="w-2/3 flex-col">
                        <select
                          placeholder={translate(AGENT.status)}
                          name="user_status"
                          value={values.user_status}
                          onChange={handleChange}
                          selected={values.user_status}
                          className="h-12 input-field text-black w-full capitalize"
                        >
                          <option value="" disabled selected hidden>
                            {translate(AGENT.selectStatus)} *
                          </option>
                          {["active", "inactive"].map((item, i) => {
                            return (
                              <>
                                <option className="capitalize">{item}</option>
                              </>
                            );
                          })}
                        </select>
                      </div>
                    </div>
                    <div className="flex gap-x-5">
                      <div className="w-1/4">
                        <label className="text-medium text-black text-2xl">
                          {translate(AGENT.mobileNumber)}
                        </label>{" "}
                        <label className="text-light-red">*</label>
                      </div>
                      <div className="w-2/3 flex-col">
                        <input
                          type="text"
                          className="h-12 input-field text-black w-full"
                          placeholder={`${translate(AGENT.mobileNumber)} *`}
                          name="mobile_number"
                          maxLength={10}
                          value={values.mobile_number}
                          onChange={(e) => {
                            setFieldValue("mobile_number", e.target.value);
                          }}
                        />
                        <div>
                          {errors.mobile_number ? (
                            <div className="text-base text-light-red">
                              {errors.mobile_number}
                            </div>
                          ) : null}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-x-5">
                      <div className="w-1/4">
                        <label className="text-medium text-black text-2xl">
                          {translate(AGENT.panNumber)}
                        </label>{" "}
                        <label className="text-light-red">*</label>
                      </div>
                      <div className="w-2/3 flex-col">
                        <input
                          type="text"
                          className="h-12 input-field text-black w-full"
                          placeholder={`${translate(AGENT.panNumber)} *`}
                          name="pan_number"
                          value={values.pan_number}
                          onChange={(e) => {
                            setFieldValue(
                              "pan_number",
                              e.target.value.toUpperCase()
                            );
                          }}
                        />
                        <div>
                          {errors.pan_number ? (
                            <div className="text-base text-light-red">
                              {errors.pan_number}
                            </div>
                          ) : null}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-x-5">
                      <div className="w-1/4">
                        <label className="text-medium text-black text-2xl">{translate(AGENT.gender)}</label>{" "}
                        <label className="text-light-red">*</label>
                      </div>
                      <div className="w-2/3 flex-col">
                        <select
                          name="gender"
                          value={values.gender}
                          onChange={(e) => {
                            setFieldValue("gender", e.target.value);
                          }}
                          className="h-12 input-field text-black w-full"
                        >
                          <option
                            className="text-light-gray"
                            value=""
                            disabled
                            selected
                            hidden
                          >
                           {translate(AGENT.selectGender)} *
                          </option>
                          <option value="Female">{translate(INTEREST_RATES_DROPDOWN.female)}</option>
                          <option value="Male">{translate(AGENT.male)}</option>
                          <option value="Others">{translate(AGENT.others)}</option>
                        </select>
                      </div>
                    </div>
                    <div className="flex gap-x-5">
                      <div className="w-1/4">
                        <label className="text-medium text-black text-2xl">
                          {translate(AGENT.dateOfBirth)}
                        </label>{" "}
                        <label className="text-light-red">*</label>
                      </div>
                      <div className="w-2/3 flex-col">
                        <DatePicker
                          defaultValue={values.date_of_birth}
                          selected={values.date_of_birth}
                          dateFormat={[
                            "dd-MMM-yyyy",
                            "dd-MM-yyyy",
                            "dd/MMM/yyyy",
                            "dd/MM/yyyy",
                          ]}
                          onChange={(e) => setFieldValue("date_of_birth", e)}
                          onSelect={(e) => setFieldValue("date_of_birth", e)}
                          className="h-12 input-field text-black w-full"
                          placeholderText={`${translate(AGENT.dateOfBirth)} *`}
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
                                onChange={({ target: { value } }) =>
                                  changeYear(value)
                                }
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
                        <div>
                          {errors.date_of_birth ? (
                            <div className="text-base text-light-red">
                              {errors.date_of_birth}
                            </div>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex gap-5 justify-center">
                  <button
                    className="button-passive border-fd-primary text-fd-primary"
                    onClick={() => saveAgentData({})}
                  >
                    {translate(COMMON_CONSTANTS.cancel)}
                  </button>
                  <button
                    className= {(!formik.isValid) ? "button-active  button-transition hover:bg-hover-primary text-medium text-xl lg:text-2xl w-fit   text-medium text-xl lg:text-2xl w-fit  hover:button-shadow" : "button-active btn-gradient button-transition hover:bg-hover-primary text-medium text-xl lg:text-2xl w-fit   text-medium text-xl lg:text-2xl w-fit  hover:button-shadow"}
                    disabled={!formik.isValid}
                    onClick={handleSaveData}
                  >
                    {translate(ADDRESS_DETAILS.save)}     {loading ? <Loader /> : null}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default EditUser;

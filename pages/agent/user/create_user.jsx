import styles from "../../../styles/fd.module.css";
import { useFormik } from "formik";
import * as yup from "yup";
import { IoMdClose } from "react-icons/io";
import Loader from "../../../svg/Loader";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { getMonth, getYear } from "date-fns";
import range from "lodash/range";
import { useState } from "react";
import { AGENT, COMMON_CONSTANTS, INTEREST_RATES_DROPDOWN, MONTHS, VALIDATION_CONSTANT } from "../../../constants";
import { useTranslation } from "react-i18next";
import { charInput } from "../../../lib/util";

function CreateUser({ createAgentData, rolesData }) {
  const [loading, setLoading] = useState(false);
  const [selectedRoleId, setselectedRoleId] = useState(-1);
  const {t:translate} = useTranslation();
  const years = range(getYear(new Date()) - 101, getYear(new Date()) + 1, 1);

  const initialValues = {
    empId: "",
    empFirstName: "",
    empMiddleName: "",
    empLastName: "",
    empDesignation: "",
    empEmail: "",
    empRole: "",
    empMobileNumber: "",
    empPanNumber: "",
    gender: "",
    dateOfBirth: "",
    user_title: "",
  };

  const validationSchema = yup.object({
    empEmail: yup
      .string()
      .test("Is valid Email ID", translate(VALIDATION_CONSTANT.validEmail), (value) => {
        if (value) {
          return value.match(/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/) !== null;
        } else {
          return true;
        }
      })
      .required(""),

    empFirstName: yup
      .string()
      .matches(/^[a-zA-Z ]*$/, translate(VALIDATION_CONSTANT.invalidValue))
      .required(""),
    empMiddleName: yup
      .string()
      .matches(/^[a-zA-Z ]*$$/, translate(VALIDATION_CONSTANT.invalidValue)),
    empLastName: yup
      .string()
      .matches(/^[a-zA-Z ]*$$/, translate(VALIDATION_CONSTANT.invalidValue))
      .required(""),
    empDesignation: yup
      .string()
      .matches(/^\w+([\s-_]\w+)*$/, translate(VALIDATION_CONSTANT.invalidValue))
      .required(""),
    empId: yup
      .string()
      .matches(/^\w+([\s-_]\w+)*$/, translate(VALIDATION_CONSTANT.invalidValue))
      .required(""),
    empRole: yup.string().required(""),
    empMobileNumber: yup
      .string()
      .max(10, "Mobile number must be of length 10")
      .matches(/^[0-9]\d{9}$/, translate(VALIDATION_CONSTANT.invalidValue))
      .required(""),
    empPanNumber: yup
      .string()
      .max(10, translate(VALIDATION_CONSTANT.invalidPAN))
      .matches(/([A-Z]){5}([0-9]){4}([A-Z]){1}$/, translate(VALIDATION_CONSTANT.invalidPAN))
      .required(""),
    gender: yup.string().required(""),
    user_title: yup.string().required(""),
    dateOfBirth: yup
      .date()
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

  const { values, errors, isValid, dirty, setFieldValue } = formik;

  function handleAddUser() {
    setLoading(true);
    createAgentData({ values, selectedRoleId });
  }

  const handleInputChange = (e, filedName) => {
    const filteredText = charInput(e.target.value);
    setFieldValue(filedName, filteredText);
  };

  function setUserRoleID(e) {
    setFieldValue("empRole", e);
    rolesData.forEach((roleItem) => {
      if (roleItem.role_type === e) {
        setselectedRoleId(roleItem.id);
      }
    });
  }

  return (
    <>
      <div className="fixed inset-0 z-10 overflow-y-auto">
        <div className="fixed inset-0 w-auto h-auto bg-black opacity-40"></div>
        <div className="flex items-center justify-center min-h-screen px-4 py-8">
          <div className={`p-6 bg-white rounded-md shadow-lg z-[1] w-2/3`}>
            <div
              className={`flex justify-between mb-3 ${styles.cardContainer}`}
            >
              <div className="text-6xl text-black text-medium">{translate(AGENT.createUser)}</div>
              <div>
                <button onClick={() => createAgentData({})}>
                  <IoMdClose size={22} className="close-button" />
                </button>
              </div>
            </div>

            <div className={`w-full ${styles.cardContainer}`}>
              <div className="bg-white text-font fd_details_container">
                <div className="flex my-6 text-medium text-2xl">
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
                        <label className="text-black">{translate(AGENT.firstName)}</label>{" "}
                        <label className="text-light-red">*</label>
                      </div>
                      <div className="w-2/3 flex-col">
                        <input
                          type="text"
                          className="h-12 input-field text-black w-full"
                          placeholder={`${translate(AGENT.firstName)}*`}
                          name="empFirstName"
                          value={values.empFirstName}
                          onChange={(e) => {
                            handleInputChange(e, "empFirstName")
                          }}
                        />
                        <div>
                          {errors.empFirstName ? (
                            <div className="text-base text-light-red">
                              {errors.empFirstName}
                            </div>
                          ) : null}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-x-5">
                      <div className="w-1/4">
                        <label className="text-black">{translate(AGENT.middleName)}</label>
                      </div>
                      <div className="w-2/3 flex-col">
                        <input
                          type="text"
                          className="h-12 input-field text-black w-full"
                          placeholder={translate(AGENT.middleName)}
                          name="empMiddleName"
                          value={values.empMiddleName}
                          onChange={(e) => {
                            handleInputChange(e, "empMiddleName")
                          }}
                        />
                        <div>
                          {errors.empMiddleName ? (
                            <div className="text-base text-light-red">
                              {errors.empMiddleName}
                            </div>
                          ) : null}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-x-5">
                      <div className="w-1/4">
                        <label className="text-black">{translate(AGENT.lastName)}</label>{" "}
                        <label className="text-light-red">*</label>
                      </div>
                      <div className="w-2/3 flex-col">
                        <input
                          type="text"
                          className="h-12 input-field text-black w-full"
                          placeholder={`${translate(AGENT.lastName)} *`}
                          name="empLastName"
                          value={values.empLastName}
                          onChange={(e) => {
                            handleInputChange(e, "empLastName")
                          }}
                        />
                        <div>
                          {errors.empLastName ? (
                            <div className="text-base text-light-red">
                              {errors.empLastName}
                            </div>
                          ) : null}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-x-5">
                      <div className="w-1/4">
                        <label className="text-black">{translate(AGENT.employeeEmailId)}</label>{" "}
                        <label className="text-light-red">*</label>
                      </div>
                      <div className="w-2/3 flex-col">
                        <input
                          type="text"
                          className="h-12 input-field text-black w-full"
                          placeholder={`${translate(AGENT.employeeEmailId)} *`}
                          name="empEmail"
                          value={values.empEmail}
                          onChange={(e) => {
                            setFieldValue("empEmail", e.target.value);
                          }}
                        />
                        <div>
                          {errors.empEmail ? (
                            <div className="text-base text-light-red">
                              {errors.empEmail}
                            </div>
                          ) : null}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-x-5">
                      <div className="w-1/4">
                        <label className="text-black">{translate(AGENT.employeeId)}</label>{" "}
                        <label className="text-light-red">*</label>
                      </div>
                      <div className="w-2/3 flex-col">
                        <input
                          type="text"
                          className="h-12 input-field text-black w-full"
                          placeholder={`${translate(AGENT.employeeId)} *`}
                          name="empId"
                          value={values.empId}
                          onChange={(e) => {
                            setFieldValue("empId", e.target.value);
                          }}
                        />
                        <div>
                          {errors.empId ? (
                            <div className="text-base text-light-red">
                              {errors.empId}
                            </div>
                          ) : null}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-x-5">
                      <div className="w-1/4">
                        <label className="text-black">{translate(AGENT.designation)}</label>{" "}
                        <label className="text-light-red">*</label>
                      </div>
                      <div className="w-2/3 flex-col">
                        <input
                          type="text"
                          className="h-12 input-field text-black w-full"
                          placeholder={`${translate(AGENT.designation)} *`}
                          name="empDesignation"
                          value={values.empDesignation}
                          onChange={(e) => {
                            setFieldValue("empDesignation", e.target.value);
                          }}
                        />
                        <div>
                          {errors.empDesignation ? (
                            <div className="text-base text-light-red">
                              {errors.empDesignation}
                            </div>
                          ) : null}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-x-5">
                      <div className="w-1/4">
                        <label className="text-black">{translate(AGENT.role)}</label>{" "}
                        <label className="text-light-red">*</label>
                      </div>
                      <div className="w-2/3 flex-col">
                        <select
                          name="empRole"
                          value={values.empRole}
                          onChange={(e) => setUserRoleID(e.target.value)}
                          className="text-regular text-2xl text-black border border-gray-300  bg-white p-3 w-full rounded mb-"
                        >
                          <option value="" disabled selected hidden>
                            {translate(AGENT.selectRole)} *
                          </option>
                          {rolesData &&
                            rolesData.map((item) => {
                              return (
                                <option value={item.role_type}>
                                  {item.role_type}
                                </option>
                              );
                            })}
                        </select>
                        <div>
                          {errors.empRole ? (
                            <div className="text-base text-light-red">
                              {errors.empRole}
                            </div>
                          ) : null}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-x-5">
                      <div className="w-1/4">
                        <label className="text-black">{translate(AGENT.mobileNumber)}</label>{" "}
                        <label className="text-light-red">*</label>
                      </div>
                      <div className="w-2/3 flex-col">
                        <input
                          type="text"
                          className="h-12 input-field text-black w-full"
                          placeholder={`${translate(AGENT.mobileNumber)} *`}
                          name="empMobileNumber"
                          maxLength={10}
                          value={values.empMobileNumber}
                          onChange={(e) => {
                            setFieldValue("empMobileNumber", e.target.value);
                          }}
                        />
                        <div>
                          {errors.empMobileNumber ? (
                            <div className="text-base text-light-red">
                              {errors.empMobileNumber}
                            </div>
                          ) : null}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-x-5">
                      <div className="w-1/4">
                        <label className="text-black">{translate(AGENT.panNumber)}</label>{" "}
                        <label className="text-light-red">*</label>
                      </div>
                      <div className="w-2/3 flex-col">
                        <input
                          type="text"
                          className="h-12 input-field text-black w-full"
                          placeholder={`${translate(AGENT.panNumber)} *`}
                          name="empPanNumber"
                          value={values.empPanNumber}
                          onChange={(e) => {
                            setFieldValue(
                              "empPanNumber",
                              e.target.value.toUpperCase()
                            );
                          }}
                        />
                        <div>
                          {errors.empPanNumber ? (
                            <div className="text-base text-light-red">
                              {errors.empPanNumber}
                            </div>
                          ) : null}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-x-5">
                      <div className="w-1/4">
                        <label className="text-black">{translate(AGENT.gender)}</label>{" "}
                        <label className="text-light-red">*</label>
                      </div>
                      <div className="w-2/3 flex-col">
                        <select
                          name="gender"
                          value={values.gender}
                          onChange={(e) => {
                            setFieldValue("gender", e.target.value);
                          }}
                          className="text-regular text-2xl text-black border border-gray-300  bg-white p-3 w-full rounded mb-"
                        >
                          <option value="" disabled selected hidden>
                            {translate(AGENT.selectGender)} *
                          </option>
                          <option value="Female">{translate(INTEREST_RATES_DROPDOWN.female)}</option>
                          <option value="Male">{translate(AGENT.male)}</option>
                          <option value="Others">{translate(AGENT.others)}</option>
                        </select>
                        <div>
                          {errors.gender ? (
                            <div className="text-base text-light-red">
                              {errors.gender}
                            </div>
                          ) : null}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-x-5">
                      <div className="w-1/4">
                        <label className="text-black">{translate(AGENT.dateOfBirth)}</label>{" "}
                        <label className="text-light-red">*</label>
                      </div>
                      <div className="w-2/3 flex-col">
                        <DatePicker
                          defaultValue={values.dateOfBirth}
                          selected={values.dateOfBirth}
                          placeholderText={`${translate(AGENT.dateOfBirth)} *`}
                          dateFormat={[
                            "dd-MMM-yyyy",
                            "dd-MM-yyyy",
                            "dd/MMM/yyyy",
                            "dd/MM/yyyy",
                          ]}
                          className="h-12 input-field text-black w-full"
                          onChange={(e) => setFieldValue("dateOfBirth", e)}
                          onSelect={(e) => setFieldValue("dateOfBirth", e)}
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
                          {errors.dateOfBirth ? (
                            <div className="text-base text-light-red">
                              {errors.dateOfBirth}
                            </div>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex gap-3 justify-center">
                  <button
                    className="button-passive border-fd-primary text-fd-primary"
                    onClick={() => createAgentData({})}
                  >
                    {translate(COMMON_CONSTANTS.cancel)}
                  </button>
                  <button
                    className={(!formik.isValid || !formik.dirty) ? "button-active  button-transition hover:bg-hover-primary text-medium text-xl lg:text-2xl w-fit   text-medium text-xl lg:text-2xl w-fit  hover:button-shadow"  : "button-active btn-gradient button-transition hover:bg-hover-primary text-medium text-xl lg:text-2xl w-fit   text-medium text-xl lg:text-2xl w-fit  hover:button-shadow"} 
                    disabled={!formik.isValid || !formik.dirty}
                    onClick={handleAddUser}
                  >
                    {translate(AGENT.add)} {loading ? <Loader /> : null}
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

export default CreateUser;

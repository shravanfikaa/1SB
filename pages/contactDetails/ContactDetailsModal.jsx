import { useFormik } from "formik";
import { useState } from "react";
import { IoMdClose } from "react-icons/io";
import * as yup from "yup";
import {  numberInput } from "../../lib/util";
import appConfig from "../../app.config";
import Loader from "../../svg/Loader";
import { PatchApiHandler } from "../api/apihandler";
import popupcss from "../../styles/popup_modals.module.css";
import { BASIC_DETAILS, COMMON_CONSTANTS, VALIDATION_CONSTANT } from "../../constants";
import { useTranslation } from "react-i18next";

function ContactDetailsModal({ panDetails, modalStatus, getModalStatus }) {
  const [loading, setLoading] = useState(false);
  const {t:translate} = useTranslation();
  const initialValues = {
    mobileNumber: "",
    emailID: "",
  };

  const validationSchema = yup.object({
    mobileNumber: yup
      .string()
      .max(10, translate(VALIDATION_CONSTANT.mobileNoLength))
      .matches(/^[0-9]\d{9}$/, translate(VALIDATION_CONSTANT.invalidValue))
      .required(""),
    emailID: yup
      .string()
      .test("Is valid Email ID", translate(VALIDATION_CONSTANT.validEmail), (value) => {
        if (value) {
          return value.match(/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/) !== null;
        } else {
          return true;
        }
      })
      .required(""),
  });

  const formik = useFormik({
    initialValues,
    validationSchema,
  });

  const { values, touched, errors, setFieldValue, handleChange } = formik;

  const updateCommunicationData = () => {
    setLoading(true);
    
    const otpURL =
      appConfig?.deploy?.baseUrl +
      appConfig?.deploy?.updateCommunicationData;
    const method = "Patch";
    PatchApiHandler(otpURL, method, {
      pan_number: panDetails.panNumber,
      mobile_number: values.mobileNumber,
      email_id: values.emailID,
      detailsType: "secondary"
    })
      .then((res) => {
        if (res?.data?.data?.msg) {
          getModalStatus({
            ...modalStatus,
            show: false,
            status: "updated",
            values,
          });
        } else if (res?.data?.errors?.length) {
          getModalStatus({
            ...modalStatus,
            show: false,
            status: "failed",
            message: res?.data?.errors[0].errorMessage,
          });
        }
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const handleConfirmClick = () => {
    updateCommunicationData();
  };

  return (
    <>
      <div className="fixed inset-0 z-10 overflow-y-auto">
        <div className="fixed inset-0 w-auto h-auto bg-black opacity-40"></div>
        <div className="flex items-center justify-center min-h-screen px-4 py-8">
          <div
            className={`${popupcss.hdfc_popup_width} p-8 bg-white rounded-md shadow-lg z-[1]`}
          >
            <div className="flex flex-row-reverse mb-3">
              <button
                onClick={() => getModalStatus({ ...modalStatus, show: false })}
              >
                <IoMdClose size={22} className="close-button" />
              </button>
            </div>
            <div className="w-full">
              <div className="text-apercu break-normal text-center">
                <div className="mb-3 text-left text-medium text-4xl text-black">
                  {translate(BASIC_DETAILS.editContactDetails)}
                </div>
                <div>
                  <div className={`text-regular text-2xl text-light-gray mb-3`}>
                    {modalStatus && !modalStatus?.isMobileNumberAvailable ? (
                      <>
                        <input
                          type="text"
                          className={"h-12 input-field text-black w-full"}
                          placeholder="Contact Number *"
                          name="mobileNumber"
                          maxLength={10}
                          value={values.mobileNumber}
                          onChange={(e) => {
                            const filteredText = numberInput(e.target.value);
                            setFieldValue(
                              "mobileNumber",
                              filteredText.toUpperCase()
                            );
                          }}
                        />
                        <div className="mb-3 text-left">
                          {touched.mobileNumber || errors.mobileNumber ? (
                            <span className="text-base text-light-red">
                              {errors.mobileNumber}
                            </span>
                          ) : null}
                        </div>
                      </>
                    ) : null}
                    {modalStatus && !modalStatus?.isEmailAvailable ? (
                      <>
                        <input
                          type="string"
                          className={"h-12 input-field text-black w-full"}
                          placeholder={`${translate(AGENT.emailId)} *`}
                          name="emailID"
                          id="emailID"
                          value={values.emailID}
                          onChange={(e) => {
                            setFieldValue("emailID", e.target.value);
                          }}
                        />
                        <div className="mb-3 text-left">
                          {touched.emailID || errors.emailID ? (
                            <span className="text-base text-light-red">
                              {errors.emailID}
                            </span>
                          ) : null}
                        </div>
                      </>
                    ) : null}
                  </div>
                </div>
                <div>
                  <div className="flex justify-center gap-3">
                    <button
                      className="button-passive border-fd-primary text-fd-primary"
                      onClick={() =>
                        getModalStatus({ ...modalStatus, show: false })
                      }
                    >
                      {translate(COMMON_CONSTANTS.cancel)}
                    </button>
                    <button
                      className={((modalStatus && !modalStatus?.isMobileNumberAvailable &&
                        errors.mobileNumber) ||
                      (modalStatus && !modalStatus?.isMobileNumberAvailable &&
                        values.mobileNumber === "") ||
                      (modalStatus && !modalStatus?.isEmailAvailable && errors.emailID) ||
                      (modalStatus && !modalStatus?.isEmailAvailable && values.emailID === "")) ? "button-active  button-transition hover:bg-hover-primary text-medium text-xl lg:text-2xl w-fit   text-medium text-xl lg:text-2xl w-fit  hover:button-shadow" : "button-active btn-gradient button-transition hover:bg-hover-primary text-medium text-xl lg:text-2xl w-fit   text-medium text-xl lg:text-2xl w-fit  hover:button-shadow" } 
                      onClick={handleConfirmClick}
                      disabled={
                        (modalStatus && !modalStatus?.isMobileNumberAvailable &&
                          errors.mobileNumber) ||
                        (modalStatus && !modalStatus?.isMobileNumberAvailable &&
                          values.mobileNumber === "") ||
                        (modalStatus && !modalStatus?.isEmailAvailable && errors.emailID) ||
                        (modalStatus && !modalStatus?.isEmailAvailable && values.emailID === "")
                      }
                    >
                      Confirm {loading ? <Loader /> : null}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default ContactDetailsModal;

import React from "react";
import { IoMdClose } from "react-icons/io";
import { useState, useEffect } from "react";
import popupcss from "../../styles/popup_modals.module.css"
import { numberInput } from "../../lib/util";
import { useFormik } from "formik";
import * as yup from "yup";
import { obfuscateEmail,obfuscatePhoneNumber, } from "../../lib/util";
import appConfig from "../../app.config";
import Timer from "../login/timer";
import { PostApiHandler } from "../api/apihandler";
import Loader from "../../svg/Loader";

import { KYC_DETAIL, PARENT_DETAILS_PAYMENT, REDIRECTION_MSG } from "../../constants";
import { useTranslation } from "react-i18next";

const ValidateOTPModal = ({ verfiedStatus,contactDetails, updateModalState, headerMessage }) => {
  const [selectedManufacturer, setSelectedManufacture] = useState("");
  const [otpValidationTime, setOTPValidationTime] = useState();
  const [showTimer, setShowTimer] = useState(false);
  const [smsTransactionId, setSMSTransactionId] = useState();
  const [emailTransactionId, setEmailTransactionId] = useState();
  const [emailSmsTransactionId, setEmailSmsTransactionId] = useState();
  const [smsVerificationStatus, setSMSVerificationStatus] = useState("");
  const [emailVerificationStatus, setEmailVerificationStatus] = useState("");
  const [emailSmsVerificationStatus, setEmailSmsVerificationStatus] =
    useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDisabled, setIsDisabled] = useState(false);

 
  const { t: translate } = useTranslation();

  //Get resendOTPTimer from env
  useEffect(() => {
    const resendOTPTimer = appConfig?.deploy?.resendOTPTimer;
    setOTPValidationTime(resendOTPTimer); // 300 minutes
    setShowTimer(true);
    const manufacture = sessionStorage.getItem("selectedManufactureId");
    manufacture && setSelectedManufacture(manufacture);
  }, []);

  //show Timer status Method
  const getShowTimerStatus = (status) => {
    setShowTimer(status);
    setFieldValue("mobileOtpNumber", "");
    setFieldValue("emailOtpNumber", "");
    setFieldValue("emailSmsOtpNumber", "");
  };

  //ResendOTP Method
  const handleResendBtnClick = () => {
    setShowTimer(true);
    // setOtpTransactionId([]);
    setEmailTransactionId();
    setSMSTransactionId();
    setEmailSmsTransactionId();
    generateOtps();
  };

  const initialValues = {
    mobileOtpNumber: "",
    emailOtpNumber: "",
    emailSmsOtpNumber: "",
  };

  const validationSchema = yup.object({
    mobileOtpNumber: yup
      .string()
      .matches(/([0-9]){6}$/, translate(PARENT_DETAILS_PAYMENT.invalidOtp))
      .required(""),
    emailOtpNumber: yup
      .string()
      .matches(/([0-9]){6}$/, translate(PARENT_DETAILS_PAYMENT.invalidOtp))
      .required(""),
    emailSmsOtpNumber: yup
      .string()
      .matches(/([0-9]){6}$/, translate(PARENT_DETAILS_PAYMENT.invalidOtp))
      .required(""),
  });

  const formik = useFormik({
    initialValues,
    validationSchema,
  });

  const { values, touched, errors, setFieldValue, handleChange } = formik;

   // Disable Button
   useEffect(() => {
      
    if (selectedManufacturer.toLowerCase() === "ssfb" ||
    selectedManufacturer.toLowerCase() === "sib") {
      setIsDisabled(!values.emailSmsOtpNumber || isSubmitting);
    } else if (selectedManufacturer.toLowerCase() === "bajaj") {
      setIsDisabled(!values.emailOtpNumber.length || isSubmitting);
    } 
    else if(!verfiedStatus?.mobileNumber && !verfiedStatus?.emailId) {
     
      setIsDisabled( 
        !values.mobileOtpNumber.length ||
        !values.emailOtpNumber.length ||
          isSubmitting
      );
    }
    else if(!verfiedStatus?.mobileNumber) {
     
      setIsDisabled( 
        !values.mobileOtpNumber.length ||
          isSubmitting
      );
    }
    else if(!verfiedStatus?.emailId){
      setIsDisabled( 
        !values.emailOtpNumber.length ||
          isSubmitting
      );
    }
  }, [selectedManufacturer, values, isSubmitting]);
  
  const handleOTPChange = (e, type) => {
    if (type === "mobileOtpNumber") {
      smsVerificationStatus && setSMSVerificationStatus("");
      const filteredText = numberInput(e.target.value);
      setFieldValue("mobileOtpNumber", filteredText.toUpperCase());
    } else {
      emailVerificationStatus && setEmailVerificationStatus("");
      const filteredText = numberInput(e.target.value);
      setFieldValue("emailOtpNumber", filteredText.toUpperCase());
    }
    if (type === "emailSmsOtpNumber") {
      emailSmsVerificationStatus && setEmailSmsVerificationStatus("");
      const filteredText = numberInput(e.target.value);
      filteredText &&
        setFieldValue("emailSmsOtpNumber", filteredText.toUpperCase());
    }
  };

  const handleSubmitOtp = () => {
    setIsSubmitting(true);
    smsTransactionId?.sms &&
      verifyOTP(
        { 
          transactionId: smsTransactionId?.sms, 
          otp: values.mobileOtpNumber,
          phoneNumber: contactDetails?.mobileNumber,
        },
        "sms"
      );
    emailTransactionId?.email &&
      verifyOTP(
        {
          transactionId: emailTransactionId?.email,
          otp: values.emailOtpNumber,
          emailId: contactDetails?.emailId,
        },
        "email"
      );
    emailSmsTransactionId?.smaEmail &&
      verifyOTP(
        {
          transactionId: emailSmsTransactionId?.smaEmail,
          otp: values.emailSmsOtpNumber,
          emailId: contactDetails?.emailId,
          phoneNumber: contactDetails?.mobileNumber,
        },
        "sms&email"
      );
  };

  const generateOtps = () => {
    const selectedManufactureId = sessionStorage.getItem(
      "selectedManufactureId"
    );

    if (
      (contactDetails?.emailId &&
        contactDetails?.mobileNumber &&
        selectedManufactureId.toLowerCase() === "ssfb") ||
      selectedManufactureId.toLowerCase() === "sib"
    ) {
      generateOTP({
        typeOfMode: "sms&email",
        emailId: contactDetails?.emailId,
        phoneNumber: contactDetails?.mobileNumber,
        manufactureId: selectedManufactureId ? selectedManufactureId : "",
      });
    } else if (selectedManufactureId.toLowerCase() === "bajaj") {
      if (contactDetails?.emailId) {
        generateOTP({
          typeOfMode: "email",
          emailId: contactDetails?.emailId,
          phoneNumber: contactDetails?.mobileNumber,
          manufactureId: selectedManufactureId ? selectedManufactureId : "",
        });
      }
    } else {
      if (contactDetails?.mobileNumber && !verfiedStatus?.mobileNumber) {
        generateOTP({
          typeOfMode: "sms",
          emailId: contactDetails?.emailId,
          phoneNumber: contactDetails?.mobileNumber,
          manufactureId: selectedManufactureId ? selectedManufactureId : "",
        });
      }
      if (contactDetails?.emailId && !verfiedStatus?.emailId) {
        generateOTP({
          typeOfMode: "email",
          emailId: contactDetails?.emailId,
          phoneNumber: contactDetails?.mobileNumber,
          manufactureId: selectedManufactureId ? selectedManufactureId : "",
        });
      }
    }
  };

  const generateOTP = (requestParam) => {
    const otpURL =
      appConfig?.deploy?.baseUrl + appConfig?.deploy?.generateOTP;
    PostApiHandler(otpURL, "Post", requestParam).then((res) => {
      const { data } = res;
      if (data?.data && Object.keys(data?.data).length) {
        requestParam.typeOfMode === "sms" &&
          setSMSTransactionId({ sms: data.data.OTPTransactionId });
        requestParam.typeOfMode === "email" &&
          setEmailTransactionId({ email: data.data.OTPTransactionId });
        requestParam.typeOfMode === "sms&email" &&
          setEmailSmsTransactionId({ smaEmail: data.data.OTPTransactionId });
      } else {
        if (res?.data?.errors?.length) {
          const { errors } = res.data;
          // setApiErrorMessage(errors[0].errorMessage);
        }
      }
    });
  };

  const verifyOTP = (requestPayload, mode) => {
    const otpURL =
      appConfig?.deploy?.baseUrl + appConfig?.deploy?.otpVerification;

    PostApiHandler(otpURL, "Post", requestPayload)
      .then((res) => {
        if (res?.response?.data?.errors?.length) {
          // setOtpErrorMessage(res.response.data.errors[0].errorMessage);
        } else {
          if (res?.data?.data && Object.keys(res?.data?.data).length) {
            const { data } = res.data;
            mode === "sms" &&
              setSMSVerificationStatus(data.verifyOtpResp.status);
            mode === "email" &&
              setEmailVerificationStatus(data.verifyOtpResp.status);
            mode === "sms&email" &&
              setEmailSmsVerificationStatus(data.verifyOtpResp.status);
          }
        }
        setIsSubmitting(false);
      })
      .catch((err) => console.error("Error: ", err));
  };

  useEffect(() => {
    const selectedManufactureId = sessionStorage.getItem("selectedManufactureId");
    if (selectedManufactureId.toLowerCase() === "usfb") {
      if (emailVerificationStatus === "verified" && smsVerificationStatus === "verified") {
        updateModalState({
          show: false,
          mobileOtpNumber: "verified",
          emailOtpNumber: "verified",
        });
      }
     else if (emailVerificationStatus === "verified") {
        updateModalState({
          show: false,
          mobileOtpNumber: "verified",
          emailOtpNumber: "verified",
        });
      }
      else if (smsVerificationStatus === "verified") {
        updateModalState({
          show: false,
          mobileOtpNumber: "verified",
          emailOtpNumber: "verified",
        });
      }
    } else {
      if (smsVerificationStatus && emailVerificationStatus) {
        if (
          smsVerificationStatus === "verified" &&
          emailVerificationStatus === "verified"
        ) {
          updateModalState({
            show: false,
            mobileOtpNumber: "verified",
            emailOtpNumber: "verified",
          });
        }
      } else if (emailVerificationStatus === "verified") {
        updateModalState({ show: false, emailOtpNumber: "verified" });
      } else if (emailSmsVerificationStatus === "verified") {
        updateModalState({
          show: false,
          mobileOtpNumber: "verified",
          emailOtpNumber: "verified",
        });
      }
    }
  }, [
    smsVerificationStatus,
    emailVerificationStatus,
    emailSmsVerificationStatus,
  ]);

  useEffect(() => {
    generateOtps();
  }, []);

  return (
    <>
      <div className="fixed inset-0 z-10 overflow-y-auto">
        <div className="fixed inset-0 w-auto h-auto bg-black opacity-25"></div>
        <div className="flex items-center min-h-screen ">
          <div
            className={`relative ${popupcss.compare_popup_width} p-5 mx-auto bg-white rounded-md`}
          >
            <div className="flex flex-col break-normal ">
              <div className="flex flex-row justify-between mb-3 items-center text-left text-medium text-5xl text-black">
                {selectedManufacturer.toLowerCase() === "ssfb" ||
              selectedManufacturer.toLowerCase() === "sib" ? translate(REDIRECTION_MSG.verifyMobileNumber) : headerMessage}
                <button
                  onClick={() =>
                    updateModalState({
                      show: false,
                      mobileOtpNumber: "",
                      emailOtpNumber: "",
                    })
                  }
                >
                  <IoMdClose size={22} />
                </button>
              </div>
              {selectedManufacturer.toLowerCase() === "ssfb" ||
              selectedManufacturer.toLowerCase() === "sib" ? (
                <>
                  <div className="flex justify-center text-regular text-2xl text-black">
                    {translate(KYC_DETAIL.enterOtpSentToEnteredEmailId)}
                    {contactDetails &&
                        obfuscatePhoneNumber(contactDetails.mobileNumber)}
                  </div>
                  <div className="gap-2 mt-3 flex gap-3 justify-center text-regular text-2xl text-black">
                    <div className="flex flex-col">
                      <input
                        type="password"
                        className="h-12 input-field-style text-center m-0 w-full mb-3"
                        placeholder="- - - - - -"
                        maxLength={6}
                        disabled={!showTimer}
                        value={values.emailSmsOtpNumber}
                        name="emailSmsOtpNumber"
                        onChange={(e) =>
                          handleOTPChange(e, "emailSmsOtpNumber")
                        }
                      />
                      {touched.emailSmsOtpNumber ||
                      errors.emailSmsOtpNumber ||
                      emailVerificationStatus === "incorrect" ? (
                        <div className="mb-3 text-left text-base text-back text-light-red">
                          {errors?.emailSmsOtpNumber
                            ? errors?.emailSmsOtpNumber
                            : translate(PARENT_DETAILS_PAYMENT.invalidOtp)}
                        </div>
                      ) : null}
                      {showTimer ? (
                        <Timer
                          otpValidationTime={otpValidationTime}
                          getShowTimerStatus={getShowTimerStatus}
                        />
                      ) : null}
                    </div>
                  </div>
                </>
              ) : selectedManufacturer.toLowerCase() === "bajaj" ? (
                <>
                  <div className="flex justify-center text-regular text-2xl text-black">
                    Enter OTP sent to entered email id
                  </div>
                  <div className="gap-2 mt-3 flex gap-3 justify-center text-regular text-2xl text-black">
                    <div className="flex flex-col">
                      <input
                        type="password"
                        className="h-12 input-field-style m-0 w-fit mb-3"
                        placeholder="- - - - - -"
                        maxLength={6}
                        disabled={!showTimer}
                        value={values.emailOtpNumber}
                        name="emailOtpNumber"
                        onChange={(e) => handleOTPChange(e, "emailOtpNumber")}
                      />
                      {touched.emailOtpNumber ||
                      errors.emailOtpNumber ||
                      emailVerificationStatus === "incorrect" ? (
                        <div className="mb-3 text-left text-base text-back text-light-red">
                          {errors?.emailOtpNumber
                            ? errors?.emailOtpNumber
                            : translate(PARENT_DETAILS_PAYMENT.invalidOtp)}
                        </div>
                      ) : null}
                      {showTimer ? (
                        <Timer
                          otpValidationTime={otpValidationTime}
                          getShowTimerStatus={getShowTimerStatus}
                        />
                      ) : null}
                    </div>
                  </div>
                </>
              ) : (
                <>
                {!verfiedStatus?.mobileNumber &&
                <div> <div className="flex justify-center text-regular text-2xl text-black">
                {translate(KYC_DETAIL.enterOtpSentToEnteredMobileNo)}
              </div>
              <div className="gap-2 mt-3 flex gap-3 justify-center text-regular text-2xl text-black">
                <div className="flex flex-col">
                  <input
                    type="password"
                    className="h-12 input-field-style m-0 w-fit mb-3"
                    placeholder="- - - - - -"
                    maxLength={6}
                    disabled={!showTimer}
                    value={values.mobileOtpNumber}
                    name="mobileOtpNumber"
                    onChange={(e) => handleOTPChange(e, "mobileOtpNumber")}
                  />
                  {touched.mobileOtpNumber ||
                  errors.mobileOtpNumber ||
                  smsVerificationStatus === "incorrect" ? (
                    <div className="mb-3 text-left text-base text-back text-light-red">
                      {errors?.mobileOtpNumber
                        ? errors?.mobileOtpNumber
                        : translate(PARENT_DETAILS_PAYMENT.invalidOtp)}
                    </div>
                  ) : null}
                </div>
              </div></div>
                 }
                
               {!verfiedStatus?.emailId && <div><div className="flex justify-center text-regular text-2xl text-black">
                    {translate(KYC_DETAIL.enterOtpSentToEnteredEmailId)}
                  </div>
                  <div className="gap-2 mt-3 flex gap-3 justify-center text-regular text-2xl text-black">
                    <div className="flex flex-col">
                      <input
                        type="password"
                        className="h-12 input-field-style m-0 w-fit mb-3"
                        placeholder="- - - - - -"
                        maxLength={6}
                        disabled={!showTimer}
                        value={values.emailOtpNumber}
                        name="emailOtpNumber"
                        onChange={(e) => handleOTPChange(e, "emailOtpNumber")}
                      />
                      {touched.emailOtpNumber ||
                      errors.emailOtpNumber ||
                      emailVerificationStatus === "incorrect" ? (
                        <div className="mb-3 text-left text-base text-back text-light-red">
                          {errors?.emailOtpNumber
                            ? errors?.emailOtpNumber
                            : translate(PARENT_DETAILS_PAYMENT.invalidOtp)}
                        </div>
                      ) : null}
                      {showTimer ? (
                        <Timer
                          otpValidationTime={otpValidationTime}
                          getShowTimerStatus={getShowTimerStatus}
                        />
                      ) : null}
                    </div>
                  </div></div>}
                  
                </>
              )}
              <div className="gap-2 mt-3 flex gap-3 justify-center">
                <button
                  className="button-passive border-fd-primary text-fd-primary"
                  onClick={handleResendBtnClick}
                  disabled={showTimer}
                >
                  {translate(KYC_DETAIL.resendOtp)}
                </button>
                <button
                  className={(isDisabled) ? "button-active  button-transition hover:bg-hover-primary text-medium text-xl lg:text-2xl w-fit   text-medium text-xl lg:text-2xl w-fit  hover:button-shadow" : "button-active btn-gradient button-transition hover:bg-hover-primary text-medium text-xl lg:text-2xl w-fit   text-medium text-xl lg:text-2xl w-fit  hover:button-shadow"} 
                  disabled={isDisabled}
                  // onClick={() => updateModalState({ show: false, mobileOtpNumber: values.mobileOtpNumber, emailOtpNumber: values.emailOtpNumber })}
                  onClick={handleSubmitOtp}
                >
                  {translate(KYC_DETAIL.submit)}
                  {isSubmitting ? <Loader /> : ""}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default ValidateOTPModal;

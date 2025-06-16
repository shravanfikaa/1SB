import { useFormik } from "formik";
import { useEffect, useState } from "react";
import { IoMdClose } from "react-icons/io";
import { IoMdEye, IoMdEyeOff } from "react-icons/io";
import * as yup from "yup";
import {
  charWithNumberInput,
  handleEventLogger,
  numberInput,
} from "../../lib/util";
import appConfig from "../../app.config";
import Loader from "../../svg/Loader";
import { PostApiHandler } from "../api/apihandler";
import Timer from "./timer";
import popupcss from "../../styles/popup_modals.module.css";
import { AGENT, COMMON_CONSTANTS, KYC_DETAIL, LOGIN_LOGOUT, LOGIN_POPUP_TEXT, PERSONAL_DETAILS, MY_PROFILE, VALIDATION_CONSTANT, PARENT_DETAILS_PAYMENT } from "../../constants";
import { useRouter } from "next/router";
import { useTranslation } from "react-i18next";


function Login({ panDetails, getModalStatus, message }) {
  const [showTimer, setShowTimer] = useState(false);
  const [enableEnterOTP, setEnableEnterOTP] = useState(false);
  const [loading, setLoading] = useState(false);
  const [transactionId, setTransactionId] = useState("");
  const [otpVerificationStatus, setOTPVerificationStatus] = useState("");
  const [otpValidationTime, setOTPValidationTime] = useState();
  const [contactDetails, setContactDetails] = useState();
  const [userNotFound, setUserNotFound] = useState(false);
  const [apiErrorMessage, setApiErrorMessage] = useState("");
  const [otpErrorMessage, setOtpErrorMessage] = useState("");
  const { t: translate } = useTranslation();
  const [showOtp, setShowOtp] = useState(false);
  const router = useRouter();


  const initialValues = {
    panNumber: "",
    otpNumber: "",
  };

  const validationSchema = yup.object({
    panNumber: yup
      .string()
      .matches(/([A-Z]){5}([0-9]){4}([A-Z]){1}$/, translate(VALIDATION_CONSTANT.invalidPAN))
      .test("Is valid PAN number", translate(VALIDATION_CONSTANT.invalidPAN), (value) => {
        if (value?.length === 10) {
          return value.match(/([A-Z]){5}([0-9]){4}([A-Z]){1}$/) !== null;
        } else {
          return true;
        }
      })
      .required(""),
    otpNumber: yup
      .string()
      .matches(/([0-9]){6}$/, translate(PARENT_DETAILS_PAYMENT.invalidOtp))
      .test("Is valid OTP number", translate(PARENT_DETAILS_PAYMENT.invalidOtp), (value) => {
        if (otpVerificationStatus === "incorrect") {
          return false;
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

  const getShowTimerStatus = (status) => {
    setShowTimer(status);
    setFieldValue("otpNumber", "");
  };

  const generateOTP = (requestParam) => {
    const otpURL =
      appConfig?.deploy?.baseUrl + appConfig?.deploy?.loginPan;
    const method = "Post";
    PostApiHandler(otpURL, method, requestParam).then((res) => {
      const { data } = res;
      if (data?.data && Object.keys(data?.data).length) {
        data?.data?.otpResp?.OTPTransactionId &&
          setTransactionId(data.data.otpResp.OTPTransactionId);
        if (data?.data?.userId) {
          sessionStorage.setItem("userId", JSON.stringify(data.data.userId));
        }
        setContactDetails({
          emailId: data?.data?.emailId,
          mobileNumber: data?.data?.mobileNumber,
        });
        setShowTimer(true);
        setEnableEnterOTP(true);
      } else {
        if (res?.data?.errors?.length) {
          const { errors } = res.data;
          if (
            errors[0].errorIdentifier === "1SB_AL_ERROR_NO_USER_FOUND" ||
            errors[0].errorIdentifier === "1SB_AL_ERROR_USER_NOT_WHITELISTED"
          ) {
            setUserNotFound(true);
          }
          setApiErrorMessage(errors[0].errorMessage);
        }
      }
      setLoading(false);
    });
  };

  const verifyOTP = () => {
    const otpURL =
      appConfig?.deploy?.baseUrl + appConfig?.deploy?.verifyOTP;
    const method = "Post";
    PostApiHandler(otpURL, method, {
      transactionId: transactionId,
      otp: values.otpNumber,
      panNumber: values.panNumber,
    })
      .then((res) => {
        if (res?.response?.data?.errors?.length) {
          setOtpErrorMessage(res.response.data.errors[0].errorMessage);
        } else {
          if (res.data) {
            if (res.data.data) {
              const { data } = res.data;
              data.accessToken &&
                sessionStorage.setItem("authorizationToken", data.accessToken);
              data.refreshToken &&
                sessionStorage.setItem("refreshToken", data.refreshToken);
              sessionStorage.setItem("tokenGenerationTime", Date.now());
              if (data.userInfo) {
                const name = `${data?.userInfo?.first_name} ${data?.userInfo?.middle_name} ${data.userInfo?.last_name}`
                sessionStorage.setItem(
                  "userInfo",
                  JSON.stringify({
                    pan_number: data.userInfo.pan_number,
                    date_of_birth: data.userInfo.date_of_birth,
                    customer_name: name,
                    customer_gender:data.userInfo.gender
                  })
                );
              }

              data.verifyOtpResp.status &&
                setOTPVerificationStatus(data.verifyOtpResp.status);
            }
          }
        }
        setLoading(false);
        setShowTimer(true);
        setEnableEnterOTP(true);
      })
      .finally(() => {
        const isAlreadyLoggedIn = sessionStorage.getItem("isAlreadyLoggedIn");
        const href = window.location.href;
        if (
          isAlreadyLoggedIn &&
          JSON.parse(isAlreadyLoggedIn)?.isAlreadyLoggedIn &&
          !href.includes("make_payment") &&
          !href.includes("onboarding")
        ) {
          router.push({
            pathname: "/",
          });
        }
      });
  };

  const handleContinueBtnClick = () => {
    setLoading(true);
    const userInfo = sessionStorage.getItem("userInfo");
    const selectedManufactureId = sessionStorage.getItem("selectedManufactureId");
    if (userInfo) {
      const parsedUserInfo = JSON.parse(userInfo);
      if (Object.keys(parsedUserInfo).length) {
        const { pan_number } = parsedUserInfo;
        if (pan_number) {
          if (pan_number === values.panNumber) {
            generateOTP({
              panNumber: values.panNumber,
              manufactureId: selectedManufactureId ? selectedManufactureId : ""

            });
          } else {
            setLoading(false);
            setApiErrorMessage(PERSONAL_DETAILS.panDetailsMissMatch);
          }
        } else {
          if (values.panNumber) {
            generateOTP({
              panNumber: values.panNumber,
              manufactureId: selectedManufactureId ? selectedManufactureId : ""
            });
          } else {
            setLoading(false);
          }
        }
      } else {
        if (values.panNumber) {
          generateOTP({
            panNumber: values.panNumber,
            manufactureId: selectedManufactureId ? selectedManufactureId : ""
          });
        } else {
          setLoading(false);
        }
      }
    } else {
      apiErrorMessage && setApiErrorMessage("");
      generateOTP({
        panNumber: values.panNumber,
        manufactureId: selectedManufactureId ? selectedManufactureId : ""
      });
    }
  };

  const handleConfirmClick = () => {
    verifyOTP();
  };

  const handleHomeBtnClick = () => {
    sessionStorage.clear();
    sessionStorage.clear();
    router.push({
      pathname: "/",
    });
  };

  const handleResendOTPBtnClick = () => {
    setFieldValue("otpNumber", "");
    if (panDetails?.dob) {
      generateOTP({
        panNumber: panDetails.panNumber,
      });
    } else {
      generateOTP({
        panNumber: values.panNumber,
      });
    }
  };

  const handleOTPChange = (e) => {
    otpVerificationStatus && setOTPVerificationStatus("");
    const filteredText = numberInput(e.target.value);
    setFieldValue("otpNumber", filteredText.toUpperCase());
  };

  const handleWrongPanEntered = () => {
    setEnableEnterOTP(false);
    setShowTimer(false);
    setContactDetails();
    setFieldValue("otpNumber", "");
    setFieldValue("panNumber", "");
    apiErrorMessage && setApiErrorMessage("");
  };

  useEffect(() => {
    if (otpVerificationStatus === "verified") {
      getModalStatus("verified", false);
      sessionStorage.setItem("isLoggedIn", JSON.stringify({ loggedIn: true }));
    }
    formik.validateField("otpNumber");
  }, [otpVerificationStatus]);

  useEffect(() => {
    if (Object.keys(panDetails).length) {
      const selectedManufactureId = sessionStorage.getItem("selectedManufactureId");
      const { panNumber, dob } = panDetails;
      setFieldValue("panNumber", panDetails.panNumber);

      if (panNumber && dob) {
        generateOTP({ panNumber: panDetails.panNumber, manufactureId: selectedManufactureId ? selectedManufactureId : "" });
      }
    }
  }, [panDetails]);

  useEffect(() => {
    otpErrorMessage && setOtpErrorMessage("");
  }, [values.otpNumber]);

  useEffect(() => {
    apiErrorMessage && setApiErrorMessage("");
  }, [values.panNumber]);

  useEffect(() => {
    const resendOTPTimer = appConfig?.deploy?.resendOTPTimer;
    setOTPValidationTime(resendOTPTimer); // 300 minutes
  }, []);

  return (
    <>
      {panDetails && Object.keys(panDetails).length ? (
        enableEnterOTP ? (
          <div className="fixed inset-0 z-10 overflow-y-auto">
            <div className="fixed inset-0 w-auto h-auto bg-black opacity-40"></div>
            <div className="flex items-center justify-center min-h-screen px-4 py-8">
              <div
                className={`p-4 bg-white rounded-md shadow-lg z-[1] ${popupcss.hdfc_popup_width}`}
              >
                <div className="flex flex-row-reverse mb-3">
                  <button onClick={() => getModalStatus("close", false)}>
                    <IoMdClose size={22} className="close-button" />
                  </button>
                </div>
                <div className="w-full flex justify-center mb-4">
                  <div className="break-normal text-center text-regular text-2xl max-w-[90%]">
                    <div className="mb-3 text-left text-medium text-4xl text-black">
                      {translate(LOGIN_LOGOUT.login)}
                    </div>
                    <div className="mb-3 text-left text-black">
                      {message === "user already registered"
                        ? translate(LOGIN_POPUP_TEXT.existingUser)
                        : LOGIN_POPUP_TEXT.newRegisteredUser}
                      <br />
                      {contactDetails?.emailId && contactDetails.emailId}
                      {" & "}
                      {contactDetails?.mobileNumber &&
                        contactDetails.mobileNumber}
                      <br />
                    </div>
                    <div>
                        <div className="relative w-full">
                      <input
                        type={showOtp ? 'text': 'password'}
                        className="h-12 input-field-style text-black m-0 w-full mb-3"
                        placeholder={translate(LOGIN_LOGOUT.enterOtp)}
                        maxLength={6}
                        disabled={!showTimer}
                        value={values.otpNumber}
                        name="otpNumber"
                        onChange={handleOTPChange}
                      />
                       <button
                            type="button"
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                            onClick={() => setShowOtp(!showOtp)}
                          >
                             {showOtp ? <IoMdEyeOff size={20} /> : <IoMdEye size={20} />}
                          </button>
                          </div>
                      {(touched.otpNumber || errors.otpNumber) &&
                        values.otpNumber ? (
                        <div className="mb-3 text-left text-base text-back text-light-red">
                          {errors.otpNumber}
                        </div>
                      ) : null}
                      {otpErrorMessage ? (
                        <div className="mb-3 text-left text-base text-light-red">
                          {otpErrorMessage}
                        </div>
                      ) : null}
                      {showTimer ? (
                        <Timer
                          otpValidationTime={otpValidationTime}
                          getShowTimerStatus={getShowTimerStatus}
                        />
                      ) : null}
                    </div>
                    <div className="flex justify-center">
                      <button
                        className="button-passive border-fd-primary text-fd-primary mr-5"
                        onClick={handleResendOTPBtnClick}
                        disabled={showTimer}
                      >
                        {translate(KYC_DETAIL.resendOtp)}
                      </button>
                      <button
                        className={(!values.otpNumber.length) ? "button-active  button-transition hover:bg-hover-primary text-medium text-xl lg:text-2xl w-fit   text-medium text-xl lg:text-2xl w-fit  hover:button-shadow" : "button-active btn-gradient button-transition hover:bg-hover-primary text-medium text-xl lg:text-2xl w-fit   text-medium text-xl lg:text-2xl w-fit  hover:button-shadow"} 
                        onClick={handleConfirmClick}
                        disabled={!values.otpNumber.length}
                      >
                        {translate(AGENT.confirm)}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : null
      ) : (
        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="fixed inset-0 w-auto h-auto bg-black opacity-40"></div>
          <div className="flex items-center justify-center min-h-screen px-4 py-8">
            <div
              className={` ${popupcss.hdfc_popup_width} p-4 bg-white rounded-md shadow-lg z-[1]`}
            >
              <div className="flex flex-row-reverse mb-3">
                <button onClick={() => getModalStatus("close", false)}>
                  <IoMdClose size={22} className="close-button" />
                </button>
              </div>
              <div className="w-full flex justify-center mb-4">
                <div className="text-apercu break-normal text-center max-w-[90%]">
                  <div className="mb-3 text-left text-medium text-4xl text-black">
                    {translate(LOGIN_LOGOUT.login)}
                  </div>
                  <div className="text-regular text-2xl">
                    <div className="mb-3 text-left text-black">
                      {translate(LOGIN_POPUP_TEXT.header)}

                    </div>
                    {contactDetails ? (
                      <div className="mb-3 text-left break-words text-black">
                        {contactDetails.emailId && contactDetails.emailId}
                        {" & "}
                        {contactDetails.mobileNumber &&
                          contactDetails.mobileNumber}
                        <br />
                      </div>
                    ) : null}
                    <input
                      type="text"
                      className="h-12 input-field-style m-0 w-full mb-3 text-black"
                      placeholder={translate(MY_PROFILE.pan)}
                      value={values.panNumber}
                      maxLength={10}
                      name="panNumber"
                      disabled={enableEnterOTP}
                      onChange={(e) => {
                        userNotFound && setUserNotFound(false);
                        const filteredText = charWithNumberInput(
                          e.target.value
                        );
                        setFieldValue("panNumber", filteredText.toUpperCase());
                      }}
                    />
                    {apiErrorMessage ? (
                      <div className="mb-3 text-left text-base text-light-red">
                        {apiErrorMessage}
                      </div>
                    ) : null}
                    {touched.panNumber || errors.panNumber ? (
                      <div className="mb-3 text-left text-base text-light-red">
                        {errors.panNumber}
                      </div>
                    ) : null}
                    <div className="h-12 mb-3 flex justify-center">
                      {apiErrorMessage?.includes("go back") ? (
                        <button
                          className="button-active btn-gradient button-transition hover:bg-hover-primary text-medium text-xl lg:text-2xl w-fit   text-medium text-xl lg:text-2xl w-fit  hover:button-shadow"
                          onClick={handleHomeBtnClick}
                        >
                          Back to home
                        </button>
                      ) : (
                        <button
                        className={`button-active button-transition text-medium text-xl lg:text-2xl w-fit 
                          ${
                            !values.panNumber ||
                            (values.panNumber && values.panNumber.length !== 10) ||
                            errors.panNumber ||
                            loading ||
                            userNotFound ||
                            showTimer
                              ? ''
                              : ' btn-gradient'
                          }`}
                        onClick={handleContinueBtnClick}
                        disabled={
                          !values.panNumber ||
                          (values.panNumber && values.panNumber.length !== 10) ||
                          errors.panNumber ||
                          loading ||
                          userNotFound ||
                          showTimer
                        }
                      >
                        {translate(COMMON_CONSTANTS.continueLabel)}
                        {loading ? <Loader /> : null}
                      </button>
                      )}
                    </div>
                  </div>
                  {enableEnterOTP ? (
                    <>
                      <div className="text-regular text-2xl text-black">
                        <div className="relative w-full">
                          <input
                            type={showOtp ? "text" : "password"}
                            className="h-12 input-field-style m-0 w-full mb-3 text-black"
                            placeholder={translate(LOGIN_LOGOUT.enterOtp)}
                            maxLength={6}
                            disabled={!showTimer}
                            value={values.otpNumber}
                            name="otpNumber"
                            onChange={handleOTPChange}
                          />
                          <button
                            type="button"
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                            onClick={() => setShowOtp(!showOtp)}
                          >
                             {showOtp ? <IoMdEyeOff size={20} /> : <IoMdEye size={20} />}
                          </button>
                        </div>
                        {(touched.otpNumber || errors.otpNumber) &&
                          values.otpNumber ? (
                          <div className="mb-3 text-left text-base text-back text-light-red">
                            {errors.otpNumber}
                          </div>
                        ) : null}
                        {otpErrorMessage ? (
                          <div className="mb-3 text-left text-base text-light-red">
                            {otpErrorMessage}
                          </div>
                        ) : null}
                        {showTimer ? (
                          <Timer
                            otpValidationTime={otpValidationTime}
                            getShowTimerStatus={getShowTimerStatus}
                          />
                        ) : null}
                      </div>
                      <div>
                        <div className="flex justify-center gap-3">
                          <button
                            className="button-passive border-fd-primary text-fd-primary"
                            onClick={handleResendOTPBtnClick}
                            disabled={showTimer}
                          >
                            {translate(KYC_DETAIL.resendOtp)}
                          </button>
                          <button
                            className={(!values.otpNumber.length) ? "button-active  button-transition hover:bg-hover-primary text-medium text-xl lg:text-2xl w-fit   text-medium text-xl lg:text-2xl w-fit  hover:button-shadow" : "button-active btn-gradient button-transition hover:bg-hover-primary text-medium text-xl lg:text-2xl w-fit   text-medium text-xl lg:text-2xl w-fit  hover:button-shadow"}
                            onClick={handleConfirmClick}
                            disabled={!values.otpNumber.length}
                          >
                            {translate(AGENT.confirm)}
                          </button>
                        </div>
                        <div className="pt-3 text-black">
                          {translate(LOGIN_LOGOUT.enteredWrongPan)} ? - {" "}
                          <span
                            className="text-regular text-2xl cursor-pointer text-light-blue underline"
                            onClick={handleWrongPanEntered}
                          >
                            {translate(LOGIN_LOGOUT.clickHere)}

                          </span>
                        </div>
                      </div>
                    </>
                  ) : null}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Login;

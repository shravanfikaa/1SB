import Image from "next/image";
import sb_logo from "../product_logos/1sb_logo.png";
import { useFormik } from "formik";
import * as yup from "yup";
import { useEffect, useState } from "react";
import Loader from "../../svg/Loader";
import { PostApiHandler } from "../api/apihandler";
import appConfig from "../../app.config";
import { emailInput, numberInput } from "../../lib/util";
import Timer from "../login/timer";
import ErrorModal from "../common/errorPopup";
import { featureFlagApi } from "../../lib/application_setup";
import { useRouter } from "next/router";
import { AGENT, COMMON_CONSTANTS, imageURL, KYC_DETAIL, LOGIN_LOGOUT, PARENT_DETAILS_PAYMENT, VALIDATION_CONSTANT } from "../../constants";
import { useTranslation } from "react-i18next";
import LanguageChange from "../../_components/LanguageChange"
import { applicationSetup } from "../../utils/applicationSetup";
import { IoMdEye, IoMdEyeOff } from "react-icons/io";

function AgentLogin() {
  const [emailClicked, setEmailClicked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [transactionId, setTransactionId] = useState(false);
  const [showTimer, setShowTimer] = useState(false);
  const [otpVerificationStatus, setOTPVerificationStatus] = useState("");
  const [otpValidationTime, setOTPValidationTime] = useState();
  const [userNotFoundError, setUserNotFoundError] = useState("");
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [otpPasted, setPasted] = useState(false);
  const [distributerLogo, setDistributerLogo] = useState("");
  const { t: translate } = useTranslation();
  const [featureFlag, setFeatureFlag] = useState(null);
  const [showOtp, setShowOtp] = useState(false);

  const router = useRouter();

  const toggleErrorModal = () => setShowErrorModal((state) => !state);

  const initialValues = {
    email: "",
    otpGenerated: "",
  };

  const validationSchema = yup.object({
    email: yup
      .string()
      .test("Is valid Email ID", translate(VALIDATION_CONSTANT.validEmail), (value) => {
        if (value) {
          return value.match(/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/) !== null;
        } else {
          return true;
        }
      })
      .required(""),

    otpGenerated: yup
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

  const { values, touched, errors, setFieldValue } = formik;

  const getShowTimerStatus = (status) => {
    setShowTimer(status);
  };

  const handleSignIn = () => {
    setLoading(true);
    const agentLoginURL =
      appConfig?.deploy?.baseUrl + appConfig?.deploy?.agentLogin;
    const requestBody = {
      emailId: values.email,
      manufactureId: ""
    };
    PostApiHandler(agentLoginURL, "POST", requestBody)
      .then((response) => {
        if (response.message) {
          setEmailClicked(false);
          setLoading(false);
          setUserNotFoundError(response.message);
          setShowErrorModal(true);
        } else if (
          response?.data?.data &&
          Object.keys(response.data.data).length
        ) {
          const { data } = response.data;
          if (data?.agentId) {
            sessionStorage.setItem("agentId", JSON.stringify(data.agentId));
          }
          if (data.otpResp.status.toLowerCase().includes("initiated")) {
            setEmailClicked(true);
            setLoading(false);
            setTransactionId(data.otpResp.OTPTransactionId);
            setUserNotFoundError("");
          }
          setShowTimer(true);
        } else if (response?.data?.errors && response.data.errors.length) {
          setEmailClicked(false);
          setLoading(false);
          setUserNotFoundError(response.data.errors[0].errorMessage);
          setShowErrorModal(true);
        }
      })
      .catch(() => {
        setEmailClicked(false);
        setLoading(false);
      });
  };

  const handleResendOTP = (e) => {
    otpVerificationStatus && setOTPVerificationStatus("");
    setResetLoading(true);
    const agentLoginURL =
      appConfig?.deploy?.baseUrl + appConfig?.deploy?.agentLogin;
    const requestBody = {
      emailId: values.email,
    };
    PostApiHandler(agentLoginURL, "POST", requestBody).then((response) => {
      loading && setLoading(false);
      setResetLoading(false);
      if (response.message) {
        setEmailClicked(false);
        setUserNotFoundError(response.message);
        setShowErrorModal(true);
      } else if (
        response?.data?.data &&
        Object.keys(response.data.data).length
      ) {
        const { data } = response.data;
        if (data?.otpResp?.status?.toLowerCase().includes("initiated")) {
          setEmailClicked(true);

          setTransactionId(data.otpResp.OTPTransactionId);
          otpVerificationStatus && setOTPVerificationStatus("");
        }
        setShowTimer(true);
      } else if (response?.data?.errors && response.data.errors.length) {
        setEmailClicked(false);
        setUserNotFoundError(response.data.errors[0].errorMessage);
        setShowErrorModal(true);
      }
    });
  };

  const handleOTPChange = (e) => {
    otpVerificationStatus && setOTPVerificationStatus("");
    const filteredText = numberInput(e.target.value);
    setFieldValue("otpGenerated", filteredText.toUpperCase());
  };

  const handlePaste = (e) => {
    if (otpPasted) {
      setFieldValue("otpGenerated", e.target.value);
    }
  };

  const handleWrongPanEntered = () => {
    setEmailClicked(false);
    setShowTimer(false);
    setFieldValue("email", "");
    setFieldValue("otpGenerated", "");
  };

  const handleConfirm = (val) => {
    setLoading(true);
    const verifyOtpURL =
      appConfig?.deploy?.baseUrl + appConfig?.deploy?.agentVerifyOTP;
    const requestBody = {
      transactionId: transactionId ? transactionId : "",
      otp: values.otpGenerated,
      emailId: values.email,
    };
    PostApiHandler(verifyOtpURL, "POST", requestBody).then((response) => {
      if (response.message) {
        setLoading(false);
      } else if (
        response?.data?.data &&
        Object.keys(response.data.data).length
      ) {
        const { data } = response.data;
        sessionStorage.setItem("agent_data", JSON.stringify(data));
        if (data?.verifyOtpResp?.status?.includes("incorrect")) {
          setLoading(false);
          data.verifyOtpResp.status &&
            setOTPVerificationStatus(data.verifyOtpResp.status);
        } else {
          setLoading(false);
          if (typeof window !== "undefined") {
            sessionStorage.setItem("authorizationToken", data.accessToken);
            sessionStorage.setItem("agentEmail", values.email);
          }
          router.push("/agent/customers");
        }
      } else if (response?.data?.errors && response.data.errors.length) {
        setUserNotFoundError(response.data.errors[0].errorMessage);
        setShowErrorModal(true);
      }
    });
  };

  const applicationSetupHandler = async () => {
    const response = await applicationSetup();
    if (response) {
      if (response?.data?.errors?.length) {
        console.error("Error while application setup: ", response?.data?.errors)
      } else if (response?.data?.data && Object.keys(response?.data?.data).length) {
        const { featureFlagDetails } = response.data?.data;
        sessionStorage.setItem("featureFlag", JSON.stringify(featureFlagDetails));
      }
    }
  }

  useEffect(() => {
    // applicationSetupHandler();
    featureFlagApi();
    const resendOTPTimer = appConfig?.deploy?.resendOTPTimer;
    setOTPValidationTime(resendOTPTimer); // 300 minutes
    const authorizationToken = sessionStorage.getItem("authorizationToken");
    if (authorizationToken) {
      const logoutURL =
        appConfig?.deploy?.baseUrl + appConfig?.deploy?.logout;

      PostApiHandler(logoutURL, "post").then((response) => {
        sessionStorage.removeItem("authorizationToken");
      });
    }
    setDistributerLogo(
      imageURL.imageBaseUrl +
      appConfig?.distributorId?.toLowerCase() +
      ".png"
    );
  }, []);

  return (
    <div className="bg-slate-100 h-screen">
      <ErrorModal
        canShow={showErrorModal}
        updateModalState={toggleErrorModal}
        errorMessage={userNotFoundError}
      />
      <div className="flex items-center justify-between">
        <div className="p-3 ml-5">
          <Image
            src={distributerLogo ? distributerLogo : sb_logo}
            alt="Product logo"
            width={72}
            height={30}
            objectFit={"contain"}
          />
        </div>
        <div className="p-3 mr-5">
          {appConfig.deploy.multiLanSupport[appConfig?.distributorId.toLowerCase()] ? <LanguageChange /> : ""}
        </div>
      </div>
      <div className="flex justify-center mt-20 mx-3">
        <div className="float-left bg-white rounded-xl p-5">
          <div className="text-6xl text-thicccboi-extra-bold text-black ">
            {translate(COMMON_CONSTANTS.LoginViaEmail)}
          </div>
          <div className="text-4xl text-light-gray text-regular my-5">
            {translate(COMMON_CONSTANTS.HeyEnterYourDetailsToGetSignInToYourAccount)}
          </div>
          <div className="mt-2">
            <input
              type="string"
              className="h-12 input-field-style m-0 w-full mb-3 text-black"
              placeholder={translate(LOGIN_LOGOUT.enterEmail)}
              name="email"
              id="email"
              disabled={showTimer}
              value={values.email}
              onChange={(e) => {
                const filteredText = emailInput(e.target.value);
                setFieldValue("email", filteredText);
              }}
            />
            {errors.email ? (
              <p className="text-light-red text-sm normal-case">
                {errors.email}
              </p>
            ) : null}
            {emailClicked ? (
              <div>
                <div className="relative w-full">
                  <input
                    type={showOtp ? "text":"password"}
                    className="h-12 input-field-style m-0 w-full mb-3 text-black"
                    placeholder={translate(LOGIN_LOGOUT.enterOtp)}
                    name="otpGenerated"
                    id="otpGenerated"
                    maxLength={6}
                    value={values.otpGenerated}
                    onChange={handleOTPChange}
                    onPaste={() => {
                      setPasted(true);
                      handlePaste;
                      setOTPVerificationStatus("");
                    }}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                    onClick={() => setShowOtp(!showOtp)}
                  >
                    {showOtp ? <IoMdEyeOff size={20} /> : <IoMdEye size={20} />}
                  </button>
                </div>
                {showTimer ? (
                  <Timer
                    otpValidationTime={otpValidationTime}
                    getShowTimerStatus={getShowTimerStatus}
                  />
                ) : null}
                {errors.otpGenerated || touched.otpGenerated ? (
                  <p className="text-light-red text-sm normal-case">
                    {Object.values(errors.otpGenerated)}
                  </p>
                ) : null}
                {otpVerificationStatus ? (
                  <p className="text-light-red text-sm normal-case">
                    {translate(PARENT_DETAILS_PAYMENT.invalidOtp)}
                  </p>
                ) : null}
                <div>
                  <div className="flex gap-3">
                    <button
                      className="bg-white text-fd-primary border border-fd-primary p-2 rounded mt-5"
                      disabled={showTimer}
                      onClick={handleResendOTP}
                    >
                      {translate(KYC_DETAIL.resendOtp)} {resetLoading ? <Loader /> : null}
                    </button>
                    <button
                      className={(errors.otpGenerated || !values.otpGenerated) ? "button-active  mt-5 button-transition hover:bg-hover-primary" : "button-active btn-gradient mt-5 button-transition hover:bg-hover-primary"}
                      onClick={(e) => handleConfirm(values.otpGenerated)}
                      disabled={errors.otpGenerated || !values.otpGenerated}
                    >
                      {translate(AGENT.confirm)} {loading ? <Loader /> : null}
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
              </div>
            ) : (
              <button
                className={(!values.email ||
                  (values.email && errors.email) ||
                  errors.email ||
                  loading) ? "button-active  mt-5 button-transition hover:bg-hover-primary" : "button-active btn-gradient mt-5 button-transition hover:bg-hover-primary"}
                onClick={handleSignIn}
                disabled={
                  !values.email ||
                  (values.email && errors.email) ||
                  errors.email ||
                  loading
                }
              >
                {translate(LOGIN_LOGOUT.signIn)} {loading ? <Loader /> : null}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AgentLogin;

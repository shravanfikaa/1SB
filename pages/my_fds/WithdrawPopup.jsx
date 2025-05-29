import React, { useEffect, useState } from "react";
import { IoMdClose } from "react-icons/io";
import { FaArrowRight } from "react-icons/fa";
import { useFormik } from "formik";
import * as yup from 'yup';
import { dateWithSpace, dd_mm_yyyy_format, displayINRAmount, maskAccountNumber, numberInput } from "../../lib/util";
import { GetApiHandler, PostApiHandler } from "../api/apihandler";
import appConfig from "../../app.config";
import Loader from "../../svg/Loader";
import ErrorModal from "../common/errorPopup";
import GreenCheckMark from "../../svg/GreenCheckMark";
import styles from "../../styles/fd.module.css";
import { COMMON_CONSTANTS, AFTER_REVIEW, MAKE_PAYMENT_FDS, AGENT, KYC_DETAIL, PARENT_DETAILS_PAYMENT } from "../../constants";
import { useTranslation } from "react-i18next";
import Timer from "../login/timer";

const WithdrawPopup = ({ fdDetails, updateModalState, getAllFdData }) => {
  const [shouldWithdrawFD, setShouldWithdrawFD] = useState(false);
  const [preMatureWithdrawalInqData, setPreMatureWithdrawalInqData] = useState({});
  const [showFDConfirmation, setShowFDConfirmation] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [apiErrorMessage, setApiErrorMessage] = useState("");
  const [withdrawalInqInfo, setWithdrawalInqInfo] = useState({});
  const [showConfirmationMsg, setShowConfirmationMsg] = useState(false);
  const { t: translate } = useTranslation();

  const toggleModal = () => {
    setShowErrorModal(show => !show);
  }

  const getProductInfo = () => {
    const detailFdURL =
      appConfig?.deploy?.baseUrl +
      appConfig?.deploy?.getProductDetail +
      "?manufacturer_id=" +
      fdDetails.manufacturer_id +
      "&product_type=" +
      fdDetails.type +
      "&product_id=" +
      fdDetails.product_id;

    GetApiHandler(detailFdURL, "GET")
      .then((response) => {
        if (response?.hasOwnProperty("message")) {
          toggleModal();
          setApiErrorMessage(displayError);
        } else {
          if (Object.keys(response.data.data).length) {
            const {
              partialWithdrawalAllowed,
              // preMaturePenalty,
              preWithdrawalAllowed,
              preWithdrawalChargesType,
              preWithdrawalMinHd
            } = response.data.data;

            setWithdrawalInqInfo({
              partialWithdrawalAllowed,
              // preMaturePenalty,
              preWithdrawalAllowed,
              preWithdrawalChargesType,
              preWithdrawalMinHd
            });

            preMatureFDInqData(fdDetails.fd_amount);
          }
        }
      })
      .catch()
    // .finally(() => setIsLoading(false));
  };

  const preMatureFDInqData = (withdrawalAmount) => {
    const manufactureId = fdDetails.manufacturer_id;
    const url = appConfig?.deploy?.baseUrl + appConfig?.deploy?.fdPreWithdrawalInq;

    const requestBody = {
      manufacturerID: manufactureId,
      FDRNumber: fdDetails.fdr_number ? fdDetails.fdr_number : "",
      closeDate: dd_mm_yyyy_format(new Date()),
      requestType: "CD",
    }

    PostApiHandler(url, "POST", requestBody)
      .then((response) => {
        const { data } = response;
        if (Object.keys(data.data).length) {
          setPreMatureWithdrawalInqData({ withdrawalAmountReq: withdrawalAmount, ...data.data });
          setShouldWithdrawFD(true);
        } else if (data?.errors?.length) {
          toggleModal();
          setApiErrorMessage(data.errors[0].errorMessage);
        }
      })
      .catch((err) => {
        console.error("Error:", err);
      });
  }

  const handleFDWithdrawBtnClick = (withdrawalAmount) => {
    preMatureFDInqData(withdrawalAmount);
    // setShouldWithdrawFD(true);
  }

  const handleShowWithdrawConfirmation = () => {
    setShowFDConfirmation(true);
    setShouldWithdrawFD(false);
  }

  const handleFDWithdrawal = (smsVerification) => {
    const manufactureId = fdDetails.manufacturer_id;
    const url = appConfig?.deploy?.baseUrl + appConfig?.deploy?.fdPreWithdrawal;

    const requestBody = {
      manufacturerID: manufactureId,
      FDRNumber: fdDetails.fdr_number ? fdDetails.fdr_number : "",
      closeDate: dd_mm_yyyy_format(new Date()),
      requestType: "CD",
      ...smsVerification
    }

    PostApiHandler(url, "POST", requestBody)
      .then((response) => {
        const { data } = response;
        setShowFDConfirmation(false);
        if (Object.keys(data.data).length) {
          setShowConfirmationMsg(true);
          getAllFdData();
        } else if (data?.errors?.length) {
          toggleModal();
          setApiErrorMessage(data.errors[0].errorMessage);
        }
      })
      .catch((err) => {
        console.error("Error:", err);
      });
  }

  const renderModalsAsPerTheWithdrawalType = () => {
    if (showFDConfirmation) {
      return <ConfirmedWithdraw
        fdDetails={fdDetails}
        preMatureWithdrawalInqData={preMatureWithdrawalInqData}
        updateModalState={updateModalState}
        handleFDWithdrawal={handleFDWithdrawal}
      />
    } else if(showConfirmationMsg) {
      return <SuccessPopup />
    } else if (withdrawalInqInfo.partialWithdrawalAllowed) {
      if (shouldWithdrawFD && Object.keys(preMatureWithdrawalInqData).length) {
        return <WithdrawalFDDetails
          fdDetails={fdDetails}
          preMatureWithdrawalInqData={preMatureWithdrawalInqData}
          updateModalState={updateModalState}
          handleShowWithdrawConfirmation={handleShowWithdrawConfirmation}
        />
      } else {
        return <WithdrawalOptions
          fdDetails={fdDetails}
          handleFDWithdrawBtnClick={handleFDWithdrawBtnClick}
          updateModalState={updateModalState} />
      }
    } else if (withdrawalInqInfo?.preWithdrawalAllowed && Object.keys(preMatureWithdrawalInqData).length) {
      return <WithdrawalFDDetails
        fdDetails={fdDetails}
        preMatureWithdrawalInqData={preMatureWithdrawalInqData}
        updateModalState={updateModalState}
        handleShowWithdrawConfirmation={handleShowWithdrawConfirmation}
      />
    }
  }

  useEffect(() => {
    if (fdDetails && Object.keys(fdDetails).length) {
      getProductInfo();
    }
  }, [fdDetails]);

  return (
    <>
      {
        showErrorModal ? <ErrorModal
          canShow={showErrorModal}
          updateModalState={toggleModal}
          errorMessage={apiErrorMessage}
        /> : Object.keys(withdrawalInqInfo).length ? <div className="fixed inset-0 z-10 overflow-y-auto">
          <div
            className="fixed inset-0 w-auto h-auto bg-black opacity-25"
            onClick={updateModalState}
          ></div>
          <div className="flex justify-center items-center min-h-screen">
            <div className={`relative w-3/5 p-6 bg-white rounded-md`}>
              <div className="flex justify-end text-regular text-4xl text-black font-bold mb-3">
                <IoMdClose onClick={updateModalState} />
              </div>
              <>{renderModalsAsPerTheWithdrawalType() ? renderModalsAsPerTheWithdrawalType() : <>
                <div className="flex justify-center flex-col gap-3">
                  <div className="flex justify-center text-medium text-black text-3xl font-bold">
                    <h1>{fdDetails?.fd_name ? fdDetails?.fd_name : ""}</h1>
                  </div>
                  <div className="text-regular text-2xl text-black text-center">
                    {preMatureWithdrawalInqData.preWithdrawalOfflineProc}
                  </div>
                </div>
              </>}</>
            </div>
          </div>
        </div> : <Loader />
      }
    </>
  );
};

const WithdrawalOptions = ({ fdDetails, handleFDWithdrawBtnClick }) => {
  const [isLoading, setIsLoading] = useState(false);
  const { t: translate } = useTranslation();
  const initialValues = {
    inputWithdrawalAmount: ""
  };

  const validationSchema = yup.object({
    inputWithdrawalAmount: yup.number()
  });

  const formik = useFormik({
    initialValues,
    validationSchema,
  });

  const { values, setFieldValue } = formik;

  return (
    <div className="flex justify-center flex-col gap-3">
      <div className="flex justify-center text-black text-medium text-6xl font-bold">
        <h1>{fdDetails?.fd_name ? fdDetails?.fd_name : ""}</h1>
      </div>
      <div className="text-medium text-2xl text-black text-center">
        {translate(MAKE_PAYMENT_FDS.selectWithdrawalOption)}
      </div>
      <div className="flex gap-3">
        <input type="text" id="deposit_amount_field"
          className="bg-white w-full border border-gray-300 shadow p-3 text-black h-12 rounded"
          value={values.inputWithdrawalAmount}
          name="inputWithdrawalAmount"
          placeholder="Enter the withdrawal amount"
          maxLength={8}
          onChange={(e) => {
            const filteredText = numberInput(e.target.value);
            setFieldValue(
              "inputWithdrawalAmount",
              filteredText
            );
          }}
        />
        <button
          className="button-passive border-fd-primary text-fd-primary w-[100px] flex justify-center items-center"
          onClick={() => {
            setIsLoading(true);
            handleFDWithdrawBtnClick(values.inputWithdrawalAmount)
          }}
          disabled={isLoading}
        >
          <FaArrowRight />
        </button>
      </div>
      {/* </div> */}
      <div className="text-medium text-2xl text-black text-center">
        Or
      </div>
      <div className="flex justify-center mt-3">
        <button
          className={(isLoading) ? "button-active  button-transition hover:bg-hover-primary text-medium text-xl lg:text-2xl w-fit   text-medium text-xl lg:text-2xl w-fit  hover:button-shadow w-fit p-4" : "button-active btn-gradient button-transition hover:bg-hover-primary text-medium text-xl lg:text-2xl w-fit   text-medium text-xl lg:text-2xl w-fit  hover:button-shadow w-fit p-4"}
          disabled={isLoading}
          onClick={() => {
            setIsLoading(true);
            handleFDWithdrawBtnClick(fdDetails.fd_amount)
          }}
        >
          {translate(MAKE_PAYMENT_FDS.closeFdWithdrawAllAmount)}
          {
            isLoading ? <Loader /> : null
          }
        </button>
      </div>
    </div>
  )
}

const WithdrawalFDDetails = ({ fdDetails, preMatureWithdrawalInqData, updateModalState, handleShowWithdrawConfirmation }) => {
  const { t: translate } = useTranslation();
  return (
    <div className="flex justify-center flex-col gap-3">
      {/* <div className="flex justify-center text-medium text-6xl font-bold">
        <h1>{fdDetails?.fd_name ? fdDetails?.fd_name : ""}</h1>
      </div> */}
      <div className="text-medium text-5xl text-black text-left">
        {translate(MAKE_PAYMENT_FDS.fdWithdrawal)}
      </div>
      <div className={`flex gap-6 w-full ${styles.withdraw_container}`}>
        <div className={`w-1/2 text-black ${styles.withdraw_card}`}>
          <div className="flex justify-between mb-3">
            <div className="text-regular text-2xl text-light-gray">{translate(AFTER_REVIEW.fdrNumber)}</div>
            <div className="text-regular text-bold text-2xl text-black">{fdDetails.fdr_number}</div>
          </div>
          <div className="flex justify-between mb-3">
            <div className="text-regular text-2xl text-light-gray">{translate(AGENT.fdName)}</div>
            <div className="text-regular text-bold text-2xl text-black">{fdDetails.fd_name}</div>
          </div>
          <div className="flex justify-between mb-3">
            <div className="text-regular text-2xl text-light-gray">{translate(COMMON_CONSTANTS.interestRate)}</div>
            <div className="text-regular text-bold text-2xl text-black">{fdDetails.interest_rate} %</div>
          </div>
          <div className="flex justify-between mb-3">
            <div className="text-regular text-2xl text-light-gray">{translate(AFTER_REVIEW.maturityDate)}</div>
            <div className="text-regular text-bold text-2xl text-black">{dateWithSpace(fdDetails.fd_maturity_date)}</div>
          </div>
          <div className="flex justify-between mb-3">
            <div className="text-regular text-2xl text-light-gray">{translate(COMMON_CONSTANTS.maturityAmount)}</div>
            <div className="text-regular text-bold text-2xl text-black">₹ {displayINRAmount(preMatureWithdrawalInqData.maturityAmount)}</div>
          </div>
        </div>
        <div className={`w-1/2 text-black ${styles.withdraw_card}`}>
          <div className="flex flex-col mb-3">
            <div className="text-regular text-2xl text-black">{translate(MAKE_PAYMENT_FDS.withdrawalType)}</div>
            <div className="text-regular text-bold text-2xl text-fd-primary">{"Close FD"}</div>
          </div>
          <div className="flex flex-col mb-3">
            <div className="text-regular text-2xl text-black">{translate(MAKE_PAYMENT_FDS.withdrawalAmountRequested)}</div>
            <div className="text-regular text-bold text-2xl text-fd-primary">₹ {fdDetails.fd_amount ? displayINRAmount(fdDetails.fd_amount) : "0"}</div>
            {/* <div className="text-regular text-bold text-2xl text-fd-primary">₹ {preMatureWithdrawalInqData.withdrawalAmountReq ? displayINRAmount(preMatureWithdrawalInqData.withdrawalAmountReq) : "0"}</div> */}
          </div>
          <div className="flex flex-col mb-3">
            <div className="text-regular text-2xl text-black">{translate(MAKE_PAYMENT_FDS.prematureWithdrawalCharges)}</div>
            <div className="text-regular text-bold text-2xl text-fd-primary">
              {`- ₹ ${displayINRAmount(preMatureWithdrawalInqData.penalCharges)}`}
            </div>
          </div>
          <div className="flex flex-col mb-3">
            <div className="text-regular text-2xl text-black">{translate(MAKE_PAYMENT_FDS.finalPrematureWithdrawalAmount)}</div>
            <div className="text-regular text-bold text-2xl text-fd-primary">
              {preMatureWithdrawalInqData?.withdrawAmount ?
                `₹ ${displayINRAmount(preMatureWithdrawalInqData.withdrawAmount)}` :
                ""}
            </div>
          </div>
        </div>
      </div>
      <div className="text-regular text-xl">
        The final withdrawal amount will be credited to your registered bank account <span className="text-fd-primary">{maskAccountNumber(preMatureWithdrawalInqData?.preWithdrawalAllowed ? preMatureWithdrawalInqData.bankAccountNum : "")}</span> within 1-2 working days.
      </div>
      <div className="flex justify-end gap-3 mt-3">
        <button
          className="button-active btn-gradient button-transition hover:bg-hover-primary text-medium text-xl lg:text-2xl w-fit   text-medium text-xl lg:text-2xl w-fit  hover:button-shadow w-fit p-4"
          onClick={handleShowWithdrawConfirmation}
        >
          {translate(MAKE_PAYMENT_FDS.yesGoAhead)}
        </button>
        <button
          className="button-passive border-fd-primary text-fd-primary text-center w-fit px-4"
          onClick={updateModalState}
        >
          {translate(COMMON_CONSTANTS.cancel)}
        </button>
      </div>
    </div>
  )
}

const ConfirmedWithdraw = ({ fdDetails, preMatureWithdrawalInqData, updateModalState, handleFDWithdrawal }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedManufacturer, setSelectedManufacture] = useState("");
  const [otpValidationTime, setOTPValidationTime] = useState();
  const [showTimer, setShowTimer] = useState(false);
  const [smsTransactionId, setSMSTransactionId] = useState();
  const { t: translate } = useTranslation();

  const initialValues = {
    mobileOtpNumber: "",
  };

  const validationSchema = yup.object({
    mobileOtpNumber: yup
      .string()
      .matches(/([0-9]){6}$/, translate(PARENT_DETAILS_PAYMENT.invalidOtp))
      .required(""),
  });

  const formik = useFormik({
    initialValues,
    validationSchema,
  });

  const { values, setFieldValue } = formik;

  const generateOTP = (requestParam) => {
    const otpURL =
      appConfig?.deploy?.baseUrl + appConfig?.deploy?.generateOTP;
    PostApiHandler(otpURL, "Post", requestParam).then((res) => {
      const { data } = res;
      if (data?.data && Object.keys(data?.data).length) {
        requestParam.typeOfMode === "sms" &&
          setSMSTransactionId(data.data.OTPTransactionId);
      } else {
        if (res?.data?.errors?.length) {
          const { errors } = res.data;
        }
      }
    });
  };

  const getShowTimerStatus = (status) => {
    setShowTimer(status);
    setFieldValue("mobileOtpNumber", "");
  };

  const handleResendBtnClick = () => {
    setShowTimer(true);
    setSMSTransactionId();
    generateOTP({
      typeOfMode: "sms",
      emailId: "",
      phoneNumber: fdDetails?.phoneNumber ? fdDetails.phoneNumber : "",
      manufactureId: selectedManufacturer,
    })
  };

  useEffect(() => {
    if (selectedManufacturer === "sib") {
      const resendOTPTimer = appConfig?.deploy?.resendOTPTimer;
      setOTPValidationTime(resendOTPTimer); // 300 minutes
      setShowTimer(true);
      generateOTP({
        typeOfMode: "sms",
        emailId: "",
        phoneNumber: fdDetails?.phoneNumber ? fdDetails.phoneNumber : "",
        manufactureId: selectedManufacturer,
      })
    }
  }, [selectedManufacturer])

  useEffect(() => {
    if(fdDetails?.manufacturer_id) {
      setSelectedManufacture(fdDetails.manufacturer_id.toLowerCase());
    }
  }, [fdDetails]);

  return (
    <div className="flex justify-center flex-col gap-3">
      <div className="flex justify-center text-black text-medium text-6xl font-bold">
        <h1>{fdDetails?.fd_name ? fdDetails?.fd_name : ""}</h1>
      </div>
      <div className="text-medium text-5xl text-black text-center">
        {translate(MAKE_PAYMENT_FDS.areYouSureGoAheadFdWithdrawal)}
      </div>
      <div className="text-regular text-2xl text-black text-center">
        {translate(MAKE_PAYMENT_FDS.finalPostPrematureWithdrawalCharges)}
      </div>
      <div className="text-regular text-bold text-2xl text-fd-primary text-center">
        {preMatureWithdrawalInqData?.closedFDAmount ?
          `₹ ${displayINRAmount(preMatureWithdrawalInqData.closedFDAmount)}` :
          ""}/-
      </div>
      {
        selectedManufacturer.toLowerCase() === "sib" ? (
          <>
            <div className="text-regular text-2xl text-black text-center">
              {KYC_DETAIL.enterOtpSentToEnteredRegisterPhoneNo}
            </div>
            <div className="gap-2 mt-3 text-regular text-2xl text-black text-center flex justify-center">
              <div className="flex flex-col">
                <div className="flex justify-center gap-3 mt-3">
                  <input
                    type="password"
                    className="h-12 input-field-style m-0 w-fit mb-3 text-center"
                    placeholder="- - - - - -"
                    maxLength={6}
                    disabled={!showTimer}
                    value={values.mobileOtpNumber}
                    name="mobileOtpNumber"
                    onChange={(e) => {
                      const filteredText = numberInput(e.target.value);
                      setFieldValue("mobileOtpNumber", filteredText.toUpperCase());
                    }}
                  />
                  <button
                    className={(showTimer) ? "button-active  button-transition hover:bg-hover-primary text-medium text-xl lg:text-2xl w-fit   text-medium text-xl lg:text-2xl w-fit  hover:button-shadow w-fit p-4" : "button-active btn-gradient button-transition hover:bg-hover-primary text-medium text-xl lg:text-2xl w-fit   text-medium text-xl lg:text-2xl w-fit  hover:button-shadow w-fit p-4"} 
                    onClick={handleResendBtnClick}
                    disabled={showTimer}
                  >
                    {translate(KYC_DETAIL.resendOtp)}
                  </button>
                </div>
                {showTimer ? (
                  <Timer
                    otpValidationTime={otpValidationTime}
                    getShowTimerStatus={getShowTimerStatus}
                  />
                ) : null}
              </div>
            </div>
          </>
        ) : null
      }
      <div className="flex justify-center gap-3 mt-3">
        <button
          className={(isLoading || (selectedManufacturer === "sib" && !values.mobileOtpNumber)) ? "button-active  button-transition hover:bg-hover-primary text-medium text-xl lg:text-2xl w-fit   text-medium text-xl lg:text-2xl w-fit  hover:button-shadow w-fit p-4" : "button-active btn-gradient button-transition hover:bg-hover-primary text-medium text-xl lg:text-2xl w-fit   text-medium text-xl lg:text-2xl w-fit  hover:button-shadow w-fit p-4"}
          disabled={isLoading || (selectedManufacturer === "sib" && !values.mobileOtpNumber)}
          onClick={() => {
            setIsLoading(true);
            handleFDWithdrawal(selectedManufacturer === "sib" ? {
              otp: values.mobileOtpNumber,
              otpTransactionId: smsTransactionId,
              phoneNumber: fdDetails?.phoneNumber ? fdDetails.phoneNumber : ""
            }: {});
          }}
        >
          {translate(MAKE_PAYMENT_FDS.yesGoAhead)}
          {
            isLoading ? <Loader /> : null
          }
        </button>
        <button
          className="button-passive border-fd-primary text-fd-primary text-center w-fit px-4"
          onClick={updateModalState}
          disabled={isLoading}
        >
          {translate(COMMON_CONSTANTS.cancel)}
        </button>
      </div>
    </div>
  )
}

const SuccessPopup = ({ fdDetails }) => {
  const { t: translate } = useTranslation();
  return (
    <div className="flex justify-center flex-col gap-3">
      <div className="flex justify-center text-black text-medium text-6xl font-bold">
        <h1>{fdDetails?.fd_name ? fdDetails?.fd_name : ""}</h1>
      </div>
      <div className="text-center flex justify-center items-center">
        <GreenCheckMark />
      </div>
      <div className="text-medium text-black text-3xl text-center flex flex-col mb-3">
        <span className="text-primary-green">{translate(MAKE_PAYMENT_FDS.great)}!</span>
        <span>{translate(MAKE_PAYMENT_FDS.fdWithdrawalSuccessfullyRegistered)}</span>
      </div>
    </div>
  )
}

export default WithdrawPopup;

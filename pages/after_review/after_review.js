import { useEffect, useState } from "react";
import styles from "../../styles/after_review.module.css";

import {
  dd_mm_yyyy_hh_mm_ss_colon_format,

  getValidData,
  moveLocalStorageItemsToSession,
  moveSessionItemsToLocalStorage,
  getUserRole,
  getRedirectionURL,
  handleEventLogger,
  isValidURL,
  isMobile
} from "../../lib/util";
import appConfig from "../../app.config";
import { useRouter } from "next/router";
import ErrorModal from "../common/errorPopup";
import { GetApiHandler, PostApiHandler } from "../api/apihandler";
import Loader from "../../svg/Loader";
import GreenCheckMark from "../../svg/GreenCheckMark";
import ExclamationCircle from "../../svg/ExclamationCircle";
import { getVKYCAddressDetails } from "../../lib/customerAddressUtil";
import VKYCConfirmation from "../../_components/VkycConfirmation";
import UtkarshPaymentDetails from "../../_components/UtkarshPaymentDetails";
import PaymentDetails from "../../_components/PaymentDetailsAfterReview";
import PNBPaymentDetails from "../../_components/PNBPaymentDetails";
import { AFTER_REVIEW, REDIRECTION_MSG, COMMON_CONSTANTS, DETAIL_FD } from "../../constants";
import { v4 as uuidv4 } from "uuid";
import ProgressPopup from "../review_invest/progress_popup";
import Link from "next/link";
import { getCustomerInformation } from "../../lib/customerInformationUtil";
import { useTranslation } from "react-i18next";
function AfterReview() {
  const { t: translate } = useTranslation();
  const [showModal, setShowModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [apiErrorMessage, setApiErrorMessage] = useState("");
  const [isPaymentFetchingActive, setIsPaymentFetchingActive] = useState(true);
  const [productLogoURL, setProductLogoURL] = useState("");
  const [disclaimerText, setDisclaimerText] = useState("");
  const [esignLink, setEsignLink] = useState("");
  const [selectedManufactureId, setSelectedManufactureId] = useState("");
  const [paymentDetails, setPaymentDetails] = useState({
    cpTransRefNumber: "",
    paymentStatus: "",
    amount: "",
    tenure: "",
    openDate: "",
    maturityDate: "",
    bookingStatus: "",
    clntTransRef: "",
    tpslTransId: "",
    productType: "",
    manufacturerId: "",
    fdName: "",
    fdIssuerName: "",
    payment_status: ""
  });
  const [vkycStatus, setVKYCStatus] = useState({});
  const [titleMsg, setTitleMsg] = useState(translate(AFTER_REVIEW.fetchingPaymentInfo));
  const [bodyMsg1, setBodyMsg1] = useState(translate(AFTER_REVIEW.waitForPaymentStatus));
  const [bodyMsg2, setBodyMsg2] = useState("");
  const userRole = getUserRole();
  const [isOnboardingUser, setIsOnboardingUser] = useState(false);

  const handleExploreMoreBonds = () => {
    // const redirectionURL = getRedirectionURL(false);
    // if (redirectionURL) {
    //   const newRedirectionURL = redirectionURL.replace("/products", "")
    //   console.log("redirectionURL after explore more Bonds-->", newRedirectionURL)
    //   window.location.href = newRedirectionURL;
    // }
    const baseUrl = appConfig.redirectionURL;
    if (baseUrl) {
      const redirectionURL = baseUrl + "/products";
      sessionStorage.clear();
      window.location.href = redirectionURL;
    }
  }

  const router = useRouter();

  const toggleModal = () => setShowModal((state) => !state);

  function updatePaymentDetails(payment_encrypted_msg) {

    const requestBody = { msg: payment_encrypted_msg };
    let url =
      appConfig?.deploy?.baseUrl +
      appConfig?.deploy?.updatePaymentDetails;

    const selectedManufactureId = sessionStorage.getItem(
      "selectedManufactureId"
    );

    if (url.includes("v1")) {
      url = url.replace("v1", "v2");
    }
    if (payment_encrypted_msg) {
      console.log("Payment_encrypted_msg: ", payment_encrypted_msg);
      PostApiHandler(url, "POST", requestBody)
        .then((response) => {
          const { message } = response;
          const errors = response.data.errors;
          console.log("ERRORS: ", response);
          if (errors.length) {
            setIsPaymentFetchingActive(false);
            toggleModal();
            setApiErrorMessage(errors[0].errorMessage);
          } else if (response?.data?.data && Object.keys(response?.data?.data).length) {
            const { data: { data } } = response;
            sessionStorage.setItem("fdId", data.id);
            setPaymentDetails({ ...paymentDetails, ...data });
            if (data.customerReferenceId) {
              const customerReference = data.customerReferenceId.find((value) => value.customerRelIdType === "eSignLink")
              if (customerReference) {
                setTitleMsg(translate(AFTER_REVIEW.pleaseWait));
                setBodyMsg1(translate(AFTER_REVIEW.paymentSuccessfulProcessed));
                if (["pnbhfc", "lichfl"].includes(selectedManufactureId?.toLowerCase())) {
                  setBodyMsg2(translate(AFTER_REVIEW.redirectToEsign))
                  if (customerReference?.customerRelId) {
                    isValidURL(customerReference?.customerRelId) ? setEsignLink(customerReference.customerRelId) : setIsPaymentFetchingActive(false);
                  }
                }
              } else {
                setIsPaymentFetchingActive(false);
              }
            } else {
              setIsPaymentFetchingActive(false);
            }
          } else if (message) {
            setIsPaymentFetchingActive(false);
            toggleModal();
            setApiErrorMessage(message);
          }
        })
        .catch((err) => {
          console.log("Error:", err);
        });
    }
  }

  function handleBackbutton(){
    const baseUrl = appConfig.redirectionURLFikaa;
     window.location.href = baseUrl;
  }

  useEffect(() => {

    if (paymentDetails?.payment_status) {
      handleEventLogger("after_review", "pageLoad", "Invest_Successful", {
        action: "Invest_Completed_Status",
        fdName: paymentDetails.fd_name,
        amount: paymentDetails.fd_amount,
        tenure: paymentDetails.displayTenure,
        refNum: paymentDetails.reference_number,
        bookingStatus: paymentDetails.bookingStatus,
        paymentStatus: paymentDetails.payment_status,
        Platform:isMobile()
      });
    }
  }, [paymentDetails]);

  useEffect(() => {
    const isOnboardingUser = sessionStorage.getItem("isOnboardingUser") ?
      JSON.parse(sessionStorage.getItem("isOnboardingUser")) :
      false;
    isOnboardingUser !== undefined && setIsOnboardingUser(isOnboardingUser);
  })

  useEffect(() => {
    if (esignLink) {
      setIsLoading(true);
      moveSessionItemsToLocalStorage();
      window.location.href = esignLink;
    }
  }, [esignLink]);

  const onboardingUserVKYC = () => {

    const url = appConfig?.deploy?.baseUrl + appConfig?.deploy?.agentInitiateVideoKYC;
    const selectedManufactureId = sessionStorage.getItem("selectedManufactureId");
    const userId = sessionStorage.getItem("userId");
    const journeyID = sessionStorage.getItem("journeyID");

    const requestBody = {
      "manufacturerId": selectedManufactureId,
      "journeyId": journeyID,
      "customerId": userId,
      "redirectUrl": window.location.href
    }
    return [url, requestBody];
  }

  const diyUserVKYCPayload = () => {

    const url = appConfig?.deploy?.baseUrl + appConfig?.deploy?.initiateVideoKYC;
    const selectedManufactureId = sessionStorage.getItem(
      "selectedManufactureId"
    );
    let validateCustomerInfo = {};
    if (sessionStorage.getItem("validateCustomerInfo")) {
      validateCustomerInfo = JSON.parse(
        sessionStorage.getItem("validateCustomerInfo")
      );
    }

    const productIdLocal = sessionStorage.getItem("selectedProductId");
    const productData = JSON.parse(sessionStorage.getItem(productIdLocal));
    const { parents_spouse_details } = productData;
    const { panVerifcation } = validateCustomerInfo;
    const { origin, pathname } = window.location;
    const customerAddress = getVKYCAddressDetails();
    const customerInformation = getCustomerInformation();
    const fdId = sessionStorage.getItem("fdId");

    const requestBody = {
      fdId: fdId ? fdId : "",
      referenceId: uuidv4().replaceAll("-", ""),
      manufacturerCode: getValidData(selectedManufactureId),
      panNumber: getValidData(customerInformation.customerPan),
      dateOfBirth: getValidData(customerInformation.customerDob),
      customerName: getValidData(customerInformation.customerFullName),
      customerEmail: getValidData(customerInformation.customerEmailId),
      redirectUrl: getValidData(origin + pathname),
      varFields: {
        customerAddress: customerAddress,
        nameOnPanCard: panVerifcation
          ? getValidData(panVerifcation.nameOnPanCard)
          : "",
        welcomeMessage: translate(AFTER_REVIEW.welcomeToVkyc),
        fatherFullName: parents_spouse_details?.fatherFirstName
          ? getValidData(parents_spouse_details?.fatherFirstName)
          : "",
        mobileNumber: getValidData(customerInformation.customerContactNo),
        applicationDate: getValidData(
          dd_mm_yyyy_hh_mm_ss_colon_format(new Date())
        ),
        maritalStatus: getValidData(customerInformation.customerMaritalStatus),
        gender: getValidData(customerInformation.customerGender),
        motherName: parents_spouse_details?.motherFirstName
          ? getValidData(parents_spouse_details?.motherFirstName)
          : "",
        occupation: getValidData(customerInformation.customerOccupation),
        annualIncome: getValidData(customerInformation.customerIncomeDtls),
        depositAmount: paymentDetails?.fd_amount ? parseInt(paymentDetails?.fd_amount) : ""
      },
    };
    return [url, requestBody];
  }

  const handleCompleteVKYC = () => {
    setIsLoading(true);
    const [url, requestBody] = isOnboardingUser ? onboardingUserVKYC() : diyUserVKYCPayload();

    PostApiHandler(url, "POST", requestBody)
      .then((response) => {
        const { data, message } = response;
        if (response?.data?.errors?.length) {
          const { errorMessage } = response.data.errors[0];
          setIsLoading(false);
          setShowModal(true);
          errorMessage
            ? setApiErrorMessage(errorMessage)
            : setApiErrorMessage(translate(AFTER_REVIEW.somethingWentWrong));
        } else if (data?.data && Object.keys(data?.data).length) {
          const { kycUrl } = data?.data;
          moveSessionItemsToLocalStorage();
          window.location.href = kycUrl;
        }
      })
      .catch((err) => {
        console.log("ERROR: " + err);
      });
  };

  const validateVKYCInfo = (referenceId, data) => {

    const selectedManufactureId = sessionStorage.getItem(
      "selectedManufactureId"
    );
    const validateVKYCInfoURL =
      appConfig?.deploy?.baseUrl +
      appConfig?.deploy?.validateVkyc +
      `?manufacturerId=${selectedManufactureId}` +
      `&videoKycRequestId=${referenceId}`;

    const fdId = sessionStorage.getItem("fdId");
    const requestBody = {
      manufacturerId: selectedManufactureId,
      returnMessage: "SUCCESS",
      vkycCode: data,
      referenceId: referenceId,
      fdId: fdId,
    };

    PostApiHandler(validateVKYCInfoURL, "Post", requestBody).then((res) => {
      setIsPaymentFetchingActive(false);
      if (res?.data?.errors?.length) {
        const { errorMessage } = res.data.errors[0];
        setShowModal(true);
        errorMessage
          ? setApiErrorMessage(errorMessage)
          : setApiErrorMessage(translate(AFTER_REVIEW.somethingWentWrong));
      } else if (res?.data?.data && Object.keys(res?.data?.data).length) {
        const { vkycDetails, paymentDetails: paymentData } = res?.data?.data;
        vkycDetails && setVKYCStatus(vkycDetails);
        paymentData && setPaymentDetails({ ...paymentDetails, ...paymentData });
      }
    });
  };

  function disclaimerAPI() {

    const disclaimerURL =
      appConfig?.deploy?.baseUrl +
      appConfig?.deploy?.disclaimer +
      appConfig.distributorId;
    const { manufacturer_id, payment_status } = paymentDetails;

    GetApiHandler(disclaimerURL, "GET")
      .then(async (response) => {
        if (Object.keys(response.data.data).length) {
          const { disclaimer } = response.data.data;
          if (disclaimer) {
            let disclaimerTxt = "";
            if (
              manufacturer_id?.toLowerCase() === "usfb" &&
              payment_status?.toLowerCase() === "success" && getStatusDesc()
            ) {
              disclaimerTxt = disclaimer.filter(
                (val) => val.featureId === "InitiateVkycDisclaimer"
              )[0];
            } else {
              disclaimerTxt = disclaimer.filter(
                (val) => val.featureId === "FDBookingSuccessful"
              )[0];
            }
            if (vkycStatus.status === "pending") {
              disclaimerTxt = disclaimer.filter(
                (val) => val.featureId === "VkycSuccess"
              )[0];
            }
            if (manufacturer_id?.toLowerCase() === "pnbhfc" &&
              payment_status?.toLowerCase() === "success") {
              disclaimerTxt = disclaimer.filter(
                (val) => val.featureId === "PNBFDBookingSuccessful"
              )[0];
            }
            setDisclaimerText(disclaimerTxt.disclaimer);
          }
        }
      })
      .catch((err) => {
        console.log("Error:", err);
      });
  }

  const getStatusDescription = () => {
    let description = "";
    const { manufacturer_id, payment_status } = paymentDetails;
    const lowerCaseManufacturerId = manufacturer_id?.toLowerCase();
    const lowerCasePaymentStatus = payment_status?.toLowerCase();

    switch (lowerCaseManufacturerId) {
      case "bajaj":
      case "usfb":
        if (lowerCasePaymentStatus !== "success") {
          description = "FD booking has not been initiated due to payment failure.";
        } else if (lowerCasePaymentStatus === "success") {
          description = translate(AFTER_REVIEW.paymentSuccessfulReceived);
        }
        break;
      case "sib":
        if (lowerCasePaymentStatus !== "success") {
          description = "FD booking has not been initiated due to payment failure.";
        } else if (lowerCasePaymentStatus === "success") {
          description =  translate(AFTER_REVIEW.paymentSuccessfulReceived);
        }
        if (vkycStatus?.status?.toLowerCase()) {
          description = vkycStatus?.statusDescription && vkycStatus.statusDescription;
        }
        break;

      case "pnbhfc":
        if (lowerCasePaymentStatus !== "success") {
          description = translate(AFTER_REVIEW.errorInEsign);
        }
        break;

      default:
        description = translate(DETAIL_FD.mailFdDetailsOnEmail);
        break;
    }

    return description;
  };

  // Helper function to check if FD is exempt from Video KYC
  const determineFullKycReq = (custInfoSource, depositAmount, tenure, autoRenewal) => {
    let fullKycReq;

    if (custInfoSource?.toLowerCase() === "issuer") {
      fullKycReq = false;
    } else if (parseInt(depositAmount) <= 90000 &&
      parseInt(tenure) <= 365 && !autoRenewal) {
      if (custInfoSource?.toLowerCase() === "ckyc") {
        fullKycReq = true;
      } else {
        fullKycReq = false;
      }
    } else {
      fullKycReq = true;
    }

    return fullKycReq;
  }

  const getStatusDesc = () => {
    const { manufacturer_id, payment_status, auto_renewal_flag, fd_amount, tenor } = paymentDetails;
    const { status } = vkycStatus;
    const lowerCaseManufacturerId = manufacturer_id?.toLowerCase();
    const lowerCasePaymentStatus = payment_status?.toLowerCase();
    const lowerCaseStatus = status?.toLowerCase();

    // Helper function to retrieve KYC mode from session storage
    const getKYCMode = () => {
      const kycMode = sessionStorage.getItem("kycMode");
      return kycMode ? JSON.parse(kycMode) : {};
    };

    // USFB-specific logic
    const handleUSFB = () => {
      const kycMode = getKYCMode();
      if (determineFullKycReq(kycMode?.custInfoSource, fd_amount, tenor, auto_renewal_flag)) {
        return "Next Step: Complete your Video KYC";
      }
      return "";
    };

    // SIB-specific logic
    const handleSIB = () => {
      const kycMode = getKYCMode();
      if (determineFullKycReq(kycMode?.custInfoSource, fd_amount, tenor, auto_renewal_flag)) {
        return "Next Step: Complete your Video KYC";
      } else if (lowerCaseStatus === "pending") {
        return "Next Step: Complete your Video KYC";
      } else if (lowerCaseStatus === "failed") {
        return `Next Step : Kindly initiate Video KYC during bank working days Monday to Saturday between 9 AM to 11 PM`;
      } else if (lowerCaseStatus === "rejected") {
        return `Next Step : We have processed refund of your FD booking amount, the same will credited to your bank account within 2-3 working days.`
      } else {
        return "";
      }
    };

    // Manufacturer-based description logic
    const getManufacturerDescription = () => {
      if (lowerCasePaymentStatus !== "success") return "";

      switch (lowerCaseManufacturerId) {
        case "usfb":
          if (lowerCaseStatus !== "pending") {
            return handleUSFB();
          }
          break;
        case "pnbhfc":
          return translate(AFTER_REVIEW.nextStepEsign);
        case "sib":
          return handleSIB();
        default:
          return "";
      }
    };

    // Return final description based on manufacturer and conditions
    return getManufacturerDescription();
  };


  useEffect(() => {
    const { query } = router;
    if (Object.keys(query).includes("referenceId")) {
      moveLocalStorageItemsToSession();
      validateVKYCInfo(query.referenceId, query.data);
    }
  }, [router]);

  useEffect(() => {
    let queryData = router.query;
    console.log("This is for mindgate testing queryData.response", queryData)
    if (queryData.response) {
      moveLocalStorageItemsToSession();
      updatePaymentDetails(queryData.response);
    }
  }, [router.isReady]);

  useEffect(() => {
    if (paymentDetails.manufacturer_id) {

      const baseURL = appConfig.deploy["manufacturerLogoBaseUrl"];
      const productLogo =
        baseURL + paymentDetails.manufacturer_id?.toLowerCase() + ".png";
      setProductLogoURL(productLogo);
      disclaimerAPI();
    }
  }, [paymentDetails]);

  useEffect(() => {
    if (Object.keys(vkycStatus).length) {
      disclaimerAPI();
    }
  }, [vkycStatus]);

  useEffect(() => {
    const selectedManufactureId = sessionStorage.getItem(
      "selectedManufactureId"
    );
    setSelectedManufactureId(selectedManufactureId)
    moveLocalStorageItemsToSession();
  }, []);

  return (
    <div>
      <ErrorModal
        canShow={showModal}
        updateModalState={toggleModal}
        errorMessage={apiErrorMessage}
      />
      {!isPaymentFetchingActive ? (
        <div className="bg-white w-auto text-center pt-4 flex flex-col space-y-4 px-3 text-apercu-medium">
          {Object.keys(vkycStatus).length ? (
            <VKYCConfirmation
              details={{
                vkycStatus: vkycStatus,
                productLogoURL: productLogoURL,
                paymentDetails: paymentDetails,
                disclaimerText: disclaimerText,
                handleCompleteVKYC,
              }}
            />
          ) : (
            <>
              {paymentDetails?.payment_status?.toLowerCase()
                .includes("success") ? (
                <>
                  <span className="text-primary-green flex justify-center rounded-full">
                    <GreenCheckMark />
                  </span>
                  <span className="text-primary-green text-6xl text-medium capitalize">
                    {paymentDetails.payment_status}!
                  </span>
                </>
              ) : (
                <>
                  <span className="text-light-red flex justify-center rounded-full">
                    <ExclamationCircle />
                  </span>
                  <span className="text-light-red text-6xl text-medium capitalize">
                    {translate(paymentDetails.payment_status.toLowerCase()) ?? 'Failed'}!
                  </span>
                </>
              )}
              <span className="text-xl text-regular mx-5 text-black">
                {getStatusDescription()}
              </span>
              <div className="flex justify-center flex-col align-center">
                {getStatusDesc() ? (
                  <span className="text-xl text-regular mx-5 text-black text-fd-primary content-center">
                    {getStatusDesc()}
                  </span>
                ) : null}
                {(paymentDetails?.manufacturer_id?.toLowerCase() === "usfb") &&
                  getStatusDesc() ? (
                  <>
                    <br />
                    <div className="flex flex-col justify-center items-center">
                      <div className={`flex w-3/5 items-center flex-col text-base text-light-gray text-regular ${styles.mobile_view}`}>
                        {translate(AFTER_REVIEW.vkycText)}
                        <p className="items-center"> </p>
                        <div>
                          <br />
                        </div>
                      </div>
                      
                             <ol className="flex flex-col text-justify list-disc ml-4  text-gray-600 items-center mb-2 mt-2">
                              {translate(AFTER_REVIEW.followDocText)}
                              <li>{translate(AFTER_REVIEW.followDocText1)}</li>
                              <li>{translate(AFTER_REVIEW.followDocText2)}</li>
                              <li>{translate(AFTER_REVIEW.followDocText3)}</li>
                              <li>{translate(AFTER_REVIEW.followDocText4)}</li>
                            </ol>
                      <br />
                      <button
                        className={(isLoading) ? "button-active button-transition hover:bg-hover-primary text-medium text-xl lg:text-2xl w-fit   text-medium text-xl lg:text-2xl w-fit  hover:button-shadow" : "button-active btn-gradient button-transition hover:bg-hover-primary text-medium text-xl lg:text-2xl w-fit   text-medium text-xl lg:text-2xl w-fit  hover:button-shadow"}
                        onClick={handleCompleteVKYC}
                        disabled={isLoading}
                      >
                        {translate(AFTER_REVIEW.startVideoKyc)}
                        {isLoading ? <Loader /> : null}
                      </button>
                    </div>
                  </>
                ) : null}
                {(paymentDetails?.manufacturer_id?.toLowerCase() === "sib") &&
                  getStatusDesc() && (vkycStatus?.status === "pending" || !Object.keys(vkycStatus).length) ? (
                  <>
                  <ol className="flex flex-col  list-disc  ml-4 text-center text-gray-600 items-center mb-2 mt-2" >
                              {translate(COMMON_CONSTANTS.sibVkyc)}
                             
                              <li>{translate(COMMON_CONSTANTS.sibVkyc1)}</li>
                              <li>{translate(COMMON_CONSTANTS.sibVkyc2)}</li>
                            </ol>
                    <div className="flex flex-col justify-center items-center">
                       
                      <button
                        className={(isLoading) ? "button-active  button-transition hover:bg-hover-primary text-medium text-xl lg:text-2xl w-fit   text-medium text-xl lg:text-2xl w-fit  hover:button-shadow" : "button-active btn-gradient button-transition hover:bg-hover-primary text-medium text-xl lg:text-2xl w-fit   text-medium text-xl lg:text-2xl w-fit  hover:button-shadow"}
                        onClick={handleCompleteVKYC}
                        disabled={isLoading}
                      >
                        {translate(AFTER_REVIEW.startVideoKyc)}
                        {isLoading ? <Loader /> : null}
                      </button>
                    </div>
                  </>
                ) : null}
                {/* {paymentDetails?.manufacturer_id?.toLowerCase() === "pnbhfc" &&
                  getStatusDesc() ? (
                  <button
                    className="button-active btn-gradient button-transition hover:bg-hover-primary text-medium text-xl lg:text-2xl w-fit   w-fit p-3"
                    onClick={handleESign}
                    disabled={isLoading}
                  >
                    e-Sign
                    {isLoading ? <Loader /> : null}
                  </button>
                ) : null} */}
              </div>
              <span className="text-4xl text-light-gray text-regular">
                {translate(AFTER_REVIEW.paymentDetails)}
              </span>
              <div className="flex justify-center w-full">
                {(paymentDetails?.manufacturer_id?.toLowerCase() === "usfb" || paymentDetails?.manufacturer_id?.toLowerCase() === "sib") &&
                  paymentDetails.payment_status?.toLowerCase() === "success" && getStatusDesc() ? (
                  <UtkarshPaymentDetails
                    details={{
                      productLogoURL: productLogoURL,
                      paymentDetails: paymentDetails,
                      disclaimerText: disclaimerText,
                    }}
                  />
                ) : paymentDetails?.manufacturer_id?.toLowerCase() === "pnbhfc" &&
                  paymentDetails.payment_status?.toLowerCase() === "success" ? (
                  <PNBPaymentDetails
                    details={{
                      productLogoURL: productLogoURL,
                      paymentDetails: paymentDetails,
                      disclaimerText: disclaimerText,
                    }}
                  />
                ) : (
                  <PaymentDetails
                    details={{
                      productLogoURL: productLogoURL,
                      paymentDetails: paymentDetails,
                      disclaimerText: disclaimerText,
                    }}
                  />
                )}
              </div>
            </>
          )}
          <span className="text-medium text-2xl text-light-gray"> </span>
          <div className="pb-2">
            {
              !isOnboardingUser ?
                <>
                  {userRole?.toLowerCase() === "familyhead" || appConfig.redirectionURL ? <>
                    <button className="button-passive border-fd-primary text-fd-primary mr-3 w-fit">
                      <Link href="/product/product_list">{translate(AFTER_REVIEW.exploreMoreFd)}</Link>
                    </button>
                    {
                      appConfig.distributorId.toLowerCase()=="tipson" ?  <button className="button-passive border-fd-primary text-fd-primary mr-3 w-fit px-4" onClick={handleExploreMoreBonds}>
                      {translate(AFTER_REVIEW.exploreMoreBonds)}
                    </button>: <button className="button-passive border-fd-primary text-fd-primary mr-3 w-fit px-4" onClick={handleBackbutton}>
                      Explore More Bond
                    </button>
                    }
                   
                  </> : <button
                    className="button-passive border-fd-primary text-fd-primary mr-3 w-fit px-4"
                    onClick={() => router.push("/my_fds/fd")}
                  >
                    {translate(AFTER_REVIEW.myFds)}
                  </button>}
                </> : null
            }
          </div>
        </div>
      ) : (
        <div>
          <ProgressPopup
            title={titleMsg}
            message1={bodyMsg1}
            message2={bodyMsg2}
            note={REDIRECTION_MSG.msgAfterReview}
          />
          {/* <div className="text-primary-green text-xl bg-white w-auto text-center py-8 flex flex-col space-y-4 text-apercu-medium">
            {REDIRECTION_MSG.msgAfterReview}
          </div>
          <div className="flex justify-center items-center gap-3">
            Fetching Payment Info..
            <Loader />
          </div> */}
        </div>
      )}
    </div>
  );
}

export default AfterReview;

import { FaRegEdit } from "react-icons/fa";
import ProgressPopup from "./progress_popup.js";
import "react-loading-skeleton/dist/skeleton.css";
import { useEffect, useState, useRef } from "react";
import { LocalStorageHandler } from "../../lib/storage_handler";
import { getVKYCAddressDetails } from "../../lib/customerAddressUtil";
import appConfig from "../../app.config";
import {
  formatFatherFullName,
  formatFullCommunicationAddress,
  formatFullName,
  formatFullPermanentAddress,
  formatMotherFullName,
  getLocalStorageSingleData,
  getProductId,
} from "../../lib/review_utils";
import { GetApiHandler } from "../api/apihandler";
import { dateFormat, dd_mm_yyyy_format, getCurrentDateTime, getFullName, getUserType, handleEventLogger, moveSessionItemsToLocalStorage, trimText, isMobile } from "../../lib/util";
import { PostApiHandler } from "../api/apihandler";
import ErrorModal from "../common/errorPopup";
import { callStatusVerifyAPI } from "../../lib/bankUtils";
import review_invest_css from '../../styles/review_invest_css.module.css'
import { useRouter } from "next/router.js";
import BankingDetails from "../../_components/BankingDetails.jsx";
import DeclarationDetails from "../../_components/DeclarationDetails.jsx";
import InvestmentDetails from "../../_components/InvestmentDetails.jsx";
import NomineeDetails from "../../_components/NomineeDetails.jsx";
import AddressDetails from "../../_components/AddressDetails.jsx";
import TermsConditions from "../../_components/TermsConditions.jsx";
import ProfessionalDetails from "../../_components/ProfessionalDetails.jsx";
import { FD_RENEWAL, AGENT, REDIRECTION_MSG, nomineeMapping, ADDRESS_DETAILS, AFTER_REVIEW, BASIC_DETAILS, PARENT_DETAILS_PAYMENT, KYC_DETAIL, COMMON_CONSTANTS, MAKE_PAYMENT_FDS, COMMON, SIDEBAR } from "../../constants/index.js";
import { getCustomerInformation } from "../../lib/customerInformationUtil.js";
import { v4 as uuidv4 } from "uuid";
import PNBTermsConditions from "../../_components/PNBTermsConditions.jsx";
import { useTranslation } from "react-i18next";
import { getValidData, dd_mm_yyyy_hh_mm_ss_colon_format } from '../../lib/util.js'
import PaymentMethodModal from "../common/paymentMethodModal.jsx";
let errorDetails = "";

function ReviewAndInvest(props) {
  const { t: translate } = useTranslation();
  const [apiErrorMessage, setApiErrorMessage] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [showProgressPopup, setShowProgressPopup] = useState(false);
  const [titleMsg, setTitleMsg] = useState("");
  const [bodyMsg1, setBodyMsg1] = useState("");
  const [bodyMsg2, setBodyMsg2] = useState("");
  const [rmCustomerPersonalDetails, setRMCustomerPersonalDetails] = useState();
  const [termsConditions, setTermsConditions] = useState();
  const [prePaymentData, setPrePaymentData] = useState({
    message: "",
    signature: "",
    paymentURL: ""
  });
  const [pollingResponse, setPollingResponse] = useState();
  const [isFamilyMember, setIsFamilyMember] = useState(false);
  const [productManufacturerId, setProductManufacturerId] = useState();

  //  const productManufacturerId = sessionStorage.getItem("selectedManufactureId");

  const submitBtnRef = useRef(null);

  const toggleModal = () => setShowModal((state) => !state);
  const [isLoading, setisLoading] = useState(false);
  const [loggedInUserID, setLoggedInUserId] = useState("");
  const [getCkycDataFromLocalStorage, setCkycDataFromLocalStorage] = useState(
    {}
  );
  const [productData, setProductData] = useState({});
  const [returnedStatusFromUtil, setReturnedStatusFromUtil] = useState();
  const [counter, setCounter] = useState(0);
  const [bankVerificationStatus, setBankVerificationStatus] = useState(
    "Verified"
  );
  const [isPrepaymentLinkGenerated, setIsPrepaymentLinkGenerated] =
    useState(false);
  const [productType, setProductType] = useState("");
  const [isTnCAcceptedByUser, setIsTnCAcceptedByUser] = useState(false);
  const [isTnCAccepted, setIsTnCAccepted] = useState(false);
  const [tncURL, setTnCUrl] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(null);
  const closeModal = () => setIsModalOpen(false);
  const router = useRouter()

  const productId = getProductId();
  let selectedManufactureId = "";
  if (typeof window !== "undefined") {
    selectedManufactureId = sessionStorage.getItem("selectedManufactureId");
  }
  const productName = getLocalStorageSingleData("selectedProductName");
  const role = getUserType();

  const {
    pidData: ckycPidData,
    taxResidencyDeclarationData,
    ckycParentSpouseData,
    ckycPersonalData,
  } = getCkycDataFromLocalStorage;

  const {
    bank_details,
    basic_details,
    customer_address,
    declaration,
    investment_details,
    nominee_details,
    parents_spouse_details,
    professional_details,
    contact_details,
    customer_personal_details
  } = productData;
  const permanentFullAddress = formatFullPermanentAddress(customer_address);
  const communicationFullAddress =
    formatFullCommunicationAddress(customer_address);

  const userFullName = trimText(formatFullName(ckycPersonalData));
  const userFatherFullName = trimText(formatFatherFullName(ckycPidData));
  const userMotherFullName = trimText(formatMotherFullName(ckycPidData));

  const handlePaymentMethodSelect = (method) => {
    setSelectedPaymentMethod(method);
  };
  useEffect(() => {
    if (selectedPaymentMethod) {
      submitFD();
    }
  }, [selectedPaymentMethod])

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
    if (typeof window !== "undefined") {
      const ProdId = sessionStorage.getItem("selectedManufactureId");
      setProductManufacturerId(ProdId)
      setProductType(sessionStorage.getItem("selectedProductType"));
      setLoggedInUserId(sessionStorage.getItem("userId"));
      const productIdLocal = sessionStorage.getItem("selectedProductId");
      if (productIdLocal && sessionStorage[productIdLocal]) {
        setProductData(JSON.parse(sessionStorage[productIdLocal]));
        const productData = JSON.parse(sessionStorage[productIdLocal]);
        const { CkycApiData, parents_spouse_details } = productData;
        if (CkycApiData && Object.keys(CkycApiData).length) {
          const { pidData, "BASIC DECLARATION": taxResidencyDeclarationData,
            "PERSONAL DETAILS": ckycPersonalData } = CkycApiData;

          setCkycDataFromLocalStorage({
            pidData,
            taxResidencyDeclarationData,
            ckycParentSpouseData: parents_spouse_details,
            ckycPersonalData
          });
        }
      }

      const role = getUserType();
      if (role !== "user") {
        const rmCustomerData = JSON.parse(sessionStorage.getItem('rm_customer_data'));
        if (rmCustomerData) {
          const { first_name, middle_name, last_name, mobile_number, email_id, } = rmCustomerData;
          const fullName = getFullName(first_name, middle_name, last_name);
          setRMCustomerPersonalDetails({
            userFullName: fullName,
            first_name,
            last_name
          });
        }
      }
    }
    const tncUrlLink = sessionStorage.getItem("selectedProductTnCUrl");
    tncUrlLink !== "null" && setTnCUrl(tncUrlLink);
    // // Check if manufacturer requested for prePayment before

  }, []);

  useEffect(() => {
    if (productData && Object.keys(productData).length > 0) {
      const url = new URL(window.location.href);
      const hasVkycJourney = url.searchParams.has('vkycJourney');
      if (hasVkycJourney && typeof window !== "undefined") {
        commitUserFD()
      }
    }
  }
    ,
    [productData])

  let json = { afterReviewSubmit: {} };
  //   Initiate payment flow
  function initiatePayment(fdId) {
    let url = appConfig?.deploy?.baseUrl + appConfig?.deploy?.do_payment;
    if (url.includes("v1")) {
      url = url.replace("v1", "v2");
    }
    let requestBody = {
      fdId: fdId,
    };
    setTitleMsg(translate(COMMON.ProcessingPaymentOperation));
    PostApiHandler(url, "POST", requestBody)
      .then((response) => {
        const { data, message } = response;
        if (message) {
          setShowProgressPopup(false);
          setShowModal(true);
          setApiErrorMessage(response.message);
          setisLoading(false);
        } else if (data.data) {
          const { paymentUrl, additionalParams, referenceId } = data.data;

          if (data && data.errors && data.errors.length > 0) {
            setShowProgressPopup(false);
            setShowModal(true);
            setApiErrorMessage("Application has been submitted successfully.");
            setisLoading(false);
            errorDetails = data.errors[0].hasOwnProperty("errorMessage")
              ? data.errors[0].errorMessage
              : "Payment service is down. Kindly try after sometime.";
          } else if (paymentUrl === "") {
            setBodyMsg1("Payment request initiated. Kindly check your UPI app.");
            setisLoading(true);
            startPaymentTimer(referenceId);
          } else if (
            paymentUrl.toLowerCase().includes("invalid") ||
            paymentUrl.toLowerCase().includes("error") || !paymentUrl.toLowerCase().includes("http")
          ) {
            setShowProgressPopup(false);
            setShowModal(true);
            setApiErrorMessage(paymentUrl);
            setisLoading(false);
          } else {
            setBodyMsg1(translate(COMMON.RedirectingToPaymentGateway));
            if (additionalParams?.redirectionMode === "url") {
              moveSessionItemsToLocalStorage();
              window.location.href = data.data.paymentUrl;
            }
          }
        }
      })
      .catch((err) => {
        setBodyMsg1("ERROR: " + err);
      });
  }


  //Get Product Details
  const getProductInfo = () => {
    const productManufacturerId = sessionStorage.getItem("selectedManufactureId");
    const productType = sessionStorage.getItem("selectedProductType");
    const productID = sessionStorage.getItem("selectedProductId");

    const detailFdURL =
      appConfig?.deploy?.baseUrl +
      appConfig?.deploy?.getProductDetail +
      "?manufacturer_id=" +
      productManufacturerId +
      "&product_type=" +
      productType +
      "&product_id=" +
      productID;

    GetApiHandler(detailFdURL, "GET")
      .then((response) => {
        if (response.hasOwnProperty("message")) {
          displayError = response["message"];
          setShowModal(true);
          setapiErrorMessage(displayError);
        } else {
          const { manufacturerProperties } = response.data.data;
          manufacturerProperties?.tnc && setTermsConditions(manufacturerProperties.tnc)
        }
      })
      .catch((error) => {
        console.log(error)
      })
  };

  let paymentTimer, retryTimer;
  function startPaymentTimer(paymentReferenceId) {
    const retryInterval = 5000; // 5 seconds for retrying
    const minutes = 5;
    const milliseconds = minutes * 60 * 1000; // Total 5-minute timeout

    // Start the 5-minute timer
    paymentTimer = setTimeout(() => {
      stopPaymentTimer();
      setPollingResponse({ status: "failed", referenceId: paymentReferenceId });
    }, milliseconds);

    // Start the first API request
    handlePaymentRequest(paymentReferenceId, retryInterval);
  }

  function stopPaymentTimer() {
    setisLoading(false);
    setShowProgressPopup(false);
    clearTimeout(paymentTimer); // Stop the main 5-minute timer
    clearTimeout(retryTimer);   // Stop the retry timer if it's running
  }

  function handlePaymentRequest(paymentReferenceId, retryInterval) {
    const paymentPollingURL = appConfig?.deploy?.baseUrl + appConfig?.deploy?.paymentPolling;
    const requestBody = {
      "paymentReferenceId": paymentReferenceId || "",
      "phone": ckycPersonalData?.MobileNumber || "",
      "vpaId": bank_details.vpaId || ""
    };

    PostApiHandler(paymentPollingURL, "POST", requestBody)
      .then((response) => {
        const { message } = response;
        if (message) {
          setShowProgressPopup(false);
          setisLoading(false);
          setShowModal(true);
          if (response?.data?.errors?.length) {
            const { errorMessage } = response.data.errors[0];
            errorMessage
              ? setApiErrorMessage(errorMessage)
              : setApiErrorMessage(translate(AFTER_REVIEW.somethingWentWrong));
          } else {
            setApiErrorMessage(message);
          }
        } else if (response?.data?.errors?.length) {
          retryTimer = setTimeout(() => handlePaymentRequest(paymentReferenceId, retryInterval), retryInterval);
        } else if (response?.data?.data && Object.keys(response?.data?.data).length) {
          const { status } = response.data.data;
          if (status?.toLowerCase() === "success") {
            setisLoading(false);
            setShowProgressPopup(false);
            stopPaymentTimer(); // Stop the timer upon successful response
            setPollingResponse({ ...response?.data?.data, referenceId: paymentReferenceId });
          } else if (status?.toLowerCase() === "failed") {
            // Retry on failure with a delay
            retryTimer = setTimeout(() => handlePaymentRequest(paymentReferenceId, retryInterval), retryInterval);
          }
        }
      })
      .catch(() => {
        // Retry on network error or other failures
        retryTimer = setTimeout(() => handlePaymentRequest(paymentReferenceId, retryInterval), retryInterval);
      });
  }

  function FDSubmit() {
    handleEventLogger("review_invest", "buttonClick", "Invest_Successful", {
      action: "Declaration_Completed",
      Platform: isMobile()
    });
    setisLoading(false);
    if (selectedManufactureId === "BAJAJ" && role === "user") {
      if (investment_details.depositAmount <= 100000) {
        setIsModalOpen(true)
      }
      else {
        setSelectedPaymentMethod("Net Banking")
      }
    }
    else {
      // if (bankVerificationStatus.toLowerCase() != "verified") {
      //   //start polling
      //   setisLoading(true);
      //   setCounter(0);
      //   startPolling();
      // } else {
      submitFD();
      // }
    }

  }

  const handleRedirectionToReviewPage = (pollingResponse) => {
    const { distributorId } = appConfig;
    const currentDateTime = getCurrentDateTime();
    const responsePayload = {
      "manufacturerCode": selectedManufactureId ? selectedManufactureId : "",
      "consumerCode": distributorId ? distributorId : "",
      "transactionId": pollingResponse?.transactionId ? pollingResponse.transactionId : "",
      "status": pollingResponse?.status ? pollingResponse.status : "",
      "statusDescription": pollingResponse?.statusDescription ? pollingResponse.statusDescription : "",
      "referenceId": pollingResponse?.referenceId ? pollingResponse.referenceId : "", //Payment Reference ID used for Payment Polling
      "txnAmount": pollingResponse?.amount ? pollingResponse.amount : "",
      "currencyName": "",
      "txnDate": currentDateTime, //"2024-05-31T05:19:18" Sent current date time in the given format
      "varFields": {
        "gatewayResponse": pollingResponse // All Payment Polling Response
      }
    }
    console.log("This is for mindgate testing responsePayload", responsePayload)
    router.push({
      pathname: "/after_review/after_review",
      query: {
        response: JSON.stringify(responsePayload)
      },
    });
  };


  async function bookUserFD(customerID) {
    let url = appConfig?.deploy?.baseUrl + appConfig?.deploy?.rmBookFd;
    if (url.includes("v1")) {
      url = url.replace("v1", "v2");
    }
    const requestBody = getNewRequestBody();

    PostApiHandler(url, "POST", { ...requestBody, userId: customerID }).then((response) => {
      if (response?.data?.errors?.length) {
        const { errors } = response?.data;
        setApiErrorMessage(errors[0]?.errorMessage ? errors[0]?.errorMessage : "Something went wrong!");
        setShowProgressPopup(false);
        setShowModal(true);
        setisLoading(false);
      }
      if (response?.data?.data && Object.keys(response.data.data).length) {
        sessionStorage.setItem("bookFdData", JSON.stringify(response.data.data));
        router.push("/after_review/after_review_rm");
      }
    }).catch((err) => {
      setBodyMsg1("ERROR: " + err);
    });
  }

  const submitFD = () => {
    setisLoading(true);
    const rm_customer_data = JSON.parse(sessionStorage.getItem('rm_customer_data'))
    if (role !== "user" && rm_customer_data) {
      const customerID = rm_customer_data ? rm_customer_data.customer_id : "";
      bookUserFD(customerID);
    } else {
      const investorDetails = sessionStorage.getItem("investorDetails");
      if (investorDetails) {
        const { isFamilyHead, userId: customerID } = JSON.parse(investorDetails);
        isFamilyHead ? commitUserFD() : bookUserFD(customerID);
      } else {
        commitUserFD();
      }
    }
  }

  const getTrimmedParentDetails = () => {
    const parentDetails = {
      fatherName: "",
      motherName: ""
    };
    parentDetails.fatherName = parents_spouse_details
      ? trimText(parents_spouse_details.fatherFirstName) +
      " " +
      trimText(parents_spouse_details.fatherMiddleName) +
      " " +
      trimText(parents_spouse_details.fatherLastName)
      : ckycParentSpouseData ? userFatherFullName : "";
    parentDetails.motherName = parents_spouse_details
      ? trimText(parents_spouse_details.motherFirstName) +
      " " +
      trimText(parents_spouse_details.motherMiddleName) +
      " " +
      trimText(parents_spouse_details.motherLastName)
      : ckycParentSpouseData ? userMotherFullName : "";
    return parentDetails;
  }

  const commitFDPolling = (requestId, startPollingTimer, requestBody) => {
    const url = appConfig?.deploy?.baseUrl + appConfig?.deploy?.commitFdPoll + `/${requestId}`;
    let timeout;
    PostApiHandler(url, "POST", requestBody)
      .then((response) => {
        const { data, message } = response;
        if (message) {
          setApiErrorMessage(translate(COMMON.WeCouldNotProcessTheRequestAtTheMomentPleaseRetry));
          setShowProgressPopup(false);
          setShowModal(true);
          setisLoading(false);
        } else if (data?.errors?.length) {
          const { errors } = data;
          if (errors[0].errorIdentifier === "1SB_AL_ERROR_NO_DATA_FOUND_FOR_REQUEST_ID") {
            const currentTime = Date.now();
            const timeDifference = currentTime - startPollingTimer;
            const minutesDifference = timeDifference / (1000 * 60);
            if (minutesDifference < 3) {
              timeout = setTimeout(() => {
                commitFDPolling(requestId, startPollingTimer, requestBody)
              }, 3000);
            }
          } else {
            clearTimeout(timeout);
            setShowProgressPopup(false);
            setShowModal(true);
            setApiErrorMessage(errors ? errors[0].errorMessage : errors[0]);
            setisLoading(false);
            errorDetails = "";
          }
        } else if (data?.data) {
          if (data?.data?.prePaymentURL) {
            setPrePaymentData({
              message: data?.data?.prePaymentURL?.message
                ? data?.data?.prePaymentURL?.message : "",
              signature: data?.data?.prePaymentURL?.signature ?
                data?.data?.prePaymentURL?.signature : "",
              paymentURL: data?.data?.prePaymentURL?.paymentFormUrl ?
                data?.data?.prePaymentURL?.paymentFormUrl : ""
            });
            if (requestBody.isPrepaymentEnabled) {
              new LocalStorageHandler().setLocalStoragePlainItem(
                "fdId",
                response.data.data.fdId
              );
            }
          } else {
            setBodyMsg1("FD committed successfully. Generating Payment Link");
            const { data: { data } } = response;
            if (data?.customerReferenceId) {
              const { customerReferenceId } = data
              const referenceNum = customerReferenceId.findIndex(val => val.customerRelIdType === "Issuer Ref Number");
              const applicationNum = customerReferenceId.findIndex(val => val.customerRelIdType === "Application Number");
              if (customerReferenceId[applicationNum].customerRelId && customerReferenceId[referenceNum].customerRelId) {
                setBodyMsg2(
                  "APPL_No:" +
                  customerReferenceId[applicationNum].customerRelId +
                  " CP_Trans_Ref_No:" +
                  customerReferenceId[referenceNum].customerRelId
                );
              }
            }

            initiatePayment(
              requestBody.fd_id,
              requestBody.customer_id,
            );
          }
        } else {
          const currentTime = Date.now();
          const timeDifference = currentTime - startPollingTimer;
          const minutesDifference = timeDifference / (1000 * 60);
          if (minutesDifference < 3) {
            timeout = setTimeout(() => {
              commitFDPolling(requestId, startPollingTimer, requestBody)
            }, 3000);
          } else {
            setApiErrorMessage(translate(COMMON.WeCouldNotProcessTheRequestAtTheMomentPleaseRetry));
            setShowProgressPopup(false);
            setShowModal(true);
            setisLoading(false);
          }
        }
      })
      .catch((err) => {
        setApiErrorMessage(translate(COMMON.WeCouldNotProcessTheRequestAtTheMomentPleaseRetry));
        setShowProgressPopup(false);
        setShowModal(true);
        setisLoading(false);
      });
  }

  // V1
  const getRequestBody = () => {
    let isPrepaymentEnabled =
      appConfig?.deploy?.commitFDFlow.hasOwnProperty(
        selectedManufactureId
      ) &&
      appConfig?.deploy?.commitFDFlow[selectedManufactureId][
        "payment"
      ].toLowerCase() == "prepayment";
    console.log(
      ">>>>>>>>>>>>>>>>>> commitFDFlow",
      appConfig?.deploy?.commitFDFlow
    );
    console.log("+++++++++ selectedManufactureId: ", selectedManufactureId);
    console.log("+++++++++ isPrepaymentEnabled: ", isPrepaymentEnabled);
    const base64String = sessionStorage.getItem("base64String");
    const accountHolderName = sessionStorage.getItem("accountHolderName");
    const lgLcCode = sessionStorage.getItem("lgLcCode");
    const professionalDetails = {};
    if (professional_details) {
      Object.keys(professional_details).forEach((key) => {
        professionalDetails[key] = professional_details[key].data
      })
    }
    // const dynamicDeclaration = {};
    // if (declaration?.dynamicDeclaration) {
    //   Object.keys(declaration.dynamicDeclaration).forEach((key) => {
    //     dynamicDeclaration[key] = declaration.dynamicDeclaration[key].data
    //   })
    // }

    const ckycData = { ...getCkycDataFromLocalStorage }
    if (ckycData?.pidData?.personalDetails) {
      const { personalDetails } = ckycData.pidData;
      personalDetails.fatherFname = parents_spouse_details?.fatherFirstName ? trimText(parents_spouse_details.fatherFirstName) : "";
      personalDetails.fatherMname = parents_spouse_details?.fatherMiddleName ? trimText(parents_spouse_details.fatherMiddleName) : "";
      personalDetails.fatherLname = parents_spouse_details?.fatherLastName ? trimText(parents_spouse_details.fatherLastName) : "";
      personalDetails.motherFname = parents_spouse_details?.motherFirstName ? trimText(parents_spouse_details.motherFirstName) : "";
      personalDetails.motherMname = parents_spouse_details?.motherMiddleName ? trimText(parents_spouse_details.motherMiddleName) : "";
      personalDetails.motherLname = parents_spouse_details?.motherLastName ? trimText(parents_spouse_details.motherLastName) : ""
    }
    const requestBody = {
      bankDetail: {
        accountHolderName: trimText(accountHolderName),
        pennyDropStatus: bank_details.pennyDropStatus
          ? bank_details.pennyDropStatus
          : "",
        pennyDropStatusId: bank_details.pennyDropStatusId
          ? bank_details.pennyDropStatusId
          : "",
        accountType: bank_details.accountType ? trimText(bank_details.accountType) : "",
        bankAccountNumber: bank_details.accountNumber
          ? trimText(bank_details.accountNumber)
          : "",
        bankIfsc: bank_details.ifscCode ? trimText(bank_details.ifscCode) : "",
        bankName: bank_details.bankName ? trimText(bank_details.bankName) : "",
        branchAddress: bank_details.branchAddress ? bank_details.branchAddress : "",
        micrCode: bank_details.micrCode ? bank_details.micrCode : "",
        branchName: bank_details.branchName ? trimText(bank_details.branchName) : "",
        bankLogo: bank_details.bankLogo ? bank_details.bankLogo : ""
      },
      nomineeDetails: nominee_details,
      declarationDetails: {
        pep: declaration && declaration.pep ? declaration.pep : false,
        rpep:
          declaration && declaration.relative_pep
            ? declaration.relative_pep
            : false,
        isTaxResidentIndian: true,
        form15G_15H: investment_details?.form15G_15H ? investment_details.form15G_15H : false,
        dynamicDeclaration: declaration?.dynamic_declaration ? declaration.dynamic_declaration : {}
      },
      parentsSpouseDetail: {
        fatherName: trimText(getTrimmedParentDetails().fatherName),
        motherName: trimText(getTrimmedParentDetails().motherName),
        spouseFirstName: parents_spouse_details?.spouseFirstName ? trimText(parents_spouse_details.spouseFirstName) : "",
        spouseMiddleName: parents_spouse_details?.spouseMiddleName ? trimText(parents_spouse_details.spouseMiddleName) : "",
        spouseLastName: parents_spouse_details?.spouseLastName ? trimText(parents_spouse_details.spouseLastName) : "",
      },
      investmentDetail: {
        manufacturerId: selectedManufactureId,
        productName: productName,
        productId: productId,
        productType: productType ? productType : "",
        depositAmount: investment_details.depositAmount
          ? parseInt(investment_details.depositAmount)
          : "",
        tenure: investment_details.totalTenor
          ? parseInt(investment_details.totalTenor)
          : 0,
        payout: investment_details.payout ? investment_details.payout : "",
        payoutFrequency: investment_details.payout
          ? investment_details.payout
          : "",
        interestRate: investment_details.interestRate
          ? investment_details.interestRate
          : "",
        maturityInstruction: investment_details.maturityInstruction
          ? JSON.parse(investment_details.maturityInstruction)
          : "",
        maturityDate: investment_details.maturityDate
          ? investment_details.maturityDate
          : "",
        tenureDays: investment_details.tenureDays
          ? parseInt(investment_details.tenureDays)
          : 0,
        tenureMonths: investment_details.tenureMonths
          ? parseInt(investment_details.tenureMonths)
          : 0,
        tenureYears: investment_details.tenureYears
          ? parseInt(investment_details.tenureYears)
          : 0,
      },
      ckycDetail: {
        panNumber: ckycPersonalData ? ckycPersonalData.pan_number : "",
        permanenetAddress: ckycPidData ? permanentFullAddress : "",
        communationAddress:
          customer_address && communicationFullAddress
            ? communicationFullAddress
            : "",
      },
      personalDetail: {
        userId: loggedInUserID ? loggedInUserID : rmCustomerPersonalDetails ? rmCustomerPersonalDetails.customer_id : "",
        emailId: ckycPersonalData ? trimText(ckycPersonalData.Email) : "",
        mobileNumber: ckycPersonalData ? trimText(ckycPersonalData.MobileNumber) : "",
        userName: ckycPersonalData ? userFullName : "",
        residentStatus: taxResidencyDeclarationData
          ? trimText(taxResidencyDeclarationData.ResidentStatus)
          : "I am Indian Resident",
        maritalStatus: basic_details ? trimText(basic_details.MaritalStatus) : "",
      },
      professionalDetails: professionalDetails,
      ckycAPiResponse: getCkycDataFromLocalStorage,
      isPrepaymentEnabled: isPrepaymentEnabled,
      acceptAllTnc: selectedManufactureId?.toLowerCase() === "mmfsl" ? isTnCAcceptedByUser : false,
      lgLcCode: lgLcCode ? lgLcCode : "",
      // bankChequeBase64String: base64String ? base64String : "",
      // We are in discussion as how to send bankCancelledCheque as a separate api call or part of commitFD
    };
    return requestBody;
  }

  const getNomineeDetails = () => {
    const nomineeDetails = [];

    if (nominee_details?.length) {
      nominee_details.forEach(nominee => {
        const editedNominee = {}
        Object.keys(nomineeMapping).forEach((value) => {
          if (value.includes("date")) {
            editedNominee[nomineeMapping[value]] = dd_mm_yyyy_format(nominee[value]);
          } else if (value.toLowerCase().includes("sameaddress")) {
            editedNominee[nomineeMapping[value]] = JSON.stringify(nominee[value]);
          } else {
            editedNominee[nomineeMapping[value]] = nominee[value];
          }
        });
        if (selectedManufactureId?.toLowerCase() === "bajaj" || selectedManufactureId?.toLowerCase() === "shriram") {
          const nomineeNamePrint = sessionStorage.getItem("nomineeNamePrint")
          nomineeNamePrint && (editedNominee["nomineeNamePrint"] = JSON.parse(nomineeNamePrint));
        }
        nomineeDetails.push(editedNominee);
      })
    }

    return nomineeDetails;
  }

  const getFundingBankDetails = () => {
    const accountHolderName = sessionStorage.getItem("accountHolderName");
    const bankDetails = {
      accountHolderName: trimText(accountHolderName),
      accountType: bank_details?.accountType ? trimText(bank_details.accountType) : "",
      bankAccountNumber: bank_details?.accountNumber
        ? trimText(bank_details.accountNumber)
        : "",
      bankIfsc: bank_details?.ifscCode ? trimText(bank_details.ifscCode) : "",
      bankName: bank_details?.bankName ? trimText(bank_details.bankName) : "",
      branchAddress: bank_details?.branchAddress ? bank_details.branchAddress : "",
      branchName: bank_details?.branchName ? trimText(bank_details.branchName) : "",
      micrCode: bank_details?.micrCode ? bank_details.micrCode : "",
      pennyDropStatus: bank_details?.pennyDropStatus
        ? bank_details.pennyDropStatus
        : "",
      pennyDropStatusId: bank_details?.pennyDropStatusId
        ? bank_details.pennyDropStatusId
        : "",
      bankLogo: bank_details?.bankLogo ? bank_details.bankLogo : "", // bank logo is required for onboarding user after RM journey
      vpaId: bank_details?.vpaId ? bank_details.vpaId : "",
    }
    return bankDetails;
  }

  const getDeclarationDetails = () => {
    const details = {
      customerPep: declaration && declaration.pep ? JSON.stringify(declaration.pep) : "false",
      customerRelPep:
        declaration && declaration.relative_pep
          ? JSON.stringify(declaration.relative_pep)
          : "false",
      form15G15HAcceptance: investment_details?.form15G_15H ? JSON.stringify(investment_details.form15G_15H) : "false",
      taxDecl: "true",
      termsAcceptance: selectedManufactureId?.toLowerCase() === "mmfsl" ? JSON.stringify(isTnCAcceptedByUser) : "false", // Not sure about which terms
    }
    return details;
  }

  const getInvestmentDetails = () => {
    const maturityInstruction = investment_details?.maturityInstruction ? JSON.parse(investment_details.maturityInstruction) : "";
    const date = investment_details?.maturityDate ? dd_mm_yyyy_format(investment_details.maturityDate) : investment_details?.maturityDate;
    const applicationNumber = sessionStorage.getItem("applicationNumber") ? sessionStorage.getItem("applicationNumber") : uuidv4().replaceAll("-", "");

    const investmentDetails = {
      autoRenewal: maturityInstruction
        ? JSON.stringify(maturityInstruction.auto_renew_flag)
        : false, // according to maturity instruction need to change the flag
      depositAmount: investment_details?.depositAmount
        ? investment_details?.depositAmount
        : "",
      fdApplicationNumber: applicationNumber ? applicationNumber : "",
      interestRate: investment_details?.interestRate
        ? JSON.stringify(investment_details.interestRate)
        : "",
      manufacturerId: selectedManufactureId,
      maturityDate: date,
      maturityAmount: investment_details?.maturityAmount ? investment_details.maturityAmount : "",
      maturityInstruction: maturityInstruction
        ? maturityInstruction.maturity_instruction
        : "",
      payoutFrequency: investment_details?.payout
        ? investment_details.payout
        : "",
      productId: productId,
      productName: productName,
      productType: productType ? productType : "",
      tenure: investment_details?.tenure
        ? JSON.stringify(investment_details.tenure)
        : "0",
      displayTenure: investment_details?.displayTenure
        ? investment_details.displayTenure
        : "",
      tenureInDays: investment_details?.tenureInDays || ""
    }
    return investmentDetails;
  }

  const getCustomerAddressDetails = () => {
    const addressDetails = [];
    if (customer_address) {
      // const { permCity,
      //   permDist,
      //   permLine1,
      //   permLine2,
      //   permLine3,
      //   permPin,
      //   permState,
      //   permCountry
      // } = ckycPidData.personalDetails
      const addressDetails = [
        {
          corAddSameAsPer: customer_address ? JSON.stringify(customer_address.sameAddress) : "",
          customerAddress1: customer_address ? customer_address.permanent_address1 : "",
          customerAddress2: "",
          customerAddress3: "",
          customerAddressCity: customer_address ? customer_address.permanent_city : "",
          customerAddressCountry: customer_address ? customer_address.permanent_country : "",
          customerAddressDistrict: "",
          customerAddressPincode: customer_address ? customer_address.permanent_zip : "",
          customerAddressPreferred: "P",
          customerAddressState: customer_address ? customer_address.permanent_state : "",
          customerAddressType: "P",
          customerStayingSince: customer_address?.stayingSince ? dateFormat(customer_address?.stayingSince) : ""
        },
        {
          corAddSameAsPer: customer_address ? JSON.stringify(customer_address.sameAddress) : "",
          customerAddress1: customer_address ? customer_address.communication_address1 : "",
          customerAddress2: "",
          customerAddress3: "",
          customerAddressCity: customer_address ? customer_address.communication_city : "",
          customerAddressCountry: customer_address ? customer_address.communication_country : "",
          customerAddressDistrict: "",
          customerAddressPincode: customer_address ? customer_address.communication_zip : "",
          customerAddressPreferred: "P",
          customerAddressState: customer_address ? customer_address.communication_state : "",
          customerAddressType: "C",
          customerStayingSince: ""
        }
      ];
      return addressDetails;
    }
    return addressDetails;
  }

  const getCustomDeclaration = () => {
    const information = [];
    const dynamicDeclarationsFromSession = JSON.parse(sessionStorage.getItem("DeclarationDetails"));
    if (dynamicDeclarationsFromSession?.Declaration?.item) {
      Object.keys(dynamicDeclarationsFromSession?.Declaration?.item).forEach((itemId) => {
        if (declaration?.dynamic_declaration?.Declaration?.data && declaration.dynamic_declaration.Declaration.data.includes(dynamicDeclarationsFromSession.Declaration.item[itemId])) {
          information.push({
            custDeclId: itemId,
            custDeclText: dynamicDeclarationsFromSession.Declaration.item[itemId],
            custDeclResp: true
          })
        } else {
          information.push({
            custDeclId: itemId,
            custDeclText: dynamicDeclarationsFromSession.Declaration.item[itemId],
            custDeclResp: false
          })
        }
      });
    }
    return information.length ? information : [{
      custDeclId: "",
      custDeclText: "",
      custDeclResp: ""
    }]
  }

  const getParentSpouseDetails = () => {
    let parentDetails = {
      "fatherTitle": "",
      "fatherFirstName": "",
      "fatherMiddleName": "",
      "fatherLastName": "",
      "motherTitle": "",
      "motherFirstName": "",
      "motherMiddleName": "",
      "motherLastName": "",
    }
    if (parents_spouse_details && Object.keys(parents_spouse_details).length) {
      const { fatherFirstName, fatherMiddleName, fatherLastName,
        motherFirstName, motherMiddleName, motherLastName,
        spouseFirstName, spouseMiddleName, spouseLastName } = parents_spouse_details;

      const details = {
        fatherTitle: "",
        fatherFirstName: fatherFirstName ? trimText(fatherFirstName) : "",
        fatherMiddleName: fatherMiddleName ? trimText(fatherMiddleName) : "",
        fatherLastName: fatherLastName ? trimText(fatherLastName) : "",
        motherTitle: "",
        motherFirstName: motherFirstName ? trimText(motherFirstName) : "",
        motherMiddleName: motherMiddleName ? trimText(motherMiddleName) : "",
        motherLastName: motherLastName ? trimText(motherLastName) : "",
        spouseFirstName: spouseFirstName ? trimText(spouseFirstName) : "",
        spouseMiddleName: spouseMiddleName ? trimText(spouseMiddleName) : "",
        spouseLastName: spouseLastName ? trimText(spouseLastName) : "",
      }

      if (ckycPidData?.personalDetails) {
        const { fatherPrefix, motherPrefix } = ckycPidData?.personalDetails;
        details.fatherTitle = fatherPrefix ? fatherPrefix : "";
        details.motherTitle = motherPrefix ? motherPrefix : ""
      }
      parentDetails = { ...details };
    }
    return parentDetails;
  }

  const getPidDetails = () => {
    const userInfo = sessionStorage.getItem("userInfo");
    const selectedPan = sessionStorage.getItem("selectedPan");
    const rmCustomerData = sessionStorage.getItem("rm_customer_data");
    let panNumber = "";
    if (userInfo) {
      if (selectedPan) {
        panNumber = selectedPan;
      } else {
        const { pan_number } = JSON.parse(userInfo);
        panNumber = pan_number;
      }
    } else {
      const { pan_number } = JSON.parse(rmCustomerData);
      panNumber = pan_number;
    }

    const pidDetails = {
      customerIdType: 'pan',
      customerIdDetails: panNumber,
    }
    return pidDetails;
  }

  // V2
  const getNewRequestBody = () => {
    let isPrepaymentEnabled = appConfig?.deploy?.commitFDFlow.hasOwnProperty(
      selectedManufactureId
    ) && appConfig?.deploy?.commitFDFlow[selectedManufactureId]["payment"].toLowerCase() == "prepayment";

    const { lgLcCode, issuerDedupeResId, existingRelCustRef, existingIssuerRelationshipDtls } = sessionStorage;
    let uidNumber = "";
    let custRef = existingRelCustRef ? JSON.parse(existingRelCustRef) : [];

    if (custRef?.length) {
      const uidRefArr = custRef.filter((val) => val.existingRelIdType.toLowerCase().includes("uid number"));
      uidRefArr.length && (uidNumber = uidRefArr[0].existingRelId);
    }

    if (["SIB", "SSFB", "USFB"].includes(selectedManufactureId.toUpperCase())) {
      custRef = custRef.filter(reference =>
        reference.existingRelIdType !== "UID Number"
      );
    }

    const issuerRelationshipDtls = existingIssuerRelationshipDtls
      ? JSON.parse(existingIssuerRelationshipDtls) : [];

    const requestBody = {
      uidNumber,
      customDeclaration: getCustomDeclaration(),
      customerAddress: getCustomerAddressDetails(),
      customerInformation: getCustomerInformation(),
      customerPidDetails: getPidDetails(),
      declarationDetails: getDeclarationDetails(),
      existingRelCustRef: custRef || [],
      existingIssuerRelationshipDtls: issuerRelationshipDtls ?? [],
      fundingBankDetails: getFundingBankDetails(),
      investmentDetail: getInvestmentDetails(),
      issuerDedupeResId: issuerDedupeResId || "",
      lgLcCode: lgLcCode || "",
      nomineeDetails: getNomineeDetails(),
      parentsSpouseDetail: getParentSpouseDetails(),
      paymentDetails: {
        isPrepaymentEnabled: isPrepaymentEnabled ? JSON.stringify(isPrepaymentEnabled) : "false",
        paymentId: "", // Initially we don't have paymentId
        paymentRefNo: "", // Initially we don't have paymentRefNo
        paymentmode: selectedPaymentMethod ? selectedPaymentMethod : null
      },

      // bankChequeBase64String: base64String ? base64String : "",
      // We are in discussion as how to send bankCancelledCheque as a separate api call or part of commitFD
    };

    return requestBody;
  }

  async function commitUserFD() {
    //If status API returns verified, allow user to do commit FD
    // Temporary hardcoded the URL
    const url = new URL(window.location.href);
    const hasVkycJourney = url.searchParams.has('vkycJourney');
    let custRef = "";
    let uidNumber = "";
    if (sessionStorage.getItem("existingRelCustRef")) {
      custRef = JSON.parse(sessionStorage.getItem("existingRelCustRef"))
    }
    if (custRef?.length) {
      const uidRefArr = custRef.filter((val) => val.existingRelIdType.toLowerCase().includes("cif"));
      uidRefArr.length && (uidNumber = uidRefArr[0].existingRelId);
    }
    if (selectedManufactureId === "UNITY" && !uidNumber && !hasVkycJourney) {
      const [url, requestBody] = diyUserVKYCPayload();
      if (url) {
        PostApiHandler(url, "POST", requestBody)
          .then((response) => {
            const { data, message } = response;
            if (response?.data?.errors?.length) {
              const { errorMessage } = response.data.errors[0];
              setisLoading(false);
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
      }

    }
    else {
      let url = appConfig?.deploy?.baseUrl + appConfig?.deploy?.commitFd;
      if (url.includes("v1")) {
        url = url.replace("v1", "v2");
      }
      const requestBody = getNewRequestBody()
      setShowProgressPopup(true);
      setTitleMsg(AFTER_REVIEW.pleaseWait);
      setBodyMsg1(COMMON.WeAreProcessingYourRequestPleaseWaitForAMoment);
      //if not completed then start polling else call commit fd below code
      PostApiHandler(url, "POST", requestBody)
        .then((response) => {
          const { data, message } = response;
          if (message) {
            setApiErrorMessage(translate(COMMON.WeCouldNotProcessTheRequestAtTheMomentPleaseRetry));
            setShowProgressPopup(false);
            setShowModal(true);
            setisLoading(false);
          } else if (data?.errors?.length > 0) {
            const { errors } = data;
            setShowProgressPopup(false);
            setShowModal(true);
            setApiErrorMessage(errors ? errors[0].errorMessage : data.errors[0]);
            setisLoading(false);
            errorDetails = "";
          } else if (data?.data) {
            // if (data?.data?.prePaymentURL) {
            //   setPrePaymentData({
            //     message: data?.data?.prePaymentURL?.message
            //       ? data?.data?.prePaymentURL?.message : "",
            //     signature: data?.data?.prePaymentURL?.signature ?
            //       data?.data?.prePaymentURL?.signature : "",
            //     paymentURL: data?.data?.prePaymentURL?.paymentFormUrl ?
            //       data?.data?.prePaymentURL?.paymentFormUrl : ""
            //   });
            //   if (requestBody.isPrepaymentEnabled) {
            //     new LocalStorageHandler().setLocalStoragePlainItem(
            //       "fdId",
            //       response.data.data.fdId
            //     );
            //   }
            //   setShowProgressPopup(false);
            // } else
            if (data?.data?.requestId) {
              const startPollingTimer = Date.now();
              const { fdId, commit_fd_response } = data.data;
              setisLoading(true);
              let ApiResponse = response.data;
              json.afterReviewSubmit = ApiResponse;
              new LocalStorageHandler().setLocalStorage(
                productId,
                "afterReview",
                json,
                true
              );

              commitFDPolling(data?.data?.requestId, startPollingTimer, {
                fd_id: fdId,
                customer_id: commit_fd_response?.customer_id ? commit_fd_response.customer_id : ""
              });
            } else if (data?.data?.fdId) {
              const { fdId } = data.data;
              initiatePayment(fdId);
            }
          } else {
            setApiErrorMessage(translate(COMMON.WeCouldNotProcessTheRequestAtTheMomentPleaseRetry));
            setShowProgressPopup(false);
            setShowModal(true);
            setisLoading(false);
          }
        })
        .catch((err) => {
          setApiErrorMessage(translate(COMMON.WeCouldNotProcessTheRequestAtTheMomentPleaseRetry));
          setShowProgressPopup(false);
          setShowModal(true);
          setisLoading(false);
        });
    }
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
    const link = new URL(origin + pathname);
    link.searchParams.append('vkycJourney', 'true');
    const customerAddress = getVKYCAddressDetails();
    const customerInformation = getCustomerInformation();
    const fdId = sessionStorage.getItem("fdId");
    const investAmount = getInvestmentDetails();
    const requestBody = {
      fdId: fdId ? fdId : "",
      referenceId: uuidv4().replaceAll("-", ""),
      manufacturerCode: getValidData(selectedManufactureId),
      panNumber: getValidData(customerInformation.customerPan),
      dateOfBirth: getValidData(customerInformation.customerDob),
      customerName: getValidData(customerInformation.customerFullName),
      customerEmail: getValidData(customerInformation.customerEmailId),
      redirectUrl: getValidData(link.toString()),
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
        depositAmount: investAmount.depositAmount,

      },
    };
    return [url, requestBody];
  }
  useEffect(() => {
    const selectedUserId = sessionStorage.getItem("selectedUserId");

    if (selectedUserId) {
      const familyDetails = JSON.parse(sessionStorage.getItem("familyDetails"));
      if (familyDetails?.payload?.investorDetails) {
        const investorDetails = familyDetails.payload.investorDetails.find(details => details.userId === Number(selectedUserId));
        if (investorDetails) {
          if (!investorDetails.isFamilyHead) {
            setIsFamilyMember(true);
          } else {
            setIsFamilyMember(false);
          }
        }
      }
    }
  });

  useEffect(() => {
    if (pollingResponse) {
      handleRedirectionToReviewPage(pollingResponse);
    }
  }, [pollingResponse]);

  useEffect(() => {
    const { message, signature } = prePaymentData;
    if (message && signature) {
      submitBtnRef.current.click();
    }
  }, [prePaymentData]);

  useEffect(() => {
    //  scroll to top on page load
    window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
    getProductInfo();
    // startPolling();
  }, []);

  // async function startPolling() {
  //   let getTransactionIdFromLocalStorage = "";
  //   if (typeof window !== "undefined") {
  //     getTransactionIdFromLocalStorage = sessionStorage.getItem("transactionId");
  //   }
  //   let dataReturnedFromPolling = await callStatusVerifyAPI(
  //     getTransactionIdFromLocalStorage
  //   );
  //   if (dataReturnedFromPolling) {
  //     setReturnedStatusFromUtil(dataReturnedFromPolling);
  //     setCounter(counter + 1);
  //   } else {
  //     errorDetails = "Please retry again.";
  //     setApiErrorMessage("Something went wrong");
  //     setShowModal(true);
  //     setisLoading(false);
  //   }
  // }

  // useEffect(() => {
  // if (returnedStatusFromUtil) {
  //   //check condition of null/completed
  //   if (
  //     returnedStatusFromUtil[0] == "completed" &&
  //     returnedStatusFromUtil[1] == "active"
  //   ) {
  //     //completed active
  //     setBankVerificationStatus("Verified");
  //     if (isLoading) {
  //       setisLoading(false);
  //       submitFD();
  //     }
  //   } else if (returnedStatusFromUtil[1] == "invalid") {
  //     setBankVerificationStatus("Not Verified"); //completed && inactive
  //     isLoading && setisLoading(false);
  //   } else if (
  //     returnedStatusFromUtil[0] !== "completed" &&
  //     returnedStatusFromUtil[1] == "null" &&
  //     counter < appConfig.veriyStatusApiHitCount
  //   ) {
  //     //created null
  //     setBankVerificationStatus("Verification in Progress");
  //     startPolling(); //setimeout
  //   } else if (
  //     (returnedStatusFromUtil[0] !== "completed" ||
  //       returnedStatusFromUtil[0] !== "created") &&
  //     (returnedStatusFromUtil[1] !== "null" ||
  //       returnedStatusFromUtil[1] !== "active" ||
  //       returnedStatusFromUtil[1] !== "inactive") &&
  //     counter < appConfig.veriyStatusApiHitCount
  //   ) {
  //     //created null
  //     setBankVerificationStatus("Failed to Verify Bank Details");
  //   }
  //   if (counter == appConfig.veriyStatusApiHitCount) {
  //     isLoading && setisLoading(false);
  //   }
  // }
  // }, [returnedStatusFromUtil, counter]);

  return (

    <div>
      {isModalOpen && <PaymentMethodModal onClose={closeModal} onSelect={handlePaymentMethodSelect} />}
      <div className="block rounded-lg h-auto">
        <div className=" border-b-2 mb-4">
          <div className="grid grid-cols-4 w-full gap-5">
            <div className="col-span-4 sm:col-span-4  border-b-2 user_journey_container rounded-xl p-[20px] ">
              <div className="text-medium text-6xl  border-b-2 mb-3 text-black">
                {translate(BASIC_DETAILS.orderReview)}
              </div>
              <div className="flex flex-row justify-between mb-3 items-center">

                <div className="text-medium text-xxl text-black">
                  {productManufacturerId?.toLowerCase() === "unity" ? translate(SIDEBAR.personalDetails) : translate(BASIC_DETAILS.basicDetails)}
                </div>
                <div
                  className="flex flex-row gap-2 items-center justify-center text-bold text-2xl text-fd-primary hover:cursor-pointer border rounded-md btn-gradient p-2"
                  onClick={(e) => {
                    if (productManufacturerId.toLowerCase() === "unity") {
                      props.handle("customer_personal_details", e, customer_personal_details)

                    }
                    else {
                      props.handle("basic_details", e, basic_details)

                    }

                  }}
                >
                  <button type="button" class="btn btn-secondary" data-toggle="tooltip" data-placement="top" title="Edit Basic Details">
                    <FaRegEdit fill="#ffff" width={'10px'} />
                  </button>
                  {/* {translate(FD_RENEWAL.edit)} */}
                </div>
              </div>
              <div className={` flex w-full ${review_invest_css.investment_div_width}`}>
                <div className="flex items-center flex-wrap gap-3 w-full lg:flex-nowrap">
                  <div className="flex gap-5 items-center w-full">
                    <div className="flex text-medium items-center  text-black text-3xl border-2 border-black rounded-full h-[60px] w-[60px] justify-center items-center">
                      {ckycPersonalData
                        ? ckycPersonalData.FirstName
                          ? ckycPersonalData.FirstName.substring(0, 1) +
                          ckycPersonalData.LastName.substring(0, 1)
                          : null
                        : rmCustomerPersonalDetails
                          ? rmCustomerPersonalDetails.first_name.substring(0, 1) +
                          rmCustomerPersonalDetails.last_name.substring(0, 1)
                          : null}
                    </div>
                    <div className="flex flex-col">
                      <div className="text-regular text-2xl text-subcontent">
                        {translate(FD_RENEWAL.nameAsPerPan)}
                      </div>
                      <div className="text-medium text-black text-xxl">

                        <div className="text-medium text-3xl text-black">
                          {ckycPersonalData
                            ? userFullName
                            : rmCustomerPersonalDetails
                              ? rmCustomerPersonalDetails.userFullName
                              : ""}
                        </div>
                      </div>
                    </div>

                  </div>
                  <div
                    className={`${review_invest_css.basic_detail_status_position} flex text-regular justify-between  sm:jjustify-around text-2xl gap-1 text-light-gray w-full`}
                  >
                    {role.toLowerCase() === "user" &&
                      <div className="flex flex-col ">
                        <div className="text-subcontent" >{translate(FD_RENEWAL.residentStatus)}</div>
                        <div className="text-black">
                          {taxResidencyDeclarationData
                            ? taxResidencyDeclarationData.ResidentStatus
                            : "Indian"}
                        </div>
                      </div>
                    }
                    <div className="flex flex-col ">
                      <div className="text-subcontent">{translate(FD_RENEWAL.maritalStatus)}</div>
                      <div className="text-black">
                        {basic_details ? basic_details.MaritalStatus : ""}
                      </div>
                    </div>
                  </div>
                  {
                    basic_details?.placeOfBirth &&
                    <div
                      className={`${review_invest_css.basic_detail_status_position} my-5 text-regular text-2xl text-light-gray w-full`}
                    >
                      <div className="flex flex-col ">
                        <div className="text-subcontent">{translate(BASIC_DETAILS.placeOfBirth)}</div>
                        <div className="text-black">
                          {basic_details?.placeOfBirth ? basic_details.placeOfBirth : ""}
                        </div>
                      </div>
                    </div>
                  }
                  {role.toLowerCase() === "user" ? <div className="w-full">

                    <div className={`${review_invest_css.investment_div_width}`}>
                      <div className="text-regular text-2xl text-light-gray">
                        <div
                          className={`flex gap-3 justify-between  sm:justify-around ${review_invest_css.basic_detail_status_position}`}
                        >
                          <div className="flex flex-col ">
                            <div className="text-subcontent">{translate(AGENT.phone)}</div>
                            <div className="text-black ">
                              {ckycPersonalData?.MobileNumber ? ckycPersonalData.MobileNumber : "-"}
                            </div>
                          </div>
                          <div className="flex flex-col ">
                            <div className="text-subcontent">{translate(AGENT.email)}</div>
                            <div className="text-black break-all">
                              {ckycPersonalData?.Email ? ckycPersonalData?.Email : "-"}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div> : null}
                </div>
              </div>
            </div>

          </div>
          <div className="grid grid-cols-4  gap-5 mt-5">

            {professional_details && Object.keys(professional_details).length ? (
              <div className="col-span-4 sm:col-span-2 " >
                <ProfessionalDetails
                  handleProfessionalDetailsEdit={(e) =>
                    props.handle("professional_details", e, professional_details)
                  }
                  professionalDetails={{
                    Occupation: professional_details?.Occupation?.data ? professional_details.Occupation.data : "",
                    Income: professional_details?.["Annual Income"]?.data ? professional_details?.["Annual Income"].data : "",
                    SourceOfWealth: professional_details?.["Source of Wealth"]?.data ? professional_details?.["Source of Wealth"].data : ""
                  }}
                  allowEdit={true}
                />
              </div>
            ) : null}



            {!isFamilyMember &&
              <>
                {role.toLowerCase() === "user" && selectedManufactureId?.toLowerCase() !== "unity" ?

                  <div className="col-span-4 sm:col-span-2">
                    <AddressDetails
                      handleAddressDetailsEdit={(e) =>
                        props.handle("customer_address", e, customer_address)
                      }
                      address_details={
                        customer_address
                          ? {
                            permanentAddress: customer_address && permanentFullAddress
                              ? permanentFullAddress
                              : "",
                            communicationAddress:
                              customer_address && communicationFullAddress
                                ? communicationFullAddress
                                : "",
                          }
                          : {}
                      }
                      allowEdit={true}
                    />
                  </div> : null}
              </>
            }



            {
              selectedManufactureId?.toLowerCase() !== "unity" ?
                <div className="col-span-4 sm:col-span-2">
                  <div className="flex flex-col border-b-2 user_journey_container rounded-xl p-[20px] h-[100%]">
                    <div className="flex flex-row justify-between mb-3 items-center">
                      <div className="text-medium text-black text-xxl">
                        {translate(PARENT_DETAILS_PAYMENT.parentSpouseDetails)}
                      </div>
                      <div
                        className="flex flex-row gap-2 items-center justify-center text-bold text-2xl text-fd-primary hover:cursor-pointer border rounded-md btn-gradient p-2"
                        onClick={(e) =>
                          props.handle(
                            "parents_spouse_details",
                            e,
                            ckycParentSpouseData
                          )
                        }
                      >
                        <button type="button" class="btn btn-secondary" data-toggle="tooltip" data-placement="top" title="Edit Parent & Spouse Details">
                          <FaRegEdit fill="#ffff" width={'10px'} />
                        </button>
                        {/* {translate(FD_RENEWAL.edit)} */}
                      </div>
                    </div>
                    <div className={`${review_invest_css.investment_div_width}`}>
                      <div className="text-regular text-2xl text-light-gray">
                        <div
                          className={`flex gap-5 ${review_invest_css.basic_detail_status_position}`}
                        >
                          <div className="flex flex-col w-full">
                            <div className="text-subcontent">{translate(PARENT_DETAILS_PAYMENT.fathersName)}</div>
                            <div className="text-black capitalize">
                              {trimText(getTrimmedParentDetails().fatherName)
                                ? trimText(getTrimmedParentDetails().fatherName).toLowerCase()
                                : "-"}
                            </div>
                          </div>
                          <div className="flex flex-col w-full">
                            <div className="text-subcontent">{translate(PARENT_DETAILS_PAYMENT.mothersName)}</div>
                            <div className="text-black capitalize">
                              {trimText(getTrimmedParentDetails().motherName)
                                ? trimText(getTrimmedParentDetails().motherName).toLowerCase()
                                : "-"}
                            </div>
                          </div>
                        </div>
                        {
                          parents_spouse_details?.spouseFirstName !== "" && basic_details?.MaritalStatus !== "Unmarried" ? <div className="flex flex-col">
                            <div className="text-subcontent">{translate(COMMON_CONSTANTS.SpouseName)}</div>
                            <div className="mb-5 capitalize text-black">
                              {parents_spouse_details &&
                                (parents_spouse_details.spouseFirstName ||
                                  parents_spouse_details.spouseMiddleName ||
                                  parents_spouse_details.spouseLastName)
                                ? [
                                  parents_spouse_details.spouseFirstName,
                                  parents_spouse_details.spouseMiddleName,
                                  parents_spouse_details.spouseLastName,
                                ]
                                  .filter(Boolean)
                                  .join(" ")
                                  .toLowerCase()
                                : "-"}
                            </div>
                          </div> : null
                        }
                      </div>
                    </div>
                  </div>
                </div>
                : null
            }


            <div className="col-span-4 sm:col-span-2">
              <NomineeDetails
                handleNomineeDetailsEdit={(e) =>
                  props.handle("add_nominee", e, nominee_details)
                }
                nominee_details={
                  nominee_details && Object.keys(nominee_details).length
                    ? nominee_details
                    : []
                }
                allowEdit={true}
              />
            </div>
            <div className="col-span-4">
              <DeclarationDetails
                handleDeclarationEdit={(e) =>
                  props.handle("declaration", e, declaration)
                }
                declaration={
                  declaration && Object.keys(declaration).length ? declaration : {}
                }
                shouldShowForm15G={false}
                form15gInfo={investment_details?.form15g ? true : false}
                allowEdit={true}
              />
            </div>

            <div className="col-span-4">
              <InvestmentDetails
                handleInvestmentDetailsEdit={(e) =>
                  props.handle("investment_details", e, investment_details)
                }
                investment_details={
                  investment_details && Object.keys(investment_details).length
                    ? investment_details
                    : {}
                }
                allowEdit={true}
              />
            </div>
            <div className="col-span-4">
              <BankingDetails
                handleBankDetailsEdit={(e) =>
                  props.handle("bank_details", e, bank_details)
                }
                bankVerificationStatus={bankVerificationStatus}
                bank_details={
                  bank_details && Object.keys(bank_details).length
                    ? {
                      bankAccountNumber: bank_details.accountNumber,
                      bankIfsc: bank_details.ifscCode,
                      ...bank_details,
                    }
                    : {}
                }
                allowEdit={true}
              />
            </div>

            {selectedManufactureId?.toLowerCase() === "mmfsl" &&
              role.toLowerCase() === "user" && (
                <div className="col-span-4">
                  <TermsConditions
                    isTermsConditionsAccepted={setIsTnCAcceptedByUser}
                  />
                </div>
              )}

          </div>









          {selectedManufactureId?.toUpperCase() === "PNBHFC" &&
            role.toLowerCase() === "user" && (
              termsConditions && <PNBTermsConditions
                isTermsConditionsAccepted={setIsTnCAcceptedByUser}
                termsConditions={termsConditions}
              />
            )
          }
          {role.toLowerCase() === "user" && tncURL && (
            <div
              className="mb-3 flex text-regular text-xl text-light-gray items-start gap-3"
            >
              <div className="pt-0.5">
                <input
                  type="checkbox"
                  className="accent-primary-green h-3 w-3  hover:cursor-pointer"
                  checked={isTnCAccepted}
                  onChange={() => setIsTnCAccepted(!isTnCAccepted)}
                  value={isTnCAccepted}
                />
              </div>
              <p className="text-light-gray"> {translate(PARENT_DETAILS_PAYMENT.iHerebyAcceptAcknowledge)} <a href={tncURL} className="text-fd-primary underline" target="__blank">{translate(PARENT_DETAILS_PAYMENT.termsConditions)}</a>.<span className="text-light-red">*</span></p>
            </div>
          )}
          <div className="flex flex-row space-x-5 py-5">
            <ErrorModal
              canShow={showModal}
              updateModalState={toggleModal}
              errorMessage={apiErrorMessage}
              errorDetails={errorDetails}
            />
            <button
              class="block button-passive border-fd-primary text-fd-primary"
              onClick={(e) => props.handle(props.prevPage, e)}
            >
              {translate(ADDRESS_DETAILS.back)}
            </button>
            {!isLoading && isPrepaymentLinkGenerated ? null : !isLoading ? (
              <button
                className={(bankVerificationStatus.toLowerCase() !== "verified" ||
                  isLoading ||
                  (selectedManufactureId?.toLowerCase() === "mmfsl" &&
                    !isTnCAcceptedByUser && role === 'user') ||
                  (selectedManufactureId?.toUpperCase() === "PNBHFC" &&
                    !isTnCAcceptedByUser && role === 'user') ||
                  (tncURL && !isTnCAccepted && role === 'user')) ? "block button-active  button-transition hover:bg-hover-primary text-medium text-xl lg:text-2xl w-fit  " : "block button-active btn-gradient button-transition hover:bg-hover-primary text-medium text-xl lg:text-2xl w-fit  "}
                disabled={
                  bankVerificationStatus.toLowerCase() !== "verified" ||
                  isLoading ||
                  (selectedManufactureId?.toLowerCase() === "mmfsl" &&
                    !isTnCAcceptedByUser && role === 'user') ||
                  (selectedManufactureId?.toUpperCase() === "PNBHFC" &&
                    !isTnCAcceptedByUser && role === 'user') ||
                  (tncURL && !isTnCAccepted && role === 'user')
                }
                onClick={(e) => FDSubmit()}
              >
                {translate(KYC_DETAIL.submit)}
              </button>
            ) : (
              <button className="block button-active  button-transition hover:bg-hover-primary text-medium text-xl lg:text-2xl w-fit  " disabled={true}>
                {translate(KYC_DETAIL.submit)}
                {isLoading ? (
                  <svg
                    role="status"
                    class="inline ml-3 w-6 h-6 text-black animate-spin"
                    viewBox="0 0 100 101"
                    fill="black"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                      fill="#E5E7EB"
                    />
                    <path
                      d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                      fill="currentColor"
                    />
                  </svg>
                ) : null}
              </button>
            )}
          </div>
        </div>
      </div>
      <div className="hidden">
        {/* Form submit is required for bajaj Payment redirect*/}
        <form name="frm" action={prePaymentData.paymentURL} method="post">
          <input
            type="text"
            name="msg"
            id="paymentMsg"
            value={prePaymentData.message + "|" + prePaymentData.signature}
          />
          <button type="submit" value="Go" id="mySubmit" ref={submitBtnRef}>
            {translate(MAKE_PAYMENT_FDS.go)}
          </button>
        </form>
      </div>
      {
        showProgressPopup ? (
          <ProgressPopup
            title={titleMsg}
            message1={bodyMsg1}
            message2={bodyMsg2}
            note={REDIRECTION_MSG.msg}
          />
        ) : null
      }
    </div >
  );
}

export default ReviewAndInvest;

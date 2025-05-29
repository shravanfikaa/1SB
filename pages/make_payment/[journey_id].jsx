import "react-loading-skeleton/dist/skeleton.css";
import { dateFormat, getFullName, moveSessionItemsToLocalStorage,getCurrentDateTime } from "../../lib/util";
import { useEffect, useRef, useState } from "react";
import { GetApiHandler, PostApiHandler } from "../api/apihandler";
import appConfig from "../../app.config";
import { AFTER_REVIEW, COMMON, MAKE_PAYMENT_DECLARATION, MAKE_PAYMENT_FDS, PARENT_DETAILS_PAYMENT, REDIRECTION_MSG } from "../../constants";
import ErrorModal from "../common/errorPopup";
import { useRouter } from "next/router";
import Loader from "../../svg/Loader";
import { callStatusVerifyAPI } from "../../lib/bankUtils";
import BankingDetails from "../../_components/BankingDetails";
import DeclarationDetails from "../../_components/DeclarationDetails";
import NomineeDetails from "../../_components/NomineeDetails";
import AddressDetails from "../../_components/AddressDetails";
import BasicDetails from "../../_components/BasicDetails";
import ContactDetails from "../../_components/ContactDetails";
import ProfessionalDetails from "../../_components/ProfessionalDetails";
import EditDetails from "../../_components/EditDetails";
import InvestmentDetails from "../../_components/InvestmentDetails";
import ParentSpouseDetails from "../../_components/ParentSpouseDetails";
import NavBarMain from "../navbar/NavBarMain";
import ProgressPopup from "../review_invest/progress_popup";
import { LocalStorageHandler } from "../../lib/storage_handler";
import { useTranslation } from "react-i18next";
import { fetchProductDetails } from "../../utils/productDetails";
import PaymentMethodModal from "../common/paymentMethodModal.jsx";
function MakePayment() {
  const [bankVerificationStatus, setBankVerificationStatus] = useState(
    "Verified"
  );
  const { t: translate } = useTranslation();
  const [onboardingData, setOnboardingData] = useState({});
  const [showErrorMessage, setShowErrorMessage] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [counter, setCounter] = useState(0);
  const [agreementStatus, setAgreementStatus] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editComponentType, setEditComponentType] = useState("");
  const [requestPayload, setRequestPayload] = useState({});
  const [userBasicDetails, setUserBasicDetails] = useState({});
  const [addressDetails, setAddressDetails] = useState({
    permanentAddress: "",
    communicationAddress: "",
    stayingSince: ""
  });
  const [parentSpouseDetails, setParentSpouseDetails] = useState({
    fatherFirstName: "",
    fatherMiddleName: "",
    fatherLastName: "",
    motherFirstName: "",
    motherMiddleName: "",
    motherLastName: "",
    spouseFirstName: "",
    spouseMiddleName: "",
    spouseLastName: "",
    maritalStatus: ""
  });
  const [nomineeDetails, setNomineeDetails] = useState([]);
  const [investmentBankLogoUrl, setInvestmentBankLogoUrl] = useState("");
  const [professionalDetails, setProfessionalDetails] = useState({});
  const [editedCustomerAddress, setEditedCustomerAddress] = useState();
  const [declarationDetails, setDeclarationDetails] = useState({});
  const [customDeclaration, setCustomDeclaration] = useState([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showProgressPopup, setShowProgressPopup] = useState(false);
  const [titleMsg, setTitleMsg] = useState("");
  const [bodyMsg1, setBodyMsg1] = useState("");
  const [bodyMsg2, setBodyMsg2] = useState("");
  const [journeyID, setJourneyID] = useState("");
  const [editedInvestDetails, setEditedInvestmentDetails] = useState({});
  const [editedBankDetails, setEditedBankDetails] = useState({});
  const [prePaymentMessage, setPrePaymentMessage] = useState("");
  const [prePaymentSignature, setPrePaymentSignature] = useState("");
  const [manufacturerId, setManufactureId] = useState("");
  const [stayingSince, setStayingSince] = useState("");
  const [checkAddress, setCheckAddress] = useState(true);
  const [isTnCAccepted, setIsTnCAccepted] = useState(false);
  const [tncURL, setTnCUrl] = useState("");
  const [pollingResponse, setPollingResponse] = useState();
  const router = useRouter();
  const { journey_id } = router.query;
  const toggleModal = () => setShowModal((state) => !state);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(null);
    const closeModal = () => setIsModalOpen(false);

  const { ckycAPiResponse, customerInformation, fundingBankDetails } = onboardingData;

  const [errorDetails, setErrorDetails] = useState("");
  const [prePaymentData, setPrePaymentData] = useState({
    message: "",
    signature: "",
    paymentURL: "",
  });
  const submitBtnRef = useRef(null);

  const handlePaymentMethodSelect = (method) => {
    setSelectedPaymentMethod(method);
  };
  useEffect(()=>{
    if(selectedPaymentMethod){
      makePayment();
    }
  },[selectedPaymentMethod])

  let json = { afterReviewSubmit: {} };

  let selectedManufactureId = "";
  if (typeof window !== "undefined") {
    selectedManufactureId = sessionStorage.getItem("selectedManufactureId");
  }
  function initiatePayment(fdId) {
    sessionStorage.setItem("isOnboardingUser", true);
    let url = appConfig?.deploy?.baseUrl + appConfig?.deploy?.do_payment;
    if (url.includes("v1")) {
      url = url.replace("v1", "v2");
    }
    let requestBody = {
      fdId: fdId,
      journey_id: journeyID
    };
    setTitleMsg(translate(COMMON.ProcessingPaymentOperation));
    PostApiHandler(url, "POST", requestBody)
      .then((response) => {
        const { data, message } = response;
        if (message) {
          setShowProgressPopup(false);
          setShowModal(true);
          setErrorDetails(response.message);
          setIsLoading(false);
        } else if (data?.data) {
          setBodyMsg1(translate(COMMON.RedirectingToPaymentGateway));
          if (data?.errors && data.errors.length > 0) {
            setShowProgressPopup(false);
            setShowModal(true);
            data?.errors[0]?.errorMessage ? setErrorDetails(data.errors[0].errorMessage) : setErrorDetails("Application has been submitted successfully.");
            setIsLoading(false);
          } else {
            const { paymentUrl, additionalParams, referenceId } = data.data;
            if (paymentUrl === "") {
              setBodyMsg1("Payment request initiated. Kindly check your UPI app.");
              setIsLoading(true);
              startPaymentTimer(referenceId);
            } else if (
              paymentUrl.toLowerCase().includes("invalid") ||
              paymentUrl.toLowerCase().includes("error") || !paymentUrl.toLowerCase().includes("http")
            ) {
              setShowProgressPopup(false);
              setShowModal(true);
              setErrorDetails(paymentUrl);
              setIsLoading(false);
            } else {
              if (additionalParams?.redirectionMode === "url") {
                moveSessionItemsToLocalStorage();
                window.location.href = data.data.paymentUrl;
              }
            }
          }
        }
      })
      .catch((err) => {
        setBodyMsg1("ERROR: " + err);
      });
  }

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
    setIsLoading(false);
    setShowProgressPopup(false);
    clearTimeout(paymentTimer); // Stop the main 5-minute timer
    clearTimeout(retryTimer);   // Stop the retry timer if it's running
  }

  function handlePaymentRequest(paymentReferenceId, retryInterval) {
    const paymentPollingURL = appConfig?.deploy?.baseUrl + appConfig?.deploy?.paymentPolling;
    const requestBody = {
      "paymentReferenceId": paymentReferenceId ? paymentReferenceId : "",
      "phone": customerInformation?.customerContactNo ? customerInformation.customerContactNo : "",
      "vpaId": fundingBankDetails ? fundingBankDetails?.vpaId : ""
    }

    PostApiHandler(paymentPollingURL, "POST", requestBody)
      .then((response) => {
        const { message } = response;
        if (message) {
          setShowProgressPopup(false);
          setIsLoading(false);
          setShowModal(true);
          if (response?.data?.errors?.length) {
            const { errorMessage } = response.data.errors[0];
            errorMessage
              ? setErrorDetails(errorMessage)
              : setErrorDetails(translate(AFTER_REVIEW.somethingWentWrong));
          } else {
            setErrorDetails(message);
          }
        } else if (response?.data?.errors?.length) {
          retryTimer = setTimeout(() => handlePaymentRequest(paymentReferenceId, retryInterval), retryInterval);
        } else if (response?.data?.data && Object.keys(response?.data?.data).length) {
          const { status } = response.data.data;
          if (status?.toLowerCase() === "success") {
            setIsLoading(false);
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

  const handleUpdateAddressDetails = (stayingSince, checkAddr) => {
    setStayingSince(stayingSince);
    setCheckAddress(checkAddr);
    updateAddressDetails(stayingSince);
  }

  const updateAddressDetails = (stayingSince) => {
    const { customerAddress } = onboardingData;

    if (customerAddress?.length) {
      const customerAddressDetails = [...customerAddress];
      customerAddressDetails.forEach((address) => {
        if (address?.customerAddressType === "P") {
          address.customerStayingSince = stayingSince ? dateFormat(stayingSince) : ""
        }
      })
      setRequestPayload({ customerAddress: customerAddressDetails });
    }
  }

  const commitFDPolling = (requestId, startPollingTimer, requestBody) => {
    const url =
      appConfig?.deploy?.baseUrl +
      appConfig?.deploy?.agentCommitFD +
      `/${requestId}`;

    let timeout;

    PostApiHandler(url, "POST", requestBody)
      .then((response) => {
        const { data, message } = response;
        if (message) {
          setErrorDetails(translate(COMMON.WeCouldNotProcessTheRequestAtTheMomentPleaseRetry));
          setShowProgressPopup(false);
          setShowModal(true);
          setIsLoading(false);
        } else if (data?.data && Object.keys(data?.data).length) {
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
                  "APPL_No: " +
                  customerReferenceId[applicationNum].customerRelId +
                  " CP_Trans_Ref_No: " +
                  customerReferenceId[referenceNum].customerRelId
                );
              }
            }
            initiatePayment(requestBody.fd_id);
          }
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
            setErrorDetails(errors ? errors[0].errorMessage : errors[0]);
            setIsLoading(false);
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
            setErrorDetails(translate(COMMON.WeCouldNotProcessTheRequestAtTheMomentPleaseRetry));
            setShowProgressPopup(false);
            setShowModal(true);
            setIsLoading(false);
          }
        }
      })
      .catch((err) => {
        setErrorDetails(translate(COMMON.WeCouldNotProcessTheRequestAtTheMomentPleaseRetry));
        setShowProgressPopup(false);
        setShowModal(true);
        setIsLoading(false);
      });
  };

  async function makePayment() {
    //If status API returns verified, allow user to do commit FD
    let url =
      appConfig?.deploy?.baseUrl +
      appConfig?.deploy?.onboardingUserMakePayment;
    if (url.includes("v1")) {
      url = url.replace("v1", "v2");
    }
    const requestBody = {
      journeyId: journeyID,
      paymentmode: selectedPaymentMethod
    };

    setShowProgressPopup(true);
    setTitleMsg(translate(AFTER_REVIEW.pleaseWait));
    setBodyMsg1(translate(COMMON.WeAreProcessingYourRequestPleaseWaitForAMoment));
    //if not completed then start polling else call commit fd below code
    PostApiHandler(url, "POST", requestBody)
      .then((response) => {
        const { data, message } = response;
        if (message) {
          if (response.response?.data?.errors?.length) {
            const { errorMessage } = response.response.data.errors[0];
            errorMessage && setErrorDetails(errorMessage);
          }
          setShowErrorMessage(message);
          setShowProgressPopup(false);
          setShowModal(true);
          setIsLoading(false);
        } else if (data?.errors?.length > 0) {
          const { errors } = data;
          setShowProgressPopup(false);
          setShowModal(true);
          setShowErrorMessage(errors ? errors[0].errorMessage : data.errors[0]);
          setIsLoading(false);
          setErrorDetails("");
        } else if (Object.keys(data?.data).length) {
          if (data?.data?.requestId) {
            const startPollingTimer = Date.now();
            const { fdId, commit_fd_response } = data.data;
            setIsLoading(true);
            let ApiResponse = response.data;
            json.afterReviewSubmit = ApiResponse;
            const productId = sessionStorage.getItem("productId");
            new LocalStorageHandler().setLocalStorage(
              productId,
              "afterReview",
              json,
              true
            );

            commitFDPolling(data?.data?.requestId, startPollingTimer, {
              fd_id: fdId,
              customer_id: commit_fd_response?.customer_id ? commit_fd_response.customer_id : "",
              journey_id: journeyID
            });
          } else if (data?.data?.fdId) {
            const { fdId } = data.data;
            initiatePayment(fdId);
          }
        }
      })
      .catch((err) => {
        setBodyMsg1("ERROR: " + err);
      });
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
  useEffect(() => {
    if (pollingResponse) {
      handleRedirectionToReviewPage(pollingResponse);
    }
  }, [pollingResponse]);

  useEffect(() => {
  }, [addressDetails])

  const getOnboardingJourneyDetails = () => {
    const onboardingUrl =
      appConfig?.deploy?.baseUrl +
      appConfig?.deploy?.onboarding +
      journeyID;

    GetApiHandler(onboardingUrl, "GET")
      .then((response) => {
        if (response?.response?.data?.errors) {
          const { errorMessage } = response?.response?.data?.errors[0];
          setShowErrorMessage(errorMessage);
          toggleModal();
        }
        if (response?.data?.data?.payload) {
          setOnboardingData(response.data.data.payload);
          const { customDeclaration } = response.data.data.payload;

          // response.data.data.payload.declarationDetails?.dynamicDeclaration && setDeclarationDetails({
          //   dynamic_declaration:
          //     response.data.data.payload.declarationDetails.dynamicDeclaration,
          // });
          customDeclaration && setCustomDeclaration(customDeclaration);
          response.data.data.payload.declarationDetails && setDeclarationDetails({
            dynamic_declaration:
              response.data.data.payload.declarationDetails,
          });
          const { investmentDetail } = response.data.data.payload;
          if (investmentDetail) {
            const { productId, manufacturerId } = investmentDetail;

            if (manufacturerId) {
              sessionStorage.setItem("selectedManufactureId", manufacturerId);
              setManufactureId(manufacturerId);
            }

            productId && sessionStorage.setItem("selectedProductId", productId);
            productId &&
              sessionStorage.setItem(
                productId,
                JSON.stringify(response.data.data.payload)
              );
          }
        }
      })
      .catch((error) => console.error("-Onboarding Details-:", error));
  };

  const handleMakePaymentBtnClick = () => {
    if(selectedManufactureId==="BAJAJ"){
      if(editedInvestDetails.depositAmount<=100000){
        setIsModalOpen(true)
      }
      else{
        setSelectedPaymentMethod("Net Banking")
      }
    }
    else{
      makePayment();
    }
   
  };

  const handleAddressDetailsEdit = () => {
    setEditComponentType({
      componentName: "customer_address",
      data: editedCustomerAddress,
    });
  };

  const handleProfessionalDetailsEdit = () => {
    // Temporary commented the changes not allowing user to modify the details
    setEditComponentType({
      componentName: "professional_details",
      data: professionalDetails,
    });
  };

  const handleParentSpouseDetailsEdit = () => {
    setEditComponentType({
      componentName: "parents_spouse_details",
      data: parentSpouseDetails,
    });
  };

  const handleNomineeDetailsEdit = () => {
    setEditComponentType({
      componentName: "add_nominee",
      data: nomineeDetails ? nomineeDetails : {},
    });
  };

  const handleDeclarationEdit = () => {
    // Temporary commented the changes not allowing user to modify the details
    setEditComponentType({
      componentName: "declaration",
      data: customDeclaration ? customDeclaration : {},
    });
  };

  const handleBankDetailsEdit = () => {
    setEditComponentType({
      componentName: "bankDetails",
      data: editedBankDetails ? editedBankDetails : {},
    });
  };

  const handleInvestmentDetailsEdit = () => {
    setEditComponentType({
      componentName: "investmentDetails",
      data: editedInvestDetails ? editedInvestDetails : {},
    });
  };

  const addCustomerAddressDetails = (customerAddress) => {
    let fullPermanentAddress = "";
    let fullCommunicationAddress = "";
    let stayingSince = "";
    customerAddress.forEach((val) => {
      const { customerAddressType, customerAddress1, customerAddress2, customerAddress3,
        customerAddressPincode, customerAddressState,
        customerAddressCity, customerAddressCountry, customerAddressDistrict, customerStayingSince } = val;
      if (customerAddressType === "P") {
        fullPermanentAddress = [customerAddress1, customerAddress2, customerAddress3, customerAddressPincode,
          customerAddressState, customerAddressCity, customerAddressCountry].join(", ").replace(", , ,", ",").replace(", ,", ",");
        stayingSince = customerStayingSince;
      } else {
        fullCommunicationAddress = [customerAddress1, customerAddress2, customerAddress3, customerAddressPincode,
          customerAddressState, customerAddressCity, customerAddressCountry].join(", ").replace(", , ,", ",").replace(", ,", ",");
      }
    });

    return { fullPermanentAddress, fullCommunicationAddress, stayingSince }
  }

  const getAddress = () => {
    const { customerAddress } = onboardingData;
    if (customerAddress?.length) {
      const { fullPermanentAddress, fullCommunicationAddress, stayingSince } = addCustomerAddressDetails(customerAddress);
      setEditedCustomerAddress(customerAddress);
      setAddressDetails({
        permanentAddress: fullPermanentAddress,
        communicationAddress: fullCommunicationAddress,
        stayingSince: stayingSince
      });
    }
  };

  const getEditedAddressDetails = (customerAddress) => {
    if (customerAddress?.length) {
      const { fullPermanentAddress, fullCommunicationAddress, stayingSince } = addCustomerAddressDetails(customerAddress);
      setAddressDetails({
        permanentAddress: fullPermanentAddress,
        communicationAddress: fullCommunicationAddress,
        stayingSince: stayingSince
      });
    }
  };

  const getParentSpouseDetails = () => {
    if (onboardingData.parentsSpouseDetail) {
      setParentSpouseDetails(onboardingData.parentsSpouseDetail);
    }
  };

  const getProfessionalDetails = () => {
    const { customerInformation } = onboardingData;
    if (customerInformation) {
      const { customerOccupation, customerIncomeDtls } = customerInformation;
      if (customerOccupation && customerIncomeDtls) {
        setProfessionalDetails({
          Occupation: customerInformation.customerOccupation,
          Income: customerInformation.customerIncomeDtls
        });
      }
    }
  };

  const getNomineeDetails = () => {
    const { nomineeDetails } = onboardingData;
    setNomineeDetails(nomineeDetails);
  };

  const getInvestmentDetails = () => {
    const { investmentDetail } = onboardingData;
    if (
      investmentDetail &&
      userBasicDetails
    ) {
      const { customerFirstName, customerMiddleName, customerLastName } = userBasicDetails;
      const fullName = getFullName(customerFirstName, customerMiddleName, customerLastName);
      const title = "";
      setEditedInvestmentDetails({
        ...investmentDetail,
        userFullName: fullName,
        title: title,
      });
    }
  };

  const getBankDetails = () => {
    if (fundingBankDetails && customerInformation) {
      const { customerFirstName, customerMiddleName, customerLastName } = customerInformation;
      const fullName = getFullName(customerFirstName, customerMiddleName, customerLastName);
      setEditedBankDetails({
        ...fundingBankDetails,
        accountHolderName: fullName,
        depositAmount: editedInvestDetails?.depositAmount,
      });
    }
  };

  const updateBookFDDetails = () => {
    const updateBookFDUrl =
      appConfig?.deploy?.baseUrl + appConfig?.deploy?.updateBookFD;
    const userId = sessionStorage.getItem("userId")
      ? sessionStorage.getItem("userId")
      : "";

    const requestBody = {
      book_fd_payload: requestPayload,
      journey_id: journey_id,
      customer_id: parseInt(userId),
    };
    setIsLoading(true);
    PostApiHandler(updateBookFDUrl, "POST", requestBody)
      .then((response) => {
        if (response?.response?.data?.errors) {
          const { errorMessage } = response?.response?.data?.errors[0];
          setShowErrorMessage(errorMessage);
          toggleModal();
        }
        if (response?.data?.data?.payload) {
          setOnboardingData(response.data.data.payload);
        }
      })
      .catch((error) => console.error("-Update book FD-:", error))
      .finally(() => setIsLoading(false));
  };

  const getProductInfo = async () => {
    setIsLoading(true);
    const productManufacturerId = sessionStorage.getItem(
      "selectedManufactureId"
    );
    const productID = sessionStorage.getItem(
      "selectedProductId"
    );
    const response = await fetchProductDetails(productManufacturerId, "", productID);
    if (response) {
      if (response?.data?.errors?.length) {
        setShowModal(true);
        setShowErrorMessage(response?.data?.errors[0].errorMessage);
      } else if (response?.data?.data && Object.keys(response?.data?.data).length) {
        const { fd_details } = response.data.data;
        fd_details?.tncUrl && setTnCUrl(fd_details.tncUrl);
      }
      setIsLoading(false)
    }
  }

  const getDynamicFieldDetails = () => {
    const productManufacturerId = sessionStorage.getItem(
      "selectedManufactureId"
    );
    const url =
      appConfig?.deploy?.baseUrl +
      appConfig?.deploy?.applicationSetup +
      "?distributor_id=" +
      appConfig?.distributorId +
      "&manufacturer_id=" +
      productManufacturerId;

    setIsLoading(true);

    PostApiHandler(url, "GET")
      .then((response) => {
        if (response.data?.data) {
          const { dynamicFields } = response.data?.data;

          if (Object.keys(dynamicFields).length) {
            const { DeclarationDetails } = dynamicFields;
            sessionStorage.setItem(
              "DeclarationDetails",
              JSON.stringify(DeclarationDetails)
            );
          }
        } else if (response.data?.errors?.length) {
          setShowErrorMessage(response.data?.errors[0]);
        }
      })
      .catch((err) => {
        console.error("Error:", err);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const toggleEditModal = (data) => {
    if (data) {
      if (editComponentType.componentName === "customer_address") {
        data?.customer_address &&
          getEditedAddressDetails(data.customer_address);
      }
      if (editComponentType.componentName === "parents_spouse_details") {
        data?.parents_spouse_details &&
          setParentSpouseDetails(data.parentsSpouseDetail);
      }
      if (editComponentType.componentName === "add_nominee") {
        data?.nominee_details && setNomineeDetails(data.nominee_details);
      }
      if (editComponentType.componentName === "professional_details") {
        data?.professional_details &&
          setProfessionalDetails(data.professional_details);
      }

      if ("declaration" === editComponentType.componentName) {
        data?.declaration && setDeclarationDetails(data.declaration);
      }
      if ("investmentDetails" === editComponentType.componentName) {
        data?.investmentDetail &&
          getEditedInvestmentDetails(data.investmentDetail);
      }
      if ("bankDetails" === editComponentType.componentName) {
        if (data?.bankDetail) {
          getEditedBankDetails(data.bankDetail);
          setBankVerificationStatus(data.bankDetail.pennyDropStatus);
        }
      }
      if (editComponentType.componentName !== "declaration") {
        setRequestPayload(data);
      } else {
        data?.declaration &&
          setRequestPayload({
            declarationDetails: {
              pep: data.declaration.pep,
              rpep: data.declaration.relative_pep,
            },
          });
      }
      setEditComponentType("");
    }
    setShowEditModal((state) => !state);
  };

  const getEditedInvestmentDetails = (investmentDetails) => {
    if (investmentDetails) {
      setEditedInvestmentDetails({
        ...investmentDetails,
      });
    }
  };

  const getEditedBankDetails = (bankDetail) => {
    if (bankDetail && userBasicDetails && editedInvestDetails) {
      const { customerFirstName, customerMiddleName, customerLastName } = userBasicDetails;
      const fullName = getFullName(customerFirstName, customerMiddleName, customerLastName);
      setEditedBankDetails({
        ...bankDetail,
        accountHolderName: fullName,
        depositAmount: editedInvestDetails?.depositAmount,
      });
    }
  };

  const getLoginStatus = (status) => {
    setIsLoggedIn(status);
  };

  useEffect(() => {
    const productManufacturerId = sessionStorage.getItem(
      "selectedManufactureId"
    );
    if(productManufacturerId?.toLowerCase() === "usfb") {
      if(checkAddress === false) {
        setEditComponentType({
        componentName: "customer_address",
        data: editedCustomerAddress,
      });
      }
    }
  }, [checkAddress]);

  useEffect(() => {
    if (Object.keys(requestPayload).length) {
      updateBookFDDetails();
    }
  }, [requestPayload]);

  useEffect(() => {
    if (editComponentType) {
      toggleEditModal();
    }
  }, [editComponentType]);

  useEffect(() => {
    if (customerInformation) {
      setUserBasicDetails({ ...customerInformation });
    }

    if (Object.keys(onboardingData).length) {
      getParentSpouseDetails();
      getDynamicFieldDetails();
      getProductInfo();
      getInvestmentDetails();
      getBankDetails();
      getAddress();
      getParentSpouseDetails();
      getNomineeDetails();
      getProfessionalDetails();
    }
  }, [onboardingData]);


  useEffect(() => {
    if (editedInvestDetails) {
      delete editedBankDetails.depositAmount;
      setEditedBankDetails({
        ...editedBankDetails,
        depositAmount: editedInvestDetails.depositAmount,
      });
      setDeclarationDetails(declarationDetails);
    }
  }, [editedInvestDetails]);

  useEffect(() => {
    const baseURL = appConfig?.deploy["manufacturerLogoBaseUrl"];

    if (onboardingData.investmentDetail) {
      const bankLogo =
        onboardingData.investmentDetail &&
          onboardingData.investmentDetail.productName
          ? baseURL +
          onboardingData.investmentDetail.manufacturerId.toLowerCase() +
          ".png"
          : "";
      setInvestmentBankLogoUrl(bankLogo);
    }
  }, [onboardingData]);

  useEffect(() => {
    if (isLoggedIn) {
      getOnboardingJourneyDetails();
    }
  }, [isLoggedIn, journeyID]);

  useEffect(() => {
    const { message, signature } = prePaymentData;
    if (message && signature) {
      submitBtnRef.current.click();
    }
  }, [prePaymentData]);

  useEffect(() => {
    const status = sessionStorage.getItem("isLoggedIn");
    sessionStorage.setItem("isAssistedUser", true);
    const login = status ? JSON.parse(status).loggedIn : status;
    login && setIsLoggedIn(login);
    const { journey_id } = router.query;
    if (journey_id) {
      setJourneyID(journey_id);
    } else {
      const id = window.location.pathname.split("/")[2];
      setJourneyID(id);
    }
  }, []);

  return (
    <>
     {isModalOpen && <PaymentMethodModal onClose={closeModal} onSelect={handlePaymentMethodSelect}/>}
      <div>
        <NavBarMain shouldShowLogin={true} getLoginStatus={getLoginStatus} />
      </div>
      <div className="bg-slate-100 view-container view_container_sm flex justify-center">
        <div className=" mb-3 w-9/12">
          {customerInformation && editedInvestDetails ? (
            <div className="flex justify-between">
              <div className="flex gap-3 items-start">
                <div>
                  <img
                    src={investmentBankLogoUrl}
                    className="w-[122px] h-[42px]"
                    objectFit={"contain"}
                  ></img>
                </div>
                <div className="flex flex-col mb-5">
                  <div className={`flex flex-col`}>
                    <div className="text-medium text-black text-5xl">
                      {editedInvestDetails?.productName
                        ? translate(editedInvestDetails.productName)
                        : ""}
                    </div>
                    <div className="text-regular text-light-gray text-2xl flex-end">
                      {editedInvestDetails?.productType
                        ? translate(editedInvestDetails.productType)
                        : ""}
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex flex-col mb-5">
                <div className={`flex flex-col`}>
                  <div className="text-medium text-black text-5xl">
                    {userBasicDetails
                      ? userBasicDetails.customerFirstName
                        ? userBasicDetails.customerFirstName
                        : "" + " " + userBasicDetails.customerLastName
                          ? userBasicDetails.customerLastName
                          : ""
                      : ""}
                  </div>
                  <div className="text-regular text-light-gray text-2xl flex-end">
                    {userBasicDetails ? userBasicDetails.customerPan : ""}
                  </div>
                </div>
              </div>
            </div>
          ) : null}
          <div className="block px-6 py-6 rounded-lg h-auto bg-white">
            <BasicDetails
              userBasicDetails={userBasicDetails}
            />
            <ContactDetails
              contactDetails={
                userBasicDetails
                  ? {
                    mobileNum: userBasicDetails.customerContactNo,
                    email: userBasicDetails.customerEmailId,
                  }
                  : {
                    mobileNum: "",
                    email: "",
                  }
              }
            />
            <AddressDetails
              handleAddressDetailsEdit={handleAddressDetailsEdit}
              address_details={addressDetails}
              showStayingSince={manufacturerId.toLowerCase() === "usfb"}
              handleUpdateAddressDetails={handleUpdateAddressDetails}
              allowEdit={false}
            />
            <ParentSpouseDetails
              handleParentSpouseDetailsEdit={handleParentSpouseDetailsEdit}
              parentsSpouseDetail={
                parentSpouseDetails
                  ? {
                    ...parentSpouseDetails,
                    maritalStatus: ""
                  }
                  : {}
              }
              spouseDetails={parentSpouseDetails}
              allowEdit={false}
            />
            {Object.keys(professionalDetails).length ? (
              <ProfessionalDetails
                handleProfessionalDetailsEdit={handleProfessionalDetailsEdit}
                professionalDetails={professionalDetails}
                allowEdit={false}
              />
            ) : null}
            <NomineeDetails
              handleNomineeDetailsEdit={handleNomineeDetailsEdit}
              nominee_details={nomineeDetails}
              allowEdit={false}
            />
            <InvestmentDetails
              handleInvestmentDetailsEdit={handleInvestmentDetailsEdit}
              investment_details={editedInvestDetails}
              allowEdit={false}
            />
            <DeclarationDetails
              handleDeclarationEdit={handleDeclarationEdit}
              declaration={declarationDetails}
              // shouldShowForm15G={true}
              // form15gInfo={editedInvestDetails?.form15g}
              customDeclaration={customDeclaration}
              allowEdit={false}
            />
            <BankingDetails
              handleBankDetailsEdit={handleBankDetailsEdit}
              bankVerificationStatus={bankVerificationStatus}
              bank_details={editedBankDetails}
              allowEdit={false}
            />
            <div className="flex flex-col">
              <div className={`flex gap-3 text-regular text-2xl`}>
                <input
                  type="checkbox"
                  onChange={(e) => {
                    setAgreementStatus(e.target.checked);
                  }}
                  checked={agreementStatus}
                  value={agreementStatus}
                  name="agreementStatus"
                  className="accent-primary-green h-4 w-4 hover:cursor-pointer mt-1 text-black"
                />
                <div className="text-black">{translate(MAKE_PAYMENT_DECLARATION.agreementMsg)}</div>
              </div>
            </div>
            {tncURL && (
              <div className="flex flex-col">
                <div className={`flex gap-3 text-regular text-2xl`}>
                  <input
                    type="checkbox"
                    name="agreementStatus"
                    className="accent-primary-green h-4 w-4 hover:cursor-pointer mt-1 text-black"
                    checked={isTnCAccepted}
                    onChange={() => setIsTnCAccepted(!isTnCAccepted)}
                    value={isTnCAccepted}
                  />
                  <div className="text-black">{translate(PARENT_DETAILS_PAYMENT.iHerebyAcceptAcknowledge)} <a href={tncURL} className="text-fd-primary underline" target="__blank">{translate(PARENT_DETAILS_PAYMENT.termsConditions)}</a>.<span className="text-light-red">*</span></div>
                </div>
              </div>
            )}
            <div className="flex flex-row space-x-5 py-5 ">
              <button
                className={(!Object.keys(onboardingData).length ||
                  !agreementStatus ||
                  bankVerificationStatus !== "Verified" ||
                  (manufacturerId.toLowerCase() == "usfb" && !stayingSince || manufacturerId.toLowerCase() == "usfb" &&  !checkAddress) || (tncURL && !isTnCAccepted)
                ) ?  "block button-active  button-transition hover:bg-hover-primary text-medium text-xl lg:text-2xl w-fit   text-medium text-xl lg:text-2xl w-fit  hover:button-shadow flex justify-center gap-1" :  "block button-active btn-gradient button-transition hover:bg-hover-primary text-medium text-xl lg:text-2xl w-fit   text-medium text-xl lg:text-2xl w-fit  hover:button-shadow flex justify-center gap-1" }
                onClick={handleMakePaymentBtnClick}
                disabled={
                  !Object.keys(onboardingData).length ||
                  !agreementStatus ||
                  bankVerificationStatus !== "Verified" ||
                  (manufacturerId.toLowerCase() == "usfb" && !stayingSince || manufacturerId.toLowerCase() == "usfb" &&  !checkAddress) || (tncURL && !isTnCAccepted)
                }
              >
                Make Payment
                {isLoading ? <Loader /> : null}
              </button>
            </div>
          </div>
          <ErrorModal
            canShow={showModal}
            updateModalState={toggleModal}
            errorMessage={showErrorMessage}
            errorDetails={errorDetails}
          />
          {showEditModal ? (
            <EditDetails
              toggleEditModal={toggleEditModal}
              editComponentType={editComponentType}
            />
          ) : null}
          {showProgressPopup ? (
            <ProgressPopup
              title={titleMsg}
              message1={bodyMsg1}
              message2={bodyMsg2}
              note={REDIRECTION_MSG.msg}
            />
          ) : null}
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
    </>
  );
}

export default MakePayment;

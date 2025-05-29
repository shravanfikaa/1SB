import { FaRegEdit } from "react-icons/fa";
import "react-loading-skeleton/dist/skeleton.css";
import { dateFormat, fuzzyLogicCompare, getConcentText, getFullName, moveLocalStorageItemsToSession, moveSessionItemsToLocalStorage } from "../../lib/util";
import review_invest_css from "../../styles/review_invest_css.module.css";
import { useEffect, useState } from "react";
import { GetApiHandler, PostApiHandler } from "../api/apihandler";
import appConfig from "../../app.config";
import { AFTER_REVIEW, AGENT, BASIC_DETAILS, MY_PROFILE, ONBOARDING_PAGE, REDIRECTION_MSG } from "../../constants";
import ErrorModal from "../common/errorPopup";
import { useRouter } from "next/router";
import Loader from "../../svg/Loader";
import BankingDetails from "../../_components/BankingDetails";
import NavBarMain from "../navbar/NavBarMain";
import InvestmentDetails from "../../_components/InvestmentDetails";
import EditDetails from "../../_components/EditDetails";
import { validateCustomer } from "../../utils/validateCustomer";
import { mapValidateAadharRespToCKYC, mapValidateCustomerRespToCKYC } from "../../lib/ckycWrapper";
import { aadharVerification } from "../../utils/aadharVerification";
import { v4 as uuidv4 } from "uuid";
import { updateCommunicationDetails } from "../../utils/updateCommunicationDetails";
import ValidateOTPModal from "../kyc_personal_details/validateOTP";
import { validateAdharInformation } from "../../utils/validateAdharInformation";
import { useTranslation } from "react-i18next";  
function OnboardingPage() {
  const { t: translate } = useTranslation();
  const router = useRouter();
  const [bankVerificationStatus, setBankVerificationStatus] = useState(
    "Verified"
  );
  const [onboardingData, setOnboardingData] = useState({});
  const [showErrorMessage, setShowErrorMessage] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [declarationStatus, setDeclarationStatus] = useState(false);
  const [journeyID, setJourneyID] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editComponentType, setEditComponentType] = useState("");
  const [requestPayload, setRequestPayload] = useState({});
  const [editedInvestDetails, setEditedInvestmentDetails] = useState({});
  const [editedBankDetails, setEditedBankDetails] = useState({});
  const [userBasicDetails, setuserBasicDetails] = useState({});
  const [onboardingError, setOnboardingError] = useState(false);
  const { customerInformation, investmentDetail, fundingBankDetails } = onboardingData;
  const [applicationNumber, setApplicationNumber] = useState("");
  const [statusVerifyModal, setStatusVerifyModal] = useState({
    show: false,
    mobileOtpNumber: "",
    emailOtpNumber: ""
  });
  const [validateAadharData, setValidateAadharData] = useState();
  const [queryData, setQueryData] = useState();
  const [consentText, setConsentText] = useState("");

  const toggleModal = () => setShowModal((state) => !state);

  const toggleStatusVerifyModal = (state) => {
    setStatusVerifyModal(state);
  };

  useEffect(() => {
    if (validateAadharData && Object.keys(validateAadharData).length && Object.keys(onboardingData).length) {
      nonCkycResponseHandler();
    }
  }, [validateAadharData, onboardingData]);

  const getOnboardingJourneyDetails = () => {
    const journey_id = router.query.journey_id;
    const onboardingUrl =
      appConfig?.deploy?.baseUrl +
      appConfig?.deploy?.onboarding +
      journey_id;
    GetApiHandler(onboardingUrl, "GET")
      .then((response) => {
        if (response?.data?.errors?.length) {
          const { errorMessage } = response?.data?.errors[0];
          setOnboardingError(true);
          setShowErrorMessage(errorMessage);
          toggleModal();
        } else if (response?.data?.data?.payload) {
          setOnboardingData(response.data.data.payload);
        }
      })
      .catch((error) => console.error("-Onboarding Details-:", error));
  };

  const generateFDApplicationNum = () => {
    const fdApplicationNumber = uuidv4().replaceAll("-", "");
    setApplicationNumber(fdApplicationNumber);
    sessionStorage.setItem("applicationNumber", fdApplicationNumber);
  }

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

  const getInvestmentDetails = () => {
    const { investmentDetail } = onboardingData;
    const { customerInformation } = onboardingData;
    if (investmentDetail && customerInformation) {
      const { customerFirstName, customerMiddleName, customerLastName } = customerInformation;
      const fullName = getFullName(customerFirstName, customerMiddleName, customerLastName);
      sessionStorage.setItem("selectedManufactureId", investmentDetail.manufacturerId);
      const baseURL = appConfig?.deploy?.["manufacturerLogoBaseUrl"];

      const bankLogo =
        investmentDetail && investmentDetail.productName
          ? baseURL + investmentDetail.manufacturerId.toLowerCase() + ".png"
          : "";
      setEditedInvestmentDetails({
        ...investmentDetail,
        userFullName: fullName,
        investmentBankLogoUrl: bankLogo,
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
      journey_id: journeyID,
      customer_id: parseInt(userId),
    };
    setIsLoading(true);
    PostApiHandler(updateBookFDUrl, "POST", requestBody)
      .then((response) => {
        if (response?.response?.data?.errors) {
          const { errorMessage } = response?.response?.data?.errors[0];
          setShowErrorMessage(errorMessage);
          toggleModal();
          setIsLoading(false);
        }
        if (response?.data?.data?.payload) {
          setIsLoading(false);
          setOnboardingData(response.data.data.payload);
        }
      })
      .catch((error) => console.error("-Update book FD-:", error))
      .finally(() => setIsLoading(false));
  };

  const toggleEditModal = (data) => {
    if (data) {
      if ("investmentDetails" === editComponentType.componentName) {
        if (data?.investmentDetail) {
          getEditedInvestmentDetails(data.investmentDetail);
        }
      }
      if ("bankDetails" === editComponentType.componentName) {
        if (data?.fundingBankDetails) {
          getEditedBankDetails(data.fundingBankDetails);
          // setBankVerificationStatus(data.fundingBankDetails.pennyDropStatus);
        }
      }
      setRequestPayload(data);
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

  const getEditedBankDetails = (fundingBankDetails) => {
    if (fundingBankDetails && userBasicDetails && editedInvestDetails) {
      const { customerFirstName, customerMiddleName, customerLastName } = userBasicDetails;
      const fullName = getFullName(customerFirstName, customerMiddleName, customerLastName);
      setEditedBankDetails({
        ...fundingBankDetails,
        accountHolderName: fullName,
        depositAmount: editedInvestDetails?.depositAmount,
      });
    }
  };

  const initiateCKYC = () => {
    setIsLoading(true);
    const initiateCkycUrl =
      appConfig?.deploy?.baseUrl + appConfig?.deploy?.initiateCKYC;
    const userId = sessionStorage.getItem("userId")
      ? sessionStorage.getItem("userId")
      : "";
    const journey_id = router.query.journey_id;
    const { manufacturerId } = investmentDetail;

    const requestBody = {
      ckycConsent: declarationStatus,
      journey_id: journey_id,
      customer_id: parseInt(userId),
      manufacturerId: manufacturerId ? manufacturerId : "",
    };

    PostApiHandler(initiateCkycUrl, "POST", requestBody)
      .then((response) => {
        if (response?.data?.errors?.length) {
          const { errorMessage } = response?.data?.errors[0];
          setShowErrorMessage(errorMessage);
          toggleModal();
          setIsLoading(false);
        } else if (response?.data?.data) {
          router.push({
            pathname: "/make_payment/[journey_id]",
            query: {
              journey_id: response.data.data.journey_id,
            },
          });
        }
      })
      .catch((error) => console.error("-Initiate CKYC-:", error));
  };

  const aadharVerificationRespHandler = async () => {
    setIsLoading(true);
    const { customerContactNo } = customerInformation;
    const aadharVerificationURL = appConfig?.deploy?.baseUrl + appConfig?.deploy?.assistedAadharVerification;
    const applicationNum = applicationNumber ? applicationNumber : generateFDApplicationNum();

    const response = await aadharVerification(aadharVerificationURL, { mobileNumber: customerContactNo, journeyId: journeyID, customerId: onboardingData.userId }, applicationNum);

    if (response) {
      if (response?.data?.errors?.length) {
        const { errorMessage } = response.data.errors[0];
        setIsLoading(false);
        setShowErrorMessage(errorMessage);
        toggleModal();

      } else if (response?.data?.data && Object.keys(response?.data?.data).length) {
        const { aadharUrl } = response?.data?.data;
        moveSessionItemsToLocalStorage();
        window.location.href = aadharUrl;
      }
    }
  }

  const updateDetailsRespHandler = async (payload, shouldProceed = false) => {
    setIsLoading(true);
    const response = await updateCommunicationDetails(payload);
    if (response) {
      if (response?.data?.errors?.length) {
        const { errorMessage } = response.data.errors[0];
        setIsLoading(false);
        setShowErrorMessage(errorMessage);
        toggleModal();
      } else if (response?.data?.data && Object.keys(response?.data?.data).length) {
        shouldProceed && proceedToPaymentScreen();
      }
    }
  }

  const proceedToPaymentScreen = () => {
    const journey_id = router.query.journey_id;
    router.push({
      pathname: "/make_payment/[journey_id]",
      query: {
        journey_id: journey_id,
      },
    });
  }

  const verifyOnboardingData = (data) => {
    if (data?.customerInformation && onboardingData?.customerInformation) {
      const { customerContactNo: ckycContactNo, customerEmailId: ckycEmailId, customerPan: ckycPan } = data.customerInformation;
      const { customerContactNo: onboardingContactNo, customerEmailId: onboardingEmailId } = onboardingData.customerInformation;

      let compareEmail = 0;
      let compareContact = 0;

      if (onboardingEmailId && ckycEmailId) {
        compareEmail = fuzzyLogicCompare(onboardingEmailId, ckycEmailId);
      }

      if (onboardingContactNo && ckycContactNo) {
        compareContact = fuzzyLogicCompare(onboardingContactNo, ckycContactNo);
      }

      if (compareEmail >= 60 && compareContact >= 60) {
        proceedToPaymentScreen();
      } else {
        toggleStatusVerifyModal({ show: true, mobileOtpNumber: "", emailOtpNumber: "" });
        ckycContactNo && ckycEmailId && updateDetailsRespHandler({
          pan_number: ckycPan,
          mobile_number: ckycContactNo,
          email_id: ckycEmailId,
          detailsType: "primary"
        });
      }
    }
  }

  const customerResponseHandler = (data) => {
    const { kycMode } = data;
    if (!kycMode) {
      verifyOnboardingData(data);
    } else if (kycMode?.kycMode.toLowerCase() !== "ckyc") {
      aadharVerificationRespHandler();
    } else {
      verifyOnboardingData(data);
    }
  }

  const nonCkycResponseHandler = () => {
    if (validateAadharData?.customerInformation && onboardingData?.customerInformation) {
      const { customerContactNo: ckycContactNo, 
        customerFullName: ckycCustomerFullName, 
        customerFirstName: firstName, 
        customerLastName: lastName 
      } = validateAadharData.customerInformation;
      const { customerContactNo: onboardingContactNo, 
        customerFullName: onboardingCustomerFullName,
        customerFirstName, customerLastName 
      } = onboardingData.customerInformation;
      let compareName = "";
      if (ckycCustomerFullName && onboardingCustomerFullName) {
        compareName = fuzzyLogicCompare(ckycCustomerFullName.toLowerCase(), onboardingCustomerFullName.toLowerCase());
      } else if (firstName && lastName && customerFirstName && customerLastName) {
        const fName = firstName + lastName;
        const oFName = customerFirstName + customerLastName;
        compareName = fuzzyLogicCompare(fName.toLowerCase(), oFName.toLowerCase());
      } else if (firstName && customerFirstName) {
        compareName = fuzzyLogicCompare(firstName.toLowerCase(), customerFirstName.toLowerCase());
      } else if (lastName && customerLastName) {
        compareName = fuzzyLogicCompare(lastName.toLowerCase(), customerLastName.toLowerCase());
      }
      let compareContact = 0;

      if (onboardingContactNo && ckycContactNo) {
        compareContact = fuzzyLogicCompare(onboardingContactNo, ckycContactNo);
      }

      if (compareName >= 60 && compareContact >= 60) {
        proceedToPaymentScreen();
      } else {
        setIsLoading(false);
        setShowErrorMessage(translate(REDIRECTION_MSG.MismatchInAadharHolderAndInvestorDetails));
        setShowModal(true)
      }
    }
  }

  const validateCustomerRespHandler = async () => {
    setIsLoading(true);
    const selectedManufactureId = sessionStorage.getItem("selectedManufactureId");
    const { customerPan, customerDob } = userBasicDetails;
    const dob = typeof customerDob === "string" ? customerDob : customerDob;
    const userId = sessionStorage.getItem("userId")

    const response = await validateCustomer({ panNumber: customerPan, dateOfBirth: customerDob, journeyId: journeyID, customerId: userId });
    if (response) {
      if (response?.data?.errors?.length) {
        const { errorMessage } = response.data.errors[0];
        setIsLoading(false);
        setShowErrorMessage(errorMessage);
        toggleModal();
      } else if (response?.data?.data && Object.keys(response?.data?.data).length) {
        const { data } = response.data;
        const { screeningStatus, kycMode, existingIssuerRelationshipDtls, existingRelCustRef, issuerDedupeResId, fdApplicationNo } = data;
        if (fdApplicationNo) {
          setApplicationNumber(fdApplicationNo);
          sessionStorage.setItem("applicationNumber", fdApplicationNo);
        }

        issuerDedupeResId && sessionStorage.setItem("issuerDedupeResId", issuerDedupeResId);
        sessionStorage.setItem("validateCustomerInfo", JSON.stringify(data));
        kycMode && sessionStorage.setItem("kycMode", JSON.stringify(kycMode));
        issuerDedupeResId && sessionStorage.setItem("issuerDedupeResId", issuerDedupeResId);
        existingIssuerRelationshipDtls && sessionStorage.setItem("existingIssuerRelationshipDtls", JSON.stringify(existingIssuerRelationshipDtls));
        existingRelCustRef && sessionStorage.setItem("existingRelCustRef", JSON.stringify(existingRelCustRef));

        if (screeningStatus?.toLowerCase() === "match found") {
          setShowErrorMessage(PERSONAL_DETAILS.amlCheckErrorMsg);
          toggleModal();
        } else if (existingIssuerRelationshipDtls && existingIssuerRelationshipDtls?.fullKycReqd && selectedManufactureId.toLowerCase() === "ssfb") {
          aadharVerificationRespHandler();
        } else {
          customerResponseHandler(data);
        }
      }
    }
  }

  const validateAadharInfo = async (referenceId, data) => {
    setIsLoading(true);
    const validateAadharInfoURL = appConfig?.deploy?.baseUrl + appConfig?.deploy?.assistedValidateAadharInfo;
    const response = await validateAdharInformation(validateAadharInfoURL, referenceId, data, { journeyId: journeyID, customerId: onboardingData.userId });
    const selectedManufactureId = sessionStorage.getItem("selectedManufactureId");

    if (response) {
      if (response?.data?.errors?.length) {
        const { errorMessage } = response.data.errors[0];
        toggleModal();
        errorMessage
          ? setShowErrorMessage(errorMessage)
          : setShowErrorMessage(translate(AFTER_REVIEW.somethingWentWrong));
      } else if (response?.data?.data && Object.keys(response?.data?.data).length) {
        const { customToken } = response.data.data;

        if (customToken) {
          let existingRel = [{ existingRelIdType: "UID Number", existingRelId: customToken }];
          const existingRelCustRef = sessionStorage.getItem("existingRelCustRef");
          if (existingRelCustRef) {
            existingRel.push(...JSON.parse(existingRelCustRef));
          }
          existingRel && sessionStorage.setItem("existingRelCustRef", JSON.stringify(existingRel));
        }

        setValidateAadharData(response.data.data);
      }
    }
  }

  const handleInitiateCKYC = () => {
    validateCustomerRespHandler();
  };

   const getManufacturerDetails = (productManufacturerId) => {
    const manufacturerProfile =
      appConfig?.deploy?.baseUrl +
      appConfig?.deploy?.manufacturerProfile +
      productManufacturerId;
    
    const { distributorName } = appConfig;

    GetApiHandler(manufacturerProfile, "GET")
      .then((response) => {
        if (response?.data?.data) {
          const { onboardingMode } = response?.data?.data;
          if (onboardingMode) {
            const {ckycConsentText} = onboardingMode;
            let consentText = getConcentText(ckycConsentText, "<FDDistributorName>", distributorName)
            setConsentText(consentText)
          }
        }
      })
      .catch((err) => {
        console.error("Got Error while fetching manufacturer profile details:");
      });
  };

  useEffect(() => {
    if(onboardingData?.investmentDetail) {
      const { manufacturerId } = investmentDetail;
      getManufacturerDetails(manufacturerId)
    }
  }, [onboardingData]);

  useEffect(() => {
    if (validateAadharData && Object.keys(onboardingData).length) {
      nonCkycResponseHandler(validateAadharData);
    }
  }, [validateAadharData, onboardingData]);

  useEffect(() => {
    if (onboardingError) {
      if (!showModal) {
        setOnboardingError(false);
        sessionStorage.removeItem("authorizationToken");
        sessionStorage.removeItem("refreshToken");
        sessionStorage.removeItem("userId");
        sessionStorage.removeItem("tokenGenerationTime");
        sessionStorage.removeItem("userInfo");
        sessionStorage.removeItem("isLoggedIn");
        router.reload();
      }
    }
  }, [showModal, onboardingError]);

  useEffect(() => {
    if (statusVerifyModal.mobileOtpNumber === "verified" && statusVerifyModal.emailOtpNumber === "verified") {
      updateDetailsRespHandler({
        pan_number: customerInformation.customerPan,
        mobile_number: customerInformation.customerContactNo,
        email_id: customerInformation.customerEmailId,
        detailsType: "secondary"
      }, true);
    } else {
      setIsLoading(false);
    }
  }, [statusVerifyModal]);

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
    getInvestmentDetails();
    fundingBankDetails && getBankDetails();
    if (customerInformation) {
      setuserBasicDetails({ ...customerInformation });
    }
  }, [onboardingData]);

  useEffect(() => {
    if (editedInvestDetails) {
      delete editedBankDetails.depositAmount;
      setEditedBankDetails({
        ...editedBankDetails,
        depositAmount: editedInvestDetails.depositAmount,
      });
    }
  }, [editedInvestDetails]);

  useEffect(() => {
    if (!journeyID) {
      const journey_id = router.query.journey_id;
      journey_id && setJourneyID(journey_id);
    }
  });

  useEffect(() => {
    const refID = sessionStorage.getItem("issuerReferenceId");
    const { query } = router;
    if (Object.keys(query).includes("referenceId")) {
      if (refID !== query.referenceId) {
        moveLocalStorageItemsToSession();
        sessionStorage.setItem("issuerReferenceId", query.referenceId);
        setQueryData(query);
      }
    }
  }, [router]);

  useEffect(() => {
    if (queryData && Object.keys(onboardingData).length && journeyID) {
      validateAadharInfo(queryData.referenceId, queryData.data);
    }
  }, [queryData, onboardingData, journeyID])

  useEffect(() => {
    if (journeyID && isLoggedIn) {
      sessionStorage.setItem("journeyID", journeyID);
      const currentJourneyId = uuidv4();
      localStorage.setItem("FD_JOURNEY_ID", currentJourneyId);
      getOnboardingJourneyDetails();
    }
  }, [journeyID, isLoggedIn]);

  useEffect(() => {
    const status = sessionStorage.getItem("isLoggedIn");
    const login = status ? JSON.parse(status).loggedIn : status;
    login && setIsLoggedIn(login);
    generateFDApplicationNum();
  }, []);

  const getLoginStatus = (status) => {
    setIsLoggedIn(status);
  };

  return (
    <>
      <div>
        <NavBarMain shouldShowLogin={true} getLoginStatus={getLoginStatus} />
      </div>
    
      {isLoggedIn && <div className="page-background text-apercu-medium view-container view_container_sm flex justify-center">
        <div className="page-background mb-3 w-9/12">
          {customerInformation ? (
            <div className="flex flex-col mb-3">
              <div className="text-5xl uppercase text-black mb-3">
                <span className="text-regular text-black">{translate(AFTER_REVIEW.Welcome)}</span>{" "}
                <span className="text-medium text-black">
                  {customerInformation.customerFirstName
                    ? customerInformation.customerFirstName
                    : "" + " " + customerInformation.customerLastName
                      ? customerInformation.customerLastName
                      : ""}
                </span>
              </div>
              <span className="text-regular text-black text-2xl">
                {translate(MY_PROFILE.reviewFdApplCompleteKyc)}
              </span>
            </div>
          ) : null}
          <div className="block px-6 py-6 rounded-lg h-auto bg-white">
            <div className="flex flex-col border-b-2 user_journey_container rounded-xl p-[20px] ">
              <div className="flex flex-row justify-between mb-3 items-center">
                <div className="text-medium text-black text-3xl">
                  {translate(BASIC_DETAILS.basicDetails)}
                </div>
              </div>
              <div>
                <div
                  className={`${review_invest_css.basic_detail_status_position} flex gap-10 text-regular text-2xl text-light-gray mb-4`}
                >
                  <div className={`flex flex-col `}>
                    <div>{translate(MY_PROFILE.name)}</div>
                    <div className="text-black">
                      {userBasicDetails
                        ? userBasicDetails.customerFirstName
                          ? userBasicDetails.customerFirstName
                          : "" + " " + userBasicDetails.customerLastName
                            ? userBasicDetails.customerLastName
                            : ""
                        : ""}
                    </div>
                  </div>
                  <div className={`flex flex-col `}>
                    <div>{translate(MY_PROFILE.pan)}</div>
                    <div className="text-black">
                      {userBasicDetails ? userBasicDetails.customerPan : ""}
                    </div>
                  </div>
                  <div className={`flex flex-col `}>
                    <div>{translate(AGENT.dob)}</div>
                    <div className="text-black">
                      {userBasicDetails
                        ? userBasicDetails.customerDob
                        : ""}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <InvestmentDetails
              handleInvestmentDetailsEdit={handleInvestmentDetailsEdit}
              investment_details={editedInvestDetails}
              showProductInfoSection={true}
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
                    setDeclarationStatus(e.target.checked);
                  }}
                  checked={declarationStatus}
                  value={declarationStatus}
                  name="declarationStatus"
                  className="accent-primary-green h-4 w-4 hover:cursor-pointer mt-1 text-black"
                />
                <div className="text-black">{translate(consentText)}</div>
              </div>
            </div>
            {statusVerifyModal.show ?
              <ValidateOTPModal
                contactDetails={{
                  mobileNumber: customerInformation ? customerInformation?.customerContactNo : "",
                  emailId: customerInformation ? customerInformation?.customerEmailId : ""
                }}
                headerMessage={translate(REDIRECTION_MSG.VerifyMobileNumberAndEmailId)}
                updateModalState={toggleStatusVerifyModal}
              /> : null
            }
            <div className="flex flex-row space-x-5 py-5 ">
              <button
                className={(!Object.keys(onboardingData).length ||
                  !declarationStatus ||
                  bankVerificationStatus !== "Verified" ||
                  isLoading) ? "block button-active  button-transition hover:bg-hover-primary text-medium text-xl lg:text-2xl w-fit   text-medium text-xl lg:text-2xl w-fit  hover:button-shadow flex justify-center gap-1" : "block button-active btn-gradient button-transition hover:bg-hover-primary text-medium text-xl lg:text-2xl w-fit   text-medium text-xl lg:text-2xl w-fit  hover:button-shadow flex justify-center gap-1"} 
                onClick={handleInitiateCKYC}
                disabled={
                  !Object.keys(onboardingData).length ||
                  !declarationStatus ||
                  bankVerificationStatus !== "Verified" ||
                  isLoading
                }
              >
                {translate(MY_PROFILE.initiateCkyc)}
                {isLoading ? <Loader /> : null}
              </button>
            </div>
          </div>
          <ErrorModal
            canShow={showModal}
            updateModalState={toggleModal}
            errorMessage={showErrorMessage}
          />
          {showEditModal ? (
            <EditDetails
              toggleEditModal={toggleEditModal}
              editComponentType={editComponentType}
            />
          ) : null}
          {statusVerifyModal?.show && customerInformation ?
            <ValidateOTPModal
              contactDetails={{
                mobileNumber: customerInformation ? customerInformation?.customerContactNo : "",
                emailId: customerInformation ? customerInformation?.customerEmailId : ""
              }}
              headerMessage={translate(REDIRECTION_MSG.VerifyMobileNumberAndEmailId)}
              updateModalState={toggleStatusVerifyModal}
            /> : null
          }
        </div>
      </div>}
      
    </>
  );
}

export default OnboardingPage;

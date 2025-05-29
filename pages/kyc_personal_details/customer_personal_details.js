import { useState, useEffect } from "react";
import appConfig from "../../app.config";
import { PostApiHandler, PatchApiHandler } from "../api/apihandler";
import Link from "next/link";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { v4 as uuidv4 } from "uuid";
import ErrorModal from "../common/errorPopup";
import { getMonth, getYear } from "date-fns";
import range from "lodash/range";
import NriPopUp from "./nri_popup";
import {
  hashPAN,                                                                              
  calculateAge,
  charWithNumberInput,
  convertUTCToYYYY_MM_DD,
  dateFormat,
  dd_mm_yyyy_format,
  getUserRole,
  getUserType,
  handleEventLogger,
  initializeClevertap,
  monthFormate,
  moveLocalStorageItemsToSession,
  moveSessionItemsToLocalStorage,
  numberInput,
  generateRandomAlphaString,
  setSessionStorageItem,
  isMobile
} from "../../lib/util";
import {
  dataConversion,
  clearingImageData,
} from "../../lib/customer_personal_details_utils";
import { useFormik } from "formik";
import * as yup from "yup";
import Loader from "../../svg/Loader";
import {
  BASIC_DETAILS_JSON,
  MONTHS,
  PERSONAL_DETAILS,
  PROFILE_IMAGE_JSON,
  RESIDENTIAL_STATUS,
  ADDRESS_DETAILS_JSON,
  ADDRESS_DETAILS,
  profilePicCodes,
  TRIM_MONTHS,
  AFTER_REVIEW,
  AGENT,
  BASIC_DETAILS,
  KYC_DETAIL,
  REDIRECTION_MSG,
  COMMON_CONSTANTS,
  VALIDATION_CONSTANT
} from "../../constants";
import Login from "../login/hdfc_login";
import styles from "../../styles/customer_personal_details.module.css";
import ContactDetailsModal from "../contactDetails/ContactDetailsModal";
import { mapValidateAadharRespToCKYC, mapValidateCustomerRespToCKYC } from "../../lib/ckycWrapper";
import { useRouter } from "next/router";
import { validateCustomer } from "../../utils/validateCustomer";
import { aadharVerification } from "../../utils/aadharVerification";
import { validateAdharInformation } from "../../utils/validateAdharInformation";
import ValidateOTPModal from "./validateOTP";
import { useTranslation } from "react-i18next";
import { FD_RENEWAL } from './../../constants/index';
import { fetchManufacturerProperties } from "../../utils/manufaturerProfile";
import { debounce } from "lodash";

function CustomerPersonalDetails(props) {
  const { t: translate } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [apiErrorMessage, setApiErrorMessage] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [minorError, setMinorErrorModal] = useState(false);
  const [kycRequired, setKycRequired] = useState(false);
  const [validateCustomerData, setvalidateCustomerData] = useState();
  const [showNriModal, setShowNriModal] = useState({
    show: false,
    message: "",
  });
  const [showLoginPage, setShowLoginPage] = useState({
    show: false,
    status: "",
    message: "",
  });
  const [ckycData, setCKYCData] = useState();
  const [signInViaPAN, setSignInViaPAN] = useState(false);
  const [userInfo, setUserInfo] = useState();
  const [isUserTypeRM, setIsUserTypeRM] = useState(false);
  const [showContactDetailsPopup, setShowContactDetailsPopup] = useState({
    show: false,
    status: "",
  });
  const [contactDetails,] = useState({});
  const [onboardingMode, setOnboardingMode] = useState({});
  const [applicationNumber, setApplicationNumber] = useState("");
  const [selectedManufactureId, setSelectedManufactureId] = useState("");
  const [statusVerifyModal, setStatusVerifyModal] = useState({ show: false, mobileOtpNumber: "", emailOtpNumber: "" });
  const [userPanDropdown, setUserPanDropDown] = useState([]);
  const [familyDetails, setFamilyDetails] = useState();
  const [selectedPan, setSelectedPan] = useState("");
  const [selectedUserId, setSelectedUserId] = useState("");
  const [familyHeadSelectedDetails, setFamilyHeadSelectedDetails] = useState({});
  const [verifiedEmail, setVerifiedEmail] = useState();
  const [verifiedMobile, setVerifiedMobile] = useState();
  const [kycmode, setKycmode] = useState();
  const [webView, setWebView] = useState(false);
  const router = useRouter();


  useEffect(() => {
    if (router.isReady) {
      const { isWebView } = router.query;
      if (isWebView) {
        setWebView(true);
      }
    }
  }, [router.isReady]);

  const toggleModal = () => setShowModal((state) => !state);
  const toggleMinorErrorModal = () => setMinorErrorModal((state) => !state);

  const [clevertapModule, setClevertapModule] = useState(null);



  const clevertapInit = async () => {
    let clevertap = clevertapModule
    if (!clevertap) {
      clevertap = await initializeClevertap()
    }
  }

  const toggleNriModal = (state) => {
    setShowNriModal(state);
    values.taxResidencyStatus &&
      !state.show &&
      setFieldValue("taxResidencyStatus", false);
  };

  const toggleStatusVerifyModal = (state) => {
    console.log("Issue Adharar Test", state)
    setStatusVerifyModal(state);
  };

  const getModalStatus = (status, show) => {
    if (status === "verified") {
      setSessionStorageItem(
        "isAlreadyLoggedIn",
        JSON.stringify({ isAlreadyLoggedIn: true })
      );
      validateCustomerRespHandler();
    }
    setShowLoginPage({ show: show, status: status, message: "" });
  };

  const getUpdateContactDetailsModalStatus = (status) => {
    setShowContactDetailsPopup(status);
  };

  useEffect(() => {
    if (selectedManufactureId.toLowerCase() === "usfb") {
      if (statusVerifyModal.mobileOtpNumber === "verified" && statusVerifyModal.emailOtpNumber === "verified") {
        aadharVerificationRespHandler();
      }
    } else {
      if (statusVerifyModal.mobileOtpNumber && statusVerifyModal.emailOtpNumber && kycRequired) {
        aadharVerificationRespHandler();
      } else if (selectedManufactureId.toLowerCase() === "bajaj" && statusVerifyModal.emailOtpNumber && kycRequired) {
        aadharVerificationRespHandler();
      }
      else {
        setLoading(false);
        if (validateCustomerData && statusVerifyModal.mobileOtpNumber && statusVerifyModal.emailOtpNumber) {
          let newData = mapValidateCustomerRespToCKYC(validateCustomerData);
          ckycAndValidateCustomerHandler(newData);
        }
      }
    }
  }, [statusVerifyModal]);

  useEffect(() => {
    if (showLoginPage.status === "verified") {
      validateCustomer({ panNumber: values.panNumber, dateOfBirth: dd_mm_yyyy_format(values.dateOfBirth) });
    }
  }, [showLoginPage]);

  const years = range(getYear(new Date()) - 101, getYear(new Date()) + 1, 1);
  const initialValues = {
    panNumber: "",
    dateOfBirth: "",
    mobileNumber: "",
    emailId: "",
    lgLcCode: "",
    residentialStatus: "",
    declarationCheck: false,
    taxResidencyStatus: false,
  };

  const validationSchema = yup.object({
    panNumber: yup
      .string()
      .max(10, translate(VALIDATION_CONSTANT.invalidPAN))
      .matches(/([A-Z]){5}([0-9]){4}([A-Z]){1}$/, translate(VALIDATION_CONSTANT.invalidPAN))
      .required(""),
    dateOfBirth: yup
      .date()
      .nullable()
      .test("Is customer minor", translate(VALIDATION_CONSTANT.enterValidDOB), (value) => {
        if (!value) return true;
        const age = calculateAge(value);
        if (age < 18) {
          return false;
        } else {
          return true;
        }
      })
      .required(""),
    lgLcCode: yup
      .string()
      .matches(/^[a-zA-Z0-9]+$/, translate(VALIDATION_CONSTANT.invalidLC)),
    mobileNumber: yup
      .string()
      .max(10, translate(VALIDATION_CONSTANT.mobileNoLength))
      .matches(/^[0-9]\d{9}$/, translate(VALIDATION_CONSTANT.invalidValue))
      .required(""),
    emailId: yup
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

  // Debounced setFieldValue function
  const debouncedSetFieldValue = debounce((value,key) => {
    setFieldValue(key, value);
  }, 1); // Delay of 1ms



  const ckycAndValidateCustomerHandler = (requestData) => {
    setLoading(true);
    let newData = requestData;
    // declaring the parameter for dataConversion function
    let temData = dataConversion(
      newData,
      BASIC_DETAILS_JSON,
      PROFILE_IMAGE_JSON,
      ADDRESS_DETAILS_JSON
    );
    //Total ckyc api response and after convert  mapping ckyc data
    Object.assign(newData, temData);
    const { pidData } = newData;
    Object.keys(newData["ADDRESS DETAILS"]).forEach((key) => {
      newData["ADDRESS DETAILS"][key] =
        pidData.personalDetails[ADDRESS_DETAILS_JSON[key]];
    });
    newData["ADDRESS DETAILS"]["Permanent Address"] =
      pidData.personalDetails.permLine1 +
      pidData.personalDetails.permLine2 +
      pidData.personalDetails.permLine3;

    const returnedNewData = clearingImageData(newData);
    returnedNewData["BASIC DECLARATION"] = {
      ResidentStatus: RESIDENTIAL_STATUS.residentialStatusIndian,
      TaxResident: values.taxResidencyStatus,
      Declaration: values.declarationCheck,
    };
    returnedNewData["PERSONAL DETAILS"].Email = values.emailId;
    returnedNewData["PERSONAL DETAILS"].MobileNumber = values.mobileNumber;
    returnedNewData["PERSONAL DETAILS"].pan_number = values.panNumber;
    returnedNewData["PERSONAL DETAILS"].dateOfBirth = values.dateOfBirth;

    // storing the total data of ckyc api response in local storage
    const personalDetails = returnedNewData["PERSONAL DETAILS"];
    if (personalDetails?.MobileNumber || personalDetails?.Email) {
      const userLoggedInDetails = sessionStorage.getItem("isLoggedIn");
      if (signInViaPAN) {
        if (userLoggedInDetails) {
          const userInfo = JSON.parse(userLoggedInDetails);
          if (!userInfo?.loggedIn) {
            setCKYCData(returnedNewData);
          } else {
            handleProceedEventLogger();
            props.handle(
              props.nextPage,
              {},
              { CkycApiData: returnedNewData },
              "customer_personal_details", values
            );
          }
        }
      } else {
        handleProceedEventLogger();
        props.handle(
          props.nextPage,
          {},
          { CkycApiData: returnedNewData }, "customer_personal_details", values
        );
      }
    } else if (values.mobileNumber === "" || values.emailId === "") {
      setLoading(false);
      setShowModal(true);
      setApiErrorMessage(
        "Sorry, we cannot proceed further due to missing contact details from CKYC. Please try with a different PAN"
      );
    }
  }

  const handleProceedEventLogger = () => {
    const hashedPan = hashPAN(values.panNumber)
    handleEventLogger("customer_personal_details", "buttonClick", "Invest_Click", {
      action: "Personal_Details_Completed",
      Pan: values.panNumber,
      Email: values.emailId,
      MobileNumber: values.mobileNumber,
      DOB: values.dateOfBirth,
      ResidentStatus: values.residentialStatus.includes("NRI") ? "NRI" : "Indian",
      TaxToggle: values.taxResidencyStatus ? "On" : "Off",
      Platform: isMobile()
    });

    const user_Id = sessionStorage.getItem("userId")
    const user_info1 = sessionStorage.getItem("userInfo")
    const user_info = user_info1 && JSON.parse(user_info1);

    const props = {
      'Identity': `CFD_${user_Id}`,
      'Name': user_info?.customer_name,
      'Email': values.emailId,
      'Phone': "+91" + values.mobileNumber,
      'DOB': new Date(values.dateOfBirth),
      "MSG-email": true,
      "MSG-push": true,
      "MSG-sms": true,
      "MSG-whatsapp": true,
    }
    if (typeof clevertap !== 'undefined') {
      clevertap.onUserLogin.push({ Site: { ...props } });
    }
  }

  const updateCommunicationData = () => {
    setLoading(true);
    const otpURL = appConfig?.deploy?.baseUrl + appConfig?.deploy?.updateCommunicationData;
    const method = "Patch";
    PatchApiHandler(otpURL, method, {
      pan_number: values.panNumber,
      mobile_number: values.mobileNumber,
      email_id: values.emailId,
      detailsType: "secondary"
    }).then((res) => {

    }).finally(() => {
      setLoading(false);
    });
  };

  const familyInvestorDetailsHandler = (requestData, data) => {
    const { fatherFirstName, fatherLastName, fatherMiddleName,
      motherFirstName, motherLastName, motherMiddleName,
      spouseFirstName, spouseLastName, spouseMiddleName } = requestData.parentsSpouseDetail;
    const { customerDob } = requestData.customerInformation
    const { firstName, lastName, middleName, } = data;

    setSessionStorageItem("investorDetails", JSON.stringify({
      ...familyHeadSelectedDetails,
      customerContactNo: values.mobileNumber,
      customerEmailId: values.emailId,
      customerPan: values.panNumber,
      customerDob: dateFormat(values.dateOfBirth)
    }));

    const returnedNewData = {
      "BASIC DECLARATION": {
        ResidentStatus: RESIDENTIAL_STATUS.residentialStatusIndian,
        TaxResident: values.taxResidencyStatus,
        Declaration: values.declarationCheck,
      },
      "PERSONAL DETAILS": {
        "Email": values.emailId,
        "MobileNumber": values.mobileNumber,
        "Dob": customerDob,
        "FirstName": firstName,
        "MiddleName": middleName,
        "LastName": lastName,
        "pan_number": values.panNumber
      },
      "PARENT & SPOUSE DETAILS": {
        "Father Details": {
          "Frist Name": fatherFirstName || "",
          "Middle Name": fatherMiddleName || "",
          "Last Name": fatherLastName || "",
        },
        "Mother Details": {
          "Frist Name": motherFirstName || "",
          "Middle Name": motherMiddleName || "",
          "Last Name": motherLastName || "",
        },
        "Spouse Details": {
          "Frist Name": spouseFirstName || "",
          "Middle Name": spouseMiddleName || "",
          "Last Name": spouseLastName || "",
        }
      }
    };
    handleProceedEventLogger();
    props.handle(
      props.nextPage,
      {},
      { CkycApiData: returnedNewData }, "customer_personal_details", values
    );
  }

  function postCKYCDetail() {
    setLoading(true);
    const selectedProductName = sessionStorage.getItem("selectedProductName");
    const addKYCData = {
      consumerId: "4",
      manufacturerId: 4,
      panNumber: values.panNumber,
      dateOfBirth: dateFormat(values.dateOfBirth),
      ckycConsent: values.declarationCheck,
      productName: selectedProductName ? selectedProductName : "",
    };
    const ckycURL =
      appConfig?.deploy?.baseUrl + appConfig?.deploy?.ckycVerification;
    const method = "Post";

    PostApiHandler(ckycURL, method, addKYCData)
      .then((res) => {
        const { response, message } = res;
        if (message) {
          setShowModal(true);
          if (response?.data?.errors?.length) {
            const { errorMessage } = response.data.errors[0];
            errorMessage
              ? setApiErrorMessage(errorMessage)
              : setApiErrorMessage(translate(AFTER_REVIEW.somethingWentWrong));
          } else {
            setApiErrorMessage(message);
          }
        } else if (res?.data?.errors?.length) {
          const { errorMessage } = res.data.errors[0];

          setShowModal(true);
          errorMessage
            ? setApiErrorMessage(errorMessage)
            : setApiErrorMessage(translate(AFTER_REVIEW.somethingWentWrong));
        } else if (res?.data?.data && Object.keys(res?.data?.data).length) {
          ckycAndValidateCustomerHandler(res?.data?.data)
        }
      })
      .finally(() => setLoading(false));
  }

  const isManufacturer = (ids) => ids.includes(selectedManufactureId?.toLowerCase());
  const requiresFullKyc = (details) => details?.fullKycReqd?.toLowerCase() === "yes";

  const validateCustomerRedirectionHandler = (emailstatsus, mobilestatus, data, kycMode, existingIssuerRelationshipDtls) => {
    if (isManufacturer(["mmfsl", "shriram", "lichfl"])) {
      aadharVerificationRespHandler();
    } else if (isManufacturer(["bajaj", "usfb"])) {
      if (kycMode?.kycMode) {
        if (isManufacturer(["bajaj"])) {
          if (!emailstatsus) {
            toggleStatusVerifyModal({
              show: true,
              mobileOtpNumber: "",
              emailOtpNumber: ""
            });
            setKycRequired(true);
          }
          else {
            aadharVerificationRespHandler();
          }
        }
        else {
          if (!emailstatsus || !mobilestatus) {
            toggleStatusVerifyModal({
              show: true,
              mobileOtpNumber: "",
              emailOtpNumber: ""
            });
            setKycRequired(true);
          }
          else {
            aadharVerificationRespHandler();
          }
        }


      }
    } else if (isManufacturer(["ssfb", "sib"])) {
      toggleStatusVerifyModal({
        show: true,
        mobileOtpNumber: "",
        emailOtpNumber: ""
      });
      if (requiresFullKyc(existingIssuerRelationshipDtls)) {
        setKycRequired(true);
      }
    } else if (isManufacturer(["unity"])) {
      if (kycMode?.kycMode) {
        if (!emailstatsus || !mobilestatus) {
          toggleStatusVerifyModal({
            show: true,
            mobileOtpNumber: "",
            emailOtpNumber: ""
          });
        }
        else {
          const newData = mapValidateCustomerRespToCKYC(data);
          ckycAndValidateCustomerHandler(newData);
        }
      }
    }
    else {
      const newData = mapValidateCustomerRespToCKYC(data);
      ckycAndValidateCustomerHandler(newData);
    }
  }

  const validateCustomerRespHandler = async () => {
    setLoading(true);
    const selectedManufactureId = sessionStorage.getItem("selectedManufactureId");

    const response = await validateCustomer({ panNumber: values.panNumber, dateOfBirth: dd_mm_yyyy_format(values.dateOfBirth) });
    if (response) {
      if (response?.data?.errors?.length) {
        const { errorMessage } = response.data.errors[0];
        setLoading(false);
        setShowModal(true);
        errorMessage
          ? setApiErrorMessage(errorMessage)
          : setApiErrorMessage(translate(AFTER_REVIEW.somethingWentWrong));
      } else if (response?.data?.data && Object.keys(response?.data?.data).length) {
        const { data } = response.data;
        setvalidateCustomerData(data)
        if (Object.keys(data).length === 0) {
          setShowModal(true);
          setApiErrorMessage("Please visit your nearest PNBHFL Branch to update your revised communication address in the system. Submit valid OVD proof along with an address request letter duly signed.");
        }
        else {
          const {
            emailVerfied, mobileVerified, kycMode, existingIssuerRelationshipDtls, existingRelCustRef, customerDocuments,
            issuerDedupeResId, fdApplicationNo, customerInformation, customerContactEmail
          } = data;
          setVerifiedMobile(mobileVerified)
          setVerifiedEmail(emailVerfied)
          if (fdApplicationNo) {
            setApplicationNumber(fdApplicationNo);
            setSessionStorageItem("applicationNumber", fdApplicationNo);
          }
          if (customerDocuments?.length) {
            const code = profilePicCodes[selectedManufactureId.toLowerCase()];
            const imageData = customerDocuments.find(document => document.documentCode === code);
            imageData && setSessionStorageItem("imageData", imageData.documentImageData);
          }

          issuerDedupeResId && setSessionStorageItem("issuerDedupeResId", issuerDedupeResId);
          setSessionStorageItem("validateCustomerInfo", JSON.stringify(data));
          existingIssuerRelationshipDtls && setSessionStorageItem("existingIssuerRelationshipDtls", JSON.stringify(existingIssuerRelationshipDtls));
          existingRelCustRef && setSessionStorageItem("existingRelCustRef", JSON.stringify(existingRelCustRef));

          kycMode && setSessionStorageItem("kycMode", JSON.stringify(kycMode));
          if (data?.screeningStatus?.toLowerCase() === "match found") {
            setShowModal(true);
            setApiErrorMessage(PERSONAL_DETAILS.amlCheckErrorMsg);
          } else {
            const { customerEmailId } = customerInformation;
            if (selectedManufactureId?.toLowerCase() === "usfb" && customerContactEmail?.[0]?.["emailResult"] === false) {
              setShowModal(true);
              setApiErrorMessage(translate("Please enter a valid email address and Try again"))
            } else {
              if (customerEmailId?.toLowerCase() !== values.emailId.toLowerCase) {
                updateCommunicationData();
              }
              validateCustomerRedirectionHandler(emailVerfied, mobileVerified, data, kycMode, existingIssuerRelationshipDtls);
            }
          }
        }
      }
    }
  }

  const fetchRecordFromNSDL = (investorDetails) => {
    setLoading(true);
    const nsdlPANUserURL =
      appConfig?.deploy?.baseUrl + appConfig?.deploy?.nsdlPanVerification;
    const requestBody = {
      pan_number: values.panNumber,
      date_of_birth: convertUTCToYYYY_MM_DD(values.dateOfBirth),
      mobile_no: values.mobileNumber,
      email_id: values.emailId,
      external_ref_id: investorDetails?.customerId ? investorDetails?.customerId : ""
    };

    PostApiHandler(nsdlPANUserURL, "Post", requestBody).then((response) => {
      setLoading(false);
      if (response?.data?.errors?.length) {
        const { errorMessage } = response.data.errors[0];
        setShowModal(true);
        errorMessage
          ? setApiErrorMessage(errorMessage)
          : setApiErrorMessage(translate(AFTER_REVIEW.somethingWentWrong));
      } else if (response?.data?.data && Object.keys(response?.data?.data).length) {
        const { data } = response.data;
        if (data?.panStatus && data?.panStatus?.toLowerCase() === "valid") {
          familyInvestorDetailsHandler(investorDetails, data);
        } else {
          setShowModal(true);
          setApiErrorMessage("Mismatch in PAN holder & Investor details");
        }
      }
    });
  };

  const aadharVerificationRespHandler = async () => {
    setLoading(true);
    const aadharVerificationURL = appConfig?.deploy?.baseUrl + appConfig?.deploy?.aadharVerification;
    const applicationNum = applicationNumber ? selectedManufactureId.toLowerCase() === "ssfb" || selectedManufactureId === "sib" ? generateRandomAlphaString(16) : applicationNumber : generateFDApplicationNum();
    const response = await aadharVerification(aadharVerificationURL, values, applicationNum);
    if (response) {
      if (response?.data?.errors?.length) {
        const { errorMessage } = response.data.errors[0];
        setLoading(false);
        setShowModal(true);
        errorMessage
          ? setApiErrorMessage(errorMessage)
          : setApiErrorMessage(translate(AFTER_REVIEW.somethingWentWrong));
      } else if (response?.data?.data && Object.keys(response?.data?.data).length) {
        setLoading(false);
        const { aadharUrl } = response?.data?.data;
        moveSessionItemsToLocalStorage();
        window.location.href = aadharUrl;
      }
    }
  }

  const validateAadharInfo = async (referenceId, data) => {
    setLoading(true);
    const validateAadharInfoURL = appConfig?.deploy?.baseUrl + appConfig?.deploy?.validateAadharInfo;
    const response = await validateAdharInformation(validateAadharInfoURL, referenceId, data);
    const selectedManufactureId = sessionStorage.getItem("selectedManufactureId");

    if (response) {
      if (response?.data?.errors?.length) {
        const { errorMessage } = response.data.errors[0];
        setShowModal(true);
        errorMessage
          ? setApiErrorMessage(errorMessage)
          : setApiErrorMessage(translate(AFTER_REVIEW.somethingWentWrong));
      } else if (response?.data?.data && Object.keys(response?.data?.data).length) {
        const { ckycDocuments, ckycStatus, ckycDescription, customToken } = response.data.data;

        if (customToken) {
          let existingRel = [{ existingRelIdType: "UID Number", existingRelId: customToken }];
          const existingRelCustRef = sessionStorage.getItem("existingRelCustRef");
          if (existingRelCustRef) {
            existingRel.push(...JSON.parse(existingRelCustRef));
          }
          existingRel && setSessionStorageItem("existingRelCustRef", JSON.stringify(existingRel));
        }

        if (ckycStatus?.toLowerCase() !== "approved") {
          setLoading(false);
          setShowModal(true);
          ckycDescription
            ? setApiErrorMessage(ckycDescription)
            : setApiErrorMessage(translate(AFTER_REVIEW.somethingWentWrong));
        } else {
          if (ckycDocuments?.length) {
            const code = profilePicCodes[selectedManufactureId.toLowerCase()];
            const imageData = ckycDocuments.find(document => document.documentId === code);
            imageData && setSessionStorageItem("imageData", imageData.document);
          }

          let newData = mapValidateAadharRespToCKYC(response.data.data);
          ckycAndValidateCustomerHandler(newData);
        }
      }
    }
  }

  const handleResidentialStatusChange = (status) => {
    setFieldValue("residentialStatus", status);
    if (status.includes("NRI")) {
      toggleNriModal({ show: true, message: PERSONAL_DETAILS.nriErrorMsg });
    }
  };
  const generateFDApplicationNum = () => {
    const fdApplicationNumber = uuidv4().replaceAll("-", "").substring(0, 30);
    setApplicationNumber(fdApplicationNumber);
    setSessionStorageItem("applicationNumber", fdApplicationNumber);
  }

  const userSignUpAPI = () => {
    setLoading(true);
    applicationNumber ? applicationNumber : generateFDApplicationNum();
    const otpURL = appConfig?.deploy?.baseUrl + "/signup";
    const method = "Post";
    PostApiHandler(otpURL, method, {
      panNumber: values.panNumber,
      dob: dateFormat(values.dateOfBirth),
      mobileNumber: values.mobileNumber,
      emailId: values.emailId,
    })
      .then((res) => {
        if (res.data?.errors.length) {
          const { errorMessage } = res.data.errors[0];
          setShowModal(true);
          errorMessage
            ? setApiErrorMessage(errorMessage)
            : setApiErrorMessage(translate(AFTER_REVIEW.somethingWentWrong));
        } else if (res.data?.data && Object.keys(res.data?.data).length) {
          if (res.data?.data) {
            const { data } = res.data;
            // if (!data.isEmailAvailable || !data.isMobileNumberAvailable) {
            //   setShowContactDetailsPopup({
            //     show: true,
            //     status: "initiated",
            //     ...data,
            //   });
            // } else {
            if (
              data.msg === "user already registered" ||
              data.msg === "user registered successfully"
            ) {
              setShowLoginPage({ show: true, status: "", message: data.msg });
            }
            // }
          } else if (res.response?.data?.errors?.length) {
            const { errorMessage } = res.response.data.errors[0];
            setShowModal(true);
            errorMessage
              ? setApiErrorMessage(errorMessage)
              : setApiErrorMessage(translate(AFTER_REVIEW.somethingWentWrong));
          }
        }
      })
      .finally(() => setLoading(false));
  };

  const updateFamilyPayloadDetails = () => {
    const sessionFamilyDetails = JSON.parse(sessionStorage.getItem("familyDetails"))
    if (sessionFamilyDetails?.payload?.investorDetails) {
      const updatedDetails = sessionFamilyDetails.payload.investorDetails.map((investor) => {
        if (investor?.userId === Number(selectedUserId)) {
          if (investor?.customerInformation) {
            investor.customerInformation.customerContactNo = investor.customerInformation.customerContactNo || values.mobileNumber;
            investor.customerInformation.customerEmailId = investor.customerInformation.customerEmailId || values.emailId;
            investor.customerInformation.customerPan = investor.customerInformation.customerPan || values.panNumber;
            investor.customerInformation.customerDob = investor.customerInformation.customerDob || dateFormat(values.dateOfBirth);
          }
        }
        return investor;
      });
      sessionFamilyDetails.payload.investorDetails = updatedDetails;
      setSessionStorageItem("familyDetails", JSON.stringify(sessionFamilyDetails));
    }
  }

  const handleProcessBtnClick = () => {

    values.panNumber && setSelectedPan(values.panNumber)
    const userLoggedInDetails = sessionStorage.getItem("isLoggedIn")
      ? JSON.parse(sessionStorage.getItem("isLoggedIn"))
      : {};
    if (signInViaPAN && !userLoggedInDetails?.loggedIn) {
      userSignUpAPI();
    } else {
      if (familyHeadSelectedDetails && Object.keys(familyHeadSelectedDetails).length) {
        updateFamilyPayloadDetails()
        const investorDetails = familyDetails.investorDetails.filter((investor) => {
          return investor.userId === Number(selectedUserId)
        });
        // setSessionStorageItem("selectedUserId", familyHeadSelectedDetails.userId);
        // setSessionStorageItem("investorDetails", JSON.stringify(familyHeadSelectedDetails));
        if (familyHeadSelectedDetails.isFamilyHead) {
          setSessionStorageItem("userInfo",
            JSON.stringify({
              pan_number: values.panNumber,
              date_of_birth: values.dateOfBirth,
            })
          );
          validateCustomerRespHandler();
        } else {
          setSessionStorageItem("imageData", "");
          // familyInvestorDetailsHandler(investorDetails[0]);
          fetchRecordFromNSDL(investorDetails[0]);
        }
      } else {
        validateCustomerRespHandler();
      }
    }
  };

  useEffect(() => {
    if (Object.keys(familyHeadSelectedDetails).length) {
      setSessionStorageItem("selectedUserId", familyHeadSelectedDetails.userId);
      setSessionStorageItem("investorDetails", JSON.stringify(familyHeadSelectedDetails));
      const {
        userId,
        customerContactNo,
        customerDob,
        customerEmailId,
        customerPan
      } = familyHeadSelectedDetails
      customerPan && setSelectedPan(customerPan);
      userId && setSelectedUserId(userId);
      setFieldValue('panNumber', customerPan || "");
      setFieldValue('dateOfBirth', customerDob ? new Date(customerDob) : ''); // Formatting date as YYYY-MM-DD
      setFieldValue('mobileNumber', customerContactNo || "");
      setFieldValue('emailId', customerEmailId || "");
    }
  }, [familyHeadSelectedDetails]);

  const getSignInViaPANDetails = () => {
    const featureFlag = JSON.parse(sessionStorage.getItem("featureFlag"));
    if (featureFlag?.signInViaPAN) {
      setSignInViaPAN(featureFlag.signInViaPAN);
    }
  };

  const getOnboardingMode = (onboardingModeDetails) => {
    if (onboardingModeDetails) {
      const consentType = onboardingModeDetails.kycMode + "ConsentText";
      const consentText = onboardingModeDetails[consentType];
      setOnboardingMode({
        consentType: onboardingModeDetails.kycMode,
        consentText,
        kycMode: onboardingModeDetails.kycMode
      });
    }
  }

  const concentText = () => {
    const distributorName = sessionStorage.getItem("distributorName");
    const manufacturerNames = sessionStorage.getItem("manufacturerNames");
    const selectedManufactureId = sessionStorage.getItem("selectedManufactureId");

    let issuerName = "";
    if (manufacturerNames && selectedManufactureId) {
      const name = JSON.parse(manufacturerNames)[selectedManufactureId];
      issuerName = name;
    }
    const text = onboardingMode?.consentText ? onboardingMode?.consentText : ""
    let newText = text;
    if (distributorName && text.includes("<FDDistributorName>")) {
      newText = text.replaceAll("<FDDistributorName>", JSON.parse(distributorName));
    }

    if (distributorName && text.includes("<FDDistributorName>")) {
      newText = text.replaceAll("<FDDistributorName>", JSON.parse(distributorName));
    }
    if (issuerName && text.includes("<FDIssuerName>")) {
      newText = text.replaceAll("<FDIssuerName>", JSON.parse(issuerName));
    }

    return newText;
  }

  const handleDropDownSelection = (e) => {
    const filterData = userPanDropdown.find((data) => data.value === e.target.value);
    setFamilyHeadSelectedDetails(filterData);
    filterData?.key ? setSelectedPan(filterData.key) : setSelectedPan("");
    filterData?.userId && setSelectedUserId(filterData.userId);
  }

  const getManufacturerDetails = async (selectedManufactureId) => {
    const response = await fetchManufacturerProperties(selectedManufactureId);
    if (response) {
      setKycmode(response?.data?.data.onboardingMode.kycMode)
      if (response?.data?.data) {
        const { onboardingMode } = response?.data?.data;
        if (onboardingMode) {
          getOnboardingMode(onboardingMode);
        }
      }
    }
  };

  useEffect(() => {
    const refID = sessionStorage.getItem("issuerReferenceId");
    const { query } = router;
    if (Object.keys(query).includes("referenceId")) {
      if (refID !== query.referenceId) {
        moveLocalStorageItemsToSession();
        setSessionStorageItem("issuerReferenceId", query.referenceId);
        validateAadharInfo(query.referenceId, query.data);
      }
    }
  }, [router]);

  useEffect(() => {
    if (userPanDropdown.length) {
      const isFamilyHeadDetails = userPanDropdown.find((data) => data.value === "Self");
      if (isFamilyHeadDetails && !selectedUserId) {
        setFamilyHeadSelectedDetails(isFamilyHeadDetails);
        isFamilyHeadDetails?.key && setSelectedPan(isFamilyHeadDetails.key);
        setSelectedUserId(isFamilyHeadDetails.userId);
      }

    }
  }, [values.panNumber, userPanDropdown, selectedUserId]);

  useEffect(() => {
    if (showContactDetailsPopup.status === "updated") {
      setShowLoginPage({
        show: true,
        status: "",
        message: "user registered successfully",
      });
      showContactDetailsPopup?.values &&
        setContactDetails(showContactDetailsPopup.values);
    } else if (showContactDetailsPopup.status === "failed") {
      setShowModal(true);
      showContactDetailsPopup?.message
        ? setApiErrorMessage(showContactDetailsPopup.message)
        : setApiErrorMessage(translate(AFTER_REVIEW.somethingWentWrong));
    }
  }, [showContactDetailsPopup]);

  useEffect(() => {
    if (showLoginPage.status === "verified" && ckycData) {
      handleProceedEventLogger();
      props.handle(props.nextPage, {}, { CkycApiData: ckycData }, "customer_personal_details", values);
    }
  }, [ckycData]);

  useEffect(() => {
    clevertapInit();

    if (familyDetails && selectedPan) {
      setSessionStorageItem("selectedPan", selectedPan);
      const investorDetails = familyDetails.investorDetails.filter((investor) => investor.customerInformation.customerPan === selectedPan);
      if (investorDetails.length) {
        const { customerPan, customerDob, customerContactNo, customerEmailId } = investorDetails[0].customerInformation;
        customerPan && setFieldValue("panNumber", customerPan);
        customerDob && setFieldValue("dateOfBirth", new Date(customerDob));
        customerContactNo && setFieldValue("mobileNumber", customerContactNo);
        customerEmailId && setFieldValue("emailId", customerEmailId);
      }
    }
  }, [selectedPan]);

  useEffect(() => {
    if (familyDetails && selectedUserId) {
      const investorDetails = familyDetails.investorDetails.filter((investor) => investor.userId == Number(selectedUserId));
      if (investorDetails.length) {
        const { customerPan, customerDob, customerContactNo, customerEmailId } = investorDetails[0].customerInformation;
        customerPan ? setFieldValue('panNumber', customerPan) : setFieldValue('panNumber', "");
        customerDob ? setFieldValue('dateOfBirth', customerDob ? new Date(customerDob) : '') : setFieldValue(""); // Formatting date as YYYY-MM-DD
        customerContactNo ? setFieldValue('mobileNumber', customerContactNo) : setFieldValue('mobileNumber', "");
        customerEmailId ? setFieldValue('emailId', customerEmailId) : setFieldValue('emailId', "");
      }
    }
  }, [selectedUserId]);

  useEffect(() => {
    selectedManufactureId && getManufacturerDetails(selectedManufactureId);
  }, [selectedManufactureId]);

  useEffect(() => {
    const selectedManufactureId = sessionStorage.getItem("selectedManufactureId");
    selectedManufactureId && setSelectedManufactureId(selectedManufactureId);
    getSignInViaPANDetails();
  })

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
    const productIdLocal = sessionStorage.getItem("selectedProductId");
    if (selectedManufactureId?.toLowerCase() !== "pnbhfc") {
      applicationNumber ? applicationNumber : generateFDApplicationNum();
    }

    if (productIdLocal && sessionStorage[productIdLocal]) {
      const { CkycApiData } = JSON.parse(sessionStorage[productIdLocal]);
      if (CkycApiData) {
        const {
          "PERSONAL DETAILS": personalDetails,
          "BASIC DECLARATION": basicDeclaration,
        } = CkycApiData;
        if (basicDeclaration) {
          const { TaxResident, Declaration, ResidentStatus } = basicDeclaration;
          setFieldValue("taxResidencyStatus", TaxResident);
          setFieldValue("declarationCheck", Declaration);
          if (ResidentStatus.includes("NRI")) {
            setFieldValue("residentialStatus", RESIDENTIAL_STATUS.residentialStatusNRI);
          } else {
            setFieldValue("residentialStatus", RESIDENTIAL_STATUS.residentialStatusIndian);
          }
        }
        if (personalDetails) {
          const { pan_number, Dob, MobileNumber, Email } = personalDetails;
          pan_number && setFieldValue("panNumber", pan_number);
          MobileNumber && setFieldValue("mobileNumber", MobileNumber);
          Email && setFieldValue("emailId", Email);
          const arr = TRIM_MONTHS.filter(val => Dob.includes(val));
          if (arr.length) {
            Dob && setFieldValue("dateOfBirth", new Date(Dob));
          } else {
            Dob && setFieldValue("dateOfBirth", new Date(monthFormate(Dob)));
          }
        }
      }
    }
    const userInfoDetails = sessionStorage.getItem("userInfo");
    const contactInfo = sessionStorage.getItem("contactInfo");

    if (contactInfo) {
      const contactInfoDetails = JSON.parse(contactInfo);
      const { mobileNumber, emailId } = contactInfoDetails;
      setFieldValue("mobileNumber", mobileNumber);
      setFieldValue("emailId", emailId);
    }

    if (userInfoDetails) {
      const userRole = getUserRole();
      if (userRole?.toLowerCase() === "familyhead") {
        const selectedPanNumber = sessionStorage.getItem("selectedPan");
        const selectedUserId = sessionStorage.getItem("selectedUserId");
        const familyDetails = sessionStorage.getItem("familyDetails");
        const investorDetails = sessionStorage.getItem("investorDetails") ? JSON.parse(sessionStorage.getItem("investorDetails")) : "";
        investorDetails && setFamilyHeadSelectedDetails(investorDetails);
        selectedPanNumber && setSelectedPan(selectedPanNumber);
        selectedUserId && setSelectedUserId(selectedUserId);
        // setSelectedUserId(filterData.value)
        if (familyDetails) {
          const panArray = [];
          const familyDetailsFromStorage = JSON.parse(familyDetails);
          familyDetailsFromStorage?.payload && setFamilyDetails(familyDetailsFromStorage.payload);
          familyDetailsFromStorage.payload.investorDetails.forEach((val) => {
            if (val.isFamilyHead) {
              const { customerPan, customerDob, customerContactNo, customerEmailId, customerFirstName, customerMiddleName, customerLastName } = val.customerInformation;

              panArray.push(
                {
                  key: customerPan ? customerPan : "",
                  value: "Self",
                  isFamilyHead: val.isFamilyHead,
                  userId: val.userId,
                  customerContactNo: customerContactNo ? customerContactNo : "",
                  customerDob: customerDob ? customerDob : "",
                  customerEmailId: customerEmailId ? customerEmailId : "",
                  customerFirstName: customerFirstName ? customerFirstName : "",
                  customerMiddleName: customerMiddleName ? customerMiddleName : "",
                  customerLastName: customerLastName ? customerLastName : "",
                  customerPan: customerPan ? customerPan : ""
                })
            } else {
              panArray.push(
                {
                  key: val.customerInformation.customerPan,
                  value: val?.customerInformation?.customerFirstName?.trim() + " " + val?.customerInformation?.customerLastName?.trim(),
                  isFamilyHead: val.isFamilyHead,
                  userId: val.userId,
                  customerContactNo: val?.customerInformation?.customerContactNo ? val.customerInformation.customerContactNo : "",
                  customerDob: val?.customerInformation?.customerDob ? val.customerInformation.customerDob : "",
                  customerEmailId: val?.customerInformation?.customerEmailId ? val.customerInformation.customerEmailId : "",
                  customerFirstName: val?.customerInformation?.customerFirstName ? val.customerInformation.customerFirstName : "",
                  customerMiddleName: val?.customerInformation?.customerMiddleName ? val.customerInformation.customerMiddleName : "",
                  customerLastName: val?.customerInformation?.customerLastName ? val.customerInformation.customerLastName : "",
                  customerPan: val?.customerInformation?.customerPan ? val.customerInformation.customerPan : ""
                })
            }
          })
          panArray.length && setUserPanDropDown(panArray);
        }
      } else {
        const userInfo = JSON.parse(userInfoDetails);
        const { pan_number, date_of_birth } = userInfo;
        setUserInfo(userInfo);
        pan_number && setFieldValue("panNumber", pan_number);
        date_of_birth && setFieldValue("dateOfBirth", new Date(monthFormate(date_of_birth)));
      }
    }

    const selectedPan = sessionStorage.getItem("selectedPan");
    selectedPan && setFieldValue("panNumber", selectedPan);

    const role = getUserType();
    if (role === "user") {
      setIsUserTypeRM(false);
    } else {
      setIsUserTypeRM(true);
    }

    const lgLcCode = sessionStorage.getItem("lgLcCode");
    lgLcCode && setFieldValue("lgLcCode", lgLcCode);
  }, []);

  useEffect(() => {
    values.panNumber && formik.validateField("panNumber");
    values.dateOfBirth && formik.validateField("dateOfBirth");
    values.mobileNumber && formik.validateField("mobileNumber");
    values.emailId && formik.validateField("emailId");
    setSessionStorageItem("lgLcCode", values.lgLcCode);

setSessionStorageItem("contactInfo", JSON.stringify({ mobileNumber: values.mobileNumber, emailId: values.emailId }));
  
    
  }, [values]);

  useEffect(() => {
    if (touched.dateOfBirth || errors.dateOfBirth) {
      setMinorErrorModal(true);
    } else {
      setMinorErrorModal(false);
    }
  }, [errors.dateOfBirth]);

  useEffect(() => {
    values.taxResidencyStatus &&
      toggleNriModal({
        show: true,
        message: translate(PERSONAL_DETAILS.taxResidencyErrorMsg),
      });
  }, [values.taxResidencyStatus]);

  useEffect(() => {
    if (props?.journeyData && Object.keys(props?.journeyData).length) {
      const { journeyData: { payload } } = props;
      const payloadData = payload ? payload : {};
      Object.keys(payloadData).length && Object.keys(payloadData).forEach((key) => {
        if (key === "dateOfBirth") {
          setFieldValue("dateOfBirth", new Date(payloadData[key]));
        } else if (key !== "declarationCheck") {
          setFieldValue(key, payloadData[key]);
        }
      })
    }
  }, [props]);

  return (
    <div >
      <div className={`${loading ? 'opacity-50 pointer-events-none' : ''}`}>
        <div className="text-medium text-6xl  text-black">
          {translate(PERSONAL_DETAILS.textHeader)}
        </div>
        <div className="text-regular text-xl mb-5 text-subcontent">
          {
            selectedManufactureId?.toLowerCase() === "pnbhfc"  ? translate(PERSONAL_DETAILS.infoHeaderPNB)  : selectedManufactureId?.toLowerCase() != "unity" ? kycmode === "digilocker" ? translate(PERSONAL_DETAILS.infoHeaderDigiLocker)  : translate(PERSONAL_DETAILS.infoHeaderAadhar) : null
          }
        </div>
        <div>
          <div
            className={`text-regular text-2xl text-light-gray mb-3 w-full ${styles.details_container}`}>
            {
              userPanDropdown.length ?
                <select
                  placeholder="Select PAN number"
                  className={"w-full text-regular text-2xl text-black border border-gray-300 p-2 rounded h-12 mb-3"}
                  aria-label="Default select example"
                  name="selectedPan"
                  onChange={handleDropDownSelection}
                  value={familyHeadSelectedDetails.value}
                  selected={familyHeadSelectedDetails.value}
                >
                  {userPanDropdown?.length &&
                    userPanDropdown.map((item, i) => {
                      return (
                        <>
                          <option className="text-black capitalize">
                            {item.value}
                          </option>
                        </>
                      );
                    })}
                </select> : null
            }
            <div className="grid grid-cols-3 w-full gap-5" >
              <div className="w-full col-span-3 sm:col-span-1 ">
                <input
                  type="text"
                  className={
                    userInfo?.pan_number || Object.keys(familyHeadSelectedDetails).length && familyHeadSelectedDetails.customerPan
                      ? "h-12 input-field text-black rounded w-full bg-neutral-200 cursor-not-allowed"
                      : "h-12 input-field text-black w-full"
                  }
                  placeholder={translate(BASIC_DETAILS.panNo) + "*"}
                  value={values.panNumber}
                  maxLength={10}
                  disabled={userInfo?.pan_number || Object.keys(familyHeadSelectedDetails).length && familyHeadSelectedDetails.customerPan}
                  name="panNumber"
                  onChange={(e) => {
                    const filteredText = charWithNumberInput(e.target.value);
                    debouncedSetFieldValue(filteredText.toUpperCase(), "panNumber")
                  }}
                  onKeyDown={(e) => {
                    if (e.key === " ") {
                      e.preventDefault();
                    }
                  }}
                />
                <div className="mb-3">
                  {touched.panNumber || errors.panNumber ? (
                    <span className="text-base text-light-red">
                      {errors.panNumber}
                    </span>
                  ) : null}
                </div>
              </div>
              <div className="w-full col-span-3 sm:col-span-1 ">
                <div
                  className={
                    userInfo?.date_of_birth || Object.keys(familyHeadSelectedDetails).length && familyHeadSelectedDetails.customerDob
                      ? "py-0.5 mb-3 w-full border border-gray-300 rounded h-12 text-black bg-neutral-200 cursor-not-allowed"
                      : "py-0.5 mb-3 w-full border border-gray-300 rounded h-12 text-black"
                  }
                >
                  <DatePicker
                    defaultValue={values.dateOfBirth}
                    selected={values.dateOfBirth}
                    disabled={userInfo?.date_of_birth || Object.keys(familyHeadSelectedDetails).length && familyHeadSelectedDetails.customerDob}
                    maxDate={new Date()}
                    dateFormat={[
                      "dd-MMM-yyyy",
                      "dd-MM-yyyy",
                      "dd/MMM/yyyy",
                      "dd/MM/yyyy",
                    ]}
                    onChange={(e) => setFieldValue("dateOfBirth", e)}
                    onSelect={(e) => setFieldValue("dateOfBirth", e)}
                    placeholderText={translate(AGENT.dobDMY) + "*"}
                    className={`p-2.5 mb-3 date-input ${userInfo?.date_of_birth && "cursor-not-allowed"}`}
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
                          onChange={({ target: { value } }) => changeYear(value)}
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
                </div>
                {touched.dateOfBirth || errors.dateOfBirth ? (
                  <p className="mb-3 text-base text-light-red">
                    {errors.dateOfBirth}
                  </p>
                ) : null}
              </div>
              <div className="w-full col-span-3 sm:col-span-1 ">
                <input
                  type="text"
                  className={
                    Object.keys(familyHeadSelectedDetails).length && familyHeadSelectedDetails.customerContactNo
                      ? "h-12 input-field text-black w-full bg-neutral-200 cursor-not-allowed"
                      : "h-12 input-field text-black w-full"
                  }
                  placeholder={selectedManufactureId?.toLowerCase() === "usfb" || selectedManufactureId?.toLowerCase() === "sib" || selectedManufactureId?.toLowerCase() === "unity" ? translate(COMMON_CONSTANTS.CNumberAdhar) + "*" : translate(BASIC_DETAILS.contactNumber) + "*"}
                  name="mobileNumber"
                  maxLength={10}
                  value={values.mobileNumber}
                  disabled={Object.keys(familyHeadSelectedDetails).length && familyHeadSelectedDetails.customerContactNo}
                  // disabled={contactDetails?.mobileNumber}
                  onChange={(e) => {
                    const filteredText = numberInput(e.target.value);
                    debouncedSetFieldValue(filteredText.toUpperCase(), "mobileNumber")

                  }}
                />
                <div className="mb-3">
                  {touched.mobileNumber || errors.mobileNumber ? (
                    <span className="text-base text-light-red">
                      {errors.mobileNumber}
                    </span>
                  ) : null}
                </div>
              </div>
            </div>

            <div className=" grid grid-cols-3 w-full gap-5">
              <div className="w-full col-span-3 sm:col-span-1 ">
                <input
                  type="text"
                  className={
                    Object.keys(familyHeadSelectedDetails).length && familyHeadSelectedDetails.customerEmailId
                      ? "h-12 input-field text-black w-full bg-neutral-200 cursor-not-allowed"
                      : "h-12 input-field text-black w-full"
                  }
                  placeholder={translate(AGENT.emailId) + "*"}
                  name="emailId"
                  id="emailId"
                  value={values.emailId}
                  disabled={Object.keys(familyHeadSelectedDetails).length && familyHeadSelectedDetails.customerEmailId}
                  // disabled={contactDetails?.emailId}
                  onChange={(e) => {
                    debouncedSetFieldValue(e.target.value, "emailId");
                  }}
                />
                <div className="mb-3">
                  {touched.emailId || errors.emailId ? (
                    <span className="text-base text-light-red">
                      {errors.emailId}
                    </span>
                  ) : null}
                </div>
              </div>
              <div className="w-full col-span-3 sm:col-span-1 ">
                {touched.dateOfBirth || errors.dateOfBirth ? (
                  <ErrorModal
                    canShow={minorError}
                    updateModalState={toggleMinorErrorModal}
                    errorMessage={translate(KYC_DETAIL.customerCannotMinor)}
                    messageType="alert"
                  />
                ) : null}
                {signInViaPAN && <>
                  <input
                    type="text"
                    className="h-12 input-field text-black w-full"
                    placeholder={translate(KYC_DETAIL.LgLcCodeOptional)}
                    value={values.lgLcCode}
                    name="lgLcCode"
                    onChange={(e) => {
                      debouncedSetFieldValue(e.target.value, "lgLcCode");
                    }}
                    maxLength={20}
                  // onBlur={() => handleLgLcCodeChange()}
                  />
                  <div className="mb-3">
                    {touched.lgLcCode || errors.lgLcCode ? (
                      <span className="text-base text-light-red">
                        {errors.lgLcCode}
                      </span>
                    ) : null}
                  </div>
                </>
                }
              </div>
            </div>
            <div>
              <div className="text-regular text-2xl text-light-gray mb-3">{translate(FD_RENEWAL.residentStatus)} <span className="text-red-700">*</span></div>
              <div className={`mb-3 flex flex-wrap gap-3 ${styles.status_container}`}>
                {Object.keys(RESIDENTIAL_STATUS).map((statusName, index) => {
                  return (
                    <div
                      key={`${statusName + index}`}
                      className="border border-gray-300 text-black  p-3 rounded flex gap-2 items-center w-max"
                    >

                      <input
                        type="radio"
                        name="residentialStatus"
                        checked={values.residentialStatus === RESIDENTIAL_STATUS[statusName]}
                        value={RESIDENTIAL_STATUS[statusName]}
                        className="w-5 h-5 "
                        onChange={(e) =>
                          handleResidentialStatusChange(RESIDENTIAL_STATUS[statusName])
                        }
                      />

                      <label className="align-top " htmlFor={RESIDENTIAL_STATUS[statusName]}>
                        {translate(RESIDENTIAL_STATUS[statusName])}
                      </label>
                    </div>
                  );
                })}
              </div>
              <div className="form-check mb-3 flex gap-3">
                <label className="relative inline-flex cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    defaultChecked={values.taxResidencyStatus}
                    name="taxResidencyStatus"
                    value={values.taxResidencyStatus}
                    role="switch"
                    checked={values.taxResidencyStatus}
                    onChange={handleChange}
                  />
                  <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:accent-primary-green dark:peer-focus:accent-primary-green rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-primary-green"></div>
                </label>
                <div className="">
                  {translate(PERSONAL_DETAILS.taxResidency)}
                </div>
              </div>
            </div>
            {statusVerifyModal?.show ?
              <ValidateOTPModal
                verfiedStatus={{ mobileNumber: verifiedMobile, emailId: verifiedEmail }}
                contactDetails={{ mobileNumber: values.mobileNumber, emailId: values.emailId }}
                headerMessage={selectedManufactureId.toLowerCase() === "bajaj" ? "Verify email id" : translate(REDIRECTION_MSG.VerifyMobileNumberAndEmailId)}
                updateModalState={toggleStatusVerifyModal}
              /> : null
            }
            {
              showNriModal.show && <NriPopUp
                errorMessage={showNriModal.message}
                updateModalState={toggleNriModal}
              />
            }

            {
              Object.keys(onboardingMode).length ? <div className="mb-3 flex items-start gap-3">
                <div>
                  <input
                    type="checkbox"
                    className="accent-primary-green h-4 w-4 hover:cursor-pointer"
                    checked={values.declarationCheck}
                    onChange={handleChange}
                    name="declarationCheck"
                  />
                </div>
                <div className="text-justify text-base text-light-gray">
                  {
                    Object.keys(onboardingMode).length ? concentText() : null
                  }
                </div>
              </div> : null
            }
          </div>
          <div className="flex justify-start mt-7 gap-5">
            {!webView && <Link href={{ pathname: "/product/product_list" }}>
              <button className="button-passive border-fd-primary text-fd-primary">
                {translate(ADDRESS_DETAILS.back)}
              </button>
            </Link>}
            <button
              className={
                (!formik.isValid ||
                  !values.residentialStatus ||
                  values.residentialStatus.includes("NRI") ||
                  !values.declarationCheck ||
                  values.taxResidencyStatus ||
                  loading ||
                  showLoginPage.show) &&
                  !isUserTypeRM
                  ? "button-active  button-transition  text-medium text-xl lg:text-2xl w-fit  "
                  : "button-active btn-gradient  button-transition hover:bg-hover-primary"
              }
              onClick={handleProcessBtnClick}
              disabled={
                (!formik.isValid ||
                  !values.residentialStatus ||
                  values.residentialStatus.includes("NRI") ||
                  !values.declarationCheck ||
                  values.taxResidencyStatus ||
                  loading ||
                  showLoginPage.show) &&
                !isUserTypeRM
              }
            >
              {translate(AGENT.proceed)}
              {loading ? <Loader /> : null}
            </button>
          </div>
          <ErrorModal
            canShow={showModal}
            updateModalState={toggleModal}
            errorMessage={apiErrorMessage}
          />
        </div>
      </div>
      {showLoginPage.show ? (
        <Login
          panDetails={{
            panNumber: values.panNumber,
            dob: dateFormat(values.dateOfBirth),
          }}
          getModalStatus={getModalStatus}
          message={showLoginPage.message}
        />
      ) : null}
      {showContactDetailsPopup?.show ? (
        <ContactDetailsModal
          panDetails={{ panNumber: values.panNumber }}
          modalStatus={showContactDetailsPopup}
          getModalStatus={getUpdateContactDetailsModalStatus}
        />
      ) : null}
    </div>
  );
}

export default CustomerPersonalDetails;

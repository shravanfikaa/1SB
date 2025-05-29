import { useState, useEffect, useMemo } from "react";
import appConfig from "../../app.config";
import { GetApiHandler, PostApiHandler } from "../api/apihandler";
import {
  charWithNumberInput,
  displayINRAmount,

  getFullName,
  getUserType,
  handleEventLogger,
  numberInput,
  checkUpiLimit,
  checkNetBankingLimit,
  isMobile
  
} from "../../lib/util";
import BankPopUp from "./bank_popup.js";
import { LocalStorageHandler } from "../../lib/storage_handler";
import ErrorModal from "../common/errorPopup";
import { BsFillInfoCircleFill } from "react-icons/bs";
import BankDetailsMismatchPopup from "./bankDetailsMismatchPopUp";
import { compareCkycDetailsWithPennyDropDetails } from "../../lib/bankUtils";
import { useFormik } from "formik";
import * as yup from "yup";
import Loader from "../../svg/Loader";
import { ACCOUNT_TYPE, ADDRESS_DETAILS, BANK_DETAILS, BANK_DETAILS_PAGE, BUTTON_NAME, PNB_CONSENTS, COMMON_CONSTANTS, FD_RENEWAL, MY_PROFILE, VALIDATION_CONSTANT, COMMON } from "../../constants";
import bankdetailcss from "../../styles/bank_detail.module.css"
import AlertModal from "../common/AlertModal.jsx";
import { v4 as uuidv4 } from "uuid";
import ContactDetails from './../../_components/ContactDetails';
import { useTranslation } from "react-i18next";



function BankDetails(props) {
  const [showModal, setShowModal] = useState(false);
  const [showPennyDropFailModal, setShowPennyDropFailModal] = useState(false);
  const [accountHolderNameFromPennyDrop, setAccountHolderNameFromPennyDrop] = useState("");
  const [showBankMismatchModal, setShowBankMismatchModal] = useState(false);
  const [isRedirectToReviewPage, setIsRedirectToReviewPage] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [apiErrorMessage, setApiErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [ifscLoading, setIfscLoading] = useState(false);
  const [accountStatusFromPennyDrop, setAccountStatusFromPennyDrop] = useState("");
  const [isChequeMandatory, setIsChequeMandatory] = useState(false);
  const [ifscCodeDetails, setIfscCodeDetails] = useState({
    ifscCode: props.componentData ? props.componentData.bankIfsc : "",
    bankName: props.componentData ? props.componentData.bankName : "",
    bankLogo: "",
    branchName: props.componentData ? props.componentData.branchName : "",
    micrCode: "",
    branchAddress: props.componentData ? props.componentData.branchAddress : ""
  });
  const [personalDetails, setPersonalDetails] = useState({
    account_holder_name: props.componentData ? props.componentData.accountHolderName : "",
    account_holder_email: "",
    account_holder_mobile_number: "",
  });
  const [pennyDropDetails, setPennyDropDetails] = useState({
    pennyDropStatus: props.componentData ? props.componentData.pennyDropStatus : "",
    pennyDropStatusId: props.componentData ? props.componentData.pennyDropStatusId : ""
  });
  const [depositAmount, setDepositAmount] = useState(0);
  const [accountValidationMode, setAccountValidationMode] = useState("");
  const [upiLimit, setUpiLimit] = useState("");
  const [shouldEnableBankDetails, setShouldEnableBankDetails] = useState(false);
  const [upiLimitFromSetupApi, setUpiLimitFromSetupApi] = useState(false);
  const [shouldEnableUpiDetails, setshouldEnableUpiDetails] = useState(false);
  const [showMismatchMsg, setShowMismatchMsg] = useState(false);
  const [showBankingLimitError, setShowBankingLimitError] = useState(false);
  const [paymentLimitError, setPaymentLimitError] = useState("");
  const [shouldEnableContinueBtn, setShouldEnableContinueBtn] = useState(false);
  const [investorVerification, setInvestorVerification] = useState({});
  const [accountNumberOptions, setAccountNumberOptions] = useState([]);
  const [bankAccountSelectedDetails, setBankAccountSelectedDetails] = useState();

  const [selectedManufactureId, setSelectedManufactureId] = useState(() => {
    let id;
    if (typeof window !== "undefined") {
      id = sessionStorage.getItem("selectedManufactureId") ?
        sessionStorage.getItem("selectedManufactureId")
        : props?.componentData?.manufacturerId;
    }
    return id || "";
  });

  const [disclaimerInfoText, setDisclaimerInfoText] = useState({
    consent: "",
    disclaimer: ""
  });
  const { t: translate } = useTranslation();

  let pennyDropCounter = 0;

  const toggleMismatchMsgModal = () => setShowMismatchMsg((state) => !state);
  const togglePennyDropFailModal = () => setShowPennyDropFailModal((state) => !state);
  const toggleBankMismatchModal = () => {
    setShowBankMismatchModal((state) => !state);
    loading && setLoading(false);
  };
  const redirectFromMismatchPopup = () => setIsRedirectToReviewPage(state => !state);
  const toggleModal = () => setShowModal((state) => !state);
  const toggleErrorModal = () => setShowErrorModal((state) => !state);
  const toggleBankingLimitError = () => setShowBankingLimitError((state) => !state);
  const userType = getUserType();

  const initialValues = {
    accountNumber: "",
    ifscCode: "",
    bankCheckbox: true,
    accountType: "Saving Account",
    vpaId: ""
  };

  const validationSchema = yup.object({
    accountNumber: yup
      .string()
      .matches(/^\d{9,18}$/, translate(VALIDATION_CONSTANT.invalidAcc))
      .test("", "", (value) => {
        if (accountValidationMode === "U") {
          return true;
        }
      })
      .required(""),
    ifscCode: yup
      .string()
      // .max(11, "Invalid IFSC Code")
      .matches(/^[a-zA-Z]{4}0[a-zA-Z0-9]{6}$/, translate(VALIDATION_CONSTANT.invalidIFSC))
      // .test("not-paytm", "Transactions through Paytm bank are not allowed", (value) => {
      //   // Check if the value starts with "PYTM"
      //   return value === undefined || !value.startsWith("PYTM");
      // })
      .test("", "", (value) => {
        if (accountValidationMode === "U") {
          return true;
        }
      })
      .required(""),
    vpaId: yup.string().matches(/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+$/, translate(BANK_DETAILS_PAGE.shouldBeValidEmail)).test("", "", (value) => {
      if (accountValidationMode === "A") {
        return true;
      }
    })
  });

  const formik = useFormik({
    initialValues,
    validationSchema,
  });

  const { values, touched, errors, validateField, setValues, setFieldValue, handleChange } = formik;

  useEffect(() => {
    accountValidationMode === "A" && validateField("vpaId");
    accountValidationMode === "U" && validateField("accountNumber");
    accountValidationMode === "U" && validateField("ifscCode");
  }, [accountValidationMode])

  function fetchIFSCDetail(ifscCodeValue) {
    setLoading(true);
    setIfscCodeDetails({
      ifscCode: "",
      bankName: "",
      bankLogo: "",
      branchName: "",
      micrCode: "",
      branchAddress: ""
    });
    if (ifscCodeValue.length === 11) {
      setIfscLoading(true);
      const method = "GET";
      const ifscBankDetailURL =
        appConfig?.deploy?.baseUrl +
        appConfig?.deploy?.getBankbyIfsc + "consumerId=1&IFSCCODE=" + ifscCodeValue?.toUpperCase();
      const bankLogoBaseUrl = appConfig.deploy["bankLogoBaseUrl"];

      GetApiHandler(ifscBankDetailURL, method).then((response) => {
        const { data } = response;
        if (response?.response?.data?.errors?.length) {
          setShowErrorModal(true);
          setApiErrorMessage(response?.response?.data?.errors[0].errorMessage);
        } else {
          const { IFSCCode, bankName, branchAddress, micrCode, branchName, bankLogo } = data.data;
          if (IFSCCode) {
            setShowPennyDropFailModal(false);
            setFieldValue("ifscCode", IFSCCode)
            setIfscCodeDetails({
              ifscCode: ifscCodeValue,
              bankName: bankName,
              bankLogo: bankLogo,
              branchAddress: branchAddress,
              micrCode: micrCode,
              branchName: branchName
            });
          } else {
            setShowPennyDropFailModal(true);
          }
        }
      }).finally(() => {
        setLoading(false);
        setIfscLoading(false);
      });
    }
  }

  const handlePennyDrop = () => {
    pennyDropCounter = pennyDropCounter + 1;

    setShowModal(true);
    !loading && setLoading(true);

    const pennyDropAPIUrl = appConfig?.deploy?.baseUrl + appConfig?.deploy?.pennyDrop;
    const pennyDropRequestBody = {
      ...personalDetails,
      ifsc_code: values.ifscCode,
      account_number: values.accountNumber,
    };

    PostApiHandler(pennyDropAPIUrl, "POST", pennyDropRequestBody).then((pennyDropResponse) => {
      if (pennyDropResponse?.data?.data) {
        //data is present in API call
        const { accountHolderName, accountStatus, status, id } = pennyDropResponse?.data?.data;
        if (accountStatus == "invalid") {
          setApiErrorMessage("You have entered incorrect bank details, consider changing it to proceed");
          setShowErrorModal(true);
          setShowModal(false);
        } else if (id) {
          if (accountHolderName) {
            setAccountHolderNameFromPennyDrop(accountHolderName);
            sessionStorage.setItem("accountHolderName", accountHolderName);
          }
          if (typeof window !== "undefined") {
            sessionStorage.setItem("transactionId", id);
          }
          accountStatus && setAccountStatusFromPennyDrop(accountStatus);
          setPennyDropDetails({ pennyDropStatus: status, pennyDropStatusId: id });

          if (accountStatus == "active" && status == "completed") {
            callStatusVerifyAPI({ pennyDropStatus: status, pennyDropStatusId: id })
          } else if (accountStatus == null && status == "created") {
            //polling should happen
            // setTimeout(() => {
            //   handlePennyDrop();
            // }, appConfig.penny_drop_delay);
            callStatusVerifyAPI({ pennyDropStatus: status, pennyDropStatusId: id })
          } else {
            // Display error
            setShowModal(false);
            setApiErrorMessage("You have entered incorrect bank details, please consider changing it to proceed");
            setShowErrorModal(true);
          }
        } else if (pennyDropCounter < appConfig.penny_drop_counter) {
          //polling should happen
          setTimeout(() => {
            handlePennyDrop();
          }, appConfig.penny_drop_delay);
        } else {
          // Display error
          setShowModal(false);
          setLoading(false)
          setApiErrorMessage("Account details seems to be incorrect, please check the entered details");
          setShowErrorModal(true);
        }
      } else {
        // Display error
        setShowModal(false);
        setLoading(false)
        setApiErrorMessage("Something went wrong please retry or wait");
        setShowErrorModal(true);
      }
    }
    )
  }

  function callStatusVerifyAPI({ pennyDropStatus, pennyDropStatusId }) {
    setLoading(true);
    const verifyStatusAPIUrl = appConfig?.deploy?.baseUrl + appConfig?.deploy?.pennydropStatus;
    const verifyStatusRequestBody = { transactionId: pennyDropStatusId };
    PostApiHandler(verifyStatusAPIUrl, "POST", verifyStatusRequestBody).then(
      (verifyStatusResponse) => {
        const { data } = verifyStatusResponse.data;
        if (data) {
          const { accountStatus, status, accountHolderName } = verifyStatusResponse.data.data;
          if (accountHolderName) {
            setAccountHolderNameFromPennyDrop(accountHolderName);
            sessionStorage.setItem("accountHolderName", accountHolderName);
          }
          if (accountStatus === "active" && status === "completed") {
            // Redirect user to Review page
            setShowModal(false);
            let compareNames;
            setShowModal(false);
            if (accountHolderName && accountHolderName.split(" ").length > 2) {
              const customerName = personalDetails?.account_holder_name?.split(" ");
              const customerNameArr = customerName?.splice(1, 1);

              compareNames = compareCkycDetailsWithPennyDropDetails(
                customerName.join(" "),
                accountHolderName?.toUpperCase()
              );
            } else {
              compareNames = compareCkycDetailsWithPennyDropDetails(
                personalDetails?.account_holder_name?.toUpperCase(),
                accountHolderName?.toUpperCase()
              );
            }

            if (compareNames >= investorVerification?.investorNameVerificationThreshold) {
              setLoading(false);
              setShowBankMismatchModal(false);
              proceedToNextScreen({ pennyDropStatus, pennyDropStatusId });
            } else {
              cancelledChequeVerify({ pennyDropStatus, pennyDropStatusId });
            }
          } else {
            //invalid case
            cancelledChequeVerify({ pennyDropStatus, pennyDropStatusId });
            setShowModal(false);
            setLoading(false);
          }
        } else {
          setApiErrorMessage("Invalid Bank details");
          setShowErrorModal(true);
          setShowModal(false);
          setLoading(false);
        }
      }
    ).finally(() => setLoading(false));
  }

  const handleBackBtnClick = (e) => {
    props.handle(props.prevPage, e, {
      bank_details: bankDetails,
    })
  }

  const handleContinueBtnClick = (e) => {
    setLoading(true);
    setShowModal(true);
    // if (accountValidationMode === "U" || accountValidationMode === "B") {
    if(selectedManufactureId.toLowerCase() === "sib"){
      setLoading(false);
    setShowModal(false);
    const pennyDropStatusId = "none"
    const pennyDropStatus = "success";

      props.handle("review_invest", {}, { bank_details: { ...bankDetails, pennyDropStatus, pennyDropStatusId } }, "bank_details", values);

    }
    else{
    validateVPA();

    }
    // } else {
    //   handlePennyDrop();
    // }
  }

  const proceedToNextScreen = ({ pennyDropStatus, pennyDropStatusId }) => {
    if (props?.isOnboardingUser) {
      const editedBankDetails = {
        ...bankDetails,
        bankAccountNumber: bankDetails.accountNumber,
        bankIfsc: bankDetails.ifscCode
      };
      delete editedBankDetails.accountNumber;
      delete editedBankDetails.ifscCode;
      props.handleSaveDetails({ fundingBankDetails: editedBankDetails });
    } else {
      handleEventLogger("bank_details", "buttonClick", "Invest_Click", {

        action: "Bank_Details_Completed",
        Bank_Name: ifscCodeDetails.bankName,
        Bank_Number: values.bankAccountNumber,
        Deposit_Amt: depositAmount,
        Account_Type: values.accountType,
        Verified_Status: "Success",
        Platform:isMobile()
      });
      props.handle("review_invest", {}, { bank_details: { ...bankDetails, pennyDropStatus, pennyDropStatusId } }, "bank_details", values);
    }
  }

  const cancelledChequeVerify = ({ pennyDropStatus, pennyDropStatusId }) => {
    if (isChequeMandatory && !props.isOnboardingUser) {
      setShowBankMismatchModal(true);
    } else if (props?.isOnboardingUser) {
      setShowBankMismatchModal(true);
    } else if (!isChequeMandatory) {
      setShowMismatchMsg(true);
    } else {
      proceedToNextScreen({ pennyDropStatus, pennyDropStatusId });
    }
  }

  const bankDetails = useMemo(() => {
    return {
      ...ifscCodeDetails,
      ...values,
      ...pennyDropDetails,
    }
  }, [ifscCodeDetails, values, pennyDropDetails]);

  const handleProceedBtnCLick = () => {
    const { pennyDropStatus, pennyDropStatusId } = pennyDropDetails;
    proceedToNextScreen({ pennyDropStatus, pennyDropStatusId });
  }
 
  const getManufacturerDetails = () => {
    const manufacturerProfile = appConfig?.deploy?.baseUrl + appConfig?.deploy?.manufacturerProfile + selectedManufactureId;
    setLoading(true);
    GetApiHandler(manufacturerProfile, "GET").then(
      (response) => {
        setLoading(false);
        if (response?.data?.data) {
          const { manufacturerProperties: { ovdDocuments, validateAccMode, upiLimit, investorVerification } } = response.data.data;
          investorVerification && setInvestorVerification(investorVerification);
          const { isBankCancelledChequeRequired } = ovdDocuments;
          setIsChequeMandatory(isBankCancelledChequeRequired);
          setAccountValidationMode(validateAccMode.toUpperCase());
          upiLimit && setUpiLimit(upiLimit);
        }
      }
    );
  }

  const formatIndianNumber = (number) => {
    return number.toLocaleString('en-IN');
  }

  const checkErrorMessage=(paymentConfigurations, depositAmount)=>{
    const activepaymentMode=paymentConfigurations.filter((item)=>{
     return item?.active && item?.purpose==="initiate_payment"
    })
    const minValue=activepaymentMode[0].additionalConfiguration?.min;
    const maxValue=activepaymentMode[0].additionalConfiguration?.max;
  
    if(minValue && maxValue){
      return `${translate(BANK_DETAILS_PAGE.enterAmoutBetween)} ${minValue} ${translate(COMMON.and)}  ${formatIndianNumber(maxValue)}`
    }
    else if(minValue){
      return `${translate(BANK_DETAILS_PAGE.enterAmountGreaterThan)} ${minValue}`
    }
    else if(maxValue){
      return `${translate(BANK_DETAILS_PAGE.enterAmountLessThan)} ${maxValue}`
    }
  }
  useEffect(() => {
    if (accountNumberOptions.length) {
      if (values.accountNumber) {
        const filterData = accountNumberOptions.find((data) => data.bankAccountId === values.accountNumber);
        if (filterData) {
          setBankAccountSelectedDetails(filterData);
        } else {
          setBankAccountSelectedDetails(accountNumberOptions[0]);
        }
      } else {
        setBankAccountSelectedDetails(accountNumberOptions[0]);
      }
    }
  }, [values.accountNumber, accountNumberOptions]);

  useEffect(() => {
    if (bankAccountSelectedDetails) {
      const { bankAccountType, bankIfsc, bankAccountId, isDefault, vpaId } = bankAccountSelectedDetails;
      setFieldValue("ifscCode", bankIfsc);
      setFieldValue("accountNumber", bankAccountId);
      bankAccountType.toLowerCase().includes("saving") ? setFieldValue("accountType", "Saving Account") : setFieldValue("accountType", "Current Account")
      // setFieldValue("vpaId", vpaId)
    }
  }, [bankAccountSelectedDetails])

  useEffect(() => {
    if(upiLimitFromSetupApi){
      if(depositAmount>0 ){
        if (sessionStorage.getItem("paymentConfigurations")) {
          const paymentConfigurations = JSON.parse(sessionStorage.getItem("paymentConfigurations"));
          console.log("upi fun",checkUpiLimit(paymentConfigurations, depositAmount))
          console.log("net fun",checkNetBankingLimit(paymentConfigurations, depositAmount))
          if(!checkUpiLimit(paymentConfigurations, depositAmount)  && !checkNetBankingLimit(paymentConfigurations, depositAmount)){
            setShowBankingLimitError(true)
            setPaymentLimitError((checkErrorMessage(paymentConfigurations, depositAmount)))
          }
          if(checkNetBankingLimit(paymentConfigurations, depositAmount)){
            setDisclaimerInfoText({
              disclaimer: BANK_DETAILS["A"].disclaimer,
              consent: BANK_DETAILS["A"].consent
            });
          }
          if(checkUpiLimit(paymentConfigurations, depositAmount)){
            setDisclaimerInfoText({
              disclaimer: BANK_DETAILS["U"].disclaimer,
              consent: BANK_DETAILS["U"].consent
            });
          }
          setshouldEnableUpiDetails(!checkUpiLimit(paymentConfigurations, depositAmount))
          setShouldEnableBankDetails(!checkNetBankingLimit(paymentConfigurations, depositAmount));
        }
      }
    }
    else{
       if(depositAmount<=upiLimit){
        setshouldEnableUpiDetails(true);
       }
    if (accountValidationMode === "B" || accountValidationMode === "U") {
      if (depositAmount <= upiLimit) {
        if (accountValidationMode === "B") {
          setDisclaimerInfoText({
            disclaimer: BANK_DETAILS["U"].disclaimer,
            consent: BANK_DETAILS["U"].consent
          });
        }
        setShouldEnableBankDetails(true);
      } else {
        if (accountValidationMode === "B") {
          setDisclaimerInfoText({
            disclaimer: BANK_DETAILS["A"].disclaimer,
            consent: BANK_DETAILS["A"].consent
          });
        }
        setShouldEnableBankDetails(false);
      }
    } else {
      setShouldEnableBankDetails(false);
}
}
  }, [accountValidationMode, upiLimit])

  const validateVPA = () => {
    const validateAccount = appConfig?.deploy?.baseUrl + appConfig?.deploy?.validateAccount;
    const { account_holder_name, account_holder_email, account_holder_mobile_number } = personalDetails;
    const { isNameVerificationRequired, bypassAndContinueIFNotMatched, investorNameVerificationThreshold } = investorVerification;

    const requestPayload = {
      "referenceId": uuidv4().replaceAll("-", ""),
      "manufacturerCode": selectedManufactureId,
      "customer": {
        "bankAccountNumber": values.accountNumber ? values.accountNumber : undefined,
        "bankIFSC": values.ifscCode ? values.ifscCode : undefined,
        "VPAId": values.vpaId ? values.vpaId : undefined,
        "name": account_holder_name ?? undefined,
        "email": account_holder_email ?? undefined,
        "phone": account_holder_mobile_number ?? undefined
      },
      "currencyCode": "INR",
      "varFields": {
        "applicationNo": uuidv4().replaceAll("-", "")
      }
    }

    PostApiHandler(validateAccount, "POST", requestPayload).then(
      (response) => {
        setShowModal(false);
        if (response?.data?.errors && Object.keys(response?.data?.errors).length) {
          toggleErrorModal();
          setApiErrorMessage(response.data.errors[0].errorMessage || "Something went wrong, Please retry!");
        } else if (response?.data?.data) {
          if (response?.data?.data && Object.keys(response?.data?.data).length) {
            const { status, utr, statusDescription, accountHolderName } = response?.data?.data;
            accountHolderName && setAccountHolderNameFromPennyDrop(accountHolderName);
            status && setAccountStatusFromPennyDrop(status);

            if (status === "success") {
              let compareNames;
              if (accountHolderName && accountHolderName.split(" ").length > 2) {
                compareNames = compareCkycDetailsWithPennyDropDetails(
                  personalDetails?.account_holder_name?.toUpperCase(),
                  accountHolderName?.toUpperCase()
                );
              } else if (accountHolderName?.split(" ").length === personalDetails?.account_holder_name.split(" ").length) {
                compareNames = compareCkycDetailsWithPennyDropDetails(
                  personalDetails?.account_holder_name?.toUpperCase(),
                  accountHolderName?.toUpperCase()
                );
              } else {
                const customerName = personalDetails?.account_holder_name?.split(" ");
                const customerNameArr = customerName?.splice(1, 1);
                compareNames = compareCkycDetailsWithPennyDropDetails(
                  customerName.join(" ").toUpperCase(),
                  accountHolderName?.toUpperCase()
                );
              }
              setPennyDropDetails({ pennyDropStatus: status, pennyDropStatusId: utr });
              if (isNameVerificationRequired) {
                if (selectedManufactureId?.toLowerCase() === "usfb" || selectedManufactureId?.toLowerCase() === "sib") {
                  if (compareNames >= investorNameVerificationThreshold || bypassAndContinueIFNotMatched) {
                    setLoading(false);
                    setShowBankMismatchModal(false);
                    proceedToNextScreen({ pennyDropStatus: status, pennyDropStatusId: utr });
                  } else {
                    toggleErrorModal(showErrorModal);
                    setApiErrorMessage("Name in the KYC record and Bank account holder name does not match completely.");
                    // cancelledChequeVerify({ pennyDropStatus: status, pennyDropStatusId: utr });
                  }
                } else {
                  if (compareNames >= investorNameVerificationThreshold || bypassAndContinueIFNotMatched) {
                    setLoading(false);
                    setShowBankMismatchModal(false);
                    proceedToNextScreen({ pennyDropStatus: status, pennyDropStatusId: utr });
                  } else {
                    cancelledChequeVerify({ pennyDropStatus: status, pennyDropStatusId: utr });
                  }
                }
              }

            } else {
              toggleErrorModal();
              setApiErrorMessage(statusDescription);
            }
          } else {
            if (response?.data?.errors && Object.keys(response?.data?.errors).length) {
              toggleErrorModal();
              setApiErrorMessage(response.data.errors[0].errorMessage || "Something went wrong, Please retry!");
            }
          }
        }
        setLoading(false);
      }
    );
  }

  useEffect(() => {
    if (accountValidationMode) {
      if (accountValidationMode !== "B") {
        if (selectedManufactureId?.toLowerCase() === "sib") {
          setDisclaimerInfoText({
            disclaimer: BANK_DETAILS[accountValidationMode].disclaimerSIB,
            consent: BANK_DETAILS[accountValidationMode].consentSIB
          });
        }
        else if (selectedManufactureId?.toLowerCase() === "pnbhfc") {
          setDisclaimerInfoText({
            disclaimer: BANK_DETAILS[accountValidationMode].disclaimer,
            consent: BANK_DETAILS[accountValidationMode].consentPNB
          });
        }
        else {
          setDisclaimerInfoText({
            disclaimer: BANK_DETAILS[accountValidationMode].disclaimer,
            consent: BANK_DETAILS[accountValidationMode].consent
          });
        }
      }
    }
  }, [accountValidationMode])

  useEffect(() => {
    if (accountValidationMode === "U") {
      setShouldEnableContinueBtn(!(values.vpaId && !errors?.vpaId));
    } else if (accountValidationMode === "A") {
      setShouldEnableContinueBtn(!(values.accountNumber && !errors?.accountNumber && values.ifscCode && !errors?.ifscCode));
    } else if (accountValidationMode === "B") {
      if (values.vpaId) {
        setShouldEnableContinueBtn(!(values.vpaId && !errors?.vpaId));
      } else {
        setShouldEnableContinueBtn(!(values.accountNumber && !errors?.accountNumber && values.ifscCode && !errors?.ifscCode));
      }
    }
  }, [values, accountValidationMode, errors])

  useEffect(() => {
    if (props.isOnboardingUser && isRedirectToReviewPage) {
      const editedBankDetails = {
        ...bankDetails,
        bankAccountNumber: bankDetails.accountNumber,
        bankIfsc: bankDetails.ifscCode
      };
      delete editedBankDetails.accountNumber;
      delete editedBankDetails.ifscCode;
      props.handleSaveDetails({ bankDetail: editedBankDetails });
    } else if (!props.isOnboardingUser && isRedirectToReviewPage) {
      props.handle(
        "review_invest",
        { review_invest: "review_invest" },
        { bank_details: bankDetails },
        "bank_details",
        values
      );
    }
  }, [isRedirectToReviewPage]);

  useEffect(() => {
    if (values.ifscCode.length === 11) {
      fetchIFSCDetail(values.ifscCode)
    }
  }, [values.ifscCode]);

  useEffect(() => {
    if (depositAmount && upiLimit) {
      if (depositAmount > upiLimit) {
        values.vpaId && setFieldValue("vpaId", "");
      } else {
        if (accountValidationMode === "B" || accountValidationMode === "U") {
          if (depositAmount <= upiLimit) {
            values.accountNumber && setFieldValue("accountNumber", "");
            values.ifscCode && setFieldValue("ifscCode", "");
            setIfscCodeDetails({
              ifscCode: "",
              bankName: "",
              bankLogo: "",
              branchName: "",
              micrCode: "",
              branchAddress: ""
            });
          }
        }
      }
    }
  }, [values.vpaId, upiLimit, depositAmount]);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
    const localStorageData = new LocalStorageHandler().getLocalStorage();
    if(sessionStorage.getItem("paymentConfigurations")){
      const paymentConfigurations = JSON.parse(sessionStorage.getItem("paymentConfigurations"));
    if(paymentConfigurations?.length>0){
      paymentConfigurations.map((item) => {
        if (item?.additionalConfiguration) {
          if (item?.purpose === "initiate_payment" && item?.additionalConfiguration["mode"] === "UPI") {
            setUpiLimitFromSetupApi(true)
          }
        }
      })
    }
    }
    
    getManufacturerDetails();
    if (props?.componentData) {
      props.componentData.depositAmount && setDepositAmount(parseInt(props.componentData.depositAmount));
      const { bankAccountNumber, bankIfsc, bankCheckbox, accountType, vpaId } = props.componentData;
      fetchIFSCDetail(bankIfsc);
      const valuesKeys = Object.keys(values)
      Object.keys(props.componentData).forEach((val) => {

        if (valuesKeys.includes(val)) {
          setFieldValue(val, props.componentData[val]);
        }
        else {
          setFieldValue('accountNumber', bankAccountNumber);
          setFieldValue('ifscCode', bankIfsc);
          setFieldValue('bankCheckbox', bankCheckbox);
          setFieldValue('accountType', accountType);
          setFieldValue("vpaId", vpaId)
        }
      }
      )
    }
    else if (localStorageData) {
      const productIdLocal = sessionStorage.getItem("selectedProductId");
      const productData = JSON.parse(sessionStorage.getItem(productIdLocal));
      if (productData) {
        const { CkycApiData, bank_details, investment_details } = productData;
        const ckycLocalStorageData = CkycApiData && CkycApiData["PERSONAL DETAILS"];
        const personalDetailsData = ckycLocalStorageData ? ckycLocalStorageData : {};

        if (Object.keys(personalDetailsData).length) {
          const { FirstName, MiddleName, LastName, MobileNumber, Email, } = personalDetailsData;
          const fullName = getFullName(FirstName, MiddleName, LastName);
          setPersonalDetails({
            account_holder_name: fullName,
            account_holder_email: Email ? Email : "",
            account_holder_mobile_number: MobileNumber ? MobileNumber : "",
          });
        }
        const role = getUserType();

        if (role !== "user") {
          const rmCustomerData = JSON.parse(sessionStorage.getItem('rm_customer_data'));
          if (rmCustomerData) {
            const { first_name, middle_name, last_name, mobile_number, email_id, } = rmCustomerData;
            const fullName = getFullName(first_name, middle_name, last_name);
            setPersonalDetails({
              account_holder_name: fullName,
              account_holder_email: email_id ? email_id : "",
              account_holder_mobile_number: mobile_number ? mobile_number : "",
            });
          }
        }

        if (bank_details) {
          const { accountNumber, ifscCode, bankCheckbox, accountType,
            bankName, bankLogo, pennyDropStatusId, pennyDropStatus,
            branchAddress, micrCode, branchName, vpaId } = bank_details;
          setValues({
            accountNumber: accountNumber ? accountNumber : "",
            ifscCode: ifscCode ? ifscCode : "",
            bankCheckbox: bankCheckbox ? bankCheckbox : false,
            accountType: accountType ? accountType : "",
            vpaId: vpaId ? vpaId : ""
          });
          setIfscCodeDetails({
            ifscCode: ifscCode ? ifscCode : "",
            bankName: bankName ? bankName : "",
            bankLogo: bankLogo ? bankLogo : "",
            branchAddress: branchAddress ? branchAddress : "",
            micrCode: micrCode ? micrCode : "",
            branchName: branchName ? branchName : ""
          });
          setPennyDropDetails({
            pennyDropStatus: pennyDropStatus ? pennyDropStatus : "",
            pennyDropStatusId: pennyDropStatusId ? pennyDropStatusId : ""
          })
        }

        if (investment_details) {
          const { depositAmount } = investment_details;
          if (depositAmount) {
            setDepositAmount(depositAmount)
          }
        }
      }
    }
    const selectedUserId = sessionStorage.getItem("selectedUserId");

    if (selectedUserId) {
      const familyDetails = JSON.parse(sessionStorage.getItem("familyDetails"));
      if (familyDetails?.payload?.investorDetails) {
        const investorDetails = familyDetails.payload.investorDetails.find(details => details.userId === Number(selectedUserId));
        investorDetails?.fundingBankDetails?.length && setAccountNumberOptions(investorDetails.fundingBankDetails);
      }
    }
  }, []);

  useEffect(() => {
    if (props?.journeyData && Object.keys(props?.journeyData).length) {
      const { journeyData: { payload } } = props;
      const payloadData = payload ? payload : {};
      Object.keys(payloadData).length && Object.keys(payloadData).forEach((key) => {
        setFieldValue(key, payloadData[key]);
      })
    }
  }, [props])

  return (
    <div className="mb-3">
      <div>
        <div className="block h-auto w-full">
          <div className="text-medium text-6xl mb-3 text-black">
            {translate(BANK_DETAILS_PAGE.addPaymentDetails)}
          </div>
          <ErrorModal
            canShow={showErrorModal}
            updateModalState={toggleErrorModal}
            errorMessage={apiErrorMessage}
          />
          <ErrorModal
            canShow={showBankingLimitError}
            updateModalState={toggleBankingLimitError}
            errorMessage={paymentLimitError}
          />
          <ErrorModal
            canShow={showPennyDropFailModal}
            updateModalState={togglePennyDropFailModal}
            errorMessage={"You have provided invalid Bank Details"}
          />
          {
            showMismatchMsg ? <AlertModal
              updateModalState={toggleMismatchMsgModal}
              handleProceedBtnCLick={handleProceedBtnCLick}
              errorMessage={translate(BANK_DETAILS_PAGE.mismatchBankAccountErrorMsg)}
            /> : null
          }
          {/* <div className="text-regular text-xl mb-5 text-subcontent">
            {disclaimerInfoText ? translate(disclaimerInfoText.disclaimer) : ""}
          </div> */}
          <BankPopUp
            canShow={showModal}
            updateModalState={toggleModal}
            apiMessage={apiErrorMessage}
          />
          <BankDetailsMismatchPopup
            canShow={showBankMismatchModal}
            accountValidationMode={accountValidationMode}
            updateModalState={toggleBankMismatchModal}
            apiMessage={"toggleBankMismatchModal"}
            accountHolderNameFromPennyDrop={accountHolderNameFromPennyDrop}
            userName={personalDetails.account_holder_name}
            accountStatusFromPennyDrop={accountStatusFromPennyDrop}
            ifscCode={values.ifscCode}
            accountNumber={values.accountNumber}
            vpaId={values.vpaId}
            redirectFromMismatchPopup={redirectFromMismatchPopup}
            isChequeMandatory={isChequeMandatory}
            ocrThresholdLimit={investorVerification?.investorNameVerificationThreshold}
          />
          <div className={`justify-between ${bankdetailcss.card_positioning}`}>
            <div className={bankdetailcss.input_width}>
              <div>
                <div className="m-auto text-regular text-2xl text-light-gray flex flex-col justify-start space-y-3 ">
                  <form className="flex flex-col">
                    {
                      (accountValidationMode === "B" || accountValidationMode === "U") ? <>
                        <input
                          className={
                            shouldEnableUpiDetails
                              ? "p-2 input-field rounded text-black w-full bg-neutral-200 cursor-not-allowed m-0 mb-3"
                              : "p-2 input-field rounded text-black w-full m-0 mb-3"
                          }
                          type="text"
                          onChange={(e) => {
                            setFieldValue("vpaId", e.target.value);
                          }}
                          name="vpaId"
                          disabled={shouldEnableUpiDetails}
                          value={values.vpaId}
                          placeholder={translate(COMMON_CONSTANTS.vpaId)}
                        />
                        {errors.vpaId || touched.vpaId ? (
                          <div className="text-light-red text-base mb-3">
                            {errors.vpaId}
                          </div>
                        ) : null}
                        <div className="flex flex-wrap mb-3 gap-3">
                          <BsFillInfoCircleFill />
                          <div className="text-regular text-base text-light-gray">
                            {translate(BANK_DETAILS_PAGE.shouldBeValidEmail)}
                          </div>
                        </div>
                        {
                          <div className="h-10 text-center text-bold text-fd-primary w-full m-0">
                            {`--- ${translate(COMMON_CONSTANTS.or)} ---`}
                          </div>
                        }
                      </> : null
                    }
                    {
                      accountValidationMode === "B" || accountValidationMode === "A" ?
                        <>
                          {
                            (accountNumberOptions.length  && !shouldEnableBankDetails)? <select
                              placeholder={translate(ADDRESS_DETAILS.permanentAddressLine)}
                              className={"w-full text-regular text-2xl text-black border border-gray-300 p-2 rounded p-2 mb-3"}
                              aria-label="Default select example"
                              name="selectedAccountNumber"
                              onChange={(e) => {
                                const filterData = accountNumberOptions.find((data) => data.bankAccountId === e.target.value);
                                setBankAccountSelectedDetails(filterData);
                                setFieldValue("accountNumber", filterData.bankAccountId);
                              }}
                              value={bankAccountSelectedDetails?.bankAccountId}
                              selected={bankAccountSelectedDetails?.bankAccountId}
                            >
                              {accountNumberOptions?.length &&
                                accountNumberOptions.map((item, i) => {
                                  return (
                                    <>
                                      <option className="text-black capitalize">
                                        {item.bankAccountId}
                                      </option>
                                    </>
                                  );
                                })}
                            </select> : <input
                              className={
                                shouldEnableBankDetails
                                  ? "p-2 input-field rounded text-black w-full bg-neutral-200 cursor-not-allowed m-0 mb-3"
                                  : "p-2 input-field rounded text-black w-full m-0 mb-3"
                              }
                              type="text"
                              onChange={(e) => {
                                const filteredText = numberInput(e.target.value);
                                setFieldValue("accountNumber", filteredText);
                              }}
                              name="accountNumber"
                              value={values.accountNumber}
                              maxLength={18}
                              disabled={shouldEnableBankDetails}
                              placeholder={translate(MY_PROFILE.accountNumber)}
                            />
                          }
                          {errors.accountNumber || touched.accountNumber ? (
                            <div className="text-light-red text-base mb-3">
                              {errors.accountNumber}
                            </div>
                          ) : null}
                          <div className="flex flex-wrap mb-3 gap-3">
                            <BsFillInfoCircleFill />
                            <div className="text-regular text-base text-light-gray">
                              {translate(BANK_DETAILS_PAGE.shouldBeNameOfApplicant)}
                            </div>
                          </div>
                          <input
                            className={
                              shouldEnableBankDetails
                                ? "p-2 input-field rounded text-black w-full bg-neutral-200 cursor-not-allowed m-0 mb-3"
                                : "p-2 input-field rounded text-black w-full m-0 mb-3"
                            }
                            type="text"
                            onChange={(e) => {
                              const filteredText = charWithNumberInput(e.target.value);
                              setFieldValue("ifscCode", filteredText);
                            }}
                            onKeyUp={(e) => e.target.value?.length === 11 && fetchIFSCDetail(e.target.value)}
                            name="ifscCode"
                            disabled={shouldEnableBankDetails}
                            maxLength={11}
                            value={values.ifscCode.toUpperCase()}
                            placeholder={translate(MY_PROFILE.ifscCode)}
                          />
                          {errors.ifscCode || touched.ifscCode ? (
                            <div className="text-light-red text-base mb-3">
                              {errors.ifscCode}
                            </div>
                          ) : null}
                        </>
                        : null
                    }
                  </form>
                </div>
                {
                  accountValidationMode === "B" || accountValidationMode === "A" ? <>
                    {
                      ifscLoading ? (
                        <div className="flex justify-center items-center">
                          <div
                            className="text-fd-primary spinner-border animate-spin inline-block w-8 h-8 border-4 rounded-full mt-2"
                            role="status"
                          >
                            <span className="text-indigo-500"></span>
                          </div>
                        </div>
                      ) :
                        ifscCodeDetails.bankName && values.ifscCode ? (
                          <div className="w-full">
                            <div className="mb-3 flex flex-wrap space-x-5 w-full btn-gradient">
                              <div className="flex flex-wrap border border-gray-300 shadow p-3 w-full rounded">
                                <div className="flex  items-center space-x-5 w-full">
                                  <div className="w-[10%] page-gradient">
                                    <img
                                      src={ifscCodeDetails.bankLogo}
                                      width="40"
                                      height="40"
                                      objectFit={"contain"}
                                    ></img>
                                  </div>
                                  <div className="w-auto text-regular flex flex-wrap sm:flex-nowrap gap-2 text-xl text-white">
                                    <div className="mb-1 text-regular text-xl text-white">{ifscCodeDetails.bankName}</div>
                                    <div className="mb-1 text-regular text-xl text-white">A/C : {values.accountNumber}</div>
                                    <div>IFSC : {ifscCodeDetails.ifscCode}</div>
                                  </div>
                                </div>
                              </div>
                            </div>
                            <div className="mb-8 flex flex-wrap space-x-5">
                              <select
                                className="w-full
                              text-regular text-2xl p-3 text-black border border-gray-300  bg-white p-1 w-full rounded mb-"
                                onChange={handleChange}
                                value={values.accountType}
                                name="accountType"
                              >
                                {ACCOUNT_TYPE.map((item, index) => {
                                  return (
                                    <>
                                      <option
                                        value={item}
                                        key={index}
                                        selected={item}
                                      >
                                        {" "}
                                        {translate(item)}
                                      </option>
                                    </>
                                  );
                                })}
                              </select>
                            </div>
                          </div>
                        ) : null
                    }
                  </> : null}
                {
                  userType === 'user' &&
                  <div className="flex">
                    <div>
                      <input
                        id="default-checkbox"
                        type="checkbox"
                        name="bankCheckbox"
                        checked={values.bankCheckbox}
                        onChange={handleChange}
                        className="accent-primary-green w-4 mb-2 h-4 mt-1 pl-6 bg-cyan-600 bg-gray-100 rounded border-gray-300"
                      />
                    </div>
                    <div className="w-full">
                      <div className="text-regular text-2xl text-light-gray text-black mb-3 ml-3">
                        {disclaimerInfoText ? translate(disclaimerInfoText.consent) : ""}
                      </div>
                    </div>
                  </div>
                }
                {
                  selectedManufactureId?.toUpperCase() === "PNBHFC" &&
                  <div className="flex flex-wrap">
                    <div className="w-full">
                      <div className="text-justify text-base text-light-gray mb-3">
                        {PNB_CONSENTS?.bank_details_note ? PNB_CONSENTS.bank_details_note : ""}
                      </div>
                    </div>
                  </div>
                }
              </div>
            </div>
            <div className={bankdetailcss.greencard_width}>
              <div className=" text-medium text-black text-3xl">
                <div className="page-background rounded-xl w-auto justify-center flex flex-col ">
                  <span className="flex justify-start text-black m-3">
                    {translate(FD_RENEWAL.depositAmount)}
                  </span>
                  <span className="text-fd-primary flex justify-start mx-3 pb-3">
                    ₹ {displayINRAmount(depositAmount)}
                  </span>
                </div>
              </div>
            </div>
          </div>
          {props.isOnboardingUser ?
            <div className="flex flex-wrap justify-center space-x-5 mt-7">
              <button
                className={(loading || shouldEnableContinueBtn || (userType === 'user' && !values.bankCheckbox)) ? "button-active  button-transition hover:bg-hover-primary text-medium text-xl lg:text-2xl w-fit   text-medium text-xl lg:text-2xl w-fit  hover:button-shadow" : "button-active btn-gradient button-transition hover:bg-hover-primary text-medium text-xl lg:text-2xl w-fit   text-medium text-xl lg:text-2xl w-fit  hover:button-shadow"}
                disabled={loading || shouldEnableContinueBtn || (userType === 'user' && !values.bankCheckbox)}
                onClick={handleContinueBtnClick}
              >
                {translate(ADDRESS_DETAILS.save)}
                {loading ? <Loader /> : null}
              </button>
              <button
                className="block button-passive border-fd-primary text-fd-primary"
                onClick={props.handleClose}
              >
                {translate(ADDRESS_DETAILS.close)}
              </button>

            </div>
            :
            <div className="flex flex-wrap justify-start space-x-5 mt-7">
              <button
                className="button-passive border-fd-primary text-fd-primary"
                onClick={(e) => handleBackBtnClick(e)}
              >
                {translate(BUTTON_NAME.back)}
              </button>
              <button
                className={(loading || shouldEnableContinueBtn || (userType === 'user' && !values.bankCheckbox)) ? "button-active  button-transition hover:bg-hover-primary text-medium text-xl lg:text-2xl w-fit   text-medium text-xl lg:text-2xl w-fit  hover:button-shadow" : "button-active btn-gradient button-transition hover:bg-hover-primary text-medium text-xl lg:text-2xl w-fit   text-medium text-xl lg:text-2xl w-fit  hover:button-shadow"}
                disabled={loading || shouldEnableContinueBtn || (userType === 'user' && !values.bankCheckbox)}
                onClick={handleContinueBtnClick}
              >
                {translate(COMMON_CONSTANTS.continueLabel)}
                {loading ? <Loader /> : null}
              </button>
            </div>}
        </div>
      </div>
    </div>
  );
}

export default BankDetails;

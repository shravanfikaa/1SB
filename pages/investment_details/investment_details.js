import { useState, useEffect, useRef } from "react";
import appConfig from "../../app.config";
import { GetApiHandler, PostApiHandler } from "../api/apihandler";
import { BsFillInfoCircleFill } from "react-icons/bs";
import { LocalStorageHandler } from '../../lib/storage_handler'
import Image from "next/image";
import {
  displayINRAmount,
  formatDate, getFullName, extractedMaturityInstructionValue,
  handleEventLogger, getUserType, numberInput, dd_mm_yyyy_format, isMobile, getFinancialYear
} from "../../lib/util";
import ErrorModal from "../common/errorPopup";
import { getProductId } from "../../lib/review_utils";
import { process_disclaimers } from "../../lib/disclaimer_handler";
import { filterDepositAmountQuickTipArray } from "../../lib/investment_utils";
import "react-loading-skeleton/dist/skeleton.css";
import InterestRateModal from "./investmentInterestRateModal";
import { useFormik } from "formik";
import * as yup from 'yup';
import { ADDRESS_DETAILS, COMMON_CONSTANTS, FD_RENEWAL, INVESTMENT_DETAILS, MATURITY_INSTRUCTION, AFTER_REVIEW, INVESTMENT, DETAIL_FD, PNB_MATURITY_INSTRUCTION, COMPONENTS, UNITY_MATURITY_INSTRUCTION, LIC_MATURITY_INSTRUCTION } from "../../constants";
import investmentdetailcss from "../../styles/investment_details.module.css"
import { BottomSheet } from 'react-spring-bottom-sheet';
import 'react-spring-bottom-sheet/dist/style.css';
import { IoIosArrowUp } from "react-icons/io";
import { AiOutlineClose } from "react-icons/ai";
import { useTranslation } from "react-i18next";
import TenureSelect from "../common/SearchSelect";

function InvestmentDetails(props) {
  const [tenureMasterDetails, setTenureMasterDetails] = useState({});
  const [userAge, setUserAge] = useState();
  const [productDetails, setProductDetails] = useState({})
  const [depositAmountDropdown, setDepositAmountDropdown] = useState([]);
  const [interestRates, setInterestRates] = useState();
  const [selectedInterestRate, setSelectedInterestRate] = useState();
  const [payoutFrequency, setPayoutFrequency] = useState([]);
  const [maturityCalculationData, setMaturityCalculationData] = useState({});
  const [totalDaysToMatureFD, setTotalDaysToMatureFD] = useState(0);
  const [declarationData, setDeclarationData] = useState({});
  const [isYearClicked, setIsYearClicked] = useState(false)
  const [isMonthClicked, setIsMonthClicked] = useState(false)
  const [isDayClicked, setIsDayClicked] = useState(false)
  const [isDepositAmountClicked, setIsDepositAmountClicked] = useState(false)
  const [fdDetails, setFdDetails] = useState({});
  const [isTenureDataLoaded, setIsTenureDataLoaded] = useState(false);
  const [isProductDetailsLoaded, setIsProductDetailsLoaded] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showInterestRateModal, setShowInterestRateModal] = useState(false);
  const [apiErrorMessage, setApiErrorMessage] = useState("")
  const [loading, setLoading] = useState(false);
  const [investmentDetails, setInvestmentDetails] = useState({});
  const [open, setOpen] = useState(false);
  const [editedInvestDetails, setEditedInvestDetails] = useState({});
  const [productType, setProductType] = useState("");
  const [personalData, setPersonalData] = useState({
    gender: "",
    dob: ""
  });
  const [showDepositAmountModal, setShowDepositAmountModal] = useState(false);
  const [minMaxAmounts, setMinMaxAmounts] = useState({});
  const [selectedManufactureId, setSelectedManufactureId] = useState(() => {
    let id;
    if (typeof window !== "undefined") {
      id = sessionStorage.getItem("selectedManufactureId") ?
        sessionStorage.getItem("selectedManufactureId")
        : props?.componentData?.manufacturerId;
    }
    return id || "";
  });
  const [maturityInstruction, setMaturityInstruction] = useState(MATURITY_INSTRUCTION);

  const monthDropdownRef = useRef(null);
  const yearDropdownRef = useRef(null);
  const dayDropdownRef = useRef(null);
  const depositDropdownRef = useRef(null);

  const toggleModal = () => setShowModal(state => !state);
  const toggleInterestRateModal = () => setShowInterestRateModal(state => !state);
  const userType = getUserType();
  const { t: translate } = useTranslation();

  function convertToNumberAbbreviations(depositAmount) {

    if (depositAmount >= 1000 && depositAmount < 100000) {
      return depositAmount / 1000 + translate(COMMON_CONSTANTS.k);
    } else if (depositAmount == 100000) {
      return depositAmount / 100000 + translate(COMMON_CONSTANTS.lakh);
    } else if (depositAmount > 100000 && depositAmount < 10000000) {
      return depositAmount / 100000 + translate(COMMON_CONSTANTS.lakhs);
    } else if (depositAmount >= 10000000) {
      return depositAmount / 10000000 + translate(COMMON_CONSTANTS.cr);
    }

    return depositAmount;
  }

  const getPersonalData = () => {
    const personalData = {
      gender: "",
      dob: ""
    }
    const selectedPanNumber = sessionStorage.getItem("selectedPan");

    if (selectedPanNumber) {
      const familyDetails = JSON.parse(sessionStorage.getItem("familyDetails"));
      const investorDetails = familyDetails.payload.investorDetails.filter((investor) => investor.customerInformation.customerPan === selectedPanNumber);
      if (investorDetails.length) {
        const { customerDob, customerGender } = investorDetails[0].customerInformation
        personalData.gender = customerGender ? customerGender : "";
        personalData.dob = customerDob ? customerDob : "";
      }
    }
    const productIdLocal = sessionStorage.getItem("selectedProductId");
    if (productIdLocal && sessionStorage[productIdLocal]) {
      const productData = JSON.parse(sessionStorage[productIdLocal]);
      const { CkycApiData, basic_details } = productData;

      if (CkycApiData) {
        const { "PERSONAL DETAILS": details, } = CkycApiData;
        if (details?.dateOfBirth) {
          personalData.dob = details?.dateOfBirth ? dd_mm_yyyy_format(new Date(details.dateOfBirth)) : "";
        }
        if (CkycApiData?.pidData?.gender) {
          personalData.gender = CkycApiData?.pidData?.gender ? CkycApiData.pidData.gender : "";
        } else if (basic_details?.gender) {
          personalData.gender = basic_details?.gender || "";
        }
      }
      if (userType === "rm" || userType === "admin") {
        if (sessionStorage.getItem("rm_customer_data")) {
          const rmCustomerData = JSON.parse(sessionStorage.getItem('rm_customer_data'));
          const { gender, date_of_birth } = rmCustomerData;
          personalData.gender = gender
          personalData.dob = date_of_birth
        }
      }


      setPersonalData(personalData);
    }
  }

  useEffect(() => {
    if (selectedManufactureId?.toUpperCase() === "PNBHFC") {
      setMaturityInstruction(PNB_MATURITY_INSTRUCTION);
    }
    else if (selectedManufactureId?.toUpperCase() === "UNITY") {
      setMaturityInstruction(UNITY_MATURITY_INSTRUCTION);
    }
    else if (selectedManufactureId?.toUpperCase() === "LICHFL") {
      setMaturityInstruction(LIC_MATURITY_INSTRUCTION)
    }
  }, [selectedManufactureId]);

  useEffect(() => {
    const productType = sessionStorage.getItem("selectedProductType")
      ? sessionStorage.getItem("selectedProductType") : props?.componentData?.productType;
    setProductType(productType);
    getPersonalData();
  }, []);

  const initialValues = {
    form15g: false,
    disclaimerCheckbox: false,
    maturity: "",
    payout: "",
    depositAmount: "",
    tenureDays: "",
    tenureMonths: "",
    tenureYears: ""
  }

  const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

  const validationSchema = yup.object({
    depositAmount: yup.number()
      .test("Is multiple of given amount", `${INVESTMENT_DETAILS.amountMultipleOf(fdDetails.fdMultiples)}`, (value) => {
        return sleep(1000).then(() => {
          if (value) {
            if (fdDetails.fdMultiples) {
              const fdMultiples = parseInt(fdDetails.fdMultiples);
              if (parseInt(value) % fdMultiples === 0) {
                return true;
              } else {
                return false;
              }
            } else {
              return true;
            }
          } else {
            return true;
          }
        })
      })
      .test("min max amount validation", `${translate(INVESTMENT_DETAILS.invalidAmountLimit)}`, (value) => {
        return sleep(1000).then(() => {
          if (value) {
            if (Object.keys(minMaxAmounts).length && values?.payout) {
              if (minMaxAmounts?.[values?.payout]?.minAmount && minMaxAmounts?.[values?.payout]?.maxAmount) {
                const minAmount = parseInt(minMaxAmounts?.[values?.payout]?.minAmount);
                const maxAmount = parseInt(minMaxAmounts?.[values?.payout]?.maxAmount);
                if (parseInt(value) < minAmount) {
                  return false;
                } else if (parseInt(value) > maxAmount) {
                  return false;
                } else {
                  return true;
                }
              } else {
                return true;
              }
            } else {
              return true;
            }
          } else {
            return true;
          }
        })
      })
      .required(""),
    tenureDays: yup.number()
      .test("Invalid days", "Invalid days", (value) => {
        return sleep(1000).then(() => {
          if (value && tenureMasterDetails?.day?.allowedDay) {
            if (tenureMasterDetails?.day) {
              if (value <= tenureMasterDetails.day.maxTenure && value >= tenureMasterDetails.day.minTenure) {
                return true;
              } else {
                return false;
              }
            }
          } else {
            return true;
          }
        })
      }),
    tenureMonths: yup.number()
      .test("Invalid month", "Invalid month", (value) => {
        return sleep(1000).then(() => {
          if (value && tenureMasterDetails?.month?.allowedMonth) {
            if (tenureMasterDetails?.month) {
              if (value <= tenureMasterDetails.month.maxTenure && value >= tenureMasterDetails.month.minTenure) {
                return true;
              } else {
                return false;
              }
            }
          } else {
            return true;
          }
        })
      }),
    tenureYears: yup.number()
      .test("Invalid year", "Invalid year", (value) => {
        return sleep(1000).then(() => {
          if (value && tenureMasterDetails?.year?.allowedYear) {
            if (tenureMasterDetails?.year) {
              if (value <= tenureMasterDetails.year.maxTenure && value >= tenureMasterDetails.year.minTenure) {
                return true;
              } else {
                return false;
              }
            }
          } else {
            return true;
          }
        })
      }),
    // tenureDays: yup.number()
    // .min(tenureMasterDetails?.day?.allowedDay && tenureMasterDetails?.day
    //   && parseInt(tenureMasterDetails?.day.minTenure),
    //   "Invalid days")
    // .max(tenureMasterDetails?.day?.allowedDay && tenureMasterDetails?.day
    //   && parseInt(tenureMasterDetails?.day.maxTenure),
    //   "Invalid days"),
    // tenureMonths: yup.number()
    // .min(tenureMasterDetails?.month?.allowedMonth && tenureMasterDetails?.month
    //   && parseInt(tenureMasterDetails?.month.minTenure),
    //   "Invalid month")
    // .max(tenureMasterDetails?.month?.allowedMonth && tenureMasterDetails?.month
    //   && parseInt(tenureMasterDetails?.month.maxTenure),
    //   "Invalid month"),
    // tenureYears: yup.number()
    // .min(tenureMasterDetails?.year?.allowedYear && tenureMasterDetails?.year
    //   && parseInt(tenureMasterDetails?.year.minTenure),
    //   "Invalid year")
    // .max(tenureMasterDetails?.year?.allowedYear && tenureMasterDetails?.year
    //   && parseInt(tenureMasterDetails?.year.maxTenure),
    //   "Invalid year")
  });

  const formik = useFormik({
    initialValues,
    validationSchema,
    validateOnChange: true,
  });

  const { values, errors, setFieldValue, validateField, handleChange } = formik;
  const { year, month, day } = tenureMasterDetails;
  const { maturity_date, maturity_amount, aggrigated_interest } = maturityCalculationData;

  function convertToWords(amount) {
    const a = [
      '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
      'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen',
      'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen',
    ];
    const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

    function numToWords(n) {
      if (n < 20) return a[n];
      if (n < 100) return b[Math.floor(n / 10)] + (n % 10 ? ' ' + a[n % 10] : '');
      if (n < 1000)
        return a[Math.floor(n / 100)] + ' Hundred' + (n % 100 ? ' ' + numToWords(n % 100) : '');
      if (n < 100000)
        return numToWords(Math.floor(n / 1000)) + ' Thousand' + (n % 1000 ? ' ' + numToWords(n % 1000) : '');
      if (n < 10000000)
        return numToWords(Math.floor(n / 100000)) + ' Lakh' + (n % 100000 ? ' ' + numToWords(n % 100000) : '');
      return numToWords(Math.floor(n / 10000000)) + ' Crore' + (n % 10000000 ? ' ' + numToWords(n % 10000000) : '');
    }

    const [rupees, paise] = Number(amount)?.toFixed(2).split('.').map(Number);
    let result = '';

    if (rupees) result += numToWords(rupees) + ' Rupees';
    if (paise) result += ' and ' + numToWords(paise) + ' Paise';

    return result ? result.trim() + ' Only' : null;
  }
  const getLocalStorageData = () => {
    const productIdLocal = sessionStorage.getItem("selectedProductId");

    if (props.componentData) {
      let maturityInstructionValue = "";
      if (typeof props?.componentData?.maturityInstruction === "string") {
        maturityInstructionValue = extractedMaturityInstructionValue(props.componentData?.maturityInstruction);
      } else {
        maturityInstructionValue = extractedMaturityInstructionValue(props.componentData?.maturityInstruction?.maturity_instruction);
      }
      const valuesKeys = Object.keys(values)
      Object.keys(props.componentData).forEach((val) => {
        if (valuesKeys.includes(val)) {
          setFieldValue(val, props.componentData[val]);
        }
      });
      maturityInstructionValue && setFieldValue("maturity", maturityInstructionValue);
    }
    else if (productIdLocal && sessionStorage[productIdLocal]) {
      const { investment_details } = JSON.parse(sessionStorage[productIdLocal]);
      if (investment_details) {
        const valuesKeys = Object.keys(values)
        Object.keys(investment_details).forEach((val) => {
          if (valuesKeys.includes(val)) {
            setFieldValue(val, investment_details[val]);
          }
        });
      }
    }

  };

  const getDisplayTenure = () => {
    const { tenureDays, tenureMonths, tenureYears } = formik.values;
    const parts = [];

    if (tenureYears) {
      parts.push(`${tenureYears} Year(s)`);
    }
    if (tenureMonths) {
      parts.push(`${tenureMonths} Month(s)`);
    }
    if (tenureDays) {
      parts.push(`${tenureDays} Day(s)`);
    }

    return parts.length > 0 ? parts.join(' ') : '';
  }


  const getTenureMasterDetails = () => {
    setLoading(true);
    const getTenureMasterDetailsURL =
      appConfig?.deploy?.baseUrl +
      appConfig?.deploy?.tenureMaster +
      "?manufacturer_id=" + selectedManufactureId;

    GetApiHandler(getTenureMasterDetailsURL, "GET").then((response) => {
      if (response?.data?.data) {
        setTenureMasterDetails(response.data.data);
      }
      setIsTenureDataLoaded(true);
      setLoading(false);
    });
  }

  const calculateAge = (dobString) => {
    const today = new Date();
    const dob = new Date(dobString);

    let age = today.getFullYear() - dob.getFullYear();
    const monthDiff = today.getMonth() - dob.getMonth();
    const dayDiff = today.getDate() - dob.getDate();

    // If birthday hasn't occurred yet this year, subtract one from age
    if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
      age--;
    }
    setUserAge(age);
    return age;
  }

  const getInvestmentDetails = () => {
    setLoading(true);
    const productId = props?.componentData?.productId ? props.componentData.productId : getProductId();

    const method = "GET";
    const productType = sessionStorage.getItem("selectedProductType")
      ? sessionStorage.getItem("selectedProductType") : props?.componentData?.productType;

    const investmentUrl = appConfig?.deploy?.baseUrl
      + appConfig?.deploy?.getProductDetail
      + "?manufacturer_id=" + selectedManufactureId
      + "&product_type=" + productType
      + "&product_id=" + productId;

    GetApiHandler(investmentUrl, method).then((response) => {
      setLoading(false);
      if (response.message) {
        setShowModal(true);
        setApiErrorMessage(response.message);
      } else if (response?.data?.data && Object.keys(response?.data?.data).length) {
        setProductDetails(response.data.data);
        setIsProductDetailsLoaded(true);
        const userData = sessionStorage.getItem("userInfo")
        const user_data = JSON.parse(userData)
        const age = calculateAge(user_data?.date_of_birth)
        if (age >= 60 && user_data?.customer_gender === "F" || user_data?.customer_gender === "Female") {
          setInterestRates(response?.data?.data?.interestRates?.femaleSeniorCitizens);
        }
        else if (user_data?.customer_gender === "F" || user_data?.customer_gender === "Female") {
          setInterestRates(response?.data?.data?.interestRates?.female);
        } else if (age >= 60) {
          setInterestRates(response?.data?.data?.interestRates?.seniorCitizens);
        }
        else {
          setInterestRates(response?.data?.data?.interestRates?.regular);
        }

        setMinMaxAmounts(response?.data?.data?.minMaxAmounts);
        console.log("--", response?.data?.data?.fd_details?.fdPayoutMethod)
        setPayoutFrequency(response?.data?.data?.fd_details?.fdPayoutMethod)
      } else if (response?.data?.errors?.length) {
        setShowModal(true);
        setApiErrorMessage(response?.data?.errors[0]);
      }
    });
  }

  const declarationDetails = () => {
    const localStorageHandler = new LocalStorageHandler();
    const productIdLocal = sessionStorage.getItem("selectedProductId");
    //Note: we are not getting Manufacturer name on Onboarding/Make payment flow & need to be discussed.
    const manufacturerNames = sessionStorage.getItem('manufacturerNames') ? JSON.parse(sessionStorage.getItem('manufacturerNames')) : {};
    const issuerName = manufacturerNames[selectedManufactureId] ? manufacturerNames[selectedManufactureId] : "";
    const declarationInfo = { issuerName };
    declarationInfo.issuerName = issuerName ? issuerName : "";
    if (productIdLocal && sessionStorage[productIdLocal]) {
      const selectedPanNumber = sessionStorage.getItem("selectedPan");

      if (selectedPanNumber) {
        const familyDetails = JSON.parse(sessionStorage.getItem("familyDetails"));
        const investorDetails = familyDetails.payload.investorDetails.filter((investor) => investor.customerInformation.customerPan === selectedPanNumber);
        if (investorDetails.length) {
          const { customerFirstName, customerMiddleName, customerLastName, customerDob } = investorDetails[0].customerInformation
          declarationInfo.permanentCity = "--";
          const fullName = getFullName(customerFirstName, customerMiddleName, customerLastName,);
          declarationInfo.fullName = fullName;
          declarationInfo.title = "--";
        }
      } else {
        const { CkycApiData } = JSON.parse(sessionStorage[productIdLocal]);
        if (CkycApiData) {
          const { "PERSONAL DETAILS": personalDetails, "ADDRESS DETAILS": { permanentCity } } = CkycApiData;
          declarationInfo.permanentCity = permanentCity ? permanentCity : "--";
          if (personalDetails) {
            const { Title, FirstName, MiddleName, LastName } = personalDetails;
            const fullName = getFullName(FirstName, MiddleName, LastName);
            declarationInfo.fullName = fullName;
            declarationInfo.title = Title ? Title : "--";
          }
        }
      }
    }
    setDeclarationData(declarationInfo);
  }

  function callFDCalculator() {
    setLoading(true);

    let productId = props?.componentData?.productId ? props?.componentData?.productId : getProductId();
    const url = appConfig?.deploy?.baseUrl + appConfig?.deploy?.fdCalculator;
    const payoutFrequency = values.payout ? values.payout.toLowerCase() : ""
    const totalTenor = (Math.ceil(totalDaysToMatureFD) / 360);
    // const productName = sessionStorage.getItem("selectedProductName");

    // if(productName.toLowerCase().includes("utkarsh")) {
    //   if(values.depositAmount <= 90000 && (totalDaysToMatureFD >=7 || totalTenor === 1) && values.maturity === "Redeem on Maturity") {
    //     productId = 284;
    //   } else if(values.depositAmount <= 20000000 && (totalDaysToMatureFD >=7 || totalTenor === 10)) {
    //     productId = 287;
    //   }
    // }

    const requestBody = {
      productId: productId,
      manufacturerId: selectedManufactureId,
      distributorId: appConfig?.distributorId,
      tenor: totalTenor,
      tenureMonths: values.tenureMonths ? values.tenureMonths : 0,
      tenureDays: values.tenureDays ? values.tenureDays : 0,
      tenureYears: values.tenureYears ? values.tenureYears : 0,
      interestRate: selectedInterestRate,
      productType: sessionStorage.getItem("selectedProductType")
        ? sessionStorage.getItem("selectedProductType") : props?.componentData?.productType,
      payoutFrequency: payoutFrequency ? payoutFrequency : props.componentData.payout.toLowerCase(),
      depositAmount: values.depositAmount,
      gender: personalData.gender,
      dob: personalData.dob
    };

    PostApiHandler(url, "POST", requestBody)
      .then((response) => {
        if (response.message) {
          setShowModal(true);
          setApiErrorMessage(response.message);
        } else if (response?.data?.data && Object.keys(response?.data?.data).length) {
          const { data } = response.data;
          setMaturityCalculationData(data);
        } else if (response?.data?.errors?.length) {
          setShowModal(true);
          setApiErrorMessage(response?.data?.errors[0].errorMessage);
        }
      }).catch((errors) => {
        setShowModal(true);
        setApiErrorMessage("Something went wrong, Please retry!");
      })
      .finally(() => setLoading(false));
  }

  const handleBackBtnClick = (e) => {
    props.handle(props.prevPage, e, { investment_details: investmentDetails }, true);
  }

  const handleContinueBtnClick = (e) => {
    handleEventLogger("investment_details", "buttonClick", "Invest_Click", {
      action: "Investment_Details_Completed",
      Amount: values.depositAmount,
      Tenure: totalDaysToMatureFD + " Days",
      Maturity_Instruction: values.maturity,
      Interest_Payout: values.payout,
      Enable_Form_15G: values.form15g,
      Platform: isMobile()
    });
    props.handle(props.nextPage, e, { investment_details: investmentDetails }, "investment_details", values);
  }

  const handleOnBlur = () => {
    if (errors.depositAmount && !isDepositAmountClicked &&
      Object.keys(fdDetails).length &&
      selectedManufactureId === "MMFSL") {
      setShowDepositAmountModal(true);
    }
  }

  useEffect(() => {
    const MOUSE_UP = "mouseup";
    const handleOutsideClick = (event) => {
      if (
        event.target !== monthDropdownRef.current &&
        !monthDropdownRef.current?.contains(event.target) &&
        event.target !== yearDropdownRef.current &&
        !yearDropdownRef.current?.contains(event.target) &&
        event.target !== dayDropdownRef.current &&
        !dayDropdownRef.current?.contains(event.target) &&
        event.target.localName !== "li" &&
        !depositDropdownRef.current?.contains(event.target) &&
        event.target.localName !== "li"
      ) {
        isMonthClicked && setIsMonthClicked(false);
        isYearClicked && setIsYearClicked(false);
        isDayClicked && setIsDayClicked(false);
        depositDropdownRef && setIsDepositAmountClicked(false);
      }
    };
    document.addEventListener(MOUSE_UP, handleOutsideClick);

    return () => document.removeEventListener(MOUSE_UP, handleOutsideClick);
  });

  useEffect(() => {
    if (Object.keys(minMaxAmounts).length && values?.payout) {
      if (errors.depositAmount &&
        Object.keys(fdDetails).length &&
        selectedManufactureId === "MMFSL" && !isDepositAmountClicked &&
        values.depositAmount.length === 8) {
        setShowDepositAmountModal(true);
      }
    }
  }, [fdDetails, minMaxAmounts, errors.depositAmount])

  useEffect(() => {
    const { maturity } = values;
    const { autoRedeem, renewPrincipalAndInterest, renewPrincipal } = maturityInstruction;
    const auto_renew_flag = !(maturity === autoRedeem);
    const maturity_instruction = auto_renew_flag ?
      renewPrincipalAndInterest === maturity ?
        "F" : renewPrincipal === maturity ?
          "P" : "A" : "A";

    if (Object.keys(maturityCalculationData).length) {
      const { maturity_date, maturity_amount, aggrigated_interest, interestRate, tenure, tenureInDays } = maturityCalculationData;
      setInvestmentDetails({
        ...values, interestRate: interestRate,
        maturityAmount: maturity_amount,
        tenure: tenure,
        displayTenure: getDisplayTenure(),
        totalTenor: totalDaysToMatureFD,
        maturityDate: maturity_date,
        interestAmount: aggrigated_interest,
        totalPayout: maturity_amount,
        maturity: maturity,
        maturityInstruction: JSON.stringify({
          auto_renew_flag: auto_renew_flag,
          maturity_instruction: maturity_instruction
        }),
        payoutFrequency: payoutFrequency,
        form15G_15H: values.form15g,
        tenureInDays: tenureInDays || ""
      });
      if (props?.componentData) {
        setEditedInvestDetails({
          ...values, interestRate: interestRate,
          maturityAmount: maturity_amount,
          tenure: tenure,
          totalTenor: totalDaysToMatureFD,
          maturityDate: maturity_date,
          interestAmount: aggrigated_interest,
          totalPayout: maturity_amount,
          maturity: maturity,
          maturityInstruction: {
            auto_renew_flag: auto_renew_flag,
            maturity_instruction: maturity_instruction
          },
          payoutFrequency: values.payout,
          form15G_15H: values.form15g,
          productId: props?.componentData?.productId,
          productType: props?.componentData?.productType,
          manufacturerId: props?.componentData?.manufacturerId,
          productName: props?.componentData?.productName,
          userFullName: props?.componentData?.fullName,
          investmentBankLogoUrl: props?.componentData?.investmentBankLogoUrl,
          tenureInDays: tenureInDays || ""
        });
      }
    } else {
      setInvestmentDetails({
        ...values, maturityInstruction: JSON.stringify({
          auto_renew_flag: auto_renew_flag,
          maturity_instruction: maturity_instruction,
          form15G_15H: values.form15g,
        }),
        payoutFrequency: payoutFrequency[0],
        displayTenure: getDisplayTenure(),
      });
      setEditedInvestDetails({
        ...values, maturityInstruction: {
          auto_renew_flag: auto_renew_flag,
          maturity_instruction: maturity_instruction,
          form15G_15H: values.form15g,
        },
        payoutFrequency: payoutFrequency[0],
        productId: props?.componentData?.productId,
        productType: props?.componentData?.productType,
        manufacturerId: props?.componentData?.manufacturerId,
        productName: props?.componentData?.productName,
        userFullName: props?.componentData?.fullName,
        investmentBankLogoUrl: props?.componentData?.investmentBankLogoUrl
      });
    }
  }, [values, maturityCalculationData]);

  useEffect(() => {
    let timerInstance;
    if (selectedInterestRate && values.depositAmount && totalDaysToMatureFD) {
      values.depositAmount && validateField("depositAmount");
      timerInstance = setTimeout(() => {
        callFDCalculator();
      }, 2000);
    }
    return () => clearTimeout(timerInstance);
  }, [selectedInterestRate, values.depositAmount, totalDaysToMatureFD]);

  useEffect(() => {
    if (totalDaysToMatureFD) {
      const selectedPayoutMethod = values.payout ? values.payout.toLowerCase() : "";
      if (selectedPayoutMethod && interestRates) {
        if (!interestRates[values.payout]) {
          setFieldValue("payout", "");
        } else {
          const selectedRate = interestRates[values.payout].find((value) => {
            const duration = Object.keys(value)[0].split("-");
            if (duration[0] === duration[1] && totalDaysToMatureFD === duration[0]) {
              return value;
            } else {
              if (totalDaysToMatureFD >= duration[0] && totalDaysToMatureFD <= duration[1]) {
                return value;
              }
            }
          });
          selectedRate && setSelectedInterestRate(Object.values(selectedRate)[0]);
        }
      }
    }
  }, [totalDaysToMatureFD, values.payout, interestRates]);

  useEffect(() => {
    const { tenureDays, tenureMonths, tenureYears } = values;
    let totalDaysToMatureFD = 0;
    totalDaysToMatureFD = tenureDays ? totalDaysToMatureFD + parseInt(tenureDays) : totalDaysToMatureFD + 0;
    totalDaysToMatureFD = tenureMonths ? totalDaysToMatureFD + parseInt(tenureMonths) * 30 : totalDaysToMatureFD + 0;
    totalDaysToMatureFD = tenureYears ? totalDaysToMatureFD + parseInt(tenureYears) * 360 : totalDaysToMatureFD + 0;
    setTotalDaysToMatureFD(totalDaysToMatureFD);
  }, [values.tenureDays, values.tenureMonths, values.tenureYears]);

  useEffect(() => {
    if (Object.keys(productDetails).length) {
      const { fd_details } = productDetails;
      if (fd_details) {
        setFdDetails(fd_details);
      }
    }
    values.depositAmount && validateField("depositAmount");
  }, [productDetails]);

  useEffect(() => {
    if (payoutFrequency.length === 1) {
      setFieldValue("payout", payoutFrequency[0]);
    }
    if (interestRates && values.payout) {
      if (!interestRates[values.payout]) {
        setFieldValue("payout", "")
      }
    }
  }, [payoutFrequency, interestRates, values.payout]);

  useEffect(() => {
    if (Object.keys(minMaxAmounts).length && values?.payout) {
      if (minMaxAmounts?.[values?.payout]) {
        const { maxAmount, minAmount } = minMaxAmounts?.[values?.payout];
        const depositAmountQuickTipArray = filterDepositAmountQuickTipArray(minAmount, maxAmount);
        setDepositAmountDropdown(depositAmountQuickTipArray);
      }
    }
  }, [minMaxAmounts, values.payout]);

  // useEffect(() => {
  //   if (interestRates) {
  //     if (!interestRates[values.payout]) {
  //       setFieldValue("payout", "")
  //     }
  //   }
  // }, [interestRates]);

  useEffect(() => {
    values.tenureDays && validateField("tenureDays");
  }, [values.tenureDays]);

  useEffect(() => {
    values.tenureDays && validateField("tenureDays");
  }, [tenureMasterDetails]);

  useEffect(() => {
    values.tenureMonths && validateField("tenureMonths");
  }, [values.tenureMonths]);

  useEffect(() => {
    values.tenureMonths && validateField("tenureMonths");
  }, [tenureMasterDetails]);

  useEffect(() => {
    values.tenureYears && validateField("tenureYears");
  }, [values.tenureYears]);

  useEffect(() => {
    values.tenureYears && validateField("tenureYears");
  }, [tenureMasterDetails]);

  useEffect(() => {
    values.depositAmount && validateField("depositAmount");
  }, [values.depositAmount, fdDetails]);

  useEffect(() => {
    values.depositAmount && validateField("depositAmount");
  }, [fdDetails]);

  useEffect(() => {
    values.payout && validateField("depositAmount");
    if (Object.keys(minMaxAmounts).length && values?.payout) {
      if (values.depositAmount !== "") {
        if (values?.depositAmount < minMaxAmounts[values?.payout]?.minAmount ||
          values?.depositAmount > minMaxAmounts[values?.payout]?.maxAmount &&
          Object.keys(fdDetails).length &&
          selectedManufactureId.toUpperCase() === "MMFSL") {
          setShowDepositAmountModal(true);
        }
      }

    }
  }, [values.payout]);

  useEffect(() => {
    values.depositAmount && validateField("depositAmount");
  }, [minMaxAmounts]);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
    getInvestmentDetails();
    getTenureMasterDetails();
    declarationDetails();
    getLocalStorageData();
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
    <div className={`${props.isOnboardingUser ? "" : "h-full rounded-xl"}`}>
      <div>
        <div className="block">
          <div className="text-medium text-6xl  text-black">
            {translate(FD_RENEWAL.investmentDetails)}
          </div>
          <div className="text-regular text-xl mb-5 text-subcontent">
            {translate(INVESTMENT.provideInvestmentDetails)}
          </div>

          <ErrorModal
            canShow={showModal}
            updateModalState={toggleModal}
            errorMessage={apiErrorMessage}
          />
          {values?.payout && Object.keys(minMaxAmounts).length &&
            minMaxAmounts?.[values?.payout]?.maxAmount &&
            minMaxAmounts?.[values?.payout]?.minAmount ?
            <ErrorModal
              canShow={showDepositAmountModal}
              messageType={"alert"}
              updateModalState={() => setShowDepositAmountModal((state) => !state)}
              errorMessage={INVESTMENT_DETAILS.investMentAmountModal(displayINRAmount(parseInt(minMaxAmounts?.[values?.payout]?.minAmount)), displayINRAmount(parseInt(minMaxAmounts?.[values?.payout]?.maxAmount)))}
            /> : null
          }
          <div>
            <div className="flex flex-row bg-red gap-3">
              <div className={investmentdetailcss.investment_input_section}>
                <div className={investmentdetailcss.view_interestrate_position}>
                  <div className={investmentdetailcss.deposit_amount}>
                    <div className="w-full  text-regular text-2xl text-light-gray">
                      <input type="text" id="deposit_amount_field"
                        className="bg-white w-full border border-gray-300  p-3 text-black h-12 rounded mb-"
                        value={values.depositAmount}
                        name="depositAmount"
                        placeholder={`${translate(AFTER_REVIEW.depositAmount)} *`}
                        maxLength={8}
                        onChange={(e) => {
                          const filteredText = numberInput(e.target.value);
                          setFieldValue(
                            "depositAmount",
                            filteredText
                          );
                        }}
                        onBlur={handleOnBlur}
                        onKeyUp={() => setIsDepositAmountClicked(false)}
                        onClick={() => setIsDepositAmountClicked(!isDepositAmountClicked)}
                      />
                      {isDepositAmountClicked && values.payout ?
                        <div
                          className="bg-none w-full h-auto flex items-center absolute text-regular text-2xl text-black"
                          id="deposit_amount_field"
                        >
                          <div className="bg-white w-auto border-2 rounded-md z-10">
                            <div className="grid grid-cols-3 gap-2 p-3 font-semibold">
                              {depositAmountDropdown.length && depositAmountDropdown.map((amount) => {
                                return (
                                  <>
                                    <ol ref={depositDropdownRef}>
                                      <li className="bg-fd-primary hover:cursor-pointer mr-auto p-2 text-white font-thin rounded-md cursor-pointer"
                                        value={amount}
                                        onClick={({ target: { value } }) => {
                                          setIsDepositAmountClicked(false);
                                          setFieldValue("depositAmount", value);
                                        }}
                                      >
                                        {convertToNumberAbbreviations(amount)}
                                      </li>
                                    </ol>
                                  </>
                                )
                              })}
                            </div>
                          </div>
                        </div>
                        : null}
                      {

                        values.depositAmount && errors.depositAmount && Object.keys(fdDetails).length ?
                          (<div className="text-base text-light-red">
                            {errors.depositAmount}
                          </div>
                          ) : null}
                      <div className="flex flex-x flex-col space-x-2 items-right my-3">
                        <p className="text-fd-primary text-bold uppercase text-2xl mt-1 mb-2 mt-1">
                          {
                            convertToWords(values.depositAmount)
                          }
                        </p>
                        <p className="flex">
                          <BsFillInfoCircleFill />
                          <p className="text-regular text-base">
                            {translate(INVESTMENT.min)} ₹
                            {
                              (Object.keys(minMaxAmounts).length && values?.payout) && minMaxAmounts?.[values?.payout]?.minAmount ?
                                displayINRAmount(minMaxAmounts?.[values?.payout]?.minAmount) :
                                fdDetails.fdMinAmount ? displayINRAmount(fdDetails.fdMinAmount) : null
                            }
                            {" "}& {translate(INVESTMENT.max)} ₹
                            {
                              (Object.keys(minMaxAmounts).length && values?.payout) && minMaxAmounts?.[values?.payout]?.maxAmount ?
                                displayINRAmount(minMaxAmounts?.[values?.payout]?.maxAmount) :
                                fdDetails.fdMaxAmount ? displayINRAmount(fdDetails.fdMaxAmount) : null
                            }
                          </p>
                          {!isProductDetailsLoaded ? <Loader /> : null}
                        </p>

                      </div>
                    </div>
                  </div>
                  <div className={investmentdetailcss.viewinterest_button}>
                    <button
                      className="h-12 text-medium button-passive border-fd-primary rounded text-fd-primary w-max text-2xl"
                      onClick={() => setShowInterestRateModal(true)}
                    >
                      {translate(INVESTMENT.viewInterestRates)}
                    </button>
                    {
                      showInterestRateModal && <InterestRateModal
                        updateModalState={toggleInterestRateModal}
                        fdPayout={payoutFrequency}
                        interestPopUpData={interestRates}
                      />
                    }
                  </div>
                </div>
                {/* <div>
                  <div className="text-regular text-4xl text-black mb-2">
                    {translate(COMMON_CONSTANTS.tenure)} *
                  </div>{!isTenureDataLoaded ? <Loader /> : null}
                  <div className="w-full">
                    <div className="flex flex-col gap-2 md:gap-0 md:flex-row space-x-1">
                      {year?.allowedYear ?
                        <div className={(month?.allowedMonth && day?.allowedDay) ? "flex flex-col w-1/3" :
                          (month?.allowedMonth && !day?.allowedDay) ? "flex flex-col w-full " :
                            (!month?.allowedMonth && day?.allowedDay) ? "flex flex-col w-full" :
                              "flex flex-col w-full"}>
                          <div>
                            <div className="flex gap-2 justify-start items-center bg-white text-black w-auto border border-gray-300 shadow p-2 rounded-xl"
                              onClick={() => setIsYearClicked(!isYearClicked)}
                            >
                              <input type="text" id="tenure_year_field"
                                className="w-full text-black outline-none border-none"
                                name="tenureYears"
                                value={values.tenureYears}
                                onChange={(e) => {
                                  const filteredText = numberInput(e.target.value);
                                  setFieldValue("tenureYears", filteredText);
                                }}
                                onKeyUp={() => setIsYearClicked(false)}
                                onClick={() => setIsYearClicked(!isYearClicked)}
                                readOnly={year?.isFixedValue}
                              // placeholder="Year(s)"
                              />
                              {translate(COMMON_CONSTANTS.years)}
                            </div>
                          </div>
                          <div>
                            {errors.tenureYears ?
                              <div className="text-base text-light-red m-[3px]">
                                {INVESTMENT_DETAILS.invalidYears(year.minTenure, year.maxTenure)}
                              </div> : null
                            }
                          </div>
                          {isYearClicked ?
                            <div className="bg-none w-max h-auto mt-12 items-center absolute">
                              <ul className="ulClass bg-white w-full items-center" ref={yearDropdownRef}>
                                {year.fixedValues.map((yearValue, index) => {
                                  return (
                                    <>
                                      <div className="rounded-md">
                                        <li className="bg-background-secondary hover:cursor-pointer font-thin rounded-md p-1 flex items-center border mx-3 my-2" id={index}
                                          key={index}
                                          selected={yearValue}
                                          value={yearValue}
                                          onClick={({ target: { value } }) => {
                                            setIsYearClicked(false);
                                            setFieldValue("tenureYears", value);
                                          }}
                                        >
                                          {yearValue} {translate(COMMON_CONSTANTS.years)}
                                        </li>
                                      </div>
                                    </>
                                  );
                                })}
                              </ul>
                            </div>
                            :
                            null}
                        </div>
                        : null}
                      {month?.allowedMonth ?
                        <div className={(year?.allowedYear && day?.allowedDay) ? "flex flex-col w-1/3" :
                          (year?.allowedYear && !day?.allowedDay) ? "flex flex-col w-full" :
                            (!year?.allowedYear && day?.allowedDay) ? "flex flex-col w-full" :
                              "flex flex-col w-full"}>
                          <div className="text-regular text-2xl text-light-gray">
                            <div className="flex gap-2 justify-start items-center bg-white text-black w-auto border border-gray-300   rounded p-2"
                              onClick={() => setIsMonthClicked(!isMonthClicked)}
                            >
                              <input type="text" id="tenure_month_field"
                                className="w-full p-2 rounded-xl outline-none border-none text-black"
                                name="tenureMonths"
                                value={values.tenureMonths}
                                onChange={(e) => {
                                  const filteredText = numberInput(e.target.value);
                                  setFieldValue("tenureMonths", filteredText);
                                }}
                                onKeyUp={() => setIsMonthClicked(false)}
                                onClick={() => setIsMonthClicked(!isMonthClicked)}
                                readOnly={month?.isFixedValue}
                              // placeholder="Month(s)"
                              />
                              {translate(COMPONENTS.months)}
                            </div>
                          </div>
                          <div>
                            {errors.tenureMonths ?
                              <div className="text-base mt-1 text-light-red">
                                {INVESTMENT_DETAILS.invalidMonths(month.minTenure, month.maxTenure)}
                              </div> : null
                            }
                          </div>
                          {isMonthClicked ?
                            <div className="w-100 h-auto mt-12 items-center absolute">
                              <ul className="ulClass bg-white w-auto z-40 relative  rounded-md" ref={monthDropdownRef}>
                                {(month.fixedValues).map((monthValue, index) => {
                                  return (
                                    <>
                                      <div className="rounded-md w-100">
                                        <li className="bg-background-secondary hover:cursor-pointer font-thin text-white rounded-md p-1 flex items-center border mx-3 my-2" id={index}
                                          key={index}
                                          selected={monthValue}
                                          value={monthValue}
                                          onClick={({ target: { value } }) => {
                                            setIsMonthClicked(false);
                                            setFieldValue("tenureMonths", value)
                                          }}
                                        >
                                          {monthValue} {translate(COMPONENTS.months)}
                                        </li>
                                      </div>
                                    </>
                                  );
                                })}
                              </ul>
                            </div>
                            :
                            null}
                        </div>
                        : null
                      }
                      {day?.allowedDay ?
                        <div className={(year?.allowedYear && month?.allowedMonth) ? "flex flex-col w-1/3" :
                          (year?.allowedYear && !month?.allowedMonth) ? "flex flex-col w-full" :
                            (!year?.allowedYear && month?.allowedMonth) ? "flex flex-col w-full" :
                              "flex flex-col w-full"}
                        >
                          <div className="flex text-regular text-2xl text-light-gray">
                            <div className="flex gap-2 justify-start items-center bg-white text-black w-auto border border-gray-300  rounded p-2 w-full"
                              onClick={() => setIsDayClicked(!isDayClicked)}
                            >
                              <input type="text" id="tenure_day_field"
                                className="w-full p-2 rounded-xl outline-none border-none text-black"
                                name="tenureDays"
                                value={values.tenureDays}
                                onChange={(e) => {
                                  const filteredText = numberInput(e.target.value);
                                  setFieldValue("tenureDays", filteredText);
                                }}
                                onKeyUp={() => setIsDayClicked(false)}
                                onClick={() => setIsDayClicked(!isDayClicked)}
                                readOnly={day?.isFixedValue}
                              // placeholder="Day(s)"
                              />
                              {translate(COMMON_CONSTANTS.days)}
                            </div>
                          </div>
                          <div>
                            {errors.tenureDays ?
                              <div className="mt-1 text-light-red text-base">
                                {INVESTMENT_DETAILS.invalidDays(day.minTenure, day.maxTenure)}
                              </div> : null
                            }
                          </div>
                          {isDayClicked ?
                            <div className="bg-none w-max h-auto mt-12 items-center absolute">
                              <ul className="ulClass bg-white w-full items-center" ref={dayDropdownRef}>
                                {(day.fixedValues).map((dayValue, index) => {
                                  return (
                                    <>
                                      <div className="rounded-md">
                                        <li className="bg-background-secondary hover:cursor-pointer font-thin rounded-md p-1 flex items-center border mx-3 my-2" id={index}
                                          key={index}
                                          selected={dayValue}
                                          value={dayValue}
                                          onClick={({ target: { value } }) => {
                                            setIsDayClicked(false);
                                            setFieldValue("tenureDays", value)
                                          }}
                                        >
                                          {dayValue} {translate(COMMON_CONSTANTS.days)}
                                        </li>
                                      </div>
                                    </>
                                  );
                                })}
                              </ul>
                            </div>
                            :
                            null}
                        </div>
                        : null}
                    </div>
                  </div>
                </div> */}
                <div className="w-full">
                  <div className="text-regular text-4xl text-black mb-2">
                    {translate(COMMON_CONSTANTS.tenure)} *
                  </div>
                  {!isTenureDataLoaded ? <Loader /> : null}

                  <div className="flex flex-col gap-2 md:gap-0 md:flex-row space-x-1">
                    {year?.allowedYear && (
                      <TenureSelect
                        label={translate(COMMON_CONSTANTS.years)}
                        fieldName="tenureYears"
                        options={[{ label: 'Years', options: year.fixedValues.map(val => ({ value: val, label: `${val} ${translate(COMMON_CONSTANTS.years)}` })) }]}
                        defaultValue={{ value: values.tenureYears, label: `${values.tenureYears} ${translate(COMMON_CONSTANTS.years)}` }}
                        onChange={setFieldValue}
                        errorMessage={errors.tenureYears && INVESTMENT_DETAILS.invalidYears(year.minTenure, year.maxTenure)}
                        isFixedValue={year.isFixedValue}
                      />
                    )}

                    {month?.allowedMonth && (
                      <TenureSelect
                        label={translate(COMMON_CONSTANTS.months)}
                        fieldName="tenureMonths"
                        options={[{ label: 'Months', options: month.fixedValues.map(val => ({ value: val, label: `${val} ${translate(COMMON_CONSTANTS.months)}` })) }]}
                        defaultValue={{ value: values.tenureMonths, label: `${values.tenureMonths} ${translate(COMMON_CONSTANTS.months)}` }}
                        onChange={setFieldValue}
                        errorMessage={errors.tenureMonths && INVESTMENT_DETAILS.invalidMonths(month.minTenure, month.maxTenure)}
                        isFixedValue={month.isFixedValue}
                      />
                    )}

                    {day?.allowedDay ?
                        <div className={(year?.allowedYear && month?.allowedMonth) ? "flex flex-col w-1/3" :
                          (year?.allowedYear && !month?.allowedMonth) ? "flex flex-col w-full" :
                            (!year?.allowedYear && month?.allowedMonth) ? "flex flex-col w-full m-0" :
                              "flex flex-col w-full m-0"}
                        >
                          <div className="flex text-regular text-2xl text-light-gray">
                            <div className="flex gap-2 justify-start items-center bg-white text-black w-auto border border-gray-300  rounded p-2 w-full"
                              onClick={() => setIsDayClicked(!isDayClicked)}
                            >
                              <input type="text" id="tenure_day_field"
                                className="w-full rounded-xl outline-none border-none text-black"
                                name="tenureDays"
                                value={values.tenureDays}
                                onChange={(e) => {
                                  const filteredText = numberInput(e.target.value);
                                  setFieldValue("tenureDays", filteredText);
                                }}
                                onKeyUp={() => setIsDayClicked(false)}
                                onClick={() => setIsDayClicked(!isDayClicked)}
                                readOnly={day?.isFixedValue}
                              // placeholder="Day(s)"
                              />
                              {translate(COMMON_CONSTANTS.days)}
                            </div>
                          </div>
                          <div>
                            {errors.tenureDays ?
                              <div className="mt-1 text-light-red text-base">
                                {INVESTMENT_DETAILS.invalidDays(day.minTenure, day.maxTenure)}
                              </div> : null
                            }
                          </div>
                          {isDayClicked ?
                            <div className="bg-none w-max h-auto mt-12 items-center absolute">
                              <ul className="ulClass bg-white w-full items-center" ref={dayDropdownRef}>
                                {(day.fixedValues).map((dayValue, index) => {
                                  return (
                                    <>
                                      <div className="rounded-md">
                                        <li className="bg-background-secondary hover:cursor-pointer font-thin rounded-md p-1 flex items-center border mx-3 my-2" id={index}
                                          key={index}
                                          selected={dayValue}
                                          value={dayValue}
                                          onClick={({ target: { value } }) => {
                                            setIsDayClicked(false);
                                            setFieldValue("tenureDays", value)
                                          }}
                                        >
                                          {dayValue} {translate(COMMON_CONSTANTS.days)}
                                        </li>
                                      </div>
                                    </>
                                  );
                                })}
                              </ul>
                            </div>
                            :
                            null}
                        </div>
                        : null}
                  </div>
                </div>
                <div className="my-5">
                  <div className="text-regular text-4xl mb-2 text-black">
                    {translate(FD_RENEWAL.maturityInstruction)}*
                  </div>
                  <div className="mt-2 p-2  border rounded text-apercu-medium">
                    <fieldset className=" rounded-xl">
                      <div className="flex items-center text-black p-2">
                        <input
                          type="radio"
                          name="maturity"
                          value={maturityInstruction.autoRedeem}
                          checked={values.maturity === maturityInstruction.autoRedeem}
                          onChange={handleChange}
                          className=" w-4 h-4 border border-primary-green "
                        />
                        <label className="ml-2 text-regular text-2xl">
                          {translate(maturityInstruction.autoRedeem)}
                        </label>
                      </div>
                      {selectedManufactureId?.toUpperCase() != "SIB" && selectedManufactureId?.toUpperCase() != "UNITY" && selectedManufactureId?.toUpperCase() != "PNBHFC" ? <div className="flex items-center text-black p-2">
                        <input
                          type="radio"
                          value={maturityInstruction.renewPrincipal}
                          name="maturity"
                          checked={values.maturity === maturityInstruction.renewPrincipal}
                          onChange={handleChange}
                          className=" w-4 h-4 border border-primary-green "
                        />
                        <label className="ml-2 text-regular text-2xl">
                          {translate(maturityInstruction.renewPrincipal)}(₹ {maturityCalculationData?.depositAmount && maturityCalculationData.depositAmount.toLocaleString("en-IN")})
                        </label>
                      </div> : ""}
                      {
                        productType.toLowerCase().includes("non") || selectedManufactureId?.toUpperCase() === "PNBHFC" ? null : <div className="flex items-center text-black p-2">
                          <input
                            type="radio"
                            value={maturityInstruction.renewPrincipalAndInterest}
                            name="maturity"
                            checked={values.maturity === maturityInstruction.renewPrincipalAndInterest}
                            onChange={handleChange}
                            className="accent-primary-green w-4 h-4 border border-primary-green "
                          />
                          <label
                            className="ml-2 text-regular text-2xl"
                          >
                            {translate(maturityInstruction.renewPrincipalAndInterest)}(₹ {maturity_amount && displayINRAmount(maturity_amount)})
                          </label>
                        </div>
                      }
                    </fieldset>
                  </div>
                </div>
                <div className="my-5">
                  <div className="text-regular text-4xl mb-2 text-black">
                    {translate(INVESTMENT.interestPayout)}*
                  </div>
                  <select
                    name="payout"
                    value={values.payout}
                    onChange={(e) => {
                      setFieldValue("payout", e.target.value);
                    }}
                    disabled={payoutFrequency && payoutFrequency.length === 1}
                    className={`text-regular text-2xl border border-gray-300  bg-white p-3 w-full rounded text-black  ${payoutFrequency && payoutFrequency.length === 1 ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : ''
                      }`}
                  >
                    <option className="text-light-gray" value="" disabled selected hidden>
                      Select Payout *
                    </option>
                    {payoutFrequency && payoutFrequency.map((payoutFrequency, index) => {
                      return (
                        <>
                          <option
                            value={payoutFrequency}
                            key={index}
                            className='text-black'
                          >
                            {payoutFrequency}
                          </option>
                        </>
                      );
                    })}
                  </select>
                </div>
                {userType === 'user' &&
                  <>
                    {
                      selectedManufactureId?.toUpperCase() !== "PNBHFC" && selectedManufactureId?.toUpperCase() !== "UNITY" && selectedManufactureId?.toUpperCase() !== "LICHFL" ?
                        <div className="mb-5 flex flex-col">
                          <div className="text-regular text-4xl text-light-gray mb-2">
                            {translate(FD_RENEWAL.form15G)}
                          </div>
                          <div className="flex flex-row">
                            <input
                              type="checkbox"
                              name="form15g"
                              checked={values.form15g}
                              onChange={handleChange}
                              className="accent-primary-green w-4 text-apercu-regular mb-2 h-4 mt-1 pl-6 bg-gray-100 rounded border-gray-300"
                            />
                            <label className="text-left text-regular text-black text-2xl mb-2 ml-3">
                              {translate(FD_RENEWAL.doYouWantToSubmitForm15G)}
                            </label>
                          </div>
                          <div className="flex flex-row space-x-5 text-regular text-2xl text-black">
                            <input
                              type="text"
                              name="name"
                              value="Form 15G/Form 15H"
                              placeholder="Form 15G/Form 15H"
                              className="border border-gray-300  p-3 w-full rounded mb-"
                            />
                            <input
                              type="text"
                              name="name"
                              value={getFinancialYear()}
                              className="border border-gray-300  p-3 w-full rounded mb-"
                            />
                          </div>
                        </div> : null
                    }
                    <div className="mb-5">
                      <input
                        type="checkbox"
                        checked={values.disclaimerCheckbox}
                        name="disclaimerCheckbox"
                        onChange={handleChange}
                        className="accent-primary-green w-4 text-apercu-regular mb-2 h-4 mt-1 pl-6 bg-cyan-600 bg-gray-100 rounded border-gray-300"
                      />
                      <label className="text-center text-black text-regular text-xl align-middle mb-2 ml-3">
                        {
                          process_disclaimers(
                            "InvestmentDetails_Form15G",
                            {
                              "Mr": declarationData.title ? declarationData.title : "",
                              "<FDIssuerName>": declarationData.issuerName,
                              "<CUSTOMER_NAME>": declarationData.fullName ? declarationData.fullName : props?.componentData?.userFullName,
                              "<CUSTOMER CITY>": declarationData.permanentCity,
                              "<<CURRENT SYSTEM DATE>": formatDate(new Date())
                            })}
                      </label>
                    </div>
                  </>
                }
              </div>
              <div className={`bg-dark-gray rounded-xl w-full ${investmentdetailcss.deposit_summary}`}>
                <div className="inline-block sm:px-6 lg:px-6">
                  <div className="m-4">
                    <div>
                      {userAge >= 60 ?
                        <div className="flex items-center justify-center">
                          <span className="text-black">{translate(INVESTMENT.seniorCitizenBenefit)}</span>
                          <div className="relative w-32 h-32 ">
                            {/* Green spinning ring */}
                            {/* <div className=" inset-0 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div> */}

                            {/* Static Image centered inside */}
                            <Image
                              src="/Seniorcitizen.png"
                              alt="Seniorcitizen"
                              width={80}
                              height={15}
                              className="z-10 animate-pulse"
                            />
                          </div>


                        </div> : null}
                      <div className="text-regular text-4xl text-black mb-5">
                        {translate(INVESTMENT.whatwillYouGet)}
                      </div>
                      <div className="flex flex-col space-y-3">
                        <span className="border-b flex flex-col font-light text-xl text-black">
                          {translate(COMMON_CONSTANTS.interestRate)}/ {translate(DETAIL_FD.annum)}
                          <span className="text-black text-bold text-2xl mt-1 mb-2 mt-1">
                            {loading ? <Loader /> : (
                              maturityCalculationData?.interestRate && maturityCalculationData.interestRate
                            )}{" "}
                            % {translate(DETAIL_FD.pa)}.
                          </span>
                        </span>
                        <span className="border-b flex flex-col font-light text-xl text-black">
                          {translate(INVESTMENT.dateOfMaturity)}*
                          <span className="text-black text-bold text-2xl mt-1 mb-2 mt-1">
                            {loading ? <Loader /> : maturity_date && formatDate(maturity_date)}
                          </span>
                        </span>
                        <span className="border-b flex flex-col font-light text-xl text-black">
                          {translate(FD_RENEWAL.depositAmount)}
                          <span className="text-black text-bold text-2xl mt-1 mb-2 mt-1">
                            ₹ {loading ? <Loader /> : maturityCalculationData?.depositAmount && maturityCalculationData.depositAmount.toLocaleString("en-IN")}
                          </span>
                        </span>
                        <span className="border-b flex flex-col font-light text-xl text-black">
                          {translate(INVESTMENT.interestAmount)}*
                          <span className="text-black text-bold text-2xl mt-1 mb-2 mt-1">
                            ₹ {loading ? <Loader /> : aggrigated_interest && displayINRAmount(aggrigated_interest)}
                          </span>
                        </span>
                        <span className="flex flex-col text-regular text-2xl text-black">
                          {translate(INVESTMENT.totalPayout)}
                          <span className="text-black text-bold text-2xl mt-1 mb-2 mt-1">
                            ₹ {loading ? <Loader /> : maturity_amount && displayINRAmount(maturity_amount)}
                          </span>
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-row mt-2 space-x-2">
                      <div className="w-1/10">
                        <BsFillInfoCircleFill className="text-gray-500" />
                      </div>
                      <div className="w-9/10">
                        <div className="text-regular text-base text-light-gray">
                          {process_disclaimers("FDBookingSuccessful", { "<FDIssuerName>": declarationData.issuerName })}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {props.isOnboardingUser ?
              <div className="flex flex-row justify-center gap-3">
                <button
                  className={(!formik.isValid || (userType === 'user' && !values.disclaimerCheckbox) || loading || totalDaysToMatureFD === 0 || maturity_amount === 0) ? "button-active button-transition hover:bg-hover-primary text-medium text-xl lg:text-2xl w-fit   text-medium text-xl lg:text-2xl w-fit  hover:button-shadow text-medium text-xl lg:text-2xl w-fit  " : "button-active btn-gradient button-transition hover:bg-hover-primary text-medium text-xl lg:text-2xl w-fit   text-medium text-xl lg:text-2xl w-fit  hover:button-shadow text-medium text-xl lg:text-2xl w-fit  "}
                  disabled={
                    !formik.isValid ||
                    (userType === 'user' && !values.disclaimerCheckbox) ||
                    loading ||
                    totalDaysToMatureFD === 0 ||
                    maturity_amount === 0
                  }
                  onClick={() => props.handleSaveDetails({ investmentDetail: editedInvestDetails })}
                >
                  {translate(ADDRESS_DETAILS.save)}
                </button>
                <button
                  className="button-passive border-fd-primary text-fd-primary"
                  onClick={props.handleClose}
                >
                  {translate(ADDRESS_DETAILS.close)}
                </button>
              </div>
              : <div className="flex flex-row gap-3">
                <button
                  className="button-passive border-fd-primary text-fd-primary"
                  onClick={handleBackBtnClick}
                >
                  {translate(ADDRESS_DETAILS.back)}
                </button>
                <button
                  className={(!formik.isValid ||
                    (userType === 'user' && !values.disclaimerCheckbox) ||
                    loading ||
                    !values.payout ||
                    !values.maturity ||
                    totalDaysToMatureFD === 0 ||
                    maturity_amount === 0 ||
                    !Object.keys(maturityCalculationData).length) ? "button-active  button-transition text-medium text-xl lg:text-2xl w-fit   text-medium text-xl lg:text-2xl w-fit  " : "button-active  button-transition btn-gradient  text-medium text-xl lg:text-2xl w-fit   text-medium text-xl lg:text-2xl w-fit  "}
                  disabled={
                    !formik.isValid ||
                    (userType === 'user' && !values.disclaimerCheckbox) ||
                    loading ||
                    !values.payout ||
                    !values.maturity ||
                    totalDaysToMatureFD === 0 ||
                    maturity_amount === 0 ||
                    !Object.keys(maturityCalculationData).length
                  }
                  onClick={handleContinueBtnClick}
                >
                  {translate(COMMON_CONSTANTS.continueLabel)}
                </button>
              </div>}
          </div>
        </div>
        <div className={`${investmentdetailcss.deposit_summary_bottomsheet}`} >
          <div className="flex justify-between p-3 border mt-3" onClick={() => setOpen(true)}>
            <span className="text-black">Investment Returns And Benefits</span>
            <button><IoIosArrowUp /></button>
          </div>
          <BottomSheet open={open}>
            <div
              style={{
                height: '80vh',
                backgroundColor: '#F4F9FF'
              }}
            >
              <div className="flex justify-end pr-2 font-bold ">
                <button className="p-3" onClick={() => setOpen(false)} ><AiOutlineClose /></button>
              </div>
              <div className="inline-block sm:px-6 lg:px-6">
                <div className="m-4">
                  <div>
                    <div className="text-regular text-4xl text-black mb-5">
                      Investment Returns And Benefits
                    </div>
                    <div className="flex flex-col space-y-3">
                      <span className="border-b flex flex-col font-light text-xl text-black">
                        {translate(COMMON_CONSTANTS.interestRate)}/ {translate(DETAIL_FD.annum)}
                        <span className="text-fd-primary text-bold text-2xl mt-1 mb-2 mt-1">
                          {loading ? <Loader /> : (
                            maturityCalculationData?.interestRate && maturityCalculationData.interestRate
                          )}{" "}
                          % {translate(DETAIL_FD.pa)}.
                        </span>
                      </span>
                      <span className="border-b flex flex-col font-light text-xl text-black">
                        {translate(INVESTMENT.dateOfMaturity)}*
                        <span className="text-fd-primary text-bold text-2xl mt-1 mb-2 mt-1">
                          {loading ? <Loader /> : maturity_date && formatDate(maturity_date)}
                        </span>
                      </span>
                      <span className="border-b flex flex-col font-light text-xl text-black">
                        {translate(FD_RENEWAL.depositAmount)}
                        <span className="text-fd-primary text-bold text-2xl mt-1 mb-2 mt-1">
                          ₹ {maturityCalculationData?.depositAmount && maturityCalculationData.depositAmount.toLocaleString("en-IN")}
                        </span>
                      </span>
                      <span className="border-b flex flex-col font-light text-xl text-black">
                        {translate(INVESTMENT.interestAmount)} * ({translate(COMMON_CONSTANTS.onMaturity)})
                        <span className="text-fd-primary text-bold text-2xl mt-1 mb-2 mt-1">
                          ₹ {loading ? <Loader /> : aggrigated_interest && displayINRAmount(aggrigated_interest)}
                        </span>
                      </span>
                      <span className="flex flex-col text-lg font-medium text-apercu-medium">
                        {translate(INVESTMENT.totalPayout)}
                        <span className="text-fd-primary text-bold text-2xl mt-1 mb-2 mt-1">
                          ₹ {loading ? <Loader /> : maturity_amount && displayINRAmount(maturity_amount)}
                        </span>
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-row mt-2 space-x-2">
                    <div className="w-1/10">
                      <BsFillInfoCircleFill className="text-gray-500" />
                    </div>
                    <div className="w-9/10">
                      <div className="text-regular text-base text-light-gray">
                        {process_disclaimers("FDBookingSuccessful", { "<FDIssuerName>": declarationData.issuerName })}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </BottomSheet>
        </div>
      </div>
    </div>
  );
}

const Loader = () => {
  return <div className="flex justify-center items-center">
    <div
      className="spinner-border animate-spin text-fd-primary inline-block w-6 h-6 border-4 rounded-full"
      role="status"
    >
    </div>
  </div>
}

export default InvestmentDetails;

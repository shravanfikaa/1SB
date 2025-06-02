import Image from "next/image";
import { BsFillInfoCircleFill } from "react-icons/bs";
import dbquality from "../product_logos/detail-fd-icon.png";
import {
  IoIosArrowDropupCircle,
  IoIosArrowDropdownCircle,
} from "react-icons/io";
import appConfig from "../../app.config";
import { GetApiHandler, PostApiHandler } from "../api/apihandler";
import { IoMdCheckboxOutline } from "react-icons/io";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import {
  displayINRAmount,
  setSessionStorageItem,

  interestRateDurationInMonth,
  getUserType,
  handleEventLogger,
  numberInput,
  isValidURL,
  isMobile,
  calculateAge
} from "../../lib/util";
import {
  getFDRatingsAndAgencies,
  getInterestRate,
  getInterestDorpDownItems,
} from "../../lib/fd_details_utils";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import ErrorModal from "../common/errorPopup";
import { process_disclaimers } from "../../lib/disclaimer_handler";
import { Tooltip } from "@material-tailwind/react";
import { FaAngleLeft, FaAngleRight } from "react-icons/fa";
import fd_detail_css from "../../styles/fd_detail.module.css";
import TimelineSeries from "../common/TimelineSeries";
import {
  AGENT,
  COMMON,
  COMMON_CONSTANTS,
  DETAIL_FD,
  INTEREST_RATES_DROPDOWN,
  INVESTMENT_DETAILS,
  PAYOUT_FREQUENCY,
  PRODUCT_TYPE,
  FD_RENEWAL
} from "../../constants";
import { useRouter } from "next/router";
import Loader from "../../svg/Loader";
import { useTranslation } from "react-i18next";
import { fetchDynamicFieldDetails } from "../../utils/dynamicFieldDetails";
import { fetchManufacturerProperties } from "../../utils/manufaturerProfile";
import { fetchProductDetails } from "../../utils/productDetails";

let showErrorInModal = "";

function FDProductInfo({ productInfo, isOnboardingUser }) {
  const router = useRouter();
  const [fdDetails, setFdDetails] = useState({});
  const [productRating, setProductRating] = useState([]);
  const [ratingAgencies, setRatingAgencies] = useState([]);
  const [productYield, setProductYield] = useState([]);
  const [productDetails, setProductDetails] = useState([]);
  const [productInterestRates, setProductInterestRates] = useState({});
  const [selectedInterestRate, setSelectedInterestRate] = useState();
  const [payoutFrequency, setPayoutFrequency] = useState("yearly");
  const [showModal, setShowModal] = useState(false);
  const toggleModal = () => setShowModal((state) => !state);
  const [apiErrorMessage, setapiErrorMessage] = useState("");
  const [fdCalculatorResult, setFDCalculatorResult] = useState({});
  const [selectedProduct, setSelectedProduct] = useState("");
  const [depositAmountInput, setDepositAmountInput] = useState(100);
  const [tenureInput, setTenureInput] = useState(1);
  const [journeyType, setJourneyType] = useState("");
  const [productManufacturerId, setProductManufacturerId] = useState("");
  const [productID, setProductID] = useState("");
  const [productType, setProductType] = useState("");
  const highlightSection = useRef(null);
  const issuerSection = useRef(null);
  const interestRateSection = useRef(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isOverviewActive, setOverviewActive] = useState(false);
  const [isHighlightActive, setHighlightActive] = useState(false);
  const [isIssuerActive, setIssuerActive] = useState(false);
  const [isInterestActive, setInterestActive] = useState(false);
  const [interestDorpDownItems, setInterestDorpDownItems] = useState([]);
  const [showGraph, setShowGraph] = useState(true);
  const [payoutFreqForInterest, setPayoutFreqForInterest] = useState("");
  const [interestRateType, setInterestRateType] = useState("");
  const [minMaxAmount, setMinMaxAmount] = useState({});
  const [minAmount, setMinAmount] = useState();
  const [maxAmount, setMaxAmount] = useState();
  const [tenureMaxRange, setTenureMaxRange] = useState(5);
  const { t: translate } = useTranslation();

  const getJourneyType = () => {
    const role = getUserType();
    if (role === "user") {
      setJourneyType("DIY");
    } else {
      setJourneyType("RM");
    }
  };


  let displayError = "";

  //Added Tenure Function for Traslation 
  function convertToTenor(tenor_val) {
    if (tenor_val > 0 && tenor_val < 30) {
      return Math.round(tenor_val) + " " + translate(COMMON_CONSTANTS.days);
    } else if (tenor_val >= 360) {
      return (
        Math.round(tenor_val / 360) +

        (Math.round(tenor_val / 360) > 1 ? " " + translate(COMMON_CONSTANTS.years) : " " + translate(COMMON_CONSTANTS.year))
      );
    } else if (tenor_val > 29) {
      return (
        Math.round(tenor_val / 30) +
        (Math.round(tenor_val / 30) > 1 ? " " + translate(FD_RENEWAL.months) : "")
      );
    }
    return Math.round(tenor_val);
  }

  const userType = () => {
    if (sessionStorage.getItem("userInfo")) {
      let userAge, userGender;
      const userinfo = JSON.parse(sessionStorage.getItem("userInfo"));
      userAge = calculateAge(userinfo.date_of_birth);
      userGender = userinfo.customer_gender;
      if ((userGender == "M" || userGender == "Male") && userAge > 59) {
        setInterestRateType("Senior Citizen");
      }
      else if ((userGender == "F" || userGender == "Female") && userAge > 59) {
        setInterestRateType("Senior Citizen - Female");
      }
      else if (userGender == "F" || userGender == "Female") {
        setInterestRateType("Female");
      }
      else {
        setInterestRateType("Regular");
      }
    }
    else {
      setInterestRateType("Regular");
    }
  }



  const getProductInfo = async (productManufacturerId, productType, productID) => {
    setIsLoading(true);
    userType()
    const response = await fetchProductDetails(productManufacturerId, productType, productID);
    if (response) {
      if (response?.data?.errors?.length) {
        displayError = response["message"];
        setShowModal(true);
        setapiErrorMessage(displayError);
      } else if (response?.data?.data && Object.keys(response?.data?.data).length) {
        const { fd_details, productInfo, interestRates, minMaxAmounts } = response.data.data;
        let ratingAndAgencies = getFDRatingsAndAgencies(response);
        let fdRatings = ratingAndAgencies[0];
        let fdRatingAgencies = ratingAndAgencies[1];
        setSessionStorageItem("MaxNominee", fd_details["maxFdNomineeLimit"]);
        setFdDetails(fd_details);
        setPayoutFreqForInterest(fd_details.fdPayoutMethod[0]);
        setProductRating(fdRatings);
        setRatingAgencies(fdRatingAgencies);
        setProductYield(response.data.data.yield);
        setProductDetails(productInfo);
        setProductInterestRates(interestRates);
        setSessionStorageItem("selectedManufactureId", productManufacturerId);
        setSessionStorageItem("selectedProductId", productID);
        setSessionStorageItem("selectedProductType", productType);
        setSessionStorageItem("selectedProductTnCUrl", response.data.data.fd_details.tncUrl);
        setMinMaxAmount(minMaxAmounts);
      }

      setIsLoading(false)
    }
  }

  useEffect(() => {
    minAmount && setDepositAmountInput(minAmount);
  }, [minAmount]);

  showErrorInModal = apiErrorMessage;

  function handleInterestRatesChange(val, key) {
    setInterestRateType(val);
  }

  const handlePayoutFrequencyChange = (val) => {
    setPayoutFreqForInterest(val);
  };

  let yearArray = [];
  let tenor = [];
  tenor = productDetails;

  for (let i in tenor) {
    yearArray.push(Object.values(tenor[i]));
  }

  // Function to set Payout Method
  function setPayoutMethod(payoutMethod) {
    setPayoutFrequency(payoutMethod);
  }

  useEffect(() => {
    sessionStorage.setItem("CurruntPage", "customer_personal_details")
  }, [

  ])

  // Function to Call FD calculator and pass it's response to respective graph (Bar / Area) based on selected productType
  function callFDCalculator() {

    const url =
      appConfig?.deploy?.baseUrl + appConfig?.deploy?.fdCalculator;


    //       const requestBody = {
    //   productId: productId,
    //   manufacturerId: sessionStorage.getItem("selectedManufactureId") ? sessionStorage.getItem("selectedManufactureId")
    //     : props?.componentData?.manufacturerId,
    //   distributorId: appConfig.distributorId,
    //   tenor: totalTenor,
    //   tenureMonths: values.tenureMonths ? values.tenureMonths : 0,
    //   tenureDays: values.tenureDays ? values.tenureDays : 0,
    //   tenureYears: values.tenureYears ? values.tenureYears : 0,
    //   interestRate: selectedInterestRate,
    //   productType: sessionStorage.getItem("selectedProductType")
    //     ? sessionStorage.getItem("selectedProductType") : props?.componentData?.productType,
    //   payoutFrequency: payoutFrequency ? payoutFrequency : props.componentData.payout.toLowerCase(),
    //   depositAmount: values.depositAmount,
    //   gender: personalData.gender,
    //   dob: personalData.dob
    // };

    const requestBody = {
      productId: productID,
      manufacturerId: productManufacturerId,
      distributorId: appConfig?.distributorId,
      tenor: tenureInput,
      tenureMonths: 0,
      tenureDays: 0,
      tenureYears: tenureInput,
      interestRate: productYield.length ? productYield[0] : 6,
      productType: selectedProduct,
      // compoundingType: "yearly",
      //dob
      payoutFrequency:
        productType.toLowerCase() == "cumulative" ? "yearly" : payoutFrequency,
      depositAmount: depositAmountInput
        ? typeof depositAmountInput === "string" ? depositAmountInput?.replaceAll(",", "") : depositAmountInput
        : fdDetails["fdMinAmount"],
    };
    if (productID && productManufacturerId && selectedProduct) {
      PostApiHandler(url, "POST", requestBody)
        .then((response) => {
          setFDCalculatorResult(response.data.data);
        })
        .catch((err) => {
          console.log("Got Error while calling FD calculator:", err);
        });
    }
  }

  function highlightSelected(label, e) {
    if (label == "overview") {
      handleEventLogger("dashboard", "buttonClick", "Company_Click", {
        action: "overview",
        Screen_Name: "FD Details page",
      });
      setInterestActive(false);
      setIssuerActive(false);
      setOverviewActive(true);
      setHighlightActive(false);
    } else if (label == "highlights") {
      handleEventLogger("dashboard", "buttonClick", "Company_Click", {
        action: "Highlights",
        Screen_Name: "FD Details page",
        Platform: isMobile()
      });
      if (highlightSection.current) {
        highlightSection.current.scrollIntoView({ behavior: "smooth" });
      }
      setInterestActive(false);
      setIssuerActive(false);
      setOverviewActive(false);
      setHighlightActive(true);
    } else if (label == "issuer") {
      handleEventLogger("dashboard", "buttonClick", "Company_Click", {
        action: "Issuer",
        Screen_Name: "FD Details page",
        Platform: isMobile()
      });
      if (issuerSection.current) {
        issuerSection.current.scrollIntoView({ behavior: "smooth" });
      }
      setInterestActive(false);
      setIssuerActive(true);
      setOverviewActive(false);
      setHighlightActive(false);
    } else if (label == "rates") {
      handleEventLogger("dashboard", "buttonClick", "Company_Click", {
        action: "Interest Rates",
        Screen_Name: "FD Details page",
        Platform: isMobile()
      });
      if (interestRateSection.current) {
        interestRateSection.current.scrollIntoView({ behavior: "smooth" });
      }
      setInterestActive(true);
      setIssuerActive(false);
      setOverviewActive(false);
      setHighlightActive(false);
    }
  }

  function leftScroll() {
    const left = document.querySelector(".scroll-images");
    left.scrollBy(200, 0);
  }

  function rightScroll() {
    const right = document.querySelector(".scroll-images");
    right.scrollBy(-200, 0);
  }

  const getDynamicFieldDetails = async (selectedManufactureId) => {
    const response = await fetchDynamicFieldDetails(selectedManufactureId);
    if (response) {
      if (response?.data?.errors?.length) {
        sessionStorage.removeItem("shouldRenderProfessionalDetails");
      } else if (response?.data?.data && Object.keys(response?.data?.data).length) {
        const { dynamicFields } = response.data.data;
        const keys = Object.keys(dynamicFields);
        if (keys.length) {
          keys.includes("ProfessionalDetails")
            ? sessionStorage.setItem("shouldRenderProfessionalDetails", true)
            : sessionStorage.setItem(
              "shouldRenderProfessionalDetails",
              false
            );
        } else {
          sessionStorage.removeItem("shouldRenderProfessionalDetails");
        }
      }
    }
  }

  const handleProductSelected = (type) => {
    router.push({
      pathname: "/detail_fd/fd_detail",
      query: {
        productId: productID,
        productType: type,
        manufacturerId: productManufacturerId,
        screenType: productInfo?.screenType,
      },
    });
  };

  // const handleInvestBtnClick = () => {
  //   setIsLoading(true);
  //   handleEventLogger("dashboard", "buttonClick", "Invest_Click", {
  //     action: {
  //       action: "Invest_Initiate",
  //       Manufacturer_Id: productManufacturerId,
  //       Product_Type: selectedProduct,
  //       Screen_Name: "Product Info"
  //     }
  //   });
  //   router.push({
  //     pathname: "/journey/[journey_type]/[id]",
  //     as: "/journey/[journey_type]/[id]",
  //     query: {
  //       journey_type: journeyType,
  //       id: productID,
  //     },
  //   });
  // }

  const getManufacturerDetails = async (productManufacturerId) => {
    const response = await fetchManufacturerProperties(productManufacturerId);
    if (response) {
      if (response?.data?.data) {
        const { onboardingMode } = response?.data?.data;
        if (onboardingMode) {
          sessionStorage.setItem(
            "onboardingMode",
            JSON.stringify(onboardingMode)
          );
        }
      }
    }
  };

  const getMinAmount = () => {
    let minAmount = "";
    if (productType?.toLowerCase().includes("non")) {
      if (payoutFrequency && minMaxAmount?.[PAYOUT_FREQUENCY[payoutFrequency]])
        minAmount = minMaxAmount?.[PAYOUT_FREQUENCY[payoutFrequency]].minAmount
    } else {
      const keys = minMaxAmount ? Object.keys(minMaxAmount) : [];
      if (keys.length) {
        minAmount = minMaxAmount[keys[0]].minAmount;
      }
    }
    return minAmount;
  };

  const getMaxAmount = () => {
    let maxAmount = "";
    if (productType?.toLowerCase().includes("non")) {
      if (payoutFrequency && minMaxAmount?.[PAYOUT_FREQUENCY[payoutFrequency]])
        maxAmount = minMaxAmount?.[PAYOUT_FREQUENCY[payoutFrequency]].maxAmount;
    } else {
      const keys = minMaxAmount ? Object.keys(minMaxAmount) : [];
      if (keys.length) {
        maxAmount = minMaxAmount[keys[0]].maxAmount;
      }
    }
    return maxAmount;
  };

  // const handleInvestBtnClick = () => {
  //   setIsLoading(true);
  //   router.push({
  //     pathname: "/journey/[journey_type]/[id]",
  //     query: {
  //       journey_type: journeyType,
  //       id: productID,
  //     },
  //     as: "/journey/[journey_type]/[id]"
  //   });
  // }
  const handleInvestmentsInitiate = () => {

    const investmentsInitiateURL =
      appConfig?.deploy?.baseUrl +
      appConfig?.deploy?.investmentsInitiate;

    const requestBody = {
      "productId": productID || "",
      "manufacturerId": productManufacturerId || "",
      "fdType": productType || "cumulative",
      "depositAmount": depositAmountInput ? parseInt(depositAmountInput?.toString().replaceAll(",", "")) : minAmount,
      "tenureYears": tenureInput || "1",
      "interestRate": fdCalculatorResult?.interestRate || 6,
      "fdName": fdDetails?.fdName || ""
    }

    PostApiHandler(investmentsInitiateURL, "POST", requestBody)
      .then((response) => {
        if (response?.data?.data) {
          // Haven't decided the scenario 
        }
      })
      .catch((err) => {
        console.log(
          "Got Error while fetching Investments Initiate details:",
          err
        );
      });
  }

  const clearProductDataIfRMUser = () => {
    const rmNewCustomerData = sessionStorage.getItem("rm_new_customer_data");
    if (rmNewCustomerData) {
      const isNewCustomer = JSON.parse(rmNewCustomerData);
      if (isNewCustomer) {
        sessionStorage.removeItem(productID);
      }
    }
  }

  const handleInvestBtnClick = () => {
    setIsLoading(true);
    handleEventLogger("dashboard", "buttonClick", "Invest_Click", {
      action: "Invest_Initiate",
      Manufacturer_Id: productManufacturerId,
      Product_Type: selectedProduct,
      Screen_Name: "Product Info",
      Platform: isMobile()
    });
    clearProductDataIfRMUser();
    handleInvestmentsInitiate();
    router.push({
      pathname: "/journey/[journey_type]/[id]",
      query: {
        journey_type: journeyType,
        id: productID,
      },
      as: "/journey/[journey_type]/[id]"
    });
  }

  useEffect(() => {
    if (minMaxAmount && payoutFrequency && productType) {
      const minAmount = getMinAmount();
      const maxAmount = getMaxAmount();
      setMinAmount(minAmount);
      setMaxAmount(maxAmount);
    }
  }, [minMaxAmount, payoutFrequency, productType]);

  useEffect(() => {
    if (interestRateType && payoutFreqForInterest) {
      const index = Object.values(INTEREST_RATES_DROPDOWN).findIndex(
        (val) => val === interestRateType
      );
      const key = Object.keys(INTEREST_RATES_DROPDOWN)[index];
      const selectedRate = getInterestRate(
        productInterestRates,
        key,
        payoutFreqForInterest
      );
      setSelectedInterestRate(selectedRate);
    }
  }, [payoutFreqForInterest, interestRateType]);

  useEffect(() => {
    if (productManufacturerId) {
      getManufacturerDetails(productManufacturerId);
    }
  }, [productManufacturerId]);

  useEffect(() => {
    const timerId = setTimeout(() => {
      if (selectedProduct && productYield.length && productID) {
        callFDCalculator();
      }
    }, 500);
    return () => clearTimeout(timerId);
    // if (selectedProduct && productYield.length && productID) {
    //   callFDCalculator();
    // }
  }, [selectedProduct, payoutFrequency, productYield, productID, tenureInput]);

  useEffect(() => {
    if (typeof window !== "undefined" && Object.keys(fdDetails).length) {
      fdDetails.fdName
        ? sessionStorage.setItem("selectedProductName", fdDetails.fdName)
        : "";
      fdDetails.logoUrl
        ? sessionStorage.setItem("selectedProductLogo", fdDetails.logoUrl)
        : "";
    }
  }, [fdDetails]);

  useEffect(() => {
    const searchResult = setTimeout(() => {
      if (selectedProduct && productYield.length && productID) {
        callFDCalculator();
      }
    }, 500);
    return () => clearTimeout(searchResult);
  }, [depositAmountInput]);

  useEffect(() => {
    if (!router.query.journey_id) {
      const { productId, productType, manufacturerId } = router.query;
      setProductID(productId);
      setProductType(productType);
      setSelectedProduct(productType);
      setProductManufacturerId(manufacturerId);
      setOverviewActive(true);
    }
  }, [router]);

  useEffect(() => {
    if (productManufacturerId) {
      sessionStorage.removeItem("dynamicFields");
      getDynamicFieldDetails(productManufacturerId);
    }
  }, [productManufacturerId]);

  useEffect(() => {
    if (productID && productManufacturerId && productType && selectedProduct) {
      getProductInfo(productManufacturerId, productType, productID);
    }
  }, [productID, productManufacturerId, productType, selectedProduct]);

  useEffect(() => {
    if (Object.keys(productInterestRates).length) {
      const interestDorpDownItems =
        getInterestDorpDownItems(productInterestRates);
      setInterestDorpDownItems(interestDorpDownItems);
    }
  }, [productInterestRates]);

  useEffect(() => {
    const { productId, manufacturerId, productType } = productInfo;
    getJourneyType();
    if (Object.keys(productInfo).length) {
      setProductID(productId);
      setProductType(productType);
      setSelectedProduct(productType);
      setProductManufacturerId(manufacturerId);
    } else {
      const src = window.location.search;
      const ref = new URLSearchParams(src);
      const productType = ref.get("productType");
      const manufacturerId = ref.get("manufacturerId");
      const productId = ref.get("productId");
      setProductID(productId);
      setProductType(productType);
      setSelectedProduct(productType);
      setProductManufacturerId(manufacturerId);
    }
    setOverviewActive(true);
   (manufacturerId?.toLowerCase() === "usfb" || manufacturerId?.toLowerCase() === "unity") && setTenureMaxRange(10);
  }, []);

  return (
    <div className="">
      <div className="mb-6 ">
        <ErrorModal
          canShow={showModal}
          updateModalState={toggleModal}
          errorMessage={showErrorInModal}
        />
        <div className="flex flex-row my-3 place-content-between flex-wrap gap-3 w-full">
          <div
            className={`flex items-center flex-wrap w-full lg:flex-nowrap bg-white justify-start gap-2 bg-primary-white p-3 rounded-xl shadow-md items-center  ${productInfo?.screenType === "fdProducts" ? "w-fit" : "w-full"
              }`}
          >
            {fdDetails["logoUrl"] ? (
              <div className="product-image">
                <img
                  src={fdDetails["logoUrl"]}
                  alt="logo"
                  width={80}
                  height={10}
                  className="object-contain"
                />
              </div>
            ) : (
              <Skeleton width={200} />
            )}
            {!isOnboardingUser ? (
              <div className="flex flex-col gap-2 w-full ">
                <div className="flex flex-row gap-2 justify-between items-center">
                  <div className="text-medium text-3xl text-black">
                    {fdDetails["fdName"] ? (
                      fdDetails["fdName"]
                    ) : (
                      <Skeleton width={100} />
                    )}
                  </div>
                  {(isOnboardingUser !== undefined && !isOnboardingUser) ||
                    productInfo?.screenType === "dashboard" ? (
                    <div className="flex items-center gap-2">
                      <button
                        className={
                          isLoading
                            ? "button-active    text-medium text-xl lg:text-2xl w-fit   text-medium text-xl lg:text-2xl w-fit  "
                            : "button-active btn-gradient button-transition hover:bg-btn-gradient text-medium text-xl lg:text-2xl w-fit   text-medium text-xl lg:text-2xl w-fit  hover:button-shadow"
                        }
                        onClick={handleInvestBtnClick}
                        disabled={isLoading}
                      >
                        {translate(COMMON_CONSTANTS.invest)}
                        {isLoading ? <Loader /> : null}
                      </button>
                    </div>
                  ) : null}
                </div>

              </div>
            ) : (
              <div className="flex flex-col text-black">
                <div className="text-medium text-5xl">
                  {fdDetails["fdName"] ? (
                    fdDetails["fdName"]
                  ) : (
                    <Skeleton width={100} />
                  )}
                </div>
                <div className="text-medium text-2xl text-light-gray">
                  {productInfo?.productType ? productInfo?.productType : null}
                </div>
              </div>
            )}
          </div>
          {productInfo?.screenType === "fdProducts" ? (
            <div className="flex items-center gap-2">
              <Link
                href={{
                  pathname: "/agent/fd_products",
                }}
              >
                <button
                  className={
                    isLoading
                      ? "button-active  button-transition hover:bg-hover-primary text-medium text-xl lg:text-2xl w-fit   text-medium text-xl lg:text-2xl w-fit  hover:button-shadow"
                      : "button-active btn-gradient button-transition hover:bg-hover-primary text-medium text-xl lg:text-2xl w-fit   text-medium text-xl lg:text-2xl w-fit  hover:button-shadow"
                  }
                  disabled={isLoading}
                >
                  {translate(COMMON_CONSTANTS.backToList)}
                  {isLoading ? <Loader /> : null}
                </button>
              </Link>
            </div>
          ) : null}
        </div>
        <div className="border-b sm:border-none my-1"></div>
        <div className="productinfo-card-position ">
          <div className="width-productinfo-card-position border-white mt-6">
            <div className="rounded overflow-hidden bg-dark-gray  shadow-lg rounded-xl  flex flex-col p-4" style={{ boxShadow: "0 20px 15px -8px #00000017" }}>
              <ul className="flex flex-row justify-between w-auto gap-2">
                <div className="flex flex-col ">
                  <li className="font-light text-xl text-black">{translate(COMMON_CONSTANTS.tenure)}</li>
                  <li className="font-medium text-medium text-2xl text-heading-color">
                    {fdDetails.hasOwnProperty(["minTenure"]) ? (
                      convertToTenor(fdDetails["minTenure"])
                    ) : (
                      <Skeleton width={70} />
                    )}{" "}
                    -{" "}
                    {fdDetails.hasOwnProperty(["maxTenure"]) ? (
                      convertToTenor(fdDetails["maxTenure"])
                    ) : (
                      <Skeleton width={70} />
                    )}
                  </li>
                </div>
                <div className="flex flex-col ">
                  <li className=" font-light text-xl text-black">
                    {translate(DETAIL_FD.minAmount)}
                  </li>
                  <li className="font-medium text-medium text-2xl text-heading-color">
                    ₹ {minAmount ? displayINRAmount(minAmount) : <Skeleton width={70} />}
                  </li>
                </div>
                <div className="flex flex-col ">
                  <li className=" font-light text-xl text-black">
                    {translate(COMMON_CONSTANTS.interestRate)}
                  </li>
                  <li className="font-medium text-medium text-2xl text-heading-color">
                    {productYield.hasOwnProperty([0]) ? (
                      productYield[0]
                    ) : (
                      <Skeleton width={70} />
                    )}
                    % -{" "}
                    {productYield.hasOwnProperty([1]) ? (
                      productYield[1]
                    ) : (
                      <Skeleton width={70} />
                    )}
                    %
                  </li>
                </div>
              </ul>
              <ul className=" flex flex-row text-apercu justify-between  margin-top-bottom w-auto gap-2">
                <div className="flex flex-col w-full">
                  <li className="font-light text-xl text-black">
                    {translate(COMMON_CONSTANTS.creditRating)}
                  </li>
                  <li className="font-semibold text-2xl text-black">
                    {ratingAgencies.length &&
                      ratingAgencies.map((rating, index) => {
                        return (
                          <span>
                            {`${rating}  `}
                            <span className="text-primary-green text-thicccboi-bold">
                              {productRating[index]
                                ? `${productRating[index]}${index !== ratingAgencies.length - 1
                                  ? ", "
                                  : ""
                                }`
                                : null}
                            </span>
                          </span>
                        );
                      })}
                  </li>
                </div>
                <div className="flex flex-col w-full text-end">
                  <li className="font-light text-xl text-black">
                    {translate(COMMON_CONSTANTS.payoutFrequency)}
                  </li>
                  <li className="text-black">
                    {selectedProduct?.toLowerCase().includes("non") ? (
                      fdDetails.hasOwnProperty(["fdPayoutMethod"]) ? (
                        <div className="flex items-center gap-1 text-medium text-2xl text-black justify-end">
                          {/* {translate(fdDetails["fdPayoutMethod"][0])}&#160;{" "}
                          {translate(fdDetails["fdPayoutMethod"][1])} */}
                          {fdDetails["fdPayoutMethod"].length > 2 ? (
                            <>
                              {
                                fdDetails["fdPayoutMethod"]
                                  ? fdDetails["fdPayoutMethod"].map((i, index) => {
                                    return (
                                      <div>
                                        <p className="font-medium text-medium text-2xl text-heading-color">
                                          {translate(i)}{index < fdDetails["fdPayoutMethod"].length - 1 ? ', ' : ''}

                                        </p>
                                      </div>
                                    );
                                  })
                                  : ""
                              }


                            </>
                          ) : null}
                        </div>
                      ) : (
                        <Skeleton width={70} />
                      )
                    ) : fdDetails.hasOwnProperty(["fdPayoutMethod"]) ? (
                      <p className="product-detail-bluecard-font font-medium text-medium text-2xl">
                        {" "}
                        {translate(COMMON_CONSTANTS.onMaturity)}
                      </p>
                    ) : (
                      <Skeleton width={70} />
                    )}
                  </li>
                </div>
              </ul>
              <div></div>
            </div>
            <div className="mt-5 desktop-horizontal-tab-scroll w-full  f rounded-t-xl  p-[20px] bg-dark-gray" style={{ boxShadow: "0 4px 10px #00000026" }}>
              <ul className="flex flex-row text-medium text-2xl text-light-gray gap-8 font-normal flex-wrap space-x-1">
                <li>
                  <a
                    onClick={(e) =>
                      highlightSelected("overview", e.currentTarget.value)
                    }
                    className={
                      isOverviewActive
                        ? "text-fd-primary border-b-2 border-fd-primary active"
                        : "text-black hover:text-fd-primary"
                    }
                    href="#"
                  >
                    {translate(COMMON_CONSTANTS.overview)}
                  </a>
                </li>
                <li>
                  <a
                    onClick={(e) =>
                      highlightSelected("highlights", e.currentTarget.value)
                    }
                    className={
                      isHighlightActive
                        ? "text-fd-primary border-b-2 border-fd-primary active"
                        : "text-black hover:text-fd-primary"
                    }
                    href="#highlight"
                  >
                    {translate(DETAIL_FD.highLights)}
                  </a>
                </li>
                <li>
                  <a
                    onClick={(e) =>
                      highlightSelected("issuer", e.currentTarget.value)
                    }
                    className={
                      isIssuerActive
                        ? "text-fd-primary border-b-2 border-fd-primary active"
                        : "text-black hover:text-fd-primary"
                    }
                    href="#issuer"
                  >
                    {translate(COMMON_CONSTANTS.issuer)}
                  </a>
                </li>
                <li>
                  <a
                    onClick={(e) =>
                      highlightSelected("rates", e.currentTarget.value)
                    }
                    className={
                      isInterestActive
                        ? "text-fd-primary border-b-2 border-fd-primary active"
                        : "text-black hover:text-fd-primary"
                    }
                    href="#interestrate"
                  >
                    {translate(DETAIL_FD.interestRates)}
                  </a>
                </li>
              </ul>
            </div>
            <div className="mobile-horizontal-tab-scroll cover text-xl info-style text-regular">
              <div className="flex items-center">
                <button className="left" onClick={() => rightScroll()}>
                  <FaAngleLeft />
                </button>
              </div>
              <div className="scroll-images">
                <div className="child">
                  <a
                    onClick={(e) =>
                      highlightSelected("overview", e.currentTarget.value)
                    }
                    className={
                      isOverviewActive
                        ? "text-fd-primary child-img border-b-2 border-fd-primary active"
                        : "child-img text-black hover:text-fd-primary"
                    }
                    href="#"
                  >
                    {translate(COMMON_CONSTANTS.overview)}
                  </a>
                </div>
                <div className="child">
                  <a
                    onClick={(e) =>
                      highlightSelected("highlights", e.currentTarget.value)
                    }
                    className={
                      isHighlightActive
                        ? "text-fd-primary child-img border-b-2 border-fd-primary active"
                        : "text-gray-500 child-img hover:text-fd-primary"
                    }
                    href="#highlight"
                  >
                    Highlights
                  </a>
                </div>
                <div className="child">
                  <a
                    onClick={(e) =>
                      highlightSelected("issuer", e.currentTarget.value)
                    }
                    className={
                      isIssuerActive
                        ? "text-fd-primary child-img border-b-2 border-fd-primary active"
                        : "text-gray-500 child-img hover:text-fd-primary"
                    }
                    href="#issuer"
                  >
                    {translate(COMMON_CONSTANTS.issuer)}
                  </a>
                </div>
                <div className="child">
                  <a
                    onClick={(e) =>
                      highlightSelected("rates", e.currentTarget.value)
                    }
                    className={
                      isInterestActive
                        ? "text-fd-primary child-img border-b-2 border-fd-primary active"
                        : "text-gray-500 child-img hover:text-fd-primary"
                    }
                    href="#interestrate"
                  >
                    {translate(DETAIL_FD.interestRates)}
                  </a>
                </div>
              </div>
              <div className="flex items-center">
                <button className="right items-center" onClick={() => leftScroll()}>
                  <FaAngleRight />
                </button>
              </div>
            </div>

            {productDetails["Debt Quality"] ? (
              <div className="text-apercu margin-top-bottom">
                <div className="text-medium text-4xl">{translate(DETAIL_FD.debtQuality)}</div>
                <div className="debt-quality gap-2">
                  <div className="flex flex-col gap-2">
                    <div className="flex flex-row gap-2">
                      <Image src={dbquality} alt="logo" width={17} height={5} />
                      <div className="text-medium text-2xl">{translate(DETAIL_FD.security)}</div>
                    </div>
                    <div className="text-base text-apercu-regular">
                      {productDetails["Debt Quality"] ? (
                        productDetails["Debt Quality"]["Security"][0][
                        "catergoryDescription"
                        ]
                      ) : (
                        <Skeleton width={70} />
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <div className="flex flex-row gap-2">
                      <Image src={dbquality} alt="logo" width={17} height={5} />
                      <div className="text-medium text-2xl">{translate(DETAIL_FD.seniority)}</div>
                    </div>
                    <div className="text-base text-apercu-regular">
                      {productDetails["Debt Quality"] ? (
                        productDetails["Debt Quality"]["Seniority"][0][
                        "catergoryDescription"
                        ]
                      ) : (
                        <Skeleton width={70} />
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <div className="flex flex-row gap-2">
                      <Image src={dbquality} alt="logo" width={17} height={5} />
                      <div className="text-medium text-2xl">{translate(COMMON.Listed)}</div>
                    </div>
                    <div className="text-base text-apercu-regular">
                      {productDetails["Debt Quality"] ? (
                        productDetails["Debt Quality"]["Listed"][0][
                        "catergoryDescription"
                        ]
                      ) : (
                        <Skeleton width={70} />
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ) : null}
            <div className="h-fit rounded-b-xl  p-4 md:p-6  bg-white p-4" style={{ boxShadow: "0 12px 16px #3f6f8a29" }}>
              <div className="accordion-item margin-bottom">
                <div
                  className=" w-full"
                  onClick={() => setHighlightActive(!isHighlightActive)}
                >
                  <div
                    className="flex flex-row justify-between mb-2 item-center"
                    ref={highlightSection}
                  >
                    <div className="text-medium text-black text-xxl">{translate(DETAIL_FD.keyHighlights)}</div>
                    <div>
                      {isHighlightActive ? (
                        <IoIosArrowDropupCircle fill="primary-green" />
                      ) : (
                        <IoIosArrowDropdownCircle fill="primary-green" />
                      )}
                    </div>
                  </div>
                </div>
                {isHighlightActive && (
                  <div className="accordion-content border-b">
                    <div className="text-regular text-xl">
                      {productDetails.hasOwnProperty(["Key Highlights"]) ? (
                        productDetails["Key Highlights"].map((item) => {
                          return (
                            <div className="flex my-3 items-center">
                              <div className="flex text-sky-400 ">
                                <IoMdCheckboxOutline fill="primary-green" />
                              </div>
                              <div className="font-light text-xl text-black flex items-start ml-3">
                                {isValidURL(item) ? (
                                  <a href={
                                    item
                                  }
                                    className="text-fd-primary underline" target="__blank"
                                  >
                                    PNBHFC FD Application Form
                                  </a>
                                ) : (
                                  item
                                )}
                              </div>
                            </div>
                          );
                        })
                      ) : (
                        <Skeleton width={200} />
                      )}
                    </div>
                  </div>
                )}
                <div
                  className=" w-full"
                  onClick={() => setIssuerActive(!isIssuerActive)}
                  ref={issuerSection}
                >
                  <div className="flex flex-row justify-between mb-2 item-center">
                    <div className="text-medium text-xxl text-black">{translate(COMMON_CONSTANTS.issuer)}</div>
                    <div className="">
                      {isIssuerActive ? (
                        <IoIosArrowDropupCircle fill="primary-green" />
                      ) : (
                        <IoIosArrowDropdownCircle fill="primary-green" />
                      )}
                    </div>
                  </div>
                </div>
                {isIssuerActive && (
                  <div className="accordion-content border-b">
                    {fdDetails["logoUrl"] ? (
                      <div className="product-image mb-3 bg-dark-gray p-2 rounded">
                        <img
                          src={fdDetails["logoUrl"]}
                          alt="logo"
                          width="auto"
                          height="auto"
                        />
                      </div>
                    ) : (
                      <Skeleton width={70} />
                    )}
                    <p className="text-regular text-black text-xl text-justify mb-3">
                      {productDetails["Issuer"] ? (
                        productDetails["Issuer"]
                      ) : (
                        <Skeleton width={70} />
                      )}
                    </p>
                    {/* <div className="flex justify-center mt-4">
                      <table className="auto">
                        <tr>
                          <th className="pr-3 text-left text-medium text-xl text-light-gray font-normal">
                            Total Annual Revenue
                          </th>
                          <th className="px-3 text-left text-medium text-xl text-light-gray font-normal">
                            Year of Inception
                          </th>
                          <th className="px-3 text-left text-medium text-xl text-light-gray font-normal">
                            Industry
                          </th>
                        </tr>
                        <tbody>
                          {issuerdata.map((item) => {
                            return (
                              <tr key={item["revenue"]}>
                                <td className={`text-medium text-base ${fd_detail_css.col_issuer} pr-3 text-left`}>
                                  {item["revenue"]}
                                </td>
                                <td className={`text-medium text-base ${fd_detail_css.col_issuer} px-3 text-left`}>
                                  {item["yearofinception"]}
                                </td>
                                <td className={`text-medium text-base ${fd_detail_css.col_issuer} px-3 text-left`}>
                                  {item["industry"]}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div> */}
                  </div>
                )}
                <div
                  className="w-full"
                  onClick={() => setInterestActive(!isInterestActive)}
                  ref={interestRateSection}
                >
                  <div className="flex flex-row justify-between margin-bottom item-center">
                    <div className="text-medium text-black text-3xl">{translate(DETAIL_FD.interestRates)}</div>
                    <div className="">
                      {isInterestActive ? (
                        <IoIosArrowDropupCircle fill="primary-green" />
                      ) : (
                        <IoIosArrowDropdownCircle fill="primary-green" />
                      )}
                    </div>
                  </div>
                </div>
                {isInterestActive && (
                  <div className="accordion-content border-b">
                    <div className="flex">
                      <div className="flex justify-end gap-3 items-center text-regular text-light-gray">
                        <div>
                          <select
                            className="text-regular text-xl text-light-gray text-black border border-gray-300 shadow bg-white p-1 w-full rounded mb-"
                            aria-label="Default select example"
                            onChange={(e) => {
                              handleInterestRatesChange(e.target.value);
                            }}
                            value={interestRateType}
                          >
                            {interestDorpDownItems.length
                              ? interestDorpDownItems.map((option, key) => {
                                return (
                                  <option key={option + "-" + key}>
                                    {INTEREST_RATES_DROPDOWN[option]}
                                  </option>
                                );
                              })
                              : null}
                          </select>
                        </div>
                        <div>
                          <select
                            className="text-regular text-xl text-light-gray text-black border border-gray-300 shadow bg-white p-1 w-full rounded mb-"
                            aria-label="Default select example"
                            onChange={(e) =>
                              handlePayoutFrequencyChange(e.target.value)
                            }
                            value={payoutFreqForInterest}
                          >
                            {fdDetails?.fdPayoutMethod?.length
                              ? fdDetails?.fdPayoutMethod.map(
                                (option, index) => {
                                  return (
                                    <option
                                      key={"payout-" + option + "-" + index}
                                    >
                                      {option}
                                    </option>
                                  );
                                }
                              )
                              : null}
                          </select>
                        </div>
                      </div>
                    </div>
                    <div className="flex justify-between margin-top-bottom">
                      <div className="text-medium text-xl text-light-gray w-3/5">
                        {translate(DETAIL_FD.period)}
                      </div>
                      <div className="text-medium text-xl text-light-gray w-2/5 text-right">
                        {translate(COMMON_CONSTANTS.interestRatePA)}
                      </div>
                    </div>
                    {selectedInterestRate && selectedInterestRate.length > 0 && (
                      <div>
                        {/* Display amount range at the top */}
                        {/* <div className="text-regular text-base text-light-gray text-black mb-4">
      Amount Range: ₹{selectedInterestRate[0].fdMinAmount?.toLocaleString('en-IN')} - ₹{selectedInterestRate[0].fdMaxAmount?.toLocaleString('en-IN')}
    </div> */}

                        {/* Display interest rate chart */}
                        {Object.entries(
                          selectedInterestRate.reduce((groups, item) => {
                            const min = item.fdMinAmount;
                            const max = item.fdMaxAmount;
                            const rangeKey =
                              min === max
                                ? `₹${min.toLocaleString('en-IN')}`
                                : `₹${min.toLocaleString('en-IN')} - ₹${max.toLocaleString('en-IN')}`;
                            if (!groups[rangeKey]) {
                              groups[rangeKey] = {
                                items: [],
                                minAmount: min
                              };
                            }
                            groups[rangeKey].items.push(item);
                            return groups;
                          }, {})
                        )
                          .sort((a, b) => a[1].minAmount - b[1].minAmount)
                          .map(([amountRange, groupData]) => (
                            <div key={amountRange} className="mb-8">
                              <div className="font-medium mb-2">
                                <span className="text-lg font-bold text-black">Amount: {amountRange}</span>
                              </div>
                              <table className="w-full border-collapse">
                                <thead>
                                  <tr className="border-b-2 border-t-2 border-gray-200">
                                    <th className="py-2 text-left text-black font-semibold">Tenure</th>
                                    <th className="py-2 text-right text-black font-semibold">Interest Rate</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {groupData.items.map((value, index) => {
                                    const duration = Object.keys(value).find(
                                      key =>
                                        key !== 'displayTenure' &&
                                        key !== 'displaySequence' &&
                                        key !== 'fdMinAmount' &&
                                        key !== 'fdMaxAmount'
                                    );
                                    const interestRate = value[duration];
                                    const displayText =
                                      value?.displayTenure || interestRateDurationInMonth(duration);

                                    return (
                                      <tr className="border-b border-gray-200" key={`${duration}-${index}`}>
                                        <td className="py-3 text-left text-black">
                                          {displayText || <Skeleton width={70} />}
                                        </td>
                                        <td className="py-3 text-right text-black">
                                          {interestRate ? `${interestRate}%` : <Skeleton width={70} />}
                                        </td>
                                      </tr>
                                    );
                                  })}
                                </tbody>
                              </table>
                            </div>
                          ))}

                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

          </div>
          <div className="width-productinfo-card-position mt-6">
            <div className="product-info-mobile-view flex text-apercu mx-3">
              <div className="flex flex-row space-x-3">
                {Object.keys(PRODUCT_TYPE).map((statusName, index) => {
                  return fdDetails?.fdType?.includes(
                    PRODUCT_TYPE[statusName]
                  ) ? (
                    <div
                      key={`${statusName + index}`}
                      className="text-black flex gap-2 items-center w-max"
                    >
                      <input
                        type="radio"
                        onChange={(e) =>
                          handleProductSelected(PRODUCT_TYPE[statusName])
                        }
                        checked={
                          PRODUCT_TYPE[statusName].toLowerCase() ===
                          selectedProduct?.toLowerCase()
                        }
                        value={
                          PRODUCT_TYPE[statusName].toLowerCase() ===
                          selectedProduct?.toLowerCase()
                        }
                        name={statusName}
                        className="w-5 h-5 text-fd-primary"
                      />
                      <label
                        className="align-top font-semibold"
                        htmlFor={PRODUCT_TYPE[statusName]}
                      >
                        {translate(PRODUCT_TYPE[statusName])}
                      </label>
                    </div>
                  ) : (
                    <></>
                  );
                })}
              </div>
            </div>
            <div className="shadow mt-3">
              <div className="flex justify-between rounded-t-xl  py-3 px-4 card-header">
                <span className="text-medium text-2xl text-black">{translate(DETAIL_FD.cashFlow)}</span>
                <button onClick={() => setShowGraph(!showGraph)}>
                  <div
                    className={`flex ${fd_detail_css.hide_graph_text} flex-row text-xs text-fd-primary items-center space-x-3`}
                  >
                    {showGraph ? (
                      <>
                        <span>{translate(DETAIL_FD.hideGraph)}</span>{" "}
                        <IoIosArrowDropupCircle className="text-fd-primary" />
                      </>
                    ) : (
                      <>
                        <span>{translate(DETAIL_FD.viewGraph)}</span>{" "}
                        <IoIosArrowDropdownCircle className="text-fd-primary" />
                      </>
                    )}
                  </div>
                </button>
              </div>
              {showGraph ? (
                <div className="bg-white rounded-b-xl">
                  <div className="flex flex-col p-5">
                    <div className="flex flex-row justify-between">
                      <span className="font-light text-2xl text-black">
                        {translate(DETAIL_FD.investmentAmount)}
                      </span>
                      <div className="font-normal text-4xl text-fd-primary max-w-fit border rounded border-inherit p-1">
                        {/* <span>{"₹ "}</span> */}
                        <input
                          className="outline-none w-fit text-right"
                          placeholder={translate(AGENT.fdAmount)}
                          value={"₹ " + depositAmountInput.toLocaleString("en-IN")}
                          defaultValue={
                            minAmount
                              ? displayINRAmount(minAmount)
                              : fdDetails["fdMinAmount"]
                                ? displayINRAmount(fdDetails["fdMinAmount"])
                                : 100
                          }
                          // pattern="[0-9,]*"
                          name="depositAmountInput"
                          onBlur={() =>
                            setDepositAmountInput((value) =>
                              value.toLocaleString("en-IN")
                            )
                          }
                          onChange={(e) => {
                            let inputValue = e.target.value.replace(/[^0-9]/g, "");

                            if (inputValue === "") {
                              setDepositAmountInput("");
                            } else {
                              const parsedValue = parseInt(inputValue, 10);
                              if (!isNaN(parsedValue) && parsedValue <= fdDetails.fdMaxAmount) {
                                setDepositAmountInput(parsedValue.toLocaleString("en-IN"));
                              }
                            }
                          }}
                        />
                      </div>
                    </div>
                    <div className="mb-3 px-6">
                      {maxAmount && maxAmount ? parseInt(depositAmountInput?.toString().replaceAll(",", "")) > maxAmount ||
                        parseInt(depositAmountInput?.toString().replaceAll(",", "")) < minAmount ||
                        !depositAmountInput ? (
                        <span className="text-base text-light-red">
                          {translate(INVESTMENT_DETAILS.invalidAmountLimit)}

                        </span>
                      ) : null : null}
                    </div>
                    <div className="flex flex-row justify-center">
                      <input
                        type="range"
                        min={minAmount ? minAmount : fdDetails["fdMinAmount"]}
                        max={maxAmount ? maxAmount : fdDetails["fdMaxAmount"]}
                        defaultValue={
                          minAmount
                            ? displayINRAmount(minAmount)
                            : fdDetails["fdMinAmount"]
                              ? displayINRAmount(fdDetails["fdMinAmount"])
                              : 100
                        }
                        className="range range-xs w-full accent-fd-primary custom-range"
                        value={depositAmountInput}
                        onMouseUpCapture={(e) =>
                          setDepositAmountInput(parseInt(e.target.value))
                        }
                        onTouchEnd={(e) =>
                          setDepositAmountInput(parseInt(e.target.value))
                        }
                        onChange={(e) => {
                          setDepositAmountInput(e.target.value);
                        }}
                      />
                    </div>
                    <div className="flex flex-row justify-center justify-between px-4">
                      <div className="text-black font-bold text-base">
                        {`${minAmount ? "₹ " + displayINRAmount(minAmount) : ""}`}
                      </div>
                      <div className="text-black font-bold text-base">
                        {`${maxAmount ? "₹ " + displayINRAmount(maxAmount) : ""}`}
                      </div>
                    </div>
                    <div className="flex flex-row justify-between my-3">
                      <span className="font-light text-2xl text-black">
                        {translate(COMMON_CONSTANTS.tenure)}
                      </span>
                      <div className="text-medium text-4xl text-fd-primary max-w-fit border rounded border-inherit p-1 px-2">
                        {tenureInput + " " + `${translate(COMMON_CONSTANTS.year)}`}
                      </div>
                    </div>
                    <div className="flex flex-row justify-center">
                      <input
                        type="range"
                        min={1}
                        max={tenureMaxRange}
                        defaultValue={tenureInput}
                        className="range range-xs w-full accent-fd-primary custom-range"
                        value={tenureInput}
                        onMouseUpCapture={(e) =>
                          setTenureInput(e.target.value)
                        }
                        onTouchEnd={(e) =>
                          setTenureInput(e.target.value)
                        }
                        onChange={(e) => {
                          let val = parseInt(e.target.value, 10);
                           if (val === 4 &&  productManufacturerId?.toLowerCase() === "shriram") {
                                val = 5;
                                     }
                          setTenureInput(val);
                        }}
                      />
                    </div>
                    <div className="flex flex-row justify-center justify-between px-4">
                      <div className="text-black font-bold text-base">
                        {`${"1"} ${translate(COMMON_CONSTANTS.year)}`}
                      </div>
                      <div className="text-black font-bold text-base">
                        {`${tenureMaxRange} ${translate(COMMON_CONSTANTS.year)}`}
                      </div>
                    </div>
                    <div className="flex flex-row justify-between p-4">
                      <div className="flex justify-start flex flex-col text-medium">
                        <span className="text-xs text-black flex justify-start text-apercu mb-2">
                          {translate(COMMON_CONSTANTS.interestRate)}/ {translate(DETAIL_FD.annum)}
                        </span>
                        <span className="text-xs text-black">
                          ({Object.keys(fdCalculatorResult).length ? fdCalculatorResult.interestRate + "%" : "6%"}{" "} {translate(DETAIL_FD.pa)})
                        </span>
                      </div>
                      {selectedProduct?.toLowerCase().includes("non") ? (
                        <div className="flex">
                          <div>
                            <span className="text-xs text-black flex justify-start text-apercu mb-2">
                              {translate(COMMON_CONSTANTS.payoutFrequency)}
                            </span>
                            <select
                              className="text-regular text-xl text-light-gray text-black border border-gray-300 shadow bg-white p-1 w-full rounded mb-"
                              aria-label="Default select example"
                              onChange={(e) => setPayoutMethod(e.target.value)}
                            >
                              <option value="monthly">{translate(COMMON_CONSTANTS.monthly)}</option>
                              <option value="quarterly">{translate(COMMON_CONSTANTS.quarterly)}</option>
                              <option value="half-yearly">{translate(COMMON_CONSTANTS.halfYearly)}</option>
                              <option value="yearly" selected>
                                {translate(COMMON_CONSTANTS.yearly)}
                              </option>
                            </select>
                          </div>
                        </div>
                      ) : null}
                    </div>
                    <div className="flex flex-col gap-3 py-6 px-4">
                      <div className="text-medium test-4xl text-black">
                        {translate(DETAIL_FD.cashFlowTimeline)}
                      </div>
                      {Object.keys(fdCalculatorResult).length ? (
                        <TimelineSeries
                          fdCalculatorResult={fdCalculatorResult}
                        />
                      ) : null}
                    </div>
                    <div className="text-regular text-base text-light-gray p-6 pt-0">
                      {translate(DETAIL_FD.disclaimer)}: {process_disclaimers("FdInfo", {})}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="border-b"></div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default FDProductInfo;

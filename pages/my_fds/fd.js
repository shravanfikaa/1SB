import appConfig from "../../app.config";
import { GetApiHandler, PostApiHandler } from "../api/apihandler";
import { useState, useEffect, useRef } from "react";
import Setting from "../setting/setting-view";
import {
  AiFillCheckCircle,
  AiFillCloseCircle,
  AiOutlineDownload,
} from "react-icons/ai";
import { VscDebugStart, VscDebugRestart } from "react-icons/vsc";
import { FiRefreshCcw } from "react-icons/fi";
import { FaFilter } from "react-icons/fa";
import ErrorModal from "../common/errorPopup";
import ApplicationStatusModal from "./applicationStatusPopup";
import { LocalStorageHandler } from "../../lib/storage_handler";
import alasql from "alasql";
import {
  displayINRAmount,
  handleEventLogger,
  moveSessionItemsToLocalStorage,
  isMobile
} from "../../lib/util";
import { generateALSQLWhereClause } from "../../lib/product_list_utils";
import { formatDate } from "../../lib/util";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import ProgressPopup from "../review_invest/progress_popup";
import FDSidebar from "./fdSidebar";
import styles from "../../styles/fd.module.css";
import popupcss from "../../styles/popup_modals.module.css";
import { IoMdClose } from "react-icons/io";
import RenewFDPopup from "./RenewFDPopup";
import HistoryPopup from "./historyPopup";
import NavBarMain from "../navbar/NavBarMain";
import DropdownParent from "../../_components/DropdownParent";
import { BsFillInfoCircleFill } from "react-icons/bs";
import { Tooltip } from "@material-tailwind/react";
import {
  PNB_WITHDRAW,
  AFTER_REVIEW, AGENT, COMMON_CONSTANTS, FD_RENEWAL, MAKE_PAYMENT_FDS, prePaymentManufacturers,
  REDIRECTION_MSG, RM_AGENT_COLUMNS,
  COMMON
} from "../../constants";
import WithdrawPopup from "./WithdrawPopup";
import { useTranslation } from "react-i18next";

let selectedFdID = 0;
function AllFds() {
  const [spinId, setSpinId] = useState("");
  const [isMultiMsgFlag, setIsMultiMsgFlag] = useState(false);
  const [multipleMsgList, setMultipleMsgList] = useState([]);
  const [isAPIDataLoaded, setIsAPIDataLoaded] = useState(false);
  const [withdrawalDetails, setWithdrawalDetails] = useState();

  const [showDatePopup, setShowDatePopup] = useState(false);
  const [data, setData] = useState([]);
  const [numberOfFD, setNumberOfFD] = useState();
  const [fdOpenFromDate, setFdOpenFromDate] = useState();
  const [fdOpenToDate, setFdOpenToDate] = useState();
  const [fdMaturityFromDate, setFdMaturityFromDate] = useState();
  const [fdMaturityToDate, setFdMaturityToDate] = useState();
  const [showProgressPopup, setShowProgressPopup] = useState(false);
  const [titleMsg, setTitleMsg] = useState("");
  const [bodyMsg1, setBodyMsg1] = useState("");
  const [bodyMsg2, setBodyMsg2] = useState("");
  const [showErrorModal, setShowErrorModal] = useState(false);
  const toggleErrorModal = () => setShowErrorModal((state) => !state);
  const [showApplicationStatusModal, setApplicationStatusModal] =
    useState(false);
  const toggleApplicationStatusModal = () =>
    setApplicationStatusModal((state) => !state);
  const [apiErrorMessage, setapiErrorMessage] = useState("");
  const [apiMessageDetails, setapiMessageDetails] = useState("");
  const [apiErrorMessageType, setapiErrorMessageType] = useState("alert");
  const [renewFDItem, setRenewFDItem] = useState({});
  const [showRenewFDModal, setShowRenewFDModal] = useState(false);
  const toggleRenewFDModal = () => setShowRenewFDModal((show) => !show);
  const [showHistoryFDModal, setShowHistoryFDModal] = useState(false);
  const [refreshLoader, setRefreshLoader] = useState(false);
  const [applicationStatus, setApplicationStatus] = useState({});
  const [showWithdrawalModal, setShowWithdrawalModal] = useState(false);
  const [disableVKYC, setDisableVKYC] = useState(false);

  const toggleHistoryFDModal = () => setShowHistoryFDModal((show) => !show);
  const toggleWithdrawalModal = () => setShowWithdrawalModal((show) => !show);

  const statusRef = useRef(null);
  const typeRef = useRef(null);

  useEffect(() => {
    setNumberOfFD(tempTypeArray.length);
  });

  useEffect(() => {
    getAllFds();
  }, []);

  const { t: translate } = useTranslation();

  function convert(str) {
    var date = new Date(str),
      mnth = ("0" + (date.getMonth() + 1)).slice(-2),
      day = ("0" + date.getDate()).slice(-2);
    return [date.getFullYear(), mnth, day].join("-");
  }

  //calculate One Days Earlier Date
  function isDateOneDayEarlier(fdStartDate) {
    const today = new Date();

    const oneDayAgo = new Date();
    oneDayAgo.setDate(today.getDate() - 1);

    const fdStartDateObject = new Date(fdStartDate);

    today.setHours(0, 0, 0, 0);
    oneDayAgo.setHours(0, 0, 0, 0);
    fdStartDateObject.setHours(0, 0, 0, 0);

    return fdStartDateObject.getTime() <= oneDayAgo.getTime();
  }

  //disable WithDraw Button
  const isDisableWithDrawBtn = (item) => {
    if (item?.additional_params?.prematureWithdrawalApproved) {
      return true;
    } else if (item?.fdr_number === null || item?.fdr_number === "") {
      return true;
    } else if (
      isDateOneDayEarlier(item.fd_booking_date) &&
      item?.payment_status?.toLowerCase() === "success" &&
      item.status.toLowerCase() === "completed"
    ) {
      return false;
    } else {
      return true;
    }
  };

  //get All FDs
  const getAllFds = () => {
    const fdURL =
      appConfig?.deploy?.baseUrl + appConfig?.deploy?.getAllFd;
    GetApiHandler(fdURL, "GET").then((response) => {
      if (response.data !== undefined) {
        setData(response.data.data);
        setIsAPIDataLoaded(true);
      } else {
        setIsAPIDataLoaded(true);
      }
    });
  };
  // Function to get applicationStatus for provided fdID / applicationNumber
  function fetchApplicationStatus(id) {
    const startPollingTimer = Date.now();
    setSpinId(id);
    var url =
      appConfig?.deploy?.baseUrl +
      appConfig?.deploy?.applicationStatus +
      id;
    setRefreshLoader(true);
    setShowErrorModal(false);

    const newUrl = url.replace("/v1/", "/v2/");
    GetApiHandler(newUrl, "GET")
      .then((response) => {
        if (response?.data?.data) {
          let result = response.data.data;
          if (result != null && result.applicationNumber) {
            result.applicationNumber &&
              getApplicationStatus(result.applicationNumber, startPollingTimer);
          }
        }
      })
      .catch((error) => {
        console.log("Error", error);
      });
  }
  //getApplicationStatus
  const getApplicationStatus = (applicationNo, startPollingTimer) => {
    var url =
      appConfig?.deploy?.baseUrl +
      appConfig?.deploy?.applicationStatusPoll +
      applicationNo;
    const currentTime = Date.now();
    const timeDifference = currentTime - startPollingTimer;
    const secondsDifference = timeDifference / 1000;
    //call GetApi Handler
    GetApiHandler(url, "GET")
      .then((response) => {
        if (response.status === 404 && secondsDifference < 30) {
          setTimeout(() => {
            getApplicationStatus(applicationNo, startPollingTimer);
          }, 5000);
        } else if (response.status === 200) {
          setApplicationStatus({
            ...applicationStatus,
            [applicationNo]: response.data.data.fdApplicationStatus,
          });
          setRefreshLoader(false);
          getAllFds();
        } else if (response.data.errors.length > 0) {
          setShowErrorModal(true);
          setapiErrorMessageType("alert");
          setapiErrorMessage(response.data.errors[0].errorIdentifier);
          setapiMessageDetails(response.data.errors[0].errorMessage);
          setRefreshLoader(false);
        } else {
          setShowErrorModal(true);
          setapiErrorMessageType("alert");
          setapiMessageDetails("Something Went Wrong, Please Try Again!")
          setRefreshLoader(false);
        }
      })
      .catch((error) => {
        setRefreshLoader(false);
        console.log("Error In Polling", error);
      });
  };
  function setDateFilters(date, field_label) {
    switch (field_label) {
      case "open_start":
        setFdOpenFromDate(date);
        break;
      case "open_end":
        setFdOpenToDate(date);
        break;
      case "maturity_start":
        setFdMaturityFromDate(date);
        break;
      case "maturity_end":
        setFdMaturityToDate(date);
        break;
      default:
        break;
    }
  }

  // -------------------------------------FD FILTER
  const [selectedType, setSelectedType] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState([]);
  const [rangeStart, setRangeStart] = useState(new Date());
  const [rangeEnd, setRangeEnd] = useState(new Date());

  let fdOpenStartDate = fdOpenFromDate ? convert(fdOpenFromDate) : "";
  let fdOpenEndDate = fdOpenToDate ? convert(fdOpenToDate) : "";
  let fdMaturityStartDate = fdMaturityFromDate ? convert(fdMaturityFromDate) : "";
  let fdMaturityEndDate = fdMaturityToDate ? convert(fdMaturityToDate) : "";

  function applyDateRange(is_dates_set) {
    fdOpenStartDate = fdOpenFromDate ? convert(fdOpenFromDate) : "";
    fdOpenEndDate = fdOpenToDate ? convert(fdOpenToDate) : "";
    fdMaturityStartDate = fdMaturityFromDate ? convert(fdMaturityFromDate) : "";
    fdMaturityEndDate = fdMaturityToDate ? convert(fdMaturityToDate) : "";

    finalFilteredResults(
      userSelectedTypes,
      userSelectedStatus,
      fdOpenStartDate,
      fdOpenEndDate,
      fdMaturityStartDate,
      fdMaturityEndDate,
      searchValue
    );
  }


  //===========TYPE**==============
  let tempTypeArray = data;
  let typeArray = [];
  let uniqueType = [];
  if (tempTypeArray) {
    for (let i = 0; i < tempTypeArray.length; i++) {
      if (tempTypeArray[i].type) {
        typeArray.push(tempTypeArray[i].type?.toLowerCase());
      }
    }
    uniqueType = [...new Set(typeArray)];
  }
  let jsonTypeArray = [];

  if (uniqueType) {
    for (let i = 0; i < uniqueType.length; i++) {
      const jsonBody = {
        id: "",
        title: "",
      };
      jsonBody.id = uniqueType[i];
      jsonBody.title = uniqueType[i];
      jsonTypeArray.push(jsonBody);
    }
  }

  const toggleOptionType = ({ id }) => {
    setSelectedType((prevSelected) => {
      const newArray = [...prevSelected];
      if (newArray.includes(id)) {
        return newArray.filter((item) => item != id);
      } else {
        newArray.push(id);

        return newArray;
      }
    });
  };
  //===========STATUS==============

  let tempStatusArray = data;
  let jsonStatusArray = [];

  let statusArray = [];
  let uniqueStatus = [];
  if (statusArray) {
    for (let i = 0; i < tempStatusArray.length; i++) {
      if (tempStatusArray[i].payment_status) {
        statusArray.push(tempStatusArray[i].payment_status);
      }
    }

    statusArray.forEach((item) => {
      if (!uniqueStatus.includes(item.toLowerCase())) {
        uniqueStatus.push(item.toLowerCase());
      }
    });
  }
  if (uniqueStatus) {
    for (let i = 0; i < uniqueStatus.length; i++) {
      const jsonBody = {
        id: "",
        title: "",
      };
      jsonBody.id = uniqueStatus[i];
      jsonBody.title = uniqueStatus[i];
      jsonStatusArray.push(jsonBody);
    }
  }

  const toggleOptionStatus = ({ id }) => {
    setSelectedStatus((prevSelected) => {
      const newArray = [...prevSelected];
      if (newArray.includes(id)) {
        return newArray.filter((item) => item != id);
      } else {
        newArray.push(id);

        return newArray;
      }
    });
  };

  let userSelectedTypes = [];
  let userSelectedStatus = [];
  const [searchValue, setsearchValue] = useState("");

  function setTypes(val) {
    userSelectedTypes = val;
    finalFilteredResults(
      userSelectedTypes,
      userSelectedStatus.fdOpenStartDate,
      fdOpenEndDate,
      fdMaturityStartDate,
      fdMaturityEndDate,
      searchValue
    );
  }

  function setStatus(val) {
    userSelectedStatus = val;
    finalFilteredResults(
      userSelectedTypes,
      userSelectedStatus,
      fdOpenStartDate,
      fdOpenEndDate,
      fdMaturityStartDate,
      fdMaturityEndDate,
      searchValue
    );
  }

  function searchFunction(val) {
    setsearchValue(val);
    finalFilteredResults(
      userSelectedTypes,
      userSelectedStatus,
      fdOpenStartDate,
      fdOpenEndDate,
      fdMaturityStartDate,
      fdMaturityEndDate,
      searchValue
    );
  }

  function finalFilteredResults(
    userSelectedTypes,
    userSelectedStatus,
    fdOpenStartDate,
    fdOpenEndDate,
    fdMaturityStartDate,
    fdMaturityEndDate,
    searchValue
  ) {
    let productTypeFilter = generateALSQLWhereClause(
      userSelectedTypes,
      "type",
      "string"
    );
    let fdStatusFilter = generateALSQLWhereClause(
      userSelectedStatus,
      "payment_status",
      "string"
    );
    let whereClause =
      "(" + productTypeFilter + ") AND (" + fdStatusFilter + ")";
    if (fdOpenStartDate && fdOpenEndDate) {
      whereClause =
        whereClause +
        " AND ( fd_open_date >=  '" +
        fdOpenStartDate +
        "' AND fd_open_date <= '" +
        fdOpenEndDate +
        "')";
    }
    if (fdMaturityStartDate && fdMaturityEndDate) {
      whereClause =
        whereClause +
        " AND ( fd_maturity_date >=  '" +
        fdMaturityStartDate +
        "' AND fd_maturity_date <= '" +
        fdMaturityEndDate +
        "')";
    }
    if (searchValue) {
      whereClause =
        whereClause +
        " AND (application_number LIKE '" +
        searchValue +
        "%' OR fd_name LIKE '" +
        searchValue +
        "%' OR  status LIKE '" +
        searchValue +
        "%' OR  fdr_number LIKE '" +
        searchValue +
        "%' OR  interest_rate LIKE '" +
        searchValue +
        "%' OR  fd_amount LIKE '" +
        searchValue +
        "%' OR  tenor LIKE '" +
        searchValue +
        "%' OR  fd_open_date LIKE '" +
        searchValue +
        "%' OR  type LIKE '" +
        searchValue +
        "%')";
    }
    let finalQuery = "SELECT * FROM ?  WHERE " + whereClause;
    let arr1 = [];
    arr1 = alasql(finalQuery, [data]);
    tempTypeArray = arr1;
  }

  function resetall() {
    setsearchValue("");
    setSelectedType([]);
    setSelectedStatus([]);
    setFdOpenFromDate();
    setFdOpenToDate();
    setFdMaturityFromDate();
    setFdMaturityToDate();
  }

  function callRepayment(fdId, manufacturerId) {
    let isPrepaymentEnabled =
      appConfig?.deploy?.commitFDFlow.hasOwnProperty(manufacturerId) &&
      appConfig?.deploy?.commitFDFlow[manufacturerId][
        "payment"
      ].toLowerCase() == "prepayment";
    if (isPrepaymentEnabled) {
      setShowProgressPopup(false);
      setapiErrorMessage(
        "Manufacturer '" +
        manufacturerId +
        "' configured to accept prePayment. Post FD payments are not allowed"
      );
      setapiMessageDetails(
        "Please submit a new FD application along with successful payment"
      );
      setIsPaymentRetried(false);
      setShowErrorModal(true);
    } else {
      setIsPaymentRetried(true);
      let selectedManufactureId = new LocalStorageHandler().getLocalStorage(
        "selectedManufactureId"
      );
      selectedFdID = fdId;
      var repaymentUrl =
        appConfig?.deploy?.baseUrl + appConfig?.deploy?.repayment;
      let requestBody = {
        fdId: fdId,
      };
      setMultipleMsgList([]);
      setIsMultiMsgFlag(false);
      setTitleMsg(AFTER_REVIEW.pleaseWait);
      setBodyMsg1(COMMON.WeAreProcessingYourRequestPleaseWaitForAMoment);
      setShowProgressPopup(true);

      PostApiHandler(repaymentUrl, "POST", requestBody)
        .then((response) => {
          setBodyMsg1("Generating payment link...");
          if (response?.response?.data?.errors?.length) {
            setShowProgressPopup(false);
            setapiErrorMessage(
              response?.response?.data?.errors[0].errorMessage
            );
            setShowErrorModal(true);
            setIsPaymentRetried(false);
          } else {
            if (response?.data?.errors?.length) {
              setShowProgressPopup(false);
              setapiErrorMessage(response.data.errors[0].errorMessage);
              setIsPaymentRetried(false);
              setShowErrorModal(true);
            } else if (response.hasOwnProperty("message")) {
              setShowProgressPopup(false);
              setapiErrorMessage(response.message);
              setShowErrorModal(true);
              setIsPaymentRetried(false);
            } else {
              if (
                response?.data?.data?.paymentUrl
                  ?.toLowerCase()
                  .includes("invalid")
              ) {
                //error
                setShowProgressPopup(false);
                setapiErrorMessage(response?.data?.data?.paymentUrl);
                setIsPaymentRetried(false);
                setShowErrorModal(true);
              } else {
                if (response?.data?.data?.paymentUrl) {
                  setBodyMsg2("Payment Link generated");
                  window.location.href = response.data.data.paymentUrl;
                }
              }
            }
          }
        })
        .catch((err) => {
          console.error("Got Error while retrying Payment", err);
        });
    }
  }
  const [isPaymentRetried, setIsPaymentRetried] = useState(false);

  function openNav() {
    if (typeof window === "object") {
      document.getElementById("mySidenav").style.width = "272px";
    }
  }

  function closeNav() {
    if (typeof window === "object") {
      document.getElementById("mySidenav").style.width = "0px";
    }
  }

  const fetchVideoKYCStatus = (data) => {
    const videoKYCStatusURL =
      appConfig?.deploy?.baseUrl +
      appConfig?.deploy?.videoKycStatus +
      `?manufacturerId=${data?.manufacturer_id ? data.manufacturer_id : ""}` +
      `&videoKycRequestId=${data?.videoKycRequestId ? data.videoKycRequestId : ""
      }` +
      `&fdId=${data?.id ? data.id : ""}`;

    PostApiHandler(videoKYCStatusURL, "Post").then((res) => {
      setDisableVKYC(false);
      if (res?.data?.errors?.length) {
        const { errorMessage } = res.data.errors[0];
        setShowErrorModal(true);
        errorMessage
          ? setapiErrorMessage(errorMessage)
          : setapiErrorMessage(translate(AFTER_REVIEW.somethingWentWrong));
      } else if (res?.data?.data && Object.keys(res?.data?.data).length) {
        getAllFds();
      }
    });
  };

  const reInitiateVideoKYC = (data) => {
    let url =
      appConfig?.deploy?.baseUrl +
      appConfig?.deploy?.retryInitiateVKYC +
      `?fdId=${data?.id ? data.id : ""}`;

    PostApiHandler(url, "POST")
      .then((response) => {
        const { data } = response;
        setDisableVKYC(false);
        if (response?.data?.errors?.length) {
          const { errorMessage } = response.data.errors[0];
          setShowErrorModal(true);
          errorMessage
            ? setapiErrorMessage(errorMessage)
            : setapiErrorMessage(translate(AFTER_REVIEW.somethingWentWrong));
        } else if (data?.data && Object.keys(data?.data).length) {
          const { kycUrl } = data?.data;
          moveSessionItemsToLocalStorage();
          window.location.href = kycUrl;
        }
      })
      .catch((err) => {
        console.error("ERROR: " + err);
      });
  };

  const handleVKYCBtnClick = (item) => {
    setDisableVKYC(true);
    if (item?.vkycStatus.toLowerCase() === "pending") {
      fetchVideoKYCStatus(item);
    } else {
      reInitiateVideoKYC(item);
    }
  };

  const handlePNBWithdraw = (item) => {
    if (item?.manufacturer_id?.toUpperCase() === "PNBHFC") {
      const text = PNB_WITHDRAW?.text ? PNB_WITHDRAW?.text : "";
      toggleErrorModal();
      setapiErrorMessageType("alert");
      setapiErrorMessage(text);
    } else {
      setWithdrawalDetails(item);
      toggleWithdrawalModal();
    }
  };

  const handleESignBtnClick = (item) => {
    if (item?.additional_params?.esignStatus === "pending") {
      // fetchVideoKYCStatus(item);
    } else if (item?.additional_params?.esignStatus?.includes("reject")) {
      // reInitiateVideoKYC(item);
    }
  };

  const handleFDAdviceBtnClick = (item) => {
    let url =
      appConfig?.deploy?.baseUrl + appConfig?.deploy?.generateFdAdvice;

    const requestPayload = {
      applicationNumber: item?.application_number
        ? item.application_number
        : "",
      fdrNumber: item?.fdr_number ? item?.fdr_number : "",
      manufacturerId: item?.manufacturer_id ? item?.manufacturer_id : "USFB",
    };

    PostApiHandler(url, "POST", requestPayload)
      .then((response) => {
        const { data } = response;
        if (response?.data?.errors?.length) {
          const { errorMessage } = response.data.errors[0];
          setShowErrorModal(true);
          errorMessage
            ? setapiErrorMessage(errorMessage)
            : setapiErrorMessage(translate(AFTER_REVIEW.somethingWentWrong));
        } else if (data?.data) {
          console.log("redirection-->", data?.data);
          window.open(data.data, "_blank");
        }
      })
      .catch((err) => {
        console.error("ERROR: " + err);
      });
  };

  useEffect(() => {
    setNumberOfFD(tempTypeArray.length);
  });

  useEffect(() => {
    handleEventLogger("dashboard", "buttonClick", "Invest_Click", {
      action: "My_FD",
      Platform: isMobile()
    });
    getAllFds();
  }, []);

  return (
    <>
      <div>
        <NavBarMain />
        <Setting />
        {
          <div className={`${styles.mobileViewFilter} p-6 bg-slate-100`}>
            <div className="flex justify-between items-center">
              <div className="text-regular text-4xl text-light-gray">
                {translate(AGENT.totalFd)} : {numberOfFD}
              </div>
              <div
                className="font-medium text-black w-fit hover:cursor-pointer"
                onClick={openNav}
              >
                <div
                  className={`flex flex-row gap-3 justify-center items-center text-blue-900 text-regular dashboard-title `}
                >
                  {selectedStatus.length === 0 &&
                    selectedType.length === 0 &&
                    !fdOpenFromDate &&
                    !fdOpenToDate &&
                    !fdMaturityFromDate &&
                    !fdMaturityToDate &&
                    searchValue === "" ? (
                    <FaFilter className="text-fd-primary text-2xl font-bold" />
                  ) : (
                    <FaFilter className="text-light-orange text-2xl font-bold" />
                  )}
                  <div className="text-regular text-2xl text-blue-900">
                    {translate(COMMON_CONSTANTS.filters)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        }
        <div id="mySidenav" className="sidenav z-50 shadow-lg bg-slate-100 p-0">
          <div className="w-full h-full md:w-auto p-4 flex flex-col justify-between bg-white">
            <div className="flex flex-col flex-wrap gap-3">
              <div className="flex flex-row-reverse">
                <button onClick={() => closeNav()}>
                  <IoMdClose size={22} />
                </button>
              </div>
              <div className="w-full flex items-center gap-3 justify-between">
                <h2 className="text-apercu tracking-wide font-semibold">
                  {translate(COMMON_CONSTANTS.filters)}
                </h2>
                <div className="flex items-center gap-3">
                  {selectedStatus.length === 0 &&
                    selectedType.length === 0 &&
                    !fdOpenFromDate &&
                    !fdOpenToDate &&
                    !fdMaturityFromDate &&
                    !fdMaturityToDate &&
                    searchValue === "" ? (
                    <FaFilter className="text-fd-primary text-2xl font-bold" />
                  ) : (
                    <FaFilter className="text-light-orange text-2xl font-bold" />
                  )}
                  <div
                    className="text-regular text-2xl text-light-red hover:cursor-pointer"
                    onClick={resetall}
                  >
                    {translate(COMMON_CONSTANTS.resetAll)}
                  </div>
                </div>
              </div>
              <div className="w-full flex flex-col justify-between">
                <div className="flex flex-col w-full gap-3 mb-3 mt-3">
                  <div className="w-full text-regular text-2xl text-light-gray">
                    <input
                      type="text"
                      placeholder={translate(AGENT.search)}
                      value={searchValue}
                      onChange={(e) => searchFunction(e.target.value)}
                      className="w-ful shadow text-left border border-gray-300 rounded p-2 text-black"
                    />
                  </div>
                  <div className="w-full">
                    <div className="text-regular text-2xl text-light-gray w-full">
                      <div className="flex flex-col gap-3 justify-center">
                        <div className="flex flex-col gap-3">
                          <div className="text-medium text-xl text-black text-black">
                            {translate(AFTER_REVIEW.openDate)}
                          </div>
                          <div className="flex gap-3 justify-center">
                            <DatePicker
                              selectsStart
                              selected={fdOpenFromDate}
                              startDate={rangeStart}
                              maxDate={new Date()}
                              endDate={rangeEnd}
                              placeholderText={`${translate(MAKE_PAYMENT_FDS.from)}`}
                              className="p-2 w-full border border-gray-300 rounded text-regular text-2xl text-black"
                              onChange={(date) =>
                                setDateFilters(date, "open_start")
                              }
                              showYearDropdown
                              scrollableYearDropdown
                            />
                            <DatePicker
                              selectsEnd
                              selected={fdOpenToDate}
                              startDate={rangeStart}
                              endDate={rangeEnd}
                              placeholderText="To"
                              className="p-2 w-full border border-gray-300 rounded text-regular text-2xl text-black"
                              onChange={(date) =>
                                setDateFilters(date, "open_end")
                              }
                              maxDate={new Date()}
                              showYearDropdown
                              scrollableYearDropdown
                            />
                          </div>
                        </div>
                        <div className="flex flex-col gap-3">
                          <div className="text-medium text-xl text-black text-black">
                            {translate(AFTER_REVIEW.maturityDate)}
                          </div>
                          <div className="flex gap-3 justify-center">
                            <DatePicker
                              selectsStart
                              selected={fdMaturityFromDate}
                              startDate={rangeStart}
                              endDate={rangeEnd}
                              onChange={(date) =>
                                setDateFilters(date, "maturity_start")
                              }
                              className="p-2 w-full border border-gray-300 rounded text-regular text-2xl text-black"
                              placeholderText={`${translate(MAKE_PAYMENT_FDS.from)}`}
                              showYearDropdown
                              scrollableYearDropdown
                            />
                            <DatePicker
                              selectsEnd
                              selected={fdMaturityToDate}
                              startDate={rangeStart}
                              endDate={rangeEnd}
                              onChange={(date) =>
                                setDateFilters(date, "maturity_end")
                              }
                              className="p-2 w-full border border-gray-300 rounded text-regular text-2xl text-black"
                              placeholderText="To"
                              showYearDropdown
                              scrollableYearDropdown
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div>
                    <DropdownParent
                      options={jsonTypeArray}
                      selected={selectedType}
                      toggleOption={toggleOptionType}
                      onSelect={setTypes(selectedType)}
                      name={translate(AGENT.type)}
                      ref={typeRef}
                    />
                  </div>
                  <div>
                    <DropdownParent
                      options={jsonStatusArray}
                      selected={selectedStatus}
                      toggleOption={toggleOptionStatus}
                      onSelect={setStatus(selectedStatus)}
                      name={translate(AGENT.status)}
                      ref={statusRef}
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className="w-full flex justify-center gap-3">
              <button
                type="button"
                className="button-passive border-fd-primary text-fd-primary"
                onClick={() => {
                  closeNav();
                  applyDateRange(false);
                }}
              >
                {translate(COMMON_CONSTANTS.cancel)}
              </button>
              <button
                type="button"
                className="button-active btn-gradient button-transition hover:bg-hover-primary text-medium text-xl text-white lg:text-2xl w-fit   text-medium text-xl  lg:text-2xl w-fit  hover:button-shadow"
                onClick={() => {
                  closeNav();
                  applyDateRange(true);
                }}
              >
                {translate(AGENT.apply)}
              </button>
            </div>
          </div>
        </div>
        <div className=" page-background view-container fd_container_sm">
          <div className="flex w-full gap-10">
            <div
              className={`w-[35%] sidebarContainer  h-100 ${styles.filterContainer} ${styles.cardContainer}`}
            >
              <FDSidebar id={"2"} />
            </div>
            <div className={`w-full rounded-xl ${styles.cardContainer}`}>
              <div className="bg-white p-6 rounded-xl text-font fd_details_container">
                <div>
                  <div
                    className={`text-regular text-4xl text-light-gray ${styles.filterContainer}`}
                  >
                    {translate(AGENT.totalFd)} : {numberOfFD}
                  </div>
                  {showProgressPopup ? (
                    <ProgressPopup
                      title={titleMsg}
                      message1={bodyMsg1}
                      message2={bodyMsg2}
                      note={REDIRECTION_MSG.msg}
                    />
                  ) : null}
                  <ErrorModal
                    canShow={showErrorModal}
                    updateModalState={toggleErrorModal}
                    errorMessage={apiErrorMessage}
                    errorDetails={apiMessageDetails}
                    messageType={apiErrorMessageType}
                  />
                  <ApplicationStatusModal
                    canShow={showApplicationStatusModal}
                    updateModalState={toggleApplicationStatusModal}
                    message={apiErrorMessage}
                    messageDetails={apiMessageDetails}
                    messageType={apiErrorMessageType}
                    isMultiMsg={isMultiMsgFlag}
                    multiMsgList={multipleMsgList}
                  />
                  <div
                    className={`bg-white border-b border-slate-300 ${styles.filterContainer}`}
                  >
                    <div className="flex justify-between flex-wrap">
                      <div className="flex items-center flex-wrap gap-3 mb-3 mt-3">
                        <div className="text-regular text-2xl text-light-gray">
                          <input
                            type="text"
                            placeholder={translate(AGENT.search)}
                            value={searchValue}
                            onChange={(e) => searchFunction(e.target.value)}
                            className="w-40 text-left border border-gray-300  rounded px-1.5 py-1.5 text-black"
                          />
                        </div>
                        <div>
                          <button
                            className="bg-white w-40  border border-gray-200 rounded-md p-2 text-regular text-2xl text-light-gray text-left"
                            onClick={() => setShowDatePopup(true)}
                          >
                            {translate(AGENT.dateRange)}
                          </button>
                        </div>
                        <div className="w-40">
                          <DropdownParent
                            options={jsonTypeArray}
                            selected={selectedType}
                            toggleOption={toggleOptionType}
                            onSelect={setTypes(selectedType)}
                            name={`${translate(AGENT.type)}`}
                            ref={typeRef}
                          />
                        </div>
                        <div className="w-40">
                          <DropdownParent
                            options={jsonStatusArray}
                            selected={selectedStatus}
                            toggleOption={toggleOptionStatus}
                            onSelect={setStatus(selectedStatus)}
                            name={`${translate(AGENT.status)}`}
                            ref={statusRef}
                          />
                        </div>
                      </div>
                      <div className="flex flex-row items-center gap-3 mb-3 mt-3">
                        {selectedStatus.length === 0 &&
                          selectedType.length === 0 &&
                          !fdOpenFromDate &&
                          !fdOpenToDate &&
                          !fdMaturityFromDate &&
                          !fdMaturityToDate &&
                          searchValue === "" ? (
                          <FaFilter className="text-fd-primary text-2xl font-bold" />
                        ) : (
                          <FaFilter className="text-light-orange text-2xl font-bold" />
                        )}
                        <div
                          className="text-regular text-2xl text-light-red hover:cursor-pointer"
                          onClick={resetall}
                        >
                          {translate(COMMON_CONSTANTS.resetAll)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                {/* ======================================================== */}
                {tempTypeArray?.length > 0
                  ? tempTypeArray.map((item) => {
                    return (
                      <div
                        key={item.id}
                        className="rounded-xl   my-6"
                      >
                        <div className="h-3/4 p-6 bg-dark-gray rounded-t-xl">
                          <div className="flex  gap-3 justify-between">
                            <div className="flex gap-3 justify-between w-full">
                              <div>
                                <div className="text-medium text-black text-3xl">
                                  {item.fd_name}
                                </div>
                                <div className="text-medium text-xl text-black text-light-gray capitalize">
                                  {item?.type?.toLowerCase()}
                                </div>
                              </div>
                            </div>
                            <div className="flex gap-3 flex-wrap w-full justify-end">
                              {item?.vkycStatus ? (
                                <>
                                  <div className="text-medium text-xl text-black text-light-gray">
                                    <div>{translate(COMMON_CONSTANTS.VKYCStatus)}</div>
                                  </div>
                                  <div className="text-regular text-xl text-black text-fd-primary capitalize">
                                    <div>{item.vkycStatus}</div>
                                  </div>
                                  {item?.vkycStatus &&
                                    [
                                      "dropped",
                                      "pending",
                                      "reject",
                                      "refused",
                                      "initiated",
                                      "notinitiated",
                                    ].includes(
                                      item?.vkycStatus.toLowerCase()
                                    ) ? (
                                    <button
                                      className={(disableVKYC) ? "text-regular text-xl text-white button-active  w-auto h-fit p-1 hover:bg-hover-primary hover:border-hover-primary" : "text-regular text-xl text-white button-active btn-gradient w-auto h-fit p-1 hover:bg-hover-primary hover:border-hover-primary"}
                                      onClick={() => handleVKYCBtnClick(item)}
                                      disabled={disableVKYC}
                                    >
                                      {item?.vkycStatus?.toLowerCase() ===
                                        "pending" ? (
                                        <VscDebugRestart />
                                      ) : (
                                        <VscDebugStart />
                                      )}
                                    </button>
                                  ) : null}
                                </>
                              ) : null}
                              {item?.additional_params?.esignStatus ? (
                                <>
                                  <div className="text-medium text-xl text-black text-light-gray">
                                    <div>{translate(MAKE_PAYMENT_FDS.eSignStatus)}</div>
                                  </div>
                                  <div className="text-regular text-xl text-black text-fd-primary capitalize">
                                    <div>
                                      {item?.additional_params?.esignStatus}
                                    </div>
                                  </div>
                                  {item?.additional_params?.esignStatus?.toLowerCase() ===
                                    "pending" ||
                                    item?.additional_params.esignStatus?.includes(
                                      "reject"
                                    ) ? (
                                    <button
                                      className="text-regular text-xl text-white button-active btn-gradient w-auto h-fit p-1 hover:bg-hover-primary hover:border-hover-primary"
                                      onClick={() => handleVKYCBtnClick(item)}
                                    >
                                      {item?.additional_params?.esignStatus?.toLowerCase() ===
                                        "pending" ? (
                                        <VscDebugStart />
                                      ) : (
                                        <VscDebugRestart />
                                      )}
                                    </button>
                                  ) : null}
                                </>
                              ) : null}

                              {/* {item.auto_renewal_flag ? (
                                <button
                                  className="text-regular text-xl text-white button-active btn-gradient w-auto h-fit p-1 hover:bg-hover-primary hover:border-hover-primary"
                                  onClick={() => {
                                    setRenewFDItem(item);
                                    toggleRenewFDModal();
                                  }}
                                >
                                  {translate(AGENT.renew)}
                                </button>
                              ) : null} */}
                              <div className="flex gap-5">
                                <div><p className="text-medium text-xl text-black text-light-gray">
                                  {translate(AGENT.fdStatus)}
                                </p>
                                  <p className="text-regular text-xl text-black capitalize">{ item.status != null ? item.status.toLowerCase() : "Pending"}</p>
                                </div>
                                <div>
                                  <p className="text-medium text-xl text-black text-light-gray">{translate(AGENT.paymentStatus)}</p>
                                  <p className="text-regular text-xl text-black">
                                    <div className="capitalize">
                                      {item &&
                                        item.hasOwnProperty("payment_status") &&
                                        item.payment_status != null
                                        ? item.payment_status.toLowerCase()
                                        : "Pending"}
                                    </div>
                                  </p>
                                </div>
                                <div>
                                  {item?.status?.toLowerCase() !==
                                    "canceled" ? (
                                    <div>
                                      <button
                                        className="w-auto h-auto px-1"
                                        onClick={(e) =>
                                          fetchApplicationStatus(item.id)
                                        }
                                      >
                                        {spinId == item.id && refreshLoader ? (
                                          <FiRefreshCcw
                                            className="animate-spin text-green-500"
                                            type="btn"
                                          />
                                        ) : (
                                          <FiRefreshCcw
                                            className="text-green-500"
                                            type="btn"
                                          />
                                        )}
                                      </button>
                                    </div>
                                  ) : null}
                                  {/* {TBD: Right now hardcoded the retry button FD-1553} */}
                                  {item?.manufacturer_id &&
                                    !prePaymentManufacturers.includes(
                                      item?.manufacturer_id?.toLowerCase()
                                    ) ? (
                                    <>
                                      {item?.payment_status?.toLowerCase() !==
                                        "success" &&
                                        item?.payment_status?.toLowerCase() !==
                                        "canceled" ? (
                                        <button
                                          id={item.id}
                                          className={(isPaymentRetried &&
                                            selectedFdID == item["id"]) ? "text-regular text-xl text-white button-active  w-auto h-auto p-1 hover:bg-hover-primary hover:border-hover-primary" : "text-regular text-sm text-white button-active btn-gradient w-auto h-auto p-1 hover:bg-hover-primary hover:border-hover-primary"}
                                          disabled={
                                            isPaymentRetried &&
                                            selectedFdID == item["id"]
                                          }
                                          onClick={(e) =>
                                            callRepayment(
                                              item.id,
                                              item.manufacturer_id
                                            )
                                          }
                                        >{isPaymentRetried && selectedFdID === item.id ? (
                                          <div className="flex justify-center items-center">
                                            <div
                                              className="spinner-border animate-spin inline-block w-4 h-4 border-2 rounded-full mt-2"
                                              role="status"
                                            ></div>
                                          </div>
                                        ) : null}
                                          {translate(AGENT.retry)}
                                        </button>
                                      ) : null}
                                    </>
                                  ) : null}
                                </div>
                              </div>
                              {/* <div className="text-medium text-xl text-black text-light-gray">
                                <div>{translate(AGENT.fdStatus)}</div>
                                <div>{translate(AGENT.paymentStatus)}</div>
                              </div>
                              <div className="text-regular text-xl text-black text-fd-primary capitalize">
                                <div className="flex gap-2 items-center">
                                  {item.status}
                                  {applicationStatus[item.id] ||
                                    item?.status?.toLowerCase() ===
                                    "canceled" ? (
                                    <>
                                      <a className="group relative inline-block duration-300">
                                        <div className="flex flex-row items-center text-medium text-xl text-black text-black">
                                          <Tooltip
                                            content={
                                              item?.status?.toLowerCase() ===
                                                "canceled"
                                                ? `This FD has been canceled due to the Payment Failure - New FD has been generated with the application number - ${item.revised_application_number}`
                                                : [applicationStatus[item.id]]
                                            }
                                          >
                                            <a variant="gradient">
                                              <BsFillInfoCircleFill />
                                            </a>
                                          </Tooltip>
                                        </div>
                                      </a>
                                    </>
                                  ) : null}
                                </div>
                                <div>
                                  {item &&
                                    item.hasOwnProperty("payment_status") &&
                                    item.payment_status != null
                                    ? item.payment_status.toLowerCase()
                                    : "Pending"}
                                </div>
                              </div>
                              <div>
                                {item?.status?.toLowerCase() !==
                                  "canceled" ? (
                                  <div>
                                    <button
                                      className="w-auto h-auto px-1"
                                      onClick={(e) =>
                                        fetchApplicationStatus(item.id)
                                      }
                                    >
                                      {spinId == item.id && refreshLoader ? (
                                        <FiRefreshCcw
                                          className="animate-spin text-green-500"
                                          type="btn"
                                        />
                                      ) : (
                                        <FiRefreshCcw
                                          className="text-green-500"
                                          type="btn"
                                        />
                                      )}
                                    </button>
                                  </div>
                                ) : null}
                                
                                {item?.manufacturer_id &&
                                  !prePaymentManufacturers.includes(
                                    item?.manufacturer_id?.toLowerCase()
                                  ) ? (
                                  <>
                                    {item?.payment_status?.toLowerCase() !==
                                      "success" &&
                                      item?.payment_status?.toLowerCase() !==
                                      "canceled" ? (
                                      <button
                                        id={item.id}
                                        className={(isPaymentRetried &&
                                          selectedFdID == item["id"]) ? "text-regular text-xl text-white button-active  w-auto h-auto p-1 hover:bg-hover-primary hover:border-hover-primary" : "text-regular text-xl text-white button-active btn-gradient w-auto h-auto p-1 hover:bg-hover-primary hover:border-hover-primary"}
                                        disabled={
                                          isPaymentRetried &&
                                          selectedFdID == item["id"]
                                        }
                                        onClick={(e) =>
                                          callRepayment(
                                            item.id,
                                            item.manufacturer_id
                                          )
                                        }
                                      >{isPaymentRetried && selectedFdID === item.id ? (
                                        <div className="flex justify-center items-center">
                                          <div
                                            className="spinner-border animate-spin inline-block w-4 h-4 border-2 rounded-full mt-2"
                                            role="status"
                                          ></div>
                                        </div>
                                      ) : null}
                                        {translate(AGENT.retry)}
                                      </button>
                                    ) : null}
                                  </>
                                ) : null}
                              </div> */}
                            </div>
                          </div>
                          <div>
                            <div className="flex flex-wrap justify-between gap-y-3 gap-x-3 capitalize w-full mt-3">
                              <div className="whitespace-nowrap w-[230px]">
                                <div className="text-medium text-xl text-black text-light-gray">
                                  {translate(MAKE_PAYMENT_FDS.applNoDepositNo)}
                                </div>
                                <div className="text-regular text-xl text-black">
                                  {item.application_number}
                                </div>
                              </div>
                              <div className="whitespace-nowrap w-[60px] text-end lg:text-center">
                                <div className="text-medium text-xl text-black text-light-gray">
                                  {translate(AGENT.interest)} %
                                </div>
                                <div className="text-regular text-xl text-black">
                                  {item.interest_rate}
                                </div>
                              </div>
                              <div className="whitespace-nowrap">
                                <div className="text-medium text-xl text-black text-light-gray">
                                  {translate(FD_RENEWAL.depositAmount)}
                                </div>
                                <div className="text-regular text-xl text-black">
                                  {displayINRAmount(item.fd_amount)}
                                </div>
                              </div>
                              <div className="whitespace-nowrap w-[120px] text-end lg:text-center">
                                <div className="text-medium text-xl text-black text-light-gray">
                                  {translate(COMMON_CONSTANTS.tenure)}
                                </div>
                                <div className="text-regular text-xl text-black">
                                  {item?.displayTenure
                                    ? item.displayTenure
                                    : item?.tenor
                                      ? parseInt(item.tenor) / 30 + " " + "M"
                                      : ""}
                                </div>
                              </div>
                              <div className="whitespace-nowrap w-[100px] ">
                                <div className="text-medium text-xl text-black text-light-gray">
                                  {translate(AFTER_REVIEW.openDate)}
                                </div>
                                <div className="text-regular text-xl text-black">
                                  {formatDate(item.fd_open_date)}
                                </div>
                              </div>
                              <div className="whitespace-nowrap w-[100px] text-end lg:text-center">
                                <div className="text-medium text-xl text-black text-light-gray">
                                  {translate(AFTER_REVIEW.maturityDate)}
                                </div>
                                <div className="text-regular text-xl text-black">
                                  {formatDate(item.fd_maturity_date)}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="bg-[#F4F9FF] text-sm flex flex-wrap text-left rounded-b-md justify-between p-4">
                          <div className="flex  gap-3 items-center text-regular text-sm">
                            <div className="bg-white p-1 text-black flex items-center gap-1 rounded border-1 border-gray-300">
                              {item.is_renewal_eligible ? (
                                <AiFillCheckCircle className="text-primary-green" />
                              ) : (
                                <AiFillCloseCircle className="text-light-red" />
                              )}
                              {translate(COMMON_CONSTANTS.autoRenew)}
                            </div>
                            <div className="bg-white p-1 text-black flex items-center gap-1 rounded border-1 border-gray-300">
                              {item.isNominee ? (
                                <AiFillCheckCircle className="text-primary-green" />
                              ) : (
                                <AiFillCloseCircle className="text-light-red" />
                              )}
                              {translate(AGENT.nomineeRegistered)}
                            </div>

                          </div>
                          <div className="flex align-center">
                            <div className=" p-1 flex items-center gap-1 rounded border-fd-primary">
                              <button
                                className="button-passive border-fd-primary text-fd-primary w-auto h-fit p-1 px-2 text-regular text-xl"
                                onClick={() => handleFDAdviceBtnClick(item)}
                                // disabled={!item?.fdr_number}
                                // disabled={item?.manufacturer_id?.toLowerCase() !== "usfb" ? true : !item?.fdr_number}
                                disabled={true} // https://1silverbullet.atlassian.net/browse/FD-3387
                              >
                                <div className="flex justify-center items-center gap-1">
                                  <AiOutlineDownload />
                                  <span>{translate(MAKE_PAYMENT_FDS.fdAdvice)}</span>
                                </div>
                              </button>
                            </div>
                            <div className=" p-1 flex items-center gap-1 rounded border-fd-primary">
                              <button
                                className="button-passive border-fd-primary text-fd-primary w-auto h-fit p-1 px-2 text-regular text-xl"
                                onClick={() => handlePNBWithdraw(item)}
                                disabled={isDisableWithDrawBtn(item)}
                              >
                                {item?.additional_params
                                  ?.prematureWithdrawalApproved
                                  ? "Withdrawn"
                                  : `${translate(MAKE_PAYMENT_FDS.fdWithdraw)}`}
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })
                  : null}
                {showWithdrawalModal && (
                  <WithdrawPopup
                    fdDetails={withdrawalDetails}
                    updateModalState={toggleWithdrawalModal}
                    getAllFdData={getAllFds}
                  />
                )}
                <HistoryPopup
                  canShow={showHistoryFDModal}
                  updateModalState={toggleHistoryFDModal}
                />
                {isAPIDataLoaded &&
                  tempTypeArray != undefined &&
                  tempTypeArray.length < 1 ? (
                  <div className="user_journey_container flex justify-center text-3xl text-gray-500 ">
                    {translate(MAKE_PAYMENT_FDS.noResultsFound)}
                  </div>
                ) : null}
                {showRenewFDModal && Object.keys(renewFDItem).length ? (
                  <RenewFDPopup
                    item={renewFDItem}
                    toggleRenewFDModal={toggleRenewFDModal}
                  />
                ) : null}
                {showDatePopup ? (
                  <>
                    <div className="fixed inset-0 z-10 overflow-y-auto">
                      <div className="fixed inset-0 w-auto h-auto bg-black opacity-40"></div>
                      <div className="flex items-center justify-center min-h-screen px-4 py-8">
                        <div
                          className={`p-6 bg-white rounded-md shadow-lg z-[1] ${popupcss.hdfc_popup_width}`}
                        >
                          <div className="flex flex-row-reverse">
                            <button onClick={() => setShowDatePopup(false)}>
                              <IoMdClose size={22} />
                            </button>
                          </div>
                          <div className="w-full flex flex-col gap-4 justify-center">
                            <div className="text-left text-medium text-4xl text-black">
                              {translate(MAKE_PAYMENT_FDS.selectDateRange)}
                            </div>
                            <div className="flex flex-col gap-3">
                              <div className="text-medium text-xl text-black text-black">
                                {translate(AFTER_REVIEW.openDate)}
                              </div>
                              <div className="flex gap-3 justify-center">
                                <DatePicker
                                  selectsStart
                                  selected={fdOpenFromDate}
                                  startDate={rangeStart}
                                  endDate={rangeEnd}
                                  placeholderText={translate(MAKE_PAYMENT_FDS.from)}
                                  className="px-3 py-2.5 w-full border border-gray-300 text-black rounded text-regular text-2xl text-black"
                                  onChange={(date) =>
                                    setDateFilters(date, "open_start")
                                  }
                                  maxDate={new Date()}
                                  showYearDropdown
                                  scrollableYearDropdown
                                />
                                <DatePicker
                                  selectsEnd
                                  selected={fdOpenToDate}
                                  startDate={rangeStart}
                                  endDate={rangeEnd}
                                  placeholderText={translate(MAKE_PAYMENT_FDS.to)}
                                  className="px-3 py-2.5 w-full border border-gray-300 text-black rounded text-regular text-2xl text-black"
                                  onChange={(date) =>
                                    setDateFilters(date, "open_end")
                                  }
                                  maxDate={new Date()}
                                  showYearDropdown
                                  scrollableYearDropdown
                                />
                              </div>
                            </div>
                            <div className="flex flex-col gap-3">
                              <div className="text-medium text-xl text-black text-black">
                                {translate(AFTER_REVIEW.maturityDate)}
                              </div>
                              <div className="flex gap-3 justify-center text-regular text-2xl text-black">
                                <DatePicker
                                  selectsStart
                                  selected={fdMaturityFromDate}
                                  startDate={rangeStart}
                                  endDate={rangeEnd}
                                  onChange={(date) =>
                                    setDateFilters(date, "maturity_start")
                                  }
                                  className="px-3 py-2.5 w-full border border-gray-300 text-black rounded text-regular text-2xl text-black"
                                  placeholderText={translate(MAKE_PAYMENT_FDS.from)}
                                  showYearDropdown
                                  scrollableYearDropdown
                                />
                                <DatePicker
                                  selectsEnd
                                  selected={fdMaturityToDate}
                                  startDate={rangeStart}
                                  endDate={rangeEnd}
                                  onChange={(date) =>
                                    setDateFilters(date, "maturity_end")
                                  }
                                  className="px-3 py-2.5 w-full border border-gray-300 text-black rounded text-regular text-2xl text-black"
                                  placeholderText={translate(MAKE_PAYMENT_FDS.to)}
                                  showYearDropdown
                                  scrollableYearDropdown
                                />
                              </div>
                            </div>
                            <div className="flex justify-center gap-3">
                              <button
                                type="button"
                                aria-label="Close"
                                className="button-passive border-fd-primary text-fd-primary"
                                onClick={() => {
                                  setShowDatePopup(false);
                                  applyDateRange(false);
                                }}
                              >
                                {translate(COMMON_CONSTANTS.cancel)}
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  applyDateRange(true);
                                  setShowDatePopup(false);
                                }}
                                className="button-active btn-gradient button-transition hover:bg-hover-primary text-medium text-xl text-white lg:text-2xl w-fit   text-medium text-xl  lg:text-2xl w-fit  hover:button-shadow"
                              >
                                {translate(AGENT.apply)}
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                ) : null}
                {!isAPIDataLoaded && true ? (
                  <div className="pt-20 pl-90 text-3xl text-gray-500 ">
                    <div className="flex justify-center">
                      {translate(AGENT.loading)}..
                      <div
                        className="spinner-border animate-spin inline-block w-8 h-8 border-4 rounded-full"
                        role="status"
                      ></div>
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default AllFds;

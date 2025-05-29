import { useState, useEffect, useRef } from "react";
import { FaFilter } from "react-icons/fa";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import styles from "../../../../styles/fd.module.css";
import { IoMdClose } from "react-icons/io";
import CustomerSidebar from "../customer_sidebar";
import CustomerBreadCrumb from "../customer_breadcrumb";
import { useRouter } from "next/router";
import appConfig from "../../../../app.config";
import { GetApiHandler } from "../../../api/apihandler";
import {
  
  downloadReports,
  getSelectedDropdownList,
  createURL,
  clearSelectedDropdownList,
  charWithNumberInputAndSpecChar,
} from "../../../../lib/util";
import FDCard from "../../fdCard/FDCard";
import DatePopup from "../../../common/datePopup";
import Pagination from "@mui/material/Pagination";
import AgentNavBar from "../../navbar/agent_navbar";
import { COMMON_CONSTANTS, ROWS_PER_PAGE_ARRAY,AFTER_REVIEW, AGENT,MAKE_PAYMENT_FDS } from "../../../../constants";
import RMDropdownParent from "../../../../_components/RMDropdownParent";
import DownloadDropdown from "../../../../_components/DownloadDropdown";
import { useTranslation } from "react-i18next";

function CustomerFDList() {
  const [showFilter, setShowFilter] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [customerFDs, setCustomerFDs] = useState([]);
  const [showDateModal, setShowDateModal] = useState(false);
  const [queryURL, setQueryURL] = useState("");
  const [filterDate, setFilterDate] = useState({});
  const [page, setPage] = useState(1);
  const [pageCount, setPageCount] = useState();
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalRecords, setTotalRecords] = useState();
  const [isFilterApplied, setIsFilterApplied] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const [searchKey, setSearchKey] = useState("");
  const [statusDropdownData, setStatusDropdownData] = useState([
    {
      id: "pending",
      title: "Pending",
      isSelected: false,
    },
    {
      id: "successful",
      title: "Successful",
      isSelected: false,
    },
  ]);
  const [typeDropdownData, setTypeDropdownData] = useState([
    {
      id: "cumulative",
      title: "Cumulative",
      isSelected: false,
    },
    {
      id: "nonCumulative",
      title: "Non-Cumulative",
      isSelected: false,
    },
  ]);
  const [downloadOption, setDownloadOption] = useState("");

  const typeRef = useRef(null);
  const statusRef = useRef(null);
  const downloadFDListRef = useRef(null);
  const { t: translate } = useTranslation();

  const router = useRouter();
  const { customer_id } = router.query;

  const getModalStatus = (status, values) => {
    setShowDateModal(status);
    if (Object.keys(values).length) {
      setFilterDate(values);
    }
  };

  function openNav() {}

  const closeNav = () => {
    setShowFilter(false);
  };

  const getFilteredResult = (name, selectedList) => {
    if (name.toLowerCase() === "status") {
      setStatusDropdownData(selectedList);
    } else if (name.toLowerCase() === "type") {
      setTypeDropdownData(selectedList);
    }
  };

  const getDownloadOption = (option) => {
    setDownloadOption(option);
  };

  const downloadFile = () => {
    setIsLoading(true);
    
    const downloadURL =
      appConfig?.deploy?.baseUrl +
      appConfig?.deploy?.downloadCustomerFDList
        .replace("<customer_id>", customer_id)
        .replace("<file_format>", downloadOption) +
      "?" +
      queryURL;

    GetApiHandler(downloadURL, "Get")
      .then((response) => {
        if (response) {
          const { data } = response;
          if (data) {
            if (downloadOption === "pdf") {
              downloadReports(
                data,
                "application/pdf",
                `customers_${customer_id}_df_list.pdf`
              );
            } else {
              downloadReports(
                data,
                "text/csv",
                `customers_${customer_id}_fd_list.csv`
              );
            }
          }
        }
      })
      .catch((err) => {
        console.error("Error:", err);
      })
      .finally(() => {
        setDownloadOption("");
        setIsLoading(false);
      });
  };

  const handleChange = (e, value) => {
    setPage(value);
  };

  const handleResetFilter = () => {
    const clearType = clearSelectedDropdownList([...typeDropdownData]);
    const clearStatus = clearSelectedDropdownList([...statusDropdownData]);
    setIsFilterApplied(false);
    setStatusDropdownData(clearStatus);
    setTypeDropdownData(clearType);
    setFilterDate({});
    setSearchInput("")
  };

  const getCustomerFDs = () => {
    setIsLoading(true);
    
    const customerInfoURL =
      appConfig?.deploy?.baseUrl +
      appConfig?.deploy?.customerFDList.replace(
        "<customer_id>",
        customer_id
      ) +
      "?" +
      queryURL;

    GetApiHandler(customerInfoURL, "Get")
      .then((response) => {
        const { customer_fd_data, total_records } = response?.data?.data;
        if (customer_fd_data) {
          setCustomerFDs(customer_fd_data);
          setTotalRecords(total_records);
        }
      })
      .catch((err) => {
        console.error("Error:", err);
      })
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    if (downloadOption) {
      downloadFile();
    }
  }, [downloadOption]);

  useEffect(() => {
    const selectedStatus = getSelectedDropdownList(statusDropdownData);
    const selectedType = getSelectedDropdownList(typeDropdownData);
    const { startDate, endDate } = filterDate;
    let url = "";

    if (selectedStatus.length || selectedType.length || startDate || endDate) {
      setIsFilterApplied(true);
    } else {
      setIsFilterApplied(false);
    }

    page &&
      (url = url + "page_number=" + (page - 1) + "&page_size=" + rowsPerPage);
    selectedStatus.length && (url = url + createURL("status", selectedStatus));
    selectedType.length && (url = url + createURL("type", selectedType));
    startDate && (url = url + "&" + "start_date=" + startDate);
    endDate && (url = url + "&" + "end_date=" + endDate);
    searchKey && (url = url + "&" + "search_key=" + searchKey);
    setQueryURL(url);
  }, [
    statusDropdownData,
    typeDropdownData,
    filterDate,
    page,
    searchKey,
    rowsPerPage,
  ]);

  useEffect(() => {
    if (totalRecords && rowsPerPage) {
      const pageCount = Math.ceil(totalRecords / rowsPerPage);
      setPageCount(pageCount);
      if (page > pageCount) {
        setPage(1);
      }
    }
  }, [totalRecords, rowsPerPage]);

  useEffect(() => {
    getCustomerFDs();
  }, [queryURL]);

  useEffect(() => {
    const searchResult = setTimeout(() => {
      setSearchKey(searchInput);
    }, 500);
    return () => clearTimeout(searchResult);
  }, [searchInput]);

  return (
    <>
      <div>
        <AgentNavBar />
        <CustomerBreadCrumb />
        {!showFilter ? (
          <div
            className={`mx-w-full bg-slate-100 flex justify-between p-6 ${styles.filterButton}`}
          >
            <div className="text-regular text-4xl text-light-gray">
              {translate(AGENT.totalFd)} : {totalRecords}
            </div>
          </div>
        ) : null}
        <div className="page-background text-apercu-medium view-container view_container_sm">
          <div className="flex w-full">
            <div
              className={`w-[35%] sidebarContainer  h-100 ${styles.filterContainer} ${styles.cardContainer}`}
            >
              <CustomerSidebar id={"2"} customer_id={customer_id} />
            </div>
            <div className={`bg-white w-full p-6 rounded-xl ${styles.cardContainer}`}>
              <div>
                <div className="flex justify-between">
                  <div
                    className={`text-regular text-4xl text-light-gray ${styles.filterContainer}`}
                  >
                    {translate(AGENT.totalFd)} : {totalRecords}
                  </div>
                  <DownloadDropdown
                    getDownloadOption={getDownloadOption}
                    isEnabled={!customerFDs.length}
                    ref={downloadFDListRef}
                  />
                </div>
                {showFilter ? (
                  <div>
                    <div className="bg-white border-b border-slate-300">
                      <div className="flex justify-between flex-wrap">
                        <div className="fixed inset-0 z-50">
                          <div className="fixed inset-0 bg-black opacity-40"></div>
                          <div className="flex flex-row-reverse">
                            <div className="w-3/4 h-screen md:w-auto p-4 flex flex-col justify-between bg-white shadow-lg z-[1]">
                              <div className="flex flex-col flex-wrap gap-3">
                                <div className="flex flex-row-reverse">
                                  <button onClick={() => closeNav()}>
                                    <IoMdClose size={22} />
                                  </button>
                                </div>
                                <div className="w-full flex items-center gap-3 justify-between">
                                  <div className="text-apercu tracking-wide font-semibold">
                                  {translate(COMMON_CONSTANTS.filters)}
                                  </div>
                                  <div className="flex items-center gap-3">
                                    <div
                                      className="hover:cursor-pointer"
                                      onClick={openNav}
                                    >
                                      <FaFilter
                                        className={`${
                                          isFilterApplied
                                            ? "text-light-orange"
                                            : "text-fd-primary"
                                        } text-2xl font-bold`}
                                      />
                                    </div>
                                    <div
                                      className="text-regular text-2xl text-light-red hover:cursor-pointer"
                                      onClick={() => handleResetFilter()}
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
                                        value={searchInput}
                                        name="searchInput"
                                        onChange={(e) => {
                                          const filteredText = charWithNumberInputAndSpecChar(e.target.value);
                                          setSearchInput(filteredText)
                                        }}
                                        className="w-full text-left border border-gray-300 rounded p-2 text-black"
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
                                                placeholderText={translate(MAKE_PAYMENT_FDS.from)}
                                                className="p-2 w-full border border-gray-300 rounded text-regular text-2xl text-light-gray"
                                                showYearDropdown
                                                scrollableYearDropdown
                                              />
                                              <DatePicker
                                                selectsEnd
                                                placeholderText= {translate(MAKE_PAYMENT_FDS.to)}
                                                className="p-2 w-full border border-gray-300 rounded text-regular text-2xl text-light-gray"
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
                                                className="p-2 w-full border border-gray-300 rounded text-regular text-2xl text-light-gray"
                                                placeholderText={translate(MAKE_PAYMENT_FDS.from)}
                                                showYearDropdown
                                                scrollableYearDropdown
                                              />
                                              <DatePicker
                                                selectsEnd
                                                className="p-2 w-full border border-gray-300 rounded text-regular text-2xl text-light-gray"
                                                placeholderText={translate(MAKE_PAYMENT_FDS.to)}
                                                showYearDropdown
                                                scrollableYearDropdown
                                              />
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                    <div>
                                      <RMDropdownParent
                                        options={typeDropdownData}
                                        getFilteredResult={getFilteredResult}
                                        name={translate(AGENT.type)}
                                        ref={typeRef}
                                      />
                                    </div>
                                    <div>
                                      <RMDropdownParent
                                        options={statusDropdownData}
                                        getFilteredResult={getFilteredResult}
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
                                >
                                  {translate(COMMON_CONSTANTS.cancel)}
                                </button>
                                <button
                                  type="button"
                                  className="button-active btn-gradient button-transition hover:bg-hover-primary text-medium text-xl text-black lg:text-2xl w-fit   text-medium text-xl text-white lg:text-2xl w-fit  hover:button-shadow"
                                >
                                  {translate(AGENT.apply)}
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div
                    className={`bg-white border-b border-slate-300 ${styles.filterContainer}`}
                  >
                    <div className="flex justify-between flex-wrap">
                      <div className="flex items-center flex-wrap gap-3 mb-3 mt-3">
                        <div className="text-regular text-2xl text-light-gray">
                          <input
                            type="text"
                            placeholder={translate(AGENT.search)}
                            value={searchInput}
                            name="searchInput"
                            onChange={(e) => {
                              const filteredText = charWithNumberInputAndSpecChar(e.target.value);
                              setSearchInput(filteredText)
                            }}
                            className="w-40 text-left border border-gray-300 rounded px-1.5 py-1.5 text-black"
                          />
                        </div>
                        <div>
                          <button
                            onClick={() => setShowDateModal(true)}
                            className="bg-white w-40  border border-gray-200 rounded-md p-2 text-regular text-2xl text-light-gray text-left"
                          >
                            {translate(AGENT.dateRange)}
                          </button>
                          {showDateModal ? (
                            <DatePopup
                              getModalStatus={getModalStatus}
                              filterDate={filterDate}
                            />
                          ) : null}
                        </div>
                        <div>
                          <RMDropdownParent
                            options={typeDropdownData}
                            getFilteredResult={getFilteredResult}
                            name={translate(AGENT.type)}
                            ref={typeRef}
                          />
                        </div>
                        <div>
                          <RMDropdownParent
                            options={statusDropdownData}
                            getFilteredResult={getFilteredResult}
                            name={translate(AGENT.status)}
                            ref={statusRef}
                          />
                        </div>
                      </div>
                      <div className="flex flex-row items-center gap-3 mb-3 mt-3">
                        <div className="hover:cursor-pointer" onClick={openNav}>
                          <FaFilter
                            className={`${
                              isFilterApplied
                                ? "text-light-orange"
                                : "text-fd-primary"
                            } text-2xl font-bold`}
                          />
                        </div>
                        <div
                          className="text-regular text-2xl text-light-red hover:cursor-pointer"
                          onClick={() => handleResetFilter()}
                        >
                          {translate(COMMON_CONSTANTS.resetAll)}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              {isLoading ? (
                <div className="pt-20 pl-90 text-3xl text-gray-500 ">
                  <div className="flex justify-center">
                    {translate(AGENT.loading)}..
                    <div
                      className="spinner-border animate-spin inline-block w-8 h-8 border-4 rounded-full"
                      role="status"
                    ></div>
                  </div>
                </div>
              ) : customerFDs.length ? (
                <>
                  {customerFDs.map((item) => {
                    return item ? <FDCard item={item} /> : null;
                  })}
                  <div className="flex flex-wrap justify-end gap-3">
                    <div className="flex gap-2 text-regular items-center">
                      <label className='text-black'>Rows per Page :</label>
                      <select
                        className="border rounded-md text-black"
                        value={rowsPerPage}
                        onChange={(e) => setRowsPerPage(e.target.value)}
                      >
                        {ROWS_PER_PAGE_ARRAY.map((item) => (
                          <option value={item}>{item}</option>
                        ))}
                      </select>
                    </div>
                    <Pagination
                      color="primary"
                      size="large"
                      count={pageCount}
                      page={page}
                      onChange={handleChange}
                    />
                  </div>
                </>
              ) : (
                <div className="pt-20 pl-90 text-3xl text-gray-500 ">
                  <div className="flex justify-center">{translate(AGENT.noRecordsFound)}</div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default CustomerFDList;

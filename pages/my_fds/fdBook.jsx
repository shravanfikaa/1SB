import { useEffect, useState } from "react";
import { AGENT, ROWS_PER_PAGE_ARRAY } from "../../constants";
import { createURL } from "../../lib/util";
import appConfig from "../../app.config";
import styles from "../../styles/fd.module.css";
import { GetApiHandler } from "../api/apihandler";
import ErrorModal from "../common/errorPopup";
import ApplicationHistoryModal from "./fdBook/applicationHistoryModal";
import OrderBookFDFilter from "./fdBook/orderBookFdFilter";
import OrderFdCard from "./fdBook/orderFdCard";
import LoadingOverlay from "react-loading-overlay";
import { Pagination } from "@mui/material";
import NavBarMain from "../navbar/NavBarMain";
import FDSidebar from "./fdSidebar";
import { useTranslation } from "react-i18next";  

function RMOrderBookFD() {
  const { t: translate } = useTranslation();
  const [customerData, setCustomerData] = useState([]);
  const [selectedCustomerData, setSelectedCustomerData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [apiErrorMessage, setApiErrorMessage] = useState("");
  const [page, setPage] = useState(1);
  const [queryParam, setQueryParam] = useState("");
  const [pageCount, setPageCount] = useState();
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalRecords, setTotalRecords] = useState();
  const [downloadOption, setDownloadOption] = useState("");
  const [viewOption, setViewOption] = useState("");
  const [showAppHistoryModal, setShowAppHistoryModal] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState(false);

  //Commenting few lines for future use
  const [updatedFilters, setUpdateFilters] = useState({
    // issuerName: [],
    status: [],
    startDate: "",
    endDate: "",
    searchKey: "",
  });

  const toggleErrorModal = () => setShowErrorModal((state) => !state);
  const toggleAppHistoryModal = () => setShowAppHistoryModal((state) => !state);
  const toggleLoadingStatus = () => setLoadingStatus((state) => !state);

  const generateURLWithFilters = () => {
    //Commenting few lines for future use
    const { issuerName, status, startDate, endDate, searchKey } =
      updatedFilters;
    let url = "";
    // page &&
    //   (url = url + "page_number=" + (page - 1) + "&page_size=" + rowsPerPage);
    status.length && (url = url + createURL("status", status));
    // issuerName.length &&
    //   (url = url + createURLWithID("issuer_name", issuerName));
    startDate && (url = url + "&" + "start_date=" + startDate);
    endDate && (url = url + "&" + "end_date=" + endDate);
    searchKey && (url = url + "&" + "search_key=" + searchKey);
    setQueryParam(url);
  };

  const updateFilter = (issuerName, status, startDate, endDate, searchKey) => {
    setUpdateFilters({
      // issuerName: issuerName,
      status: status,
      startDate: startDate,
      endDate: endDate,
      searchKey: searchKey,
    });
  };

  // COMMENTING IF NEEDED IN FUTURE
  //  const downloadFile = () => {
  //   const downloadURL =
  //     appConfig?.deploy?.baseUrl +
  //     appConfig?.deploy?.downloadCustomerList.replace(
  //       "<file_format>",
  //       downloadOption
  //     ) +
  //     "?" +
  //     queryParam;
  //   setIsLoading(true);

  //   GetApiHandler(downloadURL, "Get")
  //     .then((response) => {
  //       if (response) {
  //         const { data } = response;
  //         if (data) {
  //           if (downloadOption === "pdf") {
  //             downloadReports(data, "application/pdf", "customers_list.pdf");
  //           } else {
  //             downloadReports(data, "text/csv", "customers_list.csv");
  //           }
  //         }
  //       }
  //     })
  //     .catch((err) => {
  //       console.log("Error:", err);
  //     })
  //     .finally(() => {
  //       setDownloadOption("");
  //       setIsLoading(false);
  //     });
  // };

  const getFdBookedData = () => {
    setIsLoading(true);

    const customerFiltersUrl = queryParam
      ? appConfig?.deploy?.baseUrl +
      appConfig?.deploy?.rmFdOrderBook +
      "?" +
      queryParam
      : appConfig?.deploy?.baseUrl + appConfig?.deploy?.rmFdOrderBook;
    GetApiHandler(customerFiltersUrl, "GET")
      .then((response) => {
        const { data } = response;
        if (data?.data) {
          const { fd_order_book_data, total_records } = response.data.data;
          if (fd_order_book_data) {
            setCustomerData(fd_order_book_data);
            setTotalRecords(total_records);
          }
        } else if (data?.errors.length) {
          setApiErrorMessage(data.errors);
          setShowErrorModal(true);
        }
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const updateAppHistoryModalState = (option, cust_fd_id) => {
    setViewOption(option);
    setShowAppHistoryModal(!showAppHistoryModal);
    setSelectedCustomerData(cust_fd_id);
  };

  useEffect(() => {
    generateURLWithFilters();
  }, [updatedFilters, page, rowsPerPage]);

  useEffect(() => {
    getFdBookedData();
  }, [queryParam]);

  useEffect(() => {
    if (totalRecords && rowsPerPage) {
      const pageCount = Math.ceil(totalRecords / rowsPerPage);
      setPageCount(pageCount);
      if (page > pageCount) {
        setPage(1);
      }
    }
  }, [totalRecords, rowsPerPage]);

  const handleChange = (e, value) => {
    setPage(value);
  };
  return (
    <>
      <div>
        <NavBarMain />
        <ErrorModal
          canShow={showErrorModal}
          updateModalState={toggleErrorModal}
          errorMessage={apiErrorMessage}
        />
        {showAppHistoryModal && (
          <ApplicationHistoryModal
            updateModalState={toggleAppHistoryModal}
            selectedID={selectedCustomerData}
          />
        )}
        <div className="page-background text-apercu-medium view-container view_container_sm">
          <div className="flex hgap-5 w-full">
            <div className="w-[35%] sidebarContainer  h-100">
              <FDSidebar id={"3"} />
            </div>
            <div className={`w-full ${styles.cardContainer}`}>
              <LoadingOverlay
                active={loadingStatus}
                spinner
                text={`${translate(AGENT.loading)}...`}
              >
                <div className="bg-white p-6 text-font fd_details_container">

                  <div className="flex justify-between"></div>
                  <div>
                    <OrderBookFDFilter updateFilter={updateFilter} />
                  </div>
                  <div className="my-6">
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
                    ) : customerData.length ? (
                      <>
                        <div className="text-medium text-2xl flex flex-row">
                          <div className="w-1/2 text-black">{translate(AGENT.investorDetails)}</div>
                          <div className="w-1/2  text-black">{translate(AGENT.lastTransactionDetails)}</div>
                        </div>
                        {customerData.map((data, index) => {
                          return data ? (
                            <OrderFdCard
                              orderFdData={data}
                              updateAppHistoryModalState={
                                updateAppHistoryModalState
                              }
                              toggleLoadingStatus={toggleLoadingStatus}
                            />
                          ) : null;
                        })}
                        <div className="flex flex-wrap justify-end gap-3">
                          <div className="flex gap-2 text-regular items-center">
                            <label  className='text-black'>{translate(AGENT.rowsPerPage)} :</label>
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
                        <div className="flex justify-center">
                          {translate(AGENT.noRecordsFound)}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </LoadingOverlay>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default RMOrderBookFD;

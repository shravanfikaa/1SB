import styles from '../../styles/fd.module.css';
import AgentNavBar from "./navbar/agent_navbar";
import Filter from "./agent_filter";
import SetBreadCrumb from "./header/page_breadcrumb";
import DashboardCard from "./dashboard_card";
import AgentSidebar from "./sidebar/agent_sidebar";
import { GetApiHandler } from "../api/apihandler";
import { downloadReports, createURL, createURLWithID, getUserRole } from "../../lib/util";
import appConfig from "../../app.config";
import { useEffect, useState, useRef } from 'react';
import ErrorModal from '../common/errorPopup';
import Pagination from "@mui/material/Pagination";
import { AGENT, ROWS_PER_PAGE_ARRAY } from '../../constants';
import DownloadDropdown from '../../_components/DownloadDropdown';
import { useTranslation } from "react-i18next";

function AgentDashboard() {
    const { t: translate } = useTranslation();
    const [customerData, setCustomerData] = useState([])
    const [isLoading, setIsLoading] = useState(false);
    const [showErrorModal, setShowErrorModal] = useState(false);
    const toggleErrorModal = () => setShowErrorModal((state) => !state);
    const [apiErrorMessage, setApiErrorMessage] = useState("");
    const [page, setPage] = useState(1);
    const [queryParam, setQueryParam] = useState("");
    const [pageCount, setPageCount] = useState();
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [totalRecords, setTotalRecords] = useState();
    const [downloadOption, setDownloadOption] = useState("");
    const [updatedFilters, setUpdateFilters] = useState({
        issuerName: [],
        fdName: [],
        status: [],
        startDate: "",
        endDate: "",
        searchKey: "",
    });

    const role = getUserRole()

    const customersRef = useRef(null);

    const generateURLWithFilters = () => {
        const { issuerName, fdName, status, startDate, endDate, searchKey } = updatedFilters
        let url = "";
        page &&
            (url = url + "page_number=" + (page - 1) + "&page_size=" + rowsPerPage);
        status.length &&
            (url = url + createURL("status", status));
        fdName.length && (url = url + createURL("fd_name", fdName));
        issuerName.length && (url = url + createURLWithID("issuer_name", issuerName));
        startDate && (url = url + "&" + "start_date=" + startDate);
        endDate && (url = url + "&" + "end_date=" + endDate);
        searchKey && (url = url + "&" + "search_key=" + searchKey);
        setQueryParam(url);
    }

    const updateFilter = (issuerName, fdName, status, startDate, endDate, searchKey) => {
        setUpdateFilters({
            issuerName: issuerName,
            fdName: fdName,
            status: status,
            startDate: startDate,
            endDate: endDate,
            searchKey: searchKey
        });
    }

    const downloadFile = () => {

        const downloadURL = appConfig?.deploy?.baseUrl + appConfig?.deploy?.downloadCustomerList.replace("<file_format>", downloadOption) +
            "?" +
            queryParam;
        setIsLoading(true);

        GetApiHandler(downloadURL, "Get")
            .then((response) => {
                if (response) {
                    const { data } = response;
                    if (data) {
                        if (downloadOption === "pdf") {
                            downloadReports(data, "application/pdf", "customers_list.pdf");
                        }
                        else {
                            downloadReports(data, "text/csv", "customers_list.csv");
                        }
                    }
                }
            })
            .catch((err) => {
                console.log("Error:", err);
            }).finally(() => {
                setDownloadOption("");
                setIsLoading(false);
            });
    };

    const getCustomersData = () => {
        setIsLoading(true);


        const customerFiltersUrl = appConfig?.deploy?.baseUrl + appConfig?.deploy?.customerFilters + "?" + queryParam;
        GetApiHandler(customerFiltersUrl, "GET").then((response) => {
            const { data } = response;
            if (data?.data) {
                const { fd_customer_data, total_records } = data.data;
                if (fd_customer_data) {
                    setCustomerData(fd_customer_data);
                    setTotalRecords(total_records);
                }
            } else if (data?.errors.length) {
                setApiErrorMessage(data.errors);
                setShowErrorModal(true);
            }
        }).finally(() => {
            setIsLoading(false);
        });
    }

    const getDownloadOption = (option) => {
        setDownloadOption(option);
    };

    useEffect(() => {
        downloadOption && downloadFile();
    }, [downloadOption]);

    useEffect(() => {
        generateURLWithFilters();
    }, [updatedFilters, page, rowsPerPage]);

    useEffect(() => {
        if(queryParam){
            getCustomersData();
        }
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
                <AgentNavBar />
                <SetBreadCrumb componentType={"FdList"} />
                <ErrorModal
                    canShow={showErrorModal}
                    updateModalState={toggleErrorModal}
                    errorMessage={apiErrorMessage}
                />
                <div className="page-background text-apercu-medium view-container view_container_sm">
                    <div className="flex gap-5 w-full">
                        <div className=' sidebarContainer  h-100'>
                            <AgentSidebar id={"1"} />
                        </div>
                        <div className={`w-full ${styles.cardContainer}`}>
                            <div className="bg-white p-6 rounded-xl text-font fd_details_container">
                                <div className="flex justify-between">
                                    <div
                                        className={`text-regular text-4xl text-light-gray`}
                                    >
                                        {translate(AGENT.totalFd)} : {totalRecords}
                                    </div>
                                    <DownloadDropdown
                                        getDownloadOption={getDownloadOption}
                                        isEnabled={!customerData.length || role === 'agent'}
                                        ref={customersRef}
                                    />
                                </div>
                                <div>
                                    <Filter updateFilter={updateFilter} />
                                </div>
                                <div className="my-6">
                                    {
                                        isLoading ?
                                            <div className="pt-20 pl-90 text-3xl text-gray-500 ">
                                                <div className="flex justify-center">
                                                    {translate(AGENT.loading)}..
                                                    <div
                                                        className="spinner-border animate-spin inline-block w-8 h-8 border-4 rounded-full"
                                                        role="status"
                                                    ></div>
                                                </div>
                                            </div>
                                            : customerData.length ?
                                                <>
                                                    <div className="text-medium text-2xl flex flex-row">
                                                        <div className="w-1/2  text-black">{translate(AGENT.investorDetails)}</div>
                                                        <div className="w-1/2  text-black">{translate(AGENT.lastTransactionDetails)}</div>
                                                    </div>
                                                    {customerData.map((data, index) => {
                                                        return (
                                                            data ? <DashboardCard props={data} /> : null);
                                                    })}
                                                    <div className="flex flex-wrap justify-end gap-3">
                                                        <div className='flex gap-2 text-regular items-center'>
                                                            <label className='text-black'>{translate(AGENT.rowsPerPage)} :</label>
                                                            <select className='border rounded-md text-black'
                                                                value={rowsPerPage}
                                                                onChange={(e) => setRowsPerPage(e.target.value)}>
                                                                {
                                                                    ROWS_PER_PAGE_ARRAY.map(item =>
                                                                        <option value={item}>{item}</option>
                                                                    )
                                                                }
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
                                                </> :
                                                <div className="pt-20 pl-90 text-3xl text-gray-500 ">
                                                    <div className="flex justify-center">{translate(AGENT.noRecordsFound)}</div>
                                                </div>
                                    }
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div >
        </>
    );
}

export default AgentDashboard;

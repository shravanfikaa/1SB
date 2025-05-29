import { useState, useEffect, useRef } from "react";
import AgentNavBar from "../navbar/agent_navbar";
import SetBreadCrumb from "../header/page_breadcrumb";
import AgentSidebar from "../sidebar/agent_sidebar";
import styles from "../../../styles/fd.module.css";
import {
  
  downloadReports,
  dateFormat,
} from "../../../lib/util";
import appConfig from "../../../app.config";
import { useRouter } from "next/router";
import { AGENT, RM_MAPPED_CUSTOMERS, ROWS_PER_PAGE_ARRAY } from "../../../constants";
import Pagination from "@mui/material/Pagination";
import { GetApiHandler } from "../../api/apihandler";
import DownloadDropdown from "../../../_components/DownloadDropdown";
import { useTranslation } from "react-i18next";  

function MappedCustomers() {
  const { t: translate } = useTranslation();
  const router = useRouter();
  const { agent_name } = router.query;

  const [customerData, setCustomerData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [downloadOption, setDownloadOption] = useState("");
  const [pageCount, setPageCount] = useState();
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalRecords, setTotalRecords] = useState();
  const [page, setPage] = useState(1);
  const [queryURL, setQueryURL] = useState("");
  const [agentId, setAgentId] = useState("");

  const agentDownloadRef = useRef(null);

  const getDownloadOption = (option) => {
    setDownloadOption(option);
  };

  const getCustomersData = () => {
    setIsLoading(false);
    
    const mappedCustomersURL =
      appConfig?.deploy?.baseUrl +
      appConfig?.deploy?.rmMappedCustomersList.replace(
        "<agent_id>",
        agentId
      ) +
      queryURL;
    setIsLoading(true);

    GetApiHandler(mappedCustomersURL, "Get")
      .then((response) => {
        if (response) {
          const { customer_data, total_records } = response?.data?.data;
          if (customer_data) {
            setCustomerData(customer_data);
            setTotalRecords(total_records);
          }
        }
      })
      .catch((err) => {
        console.log("Error:", err);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const downloadFile = () => {
    
    let replaceIdFileFormatInURL =
      appConfig?.deploy?.baseUrl +
      appConfig?.deploy?.rmDownloadMappedCustomersList;
    const mapObj = {
      "<agent_id>": agentId,
      "<file_format>": downloadOption,
    };

    replaceIdFileFormatInURL = replaceIdFileFormatInURL.replace(
      /<agent_id>|<file_format>/g,
      (matched) => mapObj[matched]
    );

    const downloadURL = replaceIdFileFormatInURL + queryURL;
    setIsLoading(true);

    GetApiHandler(downloadURL, "Get")
      .then((response) => {
        if (response) {
          const { data } = response;
          if (data) {
            if (downloadOption === "pdf") {
              downloadReports(data, "application/pdf", "customers_list.pdf");
            } else {
              downloadReports(data, "text/csv", "customers_list.csv");
            }
          }
        }
      })
      .catch((err) => {
        console.log("Error:", err);
      })
      .finally(() => {
        setDownloadOption("");
        setIsLoading(false);
      });
  };

  useEffect(() => {
    const agentID = sessionStorage.getItem("selectedAgentID");
    setAgentId(agentID);
  }, []);

  useEffect(() => {
    if (queryURL) {
      getCustomersData();
    }
  }, [queryURL]);

  useEffect(() => {
    let url = "";
    page && (url = url + "?page_number=" + (page - 1) + "&page_size=" + rowsPerPage);

    setQueryURL(url);
  }, [page, rowsPerPage]);

  useEffect(() => {
    downloadOption && downloadFile();
  }, [downloadOption]);

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
        <SetBreadCrumb />
        <div className="page-background text-apercu-medium view-container view_container_sm text-regular">
          <div className="flex gap-5 w-full">
            <div className=" sidebarContainer  h-100">
              <AgentSidebar id={"2"} />
            </div>
            <div className={`bg-white w-full p-6 rounded-xl ${styles.cardContainer}`}>
              {isLoading ? (
                <div className="flex justify-center mb-6">
                  <div className="flex justify-center">
                    {translate(AGENT.loading)}..
                    <div
                      className="spinner-border animate-spin inline-block w-8 h-8 border-4 rounded-full"
                      role="status"
                    ></div>
                  </div>
                </div>
              ) : customerData && Object.keys(customerData).length ? (
                <div className="flex flex-col justify-between gap-y-5">
                  <div className="flex justify-between">
                    <h1 className="text-4xl gap-2 text-black font-bold">
                      {translate(AGENT.customersMapped)}
                      
                    </h1>
                    <button
                      className="button-passive border-fd-primary text-fd-primary w-fit p-1 h-min"
                      onClick={() => {
                        sessionStorage.setItem("selectedAgentID", "");
                        router.push("/agent/customerAgentMapping");
                      }}
                    >
                      {"< Back"}
                    </button>
                  </div>
                  <h1 className="text-2xl font-bold text-fd-primary tracking-wide capitalize">
                    {agent_name}
                  </h1>
                  <div className="flex justify-end">
                    <DownloadDropdown
                      getDownloadOption={getDownloadOption}
                      isEnabled={!customerData.length}
                      ref={agentDownloadRef}
                    />
                  </div>
                  <div className="flex justify-center text-3xl text-gray-500 mt-2 text-regular">
                    <table className="table-fixed border-collapse w-full text-left border-collapse border-b lack-400 border-spacing-y-5">
                      <thead className="text-medium text-xl text-black text-light-gray">
                        <tr className="text-apercu-extra-light">
                          {Object.keys(RM_MAPPED_CUSTOMERS).map((val) => (
                            <th className="p-2">{RM_MAPPED_CUSTOMERS[val]}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="text-black text-xl">
                        {customerData &&
                          customerData.map((item) => {
                            return (
                              <tr className="p-2 break-words border-b">
                                <td className="p-2">{item.pan_number}</td>
                                <td className="p-2">{item.first_name}</td>
                                <td className="p-2">{item.email_id}</td>
                                <td className="p-2">{item.mobile_number}</td>
                                <td className="p-2">
                                  {dateFormat(item.created_on)}
                                </td>
                                <td className="p-2">{agentId}</td>
                                <td className="p-2">{agent_name}</td>
                                <td className="p-2">
                                  {dateFormat(item.mapped_on)}
                                </td>
                                <td className="p-2">
                                  {dateFormat(item.last_chnaged_on)}
                                </td>
                              </tr>
                            );
                          })}
                      </tbody>
                    </table>
                  </div>
                  <div className="flex flex-wrap justify-end gap-3">
                    <div className="flex gap-2 text-regular items-center">
                      <label className='text-black'>{translate(AGENT.rowsPerPage)} :</label>
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
                </div>
              ) : (
                <div className="flex justify-between mb-6">
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

export default MappedCustomers;

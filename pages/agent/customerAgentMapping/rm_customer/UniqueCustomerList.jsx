import { useState, useEffect } from "react";
import RMCustomerFilters from "./RMCustomerFilters";
import EditCustomerDetails from '../../../agent/user/editCustomerDetails'
import {
  isFeatureForRoleBaseSidebar,
  getFullName,
} from "../../../../lib/util";
import { GetApiHandler } from "../../../api/apihandler";
import appConfig from "../../../../app.config";
import { AGENT, RM_CUSTOMER_LIST_COLUMNS, ROWS_PER_PAGE_ARRAY  } from "../../../../constants";
import Loader from "../../../../svg/Loader";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import Pagination from "@mui/material/Pagination";
import { IoEyeSharp } from "react-icons/io5";
import { IoIosAdd } from "react-icons/io";
import { CiEdit } from "react-icons/ci";



function UniqueCustomerList() {
  const [customerData, setCustomerData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [filterURL, setFilterURL] = useState("");
  const [displayAddNewUserPopup, setDisplayAddNewUserPopup] = useState(false);
  const [showEditButton, setShowEditButton] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [page, setPage] = useState(1);
  const [queryParam, setQueryParam] = useState("");
  const [pageCount, setPageCount] = useState();
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalRecords, setTotalRecords] = useState();
  const { t: translate } = useTranslation();

  const getFilterURL = (queryURL) => {
    setFilterURL(queryURL);
  };
  const toggleAddNewUserPopup = () => {
    getUniqueCustomerList();
    setDisplayAddNewUserPopup(!displayAddNewUserPopup)
  };

  const handleEditClick = (customer) => {
    setSelectedCustomer(customer);
    setDisplayAddNewUserPopup(true);
  };
  useEffect(() => {
    generateURLWithFilters();
}, [filterURL,page, rowsPerPage]);

useEffect(() => {
    if(queryParam){
      getUniqueCustomerList();
    }
}, [queryParam]);

useEffect(() => {
  if (totalRecords && rowsPerPage) {
      const pageCount = Math.ceil(totalRecords / rowsPerPage);
      setPageCount(pageCount);
      console.log("pagecount",pageCount)
      if (page > pageCount) {
          setPage(1);
      }
  }
}, [totalRecords, rowsPerPage]);
  const getUniqueCustomerList = () => {
    setIsLoading(true);
    const customerInfoURL = filterURL
      ? appConfig?.deploy?.baseUrl +
      appConfig?.deploy?.uniqueCustomerList +
      filterURL
      : appConfig?.deploy?.baseUrl + appConfig?.deploy?.uniqueCustomerList+ "?" + queryParam;;
    GetApiHandler(customerInfoURL, "Get")
      .then((response) => {
        const { fd_customer_data,total_records  } = response?.data?.data;
        if (fd_customer_data) {
          setCustomerData(fd_customer_data);
          setTotalRecords(total_records);
        }
      })
      .catch((err) => {
        console.error("Error:", err);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const fullName = (first_name, last_name) => (
    <td className="text-regular text-xl text-black p-[5px]">
      {getFullName(first_name, "", last_name)}
    </td>
  );

  const setCustomerIDHandler = (data) => {
    const dataSession = sessionStorage.getItem("rm_customer_data");
    if (JSON.parse(dataSession)) {
      const { customer_id } = JSON.parse(dataSession)
      if (customer_id !== data?.customer_id) {
        sessionStorage.setItem("rm_new_customer_data", true);
      } else {
        sessionStorage.setItem("rm_new_customer_data", false);
      }
    }
    sessionStorage.setItem("rm_customer_data", JSON.stringify(data));
  }
  useEffect(() => {
    if (sessionStorage.getItem("featureFlag")) {
      const featureFlagDetails = JSON.parse(sessionStorage.getItem("featureFlag"));
      const AgentEditFlag = isFeatureForRoleBaseSidebar(featureFlagDetails, "AgentCustomerEdit");
      AgentEditFlag == 1 ? setShowEditButton(true) : setShowEditButton(false);
    }
  }, [])

  // useEffect(() => {
  //   if(filterURL){
  //     getUniqueCustomerList();
  //   } 
  // }, [filterURL]);

  const generateURLWithFilters = () => {
          let url = filterURL;
          page &&
              (url = url + "page_number=" + (page - 1) + "&page_size=" + rowsPerPage);
          setQueryParam(url);
      }

      const handleChange = (e, value) => {
        setPage(value);
    };
  return (
    <>
      <RMCustomerFilters getFilterURL={getFilterURL} />
      {isLoading ? (
        <div className="flex justify-center text-3xl text-gray-500 mt-8">
          <div className="flex justify-center gap-3">
            {translate(AGENT.loading)}...
            <Loader />
          </div>
        </div>
      ) : customerData.length ? (
        <div className=" mt-6">
          <table className="table-auto w-full text-left border-collapse border-b lack-400 border-spacing-y-5">
            <thead className="text-regular text-2xl text-light-gray">
              {Object.keys(RM_CUSTOMER_LIST_COLUMNS).map((val) => (
                <th className="p-[5px]">{translate(RM_CUSTOMER_LIST_COLUMNS[val])}</th>
              ))}
            </thead>
            <tbody className="text-regular text-xl text-black">
              {customerData &&
                customerData.map((data, index) => {
                  return (
                    <tr className="border-b lack-400">
                      {Object.keys(RM_CUSTOMER_LIST_COLUMNS).map((value) => {
                        if (value === "customer_full_name") {
                          return fullName(data.first_name, data.last_name);
                        } else {
                          return (
                            <td className="text-regular text-xl text-black p-[5px]">
                              {data[value]}
                            </td>
                          );
                        }
                      })}
                      <td>
                        <div className='w-fit'>
                          <div className='flex flex-row gap-3'>
                            <Link
                              href={{
                                pathname: "/product/product_list"
                              }}
                            >
                              <button
                                className='button-active btn-gradient button-transition hover:bg-hover-primary text-medium text-xl lg:text-2xl w-fit   text-medium text-xl lg:text-2xl w-fit  hover:button-shadow'
                                onClick={() => setCustomerIDHandler(data)}
                              >
                                <IoIosAdd fill='#ffff' width={'20px'} height={'20px'} />
                                {/* {translate(AGENT.addProduct)} */}

                              </button>
                            </Link>
                            <div className=''>
                              <Link
                                href={{
                                  pathname: "/agent/customer/[customer_id]",
                                  query: { customer_id: data.customer_id },
                                }}
                                passHref
                                as="/agent/customer/[customer_id]"
                              >
                                <button className="button-passive border-fd-primary text-fd-primary w-full h-fit p-2 text-base" id={data.customer_id}><IoEyeSharp width={'20px'} height={'20px'}/> 
                                {/* {translate(AGENT.view)} */}
                                </button>
                              </Link>
                            </div>{showEditButton &&
                              <div className=''>
                                <button className="button-passive border-fd-primary text-fd-primary w-full h-fit p-2 text-base" id={data.customer_id} onClick={() => handleEditClick(data)}><CiEdit /> 
                                {/* {translate(AGENT.edit)} */}
                                </button>
                              </div>
                            }

                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
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
        </div>
                               
      ) : (
        <div className="pt-20 pl-90 text-3xl text-gray-500">
          <div className="flex justify-center">{translate(AGENT.noRecordsFound)}</div>
        </div>
      )}
      {displayAddNewUserPopup && <EditCustomerDetails updateModalState={toggleAddNewUserPopup} customerData={selectedCustomer} />}
    </>
  );
}

export default UniqueCustomerList;

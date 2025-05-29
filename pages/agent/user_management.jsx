import { useState, useEffect, useRef } from "react";
import { FaFilter } from "react-icons/fa";
import {
  
  downloadReports,
  getSelectedDropdownList,
  clearSelectedDropdownList,
  createURL,
  createURLWithID,
  getFullName,
  dateFormat,
  convertUTCToYYYY_MM_DD,
} from "../../lib/util";
import "react-datepicker/dist/react-datepicker.css";
import styles from "../../styles/fd.module.css";
import { AiOutlineEdit, AiOutlinePlus } from "react-icons/ai";
import { BsThreeDotsVertical } from "react-icons/bs";
import appConfig from "../../app.config";
import {
  GetApiHandler,
  PatchApiHandler,
  PostApiHandler,
  DeleteApiHandler,
} from "../api/apihandler";
import SetBreadCrumb from "./header/page_breadcrumb";
import AgentSidebar from "./sidebar/agent_sidebar";
import DeletePopup from "../common/deletePopup";
import Pagination from "@mui/material/Pagination";
import CreateUser from "./user/create_user";
import EditUser from "./user/edit_user";
import ErrorModal from "../common/errorPopup";
import AgentNavBar from "./navbar/agent_navbar";
import { AGENT, COMMON_CONSTANTS, ROWS_PER_PAGE_ARRAY } from "../../constants";
import RMDropdownParent from "../../_components/RMDropdownParent";
import DownloadDropdown from "../../_components/DownloadDropdown";
import { useTranslation } from "react-i18next";

function UserManagement() {
  const [isLoading, setIsLoading] = useState(false);
  const [UserManagementData, setUserManagementData] = useState([]);
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [showEditUserModal, setShowEditUserModal] = useState(false);
  const [sendDataToEditUserModal, setsendDataToEditUserModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const toggleErrorModal = () => setShowErrorModal((state) => !state);
  const [apiErrorMessage, setApiErrorMessage] = useState("");
  const [messageType, setmessageType] = useState("");
  const [showDeletePopup, setShowDeletePopup] = useState({
    show: false,
    id: "",
    shouldDelete: false,
  });
  const [page, setPage] = useState(1);
  const [pageCount, setPageCount] = useState();
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalRecords, setTotalRecords] = useState();
  const [queryURL, setQueryURL] = useState("");
  const [downloadOption, setDownloadOption] = useState("");
  const [isFilterApplied, setIsFilterApplied] = useState(false);
  const [roleArray, setRoleArray] = useState([]);
  const [searchInput, setSearchInput] = useState("");
  const [searchKey, setSearchKey] = useState("");
  const [statusDropdownData, setStatusDropdownData] = useState([
    {
      id: "active",
      title: "Active",
      isSelected: false,
    },
    {
      id: "inactive",
      title: "Inactive",
      isSelected: false,
    },
  ]);

  const [roleDropdownData, setRoleDropdownData] = useState([]);
  const [viewFlag, setViewFlag] = useState({ show: false, id: "" });

  const roleRef = useRef(null);
  const statusRef = useRef(null);
  const userManagementRef = useRef(null);
  const dropdownRef = useRef(null);
  const { t: translate } = useTranslation();

  function toggleViewDropdown(id, status) {
    setViewFlag({ show: status, id: id });
  }

  const getUserManagementList = () => {
    
    const customerInfoURL =
      appConfig?.deploy?.baseUrl +
      appConfig?.deploy?.userManagementList +
      "?" +
      queryURL;

    setIsLoading(true);
    GetApiHandler(customerInfoURL, "Get")
      .then((response) => {
        const { agent_data, total_records } = response?.data?.data;
        if (agent_data) {
          setUserManagementData(agent_data);
          setTotalRecords(total_records);
        }
      })
      .catch((err) => {
        console.error("Error:", err);
      })
      .finally(() => setIsLoading(false));
  };

  const getRoles = () => {
    
    const rolesURL =
      appConfig?.deploy?.baseUrl + appConfig?.deploy?.agentRoles;

    GetApiHandler(rolesURL, "Get")
      .then((response) => {
        response && response.data && setRoleArray(response.data.data);

        if (response?.data?.data) {
          const rolesData = [...response.data.data];
          rolesData.forEach((data) => {
            data.isSelected = false;
            data.title = data.role_type;
          });
          setRoleDropdownData(rolesData);
        }
      })
      .catch((err) => {
        console.error("Error:", err);
      });
  };

  const getModalStatus = (status) => {
    setShowDeletePopup(status);
  };

  const getDownloadOption = (option) => {
    setDownloadOption(option);
  };

  const getFilteredResult = (name, selectedList) => {
    if (name.toLowerCase() === "status") {
      setStatusDropdownData(selectedList);
    } else if (name.toLowerCase() === "role") {
      setRoleDropdownData(selectedList);
    }
  };

  const handleChange = (e, value) => {
    setPage(value);
  };

  const handleDeleteClick = (id) => {
    setShowDeletePopup({
      show: false,
      id: "",
      shouldDelete: false,
    });
    setIsLoading(true);

    
    const customerInfoURL =
      appConfig?.deploy?.baseUrl +
      appConfig?.deploy?.userManagementList +
      `/${id}`;

    DeleteApiHandler(customerInfoURL, "delete")
      .then((response) => {
        const { data } = response;
        data && getUserManagementList();
      })
      .catch((err) => {
        console.error("Error:", err);
      })
      .finally(() => setIsLoading(false));
  };

  const handleResetFilter = () => {
    const role = clearSelectedDropdownList([...roleArray]);
    const status = clearSelectedDropdownList([...statusDropdownData]);
    setSearchInput("");
    setIsFilterApplied(false);
    setRoleArray(role);
    setStatusDropdownData(status);
  };

  const downloadFile = () => {
    
    const downloadURL =
      appConfig?.deploy?.baseUrl +
      appConfig?.deploy?.downloadUserManagementList.replace(
        "<file_format>",
        downloadOption
      ) +
      "?" +
      queryURL;

    GetApiHandler(downloadURL, "Get")
      .then((response) => {
        if (response) {
          const { data } = response;
          if (data) {
            if (downloadOption === "pdf") {
              downloadReports(data, "application/pdf", "users_list.pdf");
            } else {
              downloadReports(data, "text/csv", "users_list.csv");
            }
          }
        }
      })
      .catch((err) => {
        console.error("Error:", err);
      })
      .finally(() => setDownloadOption(""));
  };

  const createAgentData = (addAgentData) => {
    if (!addAgentData.values) {
      setShowAddUserModal(false);
    } else {
      createUser(addAgentData);
    }
  };

  function createUser(data) {
    
    const createAgentUserUrl =
      appConfig?.deploy?.baseUrl + appConfig?.deploy?.createAgentUser;
    const requestBody = {
      user_first_name: data.values.empFirstName,
      user_middle_name: data.values.empMiddleName,
      user_last_name: data.values.empLastName,
      user_email: data.values.empEmail,
      employee_id: data.values.empId,
      designation: data.values.empDesignation,
      role_id: parseInt(data.selectedRoleId),
      mobile_no: data.values.empMobileNumber,
      pan_number: data.values.empPanNumber,
      gender: data.values.gender,
      user_title: data.values.user_title,
      date_of_birth: convertUTCToYYYY_MM_DD(data.values.dateOfBirth),
    };

    PostApiHandler(createAgentUserUrl, "POST", requestBody).then((response) => {
      if (response?.data?.errors.length) {
        const { errors } = response.data;
        setShowErrorModal(true);
        errors && errors.length && setApiErrorMessage(errors[0].errorMessage);
        setmessageType("alert");
      } else {
        setmessageType("Success");
        setApiErrorMessage("User added successfully!");
        setShowErrorModal(true);
        getUserManagementList();
      }
    });
    setShowAddUserModal(false);
  }

  function handleEditBtn(item) {
    setShowEditUserModal(true);
    setsendDataToEditUserModal(item);
  }

  const saveAgentData = (dataReceivedFromEditModal) => {
    if (!Object.keys(dataReceivedFromEditModal).length) {
      setShowEditUserModal(false);
    } else {
      updateUserDetails(dataReceivedFromEditModal);
    }
  };

  function updateUserDetails(data) {
    
    const editAgentUserURL =
      appConfig?.deploy?.baseUrl + appConfig?.deploy?.editAgentUser;

    const role_id = roleArray.find(
      (role) => role.role_type === data.role_type
    ).id;

    const requestBody = {
      user_id: data.id,
      user_first_name: data.first_name,
      user_middle_name: data.middle_name,
      user_last_name: data.last_name,
      user_email: data.email_id,
      employee_id: data.employee_id,
      designation: data.designation,
      user_status: data.user_status,
      role_id: role_id,
      mobile_no: data.mobile_number,
      pan_number: data.pan_number,
      gender: data.gender,
      user_title: data.user_title,
      date_of_birth: convertUTCToYYYY_MM_DD(data.date_of_birth),
    };

    PatchApiHandler(editAgentUserURL, "PATCH", requestBody).then((response) => {
      if (response?.response?.data?.errors) {
        const { errors } = response.response.data;
        setShowErrorModal(true);
        setmessageType("alert");
        errors && errors.length && setApiErrorMessage(errors[0].errorMessage);
      } else {
        setmessageType("Success");
        response &&
          response.data &&
          response.data.data &&
          setApiErrorMessage(response.data.data);
        setShowErrorModal(true);
        getUserManagementList();
      }
    });
    setShowEditUserModal(false);
  }

  useEffect(() => {
    const MOUSE_UP = "mouseup";
    const handleOutsideClick = (event) => {
      if (
        event.target !== dropdownRef.current &&
        !dropdownRef.current?.contains(event.target) &&
        event.target.localName !== "li"
      ) {
        toggleViewDropdown("", false);
      }
    };
    document.addEventListener(MOUSE_UP, handleOutsideClick);

    return () => document.removeEventListener(MOUSE_UP, handleOutsideClick);
  });

  useEffect(() => {
    if (downloadOption) {
      downloadFile();
    }
  }, [downloadOption]);

  useEffect(() => {
    const selectedStatus = getSelectedDropdownList(statusDropdownData);
    const selectedRoles = getSelectedDropdownList(roleDropdownData);
    let url = "";

    if (selectedStatus.length || selectedRoles.length || searchInput.length) {
      setIsFilterApplied(true);
    } else {
      setIsFilterApplied(false);
    }

    page &&
      (url = url + "page_number=" + (page - 1) + "&page_size=" + rowsPerPage);
    selectedStatus.length &&
      (url = url + createURL("user_status", selectedStatus));
    selectedRoles.length &&
      (url = url + createURLWithID("role_id", selectedRoles));
    searchKey && (url = url + "&" + "search_key=" + searchKey);
    setQueryURL(url);
  }, [statusDropdownData, roleDropdownData, page, searchKey, rowsPerPage]);

  useEffect(() => {
    const { shouldDelete, id } = showDeletePopup;
    if (shouldDelete) {
      handleDeleteClick(id);
    }
  }, [showDeletePopup]);

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
    if (queryURL) {
      getUserManagementList();
    }
  }, [queryURL]);

  useEffect(() => {
    const searchResult = setTimeout(() => {
      setSearchKey(searchInput);
    }, 500);
    return () => clearTimeout(searchResult);
  }, [searchInput]);

  useEffect(() => {
    getRoles();
  }, []);

  return (
    <>
      <div>
        <AgentNavBar />
        <SetBreadCrumb />
        <div className="page-background text-apercu-medium view-container view_container_sm">
          <div className="flex gap-5 w-full">
            <div
              className={` sidebarContainer  h-100 ${styles.filterContainer} ${styles.cardContainer}`}
            >
              <AgentSidebar id={"3"} />
            </div>
            <ErrorModal
              canShow={showErrorModal}
              updateModalState={toggleErrorModal}
              errorMessage={apiErrorMessage}
              messageType={messageType}
            />
            {showAddUserModal ? (
              <CreateUser
                createAgentData={createAgentData}
                rolesData={roleArray}
              />
            ) : null}
            {showEditUserModal ? (
              <EditUser
                saveAgentData={saveAgentData}
                data={sendDataToEditUserModal}
                rolesData={roleArray}
              />
            ) : null}
            <div className={`bg-white w-full p-6 rounded-xl ${styles.cardContainer}`}>
              <>
                <div>
                  <div className="flex justify-between">
                    <div className={`text-regular text-4xl text-light-gray`}>
                      {translate(AGENT.totalUsers)} : {totalRecords}
                    </div>
                    <div className="flex justify-end gap-3">
                      <DownloadDropdown
                        getDownloadOption={getDownloadOption}
                        isEnabled={!UserManagementData.length}
                        ref={userManagementRef}
                      />
                      <button
                        className="button-passive border-fd-primary text-fd-primary text-medium text-2xl flex justify-center items-center gap-2"
                        onClick={() => setShowAddUserModal(true)}
                      >
                        <AiOutlinePlus />
                        {translate(AGENT.addNewUser)}
                      </button>
                    </div>
                  </div>
                  <div className={`bg-white border-b border-slate-300`}>
                    <div className="flex justify-between flex-wrap">
                      <div className="flex items-center flex-wrap gap-3 mb-3 mt-3">
                        <div className="text-regular text-2xl text-light-gray">
                          <input
                            type="text"
                            placeholder={translate(AGENT.search)}
                            value={searchInput}
                            name="searchInput"
                            onChange={(e) => setSearchInput(e.target.value)}
                            className="w-50 text-left border border-gray-300 rounded px-1.5 py-1.5 text-black"
                          />
                        </div>
                        <div className="w-30">
                          <RMDropdownParent
                            options={roleDropdownData}
                            getFilteredResult={getFilteredResult}
                            name={translate(AGENT.role)}
                            ref={roleRef}
                          />
                        </div>
                        <div className="w-30">
                          <RMDropdownParent
                            options={statusDropdownData}
                            getFilteredResult={getFilteredResult}
                            name={translate(AGENT.status)}
                            ref={statusRef}
                          />
                        </div>
                      </div>
                      <div
                        className="flex flex-row items-center gap-3 mb-3 mt-3"
                        onClick={() => handleResetFilter()}
                      >
                        <div className="hover:cursor-pointer">
                          <FaFilter
                            className={`${
                              isFilterApplied
                                ? "text-light-orange"
                                : "text-fd-primary"
                            } text-2xl font-bold`}
                          />
                        </div>
                        <div className="text-regular text-2xl text-light-red hover:cursor-pointer">
                        {translate(COMMON_CONSTANTS.resetAll)}
                        </div>
                      </div>
                    </div>
                  </div>
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
                ) : UserManagementData.length ? (
                  <>
                    {UserManagementData.map((item) => {
                      return (
                        <>
                          {item ? (
                            <div
                              key={item.id}
                              className="product-card mt-5  overflow-hidden  duration-300 ease-in mb-5 text-apercu bg-white p-[20px] border cursor-pointer transition-all duration-400 ease-in-out transform hover:-translate-y-1.2 hover:scale-[1.01] "
                            >
                              <div className="h-3/4 p-6 flex justify-between items-center">
                                <div className="flex flex-col gap-3 w-1/4">
                                  <div>
                                    <div className="text-medium text-xl text-black text-light-gray">
                                      {translate(AGENT.userName)}
                                    </div>
                                    <div className="capitalize text-regular text-xl text-black">
                                      <p className="whitespace-normal break-words">
                                        {getFullName(
                                          item.first_name,
                                          item.middle_name,
                                          item.last_name
                                        )}
                                      </p>
                                    </div>
                                  </div>
                                  <div>
                                    <div className="text-medium text-xl text-black text-light-gray">
                                      {translate(AGENT.userEmailId)}
                                    </div>
                                    <div className="text-regular text-xl text-black">
                                      <p className="whitespace-normal break-words">
                                        {item.email_id}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                                <div className="flex flex-col gap-3 w-1/5">
                                  <div>
                                    <div className="text-medium text-xl text-black text-light-gray">
                                      <p className="whitespace-normal break-words">
                                        {translate(AGENT.employeeId)}
                                      </p>
                                    </div>
                                    <div className="capitalize text-regular text-xl text-black">
                                      <p className="whitespace-normal break-words">
                                        {item.employee_id}
                                      </p>
                                    </div>
                                  </div>
                                  <div>
                                    <div className="text-medium text-xl text-black text-light-gray">
                                      <p className="whitespace-normal break-words">
                                        {translate(AGENT.designation)}
                                      </p>
                                    </div>
                                    <div className="capitalize text-regular text-xl text-black">
                                      <p className="whitespace-normal break-words">
                                        {item.designation}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                                <div className="flex flex-col gap-3 w-1/6">
                                  <div>
                                    <div className="text-medium text-xl text-black text-light-gray">
                                      <p className="whitespace-normal break-words">
                                        {translate(AGENT.role)}
                                      </p>
                                    </div>
                                    <div className="capitalize text-regular text-xl text-black">
                                      <p className="whitespace-normal break-words">
                                        {item.role_type}
                                      </p>
                                    </div>
                                  </div>
                                  <div>
                                    <div className="text-medium text-xl text-black text-light-gray">
                                      <p className="whitespace-normal break-words">
                                        {translate(AGENT.status)}
                                      </p>
                                    </div>
                                    <div className="capitalize text-regular text-xl text-black">
                                      <p className="whitespace-normal break-words">
                                        {item.user_status}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                                <div className="flex flex-col gap-3 w-1/6">
                                  <div>
                                    <div className="text-medium text-xl text-black text-light-gray">
                                      {translate(AGENT.dateCreated)}
                                    </div>
                                    <div className="capitalize text-regular text-xl text-black">
                                      {dateFormat(item.created_on)}
                                    </div>
                                  </div>
                                  <div>
                                    <div className="text-medium text-xl text-black text-light-gray">
                                      {translate(AGENT.lastLogin)}
                                    </div>
                                    <div className="capitalize text-regular text-xl text-black">
                                      {dateFormat(item.lastLogin)}
                                    </div>
                                  </div>
                                </div>
                                <div className="flex gap-3 w-1/12">
                                  <div>
                                    <button
                                      className="text-light-blue"
                                      id={item}
                                      onClick={() => handleEditBtn(item)}
                                    >
                                      <AiOutlineEdit size={24} />
                                    </button>
                                  </div>
                                  <div className="c-multi-select-dropdown w-fit">
                                    <button
                                      className="text-light-blue"
                                      onClick={() =>
                                        toggleViewDropdown(item.id, true)
                                      }
                                    >
                                      <BsThreeDotsVertical size={24} />
                                    </button>
                                    {viewFlag.show &&
                                    item.id === viewFlag.id ? (
                                      <ul
                                        className="c-multi-select-dropdown__options w-fit shadow border border-gray-200"
                                        ref={dropdownRef}
                                      >
                                        {
                                          <div
                                            onClick={() =>
                                              setShowDeletePopup({
                                                show: true,
                                                id: item.id,
                                                shouldDelete: false,
                                              })
                                            }
                                          >
                                            <li
                                              className="c-multi-select-dropdown__option hover:bg-background-secondary py-0.5 rounded"
                                              onClick={() =>
                                                toggleViewDropdown("", false)
                                              }
                                            >
                                              <div className="flex gap-2">
                                                <div className="hoveritems text-regular text-xl whitespace-nowrap text-black hover:text-white">
                                                  {translate(AGENT.deactivate_User)}
                                                </div>
                                              </div>
                                            </li>
                                          </div>
                                        }
                                      </ul>
                                    ) : null}
                                  </div>
                                </div>
                              </div>
                            </div>
                          ) : null}
                        </>
                      );
                    })}
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
                  </>
                ) : (
                  <div className="pt-20 pl-90 text-3xl text-gray-500 ">
                    <div className="flex justify-center">{translate(AGENT.noRecordsFound)}</div>
                  </div>
                )}
              </>
              {showDeletePopup.show ? (
                <DeletePopup
                  getModalStatus={getModalStatus}
                  showDeletePopup={showDeletePopup}
                />
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default UserManagement;

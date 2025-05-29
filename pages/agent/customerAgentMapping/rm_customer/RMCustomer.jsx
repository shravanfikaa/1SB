import { useState, useEffect } from "react";
import RMCustomerFilters from "./RMCustomerFilters";
import {
  dateFormat,
  
  getFullName,
} from "../../../../lib/util";
import { GetApiHandler, PostApiHandler } from "../../../api/apihandler";
import appConfig from "../../../../app.config";
import { AGENT, RM_CUSTOMER, RM_CUSTOMER_COLUMNS } from "../../../../constants";
import MappingHistory from "./mapping_history/[customer_id]";
import ChangeAgentModal from "./ChangeAgentModal";
import ConfirmationModal from "../../../common/confirmationModal";
import Loader from "../../../../svg/Loader";
import { useTranslation } from "react-i18next";  

function RMCustomer() {
  const { t: translate } = useTranslation();
  const [customerData, setCustomerData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectAllCustomers, setSelectAllCustomers] = useState(false);
  const [filterURL, setFilterURL] = useState("");
  const [selectedCustomers, setSelectedCustomers] = useState([]);
  const [showHistoryPopup, setShowHistoryPopup] = useState(false);
  const [showChangeAgentModal, setShowChangeAgentModal] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState();
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [selectedCustomerMappedData, setSelectedCustomerMappedData] =
    useState();
  const [changeAgentLoader, showChangeAgentLoader] = useState(false);

  const toggleChangeAgentModal = () =>
    setShowChangeAgentModal(!showChangeAgentModal);

  const toggleSelectAllCheckbox = () =>
    setSelectAllCustomers(!selectAllCustomers);

  const updateModalState = () => {
    setShowHistoryPopup(!showHistoryPopup);
  };

  const getFilterURL = (queryURL) => {
    setFilterURL(queryURL);
  };

  const getSelectedAgentData = (data) => setSelectedAgent(data);

  const getRMCustomerList = () => {
    
    const customerInfoURL = filterURL
      ? appConfig?.deploy?.baseUrl +
        appConfig?.deploy?.rmCustomerList +
        filterURL
      : appConfig?.deploy?.baseUrl + appConfig?.deploy?.rmCustomerList;
    !selectedAgent && setIsLoading(true);
    GetApiHandler(customerInfoURL, "Get")
      .then((response) => {
        const { customer_data } = response?.data?.data;
        if (customer_data) {
          const customerResponseData = customer_data;
          customerResponseData.forEach((value) => (value.isSelected = false));
          setCustomerData(customerResponseData);
          selectedAgent && setSelectedAgent();
        }
      })
      .catch((err) => {
        console.error("Error:", err);
      })
      .finally(() => {
        setIsLoading(false);
        showChangeAgentLoader(false);
      });
  };

  const fullName = (first_name, last_name) => (
    <td className="text-regular text-xl text-black p-[5px]">
      {getFullName(first_name, "", last_name)}
    </td>
  );

  const changeAgent = () => {
    showChangeAgentLoader(true);
    
    const changeAgentURL =
      appConfig?.deploy?.baseUrl + appConfig?.deploy?.rmChangeAgent;

    const selectedCustomerIds = [];
    selectedCustomers.forEach((data) => {
      data.isSelected && selectedCustomerIds.push(data.id);
    });

    const requestBody = {
      agent_id: selectedAgent?.id,
      customer_ids: selectedCustomerIds,
    };

    PostApiHandler(changeAgentURL, "POST", requestBody)
      .then((response) => {
        const { data } = response?.data;
        if (data) {
          getRMCustomerList();
        }
      })
      .catch((err) => {
        console.error("Error:", err);
      });
  };

  const handleCustomerSelect = (e, index) => {
    const customers = [...customerData];
    customers[index].isSelected = !customerData[index].isSelected;
    setCustomerData(customers);
  };

  const mappingHistoryPopupHandler = (customer_id) => {
    
    const getAgentsURL =
      appConfig?.deploy?.baseUrl +
      appConfig?.deploy?.rmCustomerMappingHistory.replace(
        "<customer_id>",
        customer_id
      );
    GetApiHandler(getAgentsURL, "Get")
      .then((response) => {
        if (response?.data) {
          const { data } = response.data;
          setSelectedCustomerMappedData(data);
          setShowHistoryPopup(true);
        }
      })
      .catch((err) => {
        console.error("Error:", err);
      });
  };

  const getModalStatus = ({ status }) => {
    setShowConfirmationModal(false);
    toggleChangeAgentModal();
    status && changeAgent();
  };

  useEffect(() => {
    getRMCustomerList();
  }, [filterURL]);

  useEffect(() => {
    const selectedCustomerIds = [];
    customerData.forEach((data) => {
      data.isSelected && selectedCustomerIds.push(data);
    });
    setSelectedCustomers(selectedCustomerIds);

    if (!selectedCustomerIds.length && selectAllCustomers) {
      toggleSelectAllCheckbox();
    }
    if (
      selectedCustomerIds.length === customerData.length &&
      !selectAllCustomers
    ) {
      toggleSelectAllCheckbox();
    }
  }, [customerData]);

  useEffect(() => {
    if (selectAllCustomers) {
      const customers = [...customerData];
      customers.forEach((value) => (value.isSelected = true));
      setCustomerData(customers);
    } else {
      const selectedList = customerData.find((data) => data.isSelected);
      if (selectedList) {
        const customers = [...customerData];
        customers.forEach((value) => (value.isSelected = false));
        setCustomerData(customers);
      }
    }
  }, [selectAllCustomers]);

  useEffect(() => {
    if (selectedAgent) {
      const isAgentAlreadyExist = selectedCustomers.find(
        (data) => data.agent_details?.agent_id
      );
      if (isAgentAlreadyExist) {
        setShowConfirmationModal(true);
      } else {
        toggleChangeAgentModal();
        changeAgent();
      }
    }
  }, [selectedAgent]);

  return (
    <>
      <RMCustomerFilters getFilterURL={getFilterURL} />
      {showHistoryPopup && (
        <MappingHistory
          updateModalState={updateModalState}
          customerMappedData={selectedCustomerMappedData}
        />
      )}
      {showChangeAgentModal ? (
        <ChangeAgentModal
          toggleChangeAgentModal={toggleChangeAgentModal}
          getSelectedAgentData={getSelectedAgentData}
        />
      ) : null}
      {showConfirmationModal ? (
        <ConfirmationModal
          heading={RM_CUSTOMER.confirmationHeader}
          message={RM_CUSTOMER.confirmationMessage}
          getModalStatus={getModalStatus}
        />
      ) : null}
      {isLoading ? (
        <div className="flex justify-center text-3xl text-gray-500 mt-8">
          <div className="flex justify-center gap-3">
            {translate(AGENT.loading)}...
            <Loader />
          </div>
        </div>
      ) : customerData.length ? (
        <div className="text-3xl text-gray-500">
          <div className="flex justify-end my-3">
            <button
              className="text-medium text-2xl text-white btn-gradient rounded-md p-2 border-[0px]"
              onClick={toggleChangeAgentModal}
              disabled={!selectedCustomers.length}
            >
              {translate(AGENT.changeAgent)}
            </button>
          </div>
          <table className="table-auto w-full text-left border-collapse border-b lack-400 border-spacing-y-5">
            <thead className="text-regular text-2xl text-light-gray">
              <th className="p-[5px]">
                <input
                  type="checkbox"
                  onChange={toggleSelectAllCheckbox}
                  value={selectAllCustomers}
                  checked={selectAllCustomers}
                  name="selectAllCustomers"
                  className="accent-primary-green h-4 w-4 hover:cursor-pointer flex justify-center items-center"
                />
              </th>
              {Object.keys(RM_CUSTOMER_COLUMNS).map((val) => (
                <th className="p-[5px]">{translate(RM_CUSTOMER_COLUMNS[val])}</th>
              ))}
            </thead>
            <tbody className="text-regular text-xl">
              {customerData &&
                customerData.map((data, index) => {
                  return (
                    <tr className="border-b lack-400">
                      <td className="text-regular text-xl text-black p-[5px] pr-[4px]">
                        <input
                          type="checkbox"
                          onChange={(e) => handleCustomerSelect(e, index)}
                          value={data.isSelected}
                          checked={data.isSelected}
                          name="customerSelect"
                          disabled={
                            selectedCustomers.find(
                              (selected) => selected.id === data.id
                            ) && changeAgentLoader
                          }
                          className="accent-primary-green h-4 w-4 hover:cursor-pointer flex justify-center items-center"
                        />
                      </td>
                      {Object.keys(RM_CUSTOMER_COLUMNS).map((value) => {
                        if (value === "customer_full_name") {
                          return fullName(data.first_name, data.last_name);
                        } else if (value.includes("agent")) {
                          const { agent_details } = data;
                          if (Object.keys(agent_details).length) {
                            return value === "agent_id" ? (
                              <td className="text-regular text-xl text-black p-[5px]">
                                {agent_details.agent_id}
                              </td>
                            ) : (
                              fullName(
                                agent_details.agent_first_name,
                                agent_details.agent_last_name
                              )
                            );
                          } else {
                            return (
                              <td className="text-regular text-xl text-black p-[5px]"></td>
                            );
                          }
                        } else if (value === "updated_on") {
                          return (
                            <td className="text-regular text-xl text-black p-[5px]">
                              {data[value] ? dateFormat(data[value]) : null}
                            </td>
                          );
                        } else if (value === "mapping_history") {
                          return (
                            <td className="text-regular text-xl text-light-blue underline p-[5px] flex gap-2">
                              <button
                                className="underline p-[5px]"
                                onClick={() =>
                                  mappingHistoryPopupHandler(data.id)
                                }
                              >
                                
                                {translate(AGENT.view)}
                              </button>
                              {selectedCustomers.find(
                                (selected) => selected.id === data.id
                              ) && changeAgentLoader ? (
                                <div className="p-[5px]">
                                  <Loader />
                                </div>
                              ) : null}
                            </td>
                          );
                        } else {
                          return (
                            <td className="text-regular text-xl text-black p-[5px]">
                              {data[value]}
                            </td>
                          );
                        }
                      })}
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="pt-20 pl-90 text-3xl text-gray-500">
          <div className="flex justify-center">{translate(AGENT.noRecordsFound)}</div>
        </div>
      )}
    </>
  );
}

export default RMCustomer;

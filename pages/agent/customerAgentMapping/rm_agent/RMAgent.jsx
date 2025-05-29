import { useState, useEffect } from "react";
import {
  dateFormat,
  
  getFullName,
} from "../../../../lib/util";
import appConfig from "../../../../app.config";
import { GetApiHandler, PostApiHandler } from "../../../api/apihandler";
import RMAgentFilters from "../rm_customer/RMAgentFilters";
import { AGENT, RM_AGENT_DASHBOARD_COLUMNS } from "../../../../constants";
import ChangeAgentModal from "../rm_customer/ChangeAgentModal";
import Loader from "../../../../svg/Loader";
import { useRouter } from "next/router";
import { useTranslation } from "react-i18next";  
import ErrorModal from "../../../common/errorPopup";

function RMAgent() {
  const { t: translate } = useTranslation();
  const [agentData, setAgentData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectAllCustomers, setSelectAllCustomers] = useState(false);
  const [selectedCustomers, setSelectedCustomers] = useState([]);
  const [showChangeAgentModal, setShowChangeAgentModal] = useState(false);
  const [filterURL, setFilterURL] = useState("");
  const [selectedAgent, setSelectedAgent] = useState();
  const [showErrorModal, setShowErrorModal] = useState(false);

  const router = useRouter();

  const toggleErrorModal = () => setShowErrorModal(state => !state);

  const toggleChangeAgentModal = () =>
    setShowChangeAgentModal(!showChangeAgentModal);

  const toggleSelectAllCheckbox = () =>
    setSelectAllCustomers(!selectAllCustomers);

  const getAgentDetails = () => {
    !selectedAgent && setIsLoading(true);
    
    const getAgentsURL = filterURL
      ? appConfig?.deploy?.baseUrl +
        appConfig?.deploy?.rmAgentList +
        filterURL
      : appConfig?.deploy?.baseUrl + appConfig?.deploy?.rmAgentList;
    GetApiHandler(getAgentsURL, "Get")
      .then((response) => {
        if (response?.data?.data) {
          const { agent_data } = response.data.data;
          if (agent_data) {
            const agentResponseData = agent_data;
            agentResponseData.forEach((value) => (value.isSelected = false));
            setAgentData(agentResponseData);
            selectedAgent && setSelectedAgent();
          }
        }
      })
      .catch((err) => {
        console.error("Error:", err);
      })
      .finally(() => setIsLoading(false));
  };

  const getFilterURL = (queryURL) => {
    setFilterURL(queryURL);
  };

  const getSelectedAgentData = (data) => setSelectedAgent(data);

  const fullName = (first_name, last_name) => (
    <td className="text-regular text-xl text-black p-[5px]">
      {getFullName(first_name, "", last_name)}
    </td>
  );

  const handleCustomerSelect = (e, index) => {
    const customers = [...agentData];
    customers[index].isSelected = !agentData[index].isSelected;
    setAgentData(customers);
  };

  const changeAgent = () => {
    
    const changeAgentURL =
      appConfig?.deploy?.baseUrl + appConfig?.deploy?.rmTransferAgent;
    const requestBody = {
      destination_agent_id: selectedAgent?.id,
      source_agent_ids: selectedCustomers,
    };

    PostApiHandler(changeAgentURL, "POST", requestBody)
      .then((response) => {
        const { data } = response?.data;
        if (data) {
          setShowErrorModal(true)
          getAgentDetails();
        }
      })
      .catch((err) => {
        console.error("Error:", err);
      });
  };

  useEffect(() => {
    getAgentDetails();
  }, [filterURL]);

  useEffect(() => {
    if (selectAllCustomers) {
      const customers = [...agentData];
      customers.forEach((value) => (value.isSelected = true));
      setAgentData(customers);
    } else {
      const selectedList = agentData.find((data) => data.isSelected);
      if (selectedList) {
        const customers = [...agentData];
        customers.forEach((value) => (value.isSelected = false));
        setAgentData(customers);
      }
    }
  }, [selectAllCustomers]);

  useEffect(() => {
    if (selectedAgent) {
      toggleChangeAgentModal();
      changeAgent();
    }
  }, [selectedAgent]);

  useEffect(() => {
    const selectedCustomerIds = [];
    agentData.forEach((data) => {
      data.isSelected && selectedCustomerIds.push(data.id);
    });
    setSelectedCustomers(selectedCustomerIds);
    if (!selectedCustomerIds.length && selectAllCustomers) {
      toggleSelectAllCheckbox();
    }
    if (
      selectedCustomerIds.length === agentData.length &&
      !selectAllCustomers
    ) {
      toggleSelectAllCheckbox();
    }
  }, [agentData]);

  return (
    <>
      <RMAgentFilters getFilterURL={getFilterURL} />
      {showChangeAgentModal ? (
        <ChangeAgentModal
          toggleChangeAgentModal={toggleChangeAgentModal}
          getSelectedAgentData={getSelectedAgentData}
        />
      ) : null}
      {isLoading ? (
        <div className="flex justify-center text-3xl text-gray-500 mt-8">
          <div className="flex justify-center gap-3">
            {translate(AGENT.loading)}...
            <Loader />
          </div>
        </div>
      ) : agentData && agentData.length ? (
        <div className="flex flex-col justify-center text-3xl text-gray-500 text-regular">
          <div className="my-3 flex justify-end">
            <button
              className={(!(selectAllCustomers.length || selectedCustomers.length)) ? "button-active button-transition hover:bg-hover-primary text-medium text-xl lg:text-2xl w-fit   text-medium text-xl lg:text-2xl w-fit  hover:button-shadow" : "button-active btn-gradient button-transition hover:bg-hover-primary text-medium text-xl lg:text-2xl w-fit   text-medium text-xl lg:text-2xl w-fit  hover:button-shadow"} 
              onClick={toggleChangeAgentModal}
              disabled={
                !(selectAllCustomers.length || selectedCustomers.length)
              }
            >
              {translate(AGENT.transferCustomers)}
            </button>
          </div>
          <table className="table-auto w-full text-left border-collapse border-b lack-400 border-spacing-y-5 text-xl">
            <thead className="text-regular text-2xl text-light-gray">
              <tr>
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
                {Object.keys(RM_AGENT_DASHBOARD_COLUMNS).map((val) => (
                  <th className="p-[5px]">{translate(RM_AGENT_DASHBOARD_COLUMNS[val])}</th>
                ))}
              </tr>
            </thead>
            <tbody className="text-black">
              {agentData.map((item, index) => {
                return (
                  <tr key={index} className="border-b">
                    <td className="p-[5px]">
                      <input
                        type="checkbox"
                        onChange={(e) => handleCustomerSelect(e, index)}
                        value={item.isSelected}
                        checked={item.isSelected}
                        name="customerSelect"
                        disabled={selectedAgent?.id === item.id || item.total_customers_mapped === 0}
                        className="accent-primary-green h-4 w-4 hover:cursor-pointer flex justify-center items-center"
                      />
                    </td>
                    {Object.keys(RM_AGENT_DASHBOARD_COLUMNS).map((value) => {
                      if (value === "agent_full_name") {
                        return fullName(item.first_name, item.last_name);
                      } else if (
                        value === "created_on" ||
                        value === "lastLogin"
                      ) {
                        return (
                          <td className="text-regular text-xl text-black p-[5px]">
                            {item[value] ? dateFormat(item[value]) : null}
                          </td>
                        );
                      } else if (value === "customers_mapped") {
                        return item.total_customers_mapped ? (
                          <td className="p-[5px] flex justify-center items-center">
                            <button
                              onClick={() => {
                                sessionStorage.setItem(
                                  "selectedAgentID",
                                  item.id
                                );
                                router.push({
                                  pathname:
                                    "/agent/customerAgentMapping/MappedCustomers",
                                  agent_name: getFullName(
                                    item.first_name,
                                    item.middle_name,
                                    item?.last_name
                                  ),
                                });
                              }}
                            >
                              <div className="flex gap-2 flex items-end justify-center">
                                <a className="underline text-fd-primary cursor-pointer">
                                  {item.total_customers_mapped}
                                </a>
                                {selectedAgent?.id === item.id ? (
                                  <Loader />
                                ) : null}
                              </div>
                            </button>
                          </td>
                        ) : (
                          <td className="p-[5px]">
                            <div className="flex gap-2 flex items-end justify-center">
                              <a className="text-gray-400">
                                {item.total_customers_mapped}
                              </a>
                              {selectedAgent?.id === item.id ? (
                                <Loader />
                              ) : null}
                            </div>
                          </td>
                        );
                      } else {
                        return (
                          <td className="text-regular text-xl text-black p-[5px]">
                            {item[value]}
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
        <div className="flex justify-center text-3xl text-gray-500 mt-5">
          <div className="flex justify-center">{translate(AGENT.noRecordsFound)}</div>
        </div>
      )}
      <ErrorModal 
        canShow={showErrorModal}
        updateModalState={toggleErrorModal}
        errorMessage={"Customer transferred successfully!"}
        messageType={"Success"}
      />
    </>
  );
}

export default RMAgent;

import { useState, useEffect } from "react";
import { IoMdClose } from "react-icons/io";
import popupcss from "../../../../styles/popup_modals.module.css";
import Loader from "../../../../svg/Loader";
import AgentTransferTable from "./AgentTransferTable";
import RMAgentFilters from "./RMAgentFilters";
import appConfig from "../../../../app.config";
import { GetApiHandler } from "../../../api/apihandler";
import { AGENT } from "../../../../constants";
import { useTranslation } from "react-i18next";

function ChangeAgentModal({ toggleChangeAgentModal, getSelectedAgentData }) {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState();
  const [filterURL, setFilterURL] = useState("");
  const [agentData, setAgentData] = useState([]);
  const { t: translate } = useTranslation();

  const getFilterURL = (queryURL) => {
    setFilterURL(queryURL);
  };

  const getSelectedAgent = (agent) => setSelectedAgent(agent);

  const getRMAgentList = () => {
    
    const agentListURL = filterURL
      ? appConfig?.deploy?.baseUrl +
        appConfig?.deploy?.rmAgentList +
        filterURL
      : appConfig?.deploy?.baseUrl + appConfig?.deploy?.rmAgentList;
    setIsLoading(true);
    GetApiHandler(agentListURL, "Get")
      .then((response) => {
        const { agent_data } = response?.data?.data;
        if (agent_data) {
          setAgentData(agent_data);
        }
      })
      .catch((err) => {
        console.error("Error:", err);
      })
      .finally(() => setIsLoading(false));
  };

  const handleConfirmBtnClick = () => {
    getSelectedAgentData(selectedAgent);
  };

  useEffect(() => {
    getRMAgentList();
  }, [filterURL]);

  return (
    <>
      <div className="fixed inset-0 z-10 overflow-y-auto">
        <div className="fixed inset-0 w-auto h-auto bg-black opacity-40"></div>
        <div className="flex items-center justify-center min-h-screen px-4 py-8">
          <div
            className={` ${popupcss.change_agent_modal} p-4 bg-white rounded-md shadow-lg z-[1]`}
          >
            <div className="flex flex-row-reverse mb-3">
              <button onClick={toggleChangeAgentModal}>
                <IoMdClose size={22} className="close-button" />
              </button>
            </div>
            <div className="w-full flex flex-col justify-center gap-3">
              <div className="text-left text-medium text-4xl text-black">{translate(AGENT.changeAgent)}</div>
              <RMAgentFilters getFilterURL={getFilterURL} />
              <AgentTransferTable
                getSelectedAgent={getSelectedAgent}
                agentData={agentData}
              />
              <div className="flex justify-center">
                <button
                  className= {(!selectedAgent) ? "button-active  button-transition hover:bg-hover-primary text-medium text-xl lg:text-2xl w-fit   text-medium text-xl lg:text-2xl w-fit  hover:button-shadow" : "button-active btn-gradient button-transition hover:bg-hover-primary text-medium text-xl lg:text-2xl w-fit   text-medium text-xl lg:text-2xl w-fit  hover:button-shadow"} 
                  disabled={!selectedAgent}
                  onClick={handleConfirmBtnClick}
                >
                  {translate(AGENT.confirm)}
                  {isLoading ? <Loader /> : null}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default ChangeAgentModal;

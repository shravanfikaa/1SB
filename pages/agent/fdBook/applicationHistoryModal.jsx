import React, { useEffect, useState } from "react";
import {
  changeTimeFormat,
  dateWithSpace,
  
} from "../../../lib/util";
import appConfig from "../../../app.config";
import { GetApiHandler } from "../../api/apihandler";
import {
  Accordion,
  AccordionItem,
  AccordionItemHeading,
  AccordionItemButton,
  AccordionItemPanel,
} from "react-accessible-accordion";
import "react-accessible-accordion/dist/fancy-example.css";
import ErrorModal from "../../common/errorPopup";
import { ADDRESS_DETAILS, AGENT, RM_VIEW_OPTIONS } from "../../../constants";
import { useTranslation } from "react-i18next";
const ApplicationHistoryModal = ({ updateModalState, selectedID }) => {
  const [historyData, setHistoryData] = useState([]);
  const [apiErrorMessage, setApiErrorMessage] = useState([]);
  const [messageType, setmessageType] = useState("");
  const [showErrorModal, setShowErrorModal] = useState(false);
  const toggleErrorModal = () => setShowErrorModal((state) => !state);
  const { t: translate } = useTranslation();
  const getAppHistoryData = () => {
    
    const appHistoryUrl =
      appConfig?.deploy?.baseUrl +
      appConfig?.deploy?.rmFdAppHistory.replace("<fd_id>", selectedID);
    GetApiHandler(appHistoryUrl, "GET").then((response) => {
      const { data } = response;
      if (response?.response?.data?.errors[0]) {
        setApiErrorMessage(response?.response?.data?.errors[0]?.errorMessage);
        setmessageType("alert");
        setShowErrorModal(true);
      } else if (data?.data) {
        const { data } = response.data;
        if (data) {
          setHistoryData(data);
          // setTotalRecords(total_records); TO DO FOR PAGINATION
        }
      }
    });
  };

  useEffect(() => {
    if (selectedID) {
      getAppHistoryData();
    }
  }, []);

  return (
    <>
      <div className="fixed inset-0 z-10 overflow-y-auto">
        <div
          className="fixed inset-0 w-auto h-auto bg-black opacity-25"
          onClick={updateModalState}
        ></div>
        <ErrorModal
          canShow={showErrorModal}
          updateModalState={toggleErrorModal}
          errorMessage={apiErrorMessage}
          messageType={messageType}
        />
        <div className="flex justify-center items-center min-h-screen ">
          <div
            className={
              historyData.length
                ? "relative w-4/5 mx-10 p-5 bg-white rounded-md"
                : "relative w-2/5 mx-10 p-5 bg-white rounded-md"
            }
          >
            <div className="flex justify-center text-medium text-center text-black text-4xl mb-5">
              {translate(RM_VIEW_OPTIONS.appHistory)}
            </div>
            {historyData.length ? (
              <div className="flex flex-col break-all text-regular text-2xl text-center max-h-80 overflow-y-scroll">
                <div className="flex justify-between justify-center text-left text-light-gray gap-3">
                  <div className="w-[55px] break-normal"></div>
                  <div className="w-1/6 break-normal">{translate(AGENT.date)}</div>
                  <div className="w-1/6 break-normal">{translate(AGENT.time)}</div>
                  <div className="w-1/6 break-normal">{translate(AGENT.action)}</div>
                  <div className="w-1/6 break-normal">{translate(AGENT.ipAddress)}</div>
                  <div className="w-1/6 break-normal"></div>
                  <div className="w-1/6 break-normal">{translate(ADDRESS_DETAILS.country)}</div>
                  <div className="w-1/6 break-normal">{translate(AGENT.initiatedBy)}</div>
                </div>
                <Accordion allowZeroExpanded>
                  {historyData.map((item, index) => (
                    <AccordionItem key={index}>
                      <AccordionItemHeading className="bg-white">
                        <AccordionItemButton>
                          {dateWithSpace(item.created_on)}
                        </AccordionItemButton>
                      </AccordionItemHeading>
                      <AccordionItemPanel>
                        <div className="flex justify-between text-left gap-2">
                          <div className="w-[40px] text-black break-normal"></div>
                          <div className="w-1/6 text-black break-normal"></div>
                          <div className="w-1/6 text-black break-normal">
                            {changeTimeFormat(item.created_on)}
                          </div>
                          <div className="w-1/6 text-black break-normal">
                            {item.action}
                          </div>
                          <div className="w-1/6 text-black break-normal">
                            {item.ipAddress}
                          </div>
                          <div className="w-1/6 text-black break-normal">{item.city}</div>
                          <div className="w-1/6 text-black break-normal">
                            {item.country}
                          </div>
                          <div className="w-1/6 text-black break-normal">
                            {item.initiated_by}
                          </div>
                        </div>
                      </AccordionItemPanel>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            ) : (
              <div className="flex flex-col break-all text-regular text-2xl text-center max-h-80">
                <p className="text-medium text-4xl text-light-gray">
                  {selectedID
                    ? translate(AGENT.noRecordsFound)
                    : "No history found as status of this FD is currently In Progress"}
                </p>
              </div>
            )}
            <div className="mt-6 text-center">
              <div className="flex justify-center gap-2">
                <button
                  className="button-passive border-fd-primary text-fd-primary rounded-md"
                  onClick={updateModalState}
                >
                  {translate(ADDRESS_DETAILS.close)} 
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ApplicationHistoryModal;

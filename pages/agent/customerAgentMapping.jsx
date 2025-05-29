import styles from "../../styles/fd.module.css";
import AgentNavBar from "./navbar/agent_navbar";
import SetBreadCrumb from "./header/page_breadcrumb";
import AgentSidebar from "./sidebar/agent_sidebar";
import { useState } from "react";
import ErrorModal from "../common/errorPopup";
import RMCustomer from "./customerAgentMapping/rm_customer/RMCustomer";
import RMAgent from "./customerAgentMapping/rm_agent/RMAgent";
import { useTranslation } from "react-i18next";

function CustomerAgentMapping() {
  const [selectedOption, setSelectedOption] = useState("Customer");
  const { t: translate } = useTranslation();

  return (
    <>
      <div>
        <AgentNavBar />
        <SetBreadCrumb />
        <div className="page-background text-apercu-medium view-container view_container_sm">
          <div className="flex gap-5 w-full">
            <div className=" sidebarContainer  h-100">
              <AgentSidebar id={"2"} />
            </div>
            {/* <ErrorModal
              canShow={showErrorModal}
              updateModalState={toggleErrorModal}
              errorMessage={apiErrorMessage}
              messageType={messageType}
            /> */}
            <div className={`bg-white w-full p-6 rounded-xl ${styles.cardContainer}`}>
              <div className="flex justify-between mb-6">
                <ul className="flex border-b">
                  {["Customer", "Agent"].map((option, index) => {
                    return (
                      <li
                        className={
                          option === selectedOption
                            ? `-mb-px mr-1 cursor-pointer`
                            : `mr-1 cursor-pointer`
                        }
                        key={option + index}
                        onClick={() => setSelectedOption(option)}
                      >
                        <div
                          className={
                            option === selectedOption
                              ? `bg-white inline-block border-l border-t border-r rounded-t py-2 px-4 text-fd-primary font-semibold`
                              : `bg-white inline-block py-2 px-4 text-fd-primary hover:text-fd-primary font-semibold`
                          }
                        >
                          {translate(option)}
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>
              {selectedOption === "Customer" ? <RMCustomer /> : <RMAgent />}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default CustomerAgentMapping;

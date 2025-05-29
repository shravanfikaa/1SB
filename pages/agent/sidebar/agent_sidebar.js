import Link from "next/link";
import { useEffect, useState } from "react";
import { AGENT_SIDEBAR_ITEMS } from "../../../constants";
import { isFeatureForRoleBaseSidebar } from "../../../lib/util";
import { useTranslation } from "react-i18next";
import LoginAlertPopUp from "../../common/loginAlertPopUp";
import { applicationSetup } from "../../../utils/applicationSetup";

function AgentSidebar(props) {
  const [showLoginPopUp, setShowLoginPopUp] = useState(false);
  const [isSideBarItemEnabled, setIsSideBarItemEnabled] = useState({
    fdList: 1,
    fdBook: 1,
    fdProduct: 1,
    customerAgentMapping: 0,
    userManagement: 0,
    agentCustomerList: 1,
  });
  const { t: translate } = useTranslation();

  useEffect(() => {
    if (typeof window !== "undefined") {
      const fetchingToken = sessionStorage.getItem("fetchingToken")
      if (window.location.search.includes("sessionId")) {
        const auth = sessionStorage.getItem("authorizationToken");
        if (fetchingToken !== "false" && auth) {
          if (auth === null) {
            setShowLoginPopUp(true)
          }
        }
      } else {
        const auth = sessionStorage.getItem("authorizationToken");
        if (auth === null) {
          setShowLoginPopUp(true)
        }
      }
    }
  });

  const applicationSetupHandler = async () => {
    const featureFlag = JSON.parse(sessionStorage.getItem("featureFlag"));
    if (featureFlag) {
      const obj = {
        fdList: isFeatureForRoleBaseSidebar(featureFlag, "AgentFdList"),
        fdBook: isFeatureForRoleBaseSidebar(featureFlag, "AgentFdBook"),
        fdProduct: isFeatureForRoleBaseSidebar(featureFlag, "AgentFdProduct"),
        customerAgentMapping: isFeatureForRoleBaseSidebar(featureFlag, "CustomerAgentMapping"),
        userManagement: isFeatureForRoleBaseSidebar(featureFlag, "UserManagement"),
        agentCustomerList: isFeatureForRoleBaseSidebar(featureFlag, "AgentCustomerList"),
      }
      setIsSideBarItemEnabled(obj)
    }
  }

  useEffect(() => {
    applicationSetupHandler();
  }, [])

  return (
    <>
      <aside aria-label="Sidebar">
        <div className="overflow-y-auto h-screen p-6 bg-dark-gray rounded-xl w-max">
          {isSideBarItemEnabled.fdList ? <div
            className={`${props.id === "1" && "text-background-primary btn-gradient"
            } hover:cursor-pointer rounded-xl p-3`}
          >
            <Link href="/agent/customers">
              <h1 className={`text-medium text-2xl ${props.id === "1" ? "text-white" : "text-black"}`}>
                {translate(AGENT_SIDEBAR_ITEMS.transactionList)}
              </h1>
            </Link>
          </div> : null}
          {
            isSideBarItemEnabled.agentCustomerList ? <div
              className={`${props.id === "6" && "text-background-primary btn-gradient"
                } hover:cursor-pointer rounded-lg p-3`}
            >
              <Link href="/agent/customers_list">
                <h1 className={`text-medium text-2xl ${props.id === "6" ? "text-white" : "text-black"}`}>
                  {translate(AGENT_SIDEBAR_ITEMS.customerList)}
                </h1>
              </Link>
            </div> : null
          }
          {isSideBarItemEnabled.fdBook ? <div
            className={`${props.id === "4" && "text-background-primary btn-gradient"
              } hover:cursor-pointer rounded-xl p-3`}
          >
            <Link href="/agent/fdBook">
              <h1 className={`text-medium text-2xl ${props.id === "4" ? "text-white" : "text-black"}`}>
                {translate(AGENT_SIDEBAR_ITEMS.fdBook)}
              </h1>
            </Link>
          </div> : null}
          {isSideBarItemEnabled.fdProduct ? <div
            className={`${props.id === "5" && "text-background-primary btn-gradient"
              } hover:cursor-pointer rounded-xl p-3`}
          >
            <Link href="/agent/fd_products">
              <h1 className={`text-medium text-2xl ${props.id === "5" ? "text-white" : "text-black"}`}>
                {translate(AGENT_SIDEBAR_ITEMS.fdProducts)}
              </h1>
            </Link>
          </div> : null}
          {isSideBarItemEnabled.customerAgentMapping ? <div
            className={`${props.id === "2" && "text-background-primary btn-gradient"
              } hover:cursor-pointer rounded-xl p-3`}
          >
            <Link href="/agent/customerAgentMapping">
              <h1 className={`text-medium text-2xl ${props.id === "2" ? "text-white" : "text-black"}`}>
                {translate(AGENT_SIDEBAR_ITEMS.customerAgentMap)}
              </h1>
            </Link>
          </div> : null}
          {isSideBarItemEnabled.userManagement ? <div
            className={`${props.id === "3" && "text-background-primary btn-gradient"
              } hover:cursor-pointer rounded-xl p-3`}
          >
            <Link href="/agent/user_management">
              <h1 className={`text-medium text-2xl ${props.id === "3" ? "text-white" : "text-black"}`}>
                {translate(AGENT_SIDEBAR_ITEMS.userManagement)}
              </h1>
            </Link>
          </div> : null}
        </div>
      </aside>
      {showLoginPopUp ? <LoginAlertPopUp /> : ""}
    </>
  );
}

export default AgentSidebar;

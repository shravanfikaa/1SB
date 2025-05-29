import styles from "../../styles/fd.module.css";
import AgentNavBar from "./navbar/agent_navbar";
import SetBreadCrumb from "./header/page_breadcrumb";
import AgentSidebar from "./sidebar/agent_sidebar";
import UniqueCustomerList from "./customerAgentMapping/rm_customer/UniqueCustomerList";
import { useTranslation } from "react-i18next";

function Customers() {
  const { t: translate } = useTranslation();
  return (
    <>
      <div>
        <AgentNavBar />
        <SetBreadCrumb />
        <div className="page-background text-apercu-medium view-container view_container_sm">
          <div className="flex gap-5 w-full">
            <div className=" sidebarContainer  h-100">
              <AgentSidebar id={"6"} />
            </div>
            <div className={`bg-white w-full p-6 rounded-xl ${styles.cardContainer}`}>
              <UniqueCustomerList />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Customers;

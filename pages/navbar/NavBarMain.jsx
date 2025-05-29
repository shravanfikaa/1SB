import { useTranslation } from "react-i18next";
import { getUserType } from "../../lib/util";
import AgentNavBar from "../agent/navbar/agent_navbar";
import NavBar from "./navbar_view";
import { useEffect, useState } from "react";

const NavBarMain = ({ shouldShowLogin = false, getLoginStatus = () => { } }) => {
  const userType = getUserType();
  const { t: translate } = useTranslation();
  const [flowType, setFlowType] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const type = sessionStorage.getItem("selectedFlowType");
      type && setFlowType(type);
    }
  })

  return (
    <>
      {flowType ? <></> : <>
        {userType === "user" ? (
          <NavBar
            shouldShowLogin={shouldShowLogin}
            getLoginStatus={getLoginStatus}
          />
        ) : (
          <AgentNavBar />
        )}
      </>}
    </>
  );
};

export default NavBarMain;

import React, { useState, useEffect } from "react";
import Image from "next/image";
import sb_logo from "../../product_logos/1sb_logo.png";
import AgentMenu from "./agent_menu";
import Link from "next/link";
import appConfig from "../../../app.config";
import { imageURL } from "../../../constants";
import { useTranslation } from "react-i18next";
import LanguageChange from "../../../_components/LanguageChange";
function AgentNavBar() {
  const [distributerLogo, setDistributerLogo] = useState("");
  const { t: translate } = useTranslation();
  // const [distributerId,setDistributerId] = useState();
  useEffect(() => {
    // const distributorName = sessionStorage.getItem("distributorName");
    // distributorName && setDistributerId(JSON.parse(distributorName.toLowerCase()))

    setDistributerLogo(imageURL.imageBaseUrl +
      appConfig?.distributorId?.toLowerCase() +
      ".png");
  }, []);

  return (
    <div as="nav" className="bg-white border-b-2 border-gray-100">
      <div className="view-container view_container_sm">
        <div className="flex items-center justify-between">
          <Link href="/agent/customers">
            <div className="hover:cursor-pointer w-auto">
              <Image
                src={distributerLogo ? distributerLogo : sb_logo}
                alt="Product logo"
                width={72}
                height={30}
              />
            </div>
          </Link>
          <div className="flex items-center justify-between">
            {appConfig?.deploy?.multiLanSupport[appConfig?.distributorId.toLowerCase()] ? <LanguageChange /> : ""}
            <AgentMenu />
          </div>
        </div>

      </div>
    </div >
  );
}

export default AgentNavBar;

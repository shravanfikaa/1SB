import Image from "next/image";
import sb_logo from "../product_logos/1sb_logo.png";
import { useState, useEffect } from "react";
import appConfig from "../../app.config";
import { PostApiHandler } from "../api/apihandler";
import { imageURL, LOGIN_LOGOUT } from "../../constants";
import { useTranslation } from "react-i18next";
import { handleEventLogger,isMobile } from "../../lib/util";

function Logout() {
  const [distributerLogo, setDistributerLogo] = useState("");
  const { t: translate } = useTranslation();
  useEffect(() => {
    (imageURL.profilePicURL && appConfig?.distributorId) && setDistributerLogo(imageURL.profilePicURL +
      appConfig?.distributorId?.toLowerCase() +
      ".png");

    const timer = setTimeout(() => {
      if (appConfig?.redirectionURL) {
        sessionStorage.clear();
        const redirectionURL = appConfig.redirectionURL;
        window.location.href = redirectionURL;
      } else {
        const authorizationToken = sessionStorage.getItem("authorizationToken");
        if (authorizationToken) {
          let lastPart;
          const logoutURL = appConfig?.deploy?.baseUrl + appConfig?.deploy?.logout;
          const CurruntPage = sessionStorage.getItem("CurruntPage");
          const curruntRoute = sessionStorage.getItem("route")
          if(curruntRoute === "/")
          {
            lastPart = "/";
          }
          else{
            const path = curruntRoute ? curruntRoute : "/";
            const parts = path.split('/');
            lastPart = parts[parts.length - 1].trim();
          }
         
          const routList = ["product_list","compare_plan_view","fd_detail","faqs","profile","fd","disclaimer","terms","privacy","/"]
          const PageList ={
            product_list: "product_list",
            compare_plan_view: "compare_plan_view",
            fd_detail: "fd_detail",
            faqs: "faqs",
            profile: "My_profile",
            fd: "My_fd",
            disclaimer: "disclaimer",
            terms: "terms",
            privacy: "privacy",
            "/": "dashboard"
          }
         const curruntPage1 = routList.includes(lastPart) ? PageList[lastPart] : CurruntPage;
         PostApiHandler(logoutURL, "post").then((response) => {
            sessionStorage.removeItem("authorizationToken");
            sessionStorage.clear();
            handleEventLogger("dashboard", "buttonClick","Signout" , {
                  action:"Signout",
                  Initiation_Page:curruntPage1,
                  Platform:isMobile()
                });
            window.location.href = "/"
          });
        }
        else {
          window.location.href = "/"
        }
      }
    }, 1);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="text-font ">
      <div className="w-full h-screen bg-background-primary">
        <div>
          <ul className=" flex flex-row p-3">
            <li>
              <Image src={distributerLogo ? distributerLogo : sb_logo} width={147} height={35} />
            </li>
          </ul>
        </div>
        <div className="flex justify-center py-2">
          <div className="flex justify-center box-content p-4 border-4 bg-gray-100">
            {translate(LOGIN_LOGOUT.youSuccessfullyLogOut)}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Logout;

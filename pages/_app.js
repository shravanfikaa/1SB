import "../styles/globals.css";
import "../styles/compare_page.css"
import { useEffect, useState } from "react";
import { BiPhoneCall, BiSupport } from "react-icons/bi";
import { AiOutlineMail } from "react-icons/ai";
import { LocalStorageHandler } from "../lib/storage_handler";
import { getUserType, handleEventLogger,isMobile } from "../lib/util";
import { GetApiHandler, PostApiHandler, refreshToken } from "./api/apihandler";
import { GoogleTagManager } from "@next/third-parties/google";
import appConfig, { refreshTokenTimeLowerBound, refreshTokenTimeUpperBound } from "../app.config";
import { useRouter } from "next/router";
import { appWithTranslation, useTranslation } from 'next-i18next';
// i18n is initialized
import '../i18n';
import { featureFlagApi } from "../lib/application_setup";
import ErrorModal from "./common/errorPopup";
import FooterMain from "./footer/FooterMain";
import { PARENT_DETAILS_PAYMENT } from "../constants";

function MyApp({ Component, pageProps }) {
  const [distributorSupportEmail, setDistributorSupportEmail] = useState("");
  const [distributerSupportContact, setDistributerSupportContact] = useState("");
  const [displaySupport, setDisplaySupport] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [apiErrorMessage, setApiErrorMessage] = useState("");

  const router = useRouter();
  const role = getUserType();
  const { gtmId, distributorId } = appConfig;
  const { t: translate } = useTranslation();
  const getFeatureFlagData = async () => {
    const featureFlag = await featureFlagApi();
  };

  const getRefreshToken = async () => {
    refreshToken();
  };

  const toggleModal = () => setShowModal((state) => !state);

  const resetTokenRefreshTimer = () => {
    const tokenGenerationTime = sessionStorage.getItem("tokenGenerationTime") ?
      sessionStorage.getItem("tokenGenerationTime") : Date.now();
    const refreshToken = sessionStorage.getItem("refreshToken");

    if (refreshToken && tokenGenerationTime) {
      const currentTime = Date.now();
      const timeDifference = currentTime - parseInt(tokenGenerationTime);
      if (timeDifference >= refreshTokenTimeLowerBound && timeDifference <= refreshTokenTimeUpperBound) {
        sessionStorage.setItem("tokenGenerationTime", Date.now());
        getRefreshToken();
      }
    }
  };

  const fetchTokenWithSessionID = (sessionId) => {
    const tokenURL =
      appConfig?.deploy?.baseUrl + appConfig?.deploy?.userToken;
    const method = "Post";

    sessionStorage.setItem("FM_sessionId", sessionId);
    PostApiHandler(tokenURL, method, {
      sessionId: sessionId,
    })
      .then((res) => {
        if (res.data) {
          const { data, errors } = res.data;
          if (Object.keys(data).length) {
            const { accessToken, refreshToken, userInfo, payload } = data;
            const { email_id, user_type, id } = userInfo;
            accessToken &&
              sessionStorage.setItem("authorizationToken", accessToken);
            if (user_type === "Agent") {
              sessionStorage.setItem("agentEmail", email_id);
              sessionStorage.setItem("agentId", id);
              sessionStorage.setItem("agent_data", JSON.stringify({
                accessToken,
                agentInfo: userInfo
              }))
            } else {
              sessionStorage.setItem(
                "isAlreadyLoggedIn",
                JSON.stringify({ isAlreadyLoggedIn: true })
              );
              sessionStorage.setItem("isLoggedIn", JSON.stringify({ loggedIn: true }));

              refreshToken &&
                sessionStorage.setItem("refreshToken", refreshToken);
              sessionStorage.setItem("tokenGenerationTime", Date.now());
              userInfo &&
                sessionStorage.setItem("userInfo", JSON.stringify({
                  pan_number: userInfo.pan_number,
                  date_of_birth: userInfo.date_of_birth,
                })
                );
              payload && sessionStorage.setItem(
                "familyDetails",
                JSON.stringify({
                  payload: payload,
                  userInfo: userInfo,
                })
              );
              if (window.location.pathname.includes("/agent/customers_list")) {
                router.push("/agent/customers_list");
              }
            }
          } else if (errors.length) {
            setShowModal(true);
            setApiErrorMessage(errors[0].errorMessage)
          }
          sessionStorage.setItem("fetchingToken", false);
        }
      })
      .finally(() => { });
  };

  const fetchTokenWithAgentId = (agentId, asPath) => {
    const { baseUrl, instantLogin } = appConfig?.deploy;
    const tokenURL = baseUrl + instantLogin + asPath.replace("/", "");
    localStorage.removeItem("FD_JOURNEY_DATA");
    localStorage.removeItem("FD_JOURNEY_ID");

    GetApiHandler(tokenURL, "Get")
      .then((res) => {
        if (res.data) {
          const { data, errors } = res.data;
          if (Object.keys(data).length) {
            const { accessToken, refreshToken, agentInfo } = data;
            sessionStorage.setItem(
              "isAlreadyLoggedIn",
              JSON.stringify({ isAlreadyLoggedIn: true })
            );
            sessionStorage.setItem("agentId", JSON.stringify(agentId));
            sessionStorage.setItem("isLoggedIn", JSON.stringify({ loggedIn: true }));
            accessToken &&
              sessionStorage.setItem("authorizationToken", accessToken);
            refreshToken &&
              sessionStorage.setItem("refreshToken", refreshToken);
            sessionStorage.setItem("tokenGenerationTime", Date.now());

            if (agentInfo?.email_id) {
              sessionStorage.setItem("agentEmail", agentInfo.email_id);
            }
            router.push("/agent/customers");
          } else if (errors.length) {
            setShowModal(true);
            setApiErrorMessage(errors[0].errorMessage)
          }
        }
      })
      .finally(() => { });
  };

  useEffect(() => {
    const { query, asPath } = router;
    const FM_sessionId = sessionStorage.getItem("FM_sessionId") || "";
    if (Object.keys(query).includes("deviceSessionId")) {
      sessionStorage.setItem("deviceSessionId", query.deviceSessionId)
    }
    if (Object.keys(query).includes("sessionId")) {
      if (!sessionStorage.getItem("featureFlag")) {
        getFeatureFlagData();
      }
      if (asPath.includes("/agent/customers?sessionId")) {
        sessionStorage.setItem("fetchingToken", true);
        fetchTokenWithSessionID(query.sessionId);
      } else if (FM_sessionId !== query.sessionId) {
        fetchTokenWithSessionID(query.sessionId);
      }
    }
    if (Object.keys(query).includes("agentId")) {
      if (!sessionStorage.getItem("featureFlag")) {
        getFeatureFlagData();
      }
      fetchTokenWithAgentId(query.agentId, asPath);
    }
    if (Object.keys(query).includes("familyHeadPassword")) {
      sessionStorage.setItem("familyHeadPassword", query.familyHeadPassword);
    }
  }, [router]);

  useEffect(() => {
    const distributerProperties = JSON.parse(new LocalStorageHandler().getLocalStorageItem("properties"));
    if (distributerProperties) {
      const { contactEmailId, contactNumber } = distributerProperties;
      !distributerSupportContact && setDistributerSupportContact(contactNumber);
      !distributorSupportEmail && setDistributorSupportEmail(contactEmailId);
    }
  })

  useEffect(() => {
    if (appConfig) {
      sessionStorage.setItem("distributorName", JSON.stringify(appConfig.distributorName))
      const { disableRightClick } = appConfig;
      if (disableRightClick === "true") {
        const handleContextMenu = (event) => {
          event.preventDefault();
        };

        document.addEventListener('contextmenu', handleContextMenu);
        return () => {
          document.removeEventListener('contextmenu', handleContextMenu);
        };
      }
    }
  }, []);

  useEffect(() => {
    if (role?.toLowerCase() !== "familyhead") {
      resetTokenRefreshTimer();
      // Add event listeners to reset the timer on user interaction
      window.addEventListener('mousemove', resetTokenRefreshTimer);
      window.addEventListener('keydown', resetTokenRefreshTimer);
      return () => {
        // Clean up event listeners when the component unmounts
        window.removeEventListener('mousemove', resetTokenRefreshTimer);
        window.removeEventListener('keydown', resetTokenRefreshTimer);
      };
    }
  }, []);

  const logUserActivity = (action) => {
    handleEventLogger("dashboard", "buttonClick", "Home_Click", {
      action: "Help",
      Type: action,
      Platform:isMobile()
    });
  }

  const handleEmailClick = () => {
    logUserActivity("Email");
    const mailtoLink = `mailto:${distributorSupportEmail}`;
    window.location.href = mailtoLink;
  };

  const handleDialClick = (contact) => {
    logUserActivity("Call");
    const telLink = `tel:${contact}`;
    window.location.href = telLink;
  }

  function openNav() {
    if (typeof window === "object") {
      // code is running in a browser environment
      document.getElementById("mySidenavDraft").style.width = "272px";

    } else {
      // code is running in a non-browser environment
    }
  }

  function closeNav() {
    if (typeof window === "object") {
      // code is running in a browser environment'
      document.getElementById("mySidenavDraft").style.width = "0px";

    } else {
      // code is running in a non-browser environment
    }
  }

  return (
    <div >
      {
        gtmId ? <GoogleTagManager gtmId={`GTM-${gtmId}`} /> : null
      }
      <div className={`min-h-[50pc] page-background`}>
        <Component {...pageProps} />
      </div>
      <div className={`flex justify-end bottom-6 sm:!right-6 fixed bg-none items-center gap-1.5 sm:!w-fit rounded-full p-2 ${displaySupport ? 'bg-primary-green right-0 w-full shadow-md' : 'right-6'} sm:!bg-transparent text-[0.6875rem] sm:text-2xl sm:shadow-none`} >
        {role.toLowerCase() === "user" && <>
          <div className={`w-10 h-10 flex justify-center items-center cursor-pointer rounded-full py-2 shadow-md sm:p-2 bg-white border-primary-green text-white ${displaySupport ? 'pr-0' : 'pr-2'}`}
            onClick={() => setDisplaySupport(!displaySupport)}
            touchstart={() => setDisplaySupport(!displaySupport)}
          >
            <span className={`inline-block scale-[2.2] sm:!scale-100`}><BiSupport className="supportIcon fill-primary-green" /></span>
          </div>
          {displaySupport &&
            <div className={`flex justify-between items-center gap-1 min-[380px]:gap-3 py-2 px-3 max-[380px]:pl-0 sm:!p-3 text-white rounded-full bg-primary-green text-regular customer-care ${displaySupport ? '' : 'py-3'} `} >
              <div className="mx-auto">{translate(PARENT_DETAILS_PAYMENT.support)}</div>
              <div className="flex justify-between items-center gap-3 flex-wrap">
                <div className="flex gap-2 items-center">
                  <BiPhoneCall />
                  <div className="flex flex-col items-center">
                    {
                      distributerSupportContact.split("/").map((contact) => {
                        return <button onClick={() => handleDialClick(contact)}>{contact}</button>
                      })
                    }
                  </div>
                </div>
                <div className="flex gap-2 items-center">
                  <AiOutlineMail />
                  <div className="flex flex-col items-center">
                    {
                      distributorSupportEmail.split("/").map((email) => {
                        return <button className="w-full max-w-[140px] xs:max-w-[170px] min-[539px]:max-w-none break-words text-left" onClick={() => handleEmailClick(email)}>{email}</button>
                      })
                    }
                  </div>
                  {/* <button className="break-all" onClick={handleEmailClick}>{distributorSupportEmail}</button> */}
                </div>
              </div>
            </div>
          }
        </>}
      </div>
      {/* <div className={`flex justify-end bottom-20 sm:!right-6 fixed bg-none items-center gap-1.5 sm:!w-fit ${displaySupport ? 'bg-primary-green right-0 w-full shadow-md' : 'right-6'} sm:!bg-transparent text-[0.6875rem] sm:text-2xl sm:shadow-none`}>
        {<>
          <div className={`w-10 h-10 flex justify-center items-center cursor-pointer rounded-full py-2 pl-2 sm:p-2 bg-primary-green text-white ${displaySupport ? 'pr-0' : 'pr-2'}`}
          // onClick={openNav}
          >
            <span className={`inline-block scale-[2.2] sm:!scale-100`}><RiDraftLine /></span>
          </div>
        </>}
      </div > */}
      {/* {
        displayDraft ? <div id="mySidenavDraft" className="sidenav z-50 shadow-md w-[350px]">
          <div className="flex flex-row-reverse">
            <a onClick={closeNav}><GrFormClose /></a>
          </div>
          <div className="flex justify-between flex-col ml-5 text-regular"><div>{translate(PARENT_DETAILS_PAYMENT.draftJourneys)}</div>
            <div className="flex justify-between gap-x-0.5 items-center mr-3">
              <DraftDetails />
            </div>
          </div>
        </div> : null
      } */}
      <ErrorModal
        canShow={showModal}
        updateModalState={toggleModal}
        errorMessage={apiErrorMessage}
      />
      {
        distributorId?.toLowerCase() === "onesb" ? <FooterMain /> : null
      }
    </div >
  );
}

export default appWithTranslation(MyApp);

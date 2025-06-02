import React, { useEffect, useState } from "react";
import Image from "next/image";
import sb_logo from "../product_logos/1sb_logo.png";
import Link from "next/link";
import Login from "../login/hdfc_login";
import LoginMenu from "./login_menu";
import { featureFlagApi } from "../../lib/application_setup";
import appConfig from "../../app.config";
import { getRedirectionURL, getUserRole, handleEventLogger,isMobile } from "../../lib/util";
import { AiTwotoneHome } from "react-icons/ai";
import { useRouter } from "next/router";
import { COMMON_CONSTANTS, imageURL, LOGIN_LOGOUT, } from "../../constants";
import LanguageChange from './../../_components/LanguageChange';
import { useTranslation } from "react-i18next";
import { FaQuestion } from "react-icons/fa";

function NavBar({ shouldShowLogin, getLoginStatus }) {
  const [showModal, setShowModal] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState();
  const [signInViaPAN, setSignInViaPAN] = useState(false);
  const [distributerLogo, setDistributerLogo] = useState("");
  const { distributorId } = appConfig;

  // const [distributerId, setDistributerId] = useState();
  const role = getUserRole();

  const router = useRouter();
  const { t: translate } = useTranslation();
  let interval = ""

  const getModalStatus = (status, show) => {
    setShowModal(show);
    if (status === "verified") {
      clearInterval(interval);
      setIsLoggedIn(true);
      sessionStorage.setItem("isLoggedIn", JSON.stringify({ loggedIn: true }));
      sessionStorage.setItem("isAlreadyLoggedIn", JSON.stringify({ isAlreadyLoggedIn: true }));
      typeof (getLoginStatus) === "function" && getLoginStatus(true);
    }
  }

  const handleLoginBtnClick = () => {
    handleEventLogger("dashboard", "buttonClick","Login_Click" , {
      action:"Login_Initiate",
      Initiation_Page:"Post_Declaration",
      Screen_Name: "Login page",
      Platform:isMobile()
    });
    setShowModal(true);
  }

  const handleHomeBtnClick = () => {
    handleEventLogger("dashboard", "buttonClick", "Home_Click", {
      action: "Reset_All",
      Platform:isMobile()
    });
    router.push("/product/product_list");
  }

  useEffect(() => {
    if (typeof window !== "undefined") {
      const userLoggedInDetails = JSON.parse(sessionStorage.getItem("isLoggedIn"));
      if (userLoggedInDetails?.loggedIn !== isLoggedIn) {
        userLoggedInDetails && setIsLoggedIn(userLoggedInDetails.loggedIn);
      }
    }
  })

  const getFeatureFlagData = async () => {
    const featureFlag = await featureFlagApi();
    if (featureFlag?.signInViaPAN) {
      setSignInViaPAN(featureFlag.signInViaPAN);
    }
  }

  useEffect(() => {
    getFeatureFlagData();
    // sessionStorage.getItem("properties") ?
    // JSON.parse(sessionStorage.getItem("properties")) : "";
    // const logoPathFromSDK = sessionStorage.getItem("distributerLogoPath");
    // if (logoPathFromSDK) {
    //   setDistributerLogo(logoPathFromSDK);
    // } else {
    //   setDistributerLogo(distributerProperties);
    // }
    setDistributerLogo(imageURL.imageBaseUrl +
      appConfig?.distributorId?.toLowerCase() +
      ".png");
    !sessionStorage.getItem("isAlreadyLoggedIn") && sessionStorage.setItem("isAlreadyLoggedIn", JSON.stringify({ isAlreadyLoggedIn: false }));
    // const distributorName = sessionStorage.getItem("distributorName");
    // distributorName && setDistributerId(appConfig.distributorName.toLowerCase())
    // distributorName && setDistributerId(appConfig.distributorName.toLowerCase())
  }, []);

  const testInterval = () => {
    const isOnboardingUser = window.location.href.includes("onboarding") || window.location.href.includes("make_payment");
    const timeOut = isOnboardingUser ? 0 : 5000;
    interval = setInterval(() => {
      const isAlreadyLoggedInOnce = sessionStorage.getItem("isAlreadyLoggedIn") && JSON.parse(sessionStorage.getItem("isAlreadyLoggedIn"));
      const token = sessionStorage.getItem("authorizationToken");
      if (token === null && !showModal && isAlreadyLoggedInOnce?.isAlreadyLoggedIn) {
        const redirectionURL = getRedirectionURL();
        if (role?.toLowerCase() !== "familyhead" && isOnboardingUser && redirectionURL) {
          window.location.href = redirectionURL;
        } else {
          setShowModal(true);
        }
      } else if (token === null && !showModal && isOnboardingUser && !isAlreadyLoggedInOnce?.isAlreadyLoggedIn) {
        setShowModal(true);
      }
    }, timeOut);
  }

  const handleRedirection = () => {
    const redirectionURL = getRedirectionURL();
    if (redirectionURL) {
      sessionStorage.clear();
      window.location.href = redirectionURL;
    }
  }

  useEffect(() => {
    testInterval();
  });

  return (
    <>
      <div as="nav" className="bg-white border-b-2 border-gray-100">
        <div className="view-container view_container_sm">
          <div className="flex items-center justify-between">
            <div>
              {
                role?.toLowerCase() === "familyhead" ?
                  <div className="hover:cursor-pointer  w-auto"
                    onClick={() => handleRedirection()}
                  >
                    <Image
                      src={distributerLogo}
                      alt="Product logo"
                      width={100}
                      height={50}
                    />
                  </div>
                  : <div className="flex gap-2" onClick={handleHomeBtnClick}>
                    <div className="hover:cursor-pointer w-auto">
                      <Image
                        src={distributerLogo}
                        alt="Product logo"
                        width={100}
                        height={50}
                      />
                    </div>
                  </div>
              }
            </div>
            {
              !shouldShowLogin ? <div className="text-regular flex items-center gap-3">
                <div className="flex gap-2">
                  <Link href="/faqs">
                    <div className="text-black text-2xl flex items-center gap-2">
                    <FaQuestion className='text-fd-primary cursor-pointer' />
                      <div className="text-black cursor-pointer hidden sm:block">{translate(COMMON_CONSTANTS.faqs)}</div>
                    </div>
                  </Link>
                </div >
                <div  className={`flex gap-2 ${distributorId?.toLowerCase() === 'northarc' ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`} onClick={handleHomeBtnClick}>
                  <div className="text-black text-2xl flex items-center gap-2">
                    <AiTwotoneHome className='text-fd-primary cursor-pointer' />
                    <div className="text-black cursor-pointer hidden sm:block">{translate(LOGIN_LOGOUT.home)}</div>
                  </div>
                </div>
                {/* <div className="flex gap-2">
                    <Link href="/product/product_list">
                      <div className="text-medium text-2xl flex items-center gap-2">
                        <AiTwotoneHome className='text-fd-primary cursor-pointer' />
                      </div>
                    </Link> */}
                {/* </div> */}
                {appConfig?.deploy?.multiLanSupport[appConfig?.distributorId.toLowerCase()] ? <LanguageChange /> : ""}
                {role?.toLowerCase() === "familyhead" ? <LoginMenu /> : <>
                  {
                    signInViaPAN ?
                      isLoggedIn ?
                        <LoginMenu /> :
                        <button
                          className="p-2 shadow-lg rounded-3xl border-fd-primary border text-black w-[100px] hover:text-gray focus:outline-none"
                          onClick={handleLoginBtnClick}
                        >
                          {translate(LOGIN_LOGOUT.login)}
                        </button>
                      : <LoginMenu />
                  }
                </>}
              </div> : null
            }
          </div >
        </div >
        {
          showModal && <Login
            panDetails={{}}
            getModalStatus={getModalStatus}
          />
        }
      </div >
     
    </>
  );
}

export default NavBar;

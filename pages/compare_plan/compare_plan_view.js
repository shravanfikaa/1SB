import { HiOutlineArrowSmLeft } from "react-icons/hi";
import { GetApiHandler, PostApiHandler } from "../api/apihandler";
import appConfig from "../../app.config";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { displayINRAmount, convertToTenor, getUserType, handleEventLogger,isMobile } from "../../lib/util"
import PayoutPopup from "./payoutPopup";
import Loader from "../../svg/Loader";
import NavBarMain from "../navbar/NavBarMain";
import { COMMON_CONSTANTS, FD_RENEWAL } from "../../constants";
import { useTranslation } from "react-i18next";

let eachFDResponse = [];
function Compare() {
  eachFDResponse = [];
  const router = useRouter();
  const [data, setData] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [userType, setUserType] = useState("");
  const { t: translate } = useTranslation();
  let urlData = router?.query;
  let productIDsArray = []
  let productDataArr = []
  let prematurePenalty = []

  let obj = urlData?.queryData ? JSON.parse(urlData?.queryData) : {};
  for (let queryData = 0; queryData < obj.length; queryData++) {
    productIDsArray.push(obj[queryData]["productId"])
    prematurePenalty.push(obj[queryData]["prematurePenaltyYield"])
  }

  var productIDUrlQuery = productIDsArray.map(function (selectedFdID) {
    productDataArr.push(selectedFdID)
    return 'product_id=' + selectedFdID;
  }).join('&');

  useEffect(() => {
    if (data.length) {
      let compareFDName = "";
      data.forEach(val => compareFDName = compareFDName ? compareFDName + " | " + val.fdName : compareFDName + val.fdName)
      handleEventLogger("dashboard", "buttonClick", "Home_Click", {
        action:"Compare_Click",
         FD_Name :compareFDName,
         Platform:isMobile() 
      });
    }
  }, [data]);

  useEffect(() => {
    var compareurl =
      appConfig?.deploy?.baseUrl +
      appConfig?.deploy?.getComparePlans +
      "?" + productIDUrlQuery
    var method = "GET";
    GetApiHandler(compareurl, method)
      .then((response) => {
        for (let eachProductID in productDataArr) {

          setIsLoading(true)
          eachFDResponse.push(response.data.data[productDataArr[eachProductID]]);
          setData(eachFDResponse);
        }
        setIsLoading(false)
      })
      .catch((err) => {
        console.log("Error:", err)
      });
    const userType = getUserType();
    setUserType(userType);
  }, [])

  function setProductProperties(product_id, manufacture_id, product_name, product_logo_url) {
    sessionStorage.setItem("selectedProductId", product_id)
    sessionStorage.setItem("selectedManufactureId", manufacture_id)

    sessionStorage.setItem("selectedProductName", product_name)
    sessionStorage.setItem("selectedProductLogoURL", product_logo_url)
  }

  const [showModal, setShowModal] = useState({ show: false, id: "" });
  const toggleModal = (state) => {
    setShowModal(state);
  }

  const handleInvestBtnClick = (api) => {
    if (api.fdType.length >= 2) {
      toggleModal({ show: true, id: api.fdId })
    } else {
      if (typeof window !== 'undefined') {
        handleEventLogger("dashboard", "buttonClick","Invest_Click" , {
          action:"Invest_Initiate",
          Screen_Name: "Compare page",
          FD_Name:api.fdName,
          Type:api?.fdType[0],
          Platform:isMobile()
        });
        sessionStorage.setItem('selectedProductType', api?.fdType[0])
        router.push({ pathname: "/detail_fd/fd_detail", query: { 'productId': api?.fdId, 'productType': api?.fdType[0], 'manufacturerId': api?.manufacturerId, 'screenType': urlData?.screenType ? urlData.screenType : "" } });
      }
    }
  }

  //Added Tenure Function for Traslation 
  function convertToTenor(tenor_val) {
    if (tenor_val > 0 && tenor_val < 30) {
      return Math.round(tenor_val) + " " + translate(COMMON_CONSTANTS.days);
    } else if (tenor_val >= 360) {
      return (
        Math.round(tenor_val / 360) +

        (Math.round(tenor_val / 360) > 1 ? " " + translate(COMMON_CONSTANTS.years) : " " + translate(COMMON_CONSTANTS.year))
      );
    } else if (tenor_val > 29) {
      return (
        Math.round(tenor_val / 30) +
        (Math.round(tenor_val / 30) > 1 ? " " + translate(FD_RENEWAL.months) : "")
      );
    }
    return Math.round(tenor_val);
  }

  return (
    <div>
      <NavBarMain />
      <div className="align-middle flex justify-between compare-back">
        <div className="items-center">
          <div className="text-thicccboi-extra-bold text-black text-6xl">{translate(COMMON_CONSTANTS.comparePlans)}</div>
        </div>
        <div className="flex items-center  text-medium text-2xl">
          <HiOutlineArrowSmLeft className="text-fd-primary" />
          <Link href={`${userType === "user" || urlData?.screenType === "dashboard" ? "/product/product_list" : "/agent/fd_products"}`}>
            <div className="hover:cursor-pointer text-fd-primary">{translate(COMMON_CONSTANTS.backToList)}</div>
          </Link>
        </div>
      </div>
      <div className="bg-slate-100">
        {!data.length ? <div className="flex flex-row justify-around bg-white"><Loader /></div>
          : <div className="py-5 border-b border-slate-100 bg-slate-100 margin-left-right">

            <table className="desktop-view rounded text-medium text-2xl">
              <tbody className="bg-slate-100">
                <tr className="">
                  <th className="w-2/12 text-black"></th>
                  <th className="w-max shadow-md text-black"></th>
                </tr>
              </tbody>
              <tbody className="bg-white">
                <tr>
                  <td id="sideBar" className="mx-3 sidebar-section py-2"></td>
                  <td id="contentArea" className="main-compare-card">{data.map((api) => {
                    return (
                      <div className="w-1/3 text-black flex justify-center item-center">
                        <Image
                          src={api["logoUrl"]}
                          alt="1Silverbullet"
                          width={100}
                          height={70}
                          objectFit={"contain"}
                        />
                      </div>
                    );
                  })}</td>
                </tr>
                <tr>
                  <td id="sideBar" className="sidebar-section py-2"></td>
                  <td id="contentArea" className="main-compare-card">{data.map((api) => {
                    return (
                      <div className="w-1/3 text-black text-medium text-4xl">{api["fdName"]}</div>
                    );
                  })}</td>
                </tr>
                {
                  urlData?.screenType === "dashboard" || userType === "user" ? <tr className="">
                    <td id="sideBar" className="text-bold text-4xl sidebar-section py-2 text-black">{translate(COMMON_CONSTANTS.overview)}</td>
                    <td id="contentArea" className="main-compare-card">
                      {data.map((api) => {
                        return (
                          <div className="w-1/3 text-black flex justify-center items-center"><button
                            type="button"
                            onClick={() => handleInvestBtnClick(api)}
                            onMouseOver={(e) => setProductProperties(api["fdId"], api["manufacturerId"], api["fdName"], api["logoUrl"])}
                            className="button-active btn-gradient button-transition hover:bg-hover-primary text-medium text-xl lg:text-2xl w-fit   text-medium text-xl lg:text-2xl w-fit  hover:button-shadow">
                            {translate(COMMON_CONSTANTS.invest)}
                          </button>
                            {showModal.show && api.fdId === showModal.id ? <PayoutPopup
                              updateModalState={toggleModal}
                              screenType={urlData?.screenType ? urlData.screenType : ""}
                              data={api}
                            /> : null}
                          </div>
                        );
                      })}
                    </td>
                  </tr> : null
                }
                <tr>
                  <td id="sideBar" className="border-b sidebar-section py-2 text-black text-black">{translate(COMMON_CONSTANTS.tenor)}</td>
                  <td id="contentArea" className="main-compare-card text-black">
                    {data.map((api) => {
                      return (
                        <div className="w-1/3 text-black">
                          {api.hasOwnProperty(["minTenure"]) ? convertToTenor(api["minTenure"]) : ""} -
                          {api.hasOwnProperty(["maxTenure"]) ? convertToTenor(api["maxTenure"]) : ""}
                        </div>
                      );
                    })}</td>
                </tr>
                <tr>
                  <td id="sideBar" className="border-b sidebar-section py-2 text-black text-black">{translate(COMMON_CONSTANTS.highestShortTermInterestRateUpto1Year)}</td>
                  <td id="contentArea" className="main-compare-card">
                    {data.map((api) => {
                      return (
                        <div className="w-1/3 text-black">
                          {api?.interestRate?.int1Year ? api?.interestRate?.int1Year + "%" : "NA"}
                        </div>
                      );
                    })}</td>
                </tr>
                <tr>
                  <td id="sideBar" className="border-b sidebar-section py-2 text-black">{translate(COMMON_CONSTANTS.highestMidTermInterestRate1YearTo3Year)}</td>
                  <td id="contentArea" className="main-compare-card">
                    {data.map((api) => {
                      return (
                        <div className="w-1/3 text-black text-black">
                          {api?.interestRate?.int1to3Year ? api?.interestRate?.int1to3Year + "%" : "NA"}
                        </div>
                      );
                    })}</td>
                </tr>
                <tr>
                  <td id="sideBar" className="border-b sidebar-section py-2 text-black">{translate(COMMON_CONSTANTS.highestLongTermInterestRate3YearMore)}</td>
                  <td id="contentArea" className="main-compare-card">
                    {data.map((api) => {
                      return (
                        <div className="w-1/3 text-black">
                          {api?.interestRate?.int3Year ? api?.interestRate?.int3Year + "%" : "NA"}
                        </div>
                      );
                    })}</td>
                </tr>
                <tr>
                  <td id="sideBar" className="border-b sidebar-section py-2 text-black">{translate(COMMON_CONSTANTS.interestRate)}</td>
                  <td id="contentArea" className="main-compare-card">
                    {data.map((api) => {
                      return (
                        <div className="w-1/3 text-black">
                          {api["yield"][0]}% - {api["yield"][1]}%
                        </div>
                      );
                    })}</td>
                </tr>
                <tr>
                  <td id="sideBar" className="border-b sidebar-section py-2 text-black">{translate(COMMON_CONSTANTS.seniorCitizenBenefit)}</td>
                  <td id="contentArea" className="main-compare-card">
                    {data.map((api) => {
                      return (
                        <div className="w-1/3 text-black">
                          {api?.interestRate?.srCitizenBenefit ? api?.interestRate?.srCitizenBenefit + "%" : "NA"}
                        </div>
                      );
                    })}</td>
                </tr>
                <tr className="">
                  <td id="sideBar" className="border-b sidebar-section py-2 text-black">{translate(COMMON_CONSTANTS.payoutFrequency)}</td>
                  <td id="contentArea" className="main-compare-card">
                    {data.map((api) => {
                      return (
                        <div className="w-1/3 text-black">
                          {api?.fdPayoutMethod && api.fdPayoutMethod.join(", ")}
                        </div>
                      );
                    })}</td>
                </tr>
                <tr>
                  <td id="sideBar" className="border-b sidebar-section py-2 text-black">{translate(COMMON_CONSTANTS.creditRating)}</td>
                  <td id="contentArea" className="main-compare-card">{data.map((api) => {
                    return (
                      <div className="w-1/3 text-black">
                        {api["ratings"][0]["rating_agency"]} {api["ratings"][0]["rating"]}</div>
                    );
                  })}</td>
                </tr>
                <tr>
                  <td id="sideBar" className="border-b sidebar-section py-2 text-black pr-3">{translate(COMMON_CONSTANTS.minMaxInvestableAmount)}</td>
                  <td id="contentArea" className="main-compare-card">{data.map((api) => {
                    return (
                      <div className="w-1/3 text-black">
                        {displayINRAmount(api["fdMinAmount"])} - {api["fdMaxAmount"] ? displayINRAmount(api["fdMaxAmount"]) : "No higher limit"}</div>
                    );
                  })}</td>
                </tr>
                <tr>
                  <td id="sideBar" className="border-b sidebar-section py-2 text-black"> {translate(COMMON_CONSTANTS.prematureWithdrawal)}</td>
                  <td id="contentArea" className="main-compare-card">{data.map((api) => {
                    return (
                      <div className="w-1/3 text-black">
                        {translate(COMMON_CONSTANTS.allowedWithPenalInterestOf)} <br />
                        {
                          api["prematurePenaltyYield"][0] === api["prematurePenaltyYield"][1] ? `${api["prematurePenaltyYield"][0]}%` :
                            `${api["prematurePenaltyYield"][0]} % - ${api["prematurePenaltyYield"][1]} %`
                        }
                      </div>
                    );
                  })}</td>
                </tr>
                <tr>
                  <td id="sideBar" className="border-b sidebar-section py-2 text-black">{translate(COMMON_CONSTANTS.videoKycRequired)}</td>
                  <td id="contentArea" className="main-compare-card">
                    {data.map((api) => {
                      return (
                        <div className="w-1/3 text-black">
                          {api?.additionalDetails?.videoKycReqd === "Y" ? translate(FD_RENEWAL.yes) : translate(FD_RENEWAL.no)}
                        </div>
                      );
                    })}</td>
                </tr>
                <tr>
                  <td id="sideBar" className="border-b sidebar-section py-2 text-black">{translate(COMMON_CONSTANTS.savingsAccountRequired)}</td>
                  <td id="contentArea" className="main-compare-card">
                    {data.map((api) => {
                      return (
                        <div className="w-1/3 text-black">
                          {api?.additionalDetails?.savingsAcReqd === "Y" ? translate(FD_RENEWAL.yes) : translate(FD_RENEWAL.no)}
                        </div>
                      );
                    })}</td>
                </tr>
                <tr>
                  <td id="sideBar" className="border-b shadow-xs sidebar-section py-2 text-black">{translate(COMMON_CONSTANTS.instantBookingAvailable)}</td>
                  <td id="contentArea" className="shadow-md main-compare-card">
                    {data.map((api) => {
                      return (
                        <div className="w-1/3 text-black">
                          {api?.additionalDetails?.videoKycReqd === "N" ? translate(FD_RENEWAL.yes) : translate(FD_RENEWAL.no)}
                        </div>
                      );
                    })}</td>
                </tr>
              </tbody>
            </table>
            <div className="mobile-view bg-white rounded min-h-screen">
              <div className="flex flex-row justify-around my-2 gap-2 text-center">
                {data.map((api) => {
                  return (
                    <div className="w-1/3 text-black flex flex-col items-center gap-3">
                      <Image
                        src={api["logoUrl"]}
                        alt="1Silverbullet"
                        width={60}
                        height={40}
                        objectFit={"contain"} />
                      <div className="flex items-center font-bold">
                        <span className="break-normal text-xl text-regular">{api["fdName"]} </span>
                      </div>
                      <div className="text-xl flex items-center">
                        <div>
                          <button
                            type="button"
                            onClick={() => toggleModal({ show: true, id: api.fdId })}
                            onMouseOver={(e) => setProductProperties(api["fdId"], api["manufacturerId"], api["fdName"], api["logoUrl"])}
                            className="button-active btn-gradient button-transition hover:bg-hover-primary text-medium text-xl lg:text-2xl w-fit   text-medium text-xl lg:text-2xl w-fit  hover:button-shadow" >
                            {translate(COMMON_CONSTANTS.invest)}
                          </button>
                        </div>
                        {
                          showModal.show && api.fdId === showModal.id ? <PayoutPopup
                            updateModalState={toggleModal}
                            screenType={"dashboard"}
                            data={api}
                          /> : null}
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="bg-slate-100 font-bold border-y-2 text-2xl p-1.5">{translate(COMMON_CONSTANTS.tenor)}</div>
              <div className="flex flex-row justify-around p-1.5 gap-2">
                {data.map((api) => {
                  return (
                    <div className="break-normal py-1 text-left text-medium text-2xl w-1/3 text-black">
                      {api.hasOwnProperty(["minTenure"]) ? convertToTenor(api["minTenure"]) : ""} -
                      {api.hasOwnProperty(["maxTenure"]) ? convertToTenor(api["maxTenure"]) : ""}
                    </div>
                  );
                })}
              </div>
              <div className="bg-slate-100 font-bold border-y-2 text-2xl p-1.5">{translate(COMMON_CONSTANTS.highestShortTermInterestRateUpto1Year)}</div>
              <div className="flex flex-row justify-around p-1.5 gap-2">
                {data.map((api) => {
                  return (
                    <div className="break-normal py-1 text-left text-medium text-2xl w-1/3 text-black">
                      {api?.interestRate?.int1Year ? api?.interestRate?.int1Year + "%" : "NA"}
                    </div>
                  );
                })}
              </div>
              <div className="bg-slate-100 font-bold border-y-2 text-2xl p-1.5">{translate(COMMON_CONSTANTS.highestMidTermInterestRate1YearTo3Year)}</div>
              <div className="flex flex-row justify-around p-1.5 gap-2">
                {data.map((api) => {
                  return (
                    <div className="break-normal py-1 text-left text-medium text-2xl w-1/3 text-black">
                      {api?.interestRate?.int1to3Year ? api?.interestRate?.int1to3Year + "%" : "NA"}
                    </div>
                  );
                })}
              </div>
              <div className="bg-slate-100 font-bold border-y-2 text-2xl p-1.5">{translate(COMMON_CONSTANTS.highestLongTermInterestRate3YearMore)}</div>
              <div className="flex flex-row justify-around p-1.5 gap-2">
                {data.map((api) => {
                  return (
                    <div className="break-normal py-1 text-left text-medium text-2xl w-1/3 text-black">
                      {api?.interestRate?.int3Year ? api?.interestRate?.int3Year + "%" : "NA"}
                    </div>
                  );
                })}
              </div>
              <div className="bg-slate-100 font-bold border-y-2 text-2xl p-1.5">{translate(COMMON_CONSTANTS.interestRate)}</div>
              <div className="flex flex-row justify-around p-1.5 gap-2">
                {data.map((api) => {
                  return (
                    <div className="break-normal py-1 text-left text-medium text-2xl w-1/3 text-black">
                      {api["yield"][0]}% - {api["yield"][1]}%
                    </div>
                  );
                })}
              </div>
              <div className="bg-slate-100 font-bold border-y-2 text-2xl p-1.5">{translate(COMMON_CONSTANTS.seniorCitizenBenefit)}</div>
              <div className="flex flex-row justify-around p-1.5 gap-2">
                {data.map((api) => {
                  return (
                    <div className="break-normal py-1 text-left text-medium text-2xl w-1/3 text-black">
                      {api?.interestRate?.srCitizenBenefit ? api?.interestRate?.srCitizenBenefit + "%" : "NA"}
                    </div>
                  );
                })}
              </div>
              <div className="bg-slate-100 font-bold border-y-2 text-2xl p-1.5">{translate(COMMON_CONSTANTS.payoutFrequency)}</div>
              <div className="flex flex-row justify-around p-1.5 gap-2">
                {data.map((api) => {
                  return (
                    <div className="w-1/3 text-black">
                      {api?.fdPayoutMethod && api.fdPayoutMethod.join(", ")}
                    </div>
                  );
                })}
              </div>
              <div className="bg-slate-100 font-bold border-y-2 text-2xl p-1.5">{translate(COMMON_CONSTANTS.creditRating)}</div>
              <div className="flex flex-row justify-around p-1.5 gap-2">
                {data.map((api) => {
                  return (
                    <div className="break-normal py-1 text-left text-medium text-2xl w-1/3 text-black">
                      {api["ratings"][0]["rating_agency"]} , {api["ratings"][0]["rating"]}
                    </div>
                  );
                })}
              </div>
              <div className="bg-slate-100 font-bold border-y-2 text-2xl p-1.5">{translate(COMMON_CONSTANTS.minMaxInvestableAmount)}</div>
              <div className="flex flex-row justify-around p-1.5 gap-2">
                {data.map((api) => {
                  return (
                    <div className="break-normal py-1 text-left text-medium text-2xl w-1/3 text-black">
                      ₹{displayINRAmount(api["fdMinAmount"])} - ₹{api["fdMaxAmount"] ? displayINRAmount(api["fdMaxAmount"]) : "No higher limit"}
                    </div>
                  );
                })}
              </div>
              <div className="bg-slate-100 font-bold border-y-2 text-2xl p-1.5">{translate(COMMON_CONSTANTS.prematureWithdrawal)}</div>
              <div className="flex flex-row justify-around p-1.5 gap-2">
                {data.map((api) => {
                  return (
                    <div className=" break-normal text-medium text-2xl w-1/3 text-black">
                      {translate(COMMON_CONSTANTS.allowedWithPenalInterestOf)} <br /> {api["prematurePenaltyYield"][0]}% - {api["prematurePenaltyYield"][1]}%
                    </div>
                  );
                })}
              </div>
              <div className="bg-slate-100 font-bold border-y-2 text-2xl p-1.5">{translate(COMMON_CONSTANTS.videoKycRequired)}</div>
              <div className="flex flex-row justify-around p-1.5 gap-2">
                {data.map((api) => {
                  return (
                    <div className=" break-normal text-medium text-2xl w-1/3 text-black">
                      {api?.additionalDetails?.videoKycReqd === "Y" ? translate(FD_RENEWAL.yes) : translate(FD_RENEWAL.no)}
                    </div>
                  );
                })}
              </div>
              <div className="bg-slate-100 font-bold border-y-2 text-2xl p-1.5">{translate(COMMON_CONSTANTS.savingsAccountRequired)}</div>
              <div className="flex flex-row justify-around p-1.5 gap-2">
                {data.map((api) => {
                  return (
                    <div className=" break-normal text-medium text-2xl w-1/3 text-black">
                      {api?.additionalDetails?.savingsAcReqd === "Y" ? translate(FD_RENEWAL.yes) : translate(FD_RENEWAL.no)}
                    </div>
                  );
                })}
              </div>
              <div className="bg-slate-100 font-bold border-y-2 text-2xl p-1.5">{translate(COMMON_CONSTANTS.instantBookingAvailable)}</div>
              <div className="flex flex-row justify-around p-1.5 gap-2">
                {data.map((api) => {
                  return (
                    <div className=" break-normal text-medium text-2xl w-1/3 text-black">
                      {api?.additionalDetails?.videoKycReqd === "N" ? translate(FD_RENEWAL.yes) : translate(FD_RENEWAL.no)}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>}
      </div>
    </div>
  );
}
export default Compare;

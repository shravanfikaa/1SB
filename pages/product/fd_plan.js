import Image from "next/image";
import { IoGitCompareOutline } from "react-icons/io5";

import { useState, createContext, useContext, useEffect } from "react";
import ComparePlan from "./compare_plan";
export const PlanContext = createContext('Default Value');
import product_list_css from "../../styles/product_list.module.css";
import FDVsGoldComparePlan from "./fd_vs_gold_plan";
import { convertToTenor, handleEventLogger, isMobile } from "../../lib/util";
import { useRouter } from "next/router";
import { useTranslation } from "react-i18next";
import { AGENT, COMMON_CONSTANTS, FD_RENEWAL, PAYOUT_FREQUENCY } from "../../constants";
import PayoutPopup from "../../pages/compare_plan/payoutPopup";
import { TfiLayoutGrid3Alt, TfiViewListAlt } from "react-icons/tfi";
import appConfig from "../../app.config";
let array = []
function FDplans({ trailArray, productData, isAPIDataLoaded, screenType }) {

  console.log("trailArray", trailArray)
  const [value, setValue] = useState();
  const [index, setIndex] = useState([]);
  const [gridtoggle, setgridtoggle] = useState(true);
  const [comparedProductLogos, setComparedProductLogos] = useState([]);
  const [selectedManufactureId, setSelectedManufactureId] = useState("");

  const router = useRouter();
  const { t: translate } = useTranslation();

  function getCheckBox(e) {
    if (e.target.checked) {
      if (array.length <= 2) {
        array.push(e.target.value);

      }
    } else {
      for (let i = 0; i < array.length; i++) {
        if (array[i] == e.target.value) {
          array.splice(i, 1);
          break;
        }
      }
    }
    setIndex((current) => [current, e.target.value]);
    array.sort();
  }
  const [isListView, setIsListView] = useState(true);
  const [tooltipPayout, setTooltipPayout] = useState("")
  function displayPayouts() {
    let arr = trailArray;


  }
  function checkboxPersist(arr, id) {
    let StrID = id.toString()
    if (arr.includes(StrID)) {
      return true
    }
    else {
      return false
    }
    setValue(StrID)

  }
  const [showModal, setShowModal] = useState({ show: false, data: "" });
  const toggleModal = (state) => {
    setShowModal(state);
  }
  const handleInvestBtnClick = (api, e) => {
    if (e.target.localName !== "input" && e.target.localName !== "label" && e.target.innerHTML != "Cumulative" && e.target.innerHTML != "Non-Cumulative") {
      if (api.fdType.length >= 2) {
        toggleModal({ show: true, data: api })
      }
      else {
        if (typeof window !== 'undefined') {
          handleEventLogger("dashboard", "buttonClick", "Invest_Click", {
            action: "Invest_Initiate",
            Screen_Name: "Compare page",
            FD_Name: api.fdName,
            Type: api?.fdType[0],
            Platform: isMobile()
          });
          sessionStorage.setItem('selectedProductType', api?.fdType[0])
          router.push({ pathname: "/detail_fd/fd_detail", query: { 'productId': api?.fdId, 'productType': api?.fdType[0], 'manufacturerId': api?.manufacturerId, 'screenType': screenType ? screenType : "" } });
        }
      }
    }

  }

  function remove(id) {
    if (array) {
      for (let i = 0; i < array.length; i++) {
        if (id == array[i]) {
          array.splice(i, 1)
        }
      }
      setIndex((current) => [current, current + 1]);
    }
  }

  let jsonArray = [];
  if (array && productData) {
    for (let prodID = 0; prodID < array.length; prodID++) {
      for (let Api = 0; Api < productData.length; Api++) {
        const jsonBody = {
          productId: "",
          productType: "",
          manufacturerId: "",
          prematurePenaltyYield: ""
        };
        if (array[prodID] == productData[Api]["fdId"]) {
          jsonBody.productId = productData[Api]["fdId"];
          jsonBody.productType = productData[Api]["fdType"];
          jsonBody.manufacturerId = productData[Api]["manufacturerId"];
          jsonBody.prematurePenaltyYield = productData[Api]["prematurePenaltyYield"];
          jsonArray.push(jsonBody);
        }
      }
    }
  }
  let lenFlag = false;

  if (array && array.length >= 1) lenFlag = true;
  else lenFlag = false;

  const handleCompareBtnClick = () => {
    handleEventLogger("dashboard", "buttonClick", "Home_Click", {
      action: "Compare_Click",
      Platform: isMobile()
    });
    router.push({
      pathname: "/compare_plan/compare_plan_view",
      query: {
        queryData: JSON.stringify(jsonArray)
      },
    });
  }

  const handleCumulativeClick = (item) => {
    handleEventLogger("dashboard", "buttonClick", "Home_Click", {
      action: "Type_Click",
      Type: "Cumulative",
      FD_Name: item.fdName,
      Platform: isMobile()
    });
    router.push({
      pathname: "/detail_fd/fd_detail",
      query: {
        productId: item["fdId"],
        productType: item["fdType"][0],
        manufacturerId: item["manufacturerId"],
        screenType: screenType
      },
    });
  }

  const handleNonCumulativeClick = (item) => {
    handleEventLogger("dashboard", "buttonClick", "Home_Click", {
      action: "Type_Click",
      Type: "Non-Cumulative",
      FD_Name: item.fdName,
      Platform: isMobile()
    });
    router.push({
      pathname: "/detail_fd/fd_detail",
      query: {
        productId: item["fdId"],
        productType: item["fdType"][1],
        manufacturerId: item["manufacturerId"],
        screenType: screenType
      },
    });
  }

  useEffect(() => {
    const filteredResult = []
    array.forEach((arrItem) => {
      const filterReturnedValues = productData.filter((apiDataItem) => apiDataItem.fdId == arrItem)
      filterReturnedValues.length && filteredResult.push(filterReturnedValues[0].logoUrl)
    })
    setComparedProductLogos(filteredResult)
  }, [array.length])

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

  useEffect(() => {
    if (typeof window != "undefined") {
      appConfig.distributorId?.toUpperCase() == "NORTHARC" ? setgridtoggle(false) : setgridtoggle(true)
      appConfig.distributorId?.toUpperCase() == "NORTHARC" ? setIsListView(false) : setIsListView(true)
      const selectedManufactureId = sessionStorage.getItem("selectedManufactureId");
      setSelectedManufactureId(selectedManufactureId);
    }
  }, [])

  return (
    <>{showModal.show && <PayoutPopup
      updateModalState={toggleModal}
      screenType={screenType}
      data={showModal.data}
    />}

      <div className="flex gap-5 sm:flex-nowrap flex-wrap">
        <div className="sm:w-[75%] md:w-[100%]" >
          {gridtoggle && <div className="flex gap-2 items-center justify-end">

            <div>
              <TfiViewListAlt
                onClick={() => setIsListView(true)}
                className={`cursor-pointer ${isListView ? 'text-fd-primary' : 'text-black'}`}
              />
            </div>
            <div>
              <TfiLayoutGrid3Alt
                onClick={() => setIsListView(false)}
                className={`cursor-pointer ${!isListView ? 'text-fd-primary' : 'text-black'}`}
              />
            </div>
          </div>}

          <div className={`  mt-5  ${screenType === "dashboard" ? "" : ""} ${product_list_css.plan_and_compare_gap}`} >
            {trailArray && trailArray.length > 0 ? (
              <>
                {isListView ? (
                  <div className={`${product_list_css.plan_section_width} border-background-primary ${screenType !== "dashboard" && "mt-5"}`}>
                    {trailArray != undefined ? trailArray.length > 0 ?
                      trailArray.sort((a, b) => a["fdName"].localeCompare(b["fdName"])).map((item) => {

                        return (
                          <>

                            <div className="product-card   overflow-hidden  duration-300 ease-in mb-5 text-apercu bg-white p-[20px] border cursor-pointer transition-all duration-400 ease-in-out transform hover:-translate-y-1.2 hover:scale-[1.01] " onClick={(e) => handleInvestBtnClick(item, e)}>
                              <div className={`${product_list_css.row}`} key={item["fdId"]}>
                                <div className={`w-full flex gap-3 ${product_list_css.header_container} mb-3`}>
                                  <div className={`${product_list_css.left_column}  flex-row`} >
                                    <div className="flex justify-between">
                                      <div className={` ${product_list_css.logo_fdname_space} flex flex-row`}>
                                        <div>
                                          <img
                                            className="min-w-6 object-contain"
                                            src={item["logoUrl"]}
                                            alt="1Silverbullet"
                                            width={120}
                                            height={30}
                                          />
                                        </div>
                                        <div className="text-medium text-2xl text-black">{item["fdName"]}</div>
                                      </div>
                                      <div className={`${product_list_css.display_or_hide_top_right_corner}  flex flex-col`}>
                                        <div className="text-medium text-2xl text-black">{item["ratings"][0]["rating_agency"]}</div>
                                        <div className="font-extrabold text-thicccboi-bold text-primary-green">{item["ratings"][0]["rating"]}</div>
                                      </div>
                                    </div>
                                  </div>
                                  <div className={`${product_list_css.right_column}`} >
                                    <div className={`flex flex-row ${product_list_css.table_width_or_justify}`}>
                                      <div className={`flex flex-col ${product_list_css.col_tenure} lg:w-2/4`}>
                                        <div className="text-regular text-xl text-light-gray">{translate(COMMON_CONSTANTS.tenure)}</div>
                                        <div className="text-medium text-2xl text-black break-words">{convertToTenor(item["minTenure"])} - {convertToTenor(item["maxTenure"])}</div>
                                      </div>
                                      <div className={`flex flex-col ${product_list_css.col_interest} lg:w-[30%]`}>
                                        <div className="text-regular text-xl text-light-gray">{translate(COMMON_CONSTANTS.interestRate)}</div>
                                        <div className="text-medium text-2xl text-black">{item["yield"][0]}% - {item["yield"][1]}%</div>
                                      </div>

                                    </div>
                                  </div>
                                </div>
                                <div className={`w-full flex gap-3 ${product_list_css.compare_and_buttons}`}>
                                  <div className={`${product_list_css.left_column} flex flex-row items-end`}>

                                    <div className={`flex flex-col ${product_list_css.col_rating} w-full`}>
                                      <div className={`text-medium text-2xl text-black ${product_list_css.display_or_hide_rating}`}>{item["ratings"][0]["rating_agency"]}</div>
                                      <div className={`text-primary-green text-thicccboi-bold text-xl ${product_list_css.display_or_hide_rating}`}> {item["ratings"][0]["rating"]}</div>
                                    </div>
                                  </div>
                                  <div className={`${product_list_css.right_column} sm:flex flex-row justify-between ${product_list_css.buttons_gap}`} >
                                    <div className="flex flex-row gap-3">
                                      <div className="flex flex-col">
                                        <div className={`flex flex-col mb-3 ${product_list_css.cta_label}`}>
                                          <div className="text-regular text-xl text-light-gray">Payout: </div>
                                          <div className="flex flex-row items-center">
                                            {item["fdPayoutMethod"].length > 0 && (
                                              <>
                                                <div className="flex flex-row flex-wrap items-center gap-1 text-medium text-xl text-black text-black">
                                                  {item["fdPayoutMethod"].map((method, index) => (
                                                    <span key={index}>
                                                      {translate(method)}
                                                      {index < item["fdPayoutMethod"].length - 1 ? ', ' : ''}
                                                    </span>
                                                  ))}
                                                </div>
                                                {item["fdPayoutMethod"].some(method => method !== COMMON_CONSTANTS.onMaturity) && selectedManufactureId?.toLowerCase() !== "unity" && (
                                                  <span className="text-medium text-xl text-black">
                                                    {item["fdPayoutMethod"].length > 0 && ', '}
                                                    {translate(COMMON_CONSTANTS.onMaturity)}
                                                  </span>
                                                )}
                                              </>
                                            )}
                                          </div>
                                        </div>
                                      </div>
                                    </div>

                                  </div >
                                </div >
                                <div>
                                  <div className="flex justify-between aligns-center mt-5 text-sm justify-end">
                                    <div className={`flex flex-row items-center flex-wrap`}>
                                      <div className="flex items-center gap-3">
                                        <input
                                          type="checkbox"
                                          className="accent-primary-green h-4 w-4 hover:cursor-pointer"
                                          checked={checkboxPersist(array, item["fdId"])}
                                          disabled={array.length >= 3 && !checkboxPersist(array, item["fdId"])}
                                          id={'plan' + item["fdId"]}
                                          value={item["fdId"]}
                                          onChange={getCheckBox}
                                          name="declarationCheck"
                                        />
                                        <label className="addtocompare inline-block text-black text-regular text-2xl cursor-pointer"
                                          for={'plan' + item["fdId"]}>{translate(COMMON_CONSTANTS.addToCompare)}</label>
                                      </div>
                                    </div>
                                    <>
                                      <button
                                        className="button-active btn-gradient button-transition  text-medium text-xl  lg:text-2xl w-fit    text-medium text-xl  lg:text-2xl w-fit  hover:button-shadow"
                                        onClick={(e) => handleInvestBtnClick(item, e)}
                                      >
                                        View Details
                                      </button >
                                    </>

                                  </div >
                                </div>
                              </div >
                            </div >

                          </>
                        );
                      }) : <div className="text-apercu-medium text-2xl text-gray-500 ">
                        {!isAPIDataLoaded ?
                          <div className="flex justify-center items-center">{translate(AGENT.loading)}..
                            <div className="text-fd-primary spinner-border animate-spin inline-block w-6 h-6 border-4 rounded-full" role="status">
                            </div>
                          </div> :
                          <div className="grid justify-items-center dashboard-title">{translate(COMMON_CONSTANTS.NoDataFound)}</div>}
                      </div> : null
                    }
                    <div className={array && array.length >= 2 ? `flex flex-col fixed left-0 w-full bg-slate-100 bottom-0 border-t-2 justify-around w-full py-1 ${product_list_css.hide_logos_desktop}` : `flex flex-col fixed left-0 bottom-0 justify-around w-full z-10 ${product_list_css.hide_logos_desktop}`}
                    >
                      {array && array.length >= 2 ?
                        <>
                          <div className="h-min flex w-full justify-between p-2">
                            <div className="flex justify-around mt-2 gap-3">
                              {comparedProductLogos.length ? (comparedProductLogos).map((item) => {
                                return (
                                  <>
                                    <div key={item}>
                                      <Image
                                        className="md:hidden lg:block object-contain"
                                        src={item}
                                        alt="1Silverbullet"
                                        width={70}
                                        height={30}
                                      />
                                    </div>
                                  </>
                                )
                              }) : null}
                            </div>
                            <div className="flex justify-center items-center">
                              <div className={`compare-text-hide mt-2 ${product_list_css.compare_cta}`}>
                                <button
                                  type="button"
                                  className="text-medium text-xl  p-1 border border-fd-primary rounded-md text-white button-active-dashboard btn-gradient"
                                  onClick={() => handleCompareBtnClick()}
                                >
                                  {translate(COMMON_CONSTANTS.compare)}
                                </button>
                              </div>
                            </div>
                          </div>
                        </>
                        : array && array.length == 1 ?
                          <div className="h-min bg-slate-100 border-t-2">
                            <div className="flex justify-around mt-2">
                              {comparedProductLogos.length ? (comparedProductLogos).map((item) => {
                                return (
                                  <>
                                    <div
                                      key={item}
                                    >
                                      <Image
                                        className="md:hidden lg:block object-contain"
                                        src={item}
                                        alt="1Silverbullet"
                                        width={70}
                                        height={30}
                                      />
                                    </div>
                                  </>
                                )
                              }) : null}
                            </div>
                            <div className="flex justify-center items-center">
                              <div className={`compare-text-hide mt-2 ${product_list_css.compare_cta}`}>
                                <button
                                  className="p-1 border border-indigo-400 rounded-md text-medium text-xl text-white button-active-dashboard bg-indigo-400"
                                  onClick={() => handleCompareBtnClick()}
                                >
                                  {translate(COMMON_CONSTANTS.compare)}
                                </button>
                              </div>
                            </div>
                          </div> : null
                      }
                    </div>

                  </div >

                ) : (
                  <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 ${screenType !== "dashboard" ? "mt-5" : ""}`}>
                    {trailArray.map((item) => (
                      <div key={item["fdId"]} className={`col-span-1 ${product_list_css.row}`}>
                        <div className="grid-card grid  relative h-[100%]">
                          <div className="grid-card-header px-3 py-5 relative">
                            <div className="w-fit p-1 bg-white rounded-md mb-2">
                              
                              <div className={`text-primary-green text-thicccboi-bold text-sm ${product_list_css.display_or_hide_rating}`}>
                                {item["ratings"][0]["rating"]}
                              </div>
                            </div>
                            <div className="flex gap-3">
                              {appConfig.distributorId?.toLowerCase() !== 'northarc' && (
                                <div className={`${product_list_css.logo_fdname_space} grid-brand-logo bg-white rounded-xl shadow p-2`}>
                                  <img
                                    className="min-w-6"
                                    src={item["logoUrl"]}
                                    alt="1Silverbullet"
                                    style={{ width: '110px', height: '50px', objectFit: 'contain' }}
                                  />
                                </div>
                              )}
                              <div>
                                <h1 className="text-2xl text-black font-bold">{item["fdName"]}</h1>
                              </div>
                            </div>

                            <div className="flex items-center gap-3 relative">
                              <input
                                type="checkbox"
                                className="peer accent-primary-green h-5 w-5 hover:cursor-pointer absolute top-[10px] z-20 opacity-0"
                                checked={checkboxPersist(array, item["fdId"])}
                                id={'plan' + item["fdId"]}
                                value={item["fdId"]}
                                onChange={getCheckBox}
                                name="declarationCheck"
                                style={{ right: "27px" }}
                              />

                              <label
                                htmlFor={'plan' + item["fdId"]}
                                className="absolute right-5 p-2 rounded-full shadow z-5 transition-colors peer-checked:btn-gradient bg-white cursor-pointer"
                              >
                                <IoGitCompareOutline
                                  color={checkboxPersist(array, item["fdId"]) ? "#fff" : "#000"}
                                />
                              </label>
                            </div>

                          </div>

                          <div className="grid-card-body relative">
                            <div className={`flex flex-wrap ${product_list_css.table_width_or_justify}`}>
                              <div className={`w-[50%] p-2 ${product_list_css.col_tenure}`}>
                                <span className="text-regular text-xl text-light-gray">{translate(COMMON_CONSTANTS.tenure)}</span>
                                <p className="text-medium text-xl text-black break-words">
                                  {convertToTenor(item["minTenure"])} - {convertToTenor(item["maxTenure"])}
                                </p>
                              </div>
                              <div className={`w-[50%] p-2 ${product_list_css.col_interest}`}>
                                <span className="text-regular text-xl text-light-gray">{translate(COMMON_CONSTANTS.interestRate)}</span>
                                <p className="text-medium text-xl text-black break-words">
                                  {item["yield"][0]}% - {item["yield"][1]}%
                                </p>
                              </div>
                              <div className={`w-[50%] p-2 ${product_list_css.col_interest}`}>
                                <span className="text-regular text-xl text-light-gray">Rating Agency</span>
                                <div className={`text-medium text-xl text-primary-green break-words ${product_list_css.display_or_hide_rating}`}>
                                {item["ratings"][0]["rating_agency"]}
                              </div>
                              </div>

                              <PayoutMethodDisplay
                                item={item}
                                translate={translate}
                                COMMON_CONSTANTS={COMMON_CONSTANTS}
                                product_list_css={product_list_css}
                              />
                            </div>
                          </div>

                          <div className="grid-card-footer btn-gradient">
                            <button className="button-active button-transition text-medium text-xl lg:text-2xl w-full" onClick={(e) => handleInvestBtnClick(item, e)}>
                              View Details
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div className="text-apercu-medium text-2xl text-gray-500">
                {!isAPIDataLoaded ? (
                  <div className="flex justify-center items-center">
                    {translate(AGENT.loading)}..
                    <div
                      className="text-fd-primary spinner-border animate-spin inline-block w-6 h-6 border-4 rounded-full"
                      role="status"
                    ></div>
                  </div>
                ) : (
                  <div className="grid justify-items-center dashboard-title">{translate(COMMON_CONSTANTS.NoDataFound)}</div>
                )}
              </div>
            )}





          </div >
        </div>
        <div className="sm:w-[25%] md:w-[100%]">
          <div className="flex flex-col gap-4 " >
            <div className="sticky top-[0]">
              <ComparePlan className="" arr={array} apiData={productData} removeFunction={remove} screenType={screenType} />
              {array.length ? <FDVsGoldComparePlan /> : null}
            </div>
          </div>
        </div>

      </div>
    </>

  );
}

export default FDplans;

const PayoutMethodDisplay = ({ item, translate, COMMON_CONSTANTS, product_list_css }) => {
  const [showAll, setShowAll] = useState(false);

  const methods = item["fdPayoutMethod"] || [];
  const displayLimit = 2;

  const showMaturitySeparately = methods.some(method => method !== COMMON_CONSTANTS.onMaturity);
  const hasMore = methods.length > displayLimit;
  const visibleMethods = showAll ? methods : methods.slice(0, displayLimit);

  // Filter out 'onMaturity' from visible methods if it's shown separately
  const filteredVisibleMethods = showMaturitySeparately
    ? visibleMethods.filter(method => method !== COMMON_CONSTANTS.onMaturity)
    : visibleMethods;

  return (
    <div className="w-[50%] p-2 sm:flex flex-row justify-between">
      <div className="flex flex-row gap-3">
        <div className="flex flex-col">
          <div className={`flex flex-col mb-3 ${product_list_css.cta_label}`}>
            <div className="text-regular text-xl text-light-gray">Payout: </div>
            <div className="flex items-center flex-wrap  text-medium text-md text-black">
              {filteredVisibleMethods.map((method, index) => (
                <span key={index} className="text-medium text-xl text-black break-words">
                  {translate(method)}
                  {index < filteredVisibleMethods.length - 1 && ', '}
                </span>
              ))}
              {showMaturitySeparately && methods.includes(COMMON_CONSTANTS.onMaturity) && (
                <>
                  {filteredVisibleMethods.length > 0 && ', '}
                  <span className="text-medium text-xl text-black break-words">{translate(COMMON_CONSTANTS.onMaturity)}</span>
                </>
              )}
              {/* Ellipsis when not showing all and more methods exist */}
              {!showAll && hasMore && <span>... </span>}

              {/* Append onMaturity separately if required */}


              {/* View More / View Less toggle */}
              {hasMore && (
                <button
                  onClick={() => setShowAll(prev => !prev)}
                  className="text-blue-500 underline ml-2 text-base focus:outline-none"
                >
                  {showAll ? 'View Less' : 'View More'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
import Image from "next/image";
import { BsFillInfoCircleFill } from "react-icons/bs";
import { useState, createContext, useContext, useEffect } from "react";
import ComparePlan from "./compare_plan";
import { Tooltip } from "@material-tailwind/react";
export const PlanContext = createContext('Default Value');
import product_list_css from "../../styles/product_list.module.css";
import FDVsGoldComparePlan from "./fd_vs_gold_plan";
import { convertToTenor, handleEventLogger, isMobile } from "../../lib/util";
import { useRouter } from "next/router";
import { useTranslation } from "react-i18next";
import { AGENT, COMMON_CONSTANTS, FD_RENEWAL, PAYOUT_FREQUENCY } from "../../constants";
import PayoutPopup from "../../pages/compare_plan/payoutPopup";
let array = []
function FDplans({ trailArray, productData, isAPIDataLoaded, screenType }) {
  const [value, setValue] = useState();
  const [index, setIndex] = useState([]);
  const [comparedProductLogos, setComparedProductLogos] = useState([]);
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

  return (
    <>{showModal.show && <PayoutPopup
      updateModalState={toggleModal}
      screenType={screenType}
      data={showModal.data}
    />}
      <div className={` flex mt-5  ${screenType === "dashboard" ? "" : ""} ${product_list_css.plan_and_compare_gap}`}>
        <div className={`${product_list_css.plan_section_width} border-background-primary ${screenType !== "dashboard" && "mt-5"}`}>
          {trailArray != undefined ? trailArray.length > 0 ?
            trailArray.map((item) => {

              return (
                <>
                  <div className="product-card   overflow-hidden  duration-300 ease-in mb-5 text-apercu bg-white p-[20px] border cursor-pointer transition-all duration-400 ease-in-out transform hover:-translate-y-1.2 hover:scale-[1.01] " onClick={(e) => handleInvestBtnClick(item, e)}>
                    <div className={`${product_list_css.row}`} key={item["fdId"]}>
                      <div className={`w-full flex gap-3 ${product_list_css.header_container} mb-3`}>
                        <div className={`${product_list_css.left_column}  flex-row`} >
                          <div className="flex justify-between">
                            <div className={` ${product_list_css.logo_fdname_space} flex flex-row`}>
                              <div>
                                <Image
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
                            <div className={`text-primary-green text-thicccboi-bold ${product_list_css.display_or_hide_rating}`}> {item["ratings"][0]["rating"]}</div>
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
                                      {item["fdPayoutMethod"].some(method => method !== COMMON_CONSTANTS.onMaturity) && (
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
                                  Invest Now
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
        <div className="flex flex-col gap-4 ">
          <div className="sticky top-[0]">
            <ComparePlan className="" arr={array} apiData={productData} removeFunction={remove} screenType={screenType} />
            {array.length ? <FDVsGoldComparePlan /> : null}
          </div>
        </div>
      </div >
    </>

  );
}

export default FDplans;

import Image from "next/image";
import Link from "next/link";
import { MdCancel } from "react-icons/md";
import { useState, useEffect, useContext, createContext } from "react";
import { PlanContext } from "../product/fd_plan";
import product_list_css from "../../styles/product_list.module.css";
import { useTranslation } from "react-i18next";
import { COMMON_CONSTANTS } from "../../constants";

function ComparePlan(props) {
  const parentApiData = useContext(PlanContext);
  const [jsonData, setJsonData] = useState([]);
  const [comparedProductLogos, setComparedProductLogos] = useState([]);
  const { t: translate } = useTranslation();

  let jsonArray = [];
  if (props.arr && props.apiData) {
    for (let prodID = 0; prodID < props.arr.length; prodID++) {
      for (let Api = 0; Api < props.apiData.length; Api++) {
        const jsonBody = {
          productId: "",
          productType: "",
          manufacturerId: "",
          prematurePenaltyYield: "",
        };
        if (props.arr[prodID] == props.apiData[Api]["fdId"]) {
          jsonBody.productId = props.apiData[Api]["fdId"];
          jsonBody.productType = props.apiData[Api]["fdType"];
          jsonBody.manufacturerId = props.apiData[Api]["manufacturerId"];
          jsonBody.prematurePenaltyYield =
            props.apiData[Api]["prematurePenaltyYield"];
          jsonArray.push(jsonBody);
        }
      }
    }
  }

  let lenFlag = false;

  if (props.arr && props.arr.length >= 1) lenFlag = true;
  else lenFlag = false;

  useEffect(() => {
    const filteredResult = [];
    props.arr.forEach((arrItem) => {
      const filterReturnedValues = props.apiData.filter(
        (apiDataItem) => apiDataItem.fdId == arrItem
      );
      filterReturnedValues.length &&
        filteredResult.push(filterReturnedValues[0].logoUrl);
    });
    setComparedProductLogos(filteredResult);
  }, [props]);

  const { screenType } = props

  return (
    <div className={`${product_list_css.hide_compare_card} ${screenType !== "dashboard" && "mt-5"}`}>
      <div
        className={`${product_list_css.hide_card_right} rounded-xl overflow-hidden drop-shadow-md bg-white px-4 pt-4 `}
      >
        <div className="text-left text-bold text-3xl pb-4 text-fd-primary">
        {translate(COMMON_CONSTANTS.comparePlans)}
        </div>
        {lenFlag ? (
          <div className={`pb-4 text-regular text-left text-xl `}>
            {props.arr
              ? props.arr.map((item) => {
                return (
                  <div>
                    {props.apiData.map((api) => {
                      return (
                        <div>
                          {item == api["fdId"] ? (
                            <div
                              key={item}
                              className="border text-apercu mb-3"
                            >
                              <div className="relative" >
                               <div className="flex p-3 relative gap-5 justify-left ">
                               <div className="w-1/3">
                                  <Image
                                    className="md:hidden lg:block object-contain "
                                    src={api["logoUrl"]}
                                    alt="1Silverbullet"
                                    width={100}
                                    height={100}
                                  />
                                </div>
                                <div className="flex flex-col">
                                  <h1 className="text-medium text-xl text-black text-black">
                                    {api["fdName"]}
                                  </h1>
                                  <div className="flex flex-row text-medium text-xl text-black">
                                    <div className="text-light-gray">
                                    {translate(COMMON_CONSTANTS.yield)} &nbsp;
                                    </div>
                                    <div className="text-black">
                                      {api["yield"][0]} - {api["yield"][1]} %
                                    </div>
                                  </div>
                                </div>
                               </div>
                                <div className="flex items-stretch  justify-cente">
                                  <MdCancel 
                                    className="text-red-700 items-start cursor-pointer cancelIcon"
                                    onClick={() => {
                                      props.removeFunction(api["fdId"]);
                                    }}
                                  />
                                </div>
                              </div>
                            </div>
                          ) : null}
                        </div>
                      );
                    })}
                  </div>
                );
              })
              : null}
            {props.arr && props.arr.length >= 2 ? (
              <div className="flex justify-start ">
                <Link
                  href={{
                    pathname: "/compare_plan/compare_plan_view",
                    query: {
                      queryData: JSON.stringify(jsonArray),
                      screenType: screenType
                    },
                  }}
                >
                  <button
                    type="button"
                    disabled={props?.arr?.length < 2}
                    className="text-medium text-2xl border border-fd-primary rounded-md text-white px-8 py-3 mt-4 btn-gradient hover:bg-hover-primary hover:border-hover-primary"
                  >
                    {translate(COMMON_CONSTANTS.compare)}
                  </button>
                </Link>
              </div>
            ) : (
              <div className="flex justify-left">
                <button
                  disabled={props?.arr?.length < 2}
                  className="text-medium text-2xl rounded-md border-fd-primary text-white px-8 py-3 mt-4">
                  {translate(COMMON_CONSTANTS.compare)}
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="mb-3 text-regular text-left text-xl text-light-gray">
            {translate(COMMON_CONSTANTS.noPlanSelectedSelectMinimum2PlansToCompare)}
          </div>
        )}

        {!lenFlag ? (
          <div className="mb-6 flex justify-start">
            <button
              disabled={props?.arr?.length < 2}
              className="text-medium text-2xl rounded-md text-white px-8 py-3 duration-300 ease-in mt-4  hover:bg-btn-gradient hover:text-white hover:border-hover-primary">
              {translate(COMMON_CONSTANTS.compare)}
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
export default ComparePlan;

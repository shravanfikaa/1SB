import { useState, useEffect, useRef } from "react";
import { FaFilter } from "react-icons/fa";
import { HiSortDescending } from "react-icons/hi";
import appConfig from "../../app.config";
import { GetApiHandler } from "../api/apihandler";
import FDplans from "./fd_plan";
import { GrFormClose } from "react-icons/gr"
import { filterDropdown } from "../../lib/util"
import { generateALSQLWhereClause } from "../../lib/product_list_utils"
import alasql from "alasql";
import product_list_css from "../../styles/product_list.module.css";
import DropdownParent from "../../_components/DropdownParent";
import landing_page from "../../styles/landing_page.module.css";
import { useTranslation } from "react-i18next";
import { COMMON_CONSTANTS, PARENT_DETAILS_PAYMENT } from "../../constants";




const issuerName = [];
let arrayIssuerName = [];
let arrayCreditRating = [];
let arrayYieldList = [];
let arrayPayoutFrequency = [];
let arrayFDTenure = [];
const creditRating = [];
const yieldList = [];
const FDTenure = [];
const payoutFrequency = [];
let trailArray = [];
let productData = [];
let SortName = ""
let PatternOrder = ""

let trail = []
let check = false;
let AfterFilterArray = [];

function Filter({ screenType }) {
  let jsonArray = [];
  const [data, setData] = useState([]);
  const [flag, setFlag] = useState([]);
  const [selectedIssuer, setSelectedIssuer] = useState([]);
  const [selectedTenure, setSelectedTenure] = useState([]);
  const [selectedRating, setSelectedRating] = useState([]);
  const [selectedYield, setSelectedYield] = useState([]);
  const [selectedPayout, setSelectedPayout] = useState([]);
  const [isAPIDataLoaded, setIsAPIDataLoaded] = useState(false);
  const [totalPlans, setTotalPlans] = useState(0);
  const [showFlag, setShowFlag] = useState(false);
  const [showDropdownFlag, setShowDropdownFlag] = useState(false);
  const [sortPattern, setSortPattern] = useState("");

  const payoutFrequencyRef = useRef(null);
  const creditRatingRef = useRef(null);
  const fdIssuerRef = useRef(null);
  const fdTenureRef = useRef(null);
  const sortDropdownRef = useRef(null);
  const dropdownRef = useRef(null);
  const { t: translate } = useTranslation();


  const sortOptions = [
    { name: translate(COMMON_CONSTANTS.InterestHightoLow), sortName: "Interest", orderPattern: 'DESC', current: true },
    { name: translate(COMMON_CONSTANTS.InterestLowtoHigh), sortName: "Interest", orderPattern: 'ASC', current: false },
    { name: translate(COMMON_CONSTANTS.RatingLowtoHigh), sortName: "Rating", orderPattern: 'ASC', current: true },
    { name: translate(COMMON_CONSTANTS.RatingHightoLow), sortName: "Rating", orderPattern: 'DESC', current: false },
    { name: translate(COMMON_CONSTANTS.IssuerAtoZ), sortName: "Issuer", orderPattern: 'ASC', current: true },
    { name: translate(COMMON_CONSTANTS.IssuerZtoA), sortName: "Issuer", orderPattern: 'DESC', current: false },
  ]

  function showDropDown() {
    setShowFlag(!showFlag)
  }

  function showDropDownMobile() {
    setShowDropdownFlag(!showDropdownFlag);
  }
  // ------------------------manufacturer-------
  const toggleOptionIssuer = ({ id }) => {
    setSelectedIssuer((prevSelected) => {
      const newArray = [...prevSelected];
      if (newArray.includes(id)) {
        closeNav()
        return newArray.filter((item) => item != id);
      } else {
        newArray.push(id);
        closeNav()
        return newArray;

      }

    });
  };

  const toggleOptionRating = ({ id }) => {
    setSelectedRating((prevSelected) => {
      const newArray = [...prevSelected];
      if (newArray.includes(id)) {
        closeNav()
        return newArray.filter((item) => item != id);
      } else {
        closeNav()
        newArray.push(id);
        return newArray;
      }
    });
  };

  const toggleOptionYield = ({ id }) => {
    setSelectedYield((prevSelected) => {
      const newArray = [...prevSelected];
      if (newArray.includes(id)) {
        closeNav()
        return newArray.filter((item) => item != id);
      } else {
        closeNav()
        newArray.push(id);
        return newArray;
      }
    });
  };

  const toggleOptionPayout = ({ id }) => {
    setSelectedPayout((prevSelected) => {
      const newArray = [...prevSelected];
      if (newArray.includes(id)) {
        closeNav()
        return newArray.filter((item) => item != id);
      } else {
        closeNav()
        newArray.push(id);
        return newArray;
      }
    });
  };

  const toggleOptionTenure = ({ id }) => {
    setSelectedTenure((prevSelected) => {
      const newArray = [...prevSelected];
      if (newArray.includes(id)) {
        closeNav()
        return newArray.filter((item) => item != id);
      } else {
        closeNav()
        newArray.push(id);
        return newArray;
      }
    });
  };
  //  -------------------------filter functions--------------------
  let userSelectedIssuer = []
  let userSelectedRating = []
  let userSelectedYield = []
  let userSelectedPayout = []
  let userSelectedTenure = []
  let allManufacturerNames = {}
  let order = ""

  function funIssuer(val) {
    userSelectedIssuer = val
    mainFilter(userSelectedIssuer, userSelectedRating, userSelectedYield, userSelectedPayout, userSelectedTenure, SortName, PatternOrder)
  }

  function funRating(val) {
    userSelectedRating = val
    mainFilter(userSelectedIssuer, userSelectedRating, userSelectedYield, userSelectedPayout, userSelectedTenure, SortName, PatternOrder)
  }

  function funYield(val) {
    userSelectedYield = val
    mainFilter(userSelectedIssuer, userSelectedRating, userSelectedYield, userSelectedPayout, userSelectedTenure, SortName, PatternOrder)
  }

  function funPayout(val) {
    userSelectedPayout = val
    mainFilter(userSelectedIssuer, userSelectedRating, userSelectedYield, userSelectedPayout, userSelectedTenure, SortName, PatternOrder)
  }

  function funTenure(val) {
    userSelectedTenure = val
    mainFilter(userSelectedIssuer, userSelectedRating, userSelectedYield, userSelectedPayout, userSelectedTenure, SortName, PatternOrder)
  }

  function funSort(pattern, sortName, deviceType) {
    SortName = sortName
    PatternOrder = pattern
    mainFilter(userSelectedIssuer, userSelectedRating, userSelectedYield, userSelectedPayout, userSelectedTenure, SortName, PatternOrder)
    deviceType === "desktop" ? setShowFlag(!showFlag) : setShowDropdownFlag(!showDropdownFlag)
  }

  function mainFilter(userSelectedIssuer, userSelectedRating, userSelectedYield, userSelectedPayout, userSelectedTenure, SortName, PatternOrder) {
    let manufacturerFilter = generateALSQLWhereClause(userSelectedIssuer, "manufacturerName", "string");
    // ------------------yield--------------------
    let yieldFilter = generateALSQLWhereClause(userSelectedYield, "yield", 'nested')
    // --------------------------rating------------------
    let ratingFilter = generateALSQLWhereClause(userSelectedRating, "ratings", 'nestednestedString')
    // --------------------------Payment Frequency-------------------
    let paymentFilter = generateALSQLWhereClause(userSelectedPayout, "fdPayoutMethod", 'nestedString2')
    // ----------------------minTenure--------------
    let tenureFilter = ""
    if (userSelectedTenure.length != 0) {
      tenureFilter = generateALSQLWhereClause(userSelectedTenure, "minTenure", "doublenumber")
    }
    else {
      tenureFilter = generateALSQLWhereClause(userSelectedTenure, "minTenure", "number")
    }
    let SortFilter = ""
    if (SortName.length != 0 && PatternOrder.length != 0) {
      if (SortName == "Interest") {
        SortFilter = generateALSQLWhereClause(PatternOrder, "yield", "order")
      }
      else if (SortName == "Issuer") {
        SortFilter = generateALSQLWhereClause(PatternOrder, "fdName", "orderString")
      }
      else if (SortName == "Rating") {
        SortFilter = generateALSQLWhereClause(PatternOrder, "ratings", "orderRating")
      }
    }
    let whereClause = "(" + manufacturerFilter + ") AND (" + yieldFilter + ") AND (" + ratingFilter + ") AND (" + paymentFilter + ")  AND (" + tenureFilter + ") " + SortFilter + ""
    let finalQuery = "SELECT * FROM ? WHERE" + whereClause
    let arr1 = []
    arr1 = alasql(finalQuery, [trail]);
    trailArray = arr1;
  }

  useEffect(() => {
    var method = "GET";
    var multiProductList =
      appConfig?.deploy?.baseUrl + appConfig?.deploy?.getProductList;
    GetApiHandler(multiProductList, method)
      .then((response) => {
        let temp = response.hasOwnProperty("data") ? response.data.data : {};

        AfterFilterArray.push(temp)
        trailArray = []
        productData = []
        trail = []
        for (var i in temp) {
          allManufacturerNames[i] = temp[i].hasOwnProperty("manufacturerName") ? temp[i]["manufacturerName"] : ""
          for (
            let j = 0;
            j < Object.keys(temp[i]["manufacturer_products"]).length;
            j++
          ) {
            trailArray.push(temp[i]["manufacturer_products"][j]);
            productData.push(temp[i]["manufacturer_products"][j])
            trail.push(temp[i]["manufacturer_products"][j]);
          }
        }

        sessionStorage.setItem("manufacturerNames", JSON.stringify(allManufacturerNames))
        sessionStorage.setItem("distributorName", JSON.stringify(appConfig.distributorName))

        setTotalPlans(trailArray.length);
        for (var manufacturerId in temp) {
          issuerName.push(temp[manufacturerId]["manufacturerName"]);
          for (var key in temp[manufacturerId]["manufacturer_products"]) {
            for (let i = 0; i < temp[manufacturerId]["manufacturer_products"][key]["ratings"].length; i++) {
              creditRating.push(temp[manufacturerId]["manufacturer_products"][key]["ratings"][i]["category"]);
            }
            yieldList.push(
              temp[manufacturerId]["manufacturer_products"][key]["yield"][0],
              temp[manufacturerId]["manufacturer_products"][key]["yield"][1]
            );
            FDTenure.push(
              temp[manufacturerId]["manufacturer_products"][key]["minTenure"],
              temp[manufacturerId]["manufacturer_products"][key]["maxTenure"]
            );
            for (
              let l = 0;
              l <
              Object.values(
                temp[manufacturerId]["manufacturer_products"][key][
                "fdPayoutMethod"
                ][0]
              ).length;
              l++
            ) {
              payoutFrequency.push(
                temp[manufacturerId]["manufacturer_products"][key][
                "fdPayoutMethod"
                ][0]
              );
            }
          }
        }
        arrayIssuerName = [...new Set(issuerName)];
        arrayCreditRating = [...new Set(creditRating)];
        arrayYieldList = [...new Set(yieldList)];
        arrayPayoutFrequency = ["Monthly", "Quarterly", "Half Yearly", "Yearly","On Maturity"];
        arrayFDTenure = ["7 days to 90 days", "91 days to 1 year", "1 year to 3 years", "3 years and above"];

        setData(temp);
        setIsAPIDataLoaded(true)
      })
      .catch((err) => {
      });
  }, []);

  for (let i = 0; i < arrayIssuerName.length; i++) {
    const jsonBody = {
      id: "",
      title: "",
    };
    jsonBody.id = i + 1;
    jsonBody.title = arrayIssuerName[i];
    jsonArray.push(jsonBody);
  }

  check = false;
  function resetall() {
    setSelectedIssuer([])
    setSelectedRating([])
    setSelectedYield([])
    setSelectedPayout([])
    setSelectedTenure([])
    trailArray = [];
    trail = []
    for (var i in data) {
      for (
        let j = 0;
        j < Object.keys(data[i]["manufacturer_products"]).length;
        j++
      ) {
        trailArray.push(data[i]["manufacturer_products"][j]);
        trail.push(data[i]["manufacturer_products"][j]);
      }
    }
    setTotalPlans(trailArray.length);
  }
  function openNav() {
    if (typeof window === "object") {
      // code is running in a browser environment
      document.getElementById("mySidenav").style.width = "272px";

    } else {
      // code is running in a non-browser environment
    }
  }

  function closeNav() {
    if (typeof window === "object") {
      // code is running in a browser environment'
      document.getElementById("mySidenav").style.width = "0px";

    } else {
      // code is running in a non-browser environment
    }
  }

  useEffect(() => {
    const MOUSE_UP = "mouseup";
    const handleOutsideClick = (event) => {
      if (
        event.target !== sortDropdownRef.current &&
        !sortDropdownRef.current?.contains(event.target) &&
        event.target.localName !== "li"
      ) {
        showFlag && setShowFlag(false);
      }
    };
    document.addEventListener(MOUSE_UP, handleOutsideClick);

    return () => document.removeEventListener(MOUSE_UP, handleOutsideClick);
  });

  useEffect(() => {
    const MOUSE_UP = "mouseup";
    const handleOutsideClick = (event) => {
      if (
        event.target !== dropdownRef.current &&
        !dropdownRef.current?.contains(event.target) &&
        event.target.localName !== "li"
      ) {
        showDropdownFlag && setShowDropdownFlag(false);
      }
    };
    document.addEventListener(MOUSE_UP, handleOutsideClick);

    return () => document.removeEventListener(MOUSE_UP, handleOutsideClick);
  });

  useEffect(() => {
    setTotalPlans(trailArray.length);
  }), [mainFilter, resetall];

  return (
    
      <div className="page-background bg-white rounded-xl">
      <div className="  border-b border-slate-300">
        <div className={`view-container view_container_sm flex justify-between h-8 items-center w-auto ${landing_page.details_container}`}>
         
          <div className={`flex gap-3 justify-center items-center ${landing_page.details_container}`}>
            <div className="bg-white">
              <div className="c-multi-select-dropdown">
                <div className="flex min-w-max text-gray-400 text-xl tracking-wide" onClick={showDropDownMobile}>
                  <HiSortDescending />
                </div>
                {
                  showDropdownFlag ?
                    <ul ref={dropdownRef} className="c-multi-select-dropdown__options shadow border border-gray-200 left-[-80px] rounded-md min-w-max font-normal">
                      {sortOptions.map(option => {
                        return (
                          <div >
                            <li className={`c-multi-select-dropdown__option hover:bg-background-secondary bg-white text-black text-regular text-xl px-1 ${sortPattern === option.name && "bg-background-secondary"}`} onClick={() => {
                              setSortPattern(option.name);
                              funSort(option.orderPattern, option.sortName, "mobile");
                            }}>
                              <span className="c-multi-select-dropdown__option-title text-base">{option.name}</span>
                            </li>
                          </div>
                        )
                      })}
                    </ul>
                    : null
                }
              </div>
            </div>
            <span className="font-medium text-black" onClick={openNav}>
              <div className={`flex flex-row right-0 text-blue-900 text-regular ${product_list_css.filter_description_font} dashboard-title `}>
                <FaFilter className="text-fd-primary" />
              </div>
            </span>
          </div>
        </div>
        <div className={`filter-block items-center  py-4 ${landing_page.filter_container} ${screenType === "dashboard" ? "" : "mb-5"}`}>
        <div className="text-medium text-2xl text-light-gray">
                {translate(COMMON_CONSTANTS.filters)}
              </div>
          <div className="flex gap-4 justify-between">
            
            <div className="flex items-center gap-4">
             
              <DropdownParent
                options={filterDropdown(arrayIssuerName)}
                selected={selectedIssuer}
                toggleOption={toggleOptionIssuer}
                onSelect={funIssuer(selectedIssuer)}
                name={`${translate(COMMON_CONSTANTS.issuer)}`}
                ref={fdIssuerRef}
              />
              <DropdownParent
                options={filterDropdown(arrayCreditRating)}
                selected={selectedRating}
                toggleOption={toggleOptionRating}
                onSelect={funRating(selectedRating)}
                name={`${translate(COMMON_CONSTANTS.creditRating)}`}
                ref={creditRatingRef}
              />
              <DropdownParent
                options={filterDropdown(arrayPayoutFrequency)}
                selected={selectedPayout}
                toggleOption={toggleOptionPayout}
                onSelect={funPayout(selectedPayout)}
                name={`${translate(COMMON_CONSTANTS.paymentFrequency)}`}
                ref={payoutFrequencyRef}
              />
              <DropdownParent
                options={filterDropdown(arrayFDTenure)}
                selected={selectedTenure}
                toggleOption={toggleOptionTenure}
                onSelect={funTenure(selectedTenure)}
                name={`${translate(COMMON_CONSTANTS.fdTenure)}`}
                ref={fdTenureRef}
              />
            </div>
            <div className="flex items-center gap-4">
              <div className="">
                <div className="c-multi-select-dropdown">
                  <div className=" flex gap-2 min-w-max text-gray-400 text-xl tracking-wide cursor-pointer border border-gray-500 rounded  p-2.5" onClick={showDropDown}>
                    <span className="font-bold self-center text-black">{translate(COMMON_CONSTANTS.sortBy)} </span>  &nbsp;
                    <HiSortDescending className="self-end text-2xl"></HiSortDescending>
                  </div>
                  {
                    showFlag ?
                      <ul ref={sortDropdownRef} className="c-multi-select-dropdown__options shadow border border-gray-200 rounded-md min-w-max  font-normal right-0 left-auto p-0">
                        {sortOptions.map(option => {
                          return (
                            <div >
                              <li className={`c-multi-select-dropdown__option hover:bg-background-secondary text-regular text-xl px-4 py-px ${sortPattern === option.name && "bg-background-secondary"}`} onClick={() => {
                                setSortPattern(option.name);
                                funSort(option.orderPattern, option.sortName, "desktop");
                              }}>
                                <span className="c-multi-select-dropdown__option-title text-apercu text-base text-black">{option.name}</span>
                              </li>
                            </div>
                          )
                        })}
                      </ul>
                      : null
                  }
                </div>
              </div>
              <div className=" flex flex-row items-center gap-2 text-primary-green rounded border border-gray-500 p-2">
                {selectedIssuer.length == 0 && selectedRating.length == 0 && selectedYield.length == 0 && selectedPayout.length == 0 && selectedTenure.length == 0 ?
                  <FaFilter className="text-fd-primary text-2xl font-bold " />
                  : <FaFilter className="text-light-orange text-2xl font-bold" />}
                <div className="text-regular text-2xl hover:cursor-pointer text-black" onClick={resetall}>
                  {translate(COMMON_CONSTANTS.resetAll)}
                </div>
              </div>
            </div>
          </div>
        </div>
        <div id="mySidenav" className="sidenav z-50 shadow-md">
          <div className="flex flex-row-reverse">
            <a onClick={closeNav}><GrFormClose /></a>
          </div>
          <div className="flex justify-between ml-5 text-regular"><div className="text-black">{translate(COMMON_CONSTANTS.filters)}</div>
            <div className="flex justify-between gap-x-0.5 items-center mr-3">
              {selectedIssuer.length == 0 && selectedRating.length == 0 && selectedYield.length == 0 && selectedPayout.length == 0 && selectedTenure.length == 0 ?
                <FaFilter className="text-fd-primary text-2xl" />
                : <FaFilter className="text-light-orange text-2xl font-bold" />}
              <div className="text-regular text-2xl text-black hover:cursor-pointer" onClick={resetall}>
                {translate(COMMON_CONSTANTS.resetAll)}
              </div>
            </div> </div>
          <div className="my-3 ml-5 mr-3 text-sm">
            <DropdownParent
              options={filterDropdown(arrayIssuerName)}
              selected={selectedIssuer}
              toggleOption={toggleOptionIssuer}
              onSelect={funIssuer(selectedIssuer)}
              name={`${translate(COMMON_CONSTANTS.issuer)}`}
              ref={fdIssuerRef}
            />
          </div>
          <div className="my-3 ml-5 mr-3 text-sm">
            <DropdownParent
              options={filterDropdown(arrayCreditRating)}
              selected={selectedRating}
              toggleOption={toggleOptionRating}
              onSelect={funRating(selectedRating)}
              name={`${translate(COMMON_CONSTANTS.creditRating)}`}
              ref={creditRatingRef}
            />
          </div>
          <div className="my-3 ml-5 mr-3 text-sm">
            <DropdownParent
              options={filterDropdown(arrayPayoutFrequency)}
              selected={selectedPayout}
              toggleOption={toggleOptionPayout}
              onSelect={funPayout(selectedPayout)}
              name={`${translate(COMMON_CONSTANTS.paymentFrequency)}`}
              ref={payoutFrequencyRef}
            />
          </div>
          <div className="my-3 ml-5 mr-3 text-sm">
            <DropdownParent
              options={filterDropdown(arrayFDTenure)}
              selected={selectedTenure}
              toggleOption={toggleOptionTenure}
              onSelect={funTenure(selectedTenure)}
              name={`${translate(COMMON_CONSTANTS.fdTenure)}`}
              ref={fdTenureRef}
            />
          </div>
        </div>
      </div>
      <div>
        <div className="text-thicccboi-bold leading-4 text-black mt-5">
            {translate(PARENT_DETAILS_PAYMENT.showing)} <span className="text-fd-primary">{totalPlans}</span> {translate(PARENT_DETAILS_PAYMENT.plansChooseFd)}
          </div>
      </div>
      <FDplans trailArray={trailArray} productData={productData} isAPIDataLoaded={isAPIDataLoaded} screenType={screenType} />
    </div >
    
  );
}

export default Filter;


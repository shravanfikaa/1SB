import styles from "../../../styles/fd.module.css";
import { useEffect, useRef, useState } from "react";
import { GetApiHandler } from "../../api/apihandler";
import {
  clearSelectedDropdownList,
  getSelectedDropdownList,
  
  charWithNumberInputAndSpecChar,
} from "../../../lib/util";
import appConfig from "../../../app.config";
import "react-datepicker/dist/react-datepicker.css";
import { FaFilter } from "react-icons/fa";
import DatePopup from "../../common/datePopup";
import RMDropdownParent from "../../../_components/RMDropdownParent";
import { useTranslation } from "react-i18next";
import { AGENT, COMMON_CONSTANTS } from "../../../constants";

function OrderBookFDFilter({ updateFilter }) {
  const [issuerList, setIssuerList] = useState([]);
  const [statusList, setStatusList] = useState([]);
  const [selectedIssuer, setSelectedIssuer] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState([]);
  const [isFilterApplied, setIsFilterApplied] = useState(false);
  const [showDateModal, setShowDateModal] = useState(false);
  const [filterDate, setFilterDate] = useState({ startDate: "", endDate: "" });
  const [searchInput, setSearchInput] = useState("");
  const [searchKey, setSearchKey] = useState("");

  const statusRef = useRef(null);
  const { t: translate } = useTranslation();

  const getFilteredResult = (name, selectedList) => {
    //Commenting for future use
    // if (name.toLowerCase().includes("issuer")) {
    //   setSelectedIssuer(selectedList);
    // }
    if (name.toLowerCase().includes("status")) {
      setSelectedStatus(selectedList);
    }
  };

  useEffect(() => {
    
    const getAllCustomersUrl =
      appConfig?.deploy?.baseUrl +
      appConfig?.deploy?.getAllCustomerList;

    GetApiHandler(getAllCustomersUrl, "GET").then((response) => {
      const { data } = response;
      if (data) {
        data.data &&
          data.data.issureList &&
          setIssuerList(filterOptionValues(data.data.issureList));
      }
    });

    const agentBookFDFilter =
      appConfig?.deploy?.baseUrl + appConfig?.deploy?.agentBookFDFilter;

    GetApiHandler(agentBookFDFilter, "GET").then((response) => {
      const { data } = response;
      if (data) {
        data.data && setStatusList(filterOptionValues(data.data));
      }
    });
  }, []);

  useEffect(() => {
    //Commenting few lines for future use
    const { startDate, endDate } = filterDate;
    const status = getSelectedDropdownList(selectedStatus);
    // const issuer = getSelectedDropdownList(selectedIssuer);
    const product = getSelectedDropdownList(selectedProduct);
    if (
      status.length ||
      searchKey.length ||
      // issuer.length ||
      product.length ||
      startDate ||
      endDate
    ) {
      setIsFilterApplied(true);
    } else {
      setIsFilterApplied(false);
    }
    // updateFilter(issuer, product, status, startDate, endDate, searchKey);
    updateFilter(product, status, startDate, endDate, searchKey);
  }, [selectedStatus, filterDate, searchKey]);
  // }, [selectedIssuer, selectedProduct, selectedStatus, filterDate, searchKey]);

  const handleResetFilter = () => {
    setIsFilterApplied(false);
    const clearIssuer = clearSelectedDropdownList([...selectedIssuer]);
    const clearProduct = clearSelectedDropdownList([...selectedProduct]);
    const clearStatus = clearSelectedDropdownList([...selectedStatus]);
    setSelectedProduct(clearProduct);
    setSelectedIssuer(clearIssuer);
    setSelectedStatus(clearStatus);
    setFilterDate({ startDate: "", endDate: "" });
    setSearchKey("");
    setSearchInput("");
  };

  const filterOptionValues = (array) => {
    const filterObject = [];
    Object.keys(array).forEach((val) => {
      filterObject.push({
        id: val,
        title: array[val],
        isSelected: false,
      });
    });
    return filterObject;
  };

  const getModalStatus = (status, values) => {
    setShowDateModal(status);
    if (Object.keys(values).length) {
      setFilterDate(values);
    }
  };

  useEffect(() => {
    const searchResult = setTimeout(() => {
      setSearchKey(searchInput);
    }, 500);
    return () => clearTimeout(searchResult);
  }, [searchInput]);

  return (
    <div className={` pb-0 ${styles.FilterHeader}`}>
      <div className={`bg-white border-b border-slate-300 `}>
        <div className="flex justify-between flex-wrap">
          <div className="flex items-center  gap-3 mb-3 mt-3">
            <div className="text-regular text-2xl text-light-gray">
              <input
                type="text"
                placeholder={translate(AGENT.searchBy)}
                value={searchInput}
                name="searchInput"
                onChange={(e) => {
                  const filteredText = charWithNumberInputAndSpecChar(e.target.value);
                  setSearchInput(filteredText)
                }}
                className="w-auto  text-left border border-gray-300 rounded px-1.5 py-1.5 text-black"
              />
            </div>
            {/* Commenting this for future use */}
            {/* <div className="w-auto">
              <RMDropdownParent
                options={issuerList}
                getFilteredResult={getFilteredResult}
                name="Issuer"
                ref={issuerRef}
              />
            </div> */}
            <div>
              <button
                onClick={() => setShowDateModal(true)}
                className="bg-white w-40  border border-gray-200 rounded-md p-2 text-regular text-2xl text-light-gray text-left"
              >
                {translate(AGENT.dateRange)}
              </button>
              {showDateModal ? (
                <DatePopup
                  getModalStatus={getModalStatus}
                  filterDate={filterDate}
                />
              ) : null}
            </div>
            <div className="w-auto capitalize">
              <RMDropdownParent
                options={statusList}
                getFilteredResult={getFilteredResult}
                name={translate(AGENT.status)}
                ref={statusRef}
              />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="hover:cursor-pointer">
              <FaFilter
                className={`${
                  isFilterApplied ? "text-light-orange" : "text-fd-primary"
                } text-2xl font-bold`}
              />
            </div>
            <div
              className="text-regular text-2xl text-light-red hover:cursor-pointer"
              onClick={handleResetFilter}
            >
              {translate(COMMON_CONSTANTS.resetAll)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default OrderBookFDFilter;

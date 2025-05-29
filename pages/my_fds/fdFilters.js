import { useState, useEffect } from "react";
import MultiSelectDropdown from "../compare_plan/multiselectdropdown";
import appConfig from "../../app.config";
import { GetApiHandler } from "../api/apihandler";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { COMMON_CONSTANTS, AFTER_REVIEW, AGENT, MAKE_PAYMENT_FDS } from "../../constants";
import { useTranslation } from "react-i18next";

let jsonArray = [];

function FdFilter() {
  const [fdStatus, setFdStatus] = useState([]);
  const [selected, setSelected] = useState([]);
  const { t: translate } = useTranslation();

  useEffect(() => {
    var method = "GET";
    var multiProductList =
      appConfig?.deploy?.baseUrl + appConfig?.deploy?.fdHistory;
    GetApiHandler(multiProductList, method)
      .then((response) => {
        setFdStatus(response.data.data);
      })
      .catch((err) => {
        console.log("Error:", err);
      });
  }, []);

  let tempStatusArray = fdStatus;
  let statusArray = [];
  let uniqueStatus = [];

  if (statusArray) {
    for (let i = 0; i < tempStatusArray.length; i++) {
      statusArray.push(tempStatusArray[i]["operational_status"]);
    }
    uniqueStatus = [...new Set(statusArray)];
  }
  if (uniqueStatus) {
    for (let i = 0; i < uniqueStatus.length; i++) {
      const jsonBody = {
        id: "",
        title: "",
      };
      jsonBody.id = uniqueStatus[i];
      jsonBody.title = uniqueStatus[i];
      jsonArray.push(jsonBody);
    }
  }
  const toggleOptionStatus = ({ id }) => {
    setSelected((prevSelected) => {
      const newArray = [...prevSelected];
      if (newArray.includes(id)) {
        return newArray.filter((item) => item != id);
      } else {
        newArray.push(id);

        return newArray;
      }
    });
  };

  const toggleOptionType = ({ id }) => {
    setSelected((prevSelected) => {
      const newArray = [...prevSelected];
      if (newArray.includes(id)) {
        return newArray.filter((item) => item != id);
      } else {
        newArray.push(id);

        return newArray;
      }
    });
  };

  return (
    <div className=" page-background  view_container_sm view-container">
      <div className=" bg-white border-b border-slate-300">
        <div className="flex flex-row lg:space-x-9 justify-items-stretch justify-start  mt-5 mb-5 ">
          <label className="text-apercu">
            <input
              type="text"
              placeholder={translate(AGENT.search)}
              className="w-24 text-center border border-gray-300 rounded px-1 py-1.5 text-apercu text-black "
            />
          </label>
          <div>
            <MultiSelectDropdown
              options={jsonArray}
              selected={selected}
              toggleOption={toggleOptionType}
              name={translate(AGENT.type)}
            />
          </div>

          <div>
            <MultiSelectDropdown
              options={jsonArray}
              selected={selected}
              toggleOption={toggleOptionStatus}
              name={translate(AGENT.status)}
            />
          </div>

          <div>
            <div className="text-apercu">
              <button
                type="button"
                className=" bg-white text-gray-400 shadow border border-gray-200 rounded-md text-gray-400 text-sm tracking-wide 
                                w-auto p-2 sm:text-xs md:text-sm lg:text-md xl:text-md "
                data-bs-toggle="modal"
                data-bs-target="#exampleModal"
              >{translate(AGENT.dateRange)}
              </button>
              <div
                className="modal fade fixed top-0 left-0 hidden w-full h-full outline-none overflow-x-hidden overflow-y-auto"
                id="exampleModal"
                tabIndex="-1"
                aria-labelledby="exampleModalLabel"
                aria-hidden="true"
              >
                <div className="modal-dialog relative w-auto pointer-events-none text-apercu">
                  <div className="modal-content border-none shadow-lg relative flex flex-col w-full pointer-events-auto bg-white bg-clip-padding rounded-md outline-none text-current">
                    <div className="modal-header flex flex-shrink-0 items-center justify-between p-4  rounded-t-md">
                      <h5
                        className="text-apercu text-xl font-semibold leading-normal text-black"
                        id="exampleModalLabel"
                      >
                        {translate(AGENT.dateRange)}
                      </h5>
                      <button
                        type="button"
                        className="btn-close box-content w-4 h-4 p-1 text-black border-none rounded-none opacity-50 focus:shadow-none focus:outline-none focus:opacity-100 hover:text-black hover:opacity-75 hover:no-underline"
                        data-bs-dismiss="modal"
                        aria-label="Close"
                      ></button>
                    </div>
                    <div className="modal-body relative px-2">
                      <h6 className="pl-2 text-apercu text-gray-500 font-bold">
                        {translate(AFTER_REVIEW.openDate)}

                      </h6>
                      <div className="flex flex-row m-3">
                        <DatePicker
                          className="px-3  ml-4 py-2.5 border border-gray-300 rounded  text-neutral-800 text-apercu-regular"
                          placeholderText={translate(MAKE_PAYMENT_FDS.from)}
                          showYearDropdown
                          scrollableYearDropdown
                        />
                        <DatePicker
                          className="px-3 ml-4 py-2.5 border border-gray-300 rounded  text-neutral-800 text-apercu-regular"
                          placeholderText="To"
                          showYearDropdown
                          scrollableYearDropdown
                        />
                      </div>
                      <h6 className="pl-2 text-apercu text-gray-500 font-bold">
                        {translate(AFTER_REVIEW.maturityDate)}
                      </h6>

                      <div className="flex flex-row m-3 ">
                        <DatePicker
                          className="px-3  ml-4 py-2.5 border border-gray-300 rounded  text-neutral-800 text-apercu-regular"
                          placeholderText={translate(MAKE_PAYMENT_FDS.from)}
                          showYearDropdown
                          scrollableYearDropdown
                        />
                        <DatePicker
                          className="px-3 ml-4 py-2.5 border border-gray-300 rounded  text-neutral-800 text-apercu-regular"
                          placeholderText={translate(MAKE_PAYMENT_FDS.to)}
                          showYearDropdown
                          scrollableYearDropdown
                        />
                      </div>
                      <div className="m-7 flex justify-center">
                        <button
                          type="button"
                          data-bs-dismiss="modal"
                          aria-label="Close"
                          className="ml-3 button-passive text-sm text-apercu font-semibold xl:w-32 lg:w-28 md:w-20 sm:w-20 xs:w-12"
                        >
                          {translate(COMMON_CONSTANTS.cancel)}
                        </button>
                        <button
                          type="button"
                          className="ml-10 text-sm button-transition hover:bg-hover-primary text-apercu button-active btn-gradient xl:w-36 lg:w-28 md:w-20 sm:w-20 xs:w-12"
                        >
                          {translate(AGENT.apply)}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="border-slate-200 border-l"></div>
          <div className="mt-2 flex flex-row space-x-7">{translate(MAKE_PAYMENT_FDS.filterIcon)}</div>
        </div>
      </div>
    </div>
  );
}
export default FdFilter;

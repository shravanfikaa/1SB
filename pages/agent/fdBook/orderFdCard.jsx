import { dateFormat } from "../../../lib/util";
import { BsThreeDots } from "react-icons/bs";
import { AGENT, COMMON_CONSTANTS, RM_VIEW_OPTIONS } from "../../../constants";
import { useEffect, useRef, useState } from "react";
import appConfig from "../../../app.config";
import { PostApiHandler } from "../../api/apihandler";
import ErrorModal from "../../common/errorPopup";
import { MdContentCopy } from "react-icons/md";
import { Tooltip } from "@material-tailwind/react";
import { FaUserAlt } from "react-icons/fa";
import { useTranslation } from "react-i18next";

function OrderFdCard({ orderFdData, updateAppHistoryModalState, toggleLoadingStatus }) {
  const [viewFlag, setViewFlag] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [apiErrorMessage, setApiErrorMessage] = useState("");
  const [messageType, setmessageType] = useState("");
  const [copyJourneyID, setCopyJourneyID] = useState("");
  
  const dropdownRef = useRef(null);
  const toggleErrorModal = () => setShowErrorModal((state) => !state);
  const { t: translate } = useTranslation();

  const copyContentToClipboard = async () => {
    const id = orderFdData.journey_id;
    let text = document.getElementById(id).innerHTML;
    const { product_name, manufacturer_id, order_amount } = orderFdData;
    text = `FD Name: ${product_name} 
    \nFD Issuer Name: ${manufacturer_id} 
    \nFD Amount: ${order_amount}`;

    try {
      await navigator.clipboard.writeText(text);
      setCopyJourneyID(id);
    } catch (err) {
      console.error("Failed to copy: ", err);
    }
  };

  const toggleViewOption = (option, id) => {
    if (option === "appHistory") {
      updateAppHistoryModalState(option, id);
    } else if (option === "cancelApplication") {
      cancelFDApplication(id);
    } else {
      shareOnboardingLink(option);
    }
  };

  const toggleViewDropdown = () => {
    setViewFlag(!viewFlag);
  }

  const cancelFDApplication = (customerFdId) => {
    
    const downloadURL =
      appConfig?.deploy?.baseUrl +
      appConfig?.deploy?.rmCancelFdApplication +
      "/" +
      orderFdData.journey_id;
    PostApiHandler(downloadURL, "Post")
      .then((response) => {
        if (response?.data?.errors?.length) {
          response?.data.errors &&
            setApiErrorMessage(response.data.errors[0].errorMessage);
          setmessageType("alert");
          setShowErrorModal(true);
        } else if (response?.data?.data) {
          response?.data?.data?.status &&
            setApiErrorMessage(response.data.data.status);
          setmessageType("Success");
          setShowErrorModal(true);
        } else {
          setApiErrorMessage("Something went wrong");
          setmessageType("alert");
          setShowErrorModal(true);
        }
      })
      .catch((err) => {
        console.error("Error:", err);
      });
  }

  const shareOnboardingLink = (option) => {
    toggleLoadingStatus();
    
    const downloadURL =
      appConfig?.deploy?.baseUrl +
      appConfig?.deploy?.rmShareOnboardingLink;

    PostApiHandler(downloadURL, "Post", {
      mode: option.toLowerCase().includes("onboarding")
        ? "onboarding"
        : "payment",
      journey_id: orderFdData.journey_id,
    })
      .then((response) => {
        toggleLoadingStatus();
        if (response?.data?.errors?.length) {
          response?.data?.errors &&
            setApiErrorMessage(response.data.errors[0].errorMessage);
          setmessageType("alert");
          setShowErrorModal(true);
        } else if (response?.data?.data) {
          response?.data?.data?.status &&
            setApiErrorMessage(response.data.data.status);
          setmessageType("Success");
          setShowErrorModal(true);
        } else {
          setApiErrorMessage("Something went wrong");
          setmessageType("alert");
          setShowErrorModal(true);
        }
      })
      .catch((err) => {
        console.error("Error:", err);
      });
  }

  useEffect(() => {
    const MOUSE_UP = "mouseup";
    const handleOutsideClick = (event) => {
      if (
        event.target !== dropdownRef.current &&
        !dropdownRef.current?.contains(event.target) &&
        event.target.localName !== "li"
      ) {
        setViewFlag(false);
      }
    };
    document.addEventListener(MOUSE_UP, handleOutsideClick);

    return () => document.removeEventListener(MOUSE_UP, handleOutsideClick);
  });

  return (
    <div>
      {orderFdData ? (
        <div key={orderFdData.id}>
          <div className="flex flex-wrap justify-between border-b my-5 pb-2 w-full text-xl text-regular">
            <div className="flex flex-row gap-3 w-1/4">
              <div className="">
                <FaUserAlt className="text-fd-primary" size={"50px"} />
              </div>
              <div className="flex flex-col break-words w-10/12">
                <div className="text-light-gray">{orderFdData.journey_id}</div>
                <div className="text-fd-primary">
                  <p className="hyphens-auto">
                    {orderFdData.customer_first_name}
                  </p>
                </div>
                <div className="text-light-gray">
                  {orderFdData.customer_pan}
                </div>
              </div>
            </div>
            <div className="flex flex-col w-1/4">
              <div className="flex flex-row justify-between gap-1">
                <div className="w-1/3 text-light-gray">{translate(AGENT.fdIssuer)}</div>
                <div className="w-2/3 text-black" id={orderFdData.journey_id}>
                  {orderFdData.manufacturer_name}
                </div>
              </div>
              <div className="flex flex-row justify-between gap-1">
                <div className="w-1/3 text-light-gray">{translate(AGENT.fdName)}</div>
                <div className="w-2/3 break-words text-black">
                  {orderFdData.product_name}
                </div>
              </div>
              <div className="flex flex-row justify-between gap-1">
                <div className="w-1/3 text-light-gray">{translate(AGENT.fdAmount)}</div>
                <div className="w-2/3 break-words text-black">
                  {orderFdData.order_amount}
                </div>
              </div>
            </div>
            <div className="flex flex-col w-1/4">
              <div className="flex flex-row justify-between">
                <div className="w-1/2 text-light-gray">{translate(AGENT.dateOfBooking)}</div>
                <div className="w-1/2 text-black">
                  {dateFormat(orderFdData.order_date)}
                </div>
              </div>
              <div className="flex flex-row justify-between">
                <div className="w-1/2 text-light-gray"> {translate(AGENT.updatedDate)}</div>
                <div className="w-1/2 text-black">
                  {dateFormat(orderFdData.order_update_date)}
                </div>
              </div>
              <div className="flex flex-row justify-between">
                <div className="w-1/2 text-light-gray">{translate(AGENT.source)}</div>
                <div className="w-1/2 capitalize text-fd-primary">
                  {orderFdData.order_source}
                </div>
              </div>
              <div className="flex flex-row justify-between">
                <div className="w-1/2 text-light-gray">{translate(AGENT.status)}</div>
                <div className="w-1/2 capitalize text-fd-primary">
                  {orderFdData.order_status}
                </div>
              </div>
            </div>
            <div className="w-1/12 w-auto mr-4">
              <div className="flex flex-col gap-2 ">
                <div className="c-multi-select-dropdown w-fit">
                  <Tooltip
                    content={translate(COMMON_CONSTANTS.copyClip)}
                    className="border border-blue-gray-50 bg-white px-4 py-3 shadow-xl shadow-black/10 text-base text-medium text-black"
                  >
                    <button
                      className={`button-passive w-[80px] border-fd-primary text-fd-primary p-1 py-1.5 h-fit flex justify-center items-center gap-2 text-base text-medium`}
                      onClick={() => copyContentToClipboard()}
                    >
                      <MdContentCopy className="text-fd-primary" />
                      {translate(AGENT.copy)}
                    </button>
                  </Tooltip>
                </div>
                <div className="c-multi-select-dropdown w-fit">
                  <button
                    className="button-passive border-fd-primary text-fd-primary w-[80px] p-1.5 h-fit flex justify-center items-center gap-2 text-base text-medium"
                    onClick={toggleViewDropdown}
                  >
                    <BsThreeDots className="content-center text-fd-primary" />
                    {translate(AGENT.more)}
                  </button>
                  {viewFlag ? (
                    <ul
                      className="c-multi-select-dropdown__options w-fit shadow border border-gray-200"
                      ref={dropdownRef}
                    >
                      {Object.keys(RM_VIEW_OPTIONS).map((option, index) => {
                        return (
                          <div
                            key={index}
                            onClick={() =>
                              toggleViewOption(option, orderFdData.cust_fd_id)
                            }
                          >
                            <li
                              className="c-multi-select-dropdown__option hover:bg-background-secondary py-0.5 rounded"
                              onClick={() => setViewFlag(false)}
                            >
                              <div className="flex gap-2">
                                <div className="hoveritems text-regular text-xl whitespace-nowrap text-black">
                                  {translate(RM_VIEW_OPTIONS[option])}
                                </div>
                              </div>
                            </li>
                          </div>
                        );
                      })}
                    </ul>
                  ) : null}
                  <ErrorModal
                    canShow={showErrorModal}
                    updateModalState={toggleErrorModal}
                    errorMessage={apiErrorMessage}
                    messageType={messageType}
                  />{" "}
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default OrderFdCard;

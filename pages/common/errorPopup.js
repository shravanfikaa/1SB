import React from "react";
import { FaInfoCircle } from "react-icons/fa";
import popupcss from "../../styles/popup_modals.module.css"
import { ADDRESS_DETAILS } from "../../constants";
import { useTranslation } from "react-i18next";
import GreenCheckMark from "../../svg/GreenCheckMark";

const ErrorModal = ({ canShow, updateModalState, errorMessage, errorDetails = "", messageType = "alert" }) => {
  const { t: translate } = useTranslation();
  if (canShow) {
    return (
      <>
        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="fixed inset-0 w-auto h-auto bg-black opacity-25"
            onClick={updateModalState}
          ></div>
          <div className="flex justify-center items-center min-h-screen ">
            <div className={`relative ${popupcss.compare_popup_width} mx-10 p-5 bg-white rounded-md`}>
              <div className="flex flex-col break-all text-regular text-2xl text-center ">
                {messageType.toLowerCase() == "error" || messageType.toLowerCase() == "alert" ?
                  <div className="flex items-center justify-center flex-none w-12 h-12 mx-auto bg-red-100 rounded-full">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="w-6 h-6 text-light-red"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  : messageType.toLowerCase() == "success" ? <div className="flex items-center justify-center flex-none w-12 h-12 mx-auto rounded-full">
                    <GreenCheckMark />
                  </div> :
                    <div className="flex items-center justify-center flex-none w-12 h-12 mx-auto rounded-full">
                      <FaInfoCircle size={35} color="#5C82A8" />
                    </div>
                }
                <div className="mt-2 text-center ">
                  <div className="text-medium text-4xl text-black capitalize">
                    {messageType}
                  </div>
                  <div className="break-normal text-black break-words"> {typeof errorMessage === "string" ? errorMessage : JSON.stringify(errorMessage)} </div>
                  <div className="break-normal text-black break-words">{typeof errorDetails === "string" ? errorDetails : JSON.stringify(errorDetails)} </div>
                  <div className="justify-center gap-2 mt-3">
                    <button
                      className="button-passive border-fd-primary text-fd-primary"
                      onClick={updateModalState}
                    >
                      {translate(ADDRESS_DETAILS.close)}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }
  return null;
};

export default ErrorModal;

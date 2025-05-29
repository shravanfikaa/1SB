import React from "react";
import { FaInfoCircle } from "react-icons/fa";
import popupcss from "../../styles/popup_modals.module.css"
import { ADDRESS_DETAILS, AGENT } from "../../constants";
import { useTranslation } from "react-i18next"
const ApplicationStatusModal = ({
  canShow,
  updateModalState,
  message,
  messageDetails = "",
  messageType = "error",
  isMultiMsg = false,
  multiMsgList = [],
}) => {
  const { t: translate } = useTranslation();
  if (canShow) {
    return (
      <>
        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="fixed inset-0 w-auto h-auto bg-black opacity-25"
            onClick={() => {
              setOpenModal(false);
            }}
          ></div>
          <div className="flex justify-center items-center min-h-screen ">
            <div className={`relative ${popupcss.compare_popup_width} p-5 bg-white rounded-md`}>
              <div className="flex flex-col text-regular text-2xl break-normal text-center">
                {messageType.toLowerCase() == "error" ? (
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
                ) : (
                  <div className="flex items-center justify-center flex-none w-12 h-12 mx-auto rounded-full">
                    <FaInfoCircle size={35} color="#5C82A8" />
                  </div>
                )}
                <div className="mt-2 break-normal text-center">
                  <div className="text-medium text-4xl text-gray-800">
                    {messageType.toLowerCase() == "error"
                      ? "Error"
                      : messageType}
                  </div>
                  {!isMultiMsg ? (
                    <div>
                      {JSON.stringify(message)}
                      <br />
                      {messageDetails ? JSON.stringify(messageDetails) : ""}
                    </div>
                  ) : (
                    <div className="flex justify-center">
                      <table className="border-collapse border border-background-primary0 ...">
                        <thead>
                          <tr>
                            <th className="border border-slate-700 ...">
                              &nbsp;&nbsp;Activity
                            </th>
                            <th className="border border-slate-700 ...">
                              &nbsp;&nbsp;Status
                            </th>
                            <th className="border border-slate-700 ...">
                              &nbsp;&nbsp;{translate(AGENT.date)}
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {multiMsgList.map(function (object, index) {
                            return (
                              <tr>
                                <td className="border border-slate-700 ...">
                                  &nbsp;&nbsp;{object["Status_Category"]}
                                  &nbsp;&nbsp;
                                </td>
                                <td className="border border-slate-700 ...">
                                  &nbsp;&nbsp;{object["Status"]}&nbsp;&nbsp;
                                </td>
                                <td className="border border-slate-700 ...">
                                  &nbsp;&nbsp;{object["Status_Date"]}
                                  &nbsp;&nbsp;
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                  <div className="flex justify-center gap-2 mt-3">
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

export default ApplicationStatusModal;

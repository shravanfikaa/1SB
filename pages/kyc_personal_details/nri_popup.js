import React from "react";
import popupcss from "../../styles/popup_modals.module.css"
import { ADDRESS_DETAILS } from "../../constants";
import { useTranslation } from "react-i18next";
const NriPopUp = ({ updateModalState, errorMessage }) => {
  const { t: translate } = useTranslation();
  return (
    <>
      <div className="fixed inset-0 z-10 overflow-y-auto">
        <div className="fixed inset-0 w-auto h-auto bg-black opacity-25"></div>
        <div className="flex items-center min-h-screen ">
          <div className={`relative ${popupcss.compare_popup_width} p-5 mx-auto bg-white rounded-md`}>
            <div className="flex flex-col break-normal text-center text-medium text-2xl text-black">
              <div className="flex justify-center">
                {errorMessage}
              </div>
              <div className="gap-2 mt-3 flex justify-center">
                <button
                  className="button-passive border-fd-primary text-fd-primary"
                  onClick={() => updateModalState({ show: false, message: "" })}
                >
                  {translate(ADDRESS_DETAILS.close)}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default NriPopUp;

import React from "react";
import popupcss from "../../styles/popup_modals.module.css"
import { useTranslation } from "react-i18next";
import { REDIRECTION_MSG } from "../../constants";

const ProgressPopup = ({ title, message1, message2, note }) => {
  const { t: translate } = useTranslation();
  return (
    <>
      <div className="fixed inset-0 z-10 overflow-y-auto">
        <div className="fixed inset-0 w-auto h-auto bg-black opacity-25" ></div>
        <div className="flex items-center min-h-screen ">
          <div className={`relative ${popupcss.compare_popup_width} p-5 mx-auto bg-white rounded-md`}>
            <div className="flex flex-col text-medium break-normal text-center">
              <div className={`flex justify-center text-black text-6xl ${popupcss.verify_bank_heading}`}>
                {translate(title)}
              </div>
              <div className="flex justify-center text-gray-600 text-2xl">
                {translate(message1)}
                <br />
                {translate(message2)}
              </div>
              <div className="flex justify-center w-full text-fd-primary my-2">
                <div className="horizontal-bar-wrap">
                  <div className="bar1 bar btn-gradient"></div>
                </div>
              </div>
              <div className=" flex justify-center text-fd-primary text-2xl">
                {translate(REDIRECTION_MSG.msg)}
                {/* {note} */}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ProgressPopup;

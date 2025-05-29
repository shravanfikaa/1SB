import React from "react";
import popupcss from "../../styles/popup_modals.module.css"
import { BANK_DETAILS_PAGE } from "../../constants";
import { useTranslation } from "react-i18next";

const BankPopUp = ({ canShow, updateModalState, errorMessage }) => {
  const { t: translate } = useTranslation();
  if (canShow) {
    return (
      <>
        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div
            className="fixed inset-0 w-auto h-auto bg-black opacity-25">
          </div>
          <div className={`flex items-center min-h-screen ${popupcss.compare_pop_size}`}>
            <div className={`relative h-max bg-white rounded-md p-5 ${popupcss.compare_popup_width}`}>
              <div className="sm:flex justify-center text-medium">
                <div className="flex flex-col space-y-5 break-normal text-center">
                  <div className={`flex justify-center text-black text-4xl`}>
                    {translate(BANK_DETAILS_PAGE.verifyingBankAccount)}
                  </div>
                  <div className="flex justify-center text-gray-600 text-2xl">
                    {translate(BANK_DETAILS_PAGE.waitVerifyAccount)}
                  </div>
                  <div className="flex justify-center w-full text-fd-primary my-2">
                    <div className="horizontal-bar-wrap">
                      <div className="bar1 bar btn-gradient"></div>
                    </div>
                  </div>
                  <div className=" flex justify-center text-fd-primary text-2xl">
                    {translate(BANK_DETAILS_PAGE.credit1RsToAccount)}
                  </div>
                  {JSON.stringify(errorMessage)}
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

export default BankPopUp;

import { useState } from "react";
import product_list_css from "../../styles/product_list.module.css";
import CompareFDVsGold from "../../_components/CompareFDVsGold";
import Image from "next/image";
import { useTranslation } from "react-i18next";
import { COMMON_CONSTANTS, PARENT_DETAILS_PAYMENT } from "../../constants";

function FDVsGoldComparePlan() {
  const [showCompareModal, setShowCompareModal] = useState(false);
  const { t: translate } = useTranslation();
  const toggleModal = () => {
    setShowCompareModal((state) => !state);
  };

  return (
    <div>
      <div
        className={`${product_list_css.hide_card_right} rounded-xl bg-gold p-2 overflow-hidden drop-shadow-md bg-white px-4 pt-4 mt-3`}
      >
        <div className="text-left pb-4">
          <div className="flex flex-row justify-between">
            <div className="flex flex-col">
              <span className="text-thicccboi-medium text-black"> {translate(PARENT_DETAILS_PAYMENT.stillConfused)} </span>
              <span className="text-medium text-4xl text-black">{translate(COMMON_CONSTANTS.compare)}</span>
              <span className="text-medium text-4xl text-black">{translate(PARENT_DETAILS_PAYMENT.fdAgainstGold)}</span>
            </div>
            <div>
              <Image
                src="https://1sb-artifacts.s3.ap-south-1.amazonaws.com/FD/FdVsGold.png"
                alt="FD vs Gold logo"
                width={105}
                height={105}
              />
            </div>
          </div>

          <button
            className="text-medium text-2xl border border-semi-orange rounded-md text-white px-8 py-3 mt-4 bg-semi-orange  hover:bg-hover-primary hover:border-hover-primary"
            onClick={() => setShowCompareModal(true)}
          >
            {translate(COMMON_CONSTANTS.compare)}
          </button>
        </div>
      </div>
      {showCompareModal ? <CompareFDVsGold toggleModal={toggleModal} /> : null}
    </div>
  );
}

export default FDVsGoldComparePlan;

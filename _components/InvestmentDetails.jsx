import { FaRegEdit } from "react-icons/fa";
import review_invest_css from "../styles/review_invest_css.module.css";
import { displayINRAmount, extractedMaturityInstructionValue } from "../lib/util";
import ProductDetails from "../pages/onboarding/view_product_details";
import { useState } from "react";
import FDInfoSection from "./FdInfoSection";
import { useTranslation } from "react-i18next";
import { COMMON_CONSTANTS, FD_RENEWAL } from "../constants";

const InvestmentDetails = ({
  handleInvestmentDetailsEdit,
  investment_details,
  showProductInfoSection,
  allowEdit
}) => {

  const [showProductInfo, setShowProductInfo] = useState(false);
  const toggleProductInfo = () => setShowProductInfo((state) => !state);
  const { t: translate } = useTranslation();
  let maturity = "";
  let selectedManufactureId = "";

  if (typeof window !== "undefined") {
    selectedManufactureId = sessionStorage.getItem("selectedManufactureId");
  }

  if (typeof investment_details?.maturityInstruction === "string") {
    if (investment_details?.maturityInstruction.length === 1) {
      maturity = extractedMaturityInstructionValue(investment_details?.maturityInstruction);
    } else {
      const maturityInst = JSON.parse(investment_details?.maturityInstruction)
      maturity = extractedMaturityInstructionValue(maturityInst?.maturity_instruction);
    }
  } else {
    maturity = extractedMaturityInstructionValue(investment_details?.maturityInstruction?.maturity_instruction);
  }

  return (
    <>
      <div className="flex flex-col border-b-2 user_journey_container rounded-xl p-[20px] h-[100%]">
        <div className="flex flex-row justify-between mb-3 items-center">
          <div className="text-medium text-black text-xxl">{translate(FD_RENEWAL.investmentDetails)}
          </div>
          <div className={`${allowEdit ? 'visible' : 'hidden'}`}>
            <div
              className="flex flex-row gap-2 items-center justify-center text-bold text-2xl text-fd-primary hover:cursor-pointer border rounded-md btn-gradient p-2"
              onClick={handleInvestmentDetailsEdit}
            >
              <button type="button" class="btn btn-secondary" data-toggle="tooltip" data-placement="top" title="Edit Investment Details">
                <FaRegEdit fill="#ffff" width={'10px'} />
              </button>
              {/* {translate(FD_RENEWAL.edit)} */}
            </div>
          </div>
        </div>
        <div className=" items-center  gap-3 w-full lg:flex-nowrap">
          {showProductInfoSection && (
            <FDInfoSection
              investment_details={investment_details}
              toggleProductInfo={toggleProductInfo}
            />
          )}
          <div className="flex justify-around">
            <div
              className={`${review_invest_css.basic_detail_status_position} w-full gap-3 flex text-regular  text-2xl text-light-gray`}
            >
              <div className={` `}>

                <div className="text-subcontent">{translate(FD_RENEWAL.depositAmount)}</div>
                <div className="text-black">
                  ₹{" "}
                  {investment_details && investment_details.depositAmount
                    ? displayINRAmount(investment_details.depositAmount)
                    : ""}
                </div>
              </div>
              <div className={``}>
                <div className="text-subcontent">{translate(COMMON_CONSTANTS.tenure)}</div>
                {investment_details?.displayTenure ? <div className="text-black">
                  {investment_details?.displayTenure
                    ? investment_details?.displayTenure
                    : ""}
                </div> : <div className="text-black">
                  {investment_details?.tenureYears
                    ? investment_details?.tenureYears + `${translate(COMMON_CONSTANTS.years)} `
                    : ""}
                  {investment_details?.tenureMonths
                    ? investment_details?.tenureMonths + " Month(s) "
                    : ""}
                  {investment_details?.tenureDays
                    ? investment_details?.tenureDays + `${translate(COMMON_CONSTANTS.days)}`
                    : ""}
                </div>}
              </div>
            </div>
            <div
              className={`${review_invest_css.basic_detail_status_position} flex text-regular gap-3  felx-wrap text-2xl text-light-gray w-full`}
            >
              <div className={``}>
                <div className="text-subcontent">{translate(COMMON_CONSTANTS.interestRate)}</div>
                <div className="text-black">
                  {investment_details?.interestRate}%
                </div>
              </div>
              <div className={``}>
                <div className="text-subcontent normal-case text-xl">{translate(FD_RENEWAL.maturityInstruction)}</div>
                <div className="text-black">{maturity} </div>
              </div>
            </div>
            <div
              className={`${review_invest_css.basic_detail_status_position} text-regular flex gap-3 text-2xl text-light-gray w-full`}
            >
              {
                selectedManufactureId?.toUpperCase() !== "PNBHFC" && selectedManufactureId?.toUpperCase() !== "UNITY" ? <div className={` `}>
                  <div className="text-subcontent">{translate(FD_RENEWAL.form15G)}</div>
                  <div className="text-black">
                    {investment_details
                      ? investment_details?.form15g === true
                        ? `${translate(FD_RENEWAL.yes)}`
                        : `${translate(FD_RENEWAL.no)}`
                      : ""}
                  </div>
                </div> : null
              }
              <div className={``}>
                <div className="text-subcontent">{translate(COMMON_CONSTANTS.payoutFrequency)}</div>
                <div className="text-black">
                  {investment_details?.payout ?
                    investment_details.payout : investment_details?.payoutFrequency ? investment_details?.payoutFrequency : ""}
                </div>
              </div>
            </div>
          </div>

          {showProductInfo && investment_details ? (
            <ProductDetails
              toggleProductInfo={toggleProductInfo}
              productInfo={{
                manufacturerId: investment_details.manufacturerId,
                productId: investment_details.productId,
                productType: investment_details.productType,
              }}
            />
          ) : null}
        </div>
      </div>
    </>
  );
};

export default InvestmentDetails;

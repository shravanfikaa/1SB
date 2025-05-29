import { useTranslation } from "react-i18next";
import { AGENT, COMMON_CONSTANTS } from "../constants";
import review_invest_css from "../styles/review_invest_css.module.css";

const FDInfoSection = ({ investment_details, toggleProductInfo }) => {
  const { t: translate } = useTranslation();
  return (
    <div
      className={`${review_invest_css.basic_detail_status_position} flex text-regular gap-5 text-2xl text-light-gray mb-3 `}
    >
      <div className={`flex flex-col w-full `}>
        <div>{translate(AGENT.fdIssuer)}</div>
        <div>
          <div className="w-auto">
            <img
              src={investment_details?.investmentBankLogoUrl}
              width="64"
              height="64"
              objectFit={"contain"}
            ></img>
          </div>
        </div>
        <div className="text-black text-medium text-3xl">
          {investment_details ? investment_details.productName : ""}
        </div>
      </div>
      <div className={`flex flex-col w-full`}>
        <div>{translate(AGENT.fdName)}</div>
        <div className="text-black">
          {investment_details ? investment_details.productName : ""}
        </div>

      </div>
      <div className="w-full text-end">
        <div
          className="text-black text-xl text-light-blue underline cursor-pointer"
          onClick={toggleProductInfo}
        >
          {translate(COMMON_CONSTANTS.ViewDetails)}
        </div>
      </div>
    </div>
  )
}
export default FDInfoSection;
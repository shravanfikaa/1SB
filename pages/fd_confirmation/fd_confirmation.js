import { useState } from "react";
import ComponentHolder from "../component_holder/component_holder";
import GreenCheckMark from "../../svg/GreenCheckMark";
import { useTranslation } from "react-i18next";
import { COMMON_CONSTANTS, FD_RENEWAL,AFTER_REVIEW, DETAIL_FD} from "../../constants";

function FDConfirmation() {
  const [FrontFlag, setFrontFlag] = useState(true)
  const [BackFlag, setBackFlagFlag] = useState(true)
  const { t: translate } = useTranslation();
  return (
    <div> {FrontFlag && BackFlag ?
      <div className="bg-white w-12/12  text-center pt-32 flex flex-col space-y-4 text-apercu-medium">
        <span className="text-primary-green text-5xl flex justify-center  rounded-full"><GreenCheckMark /></span>
        <span className="text-primary-green text-xl">{translate(AFTER_REVIEW.congratulations)} !</span>
        <span className="text-xl">{translate(DETAIL_FD.fdsuccessfullyBooked)}</span>
        <span className="text-sm text-apercu">{translate(DETAIL_FD.mailFdDetailsOnEmail)}</span>
        <span className="text-2xl text-apercu uppercase text-gray-500">{translate(DETAIL_FD.yourFDDetails)}</span>
        <div className="flex justify-center">
          <div className="border-solid border-2 border-gary-600 w-3/5">
            <div className="flex flex-row justify-center">
              <div className="flex flex-col ">
                <span className="text-xl">{translate(DETAIL_FD.corporateFdPlan1)}</span>
                <span className="text-apercu text-gary-500">{translate(COMMON_CONSTANTS.cumulative)}</span>
              </div>
            </div>
            <div className="flex justify-center text-sm py-4">
              <table className="table-fixed ">
                <thead>
                  <tr className="text-apercu-extra-light text-gary-200">
                  
                  <th>{translate(AFTER_REVIEW.refNumber)}</th>
                    <th>{translate(AFTER_REVIEW.fdrNumber)}</th>
                    <th>{translate(COMMON_CONSTANTS.interestRate)}</th>
                  <th>{translate(FD_RENEWAL.depositAmount)}</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>123242</td>
                    <td>{translate(AFTER_REVIEW.underProcess)}</td>
                    <td>7.20% {translate(DETAIL_FD.pa)}</td>
                    <td>₹ 2,00,000</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="flex justify-center text-sm pb-5">
              <table className="table-fixed">
                <thead>
                  <tr className="text-apercu-extra-light text-gary-200">
                    <th>{translate(COMMON_CONSTANTS.tenure)}</th>
                    <th>{translate(AFTER_REVIEW.openDate)}*</th>
                    <th>{translate(AFTER_REVIEW.maturityDate)}*</th>
                    <th>{translate(AFTER_REVIEW.bookingStatus)}</th>
                                            
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>6 Yrs</td>
                    <td>30th Jun 2021</td>
                    <td>30th Jun 2027</td>
                    <td>{translate(AFTER_REVIEW.underProcess)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
        <span className="text-medium flex justify-center text-xl"> {translate(DETAIL_FD.disclaimerByBajaj)} </span>
        <span className="text-medium text-al"> </span>
        <div className="pb-10">
          <button className="button-passive border-fd-primary text-fd-primary mr-3">{translate(DETAIL_FD.myProfile)}</button>
        </div>
      </div> : (!FrontFlag && BackFlag) ? <ComponentHolder parameter={"nomination"} />
        : (FrontFlag && !BackFlag) ? <ComponentHolder parameter={"customer_address"} /> : null}
    </div>
  );
}

export default FDConfirmation;
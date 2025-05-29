import { useTranslation } from "react-i18next";
import { COMMON_CONSTANTS, PARENT_DETAILS_PAYMENT } from "../constants";

function DraftDetails() {
  const { t: translate } = useTranslation();

  return (
    <>
      <div>
        <div class="bg-white shadow-md border border-gray-300 rounded-md opacity-100 w-88">
          <div className="p-2.5">
            <p className="heading">{translate(PARENT_DETAILS_PAYMENT.videoKyc)}</p>
            <div class="date-namediv">
              <div className="leftside">
                <p className="sceduleon">{translate(PARENT_DETAILS_PAYMENT.scheduledOn)}</p>
                <div className="dateblock">
                  <p>28</p>
                </div>
                <div className="monthblock">
                  <p className="dateandyear">Oct, 2023</p>
                </div>
              </div>
              <div className="rightside">
                <p className="heading">{translate(PARENT_DETAILS_PAYMENT.utkarshSfBankFdPlan2)}</p>
                <div className="date-namediv">
                  <div>
                    <p className="sceduleon">{translate(PARENT_DETAILS_PAYMENT.depositAmt)}</p>
                    <div className="">
                      <p className="rate">Rs. 20,000</p>
                    </div>
                  </div>
                  <div>
                    <p className="sceduleon">{translate(PARENT_DETAILS_PAYMENT.tennure)}</p>
                    <div className="">
                      <p className="rate">2 {translate(COMMON_CONSTANTS.years)}</p>
                    </div>
                  </div>
                  <div>
                    <p className="sceduleon">{translate(COMMON_CONSTANTS.interestRate)}</p>
                    <div className="">
                      <p className="rate">9.10%</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex gap-2.5 justify-between mt-4">
              <button className="button-active btn-gradient button-transition hover:bg-hover-primary text-medium text-xl lg:text-2xl w-fit   text-medium text-xl lg:text-2xl w-fit">{translate(PARENT_DETAILS_PAYMENT.resume)}</button>
              <button className="button-passive border-fd-primary text-fd-primary">{translate(PARENT_DETAILS_PAYMENT.discard)}</button>
            </div>
          </div>
          <hr></hr>
          <div className="p-2.5">
            <p className="heading">{translate(PARENT_DETAILS_PAYMENT.videoKyc)}</p>
            <div class="date-namediv">
              <div className="leftside">
                <p className="sceduleon">{translate(PARENT_DETAILS_PAYMENT.scheduledOn)}</p>
                <div className="dateblock">
                  <p>28</p>
                </div>
                <div className="monthblock">
                  <p className="dateandyear">Oct, 2023</p>
                </div>
              </div>
              <div className="rightside">
                <p className="heading">{translate(PARENT_DETAILS_PAYMENT.utkarshSfBankFdPlan2)}</p>
                <div className="date-namediv">
                  <div>
                    <p className="sceduleon">{translate(PARENT_DETAILS_PAYMENT.depositAmt)}</p>
                    <div className="">
                      <p className="rate">Rs. 20,000</p>
                    </div>
                  </div>
                  <div>
                    <p className="sceduleon">{translate(PARENT_DETAILS_PAYMENT.tennure)}</p>
                    <div className="">
                      <p className="rate">2 {translate(COMMON_CONSTANTS.years)}</p>
                    </div>
                  </div>
                  <div>
                    <p className="sceduleon">{translate(COMMON_CONSTANTS.interestRate)}</p>
                    <div className="">
                      <p className="rate">9.10%</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex gap-2.5 justify-between mt-4">
              <button className="button-active btn-gradient button-transition hover:bg-hover-primary text-medium text-xl lg:text-2xl w-fit   text-medium text-xl lg:text-2xl w-fit  hover:button-shadow">{translate(PARENT_DETAILS_PAYMENT.resume)}</button>
              <button className="button-passive border-fd-primary text-fd-primary">{translate(PARENT_DETAILS_PAYMENT.discard)}</button>
            </div>
          </div>
          <hr></hr>
          <div className="p-2.5">
            <p className="heading">{translate(PARENT_DETAILS_PAYMENT.videoKyc)}</p>
            <div class="date-namediv">
              <div className="leftside">
                <p className="sceduleon">{translate(PARENT_DETAILS_PAYMENT.scheduledOn)}</p>
                <div className="dateblock">
                  <p>28</p>
                </div>
                <div className="monthblock">
                  <p className="dateandyear">Oct, 2023</p>
                </div>
              </div>
              <div className="rightside">
                <p className="heading">{translate(PARENT_DETAILS_PAYMENT.utkarshSfBankFdPlan2)}</p>
                <div className="date-namediv">
                  <div>
                    <p className="sceduleon">{translate(PARENT_DETAILS_PAYMENT.depositAmt)}</p>
                    <div className="">
                      <p className="rate">Rs. 20,000</p>
                    </div>
                  </div>
                  <div>
                    <p className="sceduleon">{translate(PARENT_DETAILS_PAYMENT.tennure)}</p>
                    <div className="">
                      <p className="rate">2 {translate(COMMON_CONSTANTS.years)}</p>
                    </div>
                  </div>
                  <div>
                    <p className="sceduleon">{translate(COMMON_CONSTANTS.interestRate)}</p>
                    <div className="">
                      <p className="rate">9.10%</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex gap-2.5 justify-between mt-4">
              <button className="button-active btn-gradient button-transition hover:bg-hover-primary text-medium text-xl lg:text-2xl w-fit   text-medium text-xl lg:text-2xl w-fit  hover:button-shadow">{translate(PARENT_DETAILS_PAYMENT.resume)}</button>
              <button className="button-passive border-fd-primary text-fd-primary">{translate(PARENT_DETAILS_PAYMENT.discard)}</button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default DraftDetails;
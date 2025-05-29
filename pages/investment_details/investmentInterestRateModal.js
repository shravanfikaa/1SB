import React, { useEffect, useState } from "react";
import { interestRateDurationInMonth } from "../../lib/util";
import { ADDRESS_DETAILS, DETAIL_FD, INVESTMENT } from "../../constants";
import { useTranslation } from "react-i18next"

const InterestRateModal = ({ updateModalState, fdPayout, interestPopUpData }) => {
  const [interestPeriod, setInterestPeriod] = useState([]);
  const [tenureText, setTenureText] = useState({});
  const { t: translate } = useTranslation();
  useEffect(() => {
    const displayTextObj = {};
    const payoutPeriod = [];
    if (interestPopUpData) {
      fdPayout && fdPayout[0] && interestPopUpData[fdPayout[0]].forEach((value) => {
        payoutPeriod.push(Object.keys(value)[0]);
        const displayText = value?.displayTenure ?
          value?.displayTenure : interestRateDurationInMonth(Object.keys(value)[0]);
        displayTextObj[Object.keys(value)[0]] = displayText;
      });
      setTenureText(displayTextObj);
      setInterestPeriod(payoutPeriod);
    }
  }, [interestPopUpData, fdPayout]);

  return (
    <>
      <div className="fixed inset-0 z-10 overflow-y-auto z-50">
        <div
          className="fixed inset-0 w-auto h-auto bg-black opacity-40"
          onClick={updateModalState}
        ></div>
        <div className="flex items-center px-4 py-8">
          <div className={`relative mx-auto p-4 bg-white rounded-md shadow-lg ${fdPayout?.length > 1 ? "w-[500px]" : "w-[300px]"}`}>
            <div className="mt-3">
              <div className="mt-2 break-normal">
                <div className="text-medium text-4xl text-center text-black">
                  {translate(INVESTMENT.interestRatesDetails)}
                </div>
                <div className="flex justify-center w-full">
                  <div className="mt-3 w-full">
                    <div className="text-medium text-2xl text-light-gray block">
                      <div>
                        <div
                          colSpan="5"
                          className="text-center font-normal p-2"
                        >
                          <u>{translate(INVESTMENT.payoutMethods)}</u>
                        </div>
                      </div>
                      <div className="flex flex-row">
                        <div
                          className="font-normal w-2/3 pl-2">
                            {translate(DETAIL_FD.period)}
                          
                        </div>
                        {fdPayout && fdPayout.length ? fdPayout.map((payoutFrequency) => {
                          return (
                            <div className="font-normal w-1/2 pr-1">
                              {translate(payoutFrequency)}
                            </div>
                          );
                        }) : null}
                      </div>
                    </div>
                    <div className="text-regular text-xl text-black block max-h-[350px] overflow-auto overflow-x-auto">
                      {
                        interestPeriod && interestPeriod.length ? interestPeriod.map((periodRange, index) => {
                          return <div className="flex flex-row">
                            <div className="border-b-2 w-2/3 p-2">
                              {tenureText[periodRange]}
                            </div>
                            {fdPayout && fdPayout.length ? fdPayout.map((payout) => {
                              return <div className="border-b-2 py-2 pl-4 pr-2 w-1/2">
                                {interestPopUpData[payout][index][periodRange]}{" %"}
                              </div>
                            }) : null}
                          </div>
                        }) : null
                      }
                    </div>
                  </div>
                </div>
                <div>
                </div>
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
          </div >
        </div >
      </div >
    </>
  );
};

export default InterestRateModal;

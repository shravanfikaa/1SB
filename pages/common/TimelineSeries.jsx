import { useEffect, useState } from "react";
import { AGENT, COMMON, COMMON_CONSTANTS, TRIM_MONTHS } from "../../constants";
import { AiOutlinePlus } from "react-icons/ai";
import { MdKeyboardArrowUp, MdKeyboardArrowDown } from "react-icons/md";
import { useTranslation } from "react-i18next";

const TimeLine = ({ data, depositAmount, isLastSeries }) => {
  const [dateKey, setDateKey] = useState({
    day: "",
    month: "",
    year: "",
  });

  const { day, month, year } = dateKey;
  const { t: translate } = useTranslation();
  useEffect(() => {
    if (data) {
      const time = Object.keys(data).find((key) => key.includes("-"));
      if (time) {
        const date = time.split("-");
        if (date.length === 2) {
          const [month, year] = date;
          setDateKey({
            day: "",
            month: month,
            year: year,
          });
        } else {
          const [year, month, day] = date;
          setDateKey({
            day: day,
            month: month,
            year: year,
          });
        }
      }
    }
  }, [data]);

  return (
    <>
      <div className="flex gap-3 md:contents">
        <div className="text-medium text-black text-xl flex items-center justify-center w-[36px]">
          {year ? year.trim() : null}
        </div>
        <div className="col-start-5 col-end-6 md:mx-auto relative  w-[25px]">
          <div className="h-full w-4 flex items-center justify-center">
            <div className="h-full w-1 btn-gradient pointer-events-none"></div>
          </div>
          <div
            className={`w-4 h-4 absolute top-1/2 -mt-3 rounded-full ${
              isLastSeries ? "bg-primary-green" : "btn-gradient"
            }`}
          ></div>
        </div>
        <div
          className={`flex items-center gap-3 w-full ${
            isLastSeries ? "justify-center" : "justify-left"
          }`}
        >
          <div className="text-medium text-black text-xl w-[25px]">
            {month ? TRIM_MONTHS[parseInt(month) - 1] : null}
          </div>
          <div className="bg-white col-start-6 col-end-10 py-1 px-2.5 w-fit rounded-xl my-3 drop-shadow-md border-dashed border-[1px] border-dark-gray">
            <h3 className="text-light text-base text-black mb-1">
              {translate(AGENT.interest)}
            </h3>
            <p className="text-black font-medium text-medium text-2xl text-justify">
              {data
                ? day
                  ? `₹ ${data[Object.keys(data)[0]][1]?.toLocaleString("en-IN")}`
                  : `₹ ${data[Object.keys(data)[0]]?.toLocaleString("en-IN")}`
                : null}
            </p>
          </div>
          {isLastSeries ? (
            <>
              <div className="text-medium text-2xl text-fd-primary">
                <AiOutlinePlus />
              </div>
              <div className="bg-white col-start-6 col-end-10 py-1 px-2.5 w-fit rounded-xl my-3 mr-auto drop-shadow-md border-dashed border-[1px] border-dark-gray">
                <h3 className="text-medium text-base text-light-gray mb-1">
                  {translate(COMMON.initialDepositAmount)}
                </h3>
                <p className="text-black font-medium text-medium text-2xl text-justify">
                  {depositAmount
                    ? `₹ ${depositAmount.toLocaleString("en-IN")}`
                    : null}
                </p>
              </div>
            </>
          ) : null}
        </div>
      </div>
    </>
  );
};

const TimelineSeries = ({ fdCalculatorResult }) => {
  const defaultIncCount = 1;
  const [minimiseTimeline, setMinimiseTimeline] = useState(true);
  const [viewCount, setViewCount] = useState(defaultIncCount);
  const [timelineData, setTimelineData] = useState([]);
  const { t: translate } = useTranslation();

  const handleViewMoreBtnClick = () => {
    if (
      timelineData.length > defaultIncCount &&
      viewCount !== timelineData.length
    ) {
      const viewCounter = viewCount + defaultIncCount;
      setViewCount(viewCounter);
      viewCounter === fdCalculatorResult.interestDetails.length &&
        setMinimiseTimeline(!minimiseTimeline);
    }
  };

  const handleMinMaxBtnClick = () => {
    setMinimiseTimeline(!minimiseTimeline);
    if (minimiseTimeline) {
      setViewCount(timelineData.length);
    } else {
      setViewCount(defaultIncCount);
    }
  };

  useEffect(() => {
    if (fdCalculatorResult?.interestDetails?.length) {
      setTimelineData(fdCalculatorResult?.interestDetails);
      setViewCount(defaultIncCount);
    }
  }, [fdCalculatorResult]);

  return (
    <div>
      <div className="flex flex-col md:grid grid-cols-9 mx-auto text-blue-50 max-h-[420px] overflow-auto">
        {timelineData.length && fdCalculatorResult?.productType.toLowerCase() === "cumulative"
        ?
              <TimeLine
              key={`timeline_comulative}`}
              data={timelineData[timelineData.length-1]}
              depositAmount={fdCalculatorResult?.depositAmount}
              isLastSeries={true}
            />
          : timelineData.map((data, index) => {
              if (minimiseTimeline) {
                return (
                  index < viewCount && (
                    <TimeLine
                      key={`timeline_${index}`}
                      data={data}
                      depositAmount={fdCalculatorResult?.depositAmount}
                      isLastSeries={timelineData.length - 1 === index}
                    />
                  )
                );
              } else {
                return (
                  <TimeLine
                    key={`timeline_${index}`}
                    data={data}
                    depositAmount={fdCalculatorResult?.depositAmount}
                    isLastSeries={timelineData.length - 1 === index}
                  />
                );
              }
            })
          }
      </div>
      <div className="text-xs text-medium">
        {fdCalculatorResult?.productType.toLowerCase() === "cumulative" ? (
          <div className="pt-6 flex gap-3">
            <div className="text-xs text-black">{translate(COMMON_CONSTANTS.maturityAmount)}:</div>
            <div className="text-regular text-black">
              {fdCalculatorResult?.maturity_amount
                ? `₹ ${parseInt(fdCalculatorResult.maturity_amount).toLocaleString(
                    "en-IN"
                  )}`
                : null}
            </div>
          </div>
        ) : fdCalculatorResult?.productType.toLowerCase() ===
          "non-cumulative" ? (
            <>
          <div className="pt-6 flex gap-3">
            <div className="text-xs text-black">{translate(COMMON_CONSTANTS.totalInterestEarned)}:</div>
            <div className="text-regular text-black">
              {fdCalculatorResult?.aggrigated_interest
                ? `₹ ${fdCalculatorResult.aggrigated_interest.toLocaleString(
                    "en-IN"
                  )}`
                : null}
            </div>
          </div>
          <div className="pt-6 flex gap-3">
            <div className="text-xs text-black">{translate(COMMON_CONSTANTS.maturityAmount)}:</div>
            <div className="text-regular text-black">
              {fdCalculatorResult?.maturity_amount
                ? `₹ ${parseInt(fdCalculatorResult.maturity_amount).toLocaleString(
                    "en-IN"
                  )}`
                : null}
            </div>
          </div>
          </>
          
        ) : null}
      </div>
      {fdCalculatorResult?.productType.toLowerCase() === "cumulative" ? null :<div className="flex gap-3">
        {defaultIncCount !== timelineData.length && (
          <button
            className="button-passive border-fd-primary text-fd-primary w-fit text-medium text-2xl flex justify-center items-center gap-2 mt-6 p-4"
            onClick={handleMinMaxBtnClick}
          >
            {minimiseTimeline ? translate(COMMON_CONSTANTS.maxiTimeLine) : translate(COMMON_CONSTANTS.miniTimeLine)}
            {minimiseTimeline ? <MdKeyboardArrowDown /> : <MdKeyboardArrowUp />}
          </button>
        )}
        {timelineData.length > defaultIncCount && minimiseTimeline ? (
          <button
            className="button-passive border-fd-primary text-fd-primary w-fit text-medium text-2xl flex justify-center items-center gap-2 mt-6 p-4"
            onClick={handleViewMoreBtnClick}
          >
            {translate(COMMON.viewMore)}
          </button>
        ) : null}
      </div>}
    </div>
  );
};

export default TimelineSeries;

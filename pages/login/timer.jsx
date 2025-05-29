import { useState, useEffect } from "react";
import { COMMON_CONSTANTS } from "../../constants";
import { useTranslation } from "react-i18next";

function Timer({ otpValidationTime, getShowTimerStatus }) {
  const [countDown, setCountDown] = useState();
  const seconds = String(countDown % 60).padStart(2, 0);
  const minutes = String(Math.floor(countDown / 60)).padStart(2, 0);
  const { t: translate } = useTranslation();
  useEffect(() => {
    const intervalTimer =
      countDown > 0 && setInterval(() => setCountDown(countDown - 1), 1000);

    if (countDown === 0) {
      getShowTimerStatus(false);
    }

    return () => clearInterval(intervalTimer);
  }, [countDown]);

  useEffect(() => {
    setCountDown(otpValidationTime);
  }, []);

  return (
    <div className="mb-3 text-regular text-2xl text-left text-black">
      {translate(COMMON_CONSTANTS.remaianingTime)} : {minutes}:{seconds}
    </div>
  );
}

export default Timer;

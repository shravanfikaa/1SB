import popupcss from "../../styles/popup_modals.module.css";
import { useFormik } from "formik";
import * as yup from "yup";
import { useEffect, useState } from "react";
import Loader from "../../svg/Loader";
import appConfig from "../../app.config";
import { ADDRESS_DETAILS, COMMON_CONSTANTS, FD_RENEWAL, INVESTMENT_DETAILS } from "../../constants";
import { IoMdClose } from "react-icons/io";
import { useTranslation } from "react-i18next";
import { getFinancialYear } from "../../lib/util"

const RenewEditInvestment = (props) => {
  function closeHandler() {
    props.closeInvestModal(false);
  }
  const [tenureMasterDetails, setTenureMasterDetails] = useState({});
  const [isTenureDataLoaded, setIsTenureDataLoaded] = useState(false);
  const [isYearClicked, setIsYearClicked] = useState(false);
  const [isMonthClicked, setIsMonthClicked] = useState(false);
  const [isDayClicked, setIsDayClicked] = useState(false);
  const { fdData } = props;
  const [populateTenor, setPopulateTenor] = useState({
    dayValue: 0,
    monthValue: 0,
    yearValue: 0,
  });

  let selectedManufactureId = "";

  if (typeof window !== "undefined") {
    selectedManufactureId = sessionStorage.getItem("selectedManufactureId");
  }


  const { t: translate } = useTranslation();

  const getTenureMasterDetails = () => {
    
    const getTenureMasterDetailsURL =
      appConfig?.deploy?.baseUrl +
      appConfig?.deploy?.tenureMaster +
      "?manufacturer_id=" +
      fdData.manufacturer_id;

    GetApiHandler(getTenureMasterDetailsURL, "GET").then((response) => {
      if (response?.data?.data) {
        setTenureMasterDetails(response.data.data);
      }
      setIsTenureDataLoaded(true);
    });
  };

  const { year, month, day } = tenureMasterDetails;

  const initialValues = {
    form15g: fdData ? fdData.form15g : false,
    maturityInstruction: "Redeem on Maturity",
    tenureYears: populateTenor ? populateTenor.yearValue : 0,
    tenureMonths: populateTenor ? populateTenor.monthValue : 0,
    tenureDays: populateTenor ? populateTenor.dayValue : 0,
  };
  const validationSchema = yup.object({
    maturityInstruction: yup.string(),
    tenureDays: yup
      .number()
      .min(
        tenureMasterDetails?.day?.allowedDay &&
        parseInt(tenureMasterDetails?.day.minTenure),
        "Invalid days"
      )
      .max(
        tenureMasterDetails?.day?.allowedDay &&
        parseInt(tenureMasterDetails?.day.maxTenure),
        "Invalid days"
      ),
    tenureMonths: yup
      .number()
      .min(
        tenureMasterDetails?.month?.allowedMonth &&
        parseInt(tenureMasterDetails?.month.minTenure),
        "Invalid month"
      )
      .max(
        tenureMasterDetails?.month?.allowedMonth &&
        parseInt(tenureMasterDetails?.month.maxTenure),
        "Invalid month"
      ),
    tenureYears: yup
      .number()
      .min(
        tenureMasterDetails?.year?.allowedYear &&
        parseInt(tenureMasterDetails?.year.minTenure),
        "Invalid year"
      )
      .max(
        tenureMasterDetails?.year?.allowedYear &&
        parseInt(tenureMasterDetails?.year.maxTenure),
        "Invalid year"
      ),
  });

  const formik = useFormik({
    initialValues,
    validationSchema,
    validateOnChange: true,
  });

  const {
    values,
    touched,
    errors,
    setFieldValue,
    validateField,
    handleChange,
    isValid,
  } = formik;

  useEffect(() => {
    values.tenureDays &&
      tenureMasterDetails?.day?.allowedDay &&
      validateField("tenureDays");
  }, [values.tenureDays, tenureMasterDetails]);

  useEffect(() => {
    values.tenureMonths &&
      tenureMasterDetails?.month?.allowedMonth &&
      validateField("tenureMonths");
  }, [values.tenureMonths, tenureMasterDetails]);

  useEffect(() => {
    values.tenureYears &&
      tenureMasterDetails?.year?.allowedYear &&
      validateField("tenureYears");
  }, [values.tenureYears, tenureMasterDetails]);

  useEffect(() => {
    validateField("maturityInstruction");
  }, [values.maturityInstruction]);

  const componentName = "investment_details";
  function saveData() {
    const data = {
      maturityInstruction: values.maturityInstruction,
      tenureDays: values.tenureDays,
      tenureMonths: values.tenureMonths,
      tenureYears: values.tenureYears,
      totalTenure:
        values.tenureDays + values.tenureMonths * 30 + values.tenureYears * 12,
      form15g: values.form15g,
    };
    const renewalData = JSON.parse(sessionStorage.getItem("renewalData"));
    if (renewalData.investment_details) {
      const valuesKeys = Object.keys(values);

      Object.keys(renewalData.investment_details).forEach((val) => {
        if (valuesKeys.includes(val)) {
          setFieldValue(val, renewalData.investment_details[val]);
        }
      });
    }
    props.getDataFromInvestAndNominee(componentName, data);
    closeHandler();
  }

  useEffect(() => {
    getTenureMasterDetails();
    const renewalData = JSON.parse(sessionStorage.getItem("renewalData"));
    if (renewalData.investment_details) {
      const valuesKeys = Object.keys(values);
      Object.keys(renewalData.investment_details).forEach((val) => {
        if (valuesKeys.includes(val)) {
          setFieldValue(val, renewalData.investment_details[val]);
        }
      });
      validateField("maturityInstruction");
    }
  }, []);

  useEffect(() => {
    let tenureValue;
    const { tenor, updatedTenure } = fdData;

    if (tenor !== updatedTenure) {
      tenureValue = updatedTenure;
    } else {
      tenureValue = tenor;
    }
    let dayValue = 0;
    let monthValue = 0;
    let yearValue = 0;
    if (tenureMasterDetails) {
      if (year?.allowedYear && month?.allowedMonth && day?.allowedDay) {
        //IF ALL 3 VALUES ARE PRESENT
        yearValue = tenureValue / 12;
        monthValue = (tenureValue - yearValue) / 30;
        dayValue = tenureValue - yearValue * 12 - monthValue * 30;
      } else if (year?.allowedYear && month?.allowedMonth && !day?.allowedDay) {
        //IF DAY NOT PRESENT
        yearValue = tenureValue / 12;
        monthValue = (tenureValue - yearValue * 12) / 30;
        dayValue = 0;
      } else if (!year?.allowedYear && month?.allowedMonth && day?.allowedDay) {
        //IF YEAR NOT PRESENT
        yearValue = 0;
        monthValue = tenureValue / 30;
        dayValue = tenureValue - monthValue * 12;
      } else if (year?.allowedYear && !month?.allowedMonth && day?.allowedDay) {
        //IF MONTH NOT PRESENT
        yearValue = tenureValue / 12;
        monthValue = 0;
        dayValue = tenureValue - yearValue * 12;
      } else if (
        !year?.allowedYear &&
        !month?.allowedMonth &&
        day?.allowedDay
      ) {
        //IF YEAR, MONTH NOT PRESENT
        yearValue = 0;
        monthValue = 0;
        dayValue = tenureValue;
      } else if (
        !year?.allowedYear &&
        month?.allowedMonth &&
        !day?.allowedDay
      ) {
        //IF YEAR, DAY NOT PRESENT
        yearValue = 0;
        monthValue = +tenureValue / 30;
        dayValue = 0;
      } else if (
        year?.allowedYear &&
        !month?.allowedMonth &&
        !day?.allowedDay
      ) {
        //IF MONTH, DAY NOT PRESENT
        yearValue = tenureValue / 12;
        monthValue = 0;
        dayValue = 0;
      }
      setPopulateTenor({
        dayValue: dayValue,
        monthValue: monthValue,
        yearValue: yearValue,
      });
    }
    validateField("maturityInstruction");
  }, [tenureMasterDetails]);

  useEffect(() => {
    if (month?.allowedMonth === true) {
      setFieldValue("tenureMonths", populateTenor.monthValue);
    }
    if (year?.allowedYear === true) {
      setFieldValue("tenureYears", populateTenor.yearValue);
    }
    if (day?.allowedDay === true) {
      setFieldValue("tenureDays", populateTenor.dayValue);
    }
  }, [populateTenor, tenureMasterDetails]);



  return (
    <>
      <div className="fixed inset-0 z-10 overflow-y-auto">
        <div
          className="fixed inset-0 w-auto h-auto bg-black opacity-25"
          onClick={closeHandler}
        ></div>
        <div className="flex justify-center items-center min-h-screen ">
          <div
            className={`relative ${popupcss.compare_popup_width} mx-10 p-5 bg-white rounded-md`}
          >
            <div className="flex flex-col break-all text-regular text-5xl text-center">
              <div className="flex justify-between">
                <div className="mb-5 text-left font-bold">
                  {" "}
                  {translate(FD_RENEWAL.investmentDetails)}
                </div>
                <div onClick={closeHandler}>
                  <IoMdClose />
                </div>
              </div>
              <div>
                <div className="text-regular text-4xl text-black mb-2 text-left">
                {translate(COMMON_CONSTANTS.tenure)}
                </div>
                {!isTenureDataLoaded ? <Loader /> : null}
                <div className="w-full">
                  <div className="flex flex-row space-x-1">
                    {year?.allowedYear ? (
                      <div
                        className={
                          month?.allowedMonth && day?.allowedDay
                            ? "flex flex-col w-1/3"
                            : month?.allowedMonth && !day?.allowedDay
                              ? "flex flex-col w-full"
                              : !month?.allowedMonth && day?.allowedDay
                                ? "flex flex-col w-full"
                                : "flex flex-col w-full"
                        }
                      >
                        <div>
                          <input
                            type="text"
                            id="tenure_year_field"
                            className="bg-white w-full border border-gray-300 shadow p-3 font-bold h-12 rounded mb-"
                            name="tenureYears"
                            value={values.tenureYears}
                            onChange={handleChange}
                            onKeyUp={() => setIsYearClicked(false)}
                            onClick={() => setIsYearClicked(!isYearClicked)}
                            readOnly={year?.isFixedValue}
                            placeholder={translate(COMMON_CONSTANTS.years)}
                          />
                        </div>
                        <div>
                          {errors.tenureYears ? (
                            <div className="text-base text-light-red m-[3px]">
                              {INVESTMENT_DETAILS.invalidMonths(
                                year.minTenure,
                                year.maxTenure
                              )}
                            </div>
                          ) : null}
                        </div>
                        {isYearClicked ? (
                          <div className="bg-none w-max h-auto mt-12 items-center absolute">
                            <ul className="ulClass bg-white w-full items-center">
                              {year.fixedValues.map((yearValue, index) => {
                                return (
                                  <>
                                    <div className="rounded-md">
                                      <li
                                        className="liClass font-semibold rounded-md p-1 flex items-center border mx-3 my-2"
                                        id={index}
                                        key={index}
                                        selected={yearValue}
                                        value={yearValue}
                                        onClick={({ target: { value } }) => {
                                          setIsYearClicked(false);
                                          setFieldValue("tenureYears", value);
                                        }}
                                      >
                                        {yearValue} {translate(COMMON_CONSTANTS.years)}
                                      </li>
                                    </div>
                                  </>
                                );
                              })}
                            </ul>
                          </div>
                        ) : null}
                      </div>
                    ) : null}
                    {month?.allowedMonth ? (
                      <div
                        className={
                          year?.allowedYear && day?.allowedDay
                            ? "flex flex-col w-1/3"
                            : year?.allowedYear && !day?.allowedDay
                              ? "flex flex-col w-full"
                              : !year?.allowedYear && day?.allowedDay
                                ? "flex flex-col w-full"
                                : "flex flex-col w-full"
                        }
                      >
                        <div className="text-regular text-2xl text-light-gray">
                          <input
                            type="text"
                            id="tenure_month_field"
                            className="bg-white text-black w-full border border-gray-300 shadow p-3 h-12 rounded mb-"
                            name="tenureMonths"
                            value={values.tenureMonths}
                            onChange={handleChange}
                            onKeyUp={() => setIsMonthClicked(false)}
                            onClick={() => setIsMonthClicked(!isMonthClicked)}
                            readOnly={month?.isFixedValue}
                            placeholder="Month(s)"
                          />
                        </div>
                        <div>
                          {errors.tenureMonths ? (
                            <div className="text-base mt-1 text-light-red">
                              {INVESTMENT_DETAILS.invalidMonths(
                                month.minTenure,
                                month.maxTenure
                              )}
                            </div>
                          ) : null}
                        </div>
                        {isMonthClicked ? (
                          <div className="w-auto h-auto mt-12 items-center absolute">
                            <ul className="ulClass bg-white w-full items-center">
                              {month.fixedValues.map((monthValue, index) => {
                                return (
                                  <>
                                    <div className="rounded-md">
                                      <li
                                        className="liClass font-semibold rounded-md p-1 flex items-center border mx-3 my-2"
                                        id={index}
                                        key={index}
                                        selected={monthValue}
                                        value={monthValue}
                                        onClick={({ target: { value } }) => {
                                          setIsMonthClicked(false);
                                          setFieldValue("tenureMonths", value);
                                        }}
                                      >
                                        {monthValue} {translate(FD_RENEWAL.months)}                                      </li>
                                    </div>
                                  </>
                                );
                              })}
                            </ul>
                          </div>
                        ) : null}
                      </div>
                    ) : null}
                    {day?.allowedDay ? (
                      <div
                        className={
                          year?.allowedYear && month?.allowedMonth
                            ? "flex flex-col w-1/3"
                            : year?.allowedYear && !month?.allowedMonth
                              ? "flex flex-col w-full"
                              : !year?.allowedYear && month?.allowedMonth
                                ? "flex flex-col w-full"
                                : "flex flex-col w-full"
                        }
                      >
                        <div className="text-regular text-2xl text-light-gray">
                          <input
                            type="text"
                            id="tenure_day_field"
                            className="bg-white text-black w-full border border-gray-300 shadow p-3 font-bold h-12 rounded mb-"
                            name="tenureDays"
                            value={values.tenureDays}
                            onChange={handleChange}
                            onKeyUp={() => setIsDayClicked(false)}
                            onClick={() => setIsDayClicked(!isDayClicked)}
                            readOnly={day?.isFixedValue}
                            placeholder={translate(COMMON_CONSTANTS.days)}
                          />
                        </div>
                        <div>
                          {errors.tenureDays ? (
                            <div className="mt-1 text-light-red text-base">
                              {INVESTMENT_DETAILS.invalidDays(
                                day.minTenure,
                                day.maxTenure
                              )}
                            </div>
                          ) : null}
                        </div>
                        {isDayClicked ? (
                          <div className="bg-none w-max h-auto mt-12 items-center absolute">
                            <ul className="ulClass bg-white w-full items-center">
                              {day.fixedValues.map((dayValue, index) => {
                                return (
                                  <>
                                    <div className="rounded-md">
                                      <li
                                        className="liClass font-semibold rounded-md p-1 flex items-center border mx-3 my-2"
                                        id={index}
                                        key={index}
                                        selected={dayValue}
                                        value={dayValue}
                                        onClick={({ target: { value } }) => {
                                          setIsDayClicked(false);
                                          setFieldValue("tenureDays", value);
                                        }}
                                      >
                                        {dayValue} {translate(COMMON_CONSTANTS.days)}
                                      </li>
                                    </div>
                                  </>
                                );
                              })}
                            </ul>
                          </div>
                        ) : null}
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>
              <div className="my-5">
                <div className="text-regular text-4xl text-black mb-2 text-left">
                {translate(FD_RENEWAL.maturityInstructions)} *
                </div>
                <div className="mt-2 border rounded text-apercu-medium">
                  <fieldset className="p-2">
                    <div className="flex items-center text-black p-2">
                      <input
                        type="radio"
                        name="maturityInstruction"
                        value="Redeem on Maturity"
                        checked={
                          values.maturityInstruction === "Redeem on Maturity"
                        }
                        onChange={handleChange}
                        className="accent-primary-green w-4 h-4 border border-primary-green "
                      />
                      <label className="ml-2 text-regular text-2xl">
                      {translate(FD_RENEWAL.redeemOnMaturity)} 
                      </label>
                    </div>
                    <div className="flex items-center text-black p-2">
                      <input
                        type="radio"
                        value="Auto Renew Principal"
                        name="maturityInstruction"
                        checked={
                          values.maturityInstruction === "Auto Renew Principal"
                        }
                        onChange={handleChange}
                        className="accent-primary-green w-4 h-4 border border-primary-green "
                      />
                      <label className="ml-2 text-regular text-2xl">
                      {translate(FD_RENEWAL.autoRenewPrincipal)}
                      </label>
                    </div>
                    <div className="flex items-center text-black p-2">
                      <input
                        type="radio"
                        value="Auto Renew Principal with Interest"
                        name="maturityInstruction"
                        checked={
                          values.maturityInstruction ===
                          "Auto Renew Principal with Interest"
                        }
                        onChange={handleChange}
                        className="accent-primary-green w-4 h-4 border border-primary-green "
                      />
                      <label className="ml-2 text-regular text-2xl">
                      {translate(FD_RENEWAL.autoRenewPrincipalWithInterest)}
                      </label>
                    </div>
                  </fieldset>
                </div>
              </div>
              {
                selectedManufactureId?.toUpperCase() !== "PNBHFC" ?
                  <div className="mb-5 flex flex-col">
                    <div className="text-regular text-4xl text-black mb-2 text-left">
                    {translate(FD_RENEWAL.form15G)}
                    </div>
                    <div className="flex flex-row">
                      <input
                        type="checkbox"
                        name="form15g"
                        checked={values.form15g}
                        onChange={handleChange}
                        className="accent-primary-green w-4 text-apercu-regular mb-2 h-4 mt-1 pl-6 bg-gray-100 rounded border-gray-300"
                      />
                      <label className="text-left text-regular text-2xl mb-2 ml-3">
                        {translate(FD_RENEWAL.doYouWantToSubmitForm15G)}
                      </label>
                    </div>
                    <div className="flex flex-row space-x-5 text-regular text-2xl">
                      <input
                        type="text"
                        name="name"
                        value="Form 15G"
                        placeholder={translate(FD_RENEWAL.form15G)}
                        className="border border-gray-300  p-3 w-full rounded mb-"
                      />
                      <input
                        type="text"
                        name="name"
                        value={getFinancialYear()}
                        className="border border-gray-300  p-3 w-full rounded mb-"
                      />
                    </div>
                  </div>
                  : null}
            </div>
            <div className="flex justify-center mt-7 gap-5">
              <button
                className="block button-passive border-fd-primary text-fd-primary"
                onClick={closeHandler}
              >
                {translate(COMMON_CONSTANTS.cancel)}
              </button>
              <button
                className={(Object.keys(errors).length != 0 || !isValid) ? "block button-active  button-transition hover:bg-hover-primary text-medium text-xl lg:text-2xl w-fit   text-medium text-xl lg:text-2xl w-fit  hover:button-shadow" : "block button-active btn-gradient button-transition hover:bg-hover-primary text-medium text-xl lg:text-2xl w-fit   text-medium text-xl lg:text-2xl w-fit  hover:button-shadow"}
                disabled={Object.keys(errors).length != 0 || !isValid}
                onClick={saveData}
              >
                {translate(ADDRESS_DETAILS.save)}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default RenewEditInvestment;

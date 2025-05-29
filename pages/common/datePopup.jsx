import { useFormik } from "formik";
import { IoMdClose } from "react-icons/io";
import * as yup from "yup";
import popupcss from "../../styles/popup_modals.module.css";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { convertUTCToYYYY_MM_DD } from "../../lib/util";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";  
import { AGENT, COMMON, MAKE_PAYMENT_FDS } from "../../constants";
function DatePopup({ getModalStatus, filterDate }) {
  const { t: translate } = useTranslation();
  const initialValues = {
    startDate: "",
    endDate: "",
  };

  const validationSchema = yup.object({
    startDate: yup.string().required(""),
    endDate: yup.string().required(""),
  });

  const formik = useFormik({
    initialValues,
    validationSchema,
  });

  const { values, setFieldValue } = formik;
  const { startDate, endDate } = values;

  const handleApplyBtnClick = () => {
    getModalStatus(false, {
      startDate: startDate ? convertUTCToYYYY_MM_DD(startDate) : "",
      endDate: endDate ? convertUTCToYYYY_MM_DD(endDate) : "",
    });
  };

  useEffect(() => {
    Object.keys(filterDate).forEach((key) => {
      filterDate[key] && setFieldValue(key, new Date(filterDate[key]));
    });
  }, [filterDate]);

  return (
    <>
      <div className="fixed inset-0 z-10 overflow-y-auto">
        <div className="fixed inset-0 w-auto h-auto bg-black opacity-40"></div>
        <div className="flex items-center justify-center min-h-screen px-4 py-8">
          <div
            className={`p-6 bg-white rounded-md shadow-lg z-[1] ${popupcss.hdfc_popup_width}`}
          >
            <div className="flex flex-row-reverse">
              <button onClick={() => getModalStatus(false, {})}>
                <IoMdClose size={22} />
              </button>
            </div>
            <div className="w-full flex flex-col gap-4 justify-center">
              <div className="text-left text-medium text-4xl text-black">
                {translate(MAKE_PAYMENT_FDS.selectDateRange)}
              </div>
              <div className="flex gap-3 w-full">
                <div className="flex flex-col gap-3 w-full">
                  <div className="text-medium text-xl text-black text-black text-left">
                    {translate(COMMON.startDate)}
                  </div>
                  <DatePicker
                    selected={startDate}
                    onChange={(e) => setFieldValue("startDate", e)}
                    onSelect={(e) => setFieldValue("startDate", e)}
                    dateFormat={["yyyy-MM-dd"]}
                    maxDate={new Date()}
                    className="px-3 py-2.5 w-full border border-gray-300 rounded text-black text-regular text-2xl"
                    placeholderText={translate(MAKE_PAYMENT_FDS.from)}
                    showYearDropdown
                    scrollableYearDropdown
                  />
                </div>
                <div className="flex flex-col gap-3 w-full">
                  <div className="text-medium text-xl text-black text-black text-left">
                    {translate(COMMON.endDate)}
                  </div>
                  <DatePicker
                    selected={endDate}
                    onChange={(e) => setFieldValue("endDate", e)}
                    onSelect={(e) => setFieldValue("endDate", e)}
                    dateFormat={["yyyy-MM-dd"]}
                    maxDate={new Date()}
                    className="px-3 py-2.5 w-full border border-gray-300 text-black rounded text-regular text-2xl"
                    placeholderText={translate(MAKE_PAYMENT_FDS.to)}
                    showYearDropdown
                    scrollableYearDropdown
                  />
                </div>
              </div>
              <div className="flex justify-center">
                <button
                  className="button-active btn-gradient button-transition hover:bg-hover-primary text-medium text-xl text-white lg:text-2xl w-fit   text-medium text-xl  lg:text-2xl w-fit  hover:button-shadow"
                  onClick={handleApplyBtnClick}
                >
                  {translate(AGENT.apply)}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default DatePopup;

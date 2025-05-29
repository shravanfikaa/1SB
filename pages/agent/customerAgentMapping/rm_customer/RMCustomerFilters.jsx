import { useState, useEffect } from "react";
import { FaFilter } from "react-icons/fa";
import { useFormik } from "formik";
import * as yup from "yup";
import { charWithNumberInput, charInputWithSpace, numberInput } from "../../../../lib/util";
import { AGENT, COMMON_CONSTANTS, RM_CUSTOMER_COLUMNS, VALIDATION_CONSTANT } from "../../../../constants";
import { useTranslation } from "react-i18next";

function RMCustomerFilters({ getFilterURL }) {
  const [queryURL, setQueryURL] = useState("");
  const { t: translate } = useTranslation();
  const initialValues = {
    panNumber: "",
    customerName: "",
    contactNumber: "",
  };

  const validationSchema = yup.object({
    panNumber: yup
      .string()
      .max(10, translate(VALIDATION_CONSTANT.invalidPAN))
      .matches(/([A-Z]){5}([0-9]){4}([A-Z]){1}$/, translate(VALIDATION_CONSTANT.invalidPAN))
      .required(""),
    contactNumber: yup
      .string()
      .max(10, translate(VALIDATION_CONSTANT.mobileNoLength))
      .matches(/^[0-9]\d{9}$/, translate(VALIDATION_CONSTANT.invalidContact)),
  });

  const formik = useFormik({
    initialValues,
    validationSchema,
  });

  const { values, setValues, setFieldValue, handleChange } = formik;

  const handleResetFilter = () => {
    setValues({
      panNumber: "",
      customerName: "",
      contactNumber: "",
    });
  };

  const { panNumber, customerName, contactNumber } = values;

  useEffect(() => {
    const paramArray = [];
    panNumber && paramArray.push(`customer_pan=${panNumber}`);
    customerName && paramArray.push(`customer_name=${customerName}`);
    contactNumber && paramArray.push(`customer_mob_no=${contactNumber}`);

    if (paramArray.length) {
      const queryParam = "?" + paramArray.join("&");
      setQueryURL(queryParam);
    } else {
      setQueryURL("");
    }
  }, [values]);

  useEffect(() => {
    const filterResult = setTimeout(() => {
      getFilterURL(queryURL);
    }, 500);
    return () => clearTimeout(filterResult);
  }, [queryURL]);

  return (
    <>
      <div className={`bg-white border-b border-slate-300`}>
        <div className="flex justify-between flex-wrap">
          <div className="flex items-center flex-wrap gap-3 mb-3 mt-3">
            <div className="text-regular text-2xl text-light-gray">
              <input
                type="text"
                placeholder={translate(AGENT.customerName)}
                name="customerName"
                value={customerName}
                onChange={(e) => {
                  const filteredText = charInputWithSpace(e.target.value);
                  setFieldValue("customerName", filteredText);
                }}
                className="w-50 text-left border border-gray-300 rounded px-1.5 py-1.5 text-black"
              />
            </div>
            <div className="text-regular text-2xl text-light-gray">
              <input
                type="text"
                placeholder={translate(RM_CUSTOMER_COLUMNS.pan_number)}
                name="panNumber"
                value={panNumber}
                maxLength={10}
                onChange={(e) => {
                  const filteredText = charWithNumberInput(e.target.value);
                  setFieldValue("panNumber", filteredText.toUpperCase());
                }}
                className="w-50 text-left border border-gray-300 rounded px-1.5 py-1.5 text-black"
              />
            </div>
            <div className="text-regular text-2xl text-light-gray">
              <input
                type="text"
                placeholder={translate(AGENT.customerContactNo)}
                name="contactNumber"
                maxLength={10}
                value={values.contactNumber}
                onChange={(e) => {
                  const filteredText = numberInput(e.target.value);
                  setFieldValue("contactNumber", filteredText.toUpperCase());
                }}
                className="w-50 text-left border border-gray-300 rounded px-1.5 py-1.5 text-black"
              />
            </div>
          </div>
          <div className="flex flex-row items-center gap-3 mb-3 mt-3">
            <div className="hover:cursor-pointer">
              <FaFilter
                className={`${
                  panNumber || contactNumber || customerName
                    ? "text-light-orange"
                    : "text-fd-primary"
                } text-2xl font-bold`}
              />
            </div>
            <div
              className="text-regular text-2xl text-light-red hover:cursor-pointer"
              onClick={handleResetFilter}
            >
              {translate(COMMON_CONSTANTS.resetAll)}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default RMCustomerFilters;

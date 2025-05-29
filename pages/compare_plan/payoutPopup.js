import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/router";
import comparecss from "../../styles/popup_modals.module.css";
import { useFormik } from "formik";
import { handleEventLogger,isMobile } from "../../lib/util";
import { COMMON_CONSTANTS, PRODUCT_TYPE } from "../../constants";
import { useTranslation } from "react-i18next";

const PayoutPopup = ({ updateModalState, screenType, data }) => {
  const [productType, setProductType] = useState('');
  const router = useRouter();
  const { t: translate } = useTranslation();

  const formik = useFormik({
    initialValues: {
      cumulative: false,
      nonCumulative: false
    }
  });

  const { values, setFieldValue } = formik;

  const handleProductTypeChange = (status) => {
    if (status === "cumulative") {
      setFieldValue("cumulative", true);
      setFieldValue("nonCumulative", false);
      setProductType("Cumulative");
    } else {
      setFieldValue("cumulative", false);
      setFieldValue("nonCumulative", true);
      setProductType("Non-Cumulative");
    }
  }

  function chooseProductType() {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('selectedProductType', productType);
      handleEventLogger("dashboard", "buttonClick", "Invest_Click", {
        action: "Invest_Initiate",
        FD_Name:data.fdName,
        Type:productType,
        Platform:isMobile()
      });
      router.push({ pathname: "/detail_fd/fd_detail", query: { 'productId': data?.fdId, 'productType': productType, 'manufacturerId': data?.manufacturerId, 'screenType': screenType ? screenType : "" } });
    }
  }

  return (
    <>
      <div className="fixed inset-0 z-50 overflow-y-auto" id={data?.fdId}>
  {/* Backdrop */}
  <div
    className="fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm bg-popupback transition-opacity "
    onClick={() => updateModalState({ show: false, id: "" })}
  />
  
  {/* Modal Container */}
  <div className="flex items-center justify-center min-h-screen p-4 text-center">
    <div className="relative bg-white rounded-2xl shadow w-full max-w-md transform transition-all">
      {/* Modal Content */}
      <div className="p-6">
        {/* Logo */}
        {data?.logoUrl && (
          <div className="flex justify-center mb-4">
            <Image
              src={data.logoUrl}
              alt={data.fdName || "Bank Logo"}
              width={80}
              height={50}
              className="object-contain"
              priority
            />
          </div>
        )}
        
        {/* Title */}
        <h2 className="text-2xl md:text-3xl font-semibold text-gray-900 mb-2">
          {data?.fdName}
        </h2>
        
        {/* Subtitle */}
        <p className="text-gray-600 mb-6">
          {translate(COMMON_CONSTANTS.chooseFixedDepositOptionToContinue)}
        </p>
        
        {/* Options */}
        <div className="space-y-3 mb-8">
          {Object.keys(PRODUCT_TYPE).map((statusName, index) => (
            <label
              key={`${statusName + index}`}
              className={`flex items-center p-4 border rounded-lg cursor-pointer transition-all ${
                values[statusName]
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <input
                type="radio"
                onChange={() => handleProductTypeChange(statusName)}
                checked={values[statusName]}
                name="productType"
                className="w-5 h-5 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-3 text-gray-700">
                {translate(PRODUCT_TYPE[statusName])}
              </span>
            </label>
          ))}
        </div>
        
        {/* Action Buttons */}
        <div className="flex justify-end space-x-3">
          <button
            onClick={() => updateModalState({ show: false, id: "" })}
            className="button-passive text-medium text-xl lg:text-2xl text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            {translate(COMMON_CONSTANTS.cancel)}
          </button>
          <button
            onClick={chooseProductType}
            disabled={!productType.length}
            className={`text-medium button-active text-white   ${
              !productType.length
                ? "button-active bg-gray-400 cursor-not-allowed"
                : "button-active btn-gradient button-transition hover:bg-hover-primary text-medium text-xl lg:text-2xl w-fit   text-medium text-xl lg:text-2xl w-fit  hover:button-shadow"
            }`}
          >
            {translate(COMMON_CONSTANTS.continueLabel)}
          </button>
        </div>
      </div>
    </div>
  </div>
</div>
    </>
  );
};

export default PayoutPopup;

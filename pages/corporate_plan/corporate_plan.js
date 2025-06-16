import { useEffect, useState } from "react";
import Image from "next/image";
import { useTranslation } from "react-i18next";
import { PRODUCT_TYPE } from "../../constants";

function CorporatePlan({ journeyType, logo, type, name }) {
  const [productName, setProductName] = useState("");
  const [productLogo, setProductLogo] = useState("");
  const [productType, setProductType] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerPan, setCustomerPan] = useState("");
  const { t: translate } = useTranslation();

  useEffect(() => {
    if (typeof window !== "undefined") {
      const name = sessionStorage.getItem("selectedProductName") || "";
      const logo = sessionStorage.getItem("selectedProductLogo") || "";
      const type = sessionStorage.getItem("selectedProductType") || "";
      setProductName(name);
      setProductLogo(logo);
      setProductType(type);
    }
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      name && setProductName(name);
      logo && setProductLogo(logo);
      type && setProductType(type);
    }
  }, [name, logo, type]);

  useEffect(() => {
    if (journeyType?.toLowerCase() === 'rm' || journeyType?.toLowerCase() === 'admin') {
      const rmCustomerDetails = sessionStorage.getItem("rm_customer_data") ? JSON.parse(sessionStorage.getItem("rm_customer_data")) : {};
      if (Object.keys(rmCustomerDetails).length) {
        rmCustomerDetails?.pan_number && setCustomerPan(rmCustomerDetails.pan_number);
        rmCustomerDetails?.first_name && rmCustomerDetails?.last_name && setCustomerName(rmCustomerDetails.first_name + " " + rmCustomerDetails.last_name);
      }
    }
  }, [journeyType]);

  return (
    <div className="flex justify-between text-apercu gap-5 mb-3">
      <div className="flex gap-4 flex-row bg-white justify-between items-start gap-2 bg-primary-white p-3 rounded-xl shadow-md items-center  w-full">
        <div className="flex gap-4 flex-row ">
        <div>
          {productLogo && <Image
            src={productLogo}
            alt="Product logo"
            width={72}
            height={42}
          />}
        </div>
        <div>
          {productName && <div className="text-bold text-4xl text-black">{productName}</div>}
          {productType && <div className="text-medium text-2xl font-thin italic text-primary text-right">{productType?.toLowerCase() === "cumulative" ? translate(PRODUCT_TYPE[productType.toLowerCase()]) : translate(PRODUCT_TYPE["nonCumulative"])}</div>}
        </div>
        </div>
          {journeyType == 'RM' && <div className="flex flex-col text-right text-medium uppercase"><h1 className="text-3xl text-black">{customerName ? customerName : ""}</h1>
        <h2 className="text-xl text-light-gray">{customerPan ? customerPan : ""}</h2></div>}
      </div>
      
    </div >
  )
}

export default CorporatePlan;
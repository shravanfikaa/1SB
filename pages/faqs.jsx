import React from "react";
import NavBarMain from "./navbar/NavBarMain";
import FAQList from "./FAQ/faqList";
import { COMMON_CONSTANTS } from "../constants";
import { useTranslation } from "react-i18next";

function FAQSection() {
  const { t: translate } = useTranslation();
  return (
    <>
      <div className="max-w-screen">
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1"
        />
        <NavBarMain />
      </div>
      <div className="flex flex-col justify-center page-background">
        <div className="flex justify-center py-2 text-medium text-bold text-7xl text-black">
        {translate(COMMON_CONSTANTS.faqs)}
        </div>
        <div className="flex justify-center">
          <div className="w-[824px]">
             <FAQList style={{heading:"text-3xl", subHeading: "text-xl"}}/>
          </div>
        </div>
      </div>
    </>
  );
};

export default FAQSection;

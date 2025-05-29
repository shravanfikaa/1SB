import React, { useEffect, useState } from "react";
import {
  Accordion,
  AccordionItem,
  AccordionItemHeading,
  AccordionItemButton,
  AccordionItemPanel,
} from "react-accessible-accordion";
import {  replacePlaceholder } from "../../lib/util";
import appConfig from "../../app.config";
import { GetApiHandler } from "../api/apihandler";
import "react-accessible-accordion/dist/fancy-example.css";
import { useTranslation } from "react-i18next";

const FAQList = ({ style }) => {
  const [faqsData, setFaqsData] = useState([]);
  const [distributorName, setDistributorName] = useState("");
  const { t: translate } = useTranslation();
  const getFAQsData = () => {
    const selectedManufactureId = sessionStorage.getItem("selectedManufactureId");
    
    const manufacturerArtifacts = appConfig?.deploy?.baseUrl + appConfig?.deploy?.manufacturerArtifacts + "?manufacturer_id=" + selectedManufactureId;
    GetApiHandler(manufacturerArtifacts, "GET").then(
      (response) => {
        if (response?.data?.data) {
          const { faq } = response?.data?.data;
          setFaqsData(faq);
        }
      }
    );
  }

  useEffect(() => {
    const distributorName = sessionStorage.getItem("distributorName");
    distributorName && setDistributorName(JSON.parse(distributorName));
    getFAQsData();
  }, []);

  return <>
    {
      faqsData?.length ? <Accordion allowZeroExpanded className="border-0">
        {faqsData.length && faqsData.map((item, index) => (
          <AccordionItem key={index} className="mb-5">
            <AccordionItemHeading className="">
              <AccordionItemButton className="rounded-xl p-4 bg-white">
                <span className={`${style.heading} text-medium text-black`}>
                  {item.faqQuestion}
                </span>
              </AccordionItemButton>
            </AccordionItemHeading>
            <AccordionItemPanel className="rounded-b-xl p-4 bg-white" style={{marginTop:"-1rem"}}>
              <div className="flex-row justify-between text-left gap-2">
                <div className="w-[40px] break-normal"></div>
                <div className={`${style.subHeading} break-normal text-regular text-black`}>
                  {
                    item.faqAnswer[0] && item.faqAnswer[0].includes("<<Distributor Name>>") ?
                      replacePlaceholder("<<Distributor Name>>", distributorName, item.faqAnswer[0]) :
                      item.faqAnswer[0]
                  }
                </div>
                <div>
                  {
                    item.faqAnswer.length > 1 && item.faqAnswer.map((value, key) => {
                      return key === 0 ? null : <div className={`${style.subHeading} break-normal text-regular text-black`}>
                        {
                          value && value.includes("<<Distributor Name>>") ?
                            replacePlaceholder("<<Distributor Name>>", distributorName, value) :
                            value
                        }
                      </div>
                    })
                  }
                </div>
              </div>
            </AccordionItemPanel>
          </AccordionItem>
        ))}
      </Accordion> : null
    }
  </>
}

export default FAQList;

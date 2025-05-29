import { useTranslation } from "react-i18next";
import { AFTER_REVIEW, AGENT, COMMON_CONSTANTS, COMPONENTS, MAKE_PAYMENT_FDS } from "../constants";
import styles from "../styles/after_review.module.css";
import { formatDate } from "../lib/util";
import { useEffect, useState } from "react";


function PNBPaymentDetails({ details }) {
  const { productLogoURL, paymentDetails} = details;
  const [esignState,setEsignState] = useState();
  useEffect(()=>{
    if(paymentDetails)
      {
        const{customerReferenceId} = paymentDetails;
        const esignSate = customerReferenceId.find(item=>item.customerRelIdType === "eSignLink")
        setEsignState(esignSate)
      }
  },[])
  
  const { t: translate } = useTranslation();
  return (
    <div className="flex flex-col w-3/5">
      <div>
      <div className="border-solid border-2 border-gary-600 w-auto p-4">
          <div className="flex flex-row gap-x-3">
            {productLogoURL ? (
              <div className="object-contain mt-1">
                <img src={productLogoURL} alt="logo" width={93} height={10} />
              </div>
            ) : null}
            <div className="flex flex-col">
              <span className="text-5xl text-regular">
                {paymentDetails.fd_name}
              </span>
              <span className="text-medium text-2xl text-light-gray text-left">
                {translate(paymentDetails.type)}
              </span>
            </div>
          </div>
          <div className={`${styles.bank_table_mobile_view} p-3`}>
            <div className="flex gap-x-3 text-base">
              <div className="w-1/2 text-left">
                <div className="text-light-gray pb-1">{translate(COMPONENTS.applNoDepositNo)}</div>
                <div>
                  <p className="break-all">
                    {" "}
                    {paymentDetails?.application_number ? paymentDetails.application_number : paymentDetails?.one_sb_reference_number ? paymentDetails.one_sb_reference_number : ""}{" "}
                  </p>
                </div>
                <div className="text-light-gray pb-1">{translate(MAKE_PAYMENT_FDS.amount)}</div>
                <div>
                  {paymentDetails?.fd_amount ? <p className="pb-1">₹ {parseInt(paymentDetails.fd_amount).toLocaleString(
                    "en-IN"
                  )}</p> : null}
                </div>
                <div className="text-light-gray pb-1">{translate(COMPONENTS.tpslTransactionId)}</div>
                <div className="break-all">
                  {/* {paymentDetails.payment_id} */}
                  {paymentDetails?.payment_id ? paymentDetails.payment_id : paymentDetails?.payment_response?.transactionId ? paymentDetails.payment_response?.transactionId : ""}
                </div>
                <div className="text-light-gray break-all pb-1">
                  {translate(COMPONENTS.clntTransactionRef)}
                  
                </div>
                <div className="break-all">
                  {" "}
                  <p>{paymentDetails.reference_number}</p>
                </div>
              </div>
              <div className="w-1/2 text-left">
                <div className="text-light-gray pb-1">{translate(AGENT.paymentStatus)}</div>
                <div>
                  <p className="text-regular text-fd-primary capitalize break-all">
                    {paymentDetails.payment_status}
                  </p>
                </div>
                <div className="text-light-gray pb-1">{translate(COMMON_CONSTANTS.tenure)}</div>
                <div>
                  <p className="break-all">{
                    paymentDetails?.displayTenure ? paymentDetails?.displayTenure :
                      `${paymentDetails?.tenor ? paymentDetails?.tenor : ""} ${translate(COMMON_CONSTANTS.days)}`
                  }</p>
                </div>
                <div className="text-light-gray pb-1">{translate(AFTER_REVIEW.openDate)}*</div>
                <div>
                  <p className="break-all">
                    {formatDate(paymentDetails.fd_open_date)}
                  </p>
                </div>
                <div className="text-light-gray pb-1">{translate(AFTER_REVIEW.maturityDate)}*</div>
                <div>
                  <p className="break-all">
                    {formatDate(paymentDetails.fd_maturity_date)}
                  </p>
                </div>
                <div className="text-light-gray pb-1">{translate(AFTER_REVIEW.bookingStatus)}</div>
                <div className="text-regular text-fd-primary capitalize">
                  <p className="break-all">{paymentDetails.status}</p>
                </div>
              </div>
            </div>
          </div>
          <div
            className={`flex flex-col justify-center py-4 ${styles.bank_table_desktop_view}`}
          >
            <div className="flex flex-col gap-x-3 text-base">
              <div className="flex flex-row text-left justify-between text-xl gap-3">
                <div className="w-1/5">
                  <div className="text-light-gray text-medium pb-1">
                    {translate(COMPONENTS.applNoDepositNo)}
                   
                  </div>
                  <div className="text-regular">
                    <p className="break-all">
                      {" "}
                      {paymentDetails?.application_number ? paymentDetails.application_number : paymentDetails?.one_sb_reference_number ? paymentDetails.one_sb_reference_number : ""}
                    </p>
                  </div>
                </div>
                <div className="w-1/5">
                  <div className="text-light-gray text-medium pb-1">
                  {translate(AGENT.paymentStatus)}
                  </div>
                  <div>
                    <p className="text-regular text-fd-primary capitalize break-all">
                      {paymentDetails.payment_status}
                    </p>
                  </div>
                </div>
                <div className="w-1/5">
                  <div className="text-light-gray text-medium pb-1">{translate(MAKE_PAYMENT_FDS.amount)}</div>
                  <div>
                    {paymentDetails?.fd_amount ? <p className="text-regular break-all text-black">₹ {parseInt(paymentDetails.fd_amount).toLocaleString(
                      "en-IN"
                    )}</p> : null}
                  </div>
                </div>
                <div className="w-1/5">
                  <div className="text-light-gray text-medium pb-1">
                    {translate(COMPONENTS.tpslTransactionId)}
                    
                  </div>
                  <div>
                    <p className="text-regular break-all text-black">
                      {" "}
                      {/* {paymentDetails.payment_id} */}
                      {paymentDetails?.payment_id ? paymentDetails.payment_id : paymentDetails?.payment_response?.transactionId ? paymentDetails.payment_response?.transactionId : ""}
                    </p>
                  </div>
                </div>
                <div className="w-1/5">
                  <div className="text-light-gray text-medium pb-1">
                  {translate(COMPONENTS.clntTransactionRef)}
                  </div>
                  <div className="text-regular break-all text-black">
                    <p> {paymentDetails.reference_number} </p>
                  </div>
                </div>
              </div>
              <div className="text-left text-xl flex flex-row justify-between gap-3">
                <div className="w-1/5">
                  <div className="text-light-gray text-medium pb-1">{translate(COMMON_CONSTANTS.tenure)}</div>
                  <p className="break-all">{
                    paymentDetails?.displayTenure ? paymentDetails?.displayTenure :
                      `${paymentDetails?.tenor ? paymentDetails?.tenor : ""} ${translate(COMMON_CONSTANTS.days)}`
                  }</p>
                </div>
                <div className="w-1/5">
                  <div className="text-light-gray text-medium pb-1">
                  {translate(AFTER_REVIEW.openDate)}*
                  </div>
                  <div>
                    <p className="text-regular break-all text-black">
                      {" "}
                      {formatDate(paymentDetails.fd_open_date)}
                    </p>
                  </div>
                </div>
                <div className="w-1/5">
                  <div className="text-light-gray text-medium pb-1">
                  {translate(AFTER_REVIEW.maturityDate)}*                  </div>
                  <div>
                    <p className="text-regular break-all text-black">
                      {" "}
                      {formatDate(paymentDetails.fd_maturity_date)}
                    </p>
                  </div>
                </div>
                <div className="w-1/5">
                  <div className="text-light-gray text-medium pb-1">
                  {translate(AFTER_REVIEW.bookingStatus)}
                  </div>
                  {/* TBD: Need to change the application status based on responses*/}
                  <div className="text-regular text-fd-primary capitalize">
                    <p className="break-all"> {paymentDetails.status}</p>
                  </div>
                </div>
                <div className="w-1/5">
                <div className="text-light-gray text-medium pb-1">
                  {translate(MAKE_PAYMENT_FDS.eSignStatus)}
                  </div>
                  {/* TBD: Need to change the application status based on responses*/}
                  <div className="text-regular text-fd-primary capitalize">
                    <p className="break-all"> {esignState.customerRelId}</p>
                  </div>
                  </div>
              </div>
            </div>
          </div>
        </div>
        <div className="gap-3 text-break">
          {details?.disclaimerText ? (
            <span className={`text-base text-light-gray text-regular`}>
              Disclaimer: {" "}
              {details?.disclaimerText.replace(
                "<FDIssuerName>",
                details?.paymentDetails?.manufacturer_id ? details?.paymentDetails?.manufacturer_id : ""
              )}
            </span>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default PNBPaymentDetails

import { AFTER_REVIEW, AGENT, COMMON_CONSTANTS } from "../constants";
import styles from "../styles/after_review.module.css";
import { useTranslation } from 'react-i18next';


function UtkarshPaymentDetails({ details }) {
  const { t: translate } = useTranslation();
  return (
    <div className="flex flex-col w-3/5">
      <div>
        <div className="border-solid border-2 border-gary-600 w-auto p-4">
          <div className="flex flex-row gap-x-3">
            {details?.productLogoURL ? (
              <div className="object-contain mt-1">
                <img src={details?.productLogoURL} alt="logo" width={93} height={10} />
              </div>
            ) : null}
            <div className="flex flex-col">
              <span className="text-5xl text-regular">
                {details?.paymentDetails?.fd_name ? details.paymentDetails.fd_name : ""}
              </span>
              <span className="text-medium text-2xl text-light-gray text-left">
                {details?.paymentDetails?.type ? details?.paymentDetails?.type : ""}
              </span>
            </div>
          </div>
          <div className={`${styles.bank_table_mobile_view} p-3`}>
            <div className="flex gap-x-3 text-base text-black">
              <div className="text-left">
                <div className="text-light-gray pb-1">{translate(AGENT.fdAmount)}</div>
                <div>
                  <p className="pb-1">₹ {details?.paymentDetails?.fd_amount ? parseInt(details.paymentDetails.fd_amount).toLocaleString(
                    "en-IN"
                  ) : ""}</p>
                </div>
                <div className="text-light-gray pb-1">{translate(COMMON_CONSTANTS.tenure)}</div>
                <div>
                  <p className="break-all text-regular text-black">
                    {details?.paymentDetails?.displayTenure ? details?.paymentDetails?.displayTenure :
                      `${details?.paymentDetails?.tenor ? details?.paymentDetails?.tenor : ""} ${translate(COMMON_CONSTANTS.days)}`}
                  </p>
                </div>
              </div>
              <div className="text-left">
                <div className="text-light-gray pb-1">{translate(AFTER_REVIEW.bookingStatus)}</div>
                <div>
                  <p className="pb-1">{details?.paymentDetails?.status ? details?.paymentDetails?.status : ""}</p>
                </div>
                <div className="text-light-gray pb-1">{translate("Rate of Interest")}</div>
                <div>
                  <p className="break-all">
                    {details?.paymentDetails?.interest_rate} %
                  </p>
                </div>
                <div className="text-light-gray pb-1">{translate(AGENT.paymentStatus)}</div>
                <div>
                  <p className="break-all">
                    {details?.paymentDetails?.payment_status ? details?.paymentDetails?.payment_status : ""}
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div
            className={`flex flex-col justify-center py-4 ${styles.bank_table_desktop_view}`}
          >
            <div className="flex flex-col gap-x-3 text-base">
              <div className="flex flex-row text-left justify-between text-xl gap-3 text-black">
                <div className="w-fit">
                  <div className="text-light-gray text-medium pb-1">
                  {translate(AGENT.fdAmount)}
                  </div>
                  <div>
                    <p className="text-regular break-all text-black">
                      ₹ {details?.paymentDetails?.fd_amount ? parseInt(details.paymentDetails.fd_amount).toLocaleString(
                        "en-IN"
                      ) : ""}
                    </p>
                  </div>
                </div>
                <div className="w-fit">
                  <div className="text-light-gray text-medium pb-1">
                  {translate(COMMON_CONSTANTS.tenure)}
                  </div>
                  <div className="text-regular">
                    <p>{details?.paymentDetails?.displayTenure ? details?.paymentDetails?.displayTenure :
                      `${details?.paymentDetails?.tenor ? details?.paymentDetails?.tenor : ""} ${translate(COMMON_CONSTANTS.days)}`}</p>
                  </div>
                </div>
                <div className="w-fit">
                  <div className="text-light-gray text-medium pb-1">
                  {translate(AFTER_REVIEW.bookingStatus)}
                  </div>
                  <div className="text-regular">
                    <p>{details?.paymentDetails?.status ? details?.paymentDetails?.status : ""}</p>
                  </div>
                </div>
                <div className="w-fit">
                  <div className="text-light-gray text-medium pb-1">
                    {translate(AGENT.paymentStatus)}
                  </div>
                  <div className="text-regular">
                    <p>{details?.paymentDetails?.payment_status ? details?.paymentDetails?.payment_status : ""}</p>
                  </div>
                </div>
                <div className="w-fit">
                  <div className="text-light-gray text-medium pb-1">
                    {translate("Rate of Interest")}
                  </div>
                  <div className="text-regular">
                    <p>{details?.paymentDetails?.interest_rate} %</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        {details?.paymentDetails?.manufacturer_id?.toLowerCase() === "sib" ?
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
          : null}
      </div>
    </div>
  );
};

export default UtkarshPaymentDetails

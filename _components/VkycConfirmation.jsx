import { AFTER_REVIEW, DETAIL_FD } from "../constants";
import ExclamationCircle from "../svg/ExclamationCircle";
import GreenCheckMark from "../svg/GreenCheckMark";
import PaymentDetails from "./PaymentDetailsAfterReview";
import UtkarshPaymentDetails from "./UtkarshPaymentDetails";
import { useTranslation } from "react-i18next"; 
function VKYCConfirmation({ details }) {
  const {
    productLogoURL,
    paymentDetails,
    disclaimerText,
    vkycStatus,
    handleCompleteVKYC,
  } = details;
  const { t: translate } = useTranslation();
  return (
    <>
      {vkycStatus?.status.toLowerCase().includes("pending") || vkycStatus?.status.toLowerCase().includes("approved")  ? (
        <>
          <span className="text-primary-green flex justify-center rounded-full">
            <GreenCheckMark />
          </span>
          <span className="text-primary-green text-6xl text-medium capitalize">
            {"Congratulations"}!
          </span>
        </>
      ) : (
        <>
          <span className="text-light-red flex justify-center rounded-full">
            <ExclamationCircle />
          </span>
          <span className="text-light-red text-6xl text-medium capitalize">
            {"Error"}!
          </span>
        </>
      )}
      <span className="text-3xl text-black text-regular mx-5">
        {vkycStatus?.status.toLowerCase().includes("pending") || vkycStatus?.status.toLowerCase().includes("approved")
          ? "Your VKYC is successful and details are being verified by the Bank"
          : "There was an error in completing your video KYC"}
      </span>
      <span className="text-xl text-regular mx-5 text-black">
        {
          translate(DETAIL_FD.mailFdDetailsOnEmail)
        }
      </span>
      {vkycStatus?.status.toLowerCase() !== "pending" || vkycStatus?.status.toLowerCase().includes("approved") && (
        <div className="flex justify-center align-center">
          <span className="text-xl text-regular mx-5 text-black text-fd-primary content-center">
            {"Next Step: Reinitiate your video KYC"}
          </span>
          <button
            className="button-active btn-gradient  button-transition hover:bg-hover-primary text-medium text-xl lg:text-2xl w-fit   text-medium text-xl lg:text-2xl w-fit  "
            onClick={handleCompleteVKYC}
          >
         {translate(AFTER_REVIEW.startVideoKyc)}
          </button>
        </div>
      )}
      <span className="text-4xl text-light-gray text-regular">
        {translate(DETAIL_FD.yourFdDetails)}
      </span>
      <div className="flex justify-center w-full">
        {
          vkycStatus?.status.toLowerCase() !== "pending" || vkycStatus?.status.toLowerCase().includes("approved") ? <UtkarshPaymentDetails
            details={{
              productLogoURL: productLogoURL ? productLogoURL : "",
              paymentDetails: paymentDetails,
              disclaimerText: "",
            }}
          /> : <PaymentDetails
            details={{
              productLogoURL: productLogoURL,
              paymentDetails: paymentDetails,
              disclaimerText: disclaimerText,
            }}
          />
        }
      </div>
    </>
  );
};

export default VKYCConfirmation;

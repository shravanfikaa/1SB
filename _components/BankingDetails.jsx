import { FaRegEdit } from "react-icons/fa";
import { AiOutlineCheck } from "react-icons/ai";
import { BsThreeDots } from "react-icons/bs";
import { RxCross2 } from "react-icons/rx";
import review_invest_css from "../styles/review_invest_css.module.css";
import Image from "next/image";
import { useTranslation } from "react-i18next";
import { FD_RENEWAL, PARENT_DETAILS_PAYMENT } from "../constants";


const BankingDetails = ({
  handleBankDetailsEdit,
  bankVerificationStatus,
  bank_details,
  allowEdit
}) => {
  const defaultLogo = "https://1sb-artifacts.s3.ap-south-1.amazonaws.com/bank_logo/defaultbanklogo.png";
  const { t: translate } = useTranslation();

  return (
    <>
      <div className="flex flex-col mb-4 border-b-2 user_journey_container rounded-xl p-[30px]">
        <div className="flex flex-wrap justify-between mb-3 items-center">
          <div className="text-medium text-black text-3xl">{translate(PARENT_DETAILS_PAYMENT.bankingDetails)}</div>
          <div className={`${allowEdit ? 'visible' : 'hidden'}`}>
            <div
              className="flex flex-wrap gap-2 items-center justify-center text-bold text-2xl text-fd-primary hover:cursor-pointer border rounded-md btn-gradient p-2"
              disabled={!bank_details}
              onClick={handleBankDetailsEdit}
            >
                <button type="button" class="btn btn-secondary" data-toggle="tooltip" data-placement="top" title="Edit Bank Details">
                  <FaRegEdit fill="#ffff" width={'10px'} />
                </button>
              {/* {translate(FD_RENEWAL.edit)} */}
            </div>
          </div>
        </div>
        <div className={`${review_invest_css.investment_div_width} mb-3`}>
          <div className="border-2 rounded p-3 border-btn-gradient">
            <div
              className={`${review_invest_css.bank_status_position} items-center justify-between`}
            >
              <div className={`w-full ${review_invest_css.bank_status_position}`}>
                <div className="flex flex-wrap w-full">
                  <div className="flex  gap-1 items-center w-full">
                    <div className="w-fit">
                        {bank_details?.vpaId ? (
                        <div>
                         <Image
                          src="/verify/upiVImg.png"
                          alt="UPI Verified"
                          width={150}
                          height={40}
                        />
                        </div>
                      ) : bank_details?.bankLogo ? <img
                        src={bank_details?.bankLogo}
                        width="20"
                        height="20"
                        objectFit={"contain"}
                      /> : <img
                        src={defaultLogo}
                        width="30"
                        height="30"
                        objectFit={"contain"}
                      /> }
                    </div>
                    {bank_details?.vpaId ? <div className="text-regular text-2xl text-white">
                      {bank_details?.vpaId ? (
                        <div>
                          VPA ID :{" "}
                          {bank_details?.vpaId
                            ? bank_details?.vpaId
                            : ""}
                        </div>
                      ) : null}
                    </div> : <div className="w-full text-regular text-2xl flex-wrap text-light-gray items-center flex gap-1">
                      <div className="text-xl text-black">{bank_details?.bankName}</div>
                      {bank_details?.bankAccountNumber ? (
                        <div className="text-xl text-black">
                          A/C :{" "}
                          {bank_details?.bankAccountNumber
                            ? bank_details?.bankAccountNumber
                            : bank_details?.accountNumber}
                        </div>
                      ) : null}
                      {bank_details?.bankIfsc ? (
                        <div className="text-xl text-black">
                          IFSC :{" "}
                          {bank_details?.bankIfsc
                            ? bank_details?.bankIfsc
                            : bank_details?.ifscCode}
                        </div>
                      ) : null}
                    </div>}
                  </div>
                </div>
              </div>
              <div className="justify-start">
                <div className="flex  items-center gap-3 text-regular text-xl  rounded p-2">
                  <div
                    className={
                      bankVerificationStatus.includes("Verification")
                        ? "text-primary-green"
                        : bankVerificationStatus == "Verified" ||
                          bankVerificationStatus == "completed"
                          ? "text-primary-green"
                          : "text-light-red"
                    }
                  >
                    {bankVerificationStatus.includes("Verification") ? (
                      <BsThreeDots />
                    ) : bankVerificationStatus == "Verified" ||
                      bankVerificationStatus == "completed" ? (
                      <AiOutlineCheck />
                    ) : (
                      <RxCross2 />
                    )}{" "}
                  </div>
                  <div
                    className={
                      bankVerificationStatus.includes("Verification")
                        ? "text-primary-green"
                        : bankVerificationStatus == "Verified" ||
                          bankVerificationStatus == "completed"
                          ? "text-primary-green"
                          : "text-light-red"
                    }
                  >
                    {bankVerificationStatus === "completed"
                      ? "Verified"
                      : bankVerificationStatus}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
export default BankingDetails;

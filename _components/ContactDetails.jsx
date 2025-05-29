import { useTranslation } from "react-i18next";
import { BASIC_DETAILS } from "../constants";
import review_invest_css from "../styles/review_invest_css.module.css";
import { FaRegEdit } from "react-icons/fa";

const ContactDetails = ({ contactDetails }) => {
  const { t: translate } = useTranslation();
  return (
    <>
      <div className="flex flex-col border-b-2 user_journey_container rounded-xl p-[20px] h-[100%]">
        <div className="flex flex-row justify-between mb-3 items-center">
          <div className="text-medium text-black text-3xl">{translate(BASIC_DETAILS.contactDetails)}</div>
        </div>
        <div>
          <div
            className={`${review_invest_css.basic_detail_status_position} text-regular text-2xl text-light-gray mb-4`}
          >
            <div className={`flex flex-col w-1/3`}>
              <div>{translate(BASIC_DETAILS.phone)}</div>
              <div className="text-black">
                {contactDetails?.mobileNum ? contactDetails?.mobileNum : ""}
              </div>
            </div>
            <div className={`flex flex-col w-1/3`}>
              <div>{translate(BASIC_DETAILS.Email)}</div>
              <div className="text-black">
                {contactDetails?.email ? contactDetails?.email : ""}
              </div>
            </div>
            <div className={`flex flex-col w-1/3`}></div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ContactDetails;

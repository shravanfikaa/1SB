import review_invest_css from "../styles/review_invest_css.module.css";
import Skeleton from "react-loading-skeleton";
 import { BASIC_DETAILS, FD_RENEWAL } from "../constants";
 import { useTranslation } from "react-i18next";
const BasicDetails = ({ userBasicDetails }) => {
  const { t: translate } = useTranslation();
  return (
    <>
      <div className="flex flex-col border-b-2 user_journey_container rounded-xl p-[20px] h-[100%]">
        <div className="flex flex-row justify-between mb-3 items-center">
          <div className="text-medium text-black text-3xl">
        {translate(BASIC_DETAILS.basicDetails)}
          </div>
        </div>
        <div className={` flex gap-5 justify-between ${review_invest_css.investment_div_width}`}>
          <div className="flex flex-row gap-3 items-center">
            <div className="flex text-medium text-6xl border-2 border-black rounded-full h-[90px] w-[90px] justify-center items-center text-black">
              {userBasicDetails?.customerFirstName
                ? userBasicDetails.customerFirstName.substring(
                  0,
                  1
                ) +
                userBasicDetails.customerLastName.substring(0, 1)
                : null}
            </div>
            <div className="flex flex-col">
              <div className="text-regular text-2xl text-subcontent">
                {translate(FD_RENEWAL.nameAsPerPan)}
              </div>
              <div className="text-medium text-black text-3xl">
                {userBasicDetails?.customerFullName ? (
                  userBasicDetails?.customerFullName
                ) : (
                  <Skeleton width={200} />
                )}
              </div>
            </div>
          </div>
          <div
            className={`${review_invest_css.basic_detail_status_position} my-5 flex gap-5 text-regular text-2xl text-light-gray`}
          >
            <div className="flex flex-col">
              <div className="text-subcontent">{translate(FD_RENEWAL.residentStatus)}</div>
              <div className="text-black">
                {"I am Indian Resident"}
              </div>
            </div>
            <div className="flex flex-col">
              <div className="text-subcontent">{translate(FD_RENEWAL.maritalStatus)}</div>
              <div className="text-black">
                {userBasicDetails?.customerMaritalStatus ? userBasicDetails?.customerMaritalStatus : ""}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default BasicDetails;

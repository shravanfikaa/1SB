import { COMMON_CONSTANTS, FD_RENEWAL } from "../constants";
import review_invest_css from "../styles/review_invest_css.module.css";
import { FaRegEdit } from "react-icons/fa";
import { useTranslation } from "react-i18next";
const ParentSpouseDetails = ({
  handleParentSpouseDetailsEdit,
  parentsSpouseDetail,
  spouseDetails,
  allowEdit
}) => {
  const { t: translate } = useTranslation();
    return (
    <>
      <div className="flex flex-col border-b-2 user_journey_container rounded-xl p-[20px] h-[100%]">
        <div className="flex flex-row justify-between mb-3 items-center">
          <div className="text-medium text-black text-3xl">
            {translate(COMMON_CONSTANTS.ParentAndSpouseDetails)}
          </div>
          <div className={`${allowEdit ? 'visible' : 'hidden'}`}>
            <div
              className="flex flex-row gap-2 items-center justify-center text-bold text-2xl text-fd-primary hover:cursor-pointer border rounded-md btn-gradient p-2"
              onClick={handleParentSpouseDetailsEdit}
            >
              <button type="button" class="btn btn-secondary" data-toggle="tooltip" data-placement="top" title="Edit Parent & Spouse Details">
                <FaRegEdit fill="#ffff" width={'10px'} />
              </button>
              {/* {translate(FD_RENEWAL.edit)} */}
            </div>
          </div>
        </div>
        <div className={`${review_invest_css.investment_div_width}`}>
          <div className="flex text-regular text-2xl text-light-gray">
            <div
              className={`flex gap-5 ${review_invest_css.basic_detail_status_position} mb-5`}
            >
              <div className="flex flex-col">
                <div>{translate(COMMON_CONSTANTS.FatherName)}</div>
                <div className="text-black">
                  {parentsSpouseDetail?.fatherFirstName
                    ? parentsSpouseDetail.fatherFirstName + " "
                    : ""}
                  {parentsSpouseDetail?.fatherMiddleName
                    ? parentsSpouseDetail.fatherMiddleName + " "
                    : ""}
                  {parentsSpouseDetail?.fatherLastName
                    ? parentsSpouseDetail.fatherLastName + " "
                    : ""}
                </div>
              </div>
              <div className="flex flex-col">
                <div>{translate(COMMON_CONSTANTS.MotherName)}</div>
                <div className="text-black">
                  {parentsSpouseDetail?.motherFirstName
                    ? parentsSpouseDetail.motherFirstName + " "
                    : ""}
                  {parentsSpouseDetail?.motherMiddleName
                    ? parentsSpouseDetail.motherMiddleName + " "
                    : ""}
                  {parentsSpouseDetail?.motherLastName
                    ? parentsSpouseDetail.motherLastName + " "
                    : ""}
                </div>
              </div>
            </div>
            {parentsSpouseDetail?.maritalStatus === "married" ?
              <div className="flex flex-col">
                <div className="text-subcontent">{translate(COMMON_CONSTANTS.SpouseName)}</div>
                <div className="mb-5 capitalize text-black">
                  {spouseDetails?.spouseFirstName
                    ? spouseDetails.spouseFirstName + " "
                    : ""}
                  {spouseDetails?.spouseMiddleName
                    ? spouseDetails.spouseMiddleName + " "
                    : ""}
                  {spouseDetails?.spouseLastName
                    ? spouseDetails.spouseLastName + " "
                    : ""}
                </div>
              </div>
              : null}
          </div>
        </div>
      </div>
    </>
  );
};

export default ParentSpouseDetails;

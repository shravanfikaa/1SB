import { FaRegEdit } from "react-icons/fa";
import review_invest_css from "../styles/review_invest_css.module.css";
import { FD_RENEWAL,AGENT, PARENT_DETAILS_PAYMENT, COMPONENTS } from "../constants";
import { useTranslation } from "react-i18next";
const ProfessionalDetails = ({
  handleProfessionalDetailsEdit,
  professionalDetails,
  allowEdit
}) => {
  const { t: translate } = useTranslation();
  return (
    <>
      <div className="flex flex-col border-b-2 user_journey_container rounded-xl p-[20px] h-[100%]">
        <div className="flex flex-row justify-between mb-3 items-center">
          <div className="text-medium text-black text-xxl">{translate(COMPONENTS.professionalDetails)}</div>
          <div className={`${allowEdit ? 'visible' : 'hidden'}`}>
            <div
              className="flex flex-row gap-2 items-center justify-center text-bold text-2xl text-fd-primary hover:cursor-pointer border rounded-md btn-gradient p-2"
              onClick={handleProfessionalDetailsEdit}
            >
              <button type="button" class="btn btn-secondary" data-toggle="tooltip" data-placement="top" title="Edit Professional Details">
                <FaRegEdit fill="#ffff" width={'10px'} />
              </button>
              {/* {translate(FD_RENEWAL.edit)} */}
            </div>
          </div>
        </div>
        <div className={`${review_invest_css.investment_div_width}`}>
          <div className="flex text-regular text-2xl text-light-gray">
            <div
              className={`flex justify-between w-full ${review_invest_css.basic_detail_status_position}`}
            >
              <div className="flex flex-col">
                <div className="text-subcontent">{translate(COMPONENTS.occupation)}</div>
                <div className="capitalize text-black">
                  {professionalDetails.Occupation}
                </div>
              </div>
              <div className="flex flex-col">
                <div className="text-subcontent">{translate(COMPONENTS.annualIncome)}</div>
                <div className="text-black">{professionalDetails.Income}</div>
              </div>
              {professionalDetails.SourceOfWealth ? <>
                <div className="flex flex-col">
                  <div className="text-subcontent">{translate(COMPONENTS.sourceOfWealth)}</div>
                  <div className="text-black">{professionalDetails.SourceOfWealth}</div>
                </div>
              </>: null}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ProfessionalDetails;

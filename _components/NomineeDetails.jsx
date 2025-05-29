import { FaRegEdit } from "react-icons/fa";
import review_invest_css from "../styles/review_invest_css.module.css";
import { COMPONENTS, FD_RENEWAL } from "../constants";
import { useTranslation } from "react-i18next";


const NomineeDetails = ({ handleNomineeDetailsEdit, nominee_details, allowEdit }) => {
  const { t: translate } = useTranslation();
  return (
    <>
      <div className="flex flex-col border-b-2 user_journey_container rounded-xl p-[20px] h-full capitalize">
        <div className="flex flex-row justify-between mb-3 items-center">
          <div className="text-medium text-black text-3xl">{translate(FD_RENEWAL.nomination)}</div>
          <div className={`${allowEdit ? 'visible' : 'hidden'}`}>
            <div
              className="flex flex-row gap-2 items-center justify-center text-bold text-2xl text-fd-primary hover:cursor-pointer border rounded-md btn-gradient p-2"
              onClick={handleNomineeDetailsEdit}
            >
              <button type="button" class="btn btn-secondary" data-toggle="tooltip" data-placement="top" title="Edit Nominee Details">
                <FaRegEdit fill="#ffff" width={'10px'} />
              </button>
            </div>
          </div>
        </div>
        <div className={`${review_invest_css.investment_div_width}`}>
          <div
            className={`${review_invest_css.basic_detail_status_position} text-regular text-2xl text-light-gray`}
          >
            {nominee_details && nominee_details[0] ? (
              <div className="flex flex-col">
                <div className="flex flex-row space-x-5 text-subcontent">{translate(FD_RENEWAL.nominee)} 1 </div>
                <div
                  className={`${review_invest_css.basic_detail_status_position} text-black`}
                >
                  <div className="flex justify-between capitalize">
                    <div>
                      {nominee_details &&
                        nominee_details[0] &&
                        nominee_details[0].nomineeFirstName
                        ? nominee_details[0].nomineeFirstName || "" +
                        " " +
                        nominee_details[0].nomineeMiddleName || "" +
                        " " +
                        nominee_details[0].nomineeLastName || ""
                        : ""}
                      {nominee_details &&
                        nominee_details[0] &&
                        nominee_details[0].nominee_first_name
                        ? nominee_details[0].nominee_first_name || "" +
                        " " +
                        nominee_details[0].nominee_middle_name || "" +
                        " " +
                        nominee_details[0].nominee_last_name || ""
                        : ""}
                    </div>
                    
                      <div>
                        {nominee_details &&
                          nominee_details[0] &&
                          nominee_details[0].nomineeRelationship
                          ? nominee_details[0].nomineeRelationship
                          : ""}
                        {nominee_details &&
                          nominee_details[0] &&
                          nominee_details[0].nominee_relation
                          ? nominee_details[0].nominee_relation
                          : ""}
                      </div>{" "}
                   
                      <div>
                        {nominee_details &&
                          nominee_details[0] &&
                          nominee_details[0].nomineePercentage
                          ? nominee_details[0].nomineePercentage + " %"
                          : ""}
                        {nominee_details &&
                          nominee_details[0] &&
                          nominee_details[0].nominee_percentage
                          ? nominee_details[0].nominee_percentage + " %"
                          : ""}
                      </div>
                    
                  </div>
                  {nominee_details &&
                    nominee_details[0] &&
                    nominee_details[0].nomineeGuardianFirstName ? (
                    <div className="flex flex-col">
                      <div className="text-regular text-2xl text-light-gray break-words">
                      {translate(FD_RENEWAL.minorGuardianName)}
                      </div>
                      <div className="">
                        {nominee_details[0] &&
                          nominee_details[0].nomineeGuardianFirstName &&
                          nominee_details[0].nomineeGuardianLastName
                          ? nominee_details[0].nomineeGuardianFirstName || "" +
                          " " +
                          nominee_details[0].nomineeGuardianMiddleName || "" +
                          " " +
                          nominee_details[0].nomineeGuardianLastName || ""
                          : ""}
                      </div>
                    </div>
                  ) : null}
                  {nominee_details &&
                    nominee_details[0] &&
                    nominee_details[0].nominee_guardian_first_name ? (
                    <div className="flex flex-col">
                      <div className="text-regular text-2xl text-light-gray break-words">
                        {translate(FD_RENEWAL.minorGuardianName)}
                  
                      </div>
                      <div className="">
                        {nominee_details[0] &&
                          nominee_details[0].nominee_guardian_first_name &&
                          nominee_details[0].nominee_guardian_last_name
                          ? nominee_details[0].nominee_guardian_first_name || "" +
                          " " +
                          nominee_details[0].nominee_guardian_middle_name || "" +
                          " " +
                          nominee_details[0].nominee_guardian_last_name || ""
                          : ""}
                      </div>
                    </div>
                  ) : null}
                </div>
              </div>
            ) : null}
            {nominee_details && nominee_details[1] ? (
              <div className="flex flex-col">
                <div className="text-regular text-2xl text-light-gray flex flex-row space-x-5">
                {translate(FD_RENEWAL.nominee)} 2
                </div>
                <div
                  className={`${review_invest_css.basic_detail_status_position} text-black`}
                >
                  <div className="flex flex-col capitalize">
                    <div>
                      {nominee_details &&
                        nominee_details[1] &&
                        nominee_details[1].nomineeFirstName
                        ? nominee_details[1].nomineeFirstName || "" +
                        " " +
                        nominee_details[1].nomineeMiddleName || "" +
                        " " +
                        nominee_details[1].nomineeLastName || ""
                        : ""}
                      {nominee_details &&
                        nominee_details[1] &&
                        nominee_details[1].nominee_first_name
                        ? nominee_details[1].nominee_first_name || "" +
                        " " +
                        nominee_details[1].nominee_middle_name || "" +
                        " " +
                        nominee_details[1].nominee_last_name || ""
                        : ""}
                    </div>
                    <div className="flex flex-row capitalize">
                      <div>
                        {nominee_details &&
                          nominee_details[1] &&
                          nominee_details[1].nomineeRelationship
                          ? nominee_details[1].nomineeRelationship
                          : ""}
                        {nominee_details &&
                          nominee_details[1] &&
                          nominee_details[1].nominee_relation
                          ? nominee_details[1].nominee_relation
                          : ""}
                      </div>{" "}
                      &nbsp;
                      <div>
                        {nominee_details &&
                          nominee_details[1] &&
                          nominee_details[1].nomineePercentage
                          ? nominee_details[1].nomineePercentage + " %"
                          : ""}
                        {nominee_details &&
                          nominee_details[1] &&
                          nominee_details[1].nominee_percentage
                          ? nominee_details[1].nominee_percentage + " %"
                          : ""}
                      </div>
                    </div>
                  </div>
                  {nominee_details &&
                    nominee_details[1] &&
                    nominee_details[1].nomineeGuardianFirstName ? (
                    <div className="flex flex-col">
                      <div className="text-regular text-2xl text-light-gray">
                      {translate(FD_RENEWAL.minorGuardianName)}
                      </div>
                      <div className="">
                        {nominee_details[1] &&
                          nominee_details[1].nomineeGuardianFirstName
                          ? nominee_details[1].nomineeGuardianFirstName || "" +
                          " " +
                          nominee_details[1].nomineeGuardianMiddleName || "" +
                          " " +
                          nominee_details[1].nomineeGuardianLastName || ""
                          : ""}
                      </div>
                    </div>
                  ) : null}
                  {nominee_details &&
                    nominee_details[1] &&
                    nominee_details[1].nominee_guardian_first_name ? (
                    <div className="flex flex-col">
                      <div className="text-regular text-2xl text-light-gray break-words">
                        {translate(FD_RENEWAL.minorGuardianName)}
                      </div>
                      <div className="">
                        {nominee_details[1] &&
                          nominee_details[1].nominee_guardian_first_name &&
                          nominee_details[1].nominee_guardian_last_name
                          ? nominee_details[1].nominee_guardian_first_name || "" +
                          " " +
                          nominee_details[1].nominee_guardian_middle_name || "" +
                          " " +
                          nominee_details[1].nominee_guardian_last_name || ""
                          : ""}
                      </div>
                    </div>
                  ) : null}
                </div>
              </div>
            ) : null}
            {nominee_details && !nominee_details.length && (
              <div>{translate(COMPONENTS.noNomineeAdded)}</div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default NomineeDetails;

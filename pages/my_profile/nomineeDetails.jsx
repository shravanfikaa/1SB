import { useTranslation } from "react-i18next";
import { AGENT, MY_PROFILE } from "../../constants";
import { dateWithSpace } from "../../lib/util";
import profile from "../../styles/profile.module.css";
import { AiOutlineEdit, AiOutlineDelete } from "react-icons/ai";

function NomineeDetails({
  nomineeData,
  handleEditBtn,
  getDeleteBtnClickStatus,

  
}

) {
  const { t: translate } = useTranslation();
  return (
    <>
      <div className={`${profile.info_table_container}`}>
        <table className="table-auto w-full text-left border-collapse border lack-400 border-spacing-y-7">
          <thead className="text-2xl text-light-gray text-medium">
            <tr className="bg-dark-gray p-4 ">
              <th className="font-normal p-2">{translate(MY_PROFILE.name)}</th>
              <th className="font-normal p-2">{translate(MY_PROFILE.relation)}</th>
              <th className="font-normal p-2">{translate(MY_PROFILE.pan)}</th>
              <th className="font-normal p-2">{translate(AGENT.dateOfBirth)}</th>
              <th className="font-normal p-2">{translate(MY_PROFILE.guardian)}</th>
              <th></th>
            </tr>
          </thead>
          <tbody className="text-regular text-xl text-black">
            {nomineeData &&
              nomineeData.map((data) => {
                return (
                  <tr key={data.id} className="border-b lack-400">
                    <td className="p-3 text-black capitalize ">
                      {data.nominee_first_name}
                    </td>
                    <td className="p-3 text-black">{data.nominee_relation}</td>
                    <td className="p-3 text-black">{data.nominee_pan_number}</td>
                    <td className="p-3 text-black">
                      {data.nominee_date_of_birth
                        ? dateWithSpace(data.nominee_date_of_birth)
                        : ""}
                    </td>
                    <td className="p-3 text-black text-light-blue">
                      {data.is_nominee_minor ? "Yes" : null}
                    </td>
                    {typeof handleEditBtn === "function" ? (
                      <td>
                        <div className="flex gap-3">
                          <button
                            className="text-light-blue"
                            onClick={() => handleEditBtn(data)}
                          >
                            <AiOutlineEdit size={24} />
                          </button>
                          <button
                            className="text-light-red"
                            onClick={() =>
                              getDeleteBtnClickStatus({
                                show: true,
                                id: data,
                                shouldDelete: false,
                              })
                            }
                          >
                            <AiOutlineDelete size={24} />
                          </button>
                        </div>
                      </td>
                    ) : null}
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>
      <div className={`${profile.info_container}`}>
        {nomineeData &&
          nomineeData.map((data) => {
            return (
              <>
                <div className="text-xl text-regular flex flex-wrap justify-between">
                  <div className="text-light-gray">
                    <div>{translate(MY_PROFILE.name)}</div>
                    <div>{translate(MY_PROFILE.relation)}</div>
                    <div>{translate(MY_PROFILE.pan)}</div>
                    <div>{translate(AGENT.dateOfBirth)}</div>
                    <div>{translate(MY_PROFILE.guardian)}</div>
                  </div>
                  <div>
                    <div className="capitalize">{data.nominee_first_name}</div>
                    <div>{data.nominee_relation}</div>
                    <div>{data.nominee_pan_number}</div>
                    <div>
                      {data.nominee_date_of_birth
                        ? dateWithSpace(data.nominee_date_of_birth)
                        : ""}
                    </div>
                    <div className="p-3 text-black text-light-blue">
                      {data.is_nominee_minor ? "Yes" : null}
                    </div>
                  </div>
                </div>
                <div className="flex gap-3 flex-row-reverse">
                  <button
                    className="text-light-red"
                    onClick={() =>
                      getDeleteBtnClickStatus({
                        show: true,
                        id: data,
                        shouldDelete: false,
                      })
                    }
                  >
                    <AiOutlineDelete size={22} />
                  </button>
                  <button
                    className="text-light-blue"
                    onClick={() => handleEditBtn(data)}
                  >
                    <AiOutlineEdit size={22} />
                  </button>
                </div>
                <div className="flex-grow border-t my-2 lack-400 w-full flex items-center self-center"></div>
              </>
            );
          })}
      </div>
    </>
  );
}

export default NomineeDetails;

import { useEffect, useState } from "react";
import { getFullName, dateFormat } from "../../../../lib/util";
import { AGENT, RM_AGENT_COLUMNS } from "../../../../constants";
import { useTranslation } from "react-i18next";

function AgentTransferTable({ getSelectedAgent, agentData }) {
  const [selectedAgent, setSelectedAgent] = useState();

  const handleAgentSelect = (e, index) => {
    setSelectedAgent(agentData[index]);
  };
  const { t: translate } = useTranslation();
  const fullName = (first_name, last_name) => (
    <td className="text-regular text-xl text-black justify-items-center p-5 break-all">
      {getFullName(first_name, "", last_name)}
    </td>
  );

  useEffect(() => {
    selectedAgent && getSelectedAgent(selectedAgent);
  }, [selectedAgent]);

  return (
    <>
      {agentData?.length ? (
        <table className="table-fixed text-left border-collapse border-b border-spacing-y-5">
          <tbody className="text-regular text-xl block max-h-[280px] overflow-auto">
            <tr className="text-medium text-2xl text-light-gray">
              <td className=""></td>
              {Object.keys(RM_AGENT_COLUMNS).map((val) => (
                <td className="justify-items-center px-2">
                  {translate(RM_AGENT_COLUMNS[val])}
                </td>
              ))}
            </tr>
            {agentData?.length &&
              agentData.map((data, index) => {
                return (
                  <tr className="border-b lack-400">
                    <td className="text-regular text-xl text-black px-2  items-center ">
                      <input
                        type="radio"
                        onChange={(e) => handleAgentSelect(e, index)}
                        name="customerSelect"
                        disabled={data.user_status.toLowerCase() === "inactive"}
                        className="accent-primary-green h-5 w-5 hover:cursor-pointer"
                      />
                    </td>
                    {Object.keys(RM_AGENT_COLUMNS).map((value) => {
                      if (value === "employee_name") {
                        return fullName(data.first_name, data.last_name);
                      } else if (
                        value === "created_on" ||
                        value === "lastLogin"
                      ) {
                        return (
                          <td className="text-regular text-xl text-black  justify-items-center px-2 break-all">
                            {data[value] ? dateFormat(data[value]) : null}
                          </td>
                        );
                      } else {
                        return (
                          <td className="text-regular text-xl text-black justify-items-center p-5 break-all">
                            {data[value]}
                          </td>
                        );
                      }
                    })}
                  </tr>
                );
              })}
          </tbody>
        </table>
      ) : (
        <div className="flex justify-center text-light-gray">{translate(AGENT.noDataFound)}</div>
      )}
    </>
  );
}

export default AgentTransferTable;

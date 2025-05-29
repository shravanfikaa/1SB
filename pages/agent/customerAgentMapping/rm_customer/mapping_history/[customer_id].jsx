import { IoMdClose } from "react-icons/io";
import { dateFormat } from "../../../../../lib/util";
import { useTranslation } from "react-i18next";
import { ADDRESS_DETAILS, AGENT } from "../../../../../constants";
function MappingHistory({ updateModalState, customerMappedData }) {
  const { t: translate } = useTranslation();
  return (
    <>
      <div className="fixed inset-0 z-10 overflow-y-auto">
        <div
          className="fixed inset-0 w-auto h-auto bg-black opacity-25"
          onClick={updateModalState}
        ></div>
        <div className="flex justify-center items-center min-h-screen text-regular">
          <div className={`relative w-3/4 p-5 bg-white rounded-md text-black`}>
            <div className="flex justify-between mb-5">
              <h1 className="text-medium text-4xl">{translate(AGENT.mappingHistory)}</h1>
              <IoMdClose
                className="cursor-pointer"
                onClick={updateModalState}
              />
            </div>
            <div className="flex flex-col justify-center">
              {customerMappedData?.length ? (
                <div className="flex flex-col capitalize text-regular w-full block max-h-[350px] overflow-auto overflow-x-auto">
                  <div className="flex justify-between mb-5 gap-3 font-bold text-light-gray">
                    <div className="w-1/5">
                      <p className="break-words whitespace-normal">{translate(AGENT.date)}</p>
                    </div>
                    <div className="w-1/5">
                      <p className="break-words whitespace-normal">{translate(AGENT.action)}</p>
                    </div>
                    <div className="w-1/5">
                      <p className="break-words whitespace-normal">{translate(AGENT.rmName)}</p>
                    </div>
                    <div className="w-1/5">
                      <p className="break-words whitespace-normal">
                        {translate(AGENT.changedBy)}
                      </p>
                    </div>
                  </div>
                  {customerMappedData &&
                    customerMappedData.map((item) => {
                      return (
                        <div className="flex justify-between mb-5 border-b pb-1 gap-3">
                          <>
                            <div className="w-1/5">
                              <p className="break-words whitespace-normal">
                                {dateFormat(item.created_on)}
                              </p>
                            </div>
                            <div className="w-1/5">
                              <p
                                className="break-words whitespace-normal"
                                lang="de"
                              >
                                {item.action}
                              </p>
                            </div>
                            <div className="w-1/5">
                              <p className="break-words whitespace-normal">
                                {item.agent_first_name +
                                  " " +
                                  item.agent_last_name}
                              </p>
                            </div>
                            <div className="w-1/5">
                              <p className="break-words whitespace-normal">
                                {item.admin_first_name +
                                  " " +
                                  item.admin_last_name}
                              </p>
                            </div>
                          </>
                        </div>
                      );
                    })}
                </div>
              ) : (
                <div className="flex justify-center my-5 text-light-gray text-4xl">
                  {translate(AGENT.noDataFound)}
                </div>
              )}
              <div className="flex justify-center mt-3">
                <button
                  className="button-passive border-fd-primary text-fd-primary rounded-md"
                  onClick={updateModalState}
                >
                  {translate(ADDRESS_DETAILS.close)} 
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default MappingHistory;

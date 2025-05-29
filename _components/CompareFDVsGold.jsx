import Image from "next/image";
import { IoMdClose } from "react-icons/io";
import { COMMON, COMMON_CONSTANTS, COMPONENTS, FD_VS_GOLD_TABLE_CONTENT } from "../constants";
import { useTranslation } from "react-i18next";

function CompareFDVsGold({ toggleModal }) {
  const { t: translate } = useTranslation();
  const data = translate(FD_VS_GOLD_TABLE_CONTENT, { returnObjects: true });

  return (
    <>
      <div className="fixed inset-0 z-10 overflow-y-auto">
        <div className="fixed inset-0 w-auto h-auto bg-black opacity-40"></div>
        <div className="flex items-center justify-center min-h-screen px-4 py-8">
          <div className={`bg-white rounded-md shadow-lg z-[1]`}>
            <div className="w-full">
              <div className="flex flex-row">
                <div className="pl-6 ml-6">
                  <table className="table-auto">
                    <thead>
                      <tr className="">
                        <th></th>
                        <th className="fd-column p-4 text-thicccboi-extra-bold text-8xl">
                          <div className="flex gap-3 justify-center items-center">
                            <span className="text-black">{translate(COMMON_CONSTANTS.fixedDeposit)}</span>
                            <Image
                              src="https://1sb-artifacts.s3.ap-south-1.amazonaws.com/FD/fd.png"
                              alt="FD vs Gold logo"
                              width={60}
                              height={53}
                            />
                          </div>
                        </th>
                        <th className="gold-column p-4 text-thicccboi-extra-bold text-8xl">
                          <div className="flex gap-3 justify-center items-center">
                            <span className="text-black">{translate(COMPONENTS.gold)}</span>
                            <Image
                              src="https://1sb-artifacts.s3.ap-south-1.amazonaws.com/FD/gold.png"
                              alt="FD vs Gold logo"
                              width={34}
                              height={40}
                            />
                          </div>
                        </th>
                        
                      </tr>
                    </thead>
                    <tbody className="text-medium text-xl text-black align-top">
                      {data.map((content) => {
                        return (
                          <tr className="border-b-2">
                            <td className="w-[30%] py-4 text-black">{content.title}</td>
                            <td className="fd-column p-4 text-black">
                              {typeof content.fdDescription === "string" ? (
                                content.fdDescription
                              ) : (
                                <>
                                  {content.fdDescription.descriptionHeader}
                                  <ul className="ul-disc">
                                    {content.fdDescription.description.map(
                                      (desc) => {
                                        return <li>{desc}</li>;
                                      }
                                    )}
                                  </ul>
                                </>
                              )}
                            </td>
                            <td className="gold-column p-4 text-black">
                              {typeof content.goldDescription === "string" ? (
                                content.goldDescription
                              ) : (
                                <>
                                  {content.goldDescription.descriptionHeader}
                                  <ul className="ul-disc">
                                    {content.goldDescription.description.map(
                                      (desc) => {
                                        return <li>{desc}</li>;
                                      }
                                    )}
                                  </ul>
                                </>
                              )}
                            </td>
                            
                          </tr>
                        );
                      })}
                      {/* To achieve the view as per design we need to add extra table row */}
                      <tr>
                        <td className="w-[30%] py-4 text-black"></td>
                        <td className="gold-column p-4 text-black "></td>
                        <td className="fd-column p-4 text-black"></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <div className="p-4">
                  <button onClick={toggleModal}>
                    <IoMdClose size={22} fill="#000" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default CompareFDVsGold;

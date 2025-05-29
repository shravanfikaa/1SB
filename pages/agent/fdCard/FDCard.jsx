import { AiFillCheckCircle, AiFillCloseCircle } from "react-icons/ai";
import { displayINRAmount, formatDate } from "../../../lib/util";
import agent_fd_card_css from "../../../styles/agent_customer_fd.module.css";
import { COMMON_CONSTANTS, FD_RENEWAL, AFTER_REVIEW, AGENT } from "../../../constants";
import { useTranslation } from "react-i18next";

function FDCard({ item }) {
  const { t: translate } = useTranslation();

  function convert(str) {
    const date = new Date(str),
      month = ("0" + (date.getMonth() + 1)).slice(-2),
      day = ("0" + date.getDate()).slice(-2);
    return [date.getFullYear(), month, day].join("-");
  }

  return (
    <>
      {item ? (
        <div key={item.id} className="product-card   overflow-hidden  duration-300 ease-in mb-5 text-apercu bg-white p-[20px] border cursor-pointer transition-all duration-400 ease-in-out transform hover:-translate-y-1.2 hover:scale-[1.01] ">
          <div className="h-3/4">
            <div className="flex flex-wrap gap-3 justify-between">
              <div className="flex gap-3 justify-between">
                <div>
                  <img
                    src={item.product_logo ? item.product_logo : ""}
                    width="93"
                    height="32"
                    objectFit={"contain"}
                  />
                </div>
                <div>
                  <div className="text-medium text-3xl text-black">{item.fd_name}</div>
                  <div className="text-medium text-xl text-black text-light-gray">
                    {item.type}
                  </div>
                </div>
              </div>
              <div className="flex gap-3">
                <div>
                  {item.payment_status === "Booked" ? (
                    <button className="button-active btn-gradient button-transition hover:bg-hover-primary text-medium text-xl text-white lg:text-2xl w-fit   text-medium text-xl lg:text-2xl w-fit  hover:button-shadow">
                      {translate(AGENT.renew)}
                    </button>
                  ) : null}
                </div>

                <div className="text-medium flex gap-5 text-xl text-black text-light-gray">
                  <div>
                    <div>{translate(AGENT.fdStatus)}</div>
                    <div>
                      {item.status === "Booked" ? (
                        <div className="text-regular capitalize text-xl text-primary-green">
                          {item.status}
                        </div>
                      ) : (
                        <div className="text-regular capitalize text-xl text-light-blue">
                          {item.status}
                        </div>
                      )}
                    </div>
                  </div>
                  <div>
                    <div>{translate(AGENT.paymentStatus)}</div>
                    <div className="text-regular capitalize text-xl text-light-blue">
                      {item &&
                        item.hasOwnProperty("payment_status") &&
                        item.payment_status != null
                        ? item.payment_status.toLowerCase()
                        : "Pending"}
                    </div>
                  </div>
                </div>
                <div className="text-regular text-xl text-black text-fd-primary capitalize">


                </div>
              </div>
            </div>
            <div>
              <div className="flex flex-wrap justify-around gap-y-3 gap-x-3 capitalize w-full mt-3">
                <div
                  className={`whitespace-nowrap w-full ${agent_fd_card_css.card_content_number}`}
                >
                  <div className="text-medium text-xl text-black text-light-gray ">
                    {translate(AGENT.number)}
                  </div>
                  <div className="text-regular text-xl text-black ">
                    <p className="whitespace-normal break-words">
                      {item.application_number}
                    </p>
                  </div>
                </div>
                <div
                  className={`whitespace-nowrap w-full ${agent_fd_card_css.card_content}`}
                >
                  <div className="text-medium text-xl text-black text-light-gray ">
                    {translate(AGENT.interest)} %
                  </div>
                  <div className="text-regular text-xl text-black">
                    {item.interest_rate}
                  </div>
                </div>
                <div
                  className={`whitespace-nowrap w-full ${agent_fd_card_css.card_content}`}
                >
                  <div className="text-medium text-xl text-black text-light-gray ">
                    {translate(FD_RENEWAL.depositAmount)}
                  </div>
                  <div className="text-regular text-xl text-black">
                    {displayINRAmount(item.fd_amount)}
                  </div>
                </div>
                <div
                  className={`whitespace-nowrap w-full ${agent_fd_card_css.card_content}`}
                >
                  <div className="text-medium text-xl text-black text-light-gray ">
                    {translate(COMMON_CONSTANTS.tenure)}
                  </div>
                  <div className="text-regular text-xl text-black">
                    {
                      item?.additional_params?.displayTenure ? item?.additional_params?.displayTenure :
                        `${item?.additional_params?.tenureInDays ? item?.additional_params?.tenureInDays : ""} ${translate(COMMON_CONSTANTS.days)}`
                    }
                    {/* {item.tenor ? parseInt(item.tenor) / 30 + " " + "M" : ""} */}
                  </div>
                </div>
                <div
                  className={`whitespace-nowrap w-full ${agent_fd_card_css.card_content}`}
                >
                  <div className="text-medium text-xl text-black text-light-gray ">
                    {translate(AFTER_REVIEW.openDate)}
                  </div>
                  <div className="text-regular text-xl text-black">
                    {formatDate(item.fd_open_date)}
                  </div>
                </div>
                <div
                  className={`whitespace-nowrap w-full ${agent_fd_card_css.card_content}`}
                >
                  <div className="text-medium text-xl text-black text-light-gray ">
                    {translate(AFTER_REVIEW.maturityDate)}
                  </div>
                  <div className="text-regular text-xl text-black">
                    {formatDate(item.fd_maturity_date)}
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-[#F4F9FF] text-sm text-left rounded-b-md flex flex-row justify-between h-1/4 p-6">
            <div className="flex flex-row gap-3 items-center text-regular text-sm">
              <div className="bg-white p-1 flex items-center gap-1 rounded border-1 border-gray-300 text-black">
                {item.is_renewal_eligible ? (
                  <AiFillCheckCircle className="text-primary-green" />
                ) : (
                  <AiFillCloseCircle className="text-light-red" />
                )}
                {translate(COMMON_CONSTANTS.autoRenew)}
              </div>
              <div className="bg-white p-1 flex items-center gap-1 rounded border-1 border-gray-300 text-black">
                {item.isNominee ? (
                  <AiFillCheckCircle className="text-primary-green" />
                ) : (
                  <AiFillCloseCircle className="text-light-red" />
                )}
                {translate(AGENT.nomineeRegistered)}
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

export default FDCard;

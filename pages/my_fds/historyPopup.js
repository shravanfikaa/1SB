import React from "react";
import { IoMdClose } from "react-icons/io";
import { dateFormat, displayINRAmount } from "../../lib/util";
import { ADDRESS_DETAILS,AFTER_REVIEW,AGENT } from "../../constants";
import { useTranslation } from "react-i18next";

const HistoryPopup = ({ canShow, updateModalState }) => {
  const { t: translate } = useTranslation();
  const data = [
    {
      "data": {
        "customer_id": 100,
        "fd_history": [
          {
            "fd_id": 111,
            "parent_fd_id": "",
            "renewed_fd_id": "",
            "fd_amount": 10000,
            "transaction_type": "fresh",
            "operation_status": "Success",
            "created_on": "2023-05-05"
          },
          {
            "fd_id": 222,
            "parent_fd_id": "",
            "renewed_fd_id": "111",
            "fd_amount": 10000,
            "transaction_type": "renewed",
            "operation_status": "Success",
            "created_on": "2024-05-05"
          },
          {
            "fd_id": 333,
            "parent_fd_id": "111",
            "renewed_fd_id": "222",
            "fd_amount": 10000,
            "transaction_type": "renewed",
            "operation_status": "Pending",
            "created_on": "2023-05-05"
          }
        ]
      }
    }
  ];
  if (canShow) {
    return (
      <>
        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div
            className="fixed inset-0 w-auto h-auto bg-black opacity-25"
            onClick={() => {
              updateModalState(false);
            }}
          ></div>
          <div className="flex justify-center items-center min-h-screen">
            <div
              className={`relative w-3/5 p-6 bg-white rounded-md`}
            >
              <div className="flex justify-between text-regular text-4xl text-black font-bold mb-6">
                <h1>{translate(MAKE_PAYMENT_FDS.transactionHistoryDetails)}</h1>
                <IoMdClose onClick={() => {
                  updateModalState(false)
                }} />

              </div>
              <div className="flex flex-col capitalize text-regular w-full block max-h-[350px] overflow-auto overflow-x-auto">
                <div className="flex justify-between mb-5 gap-3 font-bold text-light-gray">
                  <div className="w-1/6"><p className='break-words whitespace-normal'>{translate(AFTER_REVIEW.refNumber)}</p></div>
                  <div className="w-1/5"><p className='break-words whitespace-normal'>{translate(MAKE_PAYMENT_FDS.description)}</p></div>
                  <div className="w-1/5"><p className='break-words whitespace-normal'>{translate(AGENT.date)}</p></div>
                  <div className="w-1/5"><p className='break-words whitespace-normal'>{translate(MAKE_PAYMENT_FDS.amount)}</p></div>
                  <div className="w-1/6"><p className='break-words whitespace-normal'>{translate(AGENT.status)}</p></div>
                </div>
                {data[0].data.fd_history.map((item) => {
                  return (
                    <div className="flex justify-between mb-5 border-b pb-1 gap-3">
                      <>
                        <div className="w-1/6"><p className='break-words whitespace-normal'>{item.fd_id}</p></div>
                        <div className="w-1/5"><p className='break-words whitespace-normal' lang='de'>{item.transaction_type}</p></div>
                        <div className="w-1/5"><p className='break-words whitespace-normal'>{dateFormat(item.created_on)}</p></div>
                        <div className="w-1/5"><p className='break-words whitespace-normal'>{displayINRAmount(item.fd_amount)}</p></div>
                        <div className="w-1/6 text-primary-green"><p className='break-words whitespace-normal'>{item.operation_status}</p></div>
                      </>
                    </div>
                  );
                })}
              </div>
              <div className="flex justify-center mt-3">
                <button
                  className=" button-passive rounded-md "
                  onClick={updateModalState}
                >
                  {translate(ADDRESS_DETAILS.close)}
                </button>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  return null;
};

export default HistoryPopup;

import { AiFillCheckCircle } from "react-icons/ai";
import React from 'react';
import { COMMON_CONSTANTS, MAKE_PAYMENT_FDS } from '../../constants';
import { useTranslation } from 'react-i18next';

const FdBooked = props => {
  const { t: translate } = useTranslation();
  if (!props.booked) {
    return null
  }
  return (
    <div className='modal '>
      <div className='modal-content round2'>
        <div className='modal-header'>
          <h4 className='modal-title text-apercu-regular font-bold text-lg text-black'>  {translate(MAKE_PAYMENT_FDS.fdWithdraw)}</h4>

        </div>
        <div className='modal-body'>
          <div className="modal-body relative p-4 text-apercu-regular">
            <div className="flex  justify-center">

              <div>
                <AiFillCheckCircle className="text-cyan-500 text-6xl my-7" />
              </div>

            </div>
            <div className="flex text-cyan-500 justify-center font-bold mb-4 text-xl">{translate(MAKE_PAYMENT_FDS.great)} !</div>
            <div className="flex  justify-center font-bold my-7 text-xl">{translate(MAKE_PAYMENT_FDS.fdwithdrawalSuccessfullyRegistered)}</div>
            <div className="flex justify-center ">
              <button
                type="button"
                className="ml-3 button-passive text-sm text-apercu font-semibold xl:w-32 lg:w-28 md:w-20 sm:w-20 xs:w-12"
                onClick={props.onClose}
              >
                {translate(COMMON_CONSTANTS.cancel)}
              </button>
            </div>
          </div>
        </div>

      </div>

    </div>
  )
}

export default FdBooked;

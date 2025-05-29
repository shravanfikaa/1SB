import { GetApiHandler } from "../api/apihandler"
import { useState, useEffect } from "react";

import React from 'react';
import FdBooked from './fdBooked';
import { useTranslation } from "react-i18next";
import { COMMON_CONSTANTS, AFTER_REVIEW, MAKE_PAYMENT_FDS, AGENT } from '../../constants';


function classNames(...classes) {
    return classes.filter(Boolean).join(' ')
}

const WithdrawFd = props => {
    const [withdrawFd, setWithdrawFd] = useState([])
    const [booked, setBooked] = useState(false)
    const [history, setHistory] = useState([])
    const { t: translate } = useTranslation();

    useEffect(() => {
        var fdHistoryurl = "http://wealth-applicationlayer-alb-853536065.ap-south-1.elb.amazonaws.com/api/v1/fd/history?user_id=1&fd_id=2"
        var method = "GET"
        GetApiHandler(fdHistoryurl, method)
            .then((response) => {
                setHistory(response.data.data)

            })
    }, [])

    if (!props.showWithdraw) {
        return null
    }
    return (
        <div className='modal '>
            <div className='modal-content round2'>
                <div className='modal-header'>
                    <h4 className='modal-title text-apercu-regular font-bold text-lg text-black'>{translate(MAKE_PAYMENT_FDS.fdWithdraw)}</h4>

                </div>
                <div className='modal-body'>
                    <div className="flex ">
                        <div className="w-1/2 text-black ">
                            <table className="auto ml-4">
                                <thead className=" ">
                                    <tr>
                                        <th
                                            scope="col"
                                            className="text-apercu text-sm font-medium text-gray-900 px-6 py-4 text-left"
                                        ></th>
                                    </tr>
                                </thead>
                                <tbody className="font-semibold">
                                    <tr className="bg-white border-b ">
                                        <td className="px-6 py-4  text-sm font-bold text-gray-400 text-apercu">

                                            {translate(AFTER_REVIEW.fdrNumber)}
                                        </td>
                                        <td className="px-6 py-4 flex justify-end text-sm font-medium  text-apercu-medium">
                                            {history[0]["fdr_number"]}
                                        </td>
                                    </tr>
                                    <tr className="bg-white border-b  ">
                                        <td className="px-6 py-4  text-sm font-bold text-gray-400 text-apercu">
                                            {translate(AGENT.fdName)}
                                        </td>
                                        <td className="px-6 py-4 flex justify-end text-sm font-medium  text-apercu-medium">
                                            {history[0]["operational_description"]}
                                        </td>
                                    </tr>
                                    <tr className="bg-white border-b  ">
                                        <td className="px-6 py-4  text-sm font-bold text-gray-400 text-apercu">
                                            {translate(COMMON_CONSTANTS.interestRate)}
                                        </td>
                                        <td className="px-6 py-4 flex justify-end text-sm font-medium  text-apercu-medium">
                                            --
                                        </td>
                                    </tr>
                                    <tr className="bg-white border-b  ">
                                        <td className="px-6 py-4  text-sm font-bold text-gray-400 text-apercu">
                                            {translate(AFTER_REVIEW.maturityDate)}

                                        </td>
                                        <td className="px-6 py-4 flex justify-end text-sm font-medium  text-apercu-medium">
                                            --
                                        </td>
                                    </tr>
                                    <tr className="bg-white  ">
                                        <td className="px-6 py-4  text-sm font-bold text-gray-400 text-apercu">
                                            {translate(COMMON_CONSTANTS.maturityAmount)}
                                        </td>
                                        <td className="px-6 py-4 flex justify-end text-sm font-medium  text-apercu-medium">
                                            --
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                        <div className="w-1/2 text-black ">
                            <div className="text-apercu-regular font-bold p-5 h-72 mx-5 mt-5 bg-slate-100 ">
                                <tr>
                                    <td className="font-medium">{translate(MAKE_PAYMENT_FDS.prematureWithdrawalAmount)}</td>
                                </tr>
                                <tr>
                                    <td className="text-fd-primary pb-4 pt-2">--</td>
                                </tr>
                                <tr>
                                    <td className="font-medium">{translate(MAKE_PAYMENT_FDS.prematureWithdrawalCharges)}</td>
                                </tr>
                                <tr>
                                    <td className="text-fd-primary pb-4 pt-2">--</td>
                                </tr>
                                <tr>
                                    <td className="pt-2 font-medium">{translate(MAKE_PAYMENT_FDS.finalPrematureWithdrawalCharges)}</td>
                                </tr>
                                <tr>
                                    <td className="text-fd-primary text-lg ">--</td>
                                </tr>
                            </div>
                            <div className="flex flex-row-reverse mr-5 mt-8 ml-10 mb-5">

                                <button type="button"
                                    className="ml-10 text-sm button-transition hover:bg-hover-primary text-apercu button-active btn-gradient xl:w-36 lg:w-28 md:w-20 sm:w-20 xs:w-12"
                                    onClick={() => setBooked(true)} >{translate(MAKE_PAYMENT_FDS.yesGoAhead)}</button>
                                <FdBooked booked={booked} onClose={() => setBooked(false)} />
                                <button
                                    type="button"
                                    onClick={props.onClose}
                                    className="ml-3
                                      button-passive text-sm text-apercu font-semibold xl:w-32 lg:w-28 md:w-20 sm:w-20 xs:w-12">

                                    {translate(COMMON_CONSTANTS.cancel)}
                                </button>

                            </div>

                        </div>

                    </div>
                </div>

            </div>

        </div>
    )
}

export default WithdrawFd;

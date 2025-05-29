import { Menu, Transition } from "@headlessui/react";
import { ChevronDownIcon } from "@heroicons/react/solid";
import { Fragment } from "react";

import CorporatePlan from "../corporate_plan/corporate_plan";
import NavBarMain from "../navbar/NavBarMain";
import { MAKE_PAYMENT_FDS, PARENT_DETAILS_PAYMENT } from "../../constants";
import { useTranslation } from "react-i18next";

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}
function BankingDetail() {
  const { t: translate } = useTranslation();
  return (
    <div>
      <NavBarMain />

      <CorporatePlan />

      <div className="max-w-full xs:text-xs sm:text-sm md:text-md lg:text-lg xl:text-xl  border-b border-background-primary0 bg-slate-200 flex justify-center items-center ">
        <div className="justify-center items-center">
          <h1 className="my-3 h3-style flex justify-center md:text-md lg:text-lg xl:text-xl">
            {translate(PARENT_DETAILS_PAYMENT.bankingDetails)}
          </h1>
          <h1 className=" my-3 info-style text-black flex justify-center xs:text-xs sm:text-xs md:text-sm   ">
            {translate(PARENT_DETAILS_PAYMENT.provideBankingDetailsForPayment)}
          </h1>
          <div className="justify-center items-center">
            <div className=" px-5 w-auto mb-5 rounded overflow-hidden shadow-lg bg-white text-center">
              <div className="flex flex-row text-xs mb-3 mt-3">
                <div className="h3-style md:text-md lg:text-lg xl:text-xl">
                  <h1>{translate(PARENT_DETAILS_PAYMENT.totalPayment)}</h1>
                </div>
                <div className="ml-40 h3-style text-fd-primary md:text-md lg:text-lg xl:text-xl">
                  <h1>Rs. 2,80,510</h1>
                </div>
              </div>
              <div className="flex mb-3">
                <h1 className="info-style">{translate(PARENT_DETAILS_PAYMENT.paymentMethod)}</h1>
              </div>
              <div className="flex mb-3">
                <Menu as="div" className="relative inline-block text-left">
                  <div>
                    <Menu.Button className="inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-2 py-1 bg-white text-md font-light text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 focus:ring-fd-primary sm:text-5">
                      {translate(PARENT_DETAILS_PAYMENT.selectBank)}
                      <ChevronDownIcon
                        className="-mr-1 ml-2 h-5 w-5"
                        aria-hidden="true"
                      />
                    </Menu.Button>
                  </div>

                  <Transition
                    as={Fragment}
                    enter="transition ease-out duration-100"
                    enterFrom="transform opacity-0 scale-95"
                    enterTo="transform opacity-100 scale-100"
                    leave="transition ease-in duration-75"
                    leaveFrom="transform opacity-100 scale-100"
                    leaveTo="transform opacity-0 scale-95"
                  >
                    <Menu.Items className="origin-top-right absolute right-0 mt-2 w-28 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 focus:outline-none">
                      <div className="py-1">
                        <Menu.Item>
                          {({ active }) => (
                            <a
                              href="#"
                              className={classNames(
                                active
                                  ? "bg-gray-100 text-black-900"
                                  : "text-gray-700",
                                "block px-4 py-2 text-sm"
                              )}
                            >
                              {translate(PARENT_DETAILS_PAYMENT.netBanking)}
                            </a>
                          )}
                        </Menu.Item>

                        <Menu.Item>
                          {({ active }) => (
                            <button
                              type="submit"
                              className={classNames(
                                active
                                  ? "bg-gray-100 text-gray-900"
                                  : "text-gray-700",
                                "block w-full text-left px-4 py-2 text-sm"
                              )}
                            >
                              {translate(PARENT_DETAILS_PAYMENT.upi)}
                            </button>
                          )}
                        </Menu.Item>
                      </div>
                    </Menu.Items>
                  </Transition>
                </Menu>
              </div>

              <div className="flex">
                <input
                  type="text"
                  className="mb-5 w-80 py-2 px-3 input-field-style"
                  id="username"
                  placeholder="Account Number"
                />
              </div>

              <div className="flex mb-3">
                <input
                  type="text"
                  className="mb-5 w-80 py-2 px-3 input-field-style"
                  id="username"
                  placeholder="IFSC Code"
                />
              </div>

              <div className="mb-5">
                <p className="info-style xs:text-xs sm:text-sm md:text-md flex justify-center">
                  Lorem Ipsum is simply dummy text{" "}
                </p>
              </div>
            </div>

            <div className="flex justify-end ">
              <button className=" button-active btn-gradient button-transition hover:bg-hover-primary text-medium text-xl lg:text-2xl w-fit   text-medium text-xl lg:text-2xl w-fit  hover:button-shadow">
                {translate(MAKE_PAYMENT_FDS.makePayment)}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
export default BankingDetail;

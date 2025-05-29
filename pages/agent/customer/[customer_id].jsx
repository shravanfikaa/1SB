import { useEffect, useState } from "react";
import styles from "../../../styles/fd.module.css";
import profile from "../../../styles/profile.module.css";
import appConfig from "../../../app.config";
import { GetApiHandler } from "../../api/apihandler";
import { dateFormat } from "../../../lib/util";
import CustomerSidebar from "./customer_sidebar";
import CustomerBreadCrumb from "./customer_breadcrumb";
import { useRouter } from "next/router";
import AgentNavBar from "../navbar/agent_navbar";
import NomineeDetails from "../../my_profile/nomineeDetails";
import BankDetails from "../../my_profile/bankDetails";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { FaUserAlt } from "react-icons/fa";
import { AGENT, FD_RENEWAL } from "../../../constants";
import { useTranslation } from "react-i18next";
import Image from "next/image";
import avatar from "../../product_logos/user.jpg";
function CustomerProfile() {
  const { t: translate } = useTranslation();
  const [customerInfo, setCustomerInfo] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { customer_id } = router.query;

  useEffect(() => {
    setIsLoading(true);
    
    const customerInfoURL =
      appConfig?.deploy?.baseUrl +
      appConfig?.deploy?.customerDetails.replace(
        "<customer_id>",
        customer_id
      );

    GetApiHandler(customerInfoURL, "Get")
      .then((response) => {
        const { data } = response?.data;
        data && setCustomerInfo(data);
      })
      .catch((err) => {
        console.log("Error:", err);
      })
      .finally(() => setIsLoading(false));
  }, []);

  const { bank_account_info, nominee_info, user_info } = customerInfo;

  return (
    <div>
      <AgentNavBar />
      <CustomerBreadCrumb />
      <div className="page-background view-container fd_container_sm">
        <div className="flex gap-5 w-full">
          <div
            className={`w-[35%] sidebarContainer  h-100 ${styles.filterContainer} ${styles.cardContainer}`}
          >
            <CustomerSidebar id={"1"} customer_id={customer_id} />
          </div>
          <div className={`bg-white w-full p-6 rounded-xl ${styles.cardContainer}`}>
            <div className="fd_details_container">
              <div className="flex flex-row">
                {user_info?.profile_image ? (
                  <img
                    src={`data:image/png;base64, ${user_info.profile_image}`}
                    className=" border-2 border-blue rounded-full object-contain" style={{width:'50px'}}
                  />
                ) : (
                  <Image
                    src={avatar}
                    className="border-2 border-blue rounded-full object-contain" style={{width:'50px'}}
                  />
                )}
                <div className="flex flex-col self-center ml-5">
                  <div className="text-regular text-2xl text-light-gray">
                  {translate(FD_RENEWAL.nameAsPerPan)}
                  </div>
                  <div className="text-medium text-black text-3xl">
                 { user_info?.first_name && user_info?.last_name && user_info?.middle_name ? (
                      user_info.first_name + " " +user_info.middle_name + " " + user_info.last_name
                    ) :user_info?.first_name && user_info?.last_name ? user_info.first_name + " "  + user_info.last_name : (
                      <Skeleton width={200} />
                    )}
                  </div>
                </div>
              </div>
            </div>
            {isLoading ? (
              <div className="flex justify-center text-3xl text-gray-500">
                {translate(AGENT.loading)}..
                <div
                  className="spinner-border animate-spin inline-block w-8 h-8 border-4 rounded-full"
                  role="status"
                ></div>
              </div>
            ) : (
              <>
                <div className="my-6">
                  <div className={`flex flex-row my-3 gap-3`}>
                    <div className="w-fit whitespace-nowrap text-4xl text-light-gray text-regular">
                      {translate(AGENT.personalDetails)}
                    </div>
                    <div className="flex-grow border-t lack-400 w-full flex items-center self-center"></div>
                  </div>
                  {user_info ? (
                    <div
                      className={`my-6 text-regular text-2xl ${profile.details_container}`}
                    >
                      <label
                        className={`flex gap-4 input-field w-full ${profile.status_container}`}
                        readOnly
                      >
                        <input
                          className={`${profile.user_name_container} text-black p-2 border rounded w-full`}
                          id="username"
                          placeholder={`${translate(AGENT.firstName)}*`}
                          value={user_info.first_name}
                          readOnly
                        />
                        <input
                          className={`${profile.user_name_container} text-black p-2 border rounded w-full`}
                          id="username"
                          placeholder={`/${translate(AGENT.middleName)}`}
                          value={user_info.middle_name}
                          readOnly
                        />
                        <input
                          className={`${profile.user_name_container} text-black p-2 border rounded w-full`}
                          id="username"
                          placeholder={`/ ${translate(AGENT.lastName)} *`}
                          value={user_info.last_name}
                          readOnly
                        />
                      </label>
                      <div
                        className={`flex my-3 gap-3 w-full ${profile.status_container}`}
                      >
                        <input
                          className="w-full py-2 input-field text-2xl border text-black border-solid border-gray-300 text-black p-2 border rounded w-full"
                          placeholder={translate(AGENT.mobileNumber) + "*"}
                          value={user_info.mobile_number}
                          readOnly
                        />
                        <input
                          className="w-full py-2 input-field text-2xl border text-black border-solid border-gray-300 text-black p-2 border rounded w-full"
                          placeholder={translate(AGENT.userEmail) + "*"}
                          value={user_info.email_id}
                          readOnly
                        />
                         <input
                          className="w-full py-2 input-field text-2xl border text-black border-solid border-gray-300 text-black p-2 border rounded w-full"
                          placeholder={translate(AGENT.panNumber)+"*"}
                          value={user_info.pan_number}
                          readOnly
                        />
                        <input
                          className="w-full py-2 input-field text-2xl border text-black border-solid border-gray-300 text-black p-2 border rounded w-full"
                          placeholder={translate(AGENT.dateOfBirth) +"*"}
                          value={dateFormat(user_info.date_of_birth)}
                          readOnly
                        />
                      </div>
                      <div
                        className={`flex my-3 gap-3 w-full ${profile.status_container}`}
                      >
                       
                      </div>
                    </div>
                  ) : (
                    <div className="flex justify-center text-3xl text-gray-500">
                      {translate(AGENT.noRecordsFound)}
                    </div>
                  )}
                </div>
                <div className="my-6 flex flex-col gap-2">
                  <div className={`flex flex-row my-3 gap-3`}>
                    <div className="w-fit whitespace-nowrap text-4xl text-light-gray text-regular">
                      {translate(AGENT.nomineeDetails)}
                    </div>
                    <div className="flex-grow border-t lack-400 w-full flex items-center self-center"></div>
                  </div>
                  {nominee_info?.length ? (
                    <NomineeDetails nomineeData={nominee_info} />
                  ) : (
                    <div className="flex justify-center text-3xl text-gray-500">
                      {translate(AGENT.noRecordsFound)}
                    </div>
                  )}
                </div>
                <div className="my-6">
                  <div className={`flex flex-row my-3 gap-3`}>
                    <div className="w-fit whitespace-nowrap text-4xl text-light-gray text-regular">
                      {translate(AGENT.bankDetails)}
                    </div>
                    <div className="flex-grow border-t lack-400 w-full flex items-center self-center"></div>
                  </div>
                  {bank_account_info?.length ? (
                    <BankDetails bankDetails={bank_account_info} />
                  ) : (
                    <div className="flex justify-center text-3xl text-gray-500">
                      {translate(AGENT.noRecordsFound)}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default CustomerProfile;

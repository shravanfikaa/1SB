import { useEffect, useState } from "react";
import {
  PostApiHandler,
  GetApiHandler,
  PatchApiHandler,
  DeleteApiHandler,
} from "../api/apihandler";
import appConfig from "../../app.config";
import Navbar from "../navbar/navbar_view";
import Setting from "../setting/setting-view";
import Image from "next/image";
import { dateFormat, getUserRole, handleEventLogger,isMobile } from "../../lib/util";
import styles from "../../styles/fd.module.css";
import FDSidebar from "../my_fds/fdSidebar";
import profile from "../../styles/profile.module.css";
import DeletePopup from "../common/deletePopup";
import { v4 as uuidv4 } from "uuid";
import AddEditNominee from "./addEditNominee";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import BankDetails from "./bankDetails";
import NomineeDetails from "./nomineeDetails";
import { FaUserAlt } from "react-icons/fa";
import { useTranslation } from "react-i18next"; 
import { AGENT, FD_RENEWAL, MY_PROFILE } from "../../constants";

function MyProfile() {
  // const [bankDetails, setBankDetails] = useState([]);
  const { t: translate } = useTranslation();
  const [nomineeData, setNomineeData] = useState([]);
  const [userInfo, setUserInfo] = useState({});
  const [userProfileImage, setUserProfileImage] = useState("");
  const [showDeletePopup, setShowDeletePopup] = useState({
    show: false,
    id: "",
    shouldDelete: false,
  });
  const [showAddEditNomineeCard, setShowAddEditNomineeCard] = useState({
    show: false,
    type: "",
    data: [],
  });
  const [isLoggedIn, setIsLoggedIn] = useState();
  const role = getUserRole();

  const baseURL = appConfig?.deploy?.baseUrl;
  const { pan_number, id: user_id } = userInfo;

  const getModalStatus = (status) => {
    setShowDeletePopup(status);
  };

  const getAddEditNomineeData = (status, type, nomineeCardData) => {
    setShowAddEditNomineeCard({
      show: status,
      type: "",
      data: [],
    });
    if (Object.keys(nomineeCardData).length) {
      type === "Edit" && editNomineeDetails(nomineeCardData);
      type === "Add" && addNomineeDetails(nomineeCardData);
    }
  };

  const getUserInfo = () => {
    const getUserUrl = baseURL + appConfig?.deploy?.getUserDetails;
    GetApiHandler(getUserUrl, "GET")
      .then((response) => {
        setUserInfo(response.data.data);
      })
      .catch((error) => console.error("-User Information-:", error));
  };

  const getNomineeDetails = () => {
    const selectedUserId = sessionStorage.getItem("selectedUserId")
    const userId = sessionStorage.getItem("userId")
    const baseUrl = appConfig?.deploy?.baseUrl;
    const getNominee = appConfig?.deploy?.getNominee;
    const userIdSegment = selectedUserId || userId || "";
    const nomineeURL = `${baseUrl}${getNominee}${userIdSegment}`;   
     GetApiHandler(nomineeURL, "GET")
      .then((response) => {
        setNomineeData(response.data.data);
      })
      .catch((err) => {
        console.error("-Nominee Information-:", err);
      });
  };

  const getBankDetails = () => {
    const bankDetailsURL = baseURL + appConfig?.deploy?.getBankDetail;
    GetApiHandler(bankDetailsURL, "GET")
      .then((response) => {
        setBankDetails(response.data.data);
      })
      .catch((err) => {
        console.error("-Bank Information-:", err);
      });
  };

  const editNomineeDetails = (data) => {
    const editNomineeURL =
      appConfig?.deploy?.baseUrl + appConfig?.deploy?.updateNominee;
    PatchApiHandler(editNomineeURL, "Patch", data)
      .then((response) => {
        getNomineeDetails();
      })
      .catch((err) => {
        console.error("Profile page edit nominee:", err);
      });
  };

  const addNomineeDetails = (data) => {
    const addNominee =
      appConfig?.deploy?.baseUrl + appConfig?.deploy?.addNominee;
    PostApiHandler(addNominee, "Post", data)
      .then((response) => {
        getNomineeDetails();
      })
      .catch((err) => {
        console.error("Profile page add nominee:", err);
      });
  };

  const handleAddNomineeBtnClick = () => {
    const initialValues = [
      {
        id: uuidv4(),
        user_id: user_id ? user_id : "",
        nominee_title: "",
        nominee_first_name: "",
        nominee_middle_name: "",
        nominee_last_name: "",
        nominee_relation: "",
        nominee_date_of_birth: "",
        nominee_percentage: "",
        nominee_pan_number: "",
        nominee_guardian_first_name: "",
        nominee_guardian_middle_name: "",
        nominee_guardian_last_name: "",
        nominee_guardian_pan_number: "",
        nominee_guardian_date_of_birth: "",
        nominee_address_line1: "",
        nominee_address_line2: "",
        nominee_pincode: "",
        nominee_city: "",
        nominee_state: "",
        nominee_country: "",
        sameAddress: false,
        is_nominee_minor: false,
      },
    ];
    setShowAddEditNomineeCard({ show: true, type: "Add", data: initialValues });
  };

  const getDeleteBtnClickStatus = (status) => {
    setShowDeletePopup(status);
  };

  const handleDeleteClick = (data) => {
    const deleteNomineeURL =
      appConfig?.deploy?.baseUrl +
      appConfig?.deploy?.deleteNominee +
      "?nominee_id=" +
      data.id;

    setShowDeletePopup({ show: false, id: "", shouldDelete: false });
    DeleteApiHandler(deleteNomineeURL, "Delete").then((response) => {
      getNomineeDetails();
    });
  };

  const handleEditBtn = (data) => {
    data.user_id = user_id ? user_id : "";
    setShowAddEditNomineeCard({ show: true, type: "Edit", data: [data] });
  };

  const getLoginStatus = (status) => {
    setIsLoggedIn(status);
  };

  useEffect(() => {
    const { shouldDelete, id } = showDeletePopup;
    if (shouldDelete) {
      handleDeleteClick(id);
    }
  }, [showDeletePopup]);

  useEffect(() => {
    if (isLoggedIn) {
      getUserInfo();
      // getBankDetails();
      getNomineeDetails();
    }
  }, [isLoggedIn]);

  useEffect(() => {
    sessionStorage.getItem("imageData") &&
      setUserProfileImage(
        "data:image/png;base64," + sessionStorage.getItem("imageData")
      );
    handleEventLogger("dashboard", "buttonClick", "Invest_Click", {
      action: "My_Profile",
      Platform:isMobile()
    });
    getUserInfo();
    // getBankDetails();
    getNomineeDetails();
  }, []);

  return (
    <div>
      <Navbar getLoginStatus={getLoginStatus} />
      <Setting />
      <div className="page-background  view-container  fd_container_sm">
        <div className="flex gap-10">
          <div
            className={`w-1/5 sticky ${styles.filterContainer} ${styles.cardContainer}`}
          >
            <FDSidebar id={"1"} />
          </div>
          <div className={`bg-white w-full p-6 rounded-xl rounded-xl ${styles.cardContainer}`}>
            <div className="fd_details_container">
              <div className="flex flex-row items-center">
                {userProfileImage ? (
                  <img
                    src={userProfileImage}
                    className="h-[50px]	w-[50px] border-2 border-blue rounded-full object-cover p-1"
                  />
                ) : (
                   <FaUserAlt className="text-fd-primary" size={"50px"} />
                )}
                <div className="flex flex-col self-center ml-5">
                  <div className="text-regular text-2xl text-subcontent">
                  {translate(FD_RENEWAL.nameAsPerPan)}
                  </div>
                  <div className="text-medium text-black text-3xl">
                    {userInfo.first_name || userInfo.last_name ? (
                      userInfo.first_name + " " + userInfo.last_name
                    ) : (
                      <Skeleton width={200} />
                    )}
                  </div>
                </div>
              </div>
            </div>
            <div className="my-6">
              <div className={`flex flex-row my-3 gap-3`}>
                <div className="w-fit whitespace-nowrap text-4xl text-light-gray text-regular">
                  {translate(AGENT.personalDetails)}
                </div>
                <div className="flex-grow border-t lack-400 w-full flex items-center self-center"></div>
              </div>
              <div
                className={`my-6 text-regular text-2xl ${profile.details_container}`}
              >
                <label
                  className={`flex  input-field w-full gap-3 ${profile.status_container}`}
                >
                  <input
                    className={`${profile.user_name_container} bg-dark-gray text-black cursor-not-allowed p-2 capitalize`}
                    id="username"
                    placeholder={`${translate(AGENT.firstName)}*`}
                    value={userInfo?.first_name?.toLowerCase()}
                    readOnly
                  />
                  <input
                    className={`${profile.user_name_container} bg-dark-gray text-black cursor-not-allowed p-2 capitalize`}
                    id="username"
                    placeholder={`/${translate(AGENT.middleName)}`}
                    value={userInfo?.middle_name?.toLowerCase()}
                    readOnly
                  />
                  <input
                    className={`${profile.user_name_container} bg-dark-gray text-black cursor-not-allowed p-2 capitalize`}
                    id="username"
                    placeholder={`/ ${translate(AGENT.lastName)} *`}
                    value={userInfo?.last_name?.toLowerCase()}
                    readOnly
                  />
                </label>
                <div
                  className={`flex my-3 gap-3 w-full ${profile.status_container}`}
                >
                  <input
                    className="w-full py-2 input-field text-2xl border border-solid border-gray-300 text-black bg-dark-gray text-black cursor-not-allowed"
                    placeholder={translate(AGENT.mobileNumber) + "*"}
                    value={userInfo.mobile_number}
                    readOnly
                  />
                  <input
                    className="w-full py-2 input-field text-2xl border border-solid border-gray-300 text-black bg-dark-gray text-black cursor-not-allowed"
                    placeholder={translate(AGENT.userEmail) + "*"}
                    value={userInfo.email_id}
                    readOnly
                  />
                </div>
                <div
                  className={`flex my-3 gap-3 w-full ${profile.status_container}`}
                >
                  <input
                    className="w-full py-2 input-field text-2xl border border-solid border-gray-300 text-black bg-dark-gray text-black cursor-not-allowed"
                    placeholder={translate(AGENT.panNumber)+ "*"}
                    value={userInfo.pan_number}
                    readOnly
                  />
                  <input
                    className="w-full py-2 input-field text-2xl border border-solid border-gray-300 text-black bg-dark-gray text-black cursor-not-allowed"
                    placeholder={translate(AGENT.dateOfBirth) +"*"}
                    value={dateFormat(userInfo.date_of_birth)}
                    readOnly
                  />
                </div>
              </div>
            </div>
            {
              role?.toLowerCase() !== "familyhead" ?
                <div className="my-6 flex flex-col gap-2">
                  <div className={`flex flex-row my-3 gap-3`}>
                    <div className="w-fit whitespace-nowrap text-4xl text-light-gray text-regular">
                      {translate(AGENT.nomineeDetails)}
                    </div>
                    <div className="flex-grow border-t lack-400 w-full flex items-center self-center"></div>
                  </div>
                  <button
                    className="button-passive border-fd-primary text-fd-primary w-fit text-medium text-2xl flex justify-center items-center gap-2 p-2"
                    onClick={handleAddNomineeBtnClick}
                  >
                    {translate(MY_PROFILE.addMoreNominee)}
                  </button>
                  {showAddEditNomineeCard?.data.length &&
                    showAddEditNomineeCard.show
                    ? showAddEditNomineeCard.data.map((nominee) => {
                      return (
                        <AddEditNominee
                          userPanNumber={pan_number ? pan_number : ""}
                          type={showAddEditNomineeCard.type}
                          getAddEditNomineeData={getAddEditNomineeData}
                          nominee={nominee}
                        />
                      );
                    })
                    : null}
                  {nomineeData.length ? (
                    <NomineeDetails
                      nomineeData={nomineeData}
                      handleEditBtn={handleEditBtn}
                      getDeleteBtnClickStatus={getDeleteBtnClickStatus}
                    />
                  ) : (
                    <div className="flex justify-center text-3xl text-gray-500">
                      {translate(AGENT.noRecordsFound)}
                    </div>
                  )}
                </div>
                : null}
            {/* Note: [FD-1520] Commenting the code right now there might be future scope*/}
            {/* <div className="my-6">
              <div className={`flex flex-row my-3 gap-3`}>
                <div className="w-fit whitespace-nowrap text-4xl text-light-gray text-regular">
                  {translate(AGENT.bankDetails)}
                </div>
                <div className="flex-grow border-t lack-400 w-full flex items-center self-center"></div>
              </div>
              {bankDetails.length ? (
                <BankDetails bankDetails={bankDetails} />
              ) : (
                <div className="flex justify-center text-3xl text-gray-500">
                  {translate(AGENT.noRecordsFound)}
                </div>
              )}
            </div> */}
          </div>
          {showDeletePopup.show ? (
            <DeletePopup
              getModalStatus={getModalStatus}
              showDeletePopup={showDeletePopup}
              message={"Are you sure you wanted to delete selected nominee."}
            />
          ) : null}
        </div>
      </div>
    </div>
  );
}

export default MyProfile;

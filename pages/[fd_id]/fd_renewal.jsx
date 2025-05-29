import { useRouter } from "next/router";
import { FaRegEdit } from "react-icons/fa";
import { useEffect, useState } from "react";
import setDataToLocalStorage from "../../lib/set_data_to_localstorage";
import FDRenewAddEditNominee from "../fd_renewal/renew_edit_nominee";
import RenewEditInvestment from "../fd_renewal/renew_edit_investment_details";
import { displayINRAmount } from "../../lib/util";
import appConfig from "../../app.config";
import { GetApiHandler, PostApiHandler } from "../api/apihandler";
import Loader from "../../svg/Loader";
import ErrorModal from "../common/errorPopup";
import { COMMON_CONSTANTS, MARITAL_STATUS, RESIDENTIAL_STATUS,FD_RENEWAL, REDIRECTION_MSG} from "../../constants";
import Link from "next/link";
import { useTranslation } from "react-i18next";

function FDRenewal() {
  const router = useRouter();
  const { maturityInstruction } = router.query;
  const [displayNominee, setDisplayNominee] = useState(false);
  const [displayInvestment, setDisplayInvestment] = useState(false);
  const [userInfo, setUserInfo] = useState({});
  const [fDInfo, setFDInfo] = useState({});
  const [maturityInstructionValue, setMaturityInstructionValue] =
    useState(maturityInstruction);
  const [totalTenure, settotalTenure] = useState(0);
  const [investData, setInvestData] = useState({});
  const [editNomineeData, seteditNomineeData] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const toggleErrorModal = () => setShowErrorModal((state) => !state);
  const [apiErrorMessage, setApiErrorMessage] = useState("");
  const [messageType, setmessageType] = useState("");

  let selectedManufactureId = "";

  if (typeof window !== "undefined") {
    selectedManufactureId = sessionStorage.getItem("selectedManufactureId");
  }
  const { t: translate } = useTranslation();
  const getUserInfo = () => {
    const getUserUrl =
      appConfig?.deploy?.baseUrl + appConfig?.deploy?.getUserDetails;
    GetApiHandler(getUserUrl, "GET")
      .then((response) => {
        setUserInfo(response.data.data);
      })
      .catch((error) => console.error("-User Information-:", error));
  };

  const getFDDetails = () => {
    const getFDInfoUrl =
      appConfig?.deploy?.baseUrl +
      appConfig?.deploy?.getFDDetails +
      "/" +
      router.query.fd_id;
    GetApiHandler(getFDInfoUrl, "GET")
      .then((response) => {
        const { data } = response;
        if (data?.errors.length) {
          console.log("error", data?.errors);
        } else if (data?.data) {
          setFDInfo(response.data.data);
        }
      })
      .catch((error) => console.error("-FD Details error-:", error));
  };

  function renewalFD() {
    setIsLoading(true);
    const userId = sessionStorage.getItem("userId");
    const renewFDUrl =
      appConfig?.deploy?.baseUrl + appConfig?.deploy?.renewFD;
    const requestBody = {
      fd_id: router.query.fd_id,
      customer_id: userId,
      nominee_details: Object.keys(editNomineeData).length
        ? editNomineeData
        : fDInfo.fd_nominee_mapping,
      investment_details: {
        maturity_instructions: Object.keys(investData).length
          ? investData.maturityInstruction
          : maturityInstructionValue,
        tenure: Object.keys(investData).length
          ? investData.totalTenure
          : fDInfo.tenor,
        form15G_15H:
          investData && investData.form15g ? investData.form15g : false,
      },
    };

    PostApiHandler(renewFDUrl, "POST", requestBody).then((response) => {
      const { data } = response;
      if (data?.errors.length) {
        setIsLoading(false);
        setApiErrorMessage(translate(REDIRECTION_MSG.FDRenewalFailed));
        setmessageType("alert");
        setShowErrorModal(true);
      } else {
        setIsLoading(false);
        setApiErrorMessage(translate(REDIRECTION_MSG.FDRenewalFailed));
        setmessageType("Success");
        setShowErrorModal(true);
      }
    });
  }

  useEffect(() => {
    getUserInfo();
    getFDDetails();
  }, []);
  const { pan_number, id: user_id } = userInfo;

  useEffect(() => {
    const data = {
      renewOption: maturityInstructionValue,
    };
    setDataToLocalStorage("renewOption", maturityInstructionValue, data);
  }, [router.query]);
  const closeNomineeModal = (displayNomineeModal) => {
    setDisplayNominee(displayNomineeModal);
  };
  const closeInvestModal = (displayInvestModal) => {
    setDisplayInvestment(displayInvestModal);
  };

  const getDataFromInvestAndNominee = (component, data) => {
    if (component === "investment_details") {
      setMaturityInstructionValue(data.maturityInstruction);
      setInvestData(data);
    } else {
      seteditNomineeData(data);
    }
  };

  useEffect(() => {
    const jsonData = {
      investment_details: investData,
    };
    setDataToLocalStorage("invest", investData, jsonData);
    settotalTenure(investData.totalTenure);
  }, [investData]);

  useEffect(() => {
    const jsonData = {
      nominee_details: editNomineeData,
    };
    setDataToLocalStorage("nominee", editNomineeData, jsonData);
  }, [editNomineeData]);
  const { fd_nominee_mapping } = fDInfo;

  useEffect(() => {
    settotalTenure(fDInfo?.tenor);
    seteditNomineeData(fd_nominee_mapping);
  }, [fDInfo]);

  return (
    <>
      <div className="mb-3 ">
        <div className="block p-6 rounded-lg h-auto bg-slate-100">
          <div className="flex flex-col border-b-2 user_journey_container rounded-xl p-[20px] ">
            <div className={`p-6 bg-white rounded-md shadow-lg z-[1] w-full`}>
              <div className={`flex justify-between mb-3 `}>
                <div className="text-6xl text-medium">{translate(FD_RENEWAL.fdRenewalReview)}</div>
              </div>
              <ErrorModal
                canShow={showErrorModal}
                updateModalState={toggleErrorModal}
                errorMessage={apiErrorMessage}
                messageType={messageType}
              />
              <div className={`w-full `}>
                <div className=" text-font ">
                  <div className=" my-6 text-medium text-2xl">
                    <div className="block rounded-xl h-auto">
                      <div className="flex flex-col border-b-2 user_journey_container rounded-xl p-[20px]   ">
                        <div className={`w-full`}>
                          <div className="flex flex-row gap-3 items-center">
                            <div className="flex text-medium text-6xl border-2 border-black rounded-full h-[90px] w-[90px] justify-center items-center text-black">
                              {fDInfo?.first_name?.substring(0, 1) +
                                fDInfo?.last_name?.substring(0, 1)}
                            </div>
                            <div className="flex flex-col">
                              <div className="flex text-regular text-2xl text-light-gray">
                              {translate(FD_RENEWAL.nameAsPerPan)}
                              </div>
                              <div className="text-medium text-black text-3xl capitalize">
                                {fDInfo?.first_name +
                                  " " +
                                  fDInfo?.middle_name +
                                  " " +
                                  fDInfo?.last_name}
                              </div>
                            </div>
                          </div>
                          <div
                            className={`flex justify-between my-5 text-regular text-2xl text-light-gray`}
                          >
                            <div className="flex flex-col w-full">
                              <div>{translate(FD_RENEWAL.residentStatus)}</div>
                              <div className="text-black capitalize">
                                {translate(RESIDENTIAL_STATUS.residentialStatusIndian)}
                              </div>
                            </div>
                            <div className="flex flex-col w-full">
                              <div>{translate(FD_RENEWAL.maritalStatus)}</div>
                              <div className="text-black capitalize">
                                {MARITAL_STATUS.unmarried}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col border-b-2 user_journey_container rounded-xl p-[20px]  w-3/4">
                        <div className="flex flex-row justify-between mb-3 items-center">
                          <div className="text-medium text-6xl  text-black">
                          {translate(FD_RENEWAL.nomination)}
                          </div>
                          <div
                            className="flex flex-row gap-2 items-center justify-center text-bold text-2xl text-fd-primary hover:cursor-pointer border rounded-md btn-gradient p-2"
                            onClick={() => setDisplayNominee(true)}
                          >
                            <button type="button" class="btn btn-secondary" data-toggle="tooltip" data-placement="top" title="Edit Enewal Details">
                <FaRegEdit fill="#ffff" width={'10px'} />
              </button>
                            {/* {translate(FD_RENEWAL.edit)} */}
                          </div>
                          {displayNominee ? (
                            <FDRenewAddEditNominee
                              userPanNumber={pan_number ? pan_number : ""}
                              type={""}
                              getAddEditNomineeData={editNomineeData}
                              nominee={editNomineeData}
                              closeNomineeModal={closeNomineeModal}
                              getDataFromInvestAndNominee={
                                getDataFromInvestAndNominee
                              }
                            />
                          ) : null}
                          {displayInvestment ? (
                            <RenewEditInvestment
                              closeInvestModal={closeInvestModal}
                              getDataFromInvestAndNominee={
                                getDataFromInvestAndNominee
                              }
                              fdData={{
                                ...fDInfo,
                                maturityInstructionValue,
                                form15g: false,
                                updatedTenure: totalTenure,
                              }}
                            />
                          ) : null}
                        </div>
                        <div className={`w-full`}>
                          <div
                            className={`flex justify-between text-regular text-2xl text-light-gray mb-5 gap-3`}
                          >
                            {editNomineeData && editNomineeData.length > 0
                              ? editNomineeData.map((editedItem, index) => {
                                return (
                                  <div className="flex flex-col w-full capitalize">
                                    <div className="flex flex-row space-x-5">
                                    {translate(FD_RENEWAL.nominee)} {index + 1}{" "}
                                    </div>
                                    <div
                                      className={`flex justify-between text-black`}
                                    >
                                      <div className="flex flex-col">
                                        <div>
                                          {editedItem.nominee_first_name +
                                            " " +
                                            editedItem.nominee_middle_name +
                                            " " +
                                            editedItem.nominee_last_name +
                                            " "}
                                        </div>
                                        <div className="flex flex-row">
                                          <div>
                                            {editedItem.nominee_relation}
                                          </div>{" "}
                                          &nbsp;
                                          <div>
                                            {editedItem.nominee_percentage}%
                                          </div>
                                        </div>
                                      </div>
                                      {editedItem.is_nominee_minor ? (
                                        <div className="flex flex-col">
                                          <div className=" flex text-regular text-2xl text-light-gray break-words">
                                          {translate(FD_RENEWAL.minorGuardianName)}
                                          </div>
                                          <div className="">
                                            {editedItem.nominee_guardian_first_name +
                                              " " +
                                              editedItem.nominee_guardian_middle_name +
                                              " " +
                                              editedItem.nominee_guardian_last_name}
                                          </div>
                                        </div>
                                      ) : null}
                                    </div>
                                  </div>
                                );
                              })
                              : `${translate(FD_RENEWAL.noNomineesAdded)}`}
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col border-b-2 user_journey_container rounded-xl p-[20px]  w-3/4">
                        <div className="flex flex-row justify-between mb-3 items-center capitalize">
                          <div className="text-medium text-black text-3xl">
                          {translate(FD_RENEWAL.investmentDetails)}
                          </div>
                          <div
                            className="flex flex-row gap-2 items-center justify-center text-bold text-2xl text-fd-primary hover:cursor-pointer border rounded-md btn-gradient p-2"
                            onClick={() => setDisplayInvestment(true)}
                          >
                             <button type="button" class="btn btn-secondary" data-toggle="tooltip" data-placement="top" title="Edit Renewal Details">
              <FaRegEdit fill="#ffff" width={'10px'} />
</button>
                          </div>
                        </div>
                        <div>
                          <div
                            className={`flex justify-between text-regular text-2xl text-light-gray`}
                          >
                            <div className={`flex flex-col w-full`}>
                              <div> {translate(FD_RENEWAL.depositAmount)}</div>
                              <div className="text-black">
                                ₹{" "}
                                {fDInfo
                                  ? displayINRAmount(fDInfo.fd_amount)
                                  : 0}
                              </div>
                            </div>
                            <div className={`flex flex-col w-full`}>
                              <div>{translate(COMMON_CONSTANTS.tenure)}</div>
                              <div className="text-black">
                                {totalTenure} {translate(COMMON_CONSTANTS.days)}
                              </div>
                            </div>
                          </div>
                          <div
                            className={`flex justify-between text-regular text-2xl text-light-gray pt-5`}
                          >
                            <div className={`flex flex-col w-full`}>
                              <div>{translate(COMMON_CONSTANTS.interestRate)}</div>
                              <div className="text-black">
                                {fDInfo?.interest_rate}%
                              </div>
                            </div>
                            <div className={`flex flex-col w-full`}>
                              <div>{translate(FD_RENEWAL.maturityInstruction)}</div>
                              <div className="text-black">
                                {maturityInstructionValue}
                              </div>
                            </div>
                          </div>
                          {
                            selectedManufactureId?.toUpperCase() !== "PNBHFC" ?
                              <div className="flex flex-col text-regular text-2xl text-light-gray my-4">
                                <div>{translate(FD_RENEWAL.form15G)}</div>
                                <div className="text-black">
                                  {investData && investData.form15g === true
                                    ? `${translate(FD_RENEWAL.yes)}`
                                    : `${translate(FD_RENEWAL.no)}`}
                                </div>
                              </div> : null
                          }
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-3 justify-center">
                    <Link
                      href={{
                        pathname: "/my_fds/fd",
                      }}
                    >
                      <button className="button-active btn-gradient button-transition hover:bg-hover-primary text-medium text-xl lg:text-2xl w-fit   text-medium text-xl lg:text-2xl w-fit  hover:button-shadow">
                      {translate(COMMON_CONSTANTS.cancel)}
                      </button>
                    </Link>
                    <button
                      className="button-active btn-gradient button-transition hover:bg-hover-primary text-medium text-xl lg:text-2xl w-fit   text-medium text-xl lg:text-2xl w-fit  hover:button-shadow"
                      onClick={renewalFD}
                    >
                      {translate(COMMON_CONSTANTS.continueLabel)} {isLoading ? <Loader /> : null}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default FDRenewal;

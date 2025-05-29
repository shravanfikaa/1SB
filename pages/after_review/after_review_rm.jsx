import { useEffect, useState } from "react";
import { dateFormat, getRedirectionURL, getUserRole } from "../../lib/util";
import Link from "next/link";
import ErrorModal from "../common/errorPopup";
import CorporatePlan from "../corporate_plan/corporate_plan";
import { AFTER_REVIEW, COMMON_CONSTANTS, DETAIL_FD, FD_RENEWAL, fdCkycMessage, fdConfirmationMessage } from "../../constants";
import NavBarMain from "../navbar/NavBarMain";
import appConfig from "../../app.config";
import GreenCheckMark from "../../svg/GreenCheckMark";
import ExclamationCircle from "../../svg/ExclamationCircle";
import { useTranslation } from "react-i18next";

function RmAfterReview() {
  const [showModal, setShowModal] = useState(false);
  const toggleModal = () => setShowModal((state) => !state);
  const [apiErrorMessage, setapiErrorMessage] = useState("");
  const [errorsDetail, seterrorDetail] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [bookFdData, setBookFdData] = useState();
  const [productName, setProductName] = useState("");
  const [manufacturerId, setManufacturerId] = useState(null);

  const fdData = {
    disclaimer:
      `Disclaimer :*Open and maturity date given above is indicative and will be confirmed by ${productName} once they process your fixed deposit investment request`,
  };

  const [bankLogoURL, setBankLogoURL] = useState("");
  const userRole = getUserRole();
  const { t: translate } = useTranslation();

  const parseMaturityDate = (dateString) => {
    const parts = dateString.split("-");
    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const year = parseInt(parts[2], 10);
    return new Date(year, month, day);
  }

  const handleExploreMoreBonds = () => {
    // const redirectionURL = getRedirectionURL(false);
    // console.log("redirectionURL===>", redirectionURL)
    // if (redirectionURL) {
    //   const newRedirectionURL = redirectionURL.replace("/products", "")
    //   console.log("redirectionURL for test-->", newRedirectionURL)
    //   window.location.href = newRedirectionURL;
    // }
    const baseUrl = appConfig.redirectionURL;
    if (baseUrl) {
      const redirectionURL = baseUrl + "/products";
      sessionStorage.clear();
      window.location.href = redirectionURL;
    }
  }

  useEffect(() => {
    if (bookFdData && Object.keys(bookFdData).length) {  
      const baseURL = appConfig.deploy["manufacturerLogoBaseUrl"];
      const bankLogo =
        bookFdData.payload.investmentDetail &&
        bookFdData.payload.investmentDetail.productName
          ? baseURL +
            bookFdData.payload.investmentDetail.manufacturerId.toLowerCase() +
            ".png"
          : "";
      setBankLogoURL(bankLogo);
    }
  }, [bookFdData]);

  useEffect(() => {
    const selectedProductName = sessionStorage.getItem("selectedProductName");
    selectedProductName && setProductName(selectedProductName);
    const bookFdData = sessionStorage.getItem("bookFdData");
    setBookFdData(JSON.parse(bookFdData));
    sessionStorage.removeItem("bookFdData");

      // Check if the window object is available
      if (typeof window !== 'undefined') {
        const id = sessionStorage.getItem("selectedManufactureId");
        setManufacturerId(id);
    }

  }, []);

  return (
    <div className="bg-slate-100">
      <ErrorModal
        canShow={showModal}
        updateModalState={toggleModal}
        errorMessage={apiErrorMessage}
        errorDetails={errorsDetail}
      />
      <NavBarMain />
      <div className="mx-12 my-3">
        <CorporatePlan journeyType="RM" />
      </div>
      <div className="bg-white w-auto text-center mx-12 rounded-md flex flex-col space-y-3 pt-5 text-apercu-medium">
        {isSuccess ? (
          <>
            <span className="text-light-red flex justify-center rounded-full">
              <ExclamationCircle />
            </span>
            <span className="text-light-red text-6xl text-medium">{translate(AFTER_REVIEW.failed)}!</span>
          </>
        ) : (
          <>
            <span className="text-primary-green flex justify-center rounded-full">
              <GreenCheckMark />
            </span>
            <span className="text-primary-green text-6xl text-medium">
            {translate(AFTER_REVIEW.congratulations)} !
            </span>
          </>
        )}
        <span className="text-6xl text-medium text-black">{fdConfirmationMessage(userRole)}</span>
        <span className="text-xl text-regular mx-5 text-black text-fd-primary content-center text-bold">
          {fdCkycMessage(userRole)}
        </span>
        <span className="text-4xl text-light-gray text-regular mt-3">
        {translate(AFTER_REVIEW.fdDetails)} 
        </span>
        <div className="flex justify-center w-full">
          <div className="flex flex-col w-3/5">
            <div>
              <div className="border-solid border-2 rounded w-auto p-2">
                <div className="flex flex-row gap-x-3">
                  <div className="object-contain mt-1">
                    <img
                      src={bankLogoURL}
                      width="64"
                      height="64"
                      objectFit={"contain"}
                    ></img>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-5xl text-medium text-black">
                      {bookFdData?.payload?.investmentDetail?.productName
                        ? bookFdData.payload.investmentDetail.productName
                        : ""}
                    </span>
                    <span className="text-medium text-2xl text-light-gray text-left">
                      {bookFdData?.payload?.investmentDetail?.productType
                        ? bookFdData.payload.investmentDetail.productType
                        : ""}
                    </span>
                  </div>
                </div>
                <div className={`p-3`}>
                  <div className="flex flex-col gap-x-3 text-base">
                    <div className="flex flex-row text-left justify-between text-xl">
                      <div className="w-1/4">
                        <div className="text-light-gray text-medium pb-1">
                        {translate(AFTER_REVIEW.refNumber)}
                        
                        </div>
                        <div className="text-regular text-black">
                          {bookFdData?.journey_id ? bookFdData?.journey_id : ""}
                        </div>
                      </div>
                      <div className="w-1/4">
                        <div className="text-light-gray text-medium pb-1">
                        {translate(AFTER_REVIEW.fdrNumber)}
                        </div>
                        {/* TBD: Need to change the application status based on responses*/}
                        <div className="text-regular text-fd-primary">
                          {bookFdData?.fd_application_status === "inprogress"
                            ? "Under process"
                            : "Under process"}
                        </div>
                      </div>
                      <div className="w-1/4">
                        <div className="text-light-gray text-medium pb-1">
                        {translate(COMMON_CONSTANTS.interestRate)}
                        </div>
                        <div className="text-regular text-black">
                          {bookFdData?.payload?.investmentDetail?.interestRate
                            ? bookFdData.payload.investmentDetail.interestRate +
                              `% ${translate(DETAIL_FD.pa)}`
                            : ""}
                        </div>
                      </div>
                      <div className="w-1/4">
                        <div className="text-light-gray text-medium pb-1">
                        {translate(FD_RENEWAL.depositAmount)}
                        </div>
                        <div className="text-regular text-black">
                          {bookFdData?.payload?.investmentDetail?.depositAmount
                            ? "₹ " +
                            parseInt(bookFdData.payload.investmentDetail.depositAmount).toLocaleString("en-IN")  
                            : ""}
                        </div>
                      </div>
                    </div>
                    <div className="text-left text-xl flex flex-row justify-between">
                      <div className="w-1/4">
                        <div className="text-light-gray text-medium pb-1">
                        {translate(COMMON_CONSTANTS.tenure)}
                        </div>
                        <div className="text-regular text-black">
                        {bookFdData?.payload?.investmentDetail?.displayTenure
                          ? bookFdData.payload.investmentDetail.displayTenure
                          : ""}
                        </div>
                      </div>
                      <div className="w-1/4">
                        <div className="text-light-gray text-medium pb-1">
                        {translate(AFTER_REVIEW.openDate)}*
                        </div>
                        <div className="text-regular text-black">
                          {bookFdData?.created_on
                            ? dateFormat(bookFdData?.created_on)
                            : ""}
                        </div>
                      </div>
                      <div className="w-1/4">
                        <div className="text-light-gray text-medium pb-1">
                        {translate(AFTER_REVIEW.maturityDate)}*
                        </div>
                        <div className="text-regular text-black">
                          {bookFdData?.payload?.investmentDetail?.maturityDate
                            ? dateFormat(
                                parseMaturityDate(bookFdData.payload.investmentDetail.maturityDate)
                              )
                            : ""}
                        </div>
                      </div>
                      <div className="w-1/4">
                        <div className="text-light-gray text-medium pb-1">
                        {translate(AFTER_REVIEW.bookingStatus)}
                        </div>
                        {/* TBD: Need to change the application status based on responses*/}
                        <div className="text-regular text-fd-primary">
                          {bookFdData?.fd_application_status === "inprogress"
                            ? "Under process"
                            : "Under process"}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
           {manufacturerId?.toLowerCase() !== "usfb" ? <div className="gap-3">
              <span className={`text-base text-light-gray text-regular`}>
                {fdData.disclaimer}
              </span>
            </div> : null}
          </div>
        </div>
        <span className="text-medium text-2xl text-light-gray"> </span>
        <div className="pb-10">
          {userRole?.toLowerCase() === "familyhead" ? <>
            <button className="button-passive border-fd-primary text-fd-primary mr-3 w-fit px-4">
              <Link href="/product/product_list">{translate(AFTER_REVIEW.fdBook)}</Link>
            </button>
            <button className="button-passive border-fd-primary text-fd-primary mr-3 w-fit px-4" onClick={handleExploreMoreBonds}>
            {translate(AFTER_REVIEW.exploreMoreFd)} 
            </button>
          </> : <button className="button-passive border-fd-primary text-fd-primary mr-3">
            <Link href="/agent/customers_list">{translate(AFTER_REVIEW.customerList)}</Link>
          </button>}
        </div>
      </div>
    </div>
  );
}
export default RmAfterReview;

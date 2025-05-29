import React from "react";
import CustomerAddressDetails from "../addressDetails/customerAddressDetails";
import BasicDetails from "../basic_details/basic_details";
import ParentsSpouseDetails from "../parents_spouse_details/parents_spouse_details";
import FDConfirmation from "../fd_confirmation/fd_confirmation";
import AddNominee from "../nomination/nomination";
import ReviewAndInvest from "../review_invest/review_invest";
import FDDeclaration from "../fd_declaration/fd_declaration";
import CustomerPersonalDetails from "../kyc_personal_details/customer_personal_details";
import BankDetails from "../bankDetails/bankDetails";
import InvestmentDetails from "../investment_details/investment_details";
import AfterReview from "../after_review/after_review";
import { navigationUserJourney } from '../../lib/sidebar_utils';
import CustomerProfessionalDetails from "../professional_details/ProfessionalDetails";
import ContactDetails from "../contactDetails/ContactDetails";
import { handleEventLogger } from "../../lib/util";
import { useTranslation } from "react-i18next";

function ComponentHolder(props) {
  let tempComponentName = "";

  if (props.journeyType === "DIY") {
    const navigateUserData = (navigationUserJourney(props.parameter, props.sideBarList));
    const returnData = navigateUserData ? navigateUserData : null
    if (returnData.navigationCondition) {
      tempComponentName = props.parameter;
    } else if (returnData.previousComponentData == {}) {
      tempComponentName = returnData.previousComponent;
    }
  } else {
    tempComponentName = props.parameter;
  }
  const { t: translate } = useTranslation();
  const currentScreen = props.sideBarList?.find((val) => val.link === tempComponentName);

  // if (currentScreen?.previousPage) {
  //   const page = currentScreen?.previousPage;
  //   handleEventLogger(page, "buttonClick", page + "_completed", {
  //     action: page + "_completed"
  //   });
  // }

  // Initialize journeyData by checking if props.journeyData exists. 
  // If it does, use the value of props.journeyData[tempComponentName], otherwise use an empty object.
  // journeyData = { props.journeyData ? props.journeyData[tempComponentName] : {} }
  switch (tempComponentName) {
    case "customer_personal_details":
      return (<div className="w-full  bg-white rounded-xl p-[30px]"><CustomerPersonalDetails handle={props.handle} prevPage={currentScreen?.previousPage} nextPage={currentScreen?.nextPage} journeyData={props.journeyData ? props.journeyData[tempComponentName] : {}} /></div>);
    case "basic_details":
      return (<div className="bg-white rounded-xl p-[30px] rounded-xl"><BasicDetails handle={props.handle} prevPage={currentScreen?.previousPage} nextPage={currentScreen?.nextPage} journeyData={props.journeyData ? props.journeyData[tempComponentName] : {}} /></div>);
    // case "contact_details":
    //   return (<div className=""><ContactDetails handle={props.handle} prevPage={currentScreen?.previousPage} nextPage={currentScreen?.nextPage} journeyData={props.journeyData ? props.journeyData[tempComponentName] : {}} /></div>);
    case "customer_address":
      return (<div className=" rounded-xl bg-white rounded-xl p-[30px]"><CustomerAddressDetails handle={props.handle} prevPage={currentScreen?.previousPage} nextPage={currentScreen?.nextPage} journeyData={props.journeyData ? props.journeyData[tempComponentName] : {}} /></div>);
    case "parents_spouse_details":
      return (<div className=" rounded-xl bg-white rounded-xl p-[30px]"><ParentsSpouseDetails handle={props.handle} prevPage={currentScreen?.previousPage} nextPage={currentScreen?.nextPage} journeyData={props.journeyData ? props.journeyData[tempComponentName] : {}} /></div>);
    case "professional_details":
      return (<div className=" rounded-xl bg-white rounded-xl p-[30px]"><CustomerProfessionalDetails handle={props.handle} prevPage={currentScreen?.previousPage} nextPage={currentScreen?.nextPage} journeyData={props.journeyData ? props.journeyData[tempComponentName] : {}} /></div>);
    case "fd_review":
      return (<div className=" rounded-xl bg-white rounded-xl p-[30px]"><FDConfirmation handle={props.handle} prevPage={currentScreen?.previousPage} nextPage={currentScreen?.nextPage} journeyData={props.journeyData ? props.journeyData[tempComponentName] : {}} /></div>);
    case "add_nominee":
      return (<div className=" rounded-xl bg-white rounded-xl p-[30px]"><AddNominee handle={props.handle} prevPage={currentScreen?.previousPage} nextPage={currentScreen?.nextPage} journeyData={props.journeyData ? props.journeyData[tempComponentName] : {}} /></div>);
    case "review_invest":
      return (<div className=" rounded-xl "><ReviewAndInvest handle={props.handle} prevPage={currentScreen?.previousPage} nextPage={currentScreen?.nextPage} journeyData={props.journeyData ? props.journeyData[tempComponentName] : {}} /></div>);
    case "declaration":
      return (<div className=" rounded-xl bg-white rounded-xl p-[30px]"><FDDeclaration handle={props.handle} prevPage={currentScreen?.previousPage} nextPage={currentScreen?.nextPage} journeyData={props.journeyData ? props.journeyData[tempComponentName] : {}} /></div>);
    case "investment_details":
      return (<div className=" rounded-xl bg-white rounded-xl p-[30px]"><InvestmentDetails handle={props.handle} prevPage={currentScreen?.previousPage} nextPage={currentScreen?.nextPage} journeyData={props.journeyData ? props.journeyData[tempComponentName] : {}} /></div>);
    case "bank_details":
      return (<div className=" rounded-xl bg-white rounded-xl p-[30px]"><BankDetails handle={props.handle} prevPage={currentScreen?.previousPage} nextPage={currentScreen?.nextPage} journeyData={props.journeyData ? props.journeyData[tempComponentName] : {}} /></div>);
    case "after_review":
      return (<div className=" rounded-xl "><AfterReview /></div>);
    default:
      return (<div className="pt-40 pl-96 text-3xl text-apercu-medium text-gray-500">No component to render</div>);
  }
}

export default ComponentHolder;

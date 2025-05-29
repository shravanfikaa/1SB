import { dd_mm_yyyy_hh_mm_ss_format } from "../lib/util";
import appConfig from "../app.config";
import { PostApiHandler } from "../pages/api/apihandler";

export const validateCustomer = async (values) => {
  const validateCustomerURL = () => {
    let url = appConfig?.deploy?.baseUrl + appConfig?.deploy?.validateCustomer;
    if (values.journeyId) {
      url = appConfig?.deploy?.baseUrl + appConfig?.deploy?.agentValidateCustomer;
    }
    return url;
  }
  const selectedManufactureId = sessionStorage.getItem("selectedManufactureId");
  const onboardingMode = sessionStorage.getItem("onboardingMode");

  const requestBody = {
    "manufacturerId": selectedManufactureId,
    "customerPan": values?.panNumber ? values.panNumber : "",
    "customerDob": values?.dateOfBirth ? values.dateOfBirth : "",
    "consentType": onboardingMode && onboardingMode?.kycMode?.toLowerCase() === "ckyc" ? "ckyc" : "pan" ,
    "consentAcceptance": "Y",
    "journeyId": values.journeyId,
    "customerId": values.customerId,
    "consentAcceptanceDt": dd_mm_yyyy_hh_mm_ss_format(new Date())
  }

  try {
    const response = await PostApiHandler(validateCustomerURL(), "Post", requestBody);
    return await response;
  } catch (error) {
    return {
      data: {
        errors: [{ errorMessage: "Something went wrong, Please retry!" }]
      }
    }
  }
}
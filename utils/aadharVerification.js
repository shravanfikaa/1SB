import { dd_mm_yyyy_format } from "../lib/util";
import { PostApiHandler } from "../pages/api/apihandler";

export const aadharVerification = async (url, values, applicationNumber) => {
  const selectedManufactureId = sessionStorage.getItem("selectedManufactureId");
  const requestBody = {
    "manufacturerId": selectedManufactureId,
    "customerMobile": values.mobileNumber,
    "callbackUrl": window.location.href ? window.location.href.split("?")[0] : "",
    "fdApplicationNumber": applicationNumber,
    "panNumber": values.panNumber,
    "dateOfBirth": dd_mm_yyyy_format(values.dateOfBirth),
    "journeyId": values.journeyId,
    "customerId": values.customerId
  }

  const response = await PostApiHandler(url, "Post", requestBody)
    .then((res) => {
      return res;
    });
  return await response;
}

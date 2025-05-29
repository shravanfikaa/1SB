import { PostApiHandler } from "../pages/api/apihandler";

export const validateAdharInformation = async (url, referenceId, data, agentInfo) => {
  const selectedManufactureId = sessionStorage.getItem("selectedManufactureId");
  const requestBody = {
    "manufacturerId": selectedManufactureId,
    "returnMessage": "SUCCESS",
    "digilockerCode": data,
    "referenceId": referenceId,
    "journeyId": agentInfo?.journeyId && agentInfo?.journeyId,
    "customerId": agentInfo?.customerId && agentInfo?.customerId
  }

  try {
    const response = await PostApiHandler(url, "Post", requestBody);
    return await response;
  } catch (error) {
    return {
      data: {
        errors: [{ errorMessage: "Something went wrong, Please retry!" }]
      }
    }
  }
}

import appConfig from "../app.config";
import { GetApiHandler } from "../pages/api/apihandler";

export const fetchDynamicFieldDetails = async (productManufacturerId) => {
  const getURL = () => {
    const url = appConfig?.deploy?.baseUrl +
      appConfig?.deploy?.applicationSetup +
      "?distributor_id=" +
      appConfig?.distributorId +
      "&manufacturer_id=" +
      productManufacturerId;
    return url;
  }

  try {
    const response = await GetApiHandler(getURL(), "GET");
    response?.data?.data?.paymentConfigurations ? sessionStorage.setItem("paymentConfigurations", JSON.stringify(response.data.data.paymentConfigurations)):null;
    return await response;
  } catch (error) {
    return {
      data: {
        errors: [{ errorMessage: "Something went wrong, Please retry!" }]
      }
    }
  }
}
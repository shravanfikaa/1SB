import appConfig from "../app.config";
import { GetApiHandler } from "../pages/api/apihandler";

export const fetchProductDetails = async (productManufacturerId, productType, productID) => {
  const getURL = () => {
    const url = appConfig?.deploy?.baseUrl +
      appConfig?.deploy?.getProductDetail +
      "?manufacturer_id=" +
      productManufacturerId +
      "&product_type=" +
      productType +
      "&product_id=" +
      productID;
    return url;
  }

  try {
    const response = await GetApiHandler(getURL(), "GET");
    return await response;
  } catch (error) {
    return {
      data: {
        errors: [{ errorMessage: "Got Error while fetching manufacturer profile details:" }]
      }
    }
  }
}
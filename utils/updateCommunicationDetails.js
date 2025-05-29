import appConfig from "../app.config";
import { PatchApiHandler } from "../pages/api/apihandler";

export const updateCommunicationDetails = async (requestBody) => {
  const url = appConfig?.deploy?.baseUrl + appConfig?.deploy?.updateCommunicationData;
  const method = "Patch";

  const response = await PatchApiHandler(url, method, requestBody)
    .then((res) => {
      return res;
    });

  return await response;
}

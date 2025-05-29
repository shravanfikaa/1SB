import appConfig from "../app.config";
import { GetApiHandler } from "../pages/api/apihandler";

export const applicationSetup = async () => {
  const applicationSetupURL = () => {
    const url = appConfig?.deploy?.baseUrl +
      appConfig?.deploy?.applicationSetup +
      "?distributor_id=" + appConfig?.distributorId;
    return url;
  }

  try {
    const response = await GetApiHandler(applicationSetupURL(), "Get");
    return await response;
  } catch (error) {
    return {
      data: {
        errors: [{ errorMessage: "Something went wrong, Please retry!" }]
      }
    }
  }
}
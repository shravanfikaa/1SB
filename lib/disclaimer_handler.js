import { GetApiHandler } from "../pages/api/apihandler";
import appConfig from "../app.config";
import { setSessionStorageItem } from "./util"

function disclaimerapi(distributor_id) {
  var disclaimerURL = appConfig?.deploy?.baseUrl + appConfig?.deploy?.disclaimer + appConfig.distributorId;;
  var method = "GET";
  GetApiHandler(disclaimerURL, method).then((response) => {
    setSessionStorageItem("disclaimerInfo", JSON.stringify(response.data.data.disclaimer))
    return response.data.data

  })
    .catch((err) => {
      console.log("Error:", err)
      return {}
    });
}

function fetchDisclaimerInfo(distributor_id) {
  if (typeof window !== "undefined") {
    const storedDisclaimer = sessionStorage.getItem("disclaimerInfo");

    if (storedDisclaimer && storedDisclaimer !== "undefined") {
      try {
        return JSON.parse(storedDisclaimer);
      } catch (e) {
        console.error("Failed to parse disclaimerInfo:", e);
      }
    }
    return disclaimerapi(distributor_id);
  }
}

function process_disclaimers(feature_id, fieldsJson) {
  let LatestDisclaimer = ""
  let responseFunction = fetchDisclaimerInfo(appConfig.distributorId)
  let ApiResponse = responseFunction ? responseFunction : ""

  if (ApiResponse) {
    for (let i = 0; i < ApiResponse.length; i++) {
      ApiResponse[i].hasOwnProperty(["featureId"]) && ApiResponse[i]["featureId"] == feature_id ?
        LatestDisclaimer = ApiResponse[i]["disclaimer"] : null
    }
  }
  for (let i = 0; i < Object.keys(fieldsJson).length; i++) {
    LatestDisclaimer = LatestDisclaimer.replace(new RegExp(Object.keys(fieldsJson)[i], 'g'), Object.values(fieldsJson)[i])
  }
  return LatestDisclaimer
}
export { fetchDisclaimerInfo, process_disclaimers };
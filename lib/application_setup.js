import { GetApiHandler } from "../pages/api/apihandler";
import appConfig from "../app.config";

export const featureFlagApi = async () => {
  const url = appConfig?.deploy?.baseUrl + appConfig?.deploy?.applicationSetup + "?distributor_id=" + appConfig.distributorId;
  const localStorageData = JSON.parse(sessionStorage.getItem("featureFlag"));
  const featureFlags = localStorageData ? localStorageData : {};
  // const isRMJourney = (window.location.pathname.includes("/user/login") || window.location.search.includes("agentId")) ? true : false;

  if (!Object.keys(featureFlags).length) {
    const applicationSetupFlags = await GetApiHandler(url, "GET")
      .then((response) => {
        if (response.data?.data) {
          const { featureFlagDetails, properties } = response.data?.data;
          if (featureFlagDetails) {
            const { SignInViaPAN, bankCancelledCheque } = featureFlagDetails;
            const featureFlag = {
              signInViaPAN: SignInViaPAN.isEnabled,
              bankCancelledCheque: bankCancelledCheque.isEnabled
            };
            // if (isRMJourney) {
            
            const { AddNewCustomer, AddNewProduct, AgentFdBook, AgentFdList, AgentCustomerList, AgentFdProduct, CustomerAgentMapping, UserManagement,AgentCustomerEdit} = featureFlagDetails;
            featureFlag.AddNewCustomer = { enabledFor: AddNewCustomer?.config?.enabledFor, isEnabled: AddNewCustomer?.isEnabled };
            featureFlag.AddNewProduct = { enabledFor: AddNewProduct?.config?.enabledFor, isEnabled: AddNewProduct?.isEnabled };
            featureFlag.AgentFdBook = { enabledFor: AgentFdBook?.config?.enabledFor, isEnabled: AgentFdBook?.isEnabled };
            featureFlag.AgentFdList = { enabledFor: AgentFdList?.config?.enabledFor, isEnabled: AgentFdList?.isEnabled };
            featureFlag.AgentCustomerList = { enabledFor: AgentCustomerList?.config?.enabledFor, isEnabled: AgentCustomerList?.isEnabled };
            featureFlag.AgentFdProduct = { enabledFor: AgentFdProduct?.config?.enabledFor, isEnabled: AgentFdProduct?.isEnabled };
            featureFlag.CustomerAgentMapping = { enabledFor: CustomerAgentMapping?.config?.enabledFor, isEnabled: CustomerAgentMapping?.isEnabled };
            featureFlag.UserManagement = { enabledFor: UserManagement?.config?.enabledFor, isEnabled: UserManagement?.isEnabled };
            featureFlag.AgentCustomerEdit = { enabledFor: AgentCustomerEdit?.config?.enabledFor, isEnabled: AgentCustomerEdit?.isEnabled };
            // }
            sessionStorage.setItem("featureFlag", JSON.stringify(featureFlag));
            properties && sessionStorage.setItem("properties", JSON.stringify(properties.properties));
            return featureFlag;
          }
        }
      }).catch((err) => {
        console.log("Error:", err)
      });
    return await applicationSetupFlags;
  } else {
    return featureFlags;
  }
}
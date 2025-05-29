import { fmListWithProfessionalDetails, fmListWithoutProfessionalDetails, listWithProfessionalDetails, listWithoutProfessionalDetails, unityList } from "./diy_sidebar_items";
import { rmListWithProfessionalDetails, rmListWithoutProfessionalDetails } from "./rm_sidebar_items";
import { LocalStorageHandler } from "./storage_handler";
import { getUserType, getUserRole } from "./util";

export const getSideBarList = () => {
  const role = getUserType();
  if (typeof window !== "undefined") {
    const shouldRenderDynamicFields = new LocalStorageHandler().getLocalStorageItem("shouldRenderProfessionalDetails");

    if (role.toLowerCase() === "user") {
      const selectedManufacturerId = new LocalStorageHandler().getLocalStorageItem("selectedManufactureId");
      if (selectedManufacturerId === "UNITY") {
        return unityList;
      }
      return shouldRenderDynamicFields && JSON.parse(shouldRenderDynamicFields) ? listWithProfessionalDetails : listWithoutProfessionalDetails
    } else {
      return shouldRenderDynamicFields && JSON.parse(shouldRenderDynamicFields) ? rmListWithProfessionalDetails : rmListWithoutProfessionalDetails
    }
  }
}

export const getFMSideBarList = () => {
  const role = getUserRole();
  if (typeof window !== "undefined") {
    const shouldRenderDynamicFields = new LocalStorageHandler().getLocalStorageItem("shouldRenderProfessionalDetails");

    if (role.toLowerCase() === "familyhead") {
      return shouldRenderDynamicFields && JSON.parse(shouldRenderDynamicFields) ? fmListWithProfessionalDetails : fmListWithoutProfessionalDetails
    }
  }
}


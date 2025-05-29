import { getJourneyType } from "./util"

let getDetails = {}

function getLocalStorageData(label, key = '') {
  if (label == "") {
    label = getProductId()
  }
  if (typeof window != "undefined" && key == "") {
    getDetails = JSON.parse(sessionStorage.getItem(label)) ? JSON.parse(sessionStorage.getItem(label)) : {}
  } else if (typeof window != "undefined" && key != "") {
    let extratedData = sessionStorage.getItem([label]) != "undefined" ? sessionStorage.getItem([label]) : {}
    let data = extratedData != null ? JSON.parse(extratedData)[key] : {}
    getDetails = data ? data : {}
  }
  getDetails = typeof getDetails !== "undefined" ? getDetails : {}
  return getDetails;

}

function getProductId() {
  if (typeof window !== 'undefined') {
    let userJourneyUrl = typeof window !== 'undefined' ? window.location.href : ""
    let journeyType = getJourneyType();
    const selectedProductId = sessionStorage.getItem("selectedProductId")
    if (selectedProductId != "") {
      return selectedProductId
    } else if (journeyType) {
      let productId = userJourneyUrl.length > 0 ? userJourneyUrl.split(journeyType + "/")[1].split("/")[0] : "";
      if (productId) {
        return productId;
      } else {
        console.error("ProductID not found")
        return 0;
      }
    } else {
      console.error("ProductID not found")
      return 0;
    }
  } else {
    console.error("ProductID not found")
    return 0;
  }
}

function getLocalStorageSingleData(label) {
  if (typeof window !== 'undefined') {
    getDetails = sessionStorage.getItem(label)
  }
  return getDetails ? getDetails : {}
}

function formatFullPermanentAddress(customer_address) {
  let fullPermanentAddress = ""
  if (customer_address) {
    fullPermanentAddress =
      customer_address ?
        customer_address.permanent_address1 + " " + customer_address.permanent_city + " " + customer_address.permanent_state
        + " " + customer_address.permanent_zip + " " + customer_address.permanent_country : ""
  }
  return fullPermanentAddress;
}

function formatFullCommunicationAddress(customer_address) {
  const fullCommunicationAddress =
    customer_address ?
      customer_address.communication_address1 + " " + customer_address.communication_city + " " + customer_address.communication_state
      + " " + customer_address.communication_zip + " " + customer_address.communication_country : ""
  return fullCommunicationAddress;
}

function formatFullName(ckycPersonalData) {
  const userFullName = ckycPersonalData && ckycPersonalData.FirstName ?
    ckycPersonalData.FirstName + " " + (ckycPersonalData.MiddleName ? ckycPersonalData.MiddleName : "") + " " +
    (ckycPersonalData.LastName ? ckycPersonalData.LastName : "") : ""
  return userFullName;

}

function formatFatherFullName(ckycParentSpouseData) {
  if (ckycParentSpouseData) {
    const { personalDetails } = ckycParentSpouseData
    const userFatherFullName = personalDetails ? personalDetails.fatherFname + " " + personalDetails.fatherMname + " " + personalDetails.fatherLname : ""
    return userFatherFullName;
  }
  return "";
}

function formatMotherFullName(ckycParentSpouseData) {
  if (ckycParentSpouseData) {
    const { personalDetails } = ckycParentSpouseData

    const userMotherFullName = personalDetails ? personalDetails.motherFname + " " + personalDetails.motherMname + " " + personalDetails.motherLname : ""
    return userMotherFullName;
  }
  return "";
}

export {
  getLocalStorageData, getLocalStorageSingleData, getProductId, formatFullPermanentAddress,
  formatFullCommunicationAddress, formatFullName, formatFatherFullName, formatMotherFullName
}
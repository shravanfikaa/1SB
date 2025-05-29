const { pidData, CKYCMappingToPidField, AadharMappingToPidField } = require("./pidData")

export const mapValidateCustomerRespToCKYC = (requestData) => {
  const responseData = pidData;
  const { personalDetails } = CKYCMappingToPidField;
  const requestDataKeys = Object.keys(requestData);

  const { customerContactEmail, customerContactPhone, customerInformation, customerAddress } = requestData

  if (requestDataKeys.length) {
    Object.keys(personalDetails).forEach((key) => {
      if (key === "email") {
        responseData.personalDetails[key] = customerContactEmail[0][personalDetails[key]];
      } else if (key === "mobNum") {
        responseData.personalDetails[key] = customerContactPhone[0][personalDetails[key]];
      } else if (personalDetails[key].includes("Address")) {
        if (key.includes("perm")) {
          const permanentAddress = customerAddress.length && customerAddress.filter((value) => value["customerAddressType"] === "P");
          if (permanentAddress.length) {
            responseData.personalDetails[key] = permanentAddress[0][personalDetails[key]];
          }
        } else {
          const permanentAddress = customerAddress.length && customerAddress.filter((value) => value["customerAddressType"] !== "P");
          if (permanentAddress.length) {
            responseData.personalDetails[key] = permanentAddress[0][personalDetails[key]];
          }
        }
      } else {
        responseData.personalDetails[key] = customerInformation[personalDetails[key]];
      }
    })
  }
  return { pidData: responseData };
}

export const mapValidateAadharRespToCKYC = (requestData) => {
  const responseData = pidData;
  const { personalDetails } = AadharMappingToPidField;
  const requestDataKeys = Object.keys(requestData);

  if (requestDataKeys.length) {
    Object.keys(personalDetails).forEach((key) => {
      if (key === "fullname" && requestData["fullName"]) {
        const fullNameArray = requestData["fullName"].split(" ");
        responseData.personalDetails["fname"] = fullNameArray[0]; // First name

        if (fullNameArray.length > 2) {
          // Join all middle names (if any)
          responseData.personalDetails["mname"] = fullNameArray.slice(1, -1).join(" ");
        }
        responseData.personalDetails["lname"] = fullNameArray[fullNameArray.length - 1]; // Last name
      }

      if (personalDetails[key]) {
        responseData.personalDetails[key] = requestData[personalDetails[key]];
      } else {

      }
    })
  }

  return { pidData: responseData };
}
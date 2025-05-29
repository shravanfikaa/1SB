export const getCustomerAddressDetails = () => {
  const productIdLocal = sessionStorage.getItem("selectedProductId");
  const productData = JSON.parse(sessionStorage.getItem(productIdLocal));
  const { CkycApiData, customer_address } = productData;
  const addressDetails = [];

  if (CkycApiData?.["ADDRESS DETAILS"]) {
    const { permanentCity,
      permanentDistrict,
      "Permanent Address": permLine1,
      permLine2,
      permLine3,
      "Permanent PinCode": permPin,
      permanentState,
      permanentCountry
    } = CkycApiData?.["ADDRESS DETAILS"];

    const addressDetails = [
      {
        corAddSameAsPer: customer_address ? JSON.stringify(customer_address.sameAddress) : "",
        customerAddress1: permLine1 ? permLine1 : "",
        customerAddress2: permLine2 ? permLine2 : "",
        customerAddress3: permLine3 ? permLine3 : "",
        customerAddressCity: permanentCity ? permanentCity : "",
        customerAddressCountry: permanentCountry ? permanentCountry : "",
        customerAddressDistrict: permanentDistrict ? permanentDistrict : "",
        customerAddressPincode: permPin ? permPin : "",
        customerAddressPreferred: "P",
        customerAddressState: permanentState ? permanentState : "",
        customerAddressType: "P",
        customerStayingSince: ""
      },
      {
        corAddSameAsPer: customer_address ? JSON.stringify(customer_address.sameAddress) : "",
        customerAddress1: customer_address ? customer_address.communication_address1 : "",
        customerAddress2: "",
        customerAddress3: "",
        customerAddressCity: customer_address ? customer_address.communication_city : "",
        customerAddressCountry: customer_address ? customer_address.communication_country : "",
        customerAddressDistrict: "",
        customerAddressPincode: customer_address ? customer_address.communication_zip : "",
        customerAddressPreferred: "P",
        customerAddressState: customer_address ? customer_address.communication_state : "",
        customerAddressType: "C",
        customerStayingSince: ""
      }
    ];
    return addressDetails;
  }
  return addressDetails;
}

export const getVKYCAddressDetails = () => {
  const productIdLocal = sessionStorage.getItem("selectedProductId");
  const productData = JSON.parse(sessionStorage.getItem(productIdLocal));
  const { CkycApiData, customer_address } = productData;
  const addressDetails = [];

  if (CkycApiData?.["ADDRESS DETAILS"]) {
    const { permanentCity,
      "Permanent Address": permLine1,
      permLine2,
      permLine3,
      "Permanent PinCode": permPin,
      permanentState,
      permanentCountry
    } = CkycApiData?.["ADDRESS DETAILS"];
    const permanentAddress = {
      customerAddressType: "P",
      customerAddress1: permLine1 ? permLine1 : "--",
      customerAddress2: permLine2 ? permLine2 : "--",
      customerAddress3: permLine3 ? permLine3 : "--",
      customerPincode: permPin ? permPin : "--",
      customerCity: permanentCity ? permanentCity : "--",
      customerState: permanentState ? permanentState : "--",
      customerCountry: permanentCountry ? permanentCountry : "--",
    };

    const communicationAddress = {
      customerAddressType: "C",
      customerAddress1: customer_address?.communication_address1 ? customer_address.communication_address1 : "--",
      customerAddress2: "--",
      customerAddress3: "-",
      customerPincode: customer_address?.communication_zip ? customer_address.communication_zip : "--",
      customerCity: customer_address?.communication_city ? customer_address.communication_city : "--",
      customerState: customer_address?.communication_state ? customer_address.communication_state : "--",
      customerCountry: customer_address?.communication_country ? customer_address.communication_country : "--",
    }

    permLine1 && addressDetails.push(permanentAddress);
    customer_address?.communication_address1 && addressDetails.push(communicationAddress)

    return addressDetails;
  }
  return addressDetails;
}

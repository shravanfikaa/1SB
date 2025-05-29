import { dd_mm_yyyy_format, trimText } from "./util";

export const getCustomerInformation = () => {
  const productIdLocal = sessionStorage.getItem("selectedProductId");
  const userInfo = sessionStorage.getItem("userInfo");
  const rmCustomerData = sessionStorage.getItem("rm_customer_data");
  let pan_number = "";
  let date_of_birth = "";
  if (userInfo) {
    const { pan_number: panNumber, date_of_birth: dateOfBirth } = JSON.parse(userInfo);
    pan_number = panNumber;
    date_of_birth = dateOfBirth;
  }
  if (rmCustomerData) {
    const { pan_number: panNumber } = JSON.parse(rmCustomerData);
    pan_number = panNumber;
    date_of_birth = "";
  }
  const professionalDetails = { Income: "", Occupation: "" };
  const productData = JSON.parse(sessionStorage.getItem(productIdLocal));
  const { professional_details, basic_details, CkycApiData } = productData;

  if (professional_details) {
    Object.keys(professional_details).forEach((key) => {
      professionalDetails[key] = professional_details[key].data;
    })
  }

  const customerInformation = {
    ckycNo: "",
    customerContactNo: "",
    customerDob: "",
    customerEmailId: "",
    customerFirstName: "",
    customerFullName: "",
    customerGender: "",
    customerIncomeDtls: "",
    customerLastName: "",
    customerMaritalStatus: "",
    customerMiddleName: "",
    customerNetworth: "",
    customerNetworthValueDt: "",
    customerOccupation: "",
    customerPan: "",
    customerPlaceBirth: "",
    customerResidentStatus: "",
    customerTitle: "",
    customerWealthSource: "",
  }

  const investorDetails = JSON.parse(sessionStorage.getItem("investorDetails"));
  if (investorDetails && !investorDetails?.isFamilyHead) {
    const familyDetails = JSON.parse(sessionStorage.getItem("familyDetails"));
    const filteredDetails = familyDetails.payload.investorDetails.filter((investor) => {
      return investor.userId === investorDetails?.userId
    });
    if (filteredDetails.length) {
      const { MaritalStatus, placeOfBirth } = basic_details;
      const { customerInformation: customerInfo } = filteredDetails[0];
      Object.keys(customerInfo).forEach(key => {
        if (key === "customerDob") {
          customerInformation[key] = dd_mm_yyyy_format(new Date(customerInfo[key]));
        } else {
          customerInformation[key] = customerInfo[key]
        }
      });
      customerInformation.ckycNo = customerInfo.customerCkycNo;
      customerInformation.customerResidentStatus = "I am Indian Resident";
      if (CkycApiData) {
        const {
          "PERSONAL DETAILS": ckycPersonalData,
          "BASIC DECLARATION": taxResidencyDeclarationData
        } = CkycApiData;
        customerInformation.customerContactNo = ckycPersonalData ? trimText(ckycPersonalData.MobileNumber) : "";
        customerInformation.customerDob = ckycPersonalData?.Dob ? dd_mm_yyyy_format(new Date(ckycPersonalData?.Dob)) : "";
        customerInformation.customerEmailId = ckycPersonalData ? trimText(ckycPersonalData.Email) : email;
        customerInformation.customerPan = ckycPersonalData?.pan_number ? trimText(ckycPersonalData.pan_number) : "";
        customerInformation.customerResidentStatus = taxResidencyDeclarationData
          ? trimText(taxResidencyDeclarationData.ResidentStatus)
          : "I am Indian Resident";
        customerInformation.customerMaritalStatus = MaritalStatus ? trimText(MaritalStatus) : "";
        customerInformation.customerPlaceBirth = placeOfBirth ? trimText(placeOfBirth) : "";
        customerInformation.customerIncomeDtls = professionalDetails?.["Annual Income"] ? professionalDetails?.["Annual Income"] : "";
        customerInformation.customerOccupation = professionalDetails?.Occupation ? professionalDetails.Occupation : "";
      }
    }
    delete customerInformation.customerGender
  } else if (CkycApiData?.pidData?.personalDetails) {
    const {
      "PERSONAL DETAILS": ckycPersonalData, pidData,
      "BASIC DECLARATION": taxResidencyDeclarationData
    } = CkycApiData;
    const { ckycNo, prefix, email, fname, mname, lname, fullname } = pidData.personalDetails;
    const MaritalStatus=basic_details?.MaritalStatus
    const gender=basic_details?.gender
    const placeOfBirth=basic_details?.placeOfBirth
    customerInformation.ckycNo = ckycNo;
    customerInformation.customerContactNo = ckycPersonalData ? trimText(ckycPersonalData.MobileNumber) : "";
    customerInformation.customerDob = date_of_birth ? dd_mm_yyyy_format(new Date(date_of_birth)) : "";
    // customerInformation.customerDob = ckycPersonalData ? dd_mm_yyyy_format(new Date(ckycPersonalData.Dob)) : date_of_birth ? dd_mm_yyyy_format(new Date(date_of_birth)) : "";
    customerInformation.customerEmailId = ckycPersonalData ? trimText(ckycPersonalData.Email) : email;
    customerInformation.customerFirstName = fname;
    customerInformation.customerFullName = fullname;
    customerInformation.customerGender = trimText(gender);
    customerInformation.customerLastName = lname ? lname : "";
    customerInformation.customerMaritalStatus = trimText(MaritalStatus);
    customerInformation.customerMiddleName = mname;
    customerInformation.customerNetworth = "";
    customerInformation.customerNetworthValueDt = "";
    customerInformation.customerIncomeDtls = professionalDetails?.["Annual Income"] ? professionalDetails?.["Annual Income"] : "";
    customerInformation.customerOccupation = professionalDetails?.Occupation ? professionalDetails.Occupation : "";
    customerInformation.customerPan = trimText(pan_number);
    // customerInformation.customerPan = ckycPersonalData ? trimText(ckycPersonalData.pan_number) : trimText(pan_number);
    customerInformation.customerPlaceBirth = trimText(placeOfBirth);
    customerInformation.customerResidentStatus = taxResidencyDeclarationData
      ? trimText(taxResidencyDeclarationData.ResidentStatus)
      : "I am Indian Resident";
    customerInformation.customerTitle = prefix;
    customerInformation.customerWealthSource = "Professional";
    return customerInformation;
  } else if (rmCustomerData) {
    const { pan_number, gender, mobile_number, date_of_birth, email_id, first_name, last_name, middle_name, user_title } = JSON.parse(rmCustomerData);
    const { MaritalStatus, placeOfBirth } = basic_details;
    customerInformation.customerContactNo = mobile_number ? mobile_number : "";
    customerInformation.customerDob = date_of_birth ? dd_mm_yyyy_format(date_of_birth) : "";
    customerInformation.customerEmailId = email_id ? email_id : "";
    customerInformation.customerFirstName = first_name ? first_name : "";
    customerInformation.customerGender = gender ? gender : "";
    customerInformation.customerIncomeDtls = professionalDetails?.["Annual Income"] ? professionalDetails?.["Annual Income"] : "";
    customerInformation.customerLastName = last_name ? last_name : "";
    customerInformation.customerMaritalStatus = MaritalStatus ? MaritalStatus : "";
    customerInformation.customerMiddleName = middle_name ? middle_name : "";
    customerInformation.customerOccupation = professionalDetails?.Occupation ? professionalDetails.Occupation : "";
    customerInformation.customerPan = pan_number ? pan_number : "";
    customerInformation.customerPlaceBirth = placeOfBirth ? placeOfBirth : "";
    customerInformation.customerTitle = user_title ? user_title : "";

    return customerInformation;
  }
  return customerInformation;
}

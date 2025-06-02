export const RESIDENTIAL_STATUS = {
  residentialStatusIndian: "I am Indian Resident",
  residentialStatusNRI: "I am Non-Resident Indian (NRI)",
};

export const MARITAL_STATUS = {
  married: "Married",
  unmarried: "Unmarried",
};

export const PRODUCT_TYPE = {
  cumulative: "Cumulative",
  nonCumulative: "Non-Cumulative",
};

export const PAYOUT_FREQUENCY = {
  "monthly": "Monthly",
  "quarterly": "Quarterly",
  "half-yearly": "Half Yearly",
  "yearly": "Yearly",
  "annual": "Annual",
  "more": "& more"
}

export const PERSONAL_DETAILS = {
  textHeader: "Personal Details",
  infoHeaderPNB: `With PAN card number and Date of birth details will be fetched from CKYC.`,
  infoHeaderAadhar: `Enter your PAN and Date of Birth to fetch your KYC record from Aadhaar`,
  infoHeaderDigiLocker: `Enter your PAN and Date of Birth to fetch your KYC record from DigiLocker`,
  taxResidency: `Tax Residency - Are you a citizen national or tax resident of any other country outside India`,
  nriErrorMsg: "We cannot proceed to book an online deposit for a citizen/resident of another country other than India.",
  nriLicErrorMsg: "This facility is available only for Resident Indian Citizens, for all other categories, please contact your Relationship Manager or visit/contact our nearest branch office.",
  taxResidencyErrorMsg: "We cannot proceed to book an online deposit for a Tax residency of another country other than India.",
  panDetailsMissMatch: "Given PAN details does not match with the existing saved record Please go back and try again",
  amlCheckErrorMsg: "Unfortunately, you can not proceed with your FD booking journey, kindly speak to your relationship manager for more details",
}

export const BANK_DETAILS = {
  consent: `I confirm that account linked to above upi
  id belongs to me as a single holder or I am a primary
  holder in the joint account
  `,
  disclaimer: `Below upi id /
  account number will be
  used to invest in fixed
  deposit and maturity
  amount will be credited to
  the mentioned account
  number or linked bank
  account of the entered upi
  id.`,

  U: {
    consent: `I confirm that account linked to above upi id belongs to me as a single holder or I am a primary holder in the joint account`,
    disclaimer: `Below upi id /
  account number will be
  used to invest in fixed
  deposit and maturity
  amount will be credited to
  the mentioned account
  number or linked bank
  account of the entered upi
  id.`
  },
  A: {
    disclaimerSIB: "The account below will be used to debit the amount for your deposit investment. At the time of deposit closure, the total amount will be credited back to the below mentioned account.",
    disclaimer: `Below bank account will be used to invest in fixed deposit and also the maturity amount will be credited in below mentioned bank account.`,
    consent: `I confirm that above account belongs to me as a single holder or I am a primary holder in the joint account.`,
    consentPNB: `I hereby verify that I would be paying from my own account, details of which I have already given. I would not be using any third party / any other account for payment. PNBHFL will not be responsible for any disputes.`,
    consentSIB: "I confirm and understand that above account belongs to me as a single holder or primary holder in joint account and if I choose to take out my deposits before maturity/on maturity I will receive the total amount in the same account."
  }
}

export const ACCOUNT_TYPE = [
  "Saving Account", "Current Account"
]

export const NOMINEE_RELATION = [
  "Daughter",
  "Father",
  "Husband",
  "Mother",
  "Son",
  "Wife"
];

export const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export const TRIM_MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

export const BASIC_DETAILS_JSON = {
  FirstName: "fname",
  MiddleName: "mname",
  LastName: "lname",
  Title: "prefix",
  MobileNumber: "mobNum",
  Dob: "dob",
  Email: "email",
  pan_number: "pan",
};

export const ADDRESS_DETAILS_JSON = {
  "Permanent Address": "permLine1",
  permanentCity: "permCity",
  permanentDistrict: "permDist",
  permanentState: "permState",
  permanentCountry: "permCountry",
  "Permanent PinCode": "permPin",
  "Communication Address": "corresLine1",
  communicationCity: "corresCity",
  communicationDistrict: "corresDist",
  communicationState: "corresState",
  communicationCountry: "corresCountry",
  "Communication PinCode": "corresPin",
};

export const PROFILE_IMAGE_JSON = {
  sequenceNo: "sequenceNo",
  imageType: "imageType",
  imageCode: "imageCode",
  globalFlag: "globalFlag",
  branchCode: "branchCode",
  imageData: "imageData",
};

export const BUTTON_NAME = {
  back: "Back",
  continue: "Continue",
  process: "Process"
}

export const INVESTMENT_DETAILS = {
  invalidAmount: "Invalid Amount",
  invalidAmountLimit: `Please enter the amount within Minimum and Maximum Amount!`,
  amountMultipleOf: (amount) => amount ? `Enter amount in multiples of ${amount}` : "Invalid amount",
  investMentAmountModal: (fdMinAmount, fdMaxAmount) => `For the selected payout frequency & tenure, minimum & maximum deposit amount should be ₹ ${fdMinAmount} & ₹ ${fdMaxAmount}.`,
  invalidDays: (minTenure, maxTenure) => `Enter day in range of ${minTenure} day(s) & ${maxTenure} day(s)`,
  invalidMonths: (minTenure, maxTenure) => `Enter month in range of ${minTenure} month(s) & ${maxTenure} month(s)`,
  invalidYears: (minTenure, maxTenure) => `Enter year in range of ${minTenure} year(s) & ${maxTenure} year(s)`,
}

export const DOWNLOAD_OPTIONS = {
  pdf: "Download as PDF",
  csv: "Download as CSV"
}

export const MATURITY_INSTRUCTION = {
  autoRedeem: "Redeem on Maturity",
  renewPrincipal: "Auto Renew Principal",
  renewPrincipalAndInterest: "Auto Renew Principal with Interest",
}

export const UNITY_MATURITY_INSTRUCTION = {
  autoRedeem: "Redeem on Maturity",
  // renewPrincipal: "Auto Renew Principal",
  renewPrincipalAndInterest: "Auto Renew Principal with Interest",
}


export const PNB_MATURITY_INSTRUCTION = {
  autoRedeem: "Payment at maturity",
  renewPrincipal: "Renew Principal",
  renewPrincipalAndInterest: "Renew Principal & Interest",
}

export const LIC_MATURITY_INSTRUCTION = {
  autoRedeem: "Renew Principal and Interest on Maturity",
  renewPrincipal: "Renew Principal on Maturity",
  renewPrincipalAndInterest: "Repay, in entirety, the Principal and Interest on Maturity",
}



export const ROWS_PER_PAGE_ARRAY = [10, 20, 30, 50, 100];

export const MAX_NOMINEE_LIMIT_MESSAGE = "It looks like you've added the maximum number of nominees permitted for this issuer. If you'd like to make updates, feel free to manage your existing nominees.";
export const MAX_SELECT_MESSAGE = "Nominee is already chosen Please deselect current nominee and try again.";

export const LOGIN_POPUP_TEXT = {
  header: "Enter your PAN and OTP shared on your registered email id & phone number.",
  newRegisteredUser: "User has been registered successfully. OTP shared on your registered email id & phone number.",
  existingUser: "User already registered. OTP shared on your registered email id & phone number.",
  userNotFound: "No user found for the pan number"
}

export const RM_CUSTOMER_COLUMNS = {
  pan_number: "Customer PAN",
  customer_full_name: "Customer Name",
  email_id: "Email ID",
  mobile_number: "Contact No.",
  agent_id: "Agent ID",
  agent_full_name: "Agent Name",
  customer_mapped_on: "Mapped On",
  updated_on: "Last Changed",
  mapping_history: "Mapping History",
}

export const RM_CUSTOMER_LIST_COLUMNS = {
  pan_number: "Customer PAN",
  customer_full_name: "Customer Name",
  email_id: "Email ID",
  mobile_number: "Contact No.",
}

export const RM_AGENT_COLUMNS = {
  employee_id: "Employee ID",
  employee_name: "Employee Name",
  email_id: "Email ID",
  mobile_number: "Contact No.",
  user_status: "Status",
  created_on: "Added On",
  lastLogin: "Last Login",
};

export const RM_AGENT_DASHBOARD_COLUMNS = {
  employee_id: "Emp ID",
  agent_full_name: "Name",
  email_id: "Email ID",
  mobile_number: "Contact No.",
  user_status: "Status",
  created_on: "Added on",
  lastLogin: "Updated on",
  customers_mapped: "# Customers",
};

export const RM_MAPPED_CUSTOMERS = {
  pan_number: "Customer PAN",
  customer_full_name: "Customer Name",
  email_id: "Email ID",
  mobile_number: "Contact No.",
  created_on: "Created on",
  agent_id: "Agent ID",
  agent_full_name: "Agent Name",
  customer_mapped_on: "Mapped On",
  updated_on: "Last Changed",
};

export const RM_CUSTOMER = {
  confirmationHeader: "Change Agent",
  confirmationMessage: "Some of customers already mapped to Agent(s). Are you sure to change agent for selects customer(s)?"
}

export const RM_VIEW_OPTIONS = {
  cancelApplication: "Cancel Application",
  resendOnboardingLink: "Resend Onboarding Link",
  resendPaymentLink: "Resend Payment Link",
  appHistory: "Application History",
}
export const RM_JOURNEY_ERROR_MESSAGES = {
  isValidEmail: "Valid Email",
  invalidPAN: "Invalid PAN Card format",
  isUserMinor: "User is Minor",
  minorNotAllowed: "Minors are not allowed on digital onboarding. Kindly process the application offline",
  invalidMobileNumberLength: "Mobile number must be of length 10",
  invalidMobileNumber: "Kindly enter a valid phone number",
  isEmailInvalid: "Entered email ID is incorrect",
  isEmailSameAsAgentEmail: "Applying FD for self? Kindly use self–onboarding portal",
  failedToUpdateUser: "Failed to update user"
}

export const ONBOARDING_PAGE = {
  declarationMsg: `I Authorize 1Silverbullet to fetch my CKYC/Offline Aadhar KYC details available with CERSAI / UDAI. I / We Authorize 1Silverbullet, Its group companies, affiliates, business associates and their respective representatives are authorized to send promotional communications regarding Fixed deposits, loans and services.`
}

export const MAKE_PAYMENT_DECLARATION = {
  declarationMsg: `Declaration under section 197A(1) and section 197A(1A) of the Income‐tax Act, 1961 to be made by an individual or a person (not being a company or firm) claiming certain receipts without deduction of tax`,
  agreementMsg: "I agree all the details entered are correct"
}

export const fdConfirmationMessage = (userType) => userType?.toLowerCase() === "familyhead" ?
  "Onboarding request successfully shared with your family." :
  "Onboarding request successfully shared with your customer."

export const fdCkycMessage = (userType) => userType?.toLowerCase() === "familyhead" ?
  "Ask your family member to complete the KYC & FD booking using the link shared over email." :
  ""


export const FD_VS_GOLD_TABLE_CONTENT = "fd_vs_gold_comparison"

export const MMFSL_FD_TERMS_CONDITIONS = "mmfsl_fd_terms_conditions"

export const DECLARATION_CONCENT = {
  taxResidency: `Tax Residency – Are you a citizen national or tax resident of any other country outside India`
}

export const REDIRECTION_MSG = {
  msg: "Note: We are processing your payment request. Kindly do not close or refresh your browser.",
  // msgAfterReview: `Please do not Close / Refresh this page, until you are redirect to
  //           Payment confirmation screen.`,
  msgAfterReview: `Do not close or refresh this page.`,
  MismatchInAadharHolderAndInvestorDetails: "Mismatch in Aadhar holder & Investor details",
  VerifyMobileNumberAndEmailId: "Verify mobile number & email id",
  verifyMobileNumber: "Verify mobile number",
  ThisFieldIsRequired: "This field is required",
  FDRenewalFailed: " FD Renewal Failed!",
  EnterAValidCommunicationZIPCode: "Enter a valid communication ZIP code",
  SUCCESS: "SUCCESS",
  InvalidZIPcode: "Invalid ZIP code",
  CustomerAddressPreference: "Customer address preference must be true",
  CustomerAddressPreferenceRequired: "Customer address preference is required"
}

export const INTEREST_RATES_DROPDOWN = {
  regular: "Regular",
  seniorCitizens: "Senior Citizen",
  female: "Female",
  femaleSeniorCitizens: "Senior Citizen - Female",
}

export const AGENT_SIDEBAR_ITEMS = {
  transactionList: "Transaction List",
  customerList: "Customer List",
  fdBook: "FD Book",
  fdProducts: "FD Products",
  customerAgentMap: "Customer Agent Mapping",
  userManagement: "User Management"
}

export const imageURL = {
  profilePicURL: "https://1sb-artifacts.s3.ap-south-1.amazonaws.com/FD/default_profile_pic.png",
  imageBaseUrl: "https://1sb-manufacturer-logos.s3.ap-south-1.amazonaws.com/fixed-deposit/",
}

export const VALIDATION_CONSTANT = {
  selectOneOption: "Select at least one option",
  selectAnOption: "Select an option",
  invalidPAN: "Invalid PAN Card format",
  mobileNoLength: "Mobile number must be of length 10",
  invalidContact: "Invalid contact no. format",
  validEmail: "Please enter correct Email ID",
  invalidValue: "Invalid Value entered",
  enterValidDOB: "Enter a valid user date of birth",
  invalidAcc: "Invalid Account Number",
  invalidIFSC: "Invalid IFSC Code",
  minThreeChar: "Minimum three characters are must",
  invalidLC: "Invalid LG/LC code format",
  invalidGardianDOB: "Enter a valid guardian date of birth",
  invalidNomineeDOB: "Enter a valid Nominee date of birth",
  enterValidnomineeFN: "Enter a valid nominee first name",
  enterValidnomineeMN: "Enter a valid nominee middle name",
  enterValidnomineeLN: "Enter a valid nominee last name",
  enterValidGuardianFN: "Enter a valid guardian first name",
  enterValidGuardianMN: "Enter a valid guardian middle name",
  enterValidGuardianLN: "Enter a valid guardian last name",
  nomineePanError: "Nominee PAN should not be same as applicant PAN",
  guardianPANError: "Enter a valid guardian PAN",
  guardianPanError: "Nominee and guardian PAN should not same",
  nomineeShareError: "Invalid nominee share percentage entered",
  nomineePINError: "Enter a valid nominee ZIP code",
  commbineLengthError: "The combined length of both address lines must be at least 15 characters",
  validSpouseFirstName: "Please enter a valid spouse first name",
  validSpouseMiddleName: "Please enter a valid spouse middle name",
  validSpouseLastName: "Please enter a valid spouse last name",
  validFatherLastName: "Please enter a valid father's last name",
  validMotherLastName: "Please enter a valid mother's last name",
  nomineeAndGuardianNameShouldNotMatch:"Nominee name cannot be the same as the guardian name. Please enter a valid nominee.",
  nomineeAndInvesterNameShouldNotMatch: "Nominee name cannot be the same as the investor’s name. Please enter a valid nominee."




}
export const nomineeMapping = {
  "nominee_title": "nomineeTitle",
  "nominee_first_name": "nomineeFirstName",
  "nominee_middle_name": "nomineeMiddleName",
  "nominee_last_name": "nomineeLastName",
  "nominee_relation": "nomineeRelationship",
  "nominee_date_of_birth": "nomineeDob",
  "nominee_percentage": "nomineePercentage",
  "nominee_pan_number": "nomineePan",
  "nominee_guardian_relationship": "nomineeGuardianRelation",
  "nominee_guardian_first_name": "nomineeGuardianFirstName",
  "nominee_guardian_middle_name": "nomineeGuardianMiddleName",
  "nominee_guardian_last_name": "nomineeGuardianLastName",
  "nominee_guardian_pan_number": "nomineeGuardianPan",
  "nominee_guardian_date_of_birth": "nomineeGuardianDob",
  "nominee_address_line1": "nomineeAddressLine1",
  "nominee_address_line2": "nomineeAddressLine2",
  "nominee_pincode": "nomineePincode",
  "nominee_city": "nomineeCity",
  "nominee_state": "nomineeState",
  "nominee_country": "nomineeCountry",
  "sameAddress": "nomineeSameAddress",
  "is_nominee_minor": "isNomineeMinor"
}

export const profilePicCodes = {
  "shriram": "customer_kyc_profile",
  "mmfsl": "customer_kyc_profile",
  "bajaj": "customer_kyc_profile",
  "usfb": "customer_kyc_profile",
  "sib": "customer_kyc_profile",
  "ssfb": "customer_kyc_profile",
  "lichfl":"customer_kyc_profile",
  "pnbhfc": "02"
}

export const prePaymentManufacturers = [
  "bajaj", "usfb", "pnbhfc", "lichfl","unity"
];

export const PNB_CONSENTS = {
  bank_details_note: "Note: Please input the bank account details after verifying from the bank proof. The same bank account details will be used for repayment purposes. Funds can be accepted only from Resident Individuals."
}

export const PNB_FD_TERMS_CONDITIONS = {
  consentText1: "I hereby verify that I would be paying from my own account, details of which I have already given. I would not be using any third party / any other account for payment. PNBHFL will not be responsible for any disputes.",
  consentText2: "I hereby confirm that I will require physical copy of Fixed Deposit Receipt (FDR), which will be dispatched to my C-KYC address.",
};

export const PNB_WITHDRAW = {
  text: `Please note for any pre-maturity related service, customer is required to visit the branch (mentioned in application form) along with hand-over of physical copy of FDR. Please follow the pre-maturity guidelines mentioned in FD application form before any such request.`
}

export const SB_ADDRESS = {
  addressURL: "https://www.google.com/maps/place/1Silverbullet/@18.9967705,72.8191101,2091m/data=!3m1!1e3!4m6!3m5!1s0x3be7cf8d62385271:0x87703450629fa9c!8m2!3d19.073745!4d72.870494!16s%2Fg%2F11s1hq7p4q!5m1!1e2?hl=en-US&entry=ttu&g_ep=EgoyMDI0MTAwOS4wIKXMDSoASAFQAw%3D%3D",
  addressDetails: `Level 5, Grande Palladium, 175, CST Road,
Kolivery Village, MMRDA Area, Kalina,
Santacruz (E), Mumbai,
Maharashtra - 400098.`
}

//Done
export const COMMON_CONSTANTS = {
  GuardianFirstName: "Guardian First Name",
  GuardianPAN: "Guardian PAN",
  GuardianDOB: "Guardian DOB",
  copyClip: "Copy content to clipboard",
  k: "K",
  lakh: "Lakh",
  lakhs: "Lakhs",
  cr: "Cr",
  or: "OR",
  vpaId: "VPA ID",
  sibVkyc: "Please ensure the following before starting your Video KYC session:",
  sibVkyc1: "Keep your Original PAN Card handy. (Blurred/Damaged PAN Images not acceptable)",
  sibVkyc2: "A device (mobile, tablet, laptop, or desktop) with good internet speed. Noise free background.",
  miniTimeLine: "Minimize Timeline",
  maxiTimeLine: "Maximize Timeline",
  InterestHightoLow: "Interest: High to Low",
  InterestLowtoHigh: "Interest: Low to High",
  RatingLowtoHigh: "Rating: Low to High",
  RatingHightoLow: "Rating: High to Low",
  IssuerAtoZ: "Issuer: A to Z",
  IssuerZtoA: "Issuer: Z to A",
  CNumberAdhar: "Contact number (Linked with Aadhar)",
  ViewDetails: "View Details",
  ParentAndSpouseDetails: "Parent’s and Spouse Details",
  FatherName: "Father’s Name",
  MotherName: "Mother’s Name",
  SpouseName: "Spouse Name",
  maturityAmount: "Maturity Amount",
  tenure: "Tenure",
  yieldRate:"Effective Yield",
  interestRate: "Intrest Rate",
  interestRatePA: "Interest Rate (% p.a.)",
  year: "year",
  years: "years",
  addToCompare: "Add to Compare",
  payout: "Payout",
  comparePlans: "Compare Plans",
  backToList: "Back to List",
  noPlanSelectedSelectMinimum2PlansToCompare: "No Plan Selected. Select minimum 2 plans to compare",
  compare: "Compare",
  onMaturity: "On Maturity",
  monthlyMore: "Monthly & more",
  monthly: "Monthly",
  quarterly: "Quarterly",
  halfYearly: "Half Yearly",
  yearly: "Yearly",
  cumulative: "Cumulative",
  nonCumulative: "Non-Cumulative",
  mahindraFinance: "Mahindra Finance",
  mahindraFinanceFD: "Mahindra Finance FD",
  shriramRegularSavingsFD: "Shriram Regular Savings FD",
  bajajFinanceLimited: "Bajaj Finance Limited",
  utkarshSmallFinanceBankFixedDeposit: "Utkarsh Small Finance Bank Fixed Deposit",
  unitySmallFinanceBankFixedDeposit: "Unity Small Finance Bank Fixed Deposit",
  pnbHousingFinanceFixedDeposit: "PNB Housing Finance Fixed Deposit",
  filters: "Filters",
  issuer: "Issuer",
  creditRating: "Credit Rating",
  paymentFrequency: "Payment Frequency",
  fdTenure: "FD Tenure",
  day: "day",
  days: "days",
  highSafety: "High Safety",
  sortBy: "Sort By",
  resetAll: "Reset All",
  yield: "Yield",
  overview: "Overview",
  tenor: "Tenor",
  highestShortTermInterestRateUpto1Year: "Highest Short Term Interest Rate (Upto 1 Year)",
  highestMidTermInterestRate1YearTo3Year: "Highest Mid Term Interest Rate (1 Year to 3 Year)",
  highestLongTermInterestRate3YearMore: "Highest Long Term Interest Rate (3 Year & More)",
  seniorCitizenBenefit: "Senior Citizen Benefit",
  payoutFrequency: "Payout Frequency",
  creditRating: "Credit Rating",
  minMaxInvestableAmount: "Min & Max Investable Amount",
  prematureWithdrawal: "Premature Withdrawal",
  videoKycRequired: "Video KYC Required",
  savingsAccountRequired: "Savings Account Required",
  instantBookingAvailable: "Instant Booking Available",
  allowedWithPenalInterestOf: "Allowed with Penal Interest of",
  invest: "Invest now",
  chooseFixedDepositOptionToContinue: "Choose Fixed Deposit option to continue",
  continueLabel: "Continue",
  cancel: "Cancel",
  update: "Update",
  faqs: "FAQs",
  remaianingTime: "Time Remaining",
  fixedDeposit: "Fixed Deposit",
  totalInterestEarned: "Total Interest Earned",
  VKYCStatus: "VKYC Status",
  autoRenew: "Auto renew",
  withinWorkingDays: "within 3-4 working days",
  aggregatedNomineeShareShouldBe: "Aggregated Nominee Share should be 100 %",
  NoDataFound: "No data Found",
  LoginViaEmail: "Login via email",
  HeyEnterYourDetailsToGetSignInToYourAccount: "Hey, enter your details to get sign in to your account",
  editCustomerDetails: "Edit Customer Details"
}
//Done
export const FD_RENEWAL = {
  fdRenewalReview: "FD Renewal Review",
  nameAsPerPan: "Name as per PAN",
  nameAsPerAdhar: "Name as per Aadhar",
  residentStatus: "Resident Status",
  maritalStatus: "Marital Status",
  nomination: "Nominee",
  edit: "Edit",
  nominee: "Nominee",
  nomineePan: "Nominee PAN",
  chooseNominee: "Choose Nominee",
  nomineeDob: "Nominee DOB",
  minorGuardianName: "(Minor) Guardian Name",
  noNomineesAdded: "No Nominees added",
  investmentDetails: "Investment Returns and Benefits",
  depositAmount: "Deposit Amount",
  maturityInstruction: "MATURITY INSTRUCTION",
  form15G: "FORM 15G/FORM 15H",
  yes: "Yes",
  no: "No",
  months: "Months",
  maturityInstructions: "Maturity Instructions",
  redeemOnMaturity: "Redeem on Maturity",
  autoRenewPrincipal: "Auto Renew Principal",
  autoRenewPrincipalWithInterest: "Auto Renew Principal with Interest",
  // form15G: "Form 15G",
  doYouWantToSubmitForm15G: "Do you want to submit form 15G / form 15H",
  enterNomineeDetailsMFS: `Provide nominee details to enable smooth claim processing in case of the investor's unfortunate demise.`,
  enterNomineeDetails: `Enter nominee details, so that the money invested could be easily claimed by nominees in the unfortunate event of demise of the investor`,
  enterNomineeDetailsSIB: `The nominee will be able to claim the investment amount in the unfortunate event of demise of the account holder.`,
  addNominee: "Add Nominee",
  addNew: "Add new",
}
//Side Bar
export const SIDEBAR = {
  addressDetails: "Address Details",
  personalDetails: "Personal Details",
  basicDetails: "Basic Details",
  contactDetails: "Contact Details",
  parentsAndSpouseDetails: "Parent's and Spouse Details",
  professionalDetails: "Professional Details",
  Nominee: "Nominee",
  declaration: "Declaration",
  investmentDetails: "Investment Returns and Benefits",
  bankAccountDetails: "Bank Account Details",
  reviewAndInvest: "Order Review",
}
export const ADDRESS_DETAILS = {
  addressDetails: "Address Details",
  addressSubHeading: "Enter your permanent and communication address.",
  enterYourPersonalAndCommunicationAddress: "Enter your personal and communication address",
  permanentAddress: "Permanent Address",
  communicationAddress: "Communication Address",
  communicationAddressIsSameAsPermanent: "Communication Address is same as Permanent",
  permanentAddressLine: "Permanent Address Line",
  zip: "PinCode",
  country: "Country",
  stayingSince: "Staying Since",
  communicationAddressIsSameAsPermanentAddr: "Communication Address is same as Permanent Address",
  communicationAddressLine: "Communication Address Line",
  city: "City",
  state: "State",
  country: "Country",
  requestText: "I request you to take on record my Communication Address mentioned here in for this account opening , and I also confirm that in the event of any change in the address due to relocation or any other reason, I hereby agree to update / inform the new communication address to the Bank immediately. In the event of failure on my part in updating my communication address with the Bank, due to any reason, I shall be solely responsible and will not hold the bank responsible for non-delivery / loss of any deliverables.",
  sibrequestText: "I hereby confirm that: I am residing at the mentioned address, and the furnished information is true and complete to the best of my knowledge.The bank can use the mentioned address for any future communications related to my account.",
  save: "Save",
  close: "Close",
  back: "Back",
  communicationAddress: "Communication Address",
}
//Done
export const AFTER_REVIEW = {
  failed: "Failed",
  congratulations: "Congratulations",
  fdDetails: "FD DETAILS",
  refNumber: "Ref. Number",
  fdrNumber: "FDR Number",
  depositAmount: "Deposit Amount",
  openDate: "Open Date",
  maturityDate: "Maturity Date",
  bookingStatus: "Booking Status",
  underProcess: "Under process",
  fdBook: "FD book",
  exploreMoreFd: "Explore More FD",
  customerList: "Customer List",
  vkycText: "V- KYC is a video verification process and you hereby provide your consent to record audio, video & capture photograph and to store the entire data and recording in a manner and mode as may be deemed necessary. The data so collected will be used, stored & secured by the Bank only.",
  followDocText: "Please keep the following documents available with you before starting the call.",
  followDocText1: "Original PAN Card(Photographs or Blurred/Damaged PAN Images not acceptable)",
  followDocText2: "A white sheet of paper and a blue ball pen.",
  followDocText3: "A device [mobile, tablet,laptop, or desktop] with good internet speed.",
  followDocText4: "Noise free background.",
  startVideoKyc: "Start Video KYC",
  paymentDetails: "PAYMENT DETAILS",
  myFds: "My FDs",
  exploreMoreBonds: "Explore More Bonds",
  nextStepEsign: "Next Step: e-Sign your FD application form.",
  nextStepVkyc: "Next Step: Complete your Video KYC",
  emailBookingDetailsOfFd: "We will email you the booking details for your FD to your registered email id.,",
  errorInEsign: "There was an error in e-Signing your FD application form",
  paymentSuccessfulReceived: "Your Payment has been successfully received",
  paymentSuccessfulProcessed: "Your payment has been successfully processed,",
  paymentFailure: "FD booking has not been initiated due to payment failure.",
  somethingWentWrong: "Something went wrong!",
  welcomeToVkyc: "Welcome to VKYC",
  Welcome: "Welcome",
  pleaseWait: "Please wait...",
  redirectToEsign: "Redirecting for e - Sign",
  fetchingPaymentInfo: "Fetching Payment Info..",
  waitForPaymentStatus: "Please wait, while we confirm your payment status",
}

export const AGENT = {
  "deactivate_User": "Deactivate user",
  nomineeShare: "Nominee Share",
  totalFd: "TOTAL FD",
  //not availabel
  openDate: "Open Date",
  maturityDate: "Maturity Date",
  apply: "Apply",
  dateRange: "Date Range",
  loading: "Loading",
  rowsPerPage: "Rows per Page",
  noRecordsFound: "No records found",
  nameAsPerPan: "Name as per PAN",
  personalDetails: "PERSONAL DETAILS",
  firstName: "First Name",
  middleName: "Middle Name",
  lastName: "Last Name",
  mobileNumber: "Mobile number",
  userEmail: "User Email",
  panNumber: "PAN number",
  dateOfBirth: "Date of Birth",
  //Duplicate
  nomineeDetails: "NOMINEE DETAILS",
  nomineeDetails1: "Nominee Details",
  bankDetails: "BANK DETAILS",
  customerDetails: "Customer Details",
  customerProfile: "Customer Profile",
  customerFds: "Customer FDs",
  transferCustomers: "Transfer Customers",
  mappingHistory: "Mapping History",
  changedBy: "Changed By",
  date: "Date",
  action: "Action",
  rmName: "RM Name",
  //Duolicate
  changedBy: "Changed By",
  noDataFound: "No data found",
  close: "Close",
  changeAgent: "Change Agent",
  confirm: "Confirm",
  agentName: "Agent Name",
  employeeId: "Employee ID",
  //Pending From Here

  emailId: "Email ID",
  view: "View",
  edit: "Edit",
  customerName: "Customer Name",
  customerPan: "Customer PAN",
  customerContactNo: "Customer Contact No.",
  addProduct: "Add Product",
  customersMapped: "Customers Mapped",
  rowsPerPage: "Rows per Page",
  applicationHistory: "Application History",
  time: "Time",
  ipAddress: "IP Address",
  city: "City",
  country: "Country",
  initiatedBy: "Initiated by",
  noHistoryFound: "No history found as status of this FD is currently In Progress",
  searchBy: "Search by Name or PAN",
  search: "Search",
  search: "Search",
  dateRange: "Date Range",
  fdIssuer: "FD Issuer",
  fdName: "FD Name",
  fdAmount: "FD Amount",
  dateOfBooking: "Date of Booking",
  updatedDate: "Updated Date",
  source: "Source",
  copy: "Copy",
  more: "More",
  renew: "Renew",
  fdStatus: "FD Status",
  paymentStatus: "Payment Status",
  number: "Number",
  interest: "Interest",
  autoRenew: "Auto renew",
  nomineeRegistered: "Nominee Registered",
  dashboard: "Dashboard",
  addNewcustomer: "Add New Customer",
  signOut: "Sign out",
  dobDMY: "Date of Birth (DD-MMM-YYYY)",
  phone: "Phone",
  email: "Email",
  proceed: "Proceed",
  dob: "DOB",
  retry: "Retry",
  createUser: "Create User",
  userTitle: "User Title",
  selectSalutation: "Select Salutation",
  mr: "Mr",
  mrs: "Mrs",
  ms: "Ms",
  employeeEmailId: "Employee Email ID",
  employeeId: "Employee ID",
  designation: "Designation",
  role: "Role",
  selectRole: "Select Role",
  gender: "Gender",
  selectGender: "Select Gender",
  female: "Female",
  male: "Male",
  others: "Others",
  add: "Add",
  editUser: "Edit User",
  userTitle: "User Title",
  selectSalutation: "Select Salutation",
  selectStatus: "Select Status",
  investorDetails: "Investor Details",
  lastTransactionDetails: "Last Transaction Details",
  totalUsers: "TOTAL USERS",
  addNewUser: "Add new user",
  userName: "User Name",
  userEmailId: "User Email ID",
  status: "Status",
  dateCreated: "Date Created",
  lastLogin: "Last Login",
  type: "Type"
}

export const BANK_DETAILS_PAGE = {
  verifyingBankAccount: "Verifying your bank account",
  waitVerifyAccount: "Please wait while we verify your bank account",
  credit1RsToAccount: "You may see a credit of ₹ 1 in your bank account",
  addPaymentDetails: "Bank account details for payout of interest and maturity proceeds",
  invalidBankDetailsErrorMsg: "You have provided invalid Bank Details",
  alert: "Alert",
  mismatchBankAccountErrorMsg: "This account will be used by issuer to deposit the FD payout. Please ensure that provided details are correct.",
  vpaId: "VPA ID",
  shouldBeValidEmail: "Should be in abc@xxxxx",
  accountNumber: "Account Number",
  shouldBeNameOfApplicant: "Should be on the name of applicant",
  ifscCode: "IFSC Code",
  ifsc: "IFSC",
  invalidFileSelected: "Invalid File Selected. Allowed file types are JPG, PNG, BMP",
  fileSizeExceeded: "File size exceeded, please upload file less than 6 MB",
  somethingWentWrongRetry: "Something went wrong please wait or retry",
  providedInvalidDoc: "You have provided invalid document",
  chooseFileToProceed: "Please choose a file to proceed",
  congratsAccValidated: "Congratulations, Account Validated",
  investorName: "Investor Name",
  bankAccHolderName: "Bank Account Holder Name",
  accountStatus: "Account Status",
  matchStatus: "Match Status",
  matched: "Matched",
  updateUpiId: "Update UPI Id",
  manufacturerMandatedCheque: "Manufacturer mandated the cheque",
  uploadCancelledCopyOfCheque: "Upload cancelled copy of cheque",
  accDetailsVisible: "Make sure account number, account holder name, and IFSC code  are visible",
  upload: "Upload",
  account: "A/C",
  enterAmoutBetween:"Please Enter Amount Between",
  enterAmountGreaterThan:"Please Enter Amount Greater Than",
  enterAmountLessThan:"Please Enter Amount less Than"

}

export const BASIC_DETAILS = {
  orderReview: "Order Review",
  basicDetails: "Basic Details",
  fdDetails: "Great! Fixed Deposit will be made under following details",
  placeOfBirth: "Place of Birth",
  contactDetails: "Contact Details",
  addContactDetails: "Add your contact details",
  contactNumber: "Contact Number",
  editContactDetails: "Edit contact details",
  confirm: "Confirm",
  panNo: "PAN Number",
  pnbNote: `I hereby submit voluntarily at my own discretion, the details of C-KYC from CERSAl registry for the purpose of KYC compliance including Aadhaar details as issued by UIDAI (Aadhaar), to PNBHFL for the purpose of establishing my identity/proof.`
}

export const COMMON = {
  and : "and",
  savingAcc: "Saving Account",
  currentAcc: "Current Account",
  startDate: "Start Date",
  endDate: "End Date",
  deactivate: "Deactivate",
  clickOnOpenModel: "Click on the button to open the modal.",
  openModal: "Open Modal",
  initialDepositAmount: "Initial Deposit Amount",
  viewMore: "View More",
  noComponentToRender: "No component to render",
  FD: "FD",
  EnterCustomerDetails: "Enter Customer Details",
  mobileNumber: "Mobile Number",
  panNumber: "Pan Number",
  email: "Email",
  name: "Name",
  Listed: "Listed",
  WeAreProcessingYourRequestPleaseWaitForAMoment: `We are processing your request. Please wait for a moment.`,
  WeCouldNotProcessTheRequestAtTheMomentPleaseRetry: "We could not process the request at the moment. Please retry! ",
  ProcessingPaymentOperation: "Processing Payment Operation",
  RedirectingToPaymentGateway: "Redirecting to Payment Gateway",
  ApplicationHasBeenSubmittedSuccessfully: "Application has been submitted successfully"
}

export const DETAIL_FD = {
  Highlights: "Highlights",
  interestRates: "Interest Rates",
  minAmount: "Min. Amount",
  debtQuality: "Debt Quality",
  security: "Security",
  seniority: "Seniority",
  keyHighlights: "Key Highlights",
  period: "Period",
  hideGraph: "Hide Graph",
  viewGraph: "View Graph",
  investmentAmount: "Investment Amount",
  annum: "Annum",
  pa: "pa",
  cashFlowTimeline: "Cash Flow Timeline",
  cashFlow: "Cash Flow",
  highLights: "Highlights",
  disclaimer: "Disclaimer",
  fdsuccessfullyBooked: "Your FD has been successfully booked",
  mailFdDetailsOnEmail: "We will mail you the booking details for your FD to your registered email id",
  yourFdDetails: "YOUR FD DETAILS",
  corporateFdPlan1: "Corporate FD Plan 1",
  disclaimerByBajaj: "Disclaimer :*Open and maturity date given above is indicative and will be confirmed by Bajaj finance once they process your fixed deposit investment request",
  myProfile: "My Profile",
  declaration: "Declaration",
  yourFDDetails: " YOur  FD Details"
}

export const INVESTMENT = {
  investmentDetails: "Investment Returns and Benefits",
  provideInvestmentDetails: "Provide your investment details to make the payment",
  min: "Min",
  max: "Max",
  viewInterestRates: "View Interest Rates",
  interestPayout: "INTEREST PAYOUT",
  selectPayout: "Select Payout",
  whatwillYouGet: "Investment Returns And Benefits",
  dateOfMaturity: "Date of Maturity",
  seniorCitizenBenefit : "seniorCitizenBenefit",
  interestAmount: "Interest Amount",
  totalPayout: "Total Payout",
  interestRatesDetails: "Interest Rates Details",
  payoutMethods: "Payout Methods",

}

export const KYC_DETAIL = {
  selectPanNumber: "Select PAN number",
  customerCannotMinor: "Customer cannot be Minor",
  LgLcCodeOptional: "LG/LC Code (Optional)",
  enterOtpSentToEnteredMobileNo: "Enter OTP sent to entered mobile number",
  enterOtpSentToEnteredEmailId: "Enter OTP sent to entered email id",
  enterOtpSentToEnteredRegisterPhoneNo: "Enter OTP shared on your registered phone number.",
  resendOtp: "Resend OTP",
  submit: "Submit",
}

export const LOGIN_LOGOUT = {
  sessionExpire: "Session Expired Please Login!",
  login: "Login",
  enterOtp: "Enter OTP",
  enterEmail: "Enter Email",
  backToHome: "Back to home",
  home: "Home",
  enteredWrongPan: "Entered wrong PAN",
  clickHere: "Click here",
  youSuccessfullyLogOut: "You have been successfully logged out",
  signIn: "Sign In",
}

export const MAKE_PAYMENT_FDS = {
  makePayment: "Make Payment",
  go: "GO",
  applicationHistory: "Application History",
  activity: "Activity",
  eSignStatus: "e-Sign Status",
  applNoDepositNo: "Appl No/ Deposit No",
  fdAdvice: "FD Advice",
  noResultsFound: "No Results Found",
  selectDateRange: "Select Date Range",
  from: "From",
  "to": "To",
  fdWithdraw: "FD Withdraw",
  great: "Great",
  fdwithdrawalSuccessfullyRegistered: "Your FD withdrawal is successfully registered",
  filterIcon: "Filter Icon",
  myFamilyFds: "My Family FDs",
  transactionHistoryDetails: "Transaction History Details",
  description: "Description",
  amount: "Amount",
  prematureWithdrawalAmount: "Premature withdrawal Amount",
  prematureWithdrawalCharges: "Premature withdrawal charges",
  finalPrematureWithdrawalCharges: "Final Premature withdrawal charges",
  yesGoAhead: "Yes, Go Ahead",
  selectWithdrawalOption: "Select Withdrawal Option",
  or: "Or",
  closeFdWithdrawAllAmount: "Close the FD & withdraw all amount",
  fdWithdrawal: "FD Withdrawal",
  withdrawalType: "Withdrawal Type",
  withdrawalAmountRequested: "Withdrawal amount requested",
  prematureWithdrawalCharges: "Premature withdrawal Charges",
  finalPrematureWithdrawalAmount: "Final Premature withdrawal Amount",
  withdrawalAmoutWillCreditedToAcc: "The final withdrawal amount will be credited to your registered bank account",
  areYouSureGoAheadFdWithdrawal: "Are you sure to go ahead with FD withdrawal request.",
  finalPostPrematureWithdrawalCharges: "Your final withdrawal amount post premature withdrawal charges will be",
  fdWithdrawalSuccessfullyRegistered: "Your FD withdrawal request is successfully registered",

}

export const MY_PROFILE = {
  accountNumber: "Account Number",
  bankName: "Bank Name",
  accountType: "Account Type",
  ifscCode: "IFSC Code",
  name: "Name",
  relation: "Relation",
  pan: "PAN",
  guardian: "Guardian",
  addMoreNominee: "Add More Nominee",
  myProfile: "My Profile",
  error: "Error",
  nomineeShareShouldBeHun: "Aggregated Nominee Share should be 100",
  mandatoryNomineeForFd: "It is mandatory to have a nominee for this fixed deposit account.",
  relationship: "Relationship",
  guardianRelationship: "Guardian Relationship",
  guardianPan: "Guardian PAN",
  nomineeAddressSameAsPrimaryAddress: "Nominee Address is same as Primary Applicant Address",
  communicationAddressLine1: "Communication Address Line 1",
  communicationAddressLine2: "Communication Address Line 2",
  nomineeSelected: "Nominee selected",
  reviewFdApplCompleteKyc: "Kindly review your FD application request and complete your KYC.",
  initiateCkyc: "Initiate KYC",
}

export const PARENT_DETAILS_PAYMENT = {
  parentSpouseDetails: `Parent's and Spouse details`,
  enterParentSpouseName: "Enter your parent and spouse name.",
  fathersName: `Father's Name`,
  mothersName: `Mother's Name`,
  spousesName: `Spouse's Name`,
  bankingDetails: "Banking Details",
  provideBankingDetailsForPayment: "Provide your banking details to make your payment",
  totalPayment: "Total Payment",
  paymentMethod: "PAYMENT METHOD",
  selectBank: "Select Bank",
  netBanking: "Net Banking",
  upi: "UPI",
  stillConfused: "Still Confused",
  fdAgainstGold: "FD vs Gold",
  showing: "Showing",
  plansChooseFd: "Plans, Choose your FD",
  iHerebyAcceptAcknowledge: "I hereby accept and acknowledge the",
  termsConditions: "Terms and Conditions",
  Settings: "Settings",
  invalidOtp: "Invalid OTP",
  enteredWrongEmailId: "Entered wrong Email ID",
  support: "Support",
  draftJourneys: "Draft Journeys",
  videoKyc: "Video KYC",
  scheduledOn: "Scheduled On",
  utkarshSfBankFdPlan2: "Utkarsh SF Bank FD Plan 2",
  depositAmt: "Deposit Amt",
  tennure: "Tennure",
  resume: "Resume",
  discard: "Discard",
}

export const COMPONENTS = {
  gold: "Gold",
  download: "Download",
  english: "English",
  marathi: "Marathi",
  gujarati: "Gujarati",
  hindi: "Hindi",
  telugu: "Telugu",
  nominee1: "Nominee 1",
  nominee2: "Nominee 2",
  noNomineeAdded: "No nominee added in the Nominee section.",
  applNoDepositNo: "Appl. No/ Deposit No",
  tpslTransactionId: "TPSL-Transaction ID",
  clntTransactionRef: "CLNT-Transaction Ref",
  professionalDetails: "Professional Details",
  occupationDetail: "Enter your occupation and annual income details",
  months: "Month(s)",
  occupation: "Occupation",
  annualIncome: "Annual Income",
  sourceOfWealth: "Source of Wealth",
  termsConditions: "Terms & Conditions",
  vkycIsSuccessful: "Your VKYC is successful and details are being verified by the Bank",
  errorInCompletingKyc: "There was an error in completing your video KYC",
  mailYouBookingDetailsAfterVkyc: "We will mail you the booking details for your FD only after VKYC Completion and Approval",
  reinitiateKyc: "Next Step: Reinitiate your video KYC",
}

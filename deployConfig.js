const apiVersion = process.env.NEXT_PUBLIC_API_VERSION || "api/v1";
const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://fd.api.fikaa.in/";

module.exports = {
  isSSOAuthEnabled: false,
  baseUrl: baseUrl + apiVersion,
  isSSOAuthEnabled: false,
  applicationSetup: "/application/setup",
  login: "/login",
  logout: "/logout",
  loginPan: "/login/pan",
  refreshToken: "/refresh_token",
  instantLogin: "/instant_login",
  // journey 
  pauseAndResumeJourney: "/journey",
  userToken: "/token",
  //customer 
  getCustomer: "/customers?customer_pan=1234567890",
  updateCustomer: "/customer",
  createCustomer: "/customer",
  getCustomerDetails: "/customer/details?user_id=",
  //user
  getUserDetails: "/user/details",
  nsdlPanVerification: "/verify_pan",
  //customer details for agent
  getAllCustomerList: "/agent/filter/params",
  customerFilters: "/agent/customers/list",
  editUser:"/agent/customers/edit",
  uniqueCustomerList: "/agent/unique_customers/list",
  agentBookFDFilter: "/agent/book/fd/filter",
  downloadCustomerList: "/agent/download/customers/list/<file_format>",
  customerDetails: "/agent/customer/<customer_id>",
  customerFDList: "/agent/customer/<customer_id>/fd/list",
  downloadCustomerFDList: "/agent/download/customer/<customer_id>/fd/list/<file_format>",
  userManagementList: "/agent/user_management",
  rmCustomerList: "/agent/all/customers",
  rmAgentList: "/agent/all/agents",
  rmChangeAgent: "/agent/customers/mapping",
  rmMappedCustomersList: "/agent/<agent_id>/customers",
  rmDownloadMappedCustomersList: "/agent/<agent_id>/customers/download/<file_format>",
  rmCustomerMappingHistory: "/agent/customer/<customer_id>/mapping_history",
  rmTransferAgent: "/agent/customer/transfer",
  rmFdOrderBook: "/agent/fd_order_book",
  updateBookFD: "/agent/update_book_fd",
  rmFdAppHistory: "/agent/fd_application_activity/<fd_id>",
  rmAddNewCustomer: "/agent/add_customer",
  rmShareOnboardingLink: "/agent/share/link",
  rmCancelFdApplication: "/agent/cancel_fd_application",
  downloadUserManagementList: "/agent/download/user_management/<file_format>",
  agentRoles: "/agent/user_management/roles",
  //products
  getProducts: "/products?manufacturer_ids=2&product_type=FD&product_id=1",
  addProducts: "/products",
  updateProducts: "/products",
  getProductList: "/products/list",
  getProductDetail: "/product/details",
  getComparePlans: "/products/compare",
  investmentsInitiate: "/investments/initiate",
  //fds
  viewFd: "/fd?user_id=",
  updateFd: "/fd",
  getAllFd: "/fds",
  commitFd: "/fd/commit",
  commitFdPoll: "/commit/poll",
  initiateCKYC: "/agent/initiate_ckyc",
  updateCommunicationData: "/updateCommunicationData",
  rmBookFd: "/agent/book_fd",
  do_payment: "/fd/payment",
  paymentPolling: "/paymentPolling",
  withdrawFd: "/fd/closeWithdraw",
  fdHistory: "/fd/history?fd_id=2",
  fdStatus: "/fdrStatus",
  getFDDetails: "/fd/details",
  renewFD: "/fd/renewal",
  applicationStatusPoll: "/applicationStatus/poll?referenceId=",
  //enablers
  ckycVerification: "/ckyc",
  validateCustomer: "/validate/customer",
  agentValidateCustomer: "/agent/validate/customer",
  aadharVerification: "/aadharVerification",
  assistedAadharVerification: "/agent/aadharVerification",
  validateAadharInfo: "/validateAadharInfo",
  assistedValidateAadharInfo: "/agent/validateAadharInfo",
  // VKYC
  videoKycStatus: "/videoKycStatus", // my FD
  validateVkyc: "/validateVkyc", // after review
  agentInitiateVideoKYC: "/agent/initateVideoKyc",
  initiateVideoKYC: "/initateVideoKyc",
  retryInitiateVKYC: "/initateVideoKyc/retry",
  generateOTP: "/otp/generate",
  verifyOTP: "/otp/verify",
  otpVerification: "/otp/verification",
  repayment: "/rePayment",
  makePayment: "/payment",
  onboardingUserMakePayment: "/agent/make_payment",
  uploadCheque: "/uploadCheque",
  getProfessionalDetails: "/lookup",
  //manufacturer
  getAllAttachedManufacturer: "/manufacturer?dictributor_id=groww",
  manufacturerArtifacts: "/manufacturer/artifacts",
  //nominee
  getNominee: "/nominee?userId=",
  addNominee: "/nominee",
  updateNominee: "/nominee",
  deleteNominee: "/nominee",
  //bank details
  getBankDetail: "/bank_detail",
  addBankDetail: "/bank_detail",
  updateBankDetail: "/bank_detail",
  deleteBankDetail: "/bank_detail",
  bankVerify: "/bank_detail",
  getBankbyIfsc: "/bank_details_through_ifsc?",
  zipCode: "/zip_code_detail?consumerId=1&ZIPCODE=",
  validateAccount: "/validateAccount",
  //fd calculator
  fdCalculator: "/fd_calculator",
  onboarding: "/agent/onboarding/",
  pennyDrop: "/penny_drop",
  pennydropStatus: "/penny_drop/verify",
  manufacturerProfile: "/manufacturer/profile?manufacturer_id=",
  updatePaymentDetails: "/updatePaymentDetails",
  //disclaimer
  disclaimer: "/application/setup?distributor_id=",
  bankLogoBaseUrl: "https://1sb-manufacturer-logos.s3.ap-south-1.amazonaws.com/fixed-deposit/bankLogos/",
  manufacturerLogoBaseUrl: "https://fikaa-assets.s3.ap-south-1.amazonaws.com/FIKAA+Logo.png",
  nomineeRelationship: "/attributelist?entityId=3&attributeId=3",
  gardianRelationship: "/attributelist?entityId=3&attributeId=13",
  redirectURLAfterLogout: "/",
  //tenure master
  tenureMaster: "/tenuremaster",
  applicationStatus: "/applicationStatus?fdId=",
  prePaymentURL: "/fd/prePayment",
  // premature withdrawal
  fdPreWithdrawalInq: "/fdpreWithdrawalInq",
  fdPreWithdrawal: "/fdpreWithdrawal",
  unAuthorizesFeatures: {
    "productList": true,
    "productDetails": true,
    "ckyc": true,
  },
  resendOTPTimer: 60,
  commitFDFlow: {
    "BAJAJ": {
      "payment": "prePayment",
    },
    "USFB": {
      "payment": "prePayment",
    },
    "PNBHFC": {
      "payment": "prePayment",
    },
    "SSFB": {
      "payment": "prePayment",
    },
    "SIB": {
      "payment": "prePayment",
    },
    "UNITY": {
      "payment": "prePayment",
    },
    "LICHFL": {
      "payment": "prePayment",
    }
  },
  //Distributor MultiLang Support
  multiLanSupport: {
    "onesb": true,
    "hdfcsecl": false,
    "tipson": false
  },
  //agent
  agentLogin: "/agent/login",
  agentVerifyOTP: "/agent/otp/verify",
  createAgentUser: "/agent/user_management",
  editAgentUser: "/agent/user_management",
  agentCommitFD: "/agent/commit",
  generateFdAdvice: "/generateFdAdvice",
  end_to_end_encryption: true,
};

import { PostApiHandler } from "../pages/api/apihandler";
import appConfig from "../app.config";
import { compareTwoStrings } from "string-similarity";

const pennyDropAPIURL = appConfig?.deploy?.baseUrl + appConfig?.deploy?.pennyDrop;
const verifyStatusAPIURL = appConfig?.deploy?.baseUrl + appConfig?.deploy?.pennydropStatus;
function callPennyDropAPI(pennyDropRequestBody) {
  let isPennyDropSuccessFlag = false
  PostApiHandler(pennyDropAPIURL, "POST", pennyDropRequestBody).then((pennyDropResponse) => {
    const { data } = pennyDropResponse
    if (data) {
      //data is present
      if (data.data["accountStatus"] === "active" && data.data["status"] === "completed") {
        //redirect
        isPennyDropSuccessFlag = true
      }
      else if (data.data["accountStatus"] === null && data.data["status"] === "created") {
        //polling
        let isBankVerified = callStatusVerifyAPI(pennyDropRequestBody)
        isPennyDropSuccessFlag = false
      }
    }
    else {
      isPennyDropSuccessFlag = false
    }
  })
  return isPennyDropSuccessFlag
}

async function callStatusVerifyAPI(transactionId) {
  const verifyStatusRequestBody = {
    transactionId: transactionId
  }
  const fetchedResponseFromStatusAPI =
    await PostApiHandler(verifyStatusAPIURL, "POST", verifyStatusRequestBody).then(async (verifyStatusResponse) => {
      const { data } = await verifyStatusResponse
      if (data) {
        return [data.data.status, data.data.accountStatus]
      }
      else {
        return []
      }
    })
  return await fetchedResponseFromStatusAPI
}

function compareCkycDetailsWithPennyDropDetails(investorName, accountHolderName) {
  return (compareTwoStrings(investorName, accountHolderName) * 100)
}

function comparePennyDropStatusDetailsWithOCR(uploadChequeResponse, enteredIfscCode, enteredAccountNumber, ocrThresholdLimit) {
  let isAccountNumberMatched = false;
  let isIfscMatched = false;
  let enteredAccountNumberError = "Entered Account Number does not match with uploaded Cheque";
  let enteredIFSCError = "Entered IFSC does not match with uploaded Cheque";
  let ocrAccountNumberError = "Account Number cannot be fetched from uploaded cheque";
  let ocrIFSCError = "IFSC cannot be fetched from uploaded cheque. Please upload good quality cheque image.";

  if (uploadChequeResponse.status != 200) {
    return false
  }
  else {
    const result = uploadChequeResponse.data?.data?.result
    const accountNumberDetails = result && result.length ? result[0] : {}
    if (Object.keys(accountNumberDetails).length) {
      const { details: { account_number, ifsc_code } } = accountNumberDetails
      //checking if uploaded cheque is of good quality then only compare the entered values
      if (account_number && ifsc_code && (account_number.conf) > ocrThresholdLimit && ((ifsc_code.conf) > ocrThresholdLimit)) {
        enteredAccountNumberError = (account_number.value === enteredAccountNumber) ? "" : enteredAccountNumberError;
        enteredIFSCError = (ifsc_code.value === enteredIfscCode) ? "" : enteredIFSCError;
        ocrAccountNumberError = ((account_number.conf) > ocrThresholdLimit) ? "" : ocrAccountNumberError;
        ocrIFSCError = ((ifsc_code.conf) > ocrThresholdLimit) ? "" : ocrIFSCError;
        isIfscMatched = (ifsc_code.value === enteredIfscCode);
        isAccountNumberMatched = (account_number.value === enteredAccountNumber);
      }
    }
  }
  return ({ isAccountNumberMatched, isIfscMatched, enteredAccountNumberError, enteredIFSCError, ocrAccountNumberError, ocrIFSCError })
}


export { callPennyDropAPI, callStatusVerifyAPI, compareCkycDetailsWithPennyDropDetails, comparePennyDropStatusDetailsWithOCR };
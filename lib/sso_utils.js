// Function to simulate SSO User data. We can replace it with actual SSO user after implementing SSO auth
function setSSOUserData(key, value) {
  if (typeof window !== "undefined") {
    let userData = '{"userId":1, "firstName": "Prabhakar", "lastName": "Gadupudi", "middleName": "B", "panNumber": "APOPG8320A", "dateOfBirth": "01-JUL-1990", "mobileNumber": "7972262401", "emailId": "prabhakar.gadupudi@1silverbullet.tech", "communicationAddress": "S O MANOHAR LAL RAJORA HOUSE, NO 1149 WARD NO 23 DHANI, CHARKHAN PHOOLA DEVI SCHOOL, Bhiwani, Bhiwani, HR, IN", "communicationPinCode": "411004", "permanentAddress1": "S O MANOHAR LAL RAJORA HOUSE, NO 1149 WARD NO 23 DHANI","permanentAddress2":" CHARKHAN PHOOLA DEVI SCHOOL, Bhiwani, Bhiwani, HR, IN", "permanentPinCode": "411004","city":"pune","state":"maharastra","country":"india"}'
    sessionStorage.setItem("userData", userData)
  }
}

// Function to get SSO User Data stored in sessionStorage
function getSSOUserData() {
  setSSOUserData() // Function to simulate SSO User data. We can replace it with actual SSO user after implementing SSO auth
  let data = {}
  if (typeof window !== "undefined") {
    data = JSON.parse(sessionStorage.getItem('userData'))
  }
  return data
}

export { setSSOUserData, getSSOUserData };

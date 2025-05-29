import { useState } from "react";
import { omit } from "lodash";
import { MATURITY_INSTRUCTION, PNB_MATURITY_INSTRUCTION, TRIM_MONTHS } from "../constants";
import CryptoJS from "crypto-js";
import { rsa256AsymmetricEncryption, rsa256AsymmetricDecryption } from "../pages/api/rsa_256";
import { eventList } from "./eventTracker";
import appConfig from "../app.config";
import { pushEvents } from "../_connectors/captureEvent";
import { compareTwoStrings } from "string-similarity";

// Get Current Financial Year
function getFinancialYear(){
  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth();

  const fyStartYear = currentMonth >= 3 ? currentYear : currentYear - 1;
  const fyEndYear = fyStartYear + 1;

  return `${fyStartYear}-${fyEndYear}`;
}

//Is Given String is Valid URL
function isValidURL(str) {
  try {
    // Ensure the URL has a protocol
    const url = new URL(str);
    // Check that the protocol is valid (optional)
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch (e) {
    return false; // The string is not a valid URL
  }
}

// Function to getCkycDetails username after cKYC completion
function getCkycData() {
  let name = { "PERSONAL DETAILS": { FirstName: "" } };
  if (typeof window !== "undefined") {
    const productIdLocal = sessionStorage.getItem("selectedProductId");
    const productData = JSON.parse(sessionStorage.getItem(productIdLocal));
    if (productData?.CkycApiData) {
      const { CkycApiData } = productData;
      name = CkycApiData;
    }
  }
  return name;
}

// function to set item into sessionStorage object
function setSessionStorageItem(key, value) {
  if (typeof window !== "undefined") {
    sessionStorage.setItem(key, value);
  }
}

function validatePanCardNumber(panCardNumber) {
  var regex = /([A-Z]){5}([0-9]){4}([A-Z]){1}$/;
  return regex.test(panCardNumber.toUpperCase()) ? true : false;
}

function validateEnteredName(userName) {
  var regex = /[A-Za-z\s]{1,}[\.]{0,1}[A-Za-z\s]{0,}$/;
  return regex.test(userName) ? true : false;
}

//Function to display Amount in INR format
function displayINRAmount(amount) {
  let convertToIndianLocale = Intl.NumberFormat("en-IN");
  return convertToIndianLocale.format(amount);
}

function formatDate(d) {
  if (d) {
    var date = new Date(d);

    if (isNaN(date.getTime())) {
      return d;
    } else {
      let day = date.getDate();
      if (day < 10) {
        day = "0" + day;
      }
      return day + "-" + TRIM_MONTHS[date.getMonth()] + "-" + date.getFullYear();
    }
  } else {
    return "";
  }
}

function convertToUTC(date) {
  if (date != null) {
    let array = date.split("T");
    return array[0];
  }
}

function convertUTCToYYYY_MM_DD(enteredDate) {
  //Convert date to YYYY-MM-DD
  var convertEnteredDate = new Date(enteredDate),
    month = '' + (convertEnteredDate.getMonth() + 1),
    day = '' + convertEnteredDate.getDate(),
    year = convertEnteredDate.getFullYear();

  if (month.length < 2)
    month = '0' + month;
  if (day.length < 2)
    day = '0' + day;

  return [year, month, day].join('-');
}
const month = {
  "01": "Jan",
  "02": "Feb",
  "03": "Mar",
  "04": "Apr",
  "05": "May",
  "06": "Jun",
  "07": "Jul",
  "08": "Aug",
  "09": "Sept",
  10: "Oct",
  11: "Nov",
  12: "Dec",
};

function monthFormate(d) {
  if (d) {
    d = d.split("-");
    d = d[0] + "-" + month[d[1]] + "-" + d[2];
    return d;
  }
  return d;
}

// DD-MMM(month name)-YYYY
function dateFormat(date) {
  if (date) {
    const newDate = new Date(date);
    return newDate.getDate() + "-" + TRIM_MONTHS[newDate.getMonth()] + "-" + newDate.getFullYear();
  }
  return "";
}
//Hashed PAN
export const hashPAN = (panNumber) => {
  // Hash the PAN number using SHA-256
  const hashedPAN = CryptoJS.SHA256(panNumber).toString(CryptoJS.enc.Hex);
  return hashedPAN;  // Return the hashed PAN as a hex string
};

function handleInput(event) {
  const regex = /^[A-Za-z\s,0-9\-\.#]+$/;  // Allows English letters, spaces, numbers, commas, hyphens, periods, and hash symbol
  // Check if the input matches the address regex
  let value = event.target.value;

  if (value) {
    // If input is not a valid address or contains invalid characters, remove invalid characters
    event.target.value = value.replace(/[^A-Za-z\s,0-9\-\.#]/g, '');  // Remove characters that are not allowed
  }
}
//Rstrict Input Language to English
function handleInputAddress(event) {
  const regex = /^[A-Za-z\s,0-9\-\.#]+$/;  // Allows English letters, spaces, numbers, commas, hyphens, periods, and hash symbol

  // Regular expression for address (example: "C/O: John Doe, flat no 9 Midas Apartment, Mahesh Nagar")
  const addressRegex = /^(C\/O:\s?[A-Za-z\s]+,\s?flat\s?no\s?[0-9]+[A-Za-z\s]*,\s?[A-Za-z\s]+(?:,\s?[A-Za-z\s]+)*)$/;

  // Check if the input matches the address regex
  let value = event.target.value;

  if (!addressRegex.test(value)) {
    // If input is not a valid address or contains invalid characters, remove invalid characters
    event.target.value = value.replace(/[^A-Za-z\s,0-9\-\.#]/g, '');  // Remove characters that are not allowed
  }
}
// MM/yyyy
export function monthYearFormat(date) {
  if (date) {
    const newDate = new Date(date);
    return newDate.getMonth() + "/" + newDate.getFullYear();
  }
  return "";
}

// Date format will be -- dd mmm yyyy
export function dateWithSpace(date) {
  if (date) {
    const newDate = new Date(date);
    return newDate.getDate() + " " + TRIM_MONTHS[newDate.getMonth()] + " " + newDate.getFullYear();
  }
  return "";
}

// dd-mm-yyyy
export function dd_mm_yyyy_format(date) {
  if (!date) return "";

  // If date is a string in "DD-MM-YYYY" format, manually parse it
  if (typeof date === "string" && date.match(/^\d{1,2}-\d{1,2}-\d{4}$/)) {
    const parts = date.split("-");
    const dd = parseInt(parts[0], 10);
    const mm = parseInt(parts[1], 10) - 1;
    const yyyy = parseInt(parts[2], 10);

    // Create a valid date object
    date = new Date(yyyy, mm, dd);
  } else {
    date = new Date(date);
  }

  if (isNaN(date.getTime())) return ""; 

  let dd = date.getDate().toString().padStart(2, "0");
  let mm = (date.getMonth() + 1).toString().padStart(2, "0");
  let yyyy = date.getFullYear();

  return `${dd}-${mm}-${yyyy}`;
}

// "dd-mm-yyyy-hh-mm-ss"
export function dd_mm_yyyy_hh_mm_ss_format(date) {
  if (date) {
    const newDate = new Date(date);
    let mm = newDate.getMonth() + 1;
    let dd = newDate.getDate();
    let min = newDate.getMinutes();
    let hours = newDate.getHours();
    let sec = newDate.getSeconds();

    if (dd < 10) {
      dd = "0" + dd;
    }
    if (mm < 10) {
      mm = "0" + mm;
    }
    if (min < 10) {
      min = "0" + min;
    }
    if (hours < 10) {
      hours = "0" + hours;
    }
    if (sec < 10) {
      sec = "0" + sec;
    }
    return dd + "-" + mm + "-" + newDate.getFullYear() + "-" + hours + "-" + min + "-" + sec;
  }
  return "";
}

// "yyyy-mm-dd hh:mm:ss"
export function dd_mm_yyyy_hh_mm_ss_colon_format(date) {
  if (date) {
    const newDate = new Date(date);
    let mm = newDate.getMonth() + 1;
    let dd = newDate.getDate();
    let min = newDate.getMinutes();
    let hours = newDate.getHours();
    let sec = newDate.getSeconds();

    if (dd < 10) {
      dd = "0" + dd;
    }
    if (mm < 10) {
      mm = "0" + mm;
    }
    if (min < 10) {
      min = "0" + min;
    }
    if (hours < 10) {
      hours = "0" + hours;
    }
    if (sec < 10) {
      sec = "0" + sec;
    }
    return newDate.getFullYear() + "-" + mm + "-" + dd + " " + hours + ":" + min + ":" + sec;
  }
  return "";
}

export function changeTimeFormat(value) {
  let date = new Date(value);

  let hours = date.getHours();
  let minutes = date.getMinutes();
  let newformat = hours >= 12 ? 'PM' : 'AM';

  hours = hours % 12;

  hours = hours ? hours : 12;
  minutes = minutes < 10 ? '0' + minutes : minutes;

  return hours + ':' + minutes + ' ' + newformat;
}

// YYYY-MM-DD
function nomineeDateFormat(date) {
  if (date) {
    const newDate = new Date(date);
    return newDate.getFullYear() + "-" + Object.keys(month).sort()[newDate.getMonth()] + "-" + newDate.getDate();
  }
  return "";
}

function mmm_yy_DateFormat(enteredDate) {
  var processedDate = new Date(
    enteredDate.split("-")[0] + "/01/" + enteredDate.split("-")[1]
  );
  let finaldate = processedDate
    .toLocaleDateString("en-GB", { month: "short", year: "2-digit" })
    .replace(/ /g, "-");

  return finaldate;
}

function filterDropdown(arr) {
  let jsonShown = [];
  if (
    arr[0] == "High Safety" &&
    arr[1] == "High Yeild" &&
    arr[2] == "Balanced"
  ) {
    jsonShown = [
      { id: arr[0], title: "AAA { High Safety }" },
      { id: arr[2], title: "AA { Balanced }" },
      { id: arr[1], title: "A { High Yeild }" },
    ];
  } else {
    for (let i = 0; i < arr.length; i++) {
      const jsonGiving = {
        id: "",
        title: "",
      };
      jsonGiving.id = arr[i];
      jsonGiving.title = arr[i];
      jsonShown.push(jsonGiving);
    }
  }

  return jsonShown;
}

function calculateAge(dob) {
  if (dob) {
    if (!dob) return null; 
    const birthDate = new Date(dob);
    if (isNaN(birthDate.getTime())) return null;
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    if (
      today.getMonth() < birthDate.getMonth() ||
      (today.getMonth() === birthDate.getMonth() && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }
    return age;
  }
  }


// Draft storage details. These changes will be vanished after refresh
// These changes will be pushed to storageObject
function draftChanges(componentCache, currentComponentName, label, value) {
  if (componentCache.hasOwnProperty(currentComponentName)) {
    componentCache[currentComponentName][JSON.stringify(label)] = value;
  } else {
    componentCache[currentComponentName] = {};
    componentCache[currentComponentName] = { label: value };
  }
  return componentCache;
}

//Function for Form Validations
const useForm = (callback) => {
  //Form values
  const [values, setValues] = useState({});
  //Errors
  const [errors, setErrors] = useState({});
  const validate = (event, name, value) => {
    //A function to validate each input values

    switch (name) {
      case "username":
        if (value.length <= 4) {
          // we will set the error state

          setErrors({
            ...errors,
            username: "Username atleast have 5 letters",
          });
        } else {
          // set the error state empty or remove the error for username input

          //omit function removes/omits the value from given object and returns a new object
          let newObj = omit(errors, "username");
          setErrors(newObj);
        }
        break;

      case "email":
        if (
          !new RegExp(
            /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
          ).test(value)
        ) {
          setErrors({
            ...errors,
            email: "Enter a valid email address",
          });
        } else {
          let newObj = omit(errors, "email");
          setErrors(newObj);
        }
        break;
      case "pan":
        if (!new RegExp(/([A-Z]){5}([0-9]){4}([A-Z]){1}$/).test(value)) {
          setErrors({
            ...errors,
            pan: "Enter a valid PAN",
          });
        } else {
          let newObj = omit(errors, "pan");
          setErrors(newObj);
        }
        break;
      case "zip":
        if (!new RegExp(/^[1-9][0-9]{5}$/).test(value)) {
          setErrors({
            ...errors,
            zip: "Invalid ZIP code",
          });
        } else {
          let newObj = omit(errors, "zip");
          setErrors(newObj);
        }
        break;
      case "accountnumber":
        if (!new RegExp(/^\d{9,18}$/).test(value)) {
          setErrors({
            ...errors,
            accountnumber: "Invalid Account Number",
          });
        } else {
          let newObj = omit(errors, "accountnumber");
          setErrors(newObj);
        }
        break;
      case "ifsc":
        if (!new RegExp(/^[A-Z]{4}0[A-Z0-9]{6}$/).test(value)) {
          setErrors({
            ...errors,
            ifsc: "Invalid IFSC Code",
          });
        } else {
          let newObj = omit(errors, "ifsc");
          setErrors(newObj);
        }
        break;
      case "password":
        if (
          !new RegExp(/^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9]).{8,}$/).test(value)
        ) {
          setErrors({
            ...errors,
            password:
              "Password should contains atleast 8 charaters and containing uppercase,lowercase and numbers",
          });
        } else {
          let newObj = omit(errors, "password");
          setErrors(newObj);
        }
        break;

      default:
        break;
    }
  };

  //A method to handle form inputs
  const handleChange = (event) => {
    //To stop default events
    event.persist();

    let name = event.target.name;
    let val = event.target.value;

    validate(event, name, val);
    //Let's set these values in state

    setValues({
      ...values,
      [name]: val,
    });
  };

  const handleSubmit = (event) => {
    if (event) event.preventDefault();

    if (Object.keys(errors).length === 0 && Object.keys(values).length !== 0) {
      callback();
    } else {
      alert("There is an Error!");
    }
  };

  return {
    values,
    errors,
    handleChange,
    handleSubmit,
  };
};

function convertToTenor(tenor_val) {
  if (tenor_val > 0 && tenor_val < 30) {
    return Math.round(tenor_val) + " days";
  } else if (tenor_val >= 360) {
    return (
      Math.round(tenor_val / 360) +
      " year" +
      (Math.round(tenor_val / 360) > 1 ? "s" : "")
    );
  } else if (tenor_val > 29) {
    return (
      Math.round(tenor_val / 30) +
      " month" +
      (Math.round(tenor_val / 30) > 1 ? "s" : "")
    );
  }
  return Math.round(tenor_val);
}

function convertToNumberAbbreviations(depositAmount) {
  if (depositAmount >= 1000 && depositAmount < 100000) {
    return depositAmount / 1000 + "K";
  } else if (depositAmount == 100000) {
    return depositAmount / 100000 + " Lakh";
  } else if (depositAmount > 100000 && depositAmount < 10000000) {
    return depositAmount / 100000 + " Lakhs";
  } else if (depositAmount >= 10000000) {
    return depositAmount / 10000000 + "Cr";
  }

  return depositAmount;
}

const getFullName = (firstName, middleName, lastName) => {
  let fullName = firstName;
  if (firstName) {
    fullName = firstName;
  }
  if (middleName) {
    fullName = fullName + " " + middleName;
  }
  if (lastName) {
    fullName = fullName + " " + lastName;
  }
  return fullName?.trim();
}

export const maskAccountNumber = (input) => {
  if (input) {
    if (typeof input === "string") {
      return input.slice(0, -4).concat("XXXX")
    }
    if (typeof input === "number") {
      return JSON.stringify(input).slice(0, -4).concat("XXXX")
    }
  }
  return "";
}

export const trimText = (text) => {
  return text ? text.trim() : "";
}

export const charInput = (inputText) => {
  if (inputText !== "") {
    const filteredText = inputText.replace(/[^a-zA-Z]/g, '');
    return filteredText;
  }
  return "";
}

export const charInputWithSpace = (inputText) => {
  if (inputText !== "") {
    const filteredText = inputText.replace(/[^a-zA-Z ]/g, '');
    return filteredText;
  }
  return "";
}

export const charWithNumberInput = (inputText) => {
  if (inputText !== "") {
    const filteredText = inputText.replace(/[^a-zA-Z0-9]/g, '');
    return filteredText;
  }
  return "";
}

export const charWithNumberInputAndSpecChar = (inputText) => {
  if (inputText !== "") {
    const filteredText = inputText.replace(/[^a-zA-Z0-9^_^']/g, '');
    return filteredText;
  }
  return "";
}

export const emailInput = (inputText) => {
  if (inputText !== "") {
    const filteredText = inputText.replace(/[^a-zA-Z0-9^@^.^-^_^+]/g, '');
    return filteredText;
  }
  return "";
}

export const numberInput = (inputText) => {
  if (inputText !== "") {
    const filteredText = inputText.replace(/[^0-9]/g, '');
    return filteredText;
  }
  return "";
}

export const downloadReports = (data, type, fileName) => {
  const blob = new Blob([data], { type: type });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.setAttribute("href", url);
  a.setAttribute("download", fileName);
  a.click();
}

export const getSelectedDropdownList = (list) => {
  const selected = list.filter((option) => option.isSelected);
  return selected;
};

export const clearSelectedDropdownList = (list) => {
  list.length && list.forEach((option) => {
    if (option.isSelected) {
      option.isSelected = false;
    }
  });
  return list;
};

export const createURL = (paramName, list) => {
  let url = "";
  list.forEach((val) => {
    url = url + "&" + `${paramName}=` + val.title;
  });
  return url;
};

export const createURLWithID = (paramName, list) => {
  let url = "";
  list.forEach((val) => {
    url = url + "&" + `${paramName}=` + val.id;
  });
  return url;
};

export const interestRateDurationInMonth = (availableInterestValues) => {
  const duration = availableInterestValues ? availableInterestValues.split("-") : [];
  const length = duration.length;
  const durationInMonths = length ? length < 2 ? Math.round(parseInt(duration[0]) / 30) + " Months" : Math.round(parseInt(duration[0]) / 30) + "-" + Math.round(parseInt(duration[1]) / 30) + " " + "Months" : "";
  return durationInMonths;
}

export const getCustomerAddressDetails = () => {
  const productIdLocal = sessionStorage.getItem("selectedProductId");
  const address = {
    permanent_address1: "",
    permanent_zip: "",
    permanent_city: "",
    permanent_country: "",
    permanent_state: "",
  };
  if (productIdLocal && sessionStorage[productIdLocal]) {
    const { CkycApiData, customer_address } = JSON.parse(
      sessionStorage[productIdLocal]
    );
    if (CkycApiData && Object.keys(CkycApiData).length) {
      const { pidData } = CkycApiData;

      if (pidData) {
        const { permLine1, permLine2, permLine3, permState, permCountry, permPin, permCity } =
          pidData?.personalDetails;

        address.permanent_address1 = permLine1 || permLine2 || permLine3
          ? [permLine1, permLine2, permLine3].join(", ")
          : "";
        address.permanent_zip = permPin ? permPin : "";
        address.permanent_city = permCity ? permCity : "";
        address.permanent_state = permState ? permState : "";
        address.permanent_country = permCountry ? permCountry : "";
      } else if (customer_address && Object.keys(customer_address).length) {
        const { permanent_address1,
          permanent_zip,
          permanent_city,
          permanent_state,
          permanent_country } = customer_address;

        address.permanent_address1 = permanent_address1 ? permanent_address1 : "";
        address.permanent_zip = permanent_zip ? permanent_zip : "";
        address.permanent_city = permanent_city ? permanent_city : "";
        address.permanent_state = permanent_state ? permanent_state : "";
        address.permanent_country = permanent_country ? permanent_country : "";
      }
    } else if (customer_address && Object.keys(customer_address).length) {
      const { permanent_address1,
        permanent_zip,
        permanent_city,
        permanent_state,
        permanent_country } = customer_address;

      address.permanent_address1 = permanent_address1 ? permanent_address1 : "";
      address.permanent_zip = permanent_zip ? permanent_zip : "";
      address.permanent_city = permanent_city ? permanent_city : "";
      address.permanent_state = permanent_state ? permanent_state : "";
      address.permanent_country = permanent_country ? permanent_country : "";
    }
  }

  return address;
};

export const parseJwt = (token) => {
  var secretKey = "2WvtUL9RXdPFZEC_"
  try {
    const secret_key = CryptoJS.enc.Utf8.parse(secretKey)
    const iv = CryptoJS.enc.Utf8.parse('SgVkYp3s5v8y/B?E')
    const algo_mode = CryptoJS.mode.CBC
    var decrypted = CryptoJS.AES.decrypt(token, secret_key, { iv: iv, mode: algo_mode });
    var decrypted_jwt_token = decrypted.toString(CryptoJS.enc.Utf8)
    token = decrypted_jwt_token
    const base64 = token.split('.')[1].replace('-', '+').replace('_', '/');
    const parsedToken = JSON.parse(window.atob(base64));
    return parsedToken?.sub ? JSON.parse(parsedToken.sub) : {};
  } catch (error) {
    console.warn("Got an error while parsing JWT token", error)
    return {};
  }
}

export const getUserRole = () => {
  if (typeof window !== "undefined") {
    const token = sessionStorage.getItem('authorizationToken') ? sessionStorage.getItem('authorizationToken') : "";
    if (token) {
      const userData = token !== "" && parseJwt(token);
      const role = userData?.role?.toLowerCase();
      return role;
    }
    const agent_data = sessionStorage.getItem('agent_data');
    if (agent_data) {
      const { refreshToken } = JSON.parse(agent_data);
      const userData = refreshToken !== "" && parseJwt(refreshToken);
      const role = userData?.role?.toLowerCase();
      return role;
    }

    return "user"
  }
}

export const getUserType = () => {
  if (typeof window !== "undefined") {

    const role = getUserRole();

    if (role?.toLowerCase() === "agent" || role?.toLowerCase() === "rm") {
      return "rm";
    } else if (role?.toLowerCase() === "admin") {
      return "admin";
    } else if (role?.toLowerCase() === "familyhead") {
      return "user";
    } else {
      return "user";
    }
  } else {
    return "user";
  }
}

export const getRedirectionURL = (isSignOut = true) => {
  if (typeof window !== "undefined") {
    const userRole = getUserRole();
    const baseUrl = isSignOut ? appConfig.redirectionURL : appConfig.redirectionURL + "/products";
    let email = "";
    let isLogout = 0;
    let password = "";
    const familyHeadPassword = sessionStorage.getItem("familyHeadPassword");
    const familyDetails = sessionStorage.getItem("familyDetails");
    if (familyDetails) {
      const { userInfo } = JSON.parse(familyDetails);
      if (userInfo?.email_id) {
        email = userInfo.email_id;
      }
    }
    const isLoggedIn = sessionStorage.getItem("isAlreadyLoggedIn");
    if (familyHeadPassword) {
      password = familyHeadPassword;
    }
    if (isLoggedIn && userRole?.toLowerCase() === "familyhead") {
      const { isAlreadyLoggedIn } = JSON.parse(isLoggedIn);
      isAlreadyLoggedIn && (isLogout = 1);
    }
    return baseUrl ? `${baseUrl}/fdlogin?email=${email}&password=${password}&is_logout=${isLogout}` : "";
  }
  return "";
}

export const getJourneyType = () => {
  const role = getUserType();
  if (typeof window !== 'undefined') {
    if (role === "user") {
      sessionStorage.setItem("journeyType", "DIY");
      return "DIY";
    } else {
      sessionStorage.setItem("journeyType", "RM")
      return "RM";
    }
  }
};

export const isFeatureForRoleBaseOperation = (flagName) => {
  const featureFlag = JSON.parse(sessionStorage.getItem("featureFlag"));

  if (featureFlag && featureFlag[flagName]?.isEnabled) {
    const userRole = getUserRole();
    if (userRole && featureFlag[flagName]) {
      return featureFlag[flagName].enabledFor[userRole];
    }
  } else {
    return 0;
  }
}

export const isFeatureForRoleBaseSidebar = (featureFlagDetails, flagName) => {
  if (featureFlagDetails && featureFlagDetails[flagName]?.isEnabled) {
    const userRole = getUserRole();
    if (userRole && featureFlagDetails[flagName]) {
      return featureFlagDetails[flagName].enabledFor[userRole];
    }
  } else {
    return 0;
  }
}

const getMaturityInstruction = (props) => {
  let receivedMaturityInstruction = "";
  if (props?.maturityInstruction && typeof (props?.maturityInstruction) === 'string') {
    const { maturity_instruction } = JSON.parse(props?.maturityInstruction);
    receivedMaturityInstruction = maturity_instruction;
  }
  else if (props?.maturityInstruction && typeof (props?.maturityInstruction) === 'object') {
    const { maturity_instruction } = (props?.maturityInstruction);
    receivedMaturityInstruction = maturity_instruction;
  }
  else if (props?.componentData?.maturityInstruction && typeof (props?.componentData?.maturityInstruction) === 'string') {
    const { maturity_instruction } = JSON.parse(props?.componentData?.maturityInstruction);
    receivedMaturityInstruction = maturity_instruction;
  }
  else if (props?.componentData?.maturityInstruction && typeof (props?.componentData?.maturityInstruction) === 'object') {
    const { maturity_instruction } = (props?.componentData?.maturityInstruction);
    receivedMaturityInstruction = maturity_instruction;
  }

  const extractedMaturityValue = extractedMaturityInstructionValue(receivedMaturityInstruction);
  return extractedMaturityValue;
};

function extractedMaturityInstructionValue(receivedMaturityInstruction) {
  let selectedManufactureId = "";

  if (typeof window !== "undefined") {
    selectedManufactureId = sessionStorage.getItem("selectedManufactureId");
  }
  let maturityInstruction = "";
  let selectedInstruction = MATURITY_INSTRUCTION;

  if (selectedManufactureId?.toUpperCase() === "PNBHFC") {
    selectedInstruction = PNB_MATURITY_INSTRUCTION;
  }
  if (receivedMaturityInstruction === "A") {
    maturityInstruction = selectedInstruction.autoRedeem;
  } else if (receivedMaturityInstruction === "P") {
    maturityInstruction = selectedInstruction.renewPrincipal;
  } else if (receivedMaturityInstruction === "F") {
    maturityInstruction = selectedInstruction.renewPrincipalAndInterest;
  }
  return maturityInstruction;
}

export const encryptSessionKey = (sessionKey) => {
  const encrypted_session_key = rsa256AsymmetricEncryption(sessionKey);
  return encrypted_session_key;
}

export const decryptSessionKey = (sessionKey) => {
  const decrypted_session_key = rsa256AsymmetricDecryption(sessionKey);
  return decrypted_session_key;
}

export const getConcentText = (text, replace, replaceWith) => {
  let consentText = text;
  const replacedText = consentText.replace(replace, replaceWith);
  return replacedText;
}

export const moveSessionItemsToLocalStorage = () => {
  const sessionStorageKeys = Object.keys(sessionStorage);
  sessionStorageKeys.forEach((key) => {
    localStorage.setItem(key, sessionStorage[key]);
  });
}

export const moveLocalStorageItemsToSession = () => {
  const localStorageKeys = Object.keys(localStorage);
  localStorageKeys.forEach((key) => {
    if (!key.includes("WZRK") && !key.includes("FD_")) {
      sessionStorage.setItem(key, localStorage[key]);
      localStorage.removeItem(key);
    }
  });
}

export const handleEventLogger = (page, event, eventName, action) => {
  const distributorID = appConfig.distributorId;
  const list = eventList;
  if (distributorID && list[distributorID]) {
    if (list[distributorID]?.pages?.includes(page) && list[distributorID]?.events?.includes(event)) {
      pushEvents(eventName, action);
    }
  }
}

export function getCurrentDateTime() {
  const now = new Date();

  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');

  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
}

export const getValidData = (inputStr) => {
  if (inputStr) {
    return inputStr;
  }
}

export async function initializeClevertap() {
  const clevertapModule = await import('clevertap-web-sdk')

  clevertapModule.default.init("TEST-9W4-KK8-WZ7Z", "in1")
  clevertapModule.default.privacy.push({ optOut: false })
  clevertapModule.default.privacy.push({ useIP: false })
  clevertapModule.default.setLogLevel(3)

  return clevertapModule.default
}

export const replacePlaceholder = (placeholder, replaceWith, originalText) => {
  let updatedText = ""
  if (originalText) {
    updatedText = originalText.replace(placeholder, replaceWith)
  }
  return updatedText;
}

export const fuzzyLogicCompare = (stringOne, StringTwo) => {
  if (stringOne && StringTwo) {
    return (compareTwoStrings(stringOne, StringTwo) * 100)
  } else {
    return 0;
  }
}
//obfuscated  Phone Number
const obfuscatePhoneNumber = (phoneNumber) => {
  if (!phoneNumber) {
    return;
  }
  const lastDigit = phoneNumber.slice(7);
  const hideLength = 7;
  const obfuscatedMiddle = '*'.repeat(hideLength);

  return `${obfuscatedMiddle}${lastDigit}`;
}

//obfuscated Email ID
const obfuscateEmail = (email) => {
  if (!email) {
    return;
  }
  const [username, domain] = email.split('@');
  const domainParts = domain.split('.');

  if (username.length <= 3) {
    return `${username[0]}***@${domain}`;
  }

  const visibleChars = 2; // Number of visible characters from the start of the username
  const obfuscatedUsername = username.slice(0, visibleChars) + '*'.repeat(username.length - visibleChars);

  return `${obfuscatedUsername}@${domain}`;
}

//Generate Random Charactor
function generateRandomAlphaString(length = 16) {
  const chars = 'abcdefghijklmnopqrstuvwxyz';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

const checkUpiLimit = (paymentConfigurations, depositAmount) => {
  const upiLimit = paymentConfigurations.filter((item) => {
    if (item?.additionalConfiguration ) {
      if (item.purpose === "initiate_payment" && item?.additionalConfiguration["mode"] === "UPI") {
        return item;
      }
    }

  })

  if(upiLimit[0]?.active){
    if (depositAmount >= parseInt(upiLimit[0].additionalConfiguration.min) && depositAmount <= parseInt(upiLimit[0].additionalConfiguration.max)) {
      return true;
    }
    else {
      return false;
    }
  }

  else{
    return false;
  }

  
}

const checkNetBankingLimit = (paymentConfigurations, depositAmount) => {
  const NetbankingLimit = paymentConfigurations.filter((item) => {
    if (item?.additionalConfiguration) {
      if (item?.purpose === "initiate_payment" && item?.additionalConfiguration["mode"] === "Net banking") {
        return item;
      }
    }

  })
 if(NetbankingLimit[0].active){
  if (depositAmount >= parseInt(NetbankingLimit[0].additionalConfiguration.min) && NetbankingLimit[0].additionalConfiguration.max == "") {
    return true;
  }
  else if (depositAmount >= NetbankingLimit[0].additionalConfiguration.min && depositAmount <= NetbankingLimit[0].additionalConfiguration.max) {
    return true;
  }
  else {
    return false;
  }
 }
 else{
  return false
 }
  
}

function isMobile() {
  const ismobile= /Mobi|Android|iPhone|iPad|iPod|Windows Phone/i.test(navigator.userAgent);
  if(ismobile){
    return "Mobile"
  }
  else{
    return "Desktop"
  }
}

export {
  handleInput,
  handleInputAddress,
  getCkycData,
  setSessionStorageItem,
  monthFormate,
  dateFormat,
  nomineeDateFormat,
  displayINRAmount,
  formatDate,
  convertToUTC,
  validatePanCardNumber,
  filterDropdown,
  validateEnteredName,
  draftChanges,
  // useForm,
  convertToTenor,
  mmm_yy_DateFormat,
  convertToNumberAbbreviations,
  getFullName,
  calculateAge,
  convertUTCToYYYY_MM_DD,
  getMaturityInstruction,
  extractedMaturityInstructionValue,
  isValidURL,
  obfuscateEmail,
  obfuscatePhoneNumber,
  generateRandomAlphaString,
  checkUpiLimit,
  checkNetBankingLimit,
  isMobile,
  getFinancialYear
};

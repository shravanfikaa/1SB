import axios from "axios";
import appConfig from "../../app.config";
import { encryptSessionKey, getUserRole, getRedirectionURL } from "../../lib/util";
import { generate_secret_key } from "./secret_generator";
import { aes256_symmetric_decryption, aes256_symmetric_encryption } from "./aes_256";

export function redirectToLogin() {
  const href = window.location.href.toLowerCase();
  const journeyType = sessionStorage.getItem("journeyType");
  const role = getUserRole();

  if (role?.toLowerCase() === "familyhead") {
    if (appConfig?.redirectionURL) {
      window.location.href = appConfig?.redirectionURL;
    } else {
      window.location.href = window.origin + "/";
    }
  } else if (journeyType === "RM") {
    sessionStorage.removeItem("authorizationToken");
    window.location.href = window.origin + "/user/login";
  } else if (href.includes("after_review")) {
    sessionStorage.removeItem("authorizationToken");
    window.location.href = window.origin + "/product/product_list";
  } else {
    sessionStorage.removeItem("authorizationToken");
  }
}

function getAuthorizationHeader(tokenType) {
  const { distributorName, distributorId, xFrameOptions, xssProtection, contentSecurityPolicy, contentTypeOptions, strictTransportSecurity } = appConfig;
  let encrypted_session_key;

  if (sessionStorage.sessionKey) {
    encrypted_session_key = encryptSessionKey(sessionStorage.sessionKey);
  } else {
    encrypted_session_key = generate_secret_key();
    sessionStorage.sessionKey = encrypted_session_key;
  }

  const FD_JOURNEY_ID = localStorage.getItem("FD_JOURNEY_ID");
  const lang = sessionStorage.getItem("lang");
  const deviceSessionId = sessionStorage.getItem("deviceSessionId");
  const header = {
    "content-type": "application/json",
    "X-Frame-Options": xFrameOptions,
    "X-XSS-Protection": xssProtection,
    "Content-Security-Policy": contentSecurityPolicy,
    "X-Content-Type-Options": contentTypeOptions,
    "Strict-Transport-Security": strictTransportSecurity,
    distributorName,
    distributorId,
    sessionId: encrypted_session_key,
    journeyId: FD_JOURNEY_ID ? FD_JOURNEY_ID : "",
    lang: lang ? lang : "en",
  };
  deviceSessionId && (header.deviceSessionId = deviceSessionId);

  const getUserIdFromLocalStorage = sessionStorage.getItem("userId");

  if (typeof window !== "undefined" || !getUserIdFromLocalStorage) {
    let token = "";
    if (tokenType === "refreshToken") {
      token = sessionStorage.getItem("refreshToken") || "";
    } else {
      token = sessionStorage.getItem("authorizationToken") || "";
    }
    if (token && token.length > 10) {
      header.Authorization = "Bearer " + token;
    }
  }
  return header;
}

export function refreshToken() {
  getRefreshToken();
}

function GetApiHandler(url, method) {
  // const { encrypted_url, session_id } = encrypt_url(url);
  return axios({
    url: url,
    method: method,
    headers: getAuthorizationHeader("authToken")
  })
    .then(function (res) {
      if (res?.status == 401) {
        redirectToLogin();
      } else {
        const decrypted_response = decrypt_response(res);
        return decrypted_response;
      }
    })
    .catch((err) => {
      if (err?.response?.status == 401) {
        redirectToLogin();
      }
      const decrypted_response = decrypt_response(err.response);
      return decrypted_response;
    });
}
function encrypt_payload(payload) {
  const request_payload = {}
  let isEncryptEnabled = appConfig?.deploy?.end_to_end_encryption;
  if (isEncryptEnabled) {
    // const sessionKey = sessionStorage.getItem("sessionKey") ?
    //   sessionStorage.getItem("sessionKey") :
    //   generate_secret_key();
    //   debugger;
    // sessionStorage.sessionKey = sessionKey;

    const sessionKey = sessionStorage.getItem("sessionKey")
    console.debug("+++++++++++++++ request_payload:", request_payload)
    request_payload["payload"] = aes256_symmetric_encryption(sessionKey, payload)
    return request_payload;
  } else {
    return payload;
  }
}

function decrypt_response(responseData) {
  let isEncryptEnabled = appConfig?.deploy?.end_to_end_encryption;
  if (isEncryptEnabled) {
    if (responseData?.data?.payload) {
      const sessionKey = sessionStorage.getItem("sessionKey");
      const response = aes256_symmetric_decryption(responseData?.data?.payload, sessionKey)
      responseData.data = response
      return responseData;
    } else {
      return responseData;
    }
  } else {
    return responseData;
  }
}

function encrypt_url(url) {
  const request_query_param = {}
  // let isEncryptEnabled = appConfig?.deploy?.end_to_end_encryption;
  // if (isEncryptEnabled && url?.includes("?")) {
  //   const urlArr = url.split("?");
  // const { payload, session_id } = encrypt_payload(urlArr[1]);
  //   request_query_param.encrypted_url = url[0] + "?" + "payload=" + payload;
  //   request_query_param.session_id = session_id;
  //   return request_query_param;
  // } else {
  request_query_param.encrypted_url = url;
  request_query_param.session_id = "";
  return request_query_param;
  // }
}

function PostApiHandler(url, method, requestBody, contentType) {
  const headers = getAuthorizationHeader("authToken");

  // Ensure `url` is a string before calling includes()
  if (typeof url === "string" && (url.includes("/fd/commit") || url.includes("/agent/book_fd"))) {
    const UTMPARAMS = sessionStorage.getItem("UTMPARAMS");
    headers.UTMPARAMS = UTMPARAMS || JSON.stringify({});
  }

  if (contentType) 
    { 
      headers['Content-Type'] = contentType; 
     }

  return axios({
    url: url,
    method: method,
    data: typeof url === "string" && (url.includes("updatePaymentDetails") || url.includes("uploadCheque"))
      ? requestBody
      : encrypt_payload(requestBody),
      headers: headers, 
  })
    .then(function (res) {
      if (res?.status == 401) {
        redirectToLogin();
      } else {
        if (typeof url === "string" && (url.includes("updatePaymentDetails") || url.includes("uploadCheque"))) {
          return res;
        } else {
          const decrypted_response = decrypt_response(res);
          return decrypted_response;
        }
      }
    })
    .catch((err) => {
      if (err?.response?.status == 401) {
        redirectToLogin();
      }
      const decrypted_response = decrypt_response(err.response);
      return decrypted_response;
    });
}

function PutApiHandler(url, method, requestBody) {
  return axios({
    url: url,
    method: method,
    data: encrypt_payload(requestBody),
    headers: getAuthorizationHeader("authToken"),
  })
    .then(function (res) {
      if (res?.status == 401) {
        redirectToLogin();
      } else {
        const decrypted_response = decrypt_response(res);
        return decrypted_response;
      }
    })
    .catch((err) => {
      if (err?.response?.status == 401) {
        redirectToLogin();
      }
      const decrypted_response = decrypt_response(err.response);
      return decrypted_response;
    });
}

function PatchApiHandler(url, method, requestBody) {
  return axios({
    url: url,
    method: method,
    data: encrypt_payload(requestBody),
    headers: getAuthorizationHeader("authToken"),
  })
    .then(function (res) {
      if (res?.status == 401) {
        redirectToLogin();
      } else {
        const decrypted_response = decrypt_response(res);
        return decrypted_response;
      }
    })
    .catch((err) => {
      if (err?.response?.status == 401) {
        redirectToLogin();
      }
      const decrypted_response = decrypt_response(err.response);
      return decrypted_response;
    });
}

function DeleteApiHandler(url, method) {
  // const { encrypted_url, session_id } = encrypt_url(url);
  // console.log("encrypted_url", encrypted_url)
  return axios({
    url: url,
    method: method,
    headers: getAuthorizationHeader("authToken"),
  })
    .then(function (res) {
      if (res?.status == 401) {
        redirectToLogin();
      } else {
        const decrypted_response = decrypt_response(res);
        return decrypted_response;
      }
    })
    .catch((err) => {
      if (err?.response?.status == 401) {
        redirectToLogin();
      }
      const decrypted_response = decrypt_response(err.response);
      return decrypted_response;
    });
}

export function logout() {

  const logoutURL = appConfig?.deploy?.baseUrl + appConfig?.deploy?.logout;

  PostApiHandler(logoutURL, "post").then((response) => {
    redirectToLogin();
  })
}

function getRefreshToken() {

  const refreshTokenURL = appConfig?.deploy?.baseUrl + appConfig?.deploy?.refreshToken;

  GetApiHandler(refreshTokenURL, "GET").then((response) => {
    if (response?.data?.data?.new_access_token) {
      sessionStorage.setItem("tokenGenerationTime", Date.now());
      sessionStorage.setItem("authorizationToken", response?.data?.data?.new_access_token)
    }
  }).catch((err) => {
    console.error(err);
    return err;
  });
}

export { PostApiHandler, GetApiHandler, PutApiHandler, PatchApiHandler, DeleteApiHandler };

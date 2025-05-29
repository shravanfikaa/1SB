
const encryption_feature_flag = true
const communication_established_list = ["http://127.0.0.1/login", "http://127.0.0.1/login_form"]

/**
 * Axios interceptor that encrypts the request payload if encryption_feature_flag is true
 * and the request URL is in the communication_established_list.
 * @param {Object} request - the request object
 * @returns {Object} - the modified request object
 */
axios.interceptors.request.use(request => {
    var exist_flag = communication_established_list.includes(request.url);
    var request_payload = {}
    // console.log("request Params-->",request.params);
    if (encryption_feature_flag && exist_flag) {
        const secret_generator = new SecretGenerator();
        sessionStorage["secret_key"] = secret_generator.generate_secret_key();
        const rsa_256 = new RSA256AsymmetricEncryption();
        var request_payload = {
            "session_id": rsa_256.rsa_256_encrypt(sessionStorage.secret_key)
        };

    }
    var aes_256 = null
    if (encryption_feature_flag) {
        console.log("local storage secret key-->", sessionStorage.secret_key);
        aes_256 = new AES256SymmetricEncryption(sessionStorage.secret_key);
    }

    if (request.params != null) {
        var query_params = request.params.query_params;
        var path_params = request.params.path_params;
        console.log("query params-->", query_params);
        console.log("path_params -->", path_params);

        request.params = query_params;
        if (encryption_feature_flag && query_params != null) {
            request.params = { "payload": aes_256.aes_256_encrypt(query_params) };
        }

        if (path_params != null) {
            url = request.url
            for (let key in path_params) {
                encrypt_params = path_params[key];
                if (encryption_feature_flag) {
                    var encrypt_params = aes_256.aes_256_encrypt(path_params[key]);
                }
                url = url.replace('{' + key + '}', encrypt_params)
            }
            request.url = url;
        }
    }
    if (encryption_feature_flag && request.data != null) {
        request_payload["payload"] = aes_256.aes_256_encrypt(request.data);
        request["data"] = request_payload
    }
    console.log(request);
    return request;
});



/**
 * Axios interceptor that decrypts the response data if encryption feature flag is enabled.
 * @param {Object} response - The response object from the API call.
 * @returns The response object with decrypted data if encryption feature flag is enabled.
 */
axios.interceptors.response.use(response => {
    if (encryption_feature_flag && response.status == 200) {
        console.log("api Response-->", response);
        const aes_256 = new AES256SymmetricEncryption(sessionStorage.secret_key);
        response["data"] = aes_256.aes_256_decrypt(response.data.payload);
    }
    return response;
});
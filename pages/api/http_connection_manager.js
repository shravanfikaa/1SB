
/**
 * Manages an HTTP connection with the given URL, method, headers, request JSON data, and query parameters.
 * @class
 * @param {string} http_url - The URL of the HTTP connection.
 * @param {string} http_method - The HTTP method to use for the connection.
 * @param {Object} [headers=null] - The headers to include in the HTTP request.
 * @param {Object} [request_json_data=null] - The JSON data to include in the HTTP request.
 * @param {Object} [query_params=null] - The query parameters to include in the HTTP request.
 */
class HTTPConnectionManager{
    constructor(http_url,http_method,headers=null,request_json_data=null,
                params=null) {
        this.http_url=http_url
        this.http_method=http_method
        this.headers= headers
        this.request_json_data=request_json_data,
        this.params=params       
    }
    
    /**
     * Makes an HTTP request using the specified method, URL, request data, headers, and query parameters.
     * @async
     * @returns {Promise} A Promise that resolves with the response data if the request is successful, or rejects with an error if the request fails.
     */
    async make_http_request(){
        // console.log("request payload-->",this.request_json_data)
        var response = await axios({
            method: this.http_method,
            url: this.http_url,
            data: this.request_json_data,
            headers:this.headers,
            params: this.params,

          });
          if (response.status === 200) {
            console.log("Request successful");
          } else {
              console.log("Error occurred!");
          }
        // console.log("response payload-->",response.data)
        return response.data;
    }

}

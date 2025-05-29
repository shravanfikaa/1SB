import { GetApiHandler, PostApiHandler } from "../pages/api/apihandler";

export default class DataHandler {
  constructor(apiUrl) {
    this.apiUrl = apiUrl;
  }

  async saveData(data) {
    try {
      const responseData = await PostApiHandler(this.apiUrl, "Post", data)
        .then((res) => {
          return res;
        });
      return await responseData;
    } catch (error) {
      console.error('Error saving data:', error);
    }
  }

  async fetchData(data) {
    try {
      const responseData = await GetApiHandler(this.apiUrl + `${data.fdApplicationNumber ? `?fd_application_number=${data.fdApplicationNumber}` : ""}${data.page_name ? `&page_name=${data.page_name}` : ""}`, "get")
        .then((res) => {
          return res;
        });
      return await responseData;
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  }
}

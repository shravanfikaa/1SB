import appConfig from "../app.config";
import { GetApiHandler } from "../pages/api/apihandler";

export const fetchManufacturerProperties = async (productManufacturerId) => {
	const getURL = () => {
		const url =
			appConfig?.deploy?.baseUrl +
			appConfig?.deploy?.manufacturerProfile +
			productManufacturerId;
		return url;
	}

	try {
		const response = await GetApiHandler(getURL(), "GET");
		return await response;
	} catch (error) {
		return {
			data: {
				errors: [{ errorMessage: "Got Error while fetching manufacturer profile details:" }]
			}
		}
	}
}
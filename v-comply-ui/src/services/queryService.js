import axios from "axios";
import appConfig from "./config";

class QueryService {

    retryCount = 5;
    _apiEndpoint = appConfig.API_URL;

    constructor(API = appConfig.API_URL) {
        this._apiEndpoint = API;
    }

    getConfig = () => {
        return {
            headrs: {
                "Content-Type": "application/json",
                "Accept": "application/json",
            },
            data: {},
        };
    }

    /**
     * Base query to make calls to the backend
     * @param {string} relativeURL - the extended URL to be called
     * @param {string} method - the http method to be executed - default to GET
     * @param {any} payload - the payload in cases of post request
     * @param {any} callback - the callback method that is optional in case, needs to be executed after the call
     * @param {any} configOverWrite - any overwite of the default configs
     *
     * @returns {Promise} - a promise object for resolving from the caller function
     */
    runQuery = (
        relativeURL,
        method = "GET",
        payload = {},
        callback = () => {},
        configOverWrite = {},
    ) => {
        const config = {...this.getConfig(), ...configOverWrite};
        // Initializing the promise
        let axiosPromise;

        if (method === "GET") {
            axiosPromise = axios.get(this._apiEndpoint + relativeURL, config);
        } else if (method === "POST") {
            axiosPromise = axios.post(this._apiEndpoint + relativeURL, payload, config);
        } else if (method === "DELETE") {
            axiosPromise = axios.delete(this._apiEndpoint + relativeURL, config);
        } else {
            axiosPromise = new Promise((resolve, reject) => {
                reject("Unknown method used to make API call");
            });
        }

        return axiosPromise.then((data) => {
            if (callback) {
                callback();
            }
            return data;
        })
        .catch((err) => {
            let errorMessage = "Error in Request";
            if (err.message === "Network Error") {
                const networErrorDisplayMessage = `
                Not connected to the server.
                Please check your internet connection.
                Or, contact the system administrator`;
                // No Connection to the server
                errorMessage = err.message;
                alert(networErrorDisplayMessage);
            }
            throw new Error(errorMessage);
        });
    }
}

export default QueryService;

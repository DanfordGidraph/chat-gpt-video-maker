const AxiosLogger = require("axios-logger")
const { CookieJar } = require('tough-cookie')
const axios = require("axios")
const { wrapper } = require('axios-cookiejar-support')

const httpRequest = async (url, method, params, headers, bearer_token = null, basic_token = null, extraOptions, { logData = true, logHeaders = true } = {}) => {
    AxiosLogger.setGlobalConfig({
        prefixText: "Axios Logger",
        dateFormat: "HH:MM:ss",
        data: logData,
        headers: logHeaders,
        method: true,
        url: true,
        status: true,
    });
    const axiosInstance = wrapper(axios.create({ jar: new CookieJar() }))
    axiosInstance.interceptors.request.use(AxiosLogger.requestLogger, AxiosLogger.errorLogger);
    axiosInstance.interceptors.response.use(AxiosLogger.responseLogger, AxiosLogger.errorLogger);

    const options = { method, url, ...extraOptions };
    if (params) options[method === "GET" ? "params" : "data"] = params;
    if (headers) options.headers = { ...options.headers, ...headers };
    if (bearer_token) options.headers.Authorization = `Bearer ${bearer_token}`;
    if (basic_token) options.headers.Authorization = `Basic ${basic_token}`;

    return axiosInstance.request(options)
        // .then(resp => { console.log("Axios Response: ", resp); return resp })
        .then((response) => ({ statusCode: response.status, body: response.data, headers: response.headers }))
        .catch((error) => {
            if (error.response) return ({ statusCode: error.response.status, body: error.response.data, error });
            else if (error.isAxiosError) return ({ statusCode: 999, body: { message: error.request.response || "HTTP Client Error", error } });
            else return ({ statusCode: 999, body: { message: "message" in error ? error.message : "Error did not have a message", error } });
        });
};

module.exports = httpRequest 

import axios from "axios";

const axiosInstance = axios.create({
    // baseURL: "http://192.168.0.129:8000/",
    // baseURL: "http://192.168.1.40:8000",
    // baseURL: "http://192.168.0.186:8000",
    baseURL: "https://cyberverse.co.in/",
    maxContentLength: Infinity,
    maxBodyLength: Infinity
});

export default axiosInstance;

import axios from "axios";

const API = axios.create({
    baseURL: "http://localhost:8000/api"
});


API.interceptors.request.use(
    (config) => {

        const token =
            localStorage.getItem(
                "freshledgerToken"
            );

        if (token) {

            config.headers.Authorization =
                `Bearer ${token}`;
        }

        return config;
    },

    (error) => {
        return Promise.reject(error);
    }
);


export default API;
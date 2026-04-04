import axios from "axios";
import { ENV } from "../config/env";
import { store } from "../store/store";

export const axiosInstance = axios.create({
    baseURL: ENV.API_BASE_URL,
    headers: {
        "Content-Type": "application/json",
    },
});

// Attach token from Redux store if present
axiosInstance.interceptors.request.use((config) => {
    const token = store.getState().auth.token;

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
});

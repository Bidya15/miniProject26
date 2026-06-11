import axios from "axios";

const API_URL = import.meta.env.VITE_API_BASE_URL || "/api";

const api = axios.create({
    baseURL: API_URL,
    headers: {
        "Content-Type": "application/json",
    },
});

// Request interceptor: attach JWT token
api.interceptors.request.use(
    (config) => {
        const token = sessionStorage.getItem("token");
        if (token) {
            config.headers["Authorization"] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor: handle expired / invalid JWT (401)
api.interceptors.response.use(
    (response) => response,
    (error) => {
        const status = error?.response?.status;
        if (status === 401) {
            // Token expired or invalid — clear session and redirect to home
            sessionStorage.removeItem("token");
            sessionStorage.removeItem("user");
            // Reload the page so context resets and the user sees the login screen
            window.location.href = "/";
        }
        return Promise.reject(error);
    }
);

export default api;

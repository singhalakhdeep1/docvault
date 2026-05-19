import axios from "axios";

export const apiClient = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000",
    headers: { "Content-Type": "application/json" },
});

// Attach JWT from localStorage (client-side only)
if (typeof window !== "undefined") {
    apiClient.interceptors.request.use((config) => {
        const token = localStorage.getItem("docsvault_token");
        if (token) config.headers.Authorization = `Bearer ${token}`;
        return config;
    });

    apiClient.interceptors.response.use(
        (res) => res,
        (err) => {
            if (err.response?.status === 401) {
                localStorage.removeItem("docsvault_token");
                localStorage.removeItem("docsvault_user");
                window.location.href = "/login";
            }
            return Promise.reject(err);
        },
    );
}

export default apiClient;

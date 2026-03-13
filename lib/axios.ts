import axios from "axios";

export const API_URL = "https://delivery.api.caremallonline.com/api/v1";

const axiosInstance = axios.create({
    baseURL: API_URL,
});

axiosInstance.interceptors.request.use(
    (config) => {
        if (typeof window !== "undefined") {
            const storage = localStorage.getItem("delivery-auth-storage");
            let token: string | null = null;

            if (storage) {
                try {
                    const parsed = JSON.parse(storage);
                    token = parsed?.state?.token ?? null;
                } catch (err) {
                    console.error("Failed to parse delivery-auth-storage:", err);
                }
            }

            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        }

        return config;
    },
    (error: string) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
    (response) => response,
    (error) =>
        Promise.reject(
            (error.response && error.response.data) || "Something went wrong"
        )
);

export default axiosInstance;

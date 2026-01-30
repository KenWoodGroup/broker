// src/api/axios.js
import axios from "axios";
import Cookies from "js-cookie";
import { useAuthStore } from "../../store/authStore";
import { toastService } from "../toast";
import handleApiError from "./handleError";

export const BASE_URL = "https://api.usderp.uz/crm";

export const $api = axios.create({
    baseURL: `${BASE_URL}/api`,
    // headers: { "Content-Type": "application/json" },
});

/* ===============================
   GLOBAL REFRESH STATE
================================ */
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
    failedQueue.forEach(prom => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });
    failedQueue = [];
};

/* ============================
   REQUEST INTERCEPTOR
=============================== */
$api.interceptors.request.use(
    (config) => {
        const token = Cookies.get("token");

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        toastService.error("So'rov yuborishda xatolik!")
        return Promise.reject(error)
    }
);

/* ============================
   RESPONSE INTERCEPTOR
   + Refresh token
   + Retry
=============================== */
$api.interceptors.response.use(
    (response) => {
        if (response.config?.showSuccessToast) {
            toastService.success(response.config.showSuccessToast);
        }
        return response;
    },

    async (error) => {
        const originalRequest = error.config;
        const store = useAuthStore.getState();

        // Refresh required
        if (error.response?.status === 401 && !originalRequest._retry) {
            // if refreshing wait
            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    failedQueue.push({
                        resolve: (token) => {
                            originalRequest.headers.Authorization = 'Bearer ' + token;
                            resolve($api(originalRequest));
                        },
                        reject,
                    });
                });
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try {
                const refreshToken = Cookies.get("refresh_token");
                const userId = Cookies.get("user_id");

                if (!refreshToken || !userId) {
                    throw new Error("Refresh token yoki user ID topilmadi");
                }

                // ---- Refresh request ----
                const res = await axios.post(`${BASE_URL}/api/auth/refresh`, {
                    refreshToken,
                    userId,
                });

                const newAccess = res.data.access_token;
                const newRefresh = res.data.refresh_token;

                // ---- Save new tokens ----
                store.setTokens({
                    token: newAccess,
                    refreshToken: newRefresh,
                });

                $api.defaults.headers.Authorization = `Bearer ${newAccess}`;

                // Continue CRUDs in process queue
                processQueue(null, newAccess);

                // ---- Retry original request ----
                originalRequest.headers.Authorization = `Bearer ${newAccess}`;
                return $api(originalRequest);
            } catch (err) {
                // Clear auth + redirect
                processQueue(err, null);
                toastService.error("Sessiya tugadi. Iltimos qayta kiring.")
                store.logout();
                window.location.href = "/login";
                return Promise.reject(err);
            }finally {
                isRefreshing = false
            }
        }
        /* ============================
           GLOBAL ERROR HANDLING
           =============================== */
        handleApiError(error)
        return Promise.reject(error);
    }
);

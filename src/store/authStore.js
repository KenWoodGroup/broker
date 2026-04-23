// src/store/authStore.js
import { create } from "zustand";
import Cookies from "js-cookie";

const COOKIE_OPTIONS = { expires: 7 }; // 7 kun saqlanadi

export const useAuthStore = create((set, get) => ({
    token: Cookies.get("token") || null,
    refreshToken: Cookies.get("refresh_token") || null,
    userId: Cookies.get("user_id") || null,
    user: Cookies.get("user") ? JSON.parse(Cookies.get("user")) : null,

    login: ({ user }) => {
        // Cookies.set("token", token);
        // Cookies.set("refresh_token", refreshToken);
        Cookies.set("user_id", user.id);
        Cookies.set("user", JSON.stringify(user));

        set({ userId: user.id, user });
    },

    setTokens: ({ token, refreshToken }) => {
        if (token) {
            Cookies.set("token", token);
            set({ token });
        }
        if (refreshToken) {
            Cookies.set("u_refresh_token", refreshToken);
            set({ refreshToken });
        }
    },

    logout: () => {
        Cookies.remove("token");
        Cookies.remove("u_refresh_token");
        Cookies.remove("user_id");
        Cookies.remove("user");
        set({ token: null, refreshToken: null, userId: null, user: null });
    },

    // ✅ Funksiya emas, to'g'ridan-to'g'ri state'dan o'qiladi
    get isAuthenticated() {
        return !!get().token;
    },
}));
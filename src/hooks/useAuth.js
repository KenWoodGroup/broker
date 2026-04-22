// src/hooks/useAuth.js
import { useAuthStore } from "../store/authStore";

export const useAuth = () => {
    const loginToStore = useAuthStore((s) => s.login);
    const logoutFromStore = useAuthStore((s) => s.logout);
    
    // ✅ Boolean sifatida olinadi
    const isAuthenticated = useAuthStore((s) => !!s.token);
    const user = useAuthStore((s) => s.user);

    const login = ({ token, refreshToken, user }) => {
        loginToStore({ token, refreshToken, user });
    };

    const logout = () => {
        logoutFromStore();
        window.location.href = "/login";
    };

    return { login, logout, isAuthenticated, user };
};
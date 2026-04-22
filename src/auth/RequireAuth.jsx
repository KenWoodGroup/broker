// src/auth/RequireAuth.jsx
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuthStore } from "../store/authStore";

export default function RequireAuth({ role }) {
    const isAuth = useAuthStore((s) => s.token);
    const { user } = useAuthStore()
    const location = useLocation();
    const permissionKey = (r) => {
        switch (r) {
            case "super_admin":
                return "SuperAdmin";
            case "broker":
                return "Broker";
            case "admin":
                return "Admin"
            case "lot_creator":
                return "LotCreator"
            case "operator":
                return "operator"
            case "supplier":
                return "Supplier"
        }
    }
    if (!isAuth || role !== permissionKey(user?.role)) {
        return <Navigate to="/login" replace state={{ from: location }} />;
    }

    return <Outlet />;
}

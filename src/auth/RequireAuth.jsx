// src/auth/RequireAuth.jsx
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuthStore } from "../store/authStore";

export default function RequireAuth({role}) {
    const isAuth = useAuthStore((s) => s.isAuthenticated());
    const {user} = useAuthStore()
    const location = useLocation();
    const permissionKey = (r)=> {
        switch(r) {
            case "super_admin":
                return "SuperAdmin";
            case "broker" :
                return "Broker";
            case "admin" :
                return "Admin"
            case "sales_rep" :
                return "sales_rep"
        }
    }
    if (!isAuth || role !== permissionKey(user?.role)) {
        return <Navigate to="/login" replace state={{ from: location }} />;
    }

    return <Outlet />;
}

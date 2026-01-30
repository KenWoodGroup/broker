import { useEffect } from "react";
import { useAuthStore } from "../../store/authStore";
import { useTauth } from "../../hooks/useTauth";

const ROLE_TITLE_KEYS = {
    super_admin: "title.super_admin",
    admin: "title.admin",
};

export default function TitleManager() {
    const t = useTauth();
    const role = useAuthStore((s) => s.user?.role);

    useEffect(() => {
        const titleKey = ROLE_TITLE_KEYS[role];
        document.title = titleKey
            ? t(titleKey)
            : "System | USD";
    }, [role, t]);

    return null;
}

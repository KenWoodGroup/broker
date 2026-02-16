import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export default function BRMapRedirect() {
    const location = useLocation();

    useEffect(() => {
        if (location.pathname === "/operator/map") {
            window.location.href = "https://api.usderp.uz/dshk/";
        }
    }, [location.pathname]);

    return null; // эч нарса кўрсатмайди, фақат redirect қилади
}

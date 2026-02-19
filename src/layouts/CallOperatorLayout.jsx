import { Outlet } from "react-router";
import Sidebar from "../components/common/Sidebar";
import { Box } from "@chakra-ui/react";
import { useUIStore } from "../store/useUIStore";
import { Home, Inbox, Building2, BoxIcon } from "lucide-react";

const links = [
    { label: "Home", to: "/call-operator/dashboard", icon: Home },
    { label: "Offers", to: "/call-operator/offers", icon: Inbox },
    { label: "Qurilish obektlari", to: "/call-operator/company", icon: BoxIcon },
    // { label: "Minicategories", to: "/minisubcategories", icon: Settings },
    // { label: "Products", to: "/products", icon: Boxes },
];

export default function CallOperatorLayout() {
    const { collapsed } = useUIStore();
    return (
        <Box>
            <Sidebar collapsed={collapsed} links={links} />
            <Box
                pl={collapsed ? "90px" : "260px"}
                transition="0.25s ease"
                minH="100vh"
            >
                <Outlet />
            </Box>
        </Box>
    )
}
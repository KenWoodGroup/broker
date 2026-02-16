import { Outlet } from "react-router";
import Sidebar from "../components/common/Sidebar";
import { Box } from "@chakra-ui/react";
import { useUIStore } from "../store/useUIStore";
import { Home, Inbox, Building2 } from "lucide-react";

const links = [
    { label: "Home", to: "/operator", icon: Home },
    { label: "Offers", to: "/operator/offers", icon: Inbox },
    { label: "Company", to: "/operator/company", icon: Building2 },
    { label: "Map", to: "https://api.usderp.uz/dshk/", icon: Building2 },
    // { label: "Minicategories", to: "/minisubcategories", icon: Settings },
    // { label: "Products", to: "/products", icon: Boxes },
];

export default function BrokerLayout() {
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
import { Outlet } from "react-router";
import Sidebar from "../components/common/Sidebar";
import { Box } from "@chakra-ui/react";
import { useUIStore } from "../store/useUIStore";
import { Home, Inbox, Building2, Map, Search } from "lucide-react";

const links = [
    { label: "Home", to: "/operator", icon: Home, end: true },
    { label: "Offers", to: "/operator/offers", icon: Inbox, end: false },
    { label: "Map", to: "https://api.usderp.uz/dshk/", icon: Map, end: true },
    { label: "Search", to: "/operator/search", icon: Search },
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
};
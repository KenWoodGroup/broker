import { Outlet } from "react-router";
import Sidebar from "../components/common/Sidebar";
import { useUIStore } from "../store/useUIStore";
import { BoxIcon, Factory, Home, Settings, Settings2, User2 } from "lucide-react";
import { Box } from "@chakra-ui/react";

const links = [
    { label: "Home", to: "/", icon: Home },
    { label: "Factory", to: "/factories", icon: Factory },
    { label: "Companies", to: "/companies", icon: BoxIcon },
    { label: "Operatorlar", to: "/operators", icon: User2 },
    { label: "Opsiyalar", to: "/options", icon: Settings2 },
    // { label: "Products", to: "/products", icon: Boxes },
];

export default function AdminLayout() {
    const { collapsed } = useUIStore();
    return (
        <Box>
            <Sidebar collapsed={collapsed} links={links} />
            <Box
                pl={collapsed ? "100px" : "270px"}
                transition="0.25s ease"
                minH="100vh"
            >
                <Outlet />
            </Box>
        </Box>
    )
}
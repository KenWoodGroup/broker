import { Outlet } from "react-router";
import Sidebar from "../components/common/Sidebar";
import { useUIStore } from "../store/useUIStore";
import { BoxIcon, Factory, Headset, Home, Settings, Settings2, User, User2 } from "lucide-react";
import { Box } from "@chakra-ui/react";

const links = [
    { label: "Home", to: "/", icon: Home },
    { label: "Factory", to: "/factories", icon: Factory },
    { label: "Companies", to: "/companies", icon: BoxIcon },
    { label: "Opsiyalar", to: "/options", icon: Settings2 },
    { label: "Operatorlar", to: "/operators", icon: Headset },
    { label: "Brokerlar", to: "/brokers", icon: User, end: true },
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
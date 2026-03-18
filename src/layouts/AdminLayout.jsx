import { Outlet } from "react-router";
import Sidebar from "../components/common/Sidebar";
import { useUIStore } from "../store/useUIStore";
import { Building2, Factory, Home, Settings2, Users2 } from "lucide-react";
import { Box } from "@chakra-ui/react";

const links = [
    { label: "Home", to: "/", icon: Home },
    // { label: "Operatorlar", to: "/operators", icon: Headset },
    // { label: "Brokerlar", to: "/brokers", icon: User, end: true },
    { label: "Hodimlar", to: "/roles", icon: Users2, end: false },
    { label: "Factory", to: "/factories", icon: Factory },
    { label: "Companies", to: "/companies", icon: Building2 },
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
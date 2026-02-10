import { Outlet } from "react-router";
import Sidebar from "../components/common/Sidebar";
import { Box } from "@chakra-ui/react";
import { useUIStore } from "../store/useUIStore";
import { Factory, Home, LucideTarget } from "lucide-react";

const links = [
    { label: "Home", to: "/", icon: Home },
    { label: "Factory", to: "/factories", icon: Factory },
    { label: "Qurilish kompaniyalari", to: "/company", icon: Factory },
    // { label: "Options", to: "/options", icon: LucideTarget },
    // { label: "Minicategories", to: "/minisubcategories", icon: Settings },
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
import { Outlet } from "react-router";
import Sidebar from "../components/common/Sidebar";
import { Box } from "@chakra-ui/react";
import { useUIStore } from "../store/useUIStore";
import { Headset, Home, Shield, ShieldCheck, Users2 } from "lucide-react";

const links = [
    { label: "Home", to: "/superadmin", icon: Home },
    { label: "Managers", to: "/superadmin/managers", icon: ShieldCheck },
    { label: "Operators", to: "/superadmin/operators", icon: Headset },
    // { label: "Minicategories", to: "/minisubcategories", icon: Settings },
    // { label: "Products", to: "/products", icon: Boxes },
];

export default function SuperAdminLayout() {
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
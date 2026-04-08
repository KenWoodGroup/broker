import { Outlet } from "react-router";
import Sidebar from "../components/common/Sidebar";
import { Box } from "@chakra-ui/react";
import { useUIStore } from "../store/useUIStore";
import { Home, Inbox, Building2, BoxIcon, Settings, ListOrdered } from "lucide-react";

const links = [
    { label: "Qurilish kompaniyalar", to: "/call-operator/company", icon: BoxIcon },
    { label: "Buyurtmalar", to: "/call-operator/orders", icon: ListOrdered },
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
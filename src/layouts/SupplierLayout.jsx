import { Outlet } from "react-router";
import Sidebar from "../components/common/Sidebar";
import { Box } from "@chakra-ui/react";
import { useUIStore } from "../store/useUIStore";
import {  Boxes, Factory, Home } from "lucide-react";

const links = [
    { label: "Home", to: "/supplier", icon: Home, end:true },
    { label: "Zavod", to: "/supplier/factories", icon: Factory, },
    { label: "Mahsulot", to: "/supplier/products", icon: Boxes },
    // { label: "Products", to: "/products", icon: Boxes },
];

export default function SupplierLayout() {
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
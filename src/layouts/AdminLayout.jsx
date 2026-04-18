import { Outlet } from "react-router";
import Sidebar from "../components/common/Sidebar";
import { useUIStore } from "../store/useUIStore";
import { Building2, ClipboardPen, Factory, Home, PackageSearch, Settings2, Users2 } from "lucide-react";
import { Box } from "@chakra-ui/react";

const links = [
    { label: "Bosh sahifa", to: "/", icon: Home },
    // { label: "Operatorlar", to: "/operators", icon: Headset },
    // { label: "Brokerlar", to: "/brokers", icon: User, end: true },
    { label: "Xodimlar", to: "/roles", icon: Users2, end: false },
    { label: "T-zavodlar", to: "/lead-factory", icon: Factory },
    { label: "Zavodlar", to: "/factories", icon: Factory },
    { label: "Qurilish kompaniyalar", to: "/companies", icon: Building2 },
    { label: "Buyurtmachilar", to: "/customers", icon: Building2 },
    { label: "Lotlar", to: "/lots", icon: PackageSearch },
    { label: "Vazifalar", to: "/tasks", icon: ClipboardPen },
    { label: "Opsiyalar", to: "/options", icon: Settings2 },
    // { label: "Mahsulotlar", to: "/products", icon: Boxes },
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

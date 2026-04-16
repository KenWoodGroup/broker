import { Outlet } from "react-router";
import Sidebar from "../components/common/Sidebar";
import { Box } from "@chakra-ui/react";
import { useUIStore } from "../store/useUIStore";
import { Home, PackageSearch } from "lucide-react";

const links = [
    { label: "Bosh sahifa", to: "/lotcreator", icon: Home, end: true },
    { label: "Lotlar", to: "/lotcreator/lots", icon: PackageSearch, end: false },
];

export default function LotCreatorLayout() {
    const { collapsed } = useUIStore();
    return (
        <Box>
            <Sidebar collapsed={collapsed} links={links} />
            <Box pl={collapsed ? "90px" : "260px"} transition="0.25s ease" minH="100vh">
                <Outlet />
            </Box>
        </Box>
    );
}


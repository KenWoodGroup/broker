import { Outlet } from "react-router";
import Sidebar from "../components/common/Sidebar";
import { Box } from "@chakra-ui/react";
import { useUIStore } from "../store/useUIStore";
import { Headset, Home, Shield, ShieldCheck, Users2 } from "lucide-react";

const links = [
  { label: "Bosh sahifa", to: "/superadmin", icon: Home, end: true },
  {
    label: "Menedjerlar",
    to: "/superadmin/managers",
    icon: ShieldCheck,
    end: true,
  },
  // { label: "Mini-kategoriyalar", to: "/minisubcategories", icon: Settings },
  // { label: "Mahsulotlar", to: "/products", icon: Boxes },
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
  );
}

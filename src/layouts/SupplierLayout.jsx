import { Outlet } from "react-router";
import Sidebar from "../components/common/Sidebar";
import { Box } from "@chakra-ui/react";
import { useUIStore } from "../store/useUIStore";
import { Boxes, CheckSquare2, Factory, GripVertical, Home, Scale3dIcon, ShoppingBag } from "lucide-react";

const links = [
  { label: "Bosh sahifa", to: "/supplier", icon: Home, end: true },
  { label: "Buyurtmalar", to: "/supplier/orders", icon: ShoppingBag, end: false },
  { label: "Zavodlar", to: "/supplier/factories", icon: Factory },
  { label: "Mahsulotlar", to: "/supplier/products", icon: Boxes },
  {
    label: "Narxni yangilash",
    to: "/supplier/taskprice",
    icon: CheckSquare2,
    end: false,
  },
    { label: "Mahsulot ko'paytirish", to: "/supplier/taskreorder", icon: GripVertical},
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
  );
}

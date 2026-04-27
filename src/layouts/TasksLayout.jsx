
import { Box, Text, Flex, Button, Skeleton } from "@chakra-ui/react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuthStore } from "../store/authStore";
import { apiTaskPrice } from "../utils/Controllers/apiTaskPrice";

const tabs = [
  { label: "Kutilmoqda",     path: "/supplier/taskprice" },
  { label: "Jarayonda",      path: "/supplier/taskprice/in-progress" },
  { label: "Bajarilgan",     path: "/supplier/taskprice/done" },
  { label: "Bekor qilingan", path: "/supplier/taskprice/cancelled" },
];

function TasksLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { userId } = useAuthStore();
  const [totalCount, setTotalCount] = useState(null);
  const[badgeLoading, setBadgeLoading]= useState(false)

  useEffect(() => {
    const fetchTotal = async () => {
      setBadgeLoading(true)
      try {
        const res = await apiTaskPrice.getAll("all", "supplier", "pending", "price_update", 1, 1);
        const total = res?.data.total || res?.data.count || 0;
        setTotalCount(total);
      } catch (e) {
        console.error(e);
      } finally{
        setBadgeLoading(false)
      }
    };
    fetchTotal();
  }, []);

  return (
    <Box p={6}>
      {/* Sarlavha + badge */}
      <Flex align="center" gap={6} mb={6}>
        <Text fontSize="3xl" fontWeight="bold">
          Vazifalar
        </Text>
         {badgeLoading ? (
          
          <Skeleton
            height="28px"
            width="160px"
            borderRadius="20px"
          />
        ) : totalCount !== null && (
         
          <span style={{
            backgroundColor: "transparent",
            color: "#63b3ed",
            border: "1px solid #63b3ed",
            borderRadius: "20px",
            padding: "4px 14px",
            fontSize: "13px",
            fontWeight: "600",
            letterSpacing: "0.05em",
          }}>
            JAMI: {totalCount} TA VAZIFA
          </span>
        )}
      </Flex>

      <Flex gap={3} mb={8}>
        {tabs.map((tab) => {
          const isActive = location.pathname === tab.path;
          return (
            <Button
              key={tab.path}
              onClick={() => navigate(tab.path)}
              style={{
                padding: "8px 20px",
                borderRadius: "20px",
                border: "none",
                cursor: "pointer",
                fontWeight: "500",
                fontSize: "14px",
                backgroundColor: isActive ? "#1764e8" : "#e8eef9",
                color: isActive ? "#fff" : "#4d555e",
                transition: "all 0.2s",
              }}
            >
              {tab.label}
            </Button>
          );
        })}
      </Flex>

      <Outlet />
    </Box>
  );
}

export default TasksLayout;
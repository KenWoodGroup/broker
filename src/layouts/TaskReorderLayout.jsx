import { Box, Text, Flex, Button } from "@chakra-ui/react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";

const tabs = [
  { label: "Kutilmoqda",     path: "/supplier/taskreorder/pending" },
  { label: "Jarayonda",      path: "/supplier/taskreorder/in-progress" },
  { label: "Bajarilgan",     path: "/supplier/taskreorder/done" },
  { label: "Bekor qilingan", path: "/supplier/taskreorder/cancelled" },
];

function TaskReorderLayout() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <Box p={6}>
      <Text fontSize="3xl" fontWeight="bold" mb={6}>
        Task Reorder
      </Text>

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
                backgroundColor: isActive ? "#1764e8" : "#2d3748",
                color: isActive ? "#fff" : "#a0aec0",
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

export default TaskReorderLayout;
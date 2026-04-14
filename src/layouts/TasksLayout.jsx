import { Box, Text, Flex, Button } from "@chakra-ui/react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";

const tabs = [
  { label: "Kutilmoqda",     path: "/supplier/taskprice" },
  { label: "Jarayonda",      path: "/supplier/taskprice/in-progress" },
  { label: "Bajarilgan",     path: "/supplier/taskprice/done" },
  { label: "Bekor qilingan", path: "/supplier/taskprice/cancelled" },
];

function TasksLayout() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <Box p={6}>
      <Text fontSize="3xl" fontWeight="bold" mb={6}>
        Vazifalar
      </Text>

      <Flex gap={3} mb={8}>
        {tabs.map((tab) => {
          const isActive = location.pathname === tab.path; 
          return (
            <Button              key={tab.path}
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
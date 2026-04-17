import {
  Box,
  Table,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  Flex,
  Skeleton,
  Button,
} from "@chakra-ui/react";
import { ChevronLeftIcon, ChevronRightIcon } from "@chakra-ui/icons";
import { ClipboardCheck } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiTaskPrice } from "../../utils/Controllers/apiTaskPrice";
import { useAuthStore } from "../../store/authStore";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  useDisclosure,
} from "@chakra-ui/react";

const TableSkeleton = ({ rows = 5, cols = 8 }) => (
  <Table>
    <Thead>
      <Tr>
        {Array.from({ length: cols }).map((_, i) => (
          <Th key={i}>
            <Skeleton height="20px" borderRadius="5px" />
          </Th>
        ))}
      </Tr>
    </Thead>
    <Tbody>
      {Array.from({ length: rows }).map((_, rowIdx) => (
        <Tr key={rowIdx}>
          {Array.from({ length: cols }).map((_, colIdx) => (
            <Td key={colIdx}>
              <Skeleton height="14px" borderRadius="4px" />
            </Td>
          ))}
        </Tr>
      ))}
    </Tbody>
  </Table>
);

const PaginationButton = ({ children, onClick, isDisabled, variant }) => {
  const base = {
    height: "38px",
    minWidth: "38px",
    padding: "0 14px",
    borderRadius: "20px",
    fontSize: "14px",
    fontWeight: "500",
    border: "none",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "all 0.2s",
    cursor: isDisabled ? "not-allowed" : "pointer",
    opacity: isDisabled ? 0.4 : 1,
  };
  const styles = {
    label: { ...base, backgroundColor: "#1764e8", color: "#e2e8f0" },
    nav: { ...base, backgroundColor: "#0056eb", color: "#e2e8f0" },
    page: {
      ...base,
      backgroundColor: "#1a202c",
      color: "#e2e8f0",
      minWidth: "80px",
      cursor: "default",
    },
  };
  return (
    <button style={styles[variant]} onClick={onClick} disabled={isDisabled}>
      {children}
    </button>
  );
};

const formatDate = (dateStr) => {
  if (!dateStr) return "—";
  const date = new Date(dateStr);
  const pad = (n) => String(n).padStart(2, "0");
  return `${pad(date.getDate())}.${pad(date.getMonth() + 1)}.${date.getFullYear()} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

const priorityBadge = (priority) => {
  const styles = {
    normal: { background: "#2b6cb0", color: "#fff" },
    urgent: { background: "#c53030", color: "#fff" },
    high: { background: "#c05621", color: "#fff" },
    low: { background: "#276749", color: "#fff" },
  };
  const labels = {
    normal: "Normal",
    urgent: "Urgent",
    high: "Yuqori",
    low: "Past",
  };
  const style = styles[priority] || { background: "#4a5568", color: "#fff" };
  const label = labels[priority] || priority;
  return (
    <span
      style={{
        ...style,
        padding: "3px 12px",
        borderRadius: "20px",
        fontSize: "12px",
        fontWeight: "600",
      }}
    >
      {label}
    </span>
  );
};

function AdtaskPrice({ status = "pending" }) {
  const { userId } = useAuthStore();
  const navigate = useNavigate();
  const { isOpen, onOpen, onClose } = useDisclosure();

  const bgModal = "surface"; // white / #1a202c
  const colorText = "text"; // #1a202c / #edf2f7
  const colorMuted = "textSub"; // #718096 / #e2e8f0
  const borderColor = "border"; // #e2e8f0 / #2d3748
  const btnBorder = "border"; // #e2e8f0 / #2d3748
  const btnColor = "text"; // #1a202c / #edf2f7

  const activeTab = status === "pending" ? "all" : "my";

  const [loading, setLoading] = useState(false);
  const [taskPrice, setTaskPrice] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedTask, setSelectedTask] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [completeLoading, setCompleteLoading] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const pageSize = 30;

  const fetchTask = async (page = 1) => {
    console.log(status);

    if (!status || !pageSize) return;
    setLoading(true);
    try {
      const id = activeTab === "all" ? "all" : userId;
      const res = await apiTaskPrice.getAll(
        id,
        "supplier",
        status,
        "price_update",
        page,
        pageSize,
      );
      setTaskPrice(res?.data.data);
      const total = res?.data.total || res?.data.count || 0;
      setTotalCount(total);
      setTotalPages(res?.data.totalPages || Math.ceil(total / pageSize));
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = async (id) => {
    onOpen();
    setModalLoading(true);
    try {
      const res = await apiTaskPrice.getById(id);
      setSelectedTask(res?.data);
    } finally {
      setModalLoading(false);
    }
  };

  const handleClose = () => {
    onClose();
    setSelectedTask(null);
  };

  const handleComplete = async () => {
    setCompleteLoading(true);
    try {
      await apiTaskPrice.updateStatus(selectedTask.id, {
        status: "in_progress",
        assignee_id: userId,
      });
      const factoryId = selectedTask.details?.factory_id;
      const warehouseId = selectedTask.details?.warehouse_id;
      const productName = selectedTask.details?.product_name;
      navigate(
        `/supplier/factories/${factoryId}/warehouses/${warehouseId}?task_stock_id=${selectedTask?.details?.stock_id}`,
      );
      handleClose();
    } catch (err) {
      console.error(err);
    } finally {
      setCompleteLoading(false);
    }
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [status]);

  useEffect(() => {
    fetchTask(currentPage);
  }, [currentPage, status]);

  return (
    <Box overflow="hidden">
      {loading ? (
        <TableSkeleton rows={pageSize} cols={8} />
      ) : taskPrice?.length === 0 ? (
        <Flex direction="column" align="center" justify="center" py={16}>
          <Text fontSize="16px" fontWeight="bold">
            Ma'lumot topilmadi
          </Text>
        </Flex>
      ) : (
        <>
          <Table>
            <Thead>
              <Tr>
                <Th>N</Th>
                <Th>Mahsulot nomi</Th>
                <Th>Kategoriya nomi</Th>
                <Th>Darajasi</Th>
                <Th>Tugatish vaqti</Th>
                <Th>Yaratgan</Th>
                <Th>Yaratilgan vaqt</Th>
                <Th>Amallar</Th>
              </Tr>
            </Thead>
            <Tbody>
              {taskPrice.map((price, index) => (
                <Tr
                  key={index}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.backgroundColor = "rgba(0,0,0,0.15)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.backgroundColor = "transparent")
                  }
                  style={{ cursor: "pointer" }}
                >
                  <Td>{(currentPage - 1) * pageSize + index + 1}</Td>
                  <Td>{price.details?.product_name}</Td>
                  <Td>{price.details?.category_name}</Td>
                  <Td>{priorityBadge(price.priority)}</Td>
                  <Td>{formatDate(price.due_date)}</Td>
                  <Td>{price?.source}</Td>
                  <Td>{formatDate(price.createdAt)}</Td>
                  <Td>
                    {status === "pending" ? (
                      <button
                        onClick={() => handleOpenModal(price.id)}
                        style={{
                          backgroundColor: "#276749",
                          color: "#fff",
                          border: "none",
                          borderRadius: "8px",
                          padding: "6px 12px",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                          fontSize: "13px",
                          fontWeight: "500",
                        }}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.backgroundColor = "#22543d")
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.backgroundColor = "#276749")
                        }
                      >
                        <ClipboardCheck size={16} />
                        Boshlash
                      </button>
                    ) : status === "in_progress" ? (
                      <button
                        onClick={() => handleOpenModal(price.id)}
                        style={{
                          backgroundColor: "#1764e8",
                          color: "#fff",
                          border: "none",
                          borderRadius: "8px",
                          padding: "6px 12px",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                          fontSize: "13px",
                          fontWeight: "500",
                        }}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.backgroundColor = "#0056eb")
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.backgroundColor = "#1764e8")
                        }
                      >
                        <ClipboardCheck size={16} />
                        Tugatish
                      </button>
                    ) : null}
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>

          <Flex justify="center" align="center" mt={8}>
            <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
              <PaginationButton
                variant="label"
                onClick={() => setCurrentPage(1)}
                isDisabled={currentPage === 1 || loading}
              >
                First
              </PaginationButton>
              <PaginationButton
                variant="nav"
                onClick={() => setCurrentPage((p) => p - 1)}
                isDisabled={currentPage === 1 || loading}
              >
                <ChevronLeftIcon boxSize={4} />
              </PaginationButton>
              <PaginationButton variant="page">
                {loading ? "..." : `${currentPage} / ${totalPages}`}
              </PaginationButton>
              <PaginationButton
                variant="nav"
                onClick={() => setCurrentPage((p) => p + 1)}
                isDisabled={currentPage === totalPages}
              >
                <ChevronRightIcon boxSize={4} />
              </PaginationButton>
              <PaginationButton
                variant="label"
                onClick={() => setCurrentPage(totalPages)}
                isDisabled={currentPage === totalPages || loading}
              >
                Last
              </PaginationButton>
            </div>
          </Flex>
        </>
      )}

      <Modal isOpen={isOpen} onClose={handleClose} size="md" isCentered>
        <ModalOverlay />
        <ModalContent bg={bgModal} color={colorText}>
          <ModalHeader borderBottom="1px solid" borderColor={borderColor}>
            Topshiriq tafsilotlari
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody py={6}>
            {modalLoading ? (
              <Flex direction="column" gap={3}>
                <Skeleton height="20px" borderRadius="5px" />
                <Skeleton height="20px" borderRadius="5px" />
                <Skeleton height="20px" borderRadius="5px" />
                <Skeleton height="20px" borderRadius="5px" />
              </Flex>
            ) : selectedTask ? (
              <Flex direction="column" gap={4}>
                <Flex
                  justify="space-between"
                  borderBottom="1px solid"
                  borderColor={borderColor}
                  pb={3}
                >
                  <Text color={colorMuted} fontSize="14px">
                    Mahsulot nomi
                  </Text>
                  <Text fontWeight="600">
                    {selectedTask.details?.product_name || "—"}
                  </Text>
                </Flex>
                <Flex
                  justify="space-between"
                  align="center"
                  borderBottom="1px solid #2d3748"
                  pb={3}
                >
                  <Text color="#a0aec0" fontSize="14px">
                    Kategoriya
                  </Text>
                  <Text fontWeight="600">
                    {selectedTask.details?.category_name || "—"}
                  </Text>
                </Flex>
                <Flex
                  justify="space-between"
                  align="center"
                  borderBottom="1px solid #2d3748"
                  pb={3}
                >
                  <Text color="#a0aec0" fontSize="14px">
                    Darajasi
                  </Text>
                  {priorityBadge(selectedTask.priority)}
                </Flex>
                <Flex
                  justify="space-between"
                  align="center"
                  borderBottom="1px solid #2d3748"
                  pb={3}
                >
                  <Text color="#a0aec0" fontSize="14px">
                    Tugatish vaqti
                  </Text>
                  <Text fontWeight="600">
                    {formatDate(selectedTask.due_date)}
                  </Text>
                </Flex>
                <Flex justify="space-between" align="center">
                  <Text color="#a0aec0" fontSize="14px">
                    Yaratilgan vaqt
                  </Text>
                  <Text fontWeight="600">
                    {formatDate(selectedTask.createdAt)}
                  </Text>
                </Flex>
              </Flex>
            ) : (
              <Text textAlign="center">Ma'lumot topilmadi</Text>
            )}
          </ModalBody>
          <ModalFooter borderTop="1px solid" borderColor={borderColor} gap={3}>
            <Button
              onClick={handleClose}
              style={{
                flex: 1,
                padding: "10px",
                borderRadius: "8px",
                border: `1px solid ${btnBorder}`,
                backgroundColor: "transparent",
                color: btnColor,
                cursor: "pointer",
                fontWeight: "500",
                fontSize: "14px",
              }}
            >
              Bekor qilish
            </Button>
            <Button
              onClick={handleComplete}
              isLoading={completeLoading}
              loadingText="Yuklanmoqda..."
              style={{
                flex: 1,
                padding: "10px",
                borderRadius: "8px",
                border: "none",
                backgroundColor: "#1764e8",
                color: "#fff",
                cursor: "pointer",
                fontWeight: "500",
                fontSize: "14px",
              }}
            >
              Narxni yangilash
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}

export default AdtaskPrice;

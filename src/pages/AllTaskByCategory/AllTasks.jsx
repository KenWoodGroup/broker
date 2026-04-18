import { useCallback, useEffect, useMemo, useState } from "react";
import {
    Box,
    Heading,
    Select,
    HStack,
    Text,
    Spinner,
    Center,
    Button,
    Badge,
    useToast,
    SimpleGrid,
    VStack,
    Icon,
    useColorModeValue,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalCloseButton,
    IconButton,
    useDisclosure,
    Divider,
} from "@chakra-ui/react";
import {
    ClipboardList,
    Calendar,
    Flag,
    Info,
    User,
    Package,
    Users,
    Building2,
    CheckCheck,
} from "lucide-react";
import { useAuthStore } from "../../store/authStore";
import { apiTasks } from "../../utils/Controllers/apiTasks";
import PaginationBar from "../../components/common/PaginationBar";

function normalizeListResponse(res) {
    const root = res?.data;
    const inner = root?.data != null ? root.data : root;
    const items =
        (Array.isArray(inner?.records) && inner.records) ||
        (Array.isArray(inner?.items) && inner.items) ||
        (Array.isArray(inner) && inner) ||
        (Array.isArray(root?.records) && root.records) ||
        [];
    const pagination =
        inner?.pagination ||
        root?.pagination ||
        inner?.meta ||
        root?.meta ||
        {};
    return { items, pagination };
}

function formatWhen(iso) {
    if (!iso) return "—";
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return String(iso);
    return d.toLocaleString("uz-UZ", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
}

const TASK_TYPE_UZ = {
    reorder: "Mahsulot topish",
    price_update: "Narx yangilash",
};

const TASK_STATUS_UZ = {
    pending: "Kutilmoqda",
    in_progress: "Bajarilmoqda",
    completed: "Bajarildi",
    cancelled: "Bekor qilindi",
    new: "Yangi",
    open: "Ochiq",
    closed: "Yopiq",
    failed: "Muvaffaqiyatsiz",
};

const TASK_PRIORITY_UZ = {
    low: "Past",
    normal: "Oddiy",
    medium: "O‘rtacha",
    high: "Yuqori",
    urgent: "Shoshilinch",
};

function taskTypeLabel(raw) {
    if (raw == null || String(raw).trim() === "") return "—";
    const k = String(raw).trim().toLowerCase();
    return TASK_TYPE_UZ[k] ?? String(raw);
}

function taskStatusLabel(raw) {
    if (raw == null || String(raw).trim() === "") return "—";
    const k = String(raw).trim().toLowerCase();
    return TASK_STATUS_UZ[k] ?? String(raw);
}

function taskPriorityLabel(raw) {
    if (raw == null || String(raw).trim() === "") return "—";
    const k = String(raw).trim().toLowerCase();
    return TASK_PRIORITY_UZ[k] ?? String(raw);
}

/** Xodim kartalaridagi role badge uslubiga yaqin */
const ASSIGNEE_TYPE_CONFIG = {
    supplier: {
        label: "Ta'minotchi",
        icon: Package,
        color: "teal",
    },
    staff: {
        label: "Xodim",
        icon: Users,
        color: "blue",
    },
    operator: {
        label: "Operator",
        icon: User,
        color: "purple",
    },
    broker: {
        label: "Broker",
        icon: Building2,
        color: "orange",
    },
};

function assigneeTypeDisplay(raw) {
    if (raw == null || String(raw).trim() === "") {
        return { label: "—", icon: User, color: "gray" };
    }
    const k = String(raw).trim().toLowerCase();
    const c = ASSIGNEE_TYPE_CONFIG[k];
    if (c) return c;
    return {
        label: String(raw),
        icon: User,
        color: "gray",
    };
}

function assigneeFullNameDisplay(row) {
    const raw = row?.assignee?.full_name;
    if (raw == null || String(raw).trim() === "") return "Bo'sh";
    return String(raw).trim();
}

function isTaskSourceAuto(row) {
    return String(row?.source ?? "").trim().toLowerCase() === "auto";
}

const DETAIL_FIELD_LABELS = {
    product_name: "Mahsulot",
    category_name: "Kategoriya",
    stock_id: "Zaxira (stock) ID",
    factory_id: "Zavod ID",
    warehouse_id: "Ombor ID",
};

function TaskDetailsModal({ isOpen, onClose, details }) {
    const panelBg = useColorModeValue("gray.50", "whiteAlpha.100");
    const borderCol = useColorModeValue("gray.200", "whiteAlpha.200");

    const d = details && typeof details === "object" ? details : {};
    const entries = Object.entries(d).filter(
        ([, v]) => v !== null && v !== undefined && String(v).trim() !== ""
    );

    const productName = d.product_name;
    const restEntries = entries.filter(([key]) => key !== "product_name");

    return (
        <Modal isOpen={isOpen} onClose={onClose} size="lg" isCentered>
            <ModalOverlay backdropFilter="blur(4px)" />
            <ModalContent bg="surface" borderColor="border" borderWidth="1px">
                <ModalHeader pb={2}>Batafsil ma&apos;lumot</ModalHeader>
                <ModalCloseButton />
                <ModalBody pb={6}>
                    {entries.length === 0 ? (
                        <Text color="gray.500" py={4}>
                            Qo&apos;shimcha ma&apos;lumot yo&apos;q
                        </Text>
                    ) : (
                        <VStack align="stretch" spacing={4}>
                            {productName ? (
                                <>
                                  <Box
                                    p={4}
                                    borderRadius="lg"
                                    bg={panelBg}
                                    borderWidth="1px"
                                    borderColor={borderCol}
                                >
                                    <Text
                                        fontSize="xs"
                                        fontWeight="semibold"
                                        color="gray.500"
                                        textTransform="uppercase"
                                        letterSpacing="wide"
                                        mb={1}
                                    >
                                        {DETAIL_FIELD_LABELS.product_name}
                                    </Text>
                                    <Text fontWeight="bold" fontSize="lg" color="text">
                                        {String(productName)}
                                    </Text>
                                </Box>
                                
                                </>
                              
                            ) : null}

                            {restEntries.length > 0 ? (
                                <>
                                    {productName ? <Divider /> : null}
                                    <SimpleGrid columns={{ base: 1, sm: 2 }} spacing={3}>
                                        {restEntries.map(([key, value]) => {
                                            const label =
                                                DETAIL_FIELD_LABELS[key] ?? key;
                                            const isId =
                                                key.endsWith("_id") ||
                                                key === "stock_id";
                                            return (
                                                <Box
                                                    key={key}
                                                    p={3}
                                                    borderRadius="md"
                                                    bg={panelBg}
                                                    borderWidth="1px"
                                                    borderColor={borderCol}
                                                >
                                                    <Text
                                                        fontSize="xs"
                                                        fontWeight="semibold"
                                                        color="gray.500"
                                                        textTransform="uppercase"
                                                        letterSpacing="wide"
                                                        mb={1}
                                                    >
                                                        {label}
                                                    </Text>
                                                    <Text
                                                        fontSize={isId ? "xs" : "sm"}
                                                        fontWeight="medium"
                                                        color="text"
                                                        fontFamily={
                                                            isId ? "mono" : undefined
                                                        }
                                                        wordBreak="break-all"
                                                        title={String(value)}
                                                    >
                                                        {String(value)}
                                                    </Text>
                                                </Box>
                                            );
                                        })}
                                    </SimpleGrid>
                                </>
                            ) : null}
                        </VStack>
                    )}
                </ModalBody>
            </ModalContent>
        </Modal>
    );
}

function TaskCard({ row }) {
    const { isOpen, onOpen, onClose } = useDisclosure();
    const borderColor = useColorModeValue("gray.200", "gray.600");
    const hoverBorder = useColorModeValue("blue.300", "blue.400");
    const subtle = useColorModeValue("gray.600", "gray.400");
    const title = row.details?.product_name ?? row.product_name ?? "—";
    const created = row.created_at ?? row.createdAt;
    const assignee = assigneeTypeDisplay(row.assignee_type);
    const assigneeNameLine = assigneeFullNameDisplay(row);
    const sourceAuto = isTaskSourceAuto(row);
    const hasDetails =
        row.details &&
        typeof row.details === "object" &&
        Object.keys(row.details).length > 0;

    return (
        <>
            <Box
                p={4}
                borderRadius="lg"
                border="1px solid"
                borderColor={borderColor}
                bg="surface"
                transition="all 0.25s ease"
                _hover={{
                    transform: "translateY(-3px)",
                    boxShadow: "md",
                    borderColor: hoverBorder,
                }}
                h="100%"
            >
                <VStack align="stretch" spacing={3}>
                    <HStack justify="space-between" align="flex-start" spacing={2}>
                        <HStack spacing={2} minW={0}>
                            <Icon
                                as={ClipboardList}
                                boxSize={5}
                                color="blue.500"
                                flexShrink={0}
                            />
                            <Text fontWeight="bold" fontSize="md" noOfLines={2}>
                                {title}
                            </Text>
                        </HStack>
                        <Badge
                            colorScheme="purple"
                            textTransform="none"
                            flexShrink={0}
                        >
                            {taskTypeLabel(row.type)}
                        </Badge>
                    </HStack>

                    <HStack spacing={2} flexWrap="wrap">
                        <Badge
                            colorScheme="blue"
                            variant="subtle"
                            textTransform="none"
                        >
                            {taskStatusLabel(row.status)}
                        </Badge>
                        <HStack spacing={1} color={subtle} fontSize="sm">
                            <Icon as={Flag} boxSize={3.5} />
                            <Text>{taskPriorityLabel(row.priority)}</Text>
                        </HStack>
                    </HStack>

                    <HStack spacing={2} align="center" flexWrap="wrap">
                        <Icon
                            as={assignee.icon}
                            boxSize={5}
                            color={`${assignee.color}.500`}
                            flexShrink={0}
                        />
                        <Badge
                            colorScheme={assignee.color}
                            fontSize="xs"
                            textTransform="none"
                            px={2}
                            py={0.5}
                            borderRadius="md"
                        >
                            {assignee.label}
                        </Badge>
                    </HStack>

                    <HStack spacing={2} align="center" flexWrap="wrap">
                        <Icon
                            as={Users}
                            boxSize={5}
                            color="blue.500"
                            flexShrink={0}
                        />
                        <Text fontSize="sm" fontWeight="medium">
                            {assigneeNameLine}
                        </Text>
                        {sourceAuto ? (
                            <>
                                <Icon
                                    as={CheckCheck}
                                    boxSize={5}
                                    color="teal.500"
                                    flexShrink={0}
                                />
                                <Text fontSize="sm" fontWeight="medium">
                                    auto
                                </Text>
                            </>
                        ) : null}
                    </HStack>

                    <VStack align="stretch" spacing={1.5} pt={1}>
                        <HStack spacing={2} color={subtle} fontSize="sm" minW={0}>
                        </HStack>
                        <HStack
                            justify="space-between"
                            align="center"
                            spacing={2}
                        >
                            <HStack spacing={2} color={subtle} fontSize="sm" minW={0}>
                                <Icon as={Calendar} boxSize={4} flexShrink={0} />
                                <Text>{formatWhen(created)}</Text>
                            </HStack>
                            <IconButton
                                icon={<Info size={18} />}
                                aria-label="Batafsil ma'lumot"
                                size="sm"
                                variant="ghost"
                                colorScheme="blue"
                                borderRadius="full"
                                onClick={onOpen}
                                isDisabled={!hasDetails}
                            />
                        </HStack>
                    </VStack>
                </VStack>
            </Box>

            <TaskDetailsModal
                isOpen={isOpen}
                onClose={onClose}
                details={row.details}
            />
        </>
    );
}

export default function AllTasks() {
    const toast = useToast();
    const user = useAuthStore((s) => s.user);
    const storeUserId = useAuthStore((s) => s.userId);

    const createdBy = useMemo(
        () => String(user?.id ?? storeUserId ?? "").trim(),
        [user?.id, storeUserId]
    );

    const [status, setStatus] = useState("all");
    const [type, setType] = useState("all");
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(20);
    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(false);
    const [pagination, setPagination] = useState({
        currentPage: 1,
        totalPages: 1,
        totalCount: 0,
        limit: 20,
    });

    const fetchTasks = useCallback(async () => {
        if (!createdBy) return;
        setLoading(true);
        try {
            const res = await apiTasks.getByCreatedBy(createdBy, {
                status,
                type,
                page,
                limit,
            });
            const { items, pagination: p } = normalizeListResponse(res);
            setRows(items);
            setPagination({
                currentPage:
                    p.current_page ??
                    p.currentPage ??
                    page,
                totalPages:
                    p.total_pages ??
                    p.totalPages ??
                    (items.length < limit ? page : page + 1),
                totalCount: p.total_count ?? p.totalCount ?? items.length,
                limit: p.limit ?? limit,
            });
        } catch (e) {
            console.error(e);
            const msg = e?.response?.data?.message;
            toast({
                title: "Xatolik",
                description: Array.isArray(msg)
                    ? msg.join(". ")
                    : msg || "Vazifalarni yuklab bo'lmadi",
                status: "error",
                duration: 5000,
                isClosable: true,
            });
            setRows([]);
        } finally {
            setLoading(false);
        }
    }, [createdBy, status, type, page, limit, toast]);

    useEffect(() => {
        fetchTasks();
    }, [fetchTasks]);

    useEffect(() => {
        setPage(1);
    }, [status, type, limit]);

    if (!createdBy) {
        return (
            <Box p={6}>
                <Heading size="md" mb={2}>
                    Mening vazifalarim
                </Heading>
                <Text color="gray.500">
                    Foydalanuvchi identifikatori topilmadi. Qayta kiring.
                </Text>
            </Box>
        );
    }

    const totalPages = Math.max(1, Number(pagination.totalPages) || 1);

    return (
        <Box p={6}>
            <Heading size="lg" mb={4}>
                Vazifalar
            </Heading>

            <HStack spacing={4} mb={4} flexWrap="wrap">
                <Box minW="160px">
                    <Text fontSize="sm" mb={1} color="gray.600">
                        Status
                    </Text>
                    <Select
                        size="sm"
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                    >
                        <option value="all">Barchasi</option>
                        <option value="pending">Kutilmoqda</option>
                        <option value="in_progress">Bajarilmoqda</option>
                        <option value="completed">Bajarildi</option>
                        <option value="cancelled">Bekor qilindi</option>
                    </Select>
                </Box>
                <Box minW="160px">
                    <Text fontSize="sm" mb={1} color="gray.600">
                        Type
                    </Text>
                    <Select
                        size="sm"
                        value={type}
                        onChange={(e) => setType(e.target.value)}
                    >
                        <option value="all">Barchasi</option>
                        <option value="price_update">Narx yangilash</option>
                        <option value="reorder">Qayta buyurtma</option>
                    </Select>
                </Box>
            
            </HStack>

            {loading ? (
                <Center py={16}>
                    <Spinner size="lg" color="blue.500" />
                </Center>
            ) : rows.length === 0 ? (
                <Center
                    py={16}
                    borderWidth="1px"
                    borderRadius="lg"
                    borderStyle="dashed"
                >
                    <Text color="gray.500">Vazifalar yo'q</Text>
                </Center>
            ) : (
                <SimpleGrid columns={{ base: 1, md: 2, xl: 3 }} spacing={4}>
                    {rows.map((row) => (
                        <TaskCard
                            key={row.id ?? JSON.stringify(row)}
                            row={row}
                        />
                    ))}
                </SimpleGrid>
            )}

            <PaginationBar
                page={page}
                totalPages={totalPages}
                loading={loading}
                onPageChange={(p) => setPage(p)}
            />
        </Box>
    );
}

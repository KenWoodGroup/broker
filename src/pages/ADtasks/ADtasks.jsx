import { useCallback, useEffect, useState } from "react";
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
    Flex,
    Menu,
    MenuButton,
    MenuList,
    MenuItem,
} from "@chakra-ui/react";
import {
    ChevronLeft,
    ChevronRight,
    ClipboardList,
    Calendar,
    Flag,
    Info,
    User,
    Package,
    Users,
    Building2,
    CheckCheck,
    Plus,
    MoreVertical,
    Pencil,
    Trash2,
} from "lucide-react";
import { apiTasks } from "../../utils/Controllers/apiTasks";
import CreateTaskModal from "./_components/CreateTaskModal";
import EditTaskModal from "./_components/EditTaskModal";
import ConfirmDelModal from "../../components/common/ConfirmDelModal";

/** ADtasks — AllTasks.jsx dan mustaqil; faqat `apiTasks.getPage` ishlatiladi. */

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
                                    <Text
                                        fontWeight="bold"
                                        fontSize="lg"
                                        color="text"
                                    >
                                        {String(productName)}
                                    </Text>
                                </Box>
                            ) : null}

                            {restEntries.length > 0 ? (
                                <>
                                    {productName ? <Divider /> : null}
                                    <SimpleGrid
                                        columns={{ base: 1, sm: 2 }}
                                        spacing={3}
                                    >
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
                                                        fontSize={
                                                            isId ? "xs" : "sm"
                                                        }
                                                        fontWeight="medium"
                                                        color="text"
                                                        fontFamily={
                                                            isId
                                                                ? "mono"
                                                                : undefined
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

function TaskCard({ row, onRequestEdit, onRequestDelete }) {
    const { isOpen, onOpen, onClose } = useDisclosure();
    const {
        isOpen: isMenuOpen,
        onOpen: onMenuOpen,
        onClose: onMenuClose,
    } = useDisclosure();
    const borderColor = useColorModeValue("gray.200", "gray.600");
    const hoverBorder = useColorModeValue("blue.300", "blue.400");
    const subtle = useColorModeValue("gray.600", "gray.400");
    const menuHoverBg = useColorModeValue("gray.50", "whiteAlpha.100");
    const menuDangerHoverBg = useColorModeValue("red.50", "whiteAlpha.100");
    const menuDangerColor = useColorModeValue("red.600", "red.300");
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
                onMouseLeave={onMenuClose}
            >
                <VStack align="stretch" spacing={3}>
                    <HStack
                        justify="space-between"
                        align="flex-start"
                        spacing={2}
                    >
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
                            <HStack
                                spacing={2}
                                color={subtle}
                                fontSize="sm"
                                minW={0}
                            >
                                <Icon as={Calendar} boxSize={4} flexShrink={0} />
                                <Text>{formatWhen(created)}</Text>
                            </HStack>
                            <HStack spacing={1}>
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
                                <Menu
                                    placement="bottom-end"
                                    gutter={6}
                                    isLazy
                                    isOpen={isMenuOpen}
                                    onOpen={onMenuOpen}
                                    onClose={onMenuClose}
                                    closeOnSelect
                                    closeOnBlur
                                >
                                    <MenuButton
                                        as={IconButton}
                                        icon={<MoreVertical size={18} />}
                                        aria-label="Amallar"
                                        size="sm"
                                        variant="ghost"
                                        borderRadius="full"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            if (isMenuOpen) onMenuClose();
                                            else onMenuOpen();
                                        }}
                                    />
                                    <MenuList
                                        p={2}
                                        borderRadius="xl"
                                        boxShadow="xl"
                                        borderWidth="1px"
                                        minW="190px"
                                        zIndex={20}
                                    >
                                        <MenuItem
                                            icon={<Pencil size={16} />}
                                            onClick={() => {
                                                onMenuClose();
                                                setTimeout(
                                                    () => onRequestEdit?.(row),
                                                    0
                                                );
                                            }}
                                            borderRadius="lg"
                                            _hover={{ bg: menuHoverBg }}
                                            _focus={{ bg: menuHoverBg }}
                                        >
                                            Tahrirlash
                                        </MenuItem>
                                        <MenuItem
                                            icon={<Trash2 size={16} />}
                                            onClick={() => {
                                                onMenuClose();
                                                setTimeout(
                                                    () => onRequestDelete?.(row),
                                                    0
                                                );
                                            }}
                                            borderRadius="lg"
                                            color={menuDangerColor}
                                            _hover={{ bg: menuDangerHoverBg }}
                                            _focus={{ bg: menuDangerHoverBg }}
                                        >
                                            O‘chirish
                                        </MenuItem>
                                    </MenuList>
                                </Menu>
                            </HStack>
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

export default function ADtasks() {
    const toast = useToast();
    const {
        isOpen: isCreateOpen,
        onOpen: onCreateOpen,
        onClose: onCreateClose,
    } = useDisclosure();

    const {
        isOpen: isEditOpen,
        onOpen: onEditOpen,
        onClose: onEditClose,
    } = useDisclosure();
    const {
        isOpen: isDelOpen,
        onOpen: onDelOpen,
        onClose: onDelClose,
    } = useDisclosure();

    const [status, setStatus] = useState("all");
    const [type, setType] = useState("all");
    const [page, setPage] = useState(1);
    const [limit] = useState(20);
    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [activeTask, setActiveTask] = useState(null);
    const [pagination, setPagination] = useState({
        currentPage: 1,
        totalPages: 1,
        totalCount: 0,
        limit: 20,
    });

    const fetchTasks = useCallback(async () => {
        setLoading(true);
        try {
            const res = await apiTasks.getPage({
                status,
                type,
                page,
                limit,
            });
            const { items, pagination: p } = normalizeListResponse(res);
            setRows(items);
            setPagination({
                currentPage:
                    p.current_page ?? p.currentPage ?? page,
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
    }, [status, type, page, limit, toast]);

    const handleCreatedTask = useCallback(() => {
        fetchTasks();
    }, [fetchTasks]);

    const openEdit = useCallback(
        (row) => {
            setActiveTask(row);
            onEditOpen();
        },
        [onEditOpen]
    );

    const openDelete = useCallback(
        (row) => {
            setActiveTask(row);
            onDelOpen();
        },
        [onDelOpen]
    );

    const handleSaveEdit = useCallback(
        async (payload) => {
            if (!activeTask?.id) return;
            setSaving(true);
            try {
                await apiTasks.update(activeTask.id, payload);
                toast({
                    title: "Saqlandi",
                    description: "Vazifa yangilandi",
                    status: "success",
                    duration: 2500,
                    isClosable: true,
                });
                onEditClose();
                setActiveTask(null);
                fetchTasks();
            } catch (e) {
                console.error(e);
                const msg = e?.response?.data?.message;
                toast({
                    title: "Xatolik",
                    description: Array.isArray(msg)
                        ? msg.join(". ")
                        : msg || "Yangilab bo'lmadi",
                    status: "error",
                    duration: 6000,
                    isClosable: true,
                });
            } finally {
                setSaving(false);
            }
        },
        [activeTask?.id, fetchTasks, onEditClose, toast]
    );

    const handleConfirmDelete = useCallback(async () => {
        if (!activeTask?.id) return;
        setDeleting(true);
        try {
            await apiTasks.remove(activeTask.id);
            toast({
                title: "O‘chirildi",
                description: "Vazifa o‘chirildi",
                status: "success",
                duration: 2500,
                isClosable: true,
            });
            onDelClose();
            setActiveTask(null);
            fetchTasks();
        } catch (e) {
            console.error(e);
            const msg = e?.response?.data?.message;
            toast({
                title: "Xatolik",
                description: Array.isArray(msg)
                    ? msg.join(". ")
                    : msg || "O‘chirib bo'lmadi",
                status: "error",
                duration: 6000,
                isClosable: true,
            });
        } finally {
            setDeleting(false);
        }
    }, [activeTask?.id, fetchTasks, onDelClose, toast]);

    useEffect(() => {
        fetchTasks();
    }, [fetchTasks]);

    useEffect(() => {
        setPage(1);
    }, [status, type, limit]);

    const totalPages = Math.max(1, Number(pagination.totalPages) || 1);
    const canPrev = page > 1;
    const canNext = page < totalPages;
    const total = Number(pagination.totalCount) || 0;
    const countBg = useColorModeValue("blue.50", "whiteAlpha.100");
    const countText = useColorModeValue("blue.700", "blue.100");

    return (
        <Box p={6}>
            <Flex justify="space-between" align="center" mb={4} gap={4} wrap="wrap">
                <HStack spacing={3} flexWrap="wrap">
                    <Heading size="lg">Barcha vazifalar</Heading>
                
                </HStack>
                <Button
                    colorScheme="blue"
                    leftIcon={<Icon as={Plus} boxSize={5} />}
                    borderRadius="xl"
                    size="md"
                    onClick={onCreateOpen}
                    boxShadow="sm"
                >
                    Yaratish
                </Button>
            </Flex>

            <HStack spacing={4} mb={4} flexWrap="wrap">
                <Box minW="160px">
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
                    <Box px={3} py="7px" bg={countBg} borderRadius="full">
                        {loading ? (
                            <Flex align="center" gap={2}>
                                <Spinner size="xs" color="blue.500" />
                                <Text
                                    fontSize="12px"
                                    color={countText}
                                    fontWeight="700"
                                >
                                    Yuklanmoqda
                                </Text>
                            </Flex>
                        ) : (
                            <Text
                                fontSize="12px"
                                color={countText}
                                fontWeight="700"
                            >
                                JAMI: {total} TA
                            </Text>
                        )}
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
                    <Text color="gray.500">Vazifalar yo&apos;q</Text>
                </Center>
            ) : (
                <SimpleGrid columns={{ base: 1, md: 2, xl: 3 }} spacing={4}>
                    {rows.map((row) => (
                        <TaskCard
                            key={row.id ?? JSON.stringify(row)}
                            row={row}
                            onRequestEdit={openEdit}
                            onRequestDelete={openDelete}
                        />
                    ))}
                </SimpleGrid>
            )}

            <HStack justify="space-between" mt={4} flexWrap="wrap" gap={2}>
                <Text fontSize="sm" color="gray.600">
                    Sahifa {page} / {totalPages}
                    {pagination.totalCount != null
                        ? ` · Jami: ${pagination.totalCount}`
                        : ""}
                </Text>
                <HStack>
                    <Button
                        size="sm"
                        leftIcon={<ChevronLeft size={16} />}
                        isDisabled={!canPrev || loading}
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                    >
                        Oldingi
                    </Button>
                    <Button
                        size="sm"
                        rightIcon={<ChevronRight size={16} />}
                        isDisabled={!canNext || loading}
                        onClick={() =>
                            setPage((p) => Math.min(totalPages, p + 1))
                        }
                    >
                        Keyingi
                    </Button>
                </HStack>
            </HStack>

            <CreateTaskModal
                isOpen={isCreateOpen}
                onClose={onCreateClose}
                onCreated={handleCreatedTask}
            />

            <EditTaskModal
                isOpen={isEditOpen}
                onClose={() => {
                    onEditClose();
                    setActiveTask(null);
                }}
                task={activeTask}
                onSave={handleSaveEdit}
                isSaving={saving}
            />

            <ConfirmDelModal
                isOpen={isDelOpen}
                onClose={() => {
                    onDelClose();
                    setActiveTask(null);
                }}
                onConfirm={handleConfirmDelete}
                itemName={
                    activeTask?.details?.product_name ??
                    activeTask?.product_name ??
                    String(activeTask?.id ?? "")
                }
                loading={deleting}
                typeItem="vazifa"
            />
        </Box>
    );
}

import {
    Badge,
    Box,
    Button,
    Flex,
    Heading,
    IconButton,
    Input,
    InputGroup,
    InputRightElement,
    Select,
    SimpleGrid,
    Spinner,
    Text,
    useColorModeValue,
    useDisclosure,
    useToast,
} from "@chakra-ui/react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router";
import { apiLots } from "../../utils/Controllers/Lots";
import CreateLotModal from "./_components/CreateLotModal";
import EditLotModal from "./_components/EditLotModal";
import ConfirmDelModal from "../../components/common/ConfirmDelModal";
import { PencilLine, Plus, Search, Trash2, X } from "lucide-react";
import PaginationBar from "../../components/common/PaginationBar";
import { LotCardIconRows } from "../../components/common/EntityCardDetailRows";
import CreateExel from "./_components/CreateExel";

export default function LotCreatorLots() {
    const navigate = useNavigate();
    const { pathname } = useLocation();
    const toast = useToast();
    const createLotModal = useDisclosure();
    const editLotModal = useDisclosure();
    const deleteLotModal = useDisclosure();
    const [activeLotId, setActiveLotId] = useState(null);
    const [activeLot, setActiveLot] = useState(null);
    const [deletingLot, setDeletingLot] = useState(false);
    const TYPE_OPTIONS = useMemo(
        () => [
            "Mukamal qurilish",
            "Rekanstruksiya qilish",
            "Qurilish",
            "Landshaft dizayn va obodanlashtirish",
            "Joriy tamirlash",
            "Modernizatsiya",
            "Tamirlash",
        ],
        []
    );

    const CATEGORY_OPTIONS = useMemo(
        () => ["Umum qurilish ijtimoiy", "Meleratsiya va irigatsiya", "Avtomobil yo'lari va ko'priklar"],
        []
    );

    const [loading, setLoading] = useState(false);
    const [lots, setLots] = useState([]);
    const [pagination, setPagination] = useState(null);

    const [filters, setFilters] = useState({
        type: "",
        category: "",
        searchName: "",
        page: 1,
    });
    const requestSeq = useRef(0);

    const extractList = (res) => {
        // backend can be: {data:{data:{records, pagination}}} or {data:{records, pagination}} or array
        const data = res?.data;
        const records = data?.data?.records ?? data?.records ?? data?.data ?? data;
        const pag = data?.data?.pagination ?? data?.pagination ?? null;
        return {
            records: Array.isArray(records) ? records : [],
            pagination: pag,
        };
    };

    const fetchLots = async (next = {}) => {
        const seq = ++requestSeq.current;
        try {
            setLoading(true);
            const params = {
                type: next.type ?? filters.type ?? undefined,
                category: next.category ?? filters.category ?? undefined,
                searchName: (next.searchName ?? filters.searchName)?.trim() || undefined,
                page: next.page ?? filters.page ?? 1,
            };
            const res = await apiLots.filter(params);
            if (seq === requestSeq.current) {
                const list = extractList(res);
                setLots(list.records);
                setPagination(list.pagination);
            }
        } finally {
            if (seq === requestSeq.current) setLoading(false);
        }
    };

    const fetchFiltered = async (nextFilters) => {
        const seq = ++requestSeq.current;
        try {
            setLoading(true);
            const res = await apiLots.filter(nextFilters);
            if (seq === requestSeq.current) {
                const list = extractList(res);
                setLots(list.records);
                setPagination(list.pagination);
            }
        } finally {
            if (seq === requestSeq.current) setLoading(false);
        }
    };

    useEffect(() => {
        fetchLots({ page: 1 });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Auto-fetch on filter change (debounced for searchName)
    useEffect(() => {
        const t = setTimeout(() => {
            // always use filter endpoint
            fetchLots();
        }, 350);

        return () => clearTimeout(t);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filters.type, filters.category, filters.searchName, filters.page]);

    const formatMoneyUz = (amount) => {
        if (amount === null || amount === undefined || amount === "") return "—";
        const n = Number(amount);
        if (Number.isNaN(n)) return String(amount);
        return `${n.toLocaleString("uz-UZ")} so'm`;
    };

    const formatDateUz = (v) => {
        if (!v) return "—";
        const d = new Date(v);
        if (Number.isNaN(d.getTime())) return String(v);
        return d.toLocaleDateString("uz-UZ", { year: "numeric", month: "short", day: "2-digit" });
    };

    const goToLotDetail = (lotId) => {
        if (lotId == null || lotId === "") return;
        const base = pathname.startsWith("/lotcreator") ? "/lotcreator/lots" : "/lots";
        navigate(`${base}/${lotId}`);
    };

    const deleteLotItemName =
        activeLot?.lot_name ??
        activeLot?.lotName ??
        activeLot?.name ??
        activeLot?.title ??
        (activeLot?.id != null ? `Lot #${activeLot.id}` : "");

    const handleConfirmDeleteLot = async () => {
        if (!activeLot?.id) return;
        setDeletingLot(true);
        try {
            await apiLots.delete(activeLot.id);
            toast({
                title: "O‘chirildi",
                description: "Lot o‘chirildi",
                status: "success",
                duration: 2500,
                isClosable: true,
            });
            fetchLots();
            deleteLotModal.onClose();
            setActiveLot(null);
        } catch (e) {
            const msg = e?.response?.data?.message;
            toast({
                title: "Xatolik",
                description: Array.isArray(msg) ? msg.join(". ") : msg || "O‘chirib bo‘lmadi",
                status: "error",
                duration: 6000,
                isClosable: true,
            });
        } finally {
            setDeletingLot(false);
        }
    };

    const inputBg = useColorModeValue("white", "gray.800");
    const borderCol = useColorModeValue("gray.200", "gray.600");
    const cardBg = useColorModeValue("white", "gray.800");
    const cardBorder = useColorModeValue("gray.200", "gray.700");

    return (
        <Box pl="20px" pr="20px" pb="20px" pt="20px">
            <Flex justify="space-between" align="center" mb="16px" gap="12px" flexWrap="wrap">
                <Box>
                    <Heading size="lg" mb="6px">
                        Lotlar
                    </Heading>
                </Box>

                <Flex alignItems={'center'} gap={3}>
                    <CreateExel onCreated={() => fetchLots({ page: 1 })} />
                    <Button leftIcon={<Plus size={15} />} colorScheme="blue" onClick={createLotModal.onOpen}>
                        Yaratish
                    </Button>
                </Flex>
            </Flex>

            <Flex gap={3} mb="20px" flexWrap="wrap" align="center">
                <InputGroup maxW="320px" size="md" flex="1 1 240px">
                    <Input
                        placeholder="Qidiruv..."
                        value={filters.searchName}
                        onChange={(e) => setFilters((p) => ({ ...p, searchName: e.target.value, page: 1 }))}
                        bg={inputBg}
                        borderRadius="8px"
                        borderColor={borderCol}
                    />
                    <InputRightElement>
                        {filters.searchName?.trim() ? (
                            <IconButton
                                size="xs"
                                variant="ghost"
                                aria-label="Tozalash"
                                icon={<X size={13} />}
                                onClick={() => setFilters((p) => ({ ...p, searchName: "", page: 1 }))}
                            />
                        ) : (
                            <Search size={14} color="gray" />
                        )}
                    </InputRightElement>
                </InputGroup>

                <Select
                    size="md"
                    maxW="240px"
                    flex="1 1 200px"
                    value={filters.type}
                    onChange={(e) => setFilters((p) => ({ ...p, type: e.target.value, page: 1 }))}
                    placeholder="Type (hammasi)"
                    bg={inputBg}
                    borderRadius="8px"
                    borderColor={borderCol}
                >
                    {TYPE_OPTIONS.map((t) => (
                        <option key={t} value={t}>
                            {t}
                        </option>
                    ))}
                </Select>

                <Select
                    size="md"
                    maxW="280px"
                    flex="1 1 220px"
                    value={filters.category}
                    onChange={(e) => setFilters((p) => ({ ...p, category: e.target.value, page: 1 }))}
                    placeholder="Category (hammasi)"
                    bg={inputBg}
                    borderRadius="8px"
                    borderColor={borderCol}
                >
                    {CATEGORY_OPTIONS.map((c) => (
                        <option key={c} value={c}>
                            {c}
                        </option>
                    ))}
                </Select>

                <Badge colorScheme="blue" px={3} py={1} borderRadius="full" fontSize="sm" fontWeight="semibold">
                    {loading ? (
                        <Flex align="center" gap={1}>
                            <Spinner size="xs" /> <span>Yuklanmoqda...</span>
                        </Flex>
                    ) : (
                        `Jami: ${(pagination?.total_count ?? lots.length) || 0} ta`
                    )}
                </Badge>
            </Flex>

            {/* LIST */}
            <Box>
                {loading ? (
                    <Flex justify="center" py="50px">
                        <Spinner size="xl" />
                    </Flex>
                ) : lots.length === 0 ? (
                    <Box borderWidth="1px" borderColor="border" borderRadius="16px" p="18px" bg="surface">
                        <Text color="textSub">Lot topilmadi</Text>
                    </Box>
                ) : (
                    <SimpleGrid columns={{ base: 1, md: 2, xl: 3 }} spacing="20px">
                        {lots.map((lot) => {
                            const title =
                                lot?.name ??
                                lot?.title ??
                                lot?.lot_name ??
                                lot?.objectName ??
                                lot?.searchName ??
                                `Lot #${lot?.id ?? ""}`;
                            const type = lot?.type ?? lot?.lot_type;
                            const category = lot?.category ?? lot?.lot_category;
                            const lotNumber = lot?.lot_number ?? lot?.lotNumber ?? lot?.number ?? "—";
                            const amount = formatMoneyUz(lot?.amount ?? lot?.sum ?? lot?.total_sum);
                            const address = lot?.address ?? "—";
                            const start = formatDateUz(lot?.start_date ?? lot?.startDate);
                            const end = formatDateUz(lot?.end_date ?? lot?.endDate);

                            return (
                                <Box
                                    key={lot?.id ?? `${title}-${Math.random()}`}
                                    bg={cardBg}
                                    border="1px solid"
                                    borderColor={cardBorder}
                                    borderRadius="12px"
                                    p="16px"
                                    position="relative"
                                    transition="all .2s"
                                    cursor="pointer"
                                    _hover={{ shadow: "md", borderColor: "blue.300" }}
                                    role="group"
                                    onClick={() => goToLotDetail(lot?.id)}
                                >
                                    <Box position="absolute" top="8px" right="8px" zIndex={1} onClick={(e) => e.stopPropagation()}>
                                        <Flex gap="6px">
                                            <IconButton
                                                size="sm"
                                                aria-label="Edit lot"
                                                variant="ghost"
                                                colorScheme="blue"
                                                icon={<PencilLine size={18} />}
                                                onClick={() => {
                                                    setActiveLotId(lot?.id);
                                                    editLotModal.onOpen();
                                                }}
                                            />
                                            <IconButton
                                                size="sm"
                                                aria-label="Delete lot"
                                                variant="ghost"
                                                colorScheme="red"
                                                icon={<Trash2 size={18} />}
                                                onClick={() => {
                                                    setActiveLot(lot);
                                                    deleteLotModal.onOpen();
                                                }}
                                            />
                                        </Flex>
                                    </Box>

                                    <Box pr={{ base: "72px", md: "80px" }}>
                                        <Text fontWeight="600" fontSize="lg" mb="4px" noOfLines={2}>
                                            {title}
                                        </Text>
                                        <Text fontSize="xs" color="gray.500" noOfLines={1} mb="10px">
                                            #{lotNumber}
                                        </Text>
                                        <LotCardIconRows
                                            amount={amount}
                                            address={address}
                                            periodLabel={`${start} — ${end}`}
                                        />
                                    </Box>

                                    <Flex gap="8px" mt="10px" flexWrap="wrap">
                                        {type ? (
                                            <Badge colorScheme="purple" variant="subtle">
                                                {type}
                                            </Badge>
                                        ) : null}
                                        {category ? (
                                            <Badge colorScheme="blue" variant="subtle">
                                                {category}
                                            </Badge>
                                        ) : null}
                                    </Flex>
                                </Box>
                            );
                        })}
                    </SimpleGrid>
                )}
            </Box>

            {/* PAGINATION (bottom) */}
            {pagination ? (
                <PaginationBar
                    mt="30px"
                    page={pagination.currentPage ?? 1}
                    totalPages={pagination.total_pages ?? 1}
                    loading={loading}
                    onPageChange={(p) => setFilters((prev) => ({ ...prev, page: p }))}
                />
            ) : null}
            <CreateLotModal
                isOpen={createLotModal.isOpen}
                onClose={createLotModal.onClose}
                typeOptions={TYPE_OPTIONS}
                categoryOptions={CATEGORY_OPTIONS}
                onCreated={() => {
                    fetchLots({ page: 1 });
                }}
            />

            <EditLotModal
                isOpen={editLotModal.isOpen}
                onClose={() => {
                    editLotModal.onClose();
                    setActiveLotId(null);
                }}
                lotId={activeLotId}
                typeOptions={TYPE_OPTIONS}
                categoryOptions={CATEGORY_OPTIONS}
                onUpdated={() => {
                    fetchLots();
                }}
            />

            <ConfirmDelModal
                isOpen={deleteLotModal.isOpen}
                onClose={() => {
                    deleteLotModal.onClose();
                    setActiveLot(null);
                }}
                onConfirm={handleConfirmDeleteLot}
                itemName={deleteLotItemName}
                loading={deletingLot}
                typeItem="lot"
            />
        </Box>
    );
}


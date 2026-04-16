import {
    Badge,
    Box,
    Button,
    Flex,
    Grid,
    Heading,
    IconButton,
    Input,
    Select,
    Spinner,
    Text,
    useDisclosure,
    HStack,
} from "@chakra-ui/react";
import { useEffect, useMemo, useRef, useState } from "react";
import { apiLots } from "../../utils/Controllers/Lots";
import CreateLotModal from "./_components/CreateLotModal";
import EditLotModal from "./_components/EditLotModal";
import DeleteLotModal from "./_components/DeleteLotModal";
import { PencilLine, Trash2 } from "lucide-react";

export default function LotCreatorLots() {
    const createLotModal = useDisclosure();
    const editLotModal = useDisclosure();
    const deleteLotModal = useDisclosure();
    const [activeLotId, setActiveLotId] = useState(null);
    const [activeLot, setActiveLot] = useState(null);
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

    return (
        <Box py="20px" pr="20px">
            <Flex justify="space-between" align="center" mb="16px" gap="12px" flexWrap="wrap">
                <Box>
                    <Heading size="lg" mb="6px">
                        Lotlar
                    </Heading>
                </Box>

                <Button variant="solidPrimary" onClick={createLotModal.onOpen}>
                    + Yaratish
                </Button>
            </Flex>

            <Flex
                mb="14px"
                gap="10px"
                flexWrap="wrap"
                align="center"
                bg="surface"
                borderWidth="1px"
                borderColor="border"
                borderRadius="16px"
                p="12px"
            >
                <Box minW={{ base: "100%", md: "240px" }} flex="1">
                    <Input
                        value={filters.searchName}
                        onChange={(e) => setFilters((p) => ({ ...p, searchName: e.target.value }))}
                        placeholder="Lot nomi..."
                        bg="bg"
                        borderColor="border"
                    />
                </Box>

                <Box minW={{ base: "100%", md: "260px" }}>
                    <Select
                        value={filters.type}
                        onChange={(e) => setFilters((p) => ({ ...p, type: e.target.value, page: 1 }))}
                        placeholder="Type tanlang"
                        bg="bg"
                        borderColor="border"
                    >
                        {TYPE_OPTIONS.map((t) => (
                            <option key={t} value={t}>
                                {t}
                            </option>
                        ))}
                    </Select>
                </Box>

                <Box minW={{ base: "100%", md: "260px" }}>
                 
                    <Select
                        value={filters.category}
                        onChange={(e) => setFilters((p) => ({ ...p, category: e.target.value, page: 1 }))}
                        placeholder="Category tanlang"
                        bg="bg"
                        borderColor="border"
                    >
                        {CATEGORY_OPTIONS.map((c) => (
                            <option key={c} value={c}>
                                {c}
                            </option>
                        ))}
                    </Select>
                </Box>

                {pagination ? (
                    <Box
                        ml={{ base: 0, md: "auto" }}
                        w={{ base: "100%", md: "auto" }}
                        bg="bg"
                        borderWidth="1px"
                        borderColor="border"
                        borderRadius="999px"
                        px="14px"
                        py="10px"
                        textAlign={{ base: "center", md: "left" }}
                    >
                        <Text fontSize="sm" fontWeight="600">
                            Jami: {pagination.total_count ?? "-"}
                        </Text>
                    </Box>
                ) : null}
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
                    <Grid templateColumns={{ base: "1fr", lg: "repeat(2, 1fr)", xl: "repeat(3, 1fr)" }} gap="14px">
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
                            const createdAt = lot?.createdAt ?? lot?.created_at;

                            return (
                                <Box
                                    key={lot?.id ?? `${title}-${Math.random()}`}
                                    bg="surface"
                                    borderWidth="1px"
                                    borderColor="border"
                                    borderRadius="16px"
                                    p="14px"
                                    _hover={{ borderColor: "green.400", boxShadow: "md", transform: "translateY(-2px)" }}
                                    transition="0.15s ease"
                                    cursor="pointer"
                                >
                                    <Flex justify="space-between" align="start" gap="10px">
                                        <Box>
                                            <Heading size="sm" mb="6px" noOfLines={2}>
                                                {title}
                                            </Heading>
                                            {createdAt ? (
                                                <Text fontSize="xs" color="textSub">
                                                    {new Date(createdAt).toLocaleDateString()}
                                                </Text>
                                            ) : (
                                                <Text fontSize="xs" color="textSub">
                                                    ID: {lot?.id ?? "-"}
                                                </Text>
                                            )}
                                        </Box>
                                        <Flex gap="6px" onClick={(e) => e.stopPropagation()}>
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
                                    </Flex>

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
                    </Grid>
                )}
            </Box>

            {/* PAGINATION (bottom) */}
            {pagination ? (
                <Flex mt="16px" justify="space-between" align="center" flexWrap="wrap" gap="10px">
                    <Text fontSize="sm" color="textSub">
                        Sahifa: {pagination.currentPage ?? 1} / {pagination.total_pages ?? 1}
                    </Text>
                    <HStack>
                        <Button
                            size="sm"
                            onClick={() => {
                                const prev = (pagination.currentPage ?? 1) - 1;
                                if (prev < 1) return;
                                setFilters((p) => ({ ...p, page: prev }));
                            }}
                            isDisabled={(pagination.currentPage ?? 1) <= 1 || loading}
                        >
                            Oldingi
                        </Button>
                        <Button
                            size="sm"
                            onClick={() => {
                                const curr = pagination.currentPage ?? 1;
                                const total = pagination.total_pages ?? curr;
                                const nextPage = curr + 1;
                                if (nextPage > total) return;
                                setFilters((p) => ({ ...p, page: nextPage }));
                            }}
                            isDisabled={(pagination.currentPage ?? 1) >= (pagination.total_pages ?? 1) || loading}
                        >
                            Keyingi
                        </Button>
                    </HStack>
                </Flex>
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

            <DeleteLotModal
                isOpen={deleteLotModal.isOpen}
                onClose={() => {
                    deleteLotModal.onClose();
                    setActiveLot(null);
                }}
                lot={activeLot}
                onDeleted={() => {
                    fetchLots();
                }}
            />
        </Box>
    );
}


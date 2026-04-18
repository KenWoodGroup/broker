import {
    Badge,
    Box,
    Flex,
    Heading,
    Input,
    InputGroup,
    InputRightElement,
    Select,
    SimpleGrid,
    Spinner,
    Text,
    IconButton,
    useColorModeValue,
} from "@chakra-ui/react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { Search, X } from "lucide-react";
import { apiLots } from "../../utils/Controllers/Lots";
import PaginationBar from "../../components/common/PaginationBar";
import { LotCardIconRows } from "../../components/common/EntityCardDetailRows";

export default function CallOperatorLots() {
    const navigate = useNavigate();

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
        const data = res?.data;
        const records = data?.data?.records ?? data?.records ?? data?.data ?? data;
        const pag = data?.data?.pagination ?? data?.pagination ?? null;
        return {
            records: Array.isArray(records) ? records : [],
            pagination: pag,
        };
    };

    const fetchLots = async () => {
        const seq = ++requestSeq.current;
        try {
            setLoading(true);
            const params = {
                type: filters.type || undefined,
                category: filters.category || undefined,
                searchName: filters.searchName?.trim() || undefined,
                page: filters.page || 1,
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

    useEffect(() => {
        fetchLots();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        const t = setTimeout(() => {
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

                <Badge
                    colorScheme="blue"
                    px={3}
                    py={1}
                    borderRadius="full"
                    fontSize="sm"
                    fontWeight="semibold"
                    ml={{ base: 0, md: "auto" }}
                >
                    {loading ? (
                        <Flex align="center" gap={1}>
                            <Spinner size="xs" /> <span>Yuklanmoqda...</span>
                        </Flex>
                    ) : (
                        `Jami: ${(pagination?.total_count ?? lots.length) || 0} ta`
                    )}
                </Badge>
            </Flex>

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
                                    transition="all .2s"
                                    cursor="pointer"
                                    _hover={{ shadow: "md", borderColor: "blue.300" }}
                                    onClick={() => {
                                        if (lot?.id != null && lot?.id !== "") {
                                            navigate(`/call-operator/lots/${lot.id}`);
                                        }
                                    }}
                                >
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

            {pagination ? (
                <PaginationBar
                    mt="30px"
                    page={pagination.currentPage ?? 1}
                    totalPages={pagination.total_pages ?? 1}
                    loading={loading}
                    onPageChange={(p) => setFilters((prev) => ({ ...prev, page: p }))}
                />
            ) : null}
        </Box>
    );
}

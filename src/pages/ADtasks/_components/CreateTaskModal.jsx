import React, { useCallback, useEffect, useState } from "react";
import {
    Modal,
    ModalOverlay,
    ModalContent,
    ModalBody,
    ModalFooter,
    ModalCloseButton,
    Button,
    VStack,
    HStack,
    Text,
    Select,
    Input,
    Box,
    useToast,
    useColorModeValue,
    Flex,
    Icon,
    InputGroup,
    InputLeftElement,
    Badge,
    Spinner,
} from "@chakra-ui/react";
import {
    Plus,
    Search,
    DollarSign,
    ClipboardList,
    MapPin,
    Package,
} from "lucide-react";
import { apiStock } from "../../../utils/Controllers/apiStock";
import { apiTasks } from "../../../utils/Controllers/apiTasks";

const UUID_RE =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function isUuid(v) {
    if (v == null) return false;
    const s = typeof v === "string" ? v.trim() : String(v).trim();
    return UUID_RE.test(s);
}

function pickUuid(...cands) {
    for (const c of cands) {
        if (c == null) continue;
        const s = typeof c === "string" ? c.trim() : String(c);
        if (isUuid(s)) return s;
    }
    return "";
}

function factoryFromStock(stock) {
    if (!stock) return "";
    const d = pickUuid(
        stock.location?.parent?.id,
        stock.factory_id,
        stock.product?.factory_id,
        stock.product?.factory?.id
    );
    if (d) return d;
    let n = stock.location;
    const seen = new Set();
    while (n && !seen.has(n)) {
        seen.add(n);
        const type = String(n.type || n.location_type || "").toLowerCase();
        if (type === "factory") {
            const id = pickUuid(n.id);
            if (id) return id;
        }
        n = n.parent;
    }
    return pickUuid(
        stock.location?.factory_id,
        stock.location?.parent_id,
        stock.product?.location?.parent?.id
    );
}

function warehouseFromStock(stock) {
    return pickUuid(stock?.location_id, stock?.location?.id);
}

function categoryLabel(stock, lineItem) {
    const p = stock?.product || {};
    const o = lineItem || {};
    const v =
        p.category?.name ||
        p.local_category?.name ||
        p.category_name ||
        o.category_name ||
        o.product_category_name ||
        "";
    return String(v).trim() || "Kategoriyasiz";
}

const MAX_PAGES = 25;

async function enrichStockFromBroker(stock, lineItem) {
    const name =
        stock?.product?.name?.trim() ||
        lineItem?.product_name?.trim() ||
        "";
    const id = stock?.id != null ? String(stock.id) : "";
    if (!name || !id) return null;
    let page = 1;
    let total = 1;
    try {
        do {
            const res = await apiStock.GetByAdress({ name, page });
            const rows = res?.data?.data ?? [];
            const m = rows.find((r) => r && String(r.id) === id);
            if (m) {
                return {
                    ...stock,
                    ...m,
                    product: { ...(stock?.product || {}), ...(m.product || {}) },
                    location: m.location ?? stock.location,
                };
            }
            total = res?.data?.pagination?.totalPages ?? 1;
            page += 1;
        } while (page <= total && page <= MAX_PAGES);
    } catch (e) {
        console.error(e);
    }
    return null;
}

function hiddenIdsFromStock(stock) {
    if (!stock) {
        return { factory_id: "", warehouse_id: "", stock_id: "" };
    }
    const fid = factoryFromStock(stock);
    const wid = warehouseFromStock(stock);
    const sid = stock.id != null ? String(stock.id).trim() : "";
    return { factory_id: fid, warehouse_id: wid, stock_id: sid };
}

function formatApiErr(err) {
    const m = err?.response?.data?.message;
    if (Array.isArray(m)) return m.join(". ");
    if (typeof m === "string") return m;
    return null;
}

function formatPrice(price) {
    const n = parseFloat(price);
    if (Number.isNaN(n)) return "—";
    return `${n.toLocaleString("uz-UZ")} UZS`;
}

export default function CreateTaskModal({ isOpen, onClose, onCreated }) {
    const toast = useToast();
    const [taskType, setTaskType] = useState("reorder");
    const [searchTerm, setSearchTerm] = useState("");
    const [stockData, setStockData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const [selectedStock, setSelectedStock] = useState(null);
    const [priority, setPriority] = useState("normal");
    const [dueDate, setDueDate] = useState("");
    const [submitting, setSubmitting] = useState(false);

    const panelBg = useColorModeValue("gray.50", "whiteAlpha.50");
    const cardBorder = useColorModeValue("gray.200", "whiteAlpha.200");
    const footerBg = useColorModeValue("gray.50", "whiteAlpha.50");
    const headerBorder = useColorModeValue("gray.200", "whiteAlpha.200");
    const heroBg = useColorModeValue(
        "linear-gradient(135deg, #eff6ff 0%, #e0e7ff 50%, #ddd6fe 100%)",
        "linear-gradient(135deg, rgba(59,130,246,0.2) 0%, rgba(99,102,241,0.25) 100%)"
    );
    const listItemBg = useColorModeValue("white", "whiteAlpha.100");
    const selectedRing = useColorModeValue("blue.400", "blue.300");
    const headerIconBg = useColorModeValue("white", "whiteAlpha.200");

    const lineItemForStock = useCallback(
        (s) =>
            s
                ? { product_name: s.product?.name || "", category_name: "" }
                : null,
        []
    );

    const fetchStock = useCallback(
        async (page = 1, search = "") => {
            try {
                setLoading(true);
                const response = await apiStock.GetByAdress({
                    name: search,
                    page,
                });
                if (response?.data?.data) {
                    setStockData(response.data.data);
                    setCurrentPage(response.data.pagination?.currentPage || 1);
                    setTotalPages(response.data.pagination?.totalPages || 1);
                    setTotalCount(response.data.pagination?.totalCount || 0);
                } else {
                    setStockData([]);
                }
            } catch (error) {
                console.error(error);
                toast({
                    title: "Xatolik",
                    description: "Stokni yuklashda muammo",
                    status: "error",
                    duration: 4000,
                    isClosable: true,
                });
                setStockData([]);
            } finally {
                setLoading(false);
            }
        },
        [toast]
    );

    useEffect(() => {
        if (!isOpen) return;
        setTaskType("reorder");
        setSearchTerm("");
        setStockData([]);
        setCurrentPage(1);
        setTotalPages(1);
        setTotalCount(0);
        setSelectedStock(null);
        setPriority("normal");
        setDueDate("");
    }, [isOpen]);

    const handleSearch = () => {
        fetchStock(1, searchTerm.trim());
    };

    useEffect(() => {
        if (!isOpen || !selectedStock?.id) return;
        const fid = factoryFromStock(selectedStock);
        const wid = warehouseFromStock(selectedStock);
        if (fid && wid) return;
        const stockSnapshot = selectedStock;
        let cancelled = false;
        (async () => {
            const merged = await enrichStockFromBroker(
                stockSnapshot,
                lineItemForStock(stockSnapshot)
            );
            if (cancelled || !merged) return;
            setSelectedStock(merged);
        })();
        return () => {
            cancelled = true;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps -- yangi stok tanlanganda bir marta boyitish
    }, [isOpen, selectedStock?.id, lineItemForStock]);

    const submit = async () => {
        if (!selectedStock) {
            toast({
                title: "Tanlang",
                description: "Avval ro'yxatdan stok tanlang",
                status: "warning",
                duration: 4000,
                isClosable: true,
            });
            return;
        }

        let stock = selectedStock;
        let ids = hiddenIdsFromStock(stock);
        if (
            taskType === "price_update" &&
            (!isUuid(ids.factory_id) ||
                !isUuid(ids.warehouse_id) ||
                !isUuid(ids.stock_id))
        ) {
            const merged = await enrichStockFromBroker(
                stock,
                lineItemForStock(stock)
            );
            if (merged) {
                stock = merged;
                setSelectedStock(merged);
                ids = hiddenIdsFromStock(merged);
            }
        }

        const productName = (stock?.product?.name || "").trim();
        const categoryName = categoryLabel(stock, lineItemForStock(stock));
        if (!productName) {
            toast({
                title: "Ma'lumot",
                description: "Mahsulot nomi topilmadi",
                status: "warning",
                duration: 4000,
                isClosable: true,
            });
            return;
        }

        const body = {
            assignee_type: "supplier",
            type: taskType,
            priority,
            source: "manual",
            details: {
                product_name: productName,
                category_name: categoryName,
                factory_id: ids.factory_id,
                warehouse_id: ids.warehouse_id,
                stock_id: ids.stock_id,
            },
        };

        if (taskType === "price_update") {
            if (!isUuid(ids.factory_id)) {
                toast({
                    title: "Zavod",
                    description:
                        "factory_id aniqlanmadi. Boshqa stok tanlang yoki keyinroq urinib ko'ring.",
                    status: "warning",
                    duration: 5000,
                    isClosable: true,
                });
                return;
            }
            if (!isUuid(ids.warehouse_id) || !isUuid(ids.stock_id)) {
                toast({
                    title: "Ma'lumot",
                    description: "warehouse_id yoki stock_id noto'g'ri",
                    status: "warning",
                    duration: 4000,
                    isClosable: true,
                });
                return;
            }
            if (dueDate) {
                const d = new Date(dueDate);
                if (!Number.isNaN(d.getTime())) body.due_date = d.toISOString();
            }
        }

        setSubmitting(true);
        try {
            await apiTasks.create(body);
            toast({
                title: "Yuborildi",
                description: "Vazifa yaratildi",
                status: "success",
                duration: 3000,
                isClosable: true,
            });
            onCreated?.();
            onClose();
        } catch (e) {
            console.error(e);
            toast({
                title: "Xatolik",
                description: formatApiErr(e) || "So'rov xatosi",
                status: "error",
                duration: 6000,
                isClosable: true,
            });
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            size="xl"
            scrollBehavior="inside"
            isCentered
            motionPreset="slideInBottom"
        >
            <ModalOverlay bg="blackAlpha.600" backdropFilter="blur(6px)" />
            <ModalContent
                borderRadius="2xl"
                overflow="hidden"
                boxShadow="2xl"
                maxH="90vh"
                bg="surface"
            >
                <Box
                    px={6}
                    py={5}
                    borderBottomWidth="1px"
                    borderColor={headerBorder}
                    bgImage={heroBg}
                >
                    <HStack justify="space-between" pr={10} align="start">
                        <HStack spacing={3}>
                            <Box>
                                <Text fontWeight="bold" fontSize="lg">
                                    Yangi vazifa
                                </Text>
                                <Text fontSize="sm" color="gray.400" mt={0.5}>
                                    Stokdan mahsulot tanlang va yuboring
                                </Text>
                            </Box>
                        </HStack>
                    </HStack>
                    <ModalCloseButton top={4} />
                </Box>

                <ModalBody px={6} py={5}>
                    <VStack align="stretch" spacing={5}>
                        <HStack spacing={3}>
                            <Button
                                flex={1}
                                size="md"
                                leftIcon={<Icon as={ClipboardList} boxSize={4} />}
                                variant={taskType === "reorder" ? "solid" : "outline"}
                                colorScheme="purple"
                                borderRadius="xl"
                                onClick={() => setTaskType("reorder")}
                            >
                                Mahsulot topish
                            </Button>
                            <Button
                                flex={1}
                                size="md"
                                leftIcon={<Icon as={DollarSign} boxSize={4} />}
                                variant={
                                    taskType === "price_update" ? "solid" : "outline"
                                }
                                colorScheme="orange"
                                borderRadius="xl"
                                onClick={() => setTaskType("price_update")}
                            >
                                Narx yangilash
                            </Button>
                        </HStack>

                        <Box
                            p={4}
                            borderRadius="xl"
                            bg={panelBg}
                            borderWidth="1px"
                            borderColor={cardBorder}
                        >
                            <Text fontSize="sm" fontWeight="bold" mb={3}>
                                Qidiruv
                            </Text>
                            <HStack spacing={2}>
                                <InputGroup size="md" flex={1}>
                                    <InputLeftElement pointerEvents="none">
                                        <Icon as={Search} color="gray.400" boxSize={4} />
                                    </InputLeftElement>
                                    <Input
                                        pl={10}
                                        borderRadius="lg"
                                        placeholder="Mahsulot nomi bo'yicha qidirish..."
                                        value={searchTerm}
                                        onChange={(e) =>
                                            setSearchTerm(e.target.value)
                                        }
                                        onKeyDown={(e) =>
                                            e.key === "Enter" && handleSearch()
                                        }
                                    />
                                </InputGroup>
                                <Button
                                    colorScheme="blue"
                                    borderRadius="lg"
                                    onClick={handleSearch}
                                    isLoading={loading}
                                >
                                    Qidirish
                                </Button>
                            </HStack>
                        </Box>

                        {!loading && stockData.length > 0 && (
                            <Text fontSize="sm" color="gray.600">
                                {totalCount} ta natija · sahifa {currentPage} /{" "}
                                {totalPages}
                            </Text>
                        )}

                        {loading ? (
                            <Flex justify="center" py={10}>
                                <Spinner color="blue.500" />
                            </Flex>
                        ) : stockData.length === 0 ? (
                            <Box
                                textAlign="center"
                                py={10}
                                borderRadius="xl"
                                borderWidth="1px"
                                borderStyle="dashed"
                                borderColor={cardBorder}
                            >
                                <Icon
                                    as={Package}
                                    boxSize={10}
                                    color="gray.300"
                                    mx="auto"
                                    mb={2}
                                />
                                <Text color="gray.500">
                                    Qidiruvni bosing yoki boshqa so&apos;z yozing
                                </Text>
                            </Box>
                        ) : (
                            <VStack align="stretch" spacing={3} maxH="280px" overflowY="auto" pr={1}>
                                {stockData.map((stock) => {
                                    const isSel =
                                        selectedStock &&
                                        String(selectedStock.id) ===
                                            String(stock.id);
                                    const price =
                                        stock.sale_price_type?.[0]?.sale_price ||
                                        stock.purchase_price;
                                    return (
                                        <Box
                                            key={stock.id}
                                            p={4}
                                            borderRadius="xl"
                                            borderWidth="2px"
                                            borderColor={
                                                isSel ? selectedRing : cardBorder
                                            }
                                            bg={isSel ? panelBg : listItemBg}
                                            cursor="pointer"
                                            transition="all 0.2s"
                                            _hover={{ shadow: "md" }}
                                            onClick={() => setSelectedStock(stock)}
                                        >
                                            <Flex
                                                justify="space-between"
                                                align="start"
                                                gap={3}
                                                wrap="wrap"
                                            >
                                                <Box minW={0}>
                                                    <Text fontWeight="semibold" noOfLines={2}>
                                                        {stock.product?.name}
                                                    </Text>
                                                    <Text fontSize="sm" color="gray.600">
                                                        Partiya: {stock.batch}
                                                    </Text>
                                                    <HStack mt={2} spacing={2}>
                                                        <Badge colorScheme="blue">
                                                            {parseFloat(
                                                                stock.quantity
                                                            ).toLocaleString()}{" "}
                                                            {stock.product?.unit}
                                                        </Badge>
                                                        <Badge
                                                            variant="outline"
                                                            maxW="200px"
                                                        >
                                                            <HStack spacing={1}>
                                                                <Icon
                                                                    as={MapPin}
                                                                    boxSize={3}
                                                                />
                                                                <Text
                                                                    isTruncated
                                                                    fontSize="xs"
                                                                >
                                                                    {stock.location
                                                                        ?.parent
                                                                        ?.name ||
                                                                        stock
                                                                            .location
                                                                            ?.address?.slice(
                                                                                0,
                                                                                28
                                                                            )}
                                                                </Text>
                                                            </HStack>
                                                        </Badge>
                                                    </HStack>
                                                </Box>
                                                <Text
                                                    fontWeight="bold"
                                                    fontSize="md"
                                                    color="blue.600"
                                                >
                                                    {formatPrice(price)}
                                                </Text>
                                            </Flex>
                                        </Box>
                                    );
                                })}
                            </VStack>
                        )}

                        {totalPages > 1 && (
                            <HStack justify="center" spacing={3}>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    borderRadius="lg"
                                    onClick={() =>
                                        fetchStock(currentPage - 1, searchTerm.trim())
                                    }
                                    isDisabled={currentPage <= 1 || loading}
                                >
                                    Oldingi
                                </Button>
                                <Text fontSize="sm">
                                    {currentPage} / {totalPages}
                                </Text>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    borderRadius="lg"
                                    onClick={() =>
                                        fetchStock(currentPage + 1, searchTerm.trim())
                                    }
                                    isDisabled={currentPage >= totalPages || loading}
                                >
                                    Keyingi
                                </Button>
                            </HStack>
                        )}

                        <Flex wrap="wrap" gap={4} align="flex-end">
                            <Box>
                                <Text fontSize="sm" fontWeight="semibold" mb={1}>
                                    Muhimlik
                                </Text>
                                <Select
                                    size="md"
                                    borderRadius="lg"
                                    maxW="220px"
                                    value={priority}
                                    onChange={(e) => setPriority(e.target.value)}
                                >
                                    <option value="low">Past</option>
                                    <option value="normal">Oddiy</option>
                                    <option value="high">Yuqori</option>
                                    <option value="urgent">Shoshilinch</option>
                                </Select>
                            </Box>
                            {taskType === "price_update" ? (
                                <Box flex="1" minW="200px">
                                    <Text fontSize="sm" fontWeight="semibold" mb={1}>
                                        Muddat (ixtiyoriy)
                                    </Text>
                                    <Input
                                        type="datetime-local"
                                        size="md"
                                        borderRadius="lg"
                                        value={dueDate}
                                        onChange={(e) => setDueDate(e.target.value)}
                                    />
                                    <Text fontSize="xs" color="gray.500" mt={2}>
                                        Vaqt zonasi: Toshkent (Asia/Tashkent)
                                    </Text>
                                </Box>
                            ) : null}
                        </Flex>
                    </VStack>
                </ModalBody>

                <ModalFooter
                    bg={footerBg}
                    borderTopWidth="1px"
                    borderColor={headerBorder}
                    gap={3}
                    py={4}
                    px={6}
                >
                    <Button variant="ghost" onClick={onClose} isDisabled={submitting}>
                        Bekor qilish
                    </Button>
                    <Button
                        colorScheme={taskType === "price_update" ? "orange" : "purple"}
                        onClick={submit}
                        isLoading={submitting}
                        px={8}
                        borderRadius="xl"
                        leftIcon={<Icon as={Plus} boxSize={4} />}
                    >
                        Yaratish
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
}

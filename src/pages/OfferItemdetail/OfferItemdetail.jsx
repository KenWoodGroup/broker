import { useState, useEffect, useRef, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
    Box, Flex, Text, Badge, Button, IconButton,
    Input, InputGroup, InputLeftElement, Select, Spinner,
    Alert, AlertIcon, useToast, useDisclosure, HStack, VStack,
    Switch, FormControl, FormLabel, FormErrorMessage,
    Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody,
    ModalFooter, ModalCloseButton,
    AlertDialog, AlertDialogBody, AlertDialogFooter,
    AlertDialogHeader, AlertDialogContent, AlertDialogOverlay,
    Divider, Collapse, Tooltip,
} from "@chakra-ui/react";

import { apiOfferItems } from "../../utils/Controllers/offerItems";
import { apiStock } from "../../utils/Controllers/apiStock";
import regions from "../../constants/regions/regions.json";
import districts from "../../constants/regions/districts.json";

// ─── Helpers ─────────────────────────────────────────────────────────────────

const fmtPrice = (n) => {
    const num = Number(n);
    if (!n || isNaN(num)) return "—";
    return num.toLocaleString("uz-UZ") + " so'm";
};

const fmtQty = (q, unit) => {
    const n = parseFloat(q);
    if (isNaN(n)) return "—";
    const str = n % 1 === 0 ? n.toFixed(0) : n.toFixed(2);
    return unit ? `${str} ${unit}` : str;
};

const STATUS_MAP = {
    pending: { label: "Yangi", scheme: "orange" },
    in_progress: { label: "Jarayonda", scheme: "blue" },
    variant_completed: { label: "Tugallangan", scheme: "green" },
};

// Strip internal UI fields before sending to API
const cleanForPayload = (v) => {
    const { _uid, _type, _id, ...rest } = v;
    if (!rest.stock_id) delete rest.stock_id;
    if (!rest.sale_type_id) delete rest.sale_type_id;
    return rest;
};

// ─── Icons ───────────────────────────────────────────────────────────────────

const SearchIco = () => (
    <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
        <circle cx="7" cy="7" r="4.5" stroke="currentColor" strokeWidth="1.3" />
        <path d="M10.5 10.5L13 13" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
);

const XIcon = ({ size = 12 }) => (
    <svg width={size} height={size} viewBox="0 0 12 12" fill="none">
        <path d="M9 3L3 9M3 3l6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
);

const ChevronIco = ({ up }) => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path d={up ? "M4 10l4-4 4 4" : "M4 6l4 4 4-4"}
            stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

const BackIco = () => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path d="M10 4L6 8l4 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

const PinIco = () => (
    <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
        <path d="M8 1.5C5.515 1.5 3.5 3.515 3.5 6c0 3.75 4.5 8.5 4.5 8.5s4.5-4.75 4.5-8.5c0-2.485-2.015-4.5-4.5-4.5z"
            stroke="currentColor" strokeWidth="1.2" />
        <circle cx="8" cy="6" r="1.5" stroke="currentColor" strokeWidth="1.2" />
    </svg>
);

// ─── Small reusable pieces ────────────────────────────────────────────────────

function InfoRow({ label, value, mono }) {
    return (
        <Flex gap={2} align="baseline" flexWrap="wrap">
            <Text fontSize="11px" color="textSub" flexShrink={0} minW="100px">{label}</Text>
            <Text
                fontSize="13px"
                color={value ? "text" : "textSub"}
                fontStyle={value ? "normal" : "italic"}
                fontFamily={mono ? "mono" : undefined}
                flex={1}
                noOfLines={2}
            >
                {value || "Ko'rsatilmagan"}
            </Text>
        </Flex>
    );
}

function SectionLabel({ children }) {
    return (
        <Text
            fontSize="10px"
            fontWeight={500}
            color="textSub"
            textTransform="uppercase"
            letterSpacing="0.8px"
            mb={2}
        >
            {children}
        </Text>
    );
}

function EmptyHint({ icon = "📭", title, sub }) {
    return (
        <Flex direction="column" align="center" py={10} px={4} gap={2} textAlign="center">
            <Text fontSize="26px">{icon}</Text>
            <Text fontSize="14px" fontWeight={500} color="text">{title}</Text>
            {sub && <Text fontSize="12px" color="textSub">{sub}</Text>}
        </Flex>
    );
}

// ─── Stock result card ────────────────────────────────────────────────────────

function StockCard({ item, isSelected, onAdd }) {
    const sp = item.sale_price_type?.[0];
    const price = sp?.sale_price ?? item.purchase_price;
    const locName = item.product?.location?.name || "—";
    const address = item.location?.address;
    const addrOk = address && address !== "Berilmagan";

    return (
        <Box
            bg="surface"
            border="0.5px solid"
            borderColor={isSelected ? "primary" : "border"}
            borderRadius="lg"
            p={3}
            opacity={isSelected ? 0.6 : 1}
            transition="border-color 0.12s, opacity 0.12s"
            _hover={!isSelected ? { borderColor: "primary" } : {}}
        >
            <Flex justify="space-between" align="flex-start" gap={3} mb={2}>
                <Box flex={1} minW={0}>
                    <Text fontSize="13px" fontWeight={500} color="text" noOfLines={2} lineHeight={1.45} mb="2px">
                        {item.product?.name || "—"}
                    </Text>
                    <Flex gap={2} align="center" flexWrap="wrap">
                        <Text fontSize="11px" color="textSub">{locName}</Text>
                        {item.product?.category?.name && (
                            <>
                                <Text fontSize="11px" color="textSub">·</Text>
                                <Badge fontSize="9px" colorScheme="gray" variant="subtle">
                                    {item.product.category.name}
                                </Badge>
                            </>
                        )}
                    </Flex>
                </Box>

                {isSelected ? (
                    <Badge colorScheme="green" fontSize="10px" flexShrink={0} px={2} py={1}>
                        ✓ Tanlandi
                    </Badge>
                ) : (
                    <Button
                        size="xs"
                        colorScheme="brand"
                        variant="outline"
                        onClick={() => onAdd(item)}
                        flexShrink={0}
                        fontSize="11px"
                        h="26px"
                        px={3}
                    >
                        + Tanlash
                    </Button>
                )}
            </Flex>

            <Divider borderColor="border" mb={2} />

            <Flex gap={4} flexWrap="wrap" fontSize="12px">
                <Box>
                    <Text color="textSub" display="inline">Narx: </Text>
                    <Text fontWeight={500} color="text" display="inline">{fmtPrice(price)}</Text>
                    <Text color="textSub" display="inline"> / {item.product?.unit || "—"}</Text>
                </Box>
                {item.location?.name && (
                    <Box>
                        <Text color="textSub" display="inline">Ombor: </Text>
                        <Text color="text" display="inline">{item.location.name}</Text>
                    </Box>
                )}
                {addrOk && (
                    <Flex align="center" gap={1} color="textSub">
                        <PinIco />
                        <Text>{address}</Text>
                    </Flex>
                )}
            </Flex>
        </Box>
    );
}

// ─── Single variant row (right panel & modal) ─────────────────────────────────

function VariantRow({ variant, isExisting, showRemove, onRemove, saving }) {
    return (
        <Box
            bg={isExisting ? "surface" : "rgba(0,136,230,0.04)"}
            border="0.5px solid"
            borderColor={isExisting ? "border" : "link"}
            borderRadius="md"
            p={3}
        >
            <Flex align="flex-start" gap={2}>
                <Box flex={1} minW={0}>
                    <Flex gap={1.5} mb={1} flexWrap="wrap">
                        <Badge
                            fontSize="9px"
                            colorScheme={isExisting ? "gray" : variant._type === "manual" ? "purple" : "blue"}
                            variant="subtle"
                        >
                            {isExisting ? "Saqlangan" : variant._type === "manual" ? "Qo'lda" : "Tizimdan"}
                        </Badge>
                        {variant.is_delivery && (
                            <Badge fontSize="9px" colorScheme="teal" variant="subtle">Yetkazib berish ✓</Badge>
                        )}
                    </Flex>
                    <Text fontSize="13px" fontWeight={500} color="text" noOfLines={1}>
                        {variant.product_name || "—"}
                    </Text>
                    <Text fontSize="11px" color="textSub" noOfLines={1} mt="1px">
                        {variant.factory_name || "—"}
                    </Text>
                    <Text fontSize="12px" fontWeight={500} color="link" mt="2px">
                        {fmtPrice(variant.cost_price)}
                    </Text>
                </Box>
                {showRemove && (
                    <Tooltip label="Olib tashlash" placement="left">
                        <IconButton
                            aria-label="Olib tashlash"
                            icon={<XIcon />}
                            size="xs"
                            variant="ghost"
                            colorScheme="red"
                            isLoading={saving}
                            onClick={onRemove}
                            flexShrink={0}
                        />
                    </Tooltip>
                )}
            </Flex>
        </Box>
    );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function OrderItemDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const toast = useToast({ position: "bottom-right" });

    // ── Order item state ───────────────────────────────────────────────────────
    const [orderItem, setOrderItem] = useState(null);
    const [orderLoading, setOrderLoading] = useState(true);
    const [orderError, setOrderError] = useState(null);
    const [bannerOpen, setBannerOpen] = useState(true);

    // ── Search state ───────────────────────────────────────────────────────────
    const [activeTab, setActiveTab] = useState("search");
    const [searchName, setSearchName] = useState("");
    const [selectedRegionId, setSelectedRegionId] = useState("");
    const [selectedDistrictId, setSelectedDistrictId] = useState("");
    const [selectedLocationId, setSelectedLocationId] = useState("");
    const [searchPage, setSearchPage] = useState(1);
    const [searchResults, setSearchResults] = useState([]);
    const [availableLocations, setAvailableLocations] = useState([]);
    const [searchPagination, setSearchPagination] = useState(null);
    const [searchLoading, setSearchLoading] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);

    // ── Manual form ────────────────────────────────────────────────────────────
    const [manualForm, setManualForm] = useState({
        factory_name: "", address: "", product_name: "", cost_price: "", is_delivery: false,
    });
    const [manualErrors, setManualErrors] = useState({});

    // ── Staged variants (not yet saved) ───────────────────────────────────────
    const [stagedVariants, setStagedVariants] = useState([]);

    // ── Confirm modal ──────────────────────────────────────────────────────────
    const { isOpen: isConfirmOpen, onOpen: openConfirm, onClose: closeConfirm } = useDisclosure();
    const [confirmExisting, setConfirmExisting] = useState([]);
    const [confirmStaged, setConfirmStaged] = useState([]);

    // ── Delete-only dialog ─────────────────────────────────────────────────────
    const [deleteTargetUid, setDeleteTargetUid] = useState(null);
    const deleteDialogCancel = useRef();

    const [saving, setSaving] = useState(false);

    // ── Derived ────────────────────────────────────────────────────────────────
    const existingVariants = useMemo(() => {
        if (!orderItem?.variants?.length) return [];
        return orderItem.variants.map((v, i) => ({
            ...v,
            _uid: v.stock_id || `ex_${i}`,
            _type: "existing",
        }));
    }, [orderItem]);

    const selectedStockIds = useMemo(() => {
        const fromEx = existingVariants.filter(v => v.stock_id).map(v => v.stock_id);
        const fromStaged = stagedVariants.filter(v => v.stock_id).map(v => v.stock_id);
        return new Set([...fromEx, ...fromStaged]);
    }, [existingVariants, stagedVariants]);

    const filteredDistricts = useMemo(() =>
        selectedRegionId
            ? districts.filter(d => d.region_id === Number(selectedRegionId))
            : [],
        [selectedRegionId]
    );

    const searchAddress = useMemo(() => {
        if (selectedDistrictId) {
            const d = districts.find(x => x.id === Number(selectedDistrictId));
            return d?.name_uz || "all";
        }
        if (selectedRegionId) {
            const r = regions.find(x => x.id === Number(selectedRegionId));
            return r?.name_uz || "all";
        }
        return "all";
    }, [selectedRegionId, selectedDistrictId]);

    const hasStaged = stagedVariants.length > 0;
    const totalCount = existingVariants.length + stagedVariants.length;

    // ── Fetch order item ───────────────────────────────────────────────────────
    const fetchOrderItem = async () => {
        setOrderLoading(true);
        setOrderError(null);
        try {
            const res = await apiOfferItems.getById(id);
            const data = res.data?.data || res.data;
            setOrderItem(data);
            if (data?.product_name) setSearchName(data.product_name);
        } catch {
            setOrderError("Buyurtma ma'lumotlarini yuklashda xatolik yuz berdi");
        } finally {
            setOrderLoading(false);
        }
    };

    useEffect(() => { fetchOrderItem(); }, [id]); // eslint-disable-line

    // ── Search (explicit params to avoid stale closures) ──────────────────────
    const doSearch = async ({ name, address, locationId, page }) => {
        setSearchLoading(true);
        setHasSearched(true);
        try {
            const res = await apiStock.GetStock({
                page: page || 1,
                name: name || "",
                address: address || "all",
                locationId: locationId || "all",
            });
            const data = res.data;
            setSearchResults(data.data || []);
            setSearchPagination(data.pagination || null);
            setSearchPage(page || 1);
            if (data.locations?.length) setAvailableLocations(data.locations);
        } catch {
            toast({ title: "Qidiruv xatoligi", description: "Iltimos qayta urinib ko'ring", status: "error", duration: 2500 });
            setSearchResults([]);
        } finally {
            setSearchLoading(false);
        }
    };

    const handleSearch = () => {
        setSelectedLocationId("");
        doSearch({ name: searchName, address: searchAddress, locationId: "all", page: 1 });
    };

    const handleRegionChange = (regionId) => {
        setSelectedRegionId(regionId);
        setSelectedDistrictId("");
    };

    const handleLocationFilter = (locId) => {
        setSelectedLocationId(locId);
        doSearch({ name: searchName, address: searchAddress, locationId: locId, page: searchPage });
    };

    const handlePageChange = (p) => {
        doSearch({ name: searchName, address: searchAddress, locationId: selectedLocationId, page: p });
    };

    // ── Staged management ──────────────────────────────────────────────────────
    const addToStaged = (item) => {
        if (selectedStockIds.has(item.id)) return;
        const sp = item.sale_price_type?.[0];
        setStagedVariants(prev => [...prev, {
            factory_name: item.product?.location?.name || "",
            address: item.location?.address || "",
            product_name: item.product?.name || "",
            cost_price: Number(sp?.sale_price ?? item.purchase_price ?? 0),
            stock_id: item.id,
            sale_type_id: sp?.id ?? null,
            is_delivery: false,
            _type: "stock",
            _id: item.id,
        }]);
        toast({
            title: "Variant qo'shildi",
            description: item.product?.name?.slice(0, 50),
            status: "success",
            duration: 1800,
        });
    };

    const removeFromStaged = (_id) => {
        setStagedVariants(prev => prev.filter(v => v._id !== _id));
    };

    const addManualToStaged = () => {
        const errs = {};
        if (!manualForm.factory_name.trim()) errs.factory_name = "Zavod nomi kiritilmagan";
        if (!manualForm.product_name.trim()) errs.product_name = "Mahsulot nomi kiritilmagan";
        const price = Number(manualForm.cost_price);
        if (!manualForm.cost_price || isNaN(price) || price <= 0) {
            errs.cost_price = "To'g'ri narx kiriting (musbat son)";
        }
        if (Object.keys(errs).length) { setManualErrors(errs); return; }

        setStagedVariants(prev => [...prev, {
            factory_name: manualForm.factory_name.trim(),
            address: manualForm.address.trim(),
            product_name: manualForm.product_name.trim(),
            cost_price: price,
            is_delivery: manualForm.is_delivery,
            _type: "manual",
            _id: `manual_${Date.now()}`,
        }]);
        setManualForm({ factory_name: "", address: "", product_name: "", cost_price: "", is_delivery: false });
        setManualErrors({});
        toast({ title: "Variant ro'yhatga qo'shildi", status: "success", duration: 1800 });
    };

    // ── Confirm modal ──────────────────────────────────────────────────────────
    const handleOpenConfirm = () => {
        setConfirmExisting(existingVariants.map((v, i) => ({ ...v, _uid: v.stock_id || `ex_${i}` })));
        setConfirmStaged([...stagedVariants]);
        openConfirm();
    };

    const handleSave = async () => {
        const payload = {
            offer_item_id: id,
            variants: [
                ...confirmExisting.map(cleanForPayload),
                ...confirmStaged.map(cleanForPayload),
            ],
        };
        setSaving(true);
        try {
            await apiOfferItems.PostVariants(payload);
            toast({ title: "Variantlar muvaffaqiyatli saqlandi!", status: "success", duration: 2500 });
            closeConfirm();
            navigate(-1);
        } catch {
            toast({
                title: "Saqlashda xatolik",
                description: "Server bilan bog'lanishda muammo yuz berdi. Qayta urinib ko'ring.",
                status: "error",
                duration: 3500,
            });
        } finally {
            setSaving(false);
        }
    };

    // ── Delete existing only (no staged) ──────────────────────────────────────
    const handleDeleteExistingOnly = async () => {
        const remaining = existingVariants
            .filter(v => v._uid !== deleteTargetUid)
            .map(cleanForPayload);

        setSaving(true);
        try {
            await apiOfferItems.PostVariants({ offer_item_id: id, variants: remaining });
            toast({ title: "Variant o'chirildi", status: "success" });
            setDeleteTargetUid(null);
            await fetchOrderItem();
        } catch {
            toast({ title: "O'chirishda xatolik", status: "error" });
        } finally {
            setSaving(false);
        }
    };

    // ─────────────────────────────────────────────────────────────────────────
    // RENDER
    // ─────────────────────────────────────────────────────────────────────────

    if (orderLoading) {
        return (
            <Flex h="70vh" align="center" justify="center" direction="column" gap={3}>
                <Spinner size="lg" color="primary" thickness="3px" speed="0.65s" />
                <Text fontSize="14px" color="textSub">Buyurtma yuklanmoqda...</Text>
            </Flex>
        );
    }

    if (orderError || !orderItem) {
        return (
            <Box p={6} maxW="480px">
                <Alert status="error" borderRadius="lg" fontSize="13px" mb={4}>
                    <AlertIcon />
                    {orderError || "Buyurtma topilmadi"}
                </Alert>
                <Button
                    size="sm"
                    variant="outline"
                    leftIcon={<BackIco />}
                    borderColor="border"
                    onClick={() => navigate(-1)}
                    fontSize="13px"
                >
                    Orqaga qaytish
                </Button>
            </Box>
        );
    }

    const status = STATUS_MAP[orderItem.status] || { label: orderItem.status, scheme: "gray" };

    // ─── JSX ─────────────────────────────────────────────────────────────────

    return (
        <Box bg="bg" minH="100vh">

            {/* ════════════════════ STICKY HEADER ════════════════════ */}
            <Box
                position="sticky"
                top={0}
                zIndex={20}
                bg="surface"
                borderBottom="0.5px solid"
                borderColor="border"
                boxShadow="0 1px 8px rgba(0,0,0,0.06)"
            >
                {/* Nav bar */}
                <Flex
                    align="center"
                    justify="space-between"
                    px={6}
                    h="56px"
                    borderBottom={bannerOpen ? "0.5px solid" : "none"}
                    borderColor="border"
                >
                    <HStack gap={3}>
                        <IconButton
                            aria-label="Orqaga"
                            icon={<BackIco />}
                            size="sm"
                            variant="ghost"
                            onClick={() => navigate(-1)}
                            borderRadius="md"
                        />
                        <Box>
                            <Flex align="center" gap={2}>
                                <Text fontSize="15px" fontWeight={500} color="text" noOfLines={1} maxW="360px">
                                    {orderItem.product_name || "Mahsulot"}
                                </Text>
                                <Badge colorScheme={status.scheme} fontSize="10px" px={2} py="2px">
                                    {status.label}
                                </Badge>
                            </Flex>
                            <Text fontSize="11px" color="textSub" fontFamily="mono">
                                {orderItem.offer?.offer_number || "—"}
                            </Text>
                        </Box>
                    </HStack>

                    <HStack gap={2}>
                        {totalCount > 0 && (
                            <Badge
                                colorScheme="blue"
                                borderRadius="full"
                                px={3}
                                fontSize="12px"
                                fontWeight={500}
                            >
                                {totalCount} variant
                            </Badge>
                        )}
                        <Tooltip label={bannerOpen ? "Buyurtma ma'lumotlarini yashirish" : "Buyurtma ma'lumotlarini ko'rish"}>
                            <IconButton
                                aria-label="Toggle banner"
                                icon={<ChevronIco up={bannerOpen} />}
                                size="sm"
                                variant="ghost"
                                onClick={() => setBannerOpen(b => !b)}
                                borderRadius="md"
                            />
                        </Tooltip>
                    </HStack>
                </Flex>

                {/* Collapsible order info */}
                <Collapse in={bannerOpen} animateOpacity>
                    <Box px={6} py={4}>
                        <Flex gap={0} flexWrap="wrap">
                            {/* Col 1: Buyurtma */}
                            <Box minW="200px" flex="1" pr={6} mb={2}>
                                <SectionLabel>Buyurtma</SectionLabel>
                                <VStack align="stretch" gap={1.5}>
                                    <InfoRow label="Mahsulot:" value={orderItem.product_name} />
                                    <InfoRow label="Miqdor:" value={fmtQty(orderItem.quantity, orderItem.unit)} />
                                    <InfoRow label="Holat:" value={status.label} />
                                </VStack>
                            </Box>

                            {/* Divider */}
                            <Box w="0.5px" bg="border" mr={6} mb={2} />

                            {/* Col 2: Narxlar */}
                            <Box minW="200px" flex="1" pr={6} mb={2}>
                                <SectionLabel>Narxlar</SectionLabel>
                                <VStack align="stretch" gap={1.5}>
                                    <InfoRow label="Mijoz narxi:" value={Number(orderItem.customer_price) > 0 ? fmtPrice(orderItem.customer_price) : null} />
                                    <InfoRow label="Tannarx:" value={Number(orderItem.cost_price) > 0 ? fmtPrice(orderItem.cost_price) : null} />
                                    <InfoRow label="Sotuv narxi:" value={Number(orderItem.sale_price) > 0 ? fmtPrice(orderItem.sale_price) : null} />
                                </VStack>
                            </Box>

                            {/* Divider */}
                            <Box w="0.5px" bg="border" mr={6} mb={2} />

                            {/* Col 3: Ob'ekt */}
                            <Box minW="200px" flex="1" mb={2}>
                                <SectionLabel>Ob'ekt ma'lumoti</SectionLabel>
                                <VStack align="stretch" gap={1.5}>
                                    <InfoRow label="Ob'ekt:" value={orderItem.offer?.construction_site_name} />
                                    <InfoRow label="Manzil:" value={orderItem.offer?.address} />
                                    <InfoRow label="Izoh:" value={orderItem.offer?.note} />
                                </VStack>
                            </Box>
                        </Flex>
                    </Box>
                </Collapse>
            </Box>

            {/* ════════════════════ MAIN CONTENT ════════════════════ */}
            <Flex gap={5} p={6} align="flex-start" maxW="1400px" mx="auto">

                {/* ──────────────── LEFT: Search panel ──────────────── */}
                <Box flex="1" minW={0}>

                    {/* Tab switcher */}
                    <Flex
                        gap={1}
                        mb={4}
                        bg="surface"
                        border="0.5px solid"
                        borderColor="border"
                        borderRadius="lg"
                        p="3px"
                        w="fit-content"
                    >
                        {[
                            { key: "search", label: "Tizimdan qidirish" },
                            { key: "manual", label: "Qo'lda kiritish" },
                        ].map(t => (
                            <Button
                                key={t.key}
                                size="sm"
                                variant={activeTab === t.key ? "solid" : "ghost"}
                                colorScheme={activeTab === t.key ? "brand" : "gray"}
                                onClick={() => setActiveTab(t.key)}
                                fontSize="13px"
                                h="30px"
                                px={4}
                                borderRadius="md"
                            >
                                {t.label}
                            </Button>
                        ))}
                    </Flex>

                    {/* ── Tab: Tizimdan qidirish ── */}
                    {activeTab === "search" ? (
                        <>
                            {/* Filter panel */}
                            <Box
                                bg="surface"
                                border="0.5px solid"
                                borderColor="border"
                                borderRadius="lg"
                                p={4}
                                mb={4}
                            >
                                <Flex gap={3} flexWrap="wrap" align="flex-end">
                                    {/* Name */}
                                    <Box flex="2" minW="200px">
                                        <Text fontSize="12px" color="textSub" mb={1.5}>Mahsulot nomi</Text>
                                        <InputGroup size="sm">
                                            <InputLeftElement pointerEvents="none" color="textSub" h="full" pl="2px">
                                                <SearchIco />
                                            </InputLeftElement>
                                            <Input
                                                pl="30px"
                                                value={searchName}
                                                onChange={e => setSearchName(e.target.value)}
                                                onKeyDown={e => e.key === "Enter" && handleSearch()}
                                                placeholder="Nomi bo'yicha qidirish..."
                                                borderColor="border"
                                                borderRadius="md"
                                                fontSize="13px"
                                                _focus={{ borderColor: "primary", boxShadow: "0 0 0 1px var(--chakra-colors-primary)" }}
                                            />
                                        </InputGroup>
                                    </Box>

                                    {/* Region */}
                                    <Box flex="1" minW="160px">
                                        <Text fontSize="12px" color="textSub" mb={1.5}>Viloyat</Text>
                                        <Select
                                            size="sm"
                                            borderColor="border"
                                            borderRadius="md"
                                            fontSize="13px"
                                            value={selectedRegionId}
                                            onChange={e => handleRegionChange(e.target.value)}
                                            _focus={{ borderColor: "primary" }}
                                        >
                                            <option value="">Barcha viloyatlar</option>
                                            {regions.map(r => (
                                                <option key={r.id} value={r.id}>{r.name_uz}</option>
                                            ))}
                                        </Select>
                                    </Box>

                                    {/* District */}
                                    <Box flex="1" minW="160px">
                                        <Flex justify="space-between" mb={1.5}>
                                            <Text fontSize="12px" color="textSub">Tuman</Text>
                                            {!selectedRegionId && (
                                                <Text fontSize="11px" color="textSub" fontStyle="italic">Avval viloyat tanlang</Text>
                                            )}
                                        </Flex>
                                        <Select
                                            size="sm"
                                            borderColor="border"
                                            borderRadius="md"
                                            fontSize="13px"
                                            value={selectedDistrictId}
                                            onChange={e => setSelectedDistrictId(e.target.value)}
                                            isDisabled={!selectedRegionId}
                                            _focus={{ borderColor: "primary" }}
                                        >
                                            <option value="">Barcha tumanlar</option>
                                            {filteredDistricts.map(d => (
                                                <option key={d.id} value={d.id}>{d.name_uz}</option>
                                            ))}
                                        </Select>
                                    </Box>

                                    <Button
                                        size="sm"
                                        colorScheme="brand"
                                        onClick={handleSearch}
                                        isLoading={searchLoading}
                                        loadingText="Qidirilmoqda..."
                                        flexShrink={0}
                                        px={6}
                                        h="32px"
                                        fontSize="13px"
                                    >
                                        Qidirish
                                    </Button>
                                </Flex>

                                {/* Location filter chips (appears after first search) */}
                                {availableLocations.length > 0 && (
                                    <Box mt={3} pt={3} borderTop="0.5px solid" borderColor="border">
                                        <Text fontSize="11px" color="textSub" mb={2}>
                                            Zavod / ishlab chiqaruvchi bo'yicha:
                                        </Text>
                                        <Flex gap={2} flexWrap="wrap">
                                            <Button
                                                size="xs"
                                                variant={!selectedLocationId ? "solid" : "outline"}
                                                colorScheme={!selectedLocationId ? "brand" : "gray"}
                                                borderColor="border"
                                                fontSize="11px"
                                                h="24px"
                                                onClick={() => handleLocationFilter("")}
                                            >
                                                Barchasi
                                            </Button>
                                            {availableLocations.map(loc => (
                                                <Button
                                                    key={loc.id}
                                                    size="xs"
                                                    variant={selectedLocationId === loc.id ? "solid" : "outline"}
                                                    colorScheme={selectedLocationId === loc.id ? "brand" : "gray"}
                                                    borderColor="border"
                                                    fontSize="11px"
                                                    h="24px"
                                                    maxW="220px"
                                                    overflow="hidden"
                                                    textOverflow="ellipsis"
                                                    onClick={() => handleLocationFilter(loc.id)}
                                                >
                                                    {loc.name}
                                                </Button>
                                            ))}
                                        </Flex>
                                    </Box>
                                )}
                            </Box>

                            {/* Results area */}
                            {!hasSearched ? (
                                <EmptyHint
                                    icon="🔍"
                                    title="Mahsulot qidiring"
                                    sub={`"${orderItem.product_name}" nomini qidirib tizim omboridan variant tanlang`}
                                />
                            ) : searchLoading ? (
                                <Flex justify="center" align="center" direction="column" py={12} gap={3}>
                                    <Spinner color="primary" thickness="3px" speed="0.6s" />
                                    <Text fontSize="13px" color="textSub">Qidirilmoqda...</Text>
                                </Flex>
                            ) : searchResults.length === 0 ? (
                                <EmptyHint
                                    icon="😔"
                                    title="Natija topilmadi"
                                    sub="Boshqa kalit so'z, viloyat yoki filter bilan qayta urinib ko'ring"
                                />
                            ) : (
                                <>
                                    <Flex align="center" justify="space-between" mb={3}>
                                        <Text fontSize="12px" color="textSub">
                                            {searchPagination?.totalCount?.toLocaleString() || searchResults.length} ta natija ·
                                            sahifa {searchPagination?.currentPage || 1} / {searchPagination?.totalPages || 1}
                                        </Text>
                                        {stagedVariants.length > 0 && (
                                            <Text fontSize="12px" color="link" fontWeight={500}>
                                                {stagedVariants.length} ta tanlangan
                                            </Text>
                                        )}
                                    </Flex>

                                    <VStack gap={2} align="stretch">
                                        {searchResults.map(item => (
                                            <StockCard
                                                key={item.id}
                                                item={item}
                                                isSelected={selectedStockIds.has(item.id)}
                                                onAdd={addToStaged}
                                            />
                                        ))}
                                    </VStack>

                                    {/* Pagination */}
                                    {searchPagination && searchPagination.totalPages > 1 && (
                                        <Flex justify="space-between" align="center" mt={5} flexWrap="wrap" gap={3}>
                                            <Text fontSize="12px" color="textSub">
                                                {((searchPagination.currentPage - 1) * searchPagination.limit) + 1}–
                                                {Math.min(searchPagination.currentPage * searchPagination.limit, searchPagination.totalCount)} /{" "}
                                                {searchPagination.totalCount?.toLocaleString()}
                                            </Text>
                                            <HStack gap={1} flexWrap="wrap">
                                                <Button
                                                    size="xs"
                                                    variant="outline"
                                                    borderColor="border"
                                                    isDisabled={searchPage <= 1 || searchLoading}
                                                    onClick={() => handlePageChange(searchPage - 1)}
                                                    fontSize="13px"
                                                    minW="32px"
                                                >
                                                    ‹
                                                </Button>

                                                {(() => {
                                                    const total = searchPagination.totalPages;
                                                    const cur = searchPage;
                                                    let pages = [];

                                                    if (total <= 7) {
                                                        pages = Array.from({ length: total }, (_, i) => i + 1);
                                                    } else {
                                                        const start = Math.max(1, Math.min(cur - 2, total - 4));
                                                        pages = [
                                                            ...(start > 1 ? [1, "…"] : []),
                                                            ...Array.from({ length: Math.min(5, total) }, (_, i) => start + i).filter(p => p <= total),
                                                            ...(start + 4 < total ? ["…", total] : []),
                                                        ];
                                                    }

                                                    return pages.map((p, i) =>
                                                        p === "…" ? (
                                                            <Text key={`e${i}`} fontSize="12px" color="textSub" px={1}>…</Text>
                                                        ) : (
                                                            <Button
                                                                key={p}
                                                                size="xs"
                                                                variant={p === cur ? "solid" : "outline"}
                                                                colorScheme={p === cur ? "brand" : undefined}
                                                                borderColor={p === cur ? undefined : "border"}
                                                                fontWeight={p === cur ? 500 : 400}
                                                                isDisabled={searchLoading}
                                                                onClick={() => handlePageChange(p)}
                                                                fontSize="12px"
                                                                minW="32px"
                                                            >
                                                                {p}
                                                            </Button>
                                                        )
                                                    );
                                                })()}

                                                <Button
                                                    size="xs"
                                                    variant="outline"
                                                    borderColor="border"
                                                    isDisabled={searchPage >= searchPagination.totalPages || searchLoading}
                                                    onClick={() => handlePageChange(searchPage + 1)}
                                                    fontSize="13px"
                                                    minW="32px"
                                                >
                                                    ›
                                                </Button>
                                            </HStack>
                                        </Flex>
                                    )}
                                </>
                            )}
                        </>
                    ) : (
                        /* ── Tab: Qo'lda kiritish ── */
                        <Box bg="surface" border="0.5px solid" borderColor="border" borderRadius="lg" p={5}>
                            <Text fontSize="14px" fontWeight={500} color="text" mb={1}>
                                Qo'lda variant kiritish
                            </Text>
                            <Text fontSize="12px" color="textSub" mb={5}>
                                Tizimda mavjud bo'lmagan mahsulot uchun o'z taklifingizni kiriting
                            </Text>

                            <VStack gap={4} align="stretch">
                                <FormControl isInvalid={!!manualErrors.factory_name}>
                                    <FormLabel fontSize="12px" color="textSub" mb={1.5} fontWeight={400}>
                                        Zavod / ishlab chiqaruvchi *
                                    </FormLabel>
                                    <Input
                                        size="sm"
                                        value={manualForm.factory_name}
                                        onChange={e => { setManualForm(f => ({ ...f, factory_name: e.target.value })); setManualErrors(e => ({ ...e, factory_name: "" })); }}
                                        placeholder="Masalan: Toshkent Beton zavodi"
                                        borderColor="border"
                                        borderRadius="md"
                                        fontSize="13px"
                                        _focus={{ borderColor: "primary" }}
                                    />
                                    <FormErrorMessage fontSize="11px">{manualErrors.factory_name}</FormErrorMessage>
                                </FormControl>

                                <FormControl>
                                    <FormLabel fontSize="12px" color="textSub" mb={1.5} fontWeight={400}>
                                        Manzil
                                    </FormLabel>
                                    <Input
                                        size="sm"
                                        value={manualForm.address}
                                        onChange={e => setManualForm(f => ({ ...f, address: e.target.value }))}
                                        placeholder="Masalan: Toshkent sh, Chilonzor tumani"
                                        borderColor="border"
                                        borderRadius="md"
                                        fontSize="13px"
                                        _focus={{ borderColor: "primary" }}
                                    />
                                </FormControl>

                                <FormControl isInvalid={!!manualErrors.product_name}>
                                    <FormLabel fontSize="12px" color="textSub" mb={1.5} fontWeight={400}>
                                        Mahsulot nomi *
                                    </FormLabel>
                                    <Input
                                        size="sm"
                                        value={manualForm.product_name}
                                        onChange={e => { setManualForm(f => ({ ...f, product_name: e.target.value })); setManualErrors(e => ({ ...e, product_name: "" })); }}
                                        placeholder={orderItem.product_name || "Mahsulot nomini kiriting"}
                                        borderColor="border"
                                        borderRadius="md"
                                        fontSize="13px"
                                        _focus={{ borderColor: "primary" }}
                                    />
                                    <FormErrorMessage fontSize="11px">{manualErrors.product_name}</FormErrorMessage>
                                </FormControl>

                                <FormControl isInvalid={!!manualErrors.cost_price}>
                                    <FormLabel fontSize="12px" color="textSub" mb={1.5} fontWeight={400}>
                                        Narx (so'm) *
                                    </FormLabel>
                                    <Input
                                        size="sm"
                                        type="number"
                                        min={0}
                                        value={manualForm.cost_price}
                                        onChange={e => { setManualForm(f => ({ ...f, cost_price: e.target.value })); setManualErrors(e => ({ ...e, cost_price: "" })); }}
                                        placeholder="Masalan: 150000"
                                        borderColor="border"
                                        borderRadius="md"
                                        fontSize="13px"
                                        _focus={{ borderColor: "primary" }}
                                    />
                                    <FormErrorMessage fontSize="11px">{manualErrors.cost_price}</FormErrorMessage>
                                </FormControl>

                                <FormControl>
                                    <Flex align="center" gap={3}>
                                        <Switch
                                            id="manual_delivery"
                                            isChecked={manualForm.is_delivery}
                                            onChange={e => setManualForm(f => ({ ...f, is_delivery: e.target.checked }))}
                                            colorScheme="brand"
                                            size="sm"
                                        />
                                        <FormLabel htmlFor="manual_delivery" fontSize="13px" color="text" mb={0} cursor="pointer" fontWeight={400}>
                                            Narx ichida yetkazib berish mavjud
                                        </FormLabel>
                                    </Flex>
                                </FormControl>

                                <Flex justify="flex-end" pt={2} borderTop="0.5px solid" borderColor="border">
                                    <Button
                                        colorScheme="brand"
                                        size="sm"
                                        onClick={addManualToStaged}
                                        fontSize="13px"
                                        px={6}
                                    >
                                        + Variant ro'yhatiga qo'shish
                                    </Button>
                                </Flex>
                            </VStack>
                        </Box>
                    )}
                </Box>

                {/* ──────────────── RIGHT: Variants panel ──────────────── */}
                <Box
                    w="320px"
                    flexShrink={0}
                    position="sticky"
                    top={bannerOpen ? "200px" : "72px"}
                    maxH={bannerOpen ? "calc(100vh - 220px)" : "calc(100vh - 90px)"}
                    transition="top 0.2s"
                    overflowY="auto"
                    css={{ scrollbarWidth: "thin" }}
                >
                    <Box
                        bg="surface"
                        border="0.5px solid"
                        borderColor={hasStaged ? "link" : "border"}
                        borderRadius="lg"
                        overflow="hidden"
                        transition="border-color 0.15s"
                    >
                        {/* Panel header */}
                        <Flex
                            align="center"
                            justify="space-between"
                            px={4}
                            py={3}
                            borderBottom="0.5px solid"
                            borderColor="border"
                            bg={hasStaged ? "rgba(0,136,230,0.04)" : undefined}
                        >
                            <Text fontSize="14px" fontWeight={500} color="text">Variant ro'yhati</Text>
                            {totalCount > 0 && (
                                <Badge colorScheme="blue" borderRadius="full" px={2}>
                                    {totalCount}
                                </Badge>
                            )}
                        </Flex>

                        <Box p={3}>
                            {/* Existing variants */}
                            {existingVariants.length > 0 && (
                                <Box mb={3}>
                                    <SectionLabel>Avval saqlangan</SectionLabel>
                                    <VStack gap={2} align="stretch">
                                        {existingVariants.map(v => (
                                            <VariantRow
                                                key={v._uid}
                                                variant={v}
                                                isExisting
                                                showRemove={!hasStaged}
                                                onRemove={() => setDeleteTargetUid(v._uid)}
                                                saving={saving}
                                            />
                                        ))}
                                    </VStack>
                                    {hasStaged && (
                                        <Text fontSize="11px" color="textSub" mt={2} fontStyle="italic" lineHeight={1.5}>
                                            Mavjud variantlarni o'chirish uchun tasdiqlash bosqichida xoh barchasini ko'rib chiqing
                                        </Text>
                                    )}
                                </Box>
                            )}

                            {/* Staged variants */}
                            {stagedVariants.length > 0 && (
                                <Box mb={3}>
                                    <SectionLabel>Yangi tanlangan</SectionLabel>
                                    <VStack gap={2} align="stretch">
                                        {stagedVariants.map(v => (
                                            <VariantRow
                                                key={v._id}
                                                variant={v}
                                                isExisting={false}
                                                showRemove
                                                onRemove={() => removeFromStaged(v._id)}
                                                saving={false}
                                            />
                                        ))}
                                    </VStack>
                                </Box>
                            )}

                            {/* Empty */}
                            {totalCount === 0 && (
                                <EmptyHint
                                    icon="📋"
                                    title="Hali variant yo'q"
                                    sub="Tizimdan qidiring yoki qo'lda kiriting"
                                />
                            )}

                            {/* Action zone */}
                            {(hasStaged || existingVariants.length > 0) && (
                                <Box mt={2} pt={3} borderTop="0.5px solid" borderColor="border">
                                    {hasStaged ? (
                                        <>
                                            <Button
                                                w="full"
                                                colorScheme="brand"
                                                size="sm"
                                                fontSize="13px"
                                                onClick={handleOpenConfirm}
                                            >
                                                Tasdiqlash va saqlash
                                            </Button>
                                            <Text fontSize="11px" color="textSub" textAlign="center" mt={2}>
                                                Saqlanadi: {totalCount} ta variant
                                            </Text>
                                        </>
                                    ) : (
                                        <Text fontSize="12px" color="textSub" textAlign="center" lineHeight={1.6}>
                                            Yangi variant qo'shish uchun tizimdan qidiring yoki qo'lda kiriting
                                        </Text>
                                    )}
                                </Box>
                            )}
                        </Box>
                    </Box>
                </Box>
            </Flex>

            {/* ════════════════════ CONFIRM MODAL ════════════════════ */}
            <Modal
                isOpen={isConfirmOpen}
                onClose={closeConfirm}
                size="lg"
                isCentered
                scrollBehavior="inside"
                closeOnOverlayClick={!saving}
            >
                <ModalOverlay bg="rgba(0,0,0,0.4)" />
                <ModalContent bg="surface" border="0.5px solid" borderColor="border" mx={4}>
                    <ModalHeader
                        fontSize="15px"
                        fontWeight={500}
                        borderBottom="0.5px solid"
                        borderColor="border"
                        pb={3}
                    >
                        Variantlarni tasdiqlash
                    </ModalHeader>
                    <ModalCloseButton isDisabled={saving} />

                    <ModalBody py={4}>
                        <Alert status="info" borderRadius="md" fontSize="12px" mb={4} py={2}>
                            <AlertIcon boxSize="14px" />
                            Keraksiz variantni X borib olib tashlang, keyin "Saqlash"ni bosing
                        </Alert>

                        {/* Existing in modal */}
                        {confirmExisting.length > 0 && (
                            <Box mb={4}>
                                <SectionLabel>Avvalgi saqlangan ({confirmExisting.length})</SectionLabel>
                                <VStack gap={2} align="stretch">
                                    {confirmExisting.map((v, i) => (
                                        <Flex
                                            key={v._uid || i}
                                            align="flex-start"
                                            gap={2}
                                            bg="bg"
                                            border="0.5px solid"
                                            borderColor="border"
                                            borderRadius="md"
                                            p={3}
                                        >
                                            <Box flex={1} minW={0}>
                                                <Text fontSize="13px" fontWeight={500} color="text" noOfLines={1}>
                                                    {v.product_name || "—"}
                                                </Text>
                                                <Text fontSize="11px" color="textSub" noOfLines={1}>
                                                    {v.factory_name || "—"}
                                                </Text>
                                                <Flex gap={2} mt={1} align="center">
                                                    <Text fontSize="12px" fontWeight={500} color="link">{fmtPrice(v.cost_price)}</Text>
                                                    {v.is_delivery && <Badge fontSize="9px" colorScheme="teal" variant="subtle">Yetkazib berish</Badge>}
                                                </Flex>
                                            </Box>
                                            <IconButton
                                                aria-label="Olib tashlash"
                                                icon={<XIcon />}
                                                size="xs"
                                                variant="ghost"
                                                colorScheme="red"
                                                onClick={() => setConfirmExisting(prev => prev.filter((_, j) => j !== i))}
                                                isDisabled={saving}
                                            />
                                        </Flex>
                                    ))}
                                </VStack>
                            </Box>
                        )}

                        {/* Staged in modal */}
                        {confirmStaged.length > 0 && (
                            <Box mb={4}>
                                <SectionLabel>Yangi qo'shilmoqchilar ({confirmStaged.length})</SectionLabel>
                                <VStack gap={2} align="stretch">
                                    {confirmStaged.map((v, i) => (
                                        <Flex
                                            key={v._id || i}
                                            align="flex-start"
                                            gap={2}
                                            bg="rgba(0,136,230,0.04)"
                                            border="0.5px solid"
                                            borderColor="link"
                                            borderRadius="md"
                                            p={3}
                                        >
                                            <Box flex={1} minW={0}>
                                                <Flex gap={1.5} mb={1}>
                                                    <Badge
                                                        fontSize="9px"
                                                        colorScheme={v._type === "manual" ? "purple" : "blue"}
                                                        variant="subtle"
                                                    >
                                                        {v._type === "manual" ? "Qo'lda kiritilgan" : "Tizimdan tanlangan"}
                                                    </Badge>
                                                </Flex>
                                                <Text fontSize="13px" fontWeight={500} color="text" noOfLines={1}>
                                                    {v.product_name || "—"}
                                                </Text>
                                                <Text fontSize="11px" color="textSub" noOfLines={1}>
                                                    {v.factory_name || "—"}
                                                </Text>
                                                <Flex gap={2} mt={1} align="center">
                                                    <Text fontSize="12px" fontWeight={500} color="link">{fmtPrice(v.cost_price)}</Text>
                                                    {v.is_delivery && <Badge fontSize="9px" colorScheme="teal" variant="subtle">Yetkazib berish</Badge>}
                                                </Flex>
                                            </Box>
                                            <IconButton
                                                aria-label="Olib tashlash"
                                                icon={<XIcon />}
                                                size="xs"
                                                variant="ghost"
                                                colorScheme="red"
                                                onClick={() => setConfirmStaged(prev => prev.filter((_, j) => j !== i))}
                                                isDisabled={saving}
                                            />
                                        </Flex>
                                    ))}
                                </VStack>
                            </Box>
                        )}

                        {/* All removed warning */}
                        {confirmExisting.length === 0 && confirmStaged.length === 0 && (
                            <Alert status="warning" borderRadius="md" fontSize="13px">
                                <AlertIcon />
                                Hech qanday variant qolmadi. Saqlash barcha variantlarni o'chiradi.
                            </Alert>
                        )}

                        {/* Summary */}
                        <Box
                            mt={4}
                            p={3}
                            bg="bg"
                            border="0.5px solid"
                            borderColor="border"
                            borderRadius="md"
                        >
                            <Text fontSize="13px" color="textSub">
                                Jami saqlanadigan:{" "}
                                <Text as="span" fontWeight={600} color="text">
                                    {confirmExisting.length + confirmStaged.length} ta variant
                                </Text>
                            </Text>
                        </Box>
                    </ModalBody>

                    <ModalFooter borderTop="0.5px solid" borderColor="border" gap={2}>
                        <Button
                            variant="ghost"
                            size="sm"
                            fontSize="13px"
                            onClick={closeConfirm}
                            isDisabled={saving}
                        >
                            Bekor qilish
                        </Button>
                        <Button
                            colorScheme="brand"
                            size="sm"
                            fontSize="13px"
                            px={6}
                            onClick={handleSave}
                            isLoading={saving}
                            loadingText="Saqlanmoqda..."
                        >
                            Saqlash
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>

            {/* ════════════════════ DELETE ALERT DIALOG ════════════════════ */}
            <AlertDialog
                isOpen={!!deleteTargetUid}
                leastDestructiveRef={deleteDialogCancel}
                onClose={() => !saving && setDeleteTargetUid(null)}
                isCentered
            >
                <AlertDialogOverlay bg="rgba(0,0,0,0.4)" />
                <AlertDialogContent bg="surface" border="0.5px solid" borderColor="border" mx={4}>
                    <AlertDialogHeader fontSize="15px" fontWeight={500} borderBottom="0.5px solid" borderColor="border" pb={3}>
                        Variantni o'chirish
                    </AlertDialogHeader>
                    <AlertDialogBody py={4} fontSize="13px" color="textSub" lineHeight={1.6}>
                        Bu variantni ro'yhatdan o'chirmoqchimisiz? <br />
                        <Text as="span" color="warning" fontWeight={500}>Bu amalni ortga qaytarib bo'lmaydi.</Text>
                    </AlertDialogBody>
                    <AlertDialogFooter borderTop="0.5px solid" borderColor="border" gap={2}>
                        <Button
                            ref={deleteDialogCancel}
                            variant="ghost"
                            size="sm"
                            fontSize="13px"
                            onClick={() => setDeleteTargetUid(null)}
                            isDisabled={saving}
                        >
                            Bekor qilish
                        </Button>
                        <Button
                            colorScheme="red"
                            size="sm"
                            fontSize="13px"
                            px={5}
                            onClick={handleDeleteExistingOnly}
                            isLoading={saving}
                            loadingText="O'chirilmoqda..."
                        >
                            O'chirish
                        </Button>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </Box>
    );
}
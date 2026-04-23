import { useState, useEffect, useCallback } from "react";
import {
    Box, Flex, Text, Grid, Badge, Button, Select,
    Spinner, Alert, AlertIcon, useColorModeValue,
    useToast, IconButton, HStack, Divider
} from "@chakra-ui/react";
import { apiOfferItems } from "../../utils/Controllers/OfferItems";
import { useNavigate } from "react-router";

const TABS = [
    { status: "pending", label: "Yangi" },
    { status: "in_progress", label: "Jarayonda" },
    { status: "variant_completed", label: "Tugallangan" },
];

const ACTION_MAP = {
    pending: { label: "Jarayonga olish", next: "in_progress" },
    in_progress: { label: "Tugallandi", next: "variant_completed" },
};

const SS_KEY = "offerItems_state";

function loadSession() {
    try {
        const s = sessionStorage.getItem(SS_KEY);
        return s ? JSON.parse(s) : {};
    } catch { return {}; }
}

function saveSession(data) {
    try { sessionStorage.setItem(SS_KEY, JSON.stringify(data)); } catch { }
}

function MissingText({ label }) {
    return (
        <Text as="span" fontSize="12px" fontStyle="italic" color="textSub">
            {label} ko'rsatilmagan
        </Text>
    );
}

function FieldRow({ icon, label, value }) {
    return (
        <Flex align="flex-start" gap={2}>
            <Box color="textSub" mt="2px" flexShrink={0}>{icon}</Box>
            <Text fontSize="12px" color="textSub" minW="52px" flexShrink={0} mt="1px">{label}</Text>
            {value
                ? <Text fontSize="13px" color="text" flex={1} lineHeight={1.45}>{value}</Text>
                : <MissingText label={label} />}
        </Flex>
    );
}

function SkeletonCard() {
    const bg = useColorModeValue("neutral.100", "neutral.700");
    return (
        <Box bg="surface" border="0.5px solid" borderColor="border" borderRadius="lg" p={4} h="188px">
            <Box bg={bg} h="12px" w="55%" borderRadius="4px" mb={4} sx={{ animation: "pulse 1.4s ease-in-out infinite" }} />
            <Box bg={bg} h="14px" w="85%" borderRadius="4px" mb={3} />
            <Box bg={bg} h="11px" w="75%" borderRadius="4px" mb={2} />
            <Box bg={bg} h="11px" w="90%" borderRadius="4px" mb={4} />
            <Box bg={bg} h="11px" w="60%" borderRadius="4px" />
        </Box>
    );
}

function ItemCard({ item, onAction, tab }) {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const toast = useToast();
    const action = ACTION_MAP[item.status];

    const pn = item.product_name?.trim() || null;
    const addr = item.offer?.address?.trim() || null;
    const site = item.offer?.construction_site_name?.trim() || null;
    const offN = item.offer?.offer_number || null;
    const qty = item.quantity != null
        ? `${parseFloat(item.quantity) % 1 === 0
            ? Number(item.quantity).toFixed(0)
            : Number(item.quantity).toFixed(2)}${item.unit ? " " + item.unit : ""}`
        : null;

    const handleAction = async () => {
        if (!action || loading) return;
        setLoading(true);
        try {
            await apiOfferItems.updateStatus(item.id, { status: action.next });
            toast({ title: "Holat yangilandi", status: "success", duration: 2500, isClosable: true, position: "bottom-right" });
            onAction();
        } catch {
            toast({ title: "Xatolik yuz berdi", description: "Qayta urinib ko'ring", status: "error", duration: 3000, isClosable: true, position: "bottom-right" });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box
            bg="surface"
            border="0.5px solid"
            borderColor="border"
            borderRadius="lg"
            p={4}
            display="flex"
            flexDirection="column"
            gap={3}
            transition="border-color 0.15s"
            _hover={{ borderColor: "neutral.400" }}
        >
            <Flex justify="space-between" align="flex-start" gap={2}>
                <Badge
                    px={2} py="2px"
                    fontSize="11px"
                    fontWeight={500}
                    bg={useColorModeValue("rgba(0,136,230,0.1)", "rgba(0,136,230,0.2)")}
                    color="link"
                    borderRadius="4px"
                    textTransform="none"
                    letterSpacing="0.3px"
                >
                    {offN || "—"}
                </Badge>
                <Box
                    w="8px" h="8px" borderRadius="full" flexShrink={0} mt={1}
                    bg={
                        item.status === "pending" ? "orange.400" :
                            item.status === "in_progress" ? "brand.400" :
                                item.status === "variant_completed" ? "green.500" : "gray.400"
                    }
                />
            </Flex>

            <Text
                fontSize="15px"
                fontWeight={500}
                color={pn ? "text" : "textSub"}
                fontStyle={pn ? "normal" : "italic"}
                lineHeight={1.4}
            >
                {pn || "Mahsulot nomi ko'rsatilmagan"}
            </Text>

            <Flex flexDirection="column" gap="6px">
                <FieldRow
                    icon={<LocationIcon />}
                    label="Manzil"
                    value={addr}
                />
                <FieldRow
                    icon={<SiteIcon />}
                    label="Obyekt"
                    value={site}
                />
            </Flex>

            <Box borderTop="0.5px solid" borderColor="border" pt={2.5} mt={1}>
                <Flex align="center" justify="space-between">
                    <Text fontSize="12px" color="textSub">
                        Miqdor:{" "}
                        <Text as="span" fontWeight={500} color="text">
                            {qty ?? <Text as="span" fontStyle="italic" color="textSub" fontSize="12px">ko'rsatilmagan</Text>}
                        </Text>
                    </Text>
                    <Flex align="center" gap={2}>
                        {tab === "in_progress" && (
                            <Button
                                size="sm"
                                variant="outline"
                                fontSize="12px"
                                fontWeight={500}
                                color="link"
                                borderColor="border"
                                _hover={{ bg: useColorModeValue("rgba(0,136,230,0.07)", "rgba(0,136,230,0.15)") }}
                                h="30px"
                                px={3}
                                onClick={() => {
                                    navigate(`${item?.id}`)
                                }}
                            >
                                +Variant
                            </Button>
                        )}
                        {action && (
                            <Button
                                size="sm"
                                variant="outline"
                                fontSize="12px"
                                fontWeight={500}
                                color="link"
                                borderColor="border"
                                _hover={{ bg: useColorModeValue("rgba(0,136,230,0.07)", "rgba(0,136,230,0.15)") }}
                                isLoading={loading}
                                loadingText="Kutilmoqda..."
                                onClick={handleAction}
                                h="30px"
                                px={3}
                            >
                                {action.label}
                            </Button>
                        )}
                    </Flex>
                </Flex>
            </Box>
        </Box>
    );
}

function Pagination({ meta, onPage }) {
    if (!meta || meta.total_pages <= 1) return null;
    const { page: cur, total_pages: total, total_count: count, limit } = meta;
    const from = (cur - 1) * limit + 1;
    const to = Math.min(cur * limit, count);

    const pages = [];
    if (total <= 7) { for (let i = 1; i <= total; i++) pages.push(i); }
    else {
        pages.push(1);
        if (cur > 3) pages.push("...");
        for (let i = Math.max(2, cur - 1); i <= Math.min(total - 1, cur + 1); i++) pages.push(i);
        if (cur < total - 2) pages.push("...");
        pages.push(total);
    }

    return (
        <Flex align="center" justify="space-between" mt={6} flexWrap="wrap" gap={3}>
            <Text fontSize="13px" color="textSub">{from}–{to} / {count} ta mahsulot</Text>
            <HStack spacing={1}>
                <IconButton aria-label="Oldingi" icon={<ChevronIcon dir="left" />} size="sm" variant="outline" borderColor="border" isDisabled={cur <= 1} onClick={() => onPage(cur - 1)} />
                {pages.map((p, i) =>
                    p === "..."
                        ? <Text key={i} w="32px" textAlign="center" fontSize="13px" color="textSub">…</Text>
                        : <Button
                            key={p}
                            size="sm"
                            variant={p === cur ? "solid" : "outline"}
                            colorScheme={p === cur ? "brand" : undefined}
                            borderColor={p === cur ? undefined : "border"}
                            fontWeight={p === cur ? 500 : 400}
                            onClick={() => onPage(p)}
                            w="32px"
                            px={0}
                        >{p}</Button>
                )}
                <IconButton aria-label="Keyingi" icon={<ChevronIcon dir="right" />} size="sm" variant="outline" borderColor="border" isDisabled={cur >= total} onClick={() => onPage(cur + 1)} />
            </HStack>
        </Flex>
    );
}

export default function OfferItemsPage() {
    const session = loadSession();
    const [tab, setTab] = useState(session.tab || "pending");
    const [page, setPage] = useState(session.page || 1);
    const [limit, setLimit] = useState(session.limit || 15);
    const [items, setItems] = useState([]);
    const [meta, setMeta] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetch = useCallback(async (t, p, l) => {
        setLoading(true);
        setError(null);
        try {
            const res = await apiOfferItems.getByUser(t, p, l);
            const data = res.data || res;
            setItems(data.data || []);
            setMeta(data.meta || null);
        } catch {
            setError("Ma'lumotlarni yuklashda xatolik yuz berdi.");
            setItems([]);
            setMeta(null);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetch(tab, page, limit); }, [tab, page, limit]);

    const handleTab = (t) => {
        const next = { tab: t, page: 1, limit };
        setTab(t); setPage(1);
        saveSession(next);
    };
    const handlePage = (p) => {
        setPage(p);
        saveSession({ tab, page: p, limit });
    };
    const handleLimit = (e) => {
        const l = Number(e.target.value);
        setLimit(l); setPage(1);
        saveSession({ tab, page: 1, limit: l });
    };

    const tabBorderColor = useColorModeValue("neutral.200", "neutral.700");

    return (
        <Box py={6} px={{ base: 4, md: 6 }}>
            <Box mb={5}>
                <Text fontSize="20px" fontWeight={500} color="text">Buyurtma mahsulotlari</Text>
                <Text fontSize="13px" color="textSub" mt={1}>Sizga yo'naltirilgan mahsulot buyurtmalari</Text>
            </Box>

            <Flex borderBottom="0.5px solid" borderColor="border" mb={5} gap={1}>
                {TABS.map(t => (
                    <Button
                        key={t.status}
                        variant="unstyled"
                        px={4} py={2.5}
                        fontSize="14px"
                        fontWeight={tab === t.status ? 500 : 400}
                        color={tab === t.status ? "text" : "textSub"}
                        borderBottom="2px solid"
                        borderColor={tab === t.status ? "brand.500" : "transparent"}
                        mb="-0.5px"
                        borderRadius={0}
                        _hover={{ color: "text" }}
                        onClick={() => handleTab(t.status)}
                        display="flex"
                        alignItems="center"
                        gap={2}
                    >
                        {t.label}
                    </Button>
                ))}
            </Flex>

            {error && (
                <Alert status="error" mb={4} borderRadius="md" fontSize="13px">
                    <AlertIcon />
                    {error}
                </Alert>
            )}

            <Flex align="center" justify="space-between" mb={4}>
                <Text fontSize="13px" color="textSub">
                    {loading ? "Yuklanmoqda..." : meta ? `${meta.total_count} ta natija` : ""}
                </Text>
                <Flex align="center" gap={2} fontSize="13px" color="textSub">
                    <Text>Ko'rsatish:</Text>
                    <Select size="sm" w="90px" value={limit} onChange={handleLimit} borderColor="border" borderRadius="md">
                        <option value={15}>15 ta</option>
                        <option value={25}>25 ta</option>
                        <option value={50}>50 ta</option>
                    </Select>
                </Flex>
            </Flex>

            {loading ? (
                <Grid templateColumns="repeat(auto-fill, minmax(280px, 1fr))" gap={3}>
                    {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
                </Grid>
            ) : items.length === 0 ? (
                <Flex direction="column" align="center" py={16} color="textSub">
                    <Box w="44px" h="44px" borderRadius="full" bg="surface" display="flex" alignItems="center" justifyContent="center" mb={3} fontSize="20px">📭</Box>
                    <Text fontWeight={500} color="text" mb={1}>Mahsulot topilmadi</Text>
                    <Text fontSize="13px">Bu bo'limda hozircha buyurtma mavjud emas</Text>
                </Flex>
            ) : (
                <Grid templateColumns="repeat(auto-fill, minmax(280px, 1fr))" gap={3}>
                    {items.map(item => (
                        <ItemCard key={item.id} item={item} onAction={() => fetch(tab, page, limit)} tab={tab} />
                    ))}
                </Grid>
            )}

            {!loading && <Pagination meta={meta} onPage={handlePage} />}
        </Box>
    );
}

// SVG ikonlar
function LocationIcon() {
    return (
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
            <path d="M8 1.5C5.515 1.5 3.5 3.515 3.5 6c0 3.75 4.5 8.5 4.5 8.5s4.5-4.75 4.5-8.5c0-2.485-2.015-4.5-4.5-4.5z" stroke="currentColor" strokeWidth="1.2" />
            <circle cx="8" cy="6" r="1.5" stroke="currentColor" strokeWidth="1.2" />
        </svg>
    );
}
function SiteIcon() {
    return (
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
            <rect x="2" y="2" width="12" height="12" rx="2" stroke="currentColor" strokeWidth="1.2" />
            <path d="M5 6h6M5 9h4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
        </svg>
    );
}
function ChevronIcon({ dir }) {
    return (
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
            <path d={dir === "left" ? "M10 4L6 8l4 4" : "M6 4l4 4-4 4"} stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
}
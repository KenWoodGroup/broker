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
} from "@chakra-ui/react";
import { DollarSign, RefreshCcw } from "lucide-react";
import { apiTasks } from "../../../utils/Controllers/apiTasks";
import { apiStock } from "../../../utils/Controllers/apiStock";
import { useAuthStore } from "../../../store/authStore";

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
    // ERP broker stock: factory_id = location.parent.id
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
        stock.location?.parent?.id,
        stock.location?.parent?.id,
        stock.location?.parent_id,
        stock.product?.location?.parent?.id
    );
}

function warehouseFromStock(stock, factoryId) {
    // ERP broker stock: warehouse_id = location_id (same as location.id)
    return pickUuid(stock?.location_id, stock?.location?.id);
}

function categoryLabel(stock, offerLineItem) {
    const p = stock?.product || {};
    const o = offerLineItem || {};
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

async function enrichStockFromBroker(stock, offerLineItem) {
    const name =
        stock?.product?.name?.trim() ||
        offerLineItem?.product_name?.trim() ||
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

function formatApiErr(err) {
    const m = err?.response?.data?.message;
    if (Array.isArray(m)) return m.join(". ");
    if (typeof m === "string") return m;
    return null;
}

function DetailRow({ label, value, mono }) {
    const labelColor = useColorModeValue("gray.600", "gray.400");
    const display =
        value != null && String(value).trim() !== "" ? String(value) : "—";
    return (
        <Box>
            <Text
                fontSize="xs"
                fontWeight="semibold"
                color={labelColor}
                textTransform="uppercase"
                letterSpacing="0.03em"
            >
                {label}
            </Text>
            <Text
                mt={1}
                fontSize="sm"
                fontWeight="medium"
                wordBreak="break-word"
                fontFamily={mono ? "mono" : undefined}
            >
                {display}
            </Text>
        </Box>
    );
}

function hiddenIdsFromStock(stock, offerLineItem) {
    if (!stock) {
        return { factory_id: "", warehouse_id: "", stock_id: "" };
    }
    const fid = factoryFromStock(stock);
    const wid = warehouseFromStock(stock, fid);
    const sid = stock.id != null ? String(stock.id).trim() : "";
    return {
        factory_id: fid,
        warehouse_id: wid,
        stock_id: sid,
    };
}

export default function PriceUpdateTaskModal({
    isOpen,
    onClose,
    stock,
    offerLineItem,
    offerGroupId,
}) {
    const toast = useToast();
    const user = useAuthStore((s) => s.user);
    const userId = useAuthStore((s) => s.userId);
    const assigneeId = (user?.id || userId || "").trim();

    const [productName, setProductName] = useState("");
    const [categoryName, setCategoryName] = useState("");
    const [priority, setPriority] = useState("normal");
    const [dueDate, setDueDate] = useState("");
    const [hidden, setHidden] = useState({
        factory_id: "",
        warehouse_id: "",
        stock_id: "",
    });

    const [submitting, setSubmitting] = useState(false);
    const [brokerBusy, setBrokerBusy] = useState(false);

    const cardBg = useColorModeValue("gray.50", "whiteAlpha.50");
    const cardBorder = useColorModeValue("gray.200", "whiteAlpha.200");
    const footerBg = useColorModeValue("gray.50", "whiteAlpha.50");
    const headerBorder = useColorModeValue("gray.200", "whiteAlpha.200");

    const applyStock = useCallback(
        (s) => {
            if (!s) return;
            const p = s.product || {};
            const o = offerLineItem || {};
            setProductName((p.name || o.product_name || "").trim());
            setCategoryName(categoryLabel(s, offerLineItem));
            const ids = hiddenIdsFromStock(s, offerLineItem);
            setHidden(ids);
        },
        [offerLineItem]
    );

    const runBrokerEnrich = useCallback(
        async (silent) => {
            if (!stock) return null;
            if (!silent) setBrokerBusy(true);
            try {
                const merged = await enrichStockFromBroker(stock, offerLineItem);
                if (merged) {
                    applyStock(merged);
                    setHidden(hiddenIdsFromStock(merged, offerLineItem));
                    if (!silent) {
                        toast({ title: "Yangilandi", status: "success", duration: 2000 });
                    }
                } else if (!silent) {
                    toast({
                        title: "Topilmadi",
                        description: "Broker ro'yxatida bu stok topilmadi",
                        status: "warning",
                        duration: 3500,
                        isClosable: true,
                    });
                }
                return merged;
            } finally {
                if (!silent) setBrokerBusy(false);
            }
        },
        [stock, offerLineItem, applyStock, toast]
    );

    useEffect(() => {
        if (!isOpen || !stock) return;
        applyStock(stock);
        setHidden(hiddenIdsFromStock(stock, offerLineItem));
        setPriority("normal");
        setDueDate("");
        let cancelled = false;
        (async () => {
            const fid = factoryFromStock(stock);
            const wid = warehouseFromStock(stock, fid);
            if (fid && wid) return;
            const merged = await enrichStockFromBroker(stock, offerLineItem);
            if (cancelled || !merged) return;
            applyStock(merged);
            setHidden(hiddenIdsFromStock(merged, offerLineItem));
        })();
        return () => {
            cancelled = true;
        };
    }, [isOpen, stock?.id, stock, offerLineItem, applyStock]);

    const groupId = offerGroupId != null ? String(offerGroupId).trim() : "";

    const submit = async () => {
        if (!isUuid(assigneeId)) {
            toast({
                title: "Sessiya",
                description: "Foydalanuvchi UUID topilmadi. Qayta kiring.",
                status: "warning",
                duration: 4000,
                isClosable: true,
            });
            return;
        }
        if (!isUuid(groupId)) {
            toast({
                title: "group_id",
                description: "Buyurtma (offer) UUID aniqlanmadi — group_id bo'sh qolmasligi kerak.",
                status: "warning",
                duration: 5000,
                isClosable: true,
            });
            return;
        }
        const pn = productName.trim();
        const cn = categoryName.trim();
        if (!pn || !cn) {
            toast({
                title: "Majburiy maydonlar",
                description: "Mahsulot va kategoriya nomini kiriting",
                status: "warning",
                duration: 4000,
                isClosable: true,
            });
            return;
        }
        const fid = hidden.factory_id.trim();
        const wid = hidden.warehouse_id.trim();
        const sid = hidden.stock_id.trim();
        if (!isUuid(fid)) {
            toast({
                title: "Zavod",
                description:
                    "factory_id aniqlanmadi. «Broker dan yangilash» ni bosing yoki keyinroq urinib ko'ring.",
                status: "warning",
                duration: 5000,
                isClosable: true,
            });
            return;
        }
        if (!isUuid(wid) || !isUuid(sid)) {
            toast({
                title: "Ma'lumot",
                description: "warehouse_id yoki stock_id noto'g'ri",
                status: "warning",
                duration: 4000,
                isClosable: true,
            });
            return;
        }

        const body = {
            assignee_id: assigneeId,
            assignee_type: "supplier",
            type: "price_update",
            priority,
            source: "manual",
            group_id: groupId,
            details: {
                product_name: pn,
                category_name: cn,
                factory_id: fid,
                warehouse_id: wid,
                stock_id: sid,
            },
        };
        if (dueDate) {
            const d = new Date(dueDate);
            if (!Number.isNaN(d.getTime())) body.due_date = d.toISOString();
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

    const heroBg = useColorModeValue(
        "linear-gradient(135deg, #fff7ed 0%, #ffedd5 50%, #fed7aa 100%)",
        "linear-gradient(135deg, rgba(234,88,12,0.18) 0%, rgba(124,45,18,0.35) 100%)"
    );
    const heroBorder = useColorModeValue("orange.200", "orange.700");

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            size="lg"
            scrollBehavior="inside"
            isCentered
            motionPreset="slideInBottom"
        >
            <ModalOverlay bg="blackAlpha.600" backdropFilter="blur(6px)" />
            <ModalContent borderRadius="2xl" overflow="hidden" boxShadow="2xl">
                <Box
                    px={6}
                    py={5}
                    borderBottomWidth="1px"
                    borderColor={headerBorder}
                    bgImage={heroBg}
                >
                    <HStack justify="space-between" pr={10} align="start" spacing={4}>
                        <HStack spacing={3} align="start">
                            <Box>
                                <Text fontWeight="bold" fontSize="lg" lineHeight="1.1">
                                    Narx yangilash vazifasi
                                </Text>
                            </Box>
                        </HStack>

                        <Button
                            size="sm"
                            variant="outline"
                            bg={useColorModeValue("white", "transparent")}
                            leftIcon={<Icon as={RefreshCcw} boxSize={4} />}
                            onClick={() => runBrokerEnrich(false)}
                            isLoading={brokerBusy}
                            isDisabled={!stock || brokerBusy}
                        >
                            Yangilash
                        </Button>
                    </HStack>
                    <ModalCloseButton top={4} />
                </Box>

                <ModalBody px={6} py={5}>
                    <VStack align="stretch" spacing={5}>
                        <Box
                            p={5}
                            borderRadius="xl"
                            bg={cardBg}
                            borderWidth="1px"
                            borderColor={cardBorder}
                        >
                            <HStack justify="space-between" mb={4}>
                                <Text fontSize="sm" fontWeight="bold">
                                    Details
                                </Text>
                              
                            </HStack>

                            <VStack align="stretch" spacing={4}>
                                <Box
                                    p={4}
                                    borderRadius="lg"
                                    bg={useColorModeValue("white", "whiteAlpha.100")}
                                    borderWidth="1px"
                                    borderColor={useColorModeValue("orange.100", "whiteAlpha.200")}
                                >
                                    <DetailRow label="product_name *" value={productName} />
                                </Box>
                                <Box
                                    p={4}
                                    borderRadius="lg"
                                    bg={useColorModeValue("white", "whiteAlpha.100")}
                                    borderWidth="1px"
                                    borderColor={useColorModeValue("orange.100", "whiteAlpha.200")}
                                >
                                    <DetailRow label="category_name *" value={categoryName} />
                                </Box>
                            </VStack>
                        </Box>

                        <Flex
                            wrap="wrap"
                            gap={4}
                            align="flex-end"
                            p={4}
                            borderRadius="xl"
                            borderWidth="1px"
                            borderColor={useColorModeValue("gray.200", "whiteAlpha.200")}
                        >
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
                            <Box flex="1" minW="240px">
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
                            </Box>
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
                        colorScheme="orange"
                        onClick={submit}
                        isLoading={submitting}
                        px={8}
                    >
                        Yuborish
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
}

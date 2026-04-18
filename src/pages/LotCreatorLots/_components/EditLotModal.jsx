import {
    Badge,
    Box,
    Button,
    Divider,
    Flex,
    FormControl,
    FormLabel,
    Grid,
    HStack,
    Icon,
    Input,
    NumberInput,
    NumberInputField,
    Select,
    Spinner,
    Text,
    Textarea,
    VStack,
    useDisclosure,
    useToast,
} from "@chakra-ui/react";
import { useEffect, useRef, useState } from "react";
import { Pencil, Plus } from "lucide-react";
import { apiLots } from "../../../utils/Controllers/Lots";
import { apiLotLocations } from "../../../utils/Controllers/LotLocations";
import GradientFormModal from "../../../components/common/GradientFormModal";
import CreateCustomerModal from "./CreateCustomerModal";
import CreateBuilderModal from "./CreateBuilderModal";

export default function EditLotModal({ isOpen, onClose, lotId, typeOptions = [], categoryOptions = [], onUpdated }) {
    const toast = useToast();
    const createCustomer = useDisclosure();
    const createBuilder = useDisclosure();

    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    const [form, setForm] = useState({
        address: "",
        type: "",
        category: "",
        lot_number: "",
        lot_name: "",
        customer_id: null,
        builder_id: null,
        customer_inn: "",
        amount: "",
        note: "",
        start_date: "",
        end_date: "",
    });

    const [customerQuery, setCustomerQuery] = useState("");
    const [builderQuery, setBuilderQuery] = useState("");
    const [customerLoading, setCustomerLoading] = useState(false);
    const [builderLoading, setBuilderLoading] = useState(false);
    const [customerResults, setCustomerResults] = useState([]);
    const [builderResults, setBuilderResults] = useState([]);
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [selectedBuilder, setSelectedBuilder] = useState(null);
    const customerSeq = useRef(0);
    const builderSeq = useRef(0);

    const extractData = (res) => res?.data?.data ?? res?.data ?? null;
    const extractRecords = (res) => {
        const data = res?.data;
        const records = data?.data?.records ?? data?.records ?? data?.data ?? data;
        return Array.isArray(records) ? records : [];
    };

    const extractId = (obj) => {
        if (!obj) return null;
        const candidates = [
            obj.id,
            obj.location_id,
            obj.locationId,
            obj.company_id,
            obj.companyId,
            obj.customer_id,
            obj.customerId,
            obj.builder_id,
            obj.builderId,
            obj.value,
            obj._id,
            obj?.data?.id,
            obj?.data?.location_id,
            obj?.data?.company_id,
            obj?.location?.id,
            obj?.location?.location_id,
            obj?.company?.id,
            obj?.customer?.id,
        ];

        const uuidRe =
            /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

        for (const v of candidates) {
            if (v === null || v === undefined) continue;
            if (typeof v === "string" && uuidRe.test(v)) return v;
            const n = Number(v);
            if (Number.isInteger(n) && n > 0) return String(n);
        }
        return null;
    };

    const pickCustomerInn = (c) => {
        if (!c) return "";
        const v = c.inn ?? c.INN;
        return v != null ? String(v).trim() : "";
    };

    // Load lot details
    useEffect(() => {
        if (!isOpen || !lotId) return;
        const run = async () => {
            try {
                setLoading(true);
                const res = await apiLots.getById(lotId);
                const lot = extractData(res) || {};
                const customerId = lot.customer_id ?? lot.customerId ?? null;
                const builderId = lot.builder_id ?? lot.builderId ?? null;

                const lotInn = lot.inn ?? lot.customer_inn ?? "";
                setForm({
                    address: lot.address ?? "",
                    type: lot.type ?? "",
                    category: lot.category ?? "",
                    lot_number: lot.lot_number ?? lot.lotNumber ?? "",
                    lot_name: lot.lot_name ?? lot.lotName ?? lot.name ?? "",
                    customer_id: customerId,
                    builder_id: builderId,
                    customer_inn: lotInn != null ? String(lotInn) : "",
                    amount: lot.amount ?? "",
                    note: lot.note ?? "",
                    start_date: (lot.start_date ?? lot.startDate ?? "").slice(0, 10),
                    end_date: (lot.end_date ?? lot.endDate ?? "").slice(0, 10),
                });

                // show IDs in selection cards (names optional)
                setSelectedCustomer(customerId ? { id: customerId } : null);
                setSelectedBuilder(builderId ? { id: builderId } : null);
                setCustomerQuery("");
                setBuilderQuery("");
                setCustomerResults([]);
                setBuilderResults([]);
            } finally {
                setLoading(false);
            }
        };
        run();
    }, [isOpen, lotId]);

    // Customer search (debounced) - only when not selected
    useEffect(() => {
        const q = customerQuery.trim();
        if (!isOpen) return;
        if (form.customer_id) return;
        if (!q) {
            setCustomerResults([]);
            return;
        }
        const t = setTimeout(async () => {
            const seq = ++customerSeq.current;
            try {
                setCustomerLoading(true);
                const res = await apiLotLocations.searchByName("customer", q);
                if (seq === customerSeq.current) setCustomerResults(extractRecords(res));
            } finally {
                if (seq === customerSeq.current) setCustomerLoading(false);
            }
        }, 350);
        return () => clearTimeout(t);
    }, [customerQuery, isOpen, form.customer_id]);

    // Company (builder) search (debounced) - only when not selected
    useEffect(() => {
        const q = builderQuery.trim();
        if (!isOpen) return;
        if (form.builder_id) return;
        if (!q) {
            setBuilderResults([]);
            return;
        }
        const t = setTimeout(async () => {
            const seq = ++builderSeq.current;
            try {
                setBuilderLoading(true);
                const res = await apiLotLocations.searchByName("company", q);
                if (seq === builderSeq.current) setBuilderResults(extractRecords(res));
            } finally {
                if (seq === builderSeq.current) setBuilderLoading(false);
            }
        }, 350);
        return () => clearTimeout(t);
    }, [builderQuery, isOpen, form.builder_id]);

    const onPickCustomer = (c) => {
        const id = extractId(c);
        if (!id) return;
        setSelectedCustomer(c);
        setForm((p) => ({
            ...p,
            customer_id: id,
            customer_inn: pickCustomerInn(c) || p.customer_inn,
        }));
        setCustomerQuery(c?.name ?? c?.title ?? c?.company_name ?? customerQuery);
        setCustomerResults([]);
    };

    const onPickBuilder = (b) => {
        const id = extractId(b);
        if (!id) return;
        setSelectedBuilder(b);
        setForm((p) => ({ ...p, builder_id: id }));
        setBuilderQuery(b?.name ?? b?.title ?? b?.company_name ?? builderQuery);
        setBuilderResults([]);
    };

    const validate = () => {
        const missing = [];
        if (!form.address?.trim()) missing.push("address");
        if (!form.type) missing.push("type");
        if (!form.category) missing.push("category");
        if (!form.lot_number?.trim()) missing.push("lot_number");
        if (!form.lot_name?.trim()) missing.push("lot_name");
        if (!form.customer_id) missing.push("customer_id");
        if (!form.builder_id) missing.push("builder_id");
        if (!form.amount && form.amount !== 0) missing.push("amount");
        if (!form.start_date) missing.push("start_date");
        if (!form.end_date) missing.push("end_date");
        if (missing.length) {
            toast({
                title: "Majburiy maydonlar to‘ldirilmagan",
                description: missing.join(", "),
                status: "warning",
                duration: 4000,
                isClosable: true,
            });
            return false;
        }
        return true;
    };

    const handleSave = async () => {
        if (!lotId) return;
        if (!validate()) return;
        try {
            setSaving(true);
            await apiLots.update(lotId, {
                address: form.address.trim(),
                type: form.type,
                category: form.category,
                lot_number: form.lot_number.trim(),
                lot_name: form.lot_name.trim(),
                customer_id: form.customer_id,
                builder_id: form.builder_id,
                inn: form.customer_inn?.trim() || undefined,
                amount: Number(form.amount),
                note: form.note?.trim() || undefined,
                start_date: form.start_date,
                end_date: form.end_date,
            });
            onUpdated?.();
            onClose?.();
        } finally {
            setSaving(false);
        }
    };

    const lotTitleSubtitle =
        form.lot_name?.trim() || form.lot_number?.trim()
            ? [form.lot_name, form.lot_number].filter(Boolean).join(" · ")
            : "Lot ma’lumotlarini yangilang";

    return (
        <>
            <GradientFormModal
                isOpen={isOpen}
                onClose={onClose}
                size="6xl"
                title="Lotni tahrirlash"
                subtitle={lotTitleSubtitle}
                headerIcon={Pencil}
                primaryLabel="Saqlash"
                primaryLoading={saving}
                primaryDisabled={loading}
                primaryLoadingText="Saqlanmoqda..."
                primaryLeftIcon={<Icon as={Pencil} boxSize={4} />}
                onPrimary={handleSave}
            >
                {loading ? (
                    <Flex justify="center" py="50px">
                        <Spinner size="xl" />
                    </Flex>
                ) : (
                    <Grid templateColumns={{ base: "1fr", lg: "1.2fr 0.8fr" }} gap="16px">
                                <Box>
                                    <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap="12px">
                                        <FormControl isRequired>
                                            <FormLabel>Lot nomi</FormLabel>
                                            <Input
                                                value={form.lot_name}
                                                onChange={(e) => setForm((p) => ({ ...p, lot_name: e.target.value }))}
                                                placeholder="Maktab binosi qurilishi"
                                                bg="bg"
                                            />
                                        </FormControl>
                                        <FormControl isRequired>
                                            <FormLabel>Lot raqami</FormLabel>
                                            <Input
                                                value={form.lot_number}
                                                onChange={(e) => setForm((p) => ({ ...p, lot_number: e.target.value }))}
                                                placeholder="LOT-2024-001"
                                                bg="bg"
                                            />
                                        </FormControl>

                                        <FormControl isRequired>
                                            <FormLabel>Type</FormLabel>
                                            <Select
                                                value={form.type}
                                                onChange={(e) => setForm((p) => ({ ...p, type: e.target.value }))}
                                                placeholder="Tanlang"
                                                bg="bg"
                                            >
                                                {typeOptions.map((t) => (
                                                    <option key={t} value={t}>
                                                        {t}
                                                    </option>
                                                ))}
                                            </Select>
                                        </FormControl>

                                        <FormControl isRequired>
                                            <FormLabel>Category</FormLabel>
                                            <Select
                                                value={form.category}
                                                onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))}
                                                placeholder="Tanlang"
                                                bg="bg"
                                            >
                                                {categoryOptions.map((c) => (
                                                    <option key={c} value={c}>
                                                        {c}
                                                    </option>
                                                ))}
                                            </Select>
                                        </FormControl>

                                        <FormControl isRequired>
                                            <FormLabel>Lot manzili</FormLabel>
                                            <Input
                                                value={form.address}
                                                onChange={(e) => setForm((p) => ({ ...p, address: e.target.value }))}
                                                placeholder="Toshkent shahar, Chilonzor tumani, 5-ko'cha"
                                                bg="bg"
                                            />
                                        </FormControl>

                                        <FormControl isRequired>
                                            <FormLabel>Summasi (so‘m)</FormLabel>
                                            <NumberInput
                                                value={form.amount}
                                                onChange={(val) => setForm((p) => ({ ...p, amount: val }))}
                                                min={0}
                                            >
                                                <NumberInputField bg="bg" />
                                            </NumberInput>
                                        </FormControl>

                                        <FormControl isRequired>
                                            <FormLabel>Boshlash sanasi</FormLabel>
                                            <Input
                                                type="date"
                                                value={form.start_date}
                                                onChange={(e) => setForm((p) => ({ ...p, start_date: e.target.value }))}
                                                bg="bg"
                                            />
                                        </FormControl>

                                        <FormControl isRequired>
                                            <FormLabel>Tugash sanasi</FormLabel>
                                            <Input
                                                type="date"
                                                value={form.end_date}
                                                onChange={(e) => setForm((p) => ({ ...p, end_date: e.target.value }))}
                                                bg="bg"
                                            />
                                        </FormControl>
                                    </Grid>

                                    <FormControl mt="12px">
                                        <FormLabel>Izoh</FormLabel>
                                        <Textarea
                                            value={form.note}
                                            onChange={(e) => setForm((p) => ({ ...p, note: e.target.value }))}
                                            placeholder="Qo'shimcha izohlar..."
                                            bg="bg"
                                        />
                                    </FormControl>
                                </Box>

                                <Box>
                                    <Box bg="bg" borderWidth="1px" borderColor="border" borderRadius="14px" p="12px">
                                        <Text fontSize="sm" color="textSub" mb="6px">
                                            Foydalanuvchi 
                                        </Text>

                                        {form.customer_id ? (
                                            <Flex
                                                mb="10px"
                                                p="10px"
                                                bg="surface"
                                                borderWidth="1px"
                                                borderColor="border"
                                                borderRadius="12px"
                                                justify="space-between"
                                                align="center"
                                                gap="10px"
                                            >
                                                <Box>
                                                    <Text fontWeight="600" noOfLines={1}>
                                                        {selectedCustomer?.name ??
                                                            selectedCustomer?.title ??
                                                            selectedCustomer?.company_name ??
                                                            "Customer"}
                                                    </Text>
                                                </Box>
                                                <Button
                                                    variant="ghost"
                                                    onClick={() => {
                                                        setForm((p) => ({
                                                            ...p,
                                                            customer_id: null,
                                                            customer_inn: "",
                                                        }));
                                                        setSelectedCustomer(null);
                                                        setCustomerQuery("");
                                                        setCustomerResults([]);
                                                    }}
                                                >
                                                    O'zgartirish
                                                </Button>
                                            </Flex>
                                        ) : (
                                            <HStack mb="10px" align="start">
                                                <Input
                                                    value={customerQuery}
                                                    onChange={(e) => setCustomerQuery(e.target.value)}
                                                    placeholder="Foydalanuvchi izlash..."
                                                    bg="surface"
                                                />
                                                <Button onClick={createCustomer.onOpen} minW="44px">
                                                    +
                                                </Button>
                                            </HStack>
                                        )}

                                        {!form.customer_id && customerLoading ? (
                                            <Flex justify="center" py="10px">
                                                <Spinner size="sm" />
                                            </Flex>
                                        ) : !form.customer_id && customerResults.length ? (
                                            <VStack align="stretch" spacing="8px" maxH="220px" overflowY="auto">
                                                {customerResults.map((c) => (
                                                    <Box
                                                        key={c?.id ?? `${c?.name}-${Math.random()}`}
                                                        p="10px"
                                                        bg="surface"
                                                        borderWidth="1px"
                                                        borderColor="border"
                                                        borderRadius="12px"
                                                        cursor="pointer"
                                                        _hover={{ borderColor: "green.400" }}
                                                        onClick={() => onPickCustomer(c)}
                                                    >
                                                        <Flex justify="space-between" gap="10px">
                                                            <Box>
                                                                <Text fontWeight="600">
                                                                    {c?.name ?? c?.title ?? c?.company_name ?? "Customer"}
                                                                </Text>
                                                                <Text fontSize="xs" color="textSub">
                                                                    ID: {extractId(c) ?? "-"}
                                                                </Text>
                                                            </Box>
                                                            <Badge colorScheme="green">Tanlash</Badge>
                                                        </Flex>
                                                    </Box>
                                                ))}
                                            </VStack>
                                        ) : !form.customer_id && customerQuery.trim() ? (
                                            <Text fontSize="sm" color="textSub">
                                                Natija topilmadi
                                            </Text>
                                        ) : null}

                                        <Divider my="14px" />

                                        <Text fontSize="sm" color="textSub" mb="6px">
                                            Quruvchi
                                        </Text>

                                        {form.builder_id ? (
                                            <Flex
                                                mb="10px"
                                                p="10px"
                                                bg="surface"
                                                borderWidth="1px"
                                                borderColor="border"
                                                borderRadius="12px"
                                                justify="space-between"
                                                align="center"
                                                gap="10px"
                                            >
                                                <Box>
                                                    <Text fontWeight="600" noOfLines={1}>
                                                        {selectedBuilder?.name ??
                                                            selectedBuilder?.title ??
                                                            selectedBuilder?.company_name ??
                                                            "Builder"}
                                                    </Text>
                                                
                                                </Box>
                                                <Button
                                                    variant="ghost"
                                                    onClick={() => {
                                                        setForm((p) => ({ ...p, builder_id: null }));
                                                        setSelectedBuilder(null);
                                                        setBuilderQuery("");
                                                        setBuilderResults([]);
                                                    }}
                                                >
                                                    O'zgartirish
                                                </Button>
                                            </Flex>
                                        ) : (
                                            <HStack mb="10px" align="start">
                                                <Input
                                                    value={builderQuery}
                                                    onChange={(e) => setBuilderQuery(e.target.value)}
                                                    placeholder="Quruvchi izlash..."
                                                    bg="surface"
                                                />
                                                <Button
                                                    display="flex"
                                                    alignItems="center"
                                                    justifyContent="center"
                                                    onClick={createBuilder.onOpen}
                                                    flexShrink={0}
                                                    minW="44px"
                                                    px={0}
                                                    aria-label="Quruvchi yaratish"
                                                >
                                                    <Plus size={20} />
                                                </Button>
                                            </HStack>
                                        )}

                                        {!form.builder_id && builderLoading ? (
                                            <Flex justify="center" py="10px">
                                                <Spinner size="sm" />
                                            </Flex>
                                        ) : !form.builder_id && builderResults.length ? (
                                            <VStack align="stretch" spacing="8px" maxH="220px" overflowY="auto">
                                                {builderResults.map((b) => (
                                                    <Box
                                                        key={b?.id ?? `${b?.name}-${Math.random()}`}
                                                        p="10px"
                                                        bg="surface"
                                                        borderWidth="1px"
                                                        borderColor="border"
                                                        borderRadius="12px"
                                                        cursor="pointer"
                                                        _hover={{ borderColor: "green.400" }}
                                                        onClick={() => onPickBuilder(b)}
                                                    >
                                                        <Flex justify="space-between" gap="10px">
                                                            <Box>
                                                                <Text fontWeight="600">
                                                                    {b?.name ?? b?.title ?? b?.company_name ?? "Builder"}
                                                                </Text>
                                                                <Text fontSize="xs" color="textSub">
                                                                    ID: {extractId(b) ?? "-"}
                                                                </Text>
                                                            </Box>
                                                            <Badge colorScheme="green">Tanlash</Badge>
                                                        </Flex>
                                                    </Box>
                                                ))}
                                            </VStack>
                                        ) : !form.builder_id && builderQuery.trim() ? (
                                            <Text fontSize="sm" color="textSub">
                                                Natija topilmadi
                                            </Text>
                                        ) : null}
                                    </Box>
                                </Box>
                            </Grid>
                )}
            </GradientFormModal>

            <CreateCustomerModal
                isOpen={createCustomer.isOpen}
                onClose={createCustomer.onClose}
                initialName={customerQuery}
                onCreated={(created) => {
                    if (!created) return;
                    onPickCustomer(created);
                }}
            />

            <CreateBuilderModal
                isOpen={createBuilder.isOpen}
                onClose={createBuilder.onClose}
                initialName={builderQuery}
                onCreated={(created) => {
                    if (!created) return;
                    onPickBuilder(created);
                }}
            />
        </>
    );
}


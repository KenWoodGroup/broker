import {
    Badge,
    Box,
    Button,
    Divider,
    Flex,
    FormControl,
    FormLabel,
    Grid,
    Heading,
    HStack,
    Input,
    Modal,
    ModalBody,
    ModalCloseButton,
    ModalContent,
    ModalFooter,
    ModalHeader,
    ModalOverlay,
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
import { useEffect, useMemo, useRef, useState } from "react";
import { Plus } from "lucide-react";
import { apiLots } from "../../../utils/Controllers/Lots";
import { apiLotLocations } from "../../../utils/Controllers/LotLocations";
import CreateCustomerModal from "./CreateCustomerModal";
import CreateBuilderModal from "./CreateBuilderModal";

export default function CreateLotModal({ isOpen, onClose, onCreated, typeOptions = [], categoryOptions = [] }) {
    const toast = useToast();
    const createCustomer = useDisclosure();
    const createBuilder = useDisclosure();

    const [saving, setSaving] = useState(false);
    const [form, setForm] = useState({
        address: "",
        type: "",
        category: "",
        lot_number: "",
        lot_name: "",
        customer_id: null,
        builder_id: null,
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

    useEffect(() => {
        if (isOpen) {
            setForm({
                address: "",
                type: "",
                category: "",
                lot_number: "",
                lot_name: "",
                customer_id: null,
                builder_id: null,
                amount: "",
                note: "",
                start_date: "",
                end_date: "",
            });
            setCustomerQuery("");
            setBuilderQuery("");
            setCustomerResults([]);
            setBuilderResults([]);
            setSelectedCustomer(null);
            setSelectedBuilder(null);
        }
    }, [isOpen]);

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

    useEffect(() => {
        const q = customerQuery.trim();
        if (!isOpen) return;
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
    }, [customerQuery, isOpen]);

    // Builder search (debounced)
    useEffect(() => {
        const q = builderQuery.trim();
        if (!isOpen) return;
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
    }, [builderQuery, isOpen]);

    const onPickCustomer = (c) => {
        const id = extractId(c);
        if (!id) {
            toast({
                title: "Customer ID topilmadi",
                description: "Tanlangan kartada ID yo‘q (response strukturasini tekshiring).",
                status: "warning",
                duration: 3500,
                isClosable: true,
            });
            return;
        }
        setSelectedCustomer(c);
        setForm((p) => ({ ...p, customer_id: id }));
        setCustomerQuery(c?.name ?? c?.title ?? c?.company_name ?? customerQuery);
        setCustomerResults([]);
    };

    const onPickBuilder = (b) => {
        const id = extractId(b);
        if (!id) {
            toast({
                title: "Quruvchi ID topilmadi",
                description: "Tanlangan kartada ID yo‘q (response strukturasini tekshiring).",
                status: "warning",
                duration: 3500,
                isClosable: true,
            });
            return;
        }
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
    const handleSubmit = async () => {
        if (!validate()) return;
        try {
            setSaving(true);
            const payload = {
                address: form.address.trim(),
                type: form.type,
                category: form.category,
                lot_number: form.lot_number.trim(),
                lot_name: form.lot_name.trim(),
                customer_id: form.customer_id,
                builder_id: form.builder_id,
                amount: Number(form.amount),
                note: form.note?.trim() || undefined,
                start_date: form.start_date,
                end_date: form.end_date,
            };
            const res = await apiLots.create(payload);
            const created = res?.data?.data ?? res?.data;
            onCreated?.(created);
            onClose?.();
        } finally {
            setSaving(false);
        }
    };

    const customerLabel = useMemo(() => {
        if (!form.customer_id) return "Tanlanmagan";
        const name = selectedCustomer?.name ?? selectedCustomer?.title ?? selectedCustomer?.company_name;
        return name ? `${name} (ID: ${form.customer_id})` : `ID: ${form.customer_id}`;
    }, [form.customer_id, selectedCustomer]);

    const builderLabel = useMemo(() => {
        if (!form.builder_id) return "Tanlanmagan";
        const name = selectedBuilder?.name ?? selectedBuilder?.title ?? selectedBuilder?.company_name;
        return name ? `${name} (ID: ${form.builder_id})` : `ID: ${form.builder_id}`;
    }, [form.builder_id, selectedBuilder]);

    return (
        <>
            <Modal isOpen={isOpen} onClose={onClose} isCentered size="6xl" scrollBehavior="inside">
                <ModalOverlay />
                <ModalContent bg="surface" borderColor="border">
                    <ModalHeader>Yaratish</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
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
                                                    setForm((p) => ({ ...p, customer_id: null }));
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
                                                aria-label="Company yaratish"
                                            >
                                                <Plus size="20px" />
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
                    </ModalBody>

                    <ModalFooter>
                        <Button variant="ghost" mr={3} onClick={onClose}>
                            Bekor qilish
                        </Button>
                        <Button colorScheme="green" onClick={handleSubmit} isLoading={saving}>
                            Saqlash
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>

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


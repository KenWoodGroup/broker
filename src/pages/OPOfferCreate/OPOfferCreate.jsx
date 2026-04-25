import { useEffect, useState } from "react";
import { useParams } from "react-router";
import {
    Box,
    Heading,
    VStack,
    HStack,
    FormControl,
    FormLabel,
    Input,
    Checkbox,
    Button,
    IconButton,
    Grid,
    useToast,
    Spinner,
    Text,
    Divider,
    Textarea,
    SimpleGrid,
    Badge,
} from "@chakra-ui/react";
import { AddIcon, DeleteIcon, CheckCircleIcon } from "@chakra-ui/icons";
import { apiUsers } from "../../utils/Controllers/Users";
import { apiOffers } from "../../utils/Controllers/Offers";
import { apiLots } from "../../utils/Controllers/Lots";

export default function OPOfferCreate() {
    const { id } = useParams();
    const toast = useToast();

    const [suppliers, setSuppliers] = useState([]);
    const [lots, setLots] = useState([]);
    const [loadingSuppliers, setLoadingSuppliers] = useState(true);
    const [loadingLots, setLoadingLots] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        location_id: id || "",
        construction_site_name: "",
        note: "",
        items: [
            {
                product_name: "",
                customer_price: "",
                unit: "dona",
                quantity: "",
                supplier_id: "",
            },
        ],
        date: new Date().toISOString().slice(0, 16),
        is_logist: true,
        address: "",
    });

    // Загрузка поставщиков
    useEffect(() => {
        const fetchSuppliers = async () => {
            try {
                setLoadingSuppliers(true);
                const response = await apiUsers.GetUserRole("supplier");
                const suppliersData = response.data || response;
                setSuppliers(suppliersData);
            } catch (error) {
                console.error(error);
                toast({
                    title: "Yetkazib beruvchilarni yuklashda xatolik",
                    description: "Yetkazib beruvchilar ro'yxatini yuklab bo'lmadi",
                    status: "error",
                    duration: 5000,
                    isClosable: true,
                });
            } finally {
                setLoadingSuppliers(false);
            }
        };
        fetchSuppliers();
    }, [toast]);

    // Загрузка списка объектов (лотов)
    useEffect(() => {
        const fetchLots = async () => {
            if (!id) {
                setLoadingLots(false);
                return;
            }
            try {
                setLoadingLots(true);
                const response = await apiLots.GetByParent(id);
                const lotsData = response.data || response;
                setLots(lotsData);
                // Если объекты есть и ещё не выбран, можно по умолчанию первый, но не обязательно
                if (lotsData && lotsData.length > 0 && !formData.construction_site_name) {
                    setFormData(prev => ({
                        ...prev,
                        construction_site_name: lotsData[0].lot_name
                    }));
                }
            } catch (error) {
                console.error(error);
                toast({
                    title: "Ob'ektlarni yuklashda xatolik",
                    description: "Ob'ektlar ro'yxatini yuklab bo'lmadi",
                    status: "error",
                    duration: 5000,
                    isClosable: true,
                });
            } finally {
                setLoadingLots(false);
            }
        };
        fetchLots();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id, toast]);

    const handleInputChange = (e) => {
        const { name, value, type } = e.target;
        const checked = e.target.checked;
        setFormData((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
        }));
    };

    const handleItemChange = (index, field, value) => {
        const updatedItems = [...formData.items];
        updatedItems[index] = { ...updatedItems[index], [field]: value };
        setFormData((prev) => ({ ...prev, items: updatedItems }));
    };

    const addItem = () => {
        setFormData((prev) => ({
            ...prev,
            items: [
                ...prev.items,
                {
                    product_name: "",
                    customer_price: "",
                    unit: "dona",
                    quantity: "",
                    supplier_id: "",
                },
            ],
        }));
    };

    const removeItem = (index) => {
        if (formData.items.length === 1) {
            toast({
                title: "Oxirgi pozitsiyani o'chirib bo'lmaydi",
                status: "warning",
                duration: 2000,
            });
            return;
        }
        setFormData((prev) => ({
            ...prev,
            items: prev.items.filter((_, i) => i !== index),
        }));
    };

    const validateForm = () => {
        if (!formData.location_id) {
            toast({ title: "Location ID majburiy", status: "error" });
            return false;
        }
        if (!formData.construction_site_name) {
            toast({ title: "Ob'ekt nomi majburiy", status: "error" });
            return false;
        }
        if (!formData.address) {
            toast({ title: "Manzil majburiy", status: "error" });
            return false;
        }
        if (!formData.date) {
            toast({ title: "Sana majburiy", status: "error" });
            return false;
        }
        for (let i = 0; i < formData.items.length; i++) {
            const item = formData.items[i];
            if (!item.product_name) {
                toast({ title: `${i + 1}-pozitsiyada mahsulot nomini ko'rsating`, status: "error" });
                return false;
            }
            if (!item.quantity || item.quantity <= 0) {
                toast({ title: `${i + 1}-pozitsiyada to'g'ri miqdorni ko'rsating`, status: "error" });
                return false;
            }
            if (!item.unit) {
                toast({ title: `${i + 1}-pozitsiyada o'lchov birligini ko'rsating`, status: "error" });
                return false;
            }
            if (!item.supplier_id) {
                toast({ title: `${i + 1}-pozitsiyada mas'ul xodimni tanlang`, status: "error" });
                return false;
            }
        }
        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        setSubmitting(true);
        const payload = {
            location_id: formData.location_id,
            construction_site_name: formData.construction_site_name,
            note: formData.note,
            items: formData.items.map((item) => ({
                product_name: item.product_name,
                customer_price: Number(item.customer_price),
                cost_price: 0,
                unit: item.unit,
                quantity: Number(item.quantity),
                supplier_id: item.supplier_id,
            })),
            date: new Date(formData.date).toISOString(),
            is_logist: formData.is_logist,
            address: formData.address,
        };

        try {
            await apiOffers.CreateOffer(payload);
            toast({
                title: "Buyurtma muvaffaqiyatli yaratildi",
                status: "success",
                duration: 5000,
                isClosable: true,
            });
            setFormData({
                location_id: id || "",
                construction_site_name: lots.length > 0 ? lots[0].lot_name : "",
                note: "",
                items: [
                    {
                        product_name: "",
                        customer_price: "",
                        unit: "dona",
                        quantity: "",
                        supplier_id: "",
                    },
                ],
                date: new Date().toISOString().slice(0, 16),
                is_logist: true,
                address: "",
            });
        } catch (error) {
            console.error(error);
            toast({
                title: "Buyurtma yaratishda xatolik",
                description: "Keyinroq urinib ko'ring",
                status: "error",
                duration: 5000,
                isClosable: true,
            });
        } finally {
            setSubmitting(false);
        }
    };

    if (loadingSuppliers || loadingLots) {
        return (
            <Box p={8} textAlign="center">
                <Spinner size="xl" />
                <Text mt={4}>Ma'lumotlar yuklanmoqda...</Text>
            </Box>
        );
    }

    return (
        <Box p={{ base: 4, md: 8 }} mx="auto">
            <Heading mb={6} size="lg">
                Yangi buyurtma yaratish
            </Heading>
            <form onSubmit={handleSubmit}>
                <VStack spacing={6} align="stretch">
                    {/* Блок выбора объекта (карточки или input) */}
                    <FormControl isRequired>
                        <FormLabel fontSize="md" fontWeight="semibold">Ob'ekt nomi</FormLabel>
                        {lots.length > 0 ? (
                            <SimpleGrid columns={{ base: 1, sm: 2, md: 3 }} spacing={4}>
                                {lots.map((lot) => (
                                    <Box
                                        key={lot.id}
                                        p={4}
                                        borderWidth="2px"
                                        borderRadius="lg"
                                        cursor="pointer"
                                        transition="all 0.2s"
                                        // bg={formData.construction_site_name === lot.lot_name ? "blue.50" : "white"}
                                        borderColor={formData.construction_site_name === lot.lot_name ? "blue.500" : "gray.200"}
                                        _hover={{ shadow: "md", borderColor: "blue.300" }}
                                        onClick={() => setFormData(prev => ({ ...prev, construction_site_name: lot.lot_name }))}
                                    >
                                        <HStack justify="space-between">
                                            <Text fontWeight="medium">{lot.lot_name}</Text>
                                            {formData.construction_site_name === lot.lot_name && (
                                                <CheckCircleIcon color="blue.500" boxSize={5} />
                                            )}
                                        </HStack>
                                        {lot.lot_code && (
                                            <Badge mt={2} colorScheme="gray">Kod: {lot.lot_code}</Badge>
                                        )}
                                    </Box>
                                ))}
                            </SimpleGrid>
                        ) : (
                            <Input
                                name="construction_site_name"
                                value={formData.construction_site_name}
                                onChange={handleInputChange}
                                placeholder="Ob'ekt nomini kiriting"
                                size="lg"
                            />
                        )}
                    </FormControl>

                    <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }} gap={4}>
                        <FormControl isRequired>
                            <FormLabel>Manzil</FormLabel>
                            <Input
                                name="address"
                                value={formData.address}
                                onChange={handleInputChange}
                                placeholder="Navoiy ko'ch., 10-uy"
                            />
                        </FormControl>
                        <FormControl isRequired>
                            <FormLabel>Yetkazib berish sanasi va vaqti</FormLabel>
                            <Input
                                name="date"
                                type="datetime-local"
                                value={formData.date}
                                onChange={handleInputChange}
                            />
                        </FormControl>
                        <FormControl display="flex" alignItems="center">
                            <FormLabel mb="0">Logistika kerakmi?</FormLabel>
                            <Checkbox
                                name="is_logist"
                                isChecked={formData.is_logist}
                                onChange={handleInputChange}
                                size="lg"
                            />
                        </FormControl>
                    </Grid>

                    <FormControl>
                        <FormLabel>Izoh</FormLabel>
                        <Textarea
                            name="note"
                            value={formData.note}
                            onChange={handleInputChange}
                            placeholder="Qo'shimcha ma'lumot"
                            rows={4}
                            resize="vertical"
                        />
                    </FormControl>

                    <Divider />

                    <Box>
                        <HStack justify="space-between" mb={4}>
                            <Heading size="md">Mahsulotlar</Heading>
                            <Button
                                leftIcon={<AddIcon />}
                                colorScheme="green"
                                onClick={addItem}
                                size="sm"
                            >
                                Mahsulot qo'shish
                            </Button>
                        </HStack>
                        <VStack spacing={6} align="stretch">
                            {formData.items.map((item, idx) => (
                                <Box
                                    key={idx}
                                    p={4}
                                    borderWidth="1px"
                                    borderRadius="lg"
                                    position="relative"
                                >
                                    <IconButton
                                        aria-label="Pozitsiyani o'chirish"
                                        icon={<DeleteIcon />}
                                        size="sm"
                                        position="absolute"
                                        top={2}
                                        right={2}
                                        onClick={() => removeItem(idx)}
                                        colorScheme="red"
                                        variant="ghost"
                                    />
                                    <VStack spacing={4} align="stretch" mt={2}>
                                        {/* Название товара - большая textarea на всю ширину */}
                                        <FormControl isRequired>
                                            <FormLabel fontSize="sm" fontWeight="semibold">Mahsulot nomi</FormLabel>
                                            <Textarea
                                                value={item.product_name}
                                                onChange={(e) =>
                                                    handleItemChange(idx, "product_name", e.target.value)
                                                }
                                                placeholder="Masalan: Beton M300, Armatura 12 mm, G'isht..."
                                                rows={4}
                                                resize="vertical"
                                            />
                                        </FormControl>

                                        {/* Остальные поля в сетке */}
                                        <Grid
                                            templateColumns={{ base: "1fr", sm: "repeat(2, 1fr)", md: "repeat(4, 1fr)" }}
                                            gap={3}
                                        >
                                            <FormControl>
                                                <FormLabel fontSize="sm">Perexodnoy narx</FormLabel>
                                                <Input
                                                    type="number"
                                                    value={item.customer_price}
                                                    onChange={(e) =>
                                                        handleItemChange(idx, "customer_price", e.target.valueAsNumber || "")
                                                    }
                                                    placeholder="Summa"
                                                />
                                            </FormControl>
                                            <FormControl isRequired>
                                                <FormLabel fontSize="sm">Miqdori</FormLabel>
                                                <Input
                                                    type="number"
                                                    value={item.quantity}
                                                    onChange={(e) =>
                                                        handleItemChange(idx, "quantity", e.target.valueAsNumber || "")
                                                    }
                                                    placeholder="10"
                                                />
                                            </FormControl>
                                            <FormControl isRequired>
                                                <FormLabel fontSize="sm">O'lchov birligi</FormLabel>
                                                <Input
                                                    value={item.unit}
                                                    onChange={(e) =>
                                                        handleItemChange(idx, "unit", e.target.value)
                                                    }
                                                    placeholder="dona, kg, m³"
                                                />
                                            </FormControl>
                                            <FormControl isRequired>
                                                <FormLabel fontSize="sm">Masul xodim</FormLabel>
                                                <Select
                                                    value={item.supplier_id}
                                                    onChange={(e) =>
                                                        handleItemChange(idx, "supplier_id", e.target.value)
                                                    }
                                                    placeholder="Masul xodimni tanlang"
                                                >
                                                    {suppliers.map((supplier) => (
                                                        <option key={supplier.id} value={supplier.id}>
                                                            {supplier.full_name} (@{supplier.username})
                                                        </option>
                                                    ))}
                                                </Select>
                                            </FormControl>
                                        </Grid>
                                    </VStack>
                                </Box>
                            ))}
                        </VStack>
                    </Box>

                    <Divider />

                    <Button
                        type="submit"
                        colorScheme="blue"
                        size="lg"
                        isLoading={submitting}
                        loadingText="Yaratilmoqda..."
                        alignSelf="flex-end"
                    >
                        Buyurtma yaratish
                    </Button>
                </VStack>
            </form>
        </Box>
    );
}

// Вспомогательный компонент Select (если не был импортирован)
const Select = ({ value, onChange, placeholder, children }) => (
    <Box as="select" value={value} onChange={onChange} placeholder={placeholder} style={{ width: '100%', padding: '8px', borderRadius: 'md', border: '1px solid #CBD5E0' }}>
        <option value="" disabled>{placeholder}</option>
        {children}
    </Box>
);
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { apiOffers } from "../../utils/Controllers/Offers";
import {
    Box,
    Card,
    CardBody,
    Heading,
    Text,
    Grid,
    SimpleGrid,
    Table,
    Thead,
    Tbody,
    Tr,
    Th,
    Td,
    TableContainer,
    Spinner,
    Alert,
    AlertIcon,
    Divider,
    HStack,
    VStack,
    Flex,
    Button,
    Badge,
    Icon,
    useToast,
    Accordion,
    AccordionItem,
    AccordionButton,
    AccordionPanel,
    AccordionIcon,
} from "@chakra-ui/react";
import {
    ArrowLeft,
    Building,
    User,
    DollarSign,
    Package,
    Clock,
    CheckCircle,
    XCircle,
    Truck,
    Factory,
    CreditCard,
    FileText,
    PenTool,
    Star,
    Settings,
} from "lucide-react";
import { apiOfferItems } from "../../utils/Controllers/OfferItems";

// Статусы заказа с иконками из lucide-react
const statusConfig = {
    new: { label: "Yangi", icon: Star, color: "blue" },
    in_progress: { label: "Jarayonda", icon: Settings, color: "orange" },
    pending_confirmation: { label: "Tasdiqlash kutilmoqda", icon: Clock, color: "yellow" },
    price_review: { label: "Narx tekshiruvi", icon: DollarSign, color: "purple" },
    contract_ready: { label: "Shartnoma tayyor", icon: FileText, color: "teal" },
    contract_signed: { label: "Shartnoma imzolangan", icon: PenTool, color: "green" },
    payment_in_progress: { label: "To'lov jarayonida", icon: CreditCard, color: "cyan" },
    items_in_progress: { label: "Mahsulotlar tayyorlanmoqda", icon: Package, color: "blue" },
    in_delivery: { label: "Yetkazib berishda", icon: Truck, color: "purple" },
    delivered: { label: "Yetkazib berilgan", icon: CheckCircle, color: "green" },
    completed: { label: "Tugallangan", icon: CheckCircle, color: "green" },
    cancelled: { label: "Bekor qilingan", icon: XCircle, color: "red" },
    variant_completed: { label: "Variantlar yakunlandi", icon: CheckCircle, color: "green" },
};

export default function BROffersDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const toast = useToast();
    const [offer, setOffer] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [updatingItemId, setUpdatingItemId] = useState(null);

    useEffect(() => {
        const fetchOffer = async () => {
            try {
                setLoading(true);
                const response = await apiOffers.getOffer(id);
                setOffer(response.data);
            } catch (err) {
                console.error(err);
                setError("Ma'lumotlarni yuklashda xatolik yuz berdi");
                toast({
                    title: "Xatolik",
                    description: "Buyurtma ma'lumotlarini yuklab bo'lmadi",
                    status: "error",
                    duration: 5000,
                    isClosable: true,
                });
            } finally {
                setLoading(false);
            }
        };
        if (id) fetchOffer();
    }, [id, toast]);

    const updateItemStatus = async (itemId) => {
        try {
            setUpdatingItemId(itemId);
            await apiOfferItems.updateStatus(itemId, { status: "variant_completed" });

            // Локально обновляем статус элемента
            setOffer(prev => ({
                ...prev,
                offer_items: prev.offer_items.map(item =>
                    item.id === itemId ? { ...item, status: "variant_completed" } : item
                )
            }));

            toast({
                title: "Muvaffaqiyatli",
                description: "Variantlar yakunlandi deb belgilandi",
                status: "success",
                duration: 3000,
                isClosable: true,
            });
        } catch (err) {
            console.error(err);
            toast({
                title: "Xatolik",
                description: "Statusni yangilashda xatolik yuz berdi",
                status: "error",
                duration: 5000,
                isClosable: true,
            });
        } finally {
            setUpdatingItemId(null);
        }
    };

    // ИЗМЕНЁННАЯ ФУНКЦИЯ ФОРМАТИРОВАНИЯ ДАТЫ (ДД.ММ.ГГГГ)
    const formatDate = (dateString) => {
        if (!dateString) return "-";
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return "-";
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}.${month}.${year}`;
    };

    const formatPrice = (price) => {
        const amount = parseFloat(price);
        if (isNaN(amount)) return "0 UZS";
        return amount.toLocaleString("uz-UZ") + " UZS";
    };

    const getPaymentStatusText = (status) => {
        const map = {
            unpaid: "To'lanmagan",
            partially_paid: "Qisman to'langan",
            paid: "To'langan",
        };
        return map[status] || status;
    };

    const getItemStatusBadge = (status) => {
        switch (status) {
            case "delivered":
                return <Badge colorScheme="green">Yetkazilgan</Badge>;
            case "cancelled":
                return <Badge colorScheme="red">Bekor qilingan</Badge>;
            case "variant_completed":
                return <Badge colorScheme="green">Variantlar yakunlandi</Badge>;
            default:
                return <Badge colorScheme="yellow">Kutilmoqda</Badge>;
        }
    };

    if (loading) {
        return (
            <Flex justify="center" align="center" h="100vh">
                <Spinner size="xl" thickness="4px" />
            </Flex>
        );
    }

    if (error || !offer) {
        return (
            <Box p={6} minH="100vh">
                <Alert status="error" borderRadius="md">
                    <AlertIcon />
                    {error || "Buyurtma topilmadi"}
                </Alert>
            </Box>
        );
    }

    const statusInfo = statusConfig[offer.status] || statusConfig.in_progress;
    const StatusIcon = statusInfo.icon;

    return (
        <Box pr={{ base: 4 }} minH="100vh">
            <Box maxW="1400px" mx="auto">
                <Button
                    leftIcon={<Icon as={ArrowLeft} />}
                    variant="ghost"
                    mb={6}
                    onClick={() => navigate(-1)}
                >
                    Orqaga
                </Button>

                <Card borderRadius="2xl" boxShadow="lg" mb={8}>
                    <Flex
                        direction={{ base: "column", sm: "row" }}
                        justify="space-between"
                        align={{ base: "start", sm: "center" }}
                        p={6}
                        borderBottomWidth="1px"
                        gap={4}
                    >
                        <HStack spacing={4}>
                            <Icon as={Package} boxSize={6} color="blue.500" />
                            <Box>
                                <Heading size="lg">{offer.offer_number}</Heading>
                                <Text color="gray.500" fontSize="sm">
                                    {formatDate(offer.date)}
                                </Text>
                            </Box>
                        </HStack>
                        <Badge
                            px={4}
                            py={2}
                            borderRadius="full"
                            fontSize="md"
                            display="inline-flex"
                            alignItems="center"
                            gap={2}
                            colorScheme={statusInfo.color}
                        >
                            <Icon as={StatusIcon} size={16} />
                            {statusInfo.label}
                        </Badge>
                    </Flex>

                    <CardBody p={6}>
                        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6} mb={8}>
                            <Card variant="outline">
                                <CardBody>
                                    <HStack mb={3} spacing={2}>
                                        <Icon as={Building} color="blue.500" />
                                        <Heading size="sm">Qurilish ob'ekti</Heading>
                                    </HStack>
                                    <VStack align="stretch" spacing={2}>
                                        <Text fontWeight="bold">{offer.construction_site_name || "-"}</Text>
                                        <Text fontSize="sm" color="gray.600">
                                            {offer.address || "Manzil ko'rsatilmagan"}
                                        </Text>
                                    </VStack>
                                </CardBody>
                            </Card>
                        </SimpleGrid>
                        {offer.note && (
                            <Alert status="info" borderRadius="lg" mb={6}>
                                <AlertIcon />
                                <Text fontWeight="medium" mr={2}>Izoh:</Text>
                                <Text>{offer.note}</Text>
                            </Alert>
                        )}

                        <Divider my={6} />

                        <Heading size="md" mb={4}>Mahsulotlar va variantlar</Heading>
                        <VStack spacing={6} align="stretch">
                            {offer.offer_items?.map((item, idx) => (
                                <Card key={item.id} variant="outline" borderRadius="lg" overflow="hidden">
                                    <CardBody p={5}>
                                        <Flex justify="space-between" wrap="wrap" gap={3} mb={4}>
                                            <HStack>
                                                <Text fontWeight="bold" fontSize="lg">{idx + 1}.</Text>
                                                <Heading size="sm">{item.product_name}</Heading>
                                            </HStack>
                                            <HStack spacing={3}>
                                                {getItemStatusBadge(item.status)}
                                                {item.status !== "variant_completed" && item.status !== "pending" && (
                                                    <Button
                                                        size="sm"
                                                        colorScheme="green"
                                                        isLoading={updatingItemId === item.id}
                                                        onClick={() => updateItemStatus(item.id)}
                                                    >
                                                        Variantlar yakunlandi
                                                    </Button>
                                                )}
                                            </HStack>
                                        </Flex>

                                        <SimpleGrid columns={{ base: 2, md: 4 }} spacing={3} mb={4} fontSize="sm">
                                            <Box>
                                                <Text color="gray.500">Miqdori</Text>
                                                <Text fontWeight="medium">{parseFloat(item.quantity).toLocaleString()} {item.unit}</Text>
                                            </Box>
                                            <Box>
                                                <Text color="gray.500">Narxi (customer)</Text>
                                                <Text fontWeight="medium">{formatPrice(item.customer_price)}</Text>
                                            </Box>
                                        </SimpleGrid>

                                        {item.variants && item.variants.length > 0 && (
                                            <Box mt={3} pt={3} borderTopWidth="1px">
                                                <HStack mb={2}>
                                                    <Icon as={Factory} color="purple.500" />
                                                    <Text fontWeight="semibold" fontSize="sm">Variantlar ({item.variants.length})</Text>
                                                </HStack>
                                                <Accordion allowToggle>
                                                    <AccordionItem border="none">
                                                        <AccordionButton px={0} py={1}>
                                                            <Box flex="1" textAlign="left" fontSize="sm">
                                                                Barcha variantlarni ko'rish
                                                            </Box>
                                                            <AccordionIcon />
                                                        </AccordionButton>
                                                        <AccordionPanel pb={4} px={0}>
                                                            <TableContainer>
                                                                <Table size="sm" variant="simple">
                                                                    <Thead>
                                                                        <Tr>
                                                                            <Th>Mahsulot nomi</Th>
                                                                            <Th>Zavod</Th>
                                                                            <Th>Manzil</Th>
                                                                            <Th isNumeric>Narxi</Th>
                                                                            <Th>Yetkazib berish</Th>
                                                                        </Tr>
                                                                    </Thead>
                                                                    <Tbody>
                                                                        {item.variants.map((variant, vIdx) => (
                                                                            <Tr key={vIdx}>
                                                                                <Td>{variant.product_name}</Td>
                                                                                <Td>{variant.factory_name || "-"}</Td>
                                                                                <Td>{variant.address}</Td>
                                                                                <Td isNumeric>{formatPrice(variant.cost_price)}</Td>
                                                                                <Td>{variant.is_delivery ? "Bor" : "Yo'q"}</Td>
                                                                            </Tr>
                                                                        ))}
                                                                    </Tbody>
                                                                </Table>
                                                            </TableContainer>
                                                        </AccordionPanel>
                                                    </AccordionItem>
                                                </Accordion>
                                            </Box>
                                        )}

                                        {item.selected_variant_id && (
                                            <Box mt={2} fontSize="sm" color="gray.500">
                                                Tanlangan variant ID: {item.selected_variant_id}
                                            </Box>
                                        )}
                                    </CardBody>
                                </Card>
                            ))}
                        </VStack>

                        {(!offer.offer_items || offer.offer_items.length === 0) && (
                            <Text color="gray.500" textAlign="center" py={8}>
                                Mahsulotlar mavjud emas
                            </Text>
                        )}
                    </CardBody>
                </Card>
            </Box>
        </Box>
    );
}
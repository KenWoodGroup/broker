import { useEffect, useState } from "react";
import { apiOffers } from "../../utils/Controllers/Offers";
import { useParams } from "react-router-dom";
import {
    Box,
    Card,
    CardBody,
    Heading,
    Text,
    Grid,
    GridItem,
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
    Icon,
    Flex,
    useToast,
    Button,
    Badge,
    Wrap,
    WrapItem,
    Tooltip,
} from "@chakra-ui/react";
import {
    FaLocationDot,
    FaBuilding,
    FaMoneyBill,
    FaReceipt,
    FaArrowLeft,
    FaBox,
    FaUser,
    FaPhone,
} from "react-icons/fa6";
import { useNavigate } from "react-router-dom";
import {
    Star,
    Settings,
    Clock,
    DollarSign,
    FileText,
    PenTool,
    CreditCard,
    Package,
    Truck,
    Check,
    CheckCircle2,
    X,
} from "lucide-react";
import AddProduct from "./__components/AddProduct";

// Status configuration with Lucide icons and custom colors
const statusConfig = [
    { id: "new", label: "Yangi", icon: Star, color: "gray", bg: "gray.50", borderColor: "gray.300", textColor: "gray.700" },
    { id: "in_progress", label: "Jarayonda", icon: Settings, color: "blue", bg: "blue.50", borderColor: "blue.300", textColor: "blue.700" },
    { id: "pending_confirmation", label: "Tasdiqlash kutilmoqda", icon: Clock, color: "orange", bg: "orange.50", borderColor: "orange.300", textColor: "orange.700" },
    { id: "price_review", label: "Narx tekshiruvi", icon: DollarSign, color: "yellow", bg: "yellow.50", borderColor: "yellow.300", textColor: "yellow.700" },
    { id: "contract_ready", label: "Shartnoma tayyor", icon: FileText, color: "teal", bg: "teal.50", borderColor: "teal.300", textColor: "teal.700" },
    { id: "contract_signed", label: "Shartnoma imzolangan", icon: PenTool, color: "cyan", bg: "cyan.50", borderColor: "cyan.300", textColor: "cyan.700" },
    { id: "payment_in_progress", label: "To'lov jarayonida", icon: CreditCard, color: "purple", bg: "purple.50", borderColor: "purple.300", textColor: "purple.700" },
    { id: "items_in_progress", label: "Mahsulotlar tayyorlanmoqda", icon: Package, color: "pink", bg: "pink.50", borderColor: "pink.300", textColor: "pink.700" },
    { id: "in_delivery", label: "Yetkazib berishda", icon: Truck, color: "orange", bg: "orange.50", borderColor: "orange.300", textColor: "orange.700" },
    { id: "delivered", label: "Yetkazib berilgan", icon: Check, color: "green", bg: "green.50", borderColor: "green.300", textColor: "green.700" },
    { id: "completed", label: "Tugallangan", icon: CheckCircle2, color: "green", bg: "green.50", borderColor: "green.300", textColor: "green.700" },
    { id: "cancelled", label: "Bekor qilingan", icon: X, color: "red", bg: "red.50", borderColor: "red.300", textColor: "red.700" },
];

export default function BROffersDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [offer, setOffer] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [updatingStatus, setUpdatingStatus] = useState(false);
    const toast = useToast();

    const getOffer = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await apiOffers?.getOffer(id);
            setOffer(response.data);
        } catch (err) {
            setError("Ma'lumotlarni yuklashda xatolik yuz berdi");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (id) {
            getOffer();
        }
    }, [id]);

    const formatDate = (dateString) => {
        if (!dateString) return "-";
        const date = new Date(dateString);
        return date.toLocaleDateString('uz-UZ', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        }) + ' ' + date.toLocaleTimeString('uz-UZ', {
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const formatPrice = (price) => {
        const amount = parseFloat(price);
        return amount.toLocaleString('uz-UZ') + ' UZS';
    };

    const getPaymentStatusText = (status) => {
        const statusConfig = {
            unpaid: "To'lanmagan",
            partially_paid: "Qisman to'langan",
            paid: "To'langan",
        };
        return statusConfig[status] || status;
    };

    const getPaymentStatusColor = (status) => {
        const colors = {
            unpaid: "red",
            partially_paid: "orange",
            paid: "green",
        };
        return colors[status] || "gray";
    };

    const getItemStatusText = (status) => {
        return status === "pending" ? "Kutilmoqda" : status === "delivered" ? "Yetkazilgan" : status;
    };

    const updateStatus = async (newStatus) => {
        if (newStatus === offer.status) {
            toast({
                title: "Ma'lumot",
                description: "Bu holat allaqachon tanlangan",
                status: "info",
                duration: 2000,
                isClosable: true,
            });
            return;
        }

        try {
            setUpdatingStatus(true);
            const data = { status: newStatus };
            await apiOffers?.UpdateStatus(offer.id, data);

            toast({
                title: "Muvaffaqiyatli",
                description: `Holat "${statusConfig.find(s => s.id === newStatus)?.label}" ga o'zgartirildi`,
                status: "success",
                duration: 3000,
                isClosable: true,
            });

            await getOffer();
        } finally {
            setUpdatingStatus(false);
        }
    };

    if (loading) {
        return (
            <Flex justify="center" align="center" h="100vh">
                <Spinner size="xl" thickness="4px" />
            </Flex>
        );
    }

    if (error) {
        return (
            <Box p={6}>
                <Alert status="error" borderRadius="md">
                    <AlertIcon />
                    {error}
                </Alert>
            </Box>
        );
    }

    if (!offer) {
        return (
            <Box p={6}>
                <Alert status="warning" borderRadius="md">
                    <AlertIcon />
                    Ma'lumot topilmadi
                </Alert>
            </Box>
        );
    }

    const currentStatus = statusConfig.find(s => s.id === offer.status);

    return (
        <Box py={`20px`} minH="100vh">
            <Box maxW="1200px" mx="auto">
                {/* Back Button */}
                <Button
                    leftIcon={<FaArrowLeft />}
                    variant="ghost"
                    mb={6}
                    onClick={() => navigate(-1)}
                >
                    Orqaga
                </Button>

                {/* Main Card */}
                <Card variant="outline" borderRadius="lg" overflow="hidden" boxShadow="sm">
                    {/* Header */}
                    <Box borderBottom="1px solid" borderColor="gray.200" px={6} py={5} >
                        <Flex justify="space-between" align="center" wrap="wrap" gap={4}>
                            <HStack spacing={4}>
                                <Icon as={FaReceipt} boxSize={6} color="blue.500" />
                                <Box>
                                    <Heading size="lg" >
                                        {offer.offer_number}
                                    </Heading>
                                    <Text fontSize="sm" mt={1}>
                                        {formatDate(offer.date)}
                                    </Text>
                                </Box>
                            </HStack>
                        </Flex>
                    </Box>

                    {/* Status Display */}
                    <Box px={6} py={4} borderBottom="1px solid" borderColor="gray.200">
                        <HStack spacing={3}>
                            <Text fontWeight="bold" fontSize="sm" color="gray.600">
                                Buyurtma holati:
                            </Text>
                            <Badge
                                size="lg"
                                p={2}
                                borderRadius="md"
                                bg={currentStatus?.bg}
                                color={currentStatus?.textColor}
                                border="1px solid"
                                borderColor={currentStatus?.borderColor}
                                leftIcon={<Icon as={currentStatus?.icon} mr={1} />}
                                display="flex"
                                alignItems="center"
                            >
                                <Icon as={currentStatus?.icon} mr={2} />
                                {currentStatus?.label}
                            </Badge>
                        </HStack>
                    </Box>

                    <CardBody p={6}>
                        {/* Main Info Grid */}
                        <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={6} mb={6}>
                            <GridItem>
                                <VStack align="start" spacing={4}>
                                    <Box w="100%">
                                        <Text fontWeight="bold" mb={3} fontSize="md" >
                                            <Icon as={FaBuilding} mr={2} />
                                            Qurilish ma'lumotlari
                                        </Text>
                                        <VStack align="start" spacing={2} pl={6}>
                                            <HStack>
                                                <Text fontWeight="medium" w="100px">Nomi:</Text>
                                                <Text>{offer.construction_site_name}</Text>
                                            </HStack>
                                            <HStack>
                                                <Text fontWeight="medium" w="100px">Manzil:</Text>
                                                <Text>{offer.address}</Text>
                                            </HStack>
                                        </VStack>
                                    </Box>

                                    <Box w="100%">
                                        <Text fontWeight="bold" mb={3} fontSize="md" >
                                            <Icon as={FaUser} mr={2} />
                                            Mijoz ma'lumotlari
                                        </Text>
                                        <VStack align="start" spacing={2} pl={6}>
                                            <HStack>
                                                <Text fontWeight="medium" w="100px">Nomi:</Text>
                                                <Text>{offer.location?.name}</Text>
                                            </HStack>
                                            <HStack>
                                                <Text fontWeight="medium" w="100px">Manzil:</Text>
                                                <Text>{offer.location?.address}</Text>
                                            </HStack>
                                            <HStack>
                                                <Text fontWeight="medium" w="100px">Telefon:</Text>
                                                <Text>{offer.location?.phone}</Text>
                                            </HStack>
                                        </VStack>
                                    </Box>
                                </VStack>
                            </GridItem>

                            <GridItem>
                                <VStack align="start" spacing={4}>
                                    <Box w="100%">
                                        <Text fontWeight="bold" mb={3} fontSize="md" >
                                            <Icon as={FaMoneyBill} mr={2} />
                                            To'lov ma'lumotlari
                                        </Text>
                                        <VStack align="start" spacing={2} pl={6}>
                                            <HStack>
                                                <Text fontWeight="medium" w="150px">Umumiy summa:</Text>
                                                <Text fontWeight="bold" color="blue.600">
                                                    {formatPrice(offer.total_sum)}
                                                </Text>
                                            </HStack>
                                            <HStack>
                                                <Text fontWeight="medium" w="150px">To'langan summa:</Text>
                                                <Text color="green.600">{formatPrice(offer.paid_sum)}</Text>
                                            </HStack>
                                            <HStack>
                                                <Text fontWeight="medium" w="150px">To'lov holati:</Text>
                                                <Badge
                                                    colorScheme={getPaymentStatusColor(offer.payment_status)}
                                                    px={2}
                                                    py={1}
                                                >
                                                    {getPaymentStatusText(offer.payment_status)}
                                                </Badge>
                                            </HStack>
                                            <HStack>
                                                <Text fontWeight="medium" w="150px">Yetkazib berish summasi:</Text>
                                                <Text>{formatPrice(offer.total_delivery_sum)}</Text>
                                            </HStack>
                                        </VStack>
                                    </Box>

                                    {offer.contract_number && (
                                        <Box w="100%">
                                            <Text fontWeight="bold" mb={3} fontSize="md" >
                                                <Icon as={FaReceipt} mr={2} />
                                                Kontrakt
                                            </Text>
                                            <VStack align="start" spacing={2} pl={6}>
                                                <HStack>
                                                    <Text fontWeight="medium" w="100px">Raqam:</Text>
                                                    <Text>{offer.contract_number}</Text>
                                                </HStack>
                                            </VStack>
                                        </Box>
                                    )}
                                </VStack>
                            </GridItem>
                        </Grid>

                        {/* Note */}
                        {offer.note && (
                            <Alert status="info" borderRadius="md" mb={6}>
                                <AlertIcon />
                                <Text fontWeight="bold" mr={2}>Izoh:</Text>
                                <Text>{offer.note}</Text>
                            </Alert>
                        )}

                        <Divider my={6} />

                        {/* Products Table */}
                        <Box>
                            <Flex justifyContent={'space-between'} mb={4}>
                                <Heading size="md" >
                                    <Icon as={FaBox} mr={2} />
                                    Mahsulotlar
                                </Heading>
                                <AddProduct />
                            </Flex>
                            <TableContainer borderWidth="1px" borderRadius="md" overflowX="auto">
                                <Table variant="simple" size="sm">
                                    <Thead >
                                        <Tr>
                                            <Th>№</Th>
                                            <Th>Mahsulot nomi</Th>
                                            <Th isNumeric>Miqdori</Th>
                                            <Th isNumeric>Birlik</Th>
                                            <Th isNumeric>Sotish narxi</Th>
                                            <Th isNumeric>Umumiy summa</Th>
                                            <Th isNumeric>Yetkazilgan</Th>
                                            <Th>Holati</Th>
                                        </Tr>
                                    </Thead>
                                    <Tbody>
                                        {offer.offer_items?.map((item, idx) => (
                                            <Tr key={item.id}>
                                                <Td>{idx + 1}</Td>
                                                <Td fontWeight="medium">{item.product_name}</Td>
                                                <Td isNumeric>{parseFloat(item.quantity).toLocaleString()}</Td>
                                                <Td isNumeric>{item.unit}</Td>
                                                <Td isNumeric>{formatPrice(item.sale_price)}</Td>
                                                <Td isNumeric>
                                                    <Text fontWeight="bold" color="blue.600">
                                                        {formatPrice(parseFloat(item.quantity) * parseFloat(item.sale_price))}
                                                    </Text>
                                                </Td>
                                                <Td isNumeric>{parseFloat(item.delivered_quantity).toLocaleString()}</Td>
                                                <Td>
                                                    <Badge
                                                        colorScheme={item.status === 'delivered' ? 'green' : 'orange'}
                                                        variant="subtle"
                                                    >
                                                        {getItemStatusText(item.status)}
                                                    </Badge>
                                                </Td>
                                            </Tr>
                                        ))}
                                    </Tbody>
                                </Table>
                            </TableContainer>
                        </Box>

                        {/* Summary Section */}
                        <Box mt={6} p={4} borderRadius="md">
                            <Flex justify="space-between" align="center" wrap="wrap" gap={4}>
                                <Box>
                                    <Text fontSize="sm" color="gray.600">Mahsulotlar soni</Text>
                                    <Text fontSize="xl" fontWeight="bold">
                                        {offer.offer_items?.length || 0} ta
                                    </Text>
                                </Box>
                                <Box>
                                    <Text fontSize="sm" color="gray.600">Umumiy miqdor</Text>
                                    <Text fontSize="xl" fontWeight="bold">
                                        {offer.offer_items?.reduce((sum, item) => sum + parseFloat(item.quantity), 0).toLocaleString()} dona
                                    </Text>
                                </Box>
                                <Box>
                                    <Text fontSize="sm" color="gray.600">Umumiy summa</Text>
                                    <Text fontSize="xl" fontWeight="bold" color="blue.600">
                                        {formatPrice(offer.total_sum)}
                                    </Text>
                                </Box>
                            </Flex>
                        </Box>
                    </CardBody>
                </Card>
            </Box>
        </Box>
    );
}
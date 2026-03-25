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
import EditStatus from "./__components/EditStatus";

export default function OffersDetail({status}) {
    const { id } = useParams();
    const navigate = useNavigate();
    const [offer, setOffer] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const toast = useToast();

    const getOffer = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await apiOffers?.getOffer(id);

            if (response?.status === 200 && response?.data) {
                setOffer(response.data);
            } else {
                setError("Ma'lumotlarni yuklashda xatolik yuz berdi");
                toast({
                    title: "Xatolik",
                    description: "Ma'lumotlarni yuklashda xatolik yuz berdi",
                    status: "error",
                    duration: 3000,
                    isClosable: true,
                });
            }
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

    const getStatusText = (status) => {
        const statusConfig = {
            pending_confirmation: "Kutilmoqda",
            confirmed: "Tasdiqlangan",
            cancelled: "Bekor qilingan",
            completed: "Tugallangan",
        };
        return statusConfig[status] || status;
    };

    const getPaymentStatusText = (status) => {
        const statusConfig = {
            unpaid: "To'lanmagan",
            partially_paid: "Qisman to'langan",
            paid: "To'langan",
        };
        return statusConfig[status] || status;
    };

    const getItemStatusText = (status) => {
        return status === "pending" ? "Kutilmoqda" : status;
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
                <Card variant="outline" borderRadius="lg" overflow="hidden">
                    {/* Header */}
                    <Box borderBottom="1px solid" borderColor="gray.200" px={6} py={5}>
                        <Flex justify="space-between" align="center" wrap="wrap" gap={4}>
                            <HStack spacing={4}>
                                <Icon as={FaReceipt} boxSize={5} />
                                <Box>
                                    <Heading size="lg">
                                        {offer.offer_number}
                                    </Heading>
                                    <Text fontSize="sm" color="gray.600" mt={1}>
                                        {formatDate(offer.date)}
                                    </Text>
                                </Box>
                            </HStack>
                            {/* <Text fontSize="sm" color="gray.600">
                                {getStatusText(offer.status)}
                            </Text> */}
                            <EditStatus id={offer.id} text={'Siz rostanxam keyingi jarayonga otkazmoqchmisiz ?'} refresh={getOffer} status={status} />
                        </Flex>
                    </Box>
                    <CardBody p={6}>
                        {/* Main Info Grid */}
                        <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={6} mb={6}>
                            <GridItem>
                                <VStack align="start" spacing={4}>
                                    <Box>
                                        <Text fontWeight="bold" mb={2}>
                                            <Icon as={FaBuilding} mr={2} />
                                            Qurilish ma'lumotlari
                                        </Text>
                                        <VStack align="start" spacing={2} pl={6}>
                                            <HStack>
                                                <Text fontWeight="medium">Nomi:</Text>
                                                <Text>{offer.construction_site_name}</Text>
                                            </HStack>
                                            <HStack>
                                                <Text fontWeight="medium">Manzil:</Text>
                                                <Text>{offer.address}</Text>
                                            </HStack>
                                        </VStack>
                                    </Box>

                                    <Box>
                                        <Text fontWeight="bold" mb={2}>
                                            <Icon as={FaUser} mr={2} />
                                            Mijoz ma'lumotlari
                                        </Text>
                                        <VStack align="start" spacing={2} pl={6}>
                                            <HStack>
                                                <Text fontWeight="medium">Nomi:</Text>
                                                <Text>{offer.location?.name}</Text>
                                            </HStack>
                                            <HStack>
                                                <Text fontWeight="medium">Manzil:</Text>
                                                <Text>{offer.location?.address}</Text>
                                            </HStack>
                                            <HStack>
                                                <Text fontWeight="medium">Telefon:</Text>
                                                <Text>{offer.location?.phone}</Text>
                                            </HStack>
                                        </VStack>
                                    </Box>
                                </VStack>
                            </GridItem>

                            <GridItem>
                                <VStack align="start" spacing={4}>
                                    <Box>
                                        <Text fontWeight="bold" mb={2}>
                                            <Icon as={FaMoneyBill} mr={2} />
                                            To'lov ma'lumotlari
                                        </Text>
                                        <VStack align="start" spacing={2} pl={6}>
                                            <HStack>
                                                <Text fontWeight="medium">Umumiy summa:</Text>
                                                <Text fontWeight="bold">
                                                    {formatPrice(offer.total_sum)}
                                                </Text>
                                            </HStack>
                                            <HStack>
                                                <Text fontWeight="medium">To'langan summa:</Text>
                                                <Text>{formatPrice(offer.paid_sum)}</Text>
                                            </HStack>
                                            <HStack>
                                                <Text fontWeight="medium">To'lov holati:</Text>
                                                <Text>{getPaymentStatusText(offer.payment_status)}</Text>
                                            </HStack>
                                            <HStack>
                                                <Text fontWeight="medium">Yetkazib berish summasi:</Text>
                                                <Text>{formatPrice(offer.total_delivery_sum)}</Text>
                                            </HStack>
                                        </VStack>
                                    </Box>

                                    {offer.contract_number && (
                                        <Box>
                                            <Text fontWeight="bold" mb={2}>
                                                <Icon as={FaReceipt} mr={2} />
                                                Kontrakt
                                            </Text>
                                            <VStack align="start" spacing={2} pl={6}>
                                                <HStack>
                                                    <Text fontWeight="medium">Raqam:</Text>
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
                            <Heading size="md" mb={4}>
                                <Icon as={FaBox} mr={2} />
                                Mahsulotlar
                            </Heading>
                            <TableContainer borderWidth="1px" borderRadius="md" overflowX="auto">
                                <Table variant="simple" size="sm">
                                    <Thead>
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
                                                    <Text fontWeight="bold">
                                                        {formatPrice(parseFloat(item.quantity) * parseFloat(item.sale_price))}
                                                    </Text>
                                                </Td>
                                                <Td isNumeric>{parseFloat(item.delivered_quantity).toLocaleString()}</Td>
                                                <Td>
                                                    <Text fontSize="sm" color="gray.600">
                                                        {getItemStatusText(item.status)}
                                                    </Text>
                                                </Td>
                                            </Tr>
                                        ))}
                                    </Tbody>
                                </Table>
                            </TableContainer>
                        </Box>

                        {/* Summary Section */}
                        <Box mt={6} p={4} border="1px solid" borderColor="gray.200" borderRadius="md">
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
                                    <Text fontSize="xl" fontWeight="bold">
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
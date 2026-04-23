import { useEffect, useState } from "react";
import { apiOffers } from "../../utils/Controllers/Offers";
import {
    Box,
    Card,
    CardBody,
    Heading,
    Text,
    Grid,
    GridItem,
    Spinner,
    Alert,
    AlertIcon,
    HStack,
    VStack,
    Icon,
    Flex,
    useToast,
    Center,
} from "@chakra-ui/react";
import {
    FaLocationDot,
    FaBuilding,
    FaMoneyBill,
    FaReceipt,
    FaUser,
} from "react-icons/fa6";
import { NavLink } from "react-router-dom";
import { Package } from "lucide-react";
import PaginationBar from "../../components/common/PaginationBar";

export default function Offers({ status, link }) {
    const [offers, setOffers] = useState([]);
    const [pagination, setPagination] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const toast = useToast();

    const getAllOffers = async (page) => {
        try {
            setLoading(true);
            setError(null);
            const response = await apiOffers?.GetByStatus(page, 20, status);
            setOffers(response.data.data?.records || []);
            setPagination(response.data.pagination);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        getAllOffers(currentPage);
    }, [currentPage]);

    const handlePageChange = (newPage) => {
        setCurrentPage(newPage);
    };

    // Новая функция форматирования даты: ДД.ММ.ГГГГ
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

    const EmptyData = () => (
        <Center border={'1px'} py={10} borderRadius={'10px'}>
            <VStack spacing={4}>
                <Box p={4} borderRadius="full">
                    <Package size={40} />
                </Box>
                <Heading size="md" color="gray.500">
                    Buyurtmalar mavjud emas
                </Heading>
                <Text color="gray.400" textAlign="center">
                    Hali buyurtmalar yo'q.<br />
                </Text>
            </VStack>
        </Center>
    );

    return (
        <Box py={'20px'} pl="20px" pr="20px" pb="20px" pt="20px" minH="100vh">
            <Box maxW="1400px" mx="auto">
                <Box mb={6}>
                    <Heading as="h1" size="xl" mb={2}>
                        Kutilayotgan buyurtmalar
                    </Heading>
                    {pagination && pagination.total_count > 0 && (
                        <Text fontSize="md" color="gray.600">
                            Jami: {pagination.total_count} ta buyurtma
                        </Text>
                    )}
                </Box>

                {offers.length === 0 ? (
                    <EmptyData />
                ) : (
                    <>
                        <VStack spacing={6} align="stretch">
                            {offers.map((offer) => (
                                <NavLink to={`${link}${offer?.id}`} key={offer.id}>
                                    <Card variant="outline" borderRadius="lg" overflow="hidden" _hover={{ shadow: "md" }}>
                                        <Box borderBottom="1px solid" borderColor="gray.200" px={6} py={4}>
                                            <Flex justify="space-between" align="center" wrap="wrap" gap={3}>
                                                <HStack spacing={3}>
                                                    <Icon as={FaReceipt} boxSize={5} />
                                                    <Heading size="md">
                                                        {offer.offer_number}
                                                    </Heading>
                                                    <Text fontSize="sm" color="gray.600">
                                                        {getStatusText(offer.status)}
                                                    </Text>
                                                    <HStack spacing={1} ml={2}>
                                                        <Icon as={FaUser} boxSize={3} color="gray.500" />
                                                        <Text fontSize="sm" color="gray.600">
                                                            От: {offer.location.name}
                                                        </Text>
                                                    </HStack>
                                                </HStack>
                                                <Text fontSize="sm" color="gray.600">
                                                    {formatDate(offer.date)}
                                                </Text>
                                            </Flex>
                                        </Box>

                                        <CardBody p={6}>
                                            <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={4}>
                                                <GridItem>
                                                    <VStack align="start" spacing={2}>
                                                        <HStack>
                                                            <Icon as={FaBuilding} color="gray.500" />
                                                            <Text fontSize="sm">
                                                                <Text as="span" fontWeight="bold">Qurilish:</Text> {offer.construction_site_name}
                                                            </Text>
                                                        </HStack>
                                                        <HStack>
                                                            <Icon as={FaLocationDot} color="gray.500" />
                                                            <Text fontSize="sm">
                                                                <Text as="span" fontWeight="bold">Manzil:</Text> {offer.address}
                                                            </Text>
                                                        </HStack>
                                                        <HStack>
                                                            <Icon as={FaBuilding} color="gray.500" />
                                                            <Text fontSize="sm">
                                                                <Text as="span" fontWeight="bold">Mijoz:</Text> {offer.location.name}
                                                            </Text>
                                                        </HStack>
                                                    </VStack>
                                                </GridItem>
                                            </Grid>

                                            {offer.note && (
                                                <Alert status="info" borderRadius="md" mt={4}>
                                                    <AlertIcon />
                                                    <Text fontWeight="bold" mr={2}>Izoh:</Text>
                                                    <Text>{offer.note}</Text>
                                                </Alert>
                                            )}
                                        </CardBody>
                                    </Card>
                                </NavLink>
                            ))}
                        </VStack>

                        {pagination && (
                            <PaginationBar
                                mt={8}
                                page={currentPage}
                                totalPages={pagination.total_pages ?? 1}
                                loading={loading}
                                onPageChange={handlePageChange}
                            />
                        )}
                    </>
                )}
            </Box>
        </Box>
    );
}
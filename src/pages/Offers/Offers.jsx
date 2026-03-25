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
    Divider,
    HStack,
    VStack,
    Icon,
    Flex,
    useToast,
    Button,
    Center,
} from "@chakra-ui/react";
import {
    FaLocationDot,
    FaBuilding,
    FaMoneyBill,
    FaReceipt,
    FaInbox,
} from "react-icons/fa6";
import { NavLink } from "react-router-dom";
import { Package } from "lucide-react";

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

    const formatDate = (dateString) => {
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

    // Empty Data Component
    const EmptyData = () => (
        <Center border={'1px'} py={10} borderRadius={'10px'}>
            <VStack spacing={4}>
                <Box p={4}  borderRadius="full">
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
        <Box py={'20px'} minH="100vh">
            <Box maxW="1400px" mx="auto">
                {/* Header */}
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

                {/* Check if data is empty */}
                {offers.length === 0 ? (
                    <EmptyData />
                ) : (
                    <>
                        {/* Offers Grid */}
                        <VStack spacing={6} align="stretch">
                            {offers.map((offer) => (
                                <NavLink to={`${link}${offer?.id}`} key={offer.id}>
                                    <Card variant="outline" borderRadius="lg" overflow="hidden" _hover={{ shadow: "md" }}>
                                        {/* Card Header */}
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
                                                </HStack>
                                                <Text fontSize="sm" color="gray.600">
                                                    {formatDate(offer.date)}
                                                </Text>
                                            </Flex>
                                        </Box>

                                        {/* Card Body */}
                                        <CardBody p={6}>
                                            {/* Location and Construction Info */}
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

                                                <GridItem>
                                                    <VStack align="start" spacing={2}>
                                                        <HStack>
                                                            <Icon as={FaMoneyBill} color="gray.500" />
                                                            <Text fontSize="sm">
                                                                <Text as="span" fontWeight="bold">Umumiy summa:</Text> {formatPrice(offer.total_sum)}
                                                            </Text>
                                                        </HStack>
                                                        <HStack>
                                                            <Icon as={FaMoneyBill} color="gray.500" />
                                                            <Text fontSize="sm">
                                                                <Text as="span" fontWeight="bold">To'langan:</Text> {formatPrice(offer.paid_sum)}
                                                            </Text>
                                                        </HStack>
                                                        <HStack>
                                                            <Text fontSize="sm" color="gray.600">
                                                                {getPaymentStatusText(offer.payment_status)}
                                                            </Text>
                                                        </HStack>
                                                    </VStack>
                                                </GridItem>
                                            </Grid>

                                            {/* Note */}
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

                        {/* Pagination */}
                        {pagination && pagination.total_pages > 1 && (
                            <Flex justify="center" mt={8} direction="column" align="center">
                                <HStack spacing={2} mb={3}>
                                    <Button
                                        onClick={() => handlePageChange(currentPage - 1)}
                                        isDisabled={currentPage === 1}
                                        variant="outline"
                                    >
                                        Oldingi
                                    </Button>
                                    <HStack spacing={2}>
                                        {[...Array(Math.min(pagination.total_pages, 7))].map((_, idx) => {
                                            let pageNum;
                                            if (pagination.total_pages <= 7) {
                                                pageNum = idx + 1;
                                            } else if (currentPage <= 4) {
                                                pageNum = idx + 1;
                                                if (idx === 6) pageNum = pagination.total_pages;
                                            } else if (currentPage >= pagination.total_pages - 3) {
                                                pageNum = pagination.total_pages - 6 + idx;
                                            } else {
                                                pageNum = currentPage - 3 + idx;
                                            }

                                            if (pageNum === currentPage) {
                                                return (
                                                    <Button key={idx} variant="solid">
                                                        {pageNum}
                                                    </Button>
                                                );
                                            }
                                            return (
                                                <Button
                                                    key={idx}
                                                    onClick={() => handlePageChange(pageNum)}
                                                    variant="ghost"
                                                >
                                                    {pageNum}
                                                </Button>
                                            );
                                        })}
                                    </HStack>
                                    <Button
                                        onClick={() => handlePageChange(currentPage + 1)}
                                        isDisabled={currentPage === pagination.total_pages}
                                        variant="outline"
                                    >
                                        Keyingi
                                    </Button>
                                </HStack>
                                <Text fontSize="sm" color="gray.600">
                                    {pagination.total_count} ta taklifdan {((currentPage - 1) * pagination.limit) + 1}-
                                    {Math.min(currentPage * pagination.limit, pagination.total_count)} ko'rsatilmoqda
                                </Text>
                            </Flex>
                        )}
                    </>
                )}
            </Box>
        </Box>
    );
}
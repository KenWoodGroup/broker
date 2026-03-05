import { useState, useEffect } from "react";
import {
    Box,
    Container,
    Heading,
    FormControl,
    FormLabel,
    Input,
    VStack,
    HStack,  // Добавлен недостающий импорт
    Text,
    Spinner,
    Alert,
    AlertIcon,
    AlertDescription,
    Table,
    Thead,
    Tbody,
    Tr,
    Th,
    Td,
    Badge,
    Flex,
    IconButton,
    Button,  // Добавлен недостающий импорт
    useToast,
    TableContainer,
    InputGroup,
    InputRightElement,
} from "@chakra-ui/react";
import {
    ChevronLeftIcon,
    ChevronRightIcon,
    SearchIcon,
    CloseIcon
} from "@chakra-ui/icons";
import { apiStock } from "../../utils/Controllers/apiStock";
import { useParams } from "react-router";

export default function CLOffersCreate({ role }) {
    const [searchData, setSearchData] = useState({
        name: "",
        page: 1,
    });

    const [searchResults, setSearchResults] = useState([]);
    const [locations, setLocations] = useState([]);
    const [pagination, setPagination] = useState({
        totalCount: 0,
        totalPages: 0,
        currentPage: 1,
        limit: 15
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [searchTimeout, setSearchTimeout] = useState(null);

    const { id } = useParams()
    const toast = useToast();

    // Product search with debounce
    const debouncedSearch = (searchTerm, page = 1) => {
        if (searchTimeout) {
            clearTimeout(searchTimeout);
        }

        if (!searchTerm.trim()) {
            setSearchResults([]);
            setPagination({
                totalCount: 0,
                totalPages: 0,
                currentPage: 1,
                limit: 15
            });
            setError(null);
            return;
        }

        const timeout = setTimeout(() => {
            performSearch(searchTerm, page);
        }, 500);

        setSearchTimeout(timeout);
    };

    const performSearch = async (searchTerm, page = 1) => {
        setLoading(true);
        setError(null);

        try {
            const requestData = {
                name: searchTerm,
                page: page,
            };

            const response = await apiStock.GetStock(requestData);
            setSearchResults(response.data.data || []);
            setLocations(response.data.locations || []);
            setPagination(response.data.pagination || {
                totalCount: 0,
                totalPages: 0,
                currentPage: page,
                limit: 15
            });

            if (response.data.data.length === 0 && searchTerm.trim()) {
                toast({
                    title: "Hech narsa topilmadi",
                    description: `"${searchTerm}" bo'yicha tovarlar topilmadi`,
                    status: "info",
                    duration: 3000,
                    isClosable: true,
                });
            }
        } catch (error) {
            console.error("Qidiruv xatosi:", error);
            setError("Qidiruv vaqtida xatolik yuz berdi");
            toast({
                title: "Xatolik",
                description: "Qidiruvni amalga oshirib bo'lmadi",
                status: "error",
                duration: 5000,
                isClosable: true,
            });
        } finally {
            setLoading(false);
        }
    };

    // Handle input change
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setSearchData((prev) => ({
            ...prev,
            [name]: value,
            page: 1,
        }));

        debouncedSearch(value, 1);
    };

    // Handle page change
    const handlePageChange = async (newPage) => {
        setSearchData((prev) => ({
            ...prev,
            page: newPage,
        }));

        if (searchData.name.trim()) {
            setLoading(true);
            try {
                const requestData = {
                    name: searchData.name,
                    page: newPage,
                };

                const response = await apiStock.GetStock(requestData);
                setSearchResults(response.data.data || []);
                setLocations(response.data.locations || []);
                setPagination(response.data.pagination || {
                    totalCount: 0,
                    totalPages: 0,
                    currentPage: newPage,
                    limit: 15
                });
            } catch (error) {
                console.error("Sahifa yuklash xatosi:", error);
            } finally {
                setLoading(false);
            }
        }
    };

    // Clear search
    const handleClearSearch = () => {
        setSearchData({
            name: "",
            page: 1,
        });
        setSearchResults([]);
        setLocations([]);
        setPagination({
            totalCount: 0,
            totalPages: 0,
            currentPage: 1,
            limit: 15
        });
        setError(null);

        if (searchTimeout) {
            clearTimeout(searchTimeout);
        }
    };

    // Cleanup timeouts on unmount
    useEffect(() => {
        return () => {
            if (searchTimeout) {
                clearTimeout(searchTimeout);
            }
        };
    }, [searchTimeout]);

    const getLocationName = (locationId) => {
        const location = locations.find(loc => loc.id === locationId);
        return location ? location.name : "Ko'rsatilmagan";
    };

    const formatPrice = (price) => {
        return Number(price).toLocaleString('uz-UZ') + ' so\'m';
    };

    return (
        <Container maxW="container.xl" py={8} pb={20}>
            <VStack spacing={6} align="stretch">
                <Heading as="h1" size="xl">
                    Tovarlarni qidirish
                </Heading>

                {/* Product Search Card */}
                <Box p={6} borderWidth="1px" borderRadius="lg">
                    <VStack spacing={4}>
                        <FormControl isInvalid={!!error && error.includes("nomini")}>
                            <FormLabel fontWeight="medium">Tovar nomi</FormLabel>
                            <InputGroup size="lg">
                                <Input
                                    name="name"
                                    value={searchData.name}
                                    onChange={handleInputChange}
                                    placeholder="Tovar nomini kiriting (avtomatik qidiruv)"
                                    autoFocus
                                    pr="4.5rem"
                                />
                                <InputRightElement width="4.5rem">
                                    <HStack spacing={1}>
                                        {searchData.name && (
                                            <IconButton
                                                icon={<CloseIcon />}
                                                size="sm"
                                                variant="ghost"
                                                onClick={handleClearSearch}
                                                aria-label="Tozalash"
                                            />
                                        )}
                                        {loading ? (
                                            <Spinner size="sm" color="blue.500" />
                                        ) : (
                                            <SearchIcon color="gray.400" />
                                        )}
                                    </HStack>
                                </InputRightElement>
                            </InputGroup>
                            <Text fontSize="sm" color="gray.500" mt={1}>
                                {searchData.name ? "Yozishni to'xtating, qidiruv avtomatik boshlanadi" : "Qidirish uchun yozishni boshlang"}
                            </Text>
                        </FormControl>
                    </VStack>

                    {error && (
                        <Alert status="error" mt={4} borderRadius="md">
                            <AlertIcon />
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}
                </Box>

                {/* Search Results */}
                {searchResults.length > 0 && (
                    <Box>
                        <Flex justify="space-between" align="center" mb={4}>
                            <Heading as="h3" size="md">
                                Qidiruv natijalari
                            </Heading>
                            <Badge colorScheme="blue" fontSize="sm" p={2} borderRadius="full">
                                Topildi: {pagination.totalCount} ta tovar
                            </Badge>
                        </Flex>

                        <TableContainer
                            borderWidth="1px"
                            borderRadius="lg"
                            boxShadow="sm"
                            overflowX="auto"
                        >
                            <Table variant="simple">
                                <Thead bg="gray.100" _dark={{ bg: "gray.700" }}>
                                    <Tr>
                                        <Th>№</Th>
                                        <Th>Nomi</Th>
                                        <Th>Kategoriya</Th>
                                        <Th>Ishlab chiqaruvchi</Th>
                                        <Th>Narxi</Th>
                                    </Tr>
                                </Thead>
                                <Tbody>
                                    {searchResults.map((item, index) => (
                                        <Tr
                                            key={item.id}
                                        >
                                            <Td>{(pagination.currentPage - 1) * pagination.limit + index + 1}</Td>
                                            <Td maxW="250px" whiteSpace="normal" fontWeight="medium" title={item.product?.name}>
                                                {item.product?.name || "—"}
                                            </Td>
                                            <Td>{item.product?.category?.name || "—"}</Td>
                                            <Td>
                                                <VStack align="start" spacing={0}>
                                                    <Text>{item.product?.location?.name || getLocationName(item.location_id)}</Text>
                                                </VStack>
                                            </Td>
                                            <Td fontWeight="bold" color="green.600" _dark={{ color: "green.300" }}>
                                                {formatPrice(item.purchase_price)}
                                            </Td>
                                        </Tr>
                                    ))}
                                </Tbody>
                            </Table>
                        </TableContainer>

                        {/* Pagination */}
                        {pagination.totalPages > 1 && (
                            <Flex justify="space-between" align="center" mt={4}>
                                <Text fontSize="sm" color="gray.600" _dark={{ color: "gray.400" }}>
                                    Ko'rsatilmoqda {((pagination.currentPage - 1) * pagination.limit) + 1} - {Math.min(pagination.currentPage * pagination.limit, pagination.totalCount)} / {pagination.totalCount}
                                </Text>
                                <HStack spacing={2}>
                                    <IconButton
                                        icon={<ChevronLeftIcon />}
                                        onClick={() => handlePageChange(pagination.currentPage - 1)}
                                        isDisabled={pagination.currentPage <= 1 || loading}
                                        aria-label="Oldingi sahifa"
                                        variant="outline"
                                    />
                                    <HStack spacing={1}>
                                        {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                                            let pageNum;
                                            if (pagination.totalPages <= 5) {
                                                pageNum = i + 1;
                                            } else if (pagination.currentPage <= 3) {
                                                pageNum = i + 1;
                                            } else if (pagination.currentPage >= pagination.totalPages - 2) {
                                                pageNum = pagination.totalPages - 4 + i;
                                            } else {
                                                pageNum = pagination.currentPage - 2 + i;
                                            }

                                            return (
                                                <Button
                                                    key={pageNum}
                                                    size="sm"
                                                    variant={pagination.currentPage === pageNum ? "solid" : "outline"}
                                                    colorScheme={pagination.currentPage === pageNum ? "blue" : "gray"}
                                                    onClick={() => handlePageChange(pageNum)}
                                                    isDisabled={loading}
                                                >
                                                    {pageNum}
                                                </Button>
                                            );
                                        })}
                                    </HStack>
                                    <IconButton
                                        icon={<ChevronRightIcon />}
                                        onClick={() => handlePageChange(pagination.currentPage + 1)}
                                        isDisabled={pagination.currentPage >= pagination.totalPages || loading}
                                        aria-label="Keyingi sahifa"
                                        variant="outline"
                                    />
                                </HStack>
                            </Flex>
                        )}
                    </Box>
                )}

                {/* Empty and loading states */}
                {searchResults.length === 0 && !loading && searchData.name && (
                    <Alert status="info" borderRadius="lg">
                        <AlertIcon />
                        <AlertDescription>
                            Sizning "{searchData.name}" so'rovingiz bo'yicha hech narsa topilmadi
                        </AlertDescription>
                    </Alert>
                )}

                {loading && searchData.name && (
                    <Flex justify="center" align="center" direction="column" py={10}>
                        <Spinner size="xl" thickness="4px" color="blue.500" />
                        <Text mt={4} color="gray.600">Qidirilmoqda...</Text>
                    </Flex>
                )}
            </VStack>
        </Container>
    );
}
import { useState, useEffect } from "react";
import {
    Box,
    Container,
    Heading,
    FormControl,
    FormLabel,
    Input,
    Button,
    VStack,
    HStack,
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
    useToast,
    Select,
    Card,
    TableContainer,
    Checkbox,
    useDisclosure,
    Tooltip,
    InputGroup,
    InputRightElement,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalFooter,
    ModalBody,
    ModalCloseButton,
} from "@chakra-ui/react";
import {
    ChevronLeftIcon,
    ChevronRightIcon,
    ViewIcon,
    SearchIcon,
    CloseIcon
} from "@chakra-ui/icons";
// Import from lucide-react instead
import { Factory, Building2 } from "lucide-react";
import { apiStock } from "../../utils/Controllers/apiStock";
import { apiLocations } from "../../utils/Controllers/Locations";
import SelectedItemsModal from "./__components/CartModal";
import { useParams } from "react-router";

export default function CLOffersCreate() {
    const [searchData, setSearchData] = useState({
        name: "",
        page: 1,
    });

    const [searchResults, setSearchResults] = useState([]);
    const [locations, setLocations] = useState([]);
    const [factories, setFactories] = useState([]);
    const [selectedFactory, setSelectedFactory] = useState(null);
    const [factorySearch, setFactorySearch] = useState("");
    const [factorySearchResults, setFactorySearchResults] = useState([]);
    const [factoryLoading, setFactoryLoading] = useState(false);
    const [factorySearchTimeout, setFactorySearchTimeout] = useState(null);

    const [pagination, setPagination] = useState({
        totalCount: 0,
        totalPages: 0,
        currentPage: 1,
        limit: 15
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [selectedItems, setSelectedItems] = useState([]);
    const [selectedItemsData, setSelectedItemsData] = useState([]);
    const [itemQuantities, setItemQuantities] = useState({});
    const [searchTimeout, setSearchTimeout] = useState(null);

    const { isOpen, onOpen, onClose } = useDisclosure();
    const { isOpen: isFactoryModalOpen, onOpen: onFactoryModalOpen, onClose: onFactoryModalClose } = useDisclosure();
    const toast = useToast();
    const { id } = useParams()

    // Factory search with debounce
    const debouncedFactorySearch = (searchTerm) => {
        if (factorySearchTimeout) {
            clearTimeout(factorySearchTimeout);
        }

        if (!searchTerm.trim()) {
            setFactorySearchResults([]);
            return;
        }

        const timeout = setTimeout(() => {
            performFactorySearch(searchTerm);
        }, 500);

        setFactorySearchTimeout(timeout);
    };

    const performFactorySearch = async (searchTerm) => {
        setFactoryLoading(true);
        try {
            const response = await apiLocations.getFactory(searchTerm, id);
            const factories = response.data || [];
            setFactorySearchResults(factories);

            if (factories.length === 0) {
                toast({
                    title: "Hech narsa topilmadi",
                    description: `"${searchTerm}" bo'yicha fabrikalar topilmadi`,
                    status: "info",
                    duration: 3000,
                    isClosable: true,
                });
            }
        } catch (error) {
            console.error("Factory qidiruv xatosi:", error);
            toast({
                title: "Xatolik",
                description: "Factory qidirishda xatolik yuz berdi",
                status: "error",
                duration: 5000,
                isClosable: true,
            });
        } finally {
            setFactoryLoading(false);
        }
    };

    const handleFactorySearchChange = (e) => {
        const value = e.target.value;
        setFactorySearch(value);
        debouncedFactorySearch(value);
    };

    const selectFactory = (factory) => {
        setSelectedFactory(factory);
        setFactorySearch("");
        setFactorySearchResults([]);
        onFactoryModalClose();

        toast({
            title: "Factory tanlandi",
            description: `${factory.name} tanlandi`,
            status: "success",
            duration: 3000,
            isClosable: true,
        });
    };

    const clearFactory = () => {
        setSelectedFactory(null);
    };

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

            // Only add location_id if factory is selected
            if (selectedFactory) {
                requestData.location_id = selectedFactory.id;
            }

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

                if (selectedFactory) {
                    requestData.location_id = selectedFactory.id;
                }

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
            if (factorySearchTimeout) {
                clearTimeout(factorySearchTimeout);
            }
        };
    }, [searchTimeout, factorySearchTimeout]);

    // Re-run search when factory changes
    useEffect(() => {
        if (selectedFactory) {
            setSearchData(prev => ({ ...prev, name: "all", page: 1 }));
            performSearch("all", 1);
        } else if (searchData.name.trim()) {
            debouncedSearch(searchData.name, 1);
        }
    }, [selectedFactory]);

    // Product selection handlers
    const handleSelectRow = (itemId) => {
        setSelectedItems(prev => {
            const newSelected = prev.includes(itemId)
                ? prev.filter(id => id !== itemId)
                : [...prev, itemId];

            updateSelectedItemsData(newSelected);
            return newSelected;
        });
    };

    const handleSelectAll = () => {
        let newSelected;
        if (selectedItems.length === searchResults.length) {
            newSelected = [];
        } else {
            newSelected = searchResults.map(item => item.id);
        }
        setSelectedItems(newSelected);
        updateSelectedItemsData(newSelected);
    };

    const updateSelectedItemsData = (selectedIds) => {
        const selectedData = searchResults.filter(item => selectedIds.includes(item.id));
        setSelectedItemsData(selectedData);

        const newQuantities = { ...itemQuantities };
        selectedData.forEach(item => {
            if (!newQuantities[item.id]) {
                newQuantities[item.id] = 1;
            }
        });
        setItemQuantities(newQuantities);
    };

    const handleRemoveItem = (itemId) => {
        setSelectedItems(prev => prev.filter(id => id !== itemId));
        setSelectedItemsData(prev => prev.filter(item => item.id !== itemId));

        const newQuantities = { ...itemQuantities };
        delete newQuantities[itemId];
        setItemQuantities(newQuantities);
    };

    const handleClearAll = () => {
        setSelectedItems([]);
        setSelectedItemsData([]);
        setItemQuantities({});
    };

    const handleQuantityChange = (itemId, value) => {
        setItemQuantities(prev => ({
            ...prev,
            [itemId]: parseInt(value) || 1
        }));
    };

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
                    Taklif yaratish
                </Heading>

                {/* Factory Selection Card */}
                <Card p={6} bg="gray.50" _dark={{ bg: "gray.700" }}>
                    <VStack spacing={4} align="stretch">
                        <Flex justify="space-between" align="center">
                            <HStack>
                                <Box as={Factory} size={24} color="blue.500" />
                                <Heading as="h3" size="md">
                                    Factory tanlash (ixtiyoriy)
                                </Heading>
                            </HStack>
                            {!selectedFactory ? (
                                <Button
                                    leftIcon={<SearchIcon />}
                                    colorScheme="blue"
                                    variant="outline"
                                    size="sm"
                                    onClick={onFactoryModalOpen}
                                >
                                    Factory qidirish
                                </Button>
                            ) : (
                                <Button
                                    leftIcon={<CloseIcon />}
                                    colorScheme="red"
                                    variant="ghost"
                                    size="sm"
                                    onClick={clearFactory}
                                >
                                    Factoryni olib tashlash
                                </Button>
                            )}
                        </Flex>

                        {selectedFactory && (
                            <Alert status="info" borderRadius="md">
                                <AlertIcon />
                                <Box flex="1">
                                    <Text fontWeight="bold">Tanlangan factory:</Text>
                                    <Text>{selectedFactory.name}</Text>
                                    <Text fontSize="sm" color="gray.600">{selectedFactory.id}</Text>
                                </Box>
                            </Alert>
                        )}

                        <Text fontSize="sm" color="gray.500">
                            {selectedFactory
                                ? "Tovarlar faqat shu factory bo'yicha qidiriladi"
                                : "Factory tanlanmasa, barcha tovarlar qidiriladi"}
                        </Text>
                    </VStack>
                </Card>

                {/* Factory Search Modal */}
                <Modal isOpen={isFactoryModalOpen} onClose={onFactoryModalClose} size="lg">
                    <ModalOverlay />
                    <ModalContent>
                        <ModalHeader>Factory qidirish</ModalHeader>
                        <ModalCloseButton />
                        <ModalBody>
                            <VStack spacing={4}>
                                <FormControl>
                                    <FormLabel>Factory nomi</FormLabel>
                                    <InputGroup>
                                        <Input
                                            value={factorySearch}
                                            onChange={handleFactorySearchChange}
                                            placeholder="Factory nomini kiriting"
                                            autoFocus
                                        />
                                        <InputRightElement>
                                            {factoryLoading ? (
                                                <Spinner size="sm" color="blue.500" />
                                            ) : (
                                                <SearchIcon color="gray.400" />
                                            )}
                                        </InputRightElement>
                                    </InputGroup>
                                </FormControl>

                                {factorySearchResults.length > 0 && (
                                    <Box w="100%" maxH="300px" overflowY="auto">
                                        <VStack spacing={2} align="stretch">
                                            {factorySearchResults.map((factory) => (
                                                <Card
                                                    key={factory.id}
                                                    p={3}
                                                    cursor="pointer"
                                                    onClick={() => selectFactory(factory)}
                                                    _hover={{ bg: "gray.50", _dark: { bg: "gray.700" } }}
                                                    borderWidth="1px"
                                                >
                                                    <HStack>
                                                        <Box as={Building2} size={16} color="gray.500" />
                                                        <Box>
                                                            <Text fontWeight="medium">{factory.name}</Text>
                                                            <Text fontSize="sm" color="gray.500">{factory.id}</Text>
                                                        </Box>
                                                    </HStack>
                                                </Card>
                                            ))}
                                        </VStack>
                                    </Box>
                                )}

                                {factorySearch && !factoryLoading && factorySearchResults.length === 0 && (
                                    <Alert status="info">
                                        <AlertIcon />
                                        <AlertDescription>
                                            "{factorySearch}" bo'yicha hech narsa topilmadi
                                        </AlertDescription>
                                    </Alert>
                                )}
                            </VStack>
                        </ModalBody>
                        <ModalFooter>
                            <Button variant="ghost" onClick={onFactoryModalClose}>
                                Yopish
                            </Button>
                        </ModalFooter>
                    </ModalContent>
                </Modal>

                {/* Product Search Card */}
                <Card p={6}>
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
                </Card>

                {/* Search Results */}
                {searchResults.length > 0 && (
                    <Box>
                        <Flex justify="space-between" align="center" mb={4}>
                            <Heading as="h3" size="md">
                                Qidiruv natijalari
                                {selectedFactory && (
                                    <Badge ml={2} colorScheme="purple">
                                        Filter: {selectedFactory.name}
                                    </Badge>
                                )}
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
                                        <Th width="50px">
                                            <Checkbox
                                                isChecked={selectedItems.length === searchResults.length && searchResults.length > 0}
                                                isIndeterminate={selectedItems.length > 0 && selectedItems.length < searchResults.length}
                                                onChange={handleSelectAll}
                                                colorScheme="blue"
                                            />
                                        </Th>
                                        <Th>№</Th>
                                        <Th>Kategoriya</Th>
                                        <Th>Ishlab chiqaruvchi</Th>
                                        <Th>Narxi</Th>
                                    </Tr>
                                </Thead>
                                <Tbody>
                                    {searchResults.map((item, index) => (
                                        <Tr
                                            key={item.id}
                                            onClick={() => handleSelectRow(item.id)}
                                            cursor="pointer"
                                            bg={selectedItems.includes(item.id) ? "blue.50" : undefined}
                                            _dark={{
                                                bg: selectedItems.includes(item.id) ? "blue.900" : undefined,
                                                _hover: { bg: selectedItems.includes(item.id) ? "blue.800" : "gray.700" }
                                            }}
                                            _hover={{
                                                bg: selectedItems.includes(item.id) ? "blue.100" : "gray.50"
                                            }}
                                            transition="background 0.2s"
                                        >
                                            <Td onClick={(e) => e.stopPropagation()}>
                                                <Checkbox
                                                    isChecked={selectedItems.includes(item.id)}
                                                    onChange={() => handleSelectRow(item.id)}
                                                    colorScheme="blue"
                                                    size="md"
                                                />
                                            </Td>
                                            <Td>{(pagination.currentPage - 1) * pagination.limit + index + 1}</Td>
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
                                <Select
                                    width="auto"
                                    size="sm"
                                    value={pagination.currentPage}
                                    onChange={(e) => handlePageChange(Number(e.target.value))}
                                    isDisabled={loading}
                                >
                                    {Array.from({ length: pagination.totalPages }, (_, i) => (
                                        <option key={i + 1} value={i + 1}>
                                            Sahifa {i + 1}
                                        </option>
                                    ))}
                                </Select>
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

            {/* Fixed button for selected items */}
            {selectedItems.length > 0 && (
                <Box position="fixed" bottom="20px" right="20px" zIndex={10}>
                    <Tooltip label="Tanlangan tovarlarni ko'rish" placement="left">
                        <Button
                            leftIcon={<ViewIcon />}
                            colorScheme="blue"
                            size="lg"
                            onClick={onOpen}
                            boxShadow="lg"
                            _hover={{ transform: 'scale(1.05)' }}
                        >
                            Tanlangan: {selectedItems.length}
                        </Button>
                    </Tooltip>
                </Box>
            )}

            {/* Selected items modal */}
            <SelectedItemsModal
                isOpen={isOpen}
                onClose={onClose}
                selectedItemsData={selectedItemsData}
                selectedItems={selectedItems}
                onRemoveItem={handleRemoveItem}
                onClearAll={handleClearAll}
                itemQuantities={itemQuantities}
                onQuantityChange={handleQuantityChange}
                formatPrice={formatPrice}
                getLocationName={getLocationName}
                selectedFactory={selectedFactory}
            />
        </Container>
    );
}
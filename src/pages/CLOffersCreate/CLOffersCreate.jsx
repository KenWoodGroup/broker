import { useState, useEffect, useRef } from "react";
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
    Divider,
} from "@chakra-ui/react";
import {
    ChevronLeftIcon,
    ChevronRightIcon,
    ViewIcon,
    SearchIcon,
    CloseIcon,
    AddIcon,
} from "@chakra-ui/icons";
import { Factory, Building2, Warehouse } from "lucide-react";
import { apiStock } from "../../utils/Controllers/apiStock";
import { apiLocations } from "../../utils/Controllers/Locations";
import SelectedItemsModal from "./__components/CartModal";
import { useParams } from "react-router";

export default function CLOffersCreate({ role = 'admin' }) {
    const [searchData, setSearchData] = useState({
        name: "",
        page: 1,
    });

    const [searchResults, setSearchResults] = useState([]);
    const [locations, setLocations] = useState([]); // Список заводов для сайдбара (не меняется при фильтрации)
    const [allLocations, setAllLocations] = useState([]); // Резервная копия всех заводов
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
    const [sidebarLoading, setSidebarLoading] = useState(false); // Загрузка при клике на завод
    const [error, setError] = useState(null);
    const [selectedItems, setSelectedItems] = useState([]);
    const [selectedItemsData, setSelectedItemsData] = useState([]);
    const [itemQuantities, setItemQuantities] = useState({});
    const [searchTimeout, setSearchTimeout] = useState(null);

    const { isOpen, onOpen, onClose } = useDisclosure();
    const { isOpen: isFactoryModalOpen, onOpen: onFactoryModalOpen, onClose: onFactoryModalClose } = useDisclosure();
    const toast = useToast();
    const { id } = useParams();
    
    // Сохраняем текущий поисковый запрос без фильтра завода для обновления списка заводов
    const currentSearchTermRef = useRef("");

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

        // После выбора завода, запускаем поиск с текущим запросом или "all"
        const searchTerm = searchData.name.trim() === "" ? "all" : searchData.name;
        setSearchData(prev => ({ ...prev, name: searchTerm, page: 1 }));
        
        // Загружаем товары выбранного завода
        performSearchWithSidebarLoading(searchTerm, 1, factory.id);

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
        // После очистки фильтра, запускаем поиск с текущим запросом
        if (searchData.name.trim() && searchData.name !== "all") {
            performSearchWithSidebarLoading(searchData.name, 1, null);
        } else if (searchData.name === "all") {
            setSearchData(prev => ({ ...prev, name: "", page: 1 }));
            setSearchResults([]);
            setPagination({
                totalCount: 0,
                totalPages: 0,
                currentPage: 1,
                limit: 15
            });
        } else {
            // Если нет поискового запроса, загружаем все товары (но без фильтра)
            performSearchWithSidebarLoading("all", 1, null);
        }
    };

    // Обертка для performSearch с индикацией загрузки сайдбара
    const performSearchWithSidebarLoading = async (searchTerm, page, locationId = null) => {
        setSidebarLoading(true);
        try {
            await performSearch(searchTerm, page, locationId);
        } finally {
            setSidebarLoading(false);
        }
    };

    // Product search with debounce
    const debouncedSearch = (searchTerm, page = 1) => {
        if (searchTimeout) {
            clearTimeout(searchTimeout);
        }

        // Не ищем, если нет запроса и нет выбранного завода
        if (!searchTerm.trim() && !selectedFactory) {
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
            performSearch(searchTerm, page, selectedFactory?.id);
        }, 500);

        setSearchTimeout(timeout);
    };

    const performSearch = async (searchTerm, page = 1, locationId = null) => {
        setLoading(true);
        setError(null);

        try {
            // Определяем реальный поисковый запрос
            let actualSearchTerm = searchTerm;
            if (!actualSearchTerm.trim() && locationId) {
                actualSearchTerm = "all";
            }
            if (!actualSearchTerm.trim()) {
                setLoading(false);
                return;
            }

            const requestData = {
                name: actualSearchTerm,
                page: page,
            };

            if (locationId) {
                requestData.location_id = locationId;
            }

            const response = await apiStock.GetStock(requestData);
            setSearchResults(response.data.data || []);
            
            // Обновляем список заводов ТОЛЬКО если нет фильтра по заводу (locationId === null)
            // Это сохраняет полный список заводов в сайдбаре при фильтрации
            if (locationId === null) {
                const newLocations = response.data.locations || [];
                setLocations(newLocations);
                setAllLocations(newLocations);
                currentSearchTermRef.current = actualSearchTerm;
            }
            
            setPagination(response.data.pagination || {
                totalCount: 0,
                totalPages: 0,
                currentPage: page,
                limit: 15
            });

            if (response.data.data.length === 0 && actualSearchTerm !== "all") {
                toast({
                    title: "Hech narsa topilmadi",
                    description: `"${actualSearchTerm}" bo'yicha tovarlar topilmadi`,
                    status: "info",
                    duration: 3000,
                    isClosable: true,
                });
            }
        } catch (error) {
            console.error("Qidiruv xatosi:", error);
            setError("Qidiruvda xatolik yuz berdi");
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

        // При изменении поискового запроса сбрасываем фильтр по заводу, чтобы обновить список заводов
        if (selectedFactory) {
            setSelectedFactory(null);
        }
        
        debouncedSearch(value, 1);
    };

    // Handle page change
    const handlePageChange = async (newPage) => {
        setSearchData((prev) => ({
            ...prev,
            page: newPage,
        }));

        const searchTerm = searchData.name.trim() === "" && selectedFactory ? "all" : searchData.name;
        if (searchTerm.trim() || selectedFactory) {
            setLoading(true);
            try {
                const requestData = {
                    name: searchTerm,
                    page: newPage,
                };

                if (selectedFactory) {
                    requestData.location_id = selectedFactory.id;
                }

                const response = await apiStock.GetStock(requestData);
                setSearchResults(response.data.data || []);
                // Не обновляем locations при пагинации, чтобы список заводов не менялся
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
        setPagination({
            totalCount: 0,
            totalPages: 0,
            currentPage: 1,
            limit: 15
        });
        setError(null);
        setSelectedFactory(null); // Сбрасываем фильтр завода
        // Не очищаем список локаций, он останется

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
            [itemId]: parseInt(value) || 0
        }));
    };

    const getLocationName = (locationId) => {
        const location = locations.find(loc => loc.id === locationId);
        return location ? location.name : "Ko'rsatilmagan";
    };

    const formatPrice = (price) => {
        return Number(price).toLocaleString('uz-UZ') + ' so\'m';
    };

    // Handler for sidebar factory click
    const handleSidebarFactoryClick = (factory) => {
        if (sidebarLoading || loading) return; // Не реагируем на клики во время загрузки
        
        if (selectedFactory?.id === factory.id) {
            // Если нажали на уже выбранный завод - снимаем фильтр
            clearFactory();
        } else {
            // Выбираем новый завод
            setSelectedFactory(factory);
            const searchTerm = searchData.name.trim() === "" ? "all" : searchData.name;
            setSearchData(prev => ({ ...prev, name: searchTerm, page: 1 }));
            performSearchWithSidebarLoading(searchTerm, 1, factory.id);
        }
    };

    // Получаем количество товаров для завода из текущих результатов поиска
    const getProductCountForLocation = (locationId) => {
        // Если есть выбранный завод, показываем количество только для него, для остальных - 0 или общее?
        // Лучше показывать количество в текущем отфильтрованном списке
        return searchResults.filter(item => item.location_id === locationId).length;
    };

    // Используем сохраненный список заводов (не обновляется при фильтрации)
    const displayLocations = locations.length > 0 ? locations : allLocations;

    return (
        <Container maxW="container.xl" py={8} pb={20}>
            <Flex gap={6} direction={{ base: "column", lg: "row" }}>
                {/* Left Sidebar - Factories List */}
                <Box
                    as="aside"
                    w={{ base: "100%", lg: "280px" }}
                    flexShrink={0}
                >
                    <Card p={4} position="sticky" top="20px">
                        <VStack spacing={4} align="stretch">
                            <Flex justify="space-between" align="center">
                                <HStack>
                                    <Warehouse size={20} />
                                    <Heading as="h3" size="sm">
                                        Zavodlar
                                    </Heading>
                                </HStack>
                                <Tooltip label="Zavod qidirish">
                                    <IconButton
                                        icon={<AddIcon />}
                                        size="sm"
                                        variant="ghost"
                                        onClick={onFactoryModalOpen}
                                        aria-label="Zavod qo'shish"
                                        isDisabled={sidebarLoading || loading}
                                    />
                                </Tooltip>
                            </Flex>
                            <Divider />

                            {/* All factories option */}
                            <Button
                                variant={!selectedFactory ? "solid" : "ghost"}
                                colorScheme={!selectedFactory ? "blue" : "gray"}
                                justifyContent="flex-start"
                                leftIcon={<Building2 size={18} />}
                                onClick={clearFactory}
                                size="sm"
                                w="full"
                                isLoading={sidebarLoading && !selectedFactory}
                                isDisabled={sidebarLoading || loading}
                            >
                                Barcha zavodlar
                                {!selectedFactory && searchResults.length > 0 && (
                                    <Badge ml="auto" colorScheme="blue" borderRadius="full">
                                        {searchResults.length}
                                    </Badge>
                                )}
                            </Button>

                            {/* List of factories from search results */}
                            <VStack spacing={1} align="stretch" maxH="calc(100vh - 300px)" overflowY="auto">
                                {displayLocations.length === 0 && !loading && !sidebarLoading && (
                                    <Text fontSize="sm" color="gray.500" textAlign="center" py={4}>
                                        Hech qanday zavod topilmadi
                                    </Text>
                                )}
                                {displayLocations.map((location) => {
                                    const productCount = getProductCountForLocation(location.id);
                                    const isSelected = selectedFactory?.id === location.id;
                                    return (
                                        <Button
                                            key={location.id}
                                            variant={isSelected ? "solid" : "ghost"}
                                            colorScheme={isSelected ? "blue" : "gray"}
                                            justifyContent="flex-start"
                                            leftIcon={<Factory size={18} />}
                                            onClick={() => handleSidebarFactoryClick(location)}
                                            size="sm"
                                            w="full"
                                            whiteSpace="normal"
                                            textAlign="left"
                                            py={3}
                                            h="auto"
                                            isLoading={sidebarLoading && isSelected}
                                            isDisabled={sidebarLoading || loading}
                                        >
                                            <VStack align="start" spacing={0} flex={1}>
                                                <Text fontWeight="medium" fontSize="sm" noOfLines={2}>
                                                    {location.name}
                                                </Text>
                                              
                                            </VStack>
                                        </Button>
                                    );
                                })}
                            </VStack>

                            {selectedFactory && (
                                <>
                                    <Divider />
                                    <Alert status="info" borderRadius="md" p={2}>
                                        <AlertIcon />
                                        <Box flex="1" fontSize="sm">
                                            <Text fontWeight="bold">Tanlangan:</Text>
                                            <Text noOfLines={2}>{selectedFactory.name}</Text>
                                        </Box>
                                        <IconButton
                                            icon={<CloseIcon />}
                                            size="xs"
                                            variant="ghost"
                                            onClick={clearFactory}
                                            aria-label="Tozalash"
                                            isDisabled={sidebarLoading || loading}
                                        />
                                    </Alert>
                                </>
                            )}
                        </VStack>
                    </Card>
                </Box>

                {/* Right Content - Search and Results */}
                <Box flex={1}>
                    <VStack spacing={6} align="stretch">
                        <Heading as="h1" size="xl">
                            {role === 'supplier' ? 'Mahsulot qidiruv markazi' : 'Taklif yaratish'}
                        </Heading>

                        {/* Product Search Card */}
                        <Card p={6}>
                            <VStack spacing={4}>
                                <FormControl isInvalid={!!error && error.includes("nomini")}>
                                    <FormLabel fontWeight="medium">Tovar nomi</FormLabel>
                                    <InputGroup size="lg">
                                        <Input
                                            name="name"
                                            value={searchData.name === "all" ? "" : searchData.name}
                                            onChange={handleInputChange}
                                            placeholder="Tovar nomini kiriting (avtomatik qidiruv)"
                                            autoFocus
                                            pr="4.5rem"
                                            isDisabled={sidebarLoading}
                                        />
                                        <InputRightElement width="4.5rem">
                                            <HStack spacing={1}>
                                                {searchData.name && searchData.name !== "all" && (
                                                    <IconButton
                                                        icon={<CloseIcon />}
                                                        size="sm"
                                                        variant="ghost"
                                                        onClick={handleClearSearch}
                                                        aria-label="Tozalash"
                                                        isDisabled={sidebarLoading || loading}
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
                                        {searchData.name && searchData.name !== "all" 
                                            ? "Yozishni to'xtating, qidiruv avtomatik boshlanadi" 
                                            : selectedFactory 
                                                ? `"${selectedFactory.name}" zavodidagi barcha mahsulotlar ko'rsatilmoqda`
                                                : "Qidirish uchun yozishni boshlang"}
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
                                                {role !== 'supplier' &&
                                                    <Th width="50px">
                                                        <Checkbox
                                                            isChecked={selectedItems.length === searchResults.length && searchResults.length > 0}
                                                            isIndeterminate={selectedItems.length > 0 && selectedItems.length < searchResults.length}
                                                            onChange={handleSelectAll}
                                                            colorScheme="blue"
                                                            isDisabled={sidebarLoading || loading}
                                                        />
                                                    </Th>
                                                }
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
                                                    onClick={() => {
                                                        if (role === 'supplier' || sidebarLoading || loading) return;
                                                        handleSelectRow(item.id)
                                                    }}
                                                    cursor={sidebarLoading || loading ? "not-allowed" : "pointer"}
                                                    bg={selectedItems.includes(item.id) ? "blue.50" : undefined}
                                                    _dark={{
                                                        bg: selectedItems.includes(item.id) ? "blue.900" : undefined,
                                                        _hover: { bg: selectedItems.includes(item.id) ? "blue.800" : "gray.700" }
                                                    }}
                                                    _hover={{
                                                        bg: selectedItems.includes(item.id) ? "blue.100" : "gray.50"
                                                    }}
                                                    transition="background 0.2s"
                                                    opacity={sidebarLoading || loading ? 0.6 : 1}
                                                >
                                                    {role !== 'supplier' &&
                                                        <Td onClick={(e) => e.stopPropagation()}>
                                                            <Checkbox
                                                                isChecked={selectedItems.includes(item.id)}
                                                                onChange={() => handleSelectRow(item.id)}
                                                                colorScheme="blue"
                                                                size="md"
                                                                isDisabled={sidebarLoading || loading}
                                                            />
                                                        </Td>
                                                    }
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
                                    <Flex justify="space-between" align="center" mt={4} flexWrap="wrap" gap={2}>
                                        <Text fontSize="sm" color="gray.600" _dark={{ color: "gray.400" }}>
                                            Ko'rsatilmoqda {((pagination.currentPage - 1) * pagination.limit) + 1} - {Math.min(pagination.currentPage * pagination.limit, pagination.totalCount)} / {pagination.totalCount}
                                        </Text>
                                        <HStack spacing={2}>
                                            <IconButton
                                                icon={<ChevronLeftIcon />}
                                                onClick={() => handlePageChange(pagination.currentPage - 1)}
                                                isDisabled={pagination.currentPage <= 1 || loading || sidebarLoading}
                                                aria-label="Oldingi sahifa"
                                                variant="outline"
                                                size="sm"
                                            />
                                            <HStack spacing={1} display={{ base: "none", md: "flex" }}>
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
                                                            isDisabled={loading || sidebarLoading}
                                                        >
                                                            {pageNum}
                                                        </Button>
                                                    );
                                                })}
                                            </HStack>
                                            <IconButton
                                                icon={<ChevronRightIcon />}
                                                onClick={() => handlePageChange(pagination.currentPage + 1)}
                                                isDisabled={pagination.currentPage >= pagination.totalPages || loading || sidebarLoading}
                                                aria-label="Keyingi sahifa"
                                                variant="outline"
                                                size="sm"
                                            />
                                        </HStack>
                                        <Select
                                            width="auto"
                                            size="sm"
                                            value={pagination.currentPage}
                                            onChange={(e) => handlePageChange(Number(e.target.value))}
                                            isDisabled={loading || sidebarLoading}
                                        >
                                            {Array.from({ length: Math.min(50, pagination.totalPages) }, (_, i) => (
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
                        {searchResults.length === 0 && !loading && !sidebarLoading && searchData.name && searchData.name !== "all" && (
                            <Alert status="info" borderRadius="lg">
                                <AlertIcon />
                                <AlertDescription>
                                    Sizning "{searchData.name}" so'rovingiz bo'yicha hech narsa topilmadi
                                </AlertDescription>
                            </Alert>
                        )}

                        {searchResults.length === 0 && !loading && !sidebarLoading && selectedFactory && (!searchData.name || searchData.name === "all") && (
                            <Alert status="info" borderRadius="lg">
                                <AlertIcon />
                                <AlertDescription>
                                    "{selectedFactory.name}" zavodida hech qanday mahsulot topilmadi
                                </AlertDescription>
                            </Alert>
                        )}

                        {(loading || sidebarLoading) && (searchData.name || selectedFactory) && (
                            <Flex justify="center" align="center" direction="column" py={10}>
                                <Spinner size="xl" thickness="4px" color="blue.500" />
                                <Text mt={4} color="gray.600">Yuklanmoqda...</Text>
                            </Flex>
                        )}
                    </VStack>
                </Box>
            </Flex>

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
                            isDisabled={sidebarLoading || loading}
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
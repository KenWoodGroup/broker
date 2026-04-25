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
    Tooltip,
    InputGroup,
    InputRightElement,
    Divider,
} from "@chakra-ui/react";
import {
    ChevronLeftIcon,
    ChevronRightIcon,
    ViewIcon,
    SearchIcon,
    CloseIcon,
} from "@chakra-ui/icons";
import { Factory, Building2, Warehouse } from "lucide-react";
import { apiStock } from "../../utils/Controllers/apiStock";
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
    const [selectedFactory, setSelectedFactory] = useState(null);
    const [sidebarFactoryQuery, setSidebarFactoryQuery] = useState("");
    const [visibleFactoriesCount, setVisibleFactoriesCount] = useState(20);

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

    const [isCartOpen, setIsCartOpen] = useState(false);
    const toast = useToast();
    const { id } = useParams();
    
    // Сохраняем текущий поисковый запрос без фильтра завода для обновления списка заводов
    const currentSearchTermRef = useRef("");

    // Build unique factories list from search results.
    // API returns stock rows with `location.parent` holding the factory (zavod).
    const deriveFactoriesFromStocks = (stocks) => {
        const map = new Map();
        (stocks || []).forEach((row) => {
            const factory = row?.location?.parent;
            if (factory?.id && !map.has(factory.id)) {
                map.set(factory.id, { id: factory.id, name: factory.name });
            }
        });
        return Array.from(map.values());
    };

    // Factory selection comes from the sidebar list (no modal).

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
            const rows = response?.data?.data || [];
            setSearchResults(rows);
            
            // Обновляем список заводов ТОЛЬКО если нет фильтра по заводу (locationId === null)
            // Это сохраняет полный список заводов в сайдбаре при фильтрации
            if (locationId === null) {
                // Preferred source: backend-provided `locations` list for current query (e.g. "Beton").
                // Fallback: derive unique factories from stock rows when `locations` is missing.
                const fromResponse = response?.data?.locations || [];
                const factoriesFromRows = deriveFactoriesFromStocks(rows);
                const newLocations = fromResponse.length > 0 ? fromResponse : factoriesFromRows;
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
        };
    }, [searchTimeout]);

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
        return searchResults.filter(item => item?.location?.parent?.id === locationId).length;
    };

    // Используем сохраненный список заводов (не обновляется при фильтрации)
    const displayLocations = locations.length > 0 ? locations : allLocations;
    const filteredLocations = displayLocations.filter((loc) => {
        if (!sidebarFactoryQuery.trim()) return true;
        return (loc?.name || "").toLowerCase().includes(sidebarFactoryQuery.trim().toLowerCase());
    });
    const visibleLocations = filteredLocations.slice(0, visibleFactoriesCount);
    const canShowMoreFactories = filteredLocations.length > visibleFactoriesCount;

    useEffect(() => {
        setVisibleFactoriesCount(20);
    }, [sidebarFactoryQuery, displayLocations.length]);

    return (
        <Container maxW="100%" px={{ base: 4, md: 6, lg: 8 }} py={8} pb={20}>
            <Flex gap={6} direction={{ base: "column", lg: "row" }} align="flex-start">
                {/* Left Sidebar - Factories List */}
                <Box
                    as="aside"
                    w={{ base: "100%", lg: "280px" }}
                    flexShrink={0}
                >
                    <Card
                        p={4}
                        position="static"
                        borderWidth="1px"
                        borderColor="gray.200"
                        boxShadow="md"
                        bgGradient="linear(to-b, white, gray.50)"
                        _dark={{ bgGradient: "linear(to-b, gray.800, gray.900)", borderColor: "gray.700" }}
                    >
                        <VStack spacing={4} align="stretch">
                            <Flex justify="space-between" align="center">
                                <HStack>
                                    <Warehouse size={20} />
                                    <Heading as="h3" size="sm">
                                        Zavodlar
                                    </Heading>
                                </HStack>
                                {/* Modal removed per updated UX */}
                            </Flex>
                            <Divider />

                            {/* Inline factory search (quick filter) */}
                            <Box>
                                <InputGroup size="sm">
                                    <Input
                                        value={sidebarFactoryQuery}
                                        onChange={(e) => setSidebarFactoryQuery(e.target.value)}
                                        placeholder="Zavod qidirish..."
                                        borderRadius="md"
                                        bg="white"
                                        _dark={{ bg: "gray.800" }}
                                        isDisabled={sidebarLoading || loading || displayLocations.length === 0}
                                    />
                                    <InputRightElement>
                                        {sidebarFactoryQuery ? (
                                            <IconButton
                                                icon={<CloseIcon boxSize={3} />}
                                                size="xs"
                                                variant="ghost"
                                                aria-label="Tozalash"
                                                onClick={() => setSidebarFactoryQuery("")}
                                            />
                                        ) : (
                                            <SearchIcon color="gray.400" />
                                        )}
                                    </InputRightElement>
                                </InputGroup>
                            </Box>

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
                                borderRadius="md"
                                boxShadow={!selectedFactory ? "sm" : "none"}
                            >
                                Barcha zavodlar
                                {!selectedFactory && searchResults.length > 0 && (
                                    <Badge ml="auto" colorScheme="blue" borderRadius="full">
                                        {searchResults.length}
                                    </Badge>
                                )}
                            </Button>

                            {/* List of factories from search results */}
                            {/* Use page scroll (no internal scroll) */}
                            <VStack spacing={1} align="stretch">
                                {displayLocations.length === 0 && !loading && !sidebarLoading && (
                                    <Card
                                        p={4}
                                        borderWidth="1px"
                                        borderColor="gray.200"
                                        bg="white"
                                        _dark={{ bg: "gray.800", borderColor: "gray.700" }}
                                    >
                                        <VStack spacing={1} align="start">
                                            <Text fontWeight="semibold">Zavodlar yo‘q</Text>
                                            <Text fontSize="sm" color="gray.500">
                                                Hozircha zavodlar ro‘yxati mavjud emas.
                                            </Text>
                                        </VStack>
                                    </Card>
                                )}
                                {displayLocations.length > 0 && filteredLocations.length === 0 && !loading && !sidebarLoading && (
                                    <Card
                                        p={4}
                                        borderWidth="1px"
                                        borderColor="blue.200"
                                        bgGradient="linear(to-r, blue.50, cyan.50)"
                                        _dark={{ borderColor: "blue.700", bgGradient: "linear(to-r, blue.900, cyan.900)" }}
                                    >
                                        <VStack spacing={1} align="start">
                                            <Text fontWeight="semibold">Zavod topilmadi</Text>
                                            <Text fontSize="sm" color="gray.600" _dark={{ color: "gray.200" }}>
                                                “{sidebarFactoryQuery}” bo‘yicha natija yo‘q.
                                            </Text>
                                        </VStack>
                                    </Card>
                                )}
                                {visibleLocations.map((location) => {
                                    const productCount =
                                        typeof location?.count === "number"
                                            ? location.count
                                            : getProductCountForLocation(location.id);
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
                                            borderRadius="md"
                                            _hover={{
                                                transform: "translateY(-1px)",
                                                boxShadow: "sm",
                                            }}
                                            transition="all 0.15s ease"
                                        >
                                            <VStack align="start" spacing={0} flex={1}>
                                                <Text fontWeight="medium" fontSize="sm" noOfLines={2}>
                                                    {location.name}
                                                </Text>
                                                {productCount > 0 && (
                                                    <Badge mt={1} colorScheme={isSelected ? "blue" : "gray"} borderRadius="full">
                                                        {productCount}
                                                    </Badge>
                                                )}
                                              
                                            </VStack>
                                        </Button>
                                    );
                                })}

                                {canShowMoreFactories && (
                                    <Button
                                        variant="outline"
                                        colorScheme="blue"
                                        size="sm"
                                        mt={2}
                                        onClick={() => setVisibleFactoriesCount((c) => c + 20)}
                                        isDisabled={sidebarLoading || loading}
                                    >
                                        Yana ko‘rsatish
                                    </Button>
                                )}
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
                <Box flex={1} minW={0}>
                    <VStack spacing={6} align="stretch">
                        <Heading as="h1" size="xl">
                            {role === 'supplier' ? 'Mahsulot qidiruv markazi' : 'Taklif yaratish'}
                        </Heading>

                                {/* No pre-search guidance block (removed) */}

                        {/* Product Search (no wrapper card) */}
                        <Box>
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
                                        borderRadius="lg"
                                        bg="white"
                                        borderColor="gray.200"
                                        _hover={{ borderColor: "blue.300" }}
                                        _focusVisible={{ borderColor: "blue.400", boxShadow: "0 0 0 1px var(--chakra-colors-blue-400)" }}
                                        _dark={{ bg: "gray.800", borderColor: "gray.700" }}
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
                            </FormControl>

                            {error && (
                                <Alert status="error" mt={4} borderRadius="md">
                                    <AlertIcon />
                                    <AlertDescription>{error}</AlertDescription>
                                </Alert>
                            )}
                        </Box>

                        {/* Results / empty state (table is only shown when data exists) */}
                        {searchResults.length > 0 && (
                            <Box>
                                <Flex justify="space-between" align="center" mb={4} flexWrap="wrap" gap={2}>
                                    <Heading as="h3" size="md">
                                        Natijalar
                                        {selectedFactory && (
                                            <Badge ml={2} colorScheme="purple">
                                                {selectedFactory.name}
                                            </Badge>
                                        )}
                                    </Heading>
                                    <Badge colorScheme="blue" fontSize="sm" px={3} py={1.5} borderRadius="full">
                                        {pagination.totalCount} ta
                                    </Badge>
                                </Flex>

                                <TableContainer
                                    borderWidth="1px"
                                    borderRadius="lg"
                                    boxShadow="md"
                                    overflowX="auto"
                                    maxW="100%"
                                    bg="white"
                                    _dark={{ bg: "gray.800" }}
                                >
                                    {/* Wider-than-container table enables horizontal scroll */}
                                    <Table variant="simple" width="100%" minW="1100px" tableLayout="auto">
                                        <Thead bg="gray.50" _dark={{ bg: "gray.700" }}>
                                            <Tr>
                                                {role !== 'supplier' && (
                                                    <Th width="50px">
                                                        <Checkbox
                                                            isChecked={selectedItems.length === searchResults.length && searchResults.length > 0}
                                                            isIndeterminate={selectedItems.length > 0 && selectedItems.length < searchResults.length}
                                                            onChange={handleSelectAll}
                                                            colorScheme="blue"
                                                            isDisabled={sidebarLoading || loading}
                                                        />
                                                    </Th>
                                                )}
                                                <Th width="56px" color="gray.600" _dark={{ color: "gray.200" }}>№</Th>
                                                <Th>Nomi</Th>
                                                <Th>Kategoriya</Th>
                                                <Th>Ishlab chiqaruvchi</Th>
                                                <Th isNumeric>Narxi</Th>
                                            </Tr>
                                        </Thead>
                                        <Tbody>
                                            {searchResults.map((item, index) => (
                                                <Tr
                                                    key={item.id}
                                                    onClick={() => {
                                                        if (role === 'supplier' || sidebarLoading || loading) return;
                                                        handleSelectRow(item.id);
                                                    }}
                                                    cursor={sidebarLoading || loading ? "not-allowed" : "pointer"}
                                                    bg={selectedItems.includes(item.id) ? "blue.50" : undefined}
                                                    _dark={{
                                                        bg: selectedItems.includes(item.id) ? "blue.900" : undefined,
                                                        _hover: { bg: selectedItems.includes(item.id) ? "blue.800" : "gray.700" },
                                                    }}
                                                    _hover={{ bg: selectedItems.includes(item.id) ? "blue.100" : "gray.50" }}
                                                    transition="background 0.2s"
                                                    opacity={sidebarLoading || loading ? 0.6 : 1}
                                                >
                                                    {role !== 'supplier' && (
                                                        <Td onClick={(e) => e.stopPropagation()}>
                                                            <Checkbox
                                                                isChecked={selectedItems.includes(item.id)}
                                                                onChange={() => handleSelectRow(item.id)}
                                                                colorScheme="blue"
                                                                size="md"
                                                                isDisabled={sidebarLoading || loading}
                                                            />
                                                        </Td>
                                                    )}
                                                    <Td>{(pagination.currentPage - 1) * pagination.limit + index + 1}</Td>
                                                    <Td fontWeight="medium">
                                                        <Text noOfLines={2} title={item.product?.name}>
                                                            {item.product?.name || "—"}
                                                        </Text>
                                                    </Td>
                                                    <Td>
                                                        <Text noOfLines={2} title={item.product?.category?.name}>
                                                            {item.product?.category?.name || "—"}
                                                        </Text>
                                                    </Td>
                                                    <Td>
                                                        <VStack align="start" spacing={0}>
                                                            <Text noOfLines={2} title={item?.location?.parent?.name || getLocationName(item.location_id)}>
                                                                {item?.location?.parent?.name || getLocationName(item.location_id)}
                                                            </Text>
                                                        </VStack>
                                                    </Td>
                                                    <Td isNumeric fontWeight="bold" color="green.600" _dark={{ color: "green.300" }}>
                                                        {formatPrice(item.purchase_price)}
                                                    </Td>
                                                </Tr>
                                            ))}
                                        </Tbody>
                                    </Table>
                                </TableContainer>

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
                                                    if (pagination.totalPages <= 5) pageNum = i + 1;
                                                    else if (pagination.currentPage <= 3) pageNum = i + 1;
                                                    else if (pagination.currentPage >= pagination.totalPages - 2) pageNum = pagination.totalPages - 4 + i;
                                                    else pageNum = pagination.currentPage - 2 + i;

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

                        {/* Empty state (instead of table) */}
                        {searchResults.length === 0 && !loading && !sidebarLoading && (selectedFactory || (searchData.name && searchData.name !== "all")) && (
                            <Card
                                p={8}
                                borderWidth="1px"
                                borderColor="gray.200"
                                bg="white"
                                _dark={{ bg: "gray.800", borderColor: "gray.700" }}
                                boxShadow="sm"
                            >
                                <VStack spacing={2} align="center" textAlign="center">
                                    <Box
                                        w="48px"
                                        h="48px"
                                        borderRadius="full"
                                        bg="gray.100"
                                        _dark={{ bg: "gray.700" }}
                                        display="flex"
                                        alignItems="center"
                                        justifyContent="center"
                                    >
                                        <SearchIcon color="gray.400" />
                                    </Box>
                                    <Text fontSize="lg" fontWeight="semibold">
                                        Mahsulot yo‘q
                                    </Text>
                                    <Text fontSize="sm" color="gray.500" maxW="440px">
                                        {selectedFactory
                                            ? `“${selectedFactory.name}” zavodi bo‘yicha mahsulot topilmadi.`
                                            : `“${searchData.name}” bo‘yicha mahsulot topilmadi.`}
                                    </Text>
                                </VStack>
                            </Card>
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

            {/* Fixed button for selected items */}
            {selectedItems.length > 0 && (
                <Box position="fixed" bottom="20px" right="20px" zIndex={10}>
                    <Tooltip label="Tanlangan tovarlarni ko'rish" placement="left">
                        <Button
                            leftIcon={<ViewIcon />}
                            colorScheme="blue"
                            size="lg"
                            onClick={() => setIsCartOpen(true)}
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
                isOpen={isCartOpen}
                onClose={() => setIsCartOpen(false)}
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
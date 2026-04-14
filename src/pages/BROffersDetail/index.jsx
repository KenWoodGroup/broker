import React, { useEffect, useState } from "react";
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
    Tooltip,
    Input,
    InputGroup,
    InputLeftElement,
    NumberInput,
    NumberInputField,
    NumberInputStepper,
    NumberIncrementStepper,
    NumberDecrementStepper,
    Collapse,
    FormControl,
    FormLabel,
    Checkbox,
    Stack,
    Accordion,
    AccordionItem,
    AccordionButton,
    AccordionPanel,
    AccordionIcon,
    useColorMode,
    useDisclosure,
} from "@chakra-ui/react";
import {
    FaBuilding,
    FaMoneyBill,
    FaReceipt,
    FaArrowLeft,
    FaBox,
    FaUser,
    FaPhone,
    FaSearch,
    FaChevronDown,
    FaChevronUp,
    FaPlus,
    FaShoppingCart,
    FaCheckCircle,
    FaTimesCircle,
    FaClock,
} from "react-icons/fa";
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
import { apiStock } from "../../utils/Controllers/apiStock";
import { apiTasks } from "../../utils/Controllers/apiTasks";
import {
    PRICE_UPDATE_RULES,
    getLatestSalePriceUpdatedAt,
    isPriceUpdatePastMediumYellow,
} from "../../constants/priceFreshness";
import PriceUpdateTaskModal from "./_components/PriceUpdateTaskModal";

// Status configuration
const statusConfig = [
    { id: "new", label: "Yangi", icon: Star },
    { id: "in_progress", label: "Jarayonda", icon: Settings },
    { id: "pending_confirmation", label: "Tasdiqlash kutilmoqda", icon: Clock },
    { id: "price_review", label: "Narx tekshiruvi", icon: DollarSign },
    { id: "contract_ready", label: "Shartnoma tayyor", icon: FileText },
    { id: "contract_signed", label: "Shartnoma imzolangan", icon: PenTool },
    { id: "payment_in_progress", label: "To'lov jarayonida", icon: CreditCard },
    { id: "items_in_progress", label: "Mahsulotlar tayyorlanmoqda", icon: Package },
    { id: "in_delivery", label: "Yetkazib berishda", icon: Truck },
    { id: "delivered", label: "Yetkazib berilgan", icon: Check },
    { id: "completed", label: "Tugallangan", icon: CheckCircle2 },
    { id: "cancelled", label: "Bekor qilingan", icon: X },
];

// Stock Search Component
const ProductStockSearch = ({ product, onSelectStocks, offer }) => {
    const {
        isOpen: isPriceTaskOpen,
        onOpen: onPriceTaskOpen,
        onClose: onPriceTaskClose,
    } = useDisclosure();
    const [priceTaskStock, setPriceTaskStock] = useState(null);

    const openPriceTask = (stock) => {
        setPriceTaskStock(stock);
        onPriceTaskOpen();
    };

    const closePriceTask = () => {
        setPriceTaskStock(null);
        onPriceTaskClose();
    };

    const [isOpen, setIsOpen] = useState(false);
    const [stockData, setStockData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const [selectedStocks, setSelectedStocks] = useState([]);
    const [reorderSubmitting, setReorderSubmitting] = useState(false);
    const toast = useToast();
    const { colorMode } = useColorMode();

    const fetchStock = async (page = 1, search = "") => {
        try {
            setLoading(true);
            const response = await apiStock?.GetByAdress({
                address: 'all',
                name: search || product.product_name,
                page: page,
                limit: 10
            });

            if (response?.data?.data) {
                setStockData(response.data.data);
                setCurrentPage(response.data.pagination?.currentPage || 1);
                setTotalPages(response.data.pagination?.totalPages || 1);
                setTotalCount(response.data.pagination?.totalCount || 0);
            }
        } catch (error) {
            console.error("Error fetching stock:", error);
            toast({
                title: "Xatolik",
                description: "Stok ma'lumotlarini yuklashda xatolik yuz berdi",
                status: "error",
                duration: 3000,
                isClosable: true,
            });
        } finally {
            setLoading(false);
        }
    };

    const createReorderTask = async () => {
        const groupId = (offer?.id || "").trim();
        const productName = (product?.product_name || "").trim();
        const categoryName =
            (product?.product?.category?.name || "").trim() ||
            (product?.category_name || "").trim() ||
            "Kategoriyasiz";

        const firstStock = stockData?.[0];
        const stockId = (firstStock?.id || "").trim();
        const warehouseId = (firstStock?.location_id || firstStock?.location?.id || "").trim();
        const factoryId = (firstStock?.location?.parent?.id || "").trim();

        if (!groupId) {
            toast({
                title: "group_id",
                description: "Offer ID topilmadi (group_id bo'sh bo'lmasin)",
                status: "warning",
                duration: 4000,
                isClosable: true,
            });
            return;
        }

        if (!productName) {
            toast({
                title: "Ma'lumot",
                description: "product_name topilmadi",
                status: "warning",
                duration: 4000,
                isClosable: true,
            });
            return;
        }

        const payload = {
            assignee_type: "supplier",
            type: "reorder",
            priority: "normal",
            source: "manual",
            group_id: groupId,
            details: {
                product_name: productName,
                category_name: categoryName,
                factory_id: factoryId,
                warehouse_id: warehouseId,
                stock_id: stockId,
            },
        };

        try {
            setReorderSubmitting(true);
            await apiTasks.create(payload);
            toast({
                title: "Yuborildi",
                description: "Reorder task yaratildi",
                status: "success",
                duration: 3000,
                isClosable: true,
            });
        } catch (error) {
            console.error(error);
            const msg = error?.response?.data?.message;
            toast({
                title: "Xatolik",
                description: Array.isArray(msg)
                    ? msg.join(". ")
                    : msg || "Task yaratishda xatolik",
                status: "error",
                duration: 6000,
                isClosable: true,
            });
        } finally {
            setReorderSubmitting(false);
        }
    };

    useEffect(() => {
        if (isOpen) {
            fetchStock(1, product.product_name);
        }
    }, [isOpen, product.product_name]);

    const handleSearch = () => {
        fetchStock(1, searchTerm);
    };

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            fetchStock(newPage, searchTerm);
        }
    };

    const handleToggleStock = (stock) => {
        setSelectedStocks(prev => {
            const exists = prev.find(s => s.id === stock.id);
            if (exists) {
                return prev.filter(s => s.id !== stock.id);
            } else {
                return [...prev, { ...stock, quantityStr: "" }];
            }
        });
    };

    // Храним значение как строку, чтобы можно было удалять символы свободно
    const handleQuantityChange = (stockId, valueString) => {
        setSelectedStocks(prev => prev.map(stock => {
            if (stock.id === stockId) {
                return { ...stock, quantityStr: valueString };
            }
            return stock;
        }));
    };

    // При потере фокуса — зажимаем значение в допустимый диапазон
    const handleQuantityBlur = (stockId, maxQuantity) => {
        setSelectedStocks(prev => prev.map(stock => {
            if (stock.id === stockId) {
                const val = parseFloat(stock.quantityStr);
                if (isNaN(val) || val < 0) {
                    return { ...stock, quantityStr: "0" };
                } else if (val > maxQuantity) {
                    return { ...stock, quantityStr: String(maxQuantity) };
                }
            }
            return stock;
        }));
    };

    const handleAddToOffer = () => {
        const validStocks = selectedStocks.filter(stock => {
            const q = parseFloat(stock.quantityStr);
            return !isNaN(q) && q > 0;
        });

        if (validStocks.length > 0) {
            onSelectStocks(validStocks.map(stock => ({
                ...stock,
                quantity: Math.min(parseFloat(stock.quantityStr), stock.quantity),
                originalProduct: product
            })));
            setIsOpen(false);
            setSelectedStocks([]);
            setSearchTerm("");
            toast({
                title: "Muvaffaqiyatli",
                description: `${validStocks.length} ta stok buyurtmaga qo'shildi`,
                status: "success",
                duration: 3000,
                isClosable: true,
            });
        } else {
            toast({
                title: "Xatolik",
                description: "Iltimos, kamida bitta stokni tanlang va miqdorini kiriting",
                status: "warning",
                duration: 3000,
                isClosable: true,
            });
        }
    };

    const formatPrice = (price) => {
        return parseFloat(price).toLocaleString('uz-UZ') + ' UZS';
    };

    const totalSelectedAmount = selectedStocks.reduce((sum, stock) => {
        const price = stock.sale_price_type?.[0]?.sale_price || stock.purchase_price;
        const qty = parseFloat(stock.quantityStr) || 0;
        return sum + (price * qty);
    }, 0);

    const validStocksCount = selectedStocks.filter(stock => {
        const q = parseFloat(stock.quantityStr);
        return !isNaN(q) && q > 0;
    }).length;

    return (
        <Box mt={3}>
            <Button
                size="sm"
                leftIcon={<FaShoppingCart />}
                rightIcon={isOpen ? <FaChevronUp /> : <FaChevronDown />}
                variant="outline"
                onClick={() => setIsOpen(!isOpen)}
                mb={isOpen ? 3 : 0}
            >
                Stokdan qo'shish ({validStocksCount})
            </Button>

            <Collapse in={isOpen} animateOpacity>
                <Box p={4} bg={colorMode === 'dark' ? 'neutral.700' : 'neutral.50'} borderRadius="md" mt={2}>
                    <VStack spacing={4} align="stretch">
                        <InputGroup size="md">
                            <InputLeftElement>
                                <FaSearch />
                            </InputLeftElement>
                            <Input
                                placeholder={`${product.product_name} bo'yicha qidirish...`}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                            />
                            <Button ml={2} onClick={handleSearch}>
                                Qidirish
                            </Button>
                        </InputGroup>

                        {!loading && stockData.length > 0 && (
                            <Text fontSize="sm">
                                {totalCount} ta natija topildi
                            </Text>
                        )}

                        {loading ? (
                            <Flex justify="center" py={8}>
                                <Spinner />
                            </Flex>
                        ) : stockData.length === 0 ? (
                            <Box textAlign="center" py={8}>
                                <Text>Stokda mahsulot topilmadi</Text>
                            </Box>
                        ) : (
                            <Stack spacing={3}>
                                {stockData.map((stock) => {
                                    const isSelected = selectedStocks.some(s => s.id === stock.id);
                                    const price = stock.sale_price_type?.[0]?.sale_price || stock.purchase_price;
                                    const selectedStock = selectedStocks.find(s => s.id === stock.id);
                                    const currentQuantityStr = selectedStock?.quantityStr ?? "";
                                    const currentQuantityNum = parseFloat(currentQuantityStr) || 0;
                                    const latestPriceAt = getLatestSalePriceUpdatedAt(
                                        stock.sale_price_type
                                    );
                                    const showPriceTask =
                                        latestPriceAt &&
                                        isPriceUpdatePastMediumYellow(latestPriceAt);

                                    return (
                                        <Box
                                            key={stock.id}
                                            p={4}
                                            borderWidth="1px"
                                            borderRadius="md"
                                            bg={isSelected ? (colorMode === 'dark' ? 'brand.900' : 'brand.50') : 'surface'}
                                            transition="all 0.2s"
                                            _hover={{ shadow: "md" }}
                                        >
                                            <Flex justify="space-between" align="start" wrap="wrap" gap={3}>
                                                <Checkbox
                                                    isChecked={isSelected}
                                                    onChange={() => handleToggleStock(stock)}
                                                    size="lg"
                                                >
                                                    <Box ml={2}>
                                                        <Text fontWeight="medium">
                                                            {stock.product?.name}
                                                        </Text>
                                                        <Text fontSize="sm">
                                                            Partiya: {stock.batch}
                                                        </Text>
                                                    </Box>
                                                </Checkbox>

                                                <VStack align="end" spacing={1}>
                                                    <Badge px={2} py={1}>
                                                        {parseFloat(stock.quantity).toLocaleString()} {stock.product?.unit}
                                                    </Badge>
                                                    <Text fontWeight="semibold" fontSize="lg">
                                                        {formatPrice(price)}
                                                    </Text>
                                                </VStack>
                                            </Flex>

                                            {isSelected && (
                                                <Flex mt={3} pt={3} borderTopWidth="1px" align="center" gap={4}>
                                                    <FormControl flex={1}>
                                                        <FormLabel fontSize="sm" mb={1}>
                                                            Miqdor (mavjud: {parseFloat(stock.quantity).toLocaleString()} {stock.product?.unit})
                                                        </FormLabel>
                                                        <NumberInput
                                                            min={0}
                                                            max={stock.quantity}
                                                            value={currentQuantityStr}
                                                            onChange={(valueString) => {
                                                                handleQuantityChange(stock.id, valueString);
                                                            }}
                                                            onBlur={() => handleQuantityBlur(stock.id, stock.quantity)}
                                                            keepWithinRange={false}
                                                            clampValueOnBlur={false}
                                                            size="sm"
                                                        >
                                                            <NumberInputField />
                                                            <NumberInputStepper>
                                                                <NumberIncrementStepper />
                                                                <NumberDecrementStepper />
                                                            </NumberInputStepper>
                                                        </NumberInput>
                                                    </FormControl>
                                                    <Text fontSize="sm">
                                                        Jami: {formatPrice(price * currentQuantityNum)}
                                                    </Text>
                                                </Flex>
                                            )}

                                            <Flex mt={2} gap={2} wrap="wrap" align="center">
                                                <Tooltip label={stock.location?.address}>
                                                    <Badge variant="outline" size="sm">
                                                        📍 {stock.location?.parent?.name || stock.location?.address?.substring(0, 30)}
                                                    </Badge>
                                                </Tooltip>
                                            </Flex>

                                            {showPriceTask && (
                                                <Box
                                                    mt={3}
                                                    p={3}
                                                    borderWidth="1px"
                                                    borderRadius="md"
                                                 borderColor="transparent"
                                                >
                                                    <Button
                                                        size="sm"
                                                        colorScheme="orange"
                                                        onClick={() => openPriceTask(stock)}
                                                    >
                                                        Narx vazifasi
                                                    </Button>
                                                </Box>
                                            )}
                                        </Box>
                                    );
                                })}
                            </Stack>
                        )}

                        {!loading && totalCount > 0 && totalCount < 10 && (
                           
                                 
                                    <Button
                                        size="sm"
                                        colorScheme="blue"
                                        onClick={createReorderTask}
                                        isLoading={reorderSubmitting}
                                    >
                                        Reorder task yuborish
                                    </Button>
                            
                        )}

                        {totalPages > 1 && (
                            <HStack justify="center" spacing={2} pt={2}>
                                <Button
                                    size="sm"
                                    onClick={() => handlePageChange(currentPage - 1)}
                                    isDisabled={currentPage === 1}
                                >
                                    Oldingi
                                </Button>
                                <Text fontSize="sm">
                                    {currentPage} / {totalPages}
                                </Text>
                                <Button
                                    size="sm"
                                    onClick={() => handlePageChange(currentPage + 1)}
                                    isDisabled={currentPage === totalPages}
                                >
                                    Keyingi
                                </Button>
                            </HStack>
                        )}

                        {selectedStocks.length > 0 && (
                            <Box p={3} bg={colorMode === 'dark' ? 'brand.900' : 'brand.50'} borderRadius="md">
                                <Flex justify="space-between" align="center" wrap="wrap" gap={3}>
                                    <VStack align="start" spacing={0}>
                                        <Text fontWeight="medium">
                                            Tanlangan: {validStocksCount} ta stok
                                        </Text>
                                        <Text fontSize="sm">
                                            Umumiy summa: {formatPrice(totalSelectedAmount)}
                                        </Text>
                                    </VStack>
                                    <Button
                                        colorScheme="brand"
                                        leftIcon={<FaPlus />}
                                        onClick={handleAddToOffer}
                                        size="sm"
                                        isDisabled={validStocksCount === 0}
                                    >
                                        Buyurtmaga qo'shish
                                    </Button>
                                </Flex>
                            </Box>
                        )}
                    </VStack>
                </Box>
            </Collapse>

            <PriceUpdateTaskModal
                isOpen={isPriceTaskOpen}
                onClose={closePriceTask}
                stock={priceTaskStock}
                offerLineItem={product}
                offerGroupId={offer?.id}
            />
        </Box>
    );
};

export default function BROffersDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [offer, setOffer] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const toast = useToast();
    const { colorMode } = useColorMode();

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

    const handleSelectStocks = (stocksData) => {
        stocksData.forEach(stock => {
            toast({
                title: "Stok qo'shildi",
                description: `${stock.product?.name} - ${stock.quantity} ${stock.product?.unit} buyurtmaga qo'shildi`,
                status: "success",
                duration: 2000,
                isClosable: true,
            });
        });
    };

    const formatDate = (dateString) => {
        if (!dateString) return "-";
        const date = new Date(dateString);
        return date.toLocaleDateString('uz-UZ', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    const formatPrice = (price) => {
        const amount = parseFloat(price);
        return amount.toLocaleString('uz-UZ') + ' UZS';
    };

    const getPaymentStatusText = (status) => {
        const statusMap = {
            unpaid: "To'lanmagan",
            partially_paid: "Qisman to'langan",
            paid: "To'langan",
        };
        return statusMap[status] || status;
    };

    const getItemStatusIcon = (status) => {
        if (status === 'delivered') return FaCheckCircle;
        if (status === 'cancelled') return FaTimesCircle;
        return FaClock;
    };

    if (loading) {
        return (
            <Flex justify="center" align="center" h="100vh" bg="bg">
                <Spinner size="xl" thickness="4px" />
            </Flex>
        );
    }

    if (error) {
        return (
            <Box p={6} bg="bg" minH="100vh">
                <Alert status="error" borderRadius="md">
                    <AlertIcon />
                    {error}
                </Alert>
            </Box>
        );
    }

    if (!offer) {
        return (
            <Box p={6} bg="bg" minH="100vh">
                <Alert status="warning" borderRadius="md">
                    <AlertIcon />
                    Ma'lumot topilmadi
                </Alert>
            </Box>
        );
    }

    const currentStatus = statusConfig.find(s => s.id === offer.status);

    return (
        <Box py={6} px={4} minH="100vh" bg="bg">
            <Box maxW="1400px" mx="auto">
                <Button
                    leftIcon={<FaArrowLeft />}
                    variant="ghost"
                    mb={6}
                    onClick={() => navigate(-1)}
                >
                    Orqaga
                </Button>

                <Card borderRadius="xl" overflow="hidden" boxShadow="sm">
                    <Box borderBottomWidth="1px" px={6} py={5}>
                        <Flex justify="space-between" align="center" wrap="wrap" gap={4}>
                            <HStack spacing={4}>
                                <Icon as={FaReceipt} boxSize={6} />
                                <Box>
                                    <Heading size="lg">
                                        {offer.offer_number}
                                    </Heading>
                                    <Text mt={1}>
                                        {formatDate(offer.date)}
                                    </Text>
                                </Box>
                            </HStack>
                            <Badge
                                px={4}
                                py={2}
                                borderRadius="full"
                                fontSize="md"
                                display="flex"
                                alignItems="center"
                                gap={2}
                            >
                                <Icon as={currentStatus?.icon} />
                                {currentStatus?.label}
                            </Badge>
                        </Flex>
                    </Box>

                    <CardBody p={6}>
                        <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }} gap={6} mb={8}>
                            <Card variant="outline">
                                <CardBody>
                                    <HStack mb={4} spacing={3}>
                                        <Icon as={FaBuilding} boxSize={5} />
                                        <Heading size="sm">Qurilish ma'lumotlari</Heading>
                                    </HStack>
                                    <Stack spacing={2}>
                                        <Flex justify="space-between">
                                            <Text>Nomi:</Text>
                                            <Text>{offer.construction_site_name || "-"}</Text>
                                        </Flex>
                                        <Flex justify="space-between">
                                            <Text>Manzil:</Text>
                                            <Text textAlign="right">{offer.address || "-"}</Text>
                                        </Flex>
                                    </Stack>
                                </CardBody>
                            </Card>

                            <Card variant="outline">
                                <CardBody>
                                    <HStack mb={4} spacing={3}>
                                        <Icon as={FaUser} boxSize={5} />
                                        <Heading size="sm">Mijoz ma'lumotlari</Heading>
                                    </HStack>
                                    <Stack spacing={2}>
                                        <Flex justify="space-between">
                                            <Text>Nomi:</Text>
                                            <Text>{offer.location?.name || "-"}</Text>
                                        </Flex>
                                        <Flex justify="space-between">
                                            <Text>Manzil:</Text>
                                            <Text textAlign="right">{offer.location?.address || "-"}</Text>
                                        </Flex>
                                        <Flex justify="space-between">
                                            <Text>Telefon:</Text>
                                            <Text>{offer.location?.phone || "-"}</Text>
                                        </Flex>
                                    </Stack>
                                </CardBody>
                            </Card>

                            <Card variant="outline">
                                <CardBody>
                                    <HStack mb={4} spacing={3}>
                                        <Icon as={FaMoneyBill} boxSize={5} />
                                        <Heading size="sm">To'lov ma'lumotlari</Heading>
                                    </HStack>
                                    <Stack spacing={2}>
                                        <Flex justify="space-between">
                                            <Text>Umumiy summa:</Text>
                                            <Text fontWeight="medium">{formatPrice(offer.total_sum)}</Text>
                                        </Flex>
                                        <Flex justify="space-between">
                                            <Text>To'langan summa:</Text>
                                            <Text>{formatPrice(offer.paid_sum)}</Text>
                                        </Flex>
                                        <Flex justify="space-between">
                                            <Text>To'lov holati:</Text>
                                            <Badge>
                                                {getPaymentStatusText(offer.payment_status)}
                                            </Badge>
                                        </Flex>
                                        <Flex justify="space-between">
                                            <Text>Yetkazib berish:</Text>
                                            <Text>{formatPrice(offer.total_delivery_sum)}</Text>
                                        </Flex>
                                    </Stack>
                                </CardBody>
                            </Card>

                            {offer.contract_number && (
                                <Card variant="outline">
                                    <CardBody>
                                        <HStack mb={4} spacing={3}>
                                            <Icon as={FaReceipt} boxSize={5} />
                                            <Heading size="sm">Kontrakt</Heading>
                                        </HStack>
                                        <Stack spacing={2}>
                                            <Flex justify="space-between">
                                                <Text>Raqam:</Text>
                                                <Text>{offer.contract_number}</Text>
                                            </Flex>
                                        </Stack>
                                    </CardBody>
                                </Card>
                            )}
                        </Grid>

                        {offer.note && (
                            <Alert status="info" borderRadius="lg" mb={6}>
                                <AlertIcon />
                                <Text fontWeight="medium" mr={2}>Izoh:</Text>
                                <Text>{offer.note}</Text>
                            </Alert>
                        )}

                        <Divider my={6} />

                        <Box>
                            <HStack mb={5} spacing={3}>
                                <Icon as={FaBox} boxSize={6} />
                                <Heading size="md">Mahsulotlar</Heading>
                            </HStack>

                            <Accordion allowMultiple>
                                {offer.offer_items?.map((item, idx) => (
                                    <AccordionItem
                                        key={item.id}
                                        borderWidth="1px"
                                        borderRadius="lg"
                                        mb={3}
                                        overflow="hidden"
                                    >
                                        <AccordionButton py={4}>
                                            <Flex flex="1" justify="space-between" align="center" wrap="wrap" gap={3}>
                                                <HStack spacing={3}>
                                                    <Text fontWeight="medium" minW="40px">{idx + 1}.</Text>
                                                    <Text fontWeight="medium">{item.product_name}</Text>
                                                </HStack>
                                                <HStack spacing={4}>
                                                    <Badge>
                                                        {parseFloat(item.quantity).toLocaleString()} {item.unit}
                                                    </Badge>
                                                    <Text fontWeight="medium">
                                                        {formatPrice(parseFloat(item.quantity) * parseFloat(item.sale_price))}
                                                    </Text>
                                                    <Icon as={getItemStatusIcon(item.status)} />
                                                    <AccordionIcon />
                                                </HStack>
                                            </Flex>
                                        </AccordionButton>

                                        <AccordionPanel pb={4}>
                                            <TableContainer>
                                                <Table size="sm">
                                                    <Thead>
                                                        <Tr>
                                                            <Th>Miqdori</Th>
                                                            <Th isNumeric>Sotish narxi</Th>
                                                            <Th isNumeric>Yetkazilgan</Th>
                                                            <Th>Holati</Th>
                                                        </Tr>
                                                    </Thead>
                                                    <Tbody>
                                                        <Tr>
                                                            <Td>{parseFloat(item.quantity).toLocaleString()}</Td>
                                                            <Td isNumeric>{formatPrice(item.sale_price)}</Td>
                                                            <Td isNumeric>{parseFloat(item.delivered_quantity).toLocaleString()}</Td>
                                                            <Td>
                                                                <Badge>
                                                                    {item.status === 'pending' ? "Kutilmoqda" : "Yetkazilgan"}
                                                                </Badge>
                                                            </Td>
                                                        </Tr>
                                                    </Tbody>
                                                </Table>
                                            </TableContainer>

                                            <ProductStockSearch
                                                key={item.id}
                                                product={item}
                                                onSelectStocks={handleSelectStocks}
                                                offer={offer}
                                            />
                                        </AccordionPanel>
                                    </AccordionItem>
                                ))}
                            </Accordion>
                        </Box>

                        <Box mt={8} p={5} bg={colorMode === 'dark' ? 'neutral.700' : 'neutral.100'} borderRadius="xl">
                            <Grid templateColumns={{ base: "1fr", sm: "repeat(3, 1fr)" }} gap={6}>
                                <Box textAlign="center">
                                    <Text fontSize="sm" textTransform="uppercase">
                                        Mahsulotlar soni
                                    </Text>
                                    <Text fontSize="2xl" fontWeight="bold" mt={1}>
                                        {offer.offer_items?.length || 0} ta
                                    </Text>
                                </Box>
                                <Box textAlign="center">
                                    <Text fontSize="sm" textTransform="uppercase">
                                        Umumiy miqdor
                                    </Text>
                                    <Text fontSize="2xl" fontWeight="bold" mt={1}>
                                        {offer.offer_items?.reduce((sum, item) => sum + parseFloat(item.quantity), 0).toLocaleString()} dona
                                    </Text>
                                </Box>
                                <Box textAlign="center">
                                    <Text fontSize="sm" textTransform="uppercase">
                                        Umumiy summa
                                    </Text>
                                    <Text fontSize="2xl" fontWeight="bold" mt={1}>
                                        {formatPrice(offer.total_sum)}
                                    </Text>
                                </Box>
                            </Grid>
                        </Box>
                    </CardBody>
                </Card>
            </Box>
        </Box>
    );
}
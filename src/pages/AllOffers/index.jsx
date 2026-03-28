import { useEffect, useState, useRef } from "react";
import {
    Box,
    Heading,
    Text,
    Flex,
    VStack,
    Badge,
    HStack,
    useToast,
    Spinner,
    Center,
    Icon,
    Tabs,
    TabList,
    TabPanels,
    Tab,
    TabPanel,
    SimpleGrid,
    Button,
    IconButton,
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { apiOffers } from "../../utils/Controllers/Offers";
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
    Calendar,
    MapPin,
    Building,
    ShoppingBag,
    ChevronLeft,
    ChevronRight,
    Building2,
    Building2Icon,
} from "lucide-react";

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

// Helper functions
const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("uz-UZ", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
    });
};

const formatCurrency = (amount) => {
    return new Intl.NumberFormat("uz-UZ", {
        style: "currency",
        currency: "UZS",
        minimumFractionDigits: 0,
    }).format(parseFloat(amount));
};

// Offer Card Component
const OfferCard = ({ offer, onClick }) => {
    const statusConfigData = statusConfig.find(s => s.id === offer.status);

    return (
        <Box
            p={4}
            borderRadius="lg"
            border="1px solid"
            borderColor="gray.200"

            cursor="pointer"
            transition="all 0.3s"
            _hover={{
                transform: "translateY(-4px)",
                boxShadow: "lg",
                borderColor: "blue.300",
            }}
            onClick={() => onClick(offer.id)}
        >
            <VStack align="stretch" spacing={3}>
                {/* Header */}
                <HStack justify="space-between">
                    <HStack spacing={2}>
                        <Icon as={statusConfigData?.icon} size={18} color="gray.600" />
                        <Text fontWeight="bold" fontSize="md">
                            {offer.offer_number}
                        </Text>
                    </HStack>
                    <Badge variant="subtle" colorScheme="gray">
                        {statusConfigData?.label}
                    </Badge>
                </HStack>

                {/* Location Info */}
                <VStack align="stretch" spacing={1}>
                    <HStack spacing={2}>
                        <Icon as={Building} size={14} />
                        <Text fontSize="sm" noOfLines={1}>
                            {offer.construction_site_name || offer.location?.name || "Noma'lum"}
                        </Text>
                    </HStack>
                    <HStack spacing={2}>
                        <Icon as={MapPin} size={14} />
                        <Text fontSize="xs" noOfLines={1}>
                            {offer.address || "Manzil yo'q"}
                        </Text>
                    </HStack>
                </VStack>

                {/* Financial Info */}
                <HStack justify="space-between">
                    <VStack align="start" spacing={0}>
                        <Text fontSize="xs" >Umumiy summa</Text>
                        <Text fontSize="sm" fontWeight="bold" >
                            {formatCurrency(offer.total_sum)}
                        </Text>
                    </VStack>
                    <VStack align="end" spacing={0}>
                        <Text fontSize="xs" >To'langan</Text>
                        <Text fontSize="sm" fontWeight="medium" >
                            {formatCurrency(offer.paid_sum)}
                        </Text>
                    </VStack>
                </HStack>

                {/* Date and Items */}
                <HStack justify="space-between">
                    <HStack spacing={1}>
                        <Icon as={Calendar} size={12} />
                        <Text fontSize="xs" >
                            {formatDate(offer.date)}
                        </Text>
                    </HStack>
                    {offer.offer_items && offer.offer_items.length > 0 && (
                        <HStack spacing={1}>
                            <Icon as={ShoppingBag} size={12} />
                            <Text fontSize="xs" >
                                {offer.offer_items.length} ta
                            </Text>
                        </HStack>
                    )}
                </HStack>
            </VStack>
        </Box>
    );
};

// Custom Tab Swiper Component
const TabSwiper = ({ tabs, activeIndex, onTabChange, counts }) => {
    const scrollRef = useRef(null);

    const scroll = (direction) => {
        if (scrollRef.current) {
            const scrollAmount = direction === 'left' ? -200 : 200;
            scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        }
    };

    return (
        <Box position="relative" w="100%">
            {/* Left Navigation Button */}
            <IconButton
                icon={<Icon as={ChevronLeft} size={20} />}
                position="absolute"
                left={-2}
                top="50%"
                transform="translateY(-50%)"
                zIndex={2}
                size="sm"
                variant="outline"
                rounded="full"
                onClick={() => scroll('left')}
                aria-label="Scroll left"
                boxShadow="md"
            />

            {/* Scrollable Tab List */}
            <Box
                ref={scrollRef}
                overflowX="auto"
                css={{
                    scrollbarWidth: 'none',
                    msOverflowStyle: 'none',
                    '&::-webkit-scrollbar': {
                        display: 'none',
                    },
                }}
                sx={{
                    scrollBehavior: 'smooth',
                }}
            >
                <HStack spacing={2} minWidth="max-content" px={8}>
                    {tabs.map((tab, idx) => {
                        const isActive = idx === activeIndex;
                        const count = counts[tab.id] || 0;

                        return (
                            <Button
                                key={tab.id}
                                onClick={() => onTabChange(idx)}
                                variant={isActive ? "solid" : "ghost"}
                                colorScheme={isActive ? "blue" : "gray"}
                                size="md"
                                px={4}
                                py={2}
                                borderRadius="full"
                                transition="all 0.2s"

                                leftIcon={<Icon as={tab.icon} size={18} />}
                                rightIcon={
                                    count > 0 && (
                                        <Badge
                                            ml={1}
                                            borderRadius="full"
                                            colorScheme={isActive ? "white" : "gray"}
                                            variant={isActive ? "solid" : "subtle"}
                                            fontSize="xs"
                                        >
                                            {count}
                                        </Badge>
                                    )
                                }
                            >
                                {tab.label}
                            </Button>
                        );
                    })}
                </HStack>
            </Box>

            {/* Right Navigation Button */}
            <IconButton
                icon={<Icon as={ChevronRight} size={20} />}
                position="absolute"
                right={-2}
                top="50%"
                transform="translateY(-50%)"
                zIndex={2}
                size="sm"
                variant="outline"
                rounded="full"
                onClick={() => scroll('right')}
                aria-label="Scroll right"
                boxShadow="md"
            />
        </Box>
    );
};

// Main Component
export default function AllOffers() {
    const [loading, setLoading] = useState(true);
    const [offersData, setOffersData] = useState({});
    const [activeTabIndex, setActiveTabIndex] = useState(0);
    const toast = useToast();
    const navigate = useNavigate();

    const GetAllOffers = async () => {
        try {
            setLoading(true);
            const response = await apiOffers?.GelAllOffers(1);

            if (response?.data?.data) {
                setOffersData(response.data.data);
            }
        } catch (error) {
            console.error("Error fetching offers:", error);
            toast({
                title: "Xatolik",
                description: "Ma'lumotlarni yuklashda xatolik yuz berdi",
                status: "error",
                duration: 3000,
                isClosable: true,
            });
        } finally {
            setLoading(false);
        }
    };

    const handleCardClick = (offerId) => {
        navigate(`/operator/offers/${offerId}`);
    };

    useEffect(() => {
        GetAllOffers();
    }, []);

    // Calculate counts for each status
    const counts = statusConfig.reduce((acc, status) => {
        acc[status.id] = offersData[status.id]?.length || 0;
        return acc;
    }, {});

    if (loading) {
        return (
            <Center h="100vh">
                <VStack spacing={4}>
                    <Spinner size="xl" thickness="4px" />
                    <Text>Ma'lumotlar yuklanmoqda...</Text>
                </VStack>
            </Center>
        );
    }

    return (
        <Box minH="100vh" >
            {/* Header */}
            <Box borderBottom="1px solid" borderColor="gray.200" position="sticky" top={0} zIndex={10}>
                <Box maxW="1400px" mx="auto" px={6} py={4}>
                    <VStack align="stretch" spacing={4}>
                        <Box>
                            <Building2Icon size={24} color="#3182CE" />
                            <Heading size="lg" >
                                Buyurtmalar
                            </Heading>
                            <Text fontSize="sm" color="gray.600" mt={1}>
                                Barcha buyurtmalarni ko'rish va boshqarish
                            </Text>
                        </Box>

                        {/* Custom Tab Swiper */}
                        <TabSwiper
                            tabs={statusConfig}
                            activeIndex={activeTabIndex}
                            onTabChange={setActiveTabIndex}
                            counts={counts}
                        />
                    </VStack>
                </Box>
            </Box>

            {/* Content */}
            <Box maxW="1400px" mx="auto" px={6} py={6}>
                {statusConfig.map((status, idx) => (
                    <Box
                        key={status.id}
                        display={idx === activeTabIndex ? "block" : "none"}
                        transition="all 0.3s"
                    >
                        {offersData[status.id]?.length > 0 ? (
                            <SimpleGrid
                                columns={{ base: 1, md: 2, lg: 3, xl: 4 }}
                                spacing={4}
                            >
                                {offersData[status.id].map((offer) => (
                                    <OfferCard
                                        key={offer.id}
                                        offer={offer}
                                        onClick={handleCardClick}
                                    />
                                ))}
                            </SimpleGrid>
                        ) : (
                            <Center py={12}>
                                <VStack spacing={3}>
                                    <Icon as={status.icon} size={48} color="gray.300" />
                                    <Text >Bu holatda hech qanday buyurtma yo'q</Text>
                                </VStack>
                            </Center>
                        )}
                    </Box>
                ))}
            </Box>
        </Box>
    );
}
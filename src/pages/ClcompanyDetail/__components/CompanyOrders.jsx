import {
    Box,
    Card,
    CardBody,
    Text,
    Badge,
    Spinner,
    Center,
    Flex,
    Divider,
    Grid,
    VStack,
    Icon,
    HStack,
    Heading,
    Button,
    useColorModeValue
} from "@chakra-ui/react"
import {
    FileText,
    Calendar,
    Truck,
    Clock,
    AlertCircle,
    Package
} from "lucide-react"
import { NavLink } from "react-router-dom"

export default function CompanyOrders({ offers, loading, id, role }) {
    if (loading) {
        return (
            <Center py={10}>
                <VStack spacing={4}>
                    <Spinner size="xl" thickness="4px" color="blue.500" />
                    <Text color="gray.500">Buyurtmalar yuklanmoqda...</Text>
                </VStack>
            </Center>
        )
    }

    return (
        <>
            <Flex justify="space-between" align="center" mb={6}>
                <Heading size="md">Barcha buyurtmalar</Heading>
                <NavLink to={role !== 'Admin' ? `/call-operator/offer/create/${id}` : `/create-offer/${id}`}>
                    <Button
                        colorScheme="blue"
                        leftIcon={<FileText size={18} />}
                        size="md"
                    >
                        Buyurtma yaratish
                    </Button>
                </NavLink>
            </Flex>

            {offers?.records?.length > 0 ? (
                <VStack spacing={4} align="stretch">
                    {offers.records.map((offer) => (
                        <OfferCard key={offer.id} offer={offer} />
                    ))}
                </VStack>
            ) : (
                <EmptyState />
            )}
        </>
    )
}

function OfferCard({ offer }) {
    const bg = useColorModeValue("white", "gray.800")
    const borderColor = useColorModeValue("gray.200", "gray.700")

    const getStatusColor = (status) => {
        switch (status) {
            case 'new': return 'green'
            case 'processing': return 'blue'
            case 'completed': return 'purple'
            case 'cancelled': return 'red'
            default: return 'gray'
        }
    }

    const getStatusText = (status) => {
        switch (status) {
            case 'new': return 'Yangi'
            case 'processing': return 'Jarayonda'
            case 'completed': return 'Yakunlangan'
            case 'cancelled': return 'Bekor qilingan'
            default: return status
        }
    }

    const formatDate = (dateString) => {
        if (!dateString) return '—'
        return new Date(dateString).toLocaleString('uz-UZ', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    return (
        <Card
            bg={bg}
            borderWidth="1px"
            borderColor={borderColor}
            borderRadius="lg"
            boxShadow="md"
            _hover={{ boxShadow: 'lg', borderColor: 'blue.300' }}
            transition="all 0.2s"
        >
            <CardBody>
                <VStack align="stretch" spacing={3}>
                    <Flex justify="space-between" align="center">
                        <HStack spacing={2}>
                            <Icon as={FileText} color="blue.500" boxSize={5} />
                            <Text fontWeight="bold" fontSize="lg">
                                Buyurtma #{offer.id.slice(0, 8)}
                            </Text>
                        </HStack>
                        <Badge
                            colorScheme={getStatusColor(offer.status)}
                            px={3}
                            py={1}
                            borderRadius="full"
                            fontSize="sm"
                        >
                            {getStatusText(offer.status)}
                        </Badge>
                    </Flex>

                    <Divider />

                    <Grid templateColumns="repeat(2, 1fr)" gap={4}>
                        <HStack spacing={2}>
                            <Icon as={Calendar} color="gray.500" boxSize={4} />
                            <Box>
                                <Text fontSize="sm" color="gray.500">Yetkazib berish sanasi</Text>
                                <Text fontWeight="medium">{formatDate(offer.date)}</Text>
                            </Box>
                        </HStack>

                        <HStack spacing={2}>
                            <Icon as={Truck} color="gray.500" boxSize={4} />
                            <Box>
                                <Text fontSize="sm" color="gray.500">Logist</Text>
                                <Text fontWeight="medium">
                                    {offer.is_logist ? 'Kerak' : 'Kerak emas'}
                                </Text>
                            </Box>
                        </HStack>
                    </Grid>

                    {offer.offer_items && offer.offer_items.length > 0 && (
                        <Box>
                            <Text fontSize="sm" color="gray.500" mb={2}>Tovarlar:</Text>
                            <VStack align="stretch" spacing={2}>
                                {offer.offer_items.map((item) => (
                                    <Flex
                                        key={item.id}
                                        p={2}
                                        bg={useColorModeValue("gray.50", "gray.700")}
                                        borderRadius="md"
                                        justify="space-between"
                                        align="center"
                                    >
                                        <Text fontWeight="medium" fontSize="sm">
                                            {item.product_name}
                                        </Text>
                                        <Badge colorScheme="blue">
                                            {item.quantity} {item.unit || 'dona'}
                                        </Badge>
                                    </Flex>
                                ))}
                            </VStack>
                        </Box>
                    )}

                    {offer.note && (
                        <HStack spacing={2} align="start">
                            <Icon as={AlertCircle} color="gray.500" boxSize={4} />
                            <Box>
                                <Text fontSize="sm" color="gray.500">Izoh:</Text>
                                <Text fontSize="sm">{offer.note}</Text>
                            </Box>
                        </HStack>
                    )}

                    {offer.contract_number && (
                        <HStack spacing={2}>
                            <Icon as={FileText} color="gray.500" boxSize={4} />
                            <Box>
                                <Text fontSize="sm" color="gray.500">Shartnoma:</Text>
                                <Text fontWeight="medium">{offer.contract_number}</Text>
                            </Box>
                        </HStack>
                    )}

                    <HStack spacing={2} justify="flex-end">
                        <Icon as={Clock} color="gray.400" boxSize={3} />
                        <Text fontSize="xs" color="gray.400">
                            Yaratilgan: {formatDate(offer.createdAt)}
                        </Text>
                    </HStack>
                </VStack>
            </CardBody>
        </Card>
    )
}

function EmptyState() {
    return (
        <Center py={10}>
            <VStack spacing={4}>
                <Box
                    p={4}
                    bg="gray.100"
                    borderRadius="full"
                    _dark={{ bg: "gray.700" }}
                >
                    <Package size={40} color="#A0AEC0" />
                </Box>
                <Heading size="md" color="gray.500">Buyurtmalar mavjud emas</Heading>
                <Text color="gray.400" textAlign="center">
                    Bu mijozda hali buyurtmalar yo'q.<br />
                    Yuqoridagi tugma orqali birinchi buyurtmani yarating
                </Text>
            </VStack>
        </Center>
    )
}

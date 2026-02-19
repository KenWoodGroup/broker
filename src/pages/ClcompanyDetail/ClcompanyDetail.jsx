import { useEffect, useState } from "react"
import { apiLocations } from "../../utils/Controllers/Locations"
import { useParams } from "react-router"

import {
    Box,
    Card,
    CardBody,
    CardHeader,
    Heading,
    Text,
    Badge,
    Spinner,
    Center,
    Flex,
    Divider,
    Grid,
    Stack,
    useColorModeValue,
    Button,
    VStack,
    Icon,
    HStack
} from "@chakra-ui/react"

import {
    Building2,
    MapPin,
    Phone,
    Wallet,
    Calendar,
    RefreshCcw,
    Globe,
    Package,
    Truck,
    FileText,
    Clock,
    AlertCircle
} from "lucide-react"
import { NavLink } from "react-router-dom"
import { apiOffers } from "../../utils/Controllers/Offers"

export default function ClcompanyDetail() {
    const { id } = useParams()
    const [data, setData] = useState(null)
    const [offers, setOffers] = useState({ records: [] })
    const [loading, setLoading] = useState(true)
    const [offersLoading, setOffersLoading] = useState(true)

    const bg = useColorModeValue("white", "gray.800")
    const headerBg = useColorModeValue("gray.50", "gray.700")
    const cardHoverBg = useColorModeValue("gray.50", "gray.700")

    const GetLocation = async () => {
        try {
            const response = await apiLocations.getLocation(id)
            setData(response.data)
        } catch (error) {
            console.log(error)
        }
    }

    const GetOffers = async () => {
        setOffersLoading(true)
        try {
            const params = {
                page: 1,
                location_id: id
            }
            const response = await apiOffers.getOffersByLocationId(params)
            setOffers(response.data?.data)
        } catch (error) {
            console.log(error)
        } finally {
            setOffersLoading(false)
        }
    }

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true)
            await Promise.all([GetLocation(), GetOffers()])
            setLoading(false)
        }

        fetchData()
    }, [id])

    if (loading) {
        return (
            <Center h="80vh">
                <VStack spacing={4}>
                    <Spinner size="xl" thickness="4px" color="blue.500" />
                    <Text color="gray.500">Ma'lumotlar yuklanmoqda...</Text>
                </VStack>
            </Center>
        )
    }

    return (
        <Box py={'20px'} pr={'10px'}>
            <Card
                mx="auto"
                bg={bg}
                borderRadius="2xl"
                boxShadow="xl"
                overflow="hidden"
                mb={8}
            >
                {/* Sarlavha qismi */}
                <CardHeader bg={headerBg} py={6}>
                    <Flex justify="space-between" align="center">
                        <Flex align="center" gap={4}>
                            <Box color="blue.500">
                                <Building2 size={28} />
                            </Box>

                            <Box>
                                <Heading size="lg">{data?.name}</Heading>
                                <Badge
                                    mt={2}
                                    colorScheme={data?.type === "company" ? "blue" : "green"}
                                    px={3}
                                    py={1}
                                    borderRadius="full"
                                >
                                    {data?.type === "company" ? "KOMPANIYA" : "SHAXS"}
                                </Badge>
                            </Box>
                        </Flex>
                    </Flex>
                </CardHeader>

                <CardBody>
                    <Grid
                        templateColumns={{ base: "1fr", md: "1fr 1fr" }}
                        gap={6}
                    >
                        <InfoItem
                            icon={<MapPin size={20} />}
                            label="Manzil"
                            value={data?.address}
                        />

                        <InfoItem
                            icon={<Phone size={20} />}
                            label="Telefon"
                            value={data?.phone}
                        />

                        <InfoItem
                            icon={<Wallet size={20} />}
                            label="Balans"
                            value={`${data?.balance} UZS`}
                            bold
                        />

                        <InfoItem
                            icon={<Globe size={20} />}
                            label="Koordinatalar"
                            value={data?.lat && data?.lng ? `${data?.lat}, ${data?.lng}` : "—"}
                        />

                        <InfoItem
                            icon={<Calendar size={20} />}
                            label="Yaratilgan"
                            value={data?.createdAt ? new Date(data.createdAt).toLocaleString('uz-UZ') : "—"}
                        />

                        <InfoItem
                            icon={<RefreshCcw size={20} />}
                            label="Yangilangan"
                            value={data?.updatedAt ? new Date(data.updatedAt).toLocaleString('uz-UZ') : "—"}
                        />
                    </Grid>
                </CardBody>
            </Card>

            {/* Buyurtmalar bo'limi sarlavhasi */}
            <Flex justify="space-between" align="center" mb={6}>
                <Flex align="center" gap={3}>
                    <Package size={24} color="#3182CE" />
                    <Heading size="lg">Buyurtmalar</Heading>
                    {!offersLoading && offers?.records && (
                        <Badge colorScheme="blue" borderRadius="full" px={3} py={1}>
                            {offers.records.length}
                        </Badge>
                    )}
                </Flex>

                <NavLink to={`/call-operator/offer/create/${id}`}>
                    <Button
                        colorScheme="blue"
                        leftIcon={<FileText size={18} />}
                        size="md"
                    >
                        Buyurtma yaratish
                    </Button>
                </NavLink>
            </Flex>

            {/* Buyurtmalar ro'yxati */}
            {offersLoading ? (
                <Center py={10}>
                    <VStack spacing={4}>
                        <Spinner size="xl" thickness="4px" color="blue.500" />
                        <Text color="gray.500">Buyurtmalar yuklanmoqda...</Text>
                    </VStack>
                </Center>
            ) : offers?.records?.length > 0 ? (
                <VStack spacing={4} align="stretch">
                    {offers.records.map((offer) => (
                        <OfferCard key={offer.id} offer={offer} />
                    ))}
                </VStack>
            ) : (
                <EmptyState />
            )}
        </Box>
    )
}

/* Buyurtma kartochkasi komponenti */
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
                    {/* Yuqori qism: ID va status */}
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

                    {/* Sana va logist */}
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

                    {/* Tovarlar */}
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

                    {/* Izoh */}
                    {offer.note && (
                        <HStack spacing={2} align="start">
                            <Icon as={AlertCircle} color="gray.500" boxSize={4} />
                            <Box>
                                <Text fontSize="sm" color="gray.500">Izoh:</Text>
                                <Text fontSize="sm">{offer.note}</Text>
                            </Box>
                        </HStack>
                    )}

                    {/* Shartnoma raqami */}
                    {offer.contract_number && (
                        <HStack spacing={2}>
                            <Icon as={FileText} color="gray.500" boxSize={4} />
                            <Box>
                                <Text fontSize="sm" color="gray.500">Shartnoma:</Text>
                                <Text fontWeight="medium">{offer.contract_number}</Text>
                            </Box>
                        </HStack>
                    )}

                    {/* Yaratilgan vaqti */}
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

/* Bo'sh holat komponenti */
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

/* Ma'lumot elementi */
function InfoItem({ icon, label, value, bold }) {
    return (
        <Flex align="center" gap={4}>
            <Box
                p={2}
                borderRadius="lg"
                bg="gray.100"
                _dark={{ bg: "gray.600" }}
            >
                {icon}
            </Box>

            <Box>
                <Text fontSize="sm" color="gray.500">
                    {label}
                </Text>
                <Text fontWeight={bold ? "bold" : "medium"}>
                    {value || "—"}
                </Text>
            </Box>
        </Flex>
    )
}
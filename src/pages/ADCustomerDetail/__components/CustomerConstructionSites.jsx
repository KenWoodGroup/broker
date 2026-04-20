import {
    Badge,
    Box,
    Button,
    Card,
    CardBody,
    CardFooter,
    CardHeader,
    Center,
    Divider,
    Flex,
    Heading,
    HStack,
    IconButton,
    SimpleGrid,
    Spinner,
    Tag,
    Text,
    VStack,
    Wrap,
} from "@chakra-ui/react"
import { Calendar, Clock, DollarSign, Edit, Hash, List, MapPin, Trash2, User } from "lucide-react"
import { useEffect, useState } from "react"
import { apiLots } from "../../../utils/Controllers/Lots"
import LotCreateForCustomer from "./LotCreateForCustomer"

export default function CustomerConstructionSites({ customerId, role }) {
    const [lots, setLots] = useState([])
    const [loading, setLoading] = useState(true)
    const [selectedLot, setSelectedLot] = useState(null)
    const [lotToDelete, setLotToDelete] = useState(null)

    const fetchLots = async () => {
        setLoading(true)
        try {
            const response = await apiLots.GetLotsByParent(customerId, 1)
            const records = response?.data?.data?.records || response?.data?.data || []
            setLots(records)
        } catch (error) {
            console.error("Error fetching lots:", error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (customerId) fetchLots()
    }, [customerId])

    const handleAdd = () => {
        setSelectedLot(null)
    }

    const handleEdit = (lot) => {
        setSelectedLot(lot)
    }

    const handleDeleteClick = (lot) => {
        setLotToDelete(lot)
    }

    const formatDate = (isoString) => {
        if (!isoString) return "—"
        const date = new Date(isoString)
        return date.toLocaleDateString("uz-UZ", { year: "numeric", month: "long", day: "numeric" })
    }

    const formatAmount = (amount) => {
        if (!amount) return "—"
        const num = Number(amount)
        return new Intl.NumberFormat("uz-UZ", {
            style: "currency",
            currency: "UZS",
            minimumFractionDigits: 0,
        }).format(num)
    }

    return (
        <Box>
            <Flex justify="space-between" align="center" mb={6}>
                <HStack spacing={3}>
                    <List size={24} color="#3182CE" />
                    <Heading size="lg">Loyiha-lotlar</Heading>
                    {!loading && (
                        <Badge colorScheme="blue" borderRadius="full" px={3} py={1}>
                            {lots.length}
                        </Badge>
                    )}
                </HStack>
                <LotCreateForCustomer customerId={customerId} onSuccess={fetchLots} />
            </Flex>

            {loading ? (
                <Center py={10}>
                    <Spinner size="xl" color="blue.500" thickness="4px" />
                </Center>
            ) : lots.length > 0 ? (
                <VStack spacing={6} align="stretch">
                    {lots.map((lot) => (
                        <Card
                            key={lot.id}
                            variant="outline"
                            borderRadius="2xl"
                            boxShadow="lg"
                            _hover={{ boxShadow: "xl" }}
                            transition="all 0.2s"
                        >
                            <CardHeader pb={0}>
                                <Flex justify="space-between" align="start">
                                    <Box>
                                        <Heading size="md">{lot.lot_name || lot.name || "—"}</Heading>
                                        {lot.lot_number && (
                                            <HStack spacing={1} mt={1}>
                                                <Hash size={14} color="gray" />
                                                <Text fontSize="sm" color="gray.500">
                                                    Lot raqami: {lot.lot_number}
                                                </Text>
                                            </HStack>
                                        )}
                                    </Box>
                                    <Badge
                                        colorScheme={lot.is_active ? "green" : "gray"}
                                        fontSize="sm"
                                        px={3}
                                        py={1}
                                        borderRadius="full"
                                    >
                                        {lot.is_active ? "Faol" : "Tugagan"}
                                    </Badge>
                                </Flex>
                            </CardHeader>

                            <CardBody>
                                <VStack spacing={4} align="stretch">
                                    <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                                        <HStack spacing={3} align="start">
                                            <MapPin size={18} color="#3182CE" />
                                            <Box>
                                                <Text fontSize="xs" color="gray.500">
                                                    Manzil
                                                </Text>
                                                <Text fontWeight="medium">{lot.address || "—"}</Text>
                                            </Box>
                                        </HStack>

                                        <HStack spacing={3} align="start">
                                            <DollarSign size={18} color="#3182CE" />
                                            <Box>
                                                <Text fontSize="xs" color="gray.500">
                                                    Summa
                                                </Text>
                                                <Text fontWeight="bold" fontSize="lg" color="green.600">
                                                    {formatAmount(lot.amount)}
                                                </Text>
                                            </Box>
                                        </HStack>

                                        <HStack spacing={3} align="start">
                                            <Calendar size={18} color="#3182CE" />
                                            <Box>
                                                <Text fontSize="xs" color="gray.500">
                                                    Muddat
                                                </Text>
                                                <Text>
                                                    {formatDate(lot.start_date)} – {formatDate(lot.end_date)}
                                                </Text>
                                            </Box>
                                        </HStack>

                                        <HStack spacing={3} align="start">
                                            <Clock size={18} color="#3182CE" />
                                            <Box>
                                                <Text fontSize="xs" color="gray.500">
                                                    Turi / Kategoriya
                                                </Text>
                                                <Wrap spacing={2}>
                                                    <Tag size="sm" colorScheme="purple">
                                                        {lot.type || "Noma'lum"}
                                                    </Tag>
                                                    <Tag size="sm" colorScheme="cyan">
                                                        {lot.category || "Noma'lum"}
                                                    </Tag>
                                                </Wrap>
                                            </Box>
                                        </HStack>
                                    </SimpleGrid>

                                    <Divider />

                                    <Box>
                                        <HStack spacing={2} mb={2}>
                                            <User size={18} color="#3182CE" />
                                            <Heading size="sm">Pudratchi</Heading>
                                        </HStack>
                                        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={3} pl={6}>
                                            <Text fontSize="sm">
                                                <strong>Nomi:</strong> {lot.builder?.name || "—"}
                                            </Text>
                                            <Text fontSize="sm">
                                                <strong>Direktor:</strong> {lot.builder?.director_name || "—"}
                                            </Text>
                                            <Text fontSize="sm">
                                                <strong>Manzil:</strong> {lot.builder?.address || "—"}
                                            </Text>
                                            <Text fontSize="sm">
                                                <strong>Telefon:</strong> {lot.builder?.phone || "—"}
                                            </Text>
                                            <Text fontSize="sm">
                                                <strong>INN:</strong> {lot.builder?.inn || "—"}
                                            </Text>
                                            <Text fontSize="sm">
                                                <strong>Holat:</strong>
                                                <Badge
                                                    ml={2}
                                                    colorScheme={lot.builder?.is_active === "pending" ? "yellow" : "green"}
                                                >
                                                    {lot.builder?.is_active === "pending" ? "Kutilmoqda" : "Faol"}
                                                </Badge>
                                            </Text>
                                        </SimpleGrid>
                                    </Box>
                                </VStack>
                            </CardBody>

                            {role === "Admin" && (
                                <CardFooter justify="flex-end" pt={0}>
                                    <HStack spacing={3}>
                                        <IconButton
                                            icon={<Edit size={18} />}
                                            aria-label="Edit"
                                            variant="outline"
                                            colorScheme="blue"
                                            onClick={() => handleEdit(lot)}
                                        />
                                        <IconButton
                                            icon={<Trash2 size={18} />}
                                            aria-label="Delete"
                                            variant="outline"
                                            colorScheme="red"
                                            onClick={() => handleDeleteClick(lot)}
                                        />
                                    </HStack>
                                </CardFooter>
                            )}
                        </Card>
                    ))}
                </VStack>
            ) : (
                <Center
                    py={10}
                    bg="gray.50"
                    borderRadius="xl"
                    border="2px dashed"
                    borderColor="gray.200"
                    _dark={{ bg: "gray.800", borderColor: "gray.700" }}
                >
                    <Box textAlign="center">
                        <Text color="gray.500" mb={2}>
                            Lotlar mavjud emas
                        </Text>
                        <Button size="sm" variant="link" colorScheme="blue" onClick={handleAdd}>
                            Birinchi lotni qo'shing
                        </Button>
                    </Box>
                </Center>
            )}
        </Box>
    )
}


import { useEffect, useState } from "react"
import { apiLocations } from "../../utils/Controllers/Locations"
import { useNavigate, useParams } from "react-router"

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
    Grid,
    useColorModeValue,
    VStack,
    HStack,
    Tabs,
    TabList,
    TabPanels,
    Tab,
    TabPanel,
    Button,
    IconButton,
    Tooltip,
    useDisclosure
} from "@chakra-ui/react"

import {
    Building2,
    MapPin,
    Phone,
    Package,
    FileText,
    LocateIcon,
    Info,
    ArrowLeft,
    Edit2,
    Users // Added Users icon
} from "lucide-react"
import { apiOffers } from "../../utils/Controllers/Offers"
import ConstructionSites from "./__components/ConstructionSites"
import CompanyNoteCard from "./__components/CompanyNoteCard"
import CompanyOrders from "./__components/CompanyOrders"
import CompanyInfo from "./__components/CompanyInfo"
import LocationEditModal from "./__components/LocationEditModal"
import CompanyUsers from "./__components/CompanyUsers" // Added CompanyUsers component

export default function ClcompanyDetail({ role }) {
    const { id } = useParams()
    const navigate = useNavigate()
    const editModal = useDisclosure()
    const [data, setData] = useState(null)
    const [offers, setOffers] = useState({ records: [] })
    const [loading, setLoading] = useState(true)
    const [offersLoading, setOffersLoading] = useState(true)

    const bg = useColorModeValue("white", "gray.800")
    const headerBg = useColorModeValue("gray.50", "gray.700")

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
                <CardHeader bg={headerBg} py={4} px={6}>
                    <Flex width="100%" justify="space-between" align="center">
                        <HStack spacing={4} align="center">
                            <Tooltip label="Orqaga" hasArrow>
                                <IconButton
                                    aria-label="Orqaga"
                                    icon={<ArrowLeft size={20} />}
                                    variant="ghost"
                                    onClick={() => navigate(-1)}
                                    borderRadius="full"
                                    size="sm"
                                    colorScheme="blue"
                                    _hover={{
                                        bg: useColorModeValue("blue.50", "blue.900"),
                                        transform: "translateX(-2px)"
                                    }}
                                    transition="all 0.2s"
                                />
                            </Tooltip>

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
                        </HStack>

                        <Tooltip label="Tahrirlash">
                            <IconButton
                                icon={<Edit2 size={16} />}
                                size="sm"
                                variant="ghost"
                                colorScheme="blue"
                                onClick={editModal.onOpen}
                                aria-label="Tahrirlash"
                            />
                        </Tooltip>
                    </Flex>
                </CardHeader>
            </Card>
            {/* Tablar bo'limi */}
            <Tabs colorScheme="blue" variant="enclosed">
                <TabList mb={4}>
                    <Tab fontWeight="bold">
                        <HStack spacing={2}>
                            <Info size={18} />
                            <Text>Batafsil</Text>
                        </HStack>
                    </Tab>
                    <Tab fontWeight="bold">
                        <HStack spacing={2}>
                            <Package size={18} />
                            <Text>Buyurtmalar</Text>
                            {!offersLoading && offers?.records && (
                                <Badge colorScheme="blue" borderRadius="full">
                                    {offers.records.length}
                                </Badge>
                            )}
                        </HStack>
                    </Tab>
                    <Tab fontWeight="bold">
                        <HStack spacing={2}>
                            <MapPin size={18} />
                            <Text>Obyektlar</Text>
                        </HStack>
                    </Tab>
                    {/* New Tab for Users */}
                    <Tab fontWeight="bold">
                        <HStack spacing={2}>
                            <Users size={18} />
                            <Text>Foydalanuvchilar</Text>
                        </HStack>
                    </Tab>
                    <Tab fontWeight="bold">
                        <HStack spacing={2}>
                            <FileText size={18} />
                            <Text>Izoh</Text>
                        </HStack>
                    </Tab>
                </TabList>
                <TabPanels>
                    <TabPanel p={0} pt={4}>
                        <CompanyInfo data={data} onSuccess={GetLocation} />
                    </TabPanel>

                    <TabPanel p={0} pt={4}>
                        <CompanyOrders
                            offers={offers}
                            loading={offersLoading}
                            id={id}
                            role={role}
                        />
                    </TabPanel>

                    <TabPanel p={0} pt={4}>
                        <ConstructionSites role={role} companyId={id} />
                    </TabPanel>

                    <TabPanel p={0} pt={4}>
                        <CompanyUsers locationId={id} />
                    </TabPanel>

                    <TabPanel p={0} pt={4}>
                        <CompanyNoteCard locationId={id} />
                    </TabPanel>
                </TabPanels>
            </Tabs>

            {/* Edit Modal */}
            {data && (
                <LocationEditModal
                    isOpen={editModal.isOpen}
                    onClose={editModal.onClose}
                    data={data}
                    onSuccess={GetLocation}
                />
            )}
        </Box>
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
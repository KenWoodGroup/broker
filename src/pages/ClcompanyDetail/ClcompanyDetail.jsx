import { useEffect, useState } from "react"
import { apiLocations } from "../../utils/Controllers/Locations"
import { useNavigate, useParams } from "react-router"

import {
    Box,
    Card,
    CardHeader,
    Heading,
    Text,
    Badge,
    Spinner,
    Center,
    Flex,
    useColorModeValue,
    VStack,
    HStack,
    Tabs,
    TabList,
    TabPanels,
    Tab,
    TabPanel,
    IconButton,
    Tooltip,
    useDisclosure
} from "@chakra-ui/react"

import {
    Building2,
    Package,
    FileText,
    Info,
    ArrowLeft,
    Edit2,
    Users,
    MapPin,
    Star
} from "lucide-react"

import ConstructionSites from "./__components/ConstructionSites"
import CompanyNoteCard from "./__components/CompanyNoteCard"
import CompanyOrders from "./__components/CompanyOrders"
import CompanyInfo from "./__components/CompanyInfo"
import LocationEditModal from "./__components/LocationEditModal"
import CompanyUsers from "./__components/CompanyUsers"
import RatingEditModal from "./__components/RatingEditModal"
import LocationContact from "./__components/LocationContact/LocationContact"

export default function ClcompanyDetail({ role }) {
    const { id } = useParams()
    const navigate = useNavigate()
    const editModal = useDisclosure()
    const ratingModal = useDisclosure()

    const [data, setData] = useState(null)
    const [loading, setLoading] = useState(true)

    const bg = useColorModeValue("white", "gray.800")
    const headerBg = useColorModeValue("gray.50", "gray.700")
    const ratingBg = useColorModeValue("whiteAlpha.700", "whiteAlpha.200")

    const isAdmin = role === "Admin"

    const GetLocation = async () => {
        setLoading(true)
        try {
            const response = await apiLocations.getLocation(id)
            setData(response.data)
        }  finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        GetLocation()
    }, [id])

    // 🔥 единый массив табов
    const tabs = [
        {
            label: "Batafsil",
            icon: <Info size={18} />,
            component: (
                <CompanyInfo
                    data={data}
                    onSuccess={GetLocation}
                    canEdit={isAdmin}
                    onOpenLocationEdit={editModal.onOpen}
                />
            )
        },
        ...(isAdmin
            ? [
                {
                    label: "Foydalanuvchilar",
                    icon: <Users size={18} />,
                    component: <CompanyUsers locationId={id} />
                }
            ]
            : []),
        {
            label: "Kontraktlar",
            icon: <Users size={18} />,
            component: <LocationContact id={id} role={role} />
        },
        {
            label: "Buyurtmalar",
            icon: <Package size={18} />,
            component: <CompanyOrders id={id} role={role} />
        },
        {
            label: "Obyektlar",
            icon: <MapPin size={18} />,
            component: (
                <ConstructionSites data={data} role={role} companyId={id} />
            )
        },
        {
            label: "Izoh",
            icon: <FileText size={18} />,
            component: <CompanyNoteCard locationId={id} />
        }
    ]

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
        <Box py="20px" pr="10px">
            <Card
                mx="auto"
                bg={bg}
                borderRadius="2xl"
                boxShadow="xl"
                overflow="hidden"
                mb={8}
            >
                
                <CardHeader bg={headerBg} py={4} px={6}>
                    <Flex justify="space-between" align="center">
                        <HStack spacing={4}>
                            <Tooltip label="Orqaga">
                                <IconButton
                                    icon={<ArrowLeft size={20} />}
                                    onClick={() => navigate(-1)}
                                    variant="ghost"
                                />
                            </Tooltip>

                            <Flex align="center" gap={4}>
                                <Building2 size={28} color="#3B82F6" />

                                <Box>
                                    <Heading size="lg">
                                        {data?.name}
                                    </Heading>

                                    <HStack spacing={3} mt={2} flexWrap="wrap">
                                        <Badge
                                            colorScheme={
                                                data?.type === "company" ? "blue" : "green"
                                            }
                                        >
                                            {data?.type === "company" ? "KOMPANIYA" : "SHAXS"}
                                        </Badge>

                                        <HStack
                                            spacing={1.5}
                                            px={3}
                                            py={1}
                                            borderRadius="full"
                                            bg={ratingBg}
                                            borderWidth="1px"
                                            borderColor="whiteAlpha.300"
                                            cursor={isAdmin ? "pointer" : "default"}
                                            onClick={isAdmin ? ratingModal.onOpen : undefined}
                                        >
                                            <Star size={16} />
                                            <Text fontWeight="bold" fontSize="sm">
                                                {data?.rating ?? "0.00"}
                                            </Text>
                                        </HStack>

                                        <Badge
                                            colorScheme="purple"
                                            variant="subtle"
                                            borderRadius="full"
                                            px={3}
                                            py={1}
                                            fontSize="sm"
                                        >
                                            {data?.rating_grade ?? "Berilmagan"}
                                        </Badge>

                                    </HStack>
                                </Box>
                            </Flex>
                        </HStack>

                        {isAdmin && (
                            <HStack spacing={1}>
                                <Tooltip label="Ratingni tahrirlash">
                                    <IconButton
                                        icon={<Star size={16} />}
                                        onClick={ratingModal.onOpen}
                                        variant="ghost"
                                    />
                                </Tooltip>
                                <Tooltip label="Tahrirlash">
                                    <IconButton
                                        icon={<Edit2 size={16} />}
                                        onClick={editModal.onOpen}
                                        variant="ghost"
                                    />
                                </Tooltip>
                            </HStack>
                        )}
                    </Flex>
                </CardHeader>
            </Card>

            <Tabs variant="enclosed" colorScheme="blue">
                <TabList>
                    {tabs.map((tab, i) => (
                        <Tab key={i}>
                            <HStack>
                                {tab.icon}
                                <Text>{tab.label}</Text>
                            </HStack>
                        </Tab>
                    ))}
                </TabList>

                <TabPanels>
                    {tabs.map((tab, i) => (
                        <TabPanel key={i} p={0} pt={4}>
                            {tab.component}
                        </TabPanel>
                    ))}
                </TabPanels>
            </Tabs>

            {data && (
                <LocationEditModal
                    isOpen={editModal.isOpen}
                    onClose={editModal.onClose}
                    data={data}
                    onSuccess={GetLocation}
                />
            )}

            {data?.id && (
                <RatingEditModal
                    isOpen={ratingModal.isOpen}
                    onClose={ratingModal.onClose}
                    locationId={data.id}
                    initialRating={data?.rating}
                    initialGrade={data?.rating_grade}
                    onUpdated={GetLocation}
                />
            )}
        </Box>
    )
}
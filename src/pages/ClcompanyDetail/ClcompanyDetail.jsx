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
    MapPin
} from "lucide-react"

import ConstructionSites from "./__components/ConstructionSites"
import CompanyNoteCard from "./__components/CompanyNoteCard"
import CompanyOrders from "./__components/CompanyOrders"
import CompanyInfo from "./__components/CompanyInfo"
import LocationEditModal from "./__components/LocationEditModal"
import CompanyUsers from "./__components/CompanyUsers"

export default function ClcompanyDetail({ role }) {
    const { id } = useParams()
    const navigate = useNavigate()
    const editModal = useDisclosure()

    const [data, setData] = useState(null)
    const [loading, setLoading] = useState(true)

    const bg = useColorModeValue("white", "gray.800")
    const headerBg = useColorModeValue("gray.50", "gray.700")

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
            component: <CompanyInfo role={role} data={data} onSuccess={GetLocation} />
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
            label: "Buyurtmalar",
            icon: <Package size={18} />,
            component: <CompanyOrders id={id} role={role} />
        },
        {
            label: "Obyektlar",
            icon: <MapPin size={18} />,
            component: (
                <ConstructionSites role={role} companyId={id} />
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

                                    <Badge
                                        mt={2}
                                        colorScheme={
                                            data?.type === "company"
                                                ? "blue"
                                                : "green"
                                        }
                                    >
                                        {data?.type === "company"
                                            ? "KOMPANIYA"
                                            : "SHAXS"}
                                    </Badge>
                                </Box>
                            </Flex>
                        </HStack>

                        {isAdmin && (
                            <Tooltip label="Tahrirlash">
                                <IconButton
                                    icon={<Edit2 size={16} />}
                                    onClick={editModal.onOpen}
                                    variant="ghost"
                                />
                            </Tooltip>
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
        </Box>
    )
}
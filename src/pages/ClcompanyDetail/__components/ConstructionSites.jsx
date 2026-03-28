import {
    Box,
    Button,
    Flex,
    Heading,
    Table,
    Tbody,
    Td,
    Th,
    Thead,
    Tr,
    IconButton,
    useDisclosure,
    Spinner,
    Center,
    Text,
    Badge,
    HStack,
} from "@chakra-ui/react"
import { Edit, Trash2, Plus, Building } from "lucide-react"
import { useEffect, useState } from "react"
import { apiLocations } from "../../../utils/Controllers/Locations"
import SiteFormModal from "./SiteFormModal"
import DeleteSiteModal from "./DeleteSiteModal"

export default function ConstructionSites({ companyId, role }) {
    const [sites, setSites] = useState([])
    const [loading, setLoading] = useState(true)
    const [selectedSite, setSelectedSite] = useState(null)
    const { isOpen, onOpen, onClose } = useDisclosure()

    // Delete modal state
    const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure()
    const [siteToDelete, setSiteToDelete] = useState(null)

    const fetchSites = async () => {
        setLoading(true)
        try {
            const response = await apiLocations.GetLocationsByParent(companyId)
            // Filter only construction sites if needed, or show all under this parent
            setSites(response.data || [])
        } catch (error) {
            console.error("Error fetching sites:", error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (companyId) {
            fetchSites()
        }
    }, [companyId])

    const handleAdd = () => {
        setSelectedSite(null)
        onOpen()
    }

    const handleEdit = (site) => {
        setSelectedSite(site)
        onOpen()
    }

    const handleDeleteClick = (site) => {
        setSiteToDelete(site)
        onDeleteOpen()
    }

    return (
        <Box mt={8}>
            <Flex justify="space-between" align="center" mb={6}>
                <HStack spacing={3}>
                    <Building size={24} color="#3182CE" />
                    <Heading size="lg">Obyektlar</Heading>
                    {!loading && (
                        <Badge colorScheme="blue" borderRadius="full" px={3} py={1}>
                            {sites.length}
                        </Badge>
                    )}
                </HStack>
                <Button
                    leftIcon={<Plus size={18} />}
                    colorScheme="blue"
                    onClick={handleAdd}
                    borderRadius="lg"
                >
                    Obyekt qo'shish
                </Button>
            </Flex>

            {loading ? (
                <Center py={10}>
                    <Spinner size="xl" color="blue.500" thickness="4px" />
                </Center>
            ) : sites.length > 0 ? (
                <Box overflowX="auto" bg="white" borderRadius="xl" boxShadow="sm" border="1px solid" borderColor="gray.100" _dark={{ bg: "gray.800", borderColor: "gray.700" }}>
                    <Table variant="simple">
                        <Thead bg="gray.50" _dark={{ bg: "gray.700" }}>
                            <Tr>
                                <Th>Nomi</Th>
                                <Th>Telefon</Th>
                                <Th>Manzil</Th>
                                {role === "Admin" && (
                                    <Th textAlign="right">Amallar</Th>
                                )}
                            </Tr>
                        </Thead>
                        <Tbody>
                            {sites.map((site) => (
                                <Tr key={site.id} _hover={{ bg: "gray.50" }} _dark={{ _hover: { bg: "gray" } }} transition="background 0.2s">
                                    <Td fontWeight="medium">{site.name}</Td>
                                    <Td>{site.phone || "—"}</Td>
                                    <Td>{site.address || "—"}</Td>

                                    {role === "Admin" && (
                                        <Td textAlign="right">
                                            <HStack justify="flex-end" spacing={2}>
                                                <IconButton
                                                    icon={<Edit size={16} />}
                                                    aria-label="Edit"
                                                    size="sm"
                                                    variant="ghost"
                                                    colorScheme="blue"
                                                    onClick={() => handleEdit(site)}
                                                />
                                                <IconButton
                                                    icon={<Trash2 size={16} />}
                                                    aria-label="Delete"
                                                    size="sm"
                                                    variant="ghost"
                                                    colorScheme="red"
                                                    onClick={() => handleDeleteClick(site)}
                                                />
                                            </HStack>
                                        </Td>
                                    )}
                                </Tr>
                            ))}
                        </Tbody>
                    </Table>
                </Box>
            ) : (
                <Center py={10} bg="gray.50" borderRadius="xl" border="2px dashed" borderColor="gray.200" _dark={{ bg: "gray.800", borderColor: "gray.700" }}>
                    <Box textAlign="center">
                        <Text color="gray.500" mb={2}>Obyektlar mavjud emas</Text>
                        <Button size="sm" variant="link" colorScheme="blue" onClick={handleAdd}>
                            Birinchi obyektni qo'shing
                        </Button>
                    </Box>
                </Center>
            )}

            <SiteFormModal
                isOpen={isOpen}
                onClose={onClose}
                companyId={companyId}
                site={selectedSite}
                onSuccess={fetchSites}
            />

            <DeleteSiteModal
                isOpen={isDeleteOpen}
                onClose={onDeleteClose}
                site={siteToDelete}
                onSuccess={fetchSites}
            />
        </Box>
    )
}

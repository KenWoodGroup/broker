import { useState, useEffect } from "react"
import {
    Box,
    Button,
    Flex,
    Heading,
    Table,
    Thead,
    Tbody,
    Tr,
    Th,
    Td,
    IconButton,
    useDisclosure,
    useToast,
    Spinner,
    Center,
    Badge,
    HStack,
    Text,
    useColorModeValue
} from "@chakra-ui/react"
import { Plus, Edit2, Trash2, Users } from "lucide-react"
import { apiLocationUsers } from "../../../utils/Controllers/apiLocationUsers"
import UserFormModal from "./UserFormModal"
import DeleteUserAlert from "./DeleteUserAlert"
import { useRef } from "react"
import LoginPermissionSwitch from "./LoginPermissionSwitch"

export default function CompanyUsers({ locationId }) {
    const [users, setUsers] = useState([])
    const [loading, setLoading] = useState(true)
    const [selectedUser, setSelectedUser] = useState(null)
    const [userToDelete, setUserToDelete] = useState(null)

    const formModal = useDisclosure()
    const deleteAlert = useDisclosure()
    const toast = useToast()

    // Dark Mode Colors
    const cardBg = useColorModeValue("white", "whiteAlpha.100")
    const borderColor = useColorModeValue("gray.200", "whiteAlpha.300")
    const headerBg = useColorModeValue("gray.50", "whiteAlpha.200")
    const hoverBg = useColorModeValue("gray.50", "whiteAlpha.200")
    const emptyBg = useColorModeValue("gray.50", "whiteAlpha.100")
    const textColor = useColorModeValue("gray.800", "white")
    const mutedTextColor = useColorModeValue("gray.500", "gray.400")

    const fetchUsers = async () => {
        try {
            setLoading(true)
            const response = await apiLocationUsers.getAll(locationId)
            setUsers(response.data || [])
        } catch (error) {
            console.error("Error fetching users:", error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (locationId) fetchUsers()
    }, [locationId])

    const handleCreate = () => {
        setSelectedUser(null)
        formModal.onOpen()
    }

    const handleEdit = (user) => {
        setSelectedUser(user)
        formModal.onOpen()
    }

    const handleDeleteClick = (user) => {
        setUserToDelete(user)
        deleteAlert.onOpen()
    }

    return (
        <Box py={4}>
            <Flex justify="space-between" align="center" mb={6}>
                <HStack>
                    <Users size={24} color="#3182CE" />
                    <Heading size="md" color="blue.500">Tashkilot foydalanuvchilari</Heading>
                </HStack>
                <Button
                    leftIcon={<Plus size={18} />}
                    colorScheme="blue"
                    onClick={handleCreate}
                >
                    Yaratish
                </Button>
            </Flex>

            {loading ? (
                <Center py={10}>
                    <Spinner size="xl" color="blue.500" />
                </Center>
            ) : users.length === 0 ? (
                <Center py={10} bg={emptyBg} borderRadius="lg" borderWidth="1px" borderColor={borderColor} borderStyle="dashed">
                    <Text color={mutedTextColor}>Hozircha foydalanuvchilar yo'q</Text>
                </Center>
            ) : (
                <Box overflowX="auto" borderWidth="1px" borderColor={borderColor} borderRadius="lg" bg={cardBg}>
                    <Table variant="simple">
                        <Thead bg={headerBg}>
                            <Tr>
                                <Th color={mutedTextColor}>To'liq ism</Th>
                                <Th color={mutedTextColor}>Login (Username)</Th>
                                <Th color={mutedTextColor}>Rol</Th>
                                <Th color={mutedTextColor} textAlign="right">Harakatlar</Th>
                            </Tr>
                        </Thead>
                        <Tbody>
                            {users.map(user => (
                                <Tr key={user.id} _hover={{ bg: hoverBg }} color={textColor}>
                                    <Td fontWeight="medium">{user.full_name}</Td>
                                    <Td>{user.username}</Td>
                                    <Td>
                                        <Badge colorScheme={user.role === 'company' ? 'blue' : 'gray'}>
                                            {user.role}
                                        </Badge>
                                    </Td>
                                    <Td textAlign="right">
                                        <HStack justify="flex-end" spacing={2}>
                                            <LoginPermissionSwitch userId={user.id} initialValue={user.is_login} />
                                            <IconButton
                                                icon={<Edit2 size={16} />}
                                                size="sm"
                                                variant="ghost"
                                                colorScheme="blue"
                                                aria-label="Tahrirlash"
                                                onClick={() => handleEdit(user)}
                                            />
                                            <IconButton
                                                icon={<Trash2 size={16} />}
                                                size="sm"
                                                variant="ghost"
                                                colorScheme="red"
                                                aria-label="O'chirish"
                                                onClick={() => handleDeleteClick(user)}
                                            />
                                        </HStack>
                                    </Td>
                                </Tr>
                            ))}
                        </Tbody>
                    </Table>
                </Box>
            )}

            {/* Form Modal */}
            <UserFormModal
                isOpen={formModal.isOpen}
                onClose={formModal.onClose}
                data={selectedUser}
                locationId={locationId}
                onSuccess={fetchUsers}
            />

            {/* Delete Confirmation */}
            <DeleteUserAlert
                isOpen={deleteAlert.isOpen}
                onClose={deleteAlert.onClose}
                user={userToDelete}
                onSuccess={fetchUsers}
            />
        </Box>
    )
}

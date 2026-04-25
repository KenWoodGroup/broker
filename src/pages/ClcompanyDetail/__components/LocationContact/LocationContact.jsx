import {
    Box,
    Flex,
    Heading,
    Table,
    Thead,
    Tbody,
    Tr,
    Th,
    Td,
    TableContainer,
    Text,
    Spinner,
    Button,
    IconButton,
} from "@chakra-ui/react"
import { EditIcon, DeleteIcon } from "@chakra-ui/icons"
import { useState, useEffect, useCallback } from "react"
import { useParams } from "react-router"
import Create from "./__components/Create"
import Edit from "./__components/Edit"
import Delete from "./__components/Delete"
import { apiLocationContact } from "../../../../utils/Controllers/apiLocationContact"

export default function LocationContact() {
    const { id } = useParams()
    const [contacts, setContacts] = useState([])
    const [loading, setLoading] = useState(false)
    const [pagination, setPagination] = useState({
        total: 0,
        page: 1,
        limit: 20,
        totalPages: 1,
    })
    const [currentPage, setCurrentPage] = useState(1)

    // Выбранный контакт для модалок
    const [selectedContact, setSelectedContact] = useState(null)
    const [isEditModalOpen, setIsEditModalOpen] = useState(false)
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)

    const fetchContacts = useCallback(async (page = 1) => {
        if (!id) return
        setLoading(true)
        try {
            const response = await apiLocationContact.GetAll(id, page)
            setContacts(response.data.data)
            setPagination(response.data.meta)
            setCurrentPage(page)
        } catch (error) {
            console.error(error)
        } finally {
            setLoading(false)
        }
    }, [id])

    useEffect(() => {
        fetchContacts(1)
    }, [fetchContacts])

    const refreshList = () => fetchContacts(currentPage)

    const handleEdit = (contact) => {
        setSelectedContact(contact)
        setIsEditModalOpen(true)
    }

    const handleDelete = (contact) => {
        setSelectedContact(contact)
        setIsDeleteModalOpen(true)
    }

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= pagination.totalPages) {
            fetchContacts(newPage)
        }
    }

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString("uz-UZ", {
            year: "numeric",
            month: "long",
            day: "numeric",
        })
    }

    return (
        <Box >
            <Flex justifyContent="space-between" alignItems="center" mb={6}>
                <Heading size="lg">Kontaktlar</Heading>
                <Create onSuccess={refreshList} />
            </Flex>

            {loading ? (
                <Flex justify="center" py={10}>
                    <Spinner size="xl" />
                </Flex>
            ) : contacts.length === 0 ? (
                <Box textAlign="center" py={10} borderWidth="1px" borderRadius="lg">
                    <Text fontSize="lg" color="gray.500">
                        Hech qanday kontakt topilmadi
                    </Text>
                </Box>
            ) : (
                <>
                    <TableContainer borderWidth="1px" borderRadius="lg" overflowX="auto">
                        <Table variant="simple">
                            <Thead>
                                <Tr>
                                    <Th>№</Th>
                                    <Th>Lavozim</Th>
                                    <Th>Ism</Th>
                                    <Th>Telefon 1</Th>
                                    <Th>Telefon 2</Th>
                                    <Th>Yaratilgan vaqt</Th>
                                    <Th>Amallar</Th>
                                </Tr>
                            </Thead>
                            <Tbody>
                                {contacts.map((contact, index) => (
                                    <Tr key={contact.id}>
                                        <Td>{(currentPage - 1) * pagination.limit + index + 1}</Td>
                                        <Td>{contact.role}</Td>
                                        <Td fontWeight="medium">{contact.name}</Td>
                                        <Td>{contact.phone_one}</Td>
                                        <Td>{contact.phone_two || "—"}</Td>
                                        <Td>{formatDate(contact.createdAt)}</Td>
                                        <Td>
                                            <IconButton
                                                icon={<EditIcon />}
                                                colorScheme="blue"
                                                size="sm"
                                                aria-label="Tahrirlash"
                                                onClick={() => handleEdit(contact)}
                                                mr={2}
                                            />
                                            <IconButton
                                                icon={<DeleteIcon />}
                                                colorScheme="red"
                                                size="sm"
                                                aria-label="O'chirish"
                                                onClick={() => handleDelete(contact)}
                                            />
                                        </Td>
                                    </Tr>
                                ))}
                            </Tbody>
                        </Table>
                    </TableContainer>

                    {pagination.totalPages > 1 && (
                        <Flex justifyContent="center" mt={6} gap={2}>
                            <Button
                                size="sm"
                                onClick={() => handlePageChange(currentPage - 1)}
                                isDisabled={currentPage === 1}
                            >
                                Oldingi
                            </Button>
                            <Text px={3} py={1}>
                                {currentPage} / {pagination.totalPages}
                            </Text>
                            <Button
                                size="sm"
                                onClick={() => handlePageChange(currentPage + 1)}
                                isDisabled={currentPage === pagination.totalPages}
                            >
                                Keyingi
                            </Button>
                        </Flex>
                    )}
                </>
            )}

            {/* Модалка редактирования */}
            <Edit
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                contact={selectedContact}
                onSuccess={refreshList}
            />

            {/* Модалка удаления */}
            <Delete
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                contact={selectedContact}
                onSuccess={refreshList}
            />
        </Box>
    )
}
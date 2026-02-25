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
    Button,
    Text,
    Spinner,
    HStack
} from "@chakra-ui/react"
import CreateOperators from "./__components/CreateOperators"
import { apiUsers } from "../../utils/Controllers/Users"
import { useEffect, useState } from "react"
import DeleteOperator from "./__components/DeleteOperator"
import EditOperators from "./__components/EditOperators"

export default function ADOperators() {
    const [operators, setOperators] = useState([])
    const [pagination, setPagination] = useState(null)
    const [page, setPage] = useState(1)
    const [loading, setLoading] = useState(false)

    const getAllOperators = async (pageNumber = 1) => {
        try {
            setLoading(true)
            const response = await apiUsers.getOperator(pageNumber)

            setOperators(response.data.data?.records)
            setPagination(response.data.data?.pagination)
        } catch (error) {
            console.log(error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        getAllOperators(page)
    }, [page])
    return (
        <Box py="20px" pr="20px">
            <Flex justifyContent="space-between" mb="20px">
                <Heading size="lg">Operatorlar</Heading>
                <CreateOperators refresh={() => getAllOperators(page)} />
            </Flex>

            {loading ? (
                <Flex justify="center" py="50px">
                    <Spinner size="xl" />
                </Flex>
            ) : operators?.length === 0 ? (
                <Flex
                    justify="center"
                    align="center"
                    direction="column"
                    py="80px"
                    borderWidth="1px"
                    borderRadius="lg"
                >
                    <Text fontSize="lg" fontWeight="semibold" color="gray.500">
                        Ma'lumot yo‘q
                    </Text>
                    <Text fontSize="sm" color="gray.400">
                        Hozircha operatorlar mavjud emas
                    </Text>
                </Flex>
            ) : (
                <>
                    <TableContainer
                        borderWidth="1px"
                        borderRadius="lg"
                        boxShadow="md"
                    >
                        <Table variant="simple">
                            <Thead>
                                <Tr>
                                    <Th>#</Th>
                                    <Th>To'liq ism</Th>
                                    <Th>Username</Th>
                                    <Th>Yaratilgan sana</Th>
                                    <Th></Th>
                                </Tr>
                            </Thead>
                            <Tbody>
                                {operators.map((item, index) => (
                                    <Tr key={item.id}>
                                        <Td>
                                            {(page - 1) * 10 + index + 1}
                                        </Td>
                                        <Td>{item.full_name}</Td>
                                        <Td>{item.username}</Td>

                                        <Td>
                                            {new Date(item.createdAt).toLocaleDateString()}
                                        </Td>
                                        <Td>
                                            <Flex gap="10px">
                                                <DeleteOperator
                                                    id={item?.id}
                                                    refresh={() => getAllOperators(page)}
                                                />
                                                <EditOperators data={item} refresh={() => getAllOperators(page)} />
                                            </Flex>
                                        </Td>
                                    </Tr>
                                ))}
                            </Tbody>
                        </Table>
                    </TableContainer>

                    {pagination && (
                        <Flex
                            mt="20px"
                            justifyContent="space-between"
                            alignItems="center"
                        >
                            <Text fontSize="sm">
                                Jami: {pagination.total_count}
                            </Text>

                            <HStack>
                                <Button
                                    size="sm"
                                    onClick={() => setPage((prev) => prev - 1)}
                                    isDisabled={page === 1}
                                >
                                    Oldingi
                                </Button>

                                <Text fontWeight="bold">
                                    {pagination.currentPage} / {pagination.total_pages}
                                </Text>

                                <Button
                                    size="sm"
                                    onClick={() => setPage((prev) => prev + 1)}
                                    isDisabled={page === pagination.total_pages}
                                >
                                    Keyingi
                                </Button>
                            </HStack>
                        </Flex>
                    )}
                </>
            )}

        </Box>
    )
}

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
    HStack,
    Badge,
    Input,
    InputGroup,
    InputLeftElement,
    IconButton,
    Tooltip
} from "@chakra-ui/react"
import { Search, Upload } from "lucide-react"
import CreateCompany from "./__components/CreateCompany"
import { apiLocations } from "../../utils/Controllers/Locations"
import { useEffect, useState, useRef } from "react"
import { useNavigate } from "react-router"
import CreateCompanyByExcell from "./__components/CreateCompanyByExcell"

export default function Clcompany({ role }) {
    const [companies, setCompanies] = useState([])
    const [pagination, setPagination] = useState(null)
    const [page, setPage] = useState(1)
    const [loading, setLoading] = useState(false)
    const [searchValue, setSearchValue] = useState("") // input value
    const [search, setSearch] = useState("all") // value для API
    const debounceRef = useRef(null)
    const navigate = useNavigate()

    const GetCompany = async (pageNumber = 1, searchTerm = "all") => {
        try {
            setLoading(true)
            const response = await apiLocations.GetBySearchForOperator(pageNumber, searchTerm)
            setCompanies(response.data.data.records)
            setPagination(response.data.data.pagination)
        } catch (error) {
            console.log(error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        GetCompany(page, search)
    }, [page, search])

    // Обработчик изменения input search с debounce
    const handleSearchChange = (e) => {
        const value = e.target.value
        setSearchValue(value)
        setPage(1) // сбрасываем страницу на 1 при поиске

        if (debounceRef.current) clearTimeout(debounceRef.current)
        debounceRef.current = setTimeout(() => {
            setSearch(value.trim() === "" ? "all" : value.trim())
        }, 500)
    }

    return (
        <Box py="20px" pr="20px">

            <Flex justifyContent="space-between" mb="20px">
                <Heading size="lg">Kompaniyalar</Heading>
                <Flex gap={4}>
                    <CreateCompanyByExcell reload={GetCompany}/>
                    <CreateCompany refresh={() => GetCompany(page, search)} />
                </Flex>
            </Flex>

            {/* Search */}
            <Box mb="20px" maxW="400px">
                <InputGroup>
                    <InputLeftElement pointerEvents="none">
                        <Search />
                    </InputLeftElement>
                    <Input
                        placeholder="Search by name or type..."
                        value={searchValue}
                        onChange={handleSearchChange}
                    />
                </InputGroup>
            </Box>

            {/* Loading */}
            {loading ? (
                <Flex justify="center" py="80px">
                    <Spinner size="xl" />
                </Flex>
            ) : companies?.length === 0 ? (
                /* No Data */
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
                        Hozircha kompaniyalar mavjud emas
                    </Text>
                </Flex>
            ) : (
                <>
                    <TableContainer
                        borderWidth="1px"
                        borderRadius="lg"
                        boxShadow="sm"
                    >
                        <Table variant="simple">
                            <Thead>
                                <Tr>
                                    <Th>#</Th>
                                    <Th>Nomi</Th>
                                    <Th>Turi</Th>
                                    <Th>Manzil</Th>
                                    <Th>Telefon</Th>
                                    <Th>Balans</Th>
                                    <Th>Yaratilgan</Th>
                                </Tr>
                            </Thead>

                            <Tbody>
                                {companies.map((item, index) => (
                                    <Tr cursor={role === 'Admin' ? 'default' : 'pointer'} key={item.id} onClick={() => {
                                        if (role !== 'Admin') {
                                            navigate(`/call-operator/company/${item?.id}`)
                                        }
                                    }}>
                                        <Td>{(page - 1) * 10 + index + 1}</Td>
                                        <Td fontWeight="medium">{item.name}</Td>
                                        <Td>
                                            <Badge
                                                colorScheme={
                                                    item.type === "company"
                                                        ? "blue"
                                                        : item.type === "builder"
                                                            ? "green"
                                                            : "purple"
                                                }
                                                textTransform="capitalize"
                                            >
                                                {item.type}
                                            </Badge>
                                        </Td>
                                        <Td maxW="250px">
                                            <Text noOfLines={1}>{item.address}</Text>
                                        </Td>
                                        <Td>{item.phone}</Td>
                                        <Td fontWeight="semibold">{Number(item.balance).toLocaleString()} so'm</Td>
                                        <Td>{new Date(item.createdAt).toLocaleDateString()}</Td>
                                    </Tr>
                                ))}
                            </Tbody>
                        </Table>
                    </TableContainer>

                    {/* Pagination */}
                    {pagination && (
                        <Flex mt="20px" justifyContent="space-between" alignItems="center">
                            <Text fontSize="sm">Jami: {pagination.total_count}</Text>

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

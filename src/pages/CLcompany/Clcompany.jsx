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
    Select,
} from "@chakra-ui/react"
import { Search, Upload } from "lucide-react"
import CreateCompany from "./__components/CreateCompany"
import { apiLocations } from "../../utils/Controllers/Locations"
import { useEffect, useState, useRef } from "react"
import { useNavigate } from "react-router"
import CreateCompanyByExcell from "./__components/CreateCompanyByExcell"
import DeleteCompany from "./__components/DeleteCompany"

const REGIONS = [
    { id: 2, name: "Andijon viloyati" },
    { id: 3, name: "Buxoro viloyati" },
    { id: 4, name: "Jizzax viloyati" },
    { id: 5, name: "Qashqadaryo viloyati" },
    { id: 6, name: "Navoiy viloyati" },
    { id: 7, name: "Namangan viloyati" },
    { id: 8, name: "Samarqand viloyati" },
    { id: 10, name: "Sirdaryo viloyati" },
    { id: 5723, name: "Surxondaryo viloyati" },
    { id: 11, name: "Toshkent shahri" },
    { id: 12, name: "Toshkent viloyati" },
    { id: 13, name: "Farg'ona viloyati" },
    { id: 14, name: "Xorazm viloyati" },
    { id: 15, name: "Qoraqalpog'iston Respublikasi" },
]

const ACTIVE_TYPES = [
    { value: "pending", label: "Kutilmoqda", color: "yellow" },
    { value: "active", label: "Aktiv", color: "green" },
    { value: "delete", label: "O'chirilgan", color: "red" },
]

export default function Clcompany({ role }) {
    const [companies, setCompanies] = useState([])
    const [pagination, setPagination] = useState(null)
    const [page, setPage] = useState(1)
    const [loading, setLoading] = useState(false)
    const [searchValue, setSearchValue] = useState("")
    const [search, setSearch] = useState("all")
    const [selectedRegion, setSelectedRegion] = useState("all")
    const [selectedActiveType, setSelectedActiveType] = useState("all")
    const debounceRef = useRef(null)
    const navigate = useNavigate()

    const GetCompany = async (pageNumber = 1, searchTerm = "all", region = "all", activeType = "all") => {
        try {
            setLoading(true)
            let response;
            
            // Для не-Admin всегда показываем только pending
            const effectiveActiveType = role !== 'Admin' ? 'pending' : activeType;
            
            response = await apiLocations.FilterCompany(region, searchTerm, effectiveActiveType, pageNumber)
            setCompanies(response.data.data.records)
            setPagination(response.data.data.pagination)
        } catch (error) {
            console.log(error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        GetCompany(page, search, selectedRegion, selectedActiveType)
    }, [page, search, selectedRegion, selectedActiveType, role])

    // Обработчик изменения input search с debounce
    const handleSearchChange = (e) => {
        const value = e.target.value
        setSearchValue(value)
        setPage(1)

        if (debounceRef.current) clearTimeout(debounceRef.current)
        debounceRef.current = setTimeout(() => {
            setSearch(value.trim() === "" ? "all" : value.trim())
        }, 500)
    }

    // Функция для получения цвета бейджа статуса
    const getStatusBadgeColor = (activeType) => {
        switch (activeType) {
            case 'pending':
                return 'yellow'
            case 'active':
                return 'green'
            case 'delete':
                return 'red'
            default:
                return 'gray'
        }
    }

    // Функция для получения текста статуса
    const getStatusText = (activeType) => {
        switch (activeType) {
            case 'pending':
                return 'Kutilmoqda'
            case 'active':
                return 'Aktiv'
            case 'delete':
                return "O'chirilgan"
            default:
                return activeType
        }
    }

    return (
        <Box py="20px" pr="20px">
            <Flex justifyContent="space-between" mb="20px">
                <Heading size="lg">Kompaniyalar</Heading>
                {role === 'Admin' && (
                    <Flex gap={4}>
                        <CreateCompanyByExcell reload={GetCompany} />
                        <CreateCompany refresh={() => GetCompany(page, search, selectedRegion, selectedActiveType)} />
                    </Flex>
                )}
            </Flex>

            {/* Filters */}
            <Flex mb="20px" gap={4} wrap="wrap">
                <Box flex="1" maxW="400px">
                    <InputGroup>
                        <InputLeftElement pointerEvents="none">
                            <Search size={18} color="gray" />
                        </InputLeftElement>
                        <Input
                            placeholder="Qidiruv..."
                            value={searchValue}
                            onChange={handleSearchChange}
                        />
                    </InputGroup>
                </Box>
                
                <Box w="300px">
                    <Select
                        placeholder="Hududni tanlang (Hammasi)"
                        value={selectedRegion}
                        onChange={(e) => {
                            setSelectedRegion(e.target.value)
                            setPage(1)
                        }}
                    >
                        {REGIONS.map((r) => (
                            <option key={r.id || r.name} value={r.name}>
                                {r.name}
                            </option>
                        ))}
                    </Select>
                </Box>

                {/* Active Type Filter - только для Admin */}
                {role === 'Admin' && (
                    <Box w="250px">
                        <Select
                            placeholder="Status"
                            value={selectedActiveType}
                            onChange={(e) => {
                                setSelectedActiveType(e.target.value)
                                setPage(1)
                            }}
                        >
                            {ACTIVE_TYPES.map((type) => (
                                <option key={type.value} value={type.value}>
                                    {type.label}
                                </option>
                            ))}
                        </Select>
                    </Box>
                )}
            </Flex>

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
                        {role !== 'Admin' 
                            ? "Hozircha kutilayotgan kompaniyalar mavjud emas"
                            : "Hozircha kompaniyalar mavjud emas"
                        }
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
                                    {role === 'Admin' && (
                                        <Th>Amallar</Th>
                                    )}
                                </Tr>
                            </Thead>

                            <Tbody>
                                {companies.map((item, index) => (
                                    <Tr 
                                        key={item.id}
                                        onClick={() => {
                                            if (role !== 'Admin') {
                                                navigate(`/call-operator/company/${item?.id}`)
                                            } else {
                                                navigate(`/company-detail/${item?.id}`)
                                            }
                                        }}
                                        sx={{
                                            cursor: 'pointer',
                                        }}
                                    >
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
                                        {role === 'Admin' && (
                                            <Td>
                                                <Flex align="center">
                                                    <DeleteCompany
                                                        companyId={item.id}
                                                        companyName={item.name}
                                                        refresh={() => GetCompany(page, search, selectedRegion, selectedActiveType)}
                                                    />
                                                </Flex>
                                            </Td>
                                        )}
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
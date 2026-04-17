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
import { Search } from "lucide-react"
import { useEffect, useState, useRef, useCallback } from "react"
import { useNavigate } from "react-router"
import { apiLocations } from "../../utils/Controllers/Locations"
import CreateCompany from "./__components/CreateCompany"
import CreateCompanyByExcell from "./__components/CreateCompanyByExcell"
import DeleteCompany from "./__components/DeleteCompany"
import StatusEdit from "./__components/StatusEdit"
import ContactPhone from "./__components/ContactPhone"

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

// Status types for all users
const STATUS_TYPES = [
    { value: "pending", label: "Kutilmoqda" },
    { value: "active", label: "Aktiv" },
]

const isAdmin = (role) => role === "Admin"

// Ключи для sessionStorage
const STORAGE_KEYS = {
    PAGE: "companies_page",
    SEARCH: "companies_search",
    SEARCH_INPUT: "companies_search_input",
    REGION: "companies_region",
    ACTIVE_TYPE: "companies_active_type"
}

export default function Clcompany({ role }) {
    const [companies, setCompanies] = useState([])
    const [pagination, setPagination] = useState(null)
    const [page, setPage] = useState(() => {
        const saved = sessionStorage.getItem(STORAGE_KEYS.PAGE)
        return saved ? parseInt(saved) : 1
    })
    const [loading, setLoading] = useState(false)

    // searchInput — только для отображения в поле ввода (не триггерит запрос)
    const [searchInput, setSearchInput] = useState(() => {
        const saved = sessionStorage.getItem(STORAGE_KEYS.SEARCH_INPUT)
        return saved || ""
    })
    // search — «зафиксированное» значение после debounce, триггерит запрос
    const [search, setSearch] = useState(() => {
        const saved = sessionStorage.getItem(STORAGE_KEYS.SEARCH)
        return saved || "all"
    })

    const [selectedRegion, setSelectedRegion] = useState(() => {
        const saved = sessionStorage.getItem(STORAGE_KEYS.REGION)
        return saved || "all"
    })

    // Admin can see all statuses, non-admin can only see pending and active
    const [selectedActiveType, setSelectedActiveType] = useState(() => {
        if (!isAdmin(role)) return "all"
        const saved = sessionStorage.getItem(STORAGE_KEYS.ACTIVE_TYPE)
        return saved || "all"
    })

    const debounceRef = useRef(null)
    const navigate = useNavigate()

    // Сохраняем фильтры в sessionStorage при их изменении
    useEffect(() => {
        sessionStorage.setItem(STORAGE_KEYS.PAGE, page.toString())
    }, [page])

    useEffect(() => {
        sessionStorage.setItem(STORAGE_KEYS.SEARCH, search)
    }, [search])

    useEffect(() => {
        sessionStorage.setItem(STORAGE_KEYS.SEARCH_INPUT, searchInput)
    }, [searchInput])

    useEffect(() => {
        sessionStorage.setItem(STORAGE_KEYS.REGION, selectedRegion)
    }, [selectedRegion])

    useEffect(() => {
        if (isAdmin(role)) {
            sessionStorage.setItem(STORAGE_KEYS.ACTIVE_TYPE, selectedActiveType)
        }
    }, [selectedActiveType, role])

    // ─── Запрос данных ───────────────────────────────────────────────────────
    const fetchCompanies = useCallback(
        async (pageNumber, searchTerm, region, activeType) => {
            try {
                setLoading(true)
                const response = await apiLocations.FilterCompany(
                    region,
                    searchTerm,
                    activeType,
                    pageNumber
                )
                setCompanies(response.data.data.records)
                setPagination(response.data.data.pagination)
            } catch (error) {
                console.error("Kompaniyalarni yuklashda xatolik:", error)
            } finally {
                setLoading(false)
            }
        },
        [] // зависимостей нет — функция стабильна
    )

    // При любом изменении фильтров / страницы — перезапрашиваем
    useEffect(() => {
        fetchCompanies(page, search, selectedRegion, selectedActiveType)
    }, [page, search, selectedRegion, selectedActiveType, fetchCompanies])

    // Cleanup debounce при анмаунте
    useEffect(() => {
        return () => {
            if (debounceRef.current) clearTimeout(debounceRef.current)
        }
    }, [])

    // ─── Обработчики ─────────────────────────────────────────────────────────
    const handleSearchChange = (e) => {
        const value = e.target.value
        setSearchInput(value)
        setPage(1)

        if (debounceRef.current) clearTimeout(debounceRef.current)
        debounceRef.current = setTimeout(() => {
            setSearch(value.trim() === "" ? "all" : value.trim())
        }, 500)
    }

    const handleRegionChange = (e) => {
        setSelectedRegion(e.target.value === "" ? "all" : e.target.value)
        setPage(1)
    }

    const handleActiveTypeChange = (e) => {
        setSelectedActiveType(e.target.value === "" ? "all" : e.target.value)
        setPage(1)
    }

    const handleRowClick = (item) => {
        const path = isAdmin(role)
            ? `/company-detail/${item.id}`
            : `/call-operator/company/${item.id}`
        navigate(path)
    }

    const refreshCurrent = () =>
        fetchCompanies(page, search, selectedRegion, selectedActiveType)

    // ─── Render ───────────────────────────────────────────────────────────────
    return (
        <Box py="20px" pr="20px">
            {/* Заголовок */}
            <Flex justifyContent="space-between" mb="20px">
                <Heading size="lg">Kompaniyalar</Heading>
                {isAdmin(role) && (
                    <Flex gap={4}>
                        <CreateCompanyByExcell reload={fetchCompanies} />
                        <CreateCompany refresh={refreshCurrent} />
                    </Flex>
                )}
            </Flex>

            {/* Фильтры */}
            <Flex mb="20px" gap={4} wrap="wrap">
                {/* Поиск */}
                <Flex flex="1" minW="200px" maxW="600px" gap={4} mr={8}>
                    <InputGroup>
                        <InputLeftElement pointerEvents="none">
                            <Search size={18} color="gray" />
                        </InputLeftElement>
                        <Input
                            placeholder="Qidiruv..."
                            value={searchInput}
                            onChange={handleSearchChange}
                        />
                    </InputGroup>
                    {/* Total count — always visible */}
                    <Flex align="center" gap={2}>
                        <Badge
                            colorScheme="blue"
                            px={3}
                            py={1}
                            borderRadius="full"
                            fontSize="sm"
                            fontWeight="semibold"
                        >
                            {loading ? (
                                <Flex align="center" gap={1}>
                                    <Spinner size="xs" /> <span>Yuklanmoqda...</span>
                                </Flex>
                            ) : (
                                `Jami: ${pagination?.total_count ?? "-"} ta quruvchi`
                            )}
                        </Badge>
                    </Flex>
                </Flex>

                {/* Регион */}
                <Box w="300px">
                    <Select
                        placeholder="Hudud (Hammasi)"
                        value={selectedRegion === "all" ? "" : selectedRegion}
                        onChange={handleRegionChange}
                    >
                        {REGIONS.map((r) => (
                            <option key={r.id} value={r.name}>
                                {r.name}
                            </option>
                        ))}
                    </Select>
                </Box>

                {/* Статус фильтр - всем доступен, но с разными опциями */}
                <Box w="220px">
                    <Select
                        placeholder="Status (Hammasi)"
                        value={selectedActiveType === "all" ? "" : selectedActiveType}
                        onChange={handleActiveTypeChange}
                    >
                        {isAdmin(role) ? (
                            // Admin sees all statuses including delete
                            ACTIVE_TYPES.map((type) => (
                                <option key={type.value} value={type.value}>
                                    {type.label}
                                </option>
                            ))
                        ) : (
                            // Non-admin sees only pending and active
                            STATUS_TYPES.map((type) => (
                                <option key={type.value} value={type.value}>
                                    {type.label}
                                </option>
                            ))
                        )}
                    </Select>
                </Box>
            </Flex>

            {/* Состояние загрузки */}
            {loading ? (
                <Flex justify="center" py="80px">
                    <Spinner size="xl" />
                </Flex>
            ) : companies.length === 0 ? (
                <Flex
                    justify="center"
                    align="center"
                    direction="column"
                    py="80px"
                    borderWidth="1px"
                    borderRadius="lg"
                >
                    <Text fontSize="lg" fontWeight="semibold" color="gray.500">
                        Ma'lumot yo'q
                    </Text>
                    <Text fontSize="sm" color="gray.400">
                        {isAdmin(role)
                            ? "Hozircha kompaniyalar mavjud emas"
                            : "Hozircha kutilayotgan kompaniyalar mavjud emas"}
                    </Text>
                </Flex>
            ) : (
                <>
                    <TableContainer borderWidth="1px" borderRadius="lg" boxShadow="sm">
                        <Table variant="simple">
                            <Thead>
                                <Tr>
                                    <Th>#</Th>
                                    <Th>Nomi</Th>
                                    <Th>Turi</Th>
                                    <Th>Manzil</Th>
                                    <Th>Status</Th>
                                    <Th></Th>
                                    <Th>Telefon</Th>
                                    {isAdmin(role) && <Th>Balans</Th>}
                                    <Th>Yaratilgan</Th>
                                    {isAdmin(role) && <Th>Amallar</Th>}
                                </Tr>
                            </Thead>
                            <Tbody>
                                {companies.map((item, index) => (
                                    <Tr
                                        key={item.id}
                                        onClick={() => handleRowClick(item)}
                                        cursor="pointer"
                                    >
                                        <Td>{(page - 1) * 10 + index + 1}</Td>

                                        <Td fontWeight="medium">{item.name}</Td>

                                        <Td>
                                            <Badge
                                                colorScheme={
                                                    item.type === "company" ? "blue"
                                                        : item.type === "builder" ? "green"
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

                                        {/* Status column - edit available for everyone */}
                                        <Td onClick={(e) => e.stopPropagation()}>
                                            <StatusEdit
                                                data={item}
                                                refresh={refreshCurrent}
                                            />
                                        </Td>


                                        <Td onClick={(e) => e.stopPropagation()}>
                                            <ContactPhone
                                                data={item}
                                                refresh={refreshCurrent}
                                            />
                                        </Td>

                                        <Td>{item.phone}</Td>

                                        {isAdmin(role) && (
                                            <Td fontWeight="semibold">
                                                {Number(item.balance).toLocaleString()} so'm
                                            </Td>
                                        )}

                                        <Td>
                                            {new Date(item.createdAt).toLocaleDateString("uz-UZ")}
                                        </Td>

                                        {isAdmin(role) && (
                                            <Td onClick={(e) => e.stopPropagation()}>
                                                <DeleteCompany
                                                    companyId={item.id}
                                                    companyName={item.name}
                                                    refresh={refreshCurrent}
                                                />
                                            </Td>
                                        )}
                                    </Tr>
                                ))}
                            </Tbody>
                        </Table>
                    </TableContainer>

                    {/* Пагинация */}
                    {pagination && (
                        <Flex mt="20px" justifyContent="space-between" alignItems="center">
                            <Text fontSize="sm" color="gray.600">
                                Jami: {pagination.total_count}
                            </Text>
                            <HStack>
                                <Button
                                    size="sm"
                                    onClick={() => setPage((p) => p - 1)}
                                    isDisabled={page === 1}
                                >
                                    Oldingi
                                </Button>
                                <Text fontWeight="bold" fontSize="sm">
                                    {pagination.currentPage} / {pagination.total_pages}
                                </Text>
                                <Button
                                    size="sm"
                                    onClick={() => setPage((p) => p + 1)}
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
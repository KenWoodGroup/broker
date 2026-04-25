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
import PaginationBar from "../../components/common/PaginationBar"

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

// Options for "hasLot" filter
const HAS_LOT_OPTIONS = [
    { value: "all", label: "Hammasi" },
    { value: "true", label: "Ob'ekti bor" },
    { value: "false", label: "Ob'ekti yo'q" },
]

const isAdmin = (role) => role === "Admin"

// Ключи для sessionStorage
const STORAGE_KEYS = {
    PAGE: "companies_page",
    SEARCH: "companies_search",
    SEARCH_INPUT: "companies_search_input",
    REGION: "companies_region",
    ACTIVE_TYPE: "companies_active_type",
    HAS_LOT: "companies_has_lot",
    SCROLL_Y: "companies_scroll_y",  // 👈 новый ключ для скролла
};



export default function Clcompany({ role }) {
    const [companies, setCompanies] = useState([])
    const [pagination, setPagination] = useState(null)
    const [page, setPage] = useState(() => {
        const saved = sessionStorage.getItem(STORAGE_KEYS.PAGE)
        return saved ? parseInt(saved) : 1
    })
    const [loading, setLoading] = useState(false)

    const [searchInput, setSearchInput] = useState(() => {
        const saved = sessionStorage.getItem(STORAGE_KEYS.SEARCH_INPUT)
        return saved || ""
    })
    const [search, setSearch] = useState(() => {
        const saved = sessionStorage.getItem(STORAGE_KEYS.SEARCH)
        return saved || "all"
    })

    const [selectedRegion, setSelectedRegion] = useState(() => {
        const saved = sessionStorage.getItem(STORAGE_KEYS.REGION)
        return saved || "all"
    })

    const [selectedActiveType, setSelectedActiveType] = useState(() => {
        if (!isAdmin(role)) return "all"
        const saved = sessionStorage.getItem(STORAGE_KEYS.ACTIVE_TYPE)
        return saved || "all"
    })

    const [hasLotFilter, setHasLotFilter] = useState(() => {
        const saved = sessionStorage.getItem(STORAGE_KEYS.HAS_LOT)
        return saved || "all"
    })

    const debounceRef = useRef(null)
    const scrollRef = useRef(null)          // 👈 ref на прокручиваемый контейнер
    const scrollRestoredRef = useRef(false) // 👈 флаг — восстановили ли уже скролл
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

    useEffect(() => {
        sessionStorage.setItem(STORAGE_KEYS.HAS_LOT, hasLotFilter)
    }, [hasLotFilter])

    // ─── Сохранение позиции скролла при уходе со страницы ───────────────────
    useEffect(() => {
        const container = scrollRef.current
        if (!container) return

        const handleScroll = () => {
            sessionStorage.setItem(STORAGE_KEYS.SCROLL_Y, container.scrollTop.toString())
        }

        container.addEventListener("scroll", handleScroll, { passive: true })
        return () => container.removeEventListener("scroll", handleScroll)
    }, [companies]) // переподписываемся после рендера списка

    // ─── Запрос данных ───────────────────────────────────────────────────────
    const fetchCompanies = useCallback(
        async (pageNumber, searchTerm, region, activeType, hasLot) => {
            try {
                setLoading(true)
                const response = await apiLocations.FilterCompany(
                    region,
                    searchTerm,
                    activeType,
                    hasLot,
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
        []
    )

    // При любом изменении фильтров / страницы — перезапрашиваем
    useEffect(() => {
        fetchCompanies(page, search, selectedRegion, selectedActiveType, hasLotFilter)
    }, [page, search, selectedRegion, selectedActiveType, hasLotFilter, fetchCompanies])

    // ─── Восстановление скролла после загрузки данных ────────────────────────
    useEffect(() => {
        // Восстанавливаем только один раз при первом рендере со списком
        if (loading || companies.length === 0 || scrollRestoredRef.current) return

        const savedY = sessionStorage.getItem(STORAGE_KEYS.SCROLL_Y)
        if (savedY && scrollRef.current) {
            // Небольшая задержка, чтобы DOM успел отрисоваться
            const timer = setTimeout(() => {
                scrollRef.current?.scrollTo({ top: parseInt(savedY), behavior: "instant" })
                scrollRestoredRef.current = true
            }, 50)
            return () => clearTimeout(timer)
        }
    }, [loading, companies])

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
        // При новом поиске сбрасываем сохранённый скролл
        sessionStorage.removeItem(STORAGE_KEYS.SCROLL_Y)
        scrollRestoredRef.current = false

        if (debounceRef.current) clearTimeout(debounceRef.current)
        debounceRef.current = setTimeout(() => {
            setSearch(value.trim() === "" ? "all" : value.trim())
        }, 500)
    }

    const handleRegionChange = (e) => {
        setSelectedRegion(e.target.value === "" ? "all" : e.target.value)
        setPage(1)
        sessionStorage.removeItem(STORAGE_KEYS.SCROLL_Y)
        scrollRestoredRef.current = false
    }

    const handleActiveTypeChange = (e) => {
        setSelectedActiveType(e.target.value === "" ? "all" : e.target.value)
        setPage(1)
        sessionStorage.removeItem(STORAGE_KEYS.SCROLL_Y)
        scrollRestoredRef.current = false
    }

    const handleHasLotChange = (e) => {
        setHasLotFilter(e.target.value === "" ? "all" : e.target.value)
        setPage(1)
        sessionStorage.removeItem(STORAGE_KEYS.SCROLL_Y)
        scrollRestoredRef.current = false
    }

    const handleRowClick = (item) => {
        // Скролл уже сохранён через listener, просто переходим
        const path = isAdmin(role)
            ? `/company-detail/${item.id}`
            : `/call-operator/company/${item.id}`
        navigate(path)
    }

    const refreshCurrent = () =>
        fetchCompanies(page, search, selectedRegion, selectedActiveType, hasLotFilter)


    // ─── Render ───────────────────────────────────────────────────────────────
    return (
        // 👇 Оборачиваем в прокручиваемый контейнер с ref
        <Box
            ref={scrollRef}
            py="20px"
            pr="20px"
            pl="10px"
            h="100vh"
            overflowY="auto"
        >
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
            <Box mb="20px">
    {/* 1-qator: Search + Badge */}
    <Flex gap={4} mb={3}>
        <InputGroup maxW="400px">
            <InputLeftElement pointerEvents="none">
                <Search size={18} color="gray" />
            </InputLeftElement>
            <Input
                placeholder="Qidiruv..."
                value={searchInput}
                onChange={handleSearchChange}
            />
        </InputGroup>

        <Flex align="center">
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

    {/* 2-qator: 3 ta Select */}
    <Flex gap={4} wrap="wrap">
        {/* Hudud */}
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

        {/* Status */}
        <Box w="220px">
            <Select
                placeholder="Status (Hammasi)"
                value={selectedActiveType === "all" ? "" : selectedActiveType}
                onChange={handleActiveTypeChange}
            >
                {isAdmin(role) ? (
                    ACTIVE_TYPES.map((type) => (
                        <option key={type.value} value={type.value}>
                            {type.label}
                        </option>
                    ))
                ) : (
                    STATUS_TYPES.map((type) => (
                        <option key={type.value} value={type.value}>
                            {type.label}
                        </option>
                    ))
                )}
            </Select>
        </Box>

        {/* Ob'ekt */}
        <Box w="220px">
            <Select
                placeholder="Ob'ekt (Hammasi)"
                value={hasLotFilter === "all" ? "" : hasLotFilter}
                onChange={handleHasLotChange}
            >
                {HAS_LOT_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                        {opt.label}
                    </option>
                ))}
            </Select>
        </Box>
    </Flex>
</Box>
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
                                    <Th>Reyting</Th>
                                    <Th>Nomi</Th>
                                    <Th>Manzil</Th>
                                    <Th>Status</Th>
                                    <Th></Th>
                                    <Th>Telefon</Th>
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
                                        <Td>{(page - 1) * 50 + index + 1}</Td>
                                        <Td >
                                            <Flex align="center" gap={1}>
                                                <Text
                                                fontWeight={'bold'}
                                                    style={{
                                                        color:
                                                            +item.rating >= 65
                                                                ? "oklch(72.3% .219 149.579)"
                                                                : +item.rating >= 35
                                                                    ? "oklch(79.5% .184 86.047)"
                                                                    : +item.rating >= 20
                                                                        ? "oklch(70.5% .213 47.604)"
                                                                        : "oklch(63.7% .237 25.331)",
                                                    }}
                                                >
                                                    {item.rating_grade ?? "!"}
                                                </Text>
                                                <Text >
                                                    ({item.rating ?? "?"})
                                                </Text>
                                            </Flex>
                                        </Td>

                                        <Td fontWeight="medium" maxW={'600px'}>
                                            <Text whiteSpace={'normal'}>{item.name}</Text>
                                        </Td>

                                        <Td maxW="250px">
                                            <Text noOfLines={1}>{item.address}</Text>
                                        </Td>

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
                        <PaginationBar
                            mt={5}
                            page={pagination.currentPage ?? page}
                            totalPages={pagination.total_pages ?? 1}
                            loading={loading}
                            onPageChange={(p) => setPage(p)}
                        />
                    )}
                </>
            )}
        </Box>
    )
}
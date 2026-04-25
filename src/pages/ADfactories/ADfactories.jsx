import {
    Box,
    SimpleGrid,
    Flex,
    Button,
    Input,
    InputGroup,
    InputRightElement,
    IconButton,
    Select,
    Badge,
    Text,
    Spinner,
    Checkbox,
    Wrap,
    WrapItem,
    Tag,
    TagLabel,
    TagCloseButton,
    Divider,
} from "@chakra-ui/react";
import React, { useEffect, useState, useCallback, useRef } from "react";
import { Search, X, Plus, ChevronDown } from "lucide-react";
import FactoryCard from "./_components/FactoryCard";
import FactoryCardSkeleton from "./_components/FactoryCardSkeleton";
import FactoriesHeader from "./_components/FactoriesHeader";
import { apiCategories } from "../../utils/Controllers/Categories"; // adjust path if needed
import { $api, BASE_URL } from "../../utils/api/axios";             // adjust path if needed
import regions from "../../constants/regions/regions.json";
import districts from "../../constants/regions/districts.json";
import { apiLocations } from "../../utils/Controllers/Locations";
import PaginationBar from "../../components/common/PaginationBar";

/* ─────────────────────────────────────────────────────────────────────────────
   Constants
───────────────────────────────────────────────────────────────────────────── */
const FACTORY_PAGE_KEY = "factories_page";
const SEARCH_DEBOUNCE = 500;
const CAT_DEBOUNCE = 400;

/* ─────────────────────────────────────────────────────────────────────────────
   API helper  (new endpoint: GET /api/erp/filter/page)
   params: searchTerm, page, addresses[] (strings), category_ids[] (UUIDs)
───────────────────────────────────────────────────────────────────────────── */
async function apiFetchFilteredFactories(page, searchTerm, addresses, categoryIds, selectedPriceFreshness) {
    const params = new URLSearchParams();
    params.append("page", page);
    params.append("searchTerm", searchTerm  "");
    params.append("price", selectedPriceFreshness  "all");
    addresses.forEach((addr) => params.append("addresses", addr));
    categoryIds.forEach((id) => params.append("category_ids", id));

    return apiLocations.pageAllFilteredFarctories(params);
    // return $api.get(${BASE_URL}/api/erp/filter/page?${params.toString()});
}

/* ─────────────────────────────────────────────────────────────────────────────
   CategoryDropdown  – searchable, debounced, paginated, multi-select
───────────────────────────────────────────────────────────────────────────── */
function CategoryDropdown({ selectedCategories, onChange }) {
    const [isOpen, setIsOpen] = useState(false);
    const [searchText, setSearchText] = useState("");
    const [debSearch, setDebSearch] = useState("");
    const [categories, setCategories] = useState([]);
    const [catPage, setCatPage] = useState(1);
    const [catTotalPages, setCatTotalPages] = useState(1);
    const [catLoading, setCatLoading] = useState(false);

    const wrapRef = useRef(null);
    const searchRef = useRef(null);
    const isMounted = useRef(true);

    useEffect(() => () => { isMounted.current = false; }, []);

    /* debounce category search */
    useEffect(() => {
        const t = setTimeout(() => {
            setDebSearch(searchText);
            setCatPage(1);
            setCategories([]);
        }, CAT_DEBOUNCE);
        return () => clearTimeout(t);
    }, [searchText]);

    /* fetch categories */
    const loadCategories = useCallback(async (pg, q) => {
        setCatLoading(true);
        try {
            const res = await apiCategories.pageAll(pg, q);
            const body = res.data; // { records: [...], pagination: {...} }
            if (!isMounted.current) return;
            setCatTotalPages(body.pagination?.total_pages ?? 1);
            setCategories((prev) =>
                pg === 1 ? (body.records ?? []) : [...prev, ...(body.records ?? [])]
            );
        } catch (e) {
            console.error("Category fetch error:", e);
        } finally {
            if (isMounted.current) setCatLoading(false);
            // setCatLoading(false);
        }
    }, []);
  useEffect(() => {
        if (isOpen) loadCategories(catPage, debSearch);
    }, [isOpen, debSearch, catPage, loadCategories]);

    /* close on outside click */
    useEffect(() => {
        const handler = (e) => {
            if (wrapRef.current && !wrapRef.current.contains(e.target)) setIsOpen(false);
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    /* focus search input when opens */
    useEffect(() => {
        if (isOpen) setTimeout(() => searchRef.current?.focus(), 60);
    }, [isOpen]);

    const isChecked = (id) => selectedCategories.some((c) => c.id === id);

    const toggle = (cat) => {
        const next = isChecked(cat.id)
            ? selectedCategories.filter((c) => c.id !== cat.id)
            : [...selectedCategories, { id: cat.id, name: cat.name }];
        onChange(next);
    };

    const btnLabel =
        selectedCategories.length > 0
            ? ${selectedCategories.length} ta kategoriya
            : "Kategoriya tanlash";

    return (
        <Box position="relative" ref={wrapRef} minW="220px">
            {/* Trigger button */}
            <Button
                variant="outline"
                w="100%"
                justifyContent="space-between"
                fontWeight="normal"
                colorScheme={selectedCategories.length > 0 ? "blue" : "gray"}
                rightIcon={<ChevronDown size={14} />}
                onClick={() => setIsOpen((o) => !o)}
            >
                <Text isTruncated maxW="170px" fontSize="sm" textAlign="left">
                    {btnLabel}
                </Text>
            </Button>

            {/* Dropdown panel */}
            {isOpen && (
                <Box
                    position="absolute"
                    top="calc(100% + 6px)"
                    left={0}
                    zIndex={300}
                    w="310px"
                    bg="surface"
                    boxShadow="xl"
                    borderRadius="lg"
                    border="1px solid"
                    borderColor="gray.200"
                    overflow="hidden"
                >
                    {/* Search bar */}
                    <Box p={2} borderBottom="1px solid" borderColor="gray.100">
                        <InputGroup size="sm">
                            <Input
                                ref={searchRef}
                                placeholder="Kategoriya qidirish..."
                                value={searchText}
                                onChange={(e) => setSearchText(e.target.value)}
                                borderRadius="md"
                            />
                            {searchText && (
                                <InputRightElement>
                                    <IconButton
                                        size="xs"
                                        variant="ghost"
                                        aria-label="clear"
                                        icon={<X size={12} />}
                                        onClick={() => setSearchText("")}
                                    />
                                </InputRightElement>
                            )}
                        </InputGroup>
                    </Box>

                    {/* List */}
                    <Box maxH="260px" overflowY="auto">
                        {categories.length === 0 && !catLoading && (
                            <Text p={4} fontSize="sm" color="gray.400" textAlign="center">
                                Kategoriya topilmadi
                            </Text>
                  {categories.map((cat) => (
                            <Flex
                                key={cat.id}
                                px={3}
                                py="9px"
                                align="center"
                                gap={2}
                                cursor="pointer"
                                bg={isChecked(cat.id) ? "surface" : "bg"}
                                _hover={{ bg: isChecked(cat.id) ? "bg" : "surface" }}
                                onClick={() => toggle(cat)}
                                transition="background 0.1s"
                            >
                                <Checkbox
                                    isChecked={isChecked(cat.id)}
                                    colorScheme="blue"
                                    size="sm"
                                    onChange={() => toggle(cat)}
                                    onClick={(e) => e.stopPropagation()}
                                />
                                <Text fontSize="sm" flex={1} noOfLines={1}>
                                    {cat.name}
                                </Text>
                                <Badge
                                    colorScheme={+cat.location_count > 0 ? "blue" : "gray"}
                                    fontSize="xs"
                                    borderRadius="full"
                                    px={2}
                                >
                                    {cat.location_count}
                                </Badge>
                            </Flex>
                        ))}

                        {catLoading && (
                            <Flex justify="center" py={3}>
                                <Spinner size="sm" color="blue.400" />
                            </Flex>
                        )}

                        {catPage < catTotalPages && !catLoading && (
                            <Button
                                size="sm"
                                variant="ghost"
                                w="100%"
                                borderRadius={0}
                                borderTop="1px solid"
                                borderColor="gray.100"
                                color="blue.500"
                                onClick={() => setCatPage((p) => p + 1)}
                            >
                                Ko'proq yuklash...
                            </Button>
                        )}
                    </Box>

                    {/* Footer: selected count + clear */}
                    {selectedCategories.length > 0 && (
                        <Flex
                            borderTop="1px solid"
                            borderColor="gray.100"
                            px={3}
                            py={2}
                            justify="space-between"
                            align="center"
                            bg="surface"
                        >
                            <Text fontSize="xs" color="gray.500">
                                {selectedCategories.length} ta tanlandi
                            </Text>
                            <Button
                                size="xs"
                                variant="ghost"
                                colorScheme="red"
                                onClick={() => onChange([])}
                            >
                                Tozalash
                            </Button>
                        </Flex>
                    )}
                </Box>
            )}
        </Box>
    );
}

/* ─────────────────────────────────────────────────────────────────────────────
   Main Page Component
───────────────────────────────────────────────────────────────────────────── */
export default function ADfactories({ reloadDependance, role = "admin" }) {
    const searchRef = useRef(null);
  /* ── Factories data ── */
    const [factories, setFactories] = useState([]);
    const [loading, setLoading] = useState(false);
    const [totalPage, setTotalPage] = useState(1);
    const [totalCount, setTotalCount] = useState(0);

    /* ── Pagination ── */
    const [factoryPage, setFactoryPage] = useState(() => {
        const saved = sessionStorage.getItem(FACTORY_PAGE_KEY);
        return saved ? Number(saved) : 1;
    });

    /* ── Search ── */
    const [search, setSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const isFirstRender = useRef(true);

    /* ── Address filter ── */
    const [selectedRegion, setSelectedRegion] = useState("");
    const [selectedDistrict, setSelectedDistrict] = useState("");
    const [filteredDistricts, setFilteredDistricts] = useState(districts);
    const [selectedAddresses, setSelectedAddresses] = useState([]); // [{id, label}]

    /* ── Category filter ── */
    const [selectedCategories, setSelectedCategories] = useState([]); // [{id, name}]
    // Price Freshness filter
    const [selectedPriceFreshness, setSelectedPriceFreshness] = useState("all");


    /* ─── Pagination helpers ─── */
    const changePagination = useCallback(
        (page) => {
            if (page > 0 && page <= totalPage) {
                setFactoryPage(page);
                sessionStorage.setItem(FACTORY_PAGE_KEY, page);
            }
        },
        [totalPage]
    );

    const resetPage = useCallback(() => {
        setFactoryPage(1);
        sessionStorage.setItem(FACTORY_PAGE_KEY, 1);
    }, []);

    /* ─── Search debounce ─── */
    useEffect(() => {
        const t = setTimeout(() => {
            const val = search.trim();
            setDebouncedSearch(val);
            if (!isFirstRender.current) resetPage();
            isFirstRender.current = false;
        }, SEARCH_DEBOUNCE);
        return () => clearTimeout(t);
    }, [search, resetPage]);

    /* ─── Fetch factories ─── */
    const fetchFactories = useCallback(
        async (page, searchTerm, addressList, categoryIds, selectedPriceFreshness) => {
            try {
                setLoading(true);
                const res = await apiFetchFilteredFactories(page, searchTerm, addressList, categoryIds, selectedPriceFreshness);
                const d = res.data?.data ?? res.data; // supports both {data:{...}} and direct
                setFactories(d.records ?? []);
                setTotalPage(d.pagination?.total_pages ?? 1);
                setTotalCount(
                    d.pagination?.total_count ??
                    d.pagination?.totalCount ??
                    d.pagination?.total ??
                    0
                );
            } catch (e) {
                console.error("Factory fetch error:", e);
            } finally {
                setLoading(false);
            }
        },
        []
    );

    /* ─── Trigger fetch when any filter changes ─── */
    useEffect(() => {
        fetchFactories(
            factoryPage,
            debouncedSearch,
            selectedAddresses.map((a) => a.label),
            selectedCategories.map((c) => c.id),
            selectedPriceFreshness
        );
    }, [
        reloadDependance,
        fetchFactories,
        factoryPage,
        debouncedSearch,
        selectedAddresses,
        selectedCategories,
        selectedPriceFreshness,
    ]);

    /* ─── Address: add ─── */
    const addAddress = () => {
        const region = regions.find((r) => r.id == selectedRegion);
        if (!region) return;

        const district = districts.find((d) => d.id == selectedDistrict);
        const label = district
            ? ${region.name_uz}, ${district.name_uz}
            : region.name_uz;
        const uid = district
            ? r${selectedRegion}-d${selectedDistrict}
            : r${selectedRegion};

        if (selectedAddresses.find((a) => a.id === uid)) return; // duplicate guard
 setSelectedAddresses((prev) => [...prev, { id: uid, label }]);
        setSelectedRegion("");
        setSelectedDistrict("");
        setFilteredDistricts(districts);
        resetPage();
    };

    const removeAddress = (id) => {
        setSelectedAddresses((prev) => prev.filter((a) => a.id !== id));
        resetPage();
    };

    const removeCategory = (id) => {
        setSelectedCategories((prev) => prev.filter((c) => c.id !== id));
        resetPage();
    };

    const clearAllFilters = () => {
        setSelectedAddresses([]);
        setSelectedCategories([]);
        setSearch("");
        setSelectedRegion("");
        setSelectedDistrict("");
        setFilteredDistricts(districts);
        resetPage();
    };

    /* ─── Hotkeys ─── */
    useEffect(() => { searchRef.current?.focus(); }, []);
    useEffect(() => {
        const h = () => searchRef.current?.focus();
        window.addEventListener("focusSearch", h);
        return () => window.removeEventListener("focusSearch", h);
    }, []);

    /* ─── Derived ─── */
    const hasFilters = selectedAddresses.length > 0  selectedCategories.length > 0;
    const hasAnyFilter = hasFilters  search;

    const doReload = () =>
        fetchFactories(
            factoryPage,
            debouncedSearch,
            selectedAddresses.map((a) => a.label),
            selectedCategories.map((c) => c.id)
        );

    /* ─── Render ─── */
    return (
        <Box pr="20px" pb="20px">
            <FactoriesHeader onReload={doReload} role={role} />

            {/* ══ Row 1: Search  +  Total count ══ */}
            <Flex mb="14px" align="center" gap={4} flexWrap="wrap">
                <Box flex={1} maxW="400px" minW="200px">
                    <InputGroup>
                        <Input
                            ref={searchRef}
                            placeholder="Zavodlarni qidirish..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                        <InputRightElement>
                            {search ? (
                                <IconButton
                                    size="sm"
                                    variant="ghost"
                                    aria-label="clear"
                                    icon={<X size={16} />}
                                    onClick={() => setSearch("")}
                                />
                            ) : (
                                <Search size={16} color="gray" />
                            )}
                        </InputRightElement>
                    </InputGroup>
                </Box>

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
                            Jami: ${totalCount} ta zavod
                        )}
                    </Badge>
                </Flex>
            </Flex>

            {/* ══ Row 2: Address selects  +  Category dropdown ══ */}
            <Flex mb="12px" align="center" gap={3} flexWrap="wrap">
                {/* Category multi-select */}
                <CategoryDropdown
                    colorScheme="purple"
                    selectedCategories={selectedCategories}
                    onChange={(cats) => {
                        setSelectedCategories(cats);
                        resetPage();
                    }}
                />

                {/* Vertical separator */}
                <Box w="1px" h="36px" bg="gray.200" flexShrink={0} />
                  {/* Viloyat */}
                <Select
                    value={selectedRegion}
                    placeholder="Viloyat"
                    maxW="190px"
                    onChange={(e) => {
                        const rid = e.target.value;
                        setSelectedRegion(rid);
                        setSelectedDistrict("");
                        setFilteredDistricts(
                            rid ? districts.filter((d) => d.region_id === +rid) : districts
                        );
                    }}
                >
                    {regions.map((r) => (
                        <option key={r.id} value={r.id}>
                            {r.name_uz}
                        </option>
                    ))}
                </Select>

                {/* Tuman */}
                <Select
                    value={selectedDistrict}
                    placeholder="Tuman (ixtiyoriy)"
                    maxW="200px"
                    isDisabled={!selectedRegion}
                    onChange={(e) => setSelectedDistrict(e.target.value)}
                >
                    {filteredDistricts.map((d) => (
                        <option key={d.id} value={d.id}>
                            {d.name_uz}
                        </option>
                    ))}
                </Select>

                {/* Add address button */}
                <Button
                    leftIcon={<Plus size={15} />}
                    colorScheme="blue"
                    variant="outline"
                    size="md"
                    isDisabled={!selectedRegion}
                    onClick={addAddress}
                    flexShrink={0}
                >
                    Qo'shish
                </Button>

                {/* Vertical separator */}
                <Box w="1px" h="36px" bg="gray.200" flexShrink={0} />
                <Select
                    value={selectedPriceFreshness}
                    placeholder="Narx yangiliklari"
                    maxW="200px"
                    onChange={(e) => setSelectedPriceFreshness(e.target.value)}
                >
                    <option value="all">Hammasi</option>
                    <option value="new">Yangi narxlar</option>
                    <option value="old">Eski narxlar</option>
                </Select>

                {/* Clear all */}
                {hasAnyFilter && (
                    <Button
                        size="sm"
                        variant="ghost"
                        colorScheme="red"
                        leftIcon={<X size={14} />}
                        onClick={clearAllFilters}
                        flexShrink={0}
                    >
                        Hammasini tozalash
                    </Button>
                )}
            </Flex>
{/* ══ Row 3: Active filter tags ══ */}
            {hasFilters && (
                <Wrap mb="16px" spacing={2}>
                    {selectedAddresses.map((addr) => (
                        <WrapItem key={addr.id}>
                            <Tag
                                colorScheme="blue"
                                borderRadius="full"
                                size="sm"
                                variant="subtle"
                            >
                                <TagLabel>📍 {addr.label}</TagLabel>
                                <TagCloseButton onClick={() => removeAddress(addr.id)} />
                            </Tag>
                        </WrapItem>
                    ))}
                    {selectedCategories.map((cat) => (
                        <WrapItem key={cat.id}>
                            <Tag
                                colorScheme="purple"
                                borderRadius="full"
                                size="sm"
                                variant="subtle"
                            >
                                <TagLabel>🏷 {cat.name}</TagLabel>
                                <TagCloseButton onClick={() => removeCategory(cat.id)} />
                            </Tag>
                        </WrapItem>
                    ))}
                </Wrap>
            )}

            {/* ══ Cards grid ══ */}
            <SimpleGrid columns={{ base: 1, md: 2, xl: 3 }} spacing="20px">
                {loading
                    ? Array.from({ length: 15 }).map((_, i) => (
                        <FactoryCardSkeleton key={i} />
                    ))
                    : factories.map((factory) => (
                        <FactoryCard
                            role={role}
                            key={factory.id}
                            factory={factory}
                            onEdit={doReload}
                            onDelete={doReload}
                        />
                    ))}
            </SimpleGrid>

            <PaginationBar
                mt="30px"
                page={factoryPage}
                totalPages={totalPage}
                loading={loading}
                onPageChange={(p) => changePagination(p)}
            />
        </Box>
    );
}
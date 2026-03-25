import {
    Box,
    SimpleGrid,
    Flex,
    Button,
    Input,
    InputGroup,
    InputRightElement,
    IconButton,
    Heading,
    Text,
    HStack,
    Tag,
    TagLabel,
    TagCloseButton,
    Divider,
    Select,
} from "@chakra-ui/react";
import React, { useEffect, useState, useCallback, useRef } from "react";
import { ChevronLeft, ChevronRight, Search, X, Link2, Save } from "lucide-react";
import FactoryCard from "./_components/FactoryCard";
import FactoryCardSkeleton from "./_components/FactoryCardSkeleton";
import { useParams } from "react-router";
import { NavLink, useSearchParams } from "react-router-dom";
import { apiCategories } from "../../utils/Controllers/Categories";
import { apiLocalCategories } from "../../utils/Controllers/apiLocalCategories";
import { apiLocationCategories } from "../../utils/Controllers/apiLocationCategory";
import regions from '../../constants/regions/regions.json'
import districts from '../../constants/regions/districts.json'


const FACTORY_PAGE_KEY = "factories_page_by_category";
const SEARCH_DEBOUNCE = 500;
const HOLD_DELAY = 300;

export default function ADfactoriesBycategory({ reloadDependance, role = 'admin' }) {
    const searchRef = useRef(null)
    const { id } = useParams();
    const [searchParams] = useSearchParams();
    const categoryName = searchParams.get("name");

    /* ---------------- main states ---------------- */
    const [factories, setFactories] = useState([]);
    const [loading, setLoading] = useState(false);
    const [saveLoading, setSaveLoading] = useState(false)
    const [totalPage, setTotalPage] = useState(1);

    /* ---------------- join mode ---------------- */
    const [joinMode, setJoinMode] = useState(false);
    const [selected, setSelected] = useState([]); // factory(location) objects

    /* ---------------- pagination ---------------- */
    const [factoryPage, setFactoryPage] = useState(() => {
        const saved = sessionStorage.getItem(FACTORY_PAGE_KEY);
        return saved ? Number(saved) : 1;
    });

    /* ---------------- search ---------------- */
    const [search, setSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("all");
    const isFirstRender = useRef(true);

    /* ---------------- filter regions ---------------*/
    const [selectedRegion, setSelectedRegion] = useState('');
    const [selectedDistrict, setSelectedDistrict] = useState('');

    /* ---------------- holding pagination ---------------- */
    const [number, setNumber] = useState(factoryPage);
    const [holding, setHolding] = useState(false);
    const holdTimeoutRef = useRef(null);
    const holdIntervalRef = useRef(null);

    /* ---------------- pagination change ---------------- */
    const changePagination = useCallback(
        (page) => {
            if (page > 0 && page <= totalPage) {
                setFactoryPage(page);
                sessionStorage.setItem(FACTORY_PAGE_KEY, page);
            }
        },
        [totalPage]
    );

    /* ---------------- debounce search ---------------- */
    useEffect(() => {
        const handler = setTimeout(() => {
            const value = search.trim();
            setDebouncedSearch(value === "" ? "all" : value);

            if (!isFirstRender.current) {
                setFactoryPage(1);
                sessionStorage.setItem(FACTORY_PAGE_KEY, 1);
            }
            isFirstRender.current = false;
        }, SEARCH_DEBOUNCE);

        return () => clearTimeout(handler);
    }, [search]);

    /* ---------------- fetch factories ---------------- */
    const fetchFactories = useCallback(
        async (page, searchText, address) => {
            try {
                setLoading(true);

                const res = joinMode
                    ? await apiCategories.getNotFactoriesByCategoryWithAddress(id, page, searchText, address)
                    : await apiCategories.getFactoriesByCategoryWithAddress(id, page, searchText, address);

                setFactories(res.data.data.records);
                setTotalPage(res.data.data.pagination.total_pages);

            } catch (err) {
                if (joinMode) {
                    setJoinMode(false)
                }
            } finally {
                setLoading(false);

            }
        },
        [id, joinMode]
    );

    /* ---------------- pagination click ---------------- */
    const handleClick = (type) => {
        if (holding) return;

        const next =
            type === "inc"
                ? Math.min(factoryPage + 1, totalPage)
                : Math.max(factoryPage - 1, 1);

        changePagination(next);
    };

    /* ---------------- long press ---------------- */
    const startHolding = (type) => {
        holdTimeoutRef.current = setTimeout(() => {
            setHolding(true);
            setNumber(factoryPage);

            holdIntervalRef.current = setInterval(() => {
                setNumber((prev) =>
                    type === "inc"
                        ? Math.min(prev + 1, totalPage)
                        : Math.max(prev - 1, 1)
                );
            }, 200);
        }, HOLD_DELAY);
    };

    const stopHolding = () => {
        clearTimeout(holdTimeoutRef.current);
        clearInterval(holdIntervalRef.current);

        if (holding) changePagination(number);
        setHolding(false);
    };

    /* ---------------- effects ---------------- */
    // useEffect(() => {
    //     fetchFactories(factoryPage, debouncedSearch, );
    // }, [factoryPage, debouncedSearch, fetchFactories, reloadDependance]);

    /* ---------------- join helpers ---------------- */
    const toggleSelect = (factory) => {
        setSelected((prev) => {
            const exists = prev.find((i) => i.id === factory.id);
            if (exists) {
                return prev.filter((i) => i.id !== factory.id);
            }
            return [...prev, factory];
        });
    };

    const removeSelected = (factoryId) => {
        setSelected((prev) => prev.filter((i) => i.id !== factoryId));
    };

    const saveJoinPayload = async () => {
        const payload = {
            items: selected.map((f) => ({
                location_id: f.id,
                category_id: id,
            })),
        };

        setSaveLoading(true)
        try {
            const res = await apiLocationCategories.Add(payload);
            setJoinMode(false);
        } finally {
            setSaveLoading(false)
        }
    };

    /* ----------------  filters ---------------- */
    const [filteredDistricts, setFilteredDistricts] = useState(districts)
    useEffect(() => {
        const regionName = regions.find((item) => item.id == selectedRegion)?.name_uz ?? '';
        const districtName = districts.find((item) => item.id == selectedDistrict)?.name_uz ?? ''
        const address = (regionName + districtName) ? (regionName + ', ' + districtName) : ''
        console.log(address);

        fetchFactories(factoryPage, debouncedSearch, address);
    }, [reloadDependance, fetchFactories, factoryPage, debouncedSearch, selectedRegion, selectedDistrict]);


    /* ---------------- hotkeys ---------------- */

    useEffect(() => {
        searchRef.current?.focus();
    }, []);
    useEffect(() => {
        const handleFocus = () => {
            searchRef.current?.focus();
        };

        window.addEventListener("focusSearch", handleFocus);

        return () => {
            window.removeEventListener("focusSearch", handleFocus);
        };
    }, []);

    /* ---------------- render ---------------- */
    return (
        <Box pr="20px" pb="20px">
            {/* Header */}
            <Flex justify="space-between" py="20px" align="center">
                <Heading size="lg">
                    <NavLink to={role === "admin" ? "/factories/categories" : '/supplier/factories/categories'}>  Factories </NavLink>/{" "}
                    <Text fontSize="24px" display="inline">
                        {categoryName}
                    </Text>
                </Heading>

                <HStack gap="12px">
                    {joinMode && (
                        <Button
                            leftIcon={<Save size={16} />}
                            colorScheme="green"
                            isDisabled={!selected.length}
                            onClick={saveJoinPayload}
                        >
                            Save ({selected.length})
                        </Button>
                    )}

                    <Button
                        leftIcon={<Link2 size={16} />}
                        variant={joinMode ? "solidPrimary" : ""}
                        onClick={() => {
                            setJoinMode(!joinMode);
                            setSelected([]);
                            setFactoryPage(1);
                        }}
                    >
                        Join factories
                    </Button>
                </HStack>
            </Flex>

            {/* Selected panel */}
            {joinMode && selected.length > 0 && (
                <Box mb="16px">
                    <Text mb="8px" fontWeight="600">
                        Selected factories ({selected.length})
                    </Text>
                    <HStack wrap="wrap" spacing="8px">
                        {selected.map((f) => (
                            <Tag key={f.id} size="lg" borderRadius="full">
                                <TagLabel>{f.name}</TagLabel>
                                <TagCloseButton onClick={() => removeSelected(f.id)} />
                            </Tag>
                        ))}
                    </HStack>
                    <Divider mt="12px" />
                </Box>
            )}

            {/* Search */}
            <Flex mb="20px" alignItems={'center'} gap={4}>
                <Box maxW="400px">
                    <InputGroup>
                        <Input
                            placeholder="Search factories..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                        <InputRightElement>
                            {search ? (
                                <IconButton
                                    size="sm"
                                    variant="ghost"
                                    icon={<X size={16} />}
                                    aria-label="Clear"
                                    onClick={() => setSearch("")}
                                />
                            ) : (
                                <Search size={16} />
                            )}
                        </InputRightElement>
                    </InputGroup>
                </Box>
                <Select
                    value={selectedRegion}
                    onChange={(e) => {
                        const regionId = e.target.value;
                        if (regionId) {
                            const regionalDistricts = districts.filter((item) => item.region_id === +regionId)
                            setFilteredDistricts(regionalDistricts);
                            setSelectedDistrict('')
                        } else {
                            setFilteredDistricts(districts);
                            setSelectedDistrict('');
                            setSelectedRegion('')
                        }
                        setSelectedRegion(e.target.value);
                    }}
                    maxW={'240px'}>
                    <option value={''}>Barcha viloyatlar</option>
                    {regions.map((item) => {
                        return (
                            <option key={item.id} value={item.id}>{item.name_uz}</option>
                        )
                    })}
                </Select>
                <Select
                    value={selectedDistrict}
                    onChange={(e) => {
                        const districtId = e.target.value;
                        setSelectedDistrict(districtId);

                        const found = districts.find(d => d.id === +districtId);
                        if (found && !selectedRegion) {
                            setSelectedRegion(found.region_id);
                        }
                    }}
                    maxW={'240px'}
                >
                    <option value={''}>Barcha tumanlar</option>
                    {filteredDistricts.map((item) => {
                        return (
                            <option key={item.id} value={item.id}>
                                {item.name_uz}
                            </option>
                        )
                    })}
                </Select>
            </Flex>

            {/* Cards */}
            <SimpleGrid columns={{ base: 1, md: 2, xl: 3 }} spacing="20px">
                {loading
                    ? Array.from({ length: 12 }).map((_, i) => (
                        <FactoryCardSkeleton key={i} />
                    ))
                    : factories.map((factory, index) => (
                        <FactoryCard
                            role={role}
                            key={index}
                            factory={joinMode ? factory : factory?.location}
                            id={factory?.id}
                            categoryName={categoryName}
                            joinMode={joinMode}
                            checked={
                                !!selected.find(
                                    (i) => i.id === (factory?.location?.id || factory?.id)
                                )
                            }
                            onToggleSelect={toggleSelect}
                            onDeleted={() => {
                                fetchFactories(factoryPage, debouncedSearch)
                            }}
                        />
                    ))}
            </SimpleGrid>

            {/* Pagination */}
            <Flex justify="center" align="center" gap="20px" mt="30px">
                <Button onClick={() => changePagination(1)}>First</Button>

                <Button
                    isDisabled={factoryPage === 1}
                    onClick={() => handleClick("dec")}
                    onMouseDown={() => startHolding("dec")}
                    onMouseUp={stopHolding}
                    onMouseLeave={stopHolding}
                >
                    <ChevronLeft />
                </Button>

                {(holding ? number : factoryPage) + " / " + totalPage}

                <Button
                    isDisabled={factoryPage === totalPage}
                    onClick={() => handleClick("inc")}
                    onMouseDown={() => startHolding("inc")}
                    onMouseUp={stopHolding}
                    onMouseLeave={stopHolding}
                >
                    <ChevronRight />
                </Button>

                <Button onClick={() => changePagination(totalPage)}>Last</Button>
            </Flex>
        </Box>
    );
}

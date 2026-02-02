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
} from "@chakra-ui/react";
import React, { useEffect, useState, useCallback, useRef } from "react";
import { ChevronLeft, ChevronRight, Search, X } from "lucide-react";
import FactoryCard from "./_components/FactoryCard";
import FactoryCardSkeleton from "./_components/FactoryCardSkeleton";
import { apiLocations } from "../../utils/Controllers/Locations";
import { useParams } from "react-router";
import { useSearchParams } from "react-router-dom";
import { apiCategories } from "../../utils/Controllers/Categories";

const FACTORY_PAGE_KEY = "factories_page";
const SEARCH_DEBOUNCE = 500;
const HOLD_DELAY = 300;

export default function ADfactoriesBycategory({ reloadDependance }) {
    const { id } = useParams();
    const [searchParams] = useSearchParams();
    const categoryName = searchParams.get('name')
    useEffect(() => {
        // Factorylarni olish
        // GET /factories?categoryId=id
        console.log("Category ID:", id);
        console.log(categoryName);

    }, [id]);

    const [factories, setFactories] = useState([]);
    const [loading, setLoading] = useState(false);
    const [totalPage, setTotalPage] = useState(1);

    /* ---------------- pagination (sessionStorage) ---------------- */
    const [factoryPage, setFactoryPage] = useState(() => {
        const saved = sessionStorage.getItem(FACTORY_PAGE_KEY);
        return saved ? Number(saved) : 1;
    });

    /* ---------------- search ---------------- */
    const [search, setSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("all");
    const isFirstRender = useRef(true);

    /* ---------------- holding pagination ---------------- */
    const [number, setNumber] = useState(factoryPage);
    const [holding, setHolding] = useState(false);

    const holdTimeoutRef = useRef(null);
    const holdIntervalRef = useRef(null);

    /* ---------------- pagination change ---------------- */
    const changePagination = useCallback((page) => {
        if (page > 0 && page <= totalPage) {
            setFactoryPage(page);
            sessionStorage.setItem(FACTORY_PAGE_KEY, page);
        }
    }, [totalPage]);

    /* ---------------- debounce search (FIXED) ---------------- */
    useEffect(() => {
        const handler = setTimeout(() => {
            const value = search.trim();
            setDebouncedSearch(value === "" ? "all" : value);

            // faqat user search qilganda page=1
            if (!isFirstRender.current) {
                setFactoryPage(1);
                sessionStorage.setItem(FACTORY_PAGE_KEY, 1);
            }

            isFirstRender.current = false;
        }, SEARCH_DEBOUNCE);

        return () => clearTimeout(handler);
    }, [search]);

    /* ---------------- fetch factories ---------------- */
    const fetchFactories = useCallback(async (page, searchText) => {
        try {
            setLoading(true);

            const res = await apiCategories.getFactoriesByCategory(id, page, searchText,);

            setFactories(res.data.data.records);
            setTotalPage(res.data.data.pagination.total_pages);

        } finally {
            setLoading(false);
        }
    }, []);

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

        if (holding) {
            changePagination(number);
        }

        setHolding(false);
    };

    /* ---------------- effects ---------------- */
    useEffect(() => {
        fetchFactories(factoryPage, debouncedSearch);
    }, [factoryPage, debouncedSearch, fetchFactories]);

    useEffect(() => {
        fetchFactories(factoryPage, debouncedSearch);
    }, [reloadDependance, fetchFactories, factoryPage, debouncedSearch]);

    /* ---------------- render ---------------- */
    return (
        <Box pr={"20px"} pb={"20px"}>
            <Flex justifyContent={"space-between"} py="20px">
                <Heading size={"lg"}>Factories / <Text fontSize="24px" display={"inline"}>{categoryName}</Text></Heading>
                <Flex gap={"24px"}>
                   
                </Flex>
            </Flex>
            {/* Search */}
            <Box mb="20px" maxW="400px">
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

            {/* Cards */}
            <SimpleGrid columns={{ base: 1, md: 2, xl: 3 }} spacing="20px">
                {loading
                    ? Array.from({ length: 15 }).map((_, i) => (
                        <FactoryCardSkeleton key={i} />
                    ))
                    : factories.map((factory) => (
                        <FactoryCard
                            key={factory?.location?.id}
                            factory={factory?.location}
                            onEdit={() => fetchFactories(factoryPage, debouncedSearch)}
                            onDelete={() => fetchFactories(factoryPage, debouncedSearch)}
                        />
                    ))
                }
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

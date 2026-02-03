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
} from "@chakra-ui/react";
import React, { useEffect, useState, useCallback, useRef } from "react";
import { ChevronLeft, ChevronRight, Search, X, Link2, Save } from "lucide-react";
import CategoryCard from "./_components/CategoryCard";
import { useParams } from "react-router";
import CategoryCardSkeleton from "../../components/ui/CategoryCardSkeleton";
import { apiLocationCategories } from "../../utils/Controllers/apiLocationCategory";

const PAGE_KEY = "factory_categories_page";
const SEARCH_DEBOUNCE = 500;
const HOLD_DELAY = 300;

export default function ADcategoriesByFactory({ reloadDependance }) {
    const { factoryId } = useParams();

    /* ---------------- main states ---------------- */
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(false);
    const [saveLoading, setSaveLoading] = useState(false)
    const [totalPage, setTotalPage] = useState(1);

    /* ---------------- join mode ---------------- */
    const [joinMode, setJoinMode] = useState(false);
    const [selected, setSelected] = useState([]);

    /* ---------------- pagination ---------------- */
    const [page, setPage] = useState(() => {
        const saved = sessionStorage.getItem(PAGE_KEY);
        return saved ? Number(saved) : 1;
    });

    /* ---------------- search ---------------- */
    const [search, setSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("all");
    const isFirstRender = useRef(true);

    /* ---------------- holding pagination ---------------- */
    const [number, setNumber] = useState(page);
    const [holding, setHolding] = useState(false);
    const holdTimeoutRef = useRef(null);
    const holdIntervalRef = useRef(null);

    /* ---------------- pagination change ---------------- */
    const changePagination = useCallback(
        (p) => {
            if (p > 0 && p <= totalPage) {
                setPage(p);
                sessionStorage.setItem(PAGE_KEY, p);
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
                setPage(1);
                sessionStorage.setItem(PAGE_KEY, 1);
            }
            isFirstRender.current = false;
        }, SEARCH_DEBOUNCE);

        return () => clearTimeout(handler);
    }, [search]);

    /* ---------------- fetch categories ---------------- */
    const fetchCategories = useCallback(
        async (p, searchText) => {
            try {
                setLoading(true);

                const res = joinMode
                    ? await apiLocationCategories.getNotCategoriesByFactoryId(
                        factoryId,
                        p,
                        searchText
                    )
                    : await apiLocationCategories.getCategoriesByFactoryId(
                        factoryId,
                        p,
                        searchText
                    );

                setCategories(res.data.data.records);
                setTotalPage(res.data.data.pagination.total_pages);
            } catch (err) {
                if (joinMode) {
                    setJoinMode(false)
                }
            }
            finally {
                setLoading(false);
            }
        },
        [factoryId, joinMode]
    );

    /* ---------------- effects ---------------- */
    useEffect(() => {
        fetchCategories(page, debouncedSearch);
    }, [page, debouncedSearch, fetchCategories, reloadDependance]);

    /* ---------------- join helpers ---------------- */
    const toggleSelect = (category) => {
        setSelected((prev) => {
            const exists = prev.find((c) => c.id === category.id);
            if (exists) {
                return prev.filter((c) => c.id !== category.id);
            }
            return [...prev, category];
        });
    };

    const removeSelected = (categoryId) => {
        setSelected((prev) => prev.filter((c) => c.id !== categoryId));
    };

    const saveJoinPayload = async () => {
        const payload = {
            items: selected.map((c) => ({
                category_id: c.id,
                factory_id: factoryId,
            })),
        };
        setSaveLoading(true);
        try {
            const res = await apiLocationCategories.Add(payload);
            setJoinMode(false);
        } finally {
            setSaveLoading(false)
        }

    };

    /* ---------------- pagination click ---------------- */
    const handleClick = (type) => {
        if (holding) return;

        const next =
            type === "inc"
                ? Math.min(page + 1, totalPage)
                : Math.max(page - 1, 1);

        changePagination(next);
    };

    const startHolding = (type) => {
        holdTimeoutRef.current = setTimeout(() => {
            setHolding(true);
            setNumber(page);

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

    /* ---------------- render ---------------- */
    return (
        <Box pr="20px" pb="20px">
            {/* Header */}
            <Flex justify="space-between" py="20px" align="center">
                <Heading size="lg">Factory categories</Heading>

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
                        variant={joinMode ? "solid" : "outline"}
                        onClick={() => {
                            setJoinMode(!joinMode);
                            setSelected([]);
                            setPage(1);
                        }}
                    >
                        Join categories
                    </Button>
                </HStack>
            </Flex>

            {/* Selected panel */}
            {joinMode && selected.length > 0 && (
                <Box mb="16px">
                    <Text mb="8px" fontWeight="600">
                        Selected categories ({selected.length})
                    </Text>
                    <HStack wrap="wrap" spacing="8px">
                        {selected.map((c) => (
                            <Tag key={c.id} size="lg" borderRadius="full">
                                <TagLabel>{c.name}</TagLabel>
                                <TagCloseButton
                                    onClick={() => removeSelected(c.id)}
                                />
                            </Tag>
                        ))}
                    </HStack>
                    <Divider mt="12px" />
                </Box>
            )}

            {/* Search */}
            <Box mb="20px" maxW="400px">
                <InputGroup>
                    <Input
                        placeholder="Search categories..."
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
                    ? Array.from({ length: 12 }).map((_, i) => (
                        <CategoryCardSkeleton key={i} />
                    ))
                    : categories.map((cat) => (
                        <CategoryCard
                            key={cat.id}
                            category={joinMode ? cat : cat?.category}
                            joinMode={joinMode}
                            checked={!!selected.find((c) => c.id === cat.id)}
                            onToggleSelect={toggleSelect}
                        />
                    ))}
            </SimpleGrid>

            {/* Pagination */}
            <Flex justify="center" align="center" gap="20px" mt="30px">
                <Button onClick={() => changePagination(1)}>First</Button>

                <Button
                    isDisabled={page === 1}
                    onClick={() => handleClick("dec")}
                    onMouseDown={() => startHolding("dec")}
                    onMouseUp={stopHolding}
                    onMouseLeave={stopHolding}
                >
                    <ChevronLeft />
                </Button>

                {(holding ? number : page) + " / " + totalPage}

                <Button
                    isDisabled={page === totalPage}
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

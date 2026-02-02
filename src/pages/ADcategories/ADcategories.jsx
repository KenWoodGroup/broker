import {
    Box,
    SimpleGrid,
    Flex,
    Button,
    Input,
    InputGroup,
    InputRightElement,
    IconButton
} from "@chakra-ui/react";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Search, X } from "lucide-react";
import CategoryCard from "./_components/CategoryCard";
import CategoryCardSkeleton from "./_components/CategoryCardSkeleton";
import useDebounce from "../../hooks/useDebounce";
import { apiCategories } from "../../utils/Controllers/Categories";
import CategoriesHeader from "./_components/CategoriesHeader";
import { useNavigate } from "react-router";

const CATEGORY_PAGE_KEY = "categories_page";

export default function ADcategories({ reloadDependance }) {
    const navigate = useNavigate();

    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(false);
    const [totalPage, setTotalPage] = useState(1);

    /* ---------------- pagination (sessionStorage) ---------------- */
    const [page, setPage] = useState(() => {
        const saved = sessionStorage.getItem(CATEGORY_PAGE_KEY);
        return saved ? Number(saved) : 1;
    });

    const changePage = useCallback((p) => {
        if (p > 0 && p <= totalPage) {
            setPage(p);
            sessionStorage.setItem(CATEGORY_PAGE_KEY, p);
        }
    }, [totalPage]);

    /* ---------------- search ---------------- */
    const [search, setSearch] = useState("");
    const debouncedSearch = useDebounce(search.trim() || "all", 500);

    /* search o‘zgarsa → page = 1 */
    useEffect(() => {
        setPage(1);
        sessionStorage.setItem(CATEGORY_PAGE_KEY, 1);
    }, [debouncedSearch]);

    /* ---------------- fetch ---------------- */
    const fetchCategories = useCallback(async (page, searchText) => {
        try {
            setLoading(true);

            const res = await apiCategories.pageAll(page, searchText);
            setCategories(res.data.records);
            setTotalPage(res.data.pagination.total_pages);

        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchCategories(page, debouncedSearch);
    }, [page, debouncedSearch, fetchCategories]);

    useEffect(() => {
        fetchCategories(page, debouncedSearch);
    }, [reloadDependance, page, debouncedSearch, fetchCategories]);

    /* ---------------- holding pagination ---------------- */
    const [holding, setHolding] = useState(false);
    const [previewPage, setPreviewPage] = useState(page);
    const holdRef = useRef(null);

    const startHolding = (type) => {
        setHolding(true);
        setPreviewPage(type === "inc" ? page + 1 : page - 1);

        holdRef.current = setInterval(() => {
            setPreviewPage((prev) =>
                type === "inc"
                    ? Math.min(prev + 1, totalPage)
                    : Math.max(prev - 1, 1)
            );
        }, 200);
    };

    const stopHolding = () => {
        clearInterval(holdRef.current);
        changePage(previewPage);
        setHolding(false);
    };

    /* ---------------- render ---------------- */
    return (
        <Box pr={"20px"} pb={"20px"}>
            {/* Header */}
            <CategoriesHeader onReload={()=>fetchCategories(page, debouncedSearch)}/>

            {/* Search */}
            <Box mb="20px" maxW="360px">
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
                    ? Array.from({ length: 20 }).map((_, i) => (
                        <CategoryCardSkeleton key={i} />
                    ))
                    : categories.map((cat) => (
                        <CategoryCard
                            key={cat.id}
                            category={cat}
                            onEdit={() => fetchCategories(page, debouncedSearch)}
                            onDelete={() =>fetchCategories(page, debouncedSearch)}
                            onOpen={() => {
                                // 👉 bu yerda category factories sahifasiga o‘tasiz
                                navigate(`/factories/categories/${cat.id}?name=${encodeURIComponent(cat?.name)}`)
                            }}
                        />
                    ))}
            </SimpleGrid>

            {/* Pagination */}
            <Flex justify="center" align="center" gap="20px" mt="30px">
                <Button onClick={() => changePage(1)}>First</Button>

                <Button
                    isDisabled={page === 1}
                    onMouseDown={() => startHolding("dec")}
                    onMouseUp={stopHolding}
                >
                    <ChevronLeft />
                </Button>

                {(holding ? previewPage : page) + " / " + totalPage}

                <Button
                    isDisabled={page === totalPage}
                    onMouseDown={() => startHolding("inc")}
                    onMouseUp={stopHolding}
                    onMouseLeave={stopHolding}
                >
                    <ChevronRight />
                </Button>

                <Button onClick={() => changePage(totalPage)}>Last</Button>
            </Flex>
        </Box>
    );
}

import {
    Box,
    SimpleGrid,
    Flex,
    Button,
    Input,
    InputGroup,
    InputRightElement,
    IconButton,
    Tooltip,
    Heading
} from "@chakra-ui/react";
import React, { useCallback, useEffect, useState } from "react";
import { FileSpreadsheet, FileUp, LayoutGrid, Search, Upload, X } from "lucide-react";
import useDebounce from "../../hooks/useDebounce";
import { useNavigate, useParams } from "react-router";
import { apiLocalCategories } from "../../utils/Controllers/apiLocalCategories";
import CategoryCardSkeleton from "../../components/ui/CategoryCardSkeleton";
import CategoryCard from "./_components/CategoryCard";
import { useSearchParams } from "react-router-dom";
import UploadProductsByExcel from "./_components/UploadProductsByExcel";
import PaginationBar from "../../components/common/PaginationBar";

const CATEGORY_PAGE_KEY = "local_categories_page";

export default function ADfacLocalCats({ reloadDependance, role }) {

    const navigate = useNavigate();
    const { factoryId } = useParams()
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

            const res = await apiLocalCategories.pageAll(page, searchText, factoryId, "product");
            setCategories(res.data?.data?.records);
            setTotalPage(res.data?.data?.pagination?.total_pages);

        } finally {
            setLoading(false);
        }
    }, []);

    // useEffect(() => {
    //     fetchCategories(page, debouncedSearch);
    // }, [page, debouncedSearch, fetchCategories]);

    useEffect(() => {
        fetchCategories(page, debouncedSearch);
    }, [reloadDependance, page, debouncedSearch, fetchCategories]);

    /* ---------------- render ---------------- */
    return (
        <Box pb={"20px"}>
            <Flex mb="24px" justifyContent="space-between">
                <Heading fontSize={"22px"}>Products</Heading>
                <Flex gap={3}>
                    <UploadProductsByExcel onSuccess={() => fetchCategories(page, debouncedSearch)} factoryId={factoryId}/>
                    <Tooltip label={"Table"} placement="bottom" >
                        <IconButton
                            onClick={() => {
                                navigate('products')
                            }}
                            bg="brand.400"
                            _hover={{ bg: "" }}
                            color={"neutral.50"}
                            icon={<LayoutGrid />}
                        />
                    </Tooltip>
                </Flex>

            </Flex>
            {/* Search */}
            <InputGroup maxW={"60%"} mb={"22px"}>
                <Input
                    placeholder="Search products..."
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
            {/* Cards */}
            <SimpleGrid columns={{ base: 1, md: 2, xl: 3 }} spacing="20px">
                {loading
                    ? Array.from({ length: 20 }).map((_, i) => (
                        <CategoryCardSkeleton key={i} />
                    ))
                    : categories.map((cat) => (
                        <CategoryCard
                        role={role}
                            key={cat.id}
                            category={cat}
                            onEdit={() => fetchCategories(page, debouncedSearch)}
                            onDelete={() => fetchCategories(page, debouncedSearch)}
                            onOpen={() => {
                                // 👉 bu yerda category factories sahifasiga o‘tasiz
                                navigate(`category/${cat.id}?name=${encodeURIComponent(cat?.name)}`)
                            }}
                        />
                    ))}
            </SimpleGrid>

            <PaginationBar
                mt="30px"
                page={page}
                totalPages={totalPage}
                loading={loading}
                onPageChange={(p) => changePage(p)}
            />
        </Box>
    );
}

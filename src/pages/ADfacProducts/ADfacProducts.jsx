import {
    Box,
    Flex,
    Button,
    Input,
    InputGroup,
    InputRightElement,
    IconButton,
    Table,
    Thead,
    Tr,
    Th,
    Tbody,
    Td,
    Tooltip,
    Heading,
} from "@chakra-ui/react";
import React, { useEffect, useState, useCallback, useRef } from "react";
import { ChevronLeft, ChevronRight, LayoutGrid, Search, X } from "lucide-react";
import { apiLocalProducts } from "../../utils/Controllers/apiLocalProducts";
import { useNavigate, useParams } from "react-router";
import TableSkeleton from "../../components/ui/TableSkeleton";
import { formatDateTime } from "../../utils/tools/formatDateTime";
import UploadProductsByExcel from "../ADfacLocalCats/_components/UploadProductsByExcel";

const FACTORY_PAGE_KEY = "products_page";
const SEARCH_DEBOUNCE = 500;
const HOLD_DELAY = 300;

export default function ADfacProducts({ reloadDependance, }) {
    const navigate = useNavigate()
    const { factoryId } = useParams()
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
    const fetchProducts = useCallback(async (page, searchText) => {
        try {
            setLoading(true);

            const res = await apiLocalProducts.pageAll(page, searchText, factoryId, "product");

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
        fetchProducts(factoryPage, debouncedSearch);
    }, [factoryPage, debouncedSearch, fetchProducts]);

    useEffect(() => {
        fetchProducts(factoryPage, debouncedSearch);
    }, [reloadDependance, fetchProducts, factoryPage, debouncedSearch]);

    /* ---------------- render ---------------- */
    return (
        <Box pb={"20px"}>
            {/* Search */}
            <Flex mb="24px" justifyContent="space-between">
                <Heading fontSize={"22px"}>Products</Heading>
                <Flex gap={3}>
                    <UploadProductsByExcel/>
                    <Tooltip label={"Category"} placement="bottom">
                        <IconButton
                            onClick={() => {
                                navigate(`/factories/${factoryId}`)
                            }}
                            bg={"neutral.300"}
                            _hover={{ bg: "" }} color={"brand.800"}
                            icon={<LayoutGrid />}
                        />
                    </Tooltip>
                </Flex>
            </Flex>
            <InputGroup maxW={"60%"}>
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
            {/* Table */}
            <Box
                bg="bg"
                rounded="xl"
                shadow="md"
                overflow="hidden"
                p={4}
            >
                {loading ? (
                    <Box textAlign="center">
                        <Table>
                            <Thead bg={"surface"}>
                                <Tr>
                                    <Th>#</Th>
                                    <Th>Name</Th>
                                    <Th>Unit</Th>
                                    <Th>Created time</Th>
                                    <Th>Last updated</Th>
                                    <Th>Category</Th>
                                </Tr>
                            </Thead>
                            <Tbody>
                                <TableSkeleton rows={15} columns={6} />
                            </Tbody>
                        </Table>
                        {/* <Spinner marginTop={"10px"} size="lg" /> */}
                    </Box>
                ) : factories.length > 0 ? (
                    <Table>
                        <Thead>
                            <Tr>
                                <Th>#</Th>
                                <Th>Name</Th>
                                <Th>Unit</Th>
                                <Th>Created time</Th>
                                <Th>Last updated</Th>
                                <Th>Category</Th>
                            </Tr>
                        </Thead>

                        <Tbody>
                            {factories.map((item, index) => (
                                <Tr key={item.id}>
                                    <Td>{index + 1}</Td>
                                    <Td>{item?.name}</Td>
                                    <Td>{item?.unit}</Td>
                                    <Td>{formatDateTime(item?.createdAt, 'uz-UZ', {
                                        month: 'numeric'
                                    })}</Td>
                                    <Td>{formatDateTime(item?.updatedAt, 'uz-Uz', {
                                        month: 'numeric'
                                    })}</Td>
                                    <Td>
                                        {item?.category?.name}
                                    </Td>
                                </Tr>
                            ))}
                        </Tbody>
                    </Table>
                ) : (
                    <Box textAlign="center" py={6} color="gray.500">
                        No products found
                    </Box>
                )}
            </Box>

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

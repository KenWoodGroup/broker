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
    Modal,
    ModalOverlay,
    ModalContent,
    ModalCloseButton,
    ModalBody,
    ModalFooter,
    Text,
    HStack,
    VStack,
    Icon,
    useColorModeValue,
    SimpleGrid,
} from "@chakra-ui/react";
import React, { useEffect, useState, useCallback, useRef } from "react";
import { LayoutGrid, Search, X, Pencil, Trash2, Plus } from "lucide-react";
import { apiLocalProducts } from "../../utils/Controllers/apiLocalProducts";
import { useNavigate, useParams } from "react-router";
import TableSkeleton from "../../components/ui/TableSkeleton";
import { formatDateTime } from "../../utils/tools/formatDateTime";
import { NavLink, useSearchParams } from "react-router-dom";
import PaginationBar from "../../components/common/PaginationBar";
import ConfirmDelModal from "../../components/common/ConfirmDelModal";

const FACTORY_PAGE_KEY = "fac_products_page_by_category";
const SEARCH_DEBOUNCE = 500;
export default function ADfacProductsByCategory({ reloadDependance, role='admin'}) {        
    const [searchParams] = useSearchParams();
    const categoryName = searchParams.get('name')
    const navigate = useNavigate()
    const { factoryId } = useParams();
    const { categoryId } = useParams();
    const [factories, setFactories] = useState([]);
    const [loading, setLoading] = useState(false);
    const [totalPage, setTotalPage] = useState(1);

    const editBorderCol = useColorModeValue("gray.200", "whiteAlpha.200");
    const editHeaderBorder = useColorModeValue("gray.200", "whiteAlpha.200");
    const editFooterBg = useColorModeValue("gray.50", "whiteAlpha.50");
    const editHeroBg = useColorModeValue(
        "linear-gradient(135deg, #eff6ff 0%, #dbeafe 40%, #f5f3ff 100%)",
        "linear-gradient(135deg, rgba(59,130,246,0.18) 0%, rgba(168,85,247,0.16) 100%)"
    );
    const editPanelBg = useColorModeValue("gray.50", "whiteAlpha.100");

    const [editOpen, setEditOpen] = useState(false);
    const [editLoading, setEditLoading] = useState(false);
    const [selected, setSelected] = useState(null);
    const [editName, setEditName] = useState("");
    const [editUnit, setEditUnit] = useState("");
    const [editHashtags, setEditHashtags] = useState([]);
    const [showAllHashtags, setShowAllHashtags] = useState(false);

    const delModal = useCallback(() => ({
        isOpen: false
    }), []);
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [deleteLoading, setDeleteLoading] = useState(false);
    const [deleteItem, setDeleteItem] = useState(null);

    const getProductId = (row) => row?.product_id ?? row?.product?.id ?? row?.id;

    /* ---------------- pagination (sessionStorage) ---------------- */
    const [factoryPage, setFactoryPage] = useState(() => {
        const saved = sessionStorage.getItem(FACTORY_PAGE_KEY);
        return saved ? Number(saved) : 1;
    });

    /* ---------------- search ---------------- */
    const [search, setSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("all");
    const isFirstRender = useRef(true);

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

            const res = await apiLocalProducts.pageAllbyCategoryId(page, searchText, categoryId, factoryId, "product");

            setFactories(res.data.data.records);
            setTotalPage(res.data.data.pagination.total_pages);

        } finally {
            setLoading(false);
        }
    }, []);

    const openEdit = (item) => {
        setSelected(item);
        setEditName(item?.name ?? "");
        setEditUnit(item?.unit ?? "");
        setEditHashtags(Array.isArray(item?.hashtag) ? item.hashtag : []);
        setShowAllHashtags(false);
        setEditOpen(true);
    };

    const closeEdit = () => {
        setEditOpen(false);
        setSelected(null);
    };

    const addHashtag = () => {
        setEditHashtags((prev) => [...prev, ""]);
        setShowAllHashtags(true);
    };

    const removeHashtag = (idx) => {
        setEditHashtags((prev) => prev.filter((_, i) => i !== idx));
    };

    const updateHashtag = (idx, value) => {
        setEditHashtags((prev) => prev.map((h, i) => (i === idx ? value : h)));
    };

    const saveEdit = async () => {
        const productId = getProductId(selected);
        if (!productId) return;
        setEditLoading(true);
        try {
            const cleanedHashtags = Array.from(
                new Set(
                    (editHashtags ?? [])
                        .map((h) => String(h ?? "").trim())
                        .filter(Boolean),
                ),
            );
            await apiLocalProducts.UpdateById(productId, {
                name: editName?.trim(),
                unit: editUnit?.trim(),
                hashtag: cleanedHashtags,
            });
            closeEdit();
            await fetchProducts(factoryPage, debouncedSearch);
        } finally {
            setEditLoading(false);
        }
    };

    const openDelete = (item) => {
        setDeleteItem(item);
        setDeleteOpen(true);
    };

    const closeDelete = () => {
        setDeleteOpen(false);
        setDeleteItem(null);
    };

    const confirmDelete = async () => {
        const productId = getProductId(deleteItem);
        if (!productId) return;
        setDeleteLoading(true);
        try {
            await apiLocalProducts.DeleteById(productId);
            closeDelete();
            await fetchProducts(factoryPage, debouncedSearch);
        } finally {
            setDeleteLoading(false);
        }
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
            <Heading fontSize={"22px"} mb="24px"> <NavLink to={role === 'admin' ? `/factories/${factoryId}` : `/supplier/factories/${factoryId}`}>Products</NavLink> / {categoryName}</Heading>

            {/* Search */}

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
                                    <Th textAlign="right">Actions</Th>
                                </Tr>
                            </Thead>
                            <Tbody>
                                <TableSkeleton rows={15} columns={7} />
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
                                <Th textAlign="right">Actions</Th>
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
                                    <Td textAlign="right">
                                        <HStack justify="flex-end">
                                            <Tooltip label="Edit" placement="bottom">
                                                <IconButton
                                                    size="sm"
                                                    variant="ghost"
                                                    aria-label="Edit"
                                                    icon={<Pencil size={16} />}
                                                    onClick={() => openEdit(item)}
                                                />
                                            </Tooltip>
                                            {role === "admin" ? (
                                                <Tooltip label="Delete" placement="bottom">
                                                    <IconButton
                                                        size="sm"
                                                        variant="ghost"
                                                        colorScheme="red"
                                                        aria-label="Delete"
                                                        icon={<Trash2 size={16} />}
                                                        onClick={() => openDelete(item)}
                                                    />
                                                </Tooltip>
                                            ) : null}
                                        </HStack>
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

            <PaginationBar
                mt="30px"
                page={factoryPage}
                totalPages={totalPage}
                loading={loading}
                onPageChange={(p) => changePagination(p)}
            />

            {/* Edit product modal (ADtasks style) */}
            <Modal
                isOpen={editOpen}
                onClose={closeEdit}
                isCentered
                size="lg"
                motionPreset="slideInBottom"
            >
                <ModalOverlay bg="blackAlpha.600" backdropFilter="blur(6px)" />
                <ModalContent
                    bg="surface"
                    borderRadius="2xl"
                    overflow="hidden"
                    boxShadow="2xl"
                    borderWidth="1px"
                    borderColor={editBorderCol}
                >
                    <Box
                        px={6}
                        py={5}
                        borderBottomWidth="1px"
                        borderColor={editHeaderBorder}
                        bgImage={editHeroBg}
                    >
                        <HStack justify="space-between" pr={10} align="start">
                            <HStack spacing={3} align="start">
                                <Box
                                    w="40px"
                                    h="40px"
                                    borderRadius="xl"
                                    bg={useColorModeValue("white", "whiteAlpha.200")}
                                    display="flex"
                                    alignItems="center"
                                    justifyContent="center"
                                    flexShrink={0}
                                >
                                    <Icon as={Pencil} boxSize={5} color="blue.600" />
                                </Box>
                                <Box minW={0}>
                                    <Text fontWeight="bold" fontSize="lg">
                                        Mahsulotni tahrirlash
                                    </Text>
                                    <Text fontSize="sm" color="gray.500" mt={0.5} noOfLines={2}>
                                        {selected?.name}
                                    </Text>
                                </Box>
                            </HStack>
                            <ModalCloseButton top={4} />
                        </HStack>
                    </Box>

                    <ModalBody px={6} py={5}>
                        <VStack align="stretch" spacing={4}>
                            <Box
                                p={4}
                                bg={editPanelBg}
                                borderRadius="xl"
                                borderWidth="1px"
                                borderColor={editBorderCol}
                            >
                                <Text fontSize="sm" fontWeight="semibold" mb={2}>
                                    Name
                                </Text>
                                <Input
                                    value={editName}
                                    onChange={(e) => setEditName(e.target.value)}
                                    borderRadius="lg"
                                />
                            </Box>

                            <Box
                                p={4}
                                bg={editPanelBg}
                                borderRadius="xl"
                                borderWidth="1px"
                                borderColor={editBorderCol}
                            >
                                <Text fontSize="sm" fontWeight="semibold" mb={2}>
                                    Unit
                                </Text>
                                <Input
                                    value={editUnit}
                                    onChange={(e) => setEditUnit(e.target.value)}
                                    borderRadius="lg"
                                />
                            </Box>

                            <Box
                                p={4}
                                bg={editPanelBg}
                                borderRadius="xl"
                                borderWidth="1px"
                                borderColor={editBorderCol}
                            >
                                <HStack justify="space-between" mb={2}>
                                    <Text fontSize="sm" fontWeight="semibold">
                                        Hashtag
                                    </Text>
                                    <Button
                                        size="sm"
                                        leftIcon={<Plus size={16} />}
                                        onClick={addHashtag}
                                        variant="ghost"
                                    >
                                        Qo&apos;shish
                                    </Button>
                                </HStack>

                                <VStack align="stretch" spacing={2}>
                                    <SimpleGrid columns={{ base: 1, md: 3 }} spacing={3}>
                                        {(showAllHashtags ? editHashtags : editHashtags.slice(0, 5)).map(
                                            (tag, idx) => (
                                                <Box key={idx} position="relative">
                                                    <IconButton
                                                        aria-label="Remove hashtag"
                                                        size="xs"
                                                        variant="solid"
                                                        colorScheme="red"
                                                        icon={<X size={12} />}
                                                        onClick={() => removeHashtag(idx)}
                                                        position="absolute"
                                                        top="-8px"
                                                        right="-8px"
                                                        borderRadius="full"
                                                        minW="20px"
                                                        h="20px"
                                                        p={0}
                                                    />
                                                    <Input
                                                        size="sm"
                                                        value={tag}
                                                        onChange={(e) => updateHashtag(idx, e.target.value)}
                                                        placeholder="hashtag"
                                                        borderRadius="lg"
                                                        pr={2}
                                                    />
                                                </Box>
                                            ),
                                        )}
                                    </SimpleGrid>

                                    {!showAllHashtags && editHashtags.length > 5 ? (
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            onClick={() => setShowAllHashtags(true)}
                                        >
                                            Yana ({editHashtags.length - 5} ta)
                                        </Button>
                                    ) : null}
                                </VStack>
                            </Box>
                        </VStack>
                    </ModalBody>

                    <ModalFooter
                        bg={editFooterBg}
                        borderTopWidth="1px"
                        borderColor={editHeaderBorder}
                        gap={3}
                        py={4}
                        px={6}
                    >
                        <Button variant="ghost" onClick={closeEdit} isDisabled={editLoading}>
                            Bekor qilish
                        </Button>
                        <Button
                            colorScheme="blue"
                            onClick={saveEdit}
                            isLoading={editLoading}
                            loadingText="Saqlanmoqda..."
                            borderRadius="xl"
                            px={8}
                            isDisabled={!editName.trim()}
                        >
                            Saqlash
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>

            <ConfirmDelModal
                isOpen={deleteOpen}
                onClose={closeDelete}
                onConfirm={confirmDelete}
                itemName={deleteItem?.name}
                loading={deleteLoading}
                typeItem={"Local product"}
            />
        </Box>
    );
}

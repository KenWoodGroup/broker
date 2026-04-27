import React, { useState, useEffect } from "react";
import {
  useParams,
  useLocation,
  useNavigate,
  useSearchParams,
} from "react-router-dom";
import Cookies from "js-cookie";
import useDebounce from "../../hooks/useDebounce";
import {
  Box,
  Container,
  Flex,
  Text,
  Button,
  Badge,
  Input,
  InputGroup,
  InputRightElement,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  VStack,
  HStack,
  Skeleton,
  SkeletonText,
  useDisclosure,
  Card,
  CardBody,
  Heading,
  Divider,
  Progress,
  Icon,
  Center,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  Textarea,
  Image,
  SimpleGrid,
  Wrap,
  WrapItem,
  IconButton,
  Tooltip,
} from "@chakra-ui/react";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  DownloadIcon,
  CheckCircleIcon,
} from "@chakra-ui/icons";
import { FiUpload, FiFile, FiPackage } from "react-icons/fi";
import { apiStock } from "../../utils/Controllers/apiStock";
import { apiInvoices } from "../../utils/Controllers/apiInvoices";
import { apiUsers } from "../../utils/Controllers/Users";
import { apiLocalCategories } from "../../utils/Controllers/apiLocalCategories";
import { toastService } from "../../utils/toast";
import { Edit, Edit2, EditIcon, LayoutGrid, Search, X } from "lucide-react";
import SalePriceEditButton from "./components/SalePriceEditButton";
import { PRICE_UPDATE_RULES } from "../../constants/priceFreshness";
import PaginationBar from "../../components/common/PaginationBar";
import CategoryCard from "../ADfacLocalCats/_components/CategoryCard";
import CategoryCardSkeleton from "../../components/ui/CategoryCardSkeleton";

const WarehouseStockPage = () => {
  const temporarelyFreshness = PRICE_UPDATE_RULES.medium;

  const user = Cookies.get("user") ? JSON.parse(Cookies.get("user")) : null;
  const role = (user?.role || "supplier").toLowerCase();

  const [searchParams, setSearchParams] = useSearchParams();
  const taskStockId = searchParams.get("task_stock_id");
  const selectedCategoryId = searchParams.get("category_id");
  const selectedCategoryName = searchParams.get("category_name");

  const { factoryId, warehouseId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const warehouseName = location.state?.warehouseName || "Ombor";

  const [viewMode, setViewMode] = useState(() =>
    selectedCategoryId ? "table" : "categories",
  );

  const [stocks, setStocks] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [lastSyncTime, setLastSyncTime] = useState(null);

  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const [categoryPage, setCategoryPage] = useState(1);
  const [categoryTotalPages, setCategoryTotalPages] = useState(1);
  const [categorySearch, setCategorySearch] = useState("");
  const debouncedCategorySearch = useDebounce(categorySearch.trim() || "all", 500);

  const [taskStock, setTaskStock] = useState(null);
  const [taskStockLoading, setTaskStockLoading] = useState(false);

  useEffect(() => {
    if (!taskStockId) return;
    setTaskStockLoading(true);
    apiStock
      .GetById(taskStockId)
      .then((res) => setTaskStock(res?.data))
      .catch(console.error)
      .finally(() => setTaskStockLoading(false));
  }, [taskStockId]);

  const {
    isOpen: isUploadOpen,
    onOpen: onUploadOpen,
    onClose: onUploadClose,
  } = useDisclosure();
  const [uploadStep, setUploadStep] = useState(1);
  const [invoiceNote, setInvoiceNote] = useState("");
  const [invoiceId, setInvoiceId] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [uploadResult, setUploadResult] = useState(null);
  const [factoryUser, setFactoryUser] = useState(null);
  const [actionType, setActionType] = useState("add");

  const fetchCategories = async (page = 1, append = false, searchText = "all") => {
    if (!factoryId) return;
    setCategoriesLoading(true);
    try {
      const res = await apiLocalCategories.pageAll(page, searchText, factoryId, "product");
      const records = res?.data?.data?.records ?? [];
      const total = res?.data?.data?.pagination?.total_pages ?? 1;
      setCategoryTotalPages(total);
      setCategoryPage(page);
      setCategories((prev) => (append ? [...prev, ...records] : records));
    } finally {
      setCategoriesLoading(false);
    }
  };

  const fetchStocks = async () => {
    setLoading(true);
    try {
      const response = selectedCategoryId
        ? await apiStock.GetByCategory(warehouseId, selectedCategoryId, "product", currentPage)
        : await apiStock.GetByLocationId(warehouseId, currentPage);
      setStocks(response.data?.data?.records || []);
      setPagination(response.data?.data?.pagination || null);
      setLastSyncTime(new Date());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (viewMode !== "table") return;
    fetchStocks();
  }, [currentPage, warehouseId, selectedCategoryId, viewMode]);

  useEffect(() => {
    if (viewMode !== "categories") return;
    fetchCategories(1, false, debouncedCategorySearch);
  }, [factoryId, viewMode, debouncedCategorySearch]);

  useEffect(() => {
    if (viewMode === "table") setCurrentPage(1);
  }, [selectedCategoryId, viewMode]);

  const openCategories = () => {
    setViewMode("categories");
    const next = new URLSearchParams(searchParams);
    next.delete("category_id");
    next.delete("category_name");
    setSearchParams(next, { replace: true });
  };

  const openTableAll = () => {
    setViewMode("table");
    const next = new URLSearchParams(searchParams);
    next.delete("category_id");
    next.delete("category_name");
    setSearchParams(next, { replace: true });
  };

  const selectCategory = (cat) => {
    setViewMode("table");
    const next = new URLSearchParams(searchParams);
    next.set("category_id", String(cat?.id));
    next.set("category_name", cat?.name ? String(cat.name) : "");
    setSearchParams(next, { replace: true });
  };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await apiUsers.getFactoryUsers(factoryId);
      const director = response.data?.find((item) => item.role === "factory");
      setFactoryUser(director);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleUploadClick = () => {
    setUploadStep(1);
    setInvoiceNote("");
    setSelectedFile(null);
    setInvoiceId(null);
    setUploadResult(null);
    if (factoryUser?.id) {
      onUploadOpen();
    } else {
      toastService.error("Zavod egasi topilmadi");
    }
  };

  const handleCreateInvoice = async () => {
    setUploadLoading(true);
    try {
      const userId = factoryUser?.id;
      const data = {
        created_by: userId,
        note: invoiceNote,
        receiver_id: warehouseId,
        sender_id: factoryId,
        status: "received",
        type: actionType === "add" ? "incoming" : "price_update",
      };
      const response = await apiInvoices.CreateInvoice(data);
      setInvoiceId(response.data?.invoice?.id);
      setUploadStep(2);
    } finally {
      setUploadLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const validTypes = [
        "application/vnd.ms-excel",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      ];
      const maxSize = 5 * 1024 * 1024;
      if (!validTypes.includes(file.type)) return;
      if (file.size > maxSize) return;
      setSelectedFile(file);
    }
  };

  const handleUploadExcel = async () => {
    console.log("invoiceId:", invoiceId);
    if (!selectedFile) return;
    if (actionType === "add" && !invoiceId) return;

    setUploadLoading(true);
    try {
      const formData = new FormData();
      formData.append("file", selectedFile);

      let response;

      if (actionType === "update") {
        response = await apiInvoices.UploadSalePriceExcel(
          warehouseId,
          formData,
        );
      } else {
        response = await apiInvoices.UploadExel(invoiceId, formData);
      }

      setUploadResult(response.data);
      setUploadStep(3);
      await fetchStocks();
    } finally {
      setUploadLoading(false);
    }
  };

  const handleCloseUpload = () => {
    onUploadClose();
    setUploadStep(1);
    setInvoiceNote("");
    setSelectedFile(null);
    setInvoiceId(null);
    setUploadResult(null);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleDateString("uz-UZ", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  function getDaysDiff(dateString) {
    const now = Date.now();
    const updated = new Date(dateString).getTime();
    return Math.floor((now - updated) / (1000 * 60 * 60 * 24));
  }

  function getPriceFreshness(dateString, type) {
    const rule = PRICE_UPDATE_RULES[type];
    const days = getDaysDiff(dateString);
    if (days <= rule.green) return "green";
    if (days <= rule.yellow) return "warning";
    return "red";
  }

  const renderStockCard = (stock, red) => (
    <Card
      key={stock?.id}
      bg={red ? "red" : "surface"}
      borderWidth="1px"
      borderColor="border"
      _hover={{ shadow: "md" }}
      transition="all 0.2s"
      position="relative"
      role="group"
      cursor="pointer"
      onClick={() =>
        navigate(`?name=${encodeURIComponent(stock?.product?.name)}`, {
          replace: true,
        })
      }
    >
      <CardBody>
        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
          {/* Product Info */}
          <VStack align="start" spacing={1}>
            <Text fontSize="xs" color="gray.500" fontWeight="medium">
              MAHSULOT
            </Text>
            <Text fontWeight="semibold" color="text" fontSize="lg">
              {stock?.product?.name}
            </Text>
            <Badge colorScheme="gray" fontSize="xs">
              {stock?.product?.unit}
            </Badge>
          </VStack>

          {/* Prices */}
          <VStack align="start" spacing={1}>
            <Text fontSize="xs" color="gray.500" fontWeight="medium">
              NARXLAR
            </Text>
            <VStack align="start" spacing={1} width="100%">
              <HStack width="100%">
                <Text fontSize="sm" color="gray.600">
                  Xarid:
                </Text>
                <Text fontWeight="semibold" color="text">
                  {parseFloat(stock?.purchase_price).toLocaleString()} so'm
                </Text>
              </HStack>
              {stock?.sale_price_type && stock?.sale_price_type?.length > 0 ? (
                stock?.sale_price_type.map((priceType) => (
                  <HStack key={priceType?.id} width="100%">
                    <Text fontSize="sm" color="gray.600">
                      {priceType?.price_type?.name}:
                    </Text>
                    <Text
                      fontWeight="semibold"
                      color={getPriceFreshness(priceType?.updatedAt, "medium")}
                    >
                      {parseFloat(priceType?.sale_price).toLocaleString()} (
                      {getDaysDiff(priceType?.updatedAt)} kun oldin)
                    </Text>
                  </HStack>
                ))
              ) : (
                <Text fontSize="sm" color="orange.500" fontStyle="italic">
                  Sotuv narxi belgilanmagan
                </Text>
              )}
            </VStack>
          </VStack>

          {/* Date */}
          <VStack align="start" spacing={1}>
            <Text fontSize="xs" color="gray.500" fontWeight="medium">
              SANA
            </Text>
            <Text fontSize="sm" color="text">
              {formatDate(stock?.createdAt)}
            </Text>
            {stock?.barcode && (
              <Text fontSize="xs" color="gray.500">
                Barcode: {stock?.barcode}
              </Text>
            )}
          </VStack>
        </SimpleGrid>

        {/* Hover actions */}
        <VStack
          spacing={1}
          opacity={0}
          transition="opacity 0.2s"
          _groupHover={{ opacity: 1 }}
          position="absolute"
          top={4}
          right={4}
          onClick={(e) => e.stopPropagation()}
        >
          <SalePriceEditButton
            salePriceTypes={stock?.sale_price_type}
            stockId={stock?.id}
            onSave={() => fetchStocks()}
          />
        </VStack>
      </CardBody>
    </Card>
  );

  const renderTaskStockCard = (stock) => {
    if (!stock) return null;
    const daysAgo = getDaysDiff(stock?.updatedAt || stock?.createdAt);
    console.log("taskStock sale_price_type:", taskStock?.sale_price_type);

    return (
      <Box
        cursor={"pointer"}
        bg="#ed6b0e"
        borderRadius="8px"
        border="1px solid rgba(255,255,255,0.15)"
        px={6}
        py={2}
        mb={2}
        position="relative"
        role="group"
      >
        {/* Oxirgi yangilanish */}
        <Text fontSize="13px" color="rgba(255,255,255,0.6)" mb={4}>
          Oxirgi yangilanish: {formatDate(stock?.updatedAt || stock?.createdAt)}
        </Text>

        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
          {/* MAHSULOT */}
          <VStack align="start" spacing={2}>
            <Text
              fontSize="11px"
              fontWeight="600"
              color="rgba(255,255,255,0.5)"
              letterSpacing="0.08em"
            >
              MAHSULOT
            </Text>
            <Text
              fontSize="17px"
              fontWeight="700"
              color="#fff"
              lineHeight="1.3"
            >
              {stock?.product?.name || "—"}
            </Text>
            <Box
              display="inline-block"
              bg="rgba(0,0,0,0.3)"
              color="rgba(255,255,255,0.85)"
              fontSize="11px"
              fontWeight="600"
              px={2}
              py="2px"
              borderRadius="5px"
              border="1px solid rgba(255,255,255,0.2)"
            >
              {stock?.product?.unit.toUpperCase() || "—"}
            </Box>
          </VStack>

          {/* NARXLAR */}
          <VStack align="start" spacing={2}>
            <Text
              fontSize="11px"
              fontWeight="600"
              color="rgba(255,255,255,0.5)"
              letterSpacing="0.08em"
            >
              NARXLAR
            </Text>
            <Text fontSize="14px" color="rgba(255,255,255,0.75)">
              Xarid:{" "}
              <Text as="span" fontWeight="700" color="#fff">
                {parseFloat(stock?.purchase_price || 0).toLocaleString()} so'm
              </Text>
            </Text>
            {stock?.sale_price_type && stock?.sale_price_type?.length > 0 ? (
              stock.sale_price_type.map((priceType) => (
                <Text
                  key={priceType?.id}
                  fontSize="14px"
                  color="#FFD166"
                  fontWeight="600"
                >
                  {priceType?.price_type?.name || "ulgurji"}:{""}
                  {parseFloat(priceType?.sale_price).toLocaleString()} (
                  {getDaysDiff(priceType?.updatedAt)} kun oldin)
                </Text>
              ))
            ) : (
              <Text fontSize="14px" color="#FFD166" fontStyle="italic">
                Sotuv narxi belgilanmagan
              </Text>
            )}
          </VStack>

          {/* SANA */}
          <VStack align="start" spacing={2}>
            <Text
              fontSize="11px"
              fontWeight="600"
              color="rgba(255,255,255,0.5)"
              letterSpacing="0.08em"
            >
              SANA
            </Text>
            <Text fontSize="14px" color="#fff" fontWeight="500">
              {formatDate(stock?.createdAt)}
            </Text>
            {stock?.barcode && (
              <Text fontSize="12px" color="rgba(255,255,255,0.55)">
                Barcode: {stock?.barcode}
              </Text>
            )}
          </VStack>
        </SimpleGrid>
        <Box
          position="absolute"
          top={4}
          right={4}
          opacity={0}
          _groupHover={{ opacity: 1 }}
          transition="opacity 0.2s"
          onClick={(e) => e.stopPropagation()}
        >
          <SalePriceEditButton
            salePriceTypes={stock?.sale_price_type ?? []}
            stockId={stock?.id}
            onSave={() => fetchStocks()}
          />
        </Box>
      </Box>
    );
  };
  // ------------------------------------------

  return (
    <Box minH="100vh" bg="bg">
      <Box
        bg="surface"
        borderBottom="1px"
        borderColor="border"
        position="sticky"
        top={0}
        zIndex={1}
      >
        <Container maxW="container.2xl" py={4}>
          <VStack align="stretch" spacing={3}>
            <Breadcrumb
              spacing="8px"
              separator={<ChevronRightIcon color="gray.500" />}
              fontSize="sm"
            >
              <BreadcrumbItem>
                <BreadcrumbLink onClick={() => navigate(-1)} color="link">
                  Omborlar
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbItem isCurrentPage>
                <BreadcrumbLink color="text">{warehouseName}</BreadcrumbLink>
              </BreadcrumbItem>
            </Breadcrumb>

            <HStack justify="space-between">
              <VStack align="start" spacing={1}>
                <Heading size="lg" color="text">
                  {warehouseName}
                </Heading>
                {viewMode === "table" && selectedCategoryName ? (
                  <Text fontSize="xs" color="gray.500">
                    Category: {selectedCategoryName}
                  </Text>
                ) : null}
                {lastSyncTime && (
                  <Text fontSize="xs" color="gray.500">
                    Oxirgi yangilanish: {formatDate(lastSyncTime)}
                  </Text>
                )}
              </VStack>
              <HStack>
                <Tooltip
                  label={viewMode === "table" ? "Category" : "Table"}
                  placement="bottom"
                >
                  <IconButton
                    aria-label={viewMode === "table" ? "Category" : "Table"}
                    onClick={() =>
                      viewMode === "table" ? openCategories() : openTableAll()
                    }
                    bg={viewMode === "table" ? "brand.400" : "neutral.300"}
                    _hover={{ bg: "" }}
                    color={viewMode === "table" ? "neutral.50" : "brand.800"}
                    icon={<LayoutGrid />}
                  />
                </Tooltip>
                <Button
                  leftIcon={<DownloadIcon />}
                  colorScheme="green"
                  onClick={handleUploadClick}
                >
                  Excel yuklash
                </Button>
              </HStack>
            </HStack>
          </VStack>
        </Container>
      </Box>

      <Container maxW="container.2xl" pt={6}>
        {taskStockId && (
          <Box mb={2}>
            {taskStockLoading ? (
              <Box bg="#E8660A" borderRadius="12px" p={5} mb={4}>
                <SkeletonText
                  noOfLines={3}
                  spacing={3}
                  startColor="rgba(255,255,255,0.1)"
                  endColor="rgba(255,255,255,0.3)"
                />
              </Box>
            ) : (
              renderTaskStockCard(taskStock)
            )}
          </Box>
        )}
      </Container>

      <Container maxW="container.2xl" py={6}>
        {viewMode === "categories" ? (
          <Box w="full">
            <VStack align="stretch" spacing={4}>
              <HStack justify="space-between" gap={4} flexWrap="wrap">
                <Heading size="sm" color="text">
                  Mahsulot kategoriyalari
                </Heading>
                {categoryPage < categoryTotalPages && (
                  <Button
                    size="sm"
                    variant="ghost"
                    isLoading={categoriesLoading}
                    onClick={() => fetchCategories(categoryPage + 1, true, debouncedCategorySearch)}
                  >
                    Yana yuklash
                  </Button>
                )}
              </HStack>

              <InputGroup maxW={{ base: "100%", md: "60%" }}>
                <Input
                  placeholder="Search categories..."
                  value={categorySearch}
                  onChange={(e) => setCategorySearch(e.target.value)}
                />
                <InputRightElement>
                  {categorySearch ? (
                    <IconButton
                      size="sm"
                      variant="ghost"
                      icon={<X size={16} />}
                      aria-label="Clear"
                      onClick={() => setCategorySearch("")}
                    />
                  ) : (
                    <Search size={16} />
                  )}
                </InputRightElement>
              </InputGroup>

              {categoriesLoading && categories.length === 0 ? (
                <SimpleGrid
                  w="full"
                  columns={{ base: 1, sm: 2, lg: 3, xl: 4, "2xl": 5 }}
                  spacing="20px"
                >
                  {Array.from({ length: 9 }).map((_, i) => (
                    <CategoryCardSkeleton key={i} />
                  ))}
                </SimpleGrid>
              ) : categories.length === 0 ? (
                <Center py={10}>
                  <VStack spacing={2}>
                    <Text fontWeight="semibold" color="text">
                      Category yo'q
                    </Text>
                    <Text fontSize="sm" color="gray.500" textAlign="center">
                      Hozircha kategoriyalar topilmadi.
                    </Text>
                  </VStack>
                </Center>
              ) : (
                <SimpleGrid
                  w="full"
                  columns={{ base: 1, sm: 2, lg: 3, xl: 4, "2xl": 5 }}
                  spacing="20px"
                >
                  {categories.map((cat) => (
                    <CategoryCard
                      key={cat?.id}
                      role={role}
                      showActions={false}
                      category={cat}
                      onEdit={() => fetchCategories(1, false, debouncedCategorySearch)}
                      onDelete={() => fetchCategories(1, false, debouncedCategorySearch)}
                      onOpen={() => selectCategory(cat)}
                    />
                  ))}
                </SimpleGrid>
              )}
            </VStack>
          </Box>
        ) : loading ? (
          <VStack spacing={4} align="stretch">
            {[1, 2, 3, 4, 5].map((i) => (
              <Card key={i} bg="surface">
                <CardBody>
                  <HStack justify="space-between">
                    <SkeletonText noOfLines={3} width="40%" />
                    <SkeletonText noOfLines={3} width="30%" />
                    <SkeletonText noOfLines={3} width="20%" />
                  </HStack>
                </CardBody>
              </Card>
            ))}
          </VStack>
        ) : stocks.length === 0 ? (
          <Card bg="surface">
            <CardBody>
              <VStack spacing={4} py={12}>
                <Icon as={FiPackage} boxSize={16} color="gray.300" />
                <VStack spacing={2}>
                  <Text fontSize="lg" fontWeight="medium" color="text">
                    {selectedCategoryId
                      ? "Bu kategoriyada mahsulot yo'q"
                      : "Hozircha mahsulotlar yo'q"}
                  </Text>
                  <Text fontSize="sm" color="gray.500">
                    {selectedCategoryId
                      ? "Boshqa kategoriyani tanlang"
                      : "Excel orqali mahsulotlarni yuklang"}
                  </Text>
                </VStack>
                <Button
                  leftIcon={<DownloadIcon />}
                  colorScheme="green"
                  onClick={handleUploadClick}
                >
                  Excel yuklash
                </Button>
              </VStack>
            </CardBody>
          </Card>
        ) : (
          <>
            <VStack spacing={3} align="stretch">
              {stocks.map((stock) => renderStockCard(stock))}
            </VStack>

            {pagination && (
              <PaginationBar
                mt={8}
                page={currentPage}
                totalPages={pagination.total_pages ?? 1}
                loading={loading}
                onPageChange={(p) => setCurrentPage(p)}
              />
            )}
          </>
        )}
      </Container>

      {/* Upload Excel Modal */}
      <Modal
        isOpen={isUploadOpen}
        onClose={uploadStep === 3 ? handleCloseUpload : onUploadClose}
        size="lg"
        closeOnOverlayClick={false}
      >
        <ModalOverlay backdropFilter="blur(4px)" />
        <ModalContent
          bg="surface"
          borderWidth="1px"
          borderColor="border"
          borderRadius="2xl"
          boxShadow="xl"
        >
          <ModalHeader color="text" pb={2}>
            {actionType === "update"
              ? "Narxni yangilash"
              : uploadStep === 1
                ? "Invoice tayyorlash"
                : uploadStep === 2
                  ? "Excel yuklash"
                  : "Muvaffaqiyatli yuklandi"}
          </ModalHeader>
          {uploadStep !== 3 && <ModalCloseButton />}

          <ModalBody>
            <Flex
              gap={"50px"}
              m={4}
              mb={9}
              alignItems={"center"}
              justifyContent={"center"}
            >
              <Button
                colorScheme={actionType === "add" ? "blue" : "gray"}
                onClick={() => setActionType("add")}
              >
                Mahsulot qo'shish
              </Button>
              <Button
                colorScheme={actionType === "update" ? "blue" : "gray"}
                onClick={() => setActionType("update")}
              >
                Narxni yangilash
              </Button>
            </Flex>

            {actionType === "add" && (
              <VStack spacing={4} mb={6}>
                <HStack width="100%" justify="space-between">
                  {[1, 2, 3].map((step) => (
                    <React.Fragment key={step}>
                      <Circle
                        size="40px"
                        bg={uploadStep >= step ? "blue.500" : "gray.200"}
                        color={uploadStep >= step ? "white" : "gray.500"}
                        fontWeight="bold"
                      >
                        {uploadStep > step ? <CheckCircleIcon /> : step}
                      </Circle>
                      {step < 3 && (
                        <Box
                          flex={1}
                          height="2px"
                          bg={uploadStep > step ? "blue.500" : "gray.200"}
                        />
                      )}
                    </React.Fragment>
                  ))}
                </HStack>
                <HStack
                  width="100%"
                  justify="space-between"
                  fontSize="xs"
                  color="gray.600"
                >
                  <Text>Invoice</Text>
                  <Text>Excel</Text>
                  <Text>Natija</Text>
                </HStack>
              </VStack>
            )}

            {actionType === "add" && uploadStep === 1 && (
              <VStack spacing={4}>
                <Textarea
                  placeholder="Yangi mahsulotlar uchun izoh"
                  value={invoiceNote}
                  onChange={(e) => setInvoiceNote(e.target.value)}
                />
              </VStack>
            )}
            {((actionType === "update" && !uploadResult) ||
              (actionType === "add" && uploadStep === 2)) && (
              <VStack spacing={4}>
                <Input
                  type="file"
                  accept=".xls,.xlsx"
                  onChange={handleFileChange}
                  display="none"
                  id="excel-upload"
                />
                <label htmlFor="excel-upload" style={{ width: "100%" }}>
                  <Card
                    bg="bg"
                    borderWidth="2px"
                    borderStyle="dashed"
                    borderColor={selectedFile ? "green.300" : "gray.300"}
                    cursor="pointer"
                    _hover={{ borderColor: "blue.400" }}
                    transition="all 0.2s"
                  >
                    <CardBody>
                      <VStack spacing={3} py={6}>
                        <Icon
                          as={selectedFile ? FiFile : FiUpload}
                          boxSize={12}
                          color={selectedFile ? "green.500" : "gray.400"}
                        />
                        {selectedFile ? (
                          <>
                            <Text fontWeight="semibold" color="text">
                              {selectedFile.name}
                            </Text>
                            <Text fontSize="sm" color="gray.500">
                              {(selectedFile.size / 1024).toFixed(2)} KB
                            </Text>
                          </>
                        ) : (
                          <>
                            <Text fontWeight="semibold" color="text">
                              Excel faylni yuklash
                            </Text>
                            <Text fontSize="sm" color="gray.500">
                              .xls yoki .xlsx (max 5MB)
                            </Text>
                          </>
                        )}
                      </VStack>
                    </CardBody>
                  </Card>
                </label>
                {uploadLoading && (
                  <Box width="100%">
                    <Progress size="sm" isIndeterminate colorScheme="blue" />
                  </Box>
                )}
              </VStack>
            )}

            {actionType === "add" && uploadStep === 3 && uploadResult && (
              <VStack spacing={6}>
                <Icon as={CheckCircleIcon} boxSize={20} color="green.500" />
                <VStack spacing={2}>
                  <Text fontSize="lg" fontWeight="semibold" color="text">
                    {uploadResult?.message}
                  </Text>
                  <Card bg="bg" width="100%">
                    <CardBody>
                      <SimpleGrid columns={2} spacing={4}>
                        <VStack>
                          <Text
                            fontSize="3xl"
                            fontWeight="bold"
                            color="green.600"
                          >
                            {uploadResult?.summary?.created}
                          </Text>
                          <Text fontSize="sm" color="gray.600">
                            Yaratildi
                          </Text>
                        </VStack>
                        <VStack>
                          <Text
                            fontSize="3xl"
                            fontWeight="bold"
                            color="orange.500"
                          >
                            {uploadResult?.summary?.skipped}
                          </Text>
                          <Text fontSize="sm" color="gray.600">
                            Tashlab ketildi
                          </Text>
                        </VStack>
                      </SimpleGrid>
                    </CardBody>
                  </Card>
                  {uploadResult?.summary?.skipped > 0 && (
                    <Box>
                      {Object.entries(uploadResult?.skipped_details || {}).map(
                        ([key, value]) => (
                          <Text key={key}>
                            {key}: {value}
                          </Text>
                        ),
                      )}
                    </Box>
                  )}
                </VStack>
              </VStack>
            )}

            {actionType === "update" && uploadResult && (
              <VStack spacing={4}>
                <Icon
                  as={CheckCircleIcon}
                  boxSize={16}
                  color="green.500"
                  mt={3}
                />
                <Text fontSize="lg" fontWeight="semibold" color="text">
                  Narxlar yangilandi!
                </Text>
                <Card bg="bg" width="100%">
                  <CardBody>
                    <SimpleGrid columns={3} spacing={4}>
                      <VStack>
                        <Text fontSize="3xl" fontWeight="bold" color="blue.400">
                          {uploadResult?.summary?.total_rows ?? 0}
                        </Text>
                        <Text fontSize="sm" color="gray.500" textAlign="center">
                          Jami qatorlar
                        </Text>
                      </VStack>
                      <VStack>
                        <Text
                          fontSize="3xl"
                          fontWeight="bold"
                          color="green.500"
                        >
                          {uploadResult?.summary?.updated ?? 0}
                        </Text>
                        <Text fontSize="sm" color="gray.500" textAlign="center">
                          Yangilandi
                        </Text>
                      </VStack>
                      <VStack>
                        <Text
                          fontSize="3xl"
                          fontWeight="bold"
                          color="orange.400"
                        >
                          {uploadResult?.summary?.skipped ?? 0}
                        </Text>
                        <Text fontSize="sm" color="gray.500" textAlign="center">
                          O'tkazildi
                        </Text>
                      </VStack>
                      <Box></Box>
                    </SimpleGrid>
                  </CardBody>
                </Card>
              </VStack>
            )}
            {uploadResult?.skipped_details?.length > 0 && (
              <Card bg="bg" width="100%" mt={3}>
                <CardBody>
                  <Text
                    fontSize="sm"
                    fontWeight="600"
                    color="orange.400"
                    mb={2}
                  >
                    O'tkazib yuborilganlar:
                  </Text>
                  <VStack align="start" spacing={2}>
                    {uploadResult.skipped_details.map((item, index) => (
                      <Box key={index} maxH="200px" overflowY="auto">
                        <Text fontSize="sm" color="text" fontWeight="600">
                          {item.name}
                        </Text>
                        <Text fontSize="xs" color="gray.400">
                          {item.reason}
                        </Text>
                      </Box>
                    ))}
                  </VStack>
                </CardBody>
              </Card>
            )}
          </ModalBody>

          <ModalFooter>
            {actionType === "update" ? (
              uploadResult ? (
                <Button
                  colorScheme="blue"
                  onClick={handleCloseUpload}
                  width="100%"
                  borderRadius="xl"
                >
                  Yopish
                </Button>
              ) : (
                <>
                  <Button
                    variant="ghost"
                    mr={3}
                    onClick={onUploadClose}
                    isDisabled={uploadLoading}
                    borderRadius="xl"
                  >
                    Bekor qilish
                  </Button>
                  <Button
                    colorScheme="green"
                    onClick={handleUploadExcel}
                    isDisabled={!selectedFile}
                    isLoading={uploadLoading}
                    borderRadius="xl"
                  >
                    Yuklash
                  </Button>
                </>
              )
            ) : (
              <>
                {uploadStep === 1 && (
                  <>
                    <Button variant="ghost" mr={3} onClick={onUploadClose}>
                      Bekor qilish
                    </Button>
                    <Button
                      colorScheme="blue"
                      onClick={handleCreateInvoice}
                      isLoading={uploadLoading}
                      borderRadius="xl"
                    >
                      Invoice tayyorlash
                    </Button>
                  </>
                )}
                {uploadStep === 2 && (
                  <>
                    <Button
                      variant="ghost"
                      mr={3}
                      onClick={onUploadClose}
                      isDisabled={uploadLoading}
                      borderRadius="xl"
                    >
                      Bekor qilish
                    </Button>
                    <Button
                      colorScheme="green"
                      onClick={handleUploadExcel}
                      isDisabled={!selectedFile}
                      isLoading={uploadLoading}
                      borderRadius="xl"
                    >
                      Invoice yaratish
                    </Button>
                  </>
                )}
                {uploadStep === 3 && (
                  <Button
                    colorScheme="blue"
                    onClick={handleCloseUpload}
                    width="100%"
                    borderRadius="xl"
                  >
                    Yopish
                  </Button>
                )}
              </>
            )}
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

const Circle = ({ size, bg, color, fontWeight, children }) => (
  <Flex
    width={size}
    height={size}
    borderRadius="full"
    bg={bg}
    color={color}
    fontWeight={fontWeight}
    align="center"
    justify="center"
  >
    {children}
  </Flex>
);

export default WarehouseStockPage;

import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Input,
  InputGroup,
  InputRightElement,
  FormControl,
  FormLabel,
  Textarea,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalBody,
  VStack,
  HStack,
  Skeleton,
  SkeletonText,
  useDisclosure,
  useColorMode,
  SimpleGrid,
  Heading,
  IconButton,
  Text,
  Badge,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Select,
  Flex,
} from "@chakra-ui/react";
import { AddIcon, SearchIcon, CloseIcon } from "@chakra-ui/icons";
import {
  Layers,
  Building2,
  PencilLine,
  Trash2,
  LayoutGrid,
  ArrowLeft,
  Package,
  AlertTriangle,
} from "lucide-react";
import { apiBaseCategory } from "../../utils/Controllers/apiBaseCategory";

const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
};

const ModalHeaderWithIcon = ({
  icon: IconComp,
  title,
  subtitle,
  onClose,
  isDark,
}) => (
  <Box
    px="24px"
    pt="20px"
    pb="16px"
    borderBottom="1px solid"
    borderColor={isDark ? "rgba(255,255,255,0.08)" : "rgba(99,102,241,0.15)"}
    bg={
      isDark
        ? "linear-gradient(135deg, #1e2d45 0%, #151f30 100%)"
        : "linear-gradient(135deg, #ede9fe 0%, #e0e7ff 100%)"
    }
    borderTopRadius="16px"
  >
    <HStack spacing="14px" align="center">
      <Flex
        w="40px"
        h="40px"
        borderRadius="10px"
        bg={isDark ? "rgba(99,163,255,0.18)" : "rgba(99,102,241,0.15)"}
        align="center"
        justify="center"
        flexShrink={0}
      >
        <IconComp size={18} color={isDark ? "#63a3ff" : "#6366f1"} />
      </Flex>
      <Box flex={1}>
        <Text
          fontWeight="700"
          fontSize="16px"
          color={isDark ? "white" : "#1e1b4b"}
          lineHeight="1.3"
        >
          {title}
        </Text>
        {subtitle && (
          <Text
            fontSize="12px"
            color={isDark ? "rgba(255,255,255,0.5)" : "rgba(67,56,202,0.65)"}
            fontWeight="500"
            mt="2px"
          >
            {subtitle}
          </Text>
        )}
      </Box>
      <IconButton
        icon={<CloseIcon boxSize="10px" />}
        size="sm"
        variant="ghost"
        onClick={onClose}
        borderRadius="8px"
        aria-label="Yopish"
        color={isDark ? "rgba(255,255,255,0.5)" : "rgba(99,102,241,0.5)"}
        _hover={{
          bg: isDark ? "rgba(255,255,255,0.1)" : "rgba(99,102,241,0.1)",
          color: isDark ? "white" : "#4338ca",
        }}
      />
    </HStack>
  </Box>
);

const DeleteModalHeader = ({ title, subtitle, onClose, isDark }) => (
  <Box
    px="24px"
    pt="20px"
    pb="16px"
    borderBottom="1px solid"
    borderColor={isDark ? "rgba(239,68,68,0.2)" : "rgba(239,68,68,0.15)"}
    bg={
      isDark
        ? "linear-gradient(135deg, #7f1d1d 0%, #5a1010 100%)"
        : "linear-gradient(135deg, #fff1f2 0%, #ffe4e6 100%)"
    }
    borderTopRadius="16px"
  >
    <HStack spacing="14px" align="center">
      <Flex
        w="40px"
        h="40px"
        borderRadius="10px"
        bg={isDark ? "rgba(239,68,68,0.2)" : "rgba(239,68,68,0.12)"}
        align="center"
        justify="center"
        flexShrink={0}
      >
        <AlertTriangle size={18} color={isDark ? "#f87171" : "#ef4444"} />
      </Flex>
      <Box flex={1}>
        <Text
          fontWeight="700"
          fontSize="16px"
          color={isDark ? "white" : "#7f1d1d"}
          lineHeight="1.3"
        >
          {title}
        </Text>
        {subtitle && (
          <Text
            fontSize="12px"
            color={isDark ? "rgba(252,165,165,0.85)" : "rgba(185,28,28,0.65)"}
            fontWeight="400"
            mt="2px"
          >
            {subtitle}
          </Text>
        )}
      </Box>
      <IconButton
        icon={<CloseIcon boxSize="10px" />}
        size="sm"
        variant="ghost"
        onClick={onClose}
        borderRadius="8px"
        aria-label="Yopish"
        color={isDark ? "rgba(255,255,255,0.5)" : "rgba(239,68,68,0.5)"}
        _hover={{
          bg: isDark ? "rgba(255,255,255,0.1)" : "rgba(239,68,68,0.08)",
          color: isDark ? "white" : "#dc2626",
        }}
      />
    </HStack>
  </Box>
);

const StyledInput = ({ label, isRequired, isDark, ...props }) => (
  <FormControl isRequired={isRequired} width="100%">
    <FormLabel
      fontSize="13px"
      fontWeight="600"
      mb="6px"
      letterSpacing="0.01em"
      color={isDark ? "rgba(255,255,255,0.8)" : "rgba(15,30,60,0.85)"}
    >
      {label}
    </FormLabel>
    <Input
      bg={isDark ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.75)"}
      border="1.5px solid"
      borderColor={isDark ? "rgba(255,255,255,0.12)" : "rgba(30,60,120,0.15)"}
      borderRadius="10px"
      color={isDark ? "white" : "#0f1e3c"}
      fontSize="14px"
      h="44px"
      px="14px"
      _placeholder={{
        color: isDark ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.3)",
      }}
      _hover={{
        borderColor: isDark ? "rgba(255,255,255,0.25)" : "rgba(30,60,120,0.3)",
        bg: isDark ? "rgba(255,255,255,0.07)" : "white",
      }}
      _focus={{
        borderColor: "#3b82f6",
        bg: isDark ? "rgba(255,255,255,0.07)" : "white",
        boxShadow: "0 0 0 3px rgba(59,130,246,0.15)",
      }}
      transition="all 0.15s"
      {...props}
    />
  </FormControl>
);

const StyledSelect = ({ label, isRequired, isDark, children, ...props }) => (
  <FormControl isRequired={isRequired} width="100%">
    <FormLabel
      fontSize="13px"
      fontWeight="600"
      mb="6px"
      letterSpacing="0.01em"
      color={isDark ? "rgba(255,255,255,0.8)" : "rgba(15,30,60,0.85)"}
    >
      {label}
    </FormLabel>
    <Select
      bg={isDark ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.75)"}
      border="1.5px solid"
      borderColor={isDark ? "rgba(255,255,255,0.12)" : "rgba(30,60,120,0.15)"}
      borderRadius="10px"
      color={isDark ? "white" : "#0f1e3c"}
      fontSize="14px"
      h="44px"
      _hover={{
        borderColor: isDark ? "rgba(255,255,255,0.25)" : "rgba(30,60,120,0.3)",
      }}
      _focus={{
        borderColor: "#3b82f6",
        boxShadow: "0 0 0 3px rgba(59,130,246,0.15)",
      }}
      sx={{
        option: {
          bg: isDark ? "#172031" : "white",
          color: isDark ? "white" : "#0f1e3c",
        },
      }}
      transition="all 0.15s"
      {...props}
    >
      {children}
    </Select>
  </FormControl>
);

const StyledTextarea = ({
  label,
  isRequired,
  charCount,
  maxLength,
  isDark,
  ...props
}) => (
  <FormControl isRequired={isRequired} width="100%">
    <HStack justify="space-between" mb="6px">
      <HStack spacing="6px">
        <FormLabel
          fontSize="13px"
          fontWeight="600"
          mb="0"
          letterSpacing="0.01em"
          color={isDark ? "rgba(255,255,255,0.8)" : "rgba(15,30,60,0.85)"}
        >
          {label}
        </FormLabel>
        {!isRequired && (
          <Badge
            fontSize="10px"
            colorScheme="gray"
            variant="subtle"
            borderRadius="4px"
            px="5px"
            py="1px"
          >
            ixtiyoriy
          </Badge>
        )}
      </HStack>
      {maxLength && (
        <Text
          fontSize="11px"
          color={isDark ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.3)"}
        >
          {charCount}/{maxLength}
        </Text>
      )}
    </HStack>
    <Textarea
      bg={isDark ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.75)"}
      border="1.5px solid"
      borderColor={isDark ? "rgba(255,255,255,0.12)" : "rgba(30,60,120,0.15)"}
      borderRadius="10px"
      color={isDark ? "white" : "#0f1e3c"}
      fontSize="14px"
      px="14px"
      py="10px"
      _placeholder={{
        color: isDark ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.3)",
      }}
      _hover={{
        borderColor: isDark ? "rgba(255,255,255,0.25)" : "rgba(30,60,120,0.3)",
        bg: isDark ? "rgba(255,255,255,0.07)" : "white",
      }}
      _focus={{
        borderColor: "#3b82f6",
        bg: isDark ? "rgba(255,255,255,0.07)" : "white",
        boxShadow: "0 0 0 3px rgba(59,130,246,0.15)",
      }}
      resize="none"
      transition="all 0.15s"
      {...props}
    />
  </FormControl>
);

const ModalActions = ({
  onCancel,
  onConfirm,
  confirmLabel,
  isLoading,
  isDisabled,
  confirmScheme = "blue",
  isDark,
}) => (
  <HStack
    justify="flex-end"
    spacing="10px"
    px="24px"
    py="16px"
    borderTop="1px solid"
    borderColor={isDark ? "rgba(255,255,255,0.07)" : "rgba(30,60,120,0.08)"}
    bg={isDark ? "rgba(0,0,0,0.15)" : "rgba(30,60,120,0.03)"}
    borderBottomRadius="16px"
  >
    <Button
      variant="ghost"
      fontSize="14px"
      fontWeight="500"
      h="38px"
      px="16px"
      borderRadius="9px"
      color={isDark ? "rgba(255,255,255,0.55)" : "rgba(0,0,0,0.45)"}
      _hover={{
        bg: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)",
        color: isDark ? "white" : "black",
      }}
      onClick={onCancel}
    >
      Bekor qilish
    </Button>
    <Button
      colorScheme={confirmScheme}
      fontSize="14px"
      fontWeight="600"
      h="38px"
      px="22px"
      borderRadius="9px"
      isLoading={isLoading}
      isDisabled={isDisabled}
      onClick={onConfirm}
      boxShadow={
        confirmScheme === "blue"
          ? "0 2px 12px rgba(59,130,246,0.4)"
          : "0 2px 12px rgba(239,68,68,0.4)"
      }
      _hover={{
        boxShadow:
          confirmScheme === "blue"
            ? "0 4px 18px rgba(59,130,246,0.55)"
            : "0 4px 18px rgba(239,68,68,0.55)",
        transform: "translateY(-1px)",
      }}
      _active={{ transform: "translateY(0)" }}
      transition="all 0.15s"
    >
      {confirmLabel}
    </Button>
  </HStack>
);

const LS_SHOW_PRODUCTS = "adbc_showProducts";
const LS_SELECTED_CATEGORY = "adbc_selectedCategory";
const LS_FILTER_CATEGORY = "adbc_filterCategoryId";

const ADbaseCategory = () => {
  const { colorMode, toggleColorMode } = useColorMode();
  const isDark = colorMode === "dark";

  const modalBg = isDark ? "#172031" : "#eef2f8";
  const modalBorder = isDark
    ? "rgba(255,255,255,0.09)"
    : "rgba(30,60,120,0.12)";
  const modalShadow = isDark
    ? "0 24px 60px rgba(0,0,0,0.65), 0 0 0 1px rgba(255,255,255,0.04)"
    : "0 20px 60px rgba(30,60,120,0.2), 0 0 0 1px rgba(30,60,120,0.08)";
  const overlayBg = isDark ? "rgba(0,0,0,0.7)" : "rgba(15,30,60,0.5)";

  const modalContentStyle = {
    bg: modalBg,
    border: "1px solid",
    borderColor: modalBorder,
    borderRadius: "16px",
    overflow: "hidden",
    boxShadow: modalShadow,
  };

  const sharedInputProps = { isDark };

  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState("");
  const debouncedSearch = useDebounce(searchText, 300);

  const [showProducts, setShowProducts] = useState(() => {
    try {
      return localStorage.getItem(LS_SHOW_PRODUCTS) === "true";
    } catch {
      return false;
    }
  });

  const [selectedCategory, setSelectedCategory] = useState(() => {
    try {
      const saved = localStorage.getItem(LS_SELECTED_CATEGORY);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(false);
  const [productSearch, setProductSearch] = useState("");
  const debouncedProductSearch = useDebounce(productSearch, 300);
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const limit = 20;

  const [filterCategoryId, setFilterCategoryId] = useState(() => {
    try {
      return localStorage.getItem(LS_FILTER_CATEGORY) ?? "";
    } catch {
      return "";
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(LS_SHOW_PRODUCTS, String(showProducts));
    } catch {}
  }, [showProducts]);

  useEffect(() => {
    try {
      if (selectedCategory) {
        localStorage.setItem(
          LS_SELECTED_CATEGORY,
          JSON.stringify(selectedCategory),
        );
      } else {
        localStorage.removeItem(LS_SELECTED_CATEGORY);
      }
    } catch {}
  }, [selectedCategory]);

  useEffect(() => {
    try {
      localStorage.setItem(LS_FILTER_CATEGORY, filterCategoryId);
    } catch {}
  }, [filterCategoryId]);

  const {
    isOpen: isAddCatOpen,
    onOpen: onAddCatOpen,
    onClose: onAddCatClose,
  } = useDisclosure();
  const {
    isOpen: isEditCatOpen,
    onOpen: onEditCatOpen,
    onClose: onEditCatClose,
  } = useDisclosure();
  const {
    isOpen: isDeleteCatOpen,
    onOpen: onDeleteCatOpen,
    onClose: onDeleteCatClose,
  } = useDisclosure();
  const {
    isOpen: isAddProdOpen,
    onOpen: onAddProdOpen,
    onClose: onAddProdClose,
  } = useDisclosure();
  const {
    isOpen: isEditProdOpen,
    onOpen: onEditProdOpen,
    onClose: onEditProdClose,
  } = useDisclosure();
  const {
    isOpen: isDeleteProdOpen,
    onOpen: onDeleteProdOpen,
    onClose: onDeleteProdClose,
  } = useDisclosure();

  const [catForm, setCatForm] = useState({ name: "", note: "" });
  const [prodForm, setProdForm] = useState({
    name: "",
    unit: "",
    category_id: "",
  });
  const [currentCat, setCurrentCat] = useState(null);
  const [currentProd, setCurrentProd] = useState(null);
  const [catFormLoading, setCatFormLoading] = useState(false);
  const [prodFormLoading, setProdFormLoading] = useState(false);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await apiBaseCategory.getPage({
        searchTerm: debouncedSearch,
        page: 1,
        limit: 100,
      });
      const data = res?.data;
      const records = data?.data?.records ?? data?.records ?? data?.data ?? [];
      setOptions(Array.isArray(records) ? records : []);
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    setProductsLoading(true);
    try {
      const res = await apiBaseCategory.getProducts({
        searchTerm: debouncedProductSearch,
        category_id: filterCategoryId || null,
        page,
        limit,
      });
      const data = res?.data;
      const records = data?.data?.records ?? data?.records ?? data?.data ?? [];
      const total =
        data?.data?.pagination?.total_count ??
        data?.pagination?.total_count ??
        data?.data?.total ??
        data?.total ??
        records.length ??
        0;
      setProducts(Array.isArray(records) ? records : []);
      setTotalCount(total);
    } finally {
      setProductsLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, [debouncedSearch]);

  useEffect(() => {
    if (showProducts) fetchProducts();
  }, [debouncedProductSearch, page, filterCategoryId, showProducts]);

  useEffect(() => {
    setPage(1);
  }, [debouncedProductSearch]);

  const handleAddCat = async () => {
    if (!catForm.name) return;
    setCatFormLoading(true);
    try {
      await apiBaseCategory.create({ name: catForm.name, note: catForm.note });
      await fetchCategories();
      onAddCatClose();
      setCatForm({ name: "", note: "" });
    } finally {
      setCatFormLoading(false);
    }
  };

  const handleEditCat = async () => {
    if (!catForm.name || !currentCat) return;
    setCatFormLoading(true);
    try {
      await apiBaseCategory.update(currentCat.id, {
        name: catForm.name,
        note: catForm.note,
      });
      await fetchCategories();
      onEditCatClose();
      setCatForm({ name: "", note: "" });
      setCurrentCat(null);
    } finally {
      setCatFormLoading(false);
    }
  };

  const handleDeleteCat = async () => {
    if (!currentCat) return;
    try {
      await apiBaseCategory.delete(currentCat.id);
      await fetchCategories();
      if (selectedCategory?.id === currentCat.id) handleBack();
      onDeleteCatClose();
      setCurrentCat(null);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddProd = async () => {
    if (!prodForm.name || !prodForm.unit) return;
    setProdFormLoading(true);
    try {
      await apiBaseCategory.createProduct({
        name: prodForm.name,
        unit: prodForm.unit,
        category_id: prodForm.category_id || null,
      });
      await fetchProducts();
      onAddProdClose();
      setProdForm({ name: "", unit: "", category_id: "" });
    } finally {
      setProdFormLoading(false);
    }
  };

  const handleEditProd = async () => {
    if (!prodForm.name || !prodForm.unit || !currentProd) return;
    setProdFormLoading(true);
    try {
      await apiBaseCategory.updateProduct(currentProd.id, {
        name: prodForm.name,
        unit: prodForm.unit,
        category_id: prodForm.category_id || null,
      });
      await fetchProducts();
      onEditProdClose();
      setProdForm({ name: "", unit: "", category_id: "" });
      setCurrentProd(null);
    } finally {
      setProdFormLoading(false);
    }
  };

  const handleDeleteProd = async () => {
    if (!currentProd) return;
    try {
      await apiBaseCategory.deleteProduct(currentProd.id);
      await fetchProducts();
      onDeleteProdClose();
      setCurrentProd(null);
    } catch (err) {
      console.error(err);
    }
  };

  const handleShowProducts = (category) => {
    setSelectedCategory(category);

    setFilterCategoryId("");
    setShowProducts(true);
    setProductSearch("");
    setPage(1);
    setProducts([]);
    setTotalCount(0);
  };

  const handleBack = () => {
    setShowProducts(false);
    setSelectedCategory(null);
    setFilterCategoryId("");
    setProducts([]);
    setTotalCount(0);
    setPage(1);
    setProductSearch("");
    try {
      localStorage.removeItem(LS_SHOW_PRODUCTS);
      localStorage.removeItem(LS_SELECTED_CATEGORY);
      localStorage.removeItem(LS_FILTER_CATEGORY);
    } catch {}
  };

  const handleCategoryFilterChange = (e) => {
    const val = e.target.value;
    setFilterCategoryId(val);
    setPage(1);
    setProductSearch("");
    if (val === "") {
      setSelectedCategory(null);
    } else {
      const cat = options.find((o) => o.id === val);
      if (cat) setSelectedCategory(cat);
    }
  };

  return (
    <Box pr="20px" pb="20px" pt="20px">
      <HStack justify="space-between" mb="16px">
        <HStack>
          {showProducts && (
            <IconButton
              icon={<ArrowLeft size={18} />}
              variant="ghost"
              onClick={handleBack}
              aria-label="Orqaga"
            />
          )}
          <Heading size="lg">
            {showProducts
              ? `Mahsulotlar${filterCategoryId && selectedCategory ? ` — ${selectedCategory.name}` : ""}`
              : "Kategoriyalar"}
          </Heading>
        </HStack>
        <HStack>
          <IconButton
            variant="ghost"
            borderRadius="9px"
            onClick={toggleColorMode}
          />
          {!showProducts ? (
            <Button
              leftIcon={<AddIcon />}
              colorScheme="blue"
              onClick={() => {
                setCatForm({ name: "", note: "" });
                onAddCatOpen();
              }}
            >
              Kategoriya qo'shish
            </Button>
          ) : (
            <Button
              leftIcon={<AddIcon />}
              colorScheme="blue"
              onClick={() => {
                setProdForm({
                  name: "",
                  unit: "",
                  category_id: filterCategoryId,
                });
                onAddProdOpen();
              }}
            >
              Mahsulot qo'shish
            </Button>
          )}
          <IconButton
            aria-label="Ko'rinish"
            icon={<LayoutGrid size={18} />}
            variant={showProducts ? "solid" : "outline"}
            colorScheme={showProducts ? "blue" : "gray"}
            onClick={() => {
              if (showProducts) handleBack();
              else if (options.length > 0) handleShowProducts(options[0]);
            }}
          />
        </HStack>
      </HStack>

      {!showProducts ? (
        <>
          <HStack mb="20px" gap={4} flexWrap="wrap">
            <InputGroup maxW="400px">
              <Input
                placeholder="Kategoriya qidirish..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
              />
              <InputRightElement>
                {searchText ? (
                  <IconButton
                    size="sm"
                    variant="ghost"
                    icon={<CloseIcon boxSize={3} />}
                    onClick={() => setSearchText("")}
                  />
                ) : (
                  <SearchIcon color="gray.400" />
                )}
              </InputRightElement>
            </InputGroup>
            <Badge
              colorScheme="blue"
              px={3}
              py={1}
              borderRadius="full"
              fontSize="sm"
              fontWeight="semibold"
            >
              {loading
                ? "Yuklanmoqda..."
                : `Jami: ${options.length} ta kategoriya`}
            </Badge>
          </HStack>

          {loading ? (
            <SimpleGrid columns={{ base: 1, md: 2, xl: 3 }} spacing="20px">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Box
                  key={i}
                  border="1px solid"
                  borderColor="border"
                  borderRadius="12px"
                  p="16px"
                >
                  <SkeletonText noOfLines={1} width="60%" mb={4} />
                  <Skeleton height="16px" width="40px" />
                </Box>
              ))}
            </SimpleGrid>
          ) : options.length === 0 ? (
            <Box
              borderWidth="1px"
              borderColor="border"
              borderRadius="16px"
              p="18px"
              bg="surface"
            >
              <Text color="gray.500">Natija topilmadi</Text>
            </Box>
          ) : (
            <SimpleGrid columns={{ base: 1, md: 2, xl: 3 }} spacing="20px">
              {options.map((option) => (
                <Box
                  key={option.id}
                  bg="surface"
                  border="1px solid"
                  borderColor="border"
                  borderRadius="12px"
                  p="16px"
                  position="relative"
                  transition="all .2s"
                  _hover={{ shadow: "md" }}
                  role="group"
                  cursor="pointer"
                  onClick={() => handleShowProducts(option)}
                >
                  <Box
                    position="absolute"
                    top="12px"
                    right="12px"
                    opacity={1}
                    _groupHover={{ opacity: 0 }}
                    pointerEvents="none"
                    transition="opacity 0.2s"
                  >
                    <Layers size={18} color="gray" />
                  </Box>
                  <Box
                    position="absolute"
                    top="8px"
                    right="8px"
                    opacity={0}
                    _groupHover={{ opacity: 1 }}
                    transition="opacity 0.2s"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <HStack spacing="6px">
                      <IconButton
                        size="sm"
                        variant="ghost"
                        colorScheme="blue"
                        icon={<PencilLine size={16} />}
                        aria-label="Tahrirlash"
                        onClick={(e) => {
                          e.stopPropagation();
                          setCurrentCat(option);
                          setCatForm({
                            name: option.name,
                            note: option.note || "",
                          });
                          onEditCatOpen();
                        }}
                      />
                      <IconButton
                        size="sm"
                        variant="ghost"
                        colorScheme="red"
                        icon={<Trash2 size={16} />}
                        aria-label="O'chirish"
                        onClick={(e) => {
                          e.stopPropagation();
                          setCurrentCat(option);
                          onDeleteCatOpen();
                        }}
                      />
                    </HStack>
                  </Box>
                  <Text fontWeight="600" fontSize="lg" mb="10px" pr="40px">
                    {option.name}
                  </Text>
                  <HStack spacing={2}>
                    <Building2 size={16} color="gray" />
                    <Text fontSize="sm" color="gray.500">
                      {option.factory_count ?? 0}
                    </Text>
                  </HStack>
                </Box>
              ))}
            </SimpleGrid>
          )}
        </>
      ) : (
        <>
          <HStack mb="20px" gap={4} flexWrap="wrap">
            <InputGroup maxW="400px">
              <Input
                placeholder="Mahsulot qidirish..."
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
              />
              <InputRightElement>
                {productSearch ? (
                  <IconButton
                    size="sm"
                    variant="ghost"
                    icon={<CloseIcon boxSize={3} />}
                    onClick={() => setProductSearch("")}
                  />
                ) : (
                  <SearchIcon color="gray.400" />
                )}
              </InputRightElement>
            </InputGroup>
            <Badge
              colorScheme="blue"
              px={3}
              py={1}
              borderRadius="full"
              fontSize="sm"
              fontWeight="semibold"
            >
              {productsLoading
                ? "Yuklanmoqda..."
                : `Jami: ${totalCount} ta mahsulot`}
            </Badge>

            <Select
              maxW="240px"
              value={filterCategoryId}
              onChange={handleCategoryFilterChange}
            >
              <option value="">Hammasi</option>
              {options.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.name}
                </option>
              ))}
            </Select>
          </HStack>

          <TableContainer
            border="1px solid"
            borderColor="border"
            borderRadius="12px"
          >
            <Table variant="simple">
              <Thead>
                <Tr>
                  <Th>№</Th>
                  <Th>Nomi</Th>
                  <Th>O'lchov birligi</Th>
                  <Th>Amallar</Th>
                </Tr>
              </Thead>
              <Tbody>
                {productsLoading ? (
                  [1, 2, 3, 4, 5].map((i) => (
                    <Tr key={i}>
                      <Td>
                        <Skeleton height="16px" width="20px" />
                      </Td>
                      <Td>
                        <Skeleton height="16px" width="150px" />
                      </Td>
                      <Td>
                        <Skeleton height="16px" width="60px" />
                      </Td>
                      <Td>
                        <Skeleton height="16px" width="80px" />
                      </Td>
                    </Tr>
                  ))
                ) : products.length === 0 ? (
                  <Tr>
                    <Td colSpan={4}>
                      <Text color="gray.500" textAlign="center" py={8}>
                        Mahsulot topilmadi
                      </Text>
                    </Td>
                  </Tr>
                ) : (
                  products.map((p, index) => (
                    <Tr key={p.id} _hover={{ bg: "surface" }}>
                      <Td>{(page - 1) * limit + index + 1}</Td>
                      <Td fontWeight="500">{p.name}</Td>
                      <Td>{p.unit ?? "-"}</Td>
                      <Td>
                        <HStack spacing="6px">
                          <IconButton
                            size="sm"
                            variant="ghost"
                            colorScheme="blue"
                            icon={<PencilLine size={16} />}
                            aria-label="Tahrirlash"
                            onClick={() => {
                              setCurrentProd(p);
                              setProdForm({
                                name: p.name,
                                unit: p.unit ?? "",
                                category_id: p.category_id ?? "",
                              });
                              onEditProdOpen();
                            }}
                          />
                          <IconButton
                            size="sm"
                            variant="ghost"
                            colorScheme="red"
                            icon={<Trash2 size={16} />}
                            aria-label="O'chirish"
                            onClick={() => {
                              setCurrentProd(p);
                              onDeleteProdOpen();
                            }}
                          />
                        </HStack>
                      </Td>
                    </Tr>
                  ))
                )}
              </Tbody>
            </Table>
          </TableContainer>

          <HStack mt="20px" justify="flex-end" gap={2}>
            <Button
              size="sm"
              isDisabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
            >
              Oldingi
            </Button>
            <Badge px={3} py={1} borderRadius="full">
              {page}
            </Badge>
            <Button
              size="sm"
              isDisabled={products.length < limit}
              onClick={() => setPage((p) => p + 1)}
            >
              Keyingi
            </Button>
          </HStack>
        </>
      )}

      <Modal
        isOpen={isAddCatOpen}
        onClose={onAddCatClose}
        size="md"
        isCentered
        motionPreset="slideInBottom"
      >
        <ModalOverlay bg={overlayBg} backdropFilter="blur(8px)" />
        <ModalContent {...modalContentStyle}>
          <ModalHeaderWithIcon
            icon={Layers}
            title="Kategoriya qo'shish"
            subtitle="Yangi kategoriya yarating"
            onClose={onAddCatClose}
            isDark={isDark}
          />
          <ModalBody px="24px" py="20px" bg={modalBg}>
            <VStack spacing="16px">
              <StyledInput
                label="Nomi"
                isRequired
                value={catForm.name}
                onChange={(e) =>
                  setCatForm({ ...catForm, name: e.target.value })
                }
                placeholder="Kategoriya nomi"
                maxLength={100}
                {...sharedInputProps}
              />
              <StyledTextarea
                label="Izoh"
                charCount={catForm.note.length}
                maxLength={500}
                value={catForm.note}
                onChange={(e) =>
                  setCatForm({ ...catForm, note: e.target.value })
                }
                placeholder="Qo'shimcha ma'lumot"
                rows={3}
                {...sharedInputProps}
              />
            </VStack>
          </ModalBody>
          <ModalActions
            onCancel={onAddCatClose}
            onConfirm={handleAddCat}
            confirmLabel="Qo'shish"
            isLoading={catFormLoading}
            isDisabled={!catForm.name}
            {...sharedInputProps}
          />
        </ModalContent>
      </Modal>

      <Modal
        isOpen={isEditCatOpen}
        onClose={onEditCatClose}
        size="md"
        isCentered
        motionPreset="slideInBottom"
      >
        <ModalOverlay bg={overlayBg} backdropFilter="blur(8px)" />
        <ModalContent {...modalContentStyle}>
          <ModalHeaderWithIcon
            icon={PencilLine}
            title="Kategoriyani tahrirlash"
            subtitle={currentCat?.name}
            onClose={onEditCatClose}
            isDark={isDark}
          />
          <ModalBody px="24px" py="20px" bg={modalBg}>
            <VStack spacing="16px">
              <StyledInput
                label="Nomi"
                isRequired
                value={catForm.name}
                onChange={(e) =>
                  setCatForm({ ...catForm, name: e.target.value })
                }
                maxLength={100}
                {...sharedInputProps}
              />
              <StyledTextarea
                label="Izoh"
                charCount={catForm.note.length}
                maxLength={500}
                value={catForm.note}
                onChange={(e) =>
                  setCatForm({ ...catForm, note: e.target.value })
                }
                rows={3}
                {...sharedInputProps}
              />
            </VStack>
          </ModalBody>
          <ModalActions
            onCancel={onEditCatClose}
            onConfirm={handleEditCat}
            confirmLabel="Saqlash"
            isLoading={catFormLoading}
            isDisabled={!catForm.name}
            {...sharedInputProps}
          />
        </ModalContent>
      </Modal>

      <Modal
        isOpen={isDeleteCatOpen}
        onClose={onDeleteCatClose}
        size="sm"
        isCentered
        motionPreset="slideInBottom"
      >
        <ModalOverlay bg={overlayBg} backdropFilter="blur(8px)" />
        <ModalContent {...modalContentStyle}>
          <DeleteModalHeader
            title="O'chirishni tasdiqlang"
            subtitle="Bu amalni ortga qaytarib bo'lmaydi."
            onClose={onDeleteCatClose}
            isDark={isDark}
          />
          <ModalBody px="24px" py="20px" bg={modalBg}>
            {currentCat && (
              <VStack align="start" spacing="12px">
                <Text
                  fontSize="14px"
                  color={isDark ? "rgba(255,255,255,0.65)" : "rgba(0,0,0,0.55)"}
                >
                  Quyidagi kategoriya o'chiriladi:
                </Text>
                <Box
                  w="100%"
                  bg={isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)"}
                  border="1px solid"
                  borderColor={
                    isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)"
                  }
                  borderRadius="10px"
                  px="14px"
                  py="10px"
                >
                  <Text
                    fontWeight="700"
                    fontSize="15px"
                    color={isDark ? "white" : "#0f1e3c"}
                  >
                    {currentCat.name}
                  </Text>
                </Box>
              </VStack>
            )}
          </ModalBody>
          <ModalActions
            onCancel={onDeleteCatClose}
            onConfirm={handleDeleteCat}
            confirmLabel="O'chirish"
            confirmScheme="red"
            {...sharedInputProps}
          />
        </ModalContent>
      </Modal>

      <Modal
        isOpen={isAddProdOpen}
        onClose={onAddProdClose}
        size="md"
        isCentered
        motionPreset="slideInBottom"
      >
        <ModalOverlay bg={overlayBg} backdropFilter="blur(8px)" />
        <ModalContent {...modalContentStyle}>
          <ModalHeaderWithIcon
            icon={Package}
            title="Mahsulot qo'shish"
            subtitle="BLOK"
            onClose={onAddProdClose}
            isDark={isDark}
          />
          <ModalBody px="24px" py="20px" bg={modalBg}>
            <VStack spacing="16px">
              <StyledInput
                label="Nomi"
                isRequired
                value={prodForm.name}
                onChange={(e) =>
                  setProdForm({ ...prodForm, name: e.target.value })
                }
                placeholder="Mahsulot nomi"
                {...sharedInputProps}
              />
              <StyledInput
                label="O'lchov birligi"
                isRequired
                value={prodForm.unit}
                onChange={(e) =>
                  setProdForm({ ...prodForm, unit: e.target.value })
                }
                placeholder="kg, dona, m², tonna..."
                {...sharedInputProps}
              />
              <StyledSelect
                label="Kategoriya"
                value={prodForm.category_id}
                onChange={(e) =>
                  setProdForm({ ...prodForm, category_id: e.target.value })
                }
                {...sharedInputProps}
              >
                <option value="">Hammasi</option>
                {options.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.name}
                  </option>
                ))}
              </StyledSelect>
            </VStack>
          </ModalBody>
          <ModalActions
            onCancel={onAddProdClose}
            onConfirm={handleAddProd}
            confirmLabel="Qo'shish"
            isLoading={prodFormLoading}
            isDisabled={!prodForm.name || !prodForm.unit}
            {...sharedInputProps}
          />
        </ModalContent>
      </Modal>

      <Modal
        isOpen={isEditProdOpen}
        onClose={onEditProdClose}
        size="md"
        isCentered
        motionPreset="slideInBottom"
      >
        <ModalOverlay bg={overlayBg} backdropFilter="blur(8px)" />
        <ModalContent {...modalContentStyle}>
          <ModalHeaderWithIcon
            icon={PencilLine}
            title="Mahsulotni tahrirlash"
            subtitle={currentProd?.name}
            onClose={onEditProdClose}
            isDark={isDark}
          />
          <ModalBody px="24px" py="20px" bg={modalBg}>
            <VStack spacing="16px">
              <StyledInput
                label="Nomi"
                isRequired
                value={prodForm.name}
                onChange={(e) =>
                  setProdForm({ ...prodForm, name: e.target.value })
                }
                placeholder="Mahsulot nomi"
                {...sharedInputProps}
              />
              <StyledInput
                label="O'lchov birligi"
                isRequired
                value={prodForm.unit}
                onChange={(e) =>
                  setProdForm({ ...prodForm, unit: e.target.value })
                }
                placeholder="kg, dona, m², tonna..."
                {...sharedInputProps}
              />
              <StyledSelect
                label="Kategoriya"
                value={prodForm.category_id}
                onChange={(e) =>
                  setProdForm({ ...prodForm, category_id: e.target.value })
                }
                {...sharedInputProps}
              >
                <option value="">Hammasi</option>
                {options.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.name}
                  </option>
                ))}
              </StyledSelect>
            </VStack>
          </ModalBody>
          <ModalActions
            onCancel={onEditProdClose}
            onConfirm={handleEditProd}
            confirmLabel="Saqlash"
            isLoading={prodFormLoading}
            isDisabled={!prodForm.name || !prodForm.unit}
            {...sharedInputProps}
          />
        </ModalContent>
      </Modal>

      <Modal
        isOpen={isDeleteProdOpen}
        onClose={onDeleteProdClose}
        size="sm"
        isCentered
        motionPreset="slideInBottom"
      >
        <ModalOverlay bg={overlayBg} backdropFilter="blur(8px)" />
        <ModalContent {...modalContentStyle}>
          <DeleteModalHeader
            title="O'chirishni tasdiqlang"
            subtitle="Bu amalni ortga qaytarib bo'lmaydi."
            onClose={onDeleteProdClose}
            isDark={isDark}
          />
          <ModalBody px="24px" py="20px" bg={modalBg}>
            {currentProd && (
              <VStack align="start" spacing="12px">
                <Text
                  fontSize="14px"
                  color={isDark ? "rgba(255,255,255,0.65)" : "rgba(0,0,0,0.55)"}
                >
                  Quyidagi mahsulot o'chiriladi:
                </Text>
                <Box
                  w="100%"
                  bg={isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)"}
                  border="1px solid"
                  borderColor={
                    isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)"
                  }
                  borderRadius="10px"
                  px="14px"
                  py="10px"
                >
                  <Text
                    fontWeight="700"
                    fontSize="15px"
                    color={isDark ? "white" : "#0f1e3c"}
                  >
                    {currentProd.name}
                  </Text>
                  <Text
                    fontSize="13px"
                    color={isDark ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.4)"}
                    mt="2px"
                  >
                    {currentProd.unit}
                  </Text>
                </Box>
              </VStack>
            )}
          </ModalBody>
          <ModalActions
            onCancel={onDeleteProdClose}
            onConfirm={handleDeleteProd}
            confirmLabel="O'chirish"
            confirmScheme="red"
            {...sharedInputProps}
          />
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default ADbaseCategory;

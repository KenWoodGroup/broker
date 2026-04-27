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
  ModalFooter,
  ModalCloseButton,
  VStack,
  HStack,
  Skeleton,
  SkeletonText,
  useDisclosure,
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
  Icon,
} from "@chakra-ui/react";
import { AddIcon, SearchIcon, CloseIcon, WarningIcon } from "@chakra-ui/icons";
import {
  Layers,
  Building2,
  PencilLine,
  Trash2,
  LayoutGrid,
  ArrowLeft,
  Factory,
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
 
// ─── Reusable Modal Header (Zavodni tahrirlash style)
const ModalHeaderWithIcon = ({ icon: IconComp, iconBg = "rgba(59,130,246,0.15)", iconColor = "#60a5fa", title, subtitle, onClose }) => (
  <Box
    px="24px"
    pt="20px"
    pb="16px"
    borderBottom="1px solid"
    borderColor="whiteAlpha.100"
    bg="linear-gradient(135deg, rgba(30,41,59,0.8) 0%, rgba(15,23,42,0.6) 100%)"
    borderTopRadius="16px"
  >
    <HStack spacing="14px" align="center">
      <Flex
        w="40px" h="40px"
        borderRadius="10px"
        bg={iconBg}
        align="center"
        justify="center"
        flexShrink={0}
      >
        <IconComp size={18} color={iconColor} />
      </Flex>
      <Box flex={1}>
        <Text fontWeight="700" fontSize="16px" color="white" lineHeight="1.3">
          {title}
        </Text>
        {subtitle && (
          <Text fontSize="12px" color="whiteAlpha.600" fontWeight="500" mt="1px">
            {subtitle}
          </Text>
        )}
      </Box>
      <IconButton
        icon={<CloseIcon boxSize="10px" />}
        size="sm"
        variant="ghost"
        colorScheme="whiteAlpha"
        onClick={onClose}
        borderRadius="8px"
        aria-label="Yopish"
        _hover={{ bg: "whiteAlpha.100" }}
      />
    </HStack>
  </Box>
);
 
// ─── Delete Modal Header (red warning style)
const DeleteModalHeader = ({ title, subtitle, onClose }) => (
  <Box
    px="24px"
    pt="20px"
    pb="16px"
    borderBottom="1px solid"
    borderColor="red.900"
    bg="linear-gradient(135deg, rgba(127,29,29,0.6) 0%, rgba(69,10,10,0.4) 100%)"
    borderTopRadius="16px"
  >
    <HStack spacing="14px" align="center">
      <Flex
        w="40px" h="40px"
        borderRadius="10px"
        bg="rgba(239,68,68,0.2)"
        align="center"
        justify="center"
        flexShrink={0}
      >
        <AlertTriangle size={18} color="#f87171" />
      </Flex>
      <Box flex={1}>
        <Text fontWeight="700" fontSize="16px" color="white" lineHeight="1.3">
          {title}
        </Text>
        {subtitle && (
          <Text fontSize="12px" color="red.300" fontWeight="400" mt="1px">
            {subtitle}
          </Text>
        )}
      </Box>
      <IconButton
        icon={<CloseIcon boxSize="10px" />}
        size="sm"
        variant="ghost"
        colorScheme="whiteAlpha"
        onClick={onClose}
        borderRadius="8px"
        aria-label="Yopish"
        _hover={{ bg: "whiteAlpha.100" }}
      />
    </HStack>
  </Box>
);
 
// ─── Styled Input
const StyledInput = ({ label, isRequired, ...props }) => (
  <FormControl isRequired={isRequired}>
    <FormLabel
      fontSize="13px"
      fontWeight="600"
      color="whiteAlpha.800"
      mb="6px"
      letterSpacing="0.01em"
    >
      {label}
    </FormLabel>
    <Input
      bg="rgba(255,255,255,0.04)"
      border="1px solid"
      borderColor="whiteAlpha.200"
      borderRadius="10px"
      color="white"
      fontSize="14px"
      h="42px"
      px="14px"
      _placeholder={{ color: "whiteAlpha.400" }}
      _hover={{ borderColor: "whiteAlpha.400", bg: "rgba(255,255,255,0.06)" }}
      _focus={{ borderColor: "blue.400", bg: "rgba(255,255,255,0.06)", boxShadow: "0 0 0 1px #3b82f6" }}
      transition="all 0.15s"
      {...props}
    />
  </FormControl>
);
 
// ─── Styled Textarea
const StyledTextarea = ({ label, isRequired, charCount, maxLength, ...props }) => (
  <FormControl isRequired={isRequired}>
    <HStack justify="space-between" mb="6px">
      <FormLabel
        fontSize="13px"
        fontWeight="600"
        color="whiteAlpha.800"
        mb="0"
        letterSpacing="0.01em"
      >
        {label}
        {!isRequired && (
          <Badge ml="6px" fontSize="10px" colorScheme="gray" variant="subtle" borderRadius="4px">
            ixtiyoriy
          </Badge>
        )}
      </FormLabel>
      {maxLength && (
        <Text fontSize="11px" color="whiteAlpha.400">{charCount}/{maxLength}</Text>
      )}
    </HStack>
    <Textarea
      bg="rgba(255,255,255,0.04)"
      border="1px solid"
      borderColor="whiteAlpha.200"
      borderRadius="10px"
      color="white"
      fontSize="14px"
      px="14px"
      py="10px"
      _placeholder={{ color: "whiteAlpha.400" }}
      _hover={{ borderColor: "whiteAlpha.400", bg: "rgba(255,255,255,0.06)" }}
      _focus={{ borderColor: "blue.400", bg: "rgba(255,255,255,0.06)", boxShadow: "0 0 0 1px #3b82f6" }}
      resize="none"
      transition="all 0.15s"
      {...props}
    />
  </FormControl>
);
 
// ─── Modal Footer Buttons
const ModalActions = ({ onCancel, onConfirm, confirmLabel, isLoading, isDisabled, confirmScheme = "blue" }) => (
  <HStack justify="flex-end" spacing="10px" px="24px" py="16px" borderTop="1px solid" borderColor="whiteAlpha.100">
    <Button
      variant="ghost"
      color="whiteAlpha.700"
      fontSize="14px"
      fontWeight="500"
      h="38px"
      px="16px"
      borderRadius="9px"
      _hover={{ bg: "whiteAlpha.100", color: "white" }}
      onClick={onCancel}
    >
      Bekor qilish
    </Button>
    <Button
      colorScheme={confirmScheme}
      fontSize="14px"
      fontWeight="600"
      h="38px"
      px="20px"
      borderRadius="9px"
      isLoading={isLoading}
      isDisabled={isDisabled}
      onClick={onConfirm}
      boxShadow={confirmScheme === "blue" ? "0 2px 12px rgba(59,130,246,0.35)" : "0 2px 12px rgba(239,68,68,0.35)"}
      _hover={{
        boxShadow: confirmScheme === "blue" ? "0 4px 16px rgba(59,130,246,0.5)" : "0 4px 16px rgba(239,68,68,0.5)",
        transform: "translateY(-1px)"
      }}
      transition="all 0.15s"
    >
      {confirmLabel}
    </Button>
  </HStack>
);
 
// ─── Modal content style
const modalContentStyle = {
  bg: "#1a2236",
  border: "1px solid",
  borderColor: "whiteAlpha.100",
  borderRadius: "16px",
  overflow: "hidden",
  boxShadow: "0 25px 60px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.04)",
};
 
// ═══════════════════════════════════════════════
// Asosiy komponent
// ═══════════════════════════════════════════════
const ADbaseCategory = () => {
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState("");
  const debouncedSearch = useDebounce(searchText, 300);
 
  const [showProducts, setShowProducts] = useState(() => {
    return localStorage.getItem("cat_showProducts") === "true";
  });
  const [selectedCategory, setSelectedCategory] = useState(() => {
    const saved = localStorage.getItem("cat_selectedCategory");
    return saved ? JSON.parse(saved) : null;
  });
  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(false);
  const [productSearch, setProductSearch] = useState("");
  const debouncedProductSearch = useDebounce(productSearch, 300);
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const limit = 20;
 
  const { isOpen: isAddCatOpen,     onOpen: onAddCatOpen,     onClose: onAddCatClose     } = useDisclosure();
  const { isOpen: isEditCatOpen,    onOpen: onEditCatOpen,    onClose: onEditCatClose    } = useDisclosure();
  const { isOpen: isDeleteCatOpen,  onOpen: onDeleteCatOpen,  onClose: onDeleteCatClose  } = useDisclosure();
  const { isOpen: isAddProdOpen,    onOpen: onAddProdOpen,    onClose: onAddProdClose    } = useDisclosure();
  const { isOpen: isEditProdOpen,   onOpen: onEditProdOpen,   onClose: onEditProdClose   } = useDisclosure();
  const { isOpen: isDeleteProdOpen, onOpen: onDeleteProdOpen, onClose: onDeleteProdClose } = useDisclosure();
 
  const [catForm, setCatForm]   = useState({ name: "", note: "" });
  const [prodForm, setProdForm] = useState({ name: "", unit: "" });
  const [currentCat, setCurrentCat]   = useState(null);
  const [currentProd, setCurrentProd] = useState(null);
  const [catFormLoading,  setCatFormLoading]  = useState(false);
  const [prodFormLoading, setProdFormLoading] = useState(false);
 
  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await apiBaseCategory.getPage({ searchTerm: debouncedSearch, page: 1, limit: 100 });
      const data = res?.data;
      const records = data?.data?.records ?? data?.records ?? data?.data ?? [];
      setOptions(Array.isArray(records) ? records : []);
    } finally {
      setLoading(false);
    }
  };
 
  const fetchProducts = async (catId) => {
    const id = catId ?? selectedCategory?.id;
    if (!id) return;
    setProductsLoading(true);
    try {
      const res = await apiBaseCategory.getProducts({ searchTerm: debouncedProductSearch, category_id: id, page, limit });
      const data = res?.data;
      const records = data?.data?.records ?? data?.records ?? data?.data ?? [];
      const total = data?.data?.pagination?.total_count ?? data?.pagination?.total_count ?? data?.data?.total ?? data?.total ?? records.length ?? 0;
      setProducts(Array.isArray(records) ? records : []);
      setTotalCount(total);
    } finally {
      setProductsLoading(false);
    }
  };
 
  useEffect(() => { fetchCategories(); }, [debouncedSearch]);
  useEffect(() => { if (showProducts && selectedCategory) fetchProducts(); }, [debouncedProductSearch, page, selectedCategory, showProducts]);
  useEffect(() => { setPage(1); }, [debouncedProductSearch]);
 
  const handleAddCat = async () => {
    if (!catForm.name) return;
    setCatFormLoading(true);
    try {
      await apiBaseCategory.create({ name: catForm.name, note: catForm.note });
      await fetchCategories();
      onAddCatClose();
      setCatForm({ name: "", note: "" });
    } finally { setCatFormLoading(false); }
  };
 
  const handleEditCat = async () => {
    if (!catForm.name || !currentCat) return;
    setCatFormLoading(true);
    try {
      await apiBaseCategory.update(currentCat.id, { name: catForm.name, note: catForm.note });
      await fetchCategories();
      onEditCatClose();
      setCatForm({ name: "", note: "" });
      setCurrentCat(null);
    } finally { setCatFormLoading(false); }
  };
 
  const handleDeleteCat = async () => {
    if (!currentCat) return;
    try {
      await apiBaseCategory.delete(currentCat.id);
      await fetchCategories();
      if (selectedCategory?.id === currentCat.id) handleBack();
      onDeleteCatClose();
      setCurrentCat(null);
    } catch (err) { console.error(err); }
  };
 
  const handleAddProd = async () => {
    if (!prodForm.name || !prodForm.unit || !selectedCategory?.id) return;
    setProdFormLoading(true);
    try {
      await apiBaseCategory.createProduct({ name: prodForm.name, unit: prodForm.unit, category_id: selectedCategory.id });
      await fetchProducts();
      onAddProdClose();
      setProdForm({ name: "", unit: "" });
    } finally { setProdFormLoading(false); }
  };
 
  const handleEditProd = async () => {
    if (!prodForm.name || !prodForm.unit || !currentProd) return;
    setProdFormLoading(true);
    try {
      await apiBaseCategory.updateProduct(currentProd.id, { name: prodForm.name, unit: prodForm.unit, category_id: selectedCategory.id });
      await fetchProducts();
      onEditProdClose();
      setProdForm({ name: "", unit: "" });
      setCurrentProd(null);
    } finally { setProdFormLoading(false); }
  };
 
  const handleDeleteProd = async () => {
    if (!currentProd) return;
    try {
      await apiBaseCategory.deleteProduct(currentProd.id);
      await fetchProducts();
      onDeleteProdClose();
      setCurrentProd(null);
    } catch (err) { console.error(err); }
  };
 
  const handleShowProducts = (category) => {
    setSelectedCategory(category);
    setShowProducts(true);
    setProductSearch("");
    setPage(1);
    setProducts([]);
    setTotalCount(0);
    localStorage.setItem("cat_showProducts", "true");
    localStorage.setItem("cat_selectedCategory", JSON.stringify(category));
  };
 
  const handleBack = () => {
    setShowProducts(false);
    setSelectedCategory(null);
    setProducts([]);
    setTotalCount(0);
    setPage(1);
    setProductSearch("");
    localStorage.removeItem("cat_showProducts");
    localStorage.removeItem("cat_selectedCategory");
  };
 
  const handleCategoryChange = (e) => {
    const cat = options.find((o) => o.id === e.target.value);
    if (cat) {
      setSelectedCategory(cat);
      setPage(1);
      setProductSearch("");
      localStorage.setItem("cat_selectedCategory", JSON.stringify(cat));
    }
  };
 
  return (
    <Box pr="20px" pb="20px" pt="20px">
 
      {/* ── Header ── */}
      <HStack justify="space-between" mb="16px">
        <HStack>
          {showProducts && (
            <IconButton icon={<ArrowLeft size={18} />} variant="ghost" onClick={handleBack} aria-label="Orqaga" />
          )}
          <Heading size="lg">
            {showProducts ? `Mahsulotlar — ${selectedCategory?.name ?? ""}` : "Kategoriyalar"}
          </Heading>
        </HStack>
        <HStack>
          {!showProducts ? (
            <Button leftIcon={<AddIcon />} colorScheme="blue" onClick={() => { setCatForm({ name: "", note: "" }); onAddCatOpen(); }}>
              Kategoriya qo'shish
            </Button>
          ) : (
            <Button leftIcon={<AddIcon />} colorScheme="blue" onClick={() => { setProdForm({ name: "", unit: "" }); onAddProdOpen(); }}>
              Mahsulot qo'shish
            </Button>
          )}
          <IconButton
            aria-label="Ko'rinish"
            icon={<LayoutGrid size={18} />}
            variant={showProducts ? "solid" : "outline"}
            colorScheme={showProducts ? "blue" : "gray"}
            onClick={() => { if (showProducts) handleBack(); else if (options.length > 0) handleShowProducts(options[0]); }}
          />
        </HStack>
      </HStack>
 
      {/* ── Body (unchanged logic) ── */}
      {!showProducts ? (
        <>
          <HStack mb="20px" gap={4} flexWrap="wrap">
            <InputGroup maxW="400px">
              <Input placeholder="Kategoriya qidirish..." value={searchText} onChange={(e) => setSearchText(e.target.value)} />
              <InputRightElement>
                {searchText ? <IconButton size="sm" variant="ghost" icon={<CloseIcon boxSize={3} />} onClick={() => setSearchText("")} /> : <SearchIcon color="gray.400" />}
              </InputRightElement>
            </InputGroup>
            <Badge colorScheme="blue" px={3} py={1} borderRadius="full" fontSize="sm" fontWeight="semibold">
              {loading ? "Yuklanmoqda..." : `Jami: ${options.length} ta kategoriya`}
            </Badge>
          </HStack>
 
          {loading ? (
            <SimpleGrid columns={{ base: 1, md: 2, xl: 3 }} spacing="20px">
              {[1,2,3,4,5,6].map((i) => (
                <Box key={i} border="1px solid" borderColor="border" borderRadius="12px" p="16px">
                  <SkeletonText noOfLines={1} width="60%" mb={4} />
                  <Skeleton height="16px" width="40px" />
                </Box>
              ))}
            </SimpleGrid>
          ) : options.length === 0 ? (
            <Box borderWidth="1px" borderColor="border" borderRadius="16px" p="18px" bg="surface">
              <Text color="gray.500">Natija topilmadi</Text>
            </Box>
          ) : (
            <SimpleGrid columns={{ base: 1, md: 2, xl: 3 }} spacing="20px">
              {options.map((option) => (
                <Box
                  key={option.id} bg="surface" border="1px solid" borderColor="border"
                  borderRadius="12px" p="16px" position="relative" transition="all .2s"
                  _hover={{ shadow: "md" }} role="group" cursor="pointer"
                  onClick={() => handleShowProducts(option)}
                >
                  <Box position="absolute" top="12px" right="12px" opacity={1} _groupHover={{ opacity: 0 }} pointerEvents="none" transition="opacity 0.2s">
                    <Layers size={18} color="gray" />
                  </Box>
                  <Box position="absolute" top="8px" right="8px" opacity={0} _groupHover={{ opacity: 1 }} transition="opacity 0.2s" onClick={(e) => e.stopPropagation()}>
                    <HStack spacing="6px">
                      <IconButton size="sm" variant="ghost" colorScheme="blue" icon={<PencilLine size={16} />} aria-label="Tahrirlash"
                        onClick={(e) => { e.stopPropagation(); setCurrentCat(option); setCatForm({ name: option.name, note: option.note || "" }); onEditCatOpen(); }} />
                      <IconButton size="sm" variant="ghost" colorScheme="red" icon={<Trash2 size={16} />} aria-label="O'chirish"
                        onClick={(e) => { e.stopPropagation(); setCurrentCat(option); onDeleteCatOpen(); }} />
                    </HStack>
                  </Box>
                  <Text fontWeight="600" fontSize="lg" mb="10px" pr="40px">{option.name}</Text>
                  <HStack spacing={2}>
                    <Building2 size={16} color="gray" />
                    <Text fontSize="sm" color="gray.500">{option.factory_count ?? 0}</Text>
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
              <Input placeholder="Mahsulot qidirish..." value={productSearch} onChange={(e) => setProductSearch(e.target.value)} />
              <InputRightElement>
                {productSearch ? <IconButton size="sm" variant="ghost" icon={<CloseIcon boxSize={3} />} onClick={() => setProductSearch("")} /> : <SearchIcon color="gray.400" />}
              </InputRightElement>
            </InputGroup>
            <Badge colorScheme="blue" px={3} py={1} borderRadius="full" fontSize="sm" fontWeight="semibold">
              {productsLoading ? "Yuklanmoqda..." : `Jami: ${totalCount} ta mahsulot`}
            </Badge>
            <Select maxW="240px" value={selectedCategory?.id || ""} onChange={handleCategoryChange}>
              {options.map((o) => <option key={o.id} value={o.id}>{o.name}</option>)}
            </Select>
          </HStack>
 
          <TableContainer border="1px solid" borderColor="border" borderRadius="12px">
            <Table variant="simple">
              <Thead><Tr><Th>№</Th><Th>Nomi</Th><Th>O'lchov birligi</Th><Th>Amallar</Th></Tr></Thead>
              <Tbody>
                {productsLoading ? (
                  [1,2,3,4,5].map((i) => (
                    <Tr key={i}>
                      <Td><Skeleton height="16px" width="20px" /></Td>
                      <Td><Skeleton height="16px" width="150px" /></Td>
                      <Td><Skeleton height="16px" width="60px" /></Td>
                      <Td><Skeleton height="16px" width="80px" /></Td>
                    </Tr>
                  ))
                ) : products.length === 0 ? (
                  <Tr><Td colSpan={4}><Text color="gray.500" textAlign="center" py={8}>Mahsulot topilmadi</Text></Td></Tr>
                ) : (
                  products.map((p, index) => (
                    <Tr key={p.id} _hover={{ bg: "surface" }}>
                      <Td>{(page - 1) * limit + index + 1}</Td>
                      <Td fontWeight="500">{p.name}</Td>
                      <Td>{p.unit ?? "-"}</Td>
                      <Td>
                        <HStack spacing="6px">
                          <IconButton size="sm" variant="ghost" colorScheme="blue" icon={<PencilLine size={16} />} aria-label="Tahrirlash"
                            onClick={() => { setCurrentProd(p); setProdForm({ name: p.name, unit: p.unit ?? "" }); onEditProdOpen(); }} />
                          <IconButton size="sm" variant="ghost" colorScheme="red" icon={<Trash2 size={16} />} aria-label="O'chirish"
                            onClick={() => { setCurrentProd(p); onDeleteProdOpen(); }} />
                        </HStack>
                      </Td>
                    </Tr>
                  ))
                )}
              </Tbody>
            </Table>
          </TableContainer>
 
          <HStack mt="20px" justify="flex-end" gap={2}>
            <Button size="sm" isDisabled={page === 1} onClick={() => setPage((p) => p - 1)}>Oldingi</Button>
            <Badge px={3} py={1} borderRadius="full">{page}</Badge>
            <Button size="sm" isDisabled={products.length < limit} onClick={() => setPage((p) => p + 1)}>Keyingi</Button>
          </HStack>
        </>
      )}
 
      {/* ════════════════════════════════════════
          MODALS — yangi chiroyli versiya
          ════════════════════════════════════════ */}
 
      {/* ── 1. Kategoriya qo'shish ── */}
      <Modal isOpen={isAddCatOpen} onClose={onAddCatClose} size="md" isCentered motionPreset="slideInBottom">
        <ModalOverlay bg="blackAlpha.700" backdropFilter="blur(8px)" />
        <ModalContent {...modalContentStyle}>
          <ModalHeaderWithIcon
            icon={Layers}
            title="Kategoriya qo'shish"
            subtitle="Yangi kategoriya yarating"
            onClose={onAddCatClose}
          />
          <ModalBody px="24px" py="20px">
            <VStack spacing="16px">
              <StyledInput
                label="Nomi"
                isRequired
                value={catForm.name}
                onChange={(e) => setCatForm({ ...catForm, name: e.target.value })}
                placeholder="Kategoriya nomi"
                maxLength={100}
              />
              <StyledTextarea
                label="Izoh"
                charCount={catForm.note.length}
                maxLength={500}
                value={catForm.note}
                onChange={(e) => setCatForm({ ...catForm, note: e.target.value })}
                placeholder="Qo'shimcha ma'lumot"
                rows={3}
              />
            </VStack>
          </ModalBody>
          <ModalActions
            onCancel={onAddCatClose}
            onConfirm={handleAddCat}
            confirmLabel="Qo'shish"
            isLoading={catFormLoading}
            isDisabled={!catForm.name}
          />
        </ModalContent>
      </Modal>
 
      {/* ── 2. Kategoriyani tahrirlash ── */}
      <Modal isOpen={isEditCatOpen} onClose={onEditCatClose} size="md" isCentered motionPreset="slideInBottom">
        <ModalOverlay bg="blackAlpha.700" backdropFilter="blur(8px)" />
        <ModalContent {...modalContentStyle}>
          <ModalHeaderWithIcon
            icon={PencilLine}
            title="Kategoriyani tahrirlash"
            subtitle={currentCat?.name}
            onClose={onEditCatClose}
          />
          <ModalBody px="24px" py="20px">
            <VStack spacing="16px">
              <StyledInput
                label="Nomi"
                isRequired
                value={catForm.name}
                onChange={(e) => setCatForm({ ...catForm, name: e.target.value })}
                maxLength={100}
              />
              <StyledTextarea
                label="Izoh"
                charCount={catForm.note.length}
                maxLength={500}
                value={catForm.note}
                onChange={(e) => setCatForm({ ...catForm, note: e.target.value })}
                rows={3}
              />
            </VStack>
          </ModalBody>
          <ModalActions
            onCancel={onEditCatClose}
            onConfirm={handleEditCat}
            confirmLabel="Saqlash"
            isLoading={catFormLoading}
            isDisabled={!catForm.name}
          />
        </ModalContent>
      </Modal>
 
      {/* ── 3. Kategoriyani o'chirish ── */}
      <Modal isOpen={isDeleteCatOpen} onClose={onDeleteCatClose} size="sm" isCentered motionPreset="slideInBottom">
        <ModalOverlay bg="blackAlpha.700" backdropFilter="blur(8px)" />
        <ModalContent {...modalContentStyle}>
          <DeleteModalHeader
            title="O'chirishni tasdiqlang"
            subtitle="Bu amalni ortga qaytarib bo'lmaydi."
            onClose={onDeleteCatClose}
          />
          <ModalBody px="24px" py="20px">
            {currentCat && (
              <VStack align="start" spacing="12px">
                <Text fontSize="14px" color="whiteAlpha.700">
                  Quyidagi kategoriya o'chiriladi:
                </Text>
                <Box
                  w="100%"
                  bg="rgba(255,255,255,0.04)"
                  border="1px solid"
                  borderColor="whiteAlpha.200"
                  borderRadius="10px"
                  px="14px"
                  py="10px"
                >
                  <Text fontWeight="700" fontSize="15px" color="white">
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
          />
        </ModalContent>
      </Modal>
 
      {/* ── 4. Mahsulot qo'shish ── */}
      <Modal isOpen={isAddProdOpen} onClose={onAddProdClose} size="md" isCentered motionPreset="slideInBottom">
        <ModalOverlay bg="blackAlpha.700" backdropFilter="blur(8px)" />
        <ModalContent {...modalContentStyle}>
          <ModalHeaderWithIcon
            icon={Package}
            title="Mahsulot qo'shish"
            subtitle={selectedCategory?.name}
            onClose={onAddProdClose}
          />
          <ModalBody px="24px" py="20px">
            <VStack spacing="16px">
              <StyledInput
                label="Nomi"
                isRequired
                value={prodForm.name}
                onChange={(e) => setProdForm({ ...prodForm, name: e.target.value })}
                placeholder="Mahsulot nomi"
              />
              <StyledInput
                label="O'lchov birligi"
                isRequired
                value={prodForm.unit}
                onChange={(e) => setProdForm({ ...prodForm, unit: e.target.value })}
                placeholder="kg, dona, m², tonna..."
              />
            </VStack>
          </ModalBody>
          <ModalActions
            onCancel={onAddProdClose}
            onConfirm={handleAddProd}
            confirmLabel="Qo'shish"
            isLoading={prodFormLoading}
            isDisabled={!prodForm.name || !prodForm.unit}
          />
        </ModalContent>
      </Modal>
 
      {/* ── 5. Mahsulotni tahrirlash ── */}
      <Modal isOpen={isEditProdOpen} onClose={onEditProdClose} size="md" isCentered motionPreset="slideInBottom">
        <ModalOverlay bg="blackAlpha.700" backdropFilter="blur(8px)" />
        <ModalContent {...modalContentStyle}>
          <ModalHeaderWithIcon
            icon={PencilLine}
            title="Mahsulotni tahrirlash"
            subtitle={currentProd?.name}
            onClose={onEditProdClose}
          />
          <ModalBody px="24px" py="20px">
            <VStack spacing="16px">
              <StyledInput
                label="Nomi"
                isRequired
                value={prodForm.name}
                onChange={(e) => setProdForm({ ...prodForm, name: e.target.value })}
                placeholder="Mahsulot nomi"
              />
              <StyledInput
                label="O'lchov birligi"
                isRequired
                value={prodForm.unit}
                onChange={(e) => setProdForm({ ...prodForm, unit: e.target.value })}
                placeholder="kg, dona, m², tonna..."
              />
            </VStack>
          </ModalBody>
          <ModalActions
            onCancel={onEditProdClose}
            onConfirm={handleEditProd}
            confirmLabel="Saqlash"
            isLoading={prodFormLoading}
            isDisabled={!prodForm.name || !prodForm.unit}
          />
        </ModalContent>
      </Modal>
 
      {/* ── 6. Mahsulotni o'chirish ── */}
      <Modal isOpen={isDeleteProdOpen} onClose={onDeleteProdClose} size="sm" isCentered motionPreset="slideInBottom">
        <ModalOverlay bg="blackAlpha.700" backdropFilter="blur(8px)" />
        <ModalContent {...modalContentStyle}>
          <DeleteModalHeader
            title="O'chirishni tasdiqlang"
            subtitle="Bu amalni ortga qaytarib bo'lmaydi."
            onClose={onDeleteProdClose}
          />
          <ModalBody px="24px" py="20px">
            {currentProd && (
              <VStack align="start" spacing="12px">
                <Text fontSize="14px" color="whiteAlpha.700">
                  Quyidagi mahsulot o'chiriladi:
                </Text>
                <Box
                  w="100%"
                  bg="rgba(255,255,255,0.04)"
                  border="1px solid"
                  borderColor="whiteAlpha.200"
                  borderRadius="10px"
                  px="14px"
                  py="10px"
                >
                  <Text fontWeight="700" fontSize="15px" color="white">
                    {currentProd.name}
                  </Text>
                  <Text fontSize="13px" color="whiteAlpha.500" mt="2px">
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
          />
        </ModalContent>
      </Modal>
 
    </Box>
  );
};
 
export default ADbaseCategory;
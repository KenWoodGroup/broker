import {
  Box, Flex, Text, Input, InputGroup, InputRightElement, IconButton,
  Button, Spinner, Select, SimpleGrid,
  Modal, ModalOverlay, ModalContent, ModalBody, ModalFooter,
  ModalCloseButton, FormControl, FormLabel, Textarea, useDisclosure,
  useToast, Menu, MenuButton, MenuList, MenuItem, useColorModeValue,
  VStack, HStack, Icon,
} from "@chakra-ui/react";
import {
  Search, X, Plus, MoreVertical, Edit2, Trash2,
  CheckCircle, RefreshCw, Phone, MapPin, User, Tag, AlertCircle,
  Building2, ShieldCheck, AlertTriangle,
} from "lucide-react";
import { useEffect, useState, useCallback } from "react";
import {
  apiUnverifiedFactories,
  formatUnverifiedFactoriesError,
} from "../../utils/Controllers/apiUnverifiedFactories";

const STATUS_CONFIG = {
  pending:      { label: "Kutilmoqda",       color: "#92400E", bg: "#FEF3C7", dot: "#F59E0B" },
  checking:     { label: "Tekshirilmoqda",   color: "#1E40AF", bg: "#DBEAFE", dot: "#3B82F6" },
  calling:      { label: "Qo'ng'iroq",       color: "#5B21B6", bg: "#EDE9FE", dot: "#8B5CF6" },
  called:       { label: "Qo'ng'irildi",     color: "#155E75", bg: "#CFFAFE", dot: "#06B6D4" },
  active:       { label: "Aktiv",            color: "#065F46", bg: "#D1FAE5", dot: "#10B981" },
  rejected:     { label: "Rad etildi",       color: "#991B1B", bg: "#FEE2E2", dot: "#EF4444" },
  added_to_erp: { label: "ERP ga qo'shildi", color: "#065F46", bg: "#CCFBF1", dot: "#14B8A6" },
};

const STATUSES = Object.entries(STATUS_CONFIG).map(([value, c]) => ({ value, ...c }));

function CardRowIcon({ icon: IconComp, accent = "blue" }) {
  const bg = useColorModeValue(`${accent}.50`, "whiteAlpha.100");
  const ring = useColorModeValue(`${accent}.100`, "whiteAlpha.200");
  const color = useColorModeValue(`${accent}.600`, `${accent}.300`);
  return (
    <Flex
      w="40px"
      h="40px"
      borderRadius="xl"
      align="center"
      justify="center"
      flexShrink={0}
      bg={bg}
      borderWidth="1px"
      borderColor={ring}
    >
      <Icon as={IconComp} boxSize={4} color={color} />
    </Flex>
  );
}

function StatusPill({ status }) {
  const cfg = STATUS_CONFIG[status] || { label: status, color: "#374151", bg: "#F3F4F6", dot: "#9CA3AF" };
  return (
    <Flex
      align="center"
      gap="5px"
      display="inline-flex"
      maxW="100%"
      minW={0}
      px="8px"
      py="3px"
      borderRadius="999px"
      style={{ background: cfg.bg }}
    >
      <Box w="6px" h="6px" borderRadius="full" style={{ background: cfg.dot }} flexShrink={0} />
      <Text
        fontSize="11px"
        fontWeight="700"
        style={{ color: cfg.color }}
        noOfLines={1}
        overflow="hidden"
        textOverflow="ellipsis"
      >
        {cfg.label}
      </Text>
    </Flex>
  );
}

const emptyForm = { name: "", phone: "", address: "", director_name: "", direction: "", note: "", status: "pending" };

const FIELDS = [
  { name: "name",          label: "Nomi *",        placeholder: "Zavod nomi" },
  { name: "phone",         label: "Telefon *",     placeholder: "+998901234567" },
  { name: "address",       label: "Manzil *",      placeholder: "Viloyat, tuman..." },
  { name: "director_name", label: "Direktor ismi", placeholder: "Ahmadov Jasur" },
  { name: "direction",     label: "Yo'nalish",     placeholder: "Metall, qurilish..." },
];

/** Kontent qismi ADfactories FactoryCard (143–205) bilan bir xil tartib/uslub; lead uchun alohida. */
function LeadFactoryCard({
  row,
  onEdit,
  onStatus,
  onReject,
  onDelete,
  onCheck,
}) {
  const bg = useColorModeValue("white", "gray.800");
  const border = useColorModeValue("gray.200", "gray.700");
  const textSub = useColorModeValue("gray.600", "gray.400");
  const cardHoverBorder = useColorModeValue("blue.200", "blue.600");
  const childPinBg = useColorModeValue("gray.100", "whiteAlpha.100");
  const menuBtnBg = useColorModeValue("gray.100", "whiteAlpha.100");
  const menuBtnHover = useColorModeValue("gray.200", "whiteAlpha.200");

  const openMapWithCurrentLocation = (e) => {
    e.stopPropagation();
    const lat = row?.lat;
    const lng = row?.lng;
    if (lat == null || lng == null) return;
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const oLat = position.coords.latitude;
        const oLng = position.coords.longitude;
        const url = `https://www.google.com/maps/dir/?api=1&origin=${oLat},${oLng}&destination=${lat},${lng}`;
        window.open(url, "_blank", "noopener,noreferrer,width=1200,height=800");
      },
      () => {
        const fallback = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
        window.open(fallback, "_blank", "noopener,noreferrer,width=1200,height=800");
      }
    );
  };

  const openChildMap = (e, lat, lng) => {
    e.stopPropagation();
    if (lat == null || lng == null) return;
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const url = `https://www.google.com/maps/dir/?api=1&origin=${position.coords.latitude},${position.coords.longitude}&destination=${lat},${lng}`;
        window.open(url, "_blank", "noopener,noreferrer,width=1200,height=800");
      },
      () => {
        window.open(
          `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`,
          "_blank",
          "noopener,noreferrer,width=1200,height=800"
        );
      }
    );
  };

  return (
    <Box
      position="relative"
      bg={bg}
      border="1px solid"
      borderColor={border}
      borderRadius="2xl"
      p="18px"
      minW={0}
      maxW="100%"
      overflow="hidden"
      transition="all 0.22s ease"
      _hover={{ shadow: "lg", borderColor: cardHoverBorder }}
      role="group"
    >
      <Box
        position="absolute"
        top="10px"
        right="10px"
        zIndex={2}
        onClick={(e) => e.stopPropagation()}
      >
        <Menu placement="bottom-end" strategy="fixed">
          <MenuButton
            as={IconButton}
            icon={<MoreVertical size={18} />}
            size="sm"
            variant="ghost"
            aria-label="Amallar"
            borderRadius="xl"
            bg={menuBtnBg}
            _hover={{ bg: menuBtnHover }}
          />
          <MenuList minW="200px" fontSize="13px" py={2} px={1} borderRadius="xl" boxShadow="xl">
            <MenuItem icon={<Icon as={Edit2} boxSize={4} color="purple.500" />} borderRadius="lg" py={2.5} onClick={() => onEdit(row)}>
              Tahrirlash
            </MenuItem>
            <MenuItem icon={<Icon as={RefreshCw} boxSize={4} color="blue.500" />} borderRadius="lg" py={2.5} onClick={() => onStatus(row)}>
              Status yangilash
            </MenuItem>
            <MenuItem icon={<Icon as={X} boxSize={4} color="orange.500" />} borderRadius="lg" py={2.5} color="orange.600" onClick={() => onReject(row)}>
              Rad etish
            </MenuItem>
            <MenuItem icon={<Icon as={Trash2} boxSize={4} color="red.500" />} borderRadius="lg" py={2.5} color="red.600" onClick={() => onDelete(row)}>
              O&apos;chirish
            </MenuItem>
          </MenuList>
        </Menu>
      </Box>

      <VStack align="stretch" spacing="12px" pr="44px" w="100%" minW={0}>
        <Text
          fontWeight="600"
          fontSize="20px"
          noOfLines={2}
          w="100%"
          minW={0}
          wordBreak="break-word"
        >
          {row?.name || "-"}
        </Text>

        <HStack spacing="12px" w="100%" minW={0} align="flex-start">
          <CardRowIcon icon={MapPin} accent="blue" />
          <Text
            flex={1}
            minW={0}
            color={textSub}
            onClick={(e) => openMapWithCurrentLocation(e)}
            fontSize="sm"
            noOfLines={2}
            pt="9px"
            _hover={{
              color: row?.lat && row?.lng ? "blue.500" : textSub,
              cursor: row?.lat && row?.lng ? "pointer" : "default",
            }}
          >
            {row?.address || "-"}
          </Text>
        </HStack>

        <HStack spacing="12px" w="100%" minW={0} align="flex-start">
          <CardRowIcon icon={Phone} accent="teal" />
          <Text flex={1} minW={0} color={textSub} fontSize="sm" noOfLines={2} wordBreak="break-all" pt="9px">
            {row?.phone || "-"}
          </Text>
        </HStack>

        {row.director_name ? (
          <HStack spacing="12px" w="100%" minW={0} align="flex-start">
            <CardRowIcon icon={User} accent="purple" />
            <Text flex={1} minW={0} color={textSub} fontSize="sm" noOfLines={2} wordBreak="break-word" pt="9px">
              {row.director_name}
            </Text>
          </HStack>
        ) : null}

        {row.direction ? (
          <HStack spacing="12px" w="100%" minW={0} align="flex-start">
            <CardRowIcon icon={Tag} accent="orange" />
            <Text flex={1} minW={0} color={textSub} fontSize="sm" noOfLines={2} wordBreak="break-word" pt="9px">
              {row.direction}
            </Text>
          </HStack>
        ) : null}

        {row?.children?.length > 0 && (
          <Box w="100%" minW={0} pt="8px">
            <Text fontSize="xs" color={textSub} mb="4px">
              Ombor manzillari:
            </Text>
            <VStack align="stretch" spacing="2px" w="100%" minW={0}>
              {row.children.map((child) => (
                <HStack key={child.id} spacing="10px" w="100%" minW={0} align="flex-start">
                  <Flex
                    w="28px"
                    h="28px"
                    borderRadius="lg"
                    align="center"
                    justify="center"
                    flexShrink={0}
                    bg={childPinBg}
                  >
                    <Icon as={MapPin} boxSize={3.5} color="gray.500" />
                  </Flex>
                  <Text
                    flex={1}
                    minW={0}
                    fontSize="xs"
                    noOfLines={2}
                    wordBreak="break-word"
                    color={textSub}
                    pt="5px"
                    _hover={{
                      color: child?.lat && child?.lng ? "blue.500" : textSub,
                      cursor: child?.lat && child?.lng ? "pointer" : "default",
                    }}
                    onClick={(e) => openChildMap(e, child?.lat, child?.lng)}
                  >
                    {child.address || "-"}
                  </Text>
                </HStack>
              ))}
            </VStack>
          </Box>
        )}

        <Box w="100%" minW={0} pt="8px" borderTop="1px solid" borderColor={border}>
          <Flex
            justify="space-between"
            align="center"
            flexWrap="wrap"
            gap={2}
            w="100%"
            minW={0}
          >
            <Box minW={0} maxW={{ base: "100%", sm: "calc(100% - 140px)" }} flex="1 1 auto">
              <StatusPill status={row.status} />
            </Box>
            <Button
              size="xs"
              variant="outline"
              colorScheme="blue"
              borderRadius="8px"
              flexShrink={0}
              leftIcon={<CheckCircle size={14} />}
              onClick={(e) => {
                e.stopPropagation();
                onCheck(row);
              }}
            >
              Bazada bormi?
            </Button>
          </Flex>
        </Box>
      </VStack>
    </Box>
  );
}

export default function UnverifiedFactories({ role = "admin" }) {
  const toast = useToast();

  const pageBg    = useColorModeValue("gray.50",  "gray.900");
  const textMuted = useColorModeValue("gray.500", "gray.400");
  const inputBg   = useColorModeValue("white",    "gray.800");
  const borderCol = useColorModeValue("gray.200", "gray.600");
  const countBg   = useColorModeValue("blue.50",  "blue.900");
  const countText = useColorModeValue("blue.700", "blue.200");
  const erpBg     = useColorModeValue("blue.50",  "blue.900");
  const erpBorder = useColorModeValue("blue.200", "blue.700");

  const modalHeadForm = useColorModeValue(
    "linear-gradient(135deg, #eff6ff 0%, #e0e7ff 50%, #dbeafe 100%)",
    "linear-gradient(135deg, rgba(59,130,246,0.22) 0%, rgba(15,23,42,0.92) 100%)"
  );
  const modalHeadStatus = useColorModeValue(
    "linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)",
    "linear-gradient(135deg, rgba(14,165,233,0.2) 0%, rgba(15,23,42,0.92) 100%)"
  );
  const modalHeadCheck = useColorModeValue(
    "linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)",
    "linear-gradient(135deg, rgba(16,185,129,0.22) 0%, rgba(15,23,42,0.92) 100%)"
  );
  const modalHeadReject = useColorModeValue(
    "linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)",
    "linear-gradient(135deg, rgba(245,158,11,0.25) 0%, rgba(15,23,42,0.92) 100%)"
  );
  const modalHeadDelete = useColorModeValue(
    "linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)",
    "linear-gradient(135deg, rgba(239,68,68,0.22) 0%, rgba(15,23,42,0.92) 100%)"
  );
  const modalHeaderBorder = useColorModeValue("gray.200", "whiteAlpha.200");
  const modalFooterBg = useColorModeValue("gray.50", "whiteAlpha.50");
  const modalIconBg = useColorModeValue("white", "whiteAlpha.200");
  const deleteWarnBg = useColorModeValue("red.50", "whiteAlpha.50");

  const [data, setData]             = useState([]);
  const [total, setTotal]           = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage]             = useState(1);
  const [loading, setLoading]       = useState(false);
  const [search, setSearch]         = useState("");
  const [debSearch, setDebSearch]   = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const [checkTarget, setCheckTarget]   = useState(null);
  const [checkData, setCheckData]       = useState(null);
  const [checkLoading, setCheckLoading] = useState(false);

  const [formData, setFormData]       = useState(emptyForm);
  const [editTarget, setEditTarget]   = useState(null);
  const [formLoading, setFormLoading] = useState(false);

  const [deleteTarget, setDeleteTarget]   = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const [rejectTarget, setRejectTarget]   = useState(null);
  const [rejectReason, setRejectReason]   = useState("");
  const [rejectLoading, setRejectLoading] = useState(false);

  const [statusTarget, setStatusTarget]   = useState(null);
  const [newStatus, setNewStatus]         = useState("");
  const [statusLoading, setStatusLoading] = useState(false);

  const createModal = useDisclosure();
  const deleteModal = useDisclosure();
  const rejectModal = useDisclosure();
  const statusModal = useDisclosure();
  const checkModal  = useDisclosure();

  /* ── debounce ── */
  useEffect(() => {
    const t = setTimeout(() => { setDebSearch(search.trim()); setPage(1); }, 500);
    return () => clearTimeout(t);
  }, [search]);

  /* ── fetch ── */
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page };
      if (debSearch) params.search = debSearch;
      if (statusFilter) params.status = statusFilter;
      const res = await apiUnverifiedFactories.list(params);
      const d = res.data;
      setData(d.data ?? []);
      setTotal(d.total ?? 0);
      setTotalPages(d.total_pages ?? 1);
    } catch (e) {
      toast({
        title: "Xatolik",
        description: formatUnverifiedFactoriesError(e) || "Yuklab bo'lmadi",
        status: "error",
        duration: 3000,
      });
    } finally { setLoading(false); }
  }, [page, debSearch, statusFilter]);

  useEffect(() => { fetchData(); }, [fetchData]);

  /* ── openers ── */
  const openCreate = () => { setFormData(emptyForm); setEditTarget(null); createModal.onOpen(); };
  const openEdit   = (row) => {
    setFormData({
      name: row.name || "", phone: row.phone || "", address: row.address || "",
      director_name: row.director_name || "", direction: row.direction || "",
      note: row.note || "", status: row.status,
    });
    setEditTarget(row);
    createModal.onOpen();
  };
  const openDelete = (row) => { setDeleteTarget(row); deleteModal.onOpen(); };
  const openReject = (row) => { setRejectTarget(row); setRejectReason(""); rejectModal.onOpen(); };
  const openStatus = (row) => { setStatusTarget(row); setNewStatus(row.status); statusModal.onOpen(); };
  const openCheck  = (row) => { setCheckTarget(row); setCheckData(null); checkModal.onOpen(); };

  const handleFormChange = (e) => setFormData(p => ({ ...p, [e.target.name]: e.target.value }));

  /* ── save: create → POST, edit → PATCH /:id ── */
  const handleSave = async () => {
    if (!formData.name || !formData.phone || !formData.address) {
      toast({ title: "Majburiy maydonlarni to'ldiring", status: "warning", duration: 2500 }); return;
    }
    setFormLoading(true);
    try {
      if (editTarget) {
        await apiUnverifiedFactories.update(editTarget.id, formData);
      } else {
        await apiUnverifiedFactories.create(formData);
      }
      toast({ title: editTarget ? "Yangilandi" : "Qo'shildi", status: "success", duration: 2000 });
      createModal.onClose();
      fetchData();
    } catch (e) {
      toast({
        title: "Xatolik",
        description: formatUnverifiedFactoriesError(e) || "Saqlab bo'lmadi",
        status: "error",
        duration: 3000,
      });
    } finally { setFormLoading(false); }
  };

  /* ── status → PATCH /:id { status } ── */
  const handleStatusUpdate = async () => {
    if (!statusTarget || !newStatus) return;
    setStatusLoading(true);
    try {
      await apiUnverifiedFactories.updateStatus(statusTarget.id, { status: newStatus });
      toast({ title: "Status yangilandi", status: "success", duration: 2000 });
      statusModal.onClose();
      fetchData();
    } catch (e) {
      toast({
        title: "Xatolik",
        description: formatUnverifiedFactoriesError(e) || "Status yangilanmadi",
        status: "error",
        duration: 3000,
      });
    } finally { setStatusLoading(false); }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await apiUnverifiedFactories.delete(deleteTarget.id);
      toast({ title: "O'chirildi", status: "success", duration: 2000 });
      deleteModal.onClose();
      fetchData();
    } catch (e) {
      toast({
        title: "Xatolik",
        description: formatUnverifiedFactoriesError(e) || "O'chirib bo'lmadi",
        status: "error",
        duration: 3000,
      });
    } finally { setDeleteLoading(false); }
  };

  const handleReject = async () => {
    if (!rejectTarget) return;
    setRejectLoading(true);
    try {
      await apiUnverifiedFactories.reject(rejectTarget.id, {
        reason: rejectReason?.trim() || "",
      });
      toast({ title: "Rad etildi", status: "info", duration: 2000 });
      rejectModal.onClose();
      fetchData();
    } catch (e) {
      toast({
        title: "Xatolik",
        description: formatUnverifiedFactoriesError(e) || "Rad etib bo'lmadi",
        status: "error",
        duration: 3000,
      });
    } finally { setRejectLoading(false); }
  };

  const handleCheck = async () => {
    if (!checkTarget) return;
    setCheckLoading(true);
    try {
      const res = await apiUnverifiedFactories.checkErp(checkTarget.id);
      setCheckData(res.data);
    } catch (e) {
      toast({
        title: "Xatolik",
        description: formatUnverifiedFactoriesError(e) || "Tekshirib bo'lmadi",
        status: "error",
        duration: 3000,
      });
    } finally { setCheckLoading(false); }
  };

  /* ── render ── */
  return (
    <Box
      px={{ base: 4, md: 6 }}
      pt="24px"
      pb="40px"
      minH="100vh"
      maxW="100%"
      overflowX="hidden"
    >

      <Flex
        justify="space-between"
        align="center"
        mb="20px"
        flexWrap="wrap"
        gap={3}
      >
        <Text fontSize="22px" fontWeight="600" minW={0} flex="1 1 240px">
          Tasdiqlanmagan zavodlar
        </Text>
        <Button
          leftIcon={<Plus size={15} />}
          colorScheme="blue"
          borderRadius="xl"
          size="md"
          flexShrink={0}
          boxShadow="sm"
          onClick={openCreate}
        >
          Yaratish
        </Button>
      </Flex>

      <Flex gap={3} mb="20px" flexWrap="wrap" align="center">
        <InputGroup maxW="320px" size="md">
          <Input placeholder="Qidiruv..." value={search} onChange={e => setSearch(e.target.value)}
            bg={inputBg} borderRadius="8px" borderColor={borderCol} />
          <InputRightElement>
            {search
              ? <IconButton size="xs" variant="ghost" icon={<X size={13} />} onClick={() => setSearch("")} />
              : <Search size={14} color="gray" />}
          </InputRightElement>
        </InputGroup>

        <Select size="md" maxW="200px" value={statusFilter}
          onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
          placeholder="Status (hammasi)" bg={inputBg} borderRadius="8px" borderColor={borderCol}>
          {STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
        </Select>

        <Box px={3} py="7px" bg={countBg} borderRadius="full">
          {loading
            ? <Flex align="center" gap={2}><Spinner size="xs" color="blue.500" /><Text fontSize="12px" color={countText} fontWeight="700">Yuklanmoqda</Text></Flex>
            : <Text fontSize="12px" color={countText} fontWeight="700">JAMI: {total} TA</Text>}
        </Box>
      </Flex>

      {/* Cards grid */}
      {loading && data.length === 0 ? (
        <Flex justify="center" align="center" py={16}><Spinner size="lg" color="blue.400" /></Flex>
      ) : data.length === 0 ? (
        <Flex justify="center" align="center" py={16} direction="column" gap={2}>
          <AlertCircle size={32} color="gray" />
          <Text color={textMuted} fontSize="14px">Ma'lumot topilmadi</Text>
        </Flex>
      ) : (
        <SimpleGrid columns={{ base: 1, md: 2, xl: 3 }} spacing={4}>
          {data.map((row) => (
            <LeadFactoryCard
              key={row.id}
              row={row}
              onEdit={openEdit}
              onStatus={openStatus}
              onReject={openReject}
              onDelete={openDelete}
              onCheck={openCheck}
            />
          ))}
        </SimpleGrid>
      )}

      <Flex justify="center" align="center" gap={2} mt="28px">
        <Button size="sm" variant="outline" onClick={() => setPage(1)} isDisabled={page === 1}>First</Button>
        <Button size="sm" variant="outline" onClick={() => setPage(p => Math.max(1, p - 1))} isDisabled={page === 1}>‹</Button>
        <Text fontSize="13px" fontWeight="500" minW="64px" textAlign="center">{page} / {totalPages}</Text>
        <Button size="sm" variant="outline" onClick={() => setPage(p => Math.min(totalPages, p + 1))} isDisabled={page === totalPages}>›</Button>
        <Button size="sm" variant="outline" onClick={() => setPage(totalPages)} isDisabled={page === totalPages}>Last</Button>
      </Flex>

      {/* ── Create / Edit Modal ── */}
      <Modal
        isOpen={createModal.isOpen}
        onClose={createModal.onClose}
        size="md"
        isCentered
        motionPreset="slideInBottom"
        scrollBehavior="inside"
      >
        <ModalOverlay bg="blackAlpha.600" backdropFilter="blur(8px)" />
        <ModalContent borderRadius="2xl" overflow="hidden" boxShadow="2xl" mx={{ base: 4, md: 0 }}>
          <Box position="relative" px={6} py={5} borderBottomWidth="1px" borderColor={modalHeaderBorder} bgImage={modalHeadForm}>
            <HStack spacing={3} pr={10} align="start">
              <Flex w={10} h={10} borderRadius="xl" bg={modalIconBg} align="center" justify="center" boxShadow="sm">
                <Icon as={Building2} boxSize={5} color="blue.600" />
              </Flex>
              <Box minW={0}>
                <Text fontWeight="bold" fontSize="lg" lineHeight="short">
                  {editTarget ? "Zavodni tahrirlash" : "Yangi zavod qo'shish"}
                </Text>
                <Text fontSize="sm" color="gray.400" mt={1} noOfLines={2}>
                  {editTarget?.name || "Yangi lead ma'lumotlarini kiriting"}
                </Text>
              </Box>
            </HStack>
            <ModalCloseButton top={4} borderRadius="full" />
          </Box>
          <ModalBody py={6}>
            <Flex direction="column" gap={4}>
              {FIELDS.map(f => (
                <FormControl key={f.name}>
                  <FormLabel fontSize="sm" fontWeight="semibold" mb={1.5}>{f.label}</FormLabel>
                  <Input
                    name={f.name} value={formData[f.name]} onChange={handleFormChange}
                    placeholder={f.placeholder} borderRadius="xl" size="md"
                  />
                </FormControl>
              ))}
              <FormControl>
                <FormLabel fontSize="sm" fontWeight="semibold" mb={1.5}>Izoh</FormLabel>
                <Textarea name="note" value={formData.note} onChange={handleFormChange}
                  rows={3} borderRadius="xl" size="md" />
              </FormControl>
              <FormControl>
                <FormLabel fontSize="sm" fontWeight="semibold" mb={1.5}>Status</FormLabel>
                <Select name="status" value={formData.status} onChange={handleFormChange} borderRadius="xl" size="md">
                  {STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                </Select>
              </FormControl>
            </Flex>
          </ModalBody>
          <ModalFooter gap={3} py={4} px={6} bg={modalFooterBg} borderTopWidth="1px" borderColor={modalHeaderBorder}>
            <Button variant="ghost" size="md" borderRadius="xl" onClick={createModal.onClose}>Bekor qilish</Button>
            <Button colorScheme="blue" size="md" onClick={handleSave} isLoading={formLoading} borderRadius="xl" px={8}>
              {editTarget ? "Saqlash" : "Qo'shish"}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* ── Status Modal ── */}
      <Modal isOpen={statusModal.isOpen} onClose={statusModal.onClose} size="sm" isCentered motionPreset="slideInBottom">
        <ModalOverlay bg="blackAlpha.600" backdropFilter="blur(8px)" />
        <ModalContent borderRadius="2xl" overflow="hidden" boxShadow="2xl" mx={{ base: 4, md: 0 }}>
          <Box position="relative" px={6} py={5} borderBottomWidth="1px" borderColor={modalHeaderBorder} bgImage={modalHeadStatus}>
            <HStack spacing={3} pr={10}>
              <Flex w={10} h={10} borderRadius="xl" bg={modalIconBg} align="center" justify="center" boxShadow="sm">
                <Icon as={RefreshCw} boxSize={5} color="cyan.600" />
              </Flex>
              <Box minW={0}>
                <Text fontWeight="bold" fontSize="lg">Status yangilash</Text>
                <Text fontSize="sm" color="gray.400" mt={1} noOfLines={2}>{statusTarget?.name}</Text>
              </Box>
            </HStack>
            <ModalCloseButton top={4} borderRadius="full" />
          </Box>
          <ModalBody py={6}>
            <FormControl>
              <FormLabel fontSize="sm" fontWeight="semibold" mb={2}>Yangi status</FormLabel>
              <Select value={newStatus} onChange={e => setNewStatus(e.target.value)} borderRadius="xl" size="md">
                {STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
              </Select>
            </FormControl>
          </ModalBody>
          <ModalFooter gap={3} py={4} px={6} bg={modalFooterBg} borderTopWidth="1px" borderColor={modalHeaderBorder}>
            <Button variant="ghost" size="md" borderRadius="xl" onClick={statusModal.onClose}>Bekor qilish</Button>
            <Button colorScheme="blue" size="md" onClick={handleStatusUpdate} isLoading={statusLoading} borderRadius="xl" px={8}>Saqlash</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* ── Check ERP Modal ── */}
      <Modal
        isOpen={checkModal.isOpen}
        onClose={checkModal.onClose}
        size="md"
        isCentered
        motionPreset="slideInBottom"
        scrollBehavior="inside"
      >
        <ModalOverlay bg="blackAlpha.600" backdropFilter="blur(8px)" />
        <ModalContent borderRadius="2xl" overflow="hidden" boxShadow="2xl" mx={{ base: 4, md: 0 }}>
          <Box position="relative" px={6} py={5} borderBottomWidth="1px" borderColor={modalHeaderBorder} bgImage={modalHeadCheck}>
            <HStack spacing={3} pr={10}>
              <Flex w={10} h={10} borderRadius="xl" bg={modalIconBg} align="center" justify="center" boxShadow="sm">
                <Icon as={ShieldCheck} boxSize={5} color="green.600" />
              </Flex>
              <Box minW={0}>
                <Text fontWeight="bold" fontSize="lg">Bazada tekshirish</Text>
                <Text fontSize="sm" color="gray.600" mt={1} noOfLines={2}>{checkTarget?.name}</Text>
              </Box>
            </HStack>
            <ModalCloseButton top={4} borderRadius="full" />
          </Box>
          <ModalBody py={6}>
            {!checkData ? (
              <Flex direction="column" align="center" gap={4} py={2}>
                <Text fontSize="sm" color={textMuted} textAlign="center" maxW="320px">
                  ERP bazasida bu zavod mavjudligini tekshirish
                </Text>
                <Button
                  colorScheme="green"
                  borderRadius="xl"
                  size="md"
                  px={8}
                  leftIcon={<Icon as={CheckCircle} boxSize={5} />}
                  isLoading={checkLoading}
                  onClick={handleCheck}
                >
                  Tekshirish
                </Button>
              </Flex>
            ) : (
              <Box>
                {checkData.erp_check?.warning && (
                  <Box px={4} py={3} bg="orange.50" border="1px solid" borderColor="orange.200" borderRadius="xl" mb={4}>
                    <Text fontSize="sm" color="orange.800">{checkData.erp_check.warning}</Text>
                  </Box>
                )}
                {checkData.erp_check?.found_in_erp ? (
                  <Box>
                    <Flex align="center" gap={2} mb={4}>
                      <Box w="10px" h="10px" borderRadius="full" bg="green.500" />
                      <Text fontSize="md" fontWeight="700" color="green.700">Bazada mavjud</Text>
                    </Flex>
                    <Flex direction="column" gap={3}>
                      {(checkData.erp_check.erp_results || []).map((r, i) => (
                        <Box key={i} p={4} bg={erpBg} border="1px solid" borderColor={erpBorder} borderRadius="xl" fontSize="sm">
                          <Text fontWeight="600" mb={1}>{r.name || r.full_name}</Text>
                          {r.address && <Text color={textMuted} fontSize="sm">{r.address}</Text>}
                          {r.phone   && <Text color={textMuted} fontSize="sm">{r.phone}</Text>}
                        </Box>
                      ))}
                    </Flex>
                  </Box>
                ) : (
                  <Flex align="center" gap={3} py={2}>
                    <Box w="10px" h="10px" borderRadius="full" bg="red.500" />
                    <Text fontSize="md" fontWeight="700" color="red.600">Bazada topilmadi</Text>
                  </Flex>
                )}
              </Box>
            )}
          </ModalBody>
          <ModalFooter gap={2} flexWrap="wrap" py={4} px={6} bg={modalFooterBg} borderTopWidth="1px" borderColor={modalHeaderBorder}>
            {checkData && (
              <>
                <Button variant="ghost" size="md" colorScheme="orange" borderRadius="xl"
                  onClick={() => { checkModal.onClose(); openReject(checkTarget); }}>Rad etish</Button>
                <Button variant="ghost" size="md" colorScheme="blue" borderRadius="xl"
                  onClick={() => { checkModal.onClose(); openStatus(checkTarget); }}>Status yangilash</Button>
              </>
            )}
            <Button variant="ghost" size="md" borderRadius="xl" onClick={checkModal.onClose}>Yopish</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* ── Reject Modal ── */}
      <Modal isOpen={rejectModal.isOpen} onClose={rejectModal.onClose} size="md" isCentered motionPreset="slideInBottom">
        <ModalOverlay bg="blackAlpha.600" backdropFilter="blur(8px)" />
        <ModalContent borderRadius="2xl" overflow="hidden" boxShadow="2xl" mx={{ base: 4, md: 0 }}>
          <Box position="relative" px={6} py={5} borderBottomWidth="1px" borderColor={modalHeaderBorder} bgImage={modalHeadReject}>
            <HStack spacing={3} pr={10}>
              <Flex w={10} h={10} borderRadius="xl" bg={modalIconBg} align="center" justify="center" boxShadow="sm">
                <Icon as={AlertCircle} boxSize={5} color="orange.500" />
              </Flex>
              <Box minW={0}>
                <Text fontWeight="bold" fontSize="lg">Rad etish</Text>
                <Text fontSize="sm" color="gray.400" mt={1} noOfLines={2}>{rejectTarget?.name}</Text>
              </Box>
            </HStack>
            <ModalCloseButton top={4} borderRadius="full" />
          </Box>
          <ModalBody py={6}>
            <FormControl>
              <FormLabel fontSize="sm" fontWeight="semibold" mb={2}>Sabab (ixtiyoriy)</FormLabel>
              <Textarea value={rejectReason} onChange={e => setRejectReason(e.target.value)}
                placeholder="Rad etish sababi..." rows={4} borderRadius="xl" size="md" />
            </FormControl>
          </ModalBody>
          <ModalFooter gap={3} py={4} px={6} bg={modalFooterBg} borderTopWidth="1px" borderColor={modalHeaderBorder}>
            <Button variant="ghost" size="md" borderRadius="xl" onClick={rejectModal.onClose}>Bekor qilish</Button>
            <Button colorScheme="orange" size="md" onClick={handleReject} isLoading={rejectLoading} borderRadius="xl" px={8}>Rad etish</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* ── Delete Modal ── */}
      <Modal isOpen={deleteModal.isOpen} onClose={deleteModal.onClose} size="md" isCentered motionPreset="slideInBottom">
        <ModalOverlay bg="blackAlpha.600" backdropFilter="blur(8px)" />
        <ModalContent borderRadius="2xl" overflow="hidden" boxShadow="2xl" mx={{ base: 4, md: 0 }}>
          <Box position="relative" px={6} py={5} borderBottomWidth="1px" borderColor={modalHeaderBorder} bgImage={modalHeadDelete}>
            <HStack spacing={3} pr={10}>
              <Flex w={10} h={10} borderRadius="xl" bg={modalIconBg} align="center" justify="center" boxShadow="sm">
                <Icon as={Trash2} boxSize={5} color="red.600" />
              </Flex>
              <Box minW={0}>
                <Text fontWeight="bold" fontSize="lg">O&apos;chirishni tasdiqlang</Text>
                <Text fontSize="sm" color="gray.400" mt={1}>Bu amalni qaytarib bo&apos;lmaydi</Text>
              </Box>
            </HStack>
            <ModalCloseButton top={4} borderRadius="full" />
          </Box>
          <ModalBody py={6}>
            <Box p={4} borderRadius="xl" borderWidth="1px" borderColor={modalHeaderBorder} bg={deleteWarnBg}>
              <HStack align="start" spacing={3}>
                <Icon as={AlertTriangle} boxSize={5} color="red.500" flexShrink={0} mt={0.5} />
                <Text fontSize="sm" color={textMuted} lineHeight="tall">
                  <Text as="span" fontWeight="700" color="gray.400">{deleteTarget?.name}</Text>
                </Text>
              </HStack>
            </Box>
          </ModalBody>
          <ModalFooter gap={3} py={4} px={6} bg={modalFooterBg} borderTopWidth="1px" borderColor={modalHeaderBorder}>
            <Button variant="ghost" size="md" borderRadius="xl" onClick={deleteModal.onClose}>Bekor qilish</Button>
            <Button colorScheme="red" size="md" onClick={handleDelete} isLoading={deleteLoading} borderRadius="xl" px={8} leftIcon={<Icon as={Trash2} boxSize={4} />}>
              O&apos;chirish
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

    </Box>
  );
}
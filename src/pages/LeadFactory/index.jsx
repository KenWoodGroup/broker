import {
  Box, Flex, Text, Input, InputGroup, InputRightElement, IconButton,
  Button, Spinner, Select, SimpleGrid,
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalFooter,
  ModalCloseButton, FormControl, FormLabel, Textarea, useDisclosure,
  useToast, Menu, MenuButton, MenuList, MenuItem, useColorModeValue,
} from "@chakra-ui/react";
import {
  Search, X, Plus, MoreVertical, Edit2, Trash2,
  CheckCircle, RefreshCw, Phone, MapPin, User, Tag, AlertCircle,
} from "lucide-react";
import { useEffect, useState, useCallback } from "react";
import { $api } from "../../utils/api/axios";

const BASE = "/unverified-factories";
const PAGE_LIMIT = 20;

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

function StatusPill({ status }) {
  const cfg = STATUS_CONFIG[status] || { label: status, color: "#374151", bg: "#F3F4F6", dot: "#9CA3AF" };
  return (
    <Flex align="center" gap="5px" display="inline-flex" px="8px" py="3px" borderRadius="999px" style={{ background: cfg.bg }}>
      <Box w="6px" h="6px" borderRadius="full" style={{ background: cfg.dot }} flexShrink={0} />
      <Text fontSize="11px" fontWeight="700" style={{ color: cfg.color }}>{cfg.label}</Text>
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

function FactoryCard({ row, idx, page, onEdit, onStatus, onReject, onDelete, onCheck }) {
  const cardBg      = useColorModeValue("white",    "gray.800");
  const borderCol   = useColorModeValue("gray.200", "gray.600");
  const hoverBorder = useColorModeValue("blue.300", "blue.500");
  const textMuted   = useColorModeValue("gray.500", "gray.400");
  const numBg       = useColorModeValue("gray.100", "gray.700");
  const iconColor   = useColorModeValue("#9CA3AF",  "#6B7280");

  return (
    <Box
      bg={cardBg} border="1px solid" borderColor={borderCol} borderRadius="12px" p="16px"
      transition="border-color 0.15s" _hover={{ borderColor: hoverBorder }}
    >
      {/* Header: index + name + menu */}
      <Flex justify="space-between" align="flex-start" mb="12px">
        <Flex align="center" gap={2} flex={1} minW={0}>
          <Box bg={numBg} borderRadius="6px" px="7px" py="2px" flexShrink={0}>
            <Text fontSize="11px" fontWeight="600" color={textMuted}>
              {(page - 1) * PAGE_LIMIT + idx + 1}
            </Text>
          </Box>
          <Text fontSize="14px" fontWeight="600" overflow="hidden" textOverflow="ellipsis" whiteSpace="nowrap" title={row.name}>
            {row.name}
          </Text>
        </Flex>
        <Menu>
          <MenuButton as={IconButton} icon={<MoreVertical size={15} />} size="xs" variant="ghost" borderRadius="6px" flexShrink={0} ml={1} />
          <MenuList minW="170px" fontSize="13px" py={1}>
            <MenuItem icon={<Edit2 size={13} />}     py={2} onClick={() => onEdit(row)}>Tahrirlash</MenuItem>
            <MenuItem icon={<RefreshCw size={13} />}  py={2} onClick={() => onStatus(row)}>Status yangilash</MenuItem>
            <MenuItem icon={<X size={13} />}          py={2} color="orange.500" onClick={() => onReject(row)}>Rad etish</MenuItem>
            <MenuItem icon={<Trash2 size={13} />}     py={2} color="red.500"    onClick={() => onDelete(row)}>O'chirish</MenuItem>
          </MenuList>
        </Menu>
      </Flex>

      {/* Info */}
      <Flex direction="column" gap="7px" mb="14px">
        <Flex align="center" gap="8px">
          <Phone size={13} color={iconColor} style={{ flexShrink: 0 }} />
          <Text fontSize="13px" color={textMuted}>{row.phone}</Text>
        </Flex>
        <Flex align="flex-start" gap="8px">
          <MapPin size={13} color={iconColor} style={{ flexShrink: 0, marginTop: 2 }} />
          <Text fontSize="12px" color={textMuted} noOfLines={2}>{row.address}</Text>
        </Flex>
        {row.director_name && (
          <Flex align="center" gap="8px">
            <User size={13} color={iconColor} style={{ flexShrink: 0 }} />
            <Text fontSize="12px" color={textMuted}>{row.director_name}</Text>
          </Flex>
        )}
        {row.direction && (
          <Flex align="center" gap="8px">
            <Tag size={13} color={iconColor} style={{ flexShrink: 0 }} />
            <Text fontSize="12px" color={textMuted}>{row.direction}</Text>
          </Flex>
        )}
      </Flex>

      {/* Footer */}
      <Flex justify="space-between" align="center" pt="12px" borderTop="1px solid" borderColor={borderCol}>
        <StatusPill status={row.status} />
        <Button size="xs" variant="outline" colorScheme="blue" borderRadius="6px" fontSize="11px"
          leftIcon={<CheckCircle size={11} />} onClick={() => onCheck(row)}>
          Bazada bormi?
        </Button>
      </Flex>
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
      const params = new URLSearchParams();
      params.append("page", page);
      if (debSearch)    params.append("search", debSearch);
      if (statusFilter) params.append("status", statusFilter);
      const res = await $api.get(`${BASE}?${params}`);
      const d = res.data;
      setData(d.data ?? []);
      setTotal(d.total ?? 0);
      setTotalPages(d.total_pages ?? 1);
    } catch (e) {
      toast({ title: "Xatolik", description: e?.response?.data?.message || "Yuklab bo'lmadi", status: "error", duration: 3000 });
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
        await $api.patch(`${BASE}/${editTarget.id}`, formData);
      } else {
        await $api.post(BASE, formData);
      }
      toast({ title: editTarget ? "Yangilandi" : "Qo'shildi", status: "success", duration: 2000 });
      createModal.onClose();
      fetchData();
    } catch (e) {
      toast({ title: "Xatolik", description: e?.response?.data?.message || "Saqlab bo'lmadi", status: "error", duration: 3000 });
    } finally { setFormLoading(false); }
  };

  /* ── status update → PATCH /:id/status ── */
  const handleStatusUpdate = async () => {
    if (!statusTarget || !newStatus) return;
    setStatusLoading(true);
    try {
      await $api.patch(`${BASE}/${statusTarget.id}/status`, { status: newStatus });
      toast({ title: "Status yangilandi", status: "success", duration: 2000 });
      statusModal.onClose();
      fetchData();
    } catch (e) {
      toast({ title: "Xatolik", description: e?.response?.data?.message, status: "error", duration: 3000 });
    } finally { setStatusLoading(false); }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await $api.delete(`${BASE}/${deleteTarget.id}`);
      toast({ title: "O'chirildi", status: "success", duration: 2000 });
      deleteModal.onClose();
      fetchData();
    } catch (e) {
      toast({ title: "Xatolik", description: e?.response?.data?.message, status: "error", duration: 3000 });
    } finally { setDeleteLoading(false); }
  };

  const handleReject = async () => {
    if (!rejectTarget) return;
    setRejectLoading(true);
    try {
      await $api.patch(`${BASE}/${rejectTarget.id}/reject`, { reason: rejectReason });
      toast({ title: "Rad etildi", status: "info", duration: 2000 });
      rejectModal.onClose();
      fetchData();
    } catch (e) {
      toast({ title: "Xatolik", description: e?.response?.data?.message, status: "error", duration: 3000 });
    } finally { setRejectLoading(false); }
  };

  const handleCheck = async () => {
    if (!checkTarget) return;
    setCheckLoading(true);
    try {
      const res = await $api.get(`${BASE}/${checkTarget.id}/check-erp`);
      setCheckData(res.data);
    } catch (e) {
      toast({ title: "Xatolik", description: e?.response?.data?.message || "Tekshirib bo'lmadi", status: "error", duration: 3000 });
    } finally { setCheckLoading(false); }
  };

  /* ── render ── */
  return (
    <Box px="24px" pt="24px" pb="40px" bg={pageBg} minH="100vh">

      <Flex justify="space-between" align="center" mb="20px">
        <Text fontSize="22px" fontWeight="600">T-zavodlar</Text>
        <Button leftIcon={<Plus size={15} />} colorScheme="blue" borderRadius="8px" size="md" onClick={openCreate}>
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
        <SimpleGrid columns={{ base: 1, md: 2, xl: 3 }} spacing="16px">
          {data.map((row, idx) => (
            <FactoryCard key={row.id} row={row} idx={idx} page={page}
              onEdit={openEdit} onStatus={openStatus}
              onReject={openReject} onDelete={openDelete} onCheck={openCheck} />
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
      <Modal isOpen={createModal.isOpen} onClose={createModal.onClose} size="md">
        <ModalOverlay bg="blackAlpha.500" />
        <ModalContent borderRadius="12px">
          <ModalHeader fontSize="16px" pb={2}>
            {editTarget ? "Zavodni tahrirlash" : "Yangi zavod qo'shish"}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Flex direction="column" gap={3}>
              {FIELDS.map(f => (
                <FormControl key={f.name}>
                  <FormLabel fontSize="13px" mb={1}>{f.label}</FormLabel>
                  <Input
                    name={f.name} value={formData[f.name]} onChange={handleFormChange}
                    placeholder={f.placeholder} borderRadius="8px" size="sm"
                  />
                </FormControl>
              ))}
              <FormControl>
                <FormLabel fontSize="13px" mb={1}>Izoh</FormLabel>
                <Textarea name="note" value={formData.note} onChange={handleFormChange}
                  rows={2} borderRadius="8px" size="sm" />
              </FormControl>
              <FormControl>
                <FormLabel fontSize="13px" mb={1}>Status</FormLabel>
                <Select name="status" value={formData.status} onChange={handleFormChange} borderRadius="8px" size="sm">
                  {STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                </Select>
              </FormControl>
            </Flex>
          </ModalBody>
          <ModalFooter gap={2} pt={3}>
            <Button variant="ghost" size="sm" onClick={createModal.onClose}>Bekor qilish</Button>
            <Button colorScheme="blue" size="sm" onClick={handleSave} isLoading={formLoading} borderRadius="8px">
              {editTarget ? "Saqlash" : "Qo'shish"}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* ── Status Modal ── */}
      <Modal isOpen={statusModal.isOpen} onClose={statusModal.onClose} size="xs">
        <ModalOverlay bg="blackAlpha.500" />
        <ModalContent borderRadius="12px">
          <ModalHeader fontSize="15px" pb={2}>Status yangilash</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Text fontSize="12px" color={textMuted} mb={3} fontWeight="500">{statusTarget?.name}</Text>
            <Select value={newStatus} onChange={e => setNewStatus(e.target.value)} borderRadius="8px" size="sm">
              {STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
            </Select>
          </ModalBody>
          <ModalFooter gap={2} pt={3}>
            <Button variant="ghost" size="sm" onClick={statusModal.onClose}>Bekor qilish</Button>
            <Button colorScheme="blue" size="sm" onClick={handleStatusUpdate} isLoading={statusLoading} borderRadius="8px">Saqlash</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* ── Check ERP Modal ── */}
      <Modal isOpen={checkModal.isOpen} onClose={checkModal.onClose} size="md">
        <ModalOverlay bg="blackAlpha.500" />
        <ModalContent borderRadius="12px">
          <ModalHeader fontSize="16px" pb={2}>Bazada tekshirish</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Text fontSize="13px" fontWeight="600" mb={4}>{checkTarget?.name}</Text>
            {!checkData ? (
              <Flex direction="column" align="center" gap={3} py={4}>
                <Text fontSize="13px" color={textMuted} textAlign="center">ERP bazasida bu zavod mavjudligini tekshirish</Text>
                <Button colorScheme="blue" borderRadius="8px" size="sm"
                  leftIcon={checkLoading ? <Spinner size="xs" /> : <CheckCircle size={14} />}
                  isLoading={checkLoading} onClick={handleCheck}>
                  Tekshirish
                </Button>
              </Flex>
            ) : (
              <Box>
                {checkData.erp_check?.warning && (
                  <Box px={3} py={2} bg="orange.50" border="1px solid" borderColor="orange.200" borderRadius="8px" mb={3}>
                    <Text fontSize="12px" color="orange.700">{checkData.erp_check.warning}</Text>
                  </Box>
                )}
                {checkData.erp_check?.found_in_erp ? (
                  <Box>
                    <Flex align="center" gap={2} mb={3}>
                      <Box w="8px" h="8px" borderRadius="full" bg="green.500" />
                      <Text fontSize="13px" fontWeight="700" color="green.700">Bazada mavjud</Text>
                    </Flex>
                    <Flex direction="column" gap={2}>
                      {(checkData.erp_check.erp_results || []).map((r, i) => (
                        <Box key={i} p={3} bg={erpBg} border="1px solid" borderColor={erpBorder} borderRadius="8px" fontSize="13px">
                          <Text fontWeight="600" mb={1}>{r.name || r.full_name}</Text>
                          {r.address && <Text color={textMuted} fontSize="12px">{r.address}</Text>}
                          {r.phone   && <Text color={textMuted} fontSize="12px">{r.phone}</Text>}
                        </Box>
                      ))}
                    </Flex>
                  </Box>
                ) : (
                  <Flex align="center" gap={2} py={2}>
                    <Box w="8px" h="8px" borderRadius="full" bg="red.500" />
                    <Text fontSize="13px" fontWeight="700" color="red.600">Bazada topilmadi</Text>
                  </Flex>
                )}
              </Box>
            )}
          </ModalBody>
          <ModalFooter gap={2} pt={3}>
            {checkData && (
              <>
                <Button variant="ghost" size="sm" colorScheme="orange"
                  onClick={() => { checkModal.onClose(); openReject(checkTarget); }}>Rad etish</Button>
                <Button variant="ghost" size="sm" colorScheme="blue"
                  onClick={() => { checkModal.onClose(); openStatus(checkTarget); }}>Status yangilash</Button>
              </>
            )}
            <Button variant="ghost" size="sm" onClick={checkModal.onClose}>Yopish</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* ── Reject Modal ── */}
      <Modal isOpen={rejectModal.isOpen} onClose={rejectModal.onClose} size="sm">
        <ModalOverlay bg="blackAlpha.500" />
        <ModalContent borderRadius="12px">
          <ModalHeader fontSize="15px" pb={2}>Rad etish</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Text fontSize="13px" fontWeight="500" mb={3}>{rejectTarget?.name}</Text>
            <FormControl>
              <FormLabel fontSize="13px" mb={1}>Sabab (ixtiyoriy)</FormLabel>
              <Textarea value={rejectReason} onChange={e => setRejectReason(e.target.value)}
                placeholder="Rad etish sababi..." rows={3} borderRadius="8px" size="sm" />
            </FormControl>
          </ModalBody>
          <ModalFooter gap={2} pt={3}>
            <Button variant="ghost" size="sm" onClick={rejectModal.onClose}>Bekor qilish</Button>
            <Button colorScheme="orange" size="sm" onClick={handleReject} isLoading={rejectLoading} borderRadius="8px">Rad etish</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* ── Delete Modal ── */}
      <Modal isOpen={deleteModal.isOpen} onClose={deleteModal.onClose} size="sm">
        <ModalOverlay bg="blackAlpha.500" />
        <ModalContent borderRadius="12px">
          <ModalHeader fontSize="15px" pb={2}>O'chirishni tasdiqlang</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Text fontSize="14px" color={textMuted}>
              <b>{deleteTarget?.name}</b> — bu zavodini o'chirmoqchimisiz? Bu amalni qaytarib bo'lmaydi.
            </Text>
          </ModalBody>
          <ModalFooter gap={2} pt={3}>
            <Button variant="ghost" size="sm" onClick={deleteModal.onClose}>Bekor qilish</Button>
            <Button colorScheme="red" size="sm" onClick={handleDelete} isLoading={deleteLoading} borderRadius="8px">O'chirish</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

    </Box>
  );
}
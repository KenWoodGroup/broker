import {
  Badge,
  Box,
  Button,
  Flex,
  Heading,
  HStack,
  IconButton,
  Input,
  InputGroup,
  InputRightElement,
  SimpleGrid,
  Spinner,
  Text,
  useColorModeValue,
  useDisclosure,
  Select,
} from "@chakra-ui/react";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiLotLocations } from "../../utils/Controllers/LotLocations";
import CreateCustomerModal from "../LotCreatorLots/_components/CreateCustomerModal";
import EditCustomerModal from "./_components/EditCustomerModal";
import DeleteCustomerModal from "./_components/DeleteCustomerModal";
import { PencilLine, Plus, Search, Trash2, X } from "lucide-react";
import PaginationBar from "../../components/common/PaginationBar";
import EntityCardDetailRows from "../../components/common/EntityCardDetailRows";
import regions from "../../constants/regions/regions.json";

export default function ADCustomers() {
  const navigate = useNavigate();
  const createModal = useDisclosure();
  const editModal = useDisclosure();
  const deleteModal = useDisclosure();
  const [searchInput, setSearchInput] = useState("");
  const [searchName, setSearchName] = useState("all");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [customers, setCustomers] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [activeCustomerId, setActiveCustomerId] = useState(null);
  const [activeCustomer, setActiveCustomer] = useState(null);
  const [selectedRegion, setSelectedRegion] = useState("");
  const seqRef = useRef(0);
  const cardBg = useColorModeValue("white", "gray.800");
  const cardBorder = useColorModeValue("gray.200", "gray.700");

  const extractList = (res) => {
    const data = res?.data;
    const records = data?.data?.records ?? data?.records ?? data?.data ?? data;
    const pag = data?.data?.pagination ?? data?.pagination ?? null;
    return {
      records: Array.isArray(records) ? records : [],
      pagination: pag,
    };
  };

  useEffect(() => {
    const t = setTimeout(async () => {
      const seq = ++seqRef.current;
      try {
        setLoading(true);
        const res = await apiLotLocations.pageByType({
          type: "customer",
          searchName,
          page,
        });
        if (seq === seqRef.current) {
          const list = extractList(res);
          setCustomers(list.records);
          setPagination(list.pagination);
        }
      } finally {
        if (seq === seqRef.current) setLoading(false);
      }
    }, 350);

    return () => clearTimeout(t);
  }, [searchName, page]);

  useEffect(() => {
    const t = setTimeout(() => {
      setPage(1);
      setSearchName(searchInput.trim() === "" ? "all" : searchInput.trim());
    }, 400);
    return () => clearTimeout(t);
  }, [searchInput]);

  return (
    <Box pr="20px" pb="20px" pt="20px">
      <Flex
        justifyContent="space-between"
        align="center"
        mb="16px"
        gap="12px"
        flexWrap="wrap"
      >
        <Box>
          <Heading size="lg" mb="6px">
            Buyurtmachilar
          </Heading>
        </Box>
        <Button
          leftIcon={<Plus size={15} />}
          colorScheme="blue"
          onClick={createModal.onOpen}
        >
          Yaratish
        </Button>
      </Flex>

      <Flex mb="14px" align="center" gap={4} flexWrap="wrap">
        <Box flex={1} maxW="400px" minW="200px">
          <InputGroup>
            <Input
              placeholder="Buyurtmachi qidirish..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
            <InputRightElement>
              {searchInput ? (
                <IconButton
                  size="sm"
                  variant="ghost"
                  aria-label="Tozalash"
                  icon={<X size={16} />}
                  onClick={() => setSearchInput("")}
                />
              ) : (
                <Search size={16} color="gray" />
              )}
            </InputRightElement>
          </InputGroup>
        </Box>

        <Flex align="center" gap={2}>
          <Badge
            colorScheme="blue"
            px={3}
            py={1}
            borderRadius="full"
            fontSize="sm"
            fontWeight="semibold"
          >
            {loading ? (
              <Flex align="center" gap={1}>
                <Spinner size="xs" /> <span>Yuklanmoqda...</span>
              </Flex>
            ) : (
              `Jami: ${pagination?.total_count ?? 0} ta `
            )}
          </Badge>
        </Flex>

        <Select
          maxW="240px"
          value={selectedRegion}
          onChange={(e) => setSelectedRegion(e.target.value)}
          placeholder="Viloyat (Hammasi)"
        >
          {regions.map((item) => (
            <option key={item.id} value={item.name_uz}>
              {item.name_uz}
            </option>
          ))}
        </Select>
      </Flex>

      {loading ? (
        <Flex justify="center" py="50px">
          <Spinner size="xl" />
        </Flex>
      ) : customers.length === 0 ? (
        <Box
          borderWidth="1px"
          borderColor="border"
          borderRadius="16px"
          p="18px"
          bg="surface"
        >
          <Text color="textSub">Natija topilmadi</Text>
        </Box>
      ) : (
        <SimpleGrid columns={{ base: 1, md: 2, xl: 3 }} spacing="20px">
          {customers.map((c) => (
            <Box
              key={c?.id ?? `${c?.name}-${Math.random()}`}
              bg={cardBg}
              border="1px solid"
              borderColor={cardBorder}
              borderRadius="12px"
              p="16px"
              position="relative"
              transition="all .2s"
              _hover={{ shadow: "md" }}
              cursor="pointer"
              role="group"
              onClick={() => {
                if (!c?.id) return;
                navigate(`/customers/${c.id}`);
              }}
            >
              <Box
                position="absolute"
                top="8px"
                right="8px"
                zIndex={1}
                onClick={(e) => e.stopPropagation()}
              >
                <HStack spacing="6px">
                  <IconButton
                    size="sm"
                    aria-label="Edit customer"
                    variant="ghost"
                    colorScheme="blue"
                    icon={<PencilLine size={18} />}
                    onClick={() => {
                      setActiveCustomerId(c?.id);
                      editModal.onOpen();
                    }}
                  />
                  <IconButton
                    size="sm"
                    aria-label="Delete customer"
                    variant="ghost"
                    colorScheme="red"
                    icon={<Trash2 size={18} />}
                    onClick={() => {
                      setActiveCustomer(c);
                      deleteModal.onOpen();
                    }}
                  />
                </HStack>
              </Box>

              <Box pr={{ base: "72px", md: "80px" }}>
                <Text fontWeight="600" fontSize="lg" mb="10px" noOfLines={2}>
                  {c?.name ?? "Customer"}
                </Text>
                <EntityCardDetailRows
                  address={c?.address}
                  phone={c?.phone}
                  directorName={c?.director_name}
                />
              </Box>
            </Box>
          ))}
        </SimpleGrid>
      )}

      <CreateCustomerModal
        isOpen={createModal.isOpen}
        onClose={createModal.onClose}
        initialName={searchInput}
        onCreated={() => {
          setPage(1);
          // re-trigger fetch
          setSearchName((p) => (p === "all" ? "all " : p + " "));
          setTimeout(() => setSearchName((p) => p.trim()), 0);
        }}
      />

      <EditCustomerModal
        isOpen={editModal.isOpen}
        onClose={() => {
          editModal.onClose();
          setActiveCustomerId(null);
        }}
        customerId={activeCustomerId}
        onUpdated={() => {
          setSearchName((p) => (p === "all" ? "all " : p + " "));
          setTimeout(() => setSearchName((p) => p.trim()), 0);
        }}
      />

      <DeleteCustomerModal
        isOpen={deleteModal.isOpen}
        onClose={() => {
          deleteModal.onClose();
          setActiveCustomer(null);
        }}
        customer={activeCustomer}
        onDeleted={() => {
          setSearchName((p) => (p === "all" ? "all " : p + " "));
          setTimeout(() => setSearchName((p) => p.trim()), 0);
        }}
      />

      {pagination ? (
        <PaginationBar
          mt="30px"
          page={pagination.currentPage ?? page}
          totalPages={pagination.total_pages ?? 1}
          loading={loading}
          onPageChange={(p) => setPage(p)}
        />
      ) : null}
    </Box>
  );
}

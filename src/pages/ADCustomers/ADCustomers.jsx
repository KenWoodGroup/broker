import {
    Box,
    Button,
    Flex,
    Grid,
    Heading,
    HStack,
    IconButton,
    Input,
    Spinner,
    Text,
    useDisclosure,
} from "@chakra-ui/react";
import { useEffect, useRef, useState } from "react";
import { apiLotLocations } from "../../utils/Controllers/LotLocations";
import CreateCustomerModal from "../LotCreatorLots/_components/CreateCustomerModal";
import EditCustomerModal from "./_components/EditCustomerModal";
import DeleteCustomerModal from "./_components/DeleteCustomerModal";
import { PencilLine, Trash2 } from "lucide-react";

export default function ADCustomers() {
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
    const seqRef = useRef(0);

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
                const res = await apiLotLocations.pageByType({ type: "customer", searchName, page });
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
        <Box py="20px" pr="20px">
            <Flex justifyContent="space-between" align="center" mb="16px" gap="12px" flexWrap="wrap">
                <Box>
                    <Heading size="lg" mb="6px">
                        Buyurtmachilar
                    </Heading>
                </Box>
                <Button variant="solidPrimary" onClick={createModal.onOpen}>
                    + Yaratish
                </Button>
            </Flex>

            <Flex
                mb="14px"
                gap="10px"
                flexWrap="wrap"
                align="center"
                bg="surface"
                borderWidth="1px"
                borderColor="border"
                borderRadius="16px"
                p="12px"
            >
                     <Box flex="1" minW={{ base: "100%", md: "280px" }}>
                    <Input
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                        placeholder="Buyurtmachi qidirish..."
                        bg="bg"
                        borderColor="border"
                    />
                </Box>
                {pagination ? (
                    <Box
                        bg="bg"
                        borderWidth="1px"
                        borderColor="border"
                        borderRadius="999px"
                        px="14px"
                        py="10px"
                    >
                        <Text fontSize="sm" fontWeight="600">
                            Jami: {pagination.total_count ?? "-"}
                        </Text>
                    </Box>
                ) : null}
           
            </Flex>


            {loading ? (
                <Flex justify="center" py="50px">
                    <Spinner size="xl" />
                </Flex>
            ) : customers.length === 0 ? (
                <Box borderWidth="1px" borderColor="border" borderRadius="16px" p="18px" bg="surface">
                    <Text color="textSub">Natija topilmadi</Text>
                </Box>
            ) : (
                <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)", xl: "repeat(3, 1fr)" }} gap="14px">
                    {customers.map((c) => (
                        <Box
                            key={c?.id ?? `${c?.name}-${Math.random()}`}
                            bg="surface"
                            borderWidth="1px"
                            borderColor="border"
                            borderRadius="16px"
                            p="14px"
                            _hover={{ borderColor: "blue.400", boxShadow: "md", transform: "translateY(-2px)" }}
                            transition="0.15s ease"
                        >
                            <Flex justify="space-between" align="start" gap="10px">
                                <Box>
                                    <Heading size="sm" mb="6px" noOfLines={2}>
                                        {c?.name ?? "Customer"}
                                    </Heading>
                                </Box>
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
                            </Flex>

                            <Box mt="10px">
                                <Text fontSize="sm" color="textSub">
                                    Manzil: {c?.address ?? "-"}
                                </Text>
                                <Text fontSize="sm" color="textSub">
                                    Telefon: {c?.phone ?? "-"}
                                </Text>
                                <Text fontSize="sm" color="textSub">
                                    Direktor: {c?.director_name ?? "-"}
                                </Text>
                            </Box>
                        </Box>
                    ))}
                </Grid>
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
                <Flex mb="12px" marginTop={30} justify="space-between" align="center" flexWrap="wrap" gap="10px">
                    <HStack>
                        <Button size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} isDisabled={(pagination.currentPage ?? page) <= 1 || loading}>
                            Oldingi
                        </Button>
                        <Text fontSize="sm" fontWeight="600">
                            {pagination.currentPage ?? page} / {pagination.total_pages ?? 1}
                        </Text>
                        <Button
                            size="sm"
                            onClick={() => setPage((p) => p + 1)}
                            isDisabled={(pagination.currentPage ?? page) >= (pagination.total_pages ?? 1) || loading}
                        >
                            Keyingi
                        </Button>
                    </HStack>
                </Flex>
            ) : null}
        </Box>
    );
}


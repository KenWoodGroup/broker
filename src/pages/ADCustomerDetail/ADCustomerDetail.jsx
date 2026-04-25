import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
    Badge,
    Box,
    Card,
    CardBody,
    CardHeader,
    Center,
    Flex,
    HStack,
    Heading,
    IconButton,
    Spinner,
    Table,
    TableContainer,
    Tab,
    TabList,
    TabPanel,
    TabPanels,
    Tabs,
    Tbody,
    Td,
    Text,
    Th,
    Thead,
    Tr,
    Tooltip,
    useDisclosure,
    useColorModeValue,
} from "@chakra-ui/react";
import { ArrowLeft, Building2, Edit2, FileText, Info, MapPin } from "lucide-react";
import { apiLocations } from "../../utils/Controllers/Locations";
import CustomerConstructionSites from "./__components/CustomerConstructionSites";
import CompanyNoteCard from "../ClcompanyDetail/__components/CompanyNoteCard";
import LocationEditModal from "../ClcompanyDetail/__components/LocationEditModal";

export default function ADCustomerDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const editModal = useDisclosure();

    const bg = useColorModeValue("white", "gray.800");
    const headerBg = useColorModeValue("gray.50", "gray.700");
    const theadBg = useColorModeValue("gray.50", "whiteAlpha.50");

    const [loading, setLoading] = useState(true);
    const [customer, setCustomer] = useState(null);

    const GetCustomer = async () => {
        setLoading(true);
        try {
            const res = await apiLocations.getLocation(id);
            setCustomer(res?.data ?? null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (id) GetCustomer();
    }, [id]);

    const createdAt = customer?.createdAt ?? customer?.created_at;
    const updatedAt = customer?.updatedAt ?? customer?.updated_at;
    const inn = customer?.inn ?? customer?.INN ?? "";

    const formatDate = (v) => (v ? new Date(v).toLocaleDateString() : "—");

    return (
        <Box py="20px" pr="10px">
            {loading ? (
                <Center h="60vh">
                    <Spinner size="xl" thickness="4px" color="blue.500" />
                </Center>
            ) : (
                <>
                    <Card
                        mx="auto"
                        bg={bg}
                        borderRadius="2xl"
                        boxShadow="xl"
                        overflow="hidden"
                        mb={8}
                    >
                        <CardHeader bg={headerBg} py={4} px={6}>
                            <Flex justify="space-between" align="center">
                                <HStack spacing={4}>
                                    <IconButton
                                        icon={<ArrowLeft size={20} />}
                                        onClick={() => navigate(-1)}
                                        variant="ghost"
                                        aria-label="Orqaga"
                                    />

                                    <Flex align="center" gap={4}>
                                        <Building2 size={28} color="#3B82F6" />
                                        <Box>
                                            <Heading size="20px">{customer?.name}</Heading>
                                           
                                        </Box>
                                    </Flex>
                                </HStack>
                                {customer?.id && (
                                    <Tooltip label="Tahrirlash">
                                        <IconButton
                                            icon={<Edit2 size={16} />}
                                            onClick={editModal.onOpen}
                                            variant="ghost"
                                            aria-label="Tahrirlash"
                                        />
                                    </Tooltip>
                                )}
                            </Flex>
                        </CardHeader>
                    </Card>

                    <Tabs variant="enclosed" colorScheme="blue">
                        <TabList>
                            <Tab>
                                <HStack>
                                    <Info size={18} />
                                    <Text>Batafsil</Text>
                                </HStack>
                            </Tab>
                            <Tab>
                                <HStack>
                                    <MapPin size={18} />
                                    <Text>Obyektlar</Text>
                                </HStack>
                            </Tab>
                            <Tab>
                                <HStack>
                                    <FileText size={18} />
                                    <Text>Izoh</Text>
                                </HStack>
                            </Tab>
                        </TabList>

                        <TabPanels>
                            <TabPanel p={0} pt={4}>
                                <Card variant="outline" borderRadius="16px" overflow="hidden">
                                    <CardBody p={0}>
                                        {!customer ? (
                                            <Flex align="center" justify="center" py="40px">
                                                <Text color="gray.500">Ma&apos;lumot topilmadi</Text>
                                            </Flex>
                                        ) : (
                                            <TableContainer>
                                                <Table size="md" variant="simple">
                                                    <Thead bg={theadBg}>
                                                        <Tr>
                                                            <Th w="40%">Maydon</Th>
                                                            <Th>Qiymat</Th>
                                                        </Tr>
                                                    </Thead>
                                                    <Tbody>
                                                        <Tr>
                                                            <Td color="gray.500" fontWeight="500">
                                                                Nomi
                                                            </Td>
                                                            <Td fontWeight="600">{customer?.name || "—"}</Td>
                                                        </Tr>
                                                        <Tr>
                                                            <Td color="gray.500" fontWeight="500">
                                                                STIR (INN)
                                                            </Td>
                                                            <Td fontWeight="600" fontFamily="mono">
                                                                {inn || "—"}
                                                            </Td>
                                                        </Tr>
                                                        <Tr>
                                                            <Td color="gray.500" fontWeight="500">
                                                                Telefon
                                                            </Td>
                                                            <Td fontWeight="600">{customer?.phone || "—"}</Td>
                                                        </Tr>
                                                        <Tr>
                                                            <Td color="gray.500" fontWeight="500">
                                                                Direktor
                                                            </Td>
                                                            <Td fontWeight="600">{customer?.director_name || "—"}</Td>
                                                        </Tr>
                                                        <Tr>
                                                            <Td color="gray.500" fontWeight="500">
                                                                Manzil
                                                            </Td>
                                                            <Td fontWeight="600">{customer?.address || "—"}</Td>
                                                        </Tr>
                                                        <Tr>
                                                            <Td color="gray.500" fontWeight="500">
                                                                Yaratilgan
                                                            </Td>
                                                            <Td fontWeight="600">{formatDate(createdAt)}</Td>
                                                        </Tr>
                                                        <Tr>
                                                            <Td color="gray.500" fontWeight="500">
                                                                Yangilangan
                                                            </Td>
                                                            <Td fontWeight="600">{formatDate(updatedAt)}</Td>
                                                        </Tr>
                                                    </Tbody>
                                                </Table>
                                            </TableContainer>
                                        )}
                                    </CardBody>
                                </Card>
                            </TabPanel>

                            <TabPanel p={0} pt={4}>
                                <CustomerConstructionSites customerId={id} role="Admin" />
                            </TabPanel>
                            <TabPanel p={0} pt={4}>
                                <CompanyNoteCard locationId={id} />
                            </TabPanel>
                        </TabPanels>
                    </Tabs>
                </>
            )}

            {customer && (
                <LocationEditModal
                    isOpen={editModal.isOpen}
                    onClose={editModal.onClose}
                    data={customer}
                    onSuccess={GetCustomer}
                />
            )}
        </Box>
    );
}

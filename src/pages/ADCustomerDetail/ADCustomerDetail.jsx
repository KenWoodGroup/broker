import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
    Badge,
    Box,
    Card,
    CardBody,
    Flex,
    HStack,
    IconButton,
    Spinner,
    Table,
    TableContainer,
    Tbody,
    Td,
    Text,
    Th,
    Thead,
    Tr,
    useColorModeValue,
} from "@chakra-ui/react";
import { ArrowLeft, Hash } from "lucide-react";
import { apiLocations } from "../../utils/Controllers/Locations";

export default function ADCustomerDetail() {
    const { id } = useParams();
    const navigate = useNavigate();

    const border = useColorModeValue("border", "border");
    const textSub = useColorModeValue("neutral.500", "neutral.400");
    const theadBg = useColorModeValue("gray.50", "whiteAlpha.50");

    const [loading, setLoading] = useState(true);
    const [customer, setCustomer] = useState(null);

    useEffect(() => {
        let alive = true;
        const run = async () => {
            try {
                setLoading(true);
                const res = await apiLocations.getLocation(id);
                if (!alive) return;
                setCustomer(res?.data ?? null);
            } finally {
                if (alive) setLoading(false);
            }
        };
        if (id) run();
        return () => {
            alive = false;
        };
    }, [id]);

    const createdAt = customer?.createdAt ?? customer?.created_at;
    const updatedAt = customer?.updatedAt ?? customer?.updated_at;
    const inn = customer?.inn ?? customer?.INN ?? "";

    const formatDate = (v) => (v ? new Date(v).toLocaleDateString() : "—");

    return (
        <Box pr="20px" pt="20px">
            <Box
                mb="16px"
                bg="surfBlur"
                backdropFilter="blur(5px)"
                border="1px solid"
                borderColor={border}
                borderRadius="12px"
                p="12px"
            >
                {loading ? (
                    <Flex align="center" justify="center" py="24px">
                        <Spinner />
                    </Flex>
                ) : (
                    <Flex align="center" justify="space-between" gap="12px" minW={0}>
                        <HStack spacing="12px" minW={0}>
                            <IconButton
                                variant="ghost"
                                aria-label="Back"
                                icon={<ArrowLeft size={18} />}
                                onClick={() => navigate(-1)}
                            />
                            <Box minW={0}>
                                <Text fontSize="xl" fontWeight="700" noOfLines={1}>
                                    {customer?.name ?? "Customer"}
                                    <Badge colorScheme="blue" ml={3} variant="subtle">
                                        customer
                                    </Badge>
                                </Text>
                                {inn ? (
                                    <HStack spacing="6px" mt="4px" color={textSub}>
                                        <Hash size={14} />
                                        <Text fontSize="sm" noOfLines={1}>
                                            STIR: {inn}
                                        </Text>
                                    </HStack>
                                ) : null}
                            </Box>
                        </HStack>
                    </Flex>
                )}
            </Box>

            <Card variant="outline" borderRadius="16px" overflow="hidden">
                <CardBody p={0}>
                    {!customer && !loading ? (
                        <Flex align="center" justify="center" py="40px">
                            <Text color={textSub}>Ma&apos;lumot topilmadi</Text>
                        </Flex>
                    ) : loading ? (
                        <Flex align="center" justify="center" py="48px">
                            <Spinner />
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
                                        <Td color={textSub} fontWeight="500">
                                            Nomi
                                        </Td>
                                        <Td fontWeight="600">{customer?.name || "—"}</Td>
                                    </Tr>
                                    <Tr>
                                        <Td color={textSub} fontWeight="500">
                                            STIR (INN)
                                        </Td>
                                        <Td fontWeight="600" fontFamily="mono">
                                            {inn || "—"}
                                        </Td>
                                    </Tr>
                                    <Tr>
                                        <Td color={textSub} fontWeight="500">
                                            Telefon
                                        </Td>
                                        <Td fontWeight="600">{customer?.phone || "—"}</Td>
                                    </Tr>
                                    <Tr>
                                        <Td color={textSub} fontWeight="500">
                                            Direktor
                                        </Td>
                                        <Td fontWeight="600">{customer?.director_name || "—"}</Td>
                                    </Tr>
                                    <Tr>
                                        <Td color={textSub} fontWeight="500">
                                            Manzil
                                        </Td>
                                        <Td fontWeight="600">{customer?.address || "—"}</Td>
                                    </Tr>
                                    <Tr>
                                        <Td color={textSub} fontWeight="500">
                                            Yaratilgan
                                        </Td>
                                        <Td fontWeight="600">{formatDate(createdAt)}</Td>
                                    </Tr>
                                    <Tr>
                                        <Td color={textSub} fontWeight="500">
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
        </Box>
    );
}

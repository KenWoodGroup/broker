import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
    Badge,
    Box,
    Button,
    Card,
    CardBody,
    Divider,
    Flex,
    Grid,
    Heading,
    Spinner,
    Text,
    VStack,
} from "@chakra-ui/react";
import { ArrowLeft } from "lucide-react";
import { apiLots } from "../../utils/Controllers/Lots";

function pickLotTitle(lot) {
    return (
        lot?.lot_name ??
        lot?.name ??
        lot?.title ??
        lot?.objectName ??
        lot?.searchName ??
        (lot?.id ? `Lot #${lot.id}` : "Lot")
    );
}

function formatMoneyUz(amount) {
    if (amount === null || amount === undefined || amount === "") return "—";
    const n = Number(amount);
    if (Number.isNaN(n)) return String(amount);
    return `${n.toLocaleString("uz-UZ")} so'm`;
}

function formatDateUz(v) {
    if (!v) return "—";
    const d = new Date(v);
    if (Number.isNaN(d.getTime())) return String(v);
    return d.toLocaleDateString("uz-UZ", { year: "numeric", month: "short", day: "2-digit" });
}

export default function LotCreatorLotDetail({ backTo } = {}) {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [lot, setLot] = useState(null);

    const handleBack = () => {
        if (backTo) navigate(backTo);
        else navigate(-1);
    };

    useEffect(() => {
        let alive = true;
        const run = async () => {
            try {
                setLoading(true);
                const res = await apiLots.getById(id);
                if (!alive) return;
                const data = res?.data?.data ?? res?.data;
                setLot(data ?? null);
            } finally {
                if (alive) setLoading(false);
            }
        };
        if (id) run();
        return () => {
            alive = false;
        };
    }, [id]);

    if (loading) {
        return (
            <Flex justify="center" align="center" minH="50vh">
                <Spinner size="xl" />
            </Flex>
        );
    }

    if (!lot) {
        return (
            <Box py="20px" pr="20px">
                <Button leftIcon={<ArrowLeft size={18} />} variant="ghost" mb="12px" onClick={handleBack}>
                    Orqaga
                </Button>
                <Text color="textSub">Lot topilmadi</Text>
            </Box>
        );
    }

    const title = pickLotTitle(lot);
    const lotNo = lot?.lot_number ?? lot?.lotNumber ?? lot?.number ?? "—";
    const type = lot?.type ?? lot?.lot_type;
    const category = lot?.category ?? lot?.lot_category;
    const address = lot?.address ?? "—";
    const amount = formatMoneyUz(lot?.amount ?? lot?.sum ?? lot?.total_sum);
    const start = formatDateUz(lot?.start_date ?? lot?.startDate);
    const end = formatDateUz(lot?.end_date ?? lot?.endDate);
    const note = lot?.note ?? lot?.description;

    return (
        <Box py="20px" pr="20px" maxW="900px">
            <Button leftIcon={<ArrowLeft size={18} />} variant="ghost" mb="16px" onClick={handleBack}>
                Orqaga
            </Button>

            <Card bg="surface" borderWidth="1px" borderColor="border" borderRadius="16px" overflow="hidden">
                <CardBody p="18px">
                    <Flex justify="space-between" align="start" gap="12px" flexWrap="wrap" mb="12px">
                        <Box minW={0}>
                            <Heading size="md" mb="6px" noOfLines={2}>
                                {title}
                            </Heading>
                            <Text fontSize="sm" color="textSub">
                                Lot raqami: <Text as="span" fontWeight="600" color="inherit">{lotNo}</Text>
                            </Text>
                        </Box>
                        <Flex gap="8px" flexWrap="wrap">
                            {type ? (
                                <Badge colorScheme="purple" variant="subtle">
                                    {type}
                                </Badge>
                            ) : null}
                            {category ? (
                                <Badge colorScheme="blue" variant="subtle">
                                    {category}
                                </Badge>
                            ) : null}
                        </Flex>
                    </Flex>

                    <Divider my="12px" />

                    <Grid templateColumns={{ base: "1fr", sm: "1fr 1fr" }} gap="14px">
                        <Box>
                            <Text fontSize="xs" color="textSub" mb="4px">
                                Summasi
                            </Text>
                            <Text fontWeight="700">{amount}</Text>
                        </Box>
                        <Box>
                            <Text fontSize="xs" color="textSub" mb="4px">
                                Manzil
                            </Text>
                            <Text fontWeight="600" whiteSpace="pre-wrap">
                                {address}
                            </Text>
                        </Box>
                        <Box>
                            <Text fontSize="xs" color="textSub" mb="4px">
                                Boshlanish
                            </Text>
                            <Text fontWeight="600">{start}</Text>
                        </Box>
                        <Box>
                            <Text fontSize="xs" color="textSub" mb="4px">
                                Tugash
                            </Text>
                            <Text fontWeight="600">{end}</Text>
                        </Box>
                    </Grid>

                    {note ? (
                        <>
                            <Divider my="14px" />
                            <VStack align="stretch" spacing="6px">
                                <Text fontSize="xs" color="textSub">
                                    Izoh
                                </Text>
                                <Text fontSize="sm" whiteSpace="pre-wrap">
                                    {note}
                                </Text>
                            </VStack>
                        </>
                    ) : null}
                </CardBody>
            </Card>
        </Box>
    );
}

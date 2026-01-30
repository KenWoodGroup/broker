import {
    Box,
    Button,
    Card,
    CardBody,
    Heading,
    Stack,
    Text,
    Badge,
    SimpleGrid,
    HStack,
    VStack,
    ButtonGroup,
    Spinner,
} from "@chakra-ui/react";
import { Search, Clock } from "lucide-react";
import { formatDateTime } from "../../utils/tools/formatDateTime";
import { useEffect, useState } from "react";
import { apiOffers } from "../../utils/Controllers/Offers";
import { NavLink } from "react-router-dom";

export default function BRoffers() {
    const [loading, setLoading] = useState(false);
    const [offers, setOffers] = useState([]);

    // persist states
    const [page, setPage] = useState(() => Number(sessionStorage.getItem("offers_page")) || 1);
    const [status, setStatus] = useState(() => sessionStorage.getItem("offers_status") || "new");

    // pagination + counters
    const [totalPages, setTotalPages] = useState(1);
    const [counts, setCounts] = useState({ new: 0, procces: 0, contract: 0, finished: 0, cancel: 0 });
    const changeCount = (c, num) => {
        setCounts({ ...counts, [c]: num })
    };
    const changeStatus = (s)=> {
        setStatus(s);
        sessionStorage.setItem('offers_status', s);
        setPage(1)
    }

    const fetchOffers = async (page, status) => {
        try {
            setLoading(true);
            const res = await apiOffers.getPage(page, status);
            const data = res.data.data;
            setOffers(data.records || []);
            setTotalPages(data.pagination?.total_pages || 1);
            changeCount(status, data.pagination.total_count);
            // save UI state
            sessionStorage.setItem("offers_page", page);
            sessionStorage.setItem("offers_status", status);
        } finally {
            setLoading(false);
        }
    };


    useEffect(() => {
        fetchOffers(page, status);
    }, [page, status]);

    return (
        <Box p={6}>
            <Heading size="md" mb={4}>
                Incoming Offers
            </Heading>

            {/* Status filter with counters */}
            <ButtonGroup mb={6} size="sm" isAttached variant="outline">
                <Button
                    onClick={() => changeStatus('new')}
                    colorScheme={status === "new" ? "blue" : "gray"}
                >
                    New {status === "new" && ("(" + counts.new + ")")}
                </Button>
                <Button
                    onClick={() => changeStatus('procces')}
                    colorScheme={status === "procces" ? "orange" : "gray"}
                >
                    In Process {status === "procces" && ("(" + counts.procces + ")")}
                </Button>
                <Button
                    onClick={() => changeStatus('contract')}
                    colorScheme={status === "contract" ? "yellow" : "gray"}
                >
                    Contract {status === "contract" && ("(" + counts.procces + ")")}
                </Button>
                <Button
                    onClick={() => changeStatus('finished')}
                    colorScheme={status === "finished" ? "green" : "gray"}
                >
                    Finished {status === "finished" && ("(" + counts.finished + ")")}
                </Button>
                <Button
                    onClick={() => changeStatus('cancel')}
                    colorScheme={status === "cancel" ? "red" : "gray"}
                >
                    Canceled {status === "cancel" && ("(" + counts.finished + ")")}
                </Button>
            </ButtonGroup>

            {loading ? (
                <Spinner />
            ) : (
                <SimpleGrid columns={{ base: 1, md: 2, xl: 3 }} spacing={4}>
                    {offers.map((offer) => (
                        <Card key={offer.id} variant="outline" h="100%">
                            <CardBody display="flex" flexDirection="column">
                                <Stack spacing={4} flex="1">
                                    {/* Header */}
                                    <HStack justify="space-between" align="start">
                                        <VStack align="start" spacing={1}>
                                            <Heading size="sm">{offer.full_name}</Heading>
                                            <Text fontSize="sm" color="gray.600">
                                                {offer.phone_number}
                                            </Text>
                                        </VStack>

                                        <Badge
                                            colorScheme={
                                                offer.status === "new"
                                                    ? "blue"
                                                    : offer.status === "procces"
                                                        ? "orange"
                                                        : "green"
                                            }
                                        >
                                            {offer.status}
                                        </Badge>
                                    </HStack>

                                    {/* Products */}
                                    <Box flex="1">
                                        <HStack justify="space-between" mb={2}>
                                            <Text fontSize="sm" fontWeight="medium">
                                                Requested products
                                            </Text>
                                            <Badge variant="subtle" colorScheme="gray">
                                                {offer.products.length} products
                                            </Badge>
                                        </HStack>
                                        <VStack align="start" spacing={2}>
                                            {offer.products.map((product, i) => (
                                                <Badge
                                                    maxW="100%"
                                                    whiteSpace="normal"
                                                    wordBreak="break-word" key={i} colorScheme="blue">
                                                    {product}
                                                </Badge>
                                            ))}
                                        </VStack>
                                    </Box>

                                    {/* Footer */}
                                    <HStack justify="space-between" mt={4}>
                                        <HStack spacing={1} color="gray.500" fontSize="xs">
                                            <Clock size={14} />
                                            <Text>{formatDateTime(offer.createdAt)}</Text>
                                        </HStack>
                                        <NavLink to={`/operator/offer/${offer?.id}`}>
                                            <Button
                                                size="sm"
                                                leftIcon={<Search size={16} />}
                                                colorScheme="blue"
                                            >
                                                Process Offer
                                            </Button>
                                        </NavLink>
                                    </HStack>
                                </Stack>
                            </CardBody>
                        </Card>
                    ))}
                </SimpleGrid>
            )}

            {/* Pagination */}
            <HStack mt={6} justify="center" spacing={4}>
                <Button
                    size="sm"
                    onClick={() => setPage((p) => Math.max(p - 1, 1))}
                    isDisabled={page === 1}
                >
                    Prev
                </Button>
                <Text fontSize="sm">
                    Page {page} / {totalPages}
                </Text>
                <Button
                    size="sm"
                    onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                    isDisabled={page === totalPages}
                >
                    Next
                </Button>
            </HStack>
        </Box>
    );
}

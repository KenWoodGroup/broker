import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
    Badge,
    Box,
    Card,
    CardBody,
    Flex,
    HStack,
    Icon,
    IconButton,
    Spinner,
    Text,
    Tooltip,
    useColorModeValue,
    VStack,
    Collapse,
    Divider,
} from "@chakra-ui/react";
import { ArrowLeft, ChevronsDown, ChevronsUp, Clock, MapPin, Phone, User } from "lucide-react";
import { apiLocations } from "../../utils/Controllers/Locations";

const STORAGE_PREFIX = "customer_header";

export default function ADCustomerDetail() {
    const { id } = useParams();
    const navigate = useNavigate();

    const border = useColorModeValue("border", "border");
    const textSub = useColorModeValue("neutral.500", "neutral.400");

    const storageKey = `${STORAGE_PREFIX}:${id}`;
    const [collapsed, setCollapsed] = useState(() => localStorage.getItem(storageKey) === "true");
    const [hovered, setHovered] = useState(false);

    const [loading, setLoading] = useState(true);
    const [customer, setCustomer] = useState(null);

    useEffect(() => {
        localStorage.setItem(storageKey, String(collapsed));
    }, [collapsed, storageKey]);

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

    return (
        <Box pr="20px" pt="20px">
            <Box
                position="sticky"
                top="12px"
                zIndex={10}
                bg="surfBlur"
                backdropFilter="blur(5px)"
                border="1px solid"
                borderColor={border}
                borderRadius="12px"
                p="12px"
                transition="all .2s"
                onMouseEnter={() => setHovered(true)}
                onMouseLeave={() => setHovered(false)}
                minH={loading ? "110px" : "auto"}
            >
                {loading ? (
                    <Flex align="center" justify="center" py="24px">
                        <Spinner />
                    </Flex>
                ) : (
                    <Box>
                        <Flex align="center" justify="space-between">
                            <HStack spacing="12px" minW={0}>
                                <IconButton
                                    variant="ghost"
                                    aria-label="Back"
                                    icon={<ArrowLeft size={18} />}
                                    onClick={() => navigate(-1)}
                                />
                                <Box flex={10} minW={0}>
                                    <Text fontSize="xl" fontWeight="700" noOfLines={1}>
                                        {customer?.name ?? "Customer"}
                                           <Badge colorScheme="blue" marginLeft={5} variant="subtle">
                                            customer
                                        </Badge>
                                    </Text>
                                    <HStack spacing="8px" mt="2px" color={textSub}>
                                     
                                    </HStack>
                                </Box>
                            </HStack>

                            <IconButton
                                size="sm"
                                variant="ghost"
                                aria-label="Toggle header"
                                icon={collapsed ? <ChevronsDown size={18} /> : <ChevronsUp size={18} />}
                                opacity={hovered ? 1 : 0}
                                pointerEvents={hovered ? "auto" : "none"}
                                transition="all .15s"
                                onClick={() => setCollapsed((p) => !p)}
                            />
                        </Flex>

                        <Collapse in={!collapsed} animateOpacity>
                            <Flex mt="12px" wrap="wrap" gap="20px" color={textSub}>
                                <HStack spacing="8px">
                                    <MapPin size={16} />
                                    <Text fontSize="sm" noOfLines={1}>
                                        {customer?.address || "-"}
                                    </Text>
                                </HStack>
                                <HStack spacing="8px">
                                    <Phone size={16} />
                                    <Text fontSize="sm">{customer?.phone || "-"}</Text>
                                </HStack>
                                <HStack spacing="8px">
                                    <User size={16} />
                                    <Text fontSize="sm">{customer?.director_name || "-"}</Text>
                                </HStack>
                            </Flex>

                            <HStack mt="8px" spacing="16px" color={textSub}>
                                <Tooltip label="Created at">
                                    <HStack spacing="6px">
                                        <Clock size={14} />
                                        <Text fontSize="xs">
                                            {createdAt ? new Date(createdAt).toLocaleDateString() : "-"}
                                        </Text>
                                    </HStack>
                                </Tooltip>
                                <Tooltip label="Last updated">
                                    <HStack spacing="6px">
                                        <Clock size={14} />
                                        <Text fontSize="xs">
                                            {updatedAt ? new Date(updatedAt).toLocaleDateString() : "-"}
                                        </Text>
                                    </HStack>
                                </Tooltip>
                            </HStack>
                        </Collapse>
                    </Box>
                )}
            </Box>

            <Box mt="20px">
                <Card variant="outline" borderRadius="16px" overflow="hidden">
                    <CardBody>
                        {!customer ? (
                            <Flex align="center" justify="center" py="40px">
                                <Text color={textSub}>Ma&apos;lumot topilmadi</Text>
                            </Flex>
                        ) : (
                            <VStack align="stretch" spacing="14px">
                                <HStack spacing="10px">
                                    <Icon as={User} />
                                    <Text fontWeight="700">Detail</Text>
                                </HStack>
                                <Divider />
                                <Flex wrap="wrap" gap="16px">
                                    <Box minW="260px" flex="1">
                                        <Text fontSize="sm" color={textSub}>
                                            Nomi
                                        </Text>
                                        <Text fontWeight="600">{customer?.name || "-"}</Text>
                                    </Box>
                                    <Box minW="260px" flex="1">
                                        <Text fontSize="sm" color={textSub}>
                                            Telefon
                                        </Text>
                                        <Text fontWeight="600">{customer?.phone || "-"}</Text>
                                    </Box>
                                    <Box minW="260px" flex="1">
                                        <Text fontSize="sm" color={textSub}>
                                            Direktor
                                        </Text>
                                        <Text fontWeight="600">{customer?.director_name || "-"}</Text>
                                    </Box>
                                    <Box minW="260px" flex="1">
                                        <Text fontSize="sm" color={textSub}>
                                            Manzil
                                        </Text>
                                        <Text fontWeight="600">{customer?.address || "-"}</Text>
                                    </Box>
                                </Flex>
                            </VStack>
                        )}
                    </CardBody>
                </Card>
            </Box>
        </Box>
    );
}


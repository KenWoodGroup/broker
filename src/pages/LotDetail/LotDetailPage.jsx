import { useEffect, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router";
import {
    Badge,
    Box,
    Center,
    Divider,
    Flex,
    Grid,
    HStack,
    Heading,
    Icon,
    IconButton,
    SimpleGrid,
    Spinner,
    Text,
    VStack,
    useColorModeValue,
    useToast,
    Button,
} from "@chakra-ui/react";
import {
    ArrowLeft,
    Building2,
    CalendarRange,
    Clock,
    FileText,
    Hash,
    MapPin,
    Package,
    Phone,
    User,
    Wallet,
    ExternalLink,
} from "lucide-react";
import { apiLots } from "../../utils/Controllers/Lots";

function extractLot(res) {
    const raw = res?.data?.data ?? res?.data;
    return raw && typeof raw === "object" ? raw : null;
}

function formatMoneyUz(amount) {
    if (amount === null || amount === undefined || amount === "") return "—";
    const n = Number(amount);
    if (Number.isNaN(n)) return String(amount);
    return `${n.toLocaleString("uz-UZ")} so'm`;
}

// Faqat sana: dd.mm.yyyy (vaqtsiz)
function formatDateOnly(v) {
    if (!v) return "—";
    const d = new Date(v);
    if (Number.isNaN(d.getTime())) return String(v);
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    return `${day}.${month}.${year}`;
}

// Qolgan muddatni hisoblash (yil, oy, kun)
function getRemainingTime(endDateStr) {
    if (!endDateStr) return "";
    const now = new Date();
    const end = new Date(endDateStr);
    if (isNaN(end.getTime())) return "Noto‘g‘ri sana";
    if (end <= now) return "Tugagan";

    let years = end.getFullYear() - now.getFullYear();
    let months = end.getMonth() - now.getMonth();
    let days = end.getDate() - now.getDate();

    if (days < 0) {
        months--;
        const prevMonthDate = new Date(end.getFullYear(), end.getMonth(), 0).getDate();
        days += prevMonthDate;
    }
    if (months < 0) {
        years--;
        months += 12;
    }

    const parts = [];
    if (years > 0) parts.push(`${years} yil`);
    if (months > 0) parts.push(`${months} oy`);
    if (days > 0) parts.push(`${days} kun`);
    if (parts.length === 0) return "Bugun tugaydi";
    return `${parts.join(" ")} qoldi`;
}

function pickTitle(lot) {
    if (!lot) return "";
    return (
        lot.lot_name ??
        lot.lotName ??
        lot.name ??
        lot.title ??
        lot.objectName ??
        (lot.id != null ? `Lot #${lot.id}` : "")
    );
}

function pickLotNumber(lot) {
    if (!lot) return "—";
    return lot.lot_number ?? lot.lotNumber ?? lot.number ?? "—";
}

function useLotsListPath() {
    const { pathname } = useLocation();
    if (pathname.startsWith("/call-operator/")) return "/call-operator/lots";
    if (pathname.startsWith("/lotcreator/")) return "/lotcreator/lots";
    return "/lots";
}

const ACTIVE_LABEL_UZ = {
    pending: "Kutilmoqda",
    active: "Faol",
    inactive: "Nofaol",
};

function typeBadgeLabel(type) {
    if (!type) return "—";
    const t = String(type).toLowerCase();
    if (t === "customer") return "Buyurtmachi";
    if (t === "company") return "Kompaniya";
    return String(type);
}

function activeLabel(v) {
    if (v == null || v === "") return null;
    const k = String(v).toLowerCase();
    return ACTIVE_LABEL_UZ[k] ?? String(v);
}

function ProfileInfoItem({ icon: IconSvg, label, value }) {
    const iconBg = useColorModeValue("blue.50", "blue.900");
    const iconColor = useColorModeValue("blue.500", "blue.200");
    const display =
        value === null || value === undefined || String(value).trim() === ""
            ? "—"
            : String(value);

    return (
        <Flex align="center" gap={4}>
            <Box p={3} borderRadius="xl" bg={iconBg} color={iconColor} flexShrink={0}>
                <IconSvg size={20} />
            </Box>
            <Box minW={0}>
                <Text fontSize="xs" color="gray.500" textTransform="uppercase">
                    {label}
                </Text>
                <Text fontWeight="bold" wordBreak="break-word">
                    {display}
                </Text>
            </Box>
        </Flex>
    );
}

function PartyProfileCard({ title, party, headerIcon: HeaderIcon, onNavigate }) {
    const borderCol = useColorModeValue("gray.200", "gray.600");
    const cardBg = useColorModeValue("white", "gray.800");
    const headerIconBg = useColorModeValue("blue.50", "blue.900");
    const headerIconColor = useColorModeValue("blue.500", "blue.200");

    if (!party || typeof party !== "object") {
        return (
            <Box
                borderWidth="1px"
                borderRadius="2xl"
                borderColor={borderCol}
                bg={cardBg}
                p={6}
            >
                <Heading size="md" color="blue.500" mb={2}>
                    {title}
                </Heading>
                <Text color="gray.500" fontSize="sm">
                    Bog‘langan obyekt API javobida yo‘q
                </Text>
            </Box>
        );
    }

    const act = activeLabel(party.is_active);
    const isPending = String(party?.is_active ?? "").toLowerCase() === "pending";
    const fields = [
        { icon: MapPin, label: "Manzil", value: party.address },
        { icon: Phone, label: "Telefon", value: party.phone },
        { icon: User, label: "Direktor nomi", value: party.director_name },
        { icon: Hash, label: "INN", value: party.inn },
        {
            icon: Wallet,
            label: "Balans",
            value: party.balance != null && party.balance !== "" ? `${party.balance}` : null,
        },
        {
            icon: Clock,
            label: "Yaratilgan",
            value: formatDateOnly(party.createdAt ?? party.created_at),
        },
        {
            icon: Clock,
            label: "Yangilangan",
            value: formatDateOnly(party.updatedAt ?? party.updated_at),
        },
    ];

    return (
        <Box
            borderWidth="1px"
            borderRadius="2xl"
            borderColor={borderCol}
            bg={cardBg}
            overflow="hidden"
            boxShadow="sm"
        >
            <Box px={{ base: 4, md: 6 }} py={{ base: 4, md: 5 }} borderBottomWidth="1px" borderColor={borderCol}>
                <Flex justify="space-between" align="flex-start" gap={3} flexWrap="wrap">
                    <HStack align="flex-start" spacing={3} minW={0}>
                        <Box
                            p={2.5}
                            borderRadius="xl"
                            bg={headerIconBg}
                            color={headerIconColor}
                            flexShrink={0}
                        >
                            <HeaderIcon size={22} />
                        </Box>
                        <Box minW={0}>
                            <Heading size="md" color="blue.500">
                                {title}
                            </Heading>
                            <Text fontWeight="bold" fontSize="lg" mt={1} noOfLines={3} lineHeight="short">
                                {party.name || "—"}
                            </Text>
                        </Box>
                    </HStack>
                    <HStack flexWrap="wrap" justify="flex-end">
                        <Badge colorScheme="purple" fontSize="sm" px={2} py={0.5} borderRadius="md">
                            {typeBadgeLabel(party.type)}
                        </Badge>
                        {party.is_active && !isPending ? (
                            <Badge colorScheme="orange" variant="subtle" fontSize="sm">
                                {act ?? party.is_active}
                            </Badge>
                        ) : null}
                        {onNavigate && party.id && (
                            <Button
                                size="sm"
                                variant="outline"
                                rightIcon={<ExternalLink size={14} />}
                                onClick={() => onNavigate(party.id)}
                                colorScheme="blue"
                            >
                                Ko‘rish
                            </Button>
                        )}
                    </HStack>
                </Flex>
            </Box>
            <Box p={{ base: 4, md: 6 }}>
                <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={6}>
                    {fields.map((f, i) => (
                        <ProfileInfoItem key={`${f.label}-${i}`} icon={f.icon} label={f.label} value={f.value} />
                    ))}
                </Grid>
            </Box>
        </Box>
    );
}

function DetailCell({ label, value, icon: IconComp, mono = false, extraBadge = null }) {
    const panelBg = useColorModeValue("gray.50", "whiteAlpha.100");
    const borderCol = useColorModeValue("gray.200", "whiteAlpha.200");
    const display =
        value === null || value === undefined || String(value).trim() === ""
            ? "—"
            : String(value);

    return (
        <Box
            p={3}
            borderRadius="lg"
            bg={panelBg}
            borderWidth="1px"
            borderColor={borderCol}
        >
            <HStack spacing={2} mb={1} align="center">
                {IconComp ? <Icon as={IconComp} boxSize={3.5} color="blue.500" /> : null}
                <Text
                    fontSize="xs"
                    fontWeight="semibold"
                    color="gray.500"
                    textTransform="uppercase"
                    letterSpacing="wide"
                >
                    {label}
                </Text>
            </HStack>
            <Text
                fontWeight="semibold"
                color="text"
                wordBreak="break-word"
                fontFamily={mono ? "mono" : undefined}
                fontSize={mono ? "xs" : "sm"}
            >
                {display}
            </Text>
            {extraBadge && <Box mt={2}>{extraBadge}</Box>}
        </Box>
    );
}

export default function LotDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const toast = useToast();
    const listPath = useLotsListPath();
    const [lot, setLot] = useState(null);
    const [loading, setLoading] = useState(true);

    const border = useColorModeValue("border", "border");
    const heroMuted = useColorModeValue("gray.600", "gray.400");
    const headerBg = useColorModeValue(
        "linear-gradient(135deg, #eff6ff 0%, #e0e7ff 50%, #ddd6fe 100%)",
        "linear-gradient(135deg, rgba(59,130,246,0.2) 0%, rgba(99,102,241,0.25) 100%)"
    );

    useEffect(() => {
        if (!id) {
            setLot(null);
            setLoading(false);
            return;
        }
        let alive = true;
        (async () => {
            setLoading(true);
            try {
                const res = await apiLots.getById(id);
                if (alive) setLot(extractLot(res));
            } catch (e) {
                if (alive) {
                    setLot(null);
                    const msg = e?.response?.data?.message;
                    toast({
                        title: "Lot yuklanmadi",
                        description: Array.isArray(msg)
                            ? msg.join(". ")
                            : msg || "So‘rovda xatolik",
                        status: "error",
                        duration: 5000,
                        isClosable: true,
                    });
                }
            } finally {
                if (alive) setLoading(false);
            }
        })();
        return () => {
            alive = false;
        };
    }, [id, toast]);

    const title = pickTitle(lot) || "Lot batafsili";
    const lotNo = pickLotNumber(lot);
    const type = lot?.type ?? lot?.lot_type;
    const category = lot?.category ?? lot?.lot_category;
    const amount = formatMoneyUz(lot?.amount ?? lot?.sum ?? lot?.total_sum);
    const address = lot?.address;
    const startRaw = lot?.start_date ?? lot?.startDate;
    const endRaw = lot?.end_date ?? lot?.endDate;
    const start = formatDateOnly(startRaw);
    const end = formatDateOnly(endRaw);
    const remaining = getRemainingTime(endRaw);
    const note = lot?.note ?? lot?.description;
    const lotInn = lot?.inn ?? lot?.customer_inn ?? "";

    const remainingBadge = remaining ? (
        <Badge colorScheme={remaining === "Tugagan" ? "red" : "green"} variant="subtle" fontSize="xs">
            {remaining}
        </Badge>
    ) : null;

    const handleNavigateToParty = (partyId, partyType) => {
        // Agar kompaniya detallari uchun maxsus route mavjud bo‘lsa, shu yerga yozing
        // Misol uchun: /company/:id yoki /customer/:id
        if (partyType === "customer") {
            navigate(`/customers/${partyId}`);
        } else {
            navigate(`/company-detail//${partyId}`);
        }
    };

    return (
        <Box pl="20px" pr="20px" pb="20px" pt="20px">
            <Box
                mb={5}
                borderRadius="2xl"
                borderWidth="1px"
                borderColor={border}
                overflow="hidden"
                bgImage={headerBg}
            >
                <Flex align="center" gap={3} px={5} py={4} flexWrap="wrap">
                    <IconButton
                        variant="ghost"
                        aria-label="Orqaga"
                        icon={<ArrowLeft size={20} />}
                        onClick={() => navigate(listPath)}
                        borderRadius="full"
                    />
                    <Box minW={0} flex="1">
                        {loading ? (
                            <Heading size="md">Yuklanmoqda…</Heading>
                        ) : (
                            <>
                                <HStack spacing={2} align="center" mb={1}>
                                    <Icon as={Package} boxSize={6} color="blue.500" />
                                    <Heading size="20px" noOfLines={2}>
                                        {title}
                                    </Heading>
                                </HStack>
                            </>
                        )}
                    </Box>
                </Flex>
            </Box>

            {loading ? (
                <Center py={20}>
                    <Spinner size="xl" color="blue.500" thickness="3px" />
                </Center>
            ) : !lot ? (
                <Center py={16} borderWidth="1px" borderRadius="xl" borderColor={border}>
                    <Text color="gray.500">Ma’lumot topilmadi</Text>
                </Center>
            ) : (
                <VStack align="stretch" spacing={5}>
                    <SimpleGrid columns={{ base: 1, sm: 2, lg: 3 }} spacing={3}>
                        <DetailCell label="Summa" value={amount} icon={Wallet} />
                        {type ? <DetailCell label="Turi" value={type} icon={Package} /> : null}
                        {category ? <DetailCell label="Kategoriya" value={category} icon={Clock} /> : null}
                    </SimpleGrid>

                    <Divider />

                    <SimpleGrid columns={{ base: 1, sm: 2 }} spacing={3}>
                        <DetailCell label="Manzil" value={address} icon={MapPin} />
                        <DetailCell label="Lot raqami" value={lotNo} icon={Hash} />
                        <DetailCell label="Boshlanish" value={start} icon={CalendarRange} />
                        <DetailCell
                            label="Tugash"
                            value={end}
                            icon={CalendarRange}
                            extraBadge={remainingBadge}
                        />
                        {lotInn ? (
                            <DetailCell label="Lot bo‘yicha INN" value={lotInn} icon={Hash} />
                        ) : null}
                    </SimpleGrid>

                    <Divider />

                    <VStack align="stretch" spacing={6}>
                        <PartyProfileCard
                            title="Buyurtmachi"
                            party={lot?.customer}
                            headerIcon={User}
                            onNavigate={(partyId) => handleNavigateToParty(partyId, "customer")}
                        />
                        <PartyProfileCard
                            title="Quruvchi"
                            party={lot?.builder}
                            headerIcon={Building2}
                            onNavigate={(partyId) => handleNavigateToParty(partyId, "builder")}
                        />
                    </VStack>

                    {note ? (
                        <>
                            <Divider />
                            <Box>
                                <HStack mb={2} spacing={2}>
                                    <Icon as={FileText} boxSize={4} color="blue.500" />
                                    <Text fontSize="sm" fontWeight="bold" color="gray.600">
                                        Izoh
                                    </Text>
                                </HStack>
                                <Text fontSize="sm" whiteSpace="pre-wrap" lineHeight="tall">
                                    {note}
                                </Text>
                            </Box>
                        </>
                    ) : null}

                    <Divider />
                </VStack>
            )}
        </Box>
    );
}
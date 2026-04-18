import {
    Box,
    Grid,
    Text,
    VStack,
    Heading,
    useColorModeValue,
    Flex,
    Divider,
    IconButton,
    Tooltip,
    useDisclosure
} from "@chakra-ui/react"

import {
    Building2,
    MapPin,
    Phone,
    User,
    Calendar,
    Hash,
    Briefcase,
    CreditCard,
    Clock,
    Edit2
} from "lucide-react"

import CompanyDetailEditModal from "./CompanyDetailEditModal"

export default function CompanyInfo({ data, onSuccess, canEdit, onOpenLocationEdit }) {
    const detail = data?.company_detail
    const detailEditModal = useDisclosure()

    const mainInfo = [
        { icon: MapPin, label: "Manzil", value: data?.address },
        { icon: Phone, label: "Telefon", value: data?.phone },
        { icon: User, label: "Direktor nomi", value: data?.director_name },
        { icon: Calendar, label: "Tashkil etilgan yil", value: detail?.founded_year },
        { icon: Briefcase, label: "Faoliyat yo'nalishi", value: detail?.direction },
        { icon: Hash, label: "INN", value: data?.inn }
    ]

    const bankInfo = [
        { icon: Building2, label: "Bank nomi", value: detail?.bank_name },
        { icon: MapPin, label: "Bank manzili", value: detail?.bank_address },
        { icon: CreditCard, label: "Hisob raqami", value: detail?.account_number },
        { icon: Hash, label: "MFO", value: detail?.mfo },
        { icon: Hash, label: "OKED", value: detail?.oked }
    ]

    const extraInfo = [
        { icon: MapPin, label: "Yuridik manzil", value: detail?.legal_address },
        { icon: Clock, label: "Yaratilgan vaqt", value: formatDate(detail?.createdAt) }
    ]

    return (
        <VStack spacing={8} align="stretch" py={4}>
            {/* Asosiy */}
            <Section
                title="Asosiy ma'lumotlar"
                onEdit={canEdit && onOpenLocationEdit ? onOpenLocationEdit : undefined}
                fields={mainInfo}
            />

            <Divider />

            {/* Bank */}
            <Section
                title="Bank ma'lumotlari"
                onEdit={canEdit ? detailEditModal.onOpen : undefined}
                fields={bankInfo}
            />

            <Divider />

            {/* Qo‘shimcha */}
            <Section
                title="Qo'shimcha ma'lumotlar"
                onEdit={canEdit ? detailEditModal.onOpen : undefined}
                fields={extraInfo}
            />

            <CompanyDetailEditModal
                isOpen={detailEditModal.isOpen}
                onClose={detailEditModal.onClose}
                data={data}
                companyId={data?.id}
                onSuccess={onSuccess}
            />
        </VStack>
    )
}
// 🔥 Универсальная секция
function Section({ title, fields, onEdit }) {
    return (
        <Box>
            <Flex justify="space-between" align="center" mb={4}>
                <Heading size="md" color="blue.500">
                    {title}
                </Heading>

                {onEdit && (
                    <Tooltip label="Tahrirlash">
                        <IconButton
                            icon={<Edit2 size={16} />}
                            size="sm"
                            variant="ghost"
                            colorScheme="blue"
                            onClick={onEdit}
                        />
                    </Tooltip>
                )}
            </Flex>

            <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={6}>
                {fields.map((item, i) => (
                    <InfoItem key={i} {...item} />
                ))}
            </Grid>
        </Box>
    )
}

// 🔹 Элемент информации
function InfoItem({ icon: Icon, label, value }) {
    const iconBg = useColorModeValue("blue.50", "blue.900")
    const iconColor = useColorModeValue("blue.500", "blue.200")

    return (
        <Flex align="center" gap={4}>
            <Box p={3} borderRadius="xl" bg={iconBg} color={iconColor}>
                <Icon size={20} />
            </Box>

            <Box>
                <Text fontSize="xs" color="gray.500" textTransform="uppercase">
                    {label}
                </Text>
                <Text fontWeight="bold">
                    {value || "—"}
                </Text>
            </Box>
        </Flex>
    )
}

// 📅 Формат даты
function formatDate(dateString) {
    if (!dateString) return "—"

    return new Date(dateString).toLocaleString("uz-UZ", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
    })
}
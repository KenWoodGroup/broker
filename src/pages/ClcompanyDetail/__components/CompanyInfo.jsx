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
    FileText,
    Hash,
    Briefcase,
    Globe,
    CreditCard,
    Clock,
    Edit2
} from "lucide-react"

import CompanyDetailEditModal from "./CompanyDetailEditModal"

export default function CompanyInfo({ data, onSuccess }) {
    const detail = data?.company_detail || {}
    const editModal = useDisclosure()
    
    return (
        <VStack spacing={8} align="stretch" py={4}>
            <Box>
                <Flex justify="space-between" align="center" mb={4}>
                    <Heading size="md" color="blue.500">Asosiy ma'lumotlar</Heading>
                    <Tooltip label="Batafsil ma'lumotlarni tahrirlash">
                        <IconButton
                            icon={<Edit2 size={16} />}
                            size="sm"
                            variant="ghost"
                            colorScheme="blue"
                            onClick={editModal.onOpen}
                            aria-label="Tahrirlash"
                        />
                    </Tooltip>
                </Flex>
                <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={6}>
                    <InfoItem 
                        icon={<MapPin size={20} />} 
                        label="Manzil" 
                        value={data?.address} 
                    />
                    <InfoItem 
                        icon={<Phone size={20} />} 
                        label="Telefon" 
                        value={data?.phone} 
                    />
                    <InfoItem 
                        icon={<User size={20} />} 
                        label="Direktor nomi" 
                        value={detail.director_name} 
                    />
                    <InfoItem 
                        icon={<Calendar size={20} />} 
                        label="Tashkil etilgan yil" 
                        value={detail.founded_year} 
                    />
                    <InfoItem 
                        icon={<Briefcase size={20} />} 
                        label="Faoliyat yo'nalishi" 
                        value={detail.direction} 
                    />
                    <InfoItem 
                        icon={<Hash size={20} />} 
                        label="INN" 
                        value={detail.inn} 
                    />
                </Grid>
            </Box>

            <Divider />

            <Box>
                <Heading size="md" mb={4} color="blue.500">Bank ma'lumotlari</Heading>
                <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={6}>
                    <InfoItem 
                        icon={<Building2 size={20} />} 
                        label="Bank nomi" 
                        value={detail.bank_name} 
                    />
                    <InfoItem 
                        icon={<MapPin size={20} />} 
                        label="Bank manzili" 
                        value={detail.bank_address} 
                    />
                    <InfoItem 
                        icon={<CreditCard size={20} />} 
                        label="Hisob raqami" 
                        value={detail.account_number} 
                    />
                    <InfoItem 
                        icon={<Hash size={20} />} 
                        label="MFO" 
                        value={detail.mfo} 
                    />
                    <InfoItem 
                        icon={<Hash size={20} />} 
                        label="STIR" 
                        value={detail.stir} 
                    />
                    <InfoItem 
                        icon={<Hash size={20} />} 
                        label="OKED" 
                        value={detail.oked} 
                    />
                </Grid>
            </Box>

            <Divider />

            <Box>
                <Heading size="md" mb={4} color="blue.500">Qo'shimcha ma'lumotlar</Heading>
                <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={6}>
                    <InfoItem 
                        icon={<MapPin size={20} />} 
                        label="Yuridik manzil" 
                        value={detail.legal_address} 
                    />
                    <InfoItem 
                        icon={<Clock size={20} />} 
                        label="Yaratilgan vaqt" 
                        value={formatDate(detail.createdAt)} 
                    />
                </Grid>
            </Box>

            <CompanyDetailEditModal
                isOpen={editModal.isOpen}
                onClose={editModal.onClose}
                data={data}
                companyId={data?.id}
                onSuccess={onSuccess}
            />
        </VStack>
    )
}

function InfoItem({ icon, label, value }) {
    const iconBg = useColorModeValue("blue.50", "blue.900")
    const iconColor = useColorModeValue("blue.500", "blue.200")

    return (
        <Flex align="center" gap={4}>
            <Box
                p={3}
                borderRadius="xl"
                bg={iconBg}
                color={iconColor}
            >
                {icon}
            </Box>
            <Box>
                <Text fontSize="xs" color="gray.500" textTransform="uppercase" letterSpacing="wider">
                    {label}
                </Text>
                <Text fontWeight="bold" fontSize="md">
                    {value || "—"}
                </Text>
            </Box>
        </Flex>
    )
}

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

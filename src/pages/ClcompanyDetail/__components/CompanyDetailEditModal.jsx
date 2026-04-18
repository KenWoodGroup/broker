import { useState, useEffect } from "react"
import {
    Button,
    FormControl,
    FormLabel,
    Input,
    VStack,
    SimpleGrid,
    useToast,
    Box,
    useColorModeValue,
    HStack,
    Icon,
    Text,
} from "@chakra-ui/react"
import { Pencil, Briefcase, Building2 } from "lucide-react"
import { apiCompanyDetail } from "../../../utils/Controllers/apiCompanyDetail"
import TaskModalShell from "../../../components/common/TaskModalShell"

export default function CompanyDetailEditModal({ isOpen, onClose, data, companyId, onSuccess }) {
    const detail = data?.company_detail
    const detailId = detail?.id

    const panelBg = useColorModeValue("gray.50", "whiteAlpha.50")
    const borderCol = useColorModeValue("gray.200", "whiteAlpha.200")

    const [formData, setFormData] = useState({
        founded_year: "",
        direction: "",
        legal_address: "",
        bank_name: "",
        bank_address: "",
        account_number: "",
        mfo: "",
        oked: ""
    })

    const [loading, setLoading] = useState(false)
    const toast = useToast()

    useEffect(() => {
        if (isOpen) {
            setFormData({
                founded_year: detail?.founded_year ?? "",
                direction: detail?.direction ?? "",
                legal_address: detail?.legal_address ?? "",
                bank_name: detail?.bank_name ?? "",
                bank_address: detail?.bank_address ?? "",
                account_number: detail?.account_number ?? "",
                mfo: detail?.mfo ?? "",
                oked: detail?.oked ?? ""
            })
        }
    }, [
        isOpen,
        companyId,
        data?.id,
        detailId,
        detail?.founded_year,
        detail?.direction,
        detail?.legal_address,
        detail?.bank_name,
        detail?.bank_address,
        detail?.account_number,
        detail?.mfo,
        detail?.oked
    ])

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: name === "founded_year" && value ? parseInt(value, 10) : value
        }))
    }

    const handleSubmit = async () => {
        if (!detailId || !companyId) {
            toast({
                title: "Ma'lumot yetarli emas",
                description: "Batafsil yozuvi yoki joylashuv ID topilmadi",
                status: "warning",
                duration: 3000,
                isClosable: true,
            })
            return
        }
        setLoading(true)
        try {
            const detailPayload = {
                location_id: companyId,
                founded_year: formData.founded_year || null,
                direction: formData.direction || null,
                legal_address: formData.legal_address || null,
                bank_name: formData.bank_name || null,
                bank_address: formData.bank_address || null,
                account_number: formData.account_number || null,
                mfo: formData.mfo || null,
                oked: formData.oked || null
            }
            await apiCompanyDetail.Update(detailPayload, detailId)

            onSuccess()
            onClose()
        } catch (error) {
            console.error("Update error:", error)
            toast({
                title: "Xatolik yuz berdi",
                description: error.response?.data?.message || "Kompaniya ma'lumotlarini tahrirlashda xatolik yuz berdi",
                status: "error",
                duration: 3000,
                isClosable: true,
            })
        } finally {
            setLoading(false)
        }
    }

    const subtitle = data?.name ? String(data.name) : "Rekvizitlar va bank ma'lumotlari"

    return (
        <TaskModalShell
            isOpen={isOpen}
            onClose={onClose}
            size="2xl"
            title="Batafsil ma'lumotlarni tahrirlash"
            subtitle={subtitle}
            headerIcon={Pencil}
            footer={
                <>
                    <Button variant="ghost" onClick={onClose} isDisabled={loading}>
                        Bekor qilish
                    </Button>
                    <Button
                        colorScheme="blue"
                        onClick={handleSubmit}
                        isLoading={loading}
                        loadingText="Saqlanmoqda..."
                        borderRadius="xl"
                        px={8}
                    >
                        Saqlash
                    </Button>
                </>
            }
        >
            <VStack align="stretch" spacing={4}>
                <Box
                    p={4}
                    bg={panelBg}
                    borderRadius="xl"
                    borderWidth="1px"
                    borderColor={borderCol}
                >
                    <HStack spacing={2} mb={3}>
                        <Icon as={Briefcase} boxSize={4} color="purple.500" />
                        <Text fontSize="sm" fontWeight="semibold">
                            Tashkilot batafsili
                        </Text>
                    </HStack>
                    <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                        <FormControl>
                            <FormLabel>Tashkil etilgan yil</FormLabel>
                            <Input
                                name="founded_year"
                                type="number"
                                value={formData.founded_year}
                                onChange={handleChange}
                                borderRadius="lg"
                            />
                        </FormControl>
                        <FormControl>
                            <FormLabel>Faoliyat yo&apos;nalishi</FormLabel>
                            <Input name="direction" value={formData.direction} onChange={handleChange} borderRadius="lg" />
                        </FormControl>
                        <FormControl gridColumn={{ md: "1 / -1" }}>
                            <FormLabel>Yuridik manzil</FormLabel>
                            <Input name="legal_address" value={formData.legal_address} onChange={handleChange} borderRadius="lg" />
                        </FormControl>
                    </SimpleGrid>
                </Box>

                <Box
                    p={4}
                    bg={panelBg}
                    borderRadius="xl"
                    borderWidth="1px"
                    borderColor={borderCol}
                >
                    <HStack spacing={2} mb={3}>
                        <Icon as={Building2} boxSize={4} color="orange.500" />
                        <Text fontSize="sm" fontWeight="semibold">
                            Bank va hisobvaraq
                        </Text>
                    </HStack>
                    <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                        <FormControl>
                            <FormLabel>Bank nomi</FormLabel>
                            <Input name="bank_name" value={formData.bank_name} onChange={handleChange} borderRadius="lg" />
                        </FormControl>
                        <FormControl>
                            <FormLabel>Bank manzili</FormLabel>
                            <Input name="bank_address" value={formData.bank_address} onChange={handleChange} borderRadius="lg" />
                        </FormControl>
                        <FormControl>
                            <FormLabel>Hisob raqami</FormLabel>
                            <Input name="account_number" value={formData.account_number} onChange={handleChange} borderRadius="lg" />
                        </FormControl>
                        <FormControl>
                            <FormLabel>MFO</FormLabel>
                            <Input name="mfo" value={formData.mfo} onChange={handleChange} borderRadius="lg" />
                        </FormControl>
                        <FormControl>
                            <FormLabel>OKED</FormLabel>
                            <Input name="oked" value={formData.oked} onChange={handleChange} borderRadius="lg" />
                        </FormControl>
                    </SimpleGrid>
                </Box>
            </VStack>
        </TaskModalShell>
    )
}

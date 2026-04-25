import {
    Button,
    FormControl,
    FormErrorMessage,
    FormLabel,
    Icon,
    Input,
    NumberInput,
    NumberInputField,
    Select,
    SimpleGrid,
    Textarea,
    VStack,
    useDisclosure,
    useToast,
} from "@chakra-ui/react"
import { ChevronDown, Plus } from "lucide-react"
import { useEffect, useMemo, useState } from "react"
import GradientFormModal from "../../../components/common/GradientFormModal"
import { apiLotLocations } from "../../../utils/Controllers/LotLocations"
import { apiLots } from "../../../utils/Controllers/Lots"

export default function LotCreateForCustomer({ customerId, onSuccess }) {
    const { isOpen, onOpen, onClose } = useDisclosure()
    const toast = useToast()
    const [saving, setSaving] = useState(false)
    const [builders, setBuilders] = useState([])

    const TYPE_OPTIONS = useMemo(
        () => [
            "Mukammal ta'mirlash",
            "Rekonstruksiya qilish",
            "Qurilish",
            "Landshaft dizayn va obodanlashtirish",
            "Joriy tamirlash",
            "Modernizatsiya",
            "Tamirlash",
        ],
        []
    )

    const CATEGORY_OPTIONS = useMemo(
        () => ["Umumqurilish", "Melioratsiya va irrigatsiya", "Avtomobil yo'llari, ko'priklar"],
        []
    )

    const [formData, setFormData] = useState({
        address: "",
        type: "",
        category: "",
        lot_number: "",
        lot_name: "",
        customer_id: customerId || "",
        builder_id: "",
        amount: "",
        note: "",
        start_date: "",
        end_date: "",
    })
    const [errors, setErrors] = useState({})

    const selectedBuilderName = useMemo(() => {
        if (!formData.builder_id) return ""
        const found = builders.find((b) => String(b?.id) === String(formData.builder_id))
        return found?.name ? String(found.name) : ""
    }, [builders, formData.builder_id])

    useEffect(() => {
        if (!isOpen) return
        setFormData((p) => ({ ...p, customer_id: customerId || "" }))
    }, [customerId, isOpen])

    const extractRecords = (res) => {
        const data = res?.data
        const records = data?.data?.records ?? data?.records ?? data?.data ?? data
        return Array.isArray(records) ? records : []
    }

    const fetchBuilders = async () => {
        try {
            const res = await apiLotLocations.pageByType({ type: "company", searchName: "all", page: 1 })
            setBuilders(extractRecords(res))
        } catch (e) {
            console.error("Error loading builders:", e)
        }
    }

    useEffect(() => {
        if (isOpen) fetchBuilders()
    }, [isOpen])

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData((p) => ({ ...p, [name]: value }))
        if (errors[name]) setErrors((p) => ({ ...p, [name]: "" }))
    }

    const handleNumberChange = (value) => {
        setFormData((p) => ({ ...p, amount: value }))
        if (errors.amount) setErrors((p) => ({ ...p, amount: "" }))
    }

    const validate = () => {
        const newErrors = {}
        if (!formData.lot_name) newErrors.lot_name = "Lot nomi majburiy"
        if (!formData.lot_number) newErrors.lot_number = "Lot raqami majburiy"
        if (!formData.address) newErrors.address = "Manzil majburiy"
        if (!formData.type) newErrors.type = "Turni tanlang"
        if (!formData.category) newErrors.category = "Kategoriyani tanlang"
        if (!formData.customer_id) newErrors.customer_id = "Buyurtmachi ID topilmadi"
        if (!formData.builder_id) newErrors.builder_id = "Pudratchini tanlang"
        if (!formData.amount || Number(formData.amount) <= 0) newErrors.amount = "Summa to'g'ri emas"
        if (!formData.start_date) newErrors.start_date = "Boshlanish sanasi majburiy"
        if (!formData.end_date) newErrors.end_date = "Tugash sanasi majburiy"
        return newErrors
    }

    const resetForm = () => {
        setFormData({
            address: "",
            type: "",
            category: "",
            lot_number: "",
            lot_name: "",
            customer_id: customerId || "",
            builder_id: "",
            amount: "",
            note: "",
            start_date: "",
            end_date: "",
        })
        setErrors({})
    }

    const handleSubmit = async () => {
        const newErrors = validate()
        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors)
            return
        }
        try {
            setSaving(true)
            const payload = {
                ...formData,
                amount: Number(formData.amount),
                start_date: formData.start_date,
                end_date: formData.end_date,
            }
            const res = await apiLots.create(payload)
            if (res?.status === 200 || res?.status === 201) {
                toast({ title: "Lot muvaffaqiyatli yaratildi", status: "success", duration: 2500 })
                resetForm()
                onClose()
                onSuccess?.()
            } else {
                throw new Error("Server javobi bilan xato")
            }
        } catch (e) {
            toast({
                title: "Xatolik yuz berdi",
                description: e?.message,
                status: "error",
                duration: 5000,
            })
        } finally {
            setSaving(false)
        }
    }

    return (
        <>
            <Button leftIcon={<Plus size={18} />} colorScheme="blue" borderRadius="lg" onClick={onOpen}>
                Lot qo'shish
            </Button>

            <GradientFormModal
                isOpen={isOpen}
                onClose={onClose}
                size="6xl"
                title="Yangi lot"
                subtitle="Lot rekvizitlari va pudratchini tanlang"
                headerIcon={Plus}
                primaryLabel="Saqlash"
                primaryLoading={saving}
                primaryLoadingText="Saqlanmoqda..."
                primaryLeftIcon={<Icon as={Plus} boxSize={4} />}
                onPrimary={handleSubmit}
            >
                <VStack spacing={5} align="stretch">
                    <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} w="100%">
                        <FormControl isInvalid={errors.lot_name} isRequired>
                            <FormLabel>Lot nomi *</FormLabel>
                            <Input name="lot_name" value={formData.lot_name} onChange={handleChange} />
                            <FormErrorMessage>{errors.lot_name}</FormErrorMessage>
                        </FormControl>

                        <FormControl isInvalid={errors.lot_number} isRequired>
                            <FormLabel>Lot raqami *</FormLabel>
                            <Input name="lot_number" value={formData.lot_number} onChange={handleChange} />
                            <FormErrorMessage>{errors.lot_number}</FormErrorMessage>
                        </FormControl>
                    </SimpleGrid>

                    <FormControl isInvalid={errors.address} isRequired>
                        <FormLabel>Manzil *</FormLabel>
                        <Input name="address" value={formData.address} onChange={handleChange} />
                        <FormErrorMessage>{errors.address}</FormErrorMessage>
                    </FormControl>

                    <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} w="100%">
                        <FormControl isInvalid={errors.type} isRequired>
                            <FormLabel>Turi *</FormLabel>
                            <Select
                                name="type"
                                value={formData.type}
                                onChange={handleChange}
                                placeholder="Turni tanlang"
                                variant="outline"
                                pr="8"
                                icon={<ChevronDown size={18} />}
                            >
                                {TYPE_OPTIONS.map((opt) => (
                                    <option key={opt} value={opt}>
                                        {opt}
                                    </option>
                                ))}
                            </Select>
                            <FormErrorMessage>{errors.type}</FormErrorMessage>
                        </FormControl>

                        <FormControl isInvalid={errors.category} isRequired>
                            <FormLabel>Kategoriya *</FormLabel>
                            <Select
                                name="category"
                                value={formData.category}
                                onChange={handleChange}
                                placeholder="Kategoriyani tanlang"
                                variant="outline"
                                pr="8"
                                icon={<ChevronDown size={18} />}
                            >
                                {CATEGORY_OPTIONS.map((opt) => (
                                    <option key={opt} value={opt}>
                                        {opt}
                                    </option>
                                ))}
                            </Select>
                            <FormErrorMessage>{errors.category}</FormErrorMessage>
                        </FormControl>
                    </SimpleGrid>

                    <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} w="100%">
                        <FormControl isInvalid={errors.builder_id} isRequired>
                            <FormLabel>Pudratchi *</FormLabel>
                            <Select
                                name="builder_id"
                                value={formData.builder_id}
                                onChange={handleChange}
                                placeholder="Pudratchi tanlang"
                                variant="outline"
                                pr="8"
                                icon={<ChevronDown size={18} />}
                                title={selectedBuilderName || undefined}
                                sx={{
                                    maxWidth: "100%",
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                    whiteSpace: "nowrap",
                                }}
                            >
                                {builders.map((b) => (
                                    <option key={b.id} value={b.id}>
                                        {b.name}
                                    </option>
                                ))}
                            </Select>
                            <FormErrorMessage>{errors.builder_id}</FormErrorMessage>
                        </FormControl>

                        <FormControl isInvalid={errors.amount} isRequired>
                            <FormLabel>Summa (UZS) *</FormLabel>
                            <NumberInput min={0} value={formData.amount} onChange={handleNumberChange}>
                                <NumberInputField name="amount" />
                            </NumberInput>
                            <FormErrorMessage>{errors.amount}</FormErrorMessage>
                        </FormControl>
                    </SimpleGrid>

                    <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} w="100%">
                        <FormControl isInvalid={errors.start_date} isRequired>
                            <FormLabel>Boshlanish sanasi *</FormLabel>
                            <Input type="date" name="start_date" value={formData.start_date} onChange={handleChange} />
                            <FormErrorMessage>{errors.start_date}</FormErrorMessage>
                        </FormControl>

                        <FormControl isInvalid={errors.end_date} isRequired>
                            <FormLabel>Tugash sanasi *</FormLabel>
                            <Input type="date" name="end_date" value={formData.end_date} onChange={handleChange} />
                            <FormErrorMessage>{errors.end_date}</FormErrorMessage>
                        </FormControl>
                    </SimpleGrid>

                    <FormControl>
                        <FormLabel>Izoh</FormLabel>
                        <Textarea name="note" value={formData.note} onChange={handleChange} rows={3} />
                    </FormControl>
                </VStack>
            </GradientFormModal>
        </>
    )
}


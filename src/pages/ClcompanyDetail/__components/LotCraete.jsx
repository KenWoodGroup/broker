import {
    Button,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalFooter,
    ModalBody,
    ModalCloseButton,
    FormControl,
    FormLabel,
    Input,
    Textarea,
    Select,
    VStack,
    NumberInput,
    NumberInputField,
    FormErrorMessage,
    useToast,
    useDisclosure,
    SimpleGrid,
} from "@chakra-ui/react"
import { Plus, ChevronDown } from "lucide-react"
import { useState, useMemo, useEffect } from "react"
import { apiLots } from "../../../utils/Controllers/Lots"
import { apiLocations } from "../../../utils/Controllers/Locations"

export default function LotCreate({ data, onSuccess }) {
    const { isOpen, onOpen, onClose } = useDisclosure()
    const toast = useToast()
    const [loading, setLoading] = useState(false)
    const [customers, setCustomers] = useState([])

    const builderId = data?.id || ""

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

    const fetchCustomers = async () => {
        try {
            const response = await apiLocations.GetCustomer('all')
            const list = response?.data || response || []
            setCustomers(list)
        } catch (error) {
            console.error("Ошибка загрузки заказчиков:", error)
        }
    }

    useEffect(() => {
        if (isOpen) {
            fetchCustomers()
        }
    }, [isOpen])

    const [formData, setFormData] = useState({
        address: "",
        type: "",
        category: "",
        lot_number: "",
        lot_name: "",
        customer_id: "",
        builder_id: builderId,
        amount: "",
        note: "",
        start_date: "",
        end_date: "",
    })
    const [errors, setErrors] = useState({})

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: "" }))
    }

    const handleNumberChange = (value) => {
        setFormData(prev => ({ ...prev, amount: value }))
        if (errors.amount) setErrors(prev => ({ ...prev, amount: "" }))
    }

    const validate = () => {
        const newErrors = {}
        if (!formData.lot_name) newErrors.lot_name = "Lot nomi majburiy"
        if (!formData.address) newErrors.address = "Manzil majburiy"
        if (!formData.type) newErrors.type = "Turni tanlang"
        if (!formData.category) newErrors.category = "Kategoriyani tanlang"
        if (!formData.customer_id) newErrors.customer_id = "Buyurtmachini tanlang"
        if (!formData.builder_id) newErrors.builder_id = "Pudratchi ID si majburiy"
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
            customer_id: "",
            builder_id: builderId,
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

        setLoading(true)
        try {
            const payload = {
                ...formData,
                amount: Number(formData.amount),
                start_date: formData.start_date,
                end_date: formData.end_date,
            }
            const response = await apiLots.create(payload)
            if (response?.status === 200 || response?.status === 201) {
                toast({
                    title: "Lot muvaffaqiyatli yaratildi",
                    status: "success",
                    duration: 3000,
                })
                resetForm()
                onClose()
                if (onSuccess) onSuccess()
            } else {
                throw new Error("Server javobi bilan xato")
            }
        } catch (error) {
            console.error("Error creating lot:", error)
            toast({
                title: "Xatolik yuz berdi",
                description: error.message,
                status: "error",
                duration: 5000,
            })
        } finally {
            setLoading(false)
        }
    }

    return (
        <>
            <Button leftIcon={<Plus size={18} />} colorScheme="blue" borderRadius="lg" onClick={onOpen}>
                Lot qo'shish
            </Button>

            <Modal isOpen={isOpen} onClose={onClose} size="xl" motionPreset="slideInBottom">
                <ModalOverlay />
                <ModalContent maxW="800px" w="90%">
                    <ModalHeader>Yangi lot qo'shish</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <VStack spacing={5}>
                            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} w="100%">
                                <FormControl isInvalid={errors.lot_name}>
                                    <FormLabel>Lot nomi *</FormLabel>
                                    <Input name="lot_name" value={formData.lot_name} onChange={handleChange} />
                                    <FormErrorMessage>{errors.lot_name}</FormErrorMessage>
                                </FormControl>

                                <FormControl isInvalid={errors.lot_number}>
                                    <FormLabel>Lot raqami</FormLabel>
                                    <Input name="lot_number" value={formData.lot_number} onChange={handleChange} />
                                    <FormErrorMessage>{errors.lot_number}</FormErrorMessage>
                                </FormControl>
                            </SimpleGrid>

                            <FormControl isInvalid={errors.address}>
                                <FormLabel>Manzil *</FormLabel>
                                <Input name="address" value={formData.address} onChange={handleChange} />
                                <FormErrorMessage>{errors.address}</FormErrorMessage>
                            </FormControl>

                            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} w="100%">
                                <FormControl isInvalid={errors.type}>
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
                                        {TYPE_OPTIONS.map(opt => (
                                            <option key={opt} value={opt}>{opt}</option>
                                        ))}
                                    </Select>
                                    <FormErrorMessage>{errors.type}</FormErrorMessage>
                                </FormControl>

                                <FormControl isInvalid={errors.category}>
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
                                        {CATEGORY_OPTIONS.map(opt => (
                                            <option key={opt} value={opt}>{opt}</option>
                                        ))}
                                    </Select>
                                    <FormErrorMessage>{errors.category}</FormErrorMessage>
                                </FormControl>
                            </SimpleGrid>

                            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} w="100%">
                                <FormControl isInvalid={errors.customer_id}>
                                    <FormLabel>Buyurtmachi *</FormLabel>
                                    <Select
                                        name="customer_id"
                                        value={formData.customer_id}
                                        onChange={handleChange}
                                        placeholder="Buyurtmachi tanlang"
                                        variant="outline"
                                        pr="8"
                                        icon={<ChevronDown size={18} />}
                                    >
                                        {customers.map(cust => (
                                            <option key={cust.id} value={cust.id}>{cust.name}</option>
                                        ))}
                                    </Select>
                                    <FormErrorMessage>{errors.customer_id}</FormErrorMessage>
                                </FormControl>

                                <FormControl isInvalid={errors.amount}>
                                    <FormLabel>Summa (UZS) *</FormLabel>
                                    <NumberInput min={0} value={formData.amount} onChange={handleNumberChange}>
                                        <NumberInputField name="amount" />
                                    </NumberInput>
                                    <FormErrorMessage>{errors.amount}</FormErrorMessage>
                                </FormControl>
                            </SimpleGrid>

                            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} w="100%">
                                <FormControl isInvalid={errors.start_date}>
                                    <FormLabel>Boshlanish sanasi *</FormLabel>
                                    <Input type="date" name="start_date" value={formData.start_date} onChange={handleChange} />
                                    <FormErrorMessage>{errors.start_date}</FormErrorMessage>
                                </FormControl>

                                <FormControl isInvalid={errors.end_date}>
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
                    </ModalBody>
                    <ModalFooter>
                        <Button variant="ghost" mr={3} onClick={onClose}>Bekor qilish</Button>
                        <Button colorScheme="blue" onClick={handleSubmit} isLoading={loading}>
                            Saqlash
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </>
    )
}
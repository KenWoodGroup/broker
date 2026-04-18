import { useState, useEffect } from "react"
import {
    Button,
    FormControl,
    FormLabel,
    Input,
    VStack,
    useToast,
    Box,
    useColorModeValue,
    HStack,
    Icon,
    Text,
} from "@chakra-ui/react"
import { Pencil, Building2 } from "lucide-react"
import { apiLocations } from "../../../utils/Controllers/Locations"
import TaskModalShell from "../../../components/common/TaskModalShell"

export default function LocationEditModal({ isOpen, onClose, data, onSuccess }) {
    const [formData, setFormData] = useState({
        name: "",
        address: "",
        phone: "",
        director_name: "",
        inn: ""
    })

    const [loading, setLoading] = useState(false)
    const toast = useToast()

    const panelBg = useColorModeValue("gray.50", "whiteAlpha.50")
    const borderCol = useColorModeValue("gray.200", "whiteAlpha.200")

    useEffect(() => {
        if (data && isOpen) {
            setFormData({
                name: data.name || "",
                address: data.address || "",
                phone: data.phone || "",
                director_name: data.director_name ?? "",
                inn: data.inn ?? ""
            })
        }
    }, [data, isOpen, data?.id, data?.name, data?.address, data?.phone, data?.director_name, data?.inn])

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    const handleSubmit = async () => {
        setLoading(true)
        try {
            const locType = data?.type === "company" ? "Kompaniya" : "Shaxs"
            await apiLocations.UpdateLocationData(
                {
                    name: formData.name,
                    address: formData.address,
                    phone: formData.phone,
                    director_name: formData.director_name?.trim() || null,
                    inn: formData.inn?.trim() || null
                },
                data?.id,
                locType
            )
            onSuccess()
            onClose()
        } catch (error) {
            console.error("Update error:", error)
            toast({
                title: "Xatolik yuz berdi",
                description: error.response?.data?.message || "Ma'lumotlarni tahrirlashda xatolik yuz berdi",
                status: "error",
                duration: 3000,
                isClosable: true,
            })
        } finally {
            setLoading(false)
        }
    }

    const subtitle =
        data?.type === "company" ? "Kompaniya profili" : "Shaxs profili"

    return (
        <TaskModalShell
            isOpen={isOpen}
            onClose={onClose}
            size="lg"
            title="Asosiy ma'lumotlarni tahrirlash"
            subtitle={subtitle}
            headerIcon={Pencil}
            locationDirectorName={formData.director_name}
            locationInn={formData.inn}
            onLocationDirectorNameChange={(v) =>
                setFormData((p) => ({ ...p, director_name: v }))
            }
            onLocationInnChange={(v) => setFormData((p) => ({ ...p, inn: v }))}
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
            <Box
                p={4}
                bg={panelBg}
                borderRadius="xl"
                borderWidth="1px"
                borderColor={borderCol}
            >
                <HStack spacing={2} mb={3}>
                    <Icon as={Building2} boxSize={4} color="blue.500" />
                    <Text fontSize="sm" fontWeight="semibold">
                        Nomi, manzil va telefon
                    </Text>
                </HStack>
                <VStack spacing={4} align="stretch">
                    <FormControl isRequired>
                        <FormLabel>Nomi</FormLabel>
                        <Input
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="Kompaniya yoki shaxs nomi"
                            borderRadius="lg"
                        />
                    </FormControl>

                    <FormControl>
                        <FormLabel>Manzil</FormLabel>
                        <Input
                            name="address"
                            value={formData.address}
                            onChange={handleChange}
                            placeholder="Manzil"
                            borderRadius="lg"
                        />
                    </FormControl>

                    <FormControl>
                        <FormLabel>Telefon</FormLabel>
                        <Input
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            placeholder="998901234567"
                            borderRadius="lg"
                        />
                    </FormControl>
                </VStack>
            </Box>
        </TaskModalShell>
    )
}

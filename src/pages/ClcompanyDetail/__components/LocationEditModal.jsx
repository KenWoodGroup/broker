import { useState, useEffect } from "react"
import {
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalFooter,
    ModalBody,
    ModalCloseButton,
    Button,
    FormControl,
    FormLabel,
    Input,
    VStack,
    useToast
} from "@chakra-ui/react"
import { apiLocations } from "../../../utils/Controllers/Locations"

export default function LocationEditModal({ isOpen, onClose, data, onSuccess }) {
    const [formData, setFormData] = useState({
        name: "",
        address: "",
        phone: ""
    })
    
    const [loading, setLoading] = useState(false)
    const toast = useToast()

    useEffect(() => {
        if (data && isOpen) {
            setFormData({
                name: data.name || "",
                address: data.address || "",
                phone: data.phone || ""
            })
        }
    }, [data, isOpen])

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    const handleSubmit = async () => {
        setLoading(true)
        try {
            // locType can be based on data.type, e.g., "company" or "person"
            const locType = data?.type === "company" ? "Kompaniya" : "Shaxs"
            await apiLocations.UpdateLocationData(formData, data?.id, locType)
            onSuccess() // Refresh data in parent component
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

    return (
        <Modal isOpen={isOpen} onClose={onClose} size="md">
            <ModalOverlay />
            <ModalContent>
                <ModalHeader>Ma'lumotlarni tahrirlash</ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                    <VStack spacing={4}>
                        <FormControl isRequired>
                            <FormLabel>Nomi (Name)</FormLabel>
                            <Input 
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                placeholder="Kompaniya yoki shaxs nomi"
                            />
                        </FormControl>

                        <FormControl>
                            <FormLabel>Manzil (Address)</FormLabel>
                            <Input 
                                name="address"
                                value={formData.address}
                                onChange={handleChange}
                                placeholder="Manzil"
                            />
                        </FormControl>

                        <FormControl>
                            <FormLabel>Telefon (Phone)</FormLabel>
                            <Input 
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                placeholder="998901234567"
                            />
                        </FormControl>
                    </VStack>
                </ModalBody>

                <ModalFooter>
                    <Button variant="ghost" mr={3} onClick={onClose} isDisabled={loading}>
                        Bekor qilish
                    </Button>
                    <Button 
                        colorScheme="blue" 
                        onClick={handleSubmit}
                        isLoading={loading}
                    >
                        Saqlash
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    )
}

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
import { apiLocationUsers } from "../../../utils/Controllers/apiLocationUsers"

export default function UserFormModal({ isOpen, onClose, data, locationId, onSuccess }) {
    const isEdit = !!data
    
    const [formData, setFormData] = useState({
        location_id: locationId || "",
        full_name: "",
        username: "",
        password: "",
        role: "company" // Defaulting to "company" as specified
    })
    
    const [loading, setLoading] = useState(false)
    const toast = useToast()

    useEffect(() => {
        if (isOpen) {
            setFormData({
                location_id: locationId || "",
                full_name: data?.full_name || "",
                username: data?.username || "",
                password: "", // In edit mode, password is usually left empty unless changing
                role: data?.role || "company"
            })
        }
    }, [data, locationId, isOpen])

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    const handleSubmit = async () => {
        setLoading(true)
        try {
            // Prepare payload; omit empty password on edit
            const payload = { ...formData }
            if (isEdit && !payload.password) {
                delete payload.password
            }

            if (isEdit) {
                await apiLocationUsers.Update(payload, data.id)
            } else {
                await apiLocationUsers.Add(payload)
            }
            
            onSuccess()
            onClose()
        } catch (error) {
            console.error("Save error:", error)
            toast({
                title: "Xatolik yuz berdi",
                description: error.response?.data?.message || "Foydalanuvchini saqlashda xatolik yuz berdi",
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
                <ModalHeader>{isEdit ? "Foydalanuvchini tahrirlash" : "Yangi foydalanuvchi yaratish"}</ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                    <VStack spacing={4}>
                        <FormControl isRequired>
                            <FormLabel>To'liq ism (Full Name)</FormLabel>
                            <Input 
                                name="full_name"
                                value={formData.full_name}
                                onChange={handleChange}
                                placeholder="Masalan: John Doe"
                            />
                        </FormControl>

                        <FormControl isRequired>
                            <FormLabel>Foydalanuvchi nomi (Username)</FormLabel>
                            <Input 
                                name="username"
                                value={formData.username}
                                onChange={handleChange}
                                placeholder="Masalan: john_doe"
                            />
                        </FormControl>

                        <FormControl isRequired={!isEdit}>
                            <FormLabel>Parol (Password)</FormLabel>
                            <Input 
                                name="password"
                                type="password"
                                value={formData.password}
                                onChange={handleChange}
                                placeholder={isEdit ? "O'zgartirish uchun yangi parol kiriting" : "Kamida 6 belgi"}
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

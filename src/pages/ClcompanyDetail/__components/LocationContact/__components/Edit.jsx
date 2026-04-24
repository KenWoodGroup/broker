import {
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
    VStack,
    Button,
    useToast,
} from "@chakra-ui/react"
import { useState, useEffect } from "react"
import { apiLocationContact } from "../../../../../utils/Controllers/apiLocationContact"

export default function Edit({ isOpen, onClose, contact, onSuccess }) {
    const toast = useToast()
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState({
        role: "",
        name: "",
        phoneOne: "",
        phoneTwo: "",
    })

    // Обновляем форму при изменении contact или открытии модалки
    useEffect(() => {
        if (isOpen && contact) {
            setFormData({
                role: contact.role || "",
                name: contact.name || "",
                phoneOne: contact.phone_one || "",
                phoneTwo: contact.phone_two || "",
            })
        }
    }, [isOpen, contact])

    // Сброс при закрытии модалки (опционально)
    const handleClose = () => {
        onClose()
        // Можно также сбросить форму, но не обязательно
    }

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData((prev) => ({ ...prev, [name]: value }))
    }

    const handleSubmit = async () => {
        if (!formData.role || !formData.name || !formData.phoneOne) {
            toast({
                title: "Xatolik",
                description: "Barcha majburiy maydonlarni to'ldiring",
                status: "error",
                duration: 3000,
                isClosable: true,
            })
            return
        }

        const dataToSend = {
            role: formData.role,
            name: formData.name,
            phoneOne: formData.phoneOne,
        }
        if (formData.phoneTwo && formData.phoneTwo.trim() !== "") {
            dataToSend.phoneTwo = formData.phoneTwo
        }

        setLoading(true)
        try {
            await apiLocationContact.Edit(contact.id, dataToSend)
            toast({
                title: "Muvaffaqiyatli",
                description: "Kontakt yangilandi",
                status: "success",
                duration: 3000,
                isClosable: true,
            })
            handleClose()
            if (onSuccess) onSuccess()
        } catch (error) {
            toast({
                title: "Xatolik",
                description: error?.response?.data?.message || "Yangilashda xatolik",
                status: "error",
                duration: 5000,
                isClosable: true,
            })
        } finally {
            setLoading(false)
        }
    }

    return (
        <Modal isOpen={isOpen} onClose={handleClose} size="md">
            <ModalOverlay />
            <ModalContent>
                <ModalHeader>Kontaktni tahrirlash</ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                    <VStack spacing={4}>
                        <FormControl isRequired>
                            <FormLabel>Lavozim</FormLabel>
                            <Input
                                name="role"
                                value={formData.role}
                                onChange={handleChange}
                                placeholder="Masalan: Manager"
                            />
                        </FormControl>
                        <FormControl isRequired>
                            <FormLabel>Ism</FormLabel>
                            <Input
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                placeholder="To'liq ismi"
                            />
                        </FormControl>
                        <FormControl isRequired>
                            <FormLabel>Telefon 1</FormLabel>
                            <Input
                                name="phoneOne"
                                value={formData.phoneOne}
                                onChange={handleChange}
                                placeholder="+998XXXXXXXXX"
                            />
                        </FormControl>
                        <FormControl>
                            <FormLabel>Telefon 2 (ixtiyoriy)</FormLabel>
                            <Input
                                name="phoneTwo"
                                value={formData.phoneTwo}
                                onChange={handleChange}
                                placeholder="+998XXXXXXXXX"
                            />
                        </FormControl>
                    </VStack>
                </ModalBody>
                <ModalFooter>
                    <Button variant="ghost" mr={3} onClick={handleClose}>
                        Bekor qilish
                    </Button>
                    <Button colorScheme="blue" onClick={handleSubmit} isLoading={loading}>
                        Saqlash
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    )
}
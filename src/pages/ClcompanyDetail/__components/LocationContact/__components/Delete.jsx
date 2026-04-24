import {
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalFooter,
    ModalBody,
    ModalCloseButton,
    Text,
    Button,
    useToast,
} from "@chakra-ui/react"
import { useState } from "react"
import { apiLocationContact } from "../../../../../utils/Controllers/apiLocationContact"

export default function Delete({ isOpen, onClose, contact, onSuccess }) {
    const toast = useToast()
    const [loading, setLoading] = useState(false)

    const handleDelete = async () => {
        setLoading(true)
        try {
            await apiLocationContact.Delete(contact.id)
            toast({
                title: "Muvaffaqiyatli",
                description: "Kontakt o'chirildi",
                status: "success",
                duration: 3000,
                isClosable: true,
            })
            onClose()
            if (onSuccess) onSuccess()
        } catch (error) {
            toast({
                title: "Xatolik",
                description: error?.response?.data?.message || "O'chirishda xatolik",
                status: "error",
                duration: 5000,
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
                <ModalHeader>Kontaktni o'chirish</ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                    <Text>
                        <strong>{contact?.name}</strong> ({contact?.role}) kontaktini o'chirishni
                        xohlaysizmi? Bu amalni qaytarib bo'lmaydi.
                    </Text>
                </ModalBody>
                <ModalFooter>
                    <Button variant="ghost" mr={3} onClick={onClose}>
                        Bekor qilish
                    </Button>
                    <Button colorScheme="red" onClick={handleDelete} isLoading={loading}>
                        O'chirish
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    )
}
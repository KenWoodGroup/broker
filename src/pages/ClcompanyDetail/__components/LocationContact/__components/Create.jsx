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
    VStack,
    useDisclosure,
    useToast,
} from "@chakra-ui/react"
import { useState } from "react"
import { apiLocationContact } from "../../../../../utils/Controllers/apiLocationContact"
import { useParams } from "react-router"

export default function Create({ onSuccess }) {
    const { isOpen, onOpen, onClose } = useDisclosure()
    const { id } = useParams()
    const toast = useToast()
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState({
        locationId: id,
        role: "",
        name: "",
        phoneOne: "+998",
        phoneTwo: "",
    })

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData((prev) => ({ ...prev, [name]: value }))
    }

    const handleSubmit = async () => {
        if (!formData.locationId || !formData.role || !formData.name || !formData.phoneOne) {
            toast({
                title: "Xatolik",
                description: "Iltimos, barcha majburiy maydonlarni to'ldiring",
                status: "error",
                duration: 3000,
                isClosable: true,
            })
            return
        }

        const dataToSend = {
            locationId: formData.locationId,
            role: formData.role,
            name: formData.name,
            phoneOne: formData.phoneOne,
        }
        if (formData.phoneTwo && formData.phoneTwo.trim() !== "") {
            dataToSend.phoneTwo = formData.phoneTwo
        }

        setLoading(true)
        try {
            await apiLocationContact.Create(dataToSend)
            toast({
                title: "Muvaffaqiyatli",
                description: "Kontakt yaratildi",
                status: "success",
                duration: 3000,
                isClosable: true,
            })
            setFormData({
                locationId: id,
                role: "",
                name: "",
                phoneOne: "+998",
                phoneTwo: "",
            })
            onClose()
            if (onSuccess) onSuccess()
        } catch (error) {
            console.error("Xatolik:", error)
            toast({
                title: "Xatolik",
                description: error?.response?.data?.message || "Kontakt yaratishda xatolik yuz berdi",
                status: "error",
                duration: 5000,
                isClosable: true,
            })
        } finally {
            setLoading(false)
        }
    }

    return (
        <>
            <Button colorScheme="blue" onClick={onOpen}>
                Yaratish
            </Button>
            <Modal isOpen={isOpen} onClose={onClose} size="md">
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>Yangi kontakt yaratish</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <VStack spacing={4}>
                            <FormControl isRequired>
                                <FormLabel>Lavozimi</FormLabel>
                                <Input
                                    name="role"
                                    value={formData.role}
                                    onChange={handleChange}
                                    placeholder="Masalan: Manager, Direktor, Bugalter"
                                />
                            </FormControl>
                            <FormControl isRequired>
                                <FormLabel>Ism</FormLabel>
                                <Input
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    placeholder="John Doe"
                                />
                            </FormControl>
                            <FormControl isRequired>
                                <FormLabel>Telefon 1</FormLabel>
                                <Input
                                    name="phoneOne"
                                    value={formData.phoneOne}
                                    onChange={handleChange}
                                    placeholder="+998901234567"
                                />
                            </FormControl>
                            <FormControl>
                                <FormLabel>Telefon 2 (ixtiyoriy)</FormLabel>
                                <Input
                                    name="phoneTwo"
                                    value={formData.phoneTwo}
                                    onChange={handleChange}
                                    placeholder="+998901234567"
                                />
                            </FormControl>
                        </VStack>
                    </ModalBody>
                    <ModalFooter>
                        <Button variant="ghost" mr={3} onClick={onClose}>
                            Bekor qilish
                        </Button>
                        <Button colorScheme="blue" onClick={handleSubmit} isLoading={loading}>
                            Saqlash
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </>
    )
}
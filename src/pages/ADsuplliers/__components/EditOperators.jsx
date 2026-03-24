import {
    Button,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalCloseButton,
    ModalBody,
    ModalFooter,
    FormControl,
    FormLabel,
    Input,
    VStack,
    useDisclosure,
    useToast
} from "@chakra-ui/react"
import { PencilLine } from "lucide-react"
import { useEffect, useState } from "react"
import { apiUsers } from "../../../utils/Controllers/Users"
import { apiLocationUsers } from "../../../utils/Controllers/apiLocationUsers"

export default function EditOperators({ data, refresh }) {
    const { isOpen, onOpen, onClose } = useDisclosure()
    const toast = useToast()
    const [loading, setLoading] = useState(false)

    const [formData, setFormData] = useState({
        full_name: "",
        username: "",
        email: ""
    })

    // Modal ochilganda eski ma'lumotlarni yuklaymiz
    useEffect(() => {
        if (data && isOpen) {
            setFormData({
                full_name: data.full_name || "",
                username: data.username || "",
                email: data.email || ""
            })
        }
    }, [data, isOpen])

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData((prev) => ({
            ...prev,
            [name]: value
        }))
    }

    const handleUpdate = async () => {
        try {
            setLoading(true)
            const {email, ...prev} = formData
            await apiLocationUsers.Update(prev, data.id)
            onClose()
            if (refresh) refresh()

        } finally {
            setLoading(false)
        }
    }

    return (
        <>
            {/* Edit Button */}
            <Button
                size="sm"
                colorScheme="blue"
                variant="ghost"
                onClick={onOpen}
            >
                <PencilLine size={18} />
            </Button>

            {/* Modal */}
            <Modal isOpen={isOpen} onClose={onClose} isCentered>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>Operatorni tahrirlash</ModalHeader>
                    <ModalCloseButton />

                    <ModalBody>
                        <VStack spacing={4}>
                            <FormControl isRequired>
                                <FormLabel>To'liq ism</FormLabel>
                                <Input
                                    name="full_name"
                                    value={formData.full_name}
                                    onChange={handleChange}
                                />
                            </FormControl>

                            <FormControl isRequired>
                                <FormLabel>Username</FormLabel>
                                <Input
                                    name="username"
                                    value={formData.username}
                                    onChange={handleChange}
                                />
                            </FormControl>

                            {/* <FormControl>
                                <FormLabel>Email</FormLabel>
                                <Input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                />
                            </FormControl> */}
                        </VStack>
                    </ModalBody>

                    <ModalFooter>
                        <Button variant="ghost" mr={3} onClick={onClose}>
                            Bekor qilish
                        </Button>
                        <Button
                            colorScheme="blue"
                            onClick={handleUpdate}
                            isLoading={loading}
                        >
                            Saqlash
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </>
    )
}

import {
    Button,
    FormControl,
    FormLabel,
    Input,
    VStack,
    useDisclosure,
    useToast
} from "@chakra-ui/react"
import { UserPlus } from "lucide-react"
import { useState } from "react"
import { apiUsers } from "../../../utils/Controllers/Users"
import TaskModalShell from "../../../components/common/TaskModalShell"

export default function CreateOperators({refresh}) {
    const { isOpen, onOpen, onClose } = useDisclosure()
    const toast = useToast()

    const [loading, setLoading] = useState(false)

    const [formData, setFormData] = useState({
        full_name: "",
        username: "",
        password: "",
        role: "supplier"
    })

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData((prev) => ({
            ...prev,
            [name]: value
        }))
    }

    const handleSubmit = async () => {
        try {
            setLoading(true)
            await apiUsers.CreateOperator(formData)
            toast({
                title: "Muvaffaqiyatli!",
                description: "Ta'minotchi yaratildi.",
                status: "success",
                duration: 3000,
                isClosable: true,
            })
            refresh()
            setFormData({
                full_name: "",
                username: "",
                password: "",
                role: "supplier"
            })

            onClose()
        } catch (e) {
            toast({
                title: "Xatolik!",
                description: "Yaratishda xatolik yuz berdi.",
                status: "error",
                duration: 3000,
                isClosable: true,
            })
        } finally {
            setLoading(false)
        }
    }

    return (
        <>
            <Button colorScheme="blue" onClick={onOpen}>
                Ta'minotchi yaratish
            </Button>

            <TaskModalShell
                isOpen={isOpen}
                onClose={onClose}
                title="Yangi ta'minotchi"
                subtitle="To'liq ism, username va parol"
                headerIcon={UserPlus}
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
                            Yaratish
                        </Button>
                    </>
                }
            >
                <VStack spacing={4} align="stretch">
                    <FormControl isRequired>
                        <FormLabel>To'liq ism</FormLabel>
                        <Input
                            name="full_name"
                            placeholder="John Doe"
                            value={formData.full_name}
                            onChange={handleChange}
                            borderRadius="lg"
                        />
                    </FormControl>

                    <FormControl isRequired>
                        <FormLabel>Username</FormLabel>
                        <Input
                            name="username"
                            placeholder="john"
                            value={formData.username}
                            onChange={handleChange}
                            borderRadius="lg"
                        />
                    </FormControl>

                    <FormControl isRequired>
                        <FormLabel>Parol</FormLabel>
                        <Input
                            type="password"
                            name="password"
                            placeholder="password123"
                            value={formData.password}
                            onChange={handleChange}
                            borderRadius="lg"
                        />
                    </FormControl>
                </VStack>
            </TaskModalShell>
        </>
    )
}

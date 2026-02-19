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
    Select,
    SimpleGrid,
    useDisclosure,
    useToast,
    Divider
} from "@chakra-ui/react"
import { useState } from "react"
import { apiLocations } from "../../../utils/Controllers/Locations"
export default function CreateCompany({ refresh }) {
    const { isOpen, onOpen, onClose } = useDisclosure()
    const toast = useToast()
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState({
        type: "company",
        name: "",
        full_name: "",
        address: "",
        phone: "",
        email: "",
        username: "",
        password: ""
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
            await apiLocations.AddWeb(formData)

            toast({
                title: "Muvaffaqiyatli!",
                description: "Tashkilot yaratildi.",
                status: "success",
                duration: 3000,
                isClosable: true
            })

            onClose()
            refresh && refresh()

        } catch (error) {
            toast({
                title: "Xatolik!",
                description: "Yaratishda xatolik yuz berdi.",
                status: "error",
                duration: 3000,
                isClosable: true
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
            <Modal isOpen={isOpen} onClose={onClose} size="xl" isCentered>
                <ModalOverlay />
                <ModalContent borderRadius="xl">
                    <ModalHeader fontSize="lg" fontWeight="bold">
                        Yangi tashkilot
                    </ModalHeader>
                    <ModalCloseButton />
                    <Divider />

                    <ModalBody py={6}>
                        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>

                            <FormControl isRequired>
                                <FormLabel>Turi</FormLabel>
                                <Select border={'1px'} name="type" value={formData.type} onChange={handleChange}>
                                    <option value="company">Qurilish kompaniya</option>
                                    <option value="builder">Qurivchilar</option>
                                    <option value="shop">Magazin</option>
                                </Select>
                            </FormControl>

                            <FormControl isRequired>
                                <FormLabel>Nomi</FormLabel>
                                <Input name="name" value={formData.name} onChange={handleChange} />
                            </FormControl>

                            <FormControl isRequired>
                                <FormLabel>Mas'ul shaxs</FormLabel>
                                <Input name="full_name" value={formData.full_name} onChange={handleChange} />
                            </FormControl>

                            <FormControl isRequired>
                                <FormLabel>Telefon</FormLabel>
                                <Input
                                    name="phone"
                                    placeholder="+998901234567"
                                    value={formData.phone}
                                    onChange={handleChange}
                                />
                            </FormControl>

                            <FormControl>
                                <FormLabel>Email</FormLabel>
                                <Input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                />
                            </FormControl>

                            <FormControl isRequired>
                                <FormLabel>Manzil</FormLabel>
                                <Input name="address" value={formData.address} onChange={handleChange} />
                            </FormControl>

                            <FormControl isRequired>
                                <FormLabel>Username</FormLabel>
                                <Input name="username" value={formData.username} onChange={handleChange} />
                            </FormControl>

                            <FormControl isRequired>
                                <FormLabel>Parol</FormLabel>
                                <Input
                                    type="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                />
                            </FormControl>

                        </SimpleGrid>
                    </ModalBody>

                    <ModalFooter>
                        <Button variant="ghost" mr={3} onClick={onClose}>
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
        </>
    )
}

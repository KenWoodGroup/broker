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
    useToast,
} from "@chakra-ui/react";
import { useState } from "react";
import { apiUsers } from "../../../utils/Controllers/Users";
export default function CreateLotCreator({ refresh }) {
    const { isOpen, onOpen, onClose } = useDisclosure();
    const toast = useToast();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        full_name: "",
        username: "",
        password: "",
        role: "lot_creator",
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = async () => {
        try {
            setLoading(true);
            await apiUsers.CreateOperator(formData);
            toast({
                title: "Muvaffaqiyatli!",
                description: "Lot creator muvaffaqiyatli yaratildi.",
                status: "success",
                duration: 3000,
                isClosable: true,
            });
            refresh?.();
            setFormData({
                full_name: "",
                username: "",
                password: "",
                role: "lot_creator",
            });
            onClose();
        } catch (error) {
            toast({
                title: "Xatolik!",
                description: "Lot creator yaratishda xatolik yuz berdi.",
                status: "error",
                duration: 3000,
                isClosable: true,
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Button colorScheme="blue" onClick={onOpen}>
             Yaratish
            </Button>

            <Modal isOpen={isOpen} onClose={onClose} isCentered>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>Yangi lot yaratuvchi</ModalHeader>
                    <ModalCloseButton />

                    <ModalBody>
                        <VStack spacing={4}>
                            <FormControl isRequired>
                                <FormLabel>To'liq ism</FormLabel>
                                <Input
                                    name="full_name"
                                    placeholder="John Doe"
                                    value={formData.full_name}
                                    onChange={handleChange}
                                />
                            </FormControl>

                            <FormControl isRequired>
                                <FormLabel>Username</FormLabel>
                                <Input
                                    name="username"
                                    placeholder="john"
                                    value={formData.username}
                                    onChange={handleChange}
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
    );
}


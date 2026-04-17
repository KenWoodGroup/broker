import {
    Button,
    FormControl,
    FormLabel,
    Input,
    Modal,
    ModalBody,
    ModalCloseButton,
    ModalContent,
    ModalFooter,
    ModalHeader,
    ModalOverlay,
    SimpleGrid,
    useToast,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { apiLotLocations } from "../../../utils/Controllers/LotLocations";

export default function CreateBuilderModal({ isOpen, onClose, onCreated, initialName = "" }) {
    const toast = useToast();
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({
        type: "company",
        name: "",
        full_name: "",
        address: "",
        phone: "",
        email: "",
        username: "",
        parent_id: "",
        password: "",
    });

    useEffect(() => {
        if (isOpen) {
            setForm((p) => ({
                ...p,
                name: initialName || "",
            }));
        }
    }, [isOpen, initialName]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((p) => ({ ...p, [name]: value }));
    };

    const handleSubmit = async () => {
        if (!form.name?.trim()) {
            toast({ title: "Name kerak", status: "warning", duration: 2500, isClosable: true });
            return;
        }
        if (!form.full_name?.trim()) {
            toast({ title: "Full name kerak", status: "warning", duration: 2500, isClosable: true });
            return;
        }
        if (!form.phone?.trim()) {
            toast({ title: "Phone kerak", status: "warning", duration: 2500, isClosable: true });
            return;
        }
        if (!form.username?.trim()) {
            toast({ title: "Username kerak", status: "warning", duration: 2500, isClosable: true });
            return;
        }
    
        if (!form.password?.trim()) {
            toast({ title: "Password kerak", status: "warning", duration: 2500, isClosable: true });
            return;
        }
        try {
            setLoading(true);
            const res = await apiLotLocations.createCompany({
                type: form.type,
                name: form.name.trim(),
                full_name: form.full_name.trim(),
                address: form.address.trim(),
                phone: form.phone.trim(),
                email: form.email.trim(),
                username: form.username.trim(),
                parent_id: form.parent_id.trim(),
                password: form.password.trim(),
            });

            const created = res?.data?.data ?? res?.data;
            onCreated?.(created);
            onClose?.();
        } catch (e) {
            // global error handler already toasts
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} isCentered size="xl" scrollBehavior="inside">
            <ModalOverlay />
            <ModalContent bg="surface" borderColor="border">
                <ModalHeader>Yangi quruvchi</ModalHeader>
                <ModalCloseButton />
                <ModalBody maxH="70vh">
                    <SimpleGrid columns={{ base: 1, md: 2 }} spacing="12px">
                        <FormControl isRequired>
                            <FormLabel>Name</FormLabel>
                            <Input name="name" value={form.name} onChange={handleChange} placeholder="Quruvchi nomi" bg="bg" />
                        </FormControl>
                        <FormControl isRequired>
                            <FormLabel>Full name</FormLabel>
                            <Input
                                name="full_name"
                                value={form.full_name}
                                onChange={handleChange}
                                placeholder="John Doe"
                                bg="bg"
                            />
                        </FormControl>
                        <FormControl>
                            <FormLabel>Address</FormLabel>
                            <Input name="address" value={form.address} onChange={handleChange} placeholder="address" bg="bg" />
                        </FormControl>
                        <FormControl isRequired>
                            <FormLabel>Phone</FormLabel>
                            <Input name="phone" value={form.phone} onChange={handleChange} placeholder="+998901234567" bg="bg" />
                        </FormControl>
                        <FormControl>
                            <FormLabel>Email</FormLabel>
                            <Input
                                name="email"
                                value={form.email}
                                onChange={handleChange}
                                placeholder="john@gmail.com"
                                bg="bg"
                            />
                        </FormControl>
                        <FormControl isRequired>
                            <FormLabel>Username</FormLabel>
                            <Input name="username" value={form.username} onChange={handleChange} placeholder="kenwood" bg="bg" />
                        </FormControl>
                  
                        <FormControl isRequired>
                            <FormLabel>Password</FormLabel>
                            <Input
                                type="password"
                                name="password"
                                value={form.password}
                                onChange={handleChange}
                                placeholder="password123"
                                bg="bg"
                            />
                        </FormControl>
                    </SimpleGrid>
                </ModalBody>
                <ModalFooter>
                    <Button variant="ghost" mr={3} onClick={onClose}>
                        Bekor qilish
                    </Button>
                    <Button colorScheme="green" onClick={handleSubmit} isLoading={loading}>
                        Yaratish
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
}


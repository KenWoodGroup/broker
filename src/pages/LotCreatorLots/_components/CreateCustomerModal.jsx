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
    VStack,
    useToast,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { apiLotLocations } from "../../../utils/Controllers/LotLocations";

export default function CreateCustomerModal({ isOpen, onClose, onCreated, initialName = "" }) {
    const toast = useToast();
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({
        name: "",
        address: "",
        phone: "",
        director_name: "",
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
        try {
            setLoading(true);
            const res = await apiLotLocations.createCustomer({
                name: form.name.trim(),
                address: form.address.trim(),
                phone: form.phone.trim(),
                director_name: form.director_name.trim(),
            });

            const created = res?.data?.data ?? res?.data;
            onCreated?.(created);
            onClose?.();
        } catch (e) {
            // global error handler already toasts, keep minimal
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} isCentered size="lg">
            <ModalOverlay />
            <ModalContent bg="surface" borderColor="border">
                <ModalHeader>Yangi customer</ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                    <VStack spacing="12px" align="stretch">
                        <FormControl isRequired>
                            <FormLabel>Name</FormLabel>
                            <Input name="name" value={form.name} onChange={handleChange} placeholder="Kenwood" bg="bg" />
                        </FormControl>
                        <FormControl>
                            <FormLabel>Address</FormLabel>
                            <Input name="address" value={form.address} onChange={handleChange} placeholder="address" bg="bg" />
                        </FormControl>
                        <FormControl>
                            <FormLabel>Phone</FormLabel>
                            <Input
                                name="phone"
                                value={form.phone}
                                onChange={handleChange}
                                placeholder="+998901234567"
                                bg="bg"
                            />
                        </FormControl>
                        <FormControl>
                            <FormLabel>Director name</FormLabel>
                            <Input
                                name="director_name"
                                value={form.director_name}
                                onChange={handleChange}
                                placeholder="Ro'zmatov Rustamjon Hoshimovich"
                                bg="bg"
                            />
                        </FormControl>
                    </VStack>
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


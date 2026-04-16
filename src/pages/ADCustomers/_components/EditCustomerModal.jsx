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
    Spinner,
    VStack,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { apiLotLocations } from "../../../utils/Controllers/LotLocations";

export default function EditCustomerModal({ isOpen, onClose, customerId, onUpdated }) {
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [form, setForm] = useState({
        name: "",
        address: "",
        phone: "",
    });

    const extractData = (res) => res?.data?.data ?? res?.data ?? null;

    useEffect(() => {
        if (!isOpen || !customerId) return;
        const run = async () => {
            try {
                setLoading(true);
                const res = await apiLotLocations.getById(customerId);
                const c = extractData(res) || {};
                setForm({
                    name: c.name ?? "",
                    address: c.address ?? "",
                    phone: c.phone ?? "",
                });
            } finally {
                setLoading(false);
            }
        };
        run();
    }, [isOpen, customerId]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((p) => ({ ...p, [name]: value }));
    };

    const handleSave = async () => {
        if (!customerId) return;
        try {
            setSaving(true);
            await apiLotLocations.update(customerId, {
                name: form.name.trim(),
                address: form.address.trim(),
                phone: form.phone.trim(),
            });
            onUpdated?.();
            onClose?.();
        } finally {
            setSaving(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} isCentered size="lg">
            <ModalOverlay />
            <ModalContent bg="surface" borderColor="border">
                <ModalHeader>Buyurtmachini tahrirlash</ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                    {loading ? (
                        <VStack py="30px">
                            <Spinner size="lg" />
                        </VStack>
                    ) : (
                        <VStack spacing="12px" align="stretch">
                            <FormControl isRequired>
                                <FormLabel>Nomi</FormLabel>
                                <Input name="name" value={form.name} onChange={handleChange} bg="bg" />
                            </FormControl>
                            <FormControl isRequired>
                                <FormLabel>Manzil</FormLabel>
                                <Input name="address" value={form.address} onChange={handleChange} bg="bg" />
                            </FormControl>
                            <FormControl isRequired>
                                <FormLabel>Telefon</FormLabel>
                                <Input name="phone" value={form.phone} onChange={handleChange} bg="bg" />
                            </FormControl>
                        </VStack>
                    )}
                </ModalBody>
                <ModalFooter>
                    <Button variant="ghost" mr={3} onClick={onClose}>
                        Bekor qilish
                    </Button>
                    <Button colorScheme="green" onClick={handleSave} isLoading={saving} isDisabled={loading}>
                        Saqlash
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
}


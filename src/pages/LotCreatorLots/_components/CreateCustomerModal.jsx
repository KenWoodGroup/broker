import { Button, FormControl, FormLabel, Input, VStack, useToast, Icon } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { Plus, UserPlus } from "lucide-react";
import { apiLotLocations } from "../../../utils/Controllers/LotLocations";
import GradientFormModal from "../../../components/common/GradientFormModal";

export default function CreateCustomerModal({ isOpen, onClose, onCreated, initialName = "" }) {
    const toast = useToast();
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({
        name: "",
        address: "",
        phone: "",
        director_name: "",
        inn: "",
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
            const body = {
                name: form.name.trim(),
                address: form.address.trim(),
                phone: form.phone.trim(),
                director_name: form.director_name.trim(),
            };
            const innTrim = form.inn?.trim();
            if (innTrim) body.inn = innTrim;
            const res = await apiLotLocations.createCustomer(body);

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
        <GradientFormModal
            isOpen={isOpen}
            onClose={onClose}
            size="lg"
            title="Yangi buyurtmachi"
            subtitle="Asosiy rekvizitlarni kiriting"
            headerIcon={UserPlus}
            primaryLabel="Yaratish"
            primaryLoading={loading}
            primaryLoadingText="Yaratilmoqda..."
            primaryLeftIcon={<Icon as={Plus} boxSize={4} />}
            onPrimary={handleSubmit}
        >
            <VStack spacing={3} align="stretch">
                <FormControl isRequired>
                    <FormLabel>Nomi</FormLabel>
                    <Input name="name" value={form.name} onChange={handleChange} placeholder="Kenwood" bg="bg" borderRadius="lg" />
                </FormControl>
                <FormControl>
                    <FormLabel>Manzil</FormLabel>
                    <Input name="address" value={form.address} onChange={handleChange} placeholder="Manzil" bg="bg" borderRadius="lg" />
                </FormControl>
                <FormControl>
                    <FormLabel>Telefon</FormLabel>
                    <Input
                        name="phone"
                        value={form.phone}
                        onChange={handleChange}
                        placeholder="+998901234567"
                        bg="bg"
                        borderRadius="lg"
                    />
                </FormControl>
                <FormControl>
                    <FormLabel>Direktor</FormLabel>
                    <Input
                        name="director_name"
                        value={form.director_name}
                        onChange={handleChange}
                        placeholder="F.I.Sh."
                        bg="bg"
                        borderRadius="lg"
                    />
                </FormControl>
                <FormControl>
                    <FormLabel>INN</FormLabel>
                    <Input
                        name="inn"
                        value={form.inn}
                        onChange={handleChange}
                        placeholder="STIR / INN"
                        bg="bg"
                        borderRadius="lg"
                    />
                </FormControl>
            </VStack>
        </GradientFormModal>
    );
}

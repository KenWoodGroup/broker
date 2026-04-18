import { Button, FormControl, FormLabel, Input, Spinner, VStack } from "@chakra-ui/react";
import { Pencil } from "lucide-react";
import { useEffect, useState } from "react";
import { apiLotLocations } from "../../../utils/Controllers/LotLocations";
import TaskModalShell from "../../../components/common/TaskModalShell";

export default function EditCustomerModal({ isOpen, onClose, customerId, onUpdated }) {
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [form, setForm] = useState({
        name: "",
        address: "",
        phone: "",
        inn: "",
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
                    inn: c.inn ?? c.INN ?? "",
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
                inn: form.inn.trim(),
            });
            onUpdated?.();
            onClose?.();
        } finally {
            setSaving(false);
        }
    };

    const titleLine = form.name?.trim() || "Buyurtmachi";

    return (
        <TaskModalShell
            isOpen={isOpen}
            onClose={onClose}
            size="lg"
            title="Buyurtmachini tahrirlash"
            subtitle={titleLine}
            headerIcon={Pencil}
            footer={
                <>
                    <Button variant="ghost" onClick={onClose} isDisabled={saving || loading}>
                        Bekor qilish
                    </Button>
                    <Button
                        colorScheme="blue"
                        onClick={handleSave}
                        isLoading={saving}
                        loadingText="Saqlanmoqda..."
                        isDisabled={loading}
                        borderRadius="xl"
                        px={8}
                    >
                        Saqlash
                    </Button>
                </>
            }
        >
            {loading ? (
                <VStack py={8}>
                    <Spinner size="lg" color="blue.500" />
                </VStack>
            ) : (
                <VStack spacing={3} align="stretch">
                    <FormControl isRequired>
                        <FormLabel>Nomi</FormLabel>
                        <Input name="name" value={form.name} onChange={handleChange} bg="bg" borderRadius="lg" />
                    </FormControl>
                    <FormControl isRequired>
                        <FormLabel>Manzil</FormLabel>
                        <Input name="address" value={form.address} onChange={handleChange} bg="bg" borderRadius="lg" />
                    </FormControl>
                    <FormControl isRequired>
                        <FormLabel>Telefon</FormLabel>
                        <Input name="phone" value={form.phone} onChange={handleChange} bg="bg" borderRadius="lg" />
                    </FormControl>
                    <FormControl>
                        <FormLabel>INN</FormLabel>
                        <Input name="inn" value={form.inn} onChange={handleChange} bg="bg" borderRadius="lg" />
                    </FormControl>
                </VStack>
            )}
        </TaskModalShell>
    );
}

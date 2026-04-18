import {
    FormControl,
    FormLabel,
    Input,
    SimpleGrid,
    useToast,
    Icon,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { Building2, Plus } from "lucide-react";
import { apiLotLocations } from "../../../utils/Controllers/LotLocations";
import GradientFormModal from "../../../components/common/GradientFormModal";

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
            const parentId = (form.parent_id ?? "").trim();
            const payload = {
                type: form.type,
                name: form.name.trim(),
                full_name: form.full_name.trim(),
                address: form.address.trim(),
                phone: form.phone.trim(),
                email: form.email.trim(),
                username: form.username.trim(),
                password: form.password.trim(),
            };
            // Bo'sh string UUID sifatida yuborilmasin (Postgres: invalid input syntax for type uuid)
            if (parentId) {
                payload.parent_id = parentId;
            }

            const res = await apiLotLocations.createCompany(payload);

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
        <GradientFormModal
            isOpen={isOpen}
            onClose={onClose}
            size="xl"
            title="Yangi quruvchi"
            subtitle="Tashkilot va akkaunt ma’lumotlari"
            headerIcon={Building2}
            primaryLabel="Yaratish"
            primaryLoading={loading}
            primaryLoadingText="Yaratilmoqda..."
            primaryLeftIcon={<Icon as={Plus} boxSize={4} />}
            onPrimary={handleSubmit}
        >
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing="12px">
                <FormControl isRequired>
                    <FormLabel>Name</FormLabel>
                    <Input name="name" value={form.name} onChange={handleChange} placeholder="Quruvchi nomi" bg="bg" borderRadius="lg" />
                </FormControl>
                <FormControl isRequired>
                    <FormLabel>Full name</FormLabel>
                    <Input
                        name="full_name"
                        value={form.full_name}
                        onChange={handleChange}
                        placeholder="John Doe"
                        bg="bg"
                        borderRadius="lg"
                    />
                </FormControl>
                <FormControl>
                    <FormLabel>Address</FormLabel>
                    <Input name="address" value={form.address} onChange={handleChange} placeholder="address" bg="bg" borderRadius="lg" />
                </FormControl>
                <FormControl isRequired>
                    <FormLabel>Phone</FormLabel>
                    <Input name="phone" value={form.phone} onChange={handleChange} placeholder="+998901234567" bg="bg" borderRadius="lg" />
                </FormControl>
                <FormControl>
                    <FormLabel>Email</FormLabel>
                    <Input
                        name="email"
                        value={form.email}
                        onChange={handleChange}
                        placeholder="john@gmail.com"
                        bg="bg"
                        borderRadius="lg"
                    />
                </FormControl>
                <FormControl isRequired>
                    <FormLabel>Username</FormLabel>
                    <Input name="username" value={form.username} onChange={handleChange} placeholder="kenwood" bg="bg" borderRadius="lg" />
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
                        borderRadius="lg"
                    />
                </FormControl>
            </SimpleGrid>
        </GradientFormModal>
    );
}

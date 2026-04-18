import {
    Button,
    FormControl,
    FormLabel,
    Input,
    VStack,
    useDisclosure,
    useToast,
} from "@chakra-ui/react";
import { PencilLine } from "lucide-react";
import { useEffect, useState } from "react";
import { apiLocationUsers } from "../../../utils/Controllers/apiLocationUsers";
import TaskModalShell from "../../../components/common/TaskModalShell";

export default function EditLotCreator({ data, refresh }) {
    const { isOpen, onOpen, onClose } = useDisclosure();
    const toast = useToast();
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        full_name: "",
        username: "",
        email: "",
    });

    useEffect(() => {
        if (data && isOpen) {
            setFormData({
                full_name: data.full_name || "",
                username: data.username || "",
                email: data.email || "",
            });
        }
    }, [data, isOpen]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleUpdate = async () => {
        try {
            setLoading(true);
            await apiLocationUsers.Update(formData, data.id);
            toast({
                title: "Yangilandi!",
                description: "Lot yaratuvchi ma’lumotlari yangilandi.",
                status: "success",
                duration: 3000,
                isClosable: true,
            });
            onClose();
            refresh?.();
        } catch (error) {
            toast({
                title: "Xatolik!",
                description: "Yangilashda xatolik yuz berdi.",
                status: "error",
                duration: 3000,
                isClosable: true,
            });
        } finally {
            setLoading(false);
        }
    };

    const subtitle = formData.full_name?.trim() || data?.full_name || "Profil";

    return (
        <>
            <Button size="sm" colorScheme="blue" variant="ghost" onClick={onOpen}>
                <PencilLine size={18} />
            </Button>

            <TaskModalShell
                isOpen={isOpen}
                onClose={onClose}
                title="Lot yaratuvchini tahrirlash"
                subtitle={subtitle}
                headerIcon={PencilLine}
                footer={
                    <>
                        <Button variant="ghost" onClick={onClose} isDisabled={loading}>
                            Bekor qilish
                        </Button>
                        <Button
                            colorScheme="blue"
                            onClick={handleUpdate}
                            isLoading={loading}
                            loadingText="Saqlanmoqda..."
                            borderRadius="xl"
                            px={8}
                        >
                            Saqlash
                        </Button>
                    </>
                }
            >
                <VStack spacing={4} align="stretch">
                    <FormControl isRequired>
                        <FormLabel>To'liq ism</FormLabel>
                        <Input
                            name="full_name"
                            value={formData.full_name}
                            onChange={handleChange}
                            borderRadius="lg"
                        />
                    </FormControl>

                    <FormControl isRequired>
                        <FormLabel>Username</FormLabel>
                        <Input
                            name="username"
                            value={formData.username}
                            onChange={handleChange}
                            borderRadius="lg"
                        />
                    </FormControl>

                    <FormControl>
                        <FormLabel>Email</FormLabel>
                        <Input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            borderRadius="lg"
                        />
                    </FormControl>
                </VStack>
            </TaskModalShell>
        </>
    );
}

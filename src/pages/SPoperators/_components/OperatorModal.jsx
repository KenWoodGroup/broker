import {
    Button,
    FormControl,
    FormLabel,
    Input,
    FormErrorMessage,
    VStack,
} from "@chakra-ui/react";
import { PencilLine, UserPlus } from "lucide-react";
import { useEffect, useState } from "react";
import { apiManagers } from "../../../utils/Controllers/Managers";
import { apiUsers } from "../../../utils/Controllers/Users";
import TaskModalShell from "../../../components/common/TaskModalShell";

export default function OperatorModal({ isOpen, onClose, initialData, reload }) {
    const [loading, setLoading] = useState(false);
    const [validating, setValidating] = useState(false);

    const [form, setForm] = useState({
        full_name: "",
        username: "",
        password: "",
        role: "broker",
    });

    const changeInput = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    useEffect(() => {
        if (!isOpen) return;
        if (initialData) {
            setForm({
                full_name: initialData.full_name ?? "",
                username: initialData.username ?? "",
                password: "",
                role: "broker",
            });
        } else {
            setForm({
                full_name: "",
                username: "",
                password: "",
                role: "broker",
            });
        }
        setValidating(false);
    }, [initialData, isOpen]);

    const addManager = async () => {
        if (!form.full_name || !form.username || !form.password) {
            setValidating(true);
            return;
        }
        try {
            setLoading(true);
            // /api/erp/user talab qiladi: telefon + boshqa role enum; brokerlar /api/user orqali yaratiladi
            const res = await apiUsers.CreateOperator(form);
            if (res.status === 200 || res.status === 201) {
                onClose();
                reload();
                setForm({
                    full_name: "",
                    username: "",
                    password: "",
                    role: "broker",
                });
            }
        } finally {
            setLoading(false);
        }
    };

    const updateManager = async () => {
        try {
            setLoading(true);
            const { password, role, ...payload } = form;
            const res = await apiManagers.Update(payload, initialData?.id);
            if (res.status === 200 || res.status === 201) {
                onClose();
                reload();
                setForm({
                    full_name: "",
                    username: "",
                    password: "",
                    role: "broker",
                });
            }
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = () => {
        if (initialData) {
            updateManager();
        } else {
            addManager();
        }
    };

    const isEdit = Boolean(initialData);
    const title = isEdit ? "Brokerni tahrirlash" : "Yangi broker";
    const subtitle = isEdit
        ? form.full_name?.trim() || initialData?.full_name || "Profil"
        : "To'liq ism, username va parol";
    const HeaderIcon = isEdit ? PencilLine : UserPlus;

    return (
        <TaskModalShell
            isOpen={isOpen}
            onClose={onClose}
            title={title}
            subtitle={subtitle}
            headerIcon={HeaderIcon}
            footer={
                <>
                    <Button variant="ghost" onClick={onClose} isDisabled={loading}>
                        Bekor qilish
                    </Button>
                    <Button
                        isLoading={loading}
                        loadingText="Saqlanmoqda..."
                        colorScheme="blue"
                        onClick={handleSubmit}
                        borderRadius="xl"
                        px={8}
                    >
                        Saqlash
                    </Button>
                </>
            }
        >
            <VStack spacing={4} align="stretch">
                <FormControl isInvalid={!form.full_name && validating} isRequired>
                    <FormLabel>To'liq ism</FormLabel>
                    <Input
                        name="full_name"
                        value={form.full_name}
                        onChange={changeInput}
                        placeholder="Ism"
                        borderRadius="lg"
                    />
                    <FormErrorMessage>Ism kiritilishi shart</FormErrorMessage>
                </FormControl>

                <FormControl isInvalid={!form.username && validating} isRequired>
                    <FormLabel>Username</FormLabel>
                    <Input
                        name="username"
                        value={form.username}
                        onChange={changeInput}
                        placeholder="Username"
                        borderRadius="lg"
                    />
                    <FormErrorMessage>Username kiritilishi shart</FormErrorMessage>
                </FormControl>

                {!isEdit && (
                    <FormControl isInvalid={!form.password && validating} isRequired>
                        <FormLabel>Parol</FormLabel>
                        <Input
                            name="password"
                            type="password"
                            value={form.password}
                            onChange={changeInput}
                            placeholder="Parol"
                            borderRadius="lg"
                        />
                        <FormErrorMessage>Parol kiritilishi shart</FormErrorMessage>
                    </FormControl>
                )}
            </VStack>
        </TaskModalShell>
    );
}

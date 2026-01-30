import {
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    Button,
    FormControl,
    FormLabel,
    Input,
    FormErrorMessage,
    FormHelperText,
    Text,
    Spacer
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { apiManagers } from "../../../utils/Controllers/Managers";


export default function ManagerModal({ isOpen, onClose, initialData, reload }) {
    // UI states
    const [loading, setLoading] = useState(false);
    const [validating, setValidating] = useState(false);

    // form states
    const [form, setForm] = useState({
        full_name: "",
        username: "",
        password: "",
        role: "admin"
    });

    // ---- Functions
    const changeInput = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value })
    };
    useEffect(() => {
        if (initialData) {
            setForm({ ...form, username: initialData?.username, full_name: initialData?.full_name })
        } else {
            setForm({
                full_name: "",
                username: "",
                password: "",
                role: "admin"
            })
        }
    }, [initialData]);

    // POST
    const addManager = async () => {
        if (!form.full_name || !form.username || !form.password) {
            setValidating(true);
            return;
        }
        try {
            setLoading(true)
            const res = await apiManagers.Add(form);
            if (res.status === 200 || res.status === 201) {
                onClose();
                reload();
                setForm({
                    full_name: "",
                    username: "",
                    password: "",
                    role: "admin"
                })
            }
        } finally {
            setLoading(false)
        }
    };
    // PUT
    const updateManager = async () => {
        try {
            setLoading(true);
            const { password, role, ...payload } = form
            const res = await apiManagers.Update(payload, initialData?.id);
            if (res.status === 200 || res.status === 201) {
                onClose();
                reload();
                setForm({
                    full_name: "",
                    username: "",
                    password: "",
                    role: "admin"
                });
            }
        } finally {
            setLoading(false)
        }
    };
    const handleSubmit = () => {
        if (initialData) {
            updateManager()
        } else {
            addManager()
        }
    };


    return (
        <Modal isOpen={isOpen} onClose={onClose} isCentered>
            <ModalOverlay bg="blackAlpha.400" backdropFilter="blur(6px)" />
            <ModalContent>
                <ModalHeader>
                    {initialData ? "Edit manager" : "Add manager"}
                </ModalHeader>

                <ModalBody>
                    <FormControl isInvalid={!form.full_name && validating}>
                        <FormLabel>Full Name</FormLabel>
                        <Input
                            name="full_name"
                            value={form.full_name}
                            onChange={(e) => changeInput(e)}
                            placeholder="Enter name"
                        />
                        <FormErrorMessage>
                            Fullname should be entered
                        </FormErrorMessage>
                    </FormControl>
                    <Spacer h={2}/>
                    <FormControl isInvalid={!form.username && validating}>
                        <FormLabel>Username</FormLabel>
                        <Input
                            name="username"
                            value={form.username}
                            onChange={(e) => changeInput(e)}
                            placeholder="Enter username"
                        />
                        <FormErrorMessage>
                            Username sholud be entered
                        </FormErrorMessage>
                    </FormControl>
                    <Spacer h={2}/>
                    {!initialData &&
                        <FormControl isInvalid={!form.password && validating}>
                            <FormLabel>Password</FormLabel>
                            <Input
                                name="password"
                                value={form.password}
                                onChange={(e) => changeInput(e)}
                                placeholder="Enter password"
                            />
                            <FormErrorMessage>
                                Password should be entered
                            </FormErrorMessage>
                        </FormControl>
                    }
                </ModalBody>

                <ModalFooter>
                    <Button variant="ghost" mr={3} onClick={onClose}>
                        Cancel
                    </Button>

                    <Button
                        isLoading={loading}
                        loadingText="Saqlanmoqda..."
                        colorScheme="blue"
                        onClick={handleSubmit}
                    >
                        Save
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    )
}
import {
    Button,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    ModalCloseButton,
    Input,
    useDisclosure,
    VStack,
    FormControl,
    FormLabel,
    FormErrorMessage,
} from "@chakra-ui/react";
import { Plus } from "lucide-react";
import { useState } from "react";
import { apiLocations } from "../../../utils/Controllers/Locations";

const CreateFactoryButton = ({ onReload }) => {
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [companyName, setCompanyName] = useState("");
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);

    // Errors state
    const [errors, setErrors] = useState({});

    const validate = () => {
        const newErrors = {};

        if (!companyName.trim()) newErrors.companyName = "Company Name is required";
        if (!username.trim()) newErrors.username = "Username is required";
        if (!password) newErrors.password = "Password is required";
        if (!confirmPassword) newErrors.confirmPassword = "Confirm Password is required";
        if (password && confirmPassword && password !== confirmPassword)
            newErrors.confirmPassword = "Passwords do not match";

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleCreate = async () => {
        if (!validate()) return;

        setLoading(true);

        try {
            // POST requestni o'zing yozasan
            /*
            const res = await fetch("/api/factories", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                companyName,
                username,
                password,
              }),
            });
      
            if (!res.ok) throw new Error("Failed");
            */
            let payload = {
                name:companyName,
                username,
                password,   
                type:"factory",
                phone:"+998901234567",
                full_name:username,
                address:"Berilmagan"
            }
            const res = await apiLocations.Add(payload, "Factory")
            onClose();
            setCompanyName("");
            setUsername("");
            setPassword("");
            setConfirmPassword("");
            setErrors({});

            if (onReload) onReload();
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Button
                variant="solidPrimary"
                display="flex"
                alignItems="center"
                gap="3px"
                onClick={onOpen}
            >
                <Plus size="22px" />
                Factory
            </Button>

            <Modal isOpen={isOpen} onClose={onClose} isCentered>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>Create Factory</ModalHeader>
                    <ModalCloseButton />

                    <ModalBody>
                        <VStack spacing={4}>
                            <FormControl isInvalid={!!errors.companyName}>
                                <FormLabel>Company Name</FormLabel>
                                <Input
                                    placeholder="Company Name"
                                    value={companyName}
                                    onChange={(e) => {
                                        setCompanyName(e.target.value);
                                        if (errors.companyName) setErrors(prev => ({ ...prev, companyName: "" }));
                                    }}
                                />
                                <FormErrorMessage>{errors.companyName}</FormErrorMessage>
                            </FormControl>

                            <FormControl isInvalid={!!errors.username}>
                                <FormLabel>Username</FormLabel>
                                <Input
                                    placeholder="Username"
                                    value={username}
                                    onChange={(e) => {
                                        setUsername(e.target.value);
                                        if (errors.username) setErrors(prev => ({ ...prev, username: "" }));
                                    }}
                                />
                                <FormErrorMessage>{errors.username}</FormErrorMessage>
                            </FormControl>

                            <FormControl isInvalid={!!errors.password}>
                                <FormLabel>Password</FormLabel>
                                <Input
                                    type="password"
                                    placeholder="Password"
                                    value={password}
                                    onChange={(e) => {
                                        setPassword(e.target.value);
                                        if (errors.password) setErrors(prev => ({ ...prev, password: "" }));
                                        // match check
                                        if (errors.confirmPassword && confirmPassword && confirmPassword === e.target.value)
                                            setErrors(prev => ({ ...prev, confirmPassword: "" }));
                                    }}
                                />
                                <FormErrorMessage>{errors.password}</FormErrorMessage>
                            </FormControl>

                            <FormControl isInvalid={!!errors.confirmPassword}>
                                <FormLabel>Confirm Password</FormLabel>
                                <Input
                                    type="password"
                                    placeholder="Confirm Password"
                                    value={confirmPassword}
                                    onChange={(e) => {
                                        setConfirmPassword(e.target.value);
                                        if (errors.confirmPassword && password === e.target.value)
                                            setErrors(prev => ({ ...prev, confirmPassword: "" }));
                                    }}
                                />
                                <FormErrorMessage>{errors.confirmPassword}</FormErrorMessage>
                            </FormControl>
                        </VStack>
                    </ModalBody>

                    <ModalFooter>
                        <Button
                            _hover={{bg:"secondary"}}
                            variant="solidPrimary"
                            onClick={handleCreate}
                            isLoading={loading}
                        >
                            Create
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </>
    );
};

export default CreateFactoryButton;

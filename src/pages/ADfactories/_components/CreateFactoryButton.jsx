import {
  Button,
  FormControl,
  FormLabel,
  FormErrorMessage,
  Input,
  useDisclosure,
  VStack,
} from "@chakra-ui/react";
import { Plus, Factory } from "lucide-react";
import { useState } from "react";
import { apiLocations } from "../../../utils/Controllers/Locations";
import TaskModalShell from "../../../components/common/TaskModalShell";

const CreateFactoryButton = ({ onReload, role = "admin" }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [companyName, setCompanyName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);

  const [errors, setErrors] = useState({});

  const validate = () => {
    const newErrors = {};

    if (!companyName.trim()) newErrors.companyName = "Company Name is required";
    if (!username.trim()) newErrors.username = "Username is required";
    if (!phone.trim()) newErrors.phone = "Telefon raqam kiritilmagan";
    if (!password && role === "admin")
      newErrors.password = "Password is required";
    if (!confirmPassword && role === "admin")
      newErrors.confirmPassword = "Confirm Password is required";
    if (
      password &&
      confirmPassword &&
      password !== confirmPassword &&
      role === "admin"
    )
      newErrors.confirmPassword = "Passwords do not match";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCreate = async () => {
    if (!validate()) return;

    setLoading(true);

    try {
      const payload = {
        name: companyName,
        username,
        password: role === "admin" ? password : "usd+8575",
        type: "factory",
        phone: phone,
        full_name: username,
        address: "Berilmagan",
      };
      await apiLocations.Add(payload, "Factory");
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
      <Button colorScheme="blue" leftIcon={<Plus size={18} />} onClick={onOpen}>
        Factory
      </Button>

      <TaskModalShell
        isOpen={isOpen}
        onClose={onClose}
        size="lg"
        title="Yangi zavod"
        subtitle="Zavod nomi va kirish ma’lumotlari"
        headerIcon={Factory}
        footer={
          <>
            <Button variant="ghost" onClick={onClose} isDisabled={loading}>
              Bekor qilish
            </Button>
            <Button
              colorScheme="blue"
              onClick={handleCreate}
              isLoading={loading}
              loadingText="Yaratilmoqda..."
              borderRadius="xl"
              px={8}
            >
              Yaratish
            </Button>
          </>
        }
      >
        <VStack spacing={4} align="stretch">
          <FormControl isInvalid={!!errors.companyName}>
            <FormLabel>Zavod nomi</FormLabel>
            <Input
              placeholder="Zavod nomi"
              value={companyName}
              borderRadius="lg"
              onChange={(e) => {
                setCompanyName(e.target.value);
                if (errors.companyName)
                  setErrors((prev) => ({ ...prev, companyName: "" }));
              }}
            />
            <FormErrorMessage>{errors.companyName}</FormErrorMessage>
          </FormControl>

          <FormControl isInvalid={!!errors.username}>
            <FormLabel>Username</FormLabel>
            <Input
              placeholder="Username"
              value={username}
              borderRadius="lg"
              onChange={(e) => {
                setUsername(e.target.value);
                if (errors.username)
                  setErrors((prev) => ({ ...prev, username: "" }));
              }}
            />
            <FormErrorMessage>{errors.username}</FormErrorMessage>
          </FormControl>
          <FormControl isInvalid={!!errors.phone}>
            <FormLabel>Telefon raqam</FormLabel>
            <Input
              placeholder="+998901234567"
              value={phone}
              borderRadius="lg"
              onChange={(e) => {
                setPhone(e.target.value);
                if (errors.phone) setErrors((prev) => ({ ...prev, phone: "" }));
              }}
            />
            <FormErrorMessage>{errors.phone}</FormErrorMessage>
          </FormControl>
          {/* {role === "admin" && (
            <FormControl isInvalid={!!errors.password}>
              <FormLabel>Parol</FormLabel>
              <Input
                type="password"
                placeholder="Parol"
                value={password}
                borderRadius="lg"
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errors.password)
                    setErrors((prev) => ({ ...prev, password: "" }));
                  if (
                    errors.confirmPassword &&
                    confirmPassword &&
                    confirmPassword === e.target.value
                  )
                    setErrors((prev) => ({ ...prev, confirmPassword: "" }));
                }}
              />
              <FormErrorMessage>{errors.password}</FormErrorMessage>
            </FormControl>
          )} */}
          {/* {role === "admin" && (
            <FormControl isInvalid={!!errors.confirmPassword}>
              <FormLabel>Parolni tasdiqlang</FormLabel>
              <Input
                type="password"
                placeholder="Parolni qayta kiriting"
                value={confirmPassword}
                borderRadius="lg"
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  if (errors.confirmPassword && password === e.target.value)
                    setErrors((prev) => ({ ...prev, confirmPassword: "" }));
                }}
              />
              <FormErrorMessage>{errors.confirmPassword}</FormErrorMessage>
            </FormControl>
          )} */}
        </VStack>
      </TaskModalShell>
    </>
  );
};

export default CreateFactoryButton;

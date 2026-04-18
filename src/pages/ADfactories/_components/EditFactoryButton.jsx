import {
  IconButton,
  FormControl,
  FormLabel,
  FormErrorMessage,
  Input,
  useDisclosure,
  VStack,
  Button,
} from "@chakra-ui/react";
import { Pencil } from "lucide-react";
import { useState, useEffect } from "react";
import { apiLocations } from "../../../utils/Controllers/Locations";
import TaskModalShell from "../../../components/common/TaskModalShell";

const EditFactoryButton = ({ factoryId, initialData, onReload }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();

  const [factoryName, setFactoryName] = useState("");
  const [tel, setTel] = useState("");
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(false);

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isOpen && initialData) {
      setFactoryName(initialData.name || "");
      setTel(initialData.phone || "");
      setAddress(initialData.address || "");
      setErrors({});
    }
  }, [isOpen, initialData]);

  const validate = () => {
    const newErrors = {};
    if (!factoryName.trim()) newErrors.factoryName = "Factory Name is required";
    if (!tel.trim()) newErrors.tel = "Tel is required";
    if (!address.trim()) newErrors.address = "Address is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleEdit = async () => {
    if (!validate()) return;

    setLoading(true);

    try {
      const payload = {
        name: factoryName,
        phone: tel,
        address
      };
      await apiLocations.Update(payload, factoryId, "Factory");
      onClose();
      if (onReload) onReload();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const subtitle = factoryName?.trim() || "Zavod ma’lumotlari";

  return (
    <>
      <IconButton
        size="sm"
        variant="ghost"
        icon={<Pencil size={16} />}
        onClick={(e)=> {
          e.stopPropagation();
          onOpen()
        }}
        aria-label="Edit"
      />

      <TaskModalShell
        isOpen={isOpen}
        onClose={onClose}
        size="lg"
        title="Zavodni tahrirlash"
        subtitle={subtitle}
        headerIcon={Pencil}
        footer={
          <>
            <Button variant="ghost" onClick={onClose} isDisabled={loading}>
              Bekor qilish
            </Button>
            <Button
              colorScheme="blue"
              onClick={handleEdit}
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
          <FormControl isInvalid={!!errors.factoryName}>
            <FormLabel>Zavod nomi</FormLabel>
            <Input
              value={factoryName}
              borderRadius="lg"
              onChange={(e) => {
                setFactoryName(e.target.value);
                if (errors.factoryName) setErrors(prev => ({ ...prev, factoryName: "" }));
              }}
            />
            <FormErrorMessage>{errors.factoryName}</FormErrorMessage>
          </FormControl>

          <FormControl isInvalid={!!errors.tel}>
            <FormLabel>Telefon</FormLabel>
            <Input
              value={tel}
              borderRadius="lg"
              onChange={(e) => {
                setTel(e.target.value);
                if (errors.tel) setErrors(prev => ({ ...prev, tel: "" }));
              }}
            />
            <FormErrorMessage>{errors.tel}</FormErrorMessage>
          </FormControl>

          <FormControl isInvalid={!!errors.address}>
            <FormLabel>Manzil</FormLabel>
            <Input
              value={address}
              borderRadius="lg"
              onChange={(e) => {
                setAddress(e.target.value);
                if (errors.address) setErrors(prev => ({ ...prev, address: "" }));
              }}
            />
            <FormErrorMessage>{errors.address}</FormErrorMessage>
          </FormControl>
        </VStack>
      </TaskModalShell>
    </>
  );
};

export default EditFactoryButton;

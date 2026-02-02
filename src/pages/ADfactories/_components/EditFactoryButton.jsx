import {
  IconButton,
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
  Button,
} from "@chakra-ui/react";
import { Pencil } from "lucide-react";
import { useState, useEffect } from "react";
import { apiLocations } from "../../../utils/Controllers/Locations";

const EditFactoryButton = ({ factoryId, initialData, onReload }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();

  const [factoryName, setFactoryName] = useState("");
  const [tel, setTel] = useState("");
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(false);

  const [errors, setErrors] = useState({});

  // Auto-fill inputs when modal opens
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
      }
      const res = await apiLocations.Update(payload, factoryId, "Factory")
      onClose();
      if (onReload) onReload();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

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

      <Modal isOpen={isOpen} onClose={onClose} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Edit Factory</ModalHeader>
          <ModalCloseButton />

          <ModalBody>
            <VStack spacing={4}>
              <FormControl isInvalid={!!errors.factoryName}>
                <FormLabel>Factory Name</FormLabel>
                <Input
                  value={factoryName}
                  onChange={(e) => {
                    setFactoryName(e.target.value);
                    if (errors.factoryName) setErrors(prev => ({ ...prev, factoryName: "" }));
                  }}
                />
                <FormErrorMessage>{errors.factoryName}</FormErrorMessage>
              </FormControl>

              <FormControl isInvalid={!!errors.tel}>
                <FormLabel>Tel</FormLabel>
                <Input
                  value={tel}
                  onChange={(e) => {
                    setTel(e.target.value);
                    if (errors.tel) setErrors(prev => ({ ...prev, tel: "" }));
                  }}
                />
                <FormErrorMessage>{errors.tel}</FormErrorMessage>
              </FormControl>

              <FormControl isInvalid={!!errors.address}>
                <FormLabel>Address</FormLabel>
                <Input
                  value={address}
                  onChange={(e) => {
                    setAddress(e.target.value);
                    if (errors.address) setErrors(prev => ({ ...prev, address: "" }));
                  }}
                />
                <FormErrorMessage>{errors.address}</FormErrorMessage>
              </FormControl>
            </VStack>
          </ModalBody>

          <ModalFooter>
            <Button
              _hover={{bg:"secondary"}}
              variant="solidPrimary"
              onClick={handleEdit}
              isLoading={loading}
            >
              Save
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default EditFactoryButton;

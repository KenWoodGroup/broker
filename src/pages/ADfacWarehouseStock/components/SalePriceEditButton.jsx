import React, { useState, useEffect } from "react";
import {
    IconButton,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    ModalCloseButton,
    Button,
    FormControl,
    FormLabel,
    Input,
    Select,
    HStack,
    useToast
} from "@chakra-ui/react";
import { EditIcon } from "@chakra-ui/icons";
import { apiStock } from "../../../utils/Controllers/apiStock";

// Props:
// salePriceTypes: array, onSave(newPrice, typeId)
export default function SalePriceEditButton({ salePriceTypes = [], onSave }) {
    const toast = useToast();

    const [isOpen, setIsOpen] = useState(false);
    const [selectedTypeId, setSelectedTypeId] = useState("");
    const [oldPrice, setOldPrice] = useState("");
    const [newPrice, setNewPrice] = useState("");
    const [saving, setSaving] = useState(false);

    // open modal
    const openModal = () => setIsOpen(true);
    const closeModal = () => setIsOpen(false);

    // Reset modal state when opened
    useEffect(() => {
        if (isOpen) {
            setSelectedTypeId("");
            setOldPrice("");
            setNewPrice("");
        }
    }, [isOpen]);

    // Update oldPrice whenever selectedTypeId changes
    useEffect(() => {
        const selected = salePriceTypes.find(sp => sp.price_type.id === selectedTypeId);
        setOldPrice(selected ? selected.sale_price : "");
        setNewPrice(selected ? selected.sale_price : "");
    }, [selectedTypeId, salePriceTypes]);

    const handleSave =  async () => {
        if (!selectedTypeId || !newPrice) {
            toast({
                title: "Error",
                description: "Please select price type and enter a new price",
                status: "error",
                duration: 3000,
                isClosable: true
            });
            return;
        };

        setSaving(true);
        try {
            const id = salePriceTypes?.find((item)=> item?.price_type?.id === selectedTypeId)?.id;
            const payload = {
                sale_price: +newPrice
            }
            await apiStock.UpdateSalePrice(id, payload);
            onSave()
        }finally {
            setSaving(false)
        }
        closeModal();
    };

    return (
        <>
            <IconButton
                icon={<EditIcon />}
                size="sm"
                colorScheme="blue"
                variant="ghost"
                aria-label="Edit Sale Price"
                onClick={openModal}
            />

            <Modal isOpen={isOpen} onClose={closeModal} isCentered>
                <ModalOverlay />
                <ModalContent borderRadius="12px" p="4">
                    <ModalHeader>Sotuv narxini tahrirlash</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <FormControl mb={4}>
                            <FormLabel>Price Type</FormLabel>
                            <Select
                                placeholder="Select price type"
                                value={selectedTypeId}
                                onChange={(e) => setSelectedTypeId(e.target.value)}
                            >
                                {salePriceTypes.map(sp => (
                                    <option key={sp.id} value={sp.price_type.id}>
                                        {sp.price_type.name}
                                    </option>
                                ))}
                            </Select>
                        </FormControl>

                        <FormControl mb={4}>
                            <FormLabel>Eski narx</FormLabel>
                            <Input value={oldPrice} isReadOnly />
                        </FormControl>

                        <FormControl mb={4}>
                            <FormLabel>Yangi narx</FormLabel>
                            <Input
                                type="number"
                                value={newPrice}
                                onChange={(e) => setNewPrice(e.target.value)}
                                placeholder="Enter new price"
                            />
                        </FormControl>
                    </ModalBody>

                    <ModalFooter>
                        <HStack spacing={3}>
                            <Button variant="ghost" onClick={closeModal}>
                                Bekor qilish
                            </Button>
                            <Button 
                                isLoading={saving}
                                loadingText="Saqlanmoqda..."
                                colorScheme="blue" onClick={handleSave}
                            >
                                Saqlash
                            </Button>
                        </HStack>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </>
    );
}
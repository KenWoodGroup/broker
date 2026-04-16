import {
    Button,
    Modal,
    ModalBody,
    ModalCloseButton,
    ModalContent,
    ModalFooter,
    ModalHeader,
    ModalOverlay,
    Text,
    VStack,
} from "@chakra-ui/react";
import { useState } from "react";
import { apiLotLocations } from "../../../utils/Controllers/LotLocations";

export default function DeleteCustomerModal({ isOpen, onClose, customer, onDeleted }) {
    const [loading, setLoading] = useState(false);

    const handleDelete = async () => {
        if (!customer?.id) return;
        try {
            setLoading(true);
            await apiLotLocations.delete(customer.id);
            onDeleted?.();
            onClose?.();
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} isCentered size="lg">
            <ModalOverlay />
            <ModalContent bg="surface" borderColor="border">
                <ModalHeader>Buyurtmachini o‘chirish</ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                    <VStack align="stretch" spacing="10px">
                        <Text>Haqiqatan ham ushbu buyurtmachini o‘chirmoqchimisiz?</Text>
                        <Text fontWeight="600">{customer?.name ?? "Customer"}</Text>
                        <Text fontSize="sm" color="textSub">
                            Bu amalni ortga qaytarib bo‘lmaydi.
                        </Text>
                    </VStack>
                </ModalBody>
                <ModalFooter>
                    <Button variant="ghost" mr={3} onClick={onClose}>
                        Bekor qilish
                    </Button>
                    <Button colorScheme="red" onClick={handleDelete} isLoading={loading}>
                        O‘chirish
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
}


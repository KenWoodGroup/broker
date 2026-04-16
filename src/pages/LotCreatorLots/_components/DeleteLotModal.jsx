import {
    Button,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalCloseButton,
    ModalBody,
    ModalFooter,
    Text,
    VStack,
} from "@chakra-ui/react";
import { useState } from "react";
import { apiLots } from "../../../utils/Controllers/Lots";

export default function DeleteLotModal({ isOpen, onClose, lot, onDeleted }) {
    const [loading, setLoading] = useState(false);

    const handleDelete = async () => {
        if (!lot?.id) return;
        try {
            setLoading(true);
            await apiLots.delete(lot.id);
            onDeleted?.();
            onClose?.();
        } finally {
            setLoading(false);
        }
    };

    const title = lot?.lot_name ?? lot?.name ?? lot?.title ?? `Lot #${lot?.id ?? ""}`;

    return (
        <Modal isOpen={isOpen} onClose={onClose} isCentered size="lg">
            <ModalOverlay />
            <ModalContent bg="surface" borderColor="border">
                <ModalHeader>Lotni o‘chirish</ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                    <VStack align="stretch" spacing="10px">
                        <Text>
                            Haqiqatan ham ushbu lotni o‘chirmoqchimisiz?
                        </Text>
                        <Text fontWeight="600">{title}</Text>
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


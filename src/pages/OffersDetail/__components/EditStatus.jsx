import { useState } from "react";
import {
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalFooter,
    ModalBody,
    ModalCloseButton,
    Button,
    Text,
    useToast,
    VStack,
} from "@chakra-ui/react";
import { apiOffers } from "../../../utils/Controllers/Offers";
import { useNavigate } from "react-router";

export default function EditStatus({ id, text, refresh }) {
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const toast = useToast();
    const navigate = useNavigate();

    const onOpen = () => setIsOpen(true);
    const onClose = () => setIsOpen(false);

    const handleCancel = async () => {
        setLoading(true);
        try {
            await apiOffers.UpdateStatus(id, { status: "cancelled" });
            toast({ title: "Buyurtma bekor qilindi", status: "success" });
            onClose();
            if (refresh) refresh();
            navigate(-1);
        } catch (err) {
            toast({ title: "Xatolik", description: "Bekor qilishda xatolik", status: "error" });
        } finally {
            setLoading(false);
        }
    };

    const handleNext = async () => {
        setLoading(true);
        try {
            await apiOffers.UpdateStatus(id, { status: "contract_ready" });
            toast({ title: "Holat o‘zgartirildi", status: "success" });
            onClose();
            if (refresh) refresh();
        } catch (err) {
            toast({ title: "Xatolik", description: "Holat o‘zgartirilmadi", status: "error" });
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Button variant="outline" size="sm" onClick={onOpen}>
                O'zgartirish
            </Button>
            <Modal isOpen={isOpen} onClose={onClose} isCentered>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>Harakatni tanlang</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <Text mb={4}>{text || "Quyidagi harakatlardan birini tanlang:"}</Text>
                        <VStack spacing={3} align="stretch">
                            <Button colorScheme="red" onClick={handleCancel} isLoading={loading} isDisabled={loading}>
                                Bekor qilish
                            </Button>
                            <Button colorScheme="green" onClick={handleNext} isLoading={loading} isDisabled={loading}>
                                Keyingi bosqichga o‘tkazish
                            </Button>
                        </VStack>
                    </ModalBody>
                    <ModalFooter>
                        <Button variant="ghost" onClick={onClose} isDisabled={loading}>
                            Yopish
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </>
    );
}
import {
    Button,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    ModalCloseButton,
    Text,
    useDisclosure,
    useToast,
} from "@chakra-ui/react";
import { Trash } from "lucide-react";
import { useState } from "react";
import { apiLocationUsers } from "../../../utils/Controllers/apiLocationUsers";

export default function DeleteLotCreator({ id, refresh }) {
    const { isOpen, onOpen, onClose } = useDisclosure();
    const toast = useToast();
    const [loading, setLoading] = useState(false);

    const handleDelete = async () => {
        try {
            setLoading(true);
            await apiLocationUsers.Delete(id);
            toast({
                title: "O‘chirildi!",
                description: "Lot creator muvaffaqiyatli o‘chirildi.",
                status: "success",
                duration: 3000,
                isClosable: true,
            });
            onClose();
            refresh?.();
        } catch (error) {
            toast({
                title: "Xatolik!",
                description: "Lot creatorni o‘chirishda xatolik yuz berdi.",
                status: "error",
                duration: 3000,
                isClosable: true,
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Button size="sm" colorScheme="red" variant="ghost" onClick={onOpen}>
                <Trash size={18} />
            </Button>

            <Modal isOpen={isOpen} onClose={onClose} isCentered>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>Lot creatorni o‘chirish</ModalHeader>
                    <ModalCloseButton />

                    <ModalBody>
                        <Text>
                            Haqiqatan ham ushbu lot creatorni o‘chirmoqchimisiz? Bu amalni ortga qaytarib bo‘lmaydi.
                        </Text>
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
        </>
    );
}


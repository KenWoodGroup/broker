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

export default function EditStatus({ id, text, refresh, status }) {
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const toast = useToast();
    const navigate = useNavigate()

    const onOpen = () => setIsOpen(true);
    const onClose = () => setIsOpen(false);

    const PutStatus = async () => {
        try {
            setLoading(true);
            const data = {
                status: status
            };
            const response = await apiOffers?.UpdateStatus(data, id);
            toast({
                title: "Muvaffaqiyatli",
                description: "Holat muvaffaqiyatli o'zgartirildi",
                status: "success",
                duration: 3000,
                isClosable: true,
            });
            onClose();
            if (refresh) refresh();
            navigate('/call-operator/orders')
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            {/* Button to open modal */}
            <Button
                variant="outline"
                size="sm"
                onClick={onOpen}
            >
                O'zgartirish
            </Button>

            {/* Modal */}
            <Modal isOpen={isOpen} onClose={onClose} isCentered>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>
                        Holatni o'zgartirish
                    </ModalHeader>
                    <ModalCloseButton />

                    <ModalBody>
                        <VStack spacing={3} align="stretch">
                            <Text>
                                Holatni o'zgartirmoqchimisiz?
                            </Text>
                        </VStack>
                    </ModalBody>

                    <ModalFooter>
                        <Button
                            variant="ghost"
                            onClick={onClose}
                            isDisabled={loading}
                            mr={3}
                        >
                            Yo'q
                        </Button>
                        <Button
                            onClick={PutStatus}
                            isLoading={loading}
                            loadingText="Saqlanmoqda..."
                            variant="solid"
                        >
                            Ha
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </>
    );
}
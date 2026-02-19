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
    useToast
} from "@chakra-ui/react"
import { Trash } from "lucide-react"
import { useState } from "react"
import { apiUsers } from "../../../utils/Controllers/Users"

export default function DeleteOperator({ id, refresh }) {
    const { isOpen, onOpen, onClose } = useDisclosure()
    const toast = useToast()
    const [loading, setLoading] = useState(false)

    const handleDelete = async () => {
        try {
            setLoading(true)
            await apiUsers.Delete(id)

            toast({
                title: "O‘chirildi!",
                description: "Operator muvaffaqiyatli o‘chirildi.",
                status: "success",
                duration: 3000,
                isClosable: true
            })

            onClose()
            if (refresh) refresh()

        } catch (error) {
            toast({
                title: "Xatolik!",
                description: "Operatorni o‘chirishda xatolik yuz berdi.",
                status: "error",
                duration: 3000,
                isClosable: true
            })
        } finally {
            setLoading(false)
        }
    }

    return (
        <>
            {/* Delete Button */}
            <Button
                size="sm"
                colorScheme="red"
                variant="ghost"
                onClick={onOpen}
            >
                <Trash size={18} />
            </Button>

            {/* Modal */}
            <Modal isOpen={isOpen} onClose={onClose} isCentered>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>Operatorni o‘chirish</ModalHeader>
                    <ModalCloseButton />

                    <ModalBody>
                        <Text>
                            Haqiqatan ham ushbu operatorni o‘chirmoqchimisiz?
                            Bu amalni ortga qaytarib bo‘lmaydi.
                        </Text>
                    </ModalBody>

                    <ModalFooter>
                        <Button variant="ghost" mr={3} onClick={onClose}>
                            Bekor qilish
                        </Button>
                        <Button
                            colorScheme="red"
                            onClick={handleDelete}
                            isLoading={loading}
                        >
                            O‘chirish
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </>
    )
}

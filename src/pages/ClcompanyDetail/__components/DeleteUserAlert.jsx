import {
    AlertDialog,
    AlertDialogBody,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogContent,
    AlertDialogOverlay,
    Button,
    useToast
} from "@chakra-ui/react"
import { useRef, useState } from "react"
import { apiLocationUsers } from "../../../utils/Controllers/apiLocationUsers"

export default function DeleteUserAlert({ isOpen, onClose, user, onSuccess }) {
    const cancelRef = useRef()
    const toast = useToast()
    const [loading, setLoading] = useState(false)

    const handleDeleteConfirm = async () => {
        if (!user) return
        try {
            setLoading(true)
            await apiLocationUsers.Delete(user.id)
            onSuccess()
            onClose()
        } catch (error) {
            console.error("Delete error:", error)
            toast({
                title: "Xatolik",
                description: "O'chirishda xatolik yuz berdi",
                status: "error",
                duration: 3000,
                isClosable: true
            })
        } finally {
            setLoading(false)
        }
    }

    return (
        <AlertDialog
            isOpen={isOpen}
            leastDestructiveRef={cancelRef}
            onClose={onClose}
        >
            <AlertDialogOverlay>
                <AlertDialogContent>
                    <AlertDialogHeader fontSize="lg" fontWeight="bold">
                        Foydalanuvchini o'chirish
                    </AlertDialogHeader>

                    <AlertDialogBody>
                        Haqiqatan ham <b>{user?.full_name}</b> foydalanuvchisini o'chirmoqchimisiz? Bu amalni ortga qaytarib bo'lmaydi.
                    </AlertDialogBody>

                    <AlertDialogFooter>
                        <Button ref={cancelRef} onClick={onClose} isDisabled={loading}>
                            Bekor qilish
                        </Button>
                        <Button colorScheme="red" onClick={handleDeleteConfirm} ml={3} isLoading={loading}>
                            O'chirish
                        </Button>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialogOverlay>
        </AlertDialog>
    )
}

import {
    AlertDialog,
    AlertDialogBody,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogContent,
    AlertDialogOverlay,
    Button,
} from "@chakra-ui/react"
import { useRef, useState } from "react"
import { apiLocations } from "../../../utils/Controllers/Locations"

export default function DeleteSiteModal({ isOpen, onClose, site, onSuccess }) {
    const cancelRef = useRef()
    const [deleteLoading, setDeleteLoading] = useState(false)

    const confirmDelete = async () => {
        if (!site) return
        setDeleteLoading(true)
        try {
            await apiLocations.DeleteLocation(site.id)
            onSuccess()
            onClose()
        } catch (error) {
            console.error("Error deleting site:", error)
        } finally {
            setDeleteLoading(false)
        }
    }

    return (
        <AlertDialog
            isOpen={isOpen}
            leastDestructiveRef={cancelRef}
            onClose={onClose}
            isCentered
        >
            <AlertDialogOverlay backdropFilter="blur(4px)">
                <AlertDialogContent borderRadius="xl">
                    <AlertDialogHeader fontSize="lg" fontWeight="bold">
                        Obyektni o'chirish
                    </AlertDialogHeader>

                    <AlertDialogBody>
                        Haqiqatan ham "<strong>{site?.name}</strong>" obyektini o'chirib tashlamoqchimisiz? Bu amalni ortga qaytarib bo'lmaydi.
                    </AlertDialogBody>

                    <AlertDialogFooter>
                        <Button ref={cancelRef} onClick={onClose} borderRadius="lg">
                            Bekor qilish
                        </Button>
                        <Button colorScheme="red" onClick={confirmDelete} ml={3} isLoading={deleteLoading} borderRadius="lg">
                            O'chirish
                        </Button>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialogOverlay>
        </AlertDialog>
    )
}

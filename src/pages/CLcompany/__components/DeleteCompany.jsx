import {
    IconButton,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalFooter,
    ModalBody,
    ModalCloseButton,
    Button,
    Text,
    useDisclosure,
    useToast,
    Tooltip
} from "@chakra-ui/react"
import { Trash2 } from "lucide-react"
import { useState } from "react"
import { apiLocations } from "../../../utils/Controllers/Locations"

export default function DeleteCompany({ companyId, companyName, refresh }) {
    const { isOpen, onOpen, onClose } = useDisclosure()
    const [loading, setLoading] = useState(false)
    const toast = useToast()

    const handleDelete = async (e) => {
        e.stopPropagation() // Prevent row click event
        try {
            setLoading(true)
            await apiLocations.Delete(companyId, "Company")

            toast({
                title: "Muvaffaqiyatli!",
                description: "Kompaniya o'chirildi.",
                status: "success",
                duration: 3000,
                isClosable: true
            })

            onClose()
            refresh && refresh()
        } catch (error) {
            console.error(error)
            toast({
                title: "Xatolik!",
                description: "O'chirishda xatolik yuz berdi.",
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
            <Tooltip label="O'chirish">
                <IconButton
                    icon={<Trash2 size={18} />}
                    colorScheme="red"
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                        e.stopPropagation()
                        onOpen()
                    }}
                    aria-label="Delete company"
                />
            </Tooltip>

            <Modal isOpen={isOpen} onClose={onClose} isCentered>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>O'chirishni tasdiqlash</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <Text>
                            Haqiqatan ham <b>{companyName}</b> kompaniyasini o'chirib tashlamoqchimisiz?
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
                            O'chirish
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </>
    )
}

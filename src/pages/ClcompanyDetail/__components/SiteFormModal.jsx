import {
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalFooter,
    ModalBody,
    ModalCloseButton,
    Button,
    FormControl,
    FormLabel,
    Input,
    VStack,
    useToast
} from "@chakra-ui/react"
import { useEffect, useState } from "react"
import { apiLocations } from "../../../utils/Controllers/Locations"

export default function SiteFormModal({ isOpen, onClose, companyId, site, onSuccess }) {
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState({
        name: "",
        address: "",
        director_name: "",
        phone: '+998',
        type: "construction_site",
        parent_id: companyId
    })
    const toast = useToast()

    useEffect(() => {
        if (site) {
            setFormData({
                name: site.name || "",
                address: site.address || "",
                phone: site.phone || "+998",
                type: "construction_site",
                director_name: "",
                parent_id: companyId
            })
        } 
    }, [site, companyId, isOpen])

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        try {
            if (site) {
                await apiLocations.UpdateLocation(site.id, formData)
            } else {
                await apiLocations.CreateConstructionSite(formData)
            }
            onSuccess()
            onClose()
        } catch (error) {
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <Modal isOpen={isOpen} onClose={onClose} isCentered>
            <ModalOverlay backdropFilter="blur(4px)" />
            <ModalContent borderRadius="xl">
                <ModalHeader>{site ? "Obyektni tahrirlash" : "Yangi obyekt qo'shish"}</ModalHeader>
                <ModalCloseButton />
                <form onSubmit={handleSubmit}>
                    <ModalBody>
                        <VStack spacing={4}>
                            <FormControl isRequired>
                                <FormLabel>Nomi</FormLabel>
                                <Input
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    placeholder="Obyekt nomi"
                                    borderRadius="lg"
                                />
                            </FormControl>
                            <FormControl isRequired>
                                <FormLabel>Ismi</FormLabel>
                                <Input
                                    name="director_name"
                                    value={formData.director_name}
                                    onChange={handleChange}
                                    placeholder="Obyekt nomi"
                                    borderRadius="lg"
                                />
                            </FormControl>
                            <FormControl isRequired>
                                <FormLabel>Telefon raqam</FormLabel>
                                <Input
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    placeholder="Obyekt telefon raqami"
                                    borderRadius="lg"
                                />
                            </FormControl>
                            <FormControl>
                                <FormLabel>Manzil</FormLabel>
                                <Input
                                    name="address"
                                    value={formData.address}
                                    onChange={handleChange}
                                    placeholder="Obyekt manzili"
                                    borderRadius="lg"
                                />
                            </FormControl>
                        </VStack>
                    </ModalBody>

                    <ModalFooter>
                        <Button variant="ghost" mr={3} onClick={onClose} borderRadius="lg">
                            Bekor qilish
                        </Button>
                        <Button
                            colorScheme="blue"
                            type="submit"
                            isLoading={loading}
                            borderRadius="lg"
                        >
                            Saqlash
                        </Button>
                    </ModalFooter>
                </form>
            </ModalContent>
        </Modal>
    )
}

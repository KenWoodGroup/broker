import { useState, useEffect } from "react"
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
    SimpleGrid,
    useToast
} from "@chakra-ui/react"
import { apiCompanyDetail } from "../../../utils/Controllers/apiCompanyDetail"

export default function CompanyDetailEditModal({ isOpen, onClose, data, companyId, onSuccess }) {
    const detail = data?.company_detail || {}
    const detailId = detail?.id

    const [formData, setFormData] = useState({
        location_id: companyId || "",
        founded_year: "",
        inn: "",
        direction: "",
        director_name: "",
        legal_address: "",
        bank_name: "",
        bank_address: "",
        account_number: "",
        mfo: "",
        stir: "",
        oked: ""
    })
    
    const [loading, setLoading] = useState(false)
    const toast = useToast()

    useEffect(() => {
        if (isOpen) {
            setFormData({
                location_id: companyId || "",
                founded_year: detail.founded_year || "",
                inn: detail.inn || "",
                direction: detail.direction || "",
                director_name: detail.director_name || "",
                legal_address: detail.legal_address || "",
                bank_name: detail.bank_name || "",
                bank_address: detail.bank_address || "",
                account_number: detail.account_number || "",
                mfo: detail.mfo || "",
                stir: detail.stir || "",
                oked: detail.oked || ""
            })
        }
    }, [data, companyId, isOpen])

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({ 
            ...prev, 
            [name]: name === "founded_year" && value ? parseInt(value) : value 
        }))
    }

    const handleSubmit = async () => {
        setLoading(true)
        try {
            await apiCompanyDetail.Update(formData, detailId)
            onSuccess() 
            onClose()
        } catch (error) {
            console.error("Update error:", error)
            toast({
                title: "Xatolik yuz berdi",
                description: error.response?.data?.message || "Kompaniya ma'lumotlarini tahrirlashda xatolik yuz berdi",
                status: "error",
                duration: 3000,
                isClosable: true,
            })
        } finally {
            setLoading(false)
        }
    }

    return (
        <Modal isOpen={isOpen} onClose={onClose} size="2xl">
            <ModalOverlay />
            <ModalContent>
                <ModalHeader>Batafsil ma'lumotlarni tahrirlash</ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                    <VStack spacing={4} align="stretch">
                        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                            <FormControl>
                                <FormLabel>Direktor nomi</FormLabel>
                                <Input 
                                    name="director_name"
                                    value={formData.director_name}
                                    onChange={handleChange}
                                />
                            </FormControl>

                            <FormControl>
                                <FormLabel>Tashkil etilgan yil</FormLabel>
                                <Input 
                                    name="founded_year"
                                    type="number"
                                    value={formData.founded_year}
                                    onChange={handleChange}
                                />
                            </FormControl>

                            <FormControl>
                                <FormLabel>Faoliyat yo'nalishi</FormLabel>
                                <Input 
                                    name="direction"
                                    value={formData.direction}
                                    onChange={handleChange}
                                />
                            </FormControl>

                            <FormControl>
                                <FormLabel>Yuridik manzil</FormLabel>
                                <Input 
                                    name="legal_address"
                                    value={formData.legal_address}
                                    onChange={handleChange}
                                />
                            </FormControl>

                            <FormControl>
                                <FormLabel>INN</FormLabel>
                                <Input 
                                    name="inn"
                                    value={formData.inn}
                                    onChange={handleChange}
                                />
                            </FormControl>

                            <FormControl>
                                <FormLabel>STIR</FormLabel>
                                <Input 
                                    name="stir"
                                    value={formData.stir}
                                    onChange={handleChange}
                                />
                            </FormControl>

                            <FormControl>
                                <FormLabel>Bank nomi</FormLabel>
                                <Input 
                                    name="bank_name"
                                    value={formData.bank_name}
                                    onChange={handleChange}
                                />
                            </FormControl>

                            <FormControl>
                                <FormLabel>Bank manzili</FormLabel>
                                <Input 
                                    name="bank_address"
                                    value={formData.bank_address}
                                    onChange={handleChange}
                                />
                            </FormControl>

                            <FormControl>
                                <FormLabel>Hisob raqami</FormLabel>
                                <Input 
                                    name="account_number"
                                    value={formData.account_number}
                                    onChange={handleChange}
                                />
                            </FormControl>

                            <FormControl>
                                <FormLabel>MFO</FormLabel>
                                <Input 
                                    name="mfo"
                                    value={formData.mfo}
                                    onChange={handleChange}
                                />
                            </FormControl>

                            <FormControl>
                                <FormLabel>OKED</FormLabel>
                                <Input 
                                    name="oked"
                                    value={formData.oked}
                                    onChange={handleChange}
                                />
                            </FormControl>
                        </SimpleGrid>
                    </VStack>
                </ModalBody>

                <ModalFooter>
                    <Button variant="ghost" mr={3} onClick={onClose} isDisabled={loading}>
                        Bekor qilish
                    </Button>
                    <Button 
                        colorScheme="blue" 
                        onClick={handleSubmit}
                        isLoading={loading}
                    >
                        Saqlash
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    )
}

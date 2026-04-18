import {
    Button,
    FormControl,
    FormLabel,
    Input,
    Select,
    SimpleGrid,
    useDisclosure,
    useToast,
    Divider,
    Text,
} from "@chakra-ui/react"
import { Building2 } from "lucide-react"
import { useState } from "react"
import { apiLocations } from "../../../utils/Controllers/Locations"
import { apiCompanyDetail } from "../../../utils/Controllers/apiCompanyDetail"
import TaskModalShell from "../../../components/common/TaskModalShell"

export default function CreateCompany({ refresh }) {
    const { isOpen, onOpen, onClose } = useDisclosure()
    const toast = useToast()
    const [loading, setLoading] = useState(false)
    const [detail, setDetail] = useState({
        location_id: "",
        founded_year: null,
        direction: "",
        legal_address: "",
        bank_name: "",
        bank_address: "",
        account_number: "",
        mfo: "",
        oked: ""
    })
    const [formData, setFormData] = useState({
        type: "company",
        name: "",
        full_name: "",
        address: "",
        phone: "",
        email: "",
        username: "",
        password: "",
        director_name: "",
        inn: ""
    })

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData((prev) => ({
            ...prev,
            [name]: value
        }))
    }

    const handleChangeDetail = (e) => {
        const { name, value } = e.target
        setDetail((prev) => ({
            ...prev,
            [name]: name === "founded_year" && value ? parseInt(value) : value
        }))
    }

    const handleSubmit = async () => {
        try {
            setLoading(true)
            const createdLocationResponse = await apiLocations.AddWeb(formData)
            const newLocationId = createdLocationResponse?.data?.user?.location_id

            if (newLocationId) {
                const updatedDetail = { ...detail, location_id: newLocationId }
                await apiCompanyDetail.Add(updatedDetail)
            }
            toast({
                title: "Muvaffaqiyatli!",
                description: "Tashkilot yaratildi.",
                status: "success",
                duration: 3000,
                isClosable: true
            })

            onClose()
            refresh && refresh()

        } catch (error) {
            toast({
                title: "Xatolik!",
                description: "Yaratishda xatolik yuz berdi.",
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
            <Button colorScheme="blue" onClick={onOpen}>
                Yaratish
            </Button>
            <TaskModalShell
                isOpen={isOpen}
                onClose={onClose}
                size="xl"
                title="Yangi tashkilot"
                subtitle="Asosiy akkaunt va batafsil rekvizitlar"
                headerIcon={Building2}
                footer={
                    <>
                        <Button variant="ghost" onClick={onClose} isDisabled={loading}>
                            Bekor qilish
                        </Button>
                        <Button
                            colorScheme="blue"
                            onClick={handleSubmit}
                            isLoading={loading}
                            loadingText="Saqlanmoqda..."
                            borderRadius="xl"
                            px={8}
                        >
                            Saqlash
                        </Button>
                    </>
                }
            >
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                    <FormControl isRequired>
                        <FormLabel>Turi</FormLabel>
                        <Select borderRadius="lg" name="type" value={formData.type} onChange={handleChange}>
                            <option value="company">Qurilish kompaniya</option>
                            <option value="builder">Qurivchilar</option>
                            <option value="shop">Magazin</option>
                        </Select>
                    </FormControl>

                    <FormControl isRequired>
                        <FormLabel>Nomi</FormLabel>
                        <Input name="name" value={formData.name} onChange={handleChange} borderRadius="lg" />
                    </FormControl>

                    <FormControl isRequired>
                        <FormLabel>Mas'ul shaxs</FormLabel>
                        <Input name="full_name" value={formData.full_name} onChange={handleChange} borderRadius="lg" />
                    </FormControl>

                    <FormControl isRequired>
                        <FormLabel>Telefon</FormLabel>
                        <Input
                            name="phone"
                            placeholder="+998901234567"
                            value={formData.phone}
                            onChange={handleChange}
                            borderRadius="lg"
                        />
                    </FormControl>

                    <FormControl>
                        <FormLabel>Email</FormLabel>
                        <Input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            borderRadius="lg"
                        />
                    </FormControl>

                    <FormControl isRequired>
                        <FormLabel>Manzil</FormLabel>
                        <Input name="address" value={formData.address} onChange={handleChange} borderRadius="lg" />
                    </FormControl>

                    <FormControl>
                        <FormLabel>Direktor nomi</FormLabel>
                        <Input
                            name="director_name"
                            value={formData.director_name}
                            onChange={handleChange}
                            borderRadius="lg"
                        />
                    </FormControl>

                    <FormControl>
                        <FormLabel>INN</FormLabel>
                        <Input name="inn" value={formData.inn} onChange={handleChange} borderRadius="lg" />
                    </FormControl>

                    <FormControl isRequired>
                        <FormLabel>Username</FormLabel>
                        <Input name="username" value={formData.username} onChange={handleChange} borderRadius="lg" />
                    </FormControl>

                    <FormControl isRequired>
                        <FormLabel>Parol</FormLabel>
                        <Input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            borderRadius="lg"
                        />
                    </FormControl>
                </SimpleGrid>

                <Divider my={6} />
                <Text fontWeight="bold" fontSize="md" mb={3}>
                    Batafsil ma&apos;lumotlar
                </Text>

                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                    <FormControl>
                        <FormLabel>Tashkil etilgan yil</FormLabel>
                        <Input type="number" name="founded_year" value={detail.founded_year} onChange={handleChangeDetail} borderRadius="lg" />
                    </FormControl>

                    <FormControl>
                        <FormLabel>Faoliyat yo&apos;nalishi</FormLabel>
                        <Input name="direction" value={detail.direction} onChange={handleChangeDetail} borderRadius="lg" />
                    </FormControl>

                    <FormControl>
                        <FormLabel>Yuridik manzil</FormLabel>
                        <Input name="legal_address" value={detail.legal_address} onChange={handleChangeDetail} borderRadius="lg" />
                    </FormControl>

                    <FormControl>
                        <FormLabel>Bank nomi</FormLabel>
                        <Input name="bank_name" value={detail.bank_name} onChange={handleChangeDetail} borderRadius="lg" />
                    </FormControl>

                    <FormControl>
                        <FormLabel>Bank manzili</FormLabel>
                        <Input name="bank_address" value={detail.bank_address} onChange={handleChangeDetail} borderRadius="lg" />
                    </FormControl>

                    <FormControl>
                        <FormLabel>Hisob raqami</FormLabel>
                        <Input name="account_number" value={detail.account_number} onChange={handleChangeDetail} borderRadius="lg" />
                    </FormControl>

                    <FormControl>
                        <FormLabel>MFO</FormLabel>
                        <Input name="mfo" value={detail.mfo} onChange={handleChangeDetail} borderRadius="lg" />
                    </FormControl>

                    <FormControl>
                        <FormLabel>OKED</FormLabel>
                        <Input name="oked" value={detail.oked} onChange={handleChangeDetail} borderRadius="lg" />
                    </FormControl>
                </SimpleGrid>
            </TaskModalShell>
        </>
    )
}

import {
    Select,
    useToast
} from "@chakra-ui/react"
import { useState } from "react"
import { apiLocations } from "../../../utils/Controllers/Locations"

export default function StatusEdit({ data, refresh }) {
    const toast = useToast()
    const [loading, setLoading] = useState(false)

    const handleStatusChange = async (e) => {
        const newStatus = e.target.value

        // Если статус не изменился, ничего не делаем
        if (newStatus === data.is_active) return

        try {
            setLoading(true)
            await apiLocations.activeTypeEdit({ is_active: newStatus }, data.id)
            toast({
                title: "Status yangilandi!",
                description: "Kompaniya statusi o'zgartirildi.",
                status: "success",
                duration: 2000,
                isClosable: true
            })
            if (refresh) refresh()
        } catch (error) {
            toast({
                title: "Xatolik!",
                description: "Statusni yangilashda xatolik yuz berdi.",
                status: "error",
                duration: 3000,
                isClosable: true
            })
        } finally {
            setLoading(false)
        }
    }

    return (
        <Select
            size="sm"
            value={data.is_active || ""}
            onChange={handleStatusChange}
            isLoading={loading}
            isDisabled={loading}
            width="130px"
            onClick={(e) => {
                e.stopPropagation()
            }}
            borderRadius="md"
            cursor="pointer"
            variant="unstyled"
            bg="transparent"
            borderColor="transparent"
            _hover={{
                borderColor: "blue.400"
            }}
            _focus={{
                borderColor: "blue.500",
                boxShadow: "0 0 0 1px blue.500"
            }}
        >
            <option value="pending">Kutilmoqda</option>
            <option value="active">Aktiv</option>
            <option value="delete">Nofaol</option>
        </Select>
    )
}
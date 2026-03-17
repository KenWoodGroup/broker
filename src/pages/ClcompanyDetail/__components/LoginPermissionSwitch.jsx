import { Switch, useToast, Tooltip, Box } from "@chakra-ui/react"
import { useState } from "react"
import { $api } from "../../../utils/api/axios"

export default function LoginPermissionSwitch({ userId, initialValue = false }) {
    const [isLogin, setIsLogin] = useState(initialValue)
    const [loading, setLoading] = useState(false)
    const toast = useToast()

    const handleToggle = async (e) => {
        e.stopPropagation() // Prevent row click event
        const newStatus = !isLogin
        try {
            setLoading(true)
            await $api.put(`/user/login/${userId}`, { is_login: newStatus })

            setIsLogin(newStatus)
            toast({
                title: "Muvaffaqiyatli!",
                description: `Ruxsat holati ${newStatus ? "yoqildi" : "o'chirildi"}.`,
                status: "success",
                duration: 3000,
                isClosable: true
            })
        } catch (error) {
            console.error(error)
            toast({
                title: "Xatolik!",
                description: "Holatni o'zgartirishda xatolik yuz berdi.",
                status: "error",
                duration: 3000,
                isClosable: true
            })
        } finally {
            setLoading(false)
        }
    }

    return (
        <Tooltip label={isLogin ? "Ruxsatni o'chirish" : "Ruxsat berish"}>
            <Box onClick={(e) => e.stopPropagation()} display="inline-block" mr={2}>
                <Switch
                    isChecked={isLogin}
                    onChange={handleToggle}
                    isDisabled={loading}
                    colorScheme="green"
                    size="md"
                />
            </Box>
        </Tooltip>
    )
}

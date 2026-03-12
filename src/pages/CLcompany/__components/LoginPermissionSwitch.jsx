import { Switch, useToast, Tooltip, Box } from "@chakra-ui/react"
import { useState } from "react"
import { $api } from "../../../utils/api/axios"

export default function LoginPermissionSwitch({ companyId, initialValue = false }) {
    const [isLogin, setIsLogin] = useState(initialValue)
    const [loading, setLoading] = useState(false)
    const toast = useToast()

    const handleToggle = async (e) => {
        e.stopPropagation() // Prevent row click event
        const newStatus = !isLogin
        try {
            setLoading(true)

            // 1) Lcation asosida user ma'lumotlarini olish
            const userRes = await $api.get(`/user/locationId/${companyId}`)

            // API dan kelayotgan javob array (ro'yxat) bo'lgani uchun 1-elementni olamiz
            const users = userRes.data?.data || userRes.data
            const user = Array.isArray(users) ? users[0] : users
            const userId = user?.id

            if (!userId) {
                toast({
                    title: "Xatolik!",
                    description: "Foydalanuvchi ID topilmadi.",
                    status: "error",
                    duration: 3000,
                    isClosable: true
                })
                setLoading(false)
                return
            }

            // 2) Topilgan userId bilan login ni o'zgartirish
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

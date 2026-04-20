import {
    Box,
    Button,
    HStack,
    Icon,
    Input,
    Modal,
    ModalBody,
    ModalCloseButton,
    ModalContent,
    ModalFooter,
    ModalHeader,
    ModalOverlay,
    Text,
    VStack,
    useColorModeValue,
    useToast,
} from "@chakra-ui/react"
import { Star } from "lucide-react"
import { useEffect, useMemo, useState } from "react"
import { apiLocations } from "../../../utils/Controllers/Locations"

function toNumber(v) {
    if (v == null || v === "") return null
    const n = Number(v)
    return Number.isFinite(n) ? n : null
}

function toIntScore(v) {
    const n = toNumber(v)
    if (n == null) return null
    const i = Math.trunc(n)
    if (!Number.isFinite(i)) return null
    return i
}

function normalizeRating(v) {
    const n = toNumber(v)
    if (n == null) return ""
    return String(Math.round(n * 100) / 100)
}

export default function RatingEditModal({
    isOpen,
    onClose,
    locationId,
    initialRating,
    onUpdated,
}) {
    const toast = useToast()
    const headerBorder = useColorModeValue("gray.200", "whiteAlpha.200")
    const footerBg = useColorModeValue("gray.50", "whiteAlpha.50")
    const heroBg = useColorModeValue(
        "linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 40%, #ede9fe 100%)",
        "linear-gradient(135deg, rgba(59,130,246,0.16) 0%, rgba(124,58,237,0.18) 100%)"
    )

    const [saving, setSaving] = useState(false)
    const [rating, setRating] = useState("")

    const canSave = useMemo(() => {
        const i = toIntScore(rating)
        return i != null && i >= 1 && i <= 5
    }, [rating])

    useEffect(() => {
        if (!isOpen) return
        // Rating GET alohida endpointdan kelmaydi, parent'dan props orqali beriladi
        // Shuning uchun modal ochilganda faqat local state reset qilinadi
        setSaving(false)
        const n = toNumber(initialRating)
        if (n == null || n <= 0) {
            setRating("")
        } else {
            // backend score butun son (1..5) kutadi
            const score = Math.max(1, Math.min(5, Math.round(n)))
            setRating(String(score))
        }
    }, [isOpen, initialRating])

    const onSave = async () => {
        if (!locationId) return
        const score = toIntScore(rating)
        if (score == null) {
            toast({
                title: "Rating",
                description: "Score son bo‘lishi kerak",
                status: "warning",
                duration: 3000,
                isClosable: true,
            })
            return
        }
        if (score < 1 || score > 5) {
            toast({
                title: "Rating",
                description: "Score 1..5 oralig‘ida bo‘lishi kerak",
                status: "warning",
                duration: 3000,
                isClosable: true,
            })
            return
        }
        try {
            setSaving(true)
            await apiLocations.updateRating(locationId, { score })
            onUpdated?.()
            onClose?.()
        } catch (e) {
            console.error(e)
            toast({
                title: "Xatolik",
                description: "Ratingni yangilab bo'lmadi",
                status: "error",
                duration: 5000,
                isClosable: true,
            })
        } finally {
            setSaving(false)
        }
    }

    return (
        <Modal isOpen={isOpen} onClose={onClose} isCentered motionPreset="slideInBottom">
            <ModalOverlay bg="blackAlpha.600" backdropFilter="blur(6px)" />
            <ModalContent borderRadius="2xl" overflow="hidden" boxShadow="2xl" bg="surface">
                <Box
                    px={6}
                    py={5}
                    borderBottomWidth="1px"
                    borderColor={headerBorder}
                    bgImage={heroBg}
                >
                    <HStack justify="space-between" pr={10} align="start">
                        <HStack spacing={3} align="start">
                            <Box
                                w="40px"
                                h="40px"
                                borderRadius="xl"
                                bg={useColorModeValue("white", "whiteAlpha.200")}
                                display="flex"
                                alignItems="center"
                                justifyContent="center"
                                flexShrink={0}
                            >
                                <Icon as={Star} boxSize={5} color="yellow.500" />
                            </Box>
                            <Box minW={0}>
                                <ModalHeader p={0} lineHeight="normal">
                                    Ratingni tahrirlash
                                </ModalHeader>
                                <Text fontSize="sm" color="gray.600" mt={0.5}>
                                    Rating va baholar soni
                                </Text>
                            </Box>
                        </HStack>
                        <ModalCloseButton top={4} />
                    </HStack>
                </Box>

                <ModalBody px={6} py={5}>
                    <VStack align="stretch" spacing={4}>
                        <Box>
                            <Text fontSize="sm" fontWeight="semibold" mb={2}>
                                Score
                            </Text>
                            <Input
                                type="number"
                                step="1"
                                min={1}
                                max={5}
                                value={rating}
                                onChange={(e) => setRating(e.target.value)}
                                borderRadius="lg"
                                bg="bg"
                                placeholder="1..5"
                            />
                            <Text fontSize="xs" color="gray.500" mt={2}>
                                1 dan 5 gacha (butun son).
                            </Text>
                        </Box>
                    </VStack>
                </ModalBody>

                <ModalFooter
                    bg={footerBg}
                    borderTopWidth="1px"
                    borderColor={headerBorder}
                    gap={3}
                    py={4}
                    px={6}
                >
                    <Button variant="ghost" onClick={onClose} isDisabled={saving}>
                        Bekor qilish
                    </Button>
                    <Button
                        colorScheme="blue"
                        onClick={onSave}
                        isLoading={saving}
                        loadingText="Saqlanmoqda..."
                        borderRadius="xl"
                        px={8}
                        isDisabled={!canSave}
                    >
                        Saqlash
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    )
}


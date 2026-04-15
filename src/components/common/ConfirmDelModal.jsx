import {
    Modal,
    ModalBody,
    ModalContent,
    ModalFooter,
    ModalHeader,
    ModalOverlay,
    Button,
    Text,
    Box,
    HStack,
    Icon,
    useColorModeValue,
    Badge,
    ModalCloseButton,
} from "@chakra-ui/react";
import { AlertTriangle, Trash2 } from "lucide-react";

export default function ConfirmDelModal({ isOpen, onClose, onConfirm, itemName, loading, typeItem }) {
    const headerBorder = useColorModeValue("gray.200", "whiteAlpha.200");
    const footerBg = useColorModeValue("gray.50", "whiteAlpha.50");
    const heroBg = useColorModeValue(
        "linear-gradient(135deg, #fff1f2 0%, #ffe4e6 40%, #fff7ed 100%)",
        "linear-gradient(135deg, rgba(239,68,68,0.18) 0%, rgba(249,115,22,0.16) 100%)"
    );

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            isCentered
            motionPreset="slideInBottom"
        >
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
                                <Icon as={AlertTriangle} boxSize={5} color="red.500" />
                            </Box>
                            <Box minW={0}>
                                <ModalHeader p={0} lineHeight="normal">
                                    O‘chirishni tasdiqlang
                                </ModalHeader>
                                <Text fontSize="sm" color="gray.600" mt={0.5}>
                                    Bu amalni ortga qaytarib bo‘lmaydi.
                                </Text>
                            </Box>
                        </HStack>
                        <ModalCloseButton top={4} />
                    </HStack>
                </Box>

                <ModalBody>
                    <Text fontSize="sm" color="gray.600">
                        Quyidagi {typeItem} o‘chiriladi:
                    </Text>
                    <Badge
                        mt={3}
                        colorScheme="red"
                        variant="subtle"
                        px={3}
                        py={1.5}
                        borderRadius="lg"
                        maxW="100%"
                        display="inline-block"
                    >
                        <Text as="span" fontSize="sm" fontWeight="semibold" noOfLines={2}>
                            {itemName}
                        </Text>
                    </Badge>
                </ModalBody>

                <ModalFooter
                    bg={footerBg}
                    borderTopWidth="1px"
                    borderColor={headerBorder}
                    gap={3}
                    py={4}
                    px={6}
                >
                    <Button variant="ghost" onClick={onClose} isDisabled={loading}>
                        Bekor qilish
                    </Button>
                    <Button
                        isLoading={loading}
                        loadingText="O‘chirilmoqda..."
                        colorScheme="red"
                        onClick={onConfirm}
                        leftIcon={<Trash2 size={16} />}
                        borderRadius="xl"
                        px={8}
                    >
                        O‘chirish
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
}

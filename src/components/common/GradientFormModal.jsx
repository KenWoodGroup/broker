import {
    Modal,
    ModalOverlay,
    ModalContent,
    ModalBody,
    ModalFooter,
    ModalCloseButton,
    Button,
    Box,
    HStack,
    Text,
    Icon,
    useColorModeValue,
} from "@chakra-ui/react";

/**
 * ADtasks CreateTaskModal / EditTaskModal bilan bir xil: gradient header, blur overlay, footer panel.
 */
export default function GradientFormModal({
    isOpen,
    onClose,
    size = "lg",
    title,
    subtitle,
    headerIcon,
    children,
    primaryLabel,
    onPrimary,
    primaryLoading = false,
    primaryDisabled = false,
    primaryLoadingText = "Saqlanmoqda...",
    primaryLeftIcon,
}) {
    const headerBorder = useColorModeValue("gray.200", "whiteAlpha.200");
    const footerBg = useColorModeValue("gray.50", "whiteAlpha.50");
    const heroBg = useColorModeValue(
        "linear-gradient(135deg, #eff6ff 0%, #e0e7ff 50%, #ddd6fe 100%)",
        "linear-gradient(135deg, rgba(59,130,246,0.2) 0%, rgba(99,102,241,0.25) 100%)"
    );
    const headerIconBg = useColorModeValue("white", "whiteAlpha.200");

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            isCentered
            size={size}
            scrollBehavior="inside"
            motionPreset="slideInBottom"
        >
            <ModalOverlay bg="blackAlpha.600" backdropFilter="blur(6px)" />
            <ModalContent
                borderRadius="2xl"
                overflow="hidden"
                boxShadow="2xl"
                maxH="90vh"
                bg="surface"
                borderWidth="1px"
                borderColor={headerBorder}
            >
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
                                bg={headerIconBg}
                                display="flex"
                                alignItems="center"
                                justifyContent="center"
                                flexShrink={0}
                            >
                                <Icon as={headerIcon} boxSize={5} color="blue.600" />
                            </Box>
                            <Box minW={0}>
                                <Text fontWeight="bold" fontSize="lg">
                                    {title}
                                </Text>
                                {subtitle ? (
                                    <Text fontSize="sm" color="gray.500" mt={0.5} noOfLines={3}>
                                        {subtitle}
                                    </Text>
                                ) : null}
                            </Box>
                        </HStack>
                        <ModalCloseButton top={4} />
                    </HStack>
                </Box>
                <ModalBody px={6} py={5}>
                    {children}
                </ModalBody>
                <ModalFooter
                    bg={footerBg}
                    borderTopWidth="1px"
                    borderColor={headerBorder}
                    gap={3}
                    py={4}
                    px={6}
                >
                    <Button variant="ghost" onClick={onClose} isDisabled={primaryLoading}>
                        Bekor qilish
                    </Button>
                    <Button
                        colorScheme="blue"
                        onClick={onPrimary}
                        isLoading={primaryLoading}
                        isDisabled={primaryDisabled}
                        loadingText={primaryLoadingText}
                        borderRadius="xl"
                        px={8}
                        leftIcon={primaryLeftIcon}
                    >
                        {primaryLabel}
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
}

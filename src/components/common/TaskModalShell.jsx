import {
    Box,
    HStack,
    Icon,
    Modal,
    ModalBody,
    ModalCloseButton,
    ModalContent,
    ModalFooter,
    ModalOverlay,
    Text,
    useColorModeValue,
} from "@chakra-ui/react";

/**
 * ADtasks (EditTaskModal) bilan bir xil modal “chrome”: blur overlay, gradient header, icon, footer strip.
 */
export default function TaskModalShell({
    isOpen,
    onClose,
    size = "lg",
    title,
    subtitle,
    headerIcon: HeaderIcon,
    tone = "default",
    children,
    footer,
    scrollBehavior = "inside",
    maxH = "90vh",
}) {
    const headerBorder = useColorModeValue("gray.200", "whiteAlpha.200");
    const footerBg = useColorModeValue("gray.50", "whiteAlpha.50");
    const borderCol = useColorModeValue("gray.200", "whiteAlpha.200");
    const heroBg = useColorModeValue(
        "linear-gradient(135deg, #eff6ff 0%, #e0e7ff 50%, #ddd6fe 100%)",
        "linear-gradient(135deg, rgba(59,130,246,0.18) 0%, rgba(99,102,241,0.22) 100%)"
    );
    const heroDangerBg = useColorModeValue(
        "linear-gradient(135deg, #fff1f2 0%, #ffe4e6 40%, #fff7ed 100%)",
        "linear-gradient(135deg, rgba(239,68,68,0.18) 0%, rgba(249,115,22,0.16) 100%)"
    );
    const iconBoxBg = useColorModeValue("white", "whiteAlpha.200");
    const headerBg = tone === "danger" ? heroDangerBg : heroBg;
    const iconColor = tone === "danger" ? "red.500" : "blue.600";

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            isCentered
            size={size}
            motionPreset="slideInBottom"
            scrollBehavior={scrollBehavior}
        >
            <ModalOverlay bg="blackAlpha.600" backdropFilter="blur(6px)" />
            <ModalContent
                bg="surface"
                borderRadius="2xl"
                overflow="hidden"
                boxShadow="2xl"
                borderWidth="1px"
                borderColor={borderCol}
                maxH={maxH}
            >
                <Box
                    px={6}
                    py={5}
                    borderBottomWidth="1px"
                    borderColor={headerBorder}
                    bgImage={headerBg}
                >
                    <HStack justify="space-between" pr={10} align="start">
                        <HStack spacing={3} align="start">
                            {HeaderIcon ? (
                                <Box
                                    w="40px"
                                    h="40px"
                                    borderRadius="xl"
                                    bg={iconBoxBg}
                                    display="flex"
                                    alignItems="center"
                                    justifyContent="center"
                                    flexShrink={0}
                                    boxShadow="sm"
                                >
                                    <Icon as={HeaderIcon} boxSize={5} color={iconColor} />
                                </Box>
                            ) : null}
                            <Box minW={0}>
                                <Text fontWeight="bold" fontSize="lg" lineHeight="short">
                                    {title}
                                </Text>
                                {subtitle ? (
                                    <Text fontSize="sm" color="gray.500" mt={0.5} noOfLines={4}>
                                        {subtitle}
                                    </Text>
                                ) : null}
                            </Box>
                        </HStack>
                    </HStack>
                    <ModalCloseButton top={4} borderRadius="full" />
                </Box>

                <ModalBody px={6} py={5}>
                    {children}
                </ModalBody>

                {footer ? (
                    <ModalFooter
                        bg={footerBg}
                        borderTopWidth="1px"
                        borderColor={headerBorder}
                        gap={3}
                        py={4}
                        px={6}
                    >
                        {footer}
                    </ModalFooter>
                ) : null}
            </ModalContent>
        </Modal>
    );
}

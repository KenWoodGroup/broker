import {
    Box,
    FormControl,
    FormLabel,
    HStack,
    Icon,
    Input,
    Modal,
    ModalBody,
    ModalCloseButton,
    ModalContent,
    ModalFooter,
    ModalOverlay,
    SimpleGrid,
    Text,
    VStack,
    useColorModeValue,
} from "@chakra-ui/react";
import { User } from "lucide-react";

/**
 * ADtasks (EditTaskModal) bilan bir xil modal “chrome”: blur overlay, gradient header, icon, footer strip.
 * Ixtiyoriy: joylashuvdagi direktor nomi va INN (location update uchun).
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
    locationDirectorName = "",
    locationInn = "",
    onLocationDirectorNameChange,
    onLocationInnChange,
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
    const panelBg = useColorModeValue("gray.50", "whiteAlpha.50");
    const panelBorder = useColorModeValue("gray.200", "whiteAlpha.200");

    const showLocationRequisites =
        typeof onLocationDirectorNameChange === "function" &&
        typeof onLocationInnChange === "function";

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
                    <VStack align="stretch" spacing={4}>
                        {showLocationRequisites ? (
                            <Box
                                p={4}
                                bg={panelBg}
                                borderRadius="xl"
                                borderWidth="1px"
                                borderColor={panelBorder}
                            >
                                <HStack spacing={2} mb={3}>
                                    <Icon as={User} boxSize={4} color="blue.500" />
                                    <Text fontSize="sm" fontWeight="semibold">
                                        Joylashuv — direktor va INN
                                    </Text>
                                </HStack>
                                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                                    <FormControl>
                                        <FormLabel>Direktor nomi</FormLabel>
                                        <Input
                                            value={locationDirectorName}
                                            onChange={(e) =>
                                                onLocationDirectorNameChange(e.target.value)
                                            }
                                            borderRadius="lg"
                                        />
                                    </FormControl>
                                    <FormControl>
                                        <FormLabel>INN</FormLabel>
                                        <Input
                                            value={locationInn}
                                            onChange={(e) => onLocationInnChange(e.target.value)}
                                            borderRadius="lg"
                                        />
                                    </FormControl>
                                </SimpleGrid>
                            </Box>
                        ) : null}
                        {children}
                    </VStack>
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

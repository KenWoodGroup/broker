import {
    Button,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalBody,
    ModalFooter,
    ModalCloseButton,
    Input,
    useDisclosure,
    Box,
    HStack,
    Text,
    VStack,
    Icon,
    useColorModeValue,
    useToast,
} from "@chakra-ui/react";
import { Plus, Tags } from "lucide-react";
import { useState } from "react";
import { apiCategories } from "../../../utils/Controllers/Categories";

const CreateCategoryButton = ({ onReload }) => {
    const toast = useToast();
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [categoryName, setCategoryName] = useState("");
    const [loading, setLoading] = useState(false);

    const panelBg = useColorModeValue("gray.50", "whiteAlpha.50");
    const borderCol = useColorModeValue("gray.200", "whiteAlpha.200");
    const headerBorder = useColorModeValue("gray.200", "whiteAlpha.200");
    const footerBg = useColorModeValue("gray.50", "whiteAlpha.50");
    const heroBg = useColorModeValue(
        "linear-gradient(135deg, #eff6ff 0%, #e0e7ff 50%, #ddd6fe 100%)",
        "linear-gradient(135deg, rgba(59,130,246,0.18) 0%, rgba(99,102,241,0.22) 100%)"
    );
    const headerIconBg = useColorModeValue("white", "whiteAlpha.200");

    const handleCreate = async () => {
        if (!categoryName.trim()) return;

        setLoading(true);

        try {
            await apiCategories.Add({ name: categoryName });
            onClose();
            setCategoryName("");
            onReload?.();
        } catch (err) {
            console.error(err);
            toast({
                title: "Xatolik",
                description: err?.response?.data?.message || "Kategoriya yaratilmadi",
                status: "error",
                duration: 5000,
                isClosable: true,
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Button colorScheme="blue" leftIcon={<Plus size={18} />} onClick={onOpen}>
                Category
            </Button>

            <Modal
                isOpen={isOpen}
                onClose={onClose}
                isCentered
                size="lg"
                motionPreset="slideInBottom"
            >
                <ModalOverlay bg="blackAlpha.600" backdropFilter="blur(6px)" />
                <ModalContent
                    bg="surface"
                    borderRadius="2xl"
                    overflow="hidden"
                    boxShadow="2xl"
                    borderWidth="1px"
                    borderColor={borderCol}
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
                                    <Icon as={Tags} boxSize={5} color="blue.600" />
                                </Box>
                                <Box minW={0}>
                                    <Text fontWeight="bold" fontSize="lg">
                                        Yangi kategoriya
                                    </Text>
                                    <Text fontSize="sm" color="gray.500" mt={0.5}>
                                        Kategoriya nomini kiriting
                                    </Text>
                                </Box>
                            </HStack>
                            <ModalCloseButton top={4} />
                        </HStack>
                    </Box>

                    <ModalBody px={6} py={5}>
                        <VStack align="stretch" spacing={4}>
                            <Box
                                p={4}
                                bg={panelBg}
                                borderRadius="xl"
                                borderWidth="1px"
                                borderColor={borderCol}
                            >
                                <Text fontSize="sm" fontWeight="semibold" mb={2}>
                                    Nomi
                                </Text>
                                <Input
                                    placeholder="Kategoriya nomi"
                                    value={categoryName}
                                    borderRadius="lg"
                                    onChange={(e) => setCategoryName(e.target.value)}
                                    onKeyDown={(e) => e.key === "Enter" && handleCreate()}
                                />
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
                        <Button variant="ghost" onClick={onClose} isDisabled={loading}>
                            Bekor qilish
                        </Button>
                        <Button
                            colorScheme="blue"
                            onClick={handleCreate}
                            isLoading={loading}
                            loadingText="Yaratilmoqda..."
                            borderRadius="xl"
                            px={8}
                            leftIcon={<Icon as={Plus} boxSize={4} />}
                        >
                            Yaratish
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </>
    );
};

export default CreateCategoryButton;

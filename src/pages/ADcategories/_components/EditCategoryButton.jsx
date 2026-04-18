import {
    IconButton,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalBody,
    ModalFooter,
    ModalCloseButton,
    Input,
    Button,
    useDisclosure,
    Box,
    HStack,
    Text,
    VStack,
    Icon,
    useColorModeValue,
    useToast,
} from "@chakra-ui/react";
import { Pencil } from "lucide-react";
import { useEffect, useState } from "react";
import { apiCategories } from "../../../utils/Controllers/Categories";

const EditCategoryButton = ({ categoryId, initialData, onReload }) => {
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

    useEffect(() => {
        if (isOpen && initialData) {
            setCategoryName(initialData.name || "");
        }
    }, [isOpen, initialData]);

    const handleEdit = async () => {
        if (!categoryName.trim()) return;

        setLoading(true);

        try {
            await apiCategories.Update({ name: categoryName }, categoryId);
            onClose();
            onReload?.();
        } catch (err) {
            console.error(err);
            toast({
                title: "Xatolik",
                description: err?.response?.data?.message || "Saqlanmadi",
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
            <IconButton
                size="sm"
                variant="ghost"
                icon={<Pencil size={16} />}
                onClick={onOpen}
                aria-label="Edit"
            />

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
                                    <Icon as={Pencil} boxSize={5} color="blue.600" />
                                </Box>
                                <Box minW={0}>
                                    <Text fontWeight="bold" fontSize="lg">
                                        Kategoriyani tahrirlash
                                    </Text>
                                    {initialData?.name ? (
                                        <Text
                                            fontSize="sm"
                                            color="gray.500"
                                            mt={0.5}
                                            noOfLines={2}
                                        >
                                            {initialData.name}
                                        </Text>
                                    ) : (
                                        <Text fontSize="sm" color="gray.500" mt={0.5}>
                                            Nomni yangilang
                                        </Text>
                                    )}
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
                                    onKeyDown={(e) => e.key === "Enter" && handleEdit()}
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
                            onClick={handleEdit}
                            isLoading={loading}
                            loadingText="Saqlanmoqda..."
                            borderRadius="xl"
                            px={8}
                        >
                            Saqlash
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </>
    );
};

export default EditCategoryButton;

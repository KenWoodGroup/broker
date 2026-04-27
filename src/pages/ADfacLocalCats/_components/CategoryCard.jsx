import {
    Box,
    Flex,
    Text,
    IconButton,
    useColorModeValue,
    useDisclosure,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalCloseButton,
    ModalBody,
    ModalFooter,
    Button,
    HStack,
    Icon,
    Input,
    VStack,
} from "@chakra-ui/react";
import { Layers, Pencil, Trash2 } from "lucide-react";
import React, { useState } from "react";
import { apiLocalCategories } from "../../../utils/Controllers/apiLocalCategories";
import ConfirmDelModal from "../../../components/common/ConfirmDelModal";

const CategoryCard = React.memo(function CategoryCard({
    category,
    onEdit,
    onDelete,
    onOpen,
    role='admin',
    showActions = true
}) {
    const bg = useColorModeValue("white", "gray.800");
    const border = useColorModeValue("gray.200", "gray.700");
    const hoverBg = useColorModeValue("gray.50", "gray.700");
    const headerBorder = useColorModeValue("gray.200", "whiteAlpha.200");
    const footerBg = useColorModeValue("gray.50", "whiteAlpha.50");
    const heroBg = useColorModeValue(
        "linear-gradient(135deg, #eff6ff 0%, #dbeafe 40%, #f5f3ff 100%)",
        "linear-gradient(135deg, rgba(59,130,246,0.18) 0%, rgba(168,85,247,0.16) 100%)"
    );
    const panelBg = useColorModeValue("gray.50", "whiteAlpha.100");

    const delModal = useDisclosure()
    const editModal = useDisclosure()

    // states
    const [delLoading, setDelLoading] = useState(false);
    const [editLoading, setEditLoading] = useState(false);
    const [name, setName] = useState(category?.name ?? "");
    const deleteCategory = async () => {
        setDelLoading(true);
        try {
            const res = await apiLocalCategories.Delete(category?.id);
            delModal.onClose()
            if (onDelete) {
                onDelete();
            }
        } finally {
            setDelLoading(false)
        }
    }

    const openEdit = () => {
        setName(category?.name ?? "")
        editModal.onOpen()
    }

    const saveEdit = async () => {
        if (!name.trim()) return
        setEditLoading(true)
        try {
            await apiLocalCategories.Update(category?.id, { name: name.trim() })
            editModal.onClose()
            onEdit?.()
        } finally {
            setEditLoading(false)
        }
    }

    return (
        <Box
            position="relative"
            bg={bg}
            border="1px solid"
            borderColor={border}
            borderRadius="12px"
            p="20px"
            cursor="pointer"
            transition="all .2s"
            _hover={{ shadow: "md", bg: hoverBg }}
            role="group"
            onClick={onOpen}
        >
            {/* Actions */}
            {showActions ? (
                <Box position="absolute" top="8px" right="8px">
                    <IconButton
                        size="sm"
                        variant="ghost"
                        icon={<Layers size={18} />}
                        aria-label="Category actions"
                        _groupHover={{
                            opacity: 0,
                            pointerEvents: "none",
                        }}
                    />
                    <Flex
                        position="absolute"
                        top="0"
                        right="0"
                        bg={bg}
                        border="1px solid"
                        borderColor={border}
                        borderRadius="8px"
                        opacity={0}
                        pointerEvents="none"
                        transition="all .2s"
                        _groupHover={{
                            opacity: 1,
                            pointerEvents: "auto",
                        }}
                        zIndex={2}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <IconButton
                            size="sm"
                            variant="ghost"
                            icon={<Pencil size={16} />}
                            aria-label="Edit"
                            onClick={openEdit}
                        />
                        {role === 'admin' && (
                            <IconButton
                                size="sm"
                                variant="ghost"
                                colorScheme="red"
                                icon={<Trash2 size={16} />}
                                aria-label="Delete"
                                onClick={delModal.onOpen}
                            />
                        )}
                    </Flex>
                </Box>
            ) : null}

            <Text fontWeight="600" fontSize="lg" noOfLines={2}>
                {category?.name || "-"}
            </Text>
            {showActions ? (
                <ConfirmDelModal
                    isOpen={delModal.isOpen}
                    onClose={delModal.onClose}
                    onConfirm={deleteCategory}
                    itemName={category?.name}
                    loading={delLoading}
                    typeItem={"Local category"}
                />
            ) : null}

            {showActions ? (
                <Modal
                    isOpen={editModal.isOpen}
                    onClose={editModal.onClose}
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
                                        bg={useColorModeValue("white", "whiteAlpha.200")}
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
                                        <Text fontSize="sm" color="gray.500" mt={0.5} noOfLines={2}>
                                            {category?.name}
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
                                    borderColor={headerBorder}
                                >
                                    <Text fontSize="sm" fontWeight="semibold" mb={2}>
                                        Nomi
                                    </Text>
                                    <Input
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        placeholder="Category nomi"
                                        borderRadius="lg"
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
                            <Button variant="ghost" onClick={editModal.onClose} isDisabled={editLoading}>
                                Bekor qilish
                            </Button>
                            <Button
                                colorScheme="blue"
                                onClick={saveEdit}
                                isLoading={editLoading}
                                loadingText="Saqlanmoqda..."
                                borderRadius="xl"
                                px={8}
                                isDisabled={!name.trim()}
                            >
                                Saqlash
                            </Button>
                        </ModalFooter>
                    </ModalContent>
                </Modal>
            ) : null}
        </Box>
    );
});

export default CategoryCard;

import React, { useEffect, useMemo, useState } from "react";
import {
    Modal,
    ModalOverlay,
    ModalContent,
    ModalBody,
    ModalFooter,
    ModalCloseButton,
    Button,
    VStack,
    HStack,
    Text,
    Select,
    Input,
    Box,
    useColorModeValue,
    Icon,
    Badge,
} from "@chakra-ui/react";
import { Pencil, CalendarDays, Flag, CheckCircle2 } from "lucide-react";

function toLocalInputValue(iso) {
    if (!iso) return "";
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "";
    const pad = (n) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
        d.getHours()
    )}:${pad(d.getMinutes())}`;
}

export default function EditTaskModal({
    isOpen,
    onClose,
    task,
    onSave,
    isSaving,
}) {
    const panelBg = useColorModeValue("gray.50", "whiteAlpha.50");
    const borderCol = useColorModeValue("gray.200", "whiteAlpha.200");
    const headerBorder = useColorModeValue("gray.200", "whiteAlpha.200");
    const footerBg = useColorModeValue("gray.50", "whiteAlpha.50");
    const heroBg = useColorModeValue(
        "linear-gradient(135deg, #eff6ff 0%, #e0e7ff 50%, #ddd6fe 100%)",
        "linear-gradient(135deg, rgba(59,130,246,0.18) 0%, rgba(99,102,241,0.22) 100%)"
    );

    const defaults = useMemo(() => {
        const t = task || {};
        return {
            status: String(t.status || "pending"),
            priority: String(t.priority || "normal"),
            dueDate: toLocalInputValue(t.due_date || t.dueDate),
        };
    }, [task]);

    const title = useMemo(() => {
        const t = task || {};
        return (
            t?.details?.product_name ||
            t?.product_name ||
            (t?.id != null ? `#${String(t.id)}` : "")
        );
    }, [task]);

    const [status, setStatus] = useState("pending");
    const [priority, setPriority] = useState("normal");
    const [dueDate, setDueDate] = useState("");

    useEffect(() => {
        if (!isOpen) return;
        setStatus(defaults.status);
        setPriority(defaults.priority);
        setDueDate(defaults.dueDate);
    }, [isOpen, defaults]);

    const submit = async () => {
        const payload = {
            status,
            priority,
        };
        if (dueDate) {
            const d = new Date(dueDate);
            if (!Number.isNaN(d.getTime())) payload.due_date = d.toISOString();
        } else {
            payload.due_date = null;
        }
        await onSave?.(payload);
    };

    return (
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
                                    Vazifani tahrirlash
                                </Text>
                                {title ? (
                                    <Text
                                        fontSize="sm"
                                        color="gray.500"
                                        mt={0.5}
                                        noOfLines={2}
                                    >
                                        {title}
                                    </Text>
                                ) : (
                                    <Text fontSize="sm" color="gray.500" mt={0.5}>
                                        Status, muhimlik va muddatni o‘zgartiring
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
                            <HStack justify="space-between" mb={2}>
                                <HStack spacing={2}>
                                    <Icon as={CheckCircle2} boxSize={4} color="blue.500" />
                                    <Text fontSize="sm" fontWeight="semibold">
                                        Status
                                    </Text>
                                </HStack>
                            
                            </HStack>
                            <Select
                                value={status}
                                onChange={(e) => setStatus(e.target.value)}
                                borderRadius="lg"
                            >
                                <option value="pending">Kutilmoqda</option>
                                <option value="in_progress">Bajarilmoqda</option>
                                <option value="completed">Bajarildi</option>
                                <option value="cancelled">Bekor qilindi</option>
                            </Select>
                        </Box>

                        <Box
                            p={4}
                            bg={panelBg}
                            borderRadius="xl"
                            borderWidth="1px"
                            borderColor={borderCol}
                        >
                            <HStack justify="space-between" mb={2}>
                                <HStack spacing={2}>
                                    <Icon as={Flag} boxSize={4} color="purple.500" />
                                    <Text fontSize="sm" fontWeight="semibold">
                                        Muhimlik
                                    </Text>
                                </HStack>
                            </HStack>
                            <Select
                                value={priority}
                                onChange={(e) => setPriority(e.target.value)}
                                borderRadius="lg"
                            >
                                <option value="low">Past</option>
                                <option value="normal">Oddiy</option>
                                <option value="high">Yuqori</option>
                                <option value="urgent">Shoshilinch</option>
                            </Select>
                        </Box>

                        <Box
                            p={4}
                            bg={panelBg}
                            borderRadius="xl"
                            borderWidth="1px"
                            borderColor={borderCol}
                        >
                            <HStack justify="space-between" mb={2} align="center">
                                <HStack spacing={2}>
                                    <Icon as={CalendarDays} boxSize={4} color="orange.500" />
                                    <Text fontSize="sm" fontWeight="semibold">
                                        Muddat (ixtiyoriy)
                                    </Text>
                                </HStack>
                            </HStack>
                            <Input
                                type="datetime-local"
                                value={dueDate}
                                onChange={(e) => setDueDate(e.target.value)}
                                borderRadius="lg"
                            />
                            <Text fontSize="xs" color="gray.500" mt={2}>
                                Bo‘sh qoldirsangiz, muddat o‘chiriladi.
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
                    <Button variant="ghost" onClick={onClose} isDisabled={isSaving}>
                        Bekor qilish
                    </Button>
                    <Button
                        colorScheme="blue"
                        onClick={submit}
                        isLoading={isSaving}
                        loadingText="Saqlanmoqda..."
                        borderRadius="xl"
                        px={8}
                    >
                        Saqlash
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
}


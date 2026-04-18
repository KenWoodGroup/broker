import {
    Box,
    Button,
    Flex,
    IconButton,
    Modal,
    ModalBody,
    ModalCloseButton,
    ModalContent,
    ModalFooter,
    ModalHeader,
    ModalOverlay,
    Spinner,
    Text,
    Tooltip,
    useDisclosure,
    VStack,
    Divider,
} from "@chakra-ui/react";
import { useState } from "react";
import { FileSpreadsheet, Upload, CheckCircle, XCircle, List } from "lucide-react";
import { apiLots } from "../../../utils/Controllers/Lots";

export default function CreateExel({ onCreated }) {
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [response, setResponse] = useState(null);

    const handleUpload = async () => {
        if (!file) return;

        setLoading(true);
        try {
            const formData = new FormData();
            formData.append("file", file);
            const res = await apiLots.createExel(formData);
            setResponse(res.data);
            if (onCreated) {
                onCreated();
            }
        } catch (error) {
            console.error("Upload error:", error);
        } finally {
            setLoading(false);
        }
    };

    const resetAndClose = () => {
        setFile(null);
        setResponse(null);
        onClose();
    };

    return (
        <>
            <Tooltip label="Excel orqali yuklash">
                <Button
                    leftIcon={<FileSpreadsheet size={16} />}
                    variant="outline"
                    colorScheme="green"
                    onClick={onOpen}
                >
                    Excel
                </Button>
            </Tooltip>

            <Modal isOpen={isOpen} onClose={resetAndClose} size="xl">
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>Lotlarni Excel orqali yuklash</ModalHeader>
                    <ModalCloseButton />

                    <ModalBody>
                        {!response && !loading && (
                            <VStack spacing={4}>
                                <Box
                                    border="2px dashed"
                                    borderColor="gray.300"
                                    rounded="md"
                                    p={6}
                                    textAlign="center"
                                    w="100%"
                                >
                                    <Flex justify="center" mb={2}>
                                        <Upload size={32} />
                                    </Flex>
                                    <Text mb={4}>Excel fayl yuklang (.xls, .xlsx)</Text>

                                    <input
                                        type="file"
                                        accept=".xls,.xlsx"
                                        onChange={(e) => setFile(e.target.files?.[0] || null)}
                                    />
                                </Box>
                            </VStack>
                        )}

                        {loading && (
                            <Flex align="center" justify="center" minH="150px" gap={3}>
                                <Spinner />
                                <Text>Yuklanmoqda...</Text>
                            </Flex>
                        )}

                        {response && !loading && (
                            <VStack align="stretch" spacing={4}>
                                <Flex justify="space-between" align="center">
                                    <Flex gap={2} align="center">
                                        <List size={18} />
                                        <Text fontWeight="bold">Natija:</Text>
                                    </Flex>
                                    <Text fontSize="sm" color="gray.500">
                                        Fayl: {file?.name}
                                    </Text>
                                </Flex>

                                <Divider />

                                {/* STATS */}
                                <Flex gap={4} justify="space-between" flexWrap="wrap">
                                    <Box flex="1" p={3}  borderRadius="md" textAlign="center" border="1px solid" borderColor="gray.100">
                                        <Text fontSize="xs" color="gray.500" fontWeight="600">JAMI</Text>
                                        <Text fontSize="xl" fontWeight="bold">{response?.total || 0}</Text>
                                    </Box>
                                    <Box flex="1" p={3}  borderRadius="md" textAlign="center" border="1px solid" borderColor="green.100">
                                        <Text fontSize="xs" color="green.600" fontWeight="600">YARATILDI</Text>
                                        <Text fontSize="xl" fontWeight="bold" color="green.700">{response?.created_count || 0}</Text>
                                    </Box>
                                    <Box flex="1" p={3}  borderRadius="md" textAlign="center" border="1px solid" borderColor="red.100">
                                        <Text fontSize="xs" color="red.600" fontWeight="600">O'TKAZIB YUBORILDI</Text>
                                        <Text fontSize="xl" fontWeight="bold" color="red.700">{response?.skipped_count || 0}</Text>
                                    </Box>
                                </Flex>

                                {response.message && (
                                    <Box p={3} borderRadius="md">
                                        <Flex align="center" gap={2}>
                                            <CheckCircle size={18} color={response.created_count > 0 ? "#38A169" : "#3182CE"} />
                                            <Text fontWeight="500">{response.message}</Text>
                                        </Flex>
                                    </Box>
                                )}

                                {/* SKIPPED DETAILS */}
                                {response?.skipped?.length > 0 && (
                                    <Box mt={2}>
                                        <Text fontWeight="bold" mb={2} fontSize="sm">O'tkazib yuborilganlar tafsiloti:</Text>
                                        <Box 
                                            maxH="200px" 
                                            overflowY="auto" 
                                            border="1px solid" 
                                            borderColor="gray.200" 
                                            borderRadius="md"
                                            css={{
                                                '&::-webkit-scrollbar': { width: '4px' },
                                                '&::-webkit-scrollbar-track': { background: '#f1f1f1' },
                                                '&::-webkit-scrollbar-thumb': { background: '#ccc' },
                                                '&::-webkit-scrollbar-thumb:hover': { background: '#999' },
                                            }}
                                        >
                                            {response.skipped.map((item, idx) => (
                                                <Box 
                                                    key={idx} 
                                                    p={3} 
                                                    borderBottom={idx === response.skipped.length - 1 ? "none" : "1px solid"} 
                                                    borderColor="gray.100"
                                                    _hover={{ bg: "gray.50" }}
                                                >
                                                    <Flex justify="space-between" align="start">
                                                        <Box>
                                                            <Text fontSize="xs" fontWeight="bold" color="gray.500" mb={1}>
                                                                QATOR {item.row}
                                                            </Text>
                                                            <Text fontSize="sm" color="red.600">
                                                                {item.reason}
                                                            </Text>
                                                        </Box>
                                                        <XCircle size={14} color="#E53E3E" style={{ marginTop: '2px' }} />
                                                    </Flex>
                                                </Box>
                                            ))}
                                        </Box>
                                    </Box>
                                )}

                                {/* RAW RESPONSE (Optional, keeping it brief if needed) */}
                                {/* <Box p={2} bg="gray.900" borderRadius="md" mt={2}>
                                    <Text fontSize="10px" color="gray.400" fontFamily="monospace">
                                        Raw response hidden. Click "Yopish" to continue.
                                    </Text>
                                </Box> */}
                            </VStack>
                        )}
                    </ModalBody>

                    <ModalFooter>
                        {!response && (
                            <Button
                                colorScheme="blue"
                                onClick={handleUpload}
                                isDisabled={!file}
                                isLoading={loading}
                            >
                                Saqlash
                            </Button>
                        )}

                        <Button variant="ghost" ml={3} onClick={resetAndClose}>
                            {response ? "Yopish" : "Bekor qilish"}
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </>
    );
}
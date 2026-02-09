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
import { useEffect, useMemo, useRef, useState } from "react";
import {
    FileSpreadsheet,
    Upload,
    CheckCircle,
    XCircle,
    List,
} from "lucide-react";
import { apiLocalProducts } from "../../../utils/Controllers/apiLocalProducts";

const ITEMS_PER_BATCH = 20;

export default function UploadProductsByExcel({ factoryId }) {
    const { isOpen, onOpen, onClose } = useDisclosure();

    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [response, setResponse] = useState(null);
    const [visibleCount, setVisibleCount] = useState(ITEMS_PER_BATCH);

    const createdScrollRef = useRef(null);

    const visibleCreated = useMemo(() => {
        if (!response) return [];
        return response.created.slice(0, visibleCount);
    }, [response, visibleCount]);

    useEffect(() => {
        const el = createdScrollRef.current;
        if (!el) return;

        const onScroll = () => {
            if (el.scrollTop + el.clientHeight >= el.scrollHeight - 20) {
                setVisibleCount((prev) => prev + ITEMS_PER_BATCH);
            }
        };

        el.addEventListener("scroll", onScroll);
        return () => el.removeEventListener("scroll", onScroll);
    }, []);

    const handleUpload = async () => {
        if (!file) return;

        setLoading(true);

        try {
            const formData = new FormData();
            formData.append('file', file);
            const res = await apiLocalProducts.uploadProducts(factoryId, formData);
            setResponse(res.data);

        } finally {
            setLoading(false);
        }
    };

    const resetAndClose = () => {
        setFile(null);
        setResponse(null);
        setVisibleCount(ITEMS_PER_BATCH);
        onClose();
    };

    return (
        <>
            {/* BUTTON */}
            <Tooltip label="Excel orqali yuklash">
                <IconButton
                    aria-label="Upload Excel"
                    icon={<FileSpreadsheet size={18} />}
                    onClick={onOpen}
                />
            </Tooltip>

            {/* MODAL */}
            <Modal isOpen={isOpen} onClose={resetAndClose} size="xl">
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>Mahsulotlarni Excel orqali yuklash</ModalHeader>
                    <ModalCloseButton />

                    <ModalBody>
                        {/* FILE UPLOAD */}
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
                                    <Upload size={32} />
                                    <Text mt={2}>
                                        Excel fayl yuklang (.xls, .xlsx)
                                    </Text>

                                    <input
                                        type="file"
                                        accept=".xls,.xlsx"
                                        style={{ marginTop: 12 }}
                                        onChange={(e) =>
                                            setFile(e.target.files?.[0] || null)
                                        }
                                    />
                                </Box>
                            </VStack>
                        )}

                        {/* LOADING */}
                        {loading && (
                            <Flex align="center" justify="center" minH="150px" gap={3}>
                                <Spinner />
                                <Text>Yuklanmoqda...</Text>
                            </Flex>
                        )}

                        {/* RESULT */}
                        {response && !loading && (
                            <VStack align="stretch" spacing={4}>
                                {/* SUMMARY */}
                                <Flex justify="space-between">
                                    <Flex gap={2} align="center">
                                        <List size={18} />
                                        <Text>
                                            Jami:{" "}
                                            <b>
                                                {response.created.length +
                                                    response.skipped.length}
                                            </b>
                                        </Text>
                                    </Flex>

                                    <Flex gap={4}>
                                        <Flex gap={1} align="center">
                                            <CheckCircle size={16} />
                                            <Text>{response.created.length}</Text>
                                        </Flex>

                                        <Flex gap={1} align="center">
                                            <XCircle size={16} />
                                            <Text>{response.skipped.length}</Text>
                                        </Flex>
                                    </Flex>
                                </Flex>

                                <Divider />

                                {/* CREATED */}
                                <Box>
                                    <Text fontWeight="bold" mb={2}>
                                        Muvaffaqiyatli yuklanganlar
                                    </Text>

                                    <Box
                                        ref={createdScrollRef}
                                        maxH="220px"
                                        overflowY="auto"
                                        border="1px solid"
                                        borderColor="gray.200"
                                        rounded="md"
                                        p={2}
                                    >
                                        {visibleCreated.map((item) => (
                                            <Flex key={item.id} gap={2} align="center" py={1}>
                                                <CheckCircle size={14} />
                                                <Text fontSize="sm">{item.name}</Text>
                                            </Flex>
                                        ))}
                                    </Box>
                                </Box>

                                {/* SKIPPED */}
                                {response.skipped.length > 0 && (
                                    <Box>
                                        <Text fontWeight="bold" mb={2}>
                                            Bekor qilinganlar
                                        </Text>

                                        <Box
                                            maxH="200px"
                                            overflowY="auto"
                                            border="1px solid"
                                            borderColor="gray.200"
                                            rounded="md"
                                            p={2}
                                        >
                                            {response.skipped.map((item, idx) => (
                                                <Box key={idx} mb={2}>
                                                    <Flex gap={2} align="center">
                                                        <XCircle size={14} />
                                                        <Text fontSize="sm">
                                                            {item.row.name}
                                                        </Text>
                                                    </Flex>
                                                    <Text fontSize="xs" color="gray.500" ml={6}>
                                                        {item.reason}
                                                    </Text>
                                                </Box>
                                            ))}
                                        </Box>
                                    </Box>
                                )}
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
                            Yopish
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </>
    );
}

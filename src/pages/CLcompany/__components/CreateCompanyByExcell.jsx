import {
    Box,
    IconButton,
    Modal,
    ModalContent,
    ModalHeader,
    ModalOverlay,
    ModalBody,
    ModalCloseButton,
    Tooltip,
    Button,
    Input,
    VStack,
    Text,
    Spinner,
    Alert,
    AlertIcon,
    Divider
} from "@chakra-ui/react";
import { Upload } from "lucide-react";
import { useState } from "react";
import { apiLocations } from "../../../utils/Controllers/Locations";

export default function CreateCompanyByExcell({ reload }) {
    const [isOpen, setIsOpen] = useState(false);
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);

    const handleOpen = () => setIsOpen(true);
    const handleClose = () => {
        setIsOpen(false);
        setFile(null);
        setResult(null);
        setError(null);
    };

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const handleUpload = async () => {
        if (!file) {
            setError("Iltimos Excel fayl tanlang");
            return;
        }

        setLoading(true);
        setError(null);
        setResult(null);

        try {
            const formData = new FormData();
            formData.append("file", file);

            const res = await apiLocations.CreateByExcell(formData, 'company');

            setResult(res.data);
            if(res.data.created?.length > 1) {
                reload()
            }
        } catch (err) {
            setError("Yuklashda xatolik yuz berdi");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box>
            <Tooltip label="Upload Excel">
                <IconButton
                    colorScheme="blue"
                    icon={<Upload size={18} />}
                    onClick={handleOpen}
                />
            </Tooltip>

            <Modal isOpen={isOpen} onClose={handleClose} size="xl">
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>Excel orqali import qilish</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody pb={6}>
                        <VStack spacing={4} align="stretch">

                            {!result && (
                                <>
                                    <Input
                                        type="file"
                                        accept=".xlsx,.xls"
                                        onChange={handleFileChange}
                                    />

                                    <Button
                                        colorScheme="blue"
                                        onClick={handleUpload}
                                        isDisabled={loading}
                                    >
                                        {loading ? <Spinner size="sm" /> : "Yuklash"}
                                    </Button>
                                </>
                            )}

                            {error && (
                                <Alert status="error">
                                    <AlertIcon />
                                    {error}
                                </Alert>
                            )}

                            {result && (
                                <Box>
                                    <Alert status="success" mb={4}>
                                        <AlertIcon />
                                        {result.message}
                                    </Alert>

                                    <Box mb={3}>
                                        <Text><b>Jami:</b> {result.total}</Text>
                                        <Text color="green.500">
                                            <b>Created:</b> {result.created}
                                        </Text>
                                        <Text color="red.500">
                                            <b>Skipped:</b> {result.skipped}
                                        </Text>
                                    </Box>

                                    {result.details?.skipped?.length > 0 && (
                                        <>
                                            <Divider mb={3} />
                                            <Text fontWeight="bold" mb={2}>
                                                Xatolik sabablari:
                                            </Text>

                                            <Box
                                                maxH="300px"
                                                overflowY="auto"
                                                border="1px solid"
                                                borderColor="gray.200"
                                                p={3}
                                                borderRadius="md"
                                            >
                                                <VStack align="start" spacing={3}>
                                                    {result.details.skipped.map((item, index) => (
                                                        <Box
                                                            key={index}
                                                            p={2}
                                                            border="1px solid"
                                                            borderColor="gray.100"
                                                            borderRadius="md"
                                                            w="100%"
                                                        >
                                                            <Text fontSize="sm">
                                                                <b>Sabab:</b> {item.reason}
                                                            </Text>
                                                            <Text fontSize="xs" color="gray.600">
                                                                <b>Name:</b> {item.row?.name || "-"}
                                                            </Text>
                                                            <Text fontSize="xs" color="gray.600">
                                                                <b>Address:</b> {item.row?.address || "-"}
                                                            </Text>
                                                            <Text fontSize="xs" color="gray.600">
                                                                <b>Phone:</b> {item.row?.phone || "-"}
                                                            </Text>
                                                        </Box>
                                                    ))}
                                                </VStack>
                                            </Box>
                                        </>
                                    )}
                                </Box>
                            )}

                        </VStack>
                    </ModalBody>
                </ModalContent>
            </Modal>
        </Box>
    );
}
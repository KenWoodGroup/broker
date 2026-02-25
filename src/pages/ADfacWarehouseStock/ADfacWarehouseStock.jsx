import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import {
    Box,
    Container,
    Flex,
    Text,
    Button,
    Badge,
    Input,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    ModalCloseButton,
    VStack,
    HStack,
    Skeleton,
    SkeletonText,
    useDisclosure,
    Card,
    CardBody,
    Heading,
    Divider,
    Progress,
    Icon,
    Center,
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    Textarea,
    Image,
    SimpleGrid,
    Wrap,
    WrapItem,
} from '@chakra-ui/react';
import { ChevronLeftIcon, ChevronRightIcon, DownloadIcon, CheckCircleIcon } from '@chakra-ui/icons';
import { FiUpload, FiFile, FiPackage } from 'react-icons/fi';
import { apiStock } from '../../utils/Controllers/apiStock';
import { apiInvoices } from '../../utils/Controllers/apiInvoices';

const WarehouseStockPage = () => {
    const { factoryId, warehouseId } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const warehouseName = location.state?.warehouseName || 'Ombor';

    // State
    const [stocks, setStocks] = useState([]);
    const [pagination, setPagination] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const [lastSyncTime, setLastSyncTime] = useState(null);

    // Upload modal state
    const { isOpen: isUploadOpen, onOpen: onUploadOpen, onClose: onUploadClose } = useDisclosure();
    const [uploadStep, setUploadStep] = useState(1); // 1: create, 2: upload, 3: success
    const [invoiceNote, setInvoiceNote] = useState('');
    const [invoiceId, setInvoiceId] = useState(null);
    const [selectedFile, setSelectedFile] = useState(null);
    const [uploadLoading, setUploadLoading] = useState(false);
    const [uploadResult, setUploadResult] = useState(null);

    // Fetch stocks
    const fetchStocks = async () => {
        setLoading(true);
        try {
            const response = await apiStock.GetByLocationId(warehouseId, currentPage);
            setStocks(response.data?.data?.records || []);
            setPagination(response.data?.data?.pagination || null);
            setLastSyncTime(new Date());
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStocks();
    }, [currentPage, warehouseId]);

    // Handle upload modal open
    const handleUploadClick = () => {
        setUploadStep(1);
        setInvoiceNote('');
        setSelectedFile(null);
        setInvoiceId(null);
        setUploadResult(null);
        onUploadOpen();
    };

    // Step 1: Create invoice
    const handleCreateInvoice = async () => {
        setUploadLoading(true);
        try {
            const userId = Cookies.get('user_id');
            const data = {
                created_by: userId,
                note: invoiceNote,
                receiver_id: warehouseId,
                sender_id: factoryId,
                status: "received",
                type: "incoming",
            };

            const response = await apiInvoices.CreateInvoice(data);
            setInvoiceId(response.data?.invoice?.id);
            setUploadStep(2);
        } finally {
            setUploadLoading(false);
        }
    };

    // Handle file selection
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Validate file
            const validTypes = [
                'application/vnd.ms-excel',
                'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            ];
            const maxSize = 5 * 1024 * 1024; // 5MB

            if (!validTypes.includes(file.type)) {
                return;
            }

            if (file.size > maxSize) {
                return;
            }

            setSelectedFile(file);
        }
    };

    // Step 2: Upload Excel
    const handleUploadExcel = async () => {
        if (!selectedFile || !invoiceId) return;

        setUploadLoading(true);
        try {
            const formData = new FormData();
            formData.append('file', selectedFile);

            const response = await apiInvoices.UploadExel(invoiceId, formData);
            setUploadResult(response.data);
            setUploadStep(3);
            await fetchStocks(); // Refresh stocks
        } finally {
            setUploadLoading(false);
        }
    };

    // Close modal and reset
    const handleCloseUpload = () => {
        onUploadClose();
        setUploadStep(1);
        setInvoiceNote('');
        setSelectedFile(null);
        setInvoiceId(null);
        setUploadResult(null);
    };

    // Format date
    const formatDate = (dateString) => {
        if (!dateString) return '-';
        const date = new Date(dateString);
        return date.toLocaleDateString('uz-UZ', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <Box minH="100vh" bg="bg">
            {/* Header */}
            <Box bg="surface" borderBottom="1px" borderColor="border" position="sticky" top={0} zIndex={1}>
                <Container maxW="container.xl" py={4}>
                    <VStack align="stretch" spacing={3}>
                        {/* Breadcrumb */}
                        <Breadcrumb
                            spacing="8px"
                            separator={<ChevronRightIcon color="gray.500" />}
                            fontSize="sm"
                        >
                            <BreadcrumbItem>
                                <BreadcrumbLink onClick={() => navigate(-1)} color="link">
                                    Omborlar
                                </BreadcrumbLink>
                            </BreadcrumbItem>
                            <BreadcrumbItem isCurrentPage>
                                <BreadcrumbLink color="text">{warehouseName}</BreadcrumbLink>
                            </BreadcrumbItem>
                        </Breadcrumb>

                        {/* Title and actions */}
                        <HStack justify="space-between">
                            <VStack align="start" spacing={1}>
                                <Heading size="lg" color="text">{warehouseName}</Heading>
                                {lastSyncTime && (
                                    <Text fontSize="xs" color="gray.500">
                                        Oxirgi yangilanish: {formatDate(lastSyncTime)}
                                    </Text>
                                )}
                            </VStack>
                            <Button
                                leftIcon={<DownloadIcon />}
                                colorScheme="green"
                                onClick={handleUploadClick}
                            >
                                Excel yuklash
                            </Button>
                        </HStack>
                    </VStack>
                </Container>
            </Box>

            <Container maxW="container.xl" py={6}>
                {loading ? (
                    // Skeleton loading
                    <VStack spacing={4} align="stretch">
                        {[1, 2, 3, 4, 5].map((i) => (
                            <Card key={i} bg="surface">
                                <CardBody>
                                    <HStack justify="space-between">
                                        <SkeletonText noOfLines={3} width="40%" />
                                        <SkeletonText noOfLines={3} width="30%" />
                                        <SkeletonText noOfLines={3} width="20%" />
                                    </HStack>
                                </CardBody>
                            </Card>
                        ))}
                    </VStack>
                ) : stocks.length === 0 ? (
                    // Empty state
                    <Card bg="surface">
                        <CardBody>
                            <VStack spacing={4} py={12}>
                                <Icon as={FiPackage} boxSize={16} color="gray.300" />
                                <VStack spacing={2}>
                                    <Text fontSize="lg" fontWeight="medium" color="text">
                                        Hozircha mahsulotlar yo'q
                                    </Text>
                                    <Text fontSize="sm" color="gray.500">
                                        Excel orqali mahsulotlarni yuklang
                                    </Text>
                                </VStack>
                                <Button
                                    leftIcon={<DownloadIcon />}
                                    colorScheme="green"
                                    onClick={handleUploadClick}
                                >
                                    Excel yuklash
                                </Button>
                            </VStack>
                        </CardBody>
                    </Card>
                ) : (
                    // Stock list
                    <>
                        <VStack spacing={3} align="stretch">
                            {stocks.map((stock) => (
                                <Card
                                    key={stock.id}
                                    bg="surface"
                                    borderWidth="1px"
                                    borderColor="border"
                                    _hover={{ shadow: 'md' }}
                                    transition="all 0.2s"
                                >
                                    <CardBody>
                                        <SimpleGrid columns={{ base: 1, md: 4 }} spacing={4}>
                                            {/* Product Info */}
                                            <VStack align="start" spacing={1}>
                                                <Text fontSize="xs" color="gray.500" fontWeight="medium">
                                                    MAHSULOT
                                                </Text>
                                                <Text fontWeight="semibold" color="text" fontSize="lg">
                                                    {stock.product?.name}
                                                </Text>
                                                <Badge colorScheme="gray" fontSize="xs">
                                                    {stock.product?.unit}
                                                </Badge>
                                            </VStack>

                                            {/* Quantity & Batch */}
                                            <VStack align="start" spacing={1}>
                                                <Text fontSize="xs" color="gray.500" fontWeight="medium">
                                                    MIQDOR / PARTIYA
                                                </Text>
                                                <HStack>
                                                    <Text fontWeight="bold" color="blue.600" fontSize="xl">
                                                        {parseFloat(stock.quantity).toLocaleString()}
                                                    </Text>
                                                    <Text fontSize="sm" color="gray.600">
                                                        {stock.product?.unit}
                                                    </Text>
                                                </HStack>
                                                <Text fontSize="xs" color="gray.500">
                                                    Partiya: {stock.batch}
                                                </Text>
                                            </VStack>

                                            {/* Prices */}
                                            <VStack align="start" spacing={1}>
                                                <Text fontSize="xs" color="gray.500" fontWeight="medium">
                                                    NARXLAR
                                                </Text>
                                                <VStack align="start" spacing={1} width="100%">
                                                    <HStack justify="space-between" width="100%">
                                                        <Text fontSize="sm" color="gray.600">Xarid:</Text>
                                                        <Text fontWeight="semibold" color="text">
                                                            {parseFloat(stock.purchase_price).toLocaleString()} so'm
                                                        </Text>
                                                    </HStack>
                                                    {stock.sale_price_type && stock.sale_price_type.length > 0 ? (
                                                        stock.sale_price_type.map((priceType) => (
                                                            <HStack key={priceType.id} justify="space-between" width="100%">
                                                                <Text fontSize="sm" color="gray.600">
                                                                    {priceType.price_type?.name}:
                                                                </Text>
                                                                <Text fontWeight="semibold" color="green.600">
                                                                    {parseFloat(priceType.sale_price).toLocaleString()} so'm
                                                                </Text>
                                                            </HStack>
                                                        ))
                                                    ) : (
                                                        <Text fontSize="sm" color="orange.500" fontStyle="italic">
                                                            Sotuv narxi belgilanmagan
                                                        </Text>
                                                    )}
                                                </VStack>
                                            </VStack>

                                            {/* Date */}
                                            <VStack align="start" spacing={1}>
                                                <Text fontSize="xs" color="gray.500" fontWeight="medium">
                                                    SANA
                                                </Text>
                                                <Text fontSize="sm" color="text">
                                                    {formatDate(stock.createdAt)}
                                                </Text>
                                                {stock.barcode && (
                                                    <Text fontSize="xs" color="gray.500">
                                                        Barcode: {stock.barcode}
                                                    </Text>
                                                )}
                                            </VStack>
                                        </SimpleGrid>
                                    </CardBody>
                                </Card>
                            ))}
                        </VStack>

                        {/* Pagination */}
                        {pagination && pagination.total_pages > 1 && (
                            <HStack justify="center" mt={8}>
                                <Button
                                    size="sm"
                                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                    isDisabled={currentPage === 1}
                                    leftIcon={<ChevronLeftIcon />}
                                >
                                    Oldingi
                                </Button>
                                <Text fontSize="sm" color="text" px={4}>
                                    {currentPage} / {pagination.total_pages}
                                </Text>
                                <Button
                                    size="sm"
                                    onClick={() => setCurrentPage(p => p + 1)}
                                    isDisabled={currentPage >= pagination.total_pages}
                                    rightIcon={<ChevronRightIcon />}
                                >
                                    Keyingi
                                </Button>
                            </HStack>
                        )}
                    </>
                )}
            </Container>

            {/* Upload Excel Modal */}
            <Modal
                isOpen={isUploadOpen}
                onClose={uploadStep === 3 ? handleCloseUpload : onUploadClose}
                size="lg"
                closeOnOverlayClick={false}
            >
                <ModalOverlay />
                <ModalContent bg="surface">
                    <ModalHeader color="text">
                        {uploadStep === 1 && 'Invoice tayyorlash'}
                        {uploadStep === 2 && 'Excel yuklash'}
                        {uploadStep === 3 && 'Muvaffaqiyatli yuklandi'}
                    </ModalHeader>
                    {uploadStep !== 3 && <ModalCloseButton />}

                    <ModalBody>
                        {/* Progress indicator */}
                        <VStack spacing={4} mb={6}>
                            <HStack width="100%" justify="space-between">
                                {[1, 2, 3].map((step) => (
                                    <React.Fragment key={step}>
                                        <Circle
                                            size="40px"
                                            bg={uploadStep >= step ? 'blue.500' : 'gray.200'}
                                            color={uploadStep >= step ? 'white' : 'gray.500'}
                                            fontWeight="bold"
                                        >
                                            {uploadStep > step ? <CheckCircleIcon /> : step}
                                        </Circle>
                                        {step < 3 && (
                                            <Box
                                                flex={1}
                                                height="2px"
                                                bg={uploadStep > step ? 'blue.500' : 'gray.200'}
                                            />
                                        )}
                                    </React.Fragment>
                                ))}
                            </HStack>
                            <HStack width="100%" justify="space-between" fontSize="xs" color="gray.600">
                                <Text>Invoice</Text>
                                <Text>Excel</Text>
                                <Text>Natija</Text>
                            </HStack>
                        </VStack>

                        {/* Step 1: Create Invoice */}
                        {uploadStep === 1 && (
                            <VStack spacing={4}>
                                <Textarea
                                    placeholder="Izoh (ixtiyoriy)"
                                    value={invoiceNote}
                                    onChange={(e) => setInvoiceNote(e.target.value)}
                                    rows={4}
                                    bg="bg"
                                    color="text"
                                />
                            </VStack>
                        )}

                        {/* Step 2: Upload File */}
                        {uploadStep === 2 && (
                            <VStack spacing={4}>
                                <Input
                                    type="file"
                                    accept=".xls,.xlsx"
                                    onChange={handleFileChange}
                                    display="none"
                                    id="excel-upload"
                                />
                                <label htmlFor="excel-upload" style={{ width: '100%' }}>
                                    <Card
                                        bg="bg"
                                        borderWidth="2px"
                                        borderStyle="dashed"
                                        borderColor={selectedFile ? 'green.300' : 'gray.300'}
                                        cursor="pointer"
                                        _hover={{ borderColor: 'blue.400' }}
                                        transition="all 0.2s"
                                    >
                                        <CardBody>
                                            <VStack spacing={3} py={6}>
                                                <Icon
                                                    as={selectedFile ? FiFile : FiUpload}
                                                    boxSize={12}
                                                    color={selectedFile ? 'green.500' : 'gray.400'}
                                                />
                                                {selectedFile ? (
                                                    <>
                                                        <Text fontWeight="semibold" color="text">
                                                            {selectedFile.name}
                                                        </Text>
                                                        <Text fontSize="sm" color="gray.500">
                                                            {(selectedFile.size / 1024).toFixed(2)} KB
                                                        </Text>
                                                    </>
                                                ) : (
                                                    <>
                                                        <Text fontWeight="semibold" color="text">
                                                            Excel faylni yuklash
                                                        </Text>
                                                        <Text fontSize="sm" color="gray.500">
                                                            .xls yoki .xlsx (max 5MB)
                                                        </Text>
                                                    </>
                                                )}
                                            </VStack>
                                        </CardBody>
                                    </Card>
                                </label>

                                {uploadLoading && (
                                    <Box width="100%">
                                        <Progress size="sm" isIndeterminate colorScheme="blue" />
                                    </Box>
                                )}
                            </VStack>
                        )}

                        {/* Step 3: Success */}
                        {uploadStep === 3 && uploadResult && (
                            <VStack spacing={6}>
                                <Icon as={CheckCircleIcon} boxSize={20} color="green.500" />
                                <VStack spacing={2}>
                                    <Text fontSize="lg" fontWeight="semibold" color="text">
                                        {uploadResult.message}
                                    </Text>
                                    <Card bg="bg" width="100%">
                                        <CardBody>
                                            <SimpleGrid columns={2} spacing={4}>
                                                <VStack>
                                                    <Text fontSize="3xl" fontWeight="bold" color="green.600">
                                                        {uploadResult.created}
                                                    </Text>
                                                    <Text fontSize="sm" color="gray.600">
                                                        Yaratildi
                                                    </Text>
                                                </VStack>
                                                <VStack>
                                                    <Text fontSize="3xl" fontWeight="bold" color="orange.500">
                                                        {uploadResult.skipped}
                                                    </Text>
                                                    <Text fontSize="sm" color="gray.600">
                                                        Tashlab ketildi
                                                    </Text>
                                                </VStack>
                                            </SimpleGrid>
                                        </CardBody>
                                    </Card>
                                </VStack>
                            </VStack>
                        )}
                    </ModalBody>

                    <ModalFooter>
                        {uploadStep === 1 && (
                            <>
                                <Button variant="ghost" mr={3} onClick={onUploadClose}>
                                    Bekor qilish
                                </Button>
                                <Button
                                    colorScheme="blue"
                                    onClick={handleCreateInvoice}
                                    isLoading={uploadLoading}
                                >
                                    Invoice tayyorlash
                                </Button>
                            </>
                        )}

                        {uploadStep === 2 && (
                            <>
                                <Button
                                    variant="ghost"
                                    mr={3}
                                    onClick={onUploadClose}
                                    isDisabled={uploadLoading}
                                >
                                    Bekor qilish
                                </Button>
                                <Button
                                    colorScheme="green"
                                    onClick={handleUploadExcel}
                                    isDisabled={!selectedFile}
                                    isLoading={uploadLoading}
                                >
                                    Invoice yaratish
                                </Button>
                            </>
                        )}

                        {uploadStep === 3 && (
                            <Button colorScheme="blue" onClick={handleCloseUpload} width="100%">
                                Yopish
                            </Button>
                        )}
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </Box>
    );
};

// Circle component for progress indicator
const Circle = ({ size, bg, color, fontWeight, children }) => (
    <Flex
        width={size}
        height={size}
        borderRadius="full"
        bg={bg}
        color={color}
        fontWeight={fontWeight}
        align="center"
        justify="center"
    >
        {children}
    </Flex>
);

export default WarehouseStockPage;
import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import {
    Box,
    Container,
    Flex,
    Text,
    Button,
    Badge,
    Input,
    InputGroup,
    InputLeftElement,
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
    IconButton,
    Checkbox,
    Progress,
    Divider,
    Table,
    Thead,
    Tbody,
    Tr,
    Th,
    Td,
    TableContainer,
    Icon,
    Center,
    Tooltip,
    SimpleGrid,
    useBreakpointValue,
    Alert,
    AlertIcon,
    AlertTitle,
    AlertDescription,
    CloseButton as ChakraCloseButton,
} from '@chakra-ui/react';
import { SearchIcon, DeleteIcon, DownloadIcon, CheckCircleIcon, WarningIcon } from '@chakra-ui/icons';
import { FiUser, FiMapPin, FiPhone, FiUpload, FiFile, FiDollarSign } from 'react-icons/fi';
import { apiLocations } from '../../utils/Controllers/Locations';

// Debounce hook
const useDebounce = (value, delay) => {
    const [debouncedValue, setDebouncedValue] = useState(value);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);

    return debouncedValue;
};

const ClientsPage = () => {
    const { factoryId } = useParams();

    // State
    const [clients, setClients] = useState([]);
    const [pagination, setPagination] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const [searchText, setSearchText] = useState('');
    const debouncedSearch = useDebounce(searchText, 300);

    // Selection state
    const [selectedClients, setSelectedClients] = useState(new Set());
    const [isAllSelected, setIsAllSelected] = useState(false);

    // Delete modal state
    const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure();
    const [deleteLoading, setDeleteLoading] = useState(false);
    const [deleteProgress, setDeleteProgress] = useState({ current: 0, total: 0 });
    const [deleteResult, setDeleteResult] = useState(null);

    // Excel modal state
    const { isOpen: isExcelOpen, onOpen: onExcelOpen, onClose: onExcelClose } = useDisclosure();
    const [selectedFile, setSelectedFile] = useState(null);
    const [uploadLoading, setUploadLoading] = useState(false);
    const [uploadResult, setUploadResult] = useState(null);

    // Responsive
    const isMobile = useBreakpointValue({ base: true, md: false });

    // Fetch clients
    const fetchClients = async () => {
        setLoading(true);
        try {
            const search = debouncedSearch || 'all';
            const response = await apiLocations.getLocalClients(factoryId, search, currentPage);
            setClients(response.data?.data?.records || []);
            setPagination(response.data?.data?.pagination || null);
            setSelectedClients(new Set());
            setIsAllSelected(false);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchClients();
    }, [debouncedSearch, currentPage, factoryId]);

    // Reset to page 1 when search changes
    useEffect(() => {
        if (debouncedSearch !== searchText) {
            setCurrentPage(1);
        }
    }, [debouncedSearch]);

    // Handle select all
    const handleSelectAll = () => {
        if (isAllSelected) {
            setSelectedClients(new Set());
            setIsAllSelected(false);
        } else {
            const allIds = new Set(clients.map(c => c.id));
            setSelectedClients(allIds);
            setIsAllSelected(true);
        }
    };

    // Handle individual selection
    const handleSelectClient = (clientId) => {
        const newSelected = new Set(selectedClients);
        if (newSelected.has(clientId)) {
            newSelected.delete(clientId);
        } else {
            newSelected.add(clientId);
        }
        setSelectedClients(newSelected);
        setIsAllSelected(newSelected.size === clients.length);
    };

    // Handle bulk delete
    const handleBulkDelete = () => {
        setDeleteResult(null);
        onDeleteOpen();
    };

    const confirmBulkDelete = async () => {
        const clientsToDelete = Array.from(selectedClients);
        setDeleteLoading(true);
        setDeleteProgress({ current: 0, total: clientsToDelete.length });

        const results = {
            deleted: [],
            failed: [],
        };

        // Delete clients one by one
        for (let i = 0; i < clientsToDelete.length; i++) {
            const clientId = clientsToDelete[i];
            try {
                await apiLocations.Delete(clientId, "Mijoz");
                results.deleted.push(clientId);
            } catch (error) {
                results.failed.push(clientId);
            }
            setDeleteProgress({ current: i + 1, total: clientsToDelete.length });
        }

        setDeleteResult(results);
        setDeleteLoading(false);
        await fetchClients();
    };

    const handleCloseDelete = () => {
        onDeleteClose();
        setDeleteResult(null);
        setDeleteProgress({ current: 0, total: 0 });
    };

    // Handle individual delete
    const handleDeleteClient = async (clientId) => {
        setSelectedClients(new Set([clientId]));
        setDeleteResult(null);
        onDeleteOpen();
    };

    // Handle Excel upload
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
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

    const handleUploadExcel = async () => {
        if (!selectedFile) return;
        const file = new FormData();
        file.append('file', selectedFile)
        setUploadLoading(true);
        try {
            const response = await apiLocations.CreateLocalClientsByExcell(factoryId, file);
            setUploadResult(response.data);
            await fetchClients();
        } finally {
            setUploadLoading(false);
        }
    };

    const handleCloseExcel = () => {
        onExcelClose();
        setSelectedFile(null);
        setUploadResult(null);
    };

    // Format phone
    const formatPhone = (phone) => {
        if (!phone) return '';
        const cleaned = phone.replace(/\D/g, '');
        if (cleaned.length === 12) {
            return `+${cleaned.slice(0, 3)} (${cleaned.slice(3, 5)}) ${cleaned.slice(5, 8)}-${cleaned.slice(8, 10)}-${cleaned.slice(10)}`;
        }
        return phone;
    };

    // Calculate total balance
    const totalBalance = clients.reduce((sum, client) => sum + parseFloat(client.balance || 0), 0);

    return (
        <Box minH="100vh" bg="bg">
            {/* Header */}
            <Box bg="surface" borderBottom="1px" borderColor="border" position="sticky" top={0} zIndex={1}>
                <Container maxW="container.xl" py={4}>
                    <VStack align="stretch" spacing={4}>
                        <HStack justify="space-between">
                            <Heading size="lg" color="text">Mijozlar</Heading>
                            <Button
                                leftIcon={<DownloadIcon />}
                                colorScheme="green"
                                onClick={onExcelOpen}
                            >
                                Excel yuklash
                            </Button>
                        </HStack>

                        {/* Stats */}
                        <SimpleGrid columns={{ base: 2, md: 3 }} spacing={4}>
                            <Card bg="blue.50" _dark={{ bg: 'blue.900' }}>
                                <CardBody py={3}>
                                    <VStack spacing={0}>
                                        <Text fontSize="2xl" fontWeight="bold" color="blue.600" _dark={{ color: 'blue.300' }}>
                                            {pagination?.total_count || 0}
                                        </Text>
                                        <Text fontSize="sm" color="gray.600" _dark={{ color: 'gray.400' }}>
                                            Jami mijozlar
                                        </Text>
                                    </VStack>
                                </CardBody>
                            </Card>

                            <Card bg="green.50" _dark={{ bg: 'green.900' }}>
                                <CardBody py={3}>
                                    <VStack spacing={0}>
                                        <Text fontSize="2xl" fontWeight="bold" color="green.600" _dark={{ color: 'green.300' }}>
                                            {totalBalance.toLocaleString()}
                                        </Text>
                                        <Text fontSize="sm" color="gray.600" _dark={{ color: 'gray.400' }}>
                                            Jami balans (so'm) sahifaga ko'ra
                                        </Text>
                                    </VStack>
                                </CardBody>
                            </Card>

                            {/* <Card bg="purple.50" _dark={{ bg: 'purple.900' }}>
                                <CardBody py={3}>
                                    <VStack spacing={0}>
                                        <Text fontSize="2xl" fontWeight="bold" color="purple.600" _dark={{ color: 'purple.300' }}>
                                            {selectedClients.size}
                                        </Text>
                                        <Text fontSize="sm" color="gray.600" _dark={{ color: 'gray.400' }}>
                                            Tanlangan
                                        </Text>
                                    </VStack>
                                </CardBody>
                            </Card> */}
                        </SimpleGrid>

                        {/* Search and bulk actions */}
                        <HStack spacing={4}>
                            <InputGroup flex={1}>
                                <InputLeftElement pointerEvents="none">
                                    <SearchIcon color="gray.400" />
                                </InputLeftElement>
                                <Input
                                    placeholder="Mijoz ismi bo'yicha qidirish..."
                                    value={searchText}
                                    onChange={(e) => setSearchText(e.target.value)}
                                    bg="bg"
                                    color="text"
                                />
                            </InputGroup>

                            {selectedClients.size > 0 && (
                                <Button
                                    leftIcon={<DeleteIcon />}
                                    colorScheme="red"
                                    onClick={handleBulkDelete}
                                >
                                    O'chirish ({selectedClients.size})
                                </Button>
                            )}
                        </HStack>
                    </VStack>
                </Container>
            </Box>

            <Container maxW="container.xl" py={6}>
                {loading ? (
                    // Skeleton loading
                    <VStack spacing={3} align="stretch">
                        {[1, 2, 3, 4, 5].map((i) => (
                            <Card key={i} bg="surface">
                                <CardBody>
                                    <HStack justify="space-between">
                                        <SkeletonText noOfLines={2} width="30%" />
                                        <SkeletonText noOfLines={2} width="25%" />
                                        <SkeletonText noOfLines={2} width="20%" />
                                        <Skeleton boxSize={8} />
                                    </HStack>
                                </CardBody>
                            </Card>
                        ))}
                    </VStack>
                ) : clients.length === 0 ? (
                    // Empty state
                    <Card bg="surface">
                        <CardBody>
                            <VStack spacing={4} py={12}>
                                <Icon as={FiUser} boxSize={16} color="gray.300" />
                                <VStack spacing={2}>
                                    <Text fontSize="lg" fontWeight="medium" color="text">
                                        {searchText ? 'Mijoz topilmadi' : 'Hozircha mijozlar yo\'q'}
                                    </Text>
                                    <Text fontSize="sm" color="gray.500">
                                        {searchText ? 'Boshqa nom bilan qidiring' : 'Excel orqali mijozlarni yuklang'}
                                    </Text>
                                </VStack>
                            </VStack>
                        </CardBody>
                    </Card>
                ) : isMobile ? (
                    // Mobile: Cards view
                    <>
                        <VStack spacing={3} align="stretch">
                            {clients.map((client) => (
                                <Card
                                    key={client.id}
                                    bg="surface"
                                    borderWidth="1px"
                                    borderColor="border"
                                    position="relative"
                                >
                                    <CardBody>
                                        <VStack align="stretch" spacing={3}>
                                            <HStack justify="space-between" align="start">
                                                <HStack flex={1}>
                                                    <Checkbox
                                                        isChecked={selectedClients.has(client.id)}
                                                        onChange={() => handleSelectClient(client.id)}
                                                        colorScheme="blue"
                                                    />
                                                    <VStack align="start" spacing={0} flex={1}>
                                                        <Text fontWeight="semibold" color="text" fontSize="lg">
                                                            {client.name}
                                                        </Text>
                                                        <Badge colorScheme="blue" fontSize="xs">
                                                            {client.client_type?.name || 'Noma\'lum'}
                                                        </Badge>
                                                    </VStack>
                                                </HStack>
                                                <IconButton
                                                    icon={<DeleteIcon />}
                                                    size="sm"
                                                    colorScheme="red"
                                                    variant="ghost"
                                                    onClick={() => handleDeleteClient(client.id)}
                                                    aria-label="O'chirish"
                                                />
                                            </HStack>

                                            <Divider />

                                            <VStack align="stretch" spacing={2} fontSize="sm">
                                                <HStack>
                                                    <Icon as={FiMapPin} boxSize={4} color="gray.500" />
                                                    <Text color="text">{client.address}</Text>
                                                </HStack>
                                                <HStack>
                                                    <Icon as={FiPhone} boxSize={4} color="gray.500" />
                                                    <Text color="text">{formatPhone(client.phone)}</Text>
                                                </HStack>
                                                <HStack justify="space-between">
                                                    <HStack>
                                                        <Icon as={FiDollarSign} boxSize={4} color="gray.500" />
                                                        <Text fontSize="sm" color="gray.600">Balans:</Text>
                                                    </HStack>
                                                    <Text
                                                        fontWeight="bold"
                                                        color={
                                                            parseFloat(client.balance) > 0
                                                                ? 'green.500'
                                                                : parseFloat(client.balance) < 0
                                                                    ? 'red.500'
                                                                    : 'gray.500'
                                                        }
                                                    >
                                                        {parseFloat(client.balance).toLocaleString()} so'm
                                                    </Text>
                                                </HStack>
                                            </VStack>
                                        </VStack>
                                    </CardBody>
                                </Card>
                            ))}
                        </VStack>
                    </>
                ) : (
                    // Desktop: Table view
                    <Card bg="surface">
                        <TableContainer>
                            <Table variant="simple">
                                <Thead position="sticky" top={0} bg="surface" zIndex={1}>
                                    <Tr>
                                        <Th>
                                            <Checkbox
                                                isChecked={isAllSelected}
                                                onChange={handleSelectAll}
                                                colorScheme="blue"
                                            />
                                        </Th>
                                        <Th color="text">Mijoz nomi</Th>
                                        <Th color="text">Turi</Th>
                                        <Th color="text">Manzil</Th>
                                        <Th color="text">Telefon</Th>
                                        <Th color="text" isNumeric>Balans</Th>
                                        <Th color="text">Amallar</Th>
                                    </Tr>
                                </Thead>
                                <Tbody>
                                    {clients.map((client) => (
                                        <Tr
                                            key={client.id}
                                            _hover={{ bg: 'gray.50', _dark: { bg: 'gray.700' } }}
                                            transition="all 0.2s"
                                        >
                                            <Td>
                                                <Checkbox
                                                    isChecked={selectedClients.has(client.id)}
                                                    onChange={() => handleSelectClient(client.id)}
                                                    colorScheme="blue"
                                                />
                                            </Td>
                                            <Td>
                                                <VStack align="start" spacing={0}>
                                                    <Text fontWeight="semibold" color="text">
                                                        {client.name}
                                                    </Text>
                                                </VStack>
                                            </Td>
                                            <Td>
                                                <Badge colorScheme="blue" fontSize="xs">
                                                    {client.client_type?.name || 'Noma\'lum'}
                                                </Badge>
                                            </Td>
                                            <Td>
                                                <HStack>
                                                    <Icon as={FiMapPin} boxSize={3} color="gray.500" />
                                                    <Text fontSize="sm" color="text" noOfLines={1}>
                                                        {client.address}
                                                    </Text>
                                                </HStack>
                                            </Td>
                                            <Td>
                                                <HStack>
                                                    <Icon as={FiPhone} boxSize={3} color="gray.500" />
                                                    <Text fontSize="sm" color="text">
                                                        {formatPhone(client.phone)}
                                                    </Text>
                                                </HStack>
                                            </Td>
                                            <Td isNumeric>
                                                <Text
                                                    fontWeight="semibold"
                                                    color={
                                                        parseFloat(client.balance) > 0
                                                            ? 'green.500'
                                                            : parseFloat(client.balance) < 0
                                                                ? 'red.500'
                                                                : 'gray.500'
                                                    }
                                                >
                                                    {parseFloat(client.balance).toLocaleString()}
                                                </Text>
                                            </Td>
                                            <Td>
                                                <IconButton
                                                    icon={<DeleteIcon />}
                                                    size="sm"
                                                    colorScheme="red"
                                                    variant="ghost"
                                                    onClick={() => handleDeleteClient(client.id)}
                                                    aria-label="O'chirish"
                                                />
                                            </Td>
                                        </Tr>
                                    ))}
                                </Tbody>
                            </Table>
                        </TableContainer>
                    </Card>
                )}

                {/* Pagination */}
                {pagination && pagination.total_pages > 1 && (
                    <HStack justify="center" mt={8}>
                        <Button
                            size="sm"
                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                            isDisabled={currentPage === 1}
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
                        >
                            Keyingi
                        </Button>
                    </HStack>
                )}
            </Container>

            {/* Delete Modal */}
            <Modal isOpen={isDeleteOpen} onClose={handleCloseDelete} size="lg" closeOnOverlayClick={false}>
                <ModalOverlay />
                <ModalContent bg="surface">
                    <ModalHeader color="text">
                        {deleteResult ? 'O\'chirish natijasi' : 'Mijozlarni o\'chirish'}
                    </ModalHeader>
                    {!deleteResult && <ModalCloseButton />}

                    <ModalBody>
                        {!deleteResult ? (
                            <VStack spacing={4}>
                                <Alert status="warning">
                                    <AlertIcon />
                                    <AlertDescription>
                                        {selectedClients.size} ta mijozni o'chirmoqchimisiz?
                                        Bu amalni ortga qaytarib bo'lmaydi.
                                    </AlertDescription>
                                </Alert>

                                {deleteLoading && (
                                    <Box width="100%">
                                        <Text fontSize="sm" color="gray.600" mb={2}>
                                            O'chirilmoqda: {deleteProgress.current} / {deleteProgress.total}
                                        </Text>
                                        <Progress
                                            value={(deleteProgress.current / deleteProgress.total) * 100}
                                            size="sm"
                                            colorScheme="blue"
                                            hasStripe
                                            isAnimated
                                        />
                                    </Box>
                                )}
                            </VStack>
                        ) : (
                            <VStack spacing={4} align="stretch">
                                <Alert status={deleteResult.failed.length === 0 ? 'success' : 'warning'}>
                                    <AlertIcon />
                                    <AlertDescription>
                                        O'chirish jarayoni yakunlandi
                                    </AlertDescription>
                                </Alert>

                                <SimpleGrid columns={2} spacing={4}>
                                    <Card bg="green.50" _dark={{ bg: 'green.900' }}>
                                        <CardBody py={3}>
                                            <VStack spacing={0}>
                                                <Text fontSize="3xl" fontWeight="bold" color="green.600" _dark={{ color: 'green.300' }}>
                                                    {deleteResult.deleted.length}
                                                </Text>
                                                <Text fontSize="sm" color="gray.600" _dark={{ color: 'gray.400' }}>
                                                    O'chirildi
                                                </Text>
                                            </VStack>
                                        </CardBody>
                                    </Card>

                                    <Card bg="red.50" _dark={{ bg: 'red.900' }}>
                                        <CardBody py={3}>
                                            <VStack spacing={0}>
                                                <Text fontSize="3xl" fontWeight="bold" color="red.600" _dark={{ color: 'red.300' }}>
                                                    {deleteResult.failed.length}
                                                </Text>
                                                <Text fontSize="sm" color="gray.600" _dark={{ color: 'gray.400' }}>
                                                    Xatolik
                                                </Text>
                                            </VStack>
                                        </CardBody>
                                    </Card>
                                </SimpleGrid>
                            </VStack>
                        )}
                    </ModalBody>

                    <ModalFooter>
                        {!deleteResult ? (
                            <>
                                <Button variant="ghost" mr={3} onClick={handleCloseDelete} isDisabled={deleteLoading}>
                                    Bekor qilish
                                </Button>
                                <Button
                                    colorScheme="red"
                                    onClick={confirmBulkDelete}
                                    isLoading={deleteLoading}
                                >
                                    Ha, o'chirish
                                </Button>
                            </>
                        ) : (
                            <Button colorScheme="blue" onClick={handleCloseDelete} width="100%">
                                Yopish
                            </Button>
                        )}
                    </ModalFooter>
                </ModalContent>
            </Modal>

            {/* Excel Upload Modal */}
            <Modal isOpen={isExcelOpen} onClose={handleCloseExcel} size="lg" closeOnOverlayClick={false}>
                <ModalOverlay />
                <ModalContent bg="surface">
                    <ModalHeader color="text">
                        {uploadResult ? 'Yuklash natijasi' : 'Excel yuklash'}
                    </ModalHeader>
                    {!uploadResult && <ModalCloseButton />}

                    <ModalBody>
                        {!uploadResult ? (
                            <VStack spacing={4}>
                                <Input
                                    type="file"
                                    accept=".xls,.xlsx"
                                    onChange={handleFileChange}
                                    display="none"
                                    id="excel-upload-clients"
                                />
                                <label htmlFor="excel-upload-clients" style={{ width: '100%' }}>
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
                                            <VStack spacing={3} py={8}>
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
                                        <Progress size="sm" isIndeterminate colorScheme="green" />
                                    </Box>
                                )}
                            </VStack>
                        ) : (
                            <VStack spacing={4} align="stretch">
                                <Alert status={uploadResult.skipped === 0 ? 'success' : 'warning'}>
                                    <AlertIcon />
                                    <AlertDescription>
                                        {uploadResult.message}
                                    </AlertDescription>
                                </Alert>

                                <SimpleGrid columns={3} spacing={4}>
                                    <Card bg="blue.50" _dark={{ bg: 'blue.900' }}>
                                        <CardBody py={3}>
                                            <VStack spacing={0}>
                                                <Text fontSize="2xl" fontWeight="bold" color="blue.600" _dark={{ color: 'blue.300' }}>
                                                    {uploadResult.total}
                                                </Text>
                                                <Text fontSize="xs" color="gray.600" _dark={{ color: 'gray.400' }}>
                                                    Jami
                                                </Text>
                                            </VStack>
                                        </CardBody>
                                    </Card>

                                    <Card bg="green.50" _dark={{ bg: 'green.900' }}>
                                        <CardBody py={3}>
                                            <VStack spacing={0}>
                                                <Text fontSize="2xl" fontWeight="bold" color="green.600" _dark={{ color: 'green.300' }}>
                                                    {uploadResult.created}
                                                </Text>
                                                <Text fontSize="xs" color="gray.600" _dark={{ color: 'gray.400' }}>
                                                    Yaratildi
                                                </Text>
                                            </VStack>
                                        </CardBody>
                                    </Card>

                                    <Card bg="orange.50" _dark={{ bg: 'orange.900' }}>
                                        <CardBody py={3}>
                                            <VStack spacing={0}>
                                                <Text fontSize="2xl" fontWeight="bold" color="orange.600" _dark={{ color: 'orange.300' }}>
                                                    {uploadResult.skipped}
                                                </Text>
                                                <Text fontSize="xs" color="gray.600" _dark={{ color: 'gray.400' }}>
                                                    Tashlab ketildi
                                                </Text>
                                            </VStack>
                                        </CardBody>
                                    </Card>
                                </SimpleGrid>

                                {/* Scrollable details */}
                                <Box maxH="400px" overflowY="auto">
                                    <VStack spacing={4} align="stretch">
                                        {/* Created clients */}
                                        {uploadResult.details?.created?.length > 0 && (
                                            <VStack align="stretch" spacing={2}>
                                                <HStack>
                                                    <CheckCircleIcon color="green.500" />
                                                    <Text fontWeight="semibold" color="text">
                                                        Yaratilgan mijozlar ({uploadResult.details.created.length})
                                                    </Text>
                                                </HStack>
                                                {uploadResult.details.created.map((client, index) => (
                                                    <Card key={index} bg="green.50" _dark={{ bg: 'green.900' }} size="sm">
                                                        <CardBody py={2}>
                                                            <VStack align="start" spacing={0}>
                                                                <Text fontSize="sm" fontWeight="medium" color="text">
                                                                    {client.name}
                                                                </Text>
                                                                <Text fontSize="xs" color="gray.600">
                                                                    {client.phone} • {client.address}
                                                                </Text>
                                                            </VStack>
                                                        </CardBody>
                                                    </Card>
                                                ))}
                                            </VStack>
                                        )}

                                        {/* Skipped clients */}
                                        {uploadResult.details?.skipped?.length > 0 && (
                                            <VStack align="stretch" spacing={2}>
                                                <HStack>
                                                    <WarningIcon color="orange.500" />
                                                    <Text fontWeight="semibold" color="text">
                                                        Tashlab ketilgan ({uploadResult.details.skipped.length})
                                                    </Text>
                                                </HStack>
                                                {uploadResult.details.skipped.map((item, index) => (
                                                    <Card key={index} bg="orange.50" _dark={{ bg: 'orange.900' }} size="sm">
                                                        <CardBody py={2}>
                                                            <VStack align="start" spacing={1}>
                                                                <Text fontSize="sm" fontWeight="medium" color="text">
                                                                    {item.row?.name || 'Noma\'lum'}
                                                                </Text>
                                                                <Text fontSize="xs" color="orange.600" _dark={{ color: 'orange.300' }}>
                                                                    Sabab: {item.reason}
                                                                </Text>
                                                                <Text fontSize="xs" color="gray.600">
                                                                    {item.row?.phone} • {item.row?.address}
                                                                </Text>
                                                            </VStack>
                                                        </CardBody>
                                                    </Card>
                                                ))}
                                            </VStack>
                                        )}
                                    </VStack>
                                </Box>
                            </VStack>
                        )}
                    </ModalBody>

                    <ModalFooter>
                        {!uploadResult ? (
                            <>
                                <Button variant="ghost" mr={3} onClick={handleCloseExcel} isDisabled={uploadLoading}>
                                    Bekor qilish
                                </Button>
                                <Button
                                    colorScheme="green"
                                    onClick={handleUploadExcel}
                                    isDisabled={!selectedFile}
                                    isLoading={uploadLoading}
                                >
                                    Yuklash
                                </Button>
                            </>
                        ) : (
                            <Button colorScheme="blue" onClick={handleCloseExcel} width="100%">
                                Yopish
                            </Button>
                        )}
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </Box>
    );
};

export default ClientsPage;
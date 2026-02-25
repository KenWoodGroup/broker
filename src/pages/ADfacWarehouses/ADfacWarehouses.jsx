import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Box,
    Container,
    Flex,
    Text,
    Button,
    Image,
    Badge,
    Input,
    Select,
    FormControl,
    FormLabel,
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
    SimpleGrid,
    Card,
    CardBody,
    Stack,
    Heading,
    IconButton,
    Divider,
    Switch,
    InputGroup,
    InputLeftElement,
    Tooltip,
    Icon,
    Center,
} from '@chakra-ui/react';
import {
    AddIcon,
    EditIcon,
    DeleteIcon,
    PhoneIcon,
    StarIcon,
} from '@chakra-ui/icons';
import { FiBox, FiPackage, FiMapPin, FiLock } from 'react-icons/fi';
import { apiLocations } from '../../utils/Controllers/Locations';
import { apiOptions } from '../../utils/Controllers/apiOptions';
import regions from '../../constants/regions/regions.json'
import districts from '../../constants/regions/districts.json'
import toast from 'react-hot-toast';
import { toastService } from '../../utils/toast';

const WarehousesPage = () => {
    const { factoryId } = useParams();
    const navigate = useNavigate();

    // State
    const [warehouses, setWarehouses] = useState([]);
    const [pagination, setPagination] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const [factoryOptions, setFactoryOptions] = useState([]);
    const [hasRawMaterialOption, setHasRawMaterialOption] = useState(false);

    // Modal states
    const { isOpen: isAddOpen, onOpen: onAddOpen, onClose: onAddClose } = useDisclosure();
    const { isOpen: isEditOpen, onOpen: onEditOpen, onClose: onEditClose } = useDisclosure();
    const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure();

    // Form states
    const [formData, setFormData] = useState({
        name: '',
        full_name: '',
        phone: '',
        username: '',
        password: '',
        confirmPassword: '',
        type: 'warehouse',
        regionId: '',
        districtId: '',
        is_main: false,
    });
    const [currentWarehouse, setCurrentWarehouse] = useState(null);
    const [filteredDistricts, setFilteredDistricts] = useState([]);
    const [formLoading, setFormLoading] = useState(false);

    // Fetch warehouses
    const fetchWarehouses = async () => {
        setLoading(true);
        try {
            const response = await apiLocations.pageFactoryWarehouses(currentPage, factoryId);
            setWarehouses(response.data?.data?.records || []);
            setPagination(response.data?.data?.pagination || null);
        } finally {
            setLoading(false);
        }
    };

    // Fetch factory options
    const fetchFactoryOptions = async () => {
        try {
            const response = await apiOptions.getLocalOptions(factoryId);
            const options = response.data || [];
            setFactoryOptions(options);

            // Check if "Xom ashyo" option exists
            const hasRawMaterial = options.some(
                opt => opt.option?.name === "Xom ashyo"
            );
            setHasRawMaterialOption(hasRawMaterial);
        } catch (error) {
            console.error('Options fetch error:', error);
        }
    };

    useEffect(() => {
        fetchWarehouses();
        fetchFactoryOptions();
    }, [currentPage, factoryId]);

    // Filter districts when region changes
    useEffect(() => {
        if (formData.regionId) {
            const filtered = districts.filter(
                d => d.region_id === parseInt(formData.regionId)
            );
            setFilteredDistricts(filtered);
        } else {
            setFilteredDistricts([]);
        }
    }, [formData.regionId]);

    // Reset form
    const resetForm = () => {
        setFormData({
            name: '',
            full_name: '',
            phone: '',
            username: '',
            password: '',
            confirmPassword: '',
            type: 'warehouse',
            regionId: '',
            districtId: '',
            is_main: false,
        });
        setFilteredDistricts([]);
    };

    // Parse address to get region and district
    const parseAddress = (address) => {
        if (!address) return { regionId: '', districtId: '' };

        const parts = address.split(',').map(p => p.trim());
        if (parts.length < 2) return { regionId: '', districtId: '' };

        const regionName = parts[0];
        const districtName = parts[1];

        const region = regions.find(r => r.name_uz === regionName);
        const district = districts.find(d => d.name_uz === districtName);

        return {
            regionId: region?.id?.toString() || '',
            districtId: district?.id?.toString() || '',
        };
    };

    // Handle add
    const handleAddClick = () => {
        resetForm();
        onAddOpen();
    };

    const handleAddSubmit = async () => {
        // Validation
        if (!formData.name || !formData.full_name || !formData.phone ||
            !formData.username || !formData.password || !formData.regionId || !formData.districtId) {
            toastService.error("Ma'lumotlar to'liq kiritlmagan");
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            toastService.error("Tastiqlash paroli mos emas")
            return;
        }

        setFormLoading(true);
        try {
            const selectedRegion = regions.find(r => r.id === parseInt(formData.regionId));
            const selectedDistrict = filteredDistricts.find(d => d.id === parseInt(formData.districtId));

            const address = `${selectedRegion.name_uz}, ${selectedDistrict.name_uz}`;

            const data = {
                name: formData.name,
                full_name: formData.full_name,
                phone: formData.phone,
                username: formData.username,
                password: formData.password,
                type: formData.type,
                address,
                parent_id: factoryId,
            };

            await apiLocations.Add(data, "Ombor");
            await fetchWarehouses();
            onAddClose();
            resetForm();
        } finally {
            setFormLoading(false);
        }
    };

    // Handle edit
    const handleEditClick = (warehouse) => {
        const { regionId, districtId } = parseAddress(warehouse.address);

        setCurrentWarehouse(warehouse);
        setFormData({
            name: warehouse.name,
            phone: warehouse.phone,
            regionId,
            districtId,
            is_main: warehouse.is_main,
        });
        onEditOpen();
    };

    const handleEditSubmit = async () => {
        if (!formData.name || !formData.phone || !formData.regionId || !formData.districtId) {
            return;
        }

        setFormLoading(true);
        try {
            const selectedRegion = regions.find(r => r.id === parseInt(formData.regionId));
            const selectedDistrict = filteredDistricts.find(d => d.id === parseInt(formData.districtId));

            const address = `${selectedRegion.name_uz}, ${selectedDistrict.name_uz}`;

            const data = {
                name: formData.name,
                phone: formData.phone,
                address,
                is_main: formData.is_main,
            };

            await apiLocations.Update(data, currentWarehouse.id, "Ombor");
            await fetchWarehouses();
            onEditClose();
            resetForm();
            setCurrentWarehouse(null);
        } finally {
            setFormLoading(false);
        }
    };

    // Handle delete
    const handleDeleteClick = (warehouse) => {
        setCurrentWarehouse(warehouse);
        onDeleteOpen();
    };

    const handleDeleteConfirm = async () => {
        try {
            await apiLocations.Delete(currentWarehouse.id, "Ombor");
            await fetchWarehouses();
            onDeleteClose();
            setCurrentWarehouse(null);
        } catch (error) {
            console.error('Delete error:', error);
        }
    };

    // Navigate to warehouse stock
    const handleNavigateToStock = (warehouse) => {
        navigate(`/factories/${factoryId}/warehouses/${warehouse.id}`, {
            state: { warehouseName: warehouse.name }
        });
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

    // Get warehouse type info
    const getWarehouseTypeInfo = (type) => {
        if (type === 'm_warehouse') {
            return {
                label: 'Xomashyo ombori',
                icon: FiPackage,
                color: 'green',
                buttonLabel: 'Xomashyolar',
            };
        }
        return {
            label: 'Mahsulot ombori',
            icon: FiBox,
            color: 'blue',
            buttonLabel: 'Mahsulotlar',
        };
    };

    // Check if warehouse is disabled
    const isWarehouseDisabled = (warehouse) => {
        return warehouse.type === 'm_warehouse' && !hasRawMaterialOption;
    };

    return (
        <Box minH="100vh" bg="bg">
            {/* Header */}
            <Box bg="surface" borderBottom="1px" borderColor="border" position="sticky" top={0} zIndex={1}>
                <Container maxW="container.xl" py={4}>
                    <HStack justify="space-between">
                        <Heading size="lg" color="text">Omborlar</Heading>
                        <Button
                            leftIcon={<AddIcon />}
                            colorScheme="blue"
                            onClick={handleAddClick}
                        >
                            Ombor yaratish
                        </Button>
                    </HStack>
                </Container>
            </Box>

            <Container maxW="container.xl" py={6}>
                {loading ? (
                    // Skeleton loading
                    <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
                        {[1, 2, 3, 4, 5, 6].map((i) => (
                            <Card key={i} bg="surface">
                                <CardBody>
                                    <VStack align="stretch" spacing={4}>
                                        <HStack justify="space-between">
                                            <SkeletonText noOfLines={2} width="60%" />
                                            <HStack>
                                                <Skeleton boxSize={8} borderRadius="md" />
                                                <Skeleton boxSize={8} borderRadius="md" />
                                            </HStack>
                                        </HStack>
                                        <Divider />
                                        <SkeletonText noOfLines={3} />
                                    </VStack>
                                </CardBody>
                            </Card>
                        ))}
                    </SimpleGrid>
                ) : warehouses.length === 0 ? (
                    // Empty state
                    <Card bg="surface">
                        <CardBody>
                            <VStack spacing={4} py={12}>
                                <Icon as={FiBox} boxSize={16} color="gray.300" />
                                <VStack spacing={2}>
                                    <Text fontSize="lg" fontWeight="medium" color="text">
                                        Hozircha omborlar yo'q
                                    </Text>
                                    <Text fontSize="sm" color="gray.500">
                                        Yangi ombor yaratish uchun yuqoridagi tugmani bosing
                                    </Text>
                                </VStack>
                                <Button
                                    leftIcon={<AddIcon />}
                                    colorScheme="blue"
                                    onClick={handleAddClick}
                                >
                                    Ombor yaratish
                                </Button>
                            </VStack>
                        </CardBody>
                    </Card>
                ) : (
                    // Warehouses grid
                    <>
                        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
                            {warehouses.map((warehouse) => {
                                const typeInfo = getWarehouseTypeInfo(warehouse.type);
                                const disabled = isWarehouseDisabled(warehouse);

                                return (
                                    <Card
                                        key={warehouse.id}
                                        bg="surface"
                                        borderWidth="2px"
                                        borderColor={`${typeInfo.color}.200`}
                                        opacity={disabled ? 0.6 : 1}
                                        _hover={!disabled ? { shadow: 'lg', borderColor: `${typeInfo.color}.400` } : {}}
                                        transition="all 0.2s"
                                        position="relative"
                                        role='group'
                                    >
                                        <CardBody>
                                            <VStack align="stretch" spacing={4}>
                                                {/* Header with hover actions */}
                                                <HStack justify="space-between" align="start">
                                                    <VStack align="start" spacing={1} flex={1}>
                                                        <HStack>
                                                            <Icon as={typeInfo.icon} boxSize={5} color={`${typeInfo.color}.500`} />
                                                            <Heading size="md" color="text">
                                                                {warehouse.name}
                                                            </Heading>
                                                        </HStack>
                                                        <Badge colorScheme={typeInfo.color} fontSize="xs">
                                                            {typeInfo.label}
                                                        </Badge>
                                                        {warehouse.is_main && (
                                                            <Badge colorScheme="yellow" fontSize="xs">
                                                                <HStack spacing={1}>
                                                                    <StarIcon boxSize={2.5} />
                                                                    <Text>Asosiy</Text>
                                                                </HStack>
                                                            </Badge>
                                                        )}
                                                        {disabled && (
                                                            <Tooltip label="Xom ashyo opsiyasi o'chirilgan" placement="top">
                                                                <Badge colorScheme="gray" fontSize="xs">
                                                                    <HStack spacing={1}>
                                                                        <Icon as={FiLock} boxSize={2.5} />
                                                                        <Text>Faol emas</Text>
                                                                    </HStack>
                                                                </Badge>
                                                            </Tooltip>
                                                        )}
                                                    </VStack>

                                                    {!disabled && (
                                                        <HStack
                                                            spacing={1}
                                                            className="hover-actions"
                                                            opacity={0}
                                                            transition="opacity 0.2s"
                                                            // sx={{
                                                            //     'Card:hover &': {
                                                            //         opacity: 1
                                                            //     }
                                                            // }}
                                                            _groupHover={{opacity:1}}
                                                        >
                                                            <IconButton
                                                                icon={<EditIcon />}
                                                                size="sm"
                                                                colorScheme="blue"
                                                                variant="ghost"
                                                                onClick={() => handleEditClick(warehouse)}
                                                                aria-label="Tahrirlash"
                                                            />
                                                            <IconButton
                                                                icon={<DeleteIcon />}
                                                                size="sm"
                                                                colorScheme="red"
                                                                variant="ghost"
                                                                onClick={() => handleDeleteClick(warehouse)}
                                                                aria-label="O'chirish"
                                                            />
                                                        </HStack>
                                                    )}
                                                </HStack>

                                                <Divider />

                                                {/* Details */}
                                                <VStack align="stretch" spacing={2}>
                                                    <HStack>
                                                        <Icon as={FiMapPin} boxSize={4} color="gray.500" />
                                                        <Text fontSize="sm" color="text">
                                                            {warehouse.address}
                                                        </Text>
                                                    </HStack>
                                                    <HStack>
                                                        <PhoneIcon boxSize={4} color="gray.500" />
                                                        <Text fontSize="sm" color="text">
                                                            {formatPhone(warehouse.phone)}
                                                        </Text>
                                                    </HStack>
                                                    <HStack justify="space-between">
                                                        <Text fontSize="sm" fontWeight="medium" color="gray.600">
                                                            Balans:
                                                        </Text>
                                                        <Text
                                                            fontSize="md"
                                                            fontWeight="bold"
                                                            color={
                                                                parseFloat(warehouse.balance) > 0
                                                                    ? 'green.500'
                                                                    : parseFloat(warehouse.balance) < 0
                                                                        ? 'red.500'
                                                                        : 'gray.500'
                                                            }
                                                        >
                                                            {parseFloat(warehouse.balance).toLocaleString()} so'm
                                                        </Text>
                                                    </HStack>
                                                </VStack>

                                                <Divider />

                                                {/* Navigate button */}
                                                <Button
                                                    colorScheme={typeInfo.color}
                                                    size="sm"
                                                    onClick={() => handleNavigateToStock(warehouse)}
                                                    isDisabled={disabled}
                                                >
                                                    {typeInfo.buttonLabel}
                                                </Button>
                                            </VStack>
                                        </CardBody>
                                    </Card>
                                );
                            })}
                        </SimpleGrid>

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
                                <Text fontSize="sm" color="text">
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
                    </>
                )}
            </Container>

            {/* Add Modal */}
            <Modal isOpen={isAddOpen} onClose={onAddClose} size="xl">
                <ModalOverlay />
                <ModalContent bg="surface">
                    <ModalHeader color="text">Yangi ombor yaratish</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <VStack spacing={4}>
                            {hasRawMaterialOption && (
                                <FormControl isRequired>
                                    <FormLabel color="text">Ombor turi</FormLabel>
                                    <Select
                                        value={formData.type}
                                        onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                        bg="bg"
                                        color="text"
                                    >
                                        <option value="warehouse">Mahsulot ombori</option>
                                        <option value="m_warehouse">Xomashyo ombori</option>
                                    </Select>
                                </FormControl>
                            )}

                            <FormControl isRequired>
                                <FormLabel color="text">Ombor nomi</FormLabel>
                                <Input
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="Ombor nomi"
                                    bg="bg"
                                    color="text"
                                />
                            </FormControl>

                            <FormControl isRequired>
                                <FormLabel color="text">Egasi (F.I.O)</FormLabel>
                                <Input
                                    value={formData.full_name}
                                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                                    placeholder="To'liq ism"
                                    bg="bg"
                                    color="text"
                                />
                            </FormControl>

                            <FormControl isRequired>
                                <FormLabel color="text">Telefon raqami</FormLabel>
                                <Input
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    placeholder="+998901234567"
                                    bg="bg"
                                    color="text"
                                />
                            </FormControl>

                            <FormControl isRequired>
                                <FormLabel color="text">Viloyat</FormLabel>
                                <Select
                                    value={formData.regionId}
                                    onChange={(e) => setFormData({ ...formData, regionId: e.target.value, districtId: '' })}
                                    placeholder="Viloyatni tanlang"
                                    bg="bg"
                                    color="text"
                                >
                                    {regions.map((region) => (
                                        <option key={region.id} value={region.id}>
                                            {region.name_uz}
                                        </option>
                                    ))}
                                </Select>
                            </FormControl>

                            <FormControl isRequired>
                                <FormLabel color="text">Tuman</FormLabel>
                                <Select
                                    value={formData.districtId}
                                    onChange={(e) => setFormData({ ...formData, districtId: e.target.value })}
                                    placeholder="Tumanni tanlang"
                                    isDisabled={!formData.regionId}
                                    bg="bg"
                                    color="text"
                                >
                                    {filteredDistricts.map((district) => (
                                        <option key={district.id} value={district.id}>
                                            {district.name_uz}
                                        </option>
                                    ))}
                                </Select>
                            </FormControl>

                            <FormControl isRequired>
                                <FormLabel color="text">Username</FormLabel>
                                <Input
                                    value={formData.username}
                                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                    placeholder="Username"
                                    bg="bg"
                                    color="text"
                                />
                            </FormControl>

                            <FormControl isRequired>
                                <FormLabel color="text">Parol</FormLabel>
                                <Input
                                    type="password"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    placeholder="Parol"
                                    bg="bg"
                                    color="text"
                                />
                            </FormControl>

                            <FormControl isRequired>
                                <FormLabel color="text">Parolni tasdiqlash</FormLabel>
                                <Input
                                    type="password"
                                    value={formData.confirmPassword}
                                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                    placeholder="Parolni tasdiqlash"
                                    bg="bg"
                                    color="text"
                                />
                            </FormControl>
                        </VStack>
                    </ModalBody>
                    <ModalFooter>
                        <Button variant="ghost" mr={3} onClick={onAddClose}>
                            Bekor qilish
                        </Button>
                        <Button
                            colorScheme="blue"
                            onClick={handleAddSubmit}
                            isLoading={formLoading}
                        >
                            Yaratish
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>

            {/* Edit Modal */}
            <Modal isOpen={isEditOpen} onClose={onEditClose} size="lg">
                <ModalOverlay />
                <ModalContent bg="surface">
                    <ModalHeader color="text">Omborni tahrirlash</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <VStack spacing={4}>
                            <FormControl isRequired>
                                <FormLabel color="text">Ombor nomi</FormLabel>
                                <Input
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    bg="bg"
                                    color="text"
                                />
                            </FormControl>

                            <FormControl isRequired>
                                <FormLabel color="text">Telefon raqami</FormLabel>
                                <Input
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    bg="bg"
                                    color="text"
                                />
                            </FormControl>

                            <FormControl isRequired>
                                <FormLabel color="text">Viloyat</FormLabel>
                                <Select
                                    value={formData.regionId}
                                    onChange={(e) => setFormData({ ...formData, regionId: e.target.value, districtId: '' })}
                                    bg="bg"
                                    color="text"
                                >
                                    {regions.map((region) => (
                                        <option key={region.id} value={region.id}>
                                            {region.name_uz}
                                        </option>
                                    ))}
                                </Select>
                            </FormControl>

                            <FormControl isRequired>
                                <FormLabel color="text">Tuman</FormLabel>
                                <Select
                                    value={formData.districtId}
                                    onChange={(e) => setFormData({ ...formData, districtId: e.target.value })}
                                    isDisabled={!formData.regionId}
                                    bg="bg"
                                    color="text"
                                >
                                    {filteredDistricts.map((district) => (
                                        <option key={district.id} value={district.id}>
                                            {district.name_uz}
                                        </option>
                                    ))}
                                </Select>
                            </FormControl>

                            <FormControl display="flex" alignItems="center">
                                <FormLabel mb="0" color="text">
                                    Asosiy ombor
                                </FormLabel>
                                <Switch
                                    isChecked={formData.is_main}
                                    onChange={(e) => setFormData({ ...formData, is_main: e.target.checked })}
                                    colorScheme="yellow"
                                />
                            </FormControl>
                        </VStack>
                    </ModalBody>
                    <ModalFooter>
                        <Button variant="ghost" mr={3} onClick={onEditClose}>
                            Bekor qilish
                        </Button>
                        <Button
                            colorScheme="blue"
                            onClick={handleEditSubmit}
                            isLoading={formLoading}
                        >
                            Saqlash
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>

            {/* Delete Confirmation Modal */}
            <Modal isOpen={isDeleteOpen} onClose={onDeleteClose} isCentered>
                <ModalOverlay />
                <ModalContent bg="surface">
                    <ModalHeader color="text">Omborni o'chirish</ModalHeader>
                    <ModalBody>
                        {currentWarehouse && (
                            <VStack align="start" spacing={3}>
                                <Text color="text">
                                    Quyidagi omborni rostdan ham o'chirmoqchimisiz?
                                </Text>
                                <Card bg="bg" width="100%" borderWidth="1px" borderColor="border">
                                    <CardBody>
                                        <VStack align="start" spacing={2}>
                                            <HStack>
                                                <Icon
                                                    as={getWarehouseTypeInfo(currentWarehouse.type).icon}
                                                    boxSize={5}
                                                    color={`${getWarehouseTypeInfo(currentWarehouse.type).color}.500`}
                                                />
                                                <Text fontWeight="semibold" fontSize="lg" color="text">
                                                    {currentWarehouse.name}
                                                </Text>
                                            </HStack>
                                            <Badge colorScheme={getWarehouseTypeInfo(currentWarehouse.type).color}>
                                                {getWarehouseTypeInfo(currentWarehouse.type).label}
                                            </Badge>
                                            <Text fontSize="sm" color="gray.600">
                                                {currentWarehouse.address}
                                            </Text>
                                        </VStack>
                                    </CardBody>
                                </Card>
                                <Text fontSize="sm" color="red.500">
                                    Bu amalni ortga qaytarib bo'lmaydi.
                                </Text>
                            </VStack>
                        )}
                    </ModalBody>
                    <ModalFooter>
                        <Button variant="ghost" mr={3} onClick={onDeleteClose}>
                            Bekor qilish
                        </Button>
                        <Button colorScheme="red" onClick={handleDeleteConfirm}>
                            Ha, o'chirish
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </Box>
    );
};

export default WarehousesPage;
import React, { useState, useEffect } from 'react';
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
    InputRightElement,
    FormControl,
    FormLabel,
    Textarea,
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
    Heading,
    IconButton,
    Divider,
    Icon,
    Center,
    Tooltip,
    Select,
    NumberInput,
    NumberInputField,
    NumberInputStepper,
    NumberIncrementStepper,
    NumberDecrementStepper,
} from '@chakra-ui/react';
import { AddIcon, EditIcon, DeleteIcon, SearchIcon, CloseIcon } from '@chakra-ui/icons';
import { FiTag, FiDollarSign, FiFileText, FiCalendar } from 'react-icons/fi';
import { apiOptions } from '../../utils/Controllers/apiOptions';

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

const OptionsPage = () => {
    // State
    const [options, setOptions] = useState([]);
    const [filteredOptions, setFilteredOptions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchText, setSearchText] = useState('');
    const [sortBy, setSortBy] = useState('name'); // 'name' or 'price'
    const debouncedSearch = useDebounce(searchText, 300);

    // Modal states
    const { isOpen: isAddOpen, onOpen: onAddOpen, onClose: onAddClose } = useDisclosure();
    const { isOpen: isEditOpen, onOpen: onEditOpen, onClose: onEditClose } = useDisclosure();
    const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure();

    // Form states
    const [formData, setFormData] = useState({
        name: '',
        price: '',
        note: '',
    });
    const [currentOption, setCurrentOption] = useState(null);
    const [formLoading, setFormLoading] = useState(false);

    // Fetch options
    const fetchOptions = async () => {
        setLoading(true);
        try {
            const response = await apiOptions.getAll();
            setOptions(response.data || []);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOptions();
    }, []);

    // Filter and sort options
    useEffect(() => {
        let filtered = [...options];

        // Search filter
        if (debouncedSearch) {
            filtered = filtered.filter(option =>
                option.name.toLowerCase().includes(debouncedSearch.toLowerCase())
            );
        }

        // Sort
        filtered.sort((a, b) => {
            if (sortBy === 'name') {
                return a.name.localeCompare(b.name);
            } else {
                return parseFloat(b.price) - parseFloat(a.price);
            }
        });

        setFilteredOptions(filtered);
    }, [options, debouncedSearch, sortBy]);

    // Calculate stats
    const totalOptions = options.length;
    const totalValue = options.reduce((sum, opt) => sum + parseFloat(opt.price || 0), 0);
    const avgPrice = totalOptions > 0 ? totalValue / totalOptions : 0;
    const maxPrice = options.length > 0 ? Math.max(...options.map(o => parseFloat(o.price))) : 0;
    const minPrice = options.length > 0 ? Math.min(...options.map(o => parseFloat(o.price))) : 0;

    // Reset form
    const resetForm = () => {
        setFormData({
            name: '',
            price: '',
            note: '',
        });
    };

    // Handle add
    const handleAddClick = () => {
        resetForm();
        onAddOpen();
    };

    const handleAddSubmit = async () => {
        // Validation
        if (!formData.name || !formData.price) {
            return;
        }

        if (parseFloat(formData.price) <= 0) {
            return;
        }

        if (formData.name.length > 100) {
            return;
        }

        if (formData.note.length > 500) {
            return;
        }

        setFormLoading(true);
        try {
            const data = {
                name: formData.name,
                price: formData.price,
                note: formData.note,
            };

            await apiOptions.Add(data);
            await fetchOptions();
            onAddClose();
            resetForm();
        } finally {
            setFormLoading(false);
        }
    };

    // Handle edit
    const handleEditClick = (option) => {
        setCurrentOption(option);
        setFormData({
            name: option.name,
            price: option.price,
            note: option.note || '',
        });
        onEditOpen();
    };

    const handleEditSubmit = async () => {
        if (!formData.name || !formData.price) {
            return;
        }

        if (parseFloat(formData.price) <= 0) {
            return;
        }

        if (formData.name.length > 100) {
            return;
        }

        if (formData.note.length > 500) {
            return;
        }

        setFormLoading(true);
        try {
            const data = {
                name: formData.name,
                price: formData.price,
                note: formData.note,
            };

            await apiOptions.Update(data, currentOption.id);
            await fetchOptions();
            onEditClose();
            resetForm();
            setCurrentOption(null);
        } finally {
            setFormLoading(false);
        }
    };

    // Handle delete
    const handleDeleteClick = (option) => {
        setCurrentOption(option);
        onDeleteOpen();
    };

    const handleDeleteConfirm = async () => {
        try {
            await apiOptions.DeleteOption(currentOption.id);
            await fetchOptions();
            onDeleteClose();
            setCurrentOption(null);
        } catch (error) {
            console.error('Delete error:', error);
        }
    };

    // Format price
    const formatPrice = (price) => {
        if (!price) return '0';
        return parseFloat(price).toLocaleString('uz-UZ');
    };

    // Format date
    const formatDate = (dateString) => {
        if (!dateString) return '-';
        const date = new Date(dateString);
        return date.toLocaleDateString('uz-UZ', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    // Truncate text
    const truncateText = (text, maxLength) => {
        if (!text) return '';
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    };

    return (
        <Box minH="100vh" bg="bg">
            {/* Header */}
            <Box bg="surface" borderBottom="1px" borderColor="border" position="sticky" top={0} zIndex={10}>
                <Container maxW="container.xl" py={4}>
                    <VStack align="stretch" spacing={4}>
                        <HStack justify="space-between">
                            <Heading size="lg" color="text">Opsiyalar</Heading>
                            <Button
                                leftIcon={<AddIcon />}
                                colorScheme="blue"
                                onClick={handleAddClick}
                            >
                                Opsiya qo'shish
                            </Button>
                        </HStack>

                        {/* Stats */}
                        <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4}>
                            <Card bg="blue.50" _dark={{ bg: 'blue.900' }}>
                                <CardBody py={3}>
                                    <VStack spacing={0}>
                                        <Text fontSize="2xl" fontWeight="bold" color="blue.600" _dark={{ color: 'blue.300' }}>
                                            {totalOptions}
                                        </Text>
                                        <Text fontSize="sm" color="gray.600" _dark={{ color: 'gray.400' }}>
                                            Jami opsiyalar
                                        </Text>
                                    </VStack>
                                </CardBody>
                            </Card>

                            <Card bg="green.50" _dark={{ bg: 'green.900' }}>
                                <CardBody py={3}>
                                    <VStack spacing={0}>
                                        <Text fontSize="xl" fontWeight="bold" color="green.600" _dark={{ color: 'green.300' }}>
                                            {formatPrice(avgPrice)}
                                        </Text>
                                        <Text fontSize="sm" color="gray.600" _dark={{ color: 'gray.400' }}>
                                            O'rtacha narx
                                        </Text>
                                    </VStack>
                                </CardBody>
                            </Card>

                            <Card bg="purple.50" _dark={{ bg: 'purple.900' }}>
                                <CardBody py={3}>
                                    <VStack spacing={0}>
                                        <Text fontSize="xl" fontWeight="bold" color="purple.600" _dark={{ color: 'purple.300' }}>
                                            {formatPrice(maxPrice)}
                                        </Text>
                                        <Text fontSize="sm" color="gray.600" _dark={{ color: 'gray.400' }}>
                                            Eng qimmat
                                        </Text>
                                    </VStack>
                                </CardBody>
                            </Card>

                            <Card bg="orange.50" _dark={{ bg: 'orange.900' }}>
                                <CardBody py={3}>
                                    <VStack spacing={0}>
                                        <Text fontSize="xl" fontWeight="bold" color="orange.600" _dark={{ color: 'orange.300' }}>
                                            {formatPrice(minPrice)}
                                        </Text>
                                        <Text fontSize="sm" color="gray.600" _dark={{ color: 'gray.400' }}>
                                            Eng arzon
                                        </Text>
                                    </VStack>
                                </CardBody>
                            </Card>
                        </SimpleGrid>

                        {/* Search and Sort */}
                        <HStack spacing={4}>
                            <InputGroup flex={1}>
                                <InputLeftElement pointerEvents="none">
                                    <SearchIcon color="gray.400" />
                                </InputLeftElement>
                                <Input
                                    placeholder="Opsiya nomi bo'yicha qidirish..."
                                    value={searchText}
                                    onChange={(e) => setSearchText(e.target.value)}
                                    bg="bg"
                                    color="text"
                                />
                                {searchText && (
                                    <InputRightElement>
                                        <IconButton
                                            icon={<CloseIcon />}
                                            size="xs"
                                            variant="ghost"
                                            onClick={() => setSearchText('')}
                                            aria-label="Tozalash"
                                        />
                                    </InputRightElement>
                                )}
                            </InputGroup>

                            <Select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                bg="bg"
                                color="text"
                                maxW="200px"
                            >
                                <option value="name">Nom bo'yicha</option>
                                <option value="price">Narx bo'yicha</option>
                            </Select>
                        </HStack>
                    </VStack>
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
                                            <SkeletonText noOfLines={1} width="60%" />
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
                ) : filteredOptions.length === 0 ? (
                    // Empty state
                    <Card bg="surface">
                        <CardBody>
                            <VStack spacing={4} py={12}>
                                <Icon as={FiTag} boxSize={16} color="gray.300" />
                                <VStack spacing={2}>
                                    <Text fontSize="lg" fontWeight="medium" color="text">
                                        {searchText ? 'Opsiya topilmadi' : 'Hozircha opsiyalar yo\'q'}
                                    </Text>
                                    <Text fontSize="sm" color="gray.500">
                                        {searchText ? 'Boshqa nom bilan qidiring' : 'Yangi opsiya qo\'shish uchun yuqoridagi tugmani bosing'}
                                    </Text>
                                </VStack>
                                {!searchText && (
                                    <Button
                                        leftIcon={<AddIcon />}
                                        colorScheme="blue"
                                        onClick={handleAddClick}
                                    >
                                        Opsiya qo'shish
                                    </Button>
                                )}
                            </VStack>
                        </CardBody>
                    </Card>
                ) : (
                    // Options grid
                    <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
                        {filteredOptions.map((option) => (
                            <Card
                                key={option.id}
                                bg="surface"
                                borderWidth="2px"
                                borderColor="blue.200"
                                _hover={{ shadow: 'lg', borderColor: 'blue.400' }}
                                transition="all 0.2s"
                                position="relative"
                                role="group"
                            >
                                <CardBody>
                                    <VStack align="stretch" spacing={4}>
                                        {/* Header with hover actions */}
                                        <HStack justify="space-between" align="start">
                                            <VStack align="start" spacing={1} flex={1}>
                                                <HStack>
                                                    <Icon as={FiTag} boxSize={5} color="blue.500" />
                                                    <Heading size="md" color="text" noOfLines={1}>
                                                        {option.name}
                                                    </Heading>
                                                </HStack>
                                            </VStack>

                                            <HStack
                                                spacing={1}
                                                className="hover-actions"
                                                opacity={0}
                                                transition="opacity 0.2s"
                                                _groupHover={{ opacity: 1 }}
                                                // sx={{
                                                //     'Card:hover &': {
                                                //         opacity: 1
                                                //     }
                                                // }}
                                            >
                                                <IconButton
                                                    icon={<EditIcon />}
                                                    size="sm"
                                                    colorScheme="blue"
                                                    variant="ghost"
                                                    onClick={() => handleEditClick(option)}
                                                    aria-label="Tahrirlash"
                                                />
                                                <IconButton
                                                    icon={<DeleteIcon />}
                                                    size="sm"
                                                    colorScheme="red"
                                                    variant="ghost"
                                                    onClick={() => handleDeleteClick(option)}
                                                    aria-label="O'chirish"
                                                />
                                            </HStack>
                                        </HStack>

                                        <Divider />

                                        {/* Price */}
                                        <HStack spacing={2}>
                                            <Icon as={FiDollarSign} boxSize={5} color="green.500" />
                                            <VStack align="start" spacing={0} flex={1}>
                                                <Text fontSize="2xl" fontWeight="bold" color="green.600" _dark={{ color: 'green.400' }}>
                                                    {formatPrice(option.price)}
                                                </Text>
                                                <Text fontSize="xs" color="gray.600">
                                                    so'm
                                                </Text>
                                            </VStack>
                                        </HStack>

                                        {/* Note */}
                                        {option.note && (
                                            <Tooltip label={option.note} placement="top" hasArrow>
                                                <HStack align="start" spacing={2}>
                                                    <Icon as={FiFileText} boxSize={4} color="gray.500" mt={0.5} />
                                                    <Text fontSize="sm" color="gray.600" noOfLines={2}>
                                                        {truncateText(option.note, 80)}
                                                    </Text>
                                                </HStack>
                                            </Tooltip>
                                        )}

                                        <Divider />

                                        {/* Dates */}
                                        <VStack align="stretch" spacing={1} fontSize="xs" color="gray.500">
                                            <HStack>
                                                <Icon as={FiCalendar} boxSize={3} />
                                                <Text>Yaratildi: {formatDate(option.createdAt)}</Text>
                                            </HStack>
                                            <HStack>
                                                <Icon as={FiCalendar} boxSize={3} />
                                                <Text>Yangilandi: {formatDate(option.updatedAt)}</Text>
                                            </HStack>
                                        </VStack>
                                    </VStack>
                                </CardBody>
                            </Card>
                        ))}
                    </SimpleGrid>
                )}
            </Container>

            {/* Add Modal */}
            <Modal isOpen={isAddOpen} onClose={onAddClose} size="lg">
                <ModalOverlay />
                <ModalContent bg="surface">
                    <ModalHeader color="text">Opsiya qo'shish</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <VStack spacing={4}>
                            <FormControl isRequired>
                                <FormLabel color="text">Nomi</FormLabel>
                                <Input
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="Opsiya nomi"
                                    maxLength={100}
                                    bg="bg"
                                    color="text"
                                />
                                <Text fontSize="xs" color="gray.500" mt={1}>
                                    {formData.name.length}/100
                                </Text>
                            </FormControl>

                            <FormControl isRequired>
                                <FormLabel color="text">Narxi</FormLabel>
                                <NumberInput
                                    value={formData.price}
                                    onChange={(value) => setFormData({ ...formData, price: value })}
                                    min={0}
                                    max={9999999999}
                                >
                                    <NumberInputField placeholder="Narxni kiriting" bg="bg" color="text" />
                                    <NumberInputStepper>
                                        <NumberIncrementStepper />
                                        <NumberDecrementStepper />
                                    </NumberInputStepper>
                                </NumberInput>
                                {formData.price && (
                                    <Text fontSize="sm" color="green.600" mt={1}>
                                        {formatPrice(formData.price)} so'm
                                    </Text>
                                )}
                            </FormControl>

                            <FormControl>
                                <FormLabel color="text">Izoh (ixtiyoriy)</FormLabel>
                                <Textarea
                                    value={formData.note}
                                    onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                                    placeholder="Qo'shimcha ma'lumot"
                                    rows={4}
                                    maxLength={500}
                                    bg="bg"
                                    color="text"
                                />
                                <Text fontSize="xs" color="gray.500" mt={1}>
                                    {formData.note.length}/500
                                </Text>
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
                            isDisabled={!formData.name || !formData.price || parseFloat(formData.price) <= 0}
                        >
                            Qo'shish
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>

            {/* Edit Modal */}
            <Modal isOpen={isEditOpen} onClose={onEditClose} size="lg">
                <ModalOverlay />
                <ModalContent bg="surface">
                    <ModalHeader color="text">Opsiyani tahrirlash</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <VStack spacing={4}>
                            <FormControl isRequired>
                                <FormLabel color="text">Nomi</FormLabel>
                                <Input
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    maxLength={100}
                                    bg="bg"
                                    color="text"
                                />
                                <Text fontSize="xs" color="gray.500" mt={1}>
                                    {formData.name.length}/100
                                </Text>
                            </FormControl>

                            <FormControl isRequired>
                                <FormLabel color="text">Narxi</FormLabel>
                                <NumberInput
                                    value={formData.price}
                                    onChange={(value) => setFormData({ ...formData, price: value })}
                                    min={0}
                                    max={9999999999}
                                >
                                    <NumberInputField bg="bg" color="text" />
                                    <NumberInputStepper>
                                        <NumberIncrementStepper />
                                        <NumberDecrementStepper />
                                    </NumberInputStepper>
                                </NumberInput>
                                {formData.price && (
                                    <Text fontSize="sm" color="green.600" mt={1}>
                                        {formatPrice(formData.price)} so'm
                                    </Text>
                                )}
                            </FormControl>

                            <FormControl>
                                <FormLabel color="text">Izoh (ixtiyoriy)</FormLabel>
                                <Textarea
                                    value={formData.note}
                                    onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                                    rows={4}
                                    maxLength={500}
                                    bg="bg"
                                    color="text"
                                />
                                <Text fontSize="xs" color="gray.500" mt={1}>
                                    {formData.note.length}/500
                                </Text>
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
                            isDisabled={!formData.name || !formData.price || parseFloat(formData.price) <= 0}
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
                    <ModalHeader color="text">Opsiyani o'chirish</ModalHeader>
                    <ModalBody>
                        {currentOption && (
                            <VStack align="start" spacing={3}>
                                <Text color="text">
                                    Quyidagi opsiyani rostdan ham o'chirmoqchimisiz?
                                </Text>
                                <Card bg="bg" width="100%" borderWidth="1px" borderColor="border">
                                    <CardBody>
                                        <VStack align="start" spacing={3}>
                                            <HStack>
                                                <Icon as={FiTag} boxSize={5} color="blue.500" />
                                                <Text fontWeight="semibold" fontSize="lg" color="text">
                                                    {currentOption.name}
                                                </Text>
                                            </HStack>
                                            <HStack spacing={2}>
                                                <Icon as={FiDollarSign} boxSize={4} color="green.500" />
                                                <Text fontSize="xl" fontWeight="bold" color="green.600" _dark={{ color: 'green.400' }}>
                                                    {formatPrice(currentOption.price)} so'm
                                                </Text>
                                            </HStack>
                                            {currentOption.note && (
                                                <HStack align="start" spacing={2}>
                                                    <Icon as={FiFileText} boxSize={4} color="gray.500" mt={0.5} />
                                                    <Text fontSize="sm" color="gray.600">
                                                        {currentOption.note}
                                                    </Text>
                                                </HStack>
                                            )}
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

export default OptionsPage;
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
    Box,
    Container,
    Flex,
    Text,
    Button,
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
    Heading,
    IconButton,
    Divider,
    Tabs,
    TabList,
    TabPanels,
    Tab,
    TabPanel,
    Icon,
    Center,
    Checkbox,
} from '@chakra-ui/react';
import { AddIcon, EditIcon, DeleteIcon } from '@chakra-ui/icons';
import { FiUser, FiUserCheck, FiShoppingCart, FiPackage, FiAward,  } from 'react-icons/fi';
import { apiUsers } from '../../utils/Controllers/Users';
import { toastService } from '../../utils/toast';

const UsersPage = () => {
    const { factoryId } = useParams();

    // State
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [roleFilter, setRoleFilter] = useState('all');

    // Modal states
    const { isOpen: isAddOpen, onOpen: onAddOpen, onClose: onAddClose } = useDisclosure();
    const { isOpen: isEditOpen, onOpen: onEditOpen, onClose: onEditClose } = useDisclosure();
    const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure();

    // Form states
    const [formData, setFormData] = useState({
        full_name: '',
        username: '',
        role: '',
        password: '',
        confirmPassword: '',
        changePassword: false,
    });
    const [currentUser, setCurrentUser] = useState(null);
    const [formLoading, setFormLoading] = useState(false);

    // Role configuration
    const roleConfig = {
        factory: {
            label: 'Direktor',
            icon: FiAward,
            color: 'purple',
            order: 1,
        },
        storekeeper: {
            label: 'Omborchi',
            icon: FiPackage,
            color: 'blue',
            order: 2,
        },
        cashier: {
            label: 'Kassir',
            icon: FiUserCheck,
            color: 'green',
            order: 3,
        },
        seller: {
            label: 'Sotuvchi',
            icon: FiShoppingCart,
            color: 'orange',
            order: 4,
        },
    };

    // Fetch users
    const fetchUsers = async () => {
        setLoading(true);
        try {
            const response = await apiUsers.getFactoryUsers(factoryId);
            // Sort by role
            const sorted = (response.data || []).sort((a, b) => {
                const orderA = roleConfig[a.role]?.order || 999;
                const orderB = roleConfig[b.role]?.order || 999;
                return orderA - orderB;
            });
            setUsers(sorted);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, [factoryId]);

    // Filter users by role
    const filteredUsers = roleFilter === 'all'
        ? users
        : users.filter(user => user.role === roleFilter);

    // Reset form
    const resetForm = () => {
        setFormData({
            full_name: '',
            username: '',
            role: '',
            password: '',
            confirmPassword: '',
            changePassword: false,
        });
    };

    // Handle add
    const handleAddClick = () => {
        resetForm();
        onAddOpen();
    };

    const handleAddSubmit = async () => {
        // Validation
        if (!formData.full_name || !formData.username || !formData.role || !formData.password) {
            toastService.error("Ma'lumotlar to'liq kirtilmagan")
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            toastService.error("Tastiqlash paroli mos emas")
            return;
        }

        setFormLoading(true);
        try {
            const data = {
                full_name: formData.full_name,
                username: formData.username,
                role: formData.role,
                password: formData.password,
                location_id: factoryId,
            };

            await apiUsers.Add(data);
            await fetchUsers();
            onAddClose();
            resetForm();
        } finally {
            setFormLoading(false);
        }
    };

    // Handle edit
    const handleEditClick = (user) => {
        setCurrentUser(user);
        setFormData({
            full_name: user.full_name,
            username: user.username,
            role: user.role,
            password: '',
            confirmPassword: '',
            changePassword: false,
        });
        onEditOpen();
    };

    const handleEditSubmit = async () => {
        if (!formData.full_name || !formData.username) {
            toastService.error("Ma'lumotlar to'liq kiritilmagan")
            return;
        }

        if (formData.changePassword && (!formData.password || formData.password !== formData.confirmPassword)) {
            toastService.error('Parollar kiritilganini va to\'g\'ri tastiqlangani tekshiring')
            return;
        }

        setFormLoading(true);
        try {
            // Update basic info
            const updateData = {
                full_name: formData.full_name,
                username: formData.username,
            };
            await apiUsers.Update(updateData, currentUser.id);

            // Reset password if needed
            if (formData.changePassword && formData.password) {
                await apiUsers.ResetPassword(currentUser.id, {
                    new_password: formData.password,
                });
            }

            await fetchUsers();
            onEditClose();
            resetForm();
            setCurrentUser(null);
        } finally {
            setFormLoading(false);
        }
    };

    // Handle delete
    const handleDeleteClick = (user) => {
        setCurrentUser(user);
        onDeleteOpen();
    };

    const handleDeleteConfirm = async () => {
        try {
            await apiUsers.Delete(currentUser.id);
            await fetchUsers();
            onDeleteClose();
            setCurrentUser(null);
        } catch (error) {
            console.error('Delete error:', error);
        }
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

    // Get role stats
    const roleStats = Object.keys(roleConfig).map(role => ({
        role,
        count: users.filter(u => u.role === role).length,
        ...roleConfig[role],
    }));

    return (
        <Box minH="100vh" bg="bg">
            {/* Header */}
            <Box bg="surface" borderBottom="1px" borderColor="border" position="sticky" top={0} zIndex={1}>
                <Container maxW="container.xl" py={4}>
                    <VStack align="stretch" spacing={4}>
                        <HStack justify="space-between">
                            <Heading size="lg" color="text">Foydalanuvchilar</Heading>
                            <Button
                                leftIcon={<AddIcon />}
                                colorScheme="blue"
                                onClick={handleAddClick}
                            >
                                Foydalanuvchi qo'shish
                            </Button>
                        </HStack>

                        {/* Role stats */}
                        <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4}>
                            {roleStats.map(({ role, count, label, color }) => (
                                <Card
                                    key={role}
                                    bg={`${color}.50`}
                                    _dark={{ bg: `${color}.900` }}
                                    cursor="pointer"
                                    onClick={() => setRoleFilter(roleFilter === role ? 'all' : role)}
                                    borderWidth="2px"
                                    borderColor={roleFilter === role ? `${color}.500` : 'transparent'}
                                    _hover={{ borderColor: `${color}.300` }}
                                    transition="all 0.2s"
                                >
                                    <CardBody py={3}>
                                        <VStack spacing={0}>
                                            <Text fontSize="2xl" fontWeight="bold" color={`${color}.600`} _dark={{ color: `${color}.300` }}>
                                                {count}
                                            </Text>
                                            <Text fontSize="sm" color="gray.600" _dark={{ color: 'gray.400' }}>
                                                {label}
                                            </Text>
                                        </VStack>
                                    </CardBody>
                                </Card>
                            ))}
                        </SimpleGrid>

                        {roleFilter !== 'all' && (
                            <HStack>
                                <Badge colorScheme={roleConfig[roleFilter].color} fontSize="sm">
                                    Filter: {roleConfig[roleFilter].label}
                                </Badge>
                                <Button size="xs" variant="ghost" onClick={() => setRoleFilter('all')}>
                                    Tozalash
                                </Button>
                            </HStack>
                        )}
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
                                            <SkeletonText noOfLines={2} width="60%" />
                                            <HStack>
                                                <Skeleton boxSize={8} borderRadius="md" />
                                                <Skeleton boxSize={8} borderRadius="md" />
                                            </HStack>
                                        </HStack>
                                        <Divider />
                                        <SkeletonText noOfLines={2} />
                                    </VStack>
                                </CardBody>
                            </Card>
                        ))}
                    </SimpleGrid>
                ) : filteredUsers.length === 0 ? (
                    // Empty state
                    <Card bg="surface">
                        <CardBody>
                            <VStack spacing={4} py={12}>
                                <Icon as={FiUser} boxSize={16} color="gray.300" />
                                <VStack spacing={2}>
                                    <Text fontSize="lg" fontWeight="medium" color="text">
                                        {roleFilter !== 'all' ? 'Bu lavozimda foydalanuvchi yo\'q' : 'Hozircha foydalanuvchilar yo\'q'}
                                    </Text>
                                    <Text fontSize="sm" color="gray.500">
                                        Yangi foydalanuvchi qo'shish uchun yuqoridagi tugmani bosing
                                    </Text>
                                </VStack>
                                {roleFilter !== 'all' && (
                                    <Button size="sm" variant="outline" onClick={() => setRoleFilter('all')}>
                                        Barchasini ko'rish
                                    </Button>
                                )}
                            </VStack>
                        </CardBody>
                    </Card>
                ) : (
                    // Users grid
                    <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
                        {filteredUsers.map((user) => {
                            const config = roleConfig[user.role] || {
                                label: user.role,
                                icon: FiUser,
                                color: 'gray',
                            };

                            return (
                                <Card
                                    key={user.id}
                                    bg="surface"
                                    borderWidth="2px"
                                    borderColor={`${config.color}.200`}
                                    _hover={{ shadow: 'lg', borderColor: `${config.color}.400` }}
                                    transition="all 0.2s"
                                    position="relative"
                                    role="group"
                                >
                                    <CardBody>
                                        <VStack align="stretch" spacing={4}>
                                            {/* Header with hover actions */}
                                            <HStack justify="space-between" align="start">
                                                <VStack align="start" spacing={2} flex={1}>
                                                    <HStack>
                                                        <Icon as={config.icon} boxSize={5} color={`${config.color}.500`} />
                                                        <Heading size="md" color="text">
                                                            {user.full_name}
                                                        </Heading>
                                                    </HStack>
                                                    <Text fontSize="sm" color="gray.600">
                                                        @{user.username}
                                                    </Text>
                                                    <Badge colorScheme={config.color} fontSize="xs">
                                                        {config.label}
                                                    </Badge>
                                                </VStack>

                                                <VStack
                                                    spacing={1}
                                                    className="hover-actions"
                                                    opacity={0}
                                                    transition="opacity 0.2s"
                                                    // sx={{
                                                    //     'Card:hover &': {
                                                    //         opacity: 1
                                                    //     }
                                                    // }}
                                                    _groupHover={{ opacity: 1 }}
                                                >
                                                    <IconButton
                                                        icon={<EditIcon />}
                                                        size="sm"
                                                        colorScheme="blue"
                                                        variant="ghost"
                                                        onClick={() => handleEditClick(user)}
                                                        aria-label="Tahrirlash"
                                                    />
                                                    <IconButton
                                                        icon={<DeleteIcon />}
                                                        size="sm"
                                                        colorScheme="red"
                                                        variant="ghost"
                                                        onClick={() => handleDeleteClick(user)}
                                                        aria-label="O'chirish"
                                                    />
                                                </VStack>
                                            </HStack>

                                            <Divider />

                                            {/* Details */}
                                            <VStack align="stretch" spacing={2} fontSize="sm">
                                                <HStack justify="space-between">
                                                    <Text color="gray.600">Ro'yxatga olindi:</Text>
                                                    <Text color="text" fontWeight="medium">
                                                        {formatDate(user.createdAt)}
                                                    </Text>
                                                </HStack>
                                                <HStack justify="space-between">
                                                    <Text color="gray.600">Yangilandi:</Text>
                                                    <Text color="text" fontWeight="medium">
                                                        {formatDate(user.updatedAt)}
                                                    </Text>
                                                </HStack>
                                            </VStack>
                                        </VStack>
                                    </CardBody>
                                </Card>
                            );
                        })}
                    </SimpleGrid>
                )}
            </Container>

            {/* Add Modal */}
            <Modal isOpen={isAddOpen} onClose={onAddClose} size="xl">
                <ModalOverlay />
                <ModalContent bg="surface">
                    <ModalHeader color="text">Foydalanuvchi qo'shish</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <VStack spacing={4}>
                            <FormControl isRequired>
                                <FormLabel color="text">To'liq ism</FormLabel>
                                <Input
                                    value={formData.full_name}
                                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                                    placeholder="To'liq ism"
                                    bg="bg"
                                    color="text"
                                />
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
                                <FormLabel color="text">Lavozim</FormLabel>
                                <Select
                                    value={formData.role}
                                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                    placeholder="Lavozimni tanlang"
                                    bg="bg"
                                    color="text"
                                >
                                    {Object.entries(roleConfig).map(([value, { label }]) => (
                                        <option key={value} value={value}>
                                            {label}
                                        </option>
                                    ))}
                                </Select>
                            </FormControl>

                            <Divider />

                            <FormControl isRequired>
                                <FormLabel color="text">Parol</FormLabel>
                                <Input
                                    type="password"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    placeholder="Parol (kamida 6 belgi)"
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
                            Qo'shish
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>

            {/* Edit Modal with Tabs */}
            <Modal isOpen={isEditOpen} onClose={onEditClose} size="xl">
                <ModalOverlay />
                <ModalContent bg="surface">
                    <ModalHeader color="text">Foydalanuvchini tahrirlash</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <Tabs colorScheme="blue">
                            <TabList>
                                <Tab>Asosiy ma'lumotlar</Tab>
                                <Tab>Parolni tiklash</Tab>
                            </TabList>

                            <TabPanels>
                                {/* Basic Info Tab */}
                                <TabPanel>
                                    <VStack spacing={4}>
                                        <FormControl isRequired>
                                            <FormLabel color="text">To'liq ism</FormLabel>
                                            <Input
                                                value={formData.full_name}
                                                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                                                bg="bg"
                                                color="text"
                                            />
                                        </FormControl>

                                        <FormControl isRequired>
                                            <FormLabel color="text">Username</FormLabel>
                                            <Input
                                                value={formData.username}
                                                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                                bg="bg"
                                                color="text"
                                            />
                                        </FormControl>

                                        <FormControl>
                                            <FormLabel color="text">Lavozim</FormLabel>
                                            <Badge colorScheme={roleConfig[formData.role]?.color || 'gray'} fontSize="md" p={2}>
                                                {roleConfig[formData.role]?.label || formData.role}
                                            </Badge>
                                            <Text fontSize="xs" color="gray.500" mt={1}>
                                                Lavozimni o'zgartirish mumkin emas
                                            </Text>
                                        </FormControl>
                                    </VStack>
                                </TabPanel>

                                {/* Password Reset Tab */}
                                <TabPanel>
                                    <VStack spacing={4}>
                                        <Checkbox
                                            isChecked={formData.changePassword}
                                            onChange={(e) => setFormData({ ...formData, changePassword: e.target.checked })}
                                            colorScheme="blue"
                                        >
                                            Parolni o'zgartirish
                                        </Checkbox>

                                        {formData.changePassword && (
                                            <>
                                                <FormControl isRequired>
                                                    <FormLabel color="text">Yangi parol</FormLabel>
                                                    <Input
                                                        type="password"
                                                        value={formData.password}
                                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                                        placeholder="Yangi parol (kamida 6 belgi)"
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
                                            </>
                                        )}
                                    </VStack>
                                </TabPanel>
                            </TabPanels>
                        </Tabs>
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
                    <ModalHeader color="text">Foydalanuvchini o'chirish</ModalHeader>
                    <ModalBody>
                        {currentUser && (
                            <VStack align="start" spacing={3}>
                                <Text color="text">
                                    Quyidagi foydalanuvchini rostdan ham o'chirmoqchimisiz?
                                </Text>
                                <Card bg="bg" width="100%" borderWidth="1px" borderColor="border">
                                    <CardBody>
                                        <VStack align="start" spacing={2}>
                                            <HStack>
                                                <Icon
                                                    as={roleConfig[currentUser.role]?.icon || FiUser}
                                                    boxSize={5}
                                                    color={`${roleConfig[currentUser.role]?.color || 'gray'}.500`}
                                                />
                                                <Text fontWeight="semibold" fontSize="lg" color="text">
                                                    {currentUser.full_name}
                                                </Text>
                                            </HStack>
                                            <Text fontSize="sm" color="gray.600">
                                                @{currentUser.username}
                                            </Text>
                                            <Badge colorScheme={roleConfig[currentUser.role]?.color || 'gray'}>
                                                {roleConfig[currentUser.role]?.label || currentUser.role}
                                            </Badge>
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

export default UsersPage;
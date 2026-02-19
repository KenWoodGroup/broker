import { useState } from "react";
import {
    Box,
    Button,
    VStack,
    HStack,
    Text,
    Table,
    Thead,
    Tbody,
    Tr,
    Th,
    Td,
    Badge,
    Flex,
    IconButton,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalFooter,
    ModalBody,
    ModalCloseButton,
    Divider,
    NumberInput,
    NumberInputField,
    NumberInputStepper,
    NumberIncrementStepper,
    NumberDecrementStepper,
    FormControl,
    FormLabel,
    Input,
    Radio,
    RadioGroup,
    Card,
    Alert,
    AlertIcon,
    AlertDescription,
    TableContainer,
    Textarea,
    useToast,
} from "@chakra-ui/react";
import { DeleteIcon } from "@chakra-ui/icons";
import { apiOffers } from "../../../utils/Controllers/Offers";
import { useParams } from "react-router";

export default function CartModal({
    isOpen,
    onClose,
    selectedItemsData,
    selectedItems,
    onRemoveItem,
    onClearAll,
    itemQuantities,
    onQuantityChange,
    formatPrice,
    getLocationName
}) {
    const toast = useToast();
    const [isLoading, setIsLoading] = useState(false);
    const { id } = useParams()
    const [offerData, setOfferData] = useState({
        deadline: "",
        needLogistics: "ha",
        note: "",
        address: "",
        location_id: id,
    });

    const handleDeadlineChange = (e) => {
        setOfferData(prev => ({
            ...prev,
            deadline: e.target.value
        }));
    };

    const handleLogisticsChange = (value) => {
        setOfferData(prev => ({
            ...prev,
            needLogistics: value
        }));
    };

    const handleNoteChange = (e) => {
        setOfferData(prev => ({
            ...prev,
            note: e.target.value
        }));
    };

    const handleAddressChange = (e) => {
        setOfferData(prev => ({
            ...prev,
            address: e.target.value
        }));
    };

    const handleLocationChange = (e) => {
        setOfferData(prev => ({
            ...prev,
            location_id: e.target.value
        }));
    };

    const calculateTotal = () => {
        return selectedItemsData.reduce((sum, item) => {
            const quantity = itemQuantities[item.id] || 1;
            return sum + (item.purchase_price * quantity);
        }, 0);
    };

    const getMinDate = () => {
        const today = new Date();
        return today.toISOString().split('T')[0];
    };


    const handleCreateOffer = async () => {
        // Validatsiya
        if (!offerData.deadline) {
            toast({
                title: "Xatolik",
                description: "Amal qilish muddatini tanlang",
                status: "error",
                duration: 3000,
                isClosable: true,
            });
            return;
        }

        if (offerData.needLogistics === "ha" && !offerData.address.trim()) {
            toast({
                title: "Xatolik",
                description: "Logistika uchun manzilni kiriting",
                status: "error",
                duration: 3000,
                isClosable: true,
            });
            return;
        }

        setIsLoading(true);

        try {
            // Sanani xavfsiz formatlash
            let formattedDate;
            try {
                const date = new Date(offerData.deadline);
                if (isNaN(date.getTime())) {
                    throw new Error("Noto'g'ri sana");
                }
                date.setHours(12, 0, 0, 0);
                formattedDate = date.toISOString();
            } catch (dateError) {
                console.error("Sana formatlash xatosi:", dateError);
                // Agar sana noto'g'ri bo'lsa, bugungi sanani ishlatamiz
                const today = new Date();
                today.setHours(12, 0, 0, 0);
                formattedDate = today.toISOString();
            }

            // API so'rovi uchun ma'lumotlarni tayyorlash
            const requestData = {
                location_id: id,
                note: offerData.note.trim() || "Fast Delivery Co.",
                items: selectedItemsData.map(item => ({
                    product_id: item.product?.id || item.id,
                    product_name: item.product?.name || "Maxsus buyurtma mahsulot",
                    quantity: itemQuantities[item.id] || 1
                })),
                date: formattedDate,
                is_logist: offerData.needLogistics === "ha",
                address: offerData.needLogistics === "ha" ? offerData.address : ""
            };

            console.log("Yuborilayotgan ma'lumotlar:", requestData);

            const response = await apiOffers.CreateOffer(requestData);

            console.log("Server javobi:", response);

            toast({
                title: "Muvaffaqiyatli",
                description: "Taklif muvaffaqiyatli yaratildi",
                status: "success",
                duration: 5000,
                isClosable: true,
            });

            // Formani tozalash
            setOfferData({
                deadline: "",
                needLogistics: "ha",
                note: "",
                address: "",
                location_id: "",
            });

            // Tanlangan tovarlarni tozalash
            onClearAll();

            // Modalni yopish
            onClose();

        } catch (error) {
            console.error("Taklif yaratish xatosi:", error);

            let errorMessage = "Taklif yaratishda xatolik yuz berdi";

            if (error.response) {
                console.log("Server xatosi:", error.response.data);
                errorMessage = error.response.data?.message || errorMessage;
            } else if (error.request) {
                errorMessage = "Server bilan bog'lanib bo'lmadi";
            }

            toast({
                title: "Xatolik",
                description: errorMessage,
                status: "error",
                duration: 5000,
                isClosable: true,
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} size="5xl" scrollBehavior="inside">
            <ModalOverlay />
            <ModalContent>
                <ModalHeader>
                    <Flex align="center" justify="space-between">
                        <HStack>
                            <Text>Tanlangan tovarlar</Text>
                            <Badge colorScheme="blue" fontSize="sm">
                                {selectedItems.length} dona
                            </Badge>
                        </HStack>
                    </Flex>
                </ModalHeader>
                <ModalCloseButton />

                <ModalBody>
                    {selectedItemsData.length > 0 ? (
                        <VStack spacing={5} align="stretch">
                            {/* Taklif ma'lumotlari qismi */}
                            <Card p={5} variant="outlined" borderWidth="1px" borderRadius="lg">
                                <VStack spacing={4} align="stretch">
                                    <Text fontSize="md" fontWeight="bold" color="blue.600">
                                        Taklif ma'lumotlari
                                    </Text>

                                    <HStack spacing={6} align="flex-start">
                                        <FormControl isRequired flex={1}>
                                            <FormLabel fontWeight="medium">Amal qilish muddati</FormLabel>
                                            <Input
                                                type="date"
                                                value={offerData.deadline}
                                                onChange={handleDeadlineChange}
                                                min={getMinDate()}
                                                size="md"
                                            />
                                        </FormControl>
                                    </HStack>

                                    <HStack spacing={6} align="flex-start">
                                        <FormControl flex={1}>
                                            <FormLabel fontWeight="medium">Logistika kerakmi?</FormLabel>
                                            <RadioGroup value={offerData.needLogistics} onChange={handleLogisticsChange}>
                                                <HStack spacing={6}>
                                                    <Radio value="ha" colorScheme="green">Ha</Radio>
                                                    <Radio value="yo'q" colorScheme="red">Yo'q</Radio>
                                                </HStack>
                                            </RadioGroup>
                                        </FormControl>

                                        <FormControl flex={1}>
                                            <FormLabel fontWeight="medium">Eslatma (Note)</FormLabel>
                                            <Input
                                                type="text"
                                                value={offerData.note}
                                                onChange={handleNoteChange}
                                                placeholder="Fast Delivery Co."
                                                size="md"
                                            />
                                        </FormControl>
                                    </HStack>

                                    {/* Logistika uchun manzil */}
                                    {offerData.needLogistics === "ha" && (
                                        <FormControl isRequired>
                                            <FormLabel fontWeight="medium">Yetkazib berish manzili</FormLabel>
                                            <Textarea
                                                value={offerData.address}
                                                onChange={handleAddressChange}
                                                placeholder="To'liq manzilni kiriting..."
                                                size="md"
                                                rows={3}
                                            />
                                        </FormControl>
                                    )}
                                </VStack>
                            </Card>

                            {/* Tovarlar ro'yxati qismi */}
                            <TableContainer borderWidth="1px" borderRadius="lg">
                                <Table variant="simple" size="sm">
                                    <Thead bg="gray.50" _dark={{ bg: "gray.700" }}>
                                        <Tr>
                                            <Th>№</Th>
                                            <Th>Tovar</Th>
                                            <Th>Kategoriya</Th>
                                            <Th>Joylashuv</Th>
                                            <Th isNumeric>Narxi</Th>
                                            <Th isNumeric>Soni</Th>
                                            <Th isNumeric>Jami</Th>
                                            <Th></Th>
                                        </Tr>
                                    </Thead>
                                    <Tbody>
                                        {selectedItemsData.map((item, index) => {
                                            const quantity = itemQuantities[item.id] || 1;
                                            const totalPrice = item.purchase_price * quantity;

                                            return (
                                                <Tr key={item.id}>
                                                    <Td>{index + 1}</Td>
                                                    <Td>
                                                        <VStack align="start" spacing={0}>
                                                            <Text fontWeight="medium">{item.product?.name || "—"}</Text>
                                                            <Text fontSize="xs" color="gray.500">
                                                                ID: {item.product?.id || item.id}
                                                            </Text>
                                                            <Text fontSize="xs" color="gray.500">
                                                                Artikul: {item.product?.article || "—"}
                                                            </Text>
                                                        </VStack>
                                                    </Td>
                                                    <Td>{item.product?.category?.name || "—"}</Td>
                                                    <Td>{item.product?.location?.name || getLocationName(item.location_id)}</Td>
                                                    <Td isNumeric fontWeight="medium">
                                                        {formatPrice(item.purchase_price)}
                                                    </Td>
                                                    <Td isNumeric>
                                                        <NumberInput
                                                            size="sm"
                                                            min={1}
                                                            max={1000}
                                                            value={quantity}
                                                            onChange={(value) => onQuantityChange(item.id, value)}
                                                            width="100px"
                                                        >
                                                            <NumberInputField />
                                                            <NumberInputStepper>
                                                                <NumberIncrementStepper />
                                                                <NumberDecrementStepper />
                                                            </NumberInputStepper>
                                                        </NumberInput>
                                                    </Td>
                                                    <Td isNumeric fontWeight="bold" color="green.600">
                                                        {formatPrice(totalPrice)}
                                                    </Td>
                                                    <Td>
                                                        <IconButton
                                                            icon={<DeleteIcon />}
                                                            size="sm"
                                                            variant="ghost"
                                                            colorScheme="red"
                                                            onClick={() => onRemoveItem(item.id)}
                                                            aria-label="Tovarni o'chirish"
                                                        />
                                                    </Td>
                                                </Tr>
                                            );
                                        })}
                                    </Tbody>
                                </Table>
                            </TableContainer>

                            {/* Umumiy ma'lumot qismi */}
                            <Card p={4} bg="gray.50" _dark={{ bg: "gray.700" }}>
                                <VStack spacing={4} align="stretch">
                                    <Flex justify="space-between">
                                        <Text fontWeight="medium">Pozitsiyalar soni:</Text>
                                        <Text fontWeight="bold">{selectedItemsData.length}</Text>
                                    </Flex>
                                    <Flex justify="space-between">
                                        <Text fontWeight="medium">Umumiy tovarlar soni:</Text>
                                        <Text fontWeight="bold">
                                            {Object.values(itemQuantities).reduce((sum, qty) => sum + qty, 0)} dona
                                        </Text>
                                    </Flex>
                                    <Divider />
                                    <Flex justify="space-between">
                                        <Text fontSize="lg" fontWeight="bold">Umumiy summa:</Text>
                                        <Text fontSize="xl" fontWeight="bold" color="green.600">
                                            {formatPrice(calculateTotal())}
                                        </Text>
                                    </Flex>

                                    {offerData.needLogistics === "ha" && (
                                        <Alert status="info" borderRadius="md" size="sm">
                                            <AlertIcon />
                                            <AlertDescription fontSize="sm">
                                                Logistika xarajatlari umumiy summaga qo'shiladi
                                            </AlertDescription>
                                        </Alert>
                                    )}

                                    {offerData.deadline && (
                                        <Text fontSize="sm" color="gray.600">
                                            Amal qilish muddati: {new Date(offerData.deadline).toLocaleDateString('uz-UZ', {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric'
                                            })}
                                        </Text>
                                    )}
                                </VStack>
                            </Card>

                            {/* Tozalash tugmasi */}
                            {selectedItemsData.length > 0 && (
                                <Flex justify="flex-end">
                                    <Button
                                        variant="ghost"
                                        colorScheme="red"
                                        size="sm"
                                        onClick={onClearAll}
                                        leftIcon={<DeleteIcon />}
                                        isDisabled={isLoading}
                                    >
                                        Hammasini tozalash
                                    </Button>
                                </Flex>
                            )}
                        </VStack>
                    ) : (
                        <Alert status="info" borderRadius="lg">
                            <AlertIcon />
                            <AlertDescription>Tanlangan tovarlar yo'q</AlertDescription>
                        </Alert>
                    )}
                </ModalBody>

                <ModalFooter>
                    <HStack spacing={3}>
                        <Button variant="ghost" onClick={onClose} isDisabled={isLoading}>
                            Yopish
                        </Button>
                        <Button
                            colorScheme="blue"
                            onClick={handleCreateOffer}
                            isLoading={isLoading}
                            loadingText="Yaratilmoqda..."
                            isDisabled={!offerData.deadline || selectedItemsData.length === 0 || isLoading}
                        >
                            Taklif yaratish
                        </Button>
                    </HStack>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
}
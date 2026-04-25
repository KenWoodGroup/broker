import { useEffect, useState, useRef } from "react";
import { apiOffers } from "../../utils/Controllers/Offers";
import { apiOfferItems } from "../../utils/Controllers/OfferItems";
import { useParams, useNavigate } from "react-router-dom";
import {
    Box,
    Card,
    CardBody,
    Heading,
    Text,
    Grid,
    GridItem,
    Table,
    Thead,
    Tbody,
    Tr,
    Th,
    Td,
    TableContainer,
    Spinner,
    Alert,
    AlertIcon,
    Divider,
    HStack,
    VStack,
    Flex,
    useToast,
    Button,
    Accordion,
    AccordionItem,
    AccordionButton,
    AccordionPanel,
    AccordionIcon,
    Input,
    AlertDialog,
    AlertDialogBody,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogContent,
    AlertDialogOverlay,
    useDisclosure,
    Badge,
    Icon,
    Tooltip,
} from "@chakra-ui/react";
import {
    ArrowLeft,
    Building,
    FileText,
    Factory,
    Trash2,
    Save,
    MapPin,
    CheckCircle,
    Clock,
    Package,
    DollarSign,
    Ruler,
} from "lucide-react";
import EditStatus from "./__components/EditStatus";

export default function OffersDetail({ status }) {
    const { id } = useParams();
    const navigate = useNavigate();
    const toast = useToast();
    const [offer, setOffer] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    const [salePrices, setSalePrices] = useState({});
    const [savingPricesItemId, setSavingPricesItemId] = useState(null);
    
    const [deletingVariant, setDeletingVariant] = useState({ itemId: null, variantId: null });
    const { isOpen: isDeleteDialogOpen, onOpen: onDeleteDialogOpen, onClose: onDeleteDialogClose } = useDisclosure();
    const cancelRef = useRef();

    const getOffer = async () => {
        try {
            setLoading(true);
            const response = await apiOffers?.getOffer(id);
            if (response?.status === 200 && response?.data) {
                setOffer(response.data);
                const initialPrices = {};
                response.data.offer_items?.forEach(item => {
                    item.variants?.forEach(variant => {
                        initialPrices[variant.id] = variant.sale_price ?? variant.cost_price ?? 0;
                    });
                });
                setSalePrices(initialPrices);
            } else {
                setError("Ma'lumotlarni yuklashda xatolik yuz berdi");
                toast({
                    title: "Xatolik",
                    description: "Ma'lumotlarni yuklashda xatolik yuz berdi",
                    status: "error",
                    duration: 3000,
                });
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (id) getOffer();
    }, [id]);

    const handleSaveAllPrices = async (itemId, variants) => {
        const variantsPayload = variants.map(variant => ({
            variant_id: variant.id,
            sale_price: salePrices[variant.id]
        }));
        setSavingPricesItemId(itemId);
        try {
            await apiOfferItems.EditOffersItems(itemId, { variants: variantsPayload });
            setOffer(prev => ({
                ...prev,
                offer_items: prev.offer_items.map(item => {
                    if (item.id !== itemId) return item;
                    return {
                        ...item,
                        variants: item.variants.map(variant => ({
                            ...variant,
                            sale_price: salePrices[variant.id]
                        }))
                    };
                })
            }));
            toast({ title: "Muvaffaqiyatli", description: "Barcha narxlar yangilandi", status: "success", duration: 3000 });
        } catch (err) {
            toast({ title: "Xatolik", description: "Narxlarni saqlashda xatolik", status: "error", duration: 5000 });
        } finally {
            setSavingPricesItemId(null);
        }
    };

    const handlePriceChange = (variantId, rawValue) => {
        const numeric = parseFloat(rawValue.replace(/\D/g, '')) || 0;
        setSalePrices(prev => ({ ...prev, [variantId]: numeric }));
    };

    const formatNumberWithSpaces = (num) => {
        if (num === undefined || num === null) return "0";
        return num.toLocaleString("uz-UZ");
    };

    const openDeleteDialog = (itemId, variantId) => {
        setDeletingVariant({ itemId, variantId });
        onDeleteDialogOpen();
    };

    const handleDeleteVariant = async () => {
        const { itemId, variantId } = deletingVariant;
        if (!itemId || !variantId) return;
        try {
            await apiOfferItems.DeleteVariant(itemId, variantId);
            setOffer(prev => ({
                ...prev,
                offer_items: prev.offer_items.map(item => {
                    if (item.id !== itemId) return item;
                    return { ...item, variants: item.variants.filter(v => v.id !== variantId) };
                })
            }));
            setSalePrices(prev => {
                const newPrices = { ...prev };
                delete newPrices[variantId];
                return newPrices;
            });
            toast({ title: "Muvaffaqiyatli", description: "Variant o‘chirildi", status: "success", duration: 3000 });
        } catch (err) {
            toast({ title: "Xatolik", description: "Variantni o‘chirishda xatolik", status: "error", duration: 5000 });
        } finally {
            onDeleteDialogClose();
            setDeletingVariant({ itemId: null, variantId: null });
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return "-";
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return "-";
        return `${String(date.getDate()).padStart(2, '0')}.${String(date.getMonth() + 1).padStart(2, '0')}.${date.getFullYear()}`;
    };

    const formatPrice = (price) => {
        const amount = parseFloat(price);
        return amount.toLocaleString('uz-UZ') + ' UZS';
    };

    if (loading) {
        return <Flex justify="center" align="center" h="100vh"><Spinner size="xl" /></Flex>;
    }

    if (error || !offer) {
        return <Box p={6}><Alert status="error"><AlertIcon />{error || "Ma'lumot topilmadi"}</Alert></Box>;
    }

    const isEditable = offer.status === "price_review";

    return (
        <Box py="20px" minH="100vh">
            <Box maxW="1200px" mx="auto">
                <Button leftIcon={<ArrowLeft size={18} />} variant="ghost" mb={6} onClick={() => navigate(-1)}>Orqaga</Button>

                <Card variant="outline" borderRadius="lg" overflow="hidden">
                    <Box borderBottom="1px solid" borderColor="gray.200" px={6} py={5}>
                        <Flex justify="space-between" align="center" wrap="wrap" gap={4}>
                            <HStack spacing={4}>
                                <FileText size={20} />
                                <Box>
                                    <Heading size="lg">{offer.offer_number}</Heading>
                                    <Text fontSize="sm" color="gray.600" mt={1}>{formatDate(offer.date)}</Text>
                                </Box>
                            </HStack>
                            <EditStatus id={offer.id} text="Siz rostanxam keyingi jarayonga otkazmoqchmisiz ?" refresh={getOffer} status={status} />
                        </Flex>
                    </Box>

                    <CardBody p={6}>
                        <Grid gap={6} mb={6}>
                            <GridItem>
                                <VStack align="start" spacing={4}>
                                    <Box>
                                        <Text fontWeight="bold" mb={2}>
                                            <Building size={16} style={{ display: 'inline', marginRight: '8px' }} />
                                            Qurilish ma'lumotlari
                                        </Text>
                                        <VStack align="start" spacing={2} pl={6}>
                                            <HStack align="start"><Text fontWeight="medium">Nomi:</Text><Text>{offer.construction_site_name}</Text></HStack>
                                            <HStack align="start"><Text fontWeight="medium">Manzil:</Text><Text>{offer.address}</Text></HStack>
                                        </VStack>
                                    </Box>
                                </VStack>
                            </GridItem>
                        </Grid>

                        {offer.note && (
                            <Alert status="info" borderRadius="md" mb={6}>
                                <AlertIcon /><Text fontWeight="bold" mr={2}>Izoh:</Text><Text>{offer.note}</Text>
                            </Alert>
                        )}

                        <Divider my={6} />

                        {/* Аккордеон для каждого товара */}
                        {offer.offer_items?.map((item) => (
                            item.variants && item.variants.length > 0 && (
                                <Box key={item.id} mt={6}>
                                    <Accordion allowToggle>
                                        <AccordionItem border="1px solid" borderColor="gray.200" borderRadius="md" mb={2}>
                                            {({ isExpanded }) => (
                                                <>
                                                    <AccordionButton
                                                        borderRadius="md"
                                                        p={4}
                                                        transition="all 0.2s"
                                                    >
                                                        <Box flex="1" textAlign="left">
                                                            <HStack wrap="wrap" spacing={4}>
                                                                <HStack>
                                                                    <Factory size={16} />
                                                                    <Text fontWeight="bold">{item.product_name}</Text>
                                                                </HStack>
                                                                <HStack spacing={1}>
                                                                    <Package size={14} />
                                                                    <Text fontSize="sm">{parseFloat(item.quantity).toLocaleString()} {item.unit}</Text>
                                                                </HStack>
                                                                <HStack spacing={1}>
                                                                    <Text fontSize="sm" color="gray.600">Peraxodnoy narx:</Text>
                                                                    <Text fontSize="sm">{formatPrice(item.customer_price)}</Text>
                                                                </HStack>
                                                                 
                                                                <Badge ml={2} colorScheme="blue">
                                                                    {item.variants.length} variant
                                                                </Badge>
                                                            </HStack>
                                                        </Box>
                                                        <AccordionIcon />
                                                    </AccordionButton>
                                                    <AccordionPanel
                                                        pb={4}
                                                        pt={4}
                                                        transition="all 0.25s ease-in-out"
                                                    >
                                                        <Flex justify="flex-end" mb={3}>
                                                            {isEditable && (
                                                                <Button
                                                                    size="sm"
                                                                    colorScheme="blue"
                                                                    leftIcon={<Save size={16} />}
                                                                    isLoading={savingPricesItemId === item.id}
                                                                    onClick={() => handleSaveAllPrices(item.id, item.variants)}
                                                                >
                                                                    Narxlarni saqlash
                                                                </Button>
                                                            )}
                                                        </Flex>
                                                        <TableContainer>
                                                            <Table size="sm" variant="simple">
                                                                <Thead>
                                                                    <Tr>
                                                                        <Th>Mahsulot nomi</Th>
                                                                        <Th>Zavod</Th>
                                                                        <Th>Manzil</Th>
                                                                        <Th isNumeric> Narxi</Th>
                                                                        <Th>Yetkazib berish</Th>
                                                                        {isEditable && <Th>Amallar</Th>}
                                                                    </Tr>
                                                                </Thead>
                                                                <Tbody>
                                                                    {item.variants.map((variant) => (
                                                                        <Tr key={variant.id}>
                                                                            <Td>{variant.product_name}</Td>
                                                                            <Td>{variant.factory_name || "-"}</Td>
                                                                            <Td><MapPin size={12} style={{ display: 'inline', marginRight: '4px' }} />{variant.address}</Td>
                                                                            <Td isNumeric>
                                                                                {isEditable ? (
                                                                                    <Input
                                                                                        size="sm"
                                                                                        value={formatNumberWithSpaces(salePrices[variant.id])}
                                                                                        onChange={(e) => handlePriceChange(variant.id, e.target.value)}
                                                                                        onBlur={(e) => {
                                                                                            const num = salePrices[variant.id];
                                                                                            if (!isNaN(num)) e.target.value = formatNumberWithSpaces(num);
                                                                                        }}
                                                                                    />
                                                                                ) : (
                                                                                    formatPrice(variant.sale_price ?? variant.cost_price)
                                                                                )}
                                                                            </Td>
                                                                            <Td>{variant.is_delivery ? "Bor" : "Yo'q"}</Td>
                                                                            {isEditable && (
                                                                                <Td>
                                                                                    <Button
                                                                                        size="xs"
                                                                                        colorScheme="red"
                                                                                        variant="ghost"
                                                                                        onClick={() => openDeleteDialog(item.id, variant.id)}
                                                                                        leftIcon={<Trash2 size={14} />}
                                                                                    >
                                                                                        O‘chirish
                                                                                    </Button>
                                                                                </Td>
                                                                            )}
                                                                        </Tr>
                                                                    ))}
                                                                </Tbody>
                                                            </Table>
                                                        </TableContainer>
                                                    </AccordionPanel>
                                                </>
                                            )}
                                        </AccordionItem>
                                    </Accordion>
                                </Box>
                            )
                        ))}
                    </CardBody>
                </Card>
            </Box>

            <AlertDialog isOpen={isDeleteDialogOpen} leastDestructiveRef={cancelRef} onClose={onDeleteDialogClose}>
                <AlertDialogOverlay><AlertDialogContent>
                    <AlertDialogHeader fontSize="lg" fontWeight="bold">Variantni o‘chirish</AlertDialogHeader>
                    <AlertDialogBody>Ushbu variantni butunlay o‘chirishni xohlaysizmi? Bu amalni qaytarib bo‘lmaydi.</AlertDialogBody>
                    <AlertDialogFooter>
                        <Button ref={cancelRef} onClick={onDeleteDialogClose}>Bekor qilish</Button>
                        <Button colorScheme="red" onClick={handleDeleteVariant} ml={3}>O‘chirish</Button>
                    </AlertDialogFooter>
                </AlertDialogContent></AlertDialogOverlay>
            </AlertDialog>
        </Box>
    );
}
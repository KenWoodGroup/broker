import {
    Box, Button, Flex, Heading, Stack, Text, Badge, VStack, HStack
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { apiOffers } from "../../utils/Controllers/Offers";
import ProductSearchBlock from "./_components/ProductSearchBlock";

export default function OfferDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [offer, setOffer] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const init = async () => {
            try {
                setLoading(true);
                const res = await apiOffers.getOffer(id);
                setOffer(res.data);

                // Auto-update status from 'new' to 'procces'
                if (res.data.status === 'new') {
                    try {
                        await apiOffers.UpdateStatus({ status: "procces" }, id);
                        // Update local state
                        setOffer(prev => ({ ...prev, status: "procces" }));
                    } catch (error) {
                        console.error("Failed to update status:", error);
                    }
                }
            } catch (error) {
                console.error("Failed to fetch offer:", error);
            } finally {
                setLoading(false);
            }
        };
        init();
    }, [id]);

    const handleCancel = async () => {
        try {
            await apiOffers.UpdateStatus({ status: "cancel" }, id);
            navigate("/operator/offers");
        } catch (error) {
            console.error("Failed to cancel offer:", error);
        }
    };

    if (loading || !offer) {
        return <Text p={6}>Loading...</Text>;
    }

    return (
        <Box p={6}>
            <Flex justify="space-between" mb={6} align="start">
                <VStack align="start" spacing={2}>
                    <HStack>
                        <Heading size="md">Offer Details</Heading>
                        <Badge
                            colorScheme={
                                offer.status === "new"
                                    ? "blue"
                                    : offer.status === "procces"
                                        ? "orange"
                                        : offer.status === "contract"
                                            ? "yellow"
                                            : offer.status === "finished"
                                                ? "green"
                                                : "red"
                            }
                        >
                            {offer.status}
                        </Badge>
                    </HStack>

                    {offer.note && (
                        <Text fontSize="sm" color="gray.600">
                            <strong>Note:</strong> {offer.note}
                        </Text>
                    )}

                    {offer.contract_number && (
                        <Text fontSize="sm" color="gray.600">
                            <strong>Contract:</strong> {offer.contract_number}
                        </Text>
                    )}

                    {offer.date && (
                        <Text fontSize="sm" color="gray.600">
                            <strong>Date:</strong> {new Date(offer.date).toLocaleDateString()}
                        </Text>
                    )}
                </VStack>

                <Stack direction="row">
                    <Button variant="ghost" onClick={() => navigate("/operator/offers")}>
                        Back
                    </Button>
                    <Button
                        colorScheme="red"
                        onClick={handleCancel}
                        isDisabled={offer.status === "cancel" || offer.status === "finished"}
                    >
                        Cancel Offer
                    </Button>
                </Stack>
            </Flex>

            <Stack spacing={8}>
                {offer.offer_items?.map((item) => (
                    <ProductSearchBlock
                        key={item.id}
                        initialQuery={item.product_name}
                        quantity={item.quantity}
                        itemId={item.id}
                        productId={item.product_id}
                    />
                ))}
            </Stack>
        </Box>
    );
}
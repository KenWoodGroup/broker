import {
    Box, Button, Flex, Heading, Stack, Text
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { apiOffers } from "../../utils/Controllers/Offers";
import ProductSearchBlock from "./_components/ProductSearchBlock";

export default function OfferDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [offer, setOffer] = useState(null);

    useEffect(() => {
        const init = async () => {
            const res = await apiOffers.getOffer(id);
            setOffer(res.data);
            if(res.data.status === 'new') {
                try{
                    await apiOffers.UpdateStatus({ status: "procces" }, id);
                }finally{}
            }
        };
        init();
    }, [id]);

    const handleCancel = async () => {
        await apiOffers.UpdateStatus({ status: "cancel" }, id);
        navigate("/operator/offers");
    };

    if (!offer) return <Text p={6}>Loading...</Text>;

    return (
        <Box p={6}>
            <Flex justify="space-between" mb={6}>
                <Box>
                    <Heading size="md">{offer.full_name}</Heading>
                    <Text color="gray.600">{offer.phone_number}</Text>
                </Box>

                <Stack direction="row">
                    <Button variant="ghost" onClick={() => navigate("/operator/offers")}>
                        Back
                    </Button>
                    <Button colorScheme="red" onClick={handleCancel}>
                        Cancel
                    </Button>
                </Stack>
            </Flex>

            <Stack spacing={8}>
                {offer.products.map((p) => (
                    <ProductSearchBlock key={p} initialQuery={p} />
                ))}
            </Stack>
        </Box>
    );
}

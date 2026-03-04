import {
    Box,
    Flex,
    Text,
    IconButton,
    useColorModeValue,
    VStack,
    HStack,
    Checkbox,
    useDisclosure,
} from "@chakra-ui/react";
import { MapPin, Phone, Plus, Minus, RemoveFormatting, CircleMinus } from "lucide-react";
import React, { useState } from "react";
import ConfirmDelModal from "../../../components/common/ConfirmDelModal";
import { apiLocationCategories } from "../../../utils/Controllers/apiLocationCategory";
import { useNavigate } from "react-router";

const FactoryCard = React.memo(function FactoryCard({
    factory,
    id,
    categoryName,
    joinMode = false,
    checked = false,
    onToggleSelect,
    onDeleted,
}) {
    const bg = useColorModeValue("white", "gray.800");
    const border = useColorModeValue("gray.200", "gray.700");
    const textSub = useColorModeValue("gray.600", "gray.400");
    const [loading, setLoading] = useState(false)
    const confirmModal = useDisclosure();
    const [selectedItem, setSelectedItem] = useState();
    const navigate = useNavigate()

    const deleteFactoryFromCategory = async () => {
        setLoading(true)
        try {
            const res = await apiLocationCategories.Delete(id);
            confirmModal.onClose();
            if (onDeleted) {
                onDeleted()
            }
        } finally {
            setLoading(false)
        }
    };

    const openMapWithCurrentLocation = (e) => {
        e.stopPropagation();
        const lat = factory?.lat;
        const lng = factory?.lng;

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const originLat = position.coords.latitude;
                const originLng = position.coords.longitude;

                const url = `https://www.google.com/maps/dir/?api=1&origin=${originLat},${originLng}&destination=${lat},${lng}`;

                window.open(
                    url,
                    "_blank",
                    "noopener,noreferrer,width=1200,height=800"
                );
            },
            (error) => {
                // Agar location ruxsat berilmasa
                const fallbackUrl = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
                window.open(
                    fallbackUrl,
                    "_blank",
                    "noopener,noreferrer,width=1200,height=800"
                );
            }
        );
    }


    return (
        <Box
            position="relative"
            bg={bg}
            border="1px solid"
            borderColor={border}
            borderRadius="12px"
            p="16px"
            transition="all .2s"
            _hover={{ shadow: "md" }}
            onClick={() => {
                if (!joinMode) {
                    navigate(`/factories/${factory?.id}`)
                }
            }}
        >
            {/* Join checkbox */}
            {joinMode ? (
                <IconButton
                    position="absolute"
                    top="8px"
                    right="8px"
                    size="sm"
                    colorScheme={checked ? "green" : "gray"}
                    icon={checked ? <Minus size={16} /> : <Plus size={16} />}
                    aria-label="select"
                    onClick={(e) => {
                        e.stopPropagation()
                        onToggleSelect(factory)
                    }}
                />
            ) : (
                <IconButton
                    position="absolute"
                    borderRadius={"50%"}
                    top="8px"
                    right="8px"
                    size="30px"
                    colorScheme={"red"}
                    icon={<CircleMinus size={"22px"} />}
                    aria-label="select"
                    onClick={(e) => {
                        e.stopPropagation()
                        confirmModal.onOpen()
                    }}
                />
            )}

            {/* Content */}
            <VStack align="start" spacing="10px">
                <Text fontWeight="600" fontSize="lg" noOfLines={2}>
                    {factory?.name || "-"}
                </Text>

                <HStack spacing="8px" color={textSub}>
                    <MapPin size={16} />
                    <Text 
                        onClick={(e) => openMapWithCurrentLocation(e)}
                        _hover={{ color: (factory?.lat && factory?.lng) ? 'link' : textSub, cursor: (factory?.lat && factory?.lng) ? 'pointer' : 'default' }}
                        fontSize="sm" noOfLines={1}
                    >
                        {factory?.address || "-"}
                    </Text>
                </HStack>

                <HStack spacing="8px" color={textSub}>
                    <Phone size={16} />
                    <Text fontSize="sm">{factory?.phone || "-"}</Text>
                </HStack>
            </VStack>
            {/* Confirm Remove Modal */}
            <ConfirmDelModal isOpen={confirmModal.isOpen} onClose={confirmModal.onClose} onConfirm={deleteFactoryFromCategory} itemName={factory?.name} loading={loading} typeItem={`location from category(${categoryName})`} />
        </Box>
    );
});

export default FactoryCard;

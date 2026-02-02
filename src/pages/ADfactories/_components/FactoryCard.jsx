import {
    Box,
    Flex,
    Text,
    IconButton,
    useColorModeValue,
    VStack,
    HStack,
    useDisclosure
} from "@chakra-ui/react";
import { MapPin, Phone, MoreVertical, Pencil, Trash2 } from "lucide-react";
import React, { useState } from "react";
import EditFactoryButton from "./EditFactoryButton";
import ConfirmDelModal from "../../../components/common/ConfirmDelModal";
import { apiLocations } from "../../../utils/Controllers/Locations";
import { useNavigate } from "react-router";

const FactoryCard = React.memo(function FactoryCard({ factory, onEdit, onDelete }) {
    const navigate = useNavigate()
    const delModal = useDisclosure()
    const bg = useColorModeValue("white", "gray.800");
    const border = useColorModeValue("gray.200", "gray.700");
    const textSub = useColorModeValue("gray.600", "gray.400");
    // states
    const [delLoading, setDelLoading] = useState(false);
    const deleteFactory = async () => {
        setDelLoading(true);
        try {
            const res = await apiLocations.Delete(factory?.id, "Factory");
            delModal.onClose()
            if (onDelete) {
                onDelete();
            }
        } finally {
            setDelLoading(false)
        }
    };

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
            role="group"
            onClick={()=>{
                navigate(`/factories/${factory?.id}`)
            }}
        >
            {/* Actions */}
            <Box position="absolute" top="8px" right="8px">
                {/* ⋮ icon */}
                <IconButton
                    size="sm"
                    variant="ghost"
                    icon={<MoreVertical size={18} />}
                    aria-label="Actions"
                    transition="all .2s"
                    _groupHover={{
                        opacity: 0,
                        pointerEvents: "none",
                    }}
                />

                {/* OLD vertical actions (unchanged design) */}
                <Flex
                    direction="column"
                    position="absolute"
                    top="8px"          // 👈 sal tepaga ko‘tarildi
                    right="0"
                    bg={bg}
                    border="1px solid"
                    borderColor={border}
                    borderRadius="8px"
                    opacity={0}
                    pointerEvents="none"
                    transition="all .2s"
                    _groupHover={{
                        opacity: 1,
                        pointerEvents: "auto",
                    }}
                    zIndex={2}
                >
                    {/* <IconButton
                        size="sm"
                        variant="ghost"
                        icon={<Pencil size={16} />}
                        onClick={() => onEdit(factory)}
                        aria-label="Edit"
                    /> */}
                    <EditFactoryButton factoryId={factory?.id} initialData={factory} onReload={onEdit} />
                    <IconButton
                        size="sm"
                        variant="ghost"
                        colorScheme="red"
                        icon={<Trash2 size={16} />}
                        onClick={(e) => {
                            e.stopPropagation()
                            delModal.onOpen()
                        }}
                        aria-label="Delete"
                    />
                </Flex>
            </Box>

            {/* Content */}
            <VStack align="start" spacing="10px">
                <Text fontWeight="600" fontSize="lg" noOfLines={2}>
                    {factory?.name || "-"}
                </Text>

                <HStack spacing="8px" color={textSub}>
                    <MapPin size={16} />
                    <Text fontSize="sm" noOfLines={1}>
                        {factory?.address || "-"}
                    </Text>
                </HStack>

                <HStack spacing="8px" color={textSub}>
                    <Phone size={16} />
                    <Text fontSize="sm">
                        {factory?.phone || "-"}
                    </Text>
                </HStack>
            </VStack>

            <ConfirmDelModal
                isOpen={delModal.isOpen}
                onClose={delModal.onClose}
                typeItem={"Factory"}
                itemName={factory?.name}
                loading={delLoading}
                onConfirm={deleteFactory}
            />
        </Box>
    );
});

export default FactoryCard;

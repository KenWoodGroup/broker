import {
    Box,
    Text,
    IconButton,
    useColorModeValue,
    VStack,
    useDisclosure,
} from "@chakra-ui/react";
import { Plus, Minus, X } from "lucide-react";
import React, { useState } from "react";
import ConfirmDelModal from "../../../components/common/ConfirmDelModal";
import { apiLocationCategories } from "../../../utils/Controllers/apiLocationCategory";

const CategoryCard = React.memo(function CategoryCard({
    category,
    pairId,
    joinMode = false,
    checked = false,
    onToggleSelect,
    reload,
}) {
    const bg = useColorModeValue("white", "gray.800");
    const border = useColorModeValue("gray.200", "gray.700");
    const confirmModal = useDisclosure();

    const [loading, setLoading] = useState();

    const deletePair = async () => {
        setLoading(true);
        try{
            await apiLocationCategories.Delete(pairId);
            confirmModal.onClose();
            if(reload) {
                reload();
            }
        }finally {
            setLoading(false)
        }
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
        >
            {/* Actions */}
            {joinMode ? (
                <IconButton
                    position="absolute"
                    top="8px"
                    right="8px"
                    size="sm"
                    colorScheme={checked ? "green" : "gray"}
                    icon={checked ? <Minus size={16} /> : <Plus size={16} />}
                    aria-label="select"
                    onClick={() => onToggleSelect(category)}
                />
            ) : (
                <IconButton
                    position="absolute"
                    top="8px"
                    right="8px"
                    size="sm"
                    colorScheme="red"
                    icon={<X size={16} />}
                    aria-label="remove"
                    onClick={confirmModal.onOpen}
                />
            )}

            <VStack align="start">
                <Text fontWeight="600" fontSize="lg">
                    {category?.name || "-"}
                </Text>
            </VStack>

            <ConfirmDelModal isOpen={confirmModal.isOpen} onClose={confirmModal.onClose} onConfirm={deletePair} itemName={category?.name} loading={loading} typeItem={"category from factory"}/>
        </Box>
    );
});

export default CategoryCard;

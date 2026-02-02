import {
    Box,
    Flex,
    Text,
    IconButton,
    useColorModeValue,
    useDisclosure,
} from "@chakra-ui/react";
import { Layers, Pencil, Trash2 } from "lucide-react";
import React, { useState } from "react";
import EditCategoryButton from "./EditCategoryButton";
import ConfirmDelModal from "../../../components/common/ConfirmDelModal";
import { apiCategories } from "../../../utils/Controllers/Categories";

const CategoryCard = React.memo(function CategoryCard({
    category,
    onEdit,
    onDelete,
    onOpen
}) {
    const bg = useColorModeValue("white", "gray.800");
    const border = useColorModeValue("gray.200", "gray.700");
    const hoverBg = useColorModeValue("gray.50", "gray.700");

    const confirmDelModal = useDisclosure();

    // states
    const [delLoading, setDelLoading] = useState(false);
    const deleteCategory = async () => {
        setDelLoading(true);
        try {
            const res = await apiCategories.Delete(category?.id);
            confirmDelModal.onClose()
            if (onDelete) {
                onDelete();
            }
        } finally {
            setDelLoading(false)
        }
    }

    return (
        <Box
            position="relative"
            bg={bg}
            border="1px solid"
            borderColor={border}
            borderRadius="12px"
            p="20px"
            cursor="pointer"
            transition="all .2s"
            _hover={{ shadow: "md", bg: hoverBg }}
            role="group"
            onClick={onOpen}
        >
            {/* Actions */}
            <Box position="absolute" top="8px" right="8px">
                <IconButton
                    size="sm"
                    variant="ghost"
                    icon={<Layers size={18} />}
                    aria-label="Category actions"
                    _groupHover={{
                        opacity: 0,
                        pointerEvents: "none",
                    }}
                />

                <Flex
                    position="absolute"
                    top="0"
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
                    onClick={(e) => e.stopPropagation()}
                >
                    <EditCategoryButton categoryId={category?.id} initialData={category} onReload={onEdit} />
                    <IconButton
                        size="sm"
                        variant="ghost"
                        colorScheme="red"
                        icon={<Trash2 size={16} />}
                        onClick={confirmDelModal.onOpen}
                        aria-label="Delete"
                    />
                </Flex>
            </Box>

            <Text fontWeight="600" fontSize="lg" noOfLines={2}>
                {category?.name || "-"}
            </Text>
            <ConfirmDelModal
                isOpen={confirmDelModal.isOpen}
                onClose={confirmDelModal.onClose}
                itemName={category?.name}
                typeItem={"Category"}
                loading={delLoading}
                onConfirm={deleteCategory}
            />
        </Box>
    );
});

export default CategoryCard;

import {
    Box,
    Text,
    IconButton,
    useColorModeValue,
    VStack,
} from "@chakra-ui/react";
import { Plus, Minus, X } from "lucide-react";
import React from "react";

const CategoryCard = React.memo(function CategoryCard({
    category,
    joinMode = false,
    checked = false,
    onToggleSelect,
}) {
    const bg = useColorModeValue("white", "gray.800");
    const border = useColorModeValue("gray.200", "gray.700");

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
                // remove functionni o‘zing ulaysan
                />
            )}

            <VStack align="start">
                <Text fontWeight="600" fontSize="lg">
                    {category?.name || "-"}
                </Text>
            </VStack>
        </Box>
    );
});

export default CategoryCard;

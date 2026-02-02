import { Box, Skeleton } from "@chakra-ui/react";
import React from "react";

export default function CategoryCardSkeleton() {
    return (
        <Box
            border="1px solid"
            borderColor="gray.200"
            borderRadius="12px"
            p="20px"
        >
            <Skeleton height="20px" width="70%" />
        </Box>
    );
}

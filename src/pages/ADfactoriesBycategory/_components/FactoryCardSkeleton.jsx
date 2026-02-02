import { Box, Skeleton, Spacer, VStack } from "@chakra-ui/react";

export default function FactoryCardSkeleton() {
    return (
        <Box border="1px solid" borderColor="gray.200" borderRadius="12px" p="16px">
            <VStack align="stretch" spacing="10px">
                <Skeleton height="20px" w='88%'/>
                <Spacer/>
                <Skeleton height="14px" w="77%"/>
                <Skeleton height="14px" w="44%"/>
            </VStack>
        </Box>
    );
}

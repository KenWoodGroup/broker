import {
    Box,
    Grid,
    GridItem,
    Stat,
    StatLabel,
    StatNumber,
    Text,
    VStack,
    HStack,
    Spinner
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { apiStatistics } from "../../utils/Controllers/apiStatistics";

export default function ADhome() {
    const [data, setData] = useState({});
    const [loading, setLoading] = useState(false);

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await apiStatistics.GetSystemData();
            setData(res.data);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    return (
        <Box bg="bg" minH="100vh" p={6}>
            {loading ? (
                <Box display="flex" justifyContent="center" mt={20}>
                    <Spinner size="xl" />
                </Box>
            ) : (
                <Grid
                    templateColumns={{
                        base: "1fr",
                        md: "repeat(2,1fr)",
                        xl: "repeat(3,1fr)",
                    }}
                    gap={6}
                >
                    {/* LOCATIONS */}
                    <GridItem>
                        <Box
                            bg="surface"
                            p={6}
                            borderRadius="xl"
                            border="1px"
                            borderColor="border"
                        >
                            <Text fontSize="lg" fontWeight="bold" mb={4} color="text">
                                Locations
                            </Text>

                            <VStack align="start" spacing={4}>
                                <Stat>
                                    <StatLabel color="neutral.500">Companies</StatLabel>
                                    <StatNumber color="primary">
                                        {data?.locations?.companyCount ?? 0}
                                    </StatNumber>
                                </Stat>

                                <Stat>
                                    <StatLabel color="neutral.500">Factories</StatLabel>
                                    <StatNumber>
                                        {data?.locations?.factoryCount ?? 0}
                                    </StatNumber>
                                </Stat>
                            </VStack>
                        </Box>
                    </GridItem>

                    {/* USERS */}
                    <GridItem>
                        <Box
                            bg="surface"
                            p={6}
                            borderRadius="xl"
                            border="1px"
                            borderColor="border"
                        >
                            <Text fontSize="lg" fontWeight="bold" mb={4} color="text">
                                Users
                            </Text>

                            <VStack align="start" spacing={4}>
                                <Stat>
                                    <StatLabel color="neutral.500">Brokers</StatLabel>
                                    <StatNumber color="primary">
                                        {data?.users?.brokerCount ?? 0}
                                    </StatNumber>
                                </Stat>

                                <Stat>
                                    <StatLabel color="neutral.500">Sales Reps</StatLabel>
                                    <StatNumber>
                                        {data?.users?.salesRepCount ?? 0}
                                    </StatNumber>
                                </Stat>
                            </VStack>
                        </Box>
                    </GridItem>

                    {/* OFFERS */}
                    <GridItem>
                        <Box
                            bg="surface"
                            p={6}
                            borderRadius="xl"
                            border="1px"
                            borderColor="border"
                        >
                            <Text fontSize="lg" fontWeight="bold" mb={4} color="text">
                                Offers
                            </Text>

                            <VStack align="start" spacing={4}>
                                <HStack w="100%" justify="space-between">
                                    <Text color="neutral.500">New</Text>
                                    <Text fontWeight="bold" color="primary">
                                        {data?.offers?.newCount ?? 0}
                                    </Text>
                                </HStack>

                                <HStack w="100%" justify="space-between">
                                    <Text color="neutral.500">Completed</Text>
                                    <Text fontWeight="bold">
                                        {data?.offers?.completedCount ?? 0}
                                    </Text>
                                </HStack>

                                <HStack w="100%" justify="space-between">
                                    <Text color="neutral.500">Cancelled</Text>
                                    <Text fontWeight="bold">
                                        {data?.offers?.cancelledCount ?? 0}
                                    </Text>
                                </HStack>

                                <HStack w="100%" justify="space-between">
                                    <Text color="neutral.500">Other</Text>
                                    <Text fontWeight="bold">
                                        {data?.offers?.otherCount ?? 0}
                                    </Text>
                                </HStack>
                            </VStack>
                        </Box>
                    </GridItem>
                </Grid>
            )}
        </Box>
    );
}
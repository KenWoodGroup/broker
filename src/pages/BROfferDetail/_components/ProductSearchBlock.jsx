import {
    Box, Input, Table, Thead, Tbody, Tr, Th, Td,
    Button, Flex, Text
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import useDebounce from "../../../hooks/useDebounce";
import { apiRequests } from "../../../utils/Controllers/Requests";
import TableSkeleton from "../../../components/ui/TableSkeleton";

export default function ProductSearchBlock({ initialQuery }) {
    const [query, setQuery] = useState(initialQuery);
    const debouncedQuery = useDebounce(query, 500);

    const [page, setPage] = useState(1);
    const [rows, setRows] = useState([]);
    const [pagination, setPagination] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!debouncedQuery) return;

        const fetch = async () => {
            setLoading(true);
            try {
                const res = await apiRequests.getPage(page, debouncedQuery);
                setRows(res.data.data);
                setPagination(res.data.pagination);
            } finally {
                setLoading(false);
            }
        };

        fetch();
    }, [debouncedQuery, page]);

    return (
        <Box borderWidth="1px" borderRadius="lg" p={4}>
            <Input
                mb={4}
                value={query}
                onChange={(e) => {
                    setQuery(e.target.value);
                    setPage(1);
                }}
                placeholder="Search product"
            />

            {loading ? (
                <Table>
                    <Thead>
                        <Tr>
                            <Th>#</Th>
                            <Th>Name</Th>
                            <Th>Unit</Th>
                            <Th>Quantity</Th>
                            <Th>Price</Th>
                            <Th>Factory</Th>
                            <Th>Phone</Th>
                            <Th>Location</Th>
                        </Tr>
                    </Thead>
                    <Tbody>
                        <TableSkeleton rows={5} columns={7} />
                    </Tbody>
                </Table>
            ) : rows.length ? (
                <>
                    <Table size="sm">
                        <Thead>
                            <Tr>
                                <Th>#</Th>
                                <Th>Name</Th>
                                <Th>Unit</Th>
                                <Th>Quantity</Th>
                                <Th>Price</Th>
                                <Th>Factory</Th>
                                <Th>Phone</Th>
                                <Th>Location</Th>
                            </Tr>
                        </Thead>
                        <Tbody>
                            {rows.map((r, i) => (
                                <Tr key={r.id}>
                                    <Td>{i + 1}</Td>
                                    <Td>{r.product.name}</Td>
                                    <Td>{r.product.unit}</Td>
                                    <Td>{r.quantity}</Td>
                                    <Td>{r.purchase_price}</Td>
                                    <Td>{r.location?.parent?.name}</Td>
                                    <Td>
                                        <a href={`tel:${r?.location?.phone}`}>
                                            {r?.location?.phone}
                                        </a>
                                    </Td>
                                    <Td>{r.location.address}</Td>
                                </Tr>
                            ))}
                        </Tbody>
                    </Table>

                    <Flex justify="space-between" mt={4}>
                        <Button
                            size="sm"
                            onClick={() => setPage((p) => p - 1)}
                            isDisabled={page === 1}
                        >
                            Prev
                        </Button>

                        <Text fontSize="sm">
                            Page {pagination?.currentPage} / {pagination?.totalPages}
                        </Text>

                        <Button
                            size="sm"
                            onClick={() => setPage((p) => p + 1)}
                            isDisabled={page === pagination?.totalPages}
                        >
                            Next
                        </Button>
                    </Flex>
                </>
            ) : (
                <Text color="gray.500">No products found</Text>
            )}
        </Box>
    );
}

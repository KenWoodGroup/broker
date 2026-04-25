import {
    Box,
    Flex,
    Heading,
    Table,
    Thead,
    Tbody,
    Tr,
    Th,
    Td,
    TableContainer,
    Button,
    Text,
    Spinner,
    HStack,
    IconButton,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router";
import { apiUsers } from "../../utils/Controllers/Users";
import CreateLotCreator from "./__components/CreateLotCreator";
import DeleteLotCreator from "./__components/DeleteLotCreator";
import EditLotCreator from "./__components/EditLotCreator";
import LoginPermissionSwitch from "../ClcompanyDetail/__components/LoginPermissionSwitch"
import PaginationBar from "../../components/common/PaginationBar";

export default function ADLotCreators() {
    const navigate = useNavigate();

    const [users, setUsers] = useState([]);
    const [pagination, setPagination] = useState(null);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(false);

    const getAll = async (pageNumber = 1) => {
        try {
            setLoading(true);
            const response = await apiUsers.getLotCreators(pageNumber);
            setUsers(response.data.data?.records || []);
            setPagination(response.data.data?.pagination || null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        getAll(page);
    }, [page]);

    return (
        <Box pr="20px" pb="20px" mt={"20px"}>
            <Flex justifyContent="space-between" mb="20px">
                <HStack>
                    <IconButton
                        variant="ghost"
                        aria-label="Back to roles"
                        icon={<ArrowLeft size={18} />}
                        onClick={() => navigate(-1)}
                    />
                    <Heading size="lg">Lot yaratuvchilar</Heading>
                </HStack>
                <CreateLotCreator refresh={() => getAll(page)} />
            </Flex>

            {loading ? (
                <Flex justify="center" py="50px">
                    <Spinner size="xl" />
                </Flex>
            ) : users?.length === 0 ? (
                <Flex
                    justify="center"
                    align="center"
                    direction="column"
                    py="80px"
                    borderWidth="1px"
                    borderRadius="lg"
                >
                    <Text fontSize="lg" fontWeight="semibold" color="gray.500">
                        Ma'lumot yo‘q
                    </Text>
                    <Text fontSize="sm" color="gray.400">
                        Hozircha lot creatorlar mavjud emas
                    </Text>
                </Flex>
            ) : (
                <>
                    <TableContainer borderWidth="1px" borderRadius="lg" boxShadow="md">
                        <Table variant="simple">
                            <Thead>
                                <Tr>
                                    <Th>#</Th>
                                    <Th>To'liq ism</Th>
                                    <Th>Username</Th>
                                    <Th>Yaratilgan sana</Th>
                                    <Th>Login</Th>
                                    <Th></Th>
                                </Tr>
                            </Thead>
                            <Tbody>
                                {users.map((item, index) => (
                                    <Tr key={item.id}>
                                        <Td>{(page - 1) * 10 + index + 1}</Td>
                                        <Td>{item.full_name}</Td>
                                        <Td>{item.username}</Td>
                                        <Td>{new Date(item.createdAt).toLocaleDateString()}</Td>
                                        <Td>
                                            <LoginPermissionSwitch userId={item.id} initialValue={item.is_login} />
                                        </Td>
                                        <Td>
                                            <Flex gap="10px">
                                                <DeleteLotCreator
                                                    id={item?.id}
                                                    itemName={item?.full_name}
                                                    typeItem="lot yaratuvchi"
                                                    refresh={() => getAll(page)}
                                                />
                                                <EditLotCreator data={item} refresh={() => getAll(page)} />
                                            </Flex>
                                        </Td>
                                    </Tr>
                                ))}
                            </Tbody>
                        </Table>
                    </TableContainer>

                    {pagination && (
                        <PaginationBar
                            mt={5}
                            page={pagination.currentPage ?? page}
                            totalPages={pagination.total_pages ?? 1}
                            loading={loading}
                            onPageChange={(p) => setPage(p)}
                        />
                    )}
                </>
            )}
        </Box>
    );
}


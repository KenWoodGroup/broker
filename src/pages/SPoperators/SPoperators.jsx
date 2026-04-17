import {
    Box,
    Button,
    Flex,
    Heading,
    HStack,
    IconButton,
    Spinner,
    Table,
    TableContainer,
    Tbody,
    Td,
    Text,
    Th,
    Thead,
    Tr,
    useDisclosure,
} from "@chakra-ui/react";
import { useEffect, useRef, useState } from "react";
import TableSkeleton from "../../components/ui/TableSkeleton";
import { apiManagers } from "../../utils/Controllers/Managers";
import CopyUsername from "../../components/common/CopyUsername";
import { formatDateTime } from "../../utils/tools/formatDateTime";
import ConfirmDelModal from "../../components/common/ConfirmDelModal";
import ResetPassModal from "../../components/common/ResetPassModal";
import OperatorModal from "./_components/OperatorModal";
import { apiUsers } from "../../utils/Controllers/Users";
import { useNavigate } from "react-router";
import { ArrowLeft, PencilLine, Plus, Trash } from "lucide-react";
import LoginPermissionSwitch from "../ClcompanyDetail/__components/LoginPermissionSwitch";

export default function SPoperators() {
    const navigate = useNavigate()
    const formModal = useDisclosure();
    const confirmModal = useDisclosure();
    const resetPassModal = useDisclosure();

    const clickCount = useRef(0);
    const timer = useRef(null);
    const delay = 200;

    // UI states
    const [tableLoading, setTableLoading] = useState(false);
    const [delLoading, setDelLoading] = useState(false);
    const [resettingPassUser, setResettingPassUser] = useState(null);
    const [validating, setValidating] = useState(false);

    // data states
    const [managers, setManagers] = useState([]);
    const [editingManager, setEditingManager] = useState(null);
    const [deletingManger, setDeletingManager] = useState(null);
    const [pass, setPass] = useState("");
    const [confirmPass, setConfirmPass] = useState("")

    // GET
    const fetchManagers = async () => {
        try {
            if (managers.length === 0) setTableLoading(true);
            const res = await apiUsers.getBrokers();
            if (res.status === 200 || res.status === 201) {
                setManagers(res.data || []);
            }
        } finally {
            setTableLoading(false)
        }
    };
    useEffect(() => {
        fetchManagers()
    }, []);

    // DELETE
    const deleteManager = async (id) => {
        try {
            setDelLoading(true)
            const res = await apiManagers.Delete(id);
            if (res.status === 200 || res.status === 201) {
                confirmModal.onClose()
                fetchManagers();
            }
        } finally {
            setDelLoading(false)
        }
    };
    // Local control clickes on edit
    const handleClick = (item) => {
        clickCount.current += 1;

        if (timer.current) return;

        timer.current = setTimeout(() => {
            if (clickCount.current === 1) {
                // single click logic
                // console.log("SINGLE CLICK");
                setEditingManager(item);
                formModal.onOpen();
            }

            if (clickCount.current === 2) {
                // double click logic
                setResettingPassUser(item);
                resetPassModal.onOpen();
                setPass("");
                setConfirmPass("");
            }

            // reset
            clickCount.current = 0;
            timer.current = null;
        }, delay);
    };

    return (
        <Box py="20px" pr="20px">
            <Flex justifyContent="space-between" mb="20px">
                <HStack>
                    <IconButton
                        variant="ghost"
                        aria-label="Back to factories"
                        icon={<ArrowLeft size={18} />}
                        onClick={() => {
                            navigate(-1)
                        }}
                    />
                    <Heading size="lg">Brokerlar</Heading>
                </HStack>
                <Button
                    colorScheme="blue"
                    leftIcon={<Plus size={15} />}
                    onClick={() => {
                        setEditingManager(null);
                        formModal.onOpen();
                    }}
                >
                    Broker yaratish
                </Button>
            </Flex>

            {tableLoading ? (
                <Flex justify="center" py="50px">
                    <Spinner size="xl" />
                </Flex>
            ) : managers.length === 0 ? (
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
                        Hozircha brokerlar mavjud emas
                    </Text>
                </Flex>
            ) : (
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
                            {managers.map((item, index) => (
                                <Tr key={item.id}>
                                    <Td>{index + 1}</Td>
                                    <Td>{item.full_name}</Td>
                                    <Td>
                                        <CopyUsername username={item.username} />
                                    </Td>
                                    <Td>
                                        {formatDateTime(item.createdAt, "uz-UZ", {
                                            month: "numeric",
                                        })}
                                    </Td>
                                    <Td>
                                        <LoginPermissionSwitch userId={item.id} initialValue={item.is_login} />
                                    </Td>
                                    <Td>
                                        <Flex gap="10px">
                                            <Button
                                                size="sm"
                                                colorScheme="blue"
                                                variant="ghost"
                                                onClick={() => handleClick(item)}
                                            >
                                                              <PencilLine size={18} />

                                            </Button>
                                            <Button
                                                size="sm"
                                                colorScheme="red"
                                                variant="ghost"
                                                onClick={() => {
                                                    setDeletingManager(item);
                                                    confirmModal.onOpen();
                                                }}
                                            >
                                                                <Trash size={18} />

                                            </Button>
                                        </Flex>
                                    </Td>
                                </Tr>
                            ))}
                        </Tbody>
                    </Table>
                </TableContainer>
            )}
            {/* MODAL */}
            <OperatorModal isOpen={formModal.isOpen} onClose={formModal.onClose} reload={fetchManagers} initialData={editingManager} />
            <ConfirmDelModal isOpen={confirmModal.isOpen} onClose={confirmModal.onClose} itemName={deletingManger?.full_name} typeItem={"Manager"} loading={delLoading} onConfirm={() => deleteManager(deletingManger?.id)} />
            <ResetPassModal pass={pass} confirmPass={confirmPass}
                setPass={setPass} setConfirmPass={setConfirmPass}
                validating={validating} setValidating={setValidating}
                isOpen={resetPassModal.isOpen}
                onClose={() => {
                    resetPassModal.onClose()
                    setValidating(false)
                }}
                user={resettingPassUser} typeItem={"manager"} />
        </Box>
    )
}
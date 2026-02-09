import {
    Box,
    Flex,
    Text,
    Switch,
    useColorMode,
    useDisclosure,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    Button,
    Stack,
    Spinner,
} from "@chakra-ui/react";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { apiOptions } from "../../utils/Controllers/apiOptions";

export default function FactoryOptionsPage() {
    const { factoryId } = useParams(); // /factories/:id/options

    const { isOpen, onOpen, onClose } = useDisclosure();

    const [allOptions, setAllOptions] = useState([]);
    const [factoryOptions, setFactoryOptions] = useState([]);
    const [selectedOption, setSelectedOption] = useState(null);
    const [actionType, setActionType] = useState(null);
    const [loading, setLoading] = useState(false);

    /* =========================
       GET REQUESTS
    ========================= */

    const fetchAllOptions = async () => {
        // const res = await axios.get("/api/options");
        // setAllOptions(res.data);
        try {
            const res = await apiOptions.getAll();
            setAllOptions(res.data);
        } finally {

        }
    };

    const fetchFactoryOptions = async () => {
        // const res = await axios.get(`/api/factories/${factoryId}/options`);
        // setFactoryOptions(res.data);
        try {
            const res = await apiOptions.getLocalOptions(factoryId);
            setFactoryOptions(res.data)
        } finally {

        }
    };

    useEffect(() => {
        fetchAllOptions();
        fetchFactoryOptions();
    }, [factoryId]);

    /* =========================
       ACTIVE OPTION IDS (Set)
    ========================= */

    const activeOptionIds = useMemo(() => {
        return new Set(factoryOptions.map((fo) => fo.option_id));
    }, [factoryOptions]);

    const getFactoryOptionItem = (optionId) => {
        return factoryOptions.find((fo) => fo.option_id === optionId);
    };

    /* =========================
       TOGGLE HANDLER
    ========================= */

    const onToggleClick = (option) => {
        const isActive = activeOptionIds.has(option.id);
        setSelectedOption(option);
        setActionType(isActive ? "deactivate" : "activate");
        onOpen();
    };

    /* =========================
       CONFIRM ACTION
    ========================= */

    const onConfirm = async () => {
        if (!selectedOption) return;

        setLoading(true);

        try {
            if (actionType === "activate") {
                // await axios.post("/api/factory-options", {
                //   factory_id: factoryId,
                //   option_id: selectedOption.id,
                // });
                const data = {
                    location_id: factoryId,
                    option_id: selectedOption.id
                }
                await apiOptions.addLocalOption(data)
            } else {
                const factoryOption = getFactoryOptionItem(selectedOption.id);
                if (!factoryOption) return;

                // await axios.delete(`/api/factory-options/${factoryOption.id}`);
                await apiOptions.Delete(factoryOption.id)
            }

            await fetchAllOptions();
            await fetchFactoryOptions();
        } finally {
            setLoading(false);
            onClose();
            setSelectedOption(null);
            setActionType(null);
        }
    };

    /* =========================
       UI
    ========================= */

    return (
        <Box bg={"bg"} p={{ base: 4, md: 8 }}>
            <Flex justify="space-between" align="center" mb={6}>
                <Text fontSize="xl" fontWeight="bold">
                    Factory Options
                </Text>
            </Flex>

            <Stack spacing={4}>
                {allOptions.map((option) => {
                    const isActive = activeOptionIds.has(option.id);

                    return (
                        <Flex
                            key={option.id}
                            bg={"surface"}
                            p={4}
                            borderRadius="lg"
                            justify="space-between"
                            align="center"
                            boxShadow="sm"
                        >
                            <Box>
                                <Text fontWeight="semibold">{option.name}</Text>
                                <Text fontSize="sm" opacity={0.7}>
                                    Price: {option.price}
                                </Text>
                            </Box>

                            <Switch
                                isChecked={isActive}
                                onChange={() => onToggleClick(option)}
                                isDisabled={loading}
                                size="lg"
                                colorScheme="green"
                            />
                        </Flex>
                    );
                })}
            </Stack>

            {/* =========================
          CONFIRM MODAL
      ========================= */}

            <Modal isOpen={isOpen} onClose={loading ? () => { } : onClose} isCentered>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>Confirmation</ModalHeader>

                    <ModalBody>
                        <Text>
                            Siz{" "}
                            <b>{selectedOption?.name}</b> opsiyasini{" "}
                            <b>
                                {actionType === "activate"
                                    ? "faollashtirmoqchimisiz"
                                    : "o‘chirmoqchimisiz"}
                            </b>
                            ?
                        </Text>
                    </ModalBody>

                    <ModalFooter gap={3}>
                        <Button onClick={onClose} isDisabled={loading}>
                            Bekor qilish
                        </Button>

                        <Button
                            colorScheme={actionType === "activate" ? "green" : "red"}
                            onClick={onConfirm}
                            isDisabled={loading}
                        >
                            {loading ? <Spinner size="sm" /> : "Tasdiqlash"}
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </Box>
    );
}

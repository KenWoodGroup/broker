import { Button, useDisclosure, useToast } from "@chakra-ui/react";
import { Trash2 } from "lucide-react";
import { useState } from "react";
import { apiLocationUsers } from "../../../utils/Controllers/apiLocationUsers";
import ConfirmDelModal from "../../../components/common/ConfirmDelModal";

export default function DeleteLotCreator({
    id,
    refresh,
    itemName,
    typeItem = "lot yaratuvchi",
}) {
    const { isOpen, onOpen, onClose } = useDisclosure();
    const toast = useToast();
    const [loading, setLoading] = useState(false);

    const handleDelete = async () => {
        try {
            setLoading(true);
            await apiLocationUsers.Delete(id);
            toast({
                title: "O‘chirildi!",
                description: "Lot yaratuvchi o‘chirildi.",
                status: "success",
                duration: 3000,
                isClosable: true,
            });
            onClose();
            refresh?.();
        } catch (error) {
            toast({
                title: "Xatolik!",
                description: "O‘chirishda xatolik yuz berdi.",
                status: "error",
                duration: 3000,
                isClosable: true,
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Button size="sm" colorScheme="red" variant="ghost" onClick={onOpen}>
                <Trash2 size={18} />
            </Button>

            <ConfirmDelModal
                isOpen={isOpen}
                onClose={onClose}
                onConfirm={handleDelete}
                itemName={itemName ?? "—"}
                loading={loading}
                typeItem={typeItem}
            />
        </>
    );
}

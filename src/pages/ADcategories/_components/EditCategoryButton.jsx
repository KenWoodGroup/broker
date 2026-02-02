import {
    IconButton,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    ModalCloseButton,
    Input,
    Button,
    useDisclosure,
} from "@chakra-ui/react";
import { Pencil } from "lucide-react";
import { useEffect, useState } from "react";
import { apiCategories } from "../../../utils/Controllers/Categories";

const EditCategoryButton = ({
    categoryId,
    initialData,
    onReload,
}) => {
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [categoryName, setCategoryName] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen && initialData) {
            setCategoryName(initialData.name || "");
        }
    }, [isOpen, initialData]);

    const handleEdit = async () => {
        if (!categoryName.trim()) return;

        setLoading(true);

        try {
            const res = await apiCategories.Update({name:categoryName}, categoryId);
            onClose();

            if (onReload) {
                onReload();
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <IconButton
                size="sm"
                variant="ghost"
                icon={<Pencil size={16} />}
                onClick={onOpen}
                aria-label="Edit"
            />

            <Modal isOpen={isOpen} onClose={onClose} isCentered>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>Edit Category</ModalHeader>
                    <ModalCloseButton />

                    <ModalBody>
                        <Input
                            placeholder="Category name"
                            value={categoryName}
                            onChange={(e) => setCategoryName(e.target.value)}
                        />
                    </ModalBody>

                    <ModalFooter>
                        <Button
                            _hover={{ bg: "secondary" }}
                            variant="solidPrimary"
                            onClick={handleEdit}
                            isLoading={loading}
                        >
                            Save
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </>
    );
};

export default EditCategoryButton;

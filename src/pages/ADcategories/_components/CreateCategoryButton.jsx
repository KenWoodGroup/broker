import {
    Button,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    ModalCloseButton,
    Input,
    useDisclosure,
} from "@chakra-ui/react";
import { Plus } from "lucide-react";
import { useState } from "react";
import { apiCategories } from "../../../utils/Controllers/Categories";

const CreateCategoryButton = ({ onReload }) => {
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [categoryName, setCategoryName] = useState("");
    const [loading, setLoading] = useState(false);

    const handleCreate = async () => {
        if (!categoryName.trim()) return;

        setLoading(true);

        try {
            const res = await apiCategories.Add({ name: categoryName });

            // success deb hisoblaymiz
            onClose();
            setCategoryName("");

            if (onReload) {
                onReload(); // sahifani reload qilish
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Button
                variant="solidPrimary"
                display="flex"
                alignItems="center"
                gap="3px"
                onClick={onOpen}
            >
                <Plus size="22px" />
                Category
            </Button>

            <Modal isOpen={isOpen} onClose={onClose} isCentered>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>Create Category</ModalHeader>
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
                            onClick={handleCreate}
                            isLoading={loading}
                        >
                            Create
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </>
    );
};

export default CreateCategoryButton;

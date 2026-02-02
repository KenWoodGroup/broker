import { Flex, Heading, IconButton, Tooltip } from "@chakra-ui/react";
import CreateCategoryButton from "./CreateCategoryButton";
import { useNavigate } from "react-router";
import { LayoutGrid } from "lucide-react";

export default function CategoriesHeader({onReload}) {
    const navigate = useNavigate()
    const handleCradVersion = () => {
        navigate('/factories')
    }
    return (
        <Flex justifyContent={"space-between"} py="20px">
            <Heading size={"lg"}>Factories</Heading>
            <Flex gap={"24px"}>
                <CreateCategoryButton onReload={onReload}/>
                <Tooltip label={"Table"} placement="bottom">
                    <IconButton
                        onClick={() => handleCradVersion()}
                        bg="brand.400"
                        _hover={{ bg: "" }}
                        color={"neutral.50"}
                        icon={<LayoutGrid />}
                    />
                </Tooltip>

            </Flex>
        </Flex>
    )
}
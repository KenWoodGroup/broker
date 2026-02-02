import { Button, Flex, Heading, IconButton, Tooltip } from "@chakra-ui/react";
import { LayoutGrid, Plus } from "lucide-react";
import { useNavigate } from "react-router";
import CreateFactoryButton from "./CreateFactoryButton";

export default function FactoriesHeader({onReload}) {
    const navigate = useNavigate()
    // local functions
    const handleCradVersion = () => {
        navigate('/factories/categories')
    }
    return (
        <Flex justifyContent={"space-between"} py="20px">
            <Heading size={"lg"}>Factories</Heading>
            <Flex gap={"24px"}>
                <CreateFactoryButton onReload={onReload}/>
                <Tooltip label={"Category"} placement="bottom">
                    <IconButton
                        onClick={() => handleCradVersion()}
                        bg={"neutral.300"}
                        _hover={{ bg: "" }} color={"brand.800"}
                        icon={<LayoutGrid />}
                    />
                </Tooltip>

            </Flex>
        </Flex>
    )
}
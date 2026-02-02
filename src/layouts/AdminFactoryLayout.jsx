import { Outlet, useNavigate, useParams } from "react-router-dom";
import { Box } from "@chakra-ui/react";
import FactoryHeader from "../components/common/FactoryHeader/FactoryHeader";


export default function AdminFactoryLayout() {
    const navigate = useNavigate();
    const { factoryId } = useParams();


    return (
        <Box pr="20px" pt="20px">
            <FactoryHeader
                factoryId={factoryId}
                onBack={() => navigate("/factories")}
            />


            {/* Sub pages will be here later */}
            <Box mt="20px">
                <Outlet />
            </Box>
        </Box>
    );
}
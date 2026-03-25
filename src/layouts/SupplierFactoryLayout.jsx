import { Outlet, useNavigate, useParams } from "react-router-dom";
import { Box } from "@chakra-ui/react";
import FactoryHeader from "../components/common/FactoryHeader/FactoryHeader";


export default function SupplierFactoryLayout() {
    const navigate = useNavigate();
    const { factoryId } = useParams();


    return (
        <Box pr="20px" pt="20px">
            <FactoryHeader
                role={'supplier'}
                factoryId={factoryId}
                onBack={() => navigate(-1)}
            />
            <Box mt="20px">
                <Outlet />
            </Box>
        </Box>
    );
}
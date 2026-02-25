import { HStack, Button } from "@chakra-ui/react";
import { NavLink, useLocation, useMatch, useParams } from "react-router-dom";

const navItems = [
    { label: "Categories", to: "/categories", end:true },
    { label: "Warehouses", to: "/warehouses", end:false},
    { label: "Options", to: "/options", end:true },
    { label: "Clients", to: "/clients", end:true },
    { label: "Users", to: "/users", end:true },
];

export default function FactoryNav() {
    const { factoryId } = useParams();
    const productsRootMatch = useMatch(`/factories/${factoryId}`);
    const productsMatch = useMatch(`/factories/${factoryId}/products`);
    const { pathname } = useLocation()

    const isOthersEqual = () => {
        for (let key in navItems) {
            const res = pathname.includes(navItems[key].to);
            if(res) {
                return true
            };
        }
        return false
    }



    const isProductsActive = !!productsRootMatch || !!productsMatch || !isOthersEqual();

    return (
        <HStack spacing="8px" mt="12px">
            <Button
                as={NavLink}
                to={`/factories/${factoryId}`}
                variant="ghost"
                size="sm"
                fontWeight="600"
                sx={isProductsActive ? {
                    color: "primary",
                    borderBottom: "2px solid",
                    borderColor: "primary",
                    borderRadius: "0",
                } : {}}

            >
                Products
            </Button>
            {navItems.map((item) => (
                <Button
                    key={item.label}
                    as={NavLink}
                    to={`/factories/${factoryId}${item.to}`}
                    end={item.end}
                    variant="ghost"
                    size="sm"
                    fontWeight="600"
                    _activeLink={{
                        color: "primary",
                        borderBottom: "2px solid",
                        borderColor: "primary",
                        borderRadius: "0",
                    }}
                >
                    {item.label}
                </Button>
            ))}
        </HStack>
    );
}

import { HStack, Button } from "@chakra-ui/react";
import { NavLink, useParams } from "react-router-dom";

const navItems = [
    { label: "Products", to: "" },
    { label: "Warehouses", to: "/warehouses" },
    { label: "Options", to: "/options" },
    { label: "Clients", to: "/clients" },
];

export default function FactoryNav() {
    const { factoryId } = useParams();

    return (
        <HStack spacing="8px" mt="12px">
            {navItems.map((item) => (
                <Button
                    key={item.label}
                    as={NavLink}
                    to={`/factories/${factoryId}${item.to}`}
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

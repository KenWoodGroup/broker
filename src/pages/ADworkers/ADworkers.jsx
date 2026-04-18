import {
    Box,
    Text,
    SimpleGrid,
    VStack,
    Icon,
    useColorModeValue,
} from "@chakra-ui/react";
import { color } from "framer-motion";
import {
    Scale,
    Wallet,
    Truck,
    ShoppingCart,
    Package,
    Users,
    Headset,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

// ROLE CONFIG 
const roles = [
    {
        id: "brokers",
        name: "Broker",
        icon: Users,
        color: "pink",
        description: "To'liq savdo huquqi (full access)",
    },
    // {
    //     id: "finance",
    //     name: "Moliyachi",
    //     icon: Wallet,
    //     color: "green",
    //     description: "To'lovlar va moliyaviy nazorat",
    // },
    // {
    //     id: "lawyer",
    //     name: "Yurist",
    //     icon: Scale,
    //     color: "purple",
    //     description: "Shartnomalar va huquqiy nazorat",
    // },
    {
        id:'call-operators',
        name:'Call-operator',
        icon:Headset,
        color:'blue',
        description:"Mijozlarga bog'lanish"
    },
    {
        id: "suppliers",
        name: "Ta'minotchi",
        icon: Package,
        color: "orange",
        description: "Xom ashyo va yetkazib berish",
    },
    {
        id: "lot_creator",
        name: "Lot creator",
        icon: ShoppingCart,
        color: "teal",
        description: "Lot yaratish va boshqarish",
    },
    // {
    //     id: "sales",
    //     name: "Sotuvchi",
    //     icon: ShoppingCart,
    //     color: "blue",
    //     description: "Savdo va mijozlar bilan ishlash",
    // },
    // {
    //     id: "logistics",
    //     name: "Logist",
    //     icon: Truck,
    //     color: "cyan",
    //     description: "Yetkazib berish va transport",
    // },
];

export default function RolesPage() {
    const navigate = useNavigate();
    return (
        <Box  pr="20px" pb="20px" pt="20px">
            {/* HEADER */}
            <Box mb="20px">
                <Text fontSize="2xl" fontWeight="700">
                    Tizim Rollari
                </Text>
                <Text fontSize="sm" color="textSub">
                    Har bir rol bo‘yicha foydalanuvchilarni boshqarish
                </Text>
            </Box>

            {/* GRID */}
            <SimpleGrid columns={{ base: 1, sm: 2, md: 3 }} spacing="20px">
                {roles.map((role) => (
                    <Box
                        key={role.id}
                        bg={'surface'}
                        border="1px solid"
                        borderColor={"border"}
                        borderRadius="16px"
                        p="16px"
                        cursor="pointer"
                        transition="all .2s"
                        _hover={{
                            transform: "translateY(-4px)",
                            shadow: "lg",
                            borderColor: `${role.color}.400`,
                        }}
                        onClick={() => navigate(`/roles/${role.id}`)}
                    >
                        <VStack align="start" spacing="12px">
                            <Box
                                p="10px"
                                borderRadius="12px"
                                bg={`${role.color}.100`}
                            >
                                <Icon as={role.icon} boxSize={5} color={`${role.color}.500`} />
                            </Box>

                            {/* TITLE */}
                            <Text fontSize="lg" fontWeight="600">
                                {role.name}
                            </Text>

                            {/* DESC */}
                            <Text fontSize="sm" color="textSub">
                                {role.description}
                            </Text>
                        </VStack>
                    </Box>
                ))}
            </SimpleGrid>
        </Box>
    );
}
import { HStack, Text, VStack, useColorModeValue } from "@chakra-ui/react";
import { Banknote, CalendarRange, MapPin, Phone, User } from "lucide-react";

/**
 * ADfactories FactoryCard bilan bir xil: kichik ikonka + qiymat (so‘zli yorliqsiz).
 */
export default function EntityCardDetailRows({
    address = "-",
    phone = "-",
    directorName = "-",
    onAddressClick,
    addressInteractive = false,
}) {
    const textSub = useColorModeValue("gray.600", "gray.400");

    return (
        <VStack align="start" spacing="10px" w="100%">
            <HStack spacing="8px" color={textSub} align="start" w="100%">
                <MapPin size={16} style={{ flexShrink: 0, marginTop: 2 }} />
                <Text
                    flex={1}
                    minW={0}
                    fontSize="sm"
                    noOfLines={2}
                    onClick={
                        onAddressClick
                            ? (e) => {
                                  e.stopPropagation();
                                  onAddressClick(e);
                              }
                            : undefined
                    }
                    _hover={{
                        color: addressInteractive ? "blue.500" : textSub,
                        cursor: addressInteractive ? "pointer" : "default",
                    }}
                >
                    {address || "-"}
                </Text>
            </HStack>
            <HStack spacing="8px" color={textSub}>
                <Phone size={16} style={{ flexShrink: 0 }} />
                <Text fontSize="sm" noOfLines={1}>
                    {phone || "-"}
                </Text>
            </HStack>
            <HStack spacing="8px" color={textSub} align="start" w="100%">
                <User size={16} style={{ flexShrink: 0, marginTop: 2 }} />
                <Text flex={1} minW={0} fontSize="sm" noOfLines={2}>
                    {directorName || "-"}
                </Text>
            </HStack>
        </VStack>
    );
}

export function LotCardIconRows({ amount, address, periodLabel }) {
    const textSub = useColorModeValue("gray.600", "gray.400");

    return (
        <VStack align="start" spacing="10px" w="100%">
            <HStack spacing="8px" color={textSub} align="start" w="100%">
                <Banknote size={16} style={{ flexShrink: 0, marginTop: 2 }} />
                <Text flex={1} minW={0} fontSize="sm" noOfLines={2}>
                    {amount}
                </Text>
            </HStack>
            <HStack spacing="8px" color={textSub} align="start" w="100%">
                <MapPin size={16} style={{ flexShrink: 0, marginTop: 2 }} />
                <Text flex={1} minW={0} fontSize="sm" noOfLines={2}>
                    {address}
                </Text>
            </HStack>
            <HStack spacing="8px" color={textSub} align="start" w="100%">
                <CalendarRange size={16} style={{ flexShrink: 0, marginTop: 2 }} />
                <Text flex={1} minW={0} fontSize="sm" noOfLines={2}>
                    {periodLabel}
                </Text>
            </HStack>
        </VStack>
    );
}

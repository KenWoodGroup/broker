
import {
  Box,
  Flex,
  HStack,
  IconButton,
  Text,
  Collapse,
  Tooltip,
  useColorModeValue,
} from "@chakra-ui/react";
import {
  ArrowLeft,
  ChevronsUp,
  ChevronsDown,
  MapPin,
  Phone,
  Wallet,
  Clock,
} from "lucide-react";
import { useEffect, useState } from "react";
import FactoryNav from "./_components/FactoryNav";
import BarLoader from "../../ui/BarLoader";
import { apiLocations } from "../../../utils/Controllers/Locations";

// ===============================
// API REQUEST (WRITE YOURSELF)
// GET api/locations/:factoryId
// ===============================

const STORAGE_PREFIX = "factory_header";

export default function FactoryHeader({ factoryId, onBack }) {
  const border = useColorModeValue("border", "border");
  const textSub = useColorModeValue("neutral.500", "neutral.400");
  const [loading, setLoading] = useState(false);

  const storageKey = `${STORAGE_PREFIX}:${factoryId}`;

  const [collapsed, setCollapsed] = useState(() => {
    return localStorage.getItem(storageKey) === "true";
  });

  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    localStorage.setItem(storageKey, collapsed);
  }, [collapsed, storageKey]);

  const [factory, setFactory] = useState({})
  const fetchFactory = async () => {
    setLoading(true)
    try {
      const res = await apiLocations.getLocation(factoryId);
      setFactory(res.data)
    } finally {
      setLoading(false)
    }
  };
  useEffect(() => {
    fetchFactory()
  }, [factoryId]);


  return (
    <Box
      h={loading ? "145px" : "auto"}
      position="sticky"
      top="12px"
      zIndex={10}
      bg="surfBlur"
      backdropFilter={"blur(5px)"}
      border="1px solid"
      borderColor={border}
      borderRadius="12px"
      p="12px"
      transition="all .2s"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {loading ? <Box mt={"44px"}><BarLoader/></Box> :
        <Box>
          {/* Top row: back + factory name */}
          <Flex align="center" justify="space-between">
            <HStack spacing="12px">
              <IconButton
                variant="ghost"
                aria-label="Back to factories"
                icon={<ArrowLeft size={18} />}
                onClick={onBack}
              />

              <Text fontSize="xl" fontWeight="700" noOfLines={1}>
                {factory.name}
              </Text>
            </HStack>

            {/* Smart collapse toggle (hover only) */}
            <IconButton
              size="sm"
              variant="ghost"
              aria-label="Toggle factory header"
              icon={collapsed ? <ChevronsDown /> : <ChevronsUp />}
              opacity={hovered ? 1 : 0}
              pointerEvents={hovered ? "auto" : "none"}
              transition="all .15s"
              onClick={() => setCollapsed((prev) => !prev)}
            />
          </Flex>

          {/* Collapsible: main meta + time meta together */}
          <Collapse in={!collapsed} animateOpacity>
            {/* Main meta */}
            <Flex
              mt="12px"
              wrap="wrap"
              gap="20px"
              color={textSub}
            >
              <HStack spacing="8px">
                <MapPin size={16} />
                <Text fontSize="sm" noOfLines={1}>
                  {factory.address || "-"}
                </Text>
              </HStack>

              <HStack spacing="8px">
                <Phone size={16} />
                <Text fontSize="sm">
                  {factory.phone || "-"}
                </Text>
              </HStack>

              <HStack spacing="8px">
                <Wallet size={16} />
                <Text fontSize="sm">
                  Balance: {factory.balance}
                </Text>
              </HStack>
            </Flex>

            {/* Time meta (hidden when collapsed) */}
            <HStack mt="8px" spacing="16px" color={textSub}>
              <Tooltip label="Created at">
                <HStack spacing="6px">
                  <Clock size={14} />
                  <Text fontSize="xs">
                    {new Date(factory.createdAt).toLocaleDateString()}
                  </Text>
                </HStack>
              </Tooltip>

              <Tooltip label="Last updated">
                <HStack spacing="6px">
                  <Clock size={14} />
                  <Text fontSize="xs">
                    {new Date(factory.updatedAt).toLocaleDateString()}
                  </Text>
                </HStack>
              </Tooltip>
            </HStack>
          </Collapse>
          {/* Factory navigation */}
          <FactoryNav />
        </Box>}
    </Box>
  );
}


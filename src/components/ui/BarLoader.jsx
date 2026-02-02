import { Box, HStack, keyframes, useToken } from "@chakra-ui/react";

const bar1 = keyframes`
  0%, 100% { transform: scaleY(0.35); opacity: 0.5; }
  30% { transform: scaleY(1); opacity: 1; }
`;

const bar2 = keyframes`
  0%, 100% { transform: scaleY(0.35); opacity: 0.5; }
  45% { transform: scaleY(1.25); opacity: 1; }
`;

const bar3 = keyframes`
  0%, 100% { transform: scaleY(0.35); opacity: 0.5; }
  60% { transform: scaleY(1); opacity: 1; }
`;

export default function BarLoader() {
  const [primary, secondary] = useToken("colors", [
    "primary",
    "secondary",
  ]);

  return (
    <HStack
      justify="center"
      align="center"
      spacing="8px"
    >
      <Box
        w="6px"
        h="28px"
        borderRadius="4px"
        bgGradient={`linear(to-b, ${secondary}, ${primary})`}
        animation={`${bar1} 700ms infinite ease-in-out`}
        boxShadow={`0 0 8px ${primary}`}
      />
      <Box
        w="6px"
        h="28px"
        borderRadius="4px"
        bgGradient={`linear(to-b, ${secondary}, ${primary})`}
        animation={`${bar2} 700ms infinite ease-in-out`}
        boxShadow={`0 0 10px ${primary}`}
      />
      <Box
        w="6px"
        h="28px"
        borderRadius="4px"
        bgGradient={`linear(to-b, ${secondary}, ${primary})`}
        animation={`${bar3} 700ms infinite ease-in-out`}
        boxShadow={`0 0 8px ${primary}`}
      />
    </HStack>
  );
}

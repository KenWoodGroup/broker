import { Button, HStack, Text } from "@chakra-ui/react";
import { ChevronLeft, ChevronRight } from "lucide-react";

/**
 * Ro‘yxat pastki qismi — ADtasks bilan bir xil:
 * chapda "Sahifa n / m", o‘ngda Chevron bilan Oldingi / Keyingi.
 */
export default function PaginationBar({
    page = 1,
    totalPages = 1,
    loading = false,
    onPageChange,
    mt = 4,
}) {
    const tp = Math.max(1, Number(totalPages) || 1);
    const p = Math.max(1, Number(page) || 1);
    const canPrev = p > 1;
    const canNext = p < tp;

    return (
        <HStack justify="space-between" mt={mt} flexWrap="wrap" gap={2}>
            <Text fontSize="sm" color="gray.600">
                Sahifa {p} / {tp}
            </Text>
            <HStack>
                <Button
                    size="sm"
                    leftIcon={<ChevronLeft size={16} />}
                    isDisabled={!canPrev || loading}
                    onClick={() => onPageChange(Math.max(1, p - 1))}
                >
                    Oldingi
                </Button>
                <Button
                    size="sm"
                    rightIcon={<ChevronRight size={16} />}
                    isDisabled={!canNext || loading}
                    onClick={() => onPageChange(Math.min(tp, p + 1))}
                >
                    Keyingi
                </Button>
            </HStack>
        </HStack>
    );
}

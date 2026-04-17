import { Box, Switch, Spinner, HStack } from "@chakra-ui/react"
import { Phone, PhoneOff } from "lucide-react"
import { apiLocations } from "../../../utils/Controllers/Locations"
import { useState, useEffect } from "react"

export default function ContactPhone({ data }) {
    const [isContacted, setIsContacted] = useState(!!data.is_contacted)
    const [loading, setLoading] = useState(false)

    // Update local state if the prop changes
    useEffect(() => {
        setIsContacted(!!data.is_contacted)
    }, [data.is_contacted])

    const toggleStatus = async () => {
        const nextState = !isContacted
        
        // Optimistic UI update
        setIsContacted(nextState)
        
        try {
            setLoading(true)
            await apiLocations.PhoneStatusEdit(data.id, { is_contacted: nextState })
            // Success - no refresh needed as requested
        } catch (error) {
            console.error("Error updating phone status:", error)
            // Rollback on error
            setIsContacted(!nextState)
        } finally {
            setLoading(false)
        }
    }

    return (
        <HStack onClick={(e) => e.stopPropagation()} spacing={2} align="center">
            <PhoneOff 
                size={16} 
                color={!isContacted ? "#E53E3E" : "#CBD5E0"} 
                style={{ transition: "color 0.2s" }}
            />
            <Box position="relative" display="flex" alignItems="center">
                <Switch
                    colorScheme="green"
                    size="md"
                    isChecked={isContacted}
                    onChange={toggleStatus}
                    isDisabled={loading}
                />
                {loading && (
                    <Spinner 
                        size="xs" 
                        color="green.500" 
                        position="absolute" 
                        right="-18px"
                    />
                )}
            </Box>
            <Phone 
                size={16} 
                color={isContacted ? "#38A169" : "#CBD5E0"} 
                style={{ transition: "color 0.2s" }}
            />
        </HStack>
    )
}
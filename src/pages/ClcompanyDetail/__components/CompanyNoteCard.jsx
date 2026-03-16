import { useState, useEffect, useCallback } from "react"
import {
    Box,
    Card,
    CardBody,
    CardHeader,
    Heading,
    Text,
    Flex,
    Textarea,
    VStack,
    HStack,
    useColorModeValue,
    Icon,
    Button,
    Spinner,
    Center,
    Divider
} from "@chakra-ui/react"

import { FileText, Send, ChevronDown } from "lucide-react"
import { apiLocationsNote } from "../../../utils/Controllers/apiLocationNotes"

export default function CompanyNoteCard({ locationId }) {

    const [comments, setComments] = useState([])
    const [newComment, setNewComment] = useState("")
    const [isLoading, setIsLoading] = useState(true)
    const [isPosting, setIsPosting] = useState(false)
    const [isLoadingMore, setIsLoadingMore] = useState(false)
    const [page, setPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)

    const bg = useColorModeValue("white", "gray.800")
    const headerBg = useColorModeValue("gray.50", "gray.700")

    const fetchComments = useCallback(async (pageNum = 1, append = false) => {

        if (pageNum === 1) setIsLoading(true)
        else setIsLoadingMore(true)

        try {

            const response = await apiLocationsNote.Get({
                location_id: locationId,
                page: pageNum
            })

            const responseData = response.data

            const newRecords = responseData?.data || []
            const currentTotalPages = responseData?.totalPages || 1

            if (append) {
                setComments(prev => [...prev, ...newRecords])
            } else {
                setComments(newRecords)
            }

            setTotalPages(currentTotalPages)
            setPage(pageNum)

        } catch (error) {
            console.error("Error fetching comments:", error)
        } finally {
            setIsLoading(false)
            setIsLoadingMore(false)
        }

    }, [locationId])

    useEffect(() => {
        if (locationId) {
            fetchComments(1, false)
        }
    }, [locationId, fetchComments])

    const handleLoadMore = () => {
        if (page < totalPages) {
            fetchComments(page + 1, true)
        }
    }

    const handlePostComment = async () => {

        if (!newComment.trim()) return

        setIsPosting(true)

        try {

            await apiLocationsNote.Post({
                location_id: locationId,
                note: newComment
            })

            setNewComment("")

            await fetchComments(1, false)

        } catch (error) {
            console.error("Error posting comment:", error)
        } finally {
            setIsPosting(false)
        }

    }

    const formatDate = (dateString) => {
        if (!dateString) return "—"

        return new Date(dateString).toLocaleString("uz-UZ", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        })
    }

    return (
        <Card
            bg={bg}
            borderRadius="2xl"
            boxShadow="xl"
            overflow="hidden"
            h="100%"
        >

            <CardHeader bg={headerBg} py={4}>
                <Flex justify="space-between" align="center">

                    <HStack spacing={2}>
                        <Icon as={FileText} color="blue.500" boxSize={5} />
                        <Heading size="md">Izohlar</Heading>
                    </HStack>

                </Flex>
            </CardHeader>

            <CardBody
                display="flex"
                flexDirection="column"
                h="600px"
            >

                <VStack
                    spacing={4}
                    align="stretch"
                    flex="1"
                    overflow="hidden"
                >

                    {/* COMMENTS LIST */}

                    <Box
                        flex="1"
                        overflowY="auto"
                        pr={2}
                        id="comments-container"
                    >

                        {isLoading ? (

                            <Center py={10}>
                                <Spinner color="blue.500" />
                            </Center>

                        ) : comments.length > 0 ? (

                            <VStack spacing={4} align="stretch">

                                {comments.map((comment, index) => (

                                    <Box
                                        key={comment.id || index}
                                        p={3}
                                        bg={useColorModeValue("gray.50", "gray.700")}
                                        borderRadius="lg"
                                        borderWidth="1px"
                                        borderColor={useColorModeValue("gray.100", "gray.600")}
                                    >

                                        <VStack align="start" spacing={1}>

                                            {/* DATE */}

                                            <Text
                                                fontSize="xs"
                                                color={useColorModeValue("gray.500", "gray.400")}
                                            >
                                                {formatDate(comment.createdAt)}
                                            </Text>

                                            {/* COMMENT TEXT */}

                                            <Text
                                                whiteSpace="pre-wrap"
                                                fontSize="sm"
                                                color={useColorModeValue("gray.700", "gray.200")}
                                            >
                                                {comment.note}
                                            </Text>

                                        </VStack>

                                    </Box>

                                ))}

                                {page < totalPages && (

                                    <Center py={2}>

                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            colorScheme="blue"
                                            leftIcon={<ChevronDown size={16} />}
                                            onClick={handleLoadMore}
                                            isLoading={isLoadingMore}
                                        >
                                            Yana yuklash
                                        </Button>

                                    </Center>

                                )}

                            </VStack>

                        ) : (

                            <Center py={10}>

                                <VStack spacing={2}>

                                    <Icon as={FileText} boxSize={8} color="gray.300" />

                                    <Text
                                        color="gray.400"
                                        fontStyle="italic"
                                    >
                                        Hali izohlar yo'q...
                                    </Text>

                                </VStack>

                            </Center>

                        )}

                    </Box>

                    <Divider />

                    {/* NEW COMMENT */}

                    <Box pb={2}>

                        <Textarea
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            placeholder="Yangi izoh yozing..."
                            size="md"
                            borderRadius="lg"
                            rows={3}
                            mb={2}
                            bg={useColorModeValue("white", "gray.900")}
                            _focus={{
                                borderColor: "blue.400",
                                boxShadow: "0 0 0 1px blue.400"
                            }}
                        />

                        <Flex justify="flex-end">

                            <Button
                                colorScheme="blue"
                                size="md"
                                rightIcon={<Send size={18} />}
                                onClick={handlePostComment}
                                isLoading={isPosting}
                                isDisabled={!newComment.trim()}
                                borderRadius="xl"
                                px={6}
                            >
                                Yuborish
                            </Button>

                        </Flex>

                    </Box>

                </VStack>

            </CardBody>

        </Card>
    )
}
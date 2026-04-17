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
    Divider,
    Badge
} from "@chakra-ui/react"

import { FileText, Send, ChevronDown } from "lucide-react"
import { apiLocationsNote } from "../../utils/Controllers/apiLocationNotes"
import { useParams } from "react-router"

export default function FactoryInfo() {

    const [comments, setComments] = useState([])
    const { factoryId } = useParams();

    const [totalComments, setTotalComments] = useState(0)
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
                location_id: factoryId,
                page: pageNum
            })

            const responseData = response.data

            const newRecords = responseData?.data || []
            const currentTotalPages = responseData?.totalPages || 1
            setTotalComments(responseData?.total)

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

    }, [factoryId])

    useEffect(() => {
        if (factoryId) {
            fetchComments(1, false)
        }
    }, [factoryId, fetchComments])

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
                location_id: factoryId,
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
            display="flex"
            flexDirection="column"
            h="600px"
        >

            <CardHeader bg={headerBg} py={4} flexShrink={0}>
                <Flex justify="space-between" align="center">

                    <HStack spacing={2}>
                        <Icon as={FileText} color="blue.500" boxSize={5} />
                        <Heading size="md">Izohlar</Heading>
                        <Badge colorScheme="blue" borderRadius="full" px={3} py={1}>
                            {totalComments}
                        </Badge>
                    </HStack>

                </Flex>
            </CardHeader>

            <CardBody
                display="flex"
                flexDirection="column"
                flex="1"
                overflow="hidden"
                p={4}
            >

                <VStack
                    spacing={4}
                    align="stretch"
                    flex="1"
                    h="100%"
                    overflow="hidden"
                >

                    {/* COMMENTS LIST - SCROLLABLE AREA */}
                    <Box
                        flex="1"
                        overflowY="auto"
                        pr={2}
                        minH={0}
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

                                            <Text
                                                fontSize="xs"
                                                color={useColorModeValue("gray.500", "gray.400")}
                                            >
                                                {formatDate(comment.createdAt)}
                                            </Text>

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

                    {/* FIXED DIVIDER AND TEXTAREA SECTION */}
                    <Box flexShrink={0}>
                        <Divider mb={4} />
                        <Textarea
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            placeholder="Yangi izoh yozing..."
                            size="md"
                            borderRadius="lg"
                            rows={3}
                            mb={2}
                            bg={useColorModeValue("white", "gray.900")}
                            resize="vertical"
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
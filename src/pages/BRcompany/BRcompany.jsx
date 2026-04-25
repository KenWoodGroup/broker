import { useEffect, useState } from "react";
import { apiLocations } from "../../utils/Controllers/Locations";
import {
  Box,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Heading,
  Flex,
  Spinner,
  Text,
  Badge,
  Button,
  useColorMode,
  Card,
  CardBody,
  Container,
  Center,
  Alert,
  AlertIcon,
} from "@chakra-ui/react";
import { PhoneIcon, TimeIcon } from "@chakra-ui/icons";
import { MapPinIcon } from "lucide-react";
import CreateCompany from "./_components/CreateCompany";
import PaginationBar from "../../components/common/PaginationBar";

export default function BRcompany() {
  const [page, setPage] = useState(1);
  const [companies, setCompanies] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { colorMode } = useColorMode();

  const tableBg = colorMode === "light" ? "white" : "gray.800";
  const borderColor = colorMode === "light" ? "gray.200" : "gray.700";
  const textColor = colorMode === "light" ? "gray.800" : "white";

  const GetAllCompany = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiLocations.GetBySearchForOperator(page, "all");

      if (response.status === 200) {
        // Конвертируем lat/lng в числа, чтобы безопасно использовать toFixed
        const records = response.data.data?.records.map((c) => ({
          ...c,
          lat: c.lat !== null ? parseFloat(c.lat) : null,
          lng: c.lng !== null ? parseFloat(c.lng) : null,
        }));
        setCompanies(records);
        setPagination(response.data.data?.pagination);
      } else {
        throw new Error(`Ошибка: ${response.status}`);
      }
    } catch (err) {
      setError("Не удалось загрузить данные. Пожалуйста, попробуйте позже.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    GetAllCompany();
  }, [page]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("ru-RU", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading && companies.length === 0) {
    return (
      <Center minH="100vh">
        <Spinner size="xl" color="blue.500" thickness="4px" />
      </Center>
    );
  }

  return (
    <Box minH="100vh" pt={2}>
      <Container maxW="container.xl">
        {/* Header */}
        <Flex justify="space-between" align="center" mb={6}>
          <Box>
            <Heading color={textColor} mb={2}>
              Компании
            </Heading>
            <Text color="gray.500">
              Всего компаний: {pagination?.total_count || 0}
            </Text>
          </Box>
          <CreateCompany />
        </Flex>

        {/* Error Alert */}
        {error && (
          <Alert status="error" mb={6} borderRadius="lg">
            <AlertIcon />
            {error}
          </Alert>
        )}

        {/* Table */}
        <Card
          bg={tableBg}
          border="1px"
          borderColor={borderColor}
          overflow="hidden"
          mb={6}
        >
          <CardBody p={0}>
            <TableContainer maxH="600px" overflowY="auto">
              <Table variant="simple" size="md">
                <Thead position="sticky" top={0} zIndex={1} bg={tableBg}>
                  <Tr>
                    <Th color="gray.500" borderColor={borderColor}>
                      Название
                    </Th>
                    <Th color="gray.500" borderColor={borderColor}>
                      Адрес
                    </Th>
                    <Th color="gray.500" borderColor={borderColor}>
                      Телефон
                    </Th>
                    <Th color="gray.500" borderColor={borderColor}>
                      Баланс
                    </Th>
                    <Th color="gray.500" borderColor={borderColor}>
                      Создана
                    </Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {companies?.map((company) => (
                    <Tr
                      key={company.id}
                      _hover={{
                        bg: colorMode === "light" ? "gray.50" : "gray.700",
                      }}
                      transition="background 0.2s"
                    >
                      <Td borderColor={borderColor}>
                        <Text fontWeight="medium" color={textColor}>
                          {company.name}
                        </Text>
                        <Badge
                          colorScheme="blue"
                          variant="subtle"
                          fontSize="xs"
                          mt={1}
                        >
                          {company.type}
                        </Badge>
                      </Td>

                      <Td borderColor={borderColor}>
                        <Flex align="center">
                          <MapPinIcon mr={2} color="gray.400" />
                          <Box>
                            <Text color={textColor} fontSize="sm">
                              {company.address}
                            </Text>
                            <Text fontSize="xs" color="gray.500">
                              {typeof company.lat === "number" &&
                              typeof company.lng === "number"
                                ? `${company.lat.toFixed(6)}, ${company.lng.toFixed(6)}`
                                : "—"}
                            </Text>
                          </Box>
                        </Flex>
                      </Td>

                      <Td borderColor={borderColor}>
                        <Flex align="center">
                          <PhoneIcon mr={2} color="gray.400" />
                          <Text color={textColor}>{company.phone}</Text>
                        </Flex>
                      </Td>

                      <Td borderColor={borderColor}>
                        <Badge
                          colorScheme={
                            company.balance === "0" ? "green" : "red"
                          }
                          fontSize="sm"
                          px={3}
                          py={1}
                          borderRadius="full"
                        >
                          {parseFloat(company.balance).toLocaleString("ru-RU")}{" "}
                          сум
                        </Badge>
                      </Td>

                      <Td borderColor={borderColor}>
                        <Flex align="center">
                          <TimeIcon mr={2} color="gray.400" />
                          <Box>
                            <Text color={textColor} fontSize="sm">
                              {formatDate(company.createdAt)}
                            </Text>
                            <Text fontSize="xs" color="gray.500">
                              обновлено: {formatDate(company.updatedAt)}
                            </Text>
                          </Box>
                        </Flex>
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </TableContainer>

            {companies.length === 0 && !loading && (
              <Center p={10}>
                <Text color="gray.500">Нет данных для отображения</Text>
              </Center>
            )}

            {loading && companies.length > 0 && (
              <Center p={4}>
                <Spinner />
              </Center>
            )}
          </CardBody>
        </Card>

        {pagination && (
          <PaginationBar
            mt={4}
            page={page}
            totalPages={pagination.total_pages ?? 1}
            loading={loading}
            onPageChange={(p) => setPage(p)}
          />
        )}
      </Container>
    </Box>
  );
}

import PropTypes from "prop-types";
import {
  Box,
  Flex,
  HStack,
  SimpleGrid,
  Spinner,
  Text,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { apiStatistics } from "../../utils/Controllers/apiStatistics";

// ── Donut Chart (pure SVG) ────────────────────────────────────────────────────
function DonutChart({ segments }) {
  const r = 54,
    cx = 64,
    cy = 64,
    strokeW = 5;
  const circ = 2 * Math.PI * r;
  const total = segments.reduce((s, x) => s + x.value, 0) || 1;
  let offset = 0;
  return (
    <svg viewBox="0 0 128 128" width={300} height={300}>
      <circle
        cx={cx}
        cy={cy}
        r={r}
        fill="none"
        stroke="#e5e7eb"
        strokeWidth={strokeW}
      />
      {segments.map((seg, i) => {
        const dash = (seg.value / total) * circ;
        const gap = circ - dash;
        const el = (
          <circle
            key={i}
            cx={cx}
            cy={cy}
            r={r}
            fill="none"
            stroke={seg.color}
            strokeWidth={strokeW}
            strokeDasharray={`${dash} ${gap}`}
            strokeDashoffset={-offset + circ * 0.25}
            strokeLinecap="round"
          />
        );
        offset += dash + 2;
        return el;
      })}
      <text
        x={cx}
        y={cy - 6}
        textAnchor="middle"
        fontSize="18"
        fontWeight="600"
        fill="#111827"
      >
        {total}
      </text>
      <text
        x={cx}
        y={cy + 14}
        textAnchor="middle"
        fontSize="9"
        fill="#9ca3af"
        letterSpacing="1"
      >
        Buyurtmalar
      </text>
    </svg>
  );
}
DonutChart.propTypes = {
  segments: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.number.isRequired,
      color: PropTypes.string.isRequired,
    }),
  ).isRequired,
};

// ── Bar Chart (pure SVG) ──────────────────────────────────────────────────────
function BarChart({ data }) {
  const maxVal = Math.max(...data.map((d) => d.value), 1);
  const H = 140,
    barW = 50,
    gap = 40;
  const chartW = data.length * (barW + gap) - gap + 40;
  return (
    <svg
      viewBox={`0 0 ${chartW} ${H + 40}`}
      width="100%"
      style={{ overflow: "visible" }}
    >
      {[0, 0.25, 0.5, 0.75, 1].map((t, i) => {
        const y = H - t * H;
        return (
          <g key={i}>
            <line
              x1={0}
              x2={chartW}
              y1={y}
              y2={y}
              stroke="#f3f4f6"
              strokeWidth={1}
            />
            <text x={0} y={y - 4} fontSize="9" fill="#9ca3af">
              {Math.round(maxVal * t).toLocaleString()}
            </text>
          </g>
        );
      })}
      {data.map((d, i) => {
        const barH = (d.value / maxVal) * H;
        const x = 20 + i * (barW + gap);
        const y = H - barH;
        return (
          <g key={i}>
            <rect x={x} y={0} width={barW} height={H} rx={6} fill="#f9fafb" />
            <rect
              x={x}
              y={y}
              width={barW}
              height={barH}
              rx={6}
              fill={d.color}
            />
            <text
              x={x + barW / 2}
              y={y - 8}
              textAnchor="middle"
              fontSize="11"
              fontWeight="600"
              fill={d.color}
            >
              {d.value.toLocaleString()}
            </text>
            <text
              x={x + barW / 2}
              y={H + 18}
              textAnchor="middle"
              fontSize="11"
              fill="#6b7280"
            >
              {d.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
BarChart.propTypes = {
  data: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      value: PropTypes.number.isRequired,
      color: PropTypes.string.isRequired,
    }),
  ).isRequired,
};

// ── Stat Card ─────────────────────────────────────────────────────────────────
function StatCard({ icon, label, value, sub, accent, badge }) {
  return (
    <Box
      bg="surface"
      border="1px"
      borderColor="border"
      borderRadius="xl"
      p={5}
      _hover={{ shadow: "md", transform: "translateY(-2px)" }}
      transition="all 0.2s ease"
    >
      <Flex justify="space-between" align="flex-start" mb={3}>
        <Box bg={accent + "20"} p={2} borderRadius="lg">
          <svg
            width={20}
            height={20}
            viewBox="0 0 24 24"
            fill="none"
            stroke={accent}
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d={icon} />
          </svg>
        </Box>
        {badge && (
          <Box
            bg="green.50"
            color="green.600"
            fontSize="11px"
            fontWeight="600"
            px={2}
            py={0.5}
            borderRadius="full"
          >
            {badge}
          </Box>
        )}
      </Flex>
      <Text fontSize="28px" fontWeight="700" color="text" lineHeight={1}>
        {typeof value === "number" ? value.toLocaleString() : value}
      </Text>
      <Text fontSize="13px" color="neutral.500" mt={1} fontWeight="500">
        {label}
      </Text>
      {sub && (
        <Text fontSize="11px" color="neutral.400" mt={1}>
          {sub}
        </Text>
      )}
    </Box>
  );
}
StatCard.propTypes = {
  icon: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
  sub: PropTypes.string,
  accent: PropTypes.string.isRequired,
  badge: PropTypes.string,
};
StatCard.defaultProps = {
  sub: "",
  badge: "",
};

// ── Section Card ──────────────────────────────────────────────────────────────
function SectionCard({ title, children, rightSlot }) {
  return (
    <Box
      bg="surface"
      border="1px"
      borderColor="border"
      borderRadius="xl"
      p={6}
      h="full"
    >
      <Flex justify="space-between" align="center" mb={5}>
        <Text fontSize="md" fontWeight="semibold" color="text">
          {title}
        </Text>
        {rightSlot}
      </Flex>
      {children}
    </Box>
  );
}
SectionCard.propTypes = {
  title: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
  rightSlot: PropTypes.node,
};
SectionCard.defaultProps = {
  rightSlot: null,
};

// ── Offer Row ─────────────────────────────────────────────────────────────────
function OfferRow({ color, label, value, total }) {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0;
  return (
    <Box
      py={2}
      borderBottom="1px"
      borderColor="gray.50"
      _last={{ borderBottom: "none" }}
    >
      <Flex justify="space-between" align="center" mb={1}>
        <HStack spacing={2}>
          <Box w="8px" h="8px" borderRadius="full" bg={color} />
          <Text fontSize="13px" color="neutral.500">
            {label}
          </Text>
        </HStack>
        <Text fontSize="14px" fontWeight="600" color="text">
          {value}
        </Text>
      </Flex>
      <Box bg="gray.100" borderRadius="full" h="3px" w="full">
        <Box bg={color} h="3px" borderRadius="full" w={`${pct}%`} />
      </Box>
    </Box>
  );
}
OfferRow.propTypes = {
  color: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  value: PropTypes.number.isRequired,
  total: PropTypes.number.isRequired,
};

// ── Main Component ────────────────────────────────────────────────────────────
export default function ADhome() {
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await apiStatistics.GetSystemData();
      setData(res.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Derived values
  const companyCount = (data?.locations?.companyCount ?? 0) + 3000;
  const factoryCount = (data?.locations?.factoryCount ?? 0) + 320;
  const brokerCount = data?.users?.brokerCount ?? 0;
  const salesRepCount = data?.users?.salesRepCount ?? 0;
  const supplierCount = data?.users?.supplierCount ?? 0;
  const newCount = data?.offers?.newCount ?? 0;
  const completedCount = data?.offers?.completedCount ?? 0;
  const cancelledCount = data?.offers?.cancelledCount ?? 0;
  const otherCount = data?.offers?.otherCount ?? 0;
  const totalOffers = newCount + completedCount + cancelledCount + otherCount;

  const offerSegments = [
    { label: "New", value: newCount, color: "#7F77DD" },
    { label: "Completed", value: completedCount, color: "#1D9E75" },
    { label: "Cancelled", value: cancelledCount, color: "#E24B4A" },
    { label: "Other", value: otherCount, color: "#EF9F27" },
  ];

  if (loading) {
    return (
      <Box
        bg="bg"
        minH="100vh"
        display="flex"
        justifyContent="center"
        alignItems="center"
      >
        <Spinner size="xl" color="primary" thickness="3px" />
      </Box>
    );
  }

  return (
    <Box bg="bg" minH="100vh" p={6}>
      {/* ── Stat Cards ──────────────────────────────────────────── */}
      <SimpleGrid columns={{ base: 2, md: 3, xl: 6 }} gap={4} mb={5}>
        <StatCard
          icon="M3 21h18M3 10h18M5 6l7-3 7 3M4 10v11M20 10v11M8 14v3M12 14v3M16 14v3"
          label="Qurilish kompanyalari"
          value={companyCount}
          accent="#7F77DD"
        />
        <StatCard
          icon="M2 20h20M4 20V10l8-6 8 6v10M9 20v-5h6v5"
          label="Ishlabchiqaruvchilar"
          value={factoryCount}
          accent="#185FA5"
        />
        <StatCard
          icon="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"
          label="Brokerlar"
          value={brokerCount}
          accent="#534AB7"
        />
        <StatCard
          icon="M20 7H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2zM16 3H8v4h8V3zM16 17v4H8v-4"
          label="Operatorlar"
          value={salesRepCount}
          accent="#854F0B"
        />
        <StatCard
          icon="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"
          label="Taminotchilar"
          value={supplierCount}
          accent="#0F6E56"
        />
        <StatCard
          icon="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 0 0 1.946-.806 3.42 3.42 0 0 1 4.438 0 3.42 3.42 0 0 0 1.946.806 3.42 3.42 0 0 1 3.138 3.138 3.42 3.42 0 0 0 .806 1.946 3.42 3.42 0 0 1 0 4.438 3.42 3.42 0 0 0-.806 1.946 3.42 3.42 0 0 1-3.138 3.138 3.42 3.42 0 0 0-1.946.806 3.42 3.42 0 0 1-4.438 0 3.42 3.42 0 0 0-1.946-.806 3.42 3.42 0 0 1-3.138-3.138 3.42 3.42 0 0 0-.806-1.946 3.42 3.42 0 0 1 0-4.438 3.42 3.42 0 0 0 .806-1.946 3.42 3.42 0 0 1 3.138-3.138z"
          label="Jami buyurtmalar"
          value={totalOffers}
          accent="#D85A30"
        />
      </SimpleGrid>

      <SectionCard title="Buyurtmalar holati">
        <Flex
          direction={{ base: "column", md: "row" }}
          align="center"
          justify="space-between"
          gap={10}
        >
          <Box flexShrink={0}>
            <DonutChart segments={offerSegments} />
          </Box>

          <Box w="full">
            <OfferRow
              color="#7F77DD"
              label="Yangi"
              value={newCount}
              total={totalOffers}
            />
            <OfferRow
              color="#1D9E75"
              label="Tugatilgan"
              value={completedCount}
              total={totalOffers}
            />
            <OfferRow
              color="#E24B4A"
              label="Bekor qilingan"
              value={cancelledCount}
              total={totalOffers}
            />
            <OfferRow
              color="#EF9F27"
              label="Jarayonda"
              value={otherCount}
              total={totalOffers}
            />
          </Box>
        </Flex>
      </SectionCard>
    </Box>
  );
}

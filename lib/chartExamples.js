// Chart examples for the auxiliary/chart endpoint
const chartExamples = [
  {
    id: "demand-allocation-trend",
    headline: "Demand vs Allocation Trend for 9* Products",
    timestamp: "2024-12-01T15:00:00Z",
    preamble: "Comparison between total demand and allocation over time",
    content:
      "Significant shortages observed in critical components during peak demand periods. GPU demand continues to outpace supply by 40% on average.",
    chart: {
      type: "line",
      labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
      data: [
        {
          name: "Total Demand",
          data: [15000, 18000, 22000, 25000, 28000, 32000, 35000, 38000, 42000, 45000, 48000, 52000],
          color: "#90EE90",
        },
        {
          name: "Allocated",
          data: [12000, 14000, 16000, 18000, 20000, 22000, 24000, 26000, 28000, 30000, 32000, 34000],
          color: "#228B22",
        },
        {
          name: "Shortage",
          data: [-3000, -4000, -6000, -7000, -8000, -10000, -11000, -12000, -14000, -15000, -16000, -18000],
          color: "#FF0000",
        },
        {
          name: "Backlog",
          data: [5000, 9000, 15000, 22000, 30000, 40000, 51000, 63000, 77000, 92000, 108000, 126000],
          color: "#FFA500",
        },
      ],
    },
  },
  {
    id: "inventory-balance-monthly",
    headline: "Inventory Balance by Month",
    timestamp: "2024-12-01T16:00:00Z",
    preamble: "Monthly inventory levels showing positive and negative balances",
    content:
      "Inventory levels fluctuate significantly with seasonal demand patterns. Raw materials show critical shortages in Q3.",
    chart: {
      type: "bar",
      labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
      data: [
        {
          name: "Raw Materials",
          data: [25000, 32000, -15000, -25000, 15000, -30000, -45000, -60000, -75000, -55000, -35000, -20000],
          color: "#0070F2",
        },
        {
          name: "Work in Progress",
          data: [-15000, 30000, -20000, -10000, 25000, 40000, 55000, 70000, 85000, 65000, 45000, 30000],
          color: "#8B5CF6",
        },
        {
          name: "Finished Goods",
          data: [10000, -25000, 15000, -15000, 20000, 35000, 50000, 65000, 80000, 60000, 40000, 25000],
          color: "#EC4899",
        },
        {
          name: "Safety Stock",
          data: [5000, 8000, 12000, 15000, 18000, 22000, 25000, 28000, 32000, 35000, 38000, 42000],
          color: "#10B981",
        },
      ],
    },
  },
  {
    id: "production-capacity-utilization",
    headline: "Production Capacity Utilization",
    timestamp: "2024-12-01T17:00:00Z",
    preamble: "Production line efficiency and capacity usage over time",
    content:
      "Production lines operating at optimal capacity with minor fluctuations. Line C consistently outperforms targets.",
    chart: {
      type: "line",
      labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
      data: [
        {
          name: "Line A Capacity",
          data: [85, 88, 92, 89, 95, 91, 94, 96, 98, 95, 92, 89],
          color: "#0070F2",
        },
        {
          name: "Line B Capacity",
          data: [78, 82, 85, 80, 88, 84, 87, 90, 93, 89, 86, 83],
          color: "#8B5CF6",
        },
        {
          name: "Line C Capacity",
          data: [92, 90, 88, 94, 89, 93, 96, 98, 99, 97, 94, 91],
          color: "#10B981",
        },
        {
          name: "Line D Capacity",
          data: [75, 78, 82, 79, 85, 81, 84, 87, 90, 86, 83, 80],
          color: "#F59E0B",
        },
        {
          name: "Line E Capacity",
          data: [88, 91, 94, 90, 93, 89, 92, 95, 97, 94, 91, 88],
          color: "#EF4444",
        },
      ],
    },
  },
  {
    id: "quality-control-metrics",
    headline: "Quality Control Metrics",
    timestamp: "2024-12-01T18:00:00Z",
    preamble: "Distribution of quality issues by category",
    content: "Dimensional defects represent the majority of quality issues. Surface finish issues have decreased by 15%.",
    chart: {
      type: "pie",
      labels: [
        "Dimensional Defects",
        "Surface Finish Issues",
        "Material Defects",
        "Assembly Problems",
        "Packaging Issues",
        "Electrical Failures",
        "Mechanical Failures",
        "Documentation Errors",
      ],
      data: [35, 20, 15, 12, 8, 6, 3, 1],
    },
  },
  {
    id: "resource-allocation-departments",
    headline: "Resource Allocation by Department",
    timestamp: "2024-12-01T19:00:00Z",
    preamble:
      "Budget and resource distribution across manufacturing departments",
    content:
      "Production and Quality Control receive the largest resource allocation. R&D investment increased by 25% this quarter.",
    chart: {
      type: "doughnut",
      labels: [
        "Production",
        "Quality Control",
        "Maintenance",
        "Logistics",
        "Engineering",
        "R&D",
        "Administration",
        "Training",
      ],
      data: [30, 22, 18, 12, 8, 6, 3, 1],
    },
  },
  {
    id: "monthly-production-output",
    headline: "Monthly Production Output by Product Line",
    timestamp: "2024-12-01T20:00:00Z",
    preamble:
      "Production volume comparison across different product categories",
    content: "Automotive components show the highest production volume. Medical devices show consistent growth.",
    chart: {
      type: "column",
      labels: ["Automotive", "Aerospace", "Electronics", "Medical", "Consumer", "Industrial", "Defense", "Telecom"],
      data: [
        {
          name: "Q1 Production",
          data: [45000, 32000, 28000, 22000, 18000, 15000, 12000, 10000],
          color: "#0070F2",
        },
        {
          name: "Q2 Production",
          data: [52000, 38000, 31000, 25000, 20000, 17000, 14000, 12000],
          color: "#10B981",
        },
        {
          name: "Q3 Production",
          data: [58000, 42000, 34000, 28000, 22000, 19000, 16000, 14000],
          color: "#F59E0B",
        },
        {
          name: "Q4 Production",
          data: [65000, 46000, 37000, 31000, 24000, 21000, 18000, 16000],
          color: "#EF4444",
        },
      ],
    },
  },
  {
    id: "supplier-performance-metrics",
    headline: "Supplier Performance Metrics",
    timestamp: "2024-12-01T21:00:00Z",
    preamble: "Key performance indicators for supplier evaluation",
    content: "Most suppliers are meeting or exceeding performance targets. Lead time improvements observed across all categories.",
    chart: {
      type: "bullet",
      labels: [
        "On-Time Delivery",
        "Quality Score",
        "Cost Efficiency",
        "Lead Time",
        "Communication",
        "Innovation",
        "Sustainability",
        "Risk Management",
      ],
      data: [
        {
          name: "Current Performance",
          data: [88, 94, 82, 92, 90, 78, 85, 87],
          color: "#0070F2",
        },
        {
          name: "Target",
          data: [85, 90, 80, 90, 85, 75, 80, 85],
          color: "#EF4444",
        },
        {
          name: "Industry Average",
          data: [82, 87, 78, 88, 82, 72, 78, 82],
          color: "#10B981",
        },
      ],
    },
  },
  {
    id: "production-efficiency-trend",
    headline: "Production Efficiency with Trend Analysis",
    timestamp: "2024-12-01T22:00:00Z",
    preamble: "Production efficiency data with trend line overlay",
    content: "Overall positive efficiency trend despite seasonal variations. Automation initiatives showing measurable impact.",
    chart: {
      type: "columnWithTrend",
      labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
      data: [
        {
          name: "Efficiency",
          data: [85, 88, 92, 89, 95, 91, 94, 96, 98, 95, 92, 89],
          color: "#0070F2",
        },
        {
          name: "Trend",
          data: [84, 87, 90, 88, 93, 90, 93, 95, 97, 94, 91, 88],
          color: "#EF4444",
        },
        {
          name: "Target",
          data: [80, 82, 85, 83, 88, 85, 88, 90, 92, 89, 86, 83],
          color: "#10B981",
        },
      ],
    },
  },
  {
    id: "manufacturing-cost-analysis",
    headline: "Manufacturing Cost Analysis",
    timestamp: "2024-12-01T23:00:00Z",
    preamble: "Combined visualization of production costs and revenue",
    content: "Production costs remain controlled while revenue shows growth. Profit margins improved by 8% year-over-year.",
    chart: {
      type: "composed",
      labels: ["Q1", "Q2", "Q3", "Q4"],
      data: [
        {
          name: "Revenue",
          data: [1200000, 1400000, 1600000, 1800000],
          color: "#0070F2",
        },
        {
          name: "Production Costs",
          data: [800000, 900000, 1000000, 1100000],
          color: "#EF4444",
        },
        {
          name: "Profit Margin",
          data: [400000, 500000, 600000, 700000],
          color: "#10B981",
        },
        {
          name: "Operating Expenses",
          data: [200000, 220000, 240000, 260000],
          color: "#F59E0B",
        },
        {
          name: "Net Profit",
          data: [200000, 280000, 360000, 440000],
          color: "#8B5CF6",
        },
      ],
    },
  },
  {
    id: "manufacturing-capability-assessment",
    headline: "Manufacturing Capability Assessment",
    timestamp: "2024-12-02T00:00:00Z",
    preamble: "Multi-dimensional evaluation of manufacturing capabilities",
    content:
      "Strong technical capabilities with room for improvement in flexibility. Digital transformation initiatives showing positive results.",
    chart: {
      type: "radar",
      labels: [
        "Technical Skills",
        "Equipment Reliability",
        "Process Efficiency",
        "Quality Control",
        "Flexibility",
        "Safety",
        "Digital Maturity",
        "Innovation",
        "Sustainability",
        "Cost Competitiveness",
      ],
      data: [
        {
          name: "Current Capability",
          data: [88, 92, 85, 96, 75, 94, 82, 78, 85, 80],
          color: "#0070F2",
        },
        {
          name: "Industry Benchmark",
          data: [85, 88, 82, 92, 78, 90, 80, 75, 82, 78],
          color: "#EF4444",
        },
        {
          name: "Target 2025",
          data: [92, 95, 90, 98, 85, 96, 88, 85, 90, 85],
          color: "#10B981",
        },
      ],
    },
  },
];

module.exports = chartExamples;

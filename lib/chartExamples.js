// Chart examples for the auxiliary/chart endpoint
const chartExamples = [
  {
    headline: "Demand vs Allocation Trend for 9* Products",
    timestamp: "2024-12-01T15:00:00Z",
    preamble: "Comparison between total demand and allocation over time",
    content:
      "Significant shortages observed in critical components during peak demand periods.",
    chart: {
      type: "line",
      labels: ["May 18, 2025", "Jun 1", "Jun 15", "Jun 29", "Jul 13"],
      data: [
        {
          name: "Total Demand",
          data: [0, 5000, 10000, 0, 5000],
          color: "#90EE90",
        },
        {
          name: "Allocated",
          data: [0, 0, 0, 0, 0],
          color: "#228B22",
        },
        {
          name: "Shortage",
          data: [0, -5000, -10000, 0, -5000],
          color: "#FF0000",
        },
      ],
    },
  },
  {
    headline: "Inventory Balance by Month",
    timestamp: "2024-12-01T16:00:00Z",
    preamble: "Monthly inventory levels showing positive and negative balances",
    content:
      "Inventory levels fluctuate significantly with seasonal demand patterns.",
    chart: {
      type: "bar",
      labels: ["Jan", "Feb", "Mar", "Apr", "Mai", "Jun"],
      data: [
        {
          name: "Raw Materials",
          data: [20, 45, -35, -25, 15, -30],
          color: "#0070F2",
        },
        {
          name: "Work in Progress",
          data: [-15, 30, -20, -10, 25, 40],
          color: "#8B5CF6",
        },
        {
          name: "Finished Goods",
          data: [10, -25, 15, -15, 20, 35],
          color: "#EC4899",
        },
      ],
    },
  },
  {
    headline: "Production Capacity Utilization",
    timestamp: "2024-12-01T17:00:00Z",
    preamble: "Production line efficiency and capacity usage over time",
    content:
      "Production lines operating at optimal capacity with minor fluctuations.",
    chart: {
      type: "line",
      labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
      data: [
        {
          name: "Line A Capacity",
          data: [85, 88, 92, 89, 95, 91],
          color: "#0070F2",
        },
        {
          name: "Line B Capacity",
          data: [78, 82, 85, 80, 88, 84],
          color: "#8B5CF6",
        },
        {
          name: "Line C Capacity",
          data: [92, 90, 88, 94, 89, 93],
          color: "#10B981",
        },
      ],
    },
  },
  {
    headline: "Quality Control Metrics",
    timestamp: "2024-12-01T18:00:00Z",
    preamble: "Distribution of quality issues by category",
    content: "Dimensional defects represent the majority of quality issues.",
    chart: {
      type: "pie",
      labels: [
        "Dimensional",
        "Surface Finish",
        "Material",
        "Assembly",
        "Packaging",
      ],
      data: [40, 25, 20, 10, 5],
    },
  },
  {
    headline: "Resource Allocation by Department",
    timestamp: "2024-12-01T19:00:00Z",
    preamble:
      "Budget and resource distribution across manufacturing departments",
    content:
      "Production and Quality Control receive the largest resource allocation.",
    chart: {
      type: "doughnut",
      labels: [
        "Production",
        "Quality Control",
        "Maintenance",
        "Logistics",
        "Engineering",
      ],
      data: [35, 25, 20, 15, 5],
    },
  },
  {
    headline: "Monthly Production Output by Product Line",
    timestamp: "2024-12-01T20:00:00Z",
    preamble:
      "Production volume comparison across different product categories",
    content: "Automotive components show the highest production volume.",
    chart: {
      type: "column",
      labels: ["Automotive", "Aerospace", "Electronics", "Medical", "Consumer"],
      data: [
        {
          name: "Q1 Production",
          data: [45000, 32000, 28000, 22000, 18000],
          color: "#0070F2",
        },
        {
          name: "Q2 Production",
          data: [52000, 38000, 31000, 25000, 20000],
          color: "#10B981",
        },
      ],
    },
  },
  {
    headline: "Supplier Performance Metrics",
    timestamp: "2024-12-01T21:00:00Z",
    preamble: "Key performance indicators for supplier evaluation",
    content: "Most suppliers are meeting or exceeding performance targets.",
    chart: {
      type: "bullet",
      labels: [
        "On-Time Delivery",
        "Quality Score",
        "Cost Efficiency",
        "Lead Time",
        "Communication",
      ],
      data: [
        {
          name: "Current Performance",
          data: [85, 92, 78, 95, 88],
          color: "#0070F2",
        },
        {
          name: "Target",
          data: [80, 90, 75, 90, 85],
          color: "#EF4444",
        },
      ],
    },
  },
  {
    headline: "Production Efficiency with Trend Analysis",
    timestamp: "2024-12-01T22:00:00Z",
    preamble: "Production efficiency data with trend line overlay",
    content: "Overall positive efficiency trend despite seasonal variations.",
    chart: {
      type: "columnWithTrend",
      labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
      data: [
        {
          name: "Efficiency",
          data: [85, 88, 92, 89, 95, 91],
          color: "#0070F2",
        },
        {
          name: "Trend",
          data: [84, 87, 90, 88, 93, 90],
          color: "#EF4444",
        },
      ],
    },
  },
  {
    headline: "Manufacturing Cost Analysis",
    timestamp: "2024-12-01T23:00:00Z",
    preamble: "Combined visualization of production costs and revenue",
    content: "Production costs remain controlled while revenue shows growth.",
    chart: {
      type: "composed",
      labels: ["Q1", "Q2", "Q3", "Q4"],
      data: [
        {
          name: "Revenue",
          data: [100000, 120000, 140000, 160000],
          color: "#0070F2",
        },
        {
          name: "Production Costs",
          data: [70000, 80000, 90000, 100000],
          color: "#EF4444",
        },
        {
          name: "Profit Margin",
          data: [30000, 40000, 50000, 60000],
          color: "#10B981",
        },
      ],
    },
  },
  {
    headline: "Manufacturing Capability Assessment",
    timestamp: "2024-12-02T00:00:00Z",
    preamble: "Multi-dimensional evaluation of manufacturing capabilities",
    content:
      "Strong technical capabilities with room for improvement in flexibility.",
    chart: {
      type: "radar",
      labels: [
        "Technical Skills",
        "Equipment Reliability",
        "Process Efficiency",
        "Quality Control",
        "Flexibility",
        "Safety",
      ],
      data: [
        {
          name: "Current Capability",
          data: [85, 90, 78, 95, 70, 92],
          color: "#0070F2",
        },
        {
          name: "Industry Benchmark",
          data: [80, 85, 75, 90, 75, 88],
          color: "#EF4444",
        },
      ],
    },
  },
];

module.exports = chartExamples;

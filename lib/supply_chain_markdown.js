const SUPPLY_CHAIN_MARKDOWN =
  "# Talk to Your Supply Chain — Demo Markdown\n\n" +
  "> Scenario: “Why did **On-Time In-Full (OTIF)** drop in **LATAM** last week, and what should we do before the holiday surge?”\n\n" +
  "## Goals\n" +
  "- Explain the OTIF dip with clear evidence (suppliers, lanes, SKUs).\n" +
  "- Recommend fast, low-risk mitigations.\n" +
  "- Produce a shareable summary for Ops & Finance.\n\n" +
  "## Filters (Action Filters)\n" +
  "- **Date range:** 2025-07-15 → 2025-08-12  \n" +
  "- **Region:** LATAM  \n" +
  "- **SKU family:** Compute Nodes (A100/H100)  \n" +
  "- **Carrier:** All  \n" +
  "- **Warehouse:** Bogotá DC-01\n\n" +
  "## Executive KPIs (Today vs 7-day)\n" +
  "| Metric                 | Today | 7-day Avg | WoW   | Target | Status |\n" +
  "|------------------------|------:|----------:|:-----:|------:|:------:|\n" +
  "| **OTIF**               | 88.4% | 91.1%     |  ↓    | ≥95%  | ⚠️     |\n" +
  "| **Fill Rate**          | 96.2% | 97.0%     |  ↓    | ≥98%  | ⚠️     |\n" +
  "| **Lead Time (avg)**    | 9.8d  | 9.1d      |  ↑    | ≤8d   | ⚠️     |\n" +
  "| **Backorders (units)** | 312   | 250       |  ↑    |  0    | 🔺     |\n\n" +
  "## Where the drop happened\n" +
  "- **Lane:** GDL → BOG shows **+2.1d** transit delay (port congestion spillover).\n" +
  "- **Supplier:** Foxtron-MX short on **power rails** for H100 trays (**−3,200 pcs**).\n" +
  "- **SKU impact:** H100 trays > A100 add-on kits (priority skew).\n\n" +
  "## Top Stockouts (rolling 7 days)\n" +
  "| SKU                 | DC     | Units | Lost Rev. (USD) |\n" +
  "|---------------------|--------|------:|----------------:|\n" +
  "| H100-TRAY-PWR-KIT   | BOG-01 |   120 |        864,000  |\n" +
  "| A100-RAILS-SET      | BOG-01 |   210 |        231,000  |\n" +
  "| H100-CABLE-PCIE     | LIM-02 |    80 |         72,000  |\n\n" +
  "## Risks & Alerts\n" +
  "- ⚠️ **Supplier constraint** on power rails persists 2–3 weeks.\n" +
  "- 🚢 **Ocean dwell** +0.8d (TEUs for GDL origin).\n" +
  "- 🧊 **Cold start** carriers on BOG last-mile underperforming (SLA breach 6%).\n\n" +
  "## Recommendation (Prioritized)\n" +
  "1. **Expedite critical rails** (partial air-freight; limit to H100 trays; cost cap ≤ $12k).  \n" +
  "2. **Rebalance inventory** from LIM-02 → BOG-01 (transfer window 48–72h).  \n" +
  "3. **Temporary carrier swap** for BOG last-mile lanes with SLA bonus/malus.  \n" +
  "4. **Issue supplier PO split** (weekly cadence; smaller lots) until constraint clears.\n\n" +
  "## Streaming sample (what the app displays progressively)\n\n" +
  "**Request (JSON)**\n" +
  "```json\n" +
  "{\n" +
  '  "query": "Explain the OTIF drop in LATAM and propose mitigations.",\n' +
  '  "filters": {\n' +
  '    "date_from": "2025-07-15",\n' +
  '    "date_to": "2025-08-12",\n' +
  '    "region": "LATAM",\n' +
  '    "sku_family": "Compute Nodes"\n' +
  "  },\n" +
  '  "request_id": "8f9a7b9e-6c2a-4b4a-9a1b-5a0c7c8b12a4"\n' +
  "}\n" +
  "```\n\n" +
  "**SSE/NDJSON Chunk (example)**\n" +
  "```json\n" +
  '{ "type": "delta", "content": "OTIF fell to ", "request_id": "8f9a7..." }\n' +
  "```\n" +
  "```json\n" +
  '{ "type": "delta", "content": "88.4% due to supplier constraints ", "request_id": "8f9a7..." }\n' +
  "```\n" +
  "```json\n" +
  '{ "type": "complete", "tokens": 412, "elapsed_ms": 3180, "request_id": "8f9a7..." }\n' +
  "```\n\n" +
  "## Quick Visual\n" +
  "![LATAM lane map (placeholder)](https://placehold.co/820x260?text=LATAM+Lanes+%26+Delays)\n\n" +
  "## Action Checklist\n" +
  "- [x] Validate filters (date range + region).\n" +
  "- [x] Confirm supplier shortage on rails with Foxtron-MX.\n" +
  "- [ ] Approve partial air-freight budget.\n" +
  "- [ ] Execute DC transfer LIM-02 → BOG-01.\n" +
  "- [ ] Monitor OTIF daily for 2 weeks.\n\n" +
  "## Notes\n" +
  "- External links: [Next.js](https://nextjs.org) · [NVIDIA Developer](https://developer.nvidia.com)  \n" +
  "- Data sources used: WMS, TMS, Supplier ASN feeds, Port dwell API.  \n" +
  "- If OTIF stays **<90%** for 3 consecutive days, escalate to **Tier-1 incident**.\n\n";

module.exports = { SUPPLY_CHAIN_MARKDOWN };

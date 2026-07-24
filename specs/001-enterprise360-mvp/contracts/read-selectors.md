# Contract: Dashboard Read Selectors

Read-side interfaces the dashboards use to render current state and trends. They
live in `src/lib/kpi-selectors.ts`, are called from Server Components, and never
mutate state (write/read separation, research D6). Return shapes are described at
the field level; the code returns typed objects.

## `getLatestKpi(): KpiSnapshot | null`
Most recent daily snapshot (revenue, cogs, grossMargin, ordersCount,
backorderCount, inventoryValue, openPrCount, openPoCount, onTimeDeliveryPct,
cashPosition). Powers headline KPI cards on Executive/Finance. Feeds spec FR-010.

## `getKpiTrend(): Array<{ label, revenue, grossMargin, cashPosition, backorderCount, inventoryValue, onTimeDeliveryPct, openPoCount, openPrCount }>`
One entry per simulated day, ascending. Powers all trend charts. Feeds FR-010.

## `getRecentEvents(limit = 25): Array<{ simDay, eventType, message }>`
Most recent events (day desc, then sequence desc). Powers the activity feed. Feeds
spec FR-009.

## `getInventoryStatus(): Array<{ sku, name, onHand, incoming, reorderPoint }>`
Per-product stock position vs reorder point. Powers the Inventory dashboard
(stock-vs-reorder view). Feeds FR-010 (Inventory) and the reorder story (FR-004).

## `getOpenProcurement(): { prs: PurchaseRequest[], pos: PurchaseOrder[] }`
Open purchase requests (`pending`/`approved`) and open purchase orders
(`placed`/`in_transit`/`delayed`, with supplier and ETA). Powers the
Procurement/Warehouse dashboard. Feeds FR-010 (Procurement) and delay visibility
(edge case: supplier delay).

## `getSalesSummary(): { day, ordersCount, fulfilled, backordered, topSkus: Array<{ sku, qty }> }`
Current-day sales activity. Powers the Sales dashboard. Feeds FR-010 (Sales) and
fulfil/backorder visibility (FR-003).

### Consistency contract
All selectors read the same committed state produced by the tick engine, so any
headline figure a dashboard shows is traceable to the SimEvents and KpiSnapshot of
the corresponding day (spec SC-002).

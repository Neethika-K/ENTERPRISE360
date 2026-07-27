# Business Requirements Document

**Project:** Automated Inventory Replenishment for Northwind Retail Co.
**Flagship problem:** Inventory shortages → Procurement
**Author:** Business Analyst · **Status:** Approved

## 1. Problem Statement

Northwind Retail sells across physical stores, a website, and a mobile app. Demand
for its top products is uneven — occasional spikes draw stock down faster than
staff notice. Because reordering is manual and reactive, popular items reach zero
before a purchase order is raised, producing **backorders, lost sales, and
avoidable expedite costs**. Leadership also lacks a single, current view of how
inventory, procurement, and cash are moving together.

## 2. Business Objectives

- **Eliminate preventable stockouts** by reordering *before* an item runs out.
- **Automate the reorder decision** so it does not depend on someone watching stock.
- **Give executives one connected view** of the order-to-cash and procure-to-pay
  flow, updated as the business runs.

## 3. Stakeholders

| Stakeholder | Interest |
|---|---|
| Operations Manager | Wants stock to cover demand without manual monitoring |
| Procurement | Needs clear, approved requests and supplier lead-time visibility |
| Finance | Wants revenue, cost, and cash tracked as activity happens |
| Executive sponsor | Wants fewer backorders and a credible operating picture |

## 4. Scope

**In scope:** the connected loop across Sales, Inventory, Procurement, Warehouse,
and Finance — automatic reorder-point detection, request approval, purchase-order
placement against supplier lead times, receiving, and daily KPI reporting on five
dashboards.

**Out of scope:** HR, Marketing, and IT operations; additional business problems;
multi-warehouse routing; predictive/ML demand forecasting; and public cloud
hosting. These are documented as a future roadmap.

## 5. Success Metrics

- **Backorder rate** trends down once replenishment is automated.
- **On-time delivery %** is visible and tracked for every received order.
- **Inventory value** stays within a healthy band — neither stocked out nor
  overstocked.
- A stakeholder can trace any headline figure back to the events that produced it.

## 6. Current vs. Future Process

- **Current:** staff eyeball stock, notice shortages late, raise ad-hoc orders;
  no shared operating picture.
- **Future:** when an item's on-hand plus incoming stock falls below its reorder
  point, the system raises a purchase request automatically, routes it for
  approval, places a supplier order with a realistic lead time, and replenishes
  stock on arrival — every step logged and reflected on the dashboards.

## 7. Assumptions & Constraints

- The simulation runs on a curated set of ~6 high-volume SKUs so cause and effect
  stay legible.
- For this release, payments settle immediately on sale and on receipt, orders
  arrive complete (no partial shipments), and an order line is filled or
  backordered as a whole — deliberate simplifications, not defects.
- Time advances only when an operator advances the day; behavior is deterministic
  and replayable from the same starting point.

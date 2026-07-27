# Functional Requirements Document

**Project:** Automated Inventory Replenishment · **Companion to:** BRD

Each requirement below is implemented by a rule in the simulation engine and is
observable on the dashboards and in the system log. IDs are referenced by the
Requirements Traceability Matrix.

## FR-1 · Demand generation
**Trigger:** operator advances the day.
**Behavior:** the system generates customer demand for the active SKUs, occasionally
including a demand spike, and records the resulting orders.
**Output:** new orders and order lines; `order_placed` / `demand_spike` log events.

## FR-2 · Fulfilment & backorder
**Trigger:** a placed order.
**Behavior:** each line is filled if on-hand stock covers it (stock is reduced);
otherwise it is recorded as backordered. Stock never goes negative; a line is
filled or backordered as a whole.
**Output:** updated stock; `inventory_decremented` / `backorder` events.

## FR-3 · Reorder-point detection
**Trigger:** end of the fulfilment step each day.
**Behavior:** for each item whose on-hand **plus incoming** stock is below its
reorder point, and which has no open request or outstanding order, the system
raises a purchase request for the item's fixed replenishment quantity.
**Output:** a pending purchase request; `reorder_triggered` / `pr_created` events.

## FR-4 · Request approval
**Trigger:** an open (pending) purchase request.
**Behavior:** requests below a fixed value threshold are approved automatically;
higher-value requests are held for a short review period, then approved.
**Output:** approved requests with an approver and approval day; `pr_approved` event.

## FR-5 · Purchase-order placement
**Trigger:** an approved purchase request.
**Behavior:** the system places a supplier order, setting expected arrival to the
current day plus the supplier's lead time; when a supplier misses its reliability
window, arrival is pushed out and the order is flagged delayed. Incoming stock is
increased so the item is not reordered again while in transit.
**Output:** a supplier order; `po_placed` / `po_delayed` events.

## FR-6 · Receiving & replenishment
**Trigger:** a supplier order reaching its expected arrival day.
**Behavior:** the order is marked received, on-hand stock increases by the received
quantity, and incoming stock decreases correspondingly.
**Output:** replenished stock; `po_received` / `inventory_replenished` events.

## FR-7 · Finance recording
**Trigger:** a fulfilled sale or a received supplier order.
**Behavior:** the system records revenue and cost. For this release, receivables and
payables settle immediately.
**Output:** paid invoices; `invoice_issued` / `invoice_paid` events.

## FR-8 · Daily KPI snapshot
**Trigger:** end of each advanced day.
**Behavior:** the system captures one snapshot of company-level figures (revenue,
cost, margin, backorders, inventory value, open requests/orders, on-time delivery,
cash position).
**Output:** one snapshot per day powering the dashboard trends; `kpi_snapshot` event.

## FR-9 · Department dashboards
**Behavior:** Executive, Sales, Inventory, Procurement/Warehouse, and Finance views
present current state and trends, consistent with one another and the system log.

## FR-10 · Deterministic replay & reset
**Behavior:** from the same starting state the system produces the same sequence of
daily events; the operator can reset to day zero with starting stock at any time.

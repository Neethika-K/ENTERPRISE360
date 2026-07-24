# Data Model: Enterprise360 MVP

Source of truth for implementation is `prisma/schema.prisma`. This document is the
design-level view. Types are expressed generically; in the code they map to
Prisma/SQLite types (integers, floats, text, datetimes). All enum-like columns are
text (`String`) with the allowed values listed, because SQLite/Prisma has no enum
type; `SimEvent.payload` is text holding stringified JSON.

## Domain entities

### Product
Item the company sells.
- `id` (PK), `sku` (unique), `name`, `category`
- `unitCost` (paid to supplier), `unitPrice` (charged to customer)
- `reorderPoint`, `reorderQuantity`
- `supplierId` → Supplier
- Relationships: 1—* OrderLine, 1—1 Inventory, 1—* PurchaseRequest, 1—* PurchaseOrderLine

### Supplier
Source of replenishment.
- `id` (PK), `name`, `leadTimeDays`, `reliabilityPct` (0..1 chance of on-time)
- Relationships: 1—* Product, 1—* PurchaseOrder

### Customer
Buyer placing orders.
- `id` (PK), `name`, `segment` (`retail` | `wholesale`)
- Relationships: 1—* Order

### Order
A customer purchase for a given simulated day.
- `id` (PK), `customerId` → Customer, `simDay`
- `status` (`placed` | `fulfilled` | `backordered` | `cancelled`), `totalAmount`
- Relationships: 1—* OrderLine, 1—* Invoice (AR)
- State transitions: `placed` → `fulfilled` (all lines fulfilled) or `backordered`
  (any line backordered)

### OrderLine
One product within an order.
- `id` (PK), `orderId` → Order, `productId` → Product
- `quantity`, `unitPriceAtSale`, `lineStatus` (`fulfilled` | `backordered`)
- Rule: fulfilled or backordered **whole** — no partial-line split.

### Inventory
Stock position per product (single implied warehouse).
- `productId` (PK/FK), `quantityOnHand`, `quantityIncoming`, `updatedSimDay`
- Invariant: `quantityOnHand` never negative (backorder instead of over-draw).

### PurchaseRequest
A raised need to restock.
- `id` (PK), `productId` → Product, `simDayCreated`, `quantityRequested`
- `status` (`pending` | `approved` | `rejected` | `converted`), `approvedSimDay?`, `approver?`
- State transitions: `pending` → `approved` (auto or after review) → `converted`
  (turned into a PO).

### PurchaseOrder
A placed order to a supplier.
- `id` (PK), `supplierId` → Supplier, `purchaseRequestId?` → PurchaseRequest
- `simDayPlaced`, `expectedSimDayArrival`, `actualSimDayArrival?`
- `status` (`placed` | `in_transit` | `delayed` | `received` | `cancelled`), `totalCost`
- Relationships: 1—* PurchaseOrderLine, 1—* Invoice (AP)
- State transitions: created `in_transit` (or `delayed`) → `received` on/after
  `expectedSimDayArrival`.

### PurchaseOrderLine
One product within a PO.
- `id` (PK), `purchaseOrderId` → PurchaseOrder, `productId` → Product
- `quantityOrdered`, `quantityReceived` (default 0), `unitCostAtOrder`
- Rule: arrives whole (no split shipments).

### Invoice
Money owed to/by the company (AR from sales, AP to suppliers).
- `id` (PK), `type` (`customer_ar` | `supplier_ap`)
- `relatedOrderId?` → Order, `relatedPoId?` → PurchaseOrder
- `amount`, `simDayIssued`, `simDayDue`, `simDayPaid?`, `status` (`open` | `paid` | `overdue`)
- MVP rule: instant payment — issued and paid on the same day (fulfilment/receipt).

## Simulation-infrastructure entities

### SimState (singleton, id = 1)
- `currentDay` (starts 0), `rngSeed`, `lastTickAt` (wall-clock, display only)

### SimEvent (append-only audit log)
- `id` (PK), `simDay`, `sequence` (order within the day)
- `eventType` (e.g. `order_placed`, `inventory_decremented`, `reorder_triggered`,
  `pr_created`, `pr_approved`, `po_placed`, `po_delayed`, `po_received`,
  `inventory_replenished`, `invoice_issued`, `invoice_paid`, `demand_spike`,
  `kpi_snapshot`, `backorder`)
- `entityType?`, `entityId?`, `message` (human-readable), `payload?` (stringified JSON)
- Index: (`simDay`, `sequence`) for ordered retrieval.

### KpiSnapshot (one row per simulated day)
- `simDay` (unique), `revenue`, `cogs`, `grossMargin`, `ordersCount`,
  `backorderCount`, `inventoryValue`, `openPrCount`, `openPoCount`,
  `onTimeDeliveryPct`, `cashPosition`

## Validation & derivation rules (from requirements)

- **Reorder (FR-004)**: raise a PurchaseRequest for a product iff
  `quantityOnHand + quantityIncoming < reorderPoint` and no open PR
  (`pending`/`approved`) or open PO (`placed`/`in_transit`/`delayed`) covers it.
- **Approval (FR-005)**: auto-approve when `quantityRequested * unitCost ≤` a fixed
  threshold; otherwise hold for a fixed review period (days) then approve.
- **Procurement (FR-006)**: `expectedSimDayArrival = day + supplier.leadTimeDays`
  plus a seeded delay when the supplier misses its reliability roll (then `delayed`).
- **Receiving (FR-007)**: on/after `expectedSimDayArrival`, mark `received`,
  increase `quantityOnHand`, decrease `quantityIncoming`.
- **KPIs (FR-008)**: one KpiSnapshot per day derived from that day's activity plus
  cumulative cash/on-time figures.
- **Determinism (FR-012)**: identical `rngSeed` + identical starting state ⇒
  identical SimEvent and KpiSnapshot streams.

## Entity relationship summary

```
Supplier 1—* Product 1—* OrderLine *—1 Order *—1 Customer
Product 1—1 Inventory
Product 1—* PurchaseRequest →(0/1) PurchaseOrder *—1 Supplier
PurchaseOrder 1—* PurchaseOrderLine *—1 Product
Order 1—* Invoice(AR) ; PurchaseOrder 1—* Invoice(AP)
SimState (singleton) ; SimEvent (append-only) ; KpiSnapshot (one per simDay)
```

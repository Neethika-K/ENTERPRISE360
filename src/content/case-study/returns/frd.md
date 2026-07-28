# Functional Requirements Document

**Project:** Reverse Logistics & Returns · **Companion to:** BRD

Each requirement is implemented by the returns rule in the simulation engine and is
observable on the dashboards and in the system log. IDs are referenced by the
Requirements Traceability Matrix.

## FR-RT-1 · Return generation
**Trigger:** an advanced day.
**Behavior:** order lines belonging to orders fulfilled exactly `RETURN_LAG` (3) days ago
are candidates; each returns with a seeded probability (~10%). A `Return` row is created
recording the order, product, and quantity.
**Output:** a `Return`; a `return_created` log event.

## FR-RT-2 · Restock resolution
**Trigger:** a return resolved as `restock` (seeded ~70%).
**Behavior:** the returned quantity is added back to the item's on-hand inventory.
**Output:** increased stock; a `return_restocked` log event.

## FR-RT-3 · Write-off resolution
**Trigger:** a return resolved as `writeoff` (seeded ~30%).
**Behavior:** the goods are not returned to stock (value lost).
**Output:** a `return_writeoff` log event; inventory unchanged.

## FR-RT-4 · Customer refund
**Trigger:** any return.
**Behavior:** issue a paid refund invoice equal to the returned units' original sale
value; the refund reduces the company's cash position.
**Output:** a paid `customer_refund` invoice; a `refund_issued` log event.

## FR-RT-5 · Return & refund KPIs
**Trigger:** end-of-day KPI snapshot.
**Behavior:** compute return rate (cumulative returns ÷ cumulative fulfilled lines) and
cumulative refund value; cash position subtracts paid refunds.
**Output:** `returnRate` and `refundsValue` on the daily snapshot; a return-rate card on
Sales and a refunds card on Finance.

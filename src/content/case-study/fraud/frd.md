# Functional Requirements Document

**Project:** Order Risk Review & Fraud Control · **Companion to:** BRD

Each requirement is implemented by the risk-review rule in the simulation engine and is
observable on the dashboards and in the system log. IDs are referenced by the
Requirements Traceability Matrix.

## FR-FR-1 · Flag & hold risky orders
**Trigger:** a new order created today.
**Behavior:** at a seeded rate, mark the order held for review (`reviewStatus = held`).
Held orders are excluded from fulfilment.
**Output:** a held order; an `order_flagged` log event.

## FR-FR-2 · Gate fulfilment
**Trigger:** the fulfilment step.
**Behavior:** orders in the `held` state are skipped — no stock leaves until review.
**Output:** held orders remain unfulfilled (regression-tested).

## FR-FR-3 · Review held orders
**Trigger:** a held order on the following day.
**Behavior:** at a seeded rate the order is **cleared** (becomes fulfillable) or
**rejected** (cancelled, never fulfilled). Cleared risky orders are seeded as fraudulent
or not.
**Output:** cleared/rejected order; `order_cleared` / `order_rejected` log events.

## FR-FR-4 · Chargebacks for fraud that slipped through
**Trigger:** a fraudulent, cleared, fulfilled order reaching the chargeback lag.
**Behavior:** raise one chargeback for the order total; it reduces cash.
**Output:** a `Chargeback`; a `chargeback` log event.

## FR-FR-5 · Risk KPIs & correct accounting
**Trigger:** end-of-day KPI snapshot.
**Behavior:** track orders currently held and cumulative chargeback value; cash subtracts
chargebacks. Revenue and COGS are recognized on the day an order is invoiced/fulfilled, so
held-then-cleared orders are accounted correctly.
**Output:** `ordersHeld` + `chargebacksValue` on the snapshot; a Risk panel on Finance and
a Chargebacks tile on Executive.

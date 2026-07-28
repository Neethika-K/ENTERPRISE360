# Sprint Plan — Enterprise360

Each business problem was delivered as an independent sprint, following one repeatable
pattern: schema → test-first rule → KPIs → selectors → dashboard → case study → verify.
Working, demoable software at the end of every sprint.

## Sprint 0 — MVP (Inventory → Procurement)
**Goal:** prove the connected-system thesis end-to-end on one flagship loop.
- Simulation engine (seeded, deterministic, transactional tick) with per-rule TDD.
- Order-to-Cash × Procure-to-Pay: demand → fulfil/backorder → reorder → approve → PO →
  receive → finance → KPI snapshot.
- Five dashboards + a system-log event feed; the first BA case study.

## Sprint 1 — Customer Service → NPS
**Goal:** show an upstream supplier miss rippling to customer sentiment.
- Support tickets from backorders and late deliveries; resolution with CSAT; NPS roll-up.
- Customer Service dashboard + an Executive NPS tile.
- Case-study hub refactored into a multi-problem library; CS case study.

## Sprint 2 — Returns → Reverse Logistics
**Goal:** model the tail of a sale — returns, restock/write-off, refunds.
- Returns from recently fulfilled lines; restock or write-off; refunds reduce cash.
- Return-rate on Sales, refunds on Finance; Returns case study.

## Sprint 3 — Fraud → Risk Review
**Goal:** add a control point that gates the order flow.
- Flag → hold → next-day review (clear/reject); chargebacks for fraud that slips through.
- Fulfilment guard + fulfilment-day accounting fix; Risk panel on Finance; Fraud case study.

## Sprint 4 — Delivery Artifacts
**Goal:** complete the PM/Agile story for the portfolio.
- Charter, RAID Log, Status Report, Roadmap, Sprint Plan, Retrospective — rendered in-site.

## Working agreements

- Test-first for all engine logic; determinism is a release gate.
- Each sprint ships independently and is committed in small, reviewable steps.
- New simulation rules append to the pipeline in a fixed RNG draw order to preserve replay.

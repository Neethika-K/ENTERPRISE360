# Project Charter — Enterprise360

**Sponsor:** Portfolio owner · **Delivery lead:** Business Analyst / PM · **Status:** Active

## Vision

Build a **digital enterprise simulation** — a fictional omnichannel retailer that actually
runs — where a single business event ripples across every department. The goal is a
portfolio piece that demonstrates how an enterprise operates as *one connected system*,
not a collection of disconnected SQL-and-dashboard exercises.

## Objectives

1. Prove the connected-system thesis end-to-end on real, running mechanics (not slideware).
2. Cover Business Analysis, Product, Operations, and PM/Agile skills against **one**
   coherent business, so any of them can be discussed from a single project.
3. Ship something **finishable and demoable** — deterministic, replayable, and runnable
   locally with no cloud accounts.

## Scope

**In scope (delivered):** a deterministic simulation engine advanced day-by-day; four
connected business problems — Inventory→Procurement, Supplier Delay→Customer Service→NPS,
Returns→Reverse Logistics, and Fraud→Risk Review; department dashboards; a Business
Analysis case-study library; and these PM/Agile delivery artifacts.

**Out of scope (roadmap):** additional departments and problems, multi-industry variants,
predictive/ML features, and public cloud hosting.

## Stakeholders

| Stakeholder | Role |
|---|---|
| Portfolio owner / sponsor | Sets the goal; the audience is recruiters and interviewers |
| Business Analyst | Requirements, case studies, traceability |
| Product / Operations | Simulation rules and KPIs |
| Engineering | Build, tests, determinism, deployment path |

## Milestones

- **M0 — MVP:** the flagship Inventory→Procurement loop, five dashboards, one case study.
- **M1 — Customer Service → NPS:** first library expansion.
- **M2 — Returns:** reverse logistics.
- **M3 — Fraud / Risk Review:** the order-flow gate.
- **M4 — Delivery artifacts:** PM/Agile package (this).

## Success Criteria

- All simulation logic is deterministic and covered by tests; the app builds clean.
- A visitor can watch a supplier miss ripple to customer sentiment, a return refund cash,
  and a fraud attempt get gated — all traceable in one system log.
- Every requirement maps to a working feature in a traceability matrix.

## Constraints & Assumptions

Local-first on SQLite; visitor-driven (no always-on process); seeded determinism; a
curated set of hero products for legibility.

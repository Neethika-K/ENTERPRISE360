# Quickstart: Enterprise360 MVP

A run-and-validate guide proving the feature works end-to-end, locally, with no
cloud accounts. Implementation code lives in the repo and in the task plan
(a separate implementation plan (not published here)); this guide only runs
and checks it. See [data-model.md](./data-model.md) and
[contracts/](./contracts/) for interface details.

## Prerequisites
- Node.js 20+ and npm
- No database server, no accounts — the app uses a local SQLite file

## Setup
```bash
npm install
cp .env.example .env          # contains DATABASE_URL="file:./dev.db"
npx prisma migrate dev        # creates prisma/dev.db and applies the schema
npm run db:seed               # loads 5–8 hero products, suppliers, customers, tuned stock
```

## Run
```bash
npm run dev                   # development, http://localhost:3000
# or, production mode:
npm run build && npm start
```

## Automated validation (engine)
```bash
npm test
```
Expected: all pass, including
- `rng.test.ts` — same seed+day reproduces identical values (determinism unit).
- `rules/*.test.ts` — each rule behaves per its acceptance rule (demand,
  fulfil/backorder, reorder, approval, procurement, receiving, finance, KPIs).
- `engine.test.ts` — determinism (same seed ⇒ identical event stream) and the
  golden path (a reorder → PR → PO → receipt cascade occurs within ~12 days).

Maps to spec **SC-004** (deterministic replay) and **FR-002…FR-008, FR-012**.

## Manual validation (UI) — the core demo
From `http://localhost:3000`:

1. **Landing (FR-015)** — the landing page explains the concept and links to the
   simulation and the case study, and notes what is out of scope. ✅ if both links
   work and the roadmap note is present.
2. **Advance the cascade (User Story 1 / SC-001)** — open the dashboard, click
   **Advance Day** ~10 times (or **Fast-forward +7**). Confirm: inventory drops on
   the Inventory page; a LOW indicator appears; the Procurement page shows a
   purchase request, then a purchase order with an ETA; on the ETA day inventory
   replenishes; the activity feed narrates each step in causal order.
3. **Connected dashboards (User Story 2 / SC-002)** — open Executive, Sales,
   Inventory, Procurement, Finance. Confirm the numbers are mutually consistent and
   change as days advance (e.g., Finance revenue matches Sales activity; Inventory
   matches reorder/receipt events).
4. **Delay edge case** — after enough days, confirm at least one purchase order is
   flagged **delayed** on the Procurement page with a pushed-out ETA.
5. **Case study (User Story 3 / SC-003)** — open **Case Study**; confirm all five
   deliverables (BRD, FRD, User Stories, Process Flow with a rendered diagram, RTM)
   are reachable, and the RTM maps requirements to delivered features.
6. **Reset & replay (User Story 4 / SC-004)** — click **Reset**; confirm day
   returns to 0 with starting stock and no open orders/PRs/POs. Advance again and
   confirm the first day's events match the previous run.

## Success signals
- Engine test suite green (determinism + golden path).
- The full demand → shortage → replenishment → arrival → restock cascade is
  visible within the first several advances without guidance (**SC-001**).
- Dashboard figures are traceable to the activity feed (**SC-002**).
- Runs entirely on one machine with no external accounts (**SC-006**).

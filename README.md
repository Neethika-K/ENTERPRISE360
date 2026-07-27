# Enterprise360 — Operations Console

A digital enterprise simulation: a fictional omnichannel retail company you operate
one simulated day at a time. Advancing the day runs a deterministic business-rule
pipeline where a single customer order ripples across **Sales → Inventory →
Procurement → Warehouse → Finance**, with every cause and effect written to a live
system log and five connected dashboards. A built-in Business Analysis case study
(BRD, FRD, user stories, process flow, and a Requirements Traceability Matrix)
documents the flagship problem: *inventory shortage → procurement*.

Runs entirely on your machine over a local SQLite file — no cloud accounts, no
hosted database.

## Tech stack

Next.js 16 (App Router, TypeScript) · Prisma 6 + SQLite · Tailwind v4 ·
Recharts · react-markdown + Mermaid · Vitest.

## Local setup

Requires Node.js 20+.

```bash
npm install
cp .env.example .env          # DATABASE_URL="file:./dev.db"
npx prisma migrate dev        # creates prisma/dev.db and applies the schema
npm run db:seed               # loads 6 hero SKUs, 3 suppliers, 4 customers, tuned stock
```

## Run

```bash
npm run dev                   # development → http://localhost:3000
# or production mode:
npm run build && npm start
```

Open `http://localhost:3000`, press **Advance Day** (or **Fast-forward +7**), and
watch the loop play out. **Reset** returns the company to day 0.

## Tests

```bash
npm test
```

The simulation engine is built test-first: unit tests per rule module plus
determinism and golden-path integration tests. Tests use an isolated `prisma/test.db`
and run sequentially (SQLite has a single writer).

## How the simulation works

Each day advances through a fixed, transactional 8-stage pipeline:

1. **Demand** — generate customer orders (with occasional spikes)
2. **Fulfilment** — fill from stock or backorder (whole-line)
3. **Reorder** — raise a purchase request when on-hand + incoming < reorder point
4. **Approval** — auto-approve under a cost threshold, else hold for review
5. **Procurement** — place a PO against the supplier's lead time (delays possible)
6. **Receiving** — replenish stock when a PO arrives
7. **Finance** — record revenue and cost (instant settlement in this release)
8. **KPI snapshot** — capture one row of company metrics for the day

Randomness is seeded per day (`hash(seed, day)`), so the simulation is fully
deterministic and replayable — the same starting point always produces the same
events.

## Deploying to the cloud later

This release is local-first on SQLite. To host it publicly, switch the Prisma
datasource to PostgreSQL (e.g. Neon or Supabase) and deploy to a host such as
Vercel — the application logic is unchanged. This is intentionally out of scope
for the current build.

## Scope

**In scope:** the connected inventory-to-procurement loop across Sales, Inventory,
Procurement, Warehouse, and Finance; five dashboards; one full BA case study.

**Future roadmap (not built):** additional departments (HR, Marketing, IT), more
business problems, multi-industry variants, and predictive/ML features.

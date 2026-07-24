# Implementation Plan: Enterprise360 MVP — Inventory-to-Procurement Simulation

**Branch**: `001-enterprise360-mvp` | **Date**: 2026-07-24 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/001-enterprise360-mvp/spec.md`

## Summary

Enterprise360 is a single web application that simulates a fictional omnichannel
retail company. A visitor advances simulated time one day (or several days) at a
time; each advance runs a deterministic, transactional business-rule pipeline
that generates demand, fulfils or backorders it, raises and approves
replenishment requests, places and receives supplier orders, records finance, and
snapshots KPIs — writing a plain-language event log the UI narrates. Five
department dashboards read the resulting state, and an in-site case study presents
the business-analysis deliverables with a requirements traceability matrix.
Everything runs locally on a single machine over a SQLite file — no cloud
accounts, no background workers.

## Technical Context

**Language/Version**: TypeScript 5.x, Node.js 20+

**Primary Dependencies**: Next.js 15 (App Router), Prisma ORM 5+, Tailwind CSS,
Recharts (charts), react-markdown + remark-gfm (case-study rendering), Mermaid
(process diagram), a small `mulberry32` seeded PRNG (implemented in-repo)

**Storage**: Local SQLite file (`prisma/dev.db`) via Prisma. No hosted database.
SQLite/Prisma constraints: no `enum` types (status/type columns are `String`) and
no `Json` scalar (`SimEvent.payload` stores stringified JSON in a `String`
column).

**Testing**: Vitest for the simulation engine (unit tests per rule module +
determinism and golden-path integration tests against a real seeded DB)

**Target Platform**: Local developer machine (macOS), served at
`http://localhost:3000` via `npm run dev` or `npm run build && npm start`

**Project Type**: Web application (single Next.js app; frontend + server actions
+ engine co-located)

**Performance Goals**: Interactive — a single day advance completes well within a
normal request/interaction (single local user; no throughput target). Fast-forward
advances up to a small capped number of days (≤30) per action.

**Constraints**: Determinism is mandatory (per-day seeding `hash(seed, day)`,
never a global RNG stream); every tick is atomic (one DB transaction); every
state change writes an event-log row. Local-only, no external services. Visitor
is anonymous — no auth, roles, or multi-user concurrency.

**Scale/Scope**: 5–8 hero products, ~12 database tables (9 domain + 3 sim
infrastructure), 8 rule modules, 5 dashboards, 1 case study (5 deliverables).

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

Evaluated against `.specify/memory/constitution.md` v1.0.0:

- **I. Deterministic Simulation** — ✅ Plan mandates per-day independent seeding,
  atomic per-tick transaction, and reproducible replay; determinism is an explicit
  test target (Phase 0 research + engine tests).
- **II. Test-First for the Engine** — ✅ Each rule module and the orchestrator are
  built test-first (Vitest); no engine code is "done" without passing covering
  tests. Reflected in the task ordering.
- **III. Scope Discipline (YAGNI)** — ✅ Exactly one flagship problem, fixed table
  and dashboard ceilings; all other departments/problems/variants and cloud
  hosting are explicit future roadmap only.
- **IV. Connected-System Traceability** — ✅ Event log on every state change, a
  narrating activity feed, and a Requirements Traceability Matrix mapping each FR
  to a delivered feature (case-study deliverable).
- **V. Local-First Simplicity** — ✅ Single Next.js app over local SQLite, no cloud
  accounts or workers; documented simplifications (instant payment, whole-PO
  receipt, whole-line fulfilment); distinctive designed UI as a deliverable.

**Result: PASS.** No violations; Complexity Tracking table intentionally omitted.

## Project Structure

### Documentation (this feature)

```text
specs/001-enterprise360-mvp/
├── plan.md              # This file (plan document)
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output (tick + read-side interface contracts)
│   ├── tick-actions.md
│   └── read-selectors.md
└── tasks.md             # Phase 2 output (tasks — NOT created here)
```

The detailed, step-by-step engineering plan (bite-sized TDD tasks with full code)
already exists at a separate implementation plan (not published here) and is
the execution-ready source; this specification plan and its artifacts are the
technology-level design view derived from the same design.

### Source Code (repository root)

```text
prisma/
├── schema.prisma        # 12 tables (9 domain + 3 sim infra); String enums; String payload
├── migrations/
└── seed.ts              # 5–8 hero products, 3 suppliers, 4 customers, tuned inventory; exports runSeed()

src/
├── lib/
│   ├── db.ts            # Prisma client singleton
│   ├── kpi-selectors.ts # read-side dashboard queries (write/read separation)
│   └── sim/
│       ├── types.ts     # TickContext, SimEventInput, RuleFn
│       ├── rng.ts       # mulberry32 + hashSeed(seed, day)
│       ├── events.ts    # pushEvent helper
│       ├── engine.ts    # runTick(), resetSimulation() — one transaction, fixed pipeline
│       └── rules/       # demand, fulfillment, reorder, approval, procurement, receiving, finance, kpis
├── app/
│   ├── layout.tsx  page.tsx            # shell + landing/pitch
│   ├── actions/tick.ts                 # 'use server' advanceDay / advanceDays / resetSim
│   ├── api/tick/route.ts               # optional POST wrapper
│   ├── dashboard/{layout,executive,sales,inventory,procurement,finance}/
│   └── case-study/{layout,page,[slug],rtm}/
├── components/
│   ├── dashboard/{KpiCard,TrendChart,EventFeed,TickControls}.tsx
│   └── case-study/{Mermaid,TraceabilityTable}.tsx
└── content/case-study/  # brd.md, frd.md, user-stories.md, process-flow.md, rtm.ts

tests/sim/
├── rng.test.ts
├── harness.ts
├── rules/*.test.ts      # one per rule module
└── engine.test.ts       # determinism + golden-path integration
```

**Structure Decision**: Single web application (Option 2 collapsed into one
Next.js app). Frontend, server actions, and the simulation engine are co-located
in one repo because the tick logic is invoked directly by Server Actions and read
by Server Components — no separate backend service is warranted. Write-side
(engine) and read-side (`kpi-selectors.ts`) are kept in separate modules for
testability, satisfying the "clear boundaries" design guidance.

## Complexity Tracking

No constitution violations — section intentionally omitted.

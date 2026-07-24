---
description: "Task list for Enterprise360 MVP — Inventory-to-Procurement Simulation"
---

# Tasks: Enterprise360 MVP — Inventory-to-Procurement Simulation

**Input**: Design documents from `specs/001-enterprise360-mvp/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: Engine tests ARE included — Constitution Principle II ("Test-First for
the Engine") requires TDD for the simulation rules and orchestrator. UI and
content are validated manually via quickstart.md.

**Organization**: Tasks are grouped by user story (US1–US4) for independent
implementation and testing.

**Note**: A fully code-complete companion plan (bite-sized TDD steps with full
source) exists at a separate implementation plan (not published here). This
file is the specification view, organized by user story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies on incomplete tasks)
- **[Story]**: US1–US4 (setup/foundational/polish tasks carry no story label)

## Path Conventions

Single Next.js web app at repository root: `src/`, `prisma/`, `tests/`.

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and tooling.

- [ ] T001 Scaffold Next.js app (App Router, TypeScript, Tailwind, src dir) in the repo root, producing `package.json`, `tsconfig.json`, `next.config.ts`, `tailwind.config.ts`, `src/app/layout.tsx`, `src/app/page.tsx`
- [ ] T002 [P] Install runtime + dev dependencies (prisma, @prisma/client, recharts, react-markdown, remark-gfm, mermaid; -D vitest, tsx, @types/node) into `package.json`
- [ ] T003 [P] Create `vitest.config.ts` (node env, `tests/**/*.test.ts`, `@` alias) and add npm scripts (`test`, `db:seed`, `db:reset`, hardened `build`) to `package.json`
- [ ] T004 [P] Create `.env.example` with `DATABASE_URL="file:./dev.db"` and add `.env`, `prisma/dev.db*` to `.gitignore`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Database, ORM, seed data, and simulation scaffolding that every user
story depends on.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [ ] T005 Configure Prisma SQLite datasource + generator in `prisma/schema.prisma` and create the Prisma client singleton in `src/lib/db.ts`; create local `.env` and run `npx prisma db push` to validate connectivity
- [ ] T006 Define the full schema (12 tables: Product, Supplier, Customer, Order, OrderLine, Inventory, PurchaseRequest, PurchaseOrder, PurchaseOrderLine, Invoice, SimState, SimEvent, KpiSnapshot; String status/type columns, String `payload`) in `prisma/schema.prisma` and run `npx prisma migrate dev --name init_schema`
- [ ] T007 Write `prisma/seed.ts` (6 hero products, 3 suppliers, 4 customers, inventory tuned just above reorder points, `SimState` day 0), export `runSeed`, guard direct-run; run `npm run db:seed` and verify row counts
- [ ] T008 [P] Create simulation types (`TickContext`, `SimEventInput`, `RuleFn`) in `src/lib/sim/types.ts`
- [ ] T009 [P] Create the `pushEvent` helper in `src/lib/sim/events.ts`
- [ ] T010 [P] Implement the seeded PRNG (`hashSeed`, `makeRng`, `randInt`, `chance`) in `src/lib/sim/rng.ts` and its determinism test in `tests/sim/rng.test.ts` (write test first, confirm fail, then pass)
- [ ] T011 [P] Create the shared engine test harness (`inRollbackTx`, `ctxFor`, `seedMinimal`) in `tests/sim/harness.ts`
- [ ] T012 Add the nav shell + placeholder landing (`src/components/Nav.tsx`, wire into `src/app/layout.tsx`, `src/app/page.tsx`) and verify `npm run build`

**Checkpoint**: Schema, seed, RNG, and sim scaffolding ready — user stories can begin.

---

## Phase 3: User Story 1 - Advance the day and watch the cascade (Priority: P1) 🎯 MVP

**Goal**: A visitor advances the simulated day and sees demand → fulfil/backorder
→ reorder → approval → supplier order → arrival → restock, narrated by an activity
feed. (spec FR-001…FR-009, FR-012)

**Independent Test**: From a fresh seed, advance several days and confirm the
activity feed shows the full cascade and stock levels change accordingly.

### Tests for User Story 1 (write FIRST, ensure they FAIL before implementation) ⚠️

- [ ] T013 [P] [US1] Demand-rule test in `tests/sim/rules/demand.test.ts`
- [ ] T014 [P] [US1] Fulfillment-rule test in `tests/sim/rules/fulfillment.test.ts`
- [ ] T015 [P] [US1] Reorder-rule test in `tests/sim/rules/reorder.test.ts`
- [ ] T016 [P] [US1] Approval-rule test in `tests/sim/rules/approval.test.ts`
- [ ] T017 [P] [US1] Procurement-rule test in `tests/sim/rules/procurement.test.ts`
- [ ] T018 [P] [US1] Receiving-rule test in `tests/sim/rules/receiving.test.ts`
- [ ] T019 [P] [US1] Finance-rule test in `tests/sim/rules/finance.test.ts`
- [ ] T020 [P] [US1] KPI-snapshot-rule test in `tests/sim/rules/kpis.test.ts`

### Implementation for User Story 1

- [ ] T021 [P] [US1] Implement demand generation in `src/lib/sim/rules/demand.ts` (fixed draw order; emit `order_placed`/`demand_spike`)
- [ ] T022 [P] [US1] Implement fulfil/backorder (whole-line) in `src/lib/sim/rules/fulfillment.ts`
- [ ] T023 [P] [US1] Implement reorder-point detection (no-duplicate) in `src/lib/sim/rules/reorder.ts`
- [ ] T024 [P] [US1] Implement PR approval (threshold + review delay) in `src/lib/sim/rules/approval.ts`
- [ ] T025 [P] [US1] Implement PR→PO placement (lead time + seeded delay) in `src/lib/sim/rules/procurement.ts`
- [ ] T026 [P] [US1] Implement PO receiving/replenishment in `src/lib/sim/rules/receiving.ts`
- [ ] T027 [P] [US1] Implement instant AR/AP invoicing (idempotent) in `src/lib/sim/rules/finance.ts`
- [ ] T028 [P] [US1] Implement per-day KPI snapshot (upsert) in `src/lib/sim/rules/kpis.ts`
- [ ] T029 [US1] Implement the tick orchestrator `runTick()` + `resetSimulation()` (single transaction, fixed 8-stage pipeline, event flush with sequence, stringified payload) in `src/lib/sim/engine.ts` (depends on T021–T028)
- [ ] T030 [US1] Add determinism + golden-path integration test (reseed in-process via `runSeed`, same seed ⇒ identical events, cascade within ~12 days) in `tests/sim/engine.test.ts`; run `npm test` green
- [ ] T031 [US1] Implement tick Server Actions `advanceDay()`, `advanceDays(n)` (capped fast-forward), `resetSim()` in `src/app/actions/tick.ts` and optional `POST` wrapper in `src/app/api/tick/route.ts` (contracts/tick-actions.md)
- [ ] T032 [US1] Implement `<TickControls />` (Advance Day / Fast-forward +7 / Reset, pending state) in `src/components/dashboard/TickControls.tsx`
- [ ] T033 [US1] Implement `<EventFeed />` (day-ordered, plain-language) in `src/components/dashboard/EventFeed.tsx`
- [ ] T034 [US1] Implement `getRecentEvents(limit)` read selector in `src/lib/kpi-selectors.ts`
- [ ] T035 [US1] Add a minimal advance-and-narrate page (temporary executive route rendering `<TickControls />` + `<EventFeed />`) at `src/app/dashboard/executive/page.tsx` and verify the cascade end-to-end manually

**Checkpoint**: The core cascade is live and narrated — MVP is demonstrable.

---

## Phase 4: User Story 2 - Read the connected dashboards (Priority: P1)

**Goal**: Executive, Sales, Inventory, Procurement/Warehouse, and Finance
dashboards show consistent, up-to-date figures and trends. (spec FR-010, SC-002)

**Independent Test**: After advancing several days, each dashboard's figures are
internally consistent and change as days advance.

### Implementation for User Story 2

- [ ] T036 [US2] Complete read selectors (`getLatestKpi`, `getKpiTrend`, `getInventoryStatus`, `getOpenProcurement`, `getSalesSummary`) in `src/lib/kpi-selectors.ts` (contracts/read-selectors.md)
- [ ] T037 [P] [US2] Implement `<KpiCard />` in `src/components/dashboard/KpiCard.tsx`
- [ ] T038 [P] [US2] Implement `<TrendChart />` (Recharts) in `src/components/dashboard/TrendChart.tsx`
- [ ] T039 [US2] Establish the distinctive visual identity: design tokens in `src/app/globals.css` and restyle `src/components/Nav.tsx` + `src/app/layout.tsx`
- [ ] T040 [US2] Implement the dashboard shell (sub-nav + `<TickControls currentDay>`) in `src/app/dashboard/layout.tsx`
- [ ] T041 [P] [US2] Implement the Executive dashboard (finalize) in `src/app/dashboard/executive/page.tsx`
- [ ] T042 [P] [US2] Implement the Sales dashboard in `src/app/dashboard/sales/page.tsx`
- [ ] T043 [P] [US2] Implement the Inventory dashboard (stock vs reorder point) in `src/app/dashboard/inventory/page.tsx`
- [ ] T044 [P] [US2] Implement the Procurement/Warehouse dashboard (open PRs/POs, delay flag) in `src/app/dashboard/procurement/page.tsx`
- [ ] T045 [P] [US2] Implement the Finance dashboard in `src/app/dashboard/finance/page.tsx`

**Checkpoint**: All five dashboards render coherent, advancing data.

---

## Phase 5: User Story 3 - Explore the business-analysis case study (Priority: P2)

**Goal**: A reachable Case Study section presents BRD, FRD, user stories, a process
diagram, and an RTM mapping requirements to features. (spec FR-013, FR-014, SC-003)

**Independent Test**: From the nav, open Case Study and confirm all five
deliverables are reachable and the RTM maps requirements to delivered features.

### Implementation for User Story 3

- [ ] T046 [P] [US3] Author the BRD in `src/content/case-study/brd.md`
- [ ] T047 [P] [US3] Author the FRD (FR-1…FR-N mapped to engine rules) in `src/content/case-study/frd.md`
- [ ] T048 [P] [US3] Author user stories + acceptance criteria in `src/content/case-study/user-stories.md`
- [ ] T049 [P] [US3] Author the process-flow doc with a Mermaid swimlane in `src/content/case-study/process-flow.md`
- [ ] T050 [US3] Implement the `<Mermaid />` client renderer in `src/components/case-study/Mermaid.tsx`
- [ ] T051 [US3] Implement the case-study layout, index, and markdown `[slug]` renderer in `src/app/case-study/layout.tsx`, `src/app/case-study/page.tsx`, `src/app/case-study/[slug]/page.tsx`
- [ ] T052 [US3] Implement the RTM: data in `src/content/case-study/rtm.ts`, `<TraceabilityTable />` in `src/components/case-study/TraceabilityTable.tsx`, page at `src/app/case-study/rtm/page.tsx`

**Checkpoint**: The full case study is reachable and the RTM traces requirements.

---

## Phase 6: User Story 4 - Reset and replay (Priority: P3)

**Goal**: A visitor resets to the starting state and replays deterministically.
(spec FR-011, FR-012, SC-004)

**Independent Test**: Advance, reset (returns to day 0 with starting stock, no open
orders/PRs/POs), advance again — first-day events match the previous run.

### Implementation for User Story 4

- [ ] T053 [US4] Verify/complete `resetSimulation()` + `resetSim()` semantics (clear transactions, reseed master data + starting inventory via `runSeed`, `currentDay = 0`) in `src/lib/sim/engine.ts` and `src/app/actions/tick.ts`; confirm the Reset button returns the UI to day 0
- [ ] T054 [US4] Add an explicit reset-then-replay assertion (reset ⇒ advancing the same days reproduces identical events) to `tests/sim/engine.test.ts`; run `npm test` green

**Checkpoint**: Reset and deterministic replay verified.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Finishing touches across stories.

- [ ] T055 Finalize the landing page (concept pitch, links to simulation + case study, "future roadmap" out-of-scope note) in `src/app/page.tsx` (spec FR-015)
- [ ] T056 [P] Write `README.md` (local setup, run, and a "deploy to cloud later" note) and add `postinstall: prisma generate`
- [ ] T057 Responsive/visual polish pass across dashboard + case-study components
- [ ] T058 Run the full engine suite (`npm test`) and a production build (`npm run build`); confirm both green
- [ ] T059 Run the quickstart.md manual validation end-to-end (cascade, dashboards, delay, case study, reset/replay)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: no dependencies.
- **Foundational (Phase 2)**: depends on Setup; BLOCKS all user stories.
- **US1 (Phase 3)**: depends on Foundational. The MVP.
- **US2 (Phase 4)**: depends on Foundational; consumes the engine output from US1 to
  show meaningful data (its shell/components build independently, but a full demo
  needs US1). Independently testable against a seeded/advanced DB.
- **US3 (Phase 5)**: depends on Foundational only; largely independent (content +
  rendering). Can proceed in parallel with US1/US2.
- **US4 (Phase 6)**: depends on the engine + tick action from US1.
- **Polish (Phase 7)**: after all targeted stories.

### Within Each User Story

- Engine tests (US1) are written and FAIL before their rule implementations.
- Rules (T021–T028) before the orchestrator (T029).
- Selectors + shared components before dashboard pages (US2).
- Content authored before/with its renderers (US3).

### Parallel Opportunities

- Setup: T002, T003, T004 in parallel.
- Foundational: T008, T009, T010, T011 in parallel (after T005–T007).
- US1 tests T013–T020 all in parallel; rule impls T021–T028 all in parallel.
- US2 dashboard pages T041–T045 in parallel (after T036–T040).
- US3 content authoring T046–T049 in parallel.
- US3 can run in parallel with US1/US2 by a second contributor.

---

## Parallel Example: User Story 1

```bash
# Write all rule tests together (they must fail first):
Task: "Demand-rule test in tests/sim/rules/demand.test.ts"
Task: "Fulfillment-rule test in tests/sim/rules/fulfillment.test.ts"
Task: "Reorder-rule test in tests/sim/rules/reorder.test.ts"
# …through kpis.test.ts

# Then implement all rules together:
Task: "Implement demand generation in src/lib/sim/rules/demand.ts"
Task: "Implement fulfil/backorder in src/lib/sim/rules/fulfillment.ts"
# …through kpis.ts
```

---

## Implementation Strategy

### MVP First (User Story 1 only)

1. Complete Phase 1 (Setup) + Phase 2 (Foundational).
2. Complete Phase 3 (US1): the deterministic engine + tick + activity feed.
3. **STOP and VALIDATE**: advance from a fresh seed and watch the cascade narrate.
4. This alone demonstrates the whole thesis.

### Incremental Delivery

1. Setup + Foundational → foundation ready.
2. US1 → the narrated cascade (MVP). Validate.
3. US2 → the five connected dashboards. Validate.
4. US3 → the BA case study + RTM. Validate.
5. US4 → reset & deterministic replay. Validate.
6. Polish → landing, README, visual pass, full verification.

---

## Notes

- [P] = different files, no incomplete dependencies.
- [Story] label maps each task to its user story for traceability.
- Verify engine tests fail before implementing (Constitution II).
- Commit after each task or logical group.
- Stop at any checkpoint to validate a story independently.

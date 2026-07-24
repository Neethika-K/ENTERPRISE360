# Research: Enterprise360 MVP

All Technical Context items are resolved — there are no open NEEDS CLARIFICATION
markers. This document records the decisions and why they were chosen, so the
design is auditable.

## D1. Local database: SQLite

- **Decision**: A local SQLite file (`prisma/dev.db`) accessed via Prisma.
- **Rationale**: The feature must run on a single machine with zero external
  accounts or servers (Constitution V, spec SC-006). SQLite is a single file,
  needs no install or process, and Prisma supports it first-class. A future cloud
  deploy is a datasource swap, not a rewrite.
- **Alternatives considered**: Local PostgreSQL (Postgres.app/Docker) — keeps the
  schema identical for a later cloud move but adds install/run friction, rejected
  for the zero-setup goal; hosted Postgres (Neon/Supabase) — rejected as it
  requires accounts and is explicitly out of scope.

## D2. SQLite/Prisma type constraints: String enums, stringified JSON

- **Decision**: Status/type columns are `String` with valid values documented in
  schema comments; `SimEvent.payload` is a `String` holding `JSON.stringify(...)`.
- **Rationale**: SQLite via Prisma does not support `enum` types or the `Json`
  scalar. Using `String` keeps a single portable schema. Rule code already
  compares/assigns string literals, so this costs no logic changes.
- **Alternatives considered**: Native enums/`Json` (only available on Postgres) —
  rejected because it would forbid the chosen local database.

## D3. Determinism: per-day independent seeding

- **Decision**: Each simulated day derives its RNG from `hash(rng_seed, day)`
  (a `mulberry32` generator seeded by a cyrb-style hash), a fresh independent
  stream per day; draws within a day happen in a fixed, documented order.
- **Rationale**: Constitution I requires reproducible replay. Per-day independent
  seeding makes any day reproducible in isolation and makes reset/replay
  well-defined, unlike a single global mutable stream where replaying day N
  requires replaying 1…N-1 identically.
- **Alternatives considered**: One global seeded stream — rejected (fragile,
  couples every day to all prior draws); unseeded `Math.random()` — rejected
  (non-reproducible, violates Constitution I and SC-004).

## D4. Application framework & tick invocation: Next.js + Server Actions

- **Decision**: One Next.js (App Router) app. The tick runs as a Server Action
  (`advanceDay` / `advanceDays`); dashboards are Server Components reading state
  directly via Prisma. An optional `/api/tick` route wraps the same engine.
- **Rationale**: A single deployable app satisfies "one web app"; Server Actions
  remove the need for a separate REST layer or client-side data fetching; Server
  Components can query the DB at request time. Visitor-driven ticks need no worker
  or cron.
- **Alternatives considered**: Separate Express/Fastify API + SPA — rejected as
  unnecessary complexity for a single-user local demo; background scheduler for
  "always-on" time — rejected (spec mandates visitor-driven advance, no idle
  process).

## D5. Atomic tick: one database transaction

- **Decision**: The entire 8-stage pipeline for a day executes inside one Prisma
  `$transaction`; events are flushed and `sim_state.current_day` advanced within
  it.
- **Rationale**: Constitution I requires atomic ticks — a half-applied day would
  corrupt state and break determinism. A single transaction guarantees all-or-
  nothing.
- **Alternatives considered**: Per-stage commits — rejected (a mid-tick failure
  leaves inconsistent state).

## D6. Read/write separation

- **Decision**: The write-side engine (`lib/sim/*`) is separate from read-side
  dashboard queries (`lib/kpi-selectors.ts`); daily KPIs are denormalized into a
  `kpi_snapshots` table written once per tick.
- **Rationale**: Keeps rule-engine tests independent of dashboard shapes and lets
  trend charts read one snapshot row per day instead of re-aggregating full
  history on every page load.
- **Alternatives considered**: Dashboards re-aggregating raw tables each load —
  rejected (slower and couples read concerns into the engine).

## D7. Charting: Recharts

- **Decision**: Recharts for trend/line charts in dashboards.
- **Rationale**: React-native chart components fit the component model, are simple
  for the small number of charts needed, and require no external services (all
  client-side).
- **Alternatives considered**: D3 directly — rejected (more effort than warranted);
  a hosted charting service — rejected (external dependency, offline-hostile).

## D8. Case-study rendering: markdown + Mermaid

- **Decision**: BA docs authored as markdown in `src/content/case-study/*`,
  rendered as site pages with react-markdown + remark-gfm; the process/swimlane
  diagram is a Mermaid flowchart rendered client-side; the RTM is a structured
  data file rendered as a sortable table.
- **Rationale**: Keeps deliverables diffable and version-controlled as text while
  still being reachable in-site (spec FR-013/FR-014). Mermaid avoids an external
  diagram tool and keeps the diagram as text.
- **Alternatives considered**: Static PDF/image exports — rejected (not diffable,
  not reachable as live pages); an external diagram service — rejected (offline-
  hostile).

## D9. Testing approach: Vitest, engine-focused, TDD

- **Decision**: Vitest; each rule module has unit tests written before its code;
  the orchestrator has determinism and golden-path (reorder → PR → PO → receipt)
  integration tests against a real seeded SQLite DB, reseeded in-process via an
  exported `runSeed()`.
- **Rationale**: Constitution II mandates test-first for the engine (the core
  correctness surface). In-process reseeding avoids SQLite file-lock contention a
  subprocess reseed could cause.
- **Alternatives considered**: Manual verification only — rejected (violates
  Constitution II); mocking the DB in engine tests — rejected (the rules' behavior
  is inseparable from real relational reads/writes).

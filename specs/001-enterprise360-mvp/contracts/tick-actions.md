# Contract: Simulation Control (Server Actions)

These are the write-side interfaces the UI calls to drive the simulation. They are
Next.js Server Actions (invoked from client components) backed by the engine in
`src/lib/sim/engine.ts`. An optional `POST /api/tick` route wraps `runTick` for
programmatic/testing use.

## `advanceDay(): Promise<{ day: number; events: SimEvent[] }>`
- **Purpose**: Advance the simulation by exactly one day (spec FR-001).
- **Behavior**: Runs one atomic tick (the fixed 8-stage pipeline) in a single DB
  transaction; returns the new day number and that day's ordered event list so the
  UI can render the "what happened" feed. Revalidates the dashboard views.
- **Errors**: If the tick transaction fails, no state changes (atomic); the action
  surfaces the error and the day does not advance.

## `advanceDays(n: number): Promise<{ day: number }>`
- **Purpose**: Fast-forward several days at once (spec FR-001 clarification).
- **Behavior**: Runs `runTick` sequentially `n` times, each its own atomic tick;
  `n` is clamped to a small bound (1…30). Returns the final day. Revalidates the
  dashboard views.
- **Note**: Determinism holds — each day still derives its own seed from
  `hash(rngSeed, day)`, so the fast-forwarded sequence equals the same number of
  single advances.

## `resetSim(): Promise<void>`
- **Purpose**: Reset the company to its starting state (spec FR-011).
- **Behavior**: Clears transactional and sim tables, reseeds master data and
  starting inventory (via `runSeed()`), and sets `currentDay = 0`. Revalidates the
  dashboard views.
- **Guarantee (FR-012 / SC-004)**: After reset, advancing again from the same seed
  reproduces the same day-by-day event stream.

## Event shape (`SimEvent`)
Returned events expose at least: `simDay`, `sequence`, `eventType`, `message`, and
optionally `entityType`, `entityId`, and a parsed/stringified `payload`. Ordering
within a day follows `sequence`, which mirrors pipeline execution order (the causal
chain: order → inventory drop → reorder → PR → approval → PO → ship → receive →
KPIs).

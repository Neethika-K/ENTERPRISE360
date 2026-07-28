# Retrospective — Enterprise360

An honest look back across the MVP and the Phase-2 problems.

## What went well

- **Test-first engine.** Every simulation rule was written test-first; the determinism and
  golden-path integration tests caught real bugs early and made each new problem safe to add.
- **Determinism discipline.** Per-day seeding (`hash(seed, day)`) and appending new rules at
  the end of the pipeline kept replay stable across four problems — a supplier miss, a
  return, and a fraud hold all reproduce identically from the same start.
- **A repeatable pattern.** Schema → rule → KPIs → selectors → dashboard → case study became
  mechanical by the third problem, so each sprint shipped cleanly without redesign.
- **A distinctive design.** Committing to one "operations console" identity (ink-navy panels,
  signal amber/teal/red, IBM Plex + Space Grotesk) made the whole thing feel like one system.

## What was tricky

- **Prisma major-version drift.** The installed Prisma 7 removed `url` from the schema and
  required driver adapters; pinning to v6 kept the classic model the codebase assumed.
- **FK cleanup ordering.** Each new table with foreign keys broke the whole test suite until
  it was added — before its parents — to the three cleanup lists (test wipe, seed, reset).
- **Recharts + React 19.** Trend lines rendered invisibly until per-line mount animation was
  disabled.
- **Held-order accounting.** The fraud gate delays fulfilment by a day, so revenue and COGS
  had to be recognized on the fulfilment/invoice day rather than the order-creation day.
- **Chargeback rarity.** A fraudulent order must also be *fulfilled* (not backordered) to
  charge back, so rates needed tuning for the payoff to appear in a demo window.

## What to improve next time

- **Add end-to-end tests.** Only the engine is covered; the UI is verified manually. A
  Playwright suite would catch dashboard regressions automatically.
- **Deploy publicly.** Local-first was the right call to finish, but a live URL (Postgres +
  a host) would make the portfolio shareable with one link.
- **Watch scope.** The "connected system" vision is seductive; shipping one small, complete
  problem at a time is what kept it from sprawling.

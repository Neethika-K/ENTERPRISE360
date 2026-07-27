# User Stories & Acceptance Criteria

Written from the operator's and stakeholders' side of the screen. Each story maps
to functional requirements and is checked in the Requirements Traceability Matrix.

## US-1 · Never miss a reorder
**As an** Operations Manager, **I want** low-stock items to raise a purchase
request automatically **so that** I never run out because no one was watching.

- **Given** an item whose on-hand plus incoming stock is below its reorder point
  and which has no open request or order, **when** the day is advanced, **then** a
  pending purchase request for its replenishment quantity is created.
- **Given** an item already covered by an open request or order, **when** the day
  is advanced, **then** no duplicate request is created.

## US-2 · Approve the right requests without friction
**As** Procurement, **I want** small requests approved automatically and larger
ones reviewed **so that** routine restocking is fast and big spend still gets a look.

- **Given** a request below the value threshold, **when** the day is advanced,
  **then** it is approved automatically the same day.
- **Given** a request above the threshold, **when** the review period has elapsed,
  **then** it is approved and marked as manager-reviewed.

## US-3 · Order against realistic lead times
**As** Procurement, **I want** orders placed with the supplier's lead time **so
that** arrival dates are believable and delays are visible.

- **Given** an approved request, **when** the day is advanced, **then** a supplier
  order is placed with expected arrival = today + lead time.
- **Given** a supplier misses its reliability window, **then** the order is flagged
  delayed with a later arrival date.

## US-4 · Restock on arrival
**As an** Operations Manager, **I want** stock to increase when an order arrives
**so that** availability recovers automatically.

- **Given** a supplier order due today, **when** the day is advanced, **then** it is
  received, on-hand increases by the ordered quantity, and incoming decreases.

## US-5 · See fills and shortfalls
**As a** Sales lead, **I want** to see what was filled and what was backordered
**so that** I understand today's demand outcomes.

- **Given** stock covers a line, **then** it is filled and stock is reduced;
  **otherwise** it is recorded as backordered and surfaced on the Sales view.

## US-6 · Read the business at a glance
**As an** Executive, **I want** connected dashboards updated as we operate **so
that** I can trust the operating picture.

- **Given** several advanced days, **when** I open any dashboard, **then** its
  figures are current and consistent with the system log.

## US-7 · Reset and replay with confidence
**As a** demo operator, **I want** to reset and replay **so that** each viewing
starts clean and behaves the same way.

- **Given** an advanced simulation, **when** I reset, **then** it returns to day
  zero with starting stock and no open orders; **and** replaying from the same
  start reproduces the same first-day events.

## US-8 · Trace any number to its cause
**As a** stakeholder, **I want** every headline figure to be traceable **so that**
the reporting is credible.

- **Given** a KPI on a dashboard, **then** the system log shows the events that
  produced it, in the order they occurred.

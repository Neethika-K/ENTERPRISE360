# Feature Specification: Enterprise360 MVP — Inventory-to-Procurement Simulation

**Feature Branch**: `001-enterprise360-mvp`

**Created**: 2026-07-24

**Status**: Draft

**Input**: Derived from the approved design at the project design brief (no inline feature description was provided with the command).

## User Scenarios & Testing *(mandatory)*

Enterprise360 is an interactive demonstration of a fictional omnichannel retail
company. A visitor advances the company one simulated day at a time and watches a
single business event ripple across departments. The audience is recruiters and
interviewers evaluating the author's business-analysis, operations, and product
thinking; the value is a memorable, coherent story of "an enterprise as one
connected system."

### User Story 1 - Advance the day and watch the cascade (Priority: P1)

A visitor opens the company dashboard and repeatedly advances the simulated day.
With each advance, customer demand is generated, orders are fulfilled or
backordered, low stock triggers a replenishment request that is approved and
turned into a supplier order, and that order later arrives and restores stock — 
while a running activity feed narrates each step in the order it happened.

**Why this priority**: This is the core of the demonstration. Without the
advancing simulation and its visible cause-and-effect, there is no product. It is
the one slice that, alone, delivers the whole thesis.

**Independent Test**: Starting from a fresh company, advance the day several
times and confirm the activity feed shows demand → fulfilment/backorder → reorder
→ approval → supplier order → arrival → restock, and that stock levels and
headline numbers change accordingly.

**Acceptance Scenarios**:

1. **Given** a freshly started company, **When** the visitor advances one day,
   **Then** new customer orders appear, available stock decreases for the items
   ordered, and each change is listed in the activity feed for that day.
2. **Given** an item whose available stock has fallen below its reorder level,
   **When** the day is advanced, **Then** a replenishment request for that item is
   created and shown as pending or approved.
3. **Given** an approved replenishment request, **When** subsequent days are
   advanced past the supplier's lead time, **Then** the supplier order is marked
   received and the item's stock increases by the ordered quantity.
4. **Given** any advanced day, **When** the visitor reads the activity feed,
   **Then** the events are presented in the order they occurred and each is stated
   in plain business language.
5. **Given** a running company, **When** the visitor uses fast-forward,
   **Then** several days are advanced in sequence and the dashboards and activity
   feed reflect the cumulative result of those days.

### User Story 2 - Read the connected dashboards (Priority: P1)

A visitor reviews department dashboards — Executive, Sales, Inventory,
Procurement/Warehouse, and Finance — and sees consistent, up-to-date figures and
trends that reflect the current state of the simulated company and change as days
are advanced.

**Why this priority**: The dashboards are how the "connected system" claim is
made legible. They are co-equal with the simulation itself for the MVP's value.

**Independent Test**: After advancing several days, open each dashboard and
confirm its headline figures and trends are internally consistent with one
another and with the activity feed (e.g., revenue on Finance matches sales
activity; inventory levels match reorder/receipt events).

**Acceptance Scenarios**:

1. **Given** several advanced days, **When** the visitor opens the Inventory
   dashboard, **Then** each item's current stock is shown against its reorder
   level, with incoming replenishment quantities visible.
2. **Given** several advanced days, **When** the visitor opens the Executive
   dashboard, **Then** company-level trends (revenue, margin, cash, on-time
   delivery, backorders) are shown over the days simulated so far.
3. **Given** a day on which a supplier order was delayed, **When** the visitor
   opens the Procurement dashboard, **Then** that order is visibly flagged as
   delayed with its expected arrival day.

### User Story 3 - Explore the business-analysis case study (Priority: P2)

A visitor navigates to a "Case Study" section and reads the business-analysis
deliverables for the flagship problem: a business requirements document, a
functional requirements document, user stories with acceptance criteria, an
end-to-end process diagram, and a traceability matrix mapping each requirement to
the feature that implements it.

**Why this priority**: The case study is what turns a working demo into a
portfolio piece that showcases analysis skill. It is essential to the story but
can be read independently of, and after, the live simulation.

**Independent Test**: From the main navigation, open the Case Study section and
confirm all five deliverables are reachable and readable, and that the
traceability matrix links requirements to specific delivered features.

**Acceptance Scenarios**:

1. **Given** the site navigation, **When** the visitor selects "Case Study",
   **Then** they can reach each of the five deliverables from one index.
2. **Given** the traceability matrix, **When** the visitor reads a row, **Then**
   it names a requirement, its user story, its acceptance criteria, and the
   delivered feature that satisfies it.

### User Story 4 - Reset and replay (Priority: P3)

A visitor resets the simulation to its starting state and replays it, observing
that, from the same starting point, the sequence of events unfolds the same way.

**Why this priority**: Reset makes the demo safely repeatable for each new
viewer; deterministic replay reinforces credibility. Valuable but not required
for a first viewing.

**Independent Test**: Advance several days, reset, and confirm the company
returns to day zero with starting stock; advance again and confirm the first
day's events match the first run's first day.

**Acceptance Scenarios**:

1. **Given** an advanced simulation, **When** the visitor resets it, **Then** the
   company returns to its starting day and starting stock levels with no orders,
   requests, or supplier orders outstanding.
2. **Given** a reset company, **When** the visitor advances the same number of
   days again, **Then** the events produced match those of the previous run for
   the same days.

### Edge Cases

- **Insufficient stock**: when an order cannot be met from available stock, the
  affected order line is recorded as backordered rather than driving stock
  negative, and the shortfall is visible.
- **Duplicate replenishment**: when an item is already covered by an open
  replenishment request or an outstanding supplier order, no additional request
  is raised for it, even if it remains below its reorder level.
- **Supplier delay**: when a supplier misses its expected timing, the affected
  supplier order is marked delayed and its expected arrival day is pushed out,
  and this is reflected in procurement figures.
- **Approval hold**: when a replenishment request exceeds the automatic-approval
  value, it is held for a short review period before being approved, and its
  pending state is visible during that time.
- **No activity yet**: on a company that has not been advanced, dashboards and the
  activity feed present an empty but valid state rather than an error.

## Clarifications

### Session 2026-07-24

- Q: Should a visitor be able to advance multiple days at once (fast-forward), or only one day per click? → A: Both — keep single "Advance Day" and add a "Fast-forward" that advances several days at once (e.g. +7).

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST let a visitor advance the simulated company forward
  in time on demand — either one day at a time or by a fixed multi-day jump
  (fast-forward) — with time advancing only in response to that action.
- **FR-002**: On each advance, the system MUST generate new customer demand for a
  defined set of products and record the resulting orders.
- **FR-003**: The system MUST fulfil an order line when available stock covers it
  (reducing stock accordingly) and otherwise record it as backordered, never
  reducing stock below zero.
- **FR-004**: The system MUST detect when an item's available position (on hand
  plus incoming) falls below its reorder level and raise a replenishment request
  for the item's defined replenishment quantity, unless the item is already
  covered by an open request or outstanding supplier order.
- **FR-005**: The system MUST approve replenishment requests below a defined value
  automatically, and hold higher-value requests for a defined short review period
  before approving them.
- **FR-006**: The system MUST convert approved replenishment requests into
  supplier orders with an expected arrival day based on the supplier's lead time,
  and MUST sometimes reflect supplier unreliability as a delayed arrival.
- **FR-007**: The system MUST mark supplier orders as received when their expected
  arrival day is reached and increase the item's stock by the received quantity.
- **FR-008**: The system MUST record financial outcomes of daily activity
  (revenue from fulfilled sales, cost of goods, and supplier payments) sufficient
  to report company-level financial figures.
- **FR-009**: The system MUST record, for each advanced day, a plain-language,
  time-ordered log of every meaningful business event, and present that log to the
  visitor as an activity feed.
- **FR-010**: The system MUST present department dashboards — Executive, Sales,
  Inventory, Procurement/Warehouse, and Finance — that reflect the company's
  current state and its trends across the days simulated so far.
- **FR-011**: The system MUST let a visitor reset the company to its starting
  state, clearing all accumulated activity and returning to the starting day and
  starting stock.
- **FR-012**: From the same starting state, the system MUST produce the same
  sequence of daily events on replay (deterministic behavior).
- **FR-013**: The system MUST provide a Case Study section, reachable from the main
  navigation, containing a business requirements document, a functional
  requirements document, user stories with acceptance criteria, an end-to-end
  process diagram, and a requirements traceability matrix.
- **FR-014**: The traceability matrix MUST map each functional requirement to a
  user story, its acceptance criteria, and the delivered feature that satisfies
  it.
- **FR-015**: The system MUST present a landing page that explains the concept,
  links to the live simulation and the case study, and states which parts of the
  broader vision are intentionally out of scope for this version.

### Key Entities *(include if feature involves data)*

- **Product**: an item the company sells; has an identifier, a category, a selling
  price, a cost, a reorder level, a replenishment quantity, and a supplier.
- **Supplier**: a source of replenishment; has a name, a typical lead time, and a
  reliability characteristic that influences whether deliveries arrive on time.
- **Customer**: a buyer placing orders through a sales channel (store, website,
  app, wholesale).
- **Order / Order Line**: a customer purchase and its per-product lines; each line
  is either fulfilled or backordered.
- **Stock Position**: for each product, the quantity on hand and the quantity
  incoming from outstanding supplier orders.
- **Replenishment Request**: a raised need to restock an item; moves through
  pending → approved → converted (or is held for review).
- **Supplier Order**: a placed order to a supplier for a quantity of an item, with
  an expected and actual arrival day and a status (in transit, delayed, received).
- **Financial Record**: money owed to or by the company arising from sales and
  supplier orders, sufficient to report revenue, cost, and cash position.
- **Business Event**: a single recorded, plain-language occurrence within a day,
  ordered within that day, forming the activity feed and audit trail.
- **Daily Snapshot**: the set of company-level figures captured for each simulated
  day, used to show trends.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Starting from a fresh company, a visitor sees the full
  demand → shortage → replenishment → approval → supplier order → arrival →
  restock cascade play out within the first several day-advances (no more than 12),
  without any guidance.
- **SC-002**: After advancing several days, the figures shown across the five
  dashboards and the activity feed are mutually consistent (a visitor can trace any
  headline number back to the events that produced it).
- **SC-003**: A visitor can reach and read all five case-study deliverables from
  the main navigation, and every functional requirement appears in the
  traceability matrix mapped to a delivered feature.
- **SC-004**: Resetting and replaying the simulation from the same starting point
  reproduces the same first-day (and subsequent same-day) events every time.
- **SC-005**: A first-time visitor can understand what the project is and reach
  either the live simulation or the case study within one action from the landing
  page.
- **SC-006**: The demonstration runs end-to-end on a single personal computer with
  no external accounts or services required.

## Assumptions

- The audience is recruiters/interviewers and the author; there are no
  authenticated end-users, roles, or permissions in this version — any single
  visitor can advance and reset the simulation.
- Simulated time is measured in whole days advanced by the visitor; the company
  does not progress on its own in real time.
- The scope is exactly one flagship problem (inventory shortage → procurement)
  across Sales, Inventory, Procurement, Warehouse, and Finance. Other departments
  (HR, Marketing, IT), other business problems, multi-industry variants, and
  predictive/ML features are out of scope and are described only as a future
  roadmap.
- Financial handling is simplified for the demonstration: payments settle
  immediately on sale and on receipt, supplier orders arrive complete rather than
  in partial shipments, and an order line is fulfilled or backordered as a whole.
  These are deliberate simplifications, documented as such, not defects.
- The simulation runs on a small, curated set of products (roughly 5–8) so the
  cause-and-effect story stays legible, with starting stock tuned so the cascade
  appears quickly.
- The demonstration is intended to run locally on a personal computer for this
  version; public hosting is a possible future step and is out of scope here.

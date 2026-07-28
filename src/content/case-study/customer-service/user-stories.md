# User Stories & Acceptance Criteria

Written from the Customer Service team's and leadership's side of the screen. Each story
maps to functional requirements and is checked in the Requirements Traceability Matrix.

## US-CS-1 · Nothing falls through the cracks
**As a** Customer Service lead, **I want** a ticket raised automatically whenever a
customer is let down — a backorder or a late delivery — **so that** every affected
customer is on our radar without waiting for them to complain.

- **Given** an order backordered today, **when** the day is advanced, **then** an open
  `backorder` ticket exists for that customer.
- **Given** a purchase order that arrives after its expected date, **when** the day is
  advanced, **then** an open `late_delivery` ticket exists.

## US-CS-2 · Work the queue predictably
**As a** Customer Service agent, **I want** tickets to resolve within a handling window
**so that** the backlog reflects real, time-bounded work rather than growing forever.

- **Given** an open ticket, **when** its handling window has elapsed, **then** it is
  marked resolved with the resolution day recorded.
- **Given** an open ticket still inside its window, **when** the day is advanced,
  **then** it remains open.

## US-CS-3 · Capture how the customer felt
**As a** Customer Service lead, **I want** each resolution to carry a satisfaction score
**so that** we measure experience, not just throughput.

- **Given** a ticket is resolved, **then** it has a CSAT of 1–5, lower for long waits
  and for backorders.

## US-CS-4 · A sentiment number leadership trusts
**As an** Executive, **I want** NPS and CSAT rolled up daily **so that** I can watch
customer health next to revenue.

- **Given** resolved tickets, **when** the daily snapshot runs, **then** NPS, CSAT,
  open-ticket count, and average resolution time are recorded.

## US-CS-5 · See the ripple, trace the cause
**As an** Operations Manager, **I want** the Customer Service view and the Executive NPS
tile **so that** I can connect a sentiment dip to the supply problems behind it.

- **Given** several advanced days, **when** I open the Customer Service dashboard,
  **then** NPS/CSAT/backlog are current; **and** the Executive view shows the same NPS.

# User Stories & Acceptance Criteria

Written from the reverse-logistics, finance, and leadership perspectives. Each story maps
to functional requirements and is checked in the Requirements Traceability Matrix.

## US-RT-1 · Returns actually happen
**As a** Warehouse lead, **I want** returns to arrive from recent sales **so that** the
company models the real tail of every order, not just the sale.

- **Given** an order line fulfilled a few days ago, **when** the day is advanced,
  **then** it may become a return (recorded against its order and product).
- **Given** a line fulfilled today, **when** the day is advanced, **then** it is not yet
  a return candidate.

## US-RT-2 · Decide restock vs write-off
**As a** Warehouse lead, **I want** each return decided as restock or write-off **so
that** recoverable value goes back on the shelf and the rest is accounted for.

- **Given** a restock resolution, **then** the returned quantity is added to on-hand
  inventory.
- **Given** a write-off resolution, **then** inventory is unchanged.

## US-RT-3 · Refund the customer, honestly
**As** Finance, **I want** every return to refund the customer and reduce cash **so
that** the cash position reflects money actually returned.

- **Given** any return, **then** a paid refund invoice equal to the sale value exists,
  and cash position is reduced by refunds to date.

## US-RT-4 · See return rate against sales
**As a** Sales lead, **I want** return rate visible next to sales **so that** a rising
return trend is caught early.

- **Given** several advanced days, **when** I open Sales, **then** a return-rate figure
  and recent returns are shown.

## US-RT-5 · Protect margin from silent leakage
**As an** Executive, **I want** refunds tracked in Finance **so that** margin erosion
from returns is visible rather than hidden.

- **Given** refunds have been issued, **when** I open Finance, **then** cumulative
  refunds are shown and cash reflects them.

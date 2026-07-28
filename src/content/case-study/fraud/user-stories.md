# User Stories & Acceptance Criteria

Written from the risk, warehouse, finance, and leadership perspectives. Each story maps to
functional requirements and is checked in the Requirements Traceability Matrix.

## US-FR-1 · Hold the suspicious ones
**As a** Risk analyst, **I want** suspicious orders held before they ship **so that** we
have a chance to stop fraud instead of chasing it afterward.

- **Given** a new order, **when** the day is advanced, **then** it may be flagged and
  moved to a held state.
- **Given** a held order, **when** fulfilment runs, **then** it is not fulfilled.

## US-FR-2 · Decide held orders quickly
**As a** Risk analyst, **I want** held orders reviewed the next day **so that** legitimate
customers aren't stuck and clear fraud is stopped.

- **Given** a held order, **when** the next day is advanced, **then** it is either cleared
  (fulfillable) or rejected.
- **Given** a rejected order, **then** it is cancelled and never fulfilled.

## US-FR-3 · Let good orders through cleanly
**As a** Warehouse lead, **I want** cleared orders to fulfil normally **so that** a review
hold costs at most a short delay, not a lost sale.

- **Given** a cleared order, **when** fulfilment next runs, **then** it fulfils and its
  revenue and cost are recognized on that day.

## US-FR-4 · Track the fraud that slips through
**As** Finance, **I want** chargebacks tracked **so that** the cost of fraud that got
cleared in error is visible and reflected in cash.

- **Given** a fraudulent order that was cleared and fulfilled, **when** the chargeback lag
  passes, **then** exactly one chargeback is raised and cash is reduced.

## US-FR-5 · See risk as a controllable number
**As an** Executive, **I want** held/rejected counts and chargeback totals **so that**
fraud loss is a number I can manage, not a surprise.

- **Given** several advanced days, **when** I open Finance, **then** orders held, orders
  rejected, and chargeback value are shown; **and** Executive shows total chargebacks.

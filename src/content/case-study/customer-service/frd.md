# Functional Requirements Document

**Project:** Customer Service & Sentiment · **Companion to:** BRD

Each requirement is implemented by the customer-service rule in the simulation engine
and is observable on the dashboards and in the system log. IDs are referenced by the
Requirements Traceability Matrix.

## FR-CS-1 · Ticket generation from backorders
**Trigger:** an order that is backordered on the current day.
**Behavior:** open a support ticket of category `backorder` for that order's customer,
with a seeded handling window (1–4 days).
**Output:** an open `SupportTicket`; a `ticket_opened` log event.

## FR-CS-2 · Ticket generation from late deliveries
**Trigger:** a purchase order received on the current day whose actual arrival is later
than its expected arrival.
**Behavior:** open a `late_delivery` ticket for a seeded affected customer, with a
seeded handling window.
**Output:** an open `SupportTicket`; a `ticket_opened` log event.

## FR-CS-3 · Resolution after handling time
**Trigger:** an open ticket whose handling window has elapsed (`currentDay ≥ target`).
**Behavior:** mark the ticket resolved and record the resolution day.
**Output:** a resolved ticket; a `ticket_resolved` log event.

## FR-CS-4 · CSAT scoring
**Trigger:** ticket resolution.
**Behavior:** assign a satisfaction score of 1–5, drawn from a seeded base and biased
**down** for backorder tickets and for waits of four or more days (floored at 1).
**Output:** a `csatScore` on the ticket; carried in the `ticket_resolved` payload.

## FR-CS-5 · Sentiment & backlog KPIs
**Trigger:** end-of-day KPI snapshot.
**Behavior:** compute open-ticket count, average resolution days, average CSAT, and NPS
(`%promoters − %detractors`, where promoters are CSAT 4–5 and detractors 1–2).
**Output:** four fields on the daily snapshot powering the dashboard trends.

## FR-CS-6 · Customer Service dashboard & Executive NPS
**Behavior:** a Customer Service view presents NPS, CSAT, open-ticket backlog, average
resolution time, an NPS trend, and the open-ticket list; the Executive view carries an
NPS tile so the cross-department link is visible at the top of the company.

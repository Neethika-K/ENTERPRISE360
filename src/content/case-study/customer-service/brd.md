# Business Requirements Document

**Project:** Customer Service & Sentiment for Northwind Retail Co.
**Flagship problem:** Supplier delay & stockouts → Customer Service → NPS
**Author:** Business Analyst · **Status:** Approved

## 1. Problem Statement

Northwind's upstream problems don't stay upstream. When an item is backordered or a
supplier delivers a purchase order late, a real customer is left waiting — and today
that frustration is invisible to the business until it shows up as churn. There is no
systematic way to (a) capture the service load these misses create, (b) measure how
customers feel about it, or (c) tie that sentiment back to the operational cause. The
company is effectively flying blind on the customer-experience consequences of its
own supply chain.

## 2. Business Objectives

- **Capture every service-affecting event.** When a customer is let down by a
  backorder or a late delivery, a support ticket should exist — automatically, not
  only when a customer complains loudly enough.
- **Measure sentiment, not just volume.** Resolve tickets with a satisfaction score
  (CSAT) and roll it up into a Net Promoter Score (NPS) leadership can track.
- **Connect sentiment to cause.** Make it possible to trace a dip in NPS back to the
  supplier delays and stockouts that drove it.

## 3. Stakeholders

| Stakeholder | Interest |
|---|---|
| Customer Service lead | Wants tickets raised automatically and a live view of backlog |
| Operations Manager | Wants to see how supply reliability affects customers |
| Executive sponsor | Wants NPS as a headline health metric alongside revenue |

## 4. Scope

**In scope:** automatic ticket generation from two triggers (an order backordered
today; a purchase order received later than its expected date); ticket resolution over
a short handling window; a CSAT score on resolution (lower for longer waits and
backorders); NPS/CSAT/backlog KPIs; a Customer Service dashboard and an NPS tile on
the Executive view.

**Out of scope:** live chat, phone or email channels; multi-touch conversations;
agent staffing and routing; proactive outreach. This release models the *signal* — a
customer was affected, worked, and how they felt — not a full contact centre.

## 5. Success Metrics

- **NPS** and **CSAT** are visible and move in response to service events.
- **Open-ticket backlog** and **average resolution time** are tracked day to day.
- A reviewer can point at an NPS dip and find the backorders/late deliveries behind it
  in the same system log.

## 6. Current vs. Future Process

- **Current:** stockouts and late deliveries happen; the customer impact is anecdotal;
  no measurement; sentiment surfaces too late to act on.
- **Future:** each affected customer automatically has a ticket; Customer Service works
  it; resolution carries a satisfaction score; NPS updates; and the whole chain — from
  a supplier missing its window to a customer's score — is visible and traceable.

## 7. Assumptions & Constraints

- Tickets are generated from signals the operations simulation already produces
  (backorders, late POs) — no separate customer-complaint input is modelled.
- Satisfaction is simulated deterministically (seeded), biased lower for longer waits
  and for backorders, so the demo replays identically.
- NPS is derived from CSAT (promoters = 4–5, detractors = 1–2) rather than a separate
  survey instrument, keeping one clean sentiment signal.

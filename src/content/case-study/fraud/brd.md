# Business Requirements Document

**Project:** Order Risk Review & Fraud Control for Northwind Retail Co.
**Flagship problem:** Fraudulent orders → risk review
**Author:** Business Analyst · **Status:** Approved

## 1. Problem Statement

Not every order is legitimate. A small share are fraudulent, and if they ship
unchecked the company loses the goods and, weeks later, eats a **chargeback** when the
payment is disputed. Today Northwind fulfils every order the moment stock allows, with
no control point in between — so fraud is discovered only after the money and the goods
are already gone. There is no way to stop a suspicious order before it ships, and no
measure of how much fraud is slipping through.

## 2. Business Objectives

- **Insert a control point** between order capture and fulfilment: suspicious orders are
  held and reviewed rather than shipped automatically.
- **Stop clear fraud** by rejecting orders that fail review before any stock leaves.
- **Quantify what slips through** — track the chargebacks from fraud that was cleared in
  error, so the cost of risk is visible, not hidden.

## 3. Stakeholders

| Stakeholder | Interest |
|---|---|
| Risk / Fraud analyst | Wants suspicious orders held for review, not auto-shipped |
| Warehouse | Wants a clear signal on which orders may ship |
| Finance | Wants chargeback losses tracked against cash |
| Executive sponsor | Wants fraud loss visible as a controllable number |

## 4. Scope

**In scope:** a risk flag on incoming orders; a hold state that prevents fulfilment; a
next-day review that clears or rejects held orders; and chargebacks for fraud that is
cleared in error, with held/rejected/chargeback metrics on Finance and Executive.

**Out of scope:** real risk scoring or machine-learning models, manual analyst review
screens, identity verification, and partial or item-level holds. This release models the
*control point and its financial consequence*, not a fraud-detection engine.

## 5. Success Metrics

- **Rejected orders** never fulfil — fraud stopped at the gate is measurable.
- **Chargebacks** from cleared-in-error fraud are tracked and subtracted from cash.
- Leadership can see orders currently **held**, orders **rejected** to date, and total
  **chargeback** loss.

## 6. Current vs. Future Process

- **Current:** every order ships as soon as stock allows; fraud is found only after a
  chargeback lands; loss is invisible until it hits the bank.
- **Future:** suspicious orders are held before fulfilment, reviewed and cleared or
  rejected the next day; fraud that slips through is caught later as a tracked
  chargeback — with the whole control visible in the system log.

## 7. Assumptions & Constraints

- Orders are flagged, cleared, and rejected at seeded rates — deterministic and
  replayable.
- Held orders wait one day for review; cleared orders then fulfil normally (revenue and
  cost are recognized on the day they actually fulfil).
- Chargebacks arrive a fixed lag after a fraudulent order was cleared, once per order,
  and reduce cash.

# Business Requirements Document

**Project:** Reverse Logistics & Returns for Northwind Retail Co.
**Flagship problem:** Product returns → reverse logistics
**Author:** Business Analyst · **Status:** Approved

## 1. Problem Statement

A sale is not always the end of the story. A share of fulfilled orders come back as
returns — and today Northwind has no systematic handle on them. Returned goods are not
consistently decided (put back on the shelf vs. written off), refunds erode cash without
being tracked against the sales that generated them, and leadership has no visibility
into return rate as a health metric. The result is silent margin leakage: revenue looks
healthy while cash quietly drains through refunds and written-off stock.

## 2. Business Objectives

- **Decide every return deliberately** — restock the item (recovering its value) or
  write it off — rather than leaving it ad hoc.
- **Account for the cash cost** — every refund reduces the company's cash position, and
  that should be visible, not hidden inside net figures.
- **Measure return rate** so leadership can see when returns are trending up and act.

## 3. Stakeholders

| Stakeholder | Interest |
|---|---|
| Warehouse / Reverse logistics | Wants a clear restock-or-write-off decision per return |
| Finance | Wants refunds tracked and reflected in cash |
| Sales | Wants return rate visible against sales volume |
| Executive sponsor | Wants margin protected from silent leakage |

## 4. Scope

**In scope:** generation of returns from recently fulfilled sales; a restock-or-write-off
resolution; a customer refund that reduces cash; return-rate and refund KPIs; and
surfacing on the Sales (return rate + recent returns) and Finance (refunds) views, with
restocks visible in the system log.

**Out of scope:** exchanges, partial-line returns, restocking fees, formal RMA numbers
and approval workflows, and customer-initiated return requests. This release models the
*financial and inventory consequence* of returns, not a full returns-management portal.

## 5. Success Metrics

- **Return rate** is tracked and visible against sales.
- **Refund value** is accumulated and subtracted from cash, so cash reflects reality.
- Restocked units measurably return to inventory; written-off units do not.

## 6. Current vs. Future Process

- **Current:** returns happen but are handled inconsistently; refunds hit the bank
  without being attributed; return rate is unknown; margin leaks unseen.
- **Future:** each return is created from a recent sale, resolved as restock or
  write-off, and refunded — with the cash impact and return rate on the dashboards and
  the whole chain in the system log.

## 7. Assumptions & Constraints

- Returns are generated from order lines fulfilled a few days earlier (a fixed lag),
  at a seeded rate — deterministic and replayable.
- The restock-vs-write-off split is seeded (~70/30); refunds equal the original sale
  value of the returned units.
- Refunds are modelled as paid refund invoices so they flow through the same cash
  calculation as other settlements.

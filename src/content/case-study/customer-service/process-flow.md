# Process Flow — Supplier Miss → Customer Service → NPS

How an upstream supply problem becomes a measured customer-sentiment outcome. This loop
runs every day, downstream of the order and procurement flows.

```mermaid
flowchart TD
  A[Order backordered today] --> C[Open support ticket]
  B[PO received late today] --> C
  C --> D[Handling window - seeded 1 to 4 days]
  D --> E{Window elapsed?}
  E -- No --> D
  E -- Yes --> F[Resolve ticket]
  F --> G[Score CSAT 1 to 5 - lower for long waits and backorders]
  G --> H[Recompute NPS from CSAT buckets]
  H --> I[Customer Service dashboard and Executive NPS tile update]
```

## Reading the diagram

- The two entry points (**backorder**, **late PO**) are the exact signals the
  operations simulation already emits — this problem consumes them, it does not invent
  new demand.
- CSAT is where **experience** enters the model; **NPS** is the leadership-facing
  roll-up (`%promoters − %detractors`).
- Because both entry points trace to supplier reliability and stock levels, a movement
  in NPS is always explainable by the operational events in the same system log.

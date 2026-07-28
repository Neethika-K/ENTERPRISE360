# Process Flow — Order-to-Cash meets Procure-to-Pay

The end-to-end loop the simulation runs every day. One customer order can ripple
all the way through to a replenished shelf and an updated executive KPI.

```mermaid
flowchart TD
  A[Customer places order] --> B{Stock available?}
  B -- Yes --> C[Fulfil line, decrement inventory]
  B -- No --> D[Backorder line]
  C --> E{On-hand + incoming below reorder point?}
  D --> E
  E -- No --> Z[No action needed]
  E -- Yes --> F[Create purchase request]
  F --> G{Cost under threshold, or review period elapsed?}
  G -- Hold --> H[Awaiting manager review]
  H --> G
  G -- Yes --> I[Approve request]
  I --> J[Place purchase order with supplier]
  J --> K[In transit - lead time plus any delay]
  K --> L[Warehouse receives, replenish inventory]
  L --> M[Record revenue / cost - invoices]
  C --> M
  M --> N[Snapshot KPIs -> dashboards update]
```

## Reading the diagram

- The **left branch** (order → fulfil/backorder) is Order-to-Cash.
- The **right branch** (reorder → request → approval → PO → receipt) is
  Procure-to-Pay.
- They meet at **Finance** and **KPIs**, which is why a single dashboard number is
  traceable back through the whole chain.

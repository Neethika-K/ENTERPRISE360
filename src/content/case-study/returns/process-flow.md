# Process Flow — Sale → Return → Reverse Logistics

What happens after the sale. A fulfilled order line, a few days later, may come back —
and when it does, it touches Warehouse, Inventory, and Finance in one pass.

```mermaid
flowchart TD
  A[Order line fulfilled - a few days ago] --> B{Returned? - seeded rate}
  B -- No --> Z[No action]
  B -- Yes --> C[Create return]
  C --> D{Restock or write-off? - seeded}
  D -- Restock --> E[Add quantity back to inventory]
  D -- Write-off --> F[Value lost - no restock]
  E --> G[Issue customer refund - cash out]
  F --> G
  G --> H[Recompute return rate and refunds - KPIs]
  H --> I[Sales return-rate and Finance refunds update]
```

## Reading the diagram

- The entry point is a **past fulfilled sale**, so returns are always tied to real
  earlier demand — the reverse side of Order-to-Cash.
- **Restock** recovers inventory value; **write-off** does not — but both **refund** the
  customer, so cash always moves.
- Because return rate and refunds roll into the daily KPIs, a dip in cash or margin is
  explainable by the returns in the same system log.

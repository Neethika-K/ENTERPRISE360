# Product Roadmap — Enterprise360

Delivered increments and what's next. Each problem is an independent, shippable slice that
extends the same running company.

```mermaid
flowchart LR
  M0[MVP - Inventory to Procurement] --> M1[CS to NPS]
  M1 --> M2[Returns]
  M2 --> M3[Fraud / Risk]
  M3 --> M4[Delivery Artifacts]
  M4 --> F1[Public hosting]
  M4 --> F2[More problems and departments]
  M4 --> F3[Predictive / ML features]

  classDef done fill:#14324a,stroke:#34d3c0,color:#e8edf5;
  classDef next fill:#141c2b,stroke:#26324a,color:#8a98b0;
  class M0,M1,M2,M3,M4 done;
  class F1,F2,F3 next;
```

## Now (shipped)

- **MVP** — the flagship Order-to-Cash × Procure-to-Pay loop and five dashboards.
- **CS → NPS**, **Returns**, **Fraud / Risk** — three connected problems.
- **Delivery artifacts** — this PM/Agile package.

## Next (candidates, not committed)

- **Public hosting** — swap SQLite for Postgres and deploy for a shareable live demo.
- **More problems / departments** — e.g. HR, Marketing, or a supplier-scorecard problem.
- **Predictive features** — demand forecasting or a churn/fraud model over the sim data.

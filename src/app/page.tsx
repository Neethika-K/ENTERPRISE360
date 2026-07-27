import Link from 'next/link';

const loop = [
  'order placed',
  'stock drawn down',
  'reorder point breached',
  'request approved',
  'PO placed',
  'stock replenished',
  'KPIs update',
];

export default function Home() {
  return (
    <main className="mx-auto max-w-5xl px-6 py-20">
      <div className="eyebrow">Digital enterprise simulation</div>
      <h1 className="mt-3 max-w-3xl font-display text-5xl font-bold leading-[1.05] tracking-tight text-text">
        Operate a retail company,
        <br />
        <span className="text-accent">one day at a time.</span>
      </h1>
      <p className="mt-6 max-w-2xl text-lg text-muted">
        Enterprise360 is a fictional omnichannel retailer that actually runs. Advance
        the clock and watch a single customer order ripple across Sales, Inventory,
        Procurement, Warehouse, and Finance — every cause and effect logged, every
        KPI moving in step.
      </p>

      <div className="mt-8 flex flex-wrap gap-3">
        <Link
          href="/dashboard/executive"
          className="rounded-[var(--radius)] bg-accent px-6 py-3 font-mono text-sm font-semibold uppercase tracking-wider text-bg transition-opacity hover:opacity-90"
        >
          Enter the console →
        </Link>
        <Link
          href="/case-study"
          className="rounded-[var(--radius)] border border-line px-6 py-3 font-mono text-sm uppercase tracking-wider text-muted transition-colors hover:border-accent hover:text-text"
        >
          Read the case study
        </Link>
      </div>

      {/* The loop — echoes the system log's causal chain */}
      <div className="mt-14">
        <div className="eyebrow mb-3">The flagship loop</div>
        <div className="flex flex-wrap items-center gap-x-2 gap-y-2 font-mono text-xs">
          {loop.map((step, i) => (
            <span key={step} className="flex items-center gap-2">
              <span className="panel px-2.5 py-1.5 text-text">{step}</span>
              {i < loop.length - 1 && <span className="text-accent">→</span>}
            </span>
          ))}
        </div>
      </div>

      <section className="mt-16 grid gap-10 border-t border-line pt-10 md:grid-cols-2">
        <div>
          <h2 className="font-display text-lg font-semibold text-text">How it works</h2>
          <p className="mt-3 text-sm text-muted">
            Each “Advance Day” runs a deterministic business-rule pipeline: demand is
            generated, orders are filled or backordered, low stock raises a purchase
            request, a manager approves it, a supplier ships and later delivers, and
            every dashboard and KPI updates. Reset any time — the same starting point
            always replays the same way.
          </p>
        </div>
        <div>
          <h2 className="font-display text-lg font-semibold text-text">What’s next</h2>
          <p className="mt-3 text-sm text-muted">
            This release demonstrates one flagship problem — inventory shortage →
            procurement. The same architecture extends to the full vision: more
            departments (HR, Marketing, IT), a library of business problems, and
            industry variants. They’re deliberately out of scope here to keep the
            build focused and finishable.
          </p>
        </div>
      </section>
    </main>
  );
}

import KpiCard from '@/components/dashboard/KpiCard';
import TrendChart from '@/components/dashboard/TrendChart';
import { getSalesSummary, getKpiTrend } from '@/lib/kpi-selectors';

export const dynamic = 'force-dynamic';

export default async function SalesPage() {
  const [s, trend] = await Promise.all([getSalesSummary(), getKpiTrend()]);
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
        <KpiCard title="Orders · today" value={String(s.ordersCount)} tone="accent" />
        <KpiCard title="Units fulfilled" value={String(s.fulfilled)} tone="positive" />
        <KpiCard title="Units backordered" value={String(s.backordered)} tone={s.backordered > 0 ? 'alert' : 'default'} />
        <KpiCard title="Return rate" value={`${(s.returnRate * 100).toFixed(1)}%`} tone={s.returnRate > 0.15 ? 'alert' : 'default'} />
        <KpiCard title="Top SKU · today" value={s.topSkus[0]?.sku ?? '—'} hint={s.topSkus[0] ? `${s.topSkus[0].qty} units` : undefined} />
      </div>
      <TrendChart title="Revenue / day" data={trend.map((t) => ({ label: t.label, value: t.revenue }))} color="#5b9bf3" />
      <div className="panel p-4">
        <div className="eyebrow mb-3">Recent returns</div>
        <ul className="space-y-1.5 font-mono text-sm">
          {s.recentReturns.map((r) => (
            <li key={r.id} className="flex items-center justify-between gap-2 border-b border-line/60 pb-1.5">
              <span className="text-text">Return #{r.id} · {r.quantity} × {r.product.sku}</span>
              <span className={`shrink-0 text-xs uppercase tracking-wider ${r.resolution === 'writeoff' ? 'text-alert' : 'text-positive'}`}>
                {r.resolution} · ${r.refundAmount.toFixed(0)} refund
              </span>
            </li>
          ))}
          {s.recentReturns.length === 0 && <li className="text-muted">No returns yet.</li>}
        </ul>
      </div>
      <div className="panel p-4">
        <div className="eyebrow mb-3">Top SKUs · today</div>
        <ul className="space-y-1.5 font-mono text-sm">
          {s.topSkus.map((t) => (
            <li key={t.sku} className="flex justify-between border-b border-line/60 pb-1.5">
              <span className="text-text">{t.sku}</span>
              <span className="tabular-nums text-muted">{t.qty} units</span>
            </li>
          ))}
          {s.topSkus.length === 0 && <li className="text-muted">No sales recorded today.</li>}
        </ul>
      </div>
    </div>
  );
}

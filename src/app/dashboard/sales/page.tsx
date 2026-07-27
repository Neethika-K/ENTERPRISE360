import KpiCard from '@/components/dashboard/KpiCard';
import TrendChart from '@/components/dashboard/TrendChart';
import { getSalesSummary, getKpiTrend } from '@/lib/kpi-selectors';

export const dynamic = 'force-dynamic';

export default async function SalesPage() {
  const [s, trend] = await Promise.all([getSalesSummary(), getKpiTrend()]);
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <KpiCard title="Orders · today" value={String(s.ordersCount)} tone="accent" />
        <KpiCard title="Units fulfilled" value={String(s.fulfilled)} tone="positive" />
        <KpiCard title="Units backordered" value={String(s.backordered)} tone={s.backordered > 0 ? 'alert' : 'default'} />
        <KpiCard title="Top SKU · today" value={s.topSkus[0]?.sku ?? '—'} hint={s.topSkus[0] ? `${s.topSkus[0].qty} units` : undefined} />
      </div>
      <TrendChart title="Revenue / day" data={trend.map((t) => ({ label: t.label, value: t.revenue }))} color="#5b9bf3" />
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

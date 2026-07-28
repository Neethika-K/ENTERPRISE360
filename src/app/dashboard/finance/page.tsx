import KpiCard from '@/components/dashboard/KpiCard';
import TrendChart from '@/components/dashboard/TrendChart';
import { getLatestKpi, getKpiTrend, getRiskSummary } from '@/lib/kpi-selectors';

export const dynamic = 'force-dynamic';

const money = (n: number) => `$${Math.round(n).toLocaleString()}`;

export default async function FinancePage() {
  const [kpi, trend, risk] = await Promise.all([getLatestKpi(), getKpiTrend(), getRiskSummary()]);
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <KpiCard title="Revenue · today" value={kpi ? money(kpi.revenue) : '—'} tone="accent" />
        <KpiCard title="COGS · today" value={kpi ? money(kpi.cogs) : '—'} />
        <KpiCard title="Gross margin · today" value={kpi ? money(kpi.grossMargin) : '—'} tone="positive" />
        <KpiCard title="Refunds · to date" value={kpi ? money(kpi.refundsValue) : '—'} tone={kpi && kpi.refundsValue > 0 ? 'alert' : 'default'} />
      </div>
      <div className="grid gap-3 lg:grid-cols-2">
        <TrendChart title="Gross margin / day" data={trend.map((t) => ({ label: t.label, value: t.grossMargin }))} color="#34d3c0" />
        <TrendChart title="Cash position / day" data={trend.map((t) => ({ label: t.label, value: t.cashPosition }))} color="#f5a524" />
      </div>
      <div className="panel p-4">
        <div className="eyebrow mb-3">Risk & fraud</div>
        <div className="grid grid-cols-3 gap-3 font-mono text-sm">
          <div>
            <div className="text-xs uppercase tracking-wider text-muted">Orders held</div>
            <div className="mt-1 text-lg tabular-nums text-accent">{risk.ordersHeld}</div>
          </div>
          <div>
            <div className="text-xs uppercase tracking-wider text-muted">Rejected · to date</div>
            <div className="mt-1 text-lg tabular-nums text-text">{risk.ordersRejected}</div>
          </div>
          <div>
            <div className="text-xs uppercase tracking-wider text-muted">Chargebacks · to date</div>
            <div className={`mt-1 text-lg tabular-nums ${risk.chargebacksValue > 0 ? 'text-alert' : 'text-text'}`}>{money(risk.chargebacksValue)}</div>
          </div>
        </div>
        {risk.recentChargebacks.length > 0 && (
          <ul className="mt-3 space-y-1.5 border-t border-line/60 pt-3 font-mono text-xs">
            {risk.recentChargebacks.map((c) => (
              <li key={c.id} className="flex justify-between text-muted">
                <span>Chargeback #{c.id} · order #{c.orderId}</span>
                <span className="text-alert">−{money(c.amount)}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

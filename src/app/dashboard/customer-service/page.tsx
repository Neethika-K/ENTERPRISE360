import KpiCard from '@/components/dashboard/KpiCard';
import TrendChart from '@/components/dashboard/TrendChart';
import { getCustomerServiceSummary, getKpiTrend } from '@/lib/kpi-selectors';

export const dynamic = 'force-dynamic';

export default async function CustomerServicePage() {
  const [cs, trend] = await Promise.all([getCustomerServiceSummary(), getKpiTrend()]);
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <KpiCard title="NPS" value={String(cs.nps)} tone={cs.nps >= 0 ? 'positive' : 'alert'} />
        <KpiCard title="CSAT (avg)" value={cs.csat ? `${cs.csat.toFixed(1)}/5` : '—'} />
        <KpiCard title="Open tickets" value={String(cs.openTicketCount)} tone={cs.openTicketCount > 0 ? 'accent' : 'default'} />
        <KpiCard title="Avg resolution" value={cs.avgResolutionDays ? `${cs.avgResolutionDays.toFixed(1)}d` : '—'} />
      </div>
      <TrendChart title="NPS / day" data={trend.map((t) => ({ label: t.label, value: t.nps }))} color="#34d3c0" />
      <div className="panel p-4">
        <div className="eyebrow mb-3">Open tickets</div>
        <ul className="space-y-1.5 font-mono text-sm">
          {cs.openTickets.map((t) => (
            <li key={t.id} className="flex justify-between border-b border-line/50 pb-1.5">
              <span className="text-text">Ticket #{t.id} · {t.customer.name}</span>
              <span className={`text-xs uppercase tracking-wider ${t.category === 'backorder' ? 'text-alert' : 'text-accent'}`}>
                {t.category.replace('_', ' ')}
              </span>
            </li>
          ))}
          {cs.openTickets.length === 0 && <li className="text-muted">No open tickets.</li>}
        </ul>
      </div>
    </div>
  );
}

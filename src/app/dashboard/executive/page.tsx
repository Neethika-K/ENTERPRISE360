import KpiCard from '@/components/dashboard/KpiCard';
import TrendChart from '@/components/dashboard/TrendChart';
import EventFeed from '@/components/dashboard/EventFeed';
import { getLatestKpi, getKpiTrend, getRecentEvents } from '@/lib/kpi-selectors';

export const dynamic = 'force-dynamic';

const money = (n: number) => `$${Math.round(n).toLocaleString()}`;

export default async function ExecutivePage() {
  const [kpi, trend, events] = await Promise.all([getLatestKpi(), getKpiTrend(), getRecentEvents()]);
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
        <KpiCard title="Revenue · today" value={kpi ? money(kpi.revenue) : '—'} tone="accent" />
        <KpiCard title="Gross margin · today" value={kpi ? money(kpi.grossMargin) : '—'} tone="positive" />
        <KpiCard title="Cash position" value={kpi ? money(kpi.cashPosition) : '—'} />
        <KpiCard
          title="On-time delivery"
          value={kpi ? `${Math.round(kpi.onTimeDeliveryPct * 100)}%` : '—'}
          hint={`${kpi?.backorderCount ?? 0} backorders today`}
          tone={kpi && kpi.backorderCount > 0 ? 'alert' : 'default'}
        />
        <KpiCard title="NPS" value={kpi ? String(kpi.nps) : '—'} tone={kpi && kpi.nps >= 0 ? 'positive' : 'alert'} />
      </div>
      <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
        <TrendChart title="Revenue / day" data={trend.map((t) => ({ label: t.label, value: t.revenue }))} color="#f5a524" />
        <TrendChart title="Cash position / day" data={trend.map((t) => ({ label: t.label, value: t.cashPosition }))} color="#34d3c0" />
      </div>
      <EventFeed events={events} />
    </div>
  );
}

import KpiCard from '@/components/dashboard/KpiCard';
import TrendChart from '@/components/dashboard/TrendChart';
import { getLatestKpi, getKpiTrend } from '@/lib/kpi-selectors';

export const dynamic = 'force-dynamic';

const money = (n: number) => `$${Math.round(n).toLocaleString()}`;

export default async function FinancePage() {
  const [kpi, trend] = await Promise.all([getLatestKpi(), getKpiTrend()]);
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
        <KpiCard title="Revenue · today" value={kpi ? money(kpi.revenue) : '—'} tone="accent" />
        <KpiCard title="COGS · today" value={kpi ? money(kpi.cogs) : '—'} />
        <KpiCard title="Gross margin · today" value={kpi ? money(kpi.grossMargin) : '—'} tone="positive" />
      </div>
      <div className="grid gap-3 lg:grid-cols-2">
        <TrendChart title="Gross margin / day" data={trend.map((t) => ({ label: t.label, value: t.grossMargin }))} color="#34d3c0" />
        <TrendChart title="Cash position / day" data={trend.map((t) => ({ label: t.label, value: t.cashPosition }))} color="#f5a524" />
      </div>
    </div>
  );
}

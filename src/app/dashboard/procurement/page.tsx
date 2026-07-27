import TrendChart from '@/components/dashboard/TrendChart';
import { getOpenProcurement, getKpiTrend } from '@/lib/kpi-selectors';

export const dynamic = 'force-dynamic';

export default async function ProcurementPage() {
  const [{ prs, pos }, trend] = await Promise.all([getOpenProcurement(), getKpiTrend()]);
  return (
    <div className="space-y-6">
      <div className="grid gap-3 lg:grid-cols-2">
        <div className="panel p-4">
          <div className="eyebrow mb-3">Open purchase requests</div>
          <ul className="space-y-1.5 font-mono text-sm">
            {prs.map((pr) => (
              <li key={pr.id} className="flex justify-between border-b border-line/50 pb-1.5">
                <span className="text-text">PR #{pr.id} · {pr.product.sku}</span>
                <span className={`text-xs uppercase tracking-wider ${pr.status === 'approved' ? 'text-positive' : 'text-accent'}`}>
                  {pr.status}
                </span>
              </li>
            ))}
            {prs.length === 0 && <li className="text-muted">None open.</li>}
          </ul>
        </div>
        <div className="panel p-4">
          <div className="eyebrow mb-3">Open purchase orders</div>
          <ul className="space-y-1.5 font-mono text-sm">
            {pos.map((po) => (
              <li key={po.id} className="flex items-center justify-between gap-2 border-b border-line/50 pb-1.5">
                <span className="text-text">PO #{po.id} · {po.supplier.name}</span>
                <span className={`shrink-0 text-xs uppercase tracking-wider ${po.status === 'delayed' ? 'text-alert' : 'text-muted'}`}>
                  {po.status} · eta D{po.expectedSimDayArrival}
                </span>
              </li>
            ))}
            {pos.length === 0 && <li className="text-muted">None open.</li>}
          </ul>
        </div>
      </div>
      <TrendChart
        title="On-time delivery % / day"
        data={trend.map((t) => ({ label: t.label, value: Math.round(t.onTimeDeliveryPct * 100) }))}
        color="#f5a524"
      />
    </div>
  );
}

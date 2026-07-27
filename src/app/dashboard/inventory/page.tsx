import TrendChart from '@/components/dashboard/TrendChart';
import { getInventoryStatus, getKpiTrend } from '@/lib/kpi-selectors';

export const dynamic = 'force-dynamic';

export default async function InventoryPage() {
  const [rows, trend] = await Promise.all([getInventoryStatus(), getKpiTrend()]);
  return (
    <div className="space-y-6">
      <div className="panel p-4">
        <div className="eyebrow mb-3">Stock position vs reorder point</div>
        <div className="overflow-x-auto">
          <table className="w-full font-mono text-sm">
            <thead>
              <tr className="eyebrow border-b border-line text-left">
                <th className="pb-2 pr-3 font-normal">SKU</th>
                <th className="pb-2 pr-3 font-normal">Name</th>
                <th className="pb-2 pr-3 text-right font-normal">On hand</th>
                <th className="pb-2 pr-3 text-right font-normal">Incoming</th>
                <th className="pb-2 pr-3 text-right font-normal">Reorder pt</th>
                <th className="pb-2 text-right font-normal">Status</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => {
                const low = r.onHand + r.incoming < r.reorderPoint;
                return (
                  <tr key={r.sku} className="border-b border-line/50">
                    <td className="py-2 pr-3 text-text">{r.sku}</td>
                    <td className="py-2 pr-3 font-sans text-muted">{r.name}</td>
                    <td className="py-2 pr-3 text-right tabular-nums text-text">{r.onHand}</td>
                    <td className="py-2 pr-3 text-right tabular-nums text-muted">{r.incoming}</td>
                    <td className="py-2 pr-3 text-right tabular-nums text-muted">{r.reorderPoint}</td>
                    <td className="py-2 text-right">
                      <span className={`text-xs uppercase tracking-wider ${low ? 'text-alert' : 'text-positive'}`}>
                        {low ? '● low' : '○ ok'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
      <TrendChart title="Inventory value / day" data={trend.map((t) => ({ label: t.label, value: t.inventoryValue }))} color="#34d3c0" />
    </div>
  );
}

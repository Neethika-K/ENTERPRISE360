import Link from 'next/link';
import TickControls from '@/components/dashboard/TickControls';
import { getCurrentDay } from '@/lib/kpi-selectors';

const tabs = [
  ['Executive', '/dashboard/executive'],
  ['Sales', '/dashboard/sales'],
  ['Inventory', '/dashboard/inventory'],
  ['Procurement', '/dashboard/procurement'],
  ['Finance', '/dashboard/finance'],
] as const;

export const dynamic = 'force-dynamic';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const day = await getCurrentDay();
  return (
    <div className="flex flex-1 flex-col">
      {/* Operations console bar */}
      <div className="border-b border-line bg-panel/40 px-6 py-4">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4">
          <div>
            <div className="eyebrow">Operations Console</div>
            <div className="font-display text-sm text-muted">Northwind Retail Co. — omnichannel</div>
          </div>
          <TickControls currentDay={day} />
        </div>
      </div>

      {/* Department tabs */}
      <div className="border-b border-line px-6">
        <nav className="mx-auto flex max-w-6xl gap-1 overflow-x-auto">
          {tabs.map(([label, href]) => (
            <Link
              key={href}
              href={href}
              className="border-b-2 border-transparent px-3 py-3 font-mono text-xs uppercase tracking-wider text-muted hover:text-text"
            >
              {label}
            </Link>
          ))}
        </nav>
      </div>

      <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-8">{children}</main>
    </div>
  );
}

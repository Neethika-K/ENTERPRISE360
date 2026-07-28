'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const tabs = [
  ['Executive', '/dashboard/executive'],
  ['Sales', '/dashboard/sales'],
  ['Inventory', '/dashboard/inventory'],
  ['Procurement', '/dashboard/procurement'],
  ['Customer Service', '/dashboard/customer-service'],
  ['Finance', '/dashboard/finance'],
] as const;

export default function DashboardTabs() {
  const pathname = usePathname();
  return (
    <nav className="mx-auto flex max-w-6xl gap-1 overflow-x-auto">
      {tabs.map(([label, href]) => {
        const active = pathname === href;
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? 'page' : undefined}
            className={`border-b-2 px-3 py-3 font-mono text-xs uppercase tracking-wider transition-colors ${
              active ? 'border-accent text-text' : 'border-transparent text-muted hover:text-text'
            }`}
          >
            {label}
          </Link>
        );
      })}
    </nav>
  );
}

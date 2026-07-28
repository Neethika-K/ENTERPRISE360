'use client';

import { useState } from 'react';
import type { RaidRow } from '@/content/delivery/raid';

const cols: [keyof RaidRow, string][] = [
  ['ref', 'Ref'],
  ['type', 'Type'],
  ['description', 'Description'],
  ['response', 'Impact / Response'],
  ['owner', 'Owner'],
  ['status', 'Status'],
];

const TYPE_TONE: Record<string, string> = {
  Risk: 'text-alert',
  Assumption: 'text-info',
  Issue: 'text-accent',
  Dependency: 'text-positive',
};

export default function RaidTable({ rows }: { rows: RaidRow[] }) {
  const [sortKey, setSortKey] = useState<keyof RaidRow>('ref');
  const sorted = [...rows].sort((a, b) => a[sortKey].localeCompare(b[sortKey]));
  return (
    <div className="panel overflow-x-auto">
      <table className="w-full font-mono text-xs">
        <thead>
          <tr className="border-b border-line text-left">
            {cols.map(([k, label]) => (
              <th
                key={k}
                onClick={() => setSortKey(k)}
                className={`cursor-pointer px-3 py-2.5 font-normal uppercase tracking-wider ${
                  sortKey === k ? 'text-accent' : 'text-muted'
                } hover:text-text`}
              >
                {label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sorted.map((r) => (
            <tr key={r.ref} className="border-b border-line/50 align-top">
              <td className="px-3 py-2.5 text-muted">{r.ref}</td>
              <td className={`px-3 py-2.5 ${TYPE_TONE[r.type] ?? 'text-text'}`}>{r.type}</td>
              <td className="px-3 py-2.5 font-sans text-text">{r.description}</td>
              <td className="px-3 py-2.5 font-sans text-muted">{r.response}</td>
              <td className="px-3 py-2.5 text-muted">{r.owner}</td>
              <td className="px-3 py-2.5 text-muted">{r.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

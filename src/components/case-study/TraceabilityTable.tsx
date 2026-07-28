'use client';

import { useState } from 'react';
import type { RtmRow } from '@/content/case-study/problems';

const cols: [keyof RtmRow, string][] = [
  ['reqId', 'Req'],
  ['description', 'Description'],
  ['userStory', 'Story'],
  ['acceptanceCriteria', 'Acceptance'],
  ['feature', 'Built in'],
];

export default function TraceabilityTable({ rows }: { rows: RtmRow[] }) {
  const [sortKey, setSortKey] = useState<keyof RtmRow>('reqId');
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
            <tr key={r.reqId} className="border-b border-line/50 align-top">
              <td className="px-3 py-2.5 text-accent">{r.reqId}</td>
              <td className="px-3 py-2.5 font-sans text-text">{r.description}</td>
              <td className="px-3 py-2.5 text-muted">{r.userStory}</td>
              <td className="px-3 py-2.5 font-sans text-muted">{r.acceptanceCriteria}</td>
              <td className="px-3 py-2.5 text-muted">{r.feature}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

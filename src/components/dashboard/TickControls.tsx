'use client';

import { useTransition } from 'react';
import { advanceDay, advanceDays, resetSim } from '@/app/actions/tick';

export default function TickControls({ currentDay }: { currentDay: number }) {
  const [pending, start] = useTransition();
  const dayStr = String(currentDay).padStart(3, '0');
  return (
    <div className="flex flex-wrap items-center gap-4">
      {/* Signature: live SIM DAY readout */}
      <div className="flex items-center gap-3 panel px-3 py-1.5">
        <span className="eyebrow">Sim Day</span>
        <span className="font-mono text-lg font-semibold tabular-nums text-text">{dayStr}</span>
        <span className="flex items-center gap-1.5">
          <span
            className={`inline-block h-1.5 w-1.5 rounded-full ${pending ? 'bg-accent animate-pulse' : 'bg-positive'}`}
            aria-hidden
          />
          <span className="eyebrow">{pending ? 'running' : 'live'}</span>
        </span>
      </div>

      <div className="flex items-center gap-2">
        <button
          disabled={pending}
          onClick={() => start(async () => { await advanceDay(); })}
          className="rounded-[var(--radius)] bg-accent px-4 py-2 font-mono text-xs font-semibold uppercase tracking-wider text-bg transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {pending ? 'Advancing…' : 'Advance Day'}
        </button>
        <button
          disabled={pending}
          onClick={() => start(async () => { await advanceDays(7); })}
          className="rounded-[var(--radius)] border border-line px-4 py-2 font-mono text-xs uppercase tracking-wider text-muted transition-colors hover:border-accent hover:text-text disabled:opacity-50"
        >
          Fast-forward +7
        </button>
        <button
          disabled={pending}
          onClick={() => start(async () => { await resetSim(); })}
          className="rounded-[var(--radius)] border border-line px-4 py-2 font-mono text-xs uppercase tracking-wider text-muted transition-colors hover:border-alert hover:text-alert disabled:opacity-50"
        >
          Reset
        </button>
      </div>
    </div>
  );
}

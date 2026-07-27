'use client';

import { useTransition } from 'react';
import { advanceDay, advanceDays, resetSim } from '@/app/actions/tick';

export default function TickControls({ currentDay }: { currentDay: number }) {
  const [pending, start] = useTransition();
  return (
    <div className="flex items-center gap-3">
      <span className="text-sm text-neutral-500">Day {currentDay}</span>
      <button
        disabled={pending}
        onClick={() => start(async () => { await advanceDay(); })}
        className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
      >
        {pending ? 'Advancing…' : 'Advance Day'}
      </button>
      <button
        disabled={pending}
        onClick={() => start(async () => { await advanceDays(7); })}
        className="rounded-md border px-4 py-2 text-sm disabled:opacity-50"
      >
        Fast-forward +7
      </button>
      <button
        disabled={pending}
        onClick={() => start(async () => { await resetSim(); })}
        className="rounded-md border px-4 py-2 text-sm disabled:opacity-50"
      >
        Reset
      </button>
    </div>
  );
}

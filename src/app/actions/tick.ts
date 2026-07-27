'use server';

import { revalidatePath } from 'next/cache';
import { runTick } from '@/lib/sim/engine';
import { runSeed } from '../../../prisma/seed';

export async function advanceDay() {
  const r = await runTick();
  revalidatePath('/dashboard', 'layout');
  return { day: r.day };
}

export async function advanceDays(n: number) {
  const count = Math.max(1, Math.min(30, Math.floor(n))); // cap fast-forward
  let lastDay = 0;
  for (let i = 0; i < count; i++) {
    const r = await runTick();
    lastDay = r.day;
  }
  revalidatePath('/dashboard', 'layout');
  return { day: lastDay };
}

export async function resetSim() {
  // runSeed wipes all data, restores master data + starting inventory, and sets
  // SimState back to day 0 — a complete reset to the replayable starting state.
  await runSeed();
  revalidatePath('/dashboard', 'layout');
}

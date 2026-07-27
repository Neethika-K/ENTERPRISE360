import { describe, it, expect, afterAll } from 'vitest';
import { prisma } from '../../src/lib/db';
import { runSeed } from '../../prisma/seed';
import { runTick } from '@/lib/sim/engine';

// In-process reseed (its own PrismaClient). Runs while the app client is idle,
// so no SQLite write-lock contention.
async function reseed() {
  await runSeed();
}

afterAll(async () => {
  await prisma.$disconnect();
});

describe('runTick (integration, real DB)', () => {
  it('is deterministic: same seed reproduces identical event streams', async () => {
    await reseed();
    const runA: string[] = [];
    for (let i = 0; i < 8; i++) {
      const r = await runTick();
      runA.push(...r.events.map((e) => `${r.day}:${e.eventType}:${e.message}`));
    }

    await reseed();
    const runB: string[] = [];
    for (let i = 0; i < 8; i++) {
      const r = await runTick();
      runB.push(...r.events.map((e) => `${r.day}:${e.eventType}:${e.message}`));
    }

    expect(runB).toEqual(runA);
  }, 60000);

  it('golden path: a reorder → PR → PO → receipt cascade occurs within the first several days', async () => {
    await reseed();
    const seen = new Set<string>();
    for (let i = 0; i < 12; i++) {
      const r = await runTick();
      r.events.forEach((e) => seen.add(e.eventType));
    }
    expect(seen.has('pr_created')).toBe(true);
    expect(seen.has('pr_approved')).toBe(true);
    expect(seen.has('po_placed')).toBe(true);
    expect(seen.has('po_received')).toBe(true);
    expect(seen.has('inventory_replenished')).toBe(true);
  }, 60000);

  it('advances SimState.currentDay by one per tick', async () => {
    await reseed();
    await runTick();
    await runTick();
    const state = await prisma.simState.findUniqueOrThrow({ where: { id: 1 } });
    expect(state.currentDay).toBe(2);
  }, 30000);
});

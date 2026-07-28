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
    expect(seen.has('ticket_opened')).toBe(true);
    expect(seen.has('ticket_resolved')).toBe(true);
    expect(seen.has('return_created')).toBe(true);
  }, 60000);

  it('advances SimState.currentDay by one per tick', async () => {
    await reseed();
    await runTick();
    await runTick();
    const state = await prisma.simState.findUniqueOrThrow({ where: { id: 1 } });
    expect(state.currentDay).toBe(2);
  }, 30000);

  it('reset returns to day 0 with starting stock and no open transactions', async () => {
    await reseed();
    // Advance several days so real transactional data accumulates.
    for (let i = 0; i < 6; i++) await runTick();
    expect(await prisma.order.count()).toBeGreaterThan(0);

    // Reset === reseed (what the resetSim server action calls).
    await reseed();

    const state = await prisma.simState.findUniqueOrThrow({ where: { id: 1 } });
    expect(state.currentDay).toBe(0);
    expect(await prisma.order.count()).toBe(0);
    expect(await prisma.purchaseRequest.count()).toBe(0);
    expect(await prisma.purchaseOrder.count()).toBe(0);
    expect(await prisma.simEvent.count()).toBe(0);
    // Starting stock restored (ELEC-001 seeds at 55 on hand, 0 incoming).
    const elec = await prisma.product.findUniqueOrThrow({ where: { sku: 'ELEC-001' }, include: { inventory: true } });
    expect(elec.inventory?.quantityOnHand).toBe(55);
    expect(elec.inventory?.quantityIncoming).toBe(0);
  }, 30000);
});

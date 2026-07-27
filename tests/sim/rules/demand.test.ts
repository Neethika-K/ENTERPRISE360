import { describe, it, expect, afterAll } from 'vitest';
import { prisma, inRollbackTx, ctxFor, seedMinimal } from '../harness';
import { generateDemand } from '@/lib/sim/rules/demand';

afterAll(async () => { await prisma.$disconnect(); });

describe('generateDemand', () => {
  it('creates orders with lines and emits order_placed events', async () => {
    await inRollbackTx(async (tx) => {
      await seedMinimal(tx, [{ sku: 'A', onHand: 100 }, { sku: 'B', onHand: 100 }]);
      const ctx = ctxFor(tx, 1, 'demand-seed');
      await generateDemand(ctx);
      const orders = await tx.order.findMany({ include: { lines: true } });
      const totalLines = orders.reduce((n, o) => n + o.lines.length, 0);
      expect(totalLines).toBeGreaterThan(0);
      expect(ctx.events.some((e) => e.eventType === 'order_placed')).toBe(true);
      for (const o of orders) {
        const sum = o.lines.reduce((s, l) => s + l.quantity * l.unitPriceAtSale, 0);
        expect(o.totalAmount).toBeCloseTo(sum);
      }
    });
  });

  it('is deterministic for the same seed+day', async () => {
    const counts: number[] = [];
    for (let run = 0; run < 2; run++) {
      await inRollbackTx(async (tx) => {
        await seedMinimal(tx, [{ sku: 'A', onHand: 100 }]);
        const ctx = ctxFor(tx, 3, 'fixed');
        await generateDemand(ctx);
        const lines = await tx.orderLine.aggregate({ _sum: { quantity: true } });
        counts.push(lines._sum.quantity ?? 0);
      });
    }
    expect(counts[0]).toBe(counts[1]);
  });
});

import { describe, it, expect, afterAll } from 'vitest';
import { prisma, inRollbackTx, ctxFor, seedMinimal } from '../harness';
import { snapshotKpis } from '@/lib/sim/rules/kpis';

afterAll(async () => { await prisma.$disconnect(); });

describe('snapshotKpis', () => {
  it('computes revenue, cogs, margin, inventory value and cash', async () => {
    await inRollbackTx(async (tx) => {
      const { products, customer } = await seedMinimal(tx, [{ sku: 'A', onHand: 4 }]); // unitCost 10, price 20
      const order = await tx.order.create({ data: {
        customerId: customer.id, simDay: 1, status: 'fulfilled', totalAmount: 120,
        lines: { create: [{ productId: products[0].id, quantity: 6, unitPriceAtSale: 20, lineStatus: 'fulfilled' }] },
      } });
      await tx.invoice.create({ data: { type: 'customer_ar', relatedOrderId: order.id, amount: 120, simDayIssued: 1, simDayDue: 1, simDayPaid: 1, status: 'paid' } });
      const ctx = ctxFor(tx, 1);
      await snapshotKpis(ctx);
      const snap = await tx.kpiSnapshot.findUnique({ where: { simDay: 1 } });
      expect(snap!.revenue).toBe(120);
      expect(snap!.cogs).toBe(60); // 6 * 10
      expect(snap!.grossMargin).toBe(60);
      expect(snap!.inventoryValue).toBe(40); // 4 on hand * 10
      expect(snap!.cashPosition).toBe(120); // paid AR - paid AP
      expect(snap!.ordersCount).toBe(1);
      expect(ctx.events.some((e) => e.eventType === 'kpi_snapshot')).toBe(true);
    });
  });

  it('upserts (no duplicate row) when run twice for the same day', async () => {
    await inRollbackTx(async (tx) => {
      await seedMinimal(tx, [{ sku: 'A', onHand: 4 }]);
      await snapshotKpis(ctxFor(tx, 1));
      await snapshotKpis(ctxFor(tx, 1));
      expect(await tx.kpiSnapshot.count()).toBe(1);
    });
  });
});

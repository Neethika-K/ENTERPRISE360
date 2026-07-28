import { describe, it, expect, afterAll } from 'vitest';
import { prisma, inRollbackTx, ctxFor, seedMinimal } from '../harness';
import { runReturns, RETURN_LAG } from '@/lib/sim/rules/returns';

afterAll(async () => { await prisma.$disconnect(); });

// Seed an order fulfilled `RETURN_LAG` days before `today`, with one fulfilled line.
async function fulfilledOrder(tx: any, productId: number, customerId: number, today: number, qty = 4) {
  return tx.order.create({
    data: {
      customerId, simDay: today - RETURN_LAG, status: 'fulfilled', totalAmount: qty * 20,
      lines: { create: [{ productId, quantity: qty, unitPriceAtSale: 20, lineStatus: 'fulfilled' }] },
    },
    include: { lines: true },
  });
}

describe('runReturns', () => {
  it('can create a return from a line fulfilled RETURN_LAG days ago, and refunds the customer', async () => {
    // Search seeds until we find one that produces a return (deterministic per seed).
    let found = false;
    for (let s = 0; s < 40 && !found; s++) {
      await inRollbackTx(async (tx) => {
        const { products, customer } = await seedMinimal(tx, [{ sku: 'A', onHand: 10 }]);
        await fulfilledOrder(tx, products[0].id, customer.id, 10, 4);
        const ctx = ctxFor(tx, 10, `ret-${s}`);
        await runReturns(ctx);
        const returns = await tx.return.findMany();
        if (returns.length === 0) return; // this seed didn't roll a return; try next
        found = true;
        const r = returns[0];
        expect(['restock', 'writeoff']).toContain(r.resolution);
        expect(r.refundAmount).toBe(4 * 20);
        const refund = await tx.invoice.findFirst({ where: { type: 'customer_refund' } });
        expect(refund).not.toBeNull();
        expect(refund!.amount).toBe(80);
        expect(ctx.events.some((e) => e.eventType === 'return_created')).toBe(true);
        expect(ctx.events.some((e) => e.eventType === 'refund_issued')).toBe(true);
      });
    }
    expect(found).toBe(true);
  });

  it('restock increases inventory; writeoff does not', async () => {
    let sawRestock = false;
    let sawWriteoff = false;
    for (let s = 0; s < 80 && !(sawRestock && sawWriteoff); s++) {
      await inRollbackTx(async (tx) => {
        const { products, customer } = await seedMinimal(tx, [{ sku: 'A', onHand: 10 }]);
        await fulfilledOrder(tx, products[0].id, customer.id, 10, 4);
        const ctx = ctxFor(tx, 10, `res-${s}`);
        await runReturns(ctx);
        const r = await tx.return.findFirst();
        if (!r) return;
        const inv = await tx.inventory.findUnique({ where: { productId: products[0].id } });
        if (r.resolution === 'restock') {
          sawRestock = true;
          expect(inv!.quantityOnHand).toBe(14); // 10 + 4 returned
        } else {
          sawWriteoff = true;
          expect(inv!.quantityOnHand).toBe(10); // unchanged
        }
      });
    }
    expect(sawRestock).toBe(true);
    expect(sawWriteoff).toBe(true);
  });

  it('does not return lines outside the lag window', async () => {
    await inRollbackTx(async (tx) => {
      const { products, customer } = await seedMinimal(tx, [{ sku: 'A', onHand: 10 }]);
      // fulfilled today (not lag days ago) — never a candidate
      await tx.order.create({ data: {
        customerId: customer.id, simDay: 10, status: 'fulfilled', totalAmount: 80,
        lines: { create: [{ productId: products[0].id, quantity: 4, unitPriceAtSale: 20, lineStatus: 'fulfilled' }] },
      } });
      await runReturns(ctxFor(tx, 10, 'x'));
      expect(await tx.return.count()).toBe(0);
    });
  });
});

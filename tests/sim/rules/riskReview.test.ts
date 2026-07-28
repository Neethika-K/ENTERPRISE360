import { describe, it, expect, afterAll } from 'vitest';
import { prisma, inRollbackTx, ctxFor, seedMinimal } from '../harness';
import { runRiskReview, CHARGEBACK_LAG } from '@/lib/sim/rules/riskReview';

afterAll(async () => { await prisma.$disconnect(); });

async function order(tx: any, customerId: number, productId: number, day: number, data: any = {}) {
  return tx.order.create({
    data: {
      customerId, simDay: day, status: 'placed', totalAmount: 80,
      lines: { create: [{ productId, quantity: 4, unitPriceAtSale: 20, lineStatus: 'backordered' }] },
      ...data,
    },
  });
}

describe('runRiskReview', () => {
  it('flags some new orders as held (across seeds)', async () => {
    let sawHeld = false;
    for (let s = 0; s < 60 && !sawHeld; s++) {
      await inRollbackTx(async (tx) => {
        const { products, customer } = await seedMinimal(tx, [{ sku: 'A', onHand: 0 }]);
        for (let i = 0; i < 6; i++) await order(tx, customer.id, products[0].id, 5);
        const ctx = ctxFor(tx, 5, `flag-${s}`);
        await runRiskReview(ctx);
        const held = await tx.order.count({ where: { reviewStatus: 'held' } });
        if (held > 0) {
          sawHeld = true;
          expect(ctx.events.some((e) => e.eventType === 'order_flagged')).toBe(true);
        }
      });
    }
    expect(sawHeld).toBe(true);
  });

  it('reviews a held order into cleared or rejected; rejected is cancelled', async () => {
    let sawCleared = false;
    let sawRejected = false;
    for (let s = 0; s < 80 && !(sawCleared && sawRejected); s++) {
      await inRollbackTx(async (tx) => {
        const { products, customer } = await seedMinimal(tx, [{ sku: 'A', onHand: 0 }]);
        await order(tx, customer.id, products[0].id, 4, { reviewStatus: 'held' });
        const ctx = ctxFor(tx, 5, `rev-${s}`);
        await runRiskReview(ctx);
        const o = await tx.order.findFirst();
        expect(['cleared', 'rejected']).toContain(o!.reviewStatus);
        expect(o!.reviewSimDay).toBe(5);
        if (o!.reviewStatus === 'cleared') sawCleared = true;
        if (o!.reviewStatus === 'rejected') {
          sawRejected = true;
          expect(o!.status).toBe('cancelled');
        }
      });
    }
    expect(sawCleared).toBe(true);
    expect(sawRejected).toBe(true);
  });

  it('raises exactly one chargeback for a fraudulent cleared+fulfilled order past the lag', async () => {
    await inRollbackTx(async (tx) => {
      const { products, customer } = await seedMinimal(tx, [{ sku: 'A', onHand: 0 }]);
      const o = await order(tx, customer.id, products[0].id, 1, {
        status: 'fulfilled', reviewStatus: 'cleared', reviewSimDay: 1, fraudulent: true, totalAmount: 80,
      });
      const day = 1 + CHARGEBACK_LAG;
      await runRiskReview(ctxFor(tx, day, 'cb'));
      let cbs = await tx.chargeback.findMany();
      expect(cbs).toHaveLength(1);
      expect(cbs[0].amount).toBe(80);
      expect(cbs[0].orderId).toBe(o.id);
      // running again must not duplicate
      await runRiskReview(ctxFor(tx, day + 1, 'cb2'));
      cbs = await tx.chargeback.findMany();
      expect(cbs).toHaveLength(1);
    });
  });

  it('does not chargeback before the lag', async () => {
    await inRollbackTx(async (tx) => {
      const { products, customer } = await seedMinimal(tx, [{ sku: 'A', onHand: 0 }]);
      await order(tx, customer.id, products[0].id, 1, {
        status: 'fulfilled', reviewStatus: 'cleared', reviewSimDay: 1, fraudulent: true,
      });
      await runRiskReview(ctxFor(tx, 1 + CHARGEBACK_LAG - 1, 'early'));
      expect(await tx.chargeback.count()).toBe(0);
    });
  });
});

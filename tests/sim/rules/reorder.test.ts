import { describe, it, expect, afterAll } from 'vitest';
import { prisma, inRollbackTx, ctxFor, seedMinimal } from '../harness';
import { checkReorderPoints } from '@/lib/sim/rules/reorder';

afterAll(async () => { await prisma.$disconnect(); });

describe('checkReorderPoints', () => {
  it('creates a PR when position is below reorder point', async () => {
    await inRollbackTx(async (tx) => {
      await seedMinimal(tx, [{ sku: 'A', onHand: 3, reorderPoint: 10, reorderQuantity: 50 }]);
      const ctx = ctxFor(tx, 2);
      await checkReorderPoints(ctx);
      const prs = await tx.purchaseRequest.findMany();
      expect(prs).toHaveLength(1);
      expect(prs[0].quantityRequested).toBe(50);
      expect(prs[0].status).toBe('pending');
      expect(ctx.events.some((e) => e.eventType === 'pr_created')).toBe(true);
    });
  });

  it('does not duplicate a PR when one is already open', async () => {
    await inRollbackTx(async (tx) => {
      const { products } = await seedMinimal(tx, [{ sku: 'A', onHand: 3, reorderPoint: 10, reorderQuantity: 50 }]);
      await tx.purchaseRequest.create({ data: { productId: products[0].id, simDayCreated: 1, quantityRequested: 50, status: 'pending' } });
      const ctx = ctxFor(tx, 2);
      await checkReorderPoints(ctx);
      expect(await tx.purchaseRequest.count()).toBe(1);
    });
  });

  it('does not create a PR when incoming stock covers the gap', async () => {
    await inRollbackTx(async (tx) => {
      const { products } = await seedMinimal(tx, [{ sku: 'A', onHand: 3, reorderPoint: 10 }]);
      await tx.inventory.update({ where: { productId: products[0].id }, data: { quantityIncoming: 50 } });
      const ctx = ctxFor(tx, 2);
      await checkReorderPoints(ctx);
      expect(await tx.purchaseRequest.count()).toBe(0);
    });
  });
});

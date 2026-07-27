import { describe, it, expect, afterAll } from 'vitest';
import { prisma, inRollbackTx, ctxFor, seedMinimal } from '../harness';
import { approvePurchaseRequests } from '@/lib/sim/rules/approval';

afterAll(async () => { await prisma.$disconnect(); });

describe('approvePurchaseRequests', () => {
  it('auto-approves a low-cost PR immediately', async () => {
    await inRollbackTx(async (tx) => {
      const { products } = await seedMinimal(tx, [{ sku: 'A', onHand: 0 }]); // unitCost=10
      await tx.purchaseRequest.create({ data: { productId: products[0].id, simDayCreated: 2, quantityRequested: 50, status: 'pending' } });
      const ctx = ctxFor(tx, 2);
      await approvePurchaseRequests(ctx);
      const pr = await tx.purchaseRequest.findFirst();
      expect(pr!.status).toBe('approved');
      expect(pr!.approver).toBe('System (auto)');
      expect(ctx.events.some((e) => e.eventType === 'pr_approved')).toBe(true);
    });
  });

  it('holds an expensive PR, then approves after review days elapse', async () => {
    await inRollbackTx(async (tx) => {
      const { products } = await seedMinimal(tx, [{ sku: 'A', onHand: 0 }]);
      await tx.product.update({ where: { id: products[0].id }, data: { unitCost: 200 } }); // 200*50 = 10000 > 5000
      await tx.purchaseRequest.create({ data: { productId: products[0].id, simDayCreated: 2, quantityRequested: 50, status: 'pending' } });

      const held = ctxFor(tx, 2);
      await approvePurchaseRequests(held);
      expect((await tx.purchaseRequest.findFirst())!.status).toBe('pending');

      const later = ctxFor(tx, 4); // 4 - 2 >= 2
      await approvePurchaseRequests(later);
      const pr = await tx.purchaseRequest.findFirst();
      expect(pr!.status).toBe('approved');
      expect(pr!.approver).toBe('Sim Manager');
    });
  });
});

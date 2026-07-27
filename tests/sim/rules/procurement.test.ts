import { describe, it, expect, afterAll } from 'vitest';
import { prisma, inRollbackTx, ctxFor, seedMinimal } from '../harness';
import { placePurchaseOrders } from '@/lib/sim/rules/procurement';

afterAll(async () => { await prisma.$disconnect(); });

describe('placePurchaseOrders', () => {
  it('converts an approved PR into a PO, sets incoming, computes arrival', async () => {
    await inRollbackTx(async (tx) => {
      const { products, supplier } = await seedMinimal(tx, [{ sku: 'A', onHand: 0 }]); // leadTime=3, reliability=1
      await tx.purchaseRequest.create({ data: { productId: products[0].id, simDayCreated: 1, quantityRequested: 50, status: 'approved', approvedSimDay: 2 } });
      const ctx = ctxFor(tx, 2);
      await placePurchaseOrders(ctx);
      const po = await tx.purchaseOrder.findFirst({ include: { lines: true } });
      const inv = await tx.inventory.findUnique({ where: { productId: products[0].id } });
      const pr = await tx.purchaseRequest.findFirst();
      expect(po).not.toBeNull();
      expect(po!.supplierId).toBe(supplier.id);
      expect(po!.expectedSimDayArrival).toBe(5); // day 2 + lead 3 + 0 (reliability 1)
      expect(po!.status).toBe('in_transit');
      expect(po!.lines[0].quantityOrdered).toBe(50);
      expect(inv!.quantityIncoming).toBe(50);
      expect(pr!.status).toBe('converted');
      expect(ctx.events.some((e) => e.eventType === 'po_placed')).toBe(true);
    });
  });

  it('marks the PO delayed when the supplier misses reliability', async () => {
    await inRollbackTx(async (tx) => {
      const { products, supplier } = await seedMinimal(tx, [{ sku: 'A', onHand: 0 }]);
      await tx.supplier.update({ where: { id: supplier.id }, data: { reliabilityPct: 0 } }); // always delayed
      await tx.purchaseRequest.create({ data: { productId: products[0].id, simDayCreated: 1, quantityRequested: 50, status: 'approved', approvedSimDay: 2 } });
      const ctx = ctxFor(tx, 2);
      await placePurchaseOrders(ctx);
      const po = await tx.purchaseOrder.findFirst();
      expect(po!.status).toBe('delayed');
      expect(po!.expectedSimDayArrival).toBeGreaterThan(5);
      expect(ctx.events.some((e) => e.eventType === 'po_delayed')).toBe(true);
    });
  });
});

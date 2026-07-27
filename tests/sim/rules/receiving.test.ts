import { describe, it, expect, afterAll } from 'vitest';
import { prisma, inRollbackTx, ctxFor, seedMinimal } from '../harness';
import { receivePurchaseOrders } from '@/lib/sim/rules/receiving';

afterAll(async () => { await prisma.$disconnect(); });

describe('receivePurchaseOrders', () => {
  it('receives a due PO and replenishes inventory', async () => {
    await inRollbackTx(async (tx) => {
      const { products, supplier } = await seedMinimal(tx, [{ sku: 'A', onHand: 5 }]);
      await tx.inventory.update({ where: { productId: products[0].id }, data: { quantityIncoming: 50 } });
      await tx.purchaseOrder.create({ data: {
        supplierId: supplier.id, simDayPlaced: 1, expectedSimDayArrival: 4, status: 'in_transit', totalCost: 500,
        lines: { create: [{ productId: products[0].id, quantityOrdered: 50, unitCostAtOrder: 10 }] },
      } });
      const ctx = ctxFor(tx, 4);
      await receivePurchaseOrders(ctx);
      const inv = await tx.inventory.findUnique({ where: { productId: products[0].id } });
      const po = await tx.purchaseOrder.findFirst();
      expect(inv!.quantityOnHand).toBe(55);
      expect(inv!.quantityIncoming).toBe(0);
      expect(po!.status).toBe('received');
      expect(po!.actualSimDayArrival).toBe(4);
      expect(ctx.events.some((e) => e.eventType === 'inventory_replenished')).toBe(true);
    });
  });

  it('does not receive a PO before its arrival day', async () => {
    await inRollbackTx(async (tx) => {
      const { products, supplier } = await seedMinimal(tx, [{ sku: 'A', onHand: 5 }]);
      await tx.purchaseOrder.create({ data: {
        supplierId: supplier.id, simDayPlaced: 1, expectedSimDayArrival: 8, status: 'in_transit', totalCost: 500,
        lines: { create: [{ productId: products[0].id, quantityOrdered: 50, unitCostAtOrder: 10 }] },
      } });
      const ctx = ctxFor(tx, 4);
      await receivePurchaseOrders(ctx);
      expect((await tx.purchaseOrder.findFirst())!.status).toBe('in_transit');
    });
  });
});

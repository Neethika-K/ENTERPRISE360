import { describe, it, expect, afterAll } from 'vitest';
import { prisma, inRollbackTx, ctxFor, seedMinimal } from '../harness';
import { runFinance } from '@/lib/sim/rules/finance';

afterAll(async () => { await prisma.$disconnect(); });

describe('runFinance', () => {
  it('issues a paid AR invoice for a fulfilled order', async () => {
    await inRollbackTx(async (tx) => {
      const { products, customer } = await seedMinimal(tx, [{ sku: 'A', onHand: 10 }]);
      await tx.order.create({ data: {
        customerId: customer.id, simDay: 1, status: 'fulfilled', totalAmount: 120,
        lines: { create: [{ productId: products[0].id, quantity: 6, unitPriceAtSale: 20, lineStatus: 'fulfilled' }] },
      } });
      const ctx = ctxFor(tx, 1);
      await runFinance(ctx);
      const inv = await tx.invoice.findFirst();
      expect(inv!.type).toBe('customer_ar');
      expect(inv!.status).toBe('paid');
      expect(inv!.amount).toBe(120);
    });
  });

  it('issues a paid AP invoice for a PO received today and is idempotent', async () => {
    await inRollbackTx(async (tx) => {
      const { products, supplier } = await seedMinimal(tx, [{ sku: 'A', onHand: 10 }]);
      await tx.purchaseOrder.create({ data: {
        supplierId: supplier.id, simDayPlaced: 1, expectedSimDayArrival: 3,
        status: 'received', actualSimDayArrival: 3, totalCost: 500,
        lines: { create: [{ productId: products[0].id, quantityOrdered: 50, unitCostAtOrder: 10 }] },
      } });
      const ctx1 = ctxFor(tx, 3); await runFinance(ctx1);
      const ctx2 = ctxFor(tx, 3); await runFinance(ctx2); // second run must not duplicate
      const aps = await tx.invoice.findMany({ where: { type: 'supplier_ap' } });
      expect(aps).toHaveLength(1);
      expect(aps[0].amount).toBe(500);
    });
  });
});

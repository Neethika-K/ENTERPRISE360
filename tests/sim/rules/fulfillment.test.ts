import { describe, it, expect, afterAll } from 'vitest';
import { prisma, inRollbackTx, ctxFor, seedMinimal } from '../harness';
import { fulfillOrders } from '@/lib/sim/rules/fulfillment';

afterAll(async () => { await prisma.$disconnect(); });

describe('fulfillOrders', () => {
  it('fulfills when stock suffices and decrements inventory', async () => {
    await inRollbackTx(async (tx) => {
      const { products, customer } = await seedMinimal(tx, [{ sku: 'A', onHand: 10 }]);
      await tx.order.create({ data: {
        customerId: customer.id, simDay: 1, status: 'placed', totalAmount: 60,
        lines: { create: [{ productId: products[0].id, quantity: 3, unitPriceAtSale: 20, lineStatus: 'backordered' }] },
      } });
      const ctx = ctxFor(tx, 1);
      await fulfillOrders(ctx);
      const inv = await tx.inventory.findUnique({ where: { productId: products[0].id } });
      const line = await tx.orderLine.findFirst();
      expect(inv!.quantityOnHand).toBe(7);
      expect(line!.lineStatus).toBe('fulfilled');
      expect(ctx.events.some((e) => e.eventType === 'inventory_decremented')).toBe(true);
    });
  });

  it('does not fulfil an order held for risk review', async () => {
    await inRollbackTx(async (tx) => {
      const { products, customer } = await seedMinimal(tx, [{ sku: 'A', onHand: 10 }]);
      await tx.order.create({ data: {
        customerId: customer.id, simDay: 1, status: 'placed', totalAmount: 60, reviewStatus: 'held',
        lines: { create: [{ productId: products[0].id, quantity: 3, unitPriceAtSale: 20, lineStatus: 'backordered' }] },
      } });
      const ctx = ctxFor(tx, 1);
      await fulfillOrders(ctx);
      const inv = await tx.inventory.findUnique({ where: { productId: products[0].id } });
      const order = await tx.order.findFirst();
      expect(inv!.quantityOnHand).toBe(10); // untouched
      expect(order!.status).toBe('placed'); // still awaiting review
    });
  });

  it('backorders when stock is insufficient and does not go negative', async () => {
    await inRollbackTx(async (tx) => {
      const { products, customer } = await seedMinimal(tx, [{ sku: 'A', onHand: 2 }]);
      await tx.order.create({ data: {
        customerId: customer.id, simDay: 1, status: 'placed', totalAmount: 100,
        lines: { create: [{ productId: products[0].id, quantity: 5, unitPriceAtSale: 20, lineStatus: 'backordered' }] },
      } });
      const ctx = ctxFor(tx, 1);
      await fulfillOrders(ctx);
      const inv = await tx.inventory.findUnique({ where: { productId: products[0].id } });
      const order = await tx.order.findFirst();
      expect(inv!.quantityOnHand).toBe(2);
      expect(order!.status).toBe('backordered');
      expect(ctx.events.some((e) => e.eventType === 'backorder')).toBe(true);
    });
  });
});

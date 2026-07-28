import { describe, it, expect, afterAll } from 'vitest';
import { prisma, inRollbackTx, ctxFor, seedMinimal } from '../harness';
import { runCustomerService } from '@/lib/sim/rules/customerService';

afterAll(async () => { await prisma.$disconnect(); });

describe('runCustomerService', () => {
  it('opens a backorder ticket for an order backordered today', async () => {
    await inRollbackTx(async (tx) => {
      const { products, customer } = await seedMinimal(tx, [{ sku: 'A', onHand: 0 }]);
      await tx.order.create({ data: {
        customerId: customer.id, simDay: 3, status: 'backordered', totalAmount: 100,
        lines: { create: [{ productId: products[0].id, quantity: 5, unitPriceAtSale: 20, lineStatus: 'backordered' }] },
      } });
      const ctx = ctxFor(tx, 3);
      await runCustomerService(ctx);
      const tickets = await tx.supportTicket.findMany();
      expect(tickets).toHaveLength(1);
      expect(tickets[0].category).toBe('backorder');
      expect(tickets[0].status).toBe('open');
      expect(tickets[0].simDayTarget).toBeGreaterThanOrEqual(3);
      expect(ctx.events.some((e) => e.eventType === 'ticket_opened')).toBe(true);
    });
  });

  it('resolves an open ticket once its handling time elapses, with a CSAT 1..5', async () => {
    await inRollbackTx(async (tx) => {
      const { customer } = await seedMinimal(tx, [{ sku: 'A', onHand: 0 }]);
      await tx.supportTicket.create({ data: {
        customerId: customer.id, category: 'backorder', simDayOpened: 1, simDayTarget: 2, status: 'open',
      } });
      const ctx = ctxFor(tx, 5); // well past target
      await runCustomerService(ctx);
      const t = await tx.supportTicket.findFirst();
      expect(t!.status).toBe('resolved');
      expect(t!.simDayResolved).toBe(5);
      expect(t!.csatScore).toBeGreaterThanOrEqual(1);
      expect(t!.csatScore).toBeLessThanOrEqual(5);
      expect(ctx.events.some((e) => e.eventType === 'ticket_resolved')).toBe(true);
    });
  });

  it('does not resolve before the target day', async () => {
    await inRollbackTx(async (tx) => {
      const { customer } = await seedMinimal(tx, [{ sku: 'A', onHand: 0 }]);
      await tx.supportTicket.create({ data: {
        customerId: customer.id, category: 'backorder', simDayOpened: 1, simDayTarget: 6, status: 'open',
      } });
      await runCustomerService(ctxFor(tx, 3));
      expect((await tx.supportTicket.findFirst())!.status).toBe('open');
    });
  });
});

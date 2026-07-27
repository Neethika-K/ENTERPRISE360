import { randInt, chance } from '../rng';
import { pushEvent } from '../events';
import type { RuleFn } from '../types';

export const generateDemand: RuleFn = async (ctx) => {
  const products = await ctx.tx.product.findMany({ orderBy: { id: 'asc' } });
  const customers = await ctx.tx.customer.findMany({ orderBy: { id: 'asc' } });
  if (customers.length === 0) return;

  for (const p of products) {
    const spike = chance(ctx.rng, 0.12);
    let qty = randInt(ctx.rng, 0, 8);
    if (spike && qty > 0) qty *= randInt(ctx.rng, 2, 3);
    if (qty <= 0) continue;

    const customer = customers[randInt(ctx.rng, 0, customers.length - 1)];
    const order = await ctx.tx.order.create({
      data: {
        customerId: customer.id, simDay: ctx.day, status: 'placed',
        totalAmount: qty * p.unitPrice,
        lines: { create: [{ productId: p.id, quantity: qty, unitPriceAtSale: p.unitPrice, lineStatus: 'backordered' }] },
      },
    });
    if (spike) {
      pushEvent(ctx, {
        eventType: 'demand_spike', entityType: 'product', entityId: p.id,
        message: `Demand spike for ${p.sku}: ${qty} units ordered`, payload: { productId: p.id, qty },
      });
    }
    pushEvent(ctx, {
      eventType: 'order_placed', entityType: 'order', entityId: order.id,
      message: `Order #${order.id} placed by ${customer.name}: ${qty} × ${p.sku}`,
      payload: { orderId: order.id, productId: p.id, qty },
    });
  }
};

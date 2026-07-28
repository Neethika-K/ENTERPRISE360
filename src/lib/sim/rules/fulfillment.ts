import { pushEvent } from '../events';
import type { RuleFn } from '../types';

export const fulfillOrders: RuleFn = async (ctx) => {
  const orders = await ctx.tx.order.findMany({
    where: { status: 'placed', reviewStatus: { not: 'held' } }, include: { lines: true }, orderBy: { id: 'asc' },
  });
  for (const order of orders) {
    let anyBackorder = false;
    for (const line of order.lines) {
      const inv = await ctx.tx.inventory.findUnique({ where: { productId: line.productId } });
      if (inv && inv.quantityOnHand >= line.quantity) {
        await ctx.tx.inventory.update({
          where: { productId: line.productId },
          data: { quantityOnHand: inv.quantityOnHand - line.quantity, updatedSimDay: ctx.day },
        });
        await ctx.tx.orderLine.update({ where: { id: line.id }, data: { lineStatus: 'fulfilled' } });
        pushEvent(ctx, {
          eventType: 'inventory_decremented', entityType: 'product', entityId: line.productId,
          message: `Fulfilled ${line.quantity} of product #${line.productId}; stock ${inv.quantityOnHand} → ${inv.quantityOnHand - line.quantity}`,
          payload: { productId: line.productId, qty: line.quantity, before: inv.quantityOnHand, after: inv.quantityOnHand - line.quantity },
        });
      } else {
        anyBackorder = true;
        pushEvent(ctx, {
          eventType: 'backorder', entityType: 'order', entityId: order.id,
          message: `Backorder: order #${order.id} needs ${line.quantity} of product #${line.productId}, only ${inv?.quantityOnHand ?? 0} on hand`,
          payload: { orderId: order.id, productId: line.productId, needed: line.quantity, onHand: inv?.quantityOnHand ?? 0 },
        });
      }
    }
    await ctx.tx.order.update({ where: { id: order.id }, data: { status: anyBackorder ? 'backordered' : 'fulfilled' } });
  }
};

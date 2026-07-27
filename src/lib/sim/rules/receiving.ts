import { pushEvent } from '../events';
import type { RuleFn } from '../types';

export const receivePurchaseOrders: RuleFn = async (ctx) => {
  const pos = await ctx.tx.purchaseOrder.findMany({
    where: { status: { in: ['in_transit', 'delayed'] }, expectedSimDayArrival: { lte: ctx.day } },
    include: { lines: true }, orderBy: { id: 'asc' },
  });
  for (const po of pos) {
    for (const line of po.lines) {
      await ctx.tx.purchaseOrderLine.update({ where: { id: line.id }, data: { quantityReceived: line.quantityOrdered } });
      await ctx.tx.inventory.update({
        where: { productId: line.productId },
        data: {
          quantityOnHand: { increment: line.quantityOrdered },
          quantityIncoming: { decrement: line.quantityOrdered },
          updatedSimDay: ctx.day,
        },
      });
      pushEvent(ctx, {
        eventType: 'inventory_replenished', entityType: 'product', entityId: line.productId,
        message: `Received ${line.quantityOrdered} of product #${line.productId} from PO #${po.id}`,
        payload: { poId: po.id, productId: line.productId, qty: line.quantityOrdered },
      });
    }
    await ctx.tx.purchaseOrder.update({ where: { id: po.id }, data: { status: 'received', actualSimDayArrival: ctx.day } });
    pushEvent(ctx, {
      eventType: 'po_received', entityType: 'purchase_order', entityId: po.id,
      message: `PO #${po.id} received on day ${ctx.day} (ETA was ${po.expectedSimDayArrival})`,
      payload: { poId: po.id, onTime: ctx.day <= po.expectedSimDayArrival },
    });
  }
};

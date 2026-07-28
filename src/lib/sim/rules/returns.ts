import { chance } from '../rng';
import { pushEvent } from '../events';
import type { RuleFn } from '../types';

export const RETURN_LAG = 3; // days after fulfilment a return may arrive
const RETURN_RATE = 0.1; // chance a fulfilled line comes back
const RESTOCK_RATE = 0.7; // of returns, share that go back to stock (rest written off)

export const runReturns: RuleFn = async (ctx) => {
  // Candidate lines: fulfilled, from orders fulfilled exactly RETURN_LAG days ago.
  const lines = await ctx.tx.orderLine.findMany({
    where: { lineStatus: 'fulfilled', order: { status: 'fulfilled', simDay: ctx.day - RETURN_LAG } },
    orderBy: { id: 'asc' },
  });

  for (const line of lines) {
    if (!chance(ctx.rng, RETURN_RATE)) continue;
    const resolution = chance(ctx.rng, RESTOCK_RATE) ? 'restock' : 'writeoff';
    const refundAmount = line.quantity * line.unitPriceAtSale;

    const ret = await ctx.tx.return.create({
      data: {
        orderId: line.orderId, orderLineId: line.id, productId: line.productId,
        quantity: line.quantity, simDayCreated: ctx.day, resolution, refundAmount,
      },
    });
    pushEvent(ctx, {
      eventType: 'return_created', entityType: 'return', entityId: ret.id,
      message: `Return #${ret.id}: ${line.quantity} × product #${line.productId} from order #${line.orderId}`,
      payload: { returnId: ret.id, orderId: line.orderId, productId: line.productId, qty: line.quantity, resolution },
    });

    if (resolution === 'restock') {
      await ctx.tx.inventory.update({
        where: { productId: line.productId },
        data: { quantityOnHand: { increment: line.quantity }, updatedSimDay: ctx.day },
      });
      pushEvent(ctx, {
        eventType: 'return_restocked', entityType: 'product', entityId: line.productId,
        message: `Restocked ${line.quantity} of product #${line.productId} from return #${ret.id}`,
        payload: { returnId: ret.id, productId: line.productId, qty: line.quantity },
      });
    } else {
      pushEvent(ctx, {
        eventType: 'return_writeoff', entityType: 'return', entityId: ret.id,
        message: `Wrote off ${line.quantity} of product #${line.productId} (return #${ret.id})`,
        payload: { returnId: ret.id, productId: line.productId, qty: line.quantity },
      });
    }

    // Refund the customer (cash out) as a paid refund invoice.
    const refund = await ctx.tx.invoice.create({
      data: {
        type: 'customer_refund', relatedOrderId: line.orderId, amount: refundAmount,
        simDayIssued: ctx.day, simDayDue: ctx.day, simDayPaid: ctx.day, status: 'paid',
      },
    });
    pushEvent(ctx, {
      eventType: 'refund_issued', entityType: 'invoice', entityId: refund.id,
      message: `Refund #${refund.id} issued: $${refundAmount.toFixed(0)} (order #${line.orderId})`,
      payload: { invoiceId: refund.id, orderId: line.orderId, amount: refundAmount },
    });
  }
};

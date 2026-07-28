import { chance } from '../rng';
import { pushEvent } from '../events';
import type { RuleFn } from '../types';

const FLAG_RATE = 0.1; // chance a new order is flagged risky
const CLEAR_RATE = 0.8; // of reviewed orders, share cleared (rest rejected)
const FRAUD_RATE = 0.35; // of cleared risky orders, share that are actually fraud
export const CHARGEBACK_LAG = 3; // days after review a fraudulent order charges back

export const runRiskReview: RuleFn = async (ctx) => {
  // 1. Review orders held from a prior tick.
  const held = await ctx.tx.order.findMany({ where: { reviewStatus: 'held' }, orderBy: { id: 'asc' } });
  for (const o of held) {
    if (chance(ctx.rng, CLEAR_RATE)) {
      const fraudulent = chance(ctx.rng, FRAUD_RATE);
      await ctx.tx.order.update({
        where: { id: o.id }, data: { reviewStatus: 'cleared', reviewSimDay: ctx.day, fraudulent },
      });
      pushEvent(ctx, {
        eventType: 'order_cleared', entityType: 'order', entityId: o.id,
        message: `Order #${o.id} cleared risk review`, payload: { orderId: o.id },
      });
    } else {
      await ctx.tx.order.update({
        where: { id: o.id }, data: { reviewStatus: 'rejected', reviewSimDay: ctx.day, status: 'cancelled' },
      });
      pushEvent(ctx, {
        eventType: 'order_rejected', entityType: 'order', entityId: o.id,
        message: `Order #${o.id} rejected by risk review (cancelled)`, payload: { orderId: o.id },
      });
    }
  }

  // 2. Flag new orders created today.
  const fresh = await ctx.tx.order.findMany({
    where: { simDay: ctx.day, reviewStatus: 'none', status: 'placed' }, orderBy: { id: 'asc' },
  });
  for (const o of fresh) {
    if (!chance(ctx.rng, FLAG_RATE)) continue;
    await ctx.tx.order.update({ where: { id: o.id }, data: { reviewStatus: 'held' } });
    pushEvent(ctx, {
      eventType: 'order_flagged', entityType: 'order', entityId: o.id,
      message: `Order #${o.id} flagged for risk review — held`, payload: { orderId: o.id },
    });
  }

  // 3. Chargebacks for fraudulent cleared+fulfilled orders past the lag, once each.
  const fraudOrders = await ctx.tx.order.findMany({
    where: {
      fraudulent: true, status: 'fulfilled', reviewSimDay: { lte: ctx.day - CHARGEBACK_LAG },
      chargebacks: { none: {} },
    },
    orderBy: { id: 'asc' },
  });
  for (const o of fraudOrders) {
    const cb = await ctx.tx.chargeback.create({
      data: { orderId: o.id, amount: o.totalAmount, simDayCreated: ctx.day },
    });
    pushEvent(ctx, {
      eventType: 'chargeback', entityType: 'order', entityId: o.id,
      message: `Chargeback #${cb.id}: $${o.totalAmount.toFixed(0)} on fraudulent order #${o.id}`,
      payload: { chargebackId: cb.id, orderId: o.id, amount: o.totalAmount },
    });
  }
};

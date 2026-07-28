import { pushEvent } from '../events';
import type { RuleFn } from '../types';

export const snapshotKpis: RuleFn = async (ctx) => {
  const day = ctx.day;

  const arToday = await ctx.tx.invoice.findMany({ where: { type: 'customer_ar', simDayIssued: day } });
  const revenue = arToday.reduce((s, i) => s + i.amount, 0);

  // COGS recognized on the same day as revenue: fulfilled lines of the orders invoiced
  // today (handles held-then-cleared orders fulfilled later than their creation day).
  const invoicedOrderIds = arToday
    .map((i) => i.relatedOrderId)
    .filter((id): id is number => id != null);
  const fulfilledLines = await ctx.tx.orderLine.findMany({
    where: { lineStatus: 'fulfilled', orderId: { in: invoicedOrderIds } }, include: { product: true },
  });
  const cogs = fulfilledLines.reduce((s, l) => s + l.quantity * l.product.unitCost, 0);

  const ordersCount = await ctx.tx.order.count({ where: { simDay: day } });
  const backorderCount = await ctx.tx.order.count({ where: { simDay: day, status: 'backordered' } });

  const products = await ctx.tx.product.findMany({ include: { inventory: true } });
  const inventoryValue = products.reduce((s, p) => s + (p.inventory?.quantityOnHand ?? 0) * p.unitCost, 0);

  const openPrCount = await ctx.tx.purchaseRequest.count({ where: { status: { in: ['pending', 'approved'] } } });
  const openPoCount = await ctx.tx.purchaseOrder.count({ where: { status: { in: ['placed', 'in_transit', 'delayed'] } } });

  const receivedPos = await ctx.tx.purchaseOrder.findMany({ where: { status: 'received' } });
  const onTime = receivedPos.filter((p) => (p.actualSimDayArrival ?? Infinity) <= p.expectedSimDayArrival).length;
  const onTimeDeliveryPct = receivedPos.length ? onTime / receivedPos.length : 0;

  const paidAr = await ctx.tx.invoice.aggregate({
    _sum: { amount: true }, where: { type: 'customer_ar', status: 'paid', simDayPaid: { lte: day } },
  });
  const paidAp = await ctx.tx.invoice.aggregate({
    _sum: { amount: true }, where: { type: 'supplier_ap', status: 'paid', simDayPaid: { lte: day } },
  });
  const paidRefunds = await ctx.tx.invoice.aggregate({
    _sum: { amount: true }, where: { type: 'customer_refund', status: 'paid', simDayPaid: { lte: day } },
  });
  const refundsValue = paidRefunds._sum.amount ?? 0;
  const chargebacksAgg = await ctx.tx.chargeback.aggregate({ _sum: { amount: true } });
  const chargebacksValue = chargebacksAgg._sum.amount ?? 0;
  const ordersHeld = await ctx.tx.order.count({ where: { reviewStatus: 'held' } });
  const cashPosition =
    (paidAr._sum.amount ?? 0) - (paidAp._sum.amount ?? 0) - refundsValue - chargebacksValue;

  // Returns KPI (cumulative returns ÷ cumulative fulfilled order lines).
  const totalReturns = await ctx.tx.return.count();
  const totalFulfilledLines = await ctx.tx.orderLine.count({ where: { lineStatus: 'fulfilled' } });
  const returnRate = totalFulfilledLines ? totalReturns / totalFulfilledLines : 0;

  // Customer Service KPIs (cumulative over resolved tickets).
  const openTickets = await ctx.tx.supportTicket.count({
    where: { status: { in: ['open', 'in_progress'] } },
  });
  const resolved = await ctx.tx.supportTicket.findMany({
    where: { status: 'resolved', csatScore: { not: null } },
  });
  const resolvedCount = resolved.length;
  const avgResolutionDays = resolvedCount
    ? resolved.reduce((s, t) => s + ((t.simDayResolved ?? t.simDayOpened) - t.simDayOpened), 0) / resolvedCount
    : 0;
  const csat = resolvedCount ? resolved.reduce((s, t) => s + (t.csatScore ?? 0), 0) / resolvedCount : 0;
  const promoters = resolved.filter((t) => (t.csatScore ?? 0) >= 4).length;
  const detractors = resolved.filter((t) => (t.csatScore ?? 0) <= 2).length;
  const nps = resolvedCount ? Math.round(((promoters - detractors) / resolvedCount) * 100) : 0;

  const data = {
    revenue, cogs, grossMargin: revenue - cogs, ordersCount, backorderCount,
    inventoryValue, openPrCount, openPoCount, onTimeDeliveryPct, cashPosition,
    openTickets, avgResolutionDays, csat, nps,
    returnRate, refundsValue,
    ordersHeld, chargebacksValue,
  };

  await ctx.tx.kpiSnapshot.upsert({ where: { simDay: day }, create: { simDay: day, ...data }, update: data });

  pushEvent(ctx, {
    eventType: 'kpi_snapshot', entityType: 'kpi', entityId: day,
    message: `Day ${day} KPIs: revenue $${revenue.toFixed(0)}, margin $${(revenue - cogs).toFixed(0)}, backorders ${backorderCount}`,
    payload: data,
  });
};

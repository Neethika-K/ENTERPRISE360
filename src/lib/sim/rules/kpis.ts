import { pushEvent } from '../events';
import type { RuleFn } from '../types';

export const snapshotKpis: RuleFn = async (ctx) => {
  const day = ctx.day;

  const arToday = await ctx.tx.invoice.findMany({ where: { type: 'customer_ar', simDayIssued: day } });
  const revenue = arToday.reduce((s, i) => s + i.amount, 0);

  const fulfilledLines = await ctx.tx.orderLine.findMany({
    where: { lineStatus: 'fulfilled', order: { simDay: day } }, include: { product: true },
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
  const cashPosition = (paidAr._sum.amount ?? 0) - (paidAp._sum.amount ?? 0);

  const data = {
    revenue, cogs, grossMargin: revenue - cogs, ordersCount, backorderCount,
    inventoryValue, openPrCount, openPoCount, onTimeDeliveryPct, cashPosition,
  };

  await ctx.tx.kpiSnapshot.upsert({ where: { simDay: day }, create: { simDay: day, ...data }, update: data });

  pushEvent(ctx, {
    eventType: 'kpi_snapshot', entityType: 'kpi', entityId: day,
    message: `Day ${day} KPIs: revenue $${revenue.toFixed(0)}, margin $${(revenue - cogs).toFixed(0)}, backorders ${backorderCount}`,
    payload: data,
  });
};

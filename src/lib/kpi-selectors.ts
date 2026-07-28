import { prisma } from '@/lib/db';

export async function getCurrentDay(): Promise<number> {
  const state = await prisma.simState.findUnique({ where: { id: 1 } });
  return state?.currentDay ?? 0;
}

export async function getKpiTrend() {
  const rows = await prisma.kpiSnapshot.findMany({ orderBy: { simDay: 'asc' } });
  return rows.map((r) => ({
    label: `D${r.simDay}`,
    revenue: r.revenue,
    grossMargin: r.grossMargin,
    cashPosition: r.cashPosition,
    backorderCount: r.backorderCount,
    inventoryValue: r.inventoryValue,
    onTimeDeliveryPct: r.onTimeDeliveryPct,
    openPoCount: r.openPoCount,
    openPrCount: r.openPrCount,
    nps: r.nps,
    csat: r.csat,
    openTickets: r.openTickets,
    returnRate: r.returnRate,
    refundsValue: r.refundsValue,
    ordersHeld: r.ordersHeld,
    chargebacksValue: r.chargebacksValue,
  }));
}

export async function getRiskSummary() {
  const kpi = await prisma.kpiSnapshot.findFirst({ orderBy: { simDay: 'desc' } });
  const ordersRejected = await prisma.order.count({ where: { reviewStatus: 'rejected' } });
  const recentChargebacks = await prisma.chargeback.findMany({ orderBy: { id: 'desc' }, take: 6 });
  return {
    ordersHeld: kpi?.ordersHeld ?? 0,
    ordersRejected,
    chargebacksValue: kpi?.chargebacksValue ?? 0,
    recentChargebacks,
  };
}

export async function getCustomerServiceSummary() {
  const kpi = await prisma.kpiSnapshot.findFirst({ orderBy: { simDay: 'desc' } });
  const openTickets = await prisma.supportTicket.findMany({
    where: { status: { in: ['open', 'in_progress'] } },
    include: { customer: true },
    orderBy: { id: 'desc' },
    take: 12,
  });
  return {
    nps: kpi?.nps ?? 0,
    csat: kpi?.csat ?? 0,
    openTicketCount: kpi?.openTickets ?? 0,
    avgResolutionDays: kpi?.avgResolutionDays ?? 0,
    openTickets,
  };
}

export async function getLatestKpi() {
  return prisma.kpiSnapshot.findFirst({ orderBy: { simDay: 'desc' } });
}

export async function getRecentEvents(limit = 25) {
  const rows = await prisma.simEvent.findMany({
    orderBy: [{ simDay: 'desc' }, { sequence: 'desc' }],
    take: limit,
  });
  return rows.map((r) => ({ simDay: r.simDay, eventType: r.eventType, message: r.message }));
}

export async function getInventoryStatus() {
  const products = await prisma.product.findMany({ include: { inventory: true }, orderBy: { sku: 'asc' } });
  return products.map((p) => ({
    sku: p.sku,
    name: p.name,
    onHand: p.inventory?.quantityOnHand ?? 0,
    incoming: p.inventory?.quantityIncoming ?? 0,
    reorderPoint: p.reorderPoint,
  }));
}

export async function getOpenProcurement() {
  const prs = await prisma.purchaseRequest.findMany({
    where: { status: { in: ['pending', 'approved'] } },
    include: { product: true },
    orderBy: { id: 'desc' },
  });
  const pos = await prisma.purchaseOrder.findMany({
    where: { status: { in: ['placed', 'in_transit', 'delayed'] } },
    include: { supplier: true, lines: { include: { product: true } } },
    orderBy: { id: 'desc' },
  });
  return { prs, pos };
}

export async function getSalesSummary() {
  const day = await getCurrentDay();
  const lines = await prisma.orderLine.findMany({ where: { order: { simDay: day } }, include: { product: true } });
  const fulfilled = lines.filter((l) => l.lineStatus === 'fulfilled').reduce((s, l) => s + l.quantity, 0);
  const backordered = lines.filter((l) => l.lineStatus === 'backordered').reduce((s, l) => s + l.quantity, 0);
  const bySku = new Map<string, number>();
  for (const l of lines) bySku.set(l.product.sku, (bySku.get(l.product.sku) ?? 0) + l.quantity);
  const topSkus = [...bySku.entries()]
    .map(([sku, qty]) => ({ sku, qty }))
    .sort((a, b) => b.qty - a.qty)
    .slice(0, 5);
  const ordersCount = await prisma.order.count({ where: { simDay: day } });
  const latestKpi = await prisma.kpiSnapshot.findFirst({ orderBy: { simDay: 'desc' } });
  const recentReturns = await prisma.return.findMany({
    include: { product: true },
    orderBy: { id: 'desc' },
    take: 8,
  });
  return {
    day,
    ordersCount,
    fulfilled,
    backordered,
    topSkus,
    returnRate: latestKpi?.returnRate ?? 0,
    recentReturns,
  };
}

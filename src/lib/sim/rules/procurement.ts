import { randInt, chance } from '../rng';
import { pushEvent } from '../events';
import type { RuleFn } from '../types';

export const placePurchaseOrders: RuleFn = async (ctx) => {
  const prs = await ctx.tx.purchaseRequest.findMany({
    where: { status: 'approved' }, include: { product: { include: { supplier: true } } }, orderBy: { id: 'asc' },
  });
  for (const pr of prs) {
    const supplier = pr.product.supplier;
    const onTime = chance(ctx.rng, supplier.reliabilityPct);
    const delay = onTime ? 0 : randInt(ctx.rng, 1, 3);
    const expected = ctx.day + supplier.leadTimeDays + delay;
    const totalCost = pr.quantityRequested * pr.product.unitCost;

    const po = await ctx.tx.purchaseOrder.create({
      data: {
        supplierId: supplier.id, purchaseRequestId: pr.id, simDayPlaced: ctx.day,
        expectedSimDayArrival: expected, status: delay > 0 ? 'delayed' : 'in_transit', totalCost,
        lines: { create: [{ productId: pr.productId, quantityOrdered: pr.quantityRequested, unitCostAtOrder: pr.product.unitCost }] },
      },
    });
    await ctx.tx.purchaseRequest.update({ where: { id: pr.id }, data: { status: 'converted' } });
    await ctx.tx.inventory.update({
      where: { productId: pr.productId },
      data: { quantityIncoming: { increment: pr.quantityRequested } },
    });

    pushEvent(ctx, {
      eventType: 'po_placed', entityType: 'purchase_order', entityId: po.id,
      message: `PO #${po.id} placed with ${supplier.name} for ${pr.quantityRequested} × ${pr.product.sku}, ETA day ${expected}`,
      payload: { poId: po.id, supplierId: supplier.id, qty: pr.quantityRequested, expected },
    });
    if (delay > 0) {
      pushEvent(ctx, {
        eventType: 'po_delayed', entityType: 'purchase_order', entityId: po.id,
        message: `PO #${po.id} delayed by ${delay} day(s) — ${supplier.name} missed its reliability window`,
        payload: { poId: po.id, delay },
      });
    }
  }
};

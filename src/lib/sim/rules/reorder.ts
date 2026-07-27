import { pushEvent } from '../events';
import type { RuleFn } from '../types';

export const checkReorderPoints: RuleFn = async (ctx) => {
  const products = await ctx.tx.product.findMany({ include: { inventory: true }, orderBy: { id: 'asc' } });
  for (const p of products) {
    const inv = p.inventory;
    if (!inv) continue;
    const position = inv.quantityOnHand + inv.quantityIncoming;
    if (position >= p.reorderPoint) continue;

    const openPr = await ctx.tx.purchaseRequest.count({
      where: { productId: p.id, status: { in: ['pending', 'approved'] } },
    });
    const openPo = await ctx.tx.purchaseOrderLine.count({
      where: { productId: p.id, purchaseOrder: { status: { in: ['placed', 'in_transit', 'delayed'] } } },
    });
    if (openPr > 0 || openPo > 0) continue;

    const pr = await ctx.tx.purchaseRequest.create({
      data: { productId: p.id, simDayCreated: ctx.day, quantityRequested: p.reorderQuantity, status: 'pending' },
    });
    pushEvent(ctx, {
      eventType: 'reorder_triggered', entityType: 'product', entityId: p.id,
      message: `Reorder point (${p.reorderPoint}) breached for ${p.sku} (position ${position})`,
      payload: { productId: p.id, position, reorderPoint: p.reorderPoint },
    });
    pushEvent(ctx, {
      eventType: 'pr_created', entityType: 'purchase_request', entityId: pr.id,
      message: `Purchase Request #${pr.id} created for ${p.reorderQuantity} × ${p.sku}`,
      payload: { prId: pr.id, productId: p.id, qty: p.reorderQuantity },
    });
  }
};

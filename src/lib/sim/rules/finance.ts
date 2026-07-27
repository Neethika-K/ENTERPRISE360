import { pushEvent } from '../events';
import type { RuleFn } from '../types';

export const runFinance: RuleFn = async (ctx) => {
  // AR: fulfilled orders from today without an invoice
  const orders = await ctx.tx.order.findMany({
    where: { simDay: ctx.day, status: 'fulfilled', invoices: { none: {} } }, orderBy: { id: 'asc' },
  });
  for (const o of orders) {
    const inv = await ctx.tx.invoice.create({
      data: {
        type: 'customer_ar', relatedOrderId: o.id, amount: o.totalAmount,
        simDayIssued: ctx.day, simDayDue: ctx.day, simDayPaid: ctx.day, status: 'paid',
      },
    });
    pushEvent(ctx, {
      eventType: 'invoice_issued', entityType: 'invoice', entityId: inv.id,
      message: `AR invoice #${inv.id} issued & paid for order #${o.id}: $${o.totalAmount.toFixed(0)}`,
      payload: { invoiceId: inv.id, orderId: o.id, amount: o.totalAmount },
    });
    pushEvent(ctx, {
      eventType: 'invoice_paid', entityType: 'invoice', entityId: inv.id,
      message: `Payment received: $${o.totalAmount.toFixed(0)} (order #${o.id})`, payload: { invoiceId: inv.id },
    });
  }

  // AP: POs received today without an invoice
  const pos = await ctx.tx.purchaseOrder.findMany({
    where: { actualSimDayArrival: ctx.day, status: 'received', invoices: { none: {} } }, orderBy: { id: 'asc' },
  });
  for (const po of pos) {
    const inv = await ctx.tx.invoice.create({
      data: {
        type: 'supplier_ap', relatedPoId: po.id, amount: po.totalCost,
        simDayIssued: ctx.day, simDayDue: ctx.day, simDayPaid: ctx.day, status: 'paid',
      },
    });
    pushEvent(ctx, {
      eventType: 'invoice_issued', entityType: 'invoice', entityId: inv.id,
      message: `AP invoice #${inv.id} issued & paid for PO #${po.id}: $${po.totalCost.toFixed(0)}`,
      payload: { invoiceId: inv.id, poId: po.id, amount: po.totalCost },
    });
    pushEvent(ctx, {
      eventType: 'invoice_paid', entityType: 'invoice', entityId: inv.id,
      message: `Supplier paid: $${po.totalCost.toFixed(0)} (PO #${po.id})`, payload: { invoiceId: inv.id },
    });
  }
};

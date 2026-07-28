import { randInt } from '../rng';
import { pushEvent } from '../events';
import type { RuleFn } from '../types';

const HANDLING_MIN = 1;
const HANDLING_MAX = 4;

export const runCustomerService: RuleFn = async (ctx) => {
  // 1. Open a ticket for each order backordered today.
  const backordered = await ctx.tx.order.findMany({
    where: { simDay: ctx.day, status: 'backordered' }, orderBy: { id: 'asc' },
  });
  for (const o of backordered) {
    const handling = randInt(ctx.rng, HANDLING_MIN, HANDLING_MAX);
    const t = await ctx.tx.supportTicket.create({
      data: {
        customerId: o.customerId, orderId: o.id, category: 'backorder',
        simDayOpened: ctx.day, simDayTarget: ctx.day + handling, status: 'open',
      },
    });
    pushEvent(ctx, {
      eventType: 'ticket_opened', entityType: 'support_ticket', entityId: t.id,
      message: `Ticket #${t.id} opened: order #${o.id} backordered`,
      payload: { ticketId: t.id, orderId: o.id, category: 'backorder' },
    });
  }

  // 1b. Open a ticket for each PO that arrived late today.
  const receivedToday = await ctx.tx.purchaseOrder.findMany({
    where: { actualSimDayArrival: ctx.day, status: 'received' }, orderBy: { id: 'asc' },
  });
  const customers = await ctx.tx.customer.findMany({ orderBy: { id: 'asc' } });
  for (const po of receivedToday) {
    if ((po.actualSimDayArrival ?? 0) <= po.expectedSimDayArrival) continue; // on time
    if (customers.length === 0) continue;
    const customer = customers[randInt(ctx.rng, 0, customers.length - 1)];
    const handling = randInt(ctx.rng, HANDLING_MIN, HANDLING_MAX);
    const t = await ctx.tx.supportTicket.create({
      data: {
        customerId: customer.id, purchaseOrderId: po.id, category: 'late_delivery',
        simDayOpened: ctx.day, simDayTarget: ctx.day + handling, status: 'open',
      },
    });
    pushEvent(ctx, {
      eventType: 'ticket_opened', entityType: 'support_ticket', entityId: t.id,
      message: `Ticket #${t.id} opened: PO #${po.id} delivered late`,
      payload: { ticketId: t.id, poId: po.id, category: 'late_delivery' },
    });
  }

  // 2. Resolve tickets whose handling window has elapsed.
  const open = await ctx.tx.supportTicket.findMany({
    where: { status: { in: ['open', 'in_progress'] }, simDayTarget: { lte: ctx.day } },
    orderBy: { id: 'asc' },
  });
  for (const t of open) {
    const wait = ctx.day - t.simDayOpened;
    let csat = randInt(ctx.rng, 2, 5); // base
    if (t.category === 'backorder') csat -= 1; // backorders sting more
    if (wait >= 4) csat -= 1; // long waits sting more
    csat = Math.max(1, Math.min(5, csat));
    await ctx.tx.supportTicket.update({
      where: { id: t.id }, data: { status: 'resolved', simDayResolved: ctx.day, csatScore: csat },
    });
    pushEvent(ctx, {
      eventType: 'ticket_resolved', entityType: 'support_ticket', entityId: t.id,
      message: `Ticket #${t.id} resolved after ${wait} day(s), CSAT ${csat}/5`,
      payload: { ticketId: t.id, wait, csat },
    });
  }
};

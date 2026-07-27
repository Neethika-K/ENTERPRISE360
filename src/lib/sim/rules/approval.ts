import { pushEvent } from '../events';
import type { RuleFn } from '../types';

export const AUTO_APPROVE_THRESHOLD = 5000;
export const MANAGER_REVIEW_DAYS = 2;

export const approvePurchaseRequests: RuleFn = async (ctx) => {
  const prs = await ctx.tx.purchaseRequest.findMany({
    where: { status: 'pending' }, include: { product: true }, orderBy: { id: 'asc' },
  });
  for (const pr of prs) {
    const cost = pr.quantityRequested * pr.product.unitCost;
    const waited = ctx.day - pr.simDayCreated >= MANAGER_REVIEW_DAYS;
    const autoOk = cost <= AUTO_APPROVE_THRESHOLD;
    if (!autoOk && !waited) continue;

    const approver = autoOk ? 'System (auto)' : 'Sim Manager';
    await ctx.tx.purchaseRequest.update({
      where: { id: pr.id },
      data: { status: 'approved', approvedSimDay: ctx.day, approver },
    });
    pushEvent(ctx, {
      eventType: 'pr_approved', entityType: 'purchase_request', entityId: pr.id,
      message: `Purchase Request #${pr.id} approved by ${approver} (cost $${cost.toFixed(0)})`,
      payload: { prId: pr.id, cost, approver },
    });
  }
};

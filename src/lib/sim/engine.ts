import { prisma } from '@/lib/db';
import type { KpiSnapshot } from '@prisma/client';
import type { RuleFn, SimEventInput, TickContext } from './types';
import { makeRng } from './rng';
import { generateDemand } from './rules/demand';
import { runRiskReview } from './rules/riskReview';
import { fulfillOrders } from './rules/fulfillment';
import { checkReorderPoints } from './rules/reorder';
import { approvePurchaseRequests } from './rules/approval';
import { placePurchaseOrders } from './rules/procurement';
import { receivePurchaseOrders } from './rules/receiving';
import { runFinance } from './rules/finance';
import { runCustomerService } from './rules/customerService';
import { runReturns } from './rules/returns';
import { snapshotKpis } from './rules/kpis';

const PIPELINE: RuleFn[] = [
  generateDemand,
  runRiskReview,
  fulfillOrders,
  checkReorderPoints,
  approvePurchaseRequests,
  placePurchaseOrders,
  receivePurchaseOrders,
  runFinance,
  runCustomerService,
  runReturns,
  snapshotKpis,
];

export async function runTick(): Promise<{ day: number; events: SimEventInput[]; kpi: KpiSnapshot }> {
  return prisma.$transaction(
    async (tx) => {
      const state = await tx.simState.findUniqueOrThrow({ where: { id: 1 } });
      const day = state.currentDay + 1;
      const ctx: TickContext = { tx, day, rng: makeRng(state.rngSeed, day), events: [] };

      for (const rule of PIPELINE) await rule(ctx);

      await tx.simEvent.createMany({
        data: ctx.events.map((e, i) => ({
          simDay: day,
          sequence: i,
          eventType: e.eventType,
          entityType: e.entityType,
          entityId: e.entityId,
          message: e.message,
          // SQLite has no Json column — store stringified payload.
          payload: e.payload === undefined ? null : JSON.stringify(e.payload),
        })),
      });
      await tx.simState.update({ where: { id: 1 }, data: { currentDay: day, lastTickAt: new Date() } });
      const kpi = await tx.kpiSnapshot.findUniqueOrThrow({ where: { simDay: day } });
      return { day, events: ctx.events, kpi };
    },
    { timeout: 20000 }
  );
}

export async function resetSimulation(seed?: string): Promise<void> {
  await prisma.$transaction(async (tx) => {
    await tx.kpiSnapshot.deleteMany();
    await tx.simEvent.deleteMany();
    await tx.supportTicket.deleteMany();
    await tx.return.deleteMany();
    await tx.chargeback.deleteMany();
    await tx.invoice.deleteMany();
    await tx.purchaseOrderLine.deleteMany();
    await tx.purchaseOrder.deleteMany();
    await tx.purchaseRequest.deleteMany();
    await tx.orderLine.deleteMany();
    await tx.order.deleteMany();
    // Inventory baseline restore is handled by reseeding (runSeed) in the reset action.
    const state = await tx.simState.findUnique({ where: { id: 1 } });
    await tx.simState.update({
      where: { id: 1 },
      data: { currentDay: 0, lastTickAt: new Date(), rngSeed: seed ?? state?.rngSeed ?? 'enterprise360' },
    });
  });
}

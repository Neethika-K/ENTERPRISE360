import { PrismaClient, Prisma } from '@prisma/client';
import { makeRng } from '@/lib/sim/rng';
import type { TickContext } from '@/lib/sim/types';

export const prisma = new PrismaClient();

const ROLLBACK = Symbol('rollback');

/** Run fn inside a transaction that is always rolled back, so tests never persist. */
export async function inRollbackTx(
  fn: (tx: Prisma.TransactionClient) => Promise<void>
): Promise<void> {
  try {
    await prisma.$transaction(async (tx) => {
      await fn(tx);
      throw ROLLBACK;
    });
  } catch (e) {
    if (e !== ROLLBACK) throw e;
  }
}

export function ctxFor(tx: Prisma.TransactionClient, day: number, seed = 'test'): TickContext {
  return { tx, day, rng: makeRng(seed, day), events: [] };
}

/** Minimal fixture: one supplier, N products with given onHand, one customer. */
export async function seedMinimal(
  tx: Prisma.TransactionClient,
  products: { sku: string; onHand: number; reorderPoint?: number; reorderQuantity?: number }[]
) {
  const supplier = await tx.supplier.create({ data: { name: 'S', leadTimeDays: 3, reliabilityPct: 1 } });
  const customer = await tx.customer.create({ data: { name: 'C' } });
  const made = [];
  for (const p of products) {
    const prod = await tx.product.create({
      data: {
        sku: p.sku, name: p.sku, category: 'X', unitCost: 10, unitPrice: 20,
        reorderPoint: p.reorderPoint ?? 5, reorderQuantity: p.reorderQuantity ?? 50, supplierId: supplier.id,
      },
    });
    await tx.inventory.create({ data: { productId: prod.id, quantityOnHand: p.onHand, quantityIncoming: 0 } });
    made.push(prod);
  }
  return { supplier, customer, products: made };
}

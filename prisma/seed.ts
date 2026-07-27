import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Idempotent reset of transactional + master data (child → parent order).
  await prisma.$transaction([
    prisma.kpiSnapshot.deleteMany(),
    prisma.simEvent.deleteMany(),
    prisma.invoice.deleteMany(),
    prisma.purchaseOrderLine.deleteMany(),
    prisma.purchaseOrder.deleteMany(),
    prisma.purchaseRequest.deleteMany(),
    prisma.orderLine.deleteMany(),
    prisma.order.deleteMany(),
    prisma.inventory.deleteMany(),
    prisma.product.deleteMany(),
    prisma.customer.deleteMany(),
    prisma.supplier.deleteMany(),
    prisma.simState.deleteMany(),
  ]);

  // Reset SQLite AUTOINCREMENT high-water marks so a reseed restarts all ids at 1.
  // This makes "reset & replay" produce byte-identical event messages (SC-004).
  // sqlite_sequence exists once any AUTOINCREMENT table has been written.
  try {
    await prisma.$executeRawUnsafe('DELETE FROM sqlite_sequence');
  } catch {
    // sqlite_sequence not present yet (fresh db) — nothing to reset.
  }

  // Create sequentially (NOT Promise.all) so auto-increment ids are assigned in a
  // fixed order — required for deterministic replay (rng picks customers by index).
  const supplierSpecs = [
    { name: 'Nimbus Electronics Co.', leadTimeDays: 3, reliabilityPct: 0.9 },
    { name: 'HomeStock Distributors', leadTimeDays: 5, reliabilityPct: 0.75 },
    { name: 'Craftline Furniture Supply', leadTimeDays: 7, reliabilityPct: 0.8 },
  ];
  const suppliers = [];
  for (const s of supplierSpecs) suppliers.push(await prisma.supplier.create({ data: s }));

  // 6 hero SKUs. reorderPoint/onHand tuned so a few days of demand breaches it fast.
  const products = [
    { sku: 'ELEC-001', name: 'Wireless Earbuds', category: 'Electronics', unitCost: 20, unitPrice: 49, reorderPoint: 40, reorderQuantity: 120, supplierId: suppliers[0].id, onHand: 55 },
    { sku: 'ELEC-002', name: '4K Streaming Stick', category: 'Electronics', unitCost: 25, unitPrice: 59, reorderPoint: 30, reorderQuantity: 90, supplierId: suppliers[0].id, onHand: 42 },
    { sku: 'HOME-001', name: 'Robot Vacuum', category: 'Home Appliances', unitCost: 120, unitPrice: 260, reorderPoint: 15, reorderQuantity: 40, supplierId: suppliers[1].id, onHand: 22 },
    { sku: 'HOME-002', name: 'Air Purifier', category: 'Home Appliances', unitCost: 70, unitPrice: 150, reorderPoint: 20, reorderQuantity: 50, supplierId: suppliers[1].id, onHand: 30 },
    { sku: 'FURN-001', name: 'Ergonomic Chair', category: 'Furniture', unitCost: 90, unitPrice: 210, reorderPoint: 12, reorderQuantity: 30, supplierId: suppliers[2].id, onHand: 18 },
    { sku: 'FURN-002', name: 'Standing Desk', category: 'Furniture', unitCost: 140, unitPrice: 320, reorderPoint: 10, reorderQuantity: 24, supplierId: suppliers[2].id, onHand: 14 },
  ];

  for (const p of products) {
    const created = await prisma.product.create({
      data: {
        sku: p.sku, name: p.name, category: p.category, unitCost: p.unitCost,
        unitPrice: p.unitPrice, reorderPoint: p.reorderPoint,
        reorderQuantity: p.reorderQuantity, supplierId: p.supplierId,
      },
    });
    await prisma.inventory.create({
      data: { productId: created.id, quantityOnHand: p.onHand, quantityIncoming: 0, updatedSimDay: 0 },
    });
  }

  // Sequential for deterministic customer ids (see supplier note above).
  const customerNames = ['Downtown Store', 'Website', 'Mobile App', 'Wholesale Partner'];
  for (let i = 0; i < customerNames.length; i++) {
    await prisma.customer.create({ data: { name: customerNames[i], segment: i === 3 ? 'wholesale' : 'retail' } });
  }

  await prisma.simState.create({ data: { id: 1, currentDay: 0, rngSeed: 'enterprise360' } });
  console.log('Seed complete.');
}

// Exported so tests and the reset action can reseed in-process (no subprocess,
// which avoids SQLite file-lock races). Does NOT disconnect — callers own the client.
export { main as runSeed };

// Direct CLI run (`npm run db:seed` / `prisma db seed`) disconnects and exits.
// Module-mode-agnostic guard (works whether tsx runs this as CJS or ESM):
// only auto-run when this file is the entrypoint, not when imported by tests.
if (process.argv[1] && /seed\.ts$/.test(process.argv[1])) {
  main()
    .then(() => prisma.$disconnect())
    .catch(async (e) => {
      console.error(e);
      await prisma.$disconnect();
      process.exit(1);
    });
}

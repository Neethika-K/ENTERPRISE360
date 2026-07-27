import { beforeEach, afterAll } from 'vitest';
import { PrismaClient } from '@prisma/client';

// One client for the whole (single-fork) test run, used to guarantee a clean
// committed baseline before every test. Rule tests then create their own data
// inside a rolled-back transaction, so nothing leaks between tests or files.
const prisma = new PrismaClient();

async function wipe() {
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
}

beforeEach(wipe);

afterAll(async () => {
  await prisma.$disconnect();
});

-- CreateTable
CREATE TABLE "SupportTicket" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "customerId" INTEGER NOT NULL,
    "orderId" INTEGER,
    "purchaseOrderId" INTEGER,
    "category" TEXT NOT NULL,
    "simDayOpened" INTEGER NOT NULL,
    "simDayTarget" INTEGER NOT NULL,
    "simDayResolved" INTEGER,
    "status" TEXT NOT NULL DEFAULT 'open',
    "csatScore" INTEGER,
    CONSTRAINT "SupportTicket_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "SupportTicket_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "SupportTicket_purchaseOrderId_fkey" FOREIGN KEY ("purchaseOrderId") REFERENCES "PurchaseOrder" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_KpiSnapshot" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "simDay" INTEGER NOT NULL,
    "revenue" REAL NOT NULL,
    "cogs" REAL NOT NULL,
    "grossMargin" REAL NOT NULL,
    "ordersCount" INTEGER NOT NULL,
    "backorderCount" INTEGER NOT NULL,
    "inventoryValue" REAL NOT NULL,
    "openPrCount" INTEGER NOT NULL,
    "openPoCount" INTEGER NOT NULL,
    "onTimeDeliveryPct" REAL NOT NULL,
    "cashPosition" REAL NOT NULL,
    "openTickets" INTEGER NOT NULL DEFAULT 0,
    "avgResolutionDays" REAL NOT NULL DEFAULT 0,
    "csat" REAL NOT NULL DEFAULT 0,
    "nps" INTEGER NOT NULL DEFAULT 0
);
INSERT INTO "new_KpiSnapshot" ("backorderCount", "cashPosition", "cogs", "grossMargin", "id", "inventoryValue", "onTimeDeliveryPct", "openPoCount", "openPrCount", "ordersCount", "revenue", "simDay") SELECT "backorderCount", "cashPosition", "cogs", "grossMargin", "id", "inventoryValue", "onTimeDeliveryPct", "openPoCount", "openPrCount", "ordersCount", "revenue", "simDay" FROM "KpiSnapshot";
DROP TABLE "KpiSnapshot";
ALTER TABLE "new_KpiSnapshot" RENAME TO "KpiSnapshot";
CREATE UNIQUE INDEX "KpiSnapshot_simDay_key" ON "KpiSnapshot"("simDay");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

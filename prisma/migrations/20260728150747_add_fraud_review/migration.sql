-- CreateTable
CREATE TABLE "Chargeback" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "orderId" INTEGER NOT NULL,
    "amount" REAL NOT NULL,
    "simDayCreated" INTEGER NOT NULL,
    CONSTRAINT "Chargeback_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
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
    "nps" INTEGER NOT NULL DEFAULT 0,
    "returnRate" REAL NOT NULL DEFAULT 0,
    "refundsValue" REAL NOT NULL DEFAULT 0,
    "ordersHeld" INTEGER NOT NULL DEFAULT 0,
    "chargebacksValue" REAL NOT NULL DEFAULT 0
);
INSERT INTO "new_KpiSnapshot" ("avgResolutionDays", "backorderCount", "cashPosition", "cogs", "csat", "grossMargin", "id", "inventoryValue", "nps", "onTimeDeliveryPct", "openPoCount", "openPrCount", "openTickets", "ordersCount", "refundsValue", "returnRate", "revenue", "simDay") SELECT "avgResolutionDays", "backorderCount", "cashPosition", "cogs", "csat", "grossMargin", "id", "inventoryValue", "nps", "onTimeDeliveryPct", "openPoCount", "openPrCount", "openTickets", "ordersCount", "refundsValue", "returnRate", "revenue", "simDay" FROM "KpiSnapshot";
DROP TABLE "KpiSnapshot";
ALTER TABLE "new_KpiSnapshot" RENAME TO "KpiSnapshot";
CREATE UNIQUE INDEX "KpiSnapshot_simDay_key" ON "KpiSnapshot"("simDay");
CREATE TABLE "new_Order" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "customerId" INTEGER NOT NULL,
    "simDay" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'placed',
    "totalAmount" REAL NOT NULL DEFAULT 0,
    "reviewStatus" TEXT NOT NULL DEFAULT 'none',
    "reviewSimDay" INTEGER,
    "fraudulent" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Order_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Order" ("createdAt", "customerId", "id", "simDay", "status", "totalAmount") SELECT "createdAt", "customerId", "id", "simDay", "status", "totalAmount" FROM "Order";
DROP TABLE "Order";
ALTER TABLE "new_Order" RENAME TO "Order";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

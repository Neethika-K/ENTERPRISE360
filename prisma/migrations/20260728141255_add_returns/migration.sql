-- CreateTable
CREATE TABLE "Return" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "orderId" INTEGER NOT NULL,
    "orderLineId" INTEGER,
    "productId" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL,
    "simDayCreated" INTEGER NOT NULL,
    "resolution" TEXT NOT NULL,
    "refundAmount" REAL NOT NULL,
    CONSTRAINT "Return_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Return_orderLineId_fkey" FOREIGN KEY ("orderLineId") REFERENCES "OrderLine" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Return_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
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
    "refundsValue" REAL NOT NULL DEFAULT 0
);
INSERT INTO "new_KpiSnapshot" ("avgResolutionDays", "backorderCount", "cashPosition", "cogs", "csat", "grossMargin", "id", "inventoryValue", "nps", "onTimeDeliveryPct", "openPoCount", "openPrCount", "openTickets", "ordersCount", "revenue", "simDay") SELECT "avgResolutionDays", "backorderCount", "cashPosition", "cogs", "csat", "grossMargin", "id", "inventoryValue", "nps", "onTimeDeliveryPct", "openPoCount", "openPrCount", "openTickets", "ordersCount", "revenue", "simDay" FROM "KpiSnapshot";
DROP TABLE "KpiSnapshot";
ALTER TABLE "new_KpiSnapshot" RENAME TO "KpiSnapshot";
CREATE UNIQUE INDEX "KpiSnapshot_simDay_key" ON "KpiSnapshot"("simDay");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

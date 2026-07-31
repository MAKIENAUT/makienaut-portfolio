CREATE TYPE "BangusPaymentMethod" AS ENUM (
  'GCASH',
  'CASH',
  'BANK'
);

CREATE TABLE "bangus_delivery_tables" (
  "id" UUID NOT NULL,
  "deliveryDate" DATE NOT NULL,
  "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMPTZ(3) NOT NULL,

  CONSTRAINT "bangus_delivery_tables_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "bangus_delivery_tables_deliveryDate_key"
  ON "bangus_delivery_tables"("deliveryDate");

CREATE INDEX "bangus_delivery_tables_deliveryDate_idx"
  ON "bangus_delivery_tables"("deliveryDate");

CREATE TABLE "bangus_orders" (
  "id" UUID NOT NULL,
  "deliveryTableId" UUID NOT NULL,
  "customerName" VARCHAR(120) NOT NULL,
  "received" BOOLEAN NOT NULL DEFAULT false,
  "paid" BOOLEAN NOT NULL DEFAULT false,
  "paymentMethod" "BangusPaymentMethod",
  "sortOrder" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMPTZ(3) NOT NULL,

  CONSTRAINT "bangus_orders_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "bangus_orders_deliveryTableId_sortOrder_idx"
  ON "bangus_orders"("deliveryTableId", "sortOrder");

CREATE TABLE "bangus_order_items" (
  "id" UUID NOT NULL,
  "orderId" UUID NOT NULL,
  "productId" UUID NOT NULL,
  "quantity" INTEGER NOT NULL,
  "supplierUnitPrice" INTEGER NOT NULL,
  "retailUnitPrice" INTEGER NOT NULL,
  "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMPTZ(3) NOT NULL,

  CONSTRAINT "bangus_order_items_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "bangus_order_items_orderId_productId_key"
  ON "bangus_order_items"("orderId", "productId");

CREATE INDEX "bangus_order_items_productId_idx"
  ON "bangus_order_items"("productId");

ALTER TABLE "bangus_orders"
  ADD CONSTRAINT "bangus_orders_deliveryTableId_fkey"
  FOREIGN KEY ("deliveryTableId")
  REFERENCES "bangus_delivery_tables"("id")
  ON DELETE CASCADE
  ON UPDATE CASCADE;

ALTER TABLE "bangus_order_items"
  ADD CONSTRAINT "bangus_order_items_orderId_fkey"
  FOREIGN KEY ("orderId")
  REFERENCES "bangus_orders"("id")
  ON DELETE CASCADE
  ON UPDATE CASCADE;

ALTER TABLE "bangus_order_items"
  ADD CONSTRAINT "bangus_order_items_productId_fkey"
  FOREIGN KEY ("productId")
  REFERENCES "bangus_products"("id")
  ON DELETE RESTRICT
  ON UPDATE CASCADE;

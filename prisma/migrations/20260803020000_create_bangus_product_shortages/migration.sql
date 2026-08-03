CREATE TABLE "bangus_product_shortages" (
  "id" UUID NOT NULL,
  "deliveryTableId" UUID NOT NULL,
  "productId" UUID NOT NULL,
  "shortQuantity" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMPTZ(3) NOT NULL,

  CONSTRAINT "bangus_product_shortages_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "bangus_product_shortages_deliveryTableId_productId_key"
  ON "bangus_product_shortages"("deliveryTableId", "productId");

CREATE INDEX "bangus_product_shortages_productId_idx"
  ON "bangus_product_shortages"("productId");

ALTER TABLE "bangus_product_shortages"
  ADD CONSTRAINT "bangus_product_shortages_deliveryTableId_fkey"
  FOREIGN KEY ("deliveryTableId")
  REFERENCES "bangus_delivery_tables"("id")
  ON DELETE CASCADE
  ON UPDATE CASCADE;

ALTER TABLE "bangus_product_shortages"
  ADD CONSTRAINT "bangus_product_shortages_productId_fkey"
  FOREIGN KEY ("productId")
  REFERENCES "bangus_products"("id")
  ON DELETE RESTRICT
  ON UPDATE CASCADE;

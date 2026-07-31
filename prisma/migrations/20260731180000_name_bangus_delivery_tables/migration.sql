ALTER TABLE "bangus_delivery_tables"
  ADD COLUMN "name" VARCHAR(120);

UPDATE "bangus_delivery_tables"
SET "name" = 'Orders for ' || TO_CHAR("deliveryDate", 'FMMonth FMDD, YYYY');

ALTER TABLE "bangus_delivery_tables"
  ALTER COLUMN "name" SET NOT NULL;

DROP INDEX "bangus_delivery_tables_deliveryDate_key";

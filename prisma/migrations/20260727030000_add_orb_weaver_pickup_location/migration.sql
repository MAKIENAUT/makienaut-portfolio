ALTER TABLE "orb_weaver_appointments"
  ADD COLUMN "handoffMethod" VARCHAR(30),
  ADD COLUMN "pickupArea" VARCHAR(180),
  ADD COLUMN "pickupLatitude" DECIMAL(9, 6),
  ADD COLUMN "pickupLongitude" DECIMAL(9, 6),
  ALTER COLUMN "notes" TYPE VARCHAR(1600);

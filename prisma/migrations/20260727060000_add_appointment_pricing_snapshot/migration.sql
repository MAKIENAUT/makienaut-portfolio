ALTER TABLE "orb_weaver_appointments"
  ADD COLUMN "handoffWindow" VARCHAR(80),
  ADD COLUMN "completionWindow" VARCHAR(80),
  ADD COLUMN "requestedAddOns" JSONB,
  ADD COLUMN "serviceUnitPrice" INTEGER,
  ADD COLUMN "addOnSubtotal" INTEGER,
  ADD COLUMN "estimatedSubtotal" INTEGER;

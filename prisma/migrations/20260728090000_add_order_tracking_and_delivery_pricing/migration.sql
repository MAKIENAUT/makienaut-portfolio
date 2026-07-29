ALTER TABLE "orb_weaver_appointments"
  ADD COLUMN "publicReference" VARCHAR(16),
  ADD COLUMN "deliveryDistanceKm" DECIMAL(5, 2),
  ADD COLUMN "deliveryFee" INTEGER,
  ADD COLUMN "deliveryProofUrl" VARCHAR(600),
  ADD COLUMN "finalTotal" INTEGER,
  ADD COLUMN "deliveryPricedAt" TIMESTAMPTZ(3);

CREATE UNIQUE INDEX "orb_weaver_appointments_publicReference_key"
  ON "orb_weaver_appointments"("publicReference");

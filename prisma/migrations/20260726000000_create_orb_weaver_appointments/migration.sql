CREATE TYPE "AppointmentStatus" AS ENUM (
  'PENDING',
  'CONFIRMED',
  'IN_PROGRESS',
  'READY',
  'COMPLETED',
  'CANCELLED'
);

CREATE TABLE "orb_weaver_appointments" (
  "id" UUID NOT NULL,
  "customerName" VARCHAR(100) NOT NULL,
  "email" VARCHAR(160) NOT NULL,
  "phone" VARCHAR(40) NOT NULL,
  "service" VARCHAR(50) NOT NULL,
  "helmetCount" INTEGER NOT NULL DEFAULT 1,
  "preferredDate" DATE NOT NULL,
  "preferredWindow" VARCHAR(30) NOT NULL,
  "notes" VARCHAR(1000),
  "status" "AppointmentStatus" NOT NULL DEFAULT 'PENDING',
  "sourceFingerprint" VARCHAR(64),
  "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMPTZ(3) NOT NULL,

  CONSTRAINT "orb_weaver_appointments_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "orb_weaver_appointments_status_preferredDate_idx"
  ON "orb_weaver_appointments"("status", "preferredDate");

CREATE INDEX "orb_weaver_appointments_sourceFingerprint_createdAt_idx"
  ON "orb_weaver_appointments"("sourceFingerprint", "createdAt");

CREATE TABLE "orb_weaver_login_attempts" (
  "id" BIGSERIAL NOT NULL,
  "sourceFingerprint" VARCHAR(64) NOT NULL,
  "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "orb_weaver_login_attempts_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "orb_weaver_login_attempts_sourceFingerprint_createdAt_idx"
  ON "orb_weaver_login_attempts"("sourceFingerprint", "createdAt");

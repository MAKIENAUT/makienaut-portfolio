CREATE TYPE "OrbWeaverUserRole" AS ENUM ('ADMIN', 'USER');

CREATE TABLE "orb_weaver_users" (
  "id" UUID NOT NULL,
  "username" VARCHAR(80) NOT NULL,
  "passwordHash" VARCHAR(256) NOT NULL,
  "role" "OrbWeaverUserRole" NOT NULL DEFAULT 'USER',
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMPTZ(3) NOT NULL,

  CONSTRAINT "orb_weaver_users_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "orb_weaver_users_username_key"
  ON "orb_weaver_users"("username");

CREATE INDEX "orb_weaver_users_role_isActive_idx"
  ON "orb_weaver_users"("role", "isActive");

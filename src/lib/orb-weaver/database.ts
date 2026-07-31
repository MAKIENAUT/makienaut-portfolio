import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";

const globalForPrisma = globalThis as unknown as {
  orbWeaverPrisma?: PrismaClient;
  bangusPrisma?: PrismaClient;
};

let orbWeaverPrisma = globalForPrisma.orbWeaverPrisma;
let bangusPrisma = globalForPrisma.bangusPrisma;

const resolveMainDatabaseUrl = () =>
  process.env.OW_MAIN_DB_DATABASE_URL ||
  process.env.DATABASE_URL ||
  process.env.OW_MAIN_DB_POSTGRES_URL ||
  process.env.OW_MAIN_DB_PRISMA_DATABASE_URL;

const resolveOrbWeaverDatabaseUrl = () =>
  (process.env.NODE_ENV !== "production"
    ? process.env.ORBW_DEV_DATABASE_URL
    : undefined) ||
  resolveMainDatabaseUrl();

const normalizePostgresSslMode = (connectionString: string) => {
  try {
    const url = new URL(connectionString);
    const sslMode = url.searchParams.get("sslmode");

    if (sslMode && ["prefer", "require", "verify-ca"].includes(sslMode)) {
      url.searchParams.set("sslmode", "verify-full");
    }

    return url.toString();
  } catch {
    return connectionString;
  }
};

export const getOrbWeaverDatabase = () => {
  if (orbWeaverPrisma) {
    return orbWeaverPrisma;
  }

  const connectionString = resolveOrbWeaverDatabaseUrl();

  if (!connectionString) {
    throw new Error(
      "VroomBroom database is not configured. Add OW_MAIN_DB_DATABASE_URL to the environment."
    );
  }

  orbWeaverPrisma = new PrismaClient({
    adapter: new PrismaPg({
      connectionString: normalizePostgresSslMode(connectionString),
    }),
  });

  if (process.env.NODE_ENV !== "production") {
    globalForPrisma.orbWeaverPrisma = orbWeaverPrisma;
  }

  return orbWeaverPrisma;
};

// Bangus is intentionally shared across Development, Preview, and Production.
// Keep this separate from VroomBroom's development-only database client.
export const getBangusDatabase = () => {
  if (bangusPrisma) {
    return bangusPrisma;
  }

  const connectionString = resolveMainDatabaseUrl();

  if (!connectionString) {
    throw new Error(
      "Bangus database is not configured. Add OW_MAIN_DB_DATABASE_URL to this environment."
    );
  }

  bangusPrisma = new PrismaClient({
    adapter: new PrismaPg({
      connectionString: normalizePostgresSslMode(connectionString),
    }),
  });

  if (process.env.NODE_ENV !== "production") {
    globalForPrisma.bangusPrisma = bangusPrisma;
  }

  return bangusPrisma;
};

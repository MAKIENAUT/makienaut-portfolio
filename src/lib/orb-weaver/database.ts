import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";

const globalForPrisma = globalThis as unknown as {
  orbWeaverPrisma?: PrismaClient;
};

let orbWeaverPrisma = globalForPrisma.orbWeaverPrisma;

const resolveDatabaseUrl = () =>
  (process.env.NODE_ENV !== "production"
    ? process.env.ORBW_DEV_DATABASE_URL
    : undefined) ||
  process.env.OW_MAIN_DB_DATABASE_URL ||
  process.env.DATABASE_URL ||
  process.env.OW_MAIN_DB_POSTGRES_URL ||
  process.env.OW_MAIN_DB_PRISMA_DATABASE_URL;

export const getOrbWeaverDatabase = () => {
  if (orbWeaverPrisma) {
    return orbWeaverPrisma;
  }

  const connectionString = resolveDatabaseUrl();

  if (!connectionString) {
    throw new Error(
      "VroomBroom database is not configured. Add OW_MAIN_DB_DATABASE_URL to the environment."
    );
  }

  orbWeaverPrisma = new PrismaClient({
    adapter: new PrismaPg({ connectionString }),
  });

  if (process.env.NODE_ENV !== "production") {
    globalForPrisma.orbWeaverPrisma = orbWeaverPrisma;
  }

  return orbWeaverPrisma;
};

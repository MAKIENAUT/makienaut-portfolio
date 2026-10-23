import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";

export class DatabaseConfigurationError extends Error {
  constructor(service: string, hint: string) {
    super(`${service} database is not configured. ${hint}`);
    this.name = "DatabaseConfigurationError";
  }
}

interface GlobalWithPrisma {
  orbWeaverPrisma?: PrismaClient;
  bangusPrisma?: PrismaClient;
}

const globalForPrisma = globalThis as unknown as GlobalWithPrisma;

let orbWeaverPrisma = globalForPrisma.orbWeaverPrisma;
let bangusPrisma = globalForPrisma.bangusPrisma;

export const isUsablePostgresUrl = (value: string | undefined): boolean => {
  if (!value) return false;

  try {
    const url = new URL(value);
    return (
      (url.protocol === "postgres:" || url.protocol === "postgresql:") &&
      Boolean(url.hostname)
    );
  } catch {
    return false;
  }
};

export const firstUsableDatabaseUrl = (
  ...values: Array<string | undefined>
): string | undefined => values.find(isUsablePostgresUrl);

export const resolveMainDatabaseUrl = (): string | undefined =>
  firstUsableDatabaseUrl(
    process.env.OW_MAIN_DB_DATABASE_URL,
    process.env.DATABASE_URL,
    process.env.OW_MAIN_DB_POSTGRES_URL,
    process.env.OW_MAIN_DB_PRISMA_DATABASE_URL
  );

export const resolveOrbWeaverDatabaseUrl = (): string | undefined =>
  firstUsableDatabaseUrl(
    process.env.NODE_ENV !== "production"
      ? process.env.ORBW_DEV_DATABASE_URL
      : undefined,
    resolveMainDatabaseUrl()
  );

export const resolveBangusDatabaseUrl = (): string | undefined =>
  firstUsableDatabaseUrl(
    resolveMainDatabaseUrl(),
    process.env.NODE_ENV !== "production"
      ? process.env.ORBW_DEV_DATABASE_URL
      : undefined
  );

export const normalizePostgresSslMode = (connectionString: string): string => {
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

export const createPrismaClient = (connectionString: string): PrismaClient =>
  new PrismaClient({
    adapter: new PrismaPg({
      connectionString: normalizePostgresSslMode(connectionString),
    }),
  });

export const getOrbWeaverDatabase = (): PrismaClient => {
  if (orbWeaverPrisma) {
    return orbWeaverPrisma;
  }

  const connectionString = resolveOrbWeaverDatabaseUrl();

  if (!connectionString) {
    throw new DatabaseConfigurationError(
      "VroomBroom",
      "Add OW_MAIN_DB_DATABASE_URL to the environment."
    );
  }

  orbWeaverPrisma = createPrismaClient(connectionString);

  if (process.env.NODE_ENV !== "production") {
    globalForPrisma.orbWeaverPrisma = orbWeaverPrisma;
  }

  return orbWeaverPrisma;
};

// Prefer the shared Bangus database. Locally, Vercel may deliberately redact
// Production connection values, so fall back to the configured development DB.
export const getBangusDatabase = (): PrismaClient => {
  if (bangusPrisma) {
    return bangusPrisma;
  }

  const connectionString = resolveBangusDatabaseUrl();

  if (!connectionString) {
    throw new DatabaseConfigurationError(
      "Bangus",
      "Add a valid OW_MAIN_DB_DATABASE_URL or ORBW_DEV_DATABASE_URL."
    );
  }

  bangusPrisma = createPrismaClient(connectionString);

  if (process.env.NODE_ENV !== "production") {
    globalForPrisma.bangusPrisma = bangusPrisma;
  }

  return bangusPrisma;
};

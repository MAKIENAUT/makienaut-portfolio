import { config as loadEnvironment } from "dotenv";
import { defineConfig } from "prisma/config";

loadEnvironment({ path: ".env.local", quiet: true });
loadEnvironment({ quiet: true });

const databaseUrl =
  process.env.OW_MAIN_DB_DATABASE_URL ||
  process.env.DATABASE_URL ||
  process.env.OW_MAIN_DB_POSTGRES_URL ||
  process.env.OW_MAIN_DB_PRISMA_DATABASE_URL;

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  ...(databaseUrl
    ? {
        datasource: {
          url: databaseUrl,
        },
      }
    : {}),
});

import { beforeEach, describe, expect, it } from "vitest";
import {
  DatabaseConfigurationError,
  firstUsableDatabaseUrl,
  isUsablePostgresUrl,
  normalizePostgresSslMode,
  resolveBangusDatabaseUrl,
  resolveMainDatabaseUrl,
  resolveOrbWeaverDatabaseUrl,
} from "./client";

describe("Database Client Configuration & Utilities", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  describe("isUsablePostgresUrl", () => {
    it("identifies valid postgres and postgresql connection urls", () => {
      expect(isUsablePostgresUrl("postgres://user:pass@localhost:5432/db")).toBe(
        true
      );
      expect(
        isUsablePostgresUrl("postgresql://user:pass@remotehost:5432/db")
      ).toBe(true);
    });

    it("rejects invalid, malformed, or non-postgres urls", () => {
      expect(isUsablePostgresUrl(undefined)).toBe(false);
      expect(isUsablePostgresUrl("")).toBe(false);
      expect(isUsablePostgresUrl("not-a-url")).toBe(false);
      expect(isUsablePostgresUrl("mysql://user:pass@localhost/db")).toBe(false);
      expect(isUsablePostgresUrl("https://example.com")).toBe(false);
      expect(isUsablePostgresUrl("postgres://")).toBe(false);
    });
  });

  describe("firstUsableDatabaseUrl", () => {
    it("returns the first usable postgres url from candidate values", () => {
      const result = firstUsableDatabaseUrl(
        undefined,
        "invalid-url",
        "postgres://user:pass@host1:5432/db1",
        "postgres://user:pass@host2:5432/db2"
      );
      expect(result).toBe("postgres://user:pass@host1:5432/db1");
    });

    it("returns undefined when no candidate is valid", () => {
      expect(
        firstUsableDatabaseUrl(undefined, "", "invalid", "http://host")
      ).toBeUndefined();
    });
  });

  describe("resolveMainDatabaseUrl", () => {
    it("resolves according to precedence", () => {
      delete process.env.OW_MAIN_DB_DATABASE_URL;
      delete process.env.DATABASE_URL;
      delete process.env.OW_MAIN_DB_POSTGRES_URL;
      delete process.env.OW_MAIN_DB_PRISMA_DATABASE_URL;

      process.env.DATABASE_URL = "postgres://user:pass@host-default/db";
      expect(resolveMainDatabaseUrl()).toBe("postgres://user:pass@host-default/db");

      process.env.OW_MAIN_DB_DATABASE_URL = "postgres://user:pass@host-main/db";
      expect(resolveMainDatabaseUrl()).toBe("postgres://user:pass@host-main/db");
    });
  });

  describe("resolveOrbWeaverDatabaseUrl", () => {
    it("prefers dev database url in non-production", () => {
      Object.assign(process.env, {
        NODE_ENV: "development",
        ORBW_DEV_DATABASE_URL: "postgres://user:pass@dev-host/db",
        OW_MAIN_DB_DATABASE_URL: "postgres://user:pass@main-host/db",
      });

      expect(resolveOrbWeaverDatabaseUrl()).toBe(
        "postgres://user:pass@dev-host/db"
      );
    });

    it("ignores dev database in production", () => {
      Object.assign(process.env, {
        NODE_ENV: "production",
        ORBW_DEV_DATABASE_URL: "postgres://user:pass@dev-host/db",
        OW_MAIN_DB_DATABASE_URL: "postgres://user:pass@main-host/db",
      });

      expect(resolveOrbWeaverDatabaseUrl()).toBe(
        "postgres://user:pass@main-host/db"
      );
    });
  });

  describe("resolveBangusDatabaseUrl", () => {
    it("prefers main database even in development, with dev fallback", () => {
      delete process.env.OW_MAIN_DB_DATABASE_URL;
      delete process.env.DATABASE_URL;
      delete process.env.OW_MAIN_DB_POSTGRES_URL;
      delete process.env.OW_MAIN_DB_PRISMA_DATABASE_URL;
      Object.assign(process.env, {
        NODE_ENV: "development",
        ORBW_DEV_DATABASE_URL: "postgres://user:pass@dev-host/db",
      });

      expect(resolveBangusDatabaseUrl()).toBe(
        "postgres://user:pass@dev-host/db"
      );

      process.env.OW_MAIN_DB_DATABASE_URL = "postgres://user:pass@main-host/db";
      expect(resolveBangusDatabaseUrl()).toBe(
        "postgres://user:pass@main-host/db"
      );
    });
  });

  describe("normalizePostgresSslMode", () => {
    it("upgrades prefer, require, and verify-ca to verify-full", () => {
      expect(
        normalizePostgresSslMode(
          "postgresql://user:pass@host:5432/db?sslmode=require"
        )
      ).toBe("postgresql://user:pass@host:5432/db?sslmode=verify-full");

      expect(
        normalizePostgresSslMode(
          "postgresql://user:pass@host:5432/db?sslmode=prefer"
        )
      ).toBe("postgresql://user:pass@host:5432/db?sslmode=verify-full");

      expect(
        normalizePostgresSslMode(
          "postgresql://user:pass@host:5432/db?sslmode=verify-ca"
        )
      ).toBe("postgresql://user:pass@host:5432/db?sslmode=verify-full");
    });

    it("preserves other sslmode or absence of sslmode", () => {
      const urlWithoutSsl = "postgresql://user:pass@host:5432/db";
      expect(normalizePostgresSslMode(urlWithoutSsl)).toBe(urlWithoutSsl);

      const urlWithDisable = "postgresql://user:pass@host:5432/db?sslmode=disable";
      expect(normalizePostgresSslMode(urlWithDisable)).toBe(urlWithDisable);
    });

    it("returns raw string if url parsing fails", () => {
      expect(normalizePostgresSslMode("not-a-valid-url")).toBe("not-a-valid-url");
    });
  });

  describe("DatabaseConfigurationError", () => {
    it("formats service and hint correctly", () => {
      const error = new DatabaseConfigurationError(
        "VroomBroom",
        "Add OW_MAIN_DB_DATABASE_URL to the environment."
      );
      expect(error.name).toBe("DatabaseConfigurationError");
      expect(error.message).toBe(
        "VroomBroom database is not configured. Add OW_MAIN_DB_DATABASE_URL to the environment."
      );
      expect(error).toBeInstanceOf(Error);
    });
  });
});

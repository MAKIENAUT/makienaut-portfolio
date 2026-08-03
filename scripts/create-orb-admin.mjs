import { randomUUID, scrypt as scryptCallback } from "node:crypto";
import { promisify } from "node:util";
import { createInterface } from "node:readline/promises";
import { stdin, stdout } from "node:process";
import { config as loadEnvironment } from "dotenv";
import pg from "pg";

loadEnvironment({ path: process.env.ORBW_ENV_FILE || ".env.local", quiet: true });
loadEnvironment({ quiet: true });

const scrypt = promisify(scryptCallback);
const prompt = createInterface({ input: stdin, output: stdout });
const suppliedUsername = await prompt.question("Admin username [admin]: ");
const password = await prompt.question("Admin password: ");
const confirmation = await prompt.question("Confirm admin password: ");
prompt.close();

const username = (suppliedUsername || "admin").trim().toLowerCase();

if (!/^[a-z0-9][a-z0-9._-]{1,79}$/.test(username)) {
  console.error("Username must be 2-80 lowercase letters, numbers, dots, underscores, or hyphens.");
  process.exitCode = 1;
} else if (password.length < 12) {
  console.error("Use a password with at least 12 characters.");
  process.exitCode = 1;
} else if (password !== confirmation) {
  console.error("Passwords do not match.");
  process.exitCode = 1;
} else {
  const databaseUrl =
    (process.env.NODE_ENV !== "production"
      ? process.env.ORBW_DEV_DATABASE_URL
      : undefined) ||
    process.env.OW_MAIN_DB_DATABASE_URL ||
    process.env.DATABASE_URL ||
    process.env.OW_MAIN_DB_POSTGRES_URL ||
    process.env.OW_MAIN_DB_PRISMA_DATABASE_URL;

  if (!databaseUrl) {
    console.error("No database URL is configured. Add ORBW_DEV_DATABASE_URL or OW_MAIN_DB_DATABASE_URL.");
    process.exitCode = 1;
  } else {
    const salt = Buffer.from(randomUUID().replaceAll("-", ""), "hex");
    const derivedKey = await scrypt(password, salt, 64);
    const passwordHash = `scrypt:${salt.toString("hex")}:${Buffer.from(derivedKey).toString("hex")}`;
    const client = new pg.Client({ connectionString: databaseUrl });

    try {
      await client.connect();
      await client.query(
        `INSERT INTO "orb_weaver_users"
          ("id", "username", "passwordHash", "role", "isActive", "updatedAt")
         VALUES ($1, $2, $3, 'ADMIN', true, CURRENT_TIMESTAMP)
         ON CONFLICT ("username") DO UPDATE
         SET "passwordHash" = EXCLUDED."passwordHash",
             "role" = 'ADMIN',
             "isActive" = true,
             "updatedAt" = CURRENT_TIMESTAMP`,
        [randomUUID(), username, passwordHash]
      );
      console.log(`Administrator '${username}' saved in the database.`);
    } finally {
      await client.end();
    }
  }
}

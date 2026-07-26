import { randomBytes, scrypt as scryptCallback } from "node:crypto";
import { promisify } from "node:util";
import { createInterface } from "node:readline/promises";
import { stdin, stdout } from "node:process";

const scrypt = promisify(scryptCallback);
const prompt = createInterface({ input: stdin, output: stdout });
const password = await prompt.question("New VroomBroom back-office password: ");
prompt.close();

if (password.length < 12) {
  console.error("Use at least 12 characters.");
  process.exitCode = 1;
} else {
  const salt = randomBytes(16);
  const derivedKey = await scrypt(password, salt, 64);

  console.log(
    `\nORBW_BACKOFFICE_PASSWORD_HASH="scrypt:${salt.toString("hex")}:${Buffer.from(
      derivedKey
    ).toString("hex")}"`
  );
  console.log(
    `ORBW_AUTH_SECRET="${randomBytes(32).toString("base64url")}"`
  );
}

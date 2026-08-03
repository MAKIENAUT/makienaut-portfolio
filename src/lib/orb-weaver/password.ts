import {
  scrypt as scryptCallback,
  timingSafeEqual,
} from "node:crypto";

const deriveKey = (password: string, salt: Buffer, keyLength: number) =>
  new Promise<Buffer>((resolve, reject) => {
    scryptCallback(password, salt, keyLength, (error, derivedKey) => {
      if (error) {
        reject(error);
        return;
      }

      resolve(derivedKey);
    });
  });

export const verifyOrbWeaverPassword = async (
  password: string,
  storedHash: string
) => {
  if (!storedHash || password.length > 256) {
    return false;
  }

  const [algorithm, saltHex, hashHex] = storedHash.split(":");

  if (
    algorithm !== "scrypt" ||
    !saltHex ||
    !hashHex ||
    !/^[a-f0-9]+$/i.test(saltHex) ||
    !/^[a-f0-9]+$/i.test(hashHex)
  ) {
    return false;
  }

  try {
    const expectedHash = Buffer.from(hashHex, "hex");
    const calculatedHash = await deriveKey(
      password,
      Buffer.from(saltHex, "hex"),
      expectedHash.length
    );

    return timingSafeEqual(calculatedHash, expectedHash);
  } catch {
    return false;
  }
};

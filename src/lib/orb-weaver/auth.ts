import { timingSafeEqual } from "node:crypto";
import { getOrbWeaverDatabase } from "@/lib/orb-weaver/database";
import {
  hashOrbWeaverPassword,
  verifyOrbWeaverPassword,
} from "@/lib/orb-weaver/password";

export type OrbWeaverAuthenticatedUser = {
  id: string;
  role: "ADMIN" | "SUPPLIER" | "USER";
};

const normalizeUsername = (username: string) => username.trim().toLowerCase();

const hasMatchingBootstrapPassword = (
  password: string,
  bootstrapPassword?: string
) => {

  if (!bootstrapPassword || password.length !== bootstrapPassword.length) {
    return false;
  }

  return timingSafeEqual(Buffer.from(password), Buffer.from(bootstrapPassword));
};

export const authenticateOrbWeaverUser = async (
  username: string,
  password: string
): Promise<OrbWeaverAuthenticatedUser | null> => {
  const normalizedUsername = normalizeUsername(username);

  if (!normalizedUsername || normalizedUsername.length > 80 || password.length > 256) {
    return null;
  }

  const database = getOrbWeaverDatabase();
  const user = await database.orbWeaverUser.findUnique({
    where: { username: normalizedUsername },
    select: { id: true, passwordHash: true, role: true, isActive: true },
  });

  if (!user) {
    const bootstrapAccount = [
      {
        username: normalizeUsername(
          process.env.ORBW_BOOTSTRAP_ADMIN_USERNAME || "admin"
        ),
        password: process.env.ORBW_BOOTSTRAP_ADMIN_PASSWORD,
        role: "ADMIN" as const,
      },
      {
        username: normalizeUsername(
          process.env.ORBW_BOOTSTRAP_SUPPLIER_USERNAME || "jhe_mararac"
        ),
        password: process.env.ORBW_BOOTSTRAP_SUPPLIER_PASSWORD,
        role: "SUPPLIER" as const,
      },
    ].find(
      (account) =>
        account.username === normalizedUsername &&
        hasMatchingBootstrapPassword(password, account.password)
    );

    if (!bootstrapAccount) {
      return null;
    }

    const createdUser = await database.orbWeaverUser.create({
      data: {
        username: bootstrapAccount.username,
        passwordHash: await hashOrbWeaverPassword(password),
        role: bootstrapAccount.role,
      },
      select: { id: true, role: true },
    });

    return { id: createdUser.id, role: createdUser.role };
  }

  if (!user.isActive) {
    return null;
  }

  if (!(await verifyOrbWeaverPassword(password, user.passwordHash))) {
    return null;
  }

  return { id: user.id, role: user.role };
};

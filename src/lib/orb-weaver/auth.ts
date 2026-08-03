import { timingSafeEqual } from "node:crypto";
import { getOrbWeaverDatabase } from "@/lib/orb-weaver/database";
import {
  hashOrbWeaverPassword,
  verifyOrbWeaverPassword,
} from "@/lib/orb-weaver/password";

export type OrbWeaverAuthenticatedUser = {
  id: string;
  role: "ADMIN" | "USER";
};

const normalizeUsername = (username: string) => username.trim().toLowerCase();

const hasMatchingBootstrapPassword = (password: string) => {
  const bootstrapPassword = process.env.ORBW_BOOTSTRAP_ADMIN_PASSWORD;

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
    const bootstrapUsername = normalizeUsername(
      process.env.ORBW_BOOTSTRAP_ADMIN_USERNAME || "admin"
    );

    if (
      normalizedUsername !== bootstrapUsername ||
      !hasMatchingBootstrapPassword(password)
    ) {
      return null;
    }

    const createdUser = await database.orbWeaverUser.create({
      data: {
        username: bootstrapUsername,
        passwordHash: await hashOrbWeaverPassword(password),
        role: "ADMIN",
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

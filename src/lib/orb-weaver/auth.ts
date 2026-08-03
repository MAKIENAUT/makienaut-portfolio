import { getOrbWeaverDatabase } from "@/lib/orb-weaver/database";
import { verifyOrbWeaverPassword } from "@/lib/orb-weaver/password";

export type OrbWeaverAuthenticatedUser = {
  id: string;
  role: "ADMIN" | "USER";
};

const normalizeUsername = (username: string) => username.trim().toLowerCase();

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

  if (!user || !user.isActive) {
    return null;
  }

  if (!(await verifyOrbWeaverPassword(password, user.passwordHash))) {
    return null;
  }

  return { id: user.id, role: user.role };
};

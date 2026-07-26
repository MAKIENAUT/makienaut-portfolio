import { getOrbWeaverDatabase } from "@/lib/orb-weaver/database";

const fifteenMinutesAgo = () => new Date(Date.now() - 15 * 60 * 1000);

export const isOrbWeaverLoginRateLimited = async (
  sourceFingerprint: string
) => {
  const database = getOrbWeaverDatabase();
  const attempts = await database.orbWeaverLoginAttempt.count({
    where: {
      sourceFingerprint,
      createdAt: { gte: fifteenMinutesAgo() },
    },
  });

  return attempts >= 8;
};

export const recordOrbWeaverLoginFailure = async (
  sourceFingerprint: string
) => {
  const database = getOrbWeaverDatabase();

  await database.$transaction([
    database.orbWeaverLoginAttempt.create({
      data: { sourceFingerprint },
    }),
    database.orbWeaverLoginAttempt.deleteMany({
      where: {
        createdAt: { lt: new Date(Date.now() - 24 * 60 * 60 * 1000) },
      },
    }),
  ]);
};

export const clearOrbWeaverLoginFailures = async (
  sourceFingerprint: string
) => {
  const database = getOrbWeaverDatabase();

  await database.orbWeaverLoginAttempt.deleteMany({
    where: { sourceFingerprint },
  });
};

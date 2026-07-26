import { createHmac } from "node:crypto";

export const getOrbWeaverAppointmentReference = (appointmentId: string) => {
  const referenceSecret =
    process.env.ORBW_AUTH_SECRET || "orb-weaver-reference";

  return createHmac("sha256", referenceSecret)
    .update(appointmentId)
    .digest("hex")
    .slice(0, 8)
    .toUpperCase();
};

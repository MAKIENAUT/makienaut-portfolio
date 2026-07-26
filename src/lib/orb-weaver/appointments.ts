import { unstable_noStore as noStore } from "next/cache";
import {
  AppointmentStatus,
  type OrbWeaverAppointment,
} from "@/generated/prisma/client";
import { getOrbWeaverDatabase } from "@/lib/orb-weaver/database";
import { getOrbWeaverAppointmentReference } from "@/lib/orb-weaver/reference";
import {
  type NewOrbWeaverAppointment,
  type OrbWeaverAppointmentRecord,
  type OrbWeaverAppointmentStatus,
  type OrbWeaverServiceId,
  type OrbWeaverTimeWindow,
} from "@/types/orb-weaver";

const serializeAppointment = (
  appointment: OrbWeaverAppointment
): OrbWeaverAppointmentRecord => ({
  id: appointment.id,
  reference: getOrbWeaverAppointmentReference(appointment.id),
  customerName: appointment.customerName,
  email: appointment.email,
  phone: appointment.phone,
  service: appointment.service as OrbWeaverServiceId,
  helmetCount: appointment.helmetCount,
  preferredDate: appointment.preferredDate.toISOString().slice(0, 10),
  preferredWindow: appointment.preferredWindow as OrbWeaverTimeWindow,
  notes: appointment.notes,
  status: appointment.status as OrbWeaverAppointmentStatus,
  createdAt: appointment.createdAt.toISOString(),
  updatedAt: appointment.updatedAt.toISOString(),
});

export const createOrbWeaverAppointment = async (
  input: NewOrbWeaverAppointment
) => {
  const database = getOrbWeaverDatabase();
  const appointment = await database.orbWeaverAppointment.create({
    data: {
      ...input,
      status: AppointmentStatus.PENDING,
    },
  });

  return serializeAppointment(appointment);
};

export const listOrbWeaverAppointments = async () => {
  noStore();

  const database = getOrbWeaverDatabase();
  const appointments = await database.orbWeaverAppointment.findMany({
    orderBy: [{ preferredDate: "asc" }, { createdAt: "desc" }],
    take: 250,
  });

  return appointments.map(serializeAppointment);
};

export const updateOrbWeaverAppointmentStatus = async (
  id: string,
  status: OrbWeaverAppointmentStatus
) => {
  const database = getOrbWeaverDatabase();
  const appointment = await database.orbWeaverAppointment.update({
    where: { id },
    data: { status: status as AppointmentStatus },
  });

  return serializeAppointment(appointment);
};

export const countRecentOrbWeaverAppointments = async (
  sourceFingerprint: string,
  since: Date
) => {
  const database = getOrbWeaverDatabase();

  return database.orbWeaverAppointment.count({
    where: {
      sourceFingerprint,
      createdAt: { gte: since },
    },
  });
};

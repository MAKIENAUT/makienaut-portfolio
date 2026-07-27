import { unstable_noStore as noStore } from "next/cache";
import {
  AppointmentStatus,
  Prisma,
  type OrbWeaverAppointment,
} from "@/generated/prisma/client";
import { getOrbWeaverDatabase } from "@/lib/orb-weaver/database";
import { getOrbWeaverAppointmentReference } from "@/lib/orb-weaver/reference";
import {
  type NewOrbWeaverAppointment,
  type OrbWeaverAppointmentRecord,
  type OrbWeaverAppointmentStatus,
  type OrbWeaverRequestedAddOn,
  type OrbWeaverServiceId,
  type OrbWeaverTimeWindow,
} from "@/types/orb-weaver";

const serializeRequestedAddOns = (
  value: Prisma.JsonValue | null
): OrbWeaverRequestedAddOn[] => {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.flatMap((item) => {
    if (!item || typeof item !== "object" || Array.isArray(item)) {
      return [];
    }

    const id = typeof item.id === "string" ? item.id : "";
    const name = typeof item.name === "string" ? item.name : "";
    const unitPrice =
      typeof item.unitPrice === "number" ? item.unitPrice : Number.NaN;
    const quantity =
      typeof item.quantity === "number" ? item.quantity : Number.NaN;
    const subtotal =
      typeof item.subtotal === "number" ? item.subtotal : Number.NaN;

    return id &&
      name &&
      Number.isInteger(unitPrice) &&
      unitPrice >= 0 &&
      Number.isInteger(quantity) &&
      quantity > 0 &&
      Number.isInteger(subtotal) &&
      subtotal >= 0
      ? [{ id, name, unitPrice, quantity, subtotal }]
      : [];
  });
};

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
  handoffMethod:
    appointment.handoffMethod as OrbWeaverAppointmentRecord["handoffMethod"],
  handoffWindow: appointment.handoffWindow,
  completionWindow: appointment.completionWindow,
  pickupArea: appointment.pickupArea,
  pickupLatitude: appointment.pickupLatitude?.toNumber() ?? null,
  pickupLongitude: appointment.pickupLongitude?.toNumber() ?? null,
  requestedAddOns: serializeRequestedAddOns(appointment.requestedAddOns),
  serviceUnitPrice: appointment.serviceUnitPrice,
  addOnSubtotal: appointment.addOnSubtotal,
  estimatedSubtotal: appointment.estimatedSubtotal,
  notes: appointment.notes,
  status: appointment.status as OrbWeaverAppointmentStatus,
  createdAt: appointment.createdAt.toISOString(),
  updatedAt: appointment.updatedAt.toISOString(),
});

export const createOrbWeaverAppointment = async (
  input: NewOrbWeaverAppointment
) => {
  const database = getOrbWeaverDatabase();
  const { requestedAddOns, ...appointmentData } = input;
  const requestedAddOnsJson: Prisma.InputJsonArray = requestedAddOns.map(
    ({ id, name, unitPrice, quantity, subtotal }) => ({
      id,
      name,
      unitPrice,
      quantity,
      subtotal,
    })
  );
  const appointment = await database.orbWeaverAppointment.create({
    data: {
      ...appointmentData,
      requestedAddOns: requestedAddOnsJson,
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

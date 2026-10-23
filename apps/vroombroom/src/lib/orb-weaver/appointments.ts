import { randomUUID } from "node:crypto";
import { unstable_noStore as noStore } from "next/cache";
import {
  AppointmentStatus,
  Prisma,
  type OrbWeaverAppointment,
} from "@/generated/prisma/client";
import { getOrbWeaverDatabase } from "@/lib/orb-weaver/database";
import { getOrbWeaverAppointmentReference } from "@/lib/orb-weaver/reference";
import { getOrbWeaverDeliveryQuote } from "@/lib/orb-weaver/delivery-pricing";
import type { ValidatedOrbWeaverAppointmentDetails } from "@/lib/orb-weaver/order-details";
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
  reference:
    appointment.publicReference ??
    getOrbWeaverAppointmentReference(appointment.id),
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
  deliveryDistanceKm: appointment.deliveryDistanceKm?.toNumber() ?? null,
  deliveryFee: appointment.deliveryFee,
  deliveryProofUrl: appointment.deliveryProofUrl,
  finalTotal: appointment.finalTotal,
  deliveryPricedAt: appointment.deliveryPricedAt?.toISOString() ?? null,
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
  const id = randomUUID();
  const publicReference = getOrbWeaverAppointmentReference(id);
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
      id,
      publicReference,
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

export const updateOrbWeaverAppointment = async (
  id: string,
  input: {
    status?: OrbWeaverAppointmentStatus;
    details?: ValidatedOrbWeaverAppointmentDetails;
    deliveryPricing?: {
      distanceKm: number;
      proofUrl: string;
    };
    requirePending?: boolean;
  }
) => {
  const database = getOrbWeaverDatabase();
  const current = await database.orbWeaverAppointment.findUniqueOrThrow({
    where: { id },
  });
  if (input.requirePending && current.status !== AppointmentStatus.PENDING) {
    throw new Error("ORDER_NOT_PENDING");
  }

  const pricingDistance =
    input.deliveryPricing?.distanceKm ??
    current.deliveryDistanceKm?.toNumber() ??
    null;
  const pricingHandoffMethod =
    input.details?.handoffMethod ??
    (current.handoffMethod as OrbWeaverAppointmentRecord["handoffMethod"]);
  const pricingHelmetCount =
    input.details?.helmetCount ?? current.helmetCount;
  const quote = pricingDistance
    ? getOrbWeaverDeliveryQuote({
        distanceKm: pricingDistance,
        handoffMethod: pricingHandoffMethod,
        helmetCount: pricingHelmetCount,
      })
    : null;

  if (input.deliveryPricing && !quote) {
    throw new Error("INVALID_DELIVERY_DISTANCE");
  }

  const detailsJson: Prisma.InputJsonArray | undefined =
    input.details?.requestedAddOns.map(
      ({ id: addOnId, name, unitPrice, quantity, subtotal }) => ({
        id: addOnId,
        name,
        unitPrice,
        quantity,
        subtotal,
      })
    );
  const baseSubtotal =
    input.details?.estimatedSubtotal ?? current.estimatedSubtotal;
  const appointment = await database.orbWeaverAppointment.update({
    where: {
      id,
      ...(input.requirePending ? { status: AppointmentStatus.PENDING } : {}),
    },
    data: {
      ...(input.status
        ? { status: input.status as AppointmentStatus }
        : {}),
      ...(quote && input.deliveryPricing
        ? {
            deliveryDistanceKm: quote.distanceKm,
            deliveryFee: quote.fee,
            deliveryProofUrl: input.deliveryPricing.proofUrl,
            finalTotal:
              baseSubtotal === null
                ? null
                : baseSubtotal + quote.fee,
            deliveryPricedAt: new Date(),
          }
        : {}),
      ...(input.details
        ? {
            customerName: input.details.customerName,
            email: input.details.email,
            phone: input.details.phone,
            service: input.details.service,
            helmetCount: input.details.helmetCount,
            preferredDate: input.details.preferredDate,
            preferredWindow: input.details.preferredWindow,
            handoffMethod: input.details.handoffMethod,
            handoffWindow: input.details.handoffWindow,
            completionWindow: input.details.completionWindow,
            pickupArea: input.details.pickupArea,
            pickupLatitude: input.details.pickupLatitude,
            pickupLongitude: input.details.pickupLongitude,
            requestedAddOns: detailsJson,
            serviceUnitPrice: input.details.serviceUnitPrice,
            addOnSubtotal: input.details.addOnSubtotal,
            estimatedSubtotal: input.details.estimatedSubtotal,
            notes: input.details.notes,
            ...(quote
              ? {
                  deliveryFee: quote.fee,
                  finalTotal: input.details.estimatedSubtotal + quote.fee,
                  deliveryPricedAt: new Date(),
                }
              : {}),
          }
        : {}),
    },
  });

  return serializeAppointment(appointment);
};

export const cancelPendingOrbWeaverAppointment = async (id: string) => {
  const database = getOrbWeaverDatabase();
  const appointment = await database.orbWeaverAppointment.update({
    where: { id, status: AppointmentStatus.PENDING },
    data: { status: AppointmentStatus.CANCELLED },
  });

  return serializeAppointment(appointment);
};

export const findOrbWeaverAppointmentForCustomer = async (
  reference: string,
  phone: string
) => {
  noStore();

  const database = getOrbWeaverDatabase();
  const normalizedReference = reference.trim().toUpperCase();
  const normalizedPhone = phone.replace(/\D/g, "");
  let appointment = await database.orbWeaverAppointment.findUnique({
    where: { publicReference: normalizedReference },
  });

  // Appointments created before publicReference was added still use the
  // deterministic reference derived from their UUID.
  if (!appointment) {
    const legacyAppointments = await database.orbWeaverAppointment.findMany({
      where: { publicReference: null },
      orderBy: { createdAt: "desc" },
      take: 500,
    });
    appointment =
      legacyAppointments.find(
        (candidate) =>
          getOrbWeaverAppointmentReference(candidate.id) ===
          normalizedReference
      ) ?? null;
  }

  if (
    !appointment ||
    appointment.phone.replace(/\D/g, "") !== normalizedPhone
  ) {
    return null;
  }

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

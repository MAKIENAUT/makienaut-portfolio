import { NextRequest, NextResponse } from "next/server";
import {
  cancelPendingOrbWeaverAppointment,
  findOrbWeaverAppointmentForCustomer,
  updateOrbWeaverAppointment,
} from "@/lib/orb-weaver/appointments";
import { validateOrbWeaverAppointmentDetails } from "@/lib/orb-weaver/order-details";
import { isSameOriginRequest } from "@/lib/orb-weaver/request";
import type {
  OrbWeaverAppointmentRecord,
  OrbWeaverOrderTicket,
} from "@/types/orb-weaver";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

const getLookupCredentials = (body: Record<string, unknown>) => {
  const reference =
    typeof body.reference === "string"
      ? body.reference.trim().toUpperCase()
      : "";
  const phone = typeof body.phone === "string" ? body.phone.trim() : "";
  const phoneDigits = phone.replace(/\D/g, "");

  return {
    isValid:
      /^[A-F0-9]{8}$/.test(reference) &&
      phone.length <= 40 &&
      phoneDigits.length >= 7 &&
      phoneDigits.length <= 15,
    phone,
    reference,
  };
};

const toOrderTicket = (
  appointment: OrbWeaverAppointmentRecord
): OrbWeaverOrderTicket => ({
  reference: appointment.reference,
  customerName: appointment.customerName,
  email: appointment.email,
  phone: appointment.phone,
  service: appointment.service,
  helmetCount: appointment.helmetCount,
  preferredDate: appointment.preferredDate,
  preferredWindow: appointment.preferredWindow,
  handoffMethod: appointment.handoffMethod,
  handoffWindow: appointment.handoffWindow,
  completionWindow: appointment.completionWindow,
  pickupArea: appointment.pickupArea,
  pickupLatitude: appointment.pickupLatitude,
  pickupLongitude: appointment.pickupLongitude,
  requestedAddOns: appointment.requestedAddOns,
  serviceUnitPrice: appointment.serviceUnitPrice,
  addOnSubtotal: appointment.addOnSubtotal,
  estimatedSubtotal: appointment.estimatedSubtotal,
  deliveryDistanceKm: appointment.deliveryDistanceKm,
  deliveryFee: appointment.deliveryFee,
  deliveryProofUrl: appointment.deliveryProofUrl,
  finalTotal: appointment.finalTotal,
  deliveryPricedAt: appointment.deliveryPricedAt,
  notes: appointment.notes,
  status: appointment.status,
  createdAt: appointment.createdAt,
  updatedAt: appointment.updatedAt,
});

const privateTicketResponse = (appointment: OrbWeaverAppointmentRecord) => {
  const response = NextResponse.json({ ticket: toOrderTicket(appointment) });
  response.headers.set(
    "Cache-Control",
    "private, no-store, max-age=0, must-revalidate"
  );

  return response;
};

export async function POST(request: NextRequest) {
  if (!isSameOriginRequest(request)) {
    return NextResponse.json({ message: "Request rejected." }, { status: 403 });
  }

  try {
    const parsedBody = await request.json().catch(() => null);

    if (
      !parsedBody ||
      typeof parsedBody !== "object" ||
      Array.isArray(parsedBody)
    ) {
      return NextResponse.json(
        { message: "Enter your order reference and mobile number." },
        { status: 400 }
      );
    }

    const { isValid, phone, reference } = getLookupCredentials(
      parsedBody as Record<string, unknown>
    );

    if (!isValid) {
      return NextResponse.json(
        { message: "Enter a valid order reference and mobile number." },
        { status: 400 }
      );
    }

    const appointment = await findOrbWeaverAppointmentForCustomer(
      reference,
      phone
    );

    if (!appointment) {
      return NextResponse.json(
        {
          message:
            "We could not match that reference and mobile number. Check both and try again.",
        },
        { status: 404 }
      );
    }

    return privateTicketResponse(appointment);
  } catch (error) {
    console.error("Unable to look up VroomBroom order", error);

    return NextResponse.json(
      { message: "Order tracking is temporarily unavailable." },
      { status: 503 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  if (!isSameOriginRequest(request)) {
    return NextResponse.json({ message: "Request rejected." }, { status: 403 });
  }

  try {
    const parsedBody = await request.json().catch(() => null);

    if (
      !parsedBody ||
      typeof parsedBody !== "object" ||
      Array.isArray(parsedBody)
    ) {
      return NextResponse.json(
        { message: "Enter valid order details." },
        { status: 400 }
      );
    }

    const body = parsedBody as Record<string, unknown>;
    const { isValid, phone, reference } = getLookupCredentials(body);

    if (!isValid) {
      return NextResponse.json(
        { message: "Enter a valid order reference and mobile number." },
        { status: 400 }
      );
    }

    const appointment = await findOrbWeaverAppointmentForCustomer(
      reference,
      phone
    );

    if (!appointment) {
      return NextResponse.json(
        { message: "We could not verify this order." },
        { status: 404 }
      );
    }

    if (appointment.status !== "PENDING") {
      return NextResponse.json(
        {
          message:
            "Only pending orders can be edited or cancelled. Contact VroomBroom for help.",
        },
        { status: 409 }
      );
    }

    if (body.action === "cancel") {
      const cancelled = await cancelPendingOrbWeaverAppointment(appointment.id);
      return privateTicketResponse(cancelled);
    }

    if (body.action !== "edit") {
      return NextResponse.json(
        { message: "Choose a valid order action." },
        { status: 400 }
      );
    }

    const validated = validateOrbWeaverAppointmentDetails(body.details);

    if (!validated.ok) {
      return NextResponse.json(
        { message: validated.message },
        { status: 400 }
      );
    }

    const updated = await updateOrbWeaverAppointment(appointment.id, {
      details: validated.details,
      requirePending: true,
    });

    return privateTicketResponse(updated);
  } catch (error) {
    if (
      (error as { code?: string }).code === "P2025" ||
      (error as Error).message === "ORDER_NOT_PENDING"
    ) {
      return NextResponse.json(
        {
          message:
            "This order is no longer pending. Refresh the ticket to see its current status.",
        },
        { status: 409 }
      );
    }

    console.error("Unable to update VroomBroom customer order", error);

    return NextResponse.json(
      { message: "Your order could not be updated right now." },
      { status: 503 }
    );
  }
}

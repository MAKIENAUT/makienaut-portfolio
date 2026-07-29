import { NextRequest, NextResponse } from "next/server";
import { updateOrbWeaverAppointment } from "@/lib/orb-weaver/appointments";
import {
  isOrbWeaverGoogleMapsUrl,
  ORB_WEAVER_MAX_DELIVERY_DISTANCE_KM,
} from "@/lib/orb-weaver/delivery-pricing";
import { validateOrbWeaverAppointmentDetails } from "@/lib/orb-weaver/order-details";
import {
  isOrbWeaverAuthenticated,
  isSameOriginRequest,
} from "@/lib/orb-weaver/request";
import {
  ORB_WEAVER_STATUSES,
  type OrbWeaverAppointmentStatus,
} from "@/types/orb-weaver";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  if (!(await isOrbWeaverAuthenticated(request))) {
    return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
  }

  if (!isSameOriginRequest(request)) {
    return NextResponse.json({ message: "Request rejected." }, { status: 403 });
  }

  try {
    const { id } = await context.params;
    const parsedBody = await request.json().catch(() => null);

    if (
      !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
        id
      ) ||
      !parsedBody ||
      typeof parsedBody !== "object" ||
      Array.isArray(parsedBody)
    ) {
      return NextResponse.json(
        { message: "Choose a valid appointment status." },
        { status: 400 }
      );
    }

    const body = parsedBody as {
      status?: unknown;
      deliveryDistanceKm?: unknown;
      deliveryProofUrl?: unknown;
      details?: unknown;
    };
    const hasStatus = body.status !== undefined;
    const status = typeof body.status === "string" ? body.status : "";
    const hasDeliveryPricing =
      body.deliveryDistanceKm !== undefined ||
      body.deliveryProofUrl !== undefined;
    const hasDetails = body.details !== undefined;
    const deliveryDistanceKm = Number(body.deliveryDistanceKm);
    const deliveryProofUrl =
      typeof body.deliveryProofUrl === "string"
        ? body.deliveryProofUrl.trim()
        : "";

    if (
      (!hasStatus && !hasDeliveryPricing && !hasDetails) ||
      (hasStatus &&
        !ORB_WEAVER_STATUSES.includes(status as OrbWeaverAppointmentStatus))
    ) {
      return NextResponse.json(
        { message: "Choose a valid update." },
        { status: 400 }
      );
    }

    const validatedDetails = hasDetails
      ? validateOrbWeaverAppointmentDetails(body.details, {
          allowPastDate: true,
        })
      : null;

    if (validatedDetails && !validatedDetails.ok) {
      return NextResponse.json(
        { message: validatedDetails.message },
        { status: 400 }
      );
    }

    if (
      hasDeliveryPricing &&
      (!Number.isFinite(deliveryDistanceKm) ||
        deliveryDistanceKm <= 0 ||
        deliveryDistanceKm > ORB_WEAVER_MAX_DELIVERY_DISTANCE_KM ||
        deliveryProofUrl.length > 600 ||
        !isOrbWeaverGoogleMapsUrl(deliveryProofUrl))
    ) {
      return NextResponse.json(
        {
          message:
            `Enter a distance from 0.01 to ${ORB_WEAVER_MAX_DELIVERY_DISTANCE_KM} km and a valid Google Maps route link.`,
        },
        { status: 400 }
      );
    }

    const appointment = await updateOrbWeaverAppointment(id, {
      ...(hasStatus
        ? { status: status as OrbWeaverAppointmentStatus }
        : {}),
      ...(hasDeliveryPricing
        ? {
            deliveryPricing: {
              distanceKm: deliveryDistanceKm,
              proofUrl: deliveryProofUrl,
            },
          }
        : {}),
      ...(validatedDetails?.ok
        ? { details: validatedDetails.details }
        : {}),
    });
    const response = NextResponse.json({ appointment });
    response.headers.set("Cache-Control", "private, no-store");

    return response;
  } catch (error) {
    if ((error as { code?: string }).code === "P2025") {
      return NextResponse.json(
        { message: "Appointment not found." },
        { status: 404 }
      );
    }

    if ((error as Error).message === "INVALID_DELIVERY_DISTANCE") {
      return NextResponse.json(
        { message: "That distance could not be priced." },
        { status: 400 }
      );
    }

    console.error("Unable to update VroomBroom appointment", error);

    return NextResponse.json(
      { message: "Appointment could not be updated." },
      { status: 503 }
    );
  }
}

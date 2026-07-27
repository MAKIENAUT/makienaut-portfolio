import { NextRequest, NextResponse } from "next/server";
import { updateOrbWeaverAppointmentStatus } from "@/lib/orb-weaver/appointments";
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

    const body = parsedBody as { status?: unknown };
    const status = typeof body.status === "string" ? body.status : "";

    if (
      !ORB_WEAVER_STATUSES.includes(status as OrbWeaverAppointmentStatus)
    ) {
      return NextResponse.json(
        { message: "Choose a valid appointment status." },
        { status: 400 }
      );
    }

    const appointment = await updateOrbWeaverAppointmentStatus(
      id,
      status as OrbWeaverAppointmentStatus
    );
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

    console.error("Unable to update VroomBroom appointment", error);

    return NextResponse.json(
      { message: "Appointment could not be updated." },
      { status: 503 }
    );
  }
}

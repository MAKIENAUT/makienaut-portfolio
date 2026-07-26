import { NextRequest, NextResponse } from "next/server";
import {
  countRecentOrbWeaverAppointments,
  createOrbWeaverAppointment,
} from "@/lib/orb-weaver/appointments";
import {
  getOrbWeaverRequestFingerprint,
  isSameOriginRequest,
} from "@/lib/orb-weaver/request";
import {
  ORB_WEAVER_SERVICES,
  ORB_WEAVER_TIME_WINDOWS,
  type OrbWeaverServiceId,
  type OrbWeaverTimeWindow,
} from "@/types/orb-weaver";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const serviceIds = new Set<string>(
  ORB_WEAVER_SERVICES.map((service) => service.id)
);
const timeWindowIds = new Set<string>(
  ORB_WEAVER_TIME_WINDOWS.map((window) => window.id)
);

const textValue = (value: unknown, maxLength: number) =>
  typeof value === "string" ? value.trim().slice(0, maxLength) : "";

const getManilaDate = () => {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Manila",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());
  const getPart = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value ?? "";

  return `${getPart("year")}-${getPart("month")}-${getPart("day")}`;
};

export async function POST(request: NextRequest) {
  if (!isSameOriginRequest(request)) {
    return NextResponse.json({ message: "Request rejected." }, { status: 403 });
  }

  try {
    const body = (await request.json()) as Record<string, unknown>;

    // Honeypot field: return a normal-looking response without writing data.
    if (textValue(body.website, 200)) {
      return NextResponse.json(
        { message: "Your appointment request has been received." },
        { status: 201 }
      );
    }

    const customerName = textValue(body.customerName, 100);
    const email = textValue(body.email, 160).toLowerCase();
    const phone = textValue(body.phone, 40);
    const service = textValue(body.service, 50);
    const preferredDate = textValue(body.preferredDate, 10);
    const preferredWindow = textValue(body.preferredWindow, 30);
    const notes = textValue(body.notes, 1000);
    const helmetCount = Number(body.helmetCount);
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phonePattern = /^[+()\d\s.-]{7,40}$/;
    const datePattern = /^\d{4}-\d{2}-\d{2}$/;
    const today = getManilaDate();
    const maxDate = new Date(`${today}T00:00:00.000Z`);
    maxDate.setUTCDate(maxDate.getUTCDate() + 180);
    const latestDate = maxDate.toISOString().slice(0, 10);

    if (
      customerName.length < 2 ||
      (email.length > 0 && !emailPattern.test(email)) ||
      !phonePattern.test(phone) ||
      !serviceIds.has(service) ||
      !timeWindowIds.has(preferredWindow) ||
      !Number.isInteger(helmetCount) ||
      helmetCount < 1 ||
      helmetCount > 10 ||
      !datePattern.test(preferredDate) ||
      preferredDate < today ||
      preferredDate > latestDate
    ) {
      return NextResponse.json(
        { message: "Please check the form and try again." },
        { status: 400 }
      );
    }

    const sourceFingerprint = getOrbWeaverRequestFingerprint(
      request,
      "appointment"
    );

    if (sourceFingerprint) {
      const recentRequests = await countRecentOrbWeaverAppointments(
        sourceFingerprint,
        new Date(Date.now() - 30 * 60 * 1000)
      );

      if (recentRequests >= 5) {
        return NextResponse.json(
          { message: "Too many requests. Please try again a little later." },
          { status: 429 }
        );
      }
    }

    const appointment = await createOrbWeaverAppointment({
      customerName,
      email,
      phone,
      service: service as OrbWeaverServiceId,
      helmetCount,
      preferredDate: new Date(`${preferredDate}T00:00:00.000Z`),
      preferredWindow: preferredWindow as OrbWeaverTimeWindow,
      notes: notes || undefined,
      sourceFingerprint,
    });

    return NextResponse.json(
      {
        message:
          "Your request is in. VroomBroom will contact you to confirm the schedule.",
        reference: appointment.reference,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Unable to create VroomBroom appointment", error);

    return NextResponse.json(
      {
        message:
          "Appointments are temporarily unavailable. Please try again later.",
      },
      { status: 503 }
    );
  }
}

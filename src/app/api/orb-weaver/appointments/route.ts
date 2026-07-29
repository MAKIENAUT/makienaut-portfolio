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
  ORB_WEAVER_ADD_ONS,
  ORB_WEAVER_HANDOFF_METHODS,
  ORB_WEAVER_SERVICES,
  ORB_WEAVER_TIME_WINDOWS,
  type OrbWeaverHandoffMethod,
  type OrbWeaverServiceId,
  type OrbWeaverTimeWindow,
} from "@/types/orb-weaver";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const textValue = (value: unknown) =>
  typeof value === "string" ? value.trim() : "";

const getManilaNow = () => {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Manila",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(new Date());
  const getPart = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value ?? "";

  return {
    date: `${getPart("year")}-${getPart("month")}-${getPart("day")}`,
    minuteOfDay: Number(getPart("hour")) * 60 + Number(getPart("minute")),
  };
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
        { message: "Please send valid booking details." },
        { status: 400 }
      );
    }

    const body = parsedBody as Record<string, unknown>;

    const customerName = textValue(body.customerName);
    const email = textValue(body.email).toLowerCase();
    const phone = textValue(body.phone);
    const service = textValue(body.service);
    const preferredDate = textValue(body.preferredDate);
    const preferredWindow = textValue(body.preferredWindow);
    const handoffMethod = textValue(body.handoff);
    const pickupArea = textValue(body.pickupArea);
    const pickupLatitudeValue = textValue(body.pickupLatitude);
    const pickupLongitudeValue = textValue(body.pickupLongitude);
    const pickupLatitude = Number(pickupLatitudeValue);
    const pickupLongitude = Number(pickupLongitudeValue);
    const notes = textValue(body.notes);
    const contactConsent = body.contactConsent === true;
    const helmetCount = Number(body.helmetCount);
    const submittedAddOnIds: string[] | null =
      body.addOnIds === undefined
        ? []
        : Array.isArray(body.addOnIds) &&
          body.addOnIds.every((value) => typeof value === "string")
        ? (body.addOnIds as string[]).map((value) => value.trim())
        : null;
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phonePattern = /^[+()\d\s.-]{7,40}$/;
    const phoneDigitCount = phone.replace(/\D/g, "").length;
    const datePattern = /^\d{4}-\d{2}-\d{2}$/;
    const manilaNow = getManilaNow();
    const today = manilaNow.date;
    const maxDate = new Date(`${today}T00:00:00.000Z`);
    maxDate.setUTCDate(maxDate.getUTCDate() + 180);
    const latestDate = maxDate.toISOString().slice(0, 10);
    const parsedPreferredDate = datePattern.test(preferredDate)
      ? new Date(`${preferredDate}T00:00:00.000Z`)
      : null;
    const hasValidPreferredDate =
      parsedPreferredDate !== null &&
      !Number.isNaN(parsedPreferredDate.getTime()) &&
      parsedPreferredDate.toISOString().slice(0, 10) === preferredDate;
    const preferredDay = hasValidPreferredDate
      ? parsedPreferredDate.getUTCDay()
      : -1;
    const preferredAvailability =
      preferredDay === 0 || preferredDay === 6 ? "weekend" : "weekday";
    const selectedService = ORB_WEAVER_SERVICES.find(
      (option) => option.id === service && option.available
    );
    const selectedTimeWindow = ORB_WEAVER_TIME_WINDOWS.find(
      (window) =>
        window.id === preferredWindow &&
        window.availability === preferredAvailability
    );
    const hasBookableTimeRemaining =
      preferredDate !== today ||
      !selectedTimeWindow ||
      selectedTimeWindow.handoffEndMinutes > manilaNow.minuteOfDay;
    const uniqueAddOnIds = submittedAddOnIds
      ? new Set(submittedAddOnIds)
      : new Set<string>();
    const hasValidAddOns =
      submittedAddOnIds !== null &&
      uniqueAddOnIds.size === submittedAddOnIds.length &&
      submittedAddOnIds.every((addOnId) => {
        const addOn = ORB_WEAVER_ADD_ONS.find(
          (option) => option.id === addOnId
        );

        return (
          addOn &&
          selectedService &&
          !(addOn.includedIn as readonly string[]).includes(selectedService.id)
        );
      });
    const hasValidHelmetCount =
      selectedService &&
      Number.isInteger(helmetCount) &&
      helmetCount >= selectedService.minimumHelmets &&
      helmetCount <= 10 &&
      (selectedService.id === "multiple_helmets" || helmetCount === 1);
    const hasValidPickupPin =
      pickupLatitudeValue.length > 0 &&
      pickupLongitudeValue.length > 0 &&
      Number.isFinite(pickupLatitude) &&
      Number.isFinite(pickupLongitude) &&
      pickupLatitude >= -90 &&
      pickupLatitude <= 90 &&
      pickupLongitude >= -180 &&
      pickupLongitude <= 180;

    if (
      customerName.length < 2 ||
      customerName.length > 100 ||
      email.length > 160 ||
      (email.length > 0 && !emailPattern.test(email)) ||
      phone.length > 40 ||
      !phonePattern.test(phone) ||
      phoneDigitCount < 7 ||
      phoneDigitCount > 15 ||
      service.length > 50 ||
      !selectedService ||
      preferredWindow.length > 30 ||
      !selectedTimeWindow ||
      !hasBookableTimeRemaining ||
      handoffMethod.length > 30 ||
      !ORB_WEAVER_HANDOFF_METHODS.includes(
        handoffMethod as OrbWeaverHandoffMethod
      ) ||
      pickupArea.length > 180 ||
      pickupLatitudeValue.length > 24 ||
      pickupLongitudeValue.length > 24 ||
      (handoffMethod === "pickup_return" && !hasValidPickupPin) ||
      !hasValidHelmetCount ||
      !hasValidAddOns ||
      notes.length > 700 ||
      !contactConsent ||
      !hasValidPreferredDate ||
      preferredDate < today ||
      preferredDate > latestDate
    ) {
      return NextResponse.json(
        { message: "Please check the form and try again." },
        { status: 400 }
      );
    }

    const requestedAddOns = (submittedAddOnIds ?? []).map((addOnId) => {
      const addOn = ORB_WEAVER_ADD_ONS.find(
        (option) => option.id === addOnId
      )!;
      const quantity = addOn.perBooking ? 1 : helmetCount;

      return {
        id: addOn.id,
        name: addOn.name,
        unitPrice: addOn.price,
        quantity,
        subtotal: addOn.price * quantity,
      };
    });
    const addOnSubtotal = requestedAddOns.reduce(
      (total, addOn) => total + addOn.subtotal,
      0
    );
    const estimatedSubtotal =
      selectedService.price * helmetCount + addOnSubtotal;
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
      handoffMethod: handoffMethod as OrbWeaverHandoffMethod,
      handoffWindow: selectedTimeWindow.shortName,
      completionWindow: selectedTimeWindow.completionTime,
      pickupArea:
        handoffMethod === "pickup_return" && pickupArea
          ? pickupArea
          : undefined,
      pickupLatitude:
        handoffMethod === "pickup_return" ? pickupLatitude : undefined,
      pickupLongitude:
        handoffMethod === "pickup_return" ? pickupLongitude : undefined,
      requestedAddOns,
      serviceUnitPrice: selectedService.price,
      addOnSubtotal,
      estimatedSubtotal,
      notes: notes || undefined,
      sourceFingerprint,
    });

    return NextResponse.json(
      {
        message:
          "Your request is in. VroomBroom will contact you to confirm the schedule.",
        reference: appointment.reference,
        estimatedSubtotal,
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

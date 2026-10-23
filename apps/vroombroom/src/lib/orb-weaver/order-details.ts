import {
  ORB_WEAVER_ADD_ONS,
  ORB_WEAVER_HANDOFF_METHODS,
  ORB_WEAVER_SERVICES,
  ORB_WEAVER_TIME_WINDOWS,
  type OrbWeaverEditableAppointmentDetails,
  type OrbWeaverHandoffMethod,
  type OrbWeaverRequestedAddOn,
  type OrbWeaverServiceId,
  type OrbWeaverTimeWindow,
} from "@/types/orb-weaver";

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

export interface ValidatedOrbWeaverAppointmentDetails {
  customerName: string;
  email: string;
  phone: string;
  service: OrbWeaverServiceId;
  helmetCount: number;
  preferredDate: Date;
  preferredWindow: OrbWeaverTimeWindow;
  handoffMethod: OrbWeaverHandoffMethod;
  handoffWindow: string;
  completionWindow: string;
  pickupArea: string | null;
  pickupLatitude: number | null;
  pickupLongitude: number | null;
  requestedAddOns: OrbWeaverRequestedAddOn[];
  serviceUnitPrice: number;
  addOnSubtotal: number;
  estimatedSubtotal: number;
  notes: string | null;
}

type ValidationResult =
  | { ok: true; details: ValidatedOrbWeaverAppointmentDetails }
  | { ok: false; message: string };

export const validateOrbWeaverAppointmentDetails = (
  value: unknown,
  options: { allowPastDate?: boolean } = {}
): ValidationResult => {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return { ok: false, message: "Enter valid order details." };
  }

  const body = value as Record<string, unknown>;
  const customerName = textValue(body.customerName);
  const email = textValue(body.email).toLowerCase();
  const phone = textValue(body.phone);
  const service = textValue(body.service);
  const preferredDate = textValue(body.preferredDate);
  const preferredWindow = textValue(body.preferredWindow);
  const handoffMethod = textValue(
    body.handoffMethod === undefined ? body.handoff : body.handoffMethod
  );
  const pickupArea = textValue(body.pickupArea);
  const notes = textValue(body.notes);
  const helmetCount = Number(body.helmetCount);
  const pickupLatitude =
    body.pickupLatitude === null || body.pickupLatitude === ""
      ? null
      : Number(body.pickupLatitude);
  const pickupLongitude =
    body.pickupLongitude === null || body.pickupLongitude === ""
      ? null
      : Number(body.pickupLongitude);
  const submittedAddOnIds: string[] | null = Array.isArray(body.addOnIds)
    ? body.addOnIds.every((item) => typeof item === "string")
      ? (body.addOnIds as string[]).map((item) => item.trim())
      : null
    : [];
  const selectedService = ORB_WEAVER_SERVICES.find(
    (option) => option.id === service && option.available
  );
  const datePattern = /^\d{4}-\d{2}-\d{2}$/;
  const parsedPreferredDate = datePattern.test(preferredDate)
    ? new Date(`${preferredDate}T00:00:00.000Z`)
    : null;
  const hasValidDate =
    parsedPreferredDate !== null &&
    !Number.isNaN(parsedPreferredDate.getTime()) &&
    parsedPreferredDate.toISOString().slice(0, 10) === preferredDate;
  const preferredDay = hasValidDate ? parsedPreferredDate.getUTCDay() : -1;
  const preferredAvailability =
    preferredDay === 0 || preferredDay === 6 ? "weekend" : "weekday";
  const selectedTimeWindow = ORB_WEAVER_TIME_WINDOWS.find(
    (window) =>
      window.id === preferredWindow &&
      window.availability === preferredAvailability
  );
  const manilaNow = getManilaNow();
  const maxDate = new Date(`${manilaNow.date}T00:00:00.000Z`);
  maxDate.setUTCDate(maxDate.getUTCDate() + 180);
  const hasTimeRemaining =
    options.allowPastDate ||
    preferredDate !== manilaNow.date ||
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
    pickupLatitude !== null &&
    pickupLongitude !== null &&
    Number.isFinite(pickupLatitude) &&
    Number.isFinite(pickupLongitude) &&
    pickupLatitude >= -90 &&
    pickupLatitude <= 90 &&
    pickupLongitude >= -180 &&
    pickupLongitude <= 180;
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const phonePattern = /^[+()\d\s.-]{7,40}$/;
  const phoneDigitCount = phone.replace(/\D/g, "").length;

  if (
    customerName.length < 2 ||
    customerName.length > 100 ||
    email.length > 160 ||
    (email.length > 0 && !emailPattern.test(email)) ||
    phone.length > 40 ||
    !phonePattern.test(phone) ||
    phoneDigitCount < 7 ||
    phoneDigitCount > 15 ||
    !selectedService ||
    !hasValidHelmetCount ||
    !hasValidAddOns ||
    !hasValidDate ||
    (!options.allowPastDate && preferredDate < manilaNow.date) ||
    preferredDate > maxDate.toISOString().slice(0, 10) ||
    !selectedTimeWindow ||
    !hasTimeRemaining ||
    !ORB_WEAVER_HANDOFF_METHODS.includes(
      handoffMethod as OrbWeaverHandoffMethod
    ) ||
    pickupArea.length > 180 ||
    (handoffMethod === "pickup_return" && !hasValidPickupPin) ||
    notes.length > 700
  ) {
    return {
      ok: false,
      message:
        "Check the contact, service, schedule, handoff, and location details.",
    };
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

  return {
    ok: true,
    details: {
      customerName,
      email,
      phone,
      service: service as OrbWeaverServiceId,
      helmetCount,
      preferredDate: parsedPreferredDate!,
      preferredWindow: preferredWindow as OrbWeaverTimeWindow,
      handoffMethod: handoffMethod as OrbWeaverHandoffMethod,
      handoffWindow: selectedTimeWindow.shortName,
      completionWindow: selectedTimeWindow.completionTime,
      pickupArea:
        handoffMethod === "pickup_return" ? pickupArea || null : null,
      pickupLatitude:
        handoffMethod === "pickup_return" ? pickupLatitude : null,
      pickupLongitude:
        handoffMethod === "pickup_return" ? pickupLongitude : null,
      requestedAddOns,
      serviceUnitPrice: selectedService.price,
      addOnSubtotal,
      estimatedSubtotal:
        selectedService.price * helmetCount + addOnSubtotal,
      notes: notes || null,
    },
  };
};

export const getEditableOrbWeaverAppointmentDetails = (
  appointment: {
    customerName: string;
    email: string;
    phone: string;
    service: OrbWeaverServiceId;
    helmetCount: number;
    preferredDate: string;
    preferredWindow: OrbWeaverTimeWindow;
    handoffMethod: OrbWeaverHandoffMethod | null;
    pickupArea: string | null;
    pickupLatitude: number | null;
    pickupLongitude: number | null;
    requestedAddOns: OrbWeaverRequestedAddOn[];
    notes: string | null;
  }
): OrbWeaverEditableAppointmentDetails => ({
  customerName: appointment.customerName,
  email: appointment.email,
  phone: appointment.phone,
  service: appointment.service,
  helmetCount: appointment.helmetCount,
  preferredDate: appointment.preferredDate,
  preferredWindow: appointment.preferredWindow,
  handoffMethod: appointment.handoffMethod ?? "drop_off",
  pickupArea: appointment.pickupArea ?? "",
  pickupLatitude: appointment.pickupLatitude,
  pickupLongitude: appointment.pickupLongitude,
  addOnIds: appointment.requestedAddOns.map((addOn) => addOn.id),
  notes: appointment.notes ?? "",
});

"use client";

import dynamic from "next/dynamic";
import {
  type FormEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  FaArrowLeft,
  FaArrowRight,
  FaCheck,
  FaCheckCircle,
  FaChevronDown,
  FaEdit,
  FaEnvelope,
  FaExternalLinkAlt,
  FaMapMarkerAlt,
  FaMotorcycle,
  FaPhoneAlt,
  FaReceipt,
  FaStore,
} from "react-icons/fa";
import {
  ORB_WEAVER_ADD_ONS,
  ORB_WEAVER_SERVICES,
  ORB_WEAVER_TIME_WINDOWS,
  type OrbWeaverServiceId,
  type OrbWeaverTimeWindow,
} from "@/types/orb-weaver";
import { BookingSchedulePicker } from "@/components/orb-weaver/BookingSchedulePicker";
import { PendingNavigationLink } from "@/components/orb-weaver/PendingNavigationLink";
import {
  getOrbWeaverPickupMapUrl,
  ORB_WEAVER_MEETUP,
  type OrbWeaverGeoPoint,
} from "@/lib/orb-weaver/location";

type FormState =
  | { status: "idle"; message?: undefined; reference?: undefined }
  | { status: "submitting"; message?: undefined; reference?: undefined }
  | { status: "success"; message: string; reference: string }
  | { status: "error"; message: string; reference?: undefined };

interface AppointmentFormProps {
  initialServiceId?: OrbWeaverServiceId;
}

type ReviewValues = Record<string, string>;

const CustomerLocationPicker = dynamic(
  () =>
    import("@/components/orb-weaver/CustomerLocationPicker").then(
      (module) => module.CustomerLocationPicker
    ),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-48 items-center justify-center rounded-2xl border border-white/10 bg-black/20 text-sm text-stone-500 sm:h-56">
        Loading pickup map…
      </div>
    ),
  }
);

const steps = [
  {
    label: "Contact",
    title: "How can we reach you?",
    description: "We only use these details to confirm this booking.",
  },
  {
    label: "Cleaning",
    title: "Choose your helmet care",
    description: "Pick a cleaning option and any useful extras.",
  },
  {
    label: "Schedule",
    title: "Choose a handoff schedule",
    description:
      "Choose how the helmet changes hands, then allow at least a 2-hour cleaning buffer.",
  },
  {
    label: "Review",
    title: "Review your request",
    description: "Check the essentials before sending it to VroomBroom.",
  },
] as const;

const inputClasses =
  "min-h-11 w-full rounded-xl border border-white/10 bg-black/35 px-3.5 py-2.5 text-sm text-white outline-none transition placeholder:text-stone-500 focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20";
const labelClasses = "mb-1.5 block text-sm font-medium text-stone-200";
const isAddOnIncluded = (
  addOn: (typeof ORB_WEAVER_ADD_ONS)[number],
  serviceId: OrbWeaverServiceId | ""
) => (addOn.includedIn as readonly string[]).includes(serviceId);

const getManilaToday = () => {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Manila",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());
  const part = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((item) => item.type === type)?.value ?? "";

  return `${part("year")}-${part("month")}-${part("day")}`;
};

const formatReviewDate = (value?: string) => {
  if (!value) {
    return "Not selected";
  }

  return new Intl.DateTimeFormat("en-PH", {
    timeZone: "Asia/Manila",
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(`${value}T00:00:00+08:00`));
};

const formatPeso = (amount: number) =>
  new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    maximumFractionDigits: 0,
  }).format(amount);

export function AppointmentForm({
  initialServiceId,
}: AppointmentFormProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [formState, setFormState] = useState<FormState>({ status: "idle" });
  const [selectedService, setSelectedService] = useState<
    OrbWeaverServiceId | ""
  >(initialServiceId ?? "");
  const [helmetCount, setHelmetCount] = useState(
    initialServiceId === "multiple_helmets" ? 2 : 1
  );
  const [selectedAddOns, setSelectedAddOns] = useState<string[]>([]);
  const [handoff, setHandoff] = useState<"drop_off" | "pickup_return">(
    "drop_off"
  );
  const [pickupLocation, setPickupLocation] =
    useState<OrbWeaverGeoPoint | null>(null);
  const [pickupLocationError, setPickupLocationError] = useState("");
  const [preferredDate, setPreferredDate] = useState("");
  const [preferredWindow, setPreferredWindow] = useState<
    OrbWeaverTimeWindow | ""
  >("");
  const [scheduleError, setScheduleError] = useState("");
  const [reviewValues, setReviewValues] = useState<ReviewValues>({});
  const formRef = useRef<HTMLFormElement>(null);
  const stepHeadingRef = useRef<HTMLHeadingElement>(null);
  const feedbackRef = useRef<HTMLDivElement>(null);
  const hasMountedRef = useRef(false);
  const minimumDate = useMemo(getManilaToday, []);
  const selectedServiceDetails = ORB_WEAVER_SERVICES.find(
    (service) => service.id === selectedService
  );
  const selectedTimeWindow = ORB_WEAVER_TIME_WINDOWS.find(
    (window) => window.id === reviewValues.preferredWindow
  );
  const addOnSubtotal = ORB_WEAVER_ADD_ONS.reduce((total, addOn) => {
    if (
      !selectedAddOns.includes(addOn.id) ||
      isAddOnIncluded(addOn, selectedService)
    ) {
      return total;
    }

    return total + addOn.price * (addOn.perBooking ? 1 : helmetCount);
  }, 0);
  const estimatedSubtotal = selectedServiceDetails
    ? selectedServiceDetails.price * helmetCount + addOnSubtotal
    : 0;

  useEffect(() => {
    if (!hasMountedRef.current) {
      hasMountedRef.current = true;
      return;
    }

    window.requestAnimationFrame(() => {
      stepHeadingRef.current?.focus({ preventScroll: true });
      window.scrollTo({
        top: 0,
        behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
          ? "auto"
          : "smooth",
      });
    });
  }, [currentStep]);

  const selectService = (serviceId: OrbWeaverServiceId) => {
    const service = ORB_WEAVER_SERVICES.find(
      (option) => option.id === serviceId
    );

    if (!service?.available) {
      return;
    }

    setSelectedService(serviceId);
    setHelmetCount(serviceId === "multiple_helmets" ? 2 : 1);
    setSelectedAddOns((current) =>
      current.filter((addOnId) => {
        const addOn = ORB_WEAVER_ADD_ONS.find(
          (option) => option.id === addOnId
        );

        return addOn && !isAddOnIncluded(addOn, serviceId);
      })
    );
  };

  const toggleAddOn = (addOnId: string) => {
    setSelectedAddOns((current) =>
      current.includes(addOnId)
        ? current.filter((id) => id !== addOnId)
        : [...current, addOnId]
    );
  };

  const validateStep = (stepIndex: number) => {
    const panel = formRef.current?.querySelector<HTMLElement>(
      `[data-form-step="${stepIndex}"]`
    );
    const customerNameControl =
      panel?.querySelector<HTMLInputElement>("#orb-name");
    const phoneControl =
      panel?.querySelector<HTMLInputElement>("#orb-phone");

    if (customerNameControl) {
      customerNameControl.setCustomValidity(
        customerNameControl.value.trim().length >= 2
          ? ""
          : "Enter your name using at least 2 characters."
      );
    }

    if (phoneControl) {
      const digitCount = phoneControl.value.replace(/\D/g, "").length;
      phoneControl.setCustomValidity(
        digitCount >= 7 && digitCount <= 15
          ? ""
          : "Enter a mobile number containing 7 to 15 digits."
      );
    }

    const controls = Array.from(
      panel?.querySelectorAll<
        HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
      >("input, select, textarea") ?? []
    );
    const invalidControl = controls.find(
      (control) => control.willValidate && !control.checkValidity()
    );

    if (invalidControl) {
      invalidControl.reportValidity();
      invalidControl.focus({ preventScroll: true });
      invalidControl.scrollIntoView({ behavior: "smooth", block: "center" });
      return false;
    }

    if (stepIndex === 2 && (!preferredDate || !preferredWindow)) {
      setScheduleError("Choose an available date and handoff time.");
      const schedulePicker = document.getElementById("orb-booking-schedule");
      schedulePicker?.scrollIntoView({ behavior: "smooth", block: "center" });
      schedulePicker?.focus({ preventScroll: true });
      return false;
    }

    setScheduleError("");

    if (
      stepIndex === 2 &&
      handoff === "pickup_return" &&
      !pickupLocation
    ) {
      setPickupLocationError(
        "Use your current location or tap the map to place a pickup pin."
      );
      const locationPicker = document.getElementById("orb-pickup-location");
      locationPicker?.scrollIntoView({ behavior: "smooth", block: "center" });
      locationPicker?.focus({ preventScroll: true });
      return false;
    }

    return true;
  };

  const captureReviewValues = () => {
    if (!formRef.current) {
      return;
    }

    const values: ReviewValues = {};
    new FormData(formRef.current).forEach((value, key) => {
      if (typeof value === "string") {
        values[key] = value;
      }
    });
    setReviewValues(values);
  };

  const goToNextStep = () => {
    if (!validateStep(currentStep)) {
      return;
    }

    if (currentStep === steps.length - 2) {
      captureReviewValues();
    }

    setCurrentStep((step) => Math.min(step + 1, steps.length - 1));
  };

  const goToPreviousStep = () => {
    setFormState({ status: "idle" });
    setCurrentStep((step) => Math.max(step - 1, 0));
  };

  const startOver = () => {
    formRef.current?.reset();
    setFormState({ status: "idle" });
    setCurrentStep(0);
    setSelectedService(initialServiceId ?? "");
    setHelmetCount(initialServiceId === "multiple_helmets" ? 2 : 1);
    setSelectedAddOns([]);
    setHandoff("drop_off");
    setPickupLocation(null);
    setPickupLocationError("");
    setPreferredDate("");
    setPreferredWindow("");
    setScheduleError("");
    setReviewValues({});
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (currentStep < steps.length - 1) {
      goToNextStep();
      return;
    }

    if (!validateStep(currentStep)) {
      return;
    }

    if (handoff === "pickup_return" && !pickupLocation) {
      setCurrentStep(2);
      window.requestAnimationFrame(() => {
        setPickupLocationError(
          "Use your current location or tap the map to place a pickup pin."
        );
      });
      return;
    }

    const form = event.currentTarget;
    const formData = new FormData(form);
    const payload: Record<string, unknown> = Object.fromEntries(
      formData.entries()
    );
    const customerNote = String(formData.get("notes") ?? "").trim();
    payload.addOnIds = formData.getAll("addOns").map(String);
    payload.contactConsent = formData.get("contactConsent") === "on";
    payload.notes = customerNote;
    delete payload.addOns;
    delete payload.scheduleWindowChoice;

    setFormState({ status: "submitting" });

    try {
      const response = await fetch("/api/orb-weaver/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = (await response.json()) as {
        message?: string;
        reference?: string;
      };

      if (!response.ok) {
        throw new Error(
          result.message || "Your request could not be sent right now."
        );
      }

      if (!result.reference || !/^[A-F0-9]{8}$/.test(result.reference)) {
        throw new Error(
          "The booking was not given a reference number. Please try again."
        );
      }

      try {
        window.sessionStorage.setItem(
          `vroombroom-order-phone:${result.reference}`,
          String(formData.get("phone") ?? "")
        );
      } catch {
        // Tracking still works when session storage is unavailable.
      }

      form.reset();
      setFormState({
        status: "success",
        message:
          result.message ||
          "Your appointment request has been received for confirmation.",
        reference: result.reference,
      });
    } catch (error) {
      setFormState({
        status: "error",
        message:
          error instanceof Error
            ? error.message
            : "Your request could not be sent right now.",
      });
    } finally {
      window.requestAnimationFrame(() => feedbackRef.current?.focus());
    }
  };

  if (formState.status === "success") {
    return (
      <div
        ref={feedbackRef}
        tabIndex={-1}
        role="status"
        className="outline-none"
      >
        <div className="mb-5 text-center">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-300 text-2xl text-black">
            <FaCheckCircle aria-hidden="true" />
          </span>
          <p className="mt-4 text-xs font-semibold uppercase tracking-[0.22em] text-emerald-300">
            Request received
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-white">
            Your booking is in the queue.
          </h2>
        </div>

        <div className="mx-auto max-w-xl drop-shadow-[0_28px_42px_rgba(0,0,0,0.42)]">
          <div
            aria-hidden="true"
            className="h-3"
            style={{
              backgroundImage:
                "linear-gradient(135deg, transparent 50%, #f4eddd 50%), linear-gradient(45deg, #f4eddd 50%, transparent 50%)",
              backgroundPosition: "0 0, 8px 0",
              backgroundSize: "16px 16px",
            }}
          />
          <article
            className="relative bg-[#f4eddd] text-left font-mono text-[#2d2922]"
            style={{
              backgroundImage:
                "radial-gradient(rgba(91,76,48,0.08) 0.7px, transparent 0.7px)",
              backgroundSize: "5px 5px",
            }}
          >
            <header className="relative px-5 pb-5 pt-6 text-center sm:px-8 sm:pt-8">
              <div className="flex flex-col items-center text-center">
                <div>
                  <p className="font-sans text-lg font-black uppercase tracking-[0.16em] text-[#201d18]">
                    VroomBroom
                  </p>
                  <p className="mt-0.5 text-[0.6rem] uppercase tracking-[0.2em] text-[#746b5d]">
                    Helmet care receipt
                  </p>
                </div>
                <span className="mt-3 inline-flex -rotate-2 items-center justify-center border-2 border-[#8b3a2c] px-4 py-1.5 text-center font-sans text-[0.62rem] font-black uppercase leading-4 tracking-[0.16em] text-[#8b3a2c]">
                  Pending
                </span>
              </div>

              <div className="mt-6 border-y-2 border-dashed border-[#a99f8d] py-5">
                <p className="text-[0.62rem] font-bold uppercase tracking-[0.2em] text-[#746b5d]">
                  Booking reference
                </p>
                <p className="mt-2 text-3xl font-black tracking-[0.18em] text-[#171511] sm:text-4xl">
                  {formState.reference}
                </p>
                <div
                  aria-hidden="true"
                  className="mx-auto mt-3 h-7 w-44 opacity-75"
                  style={{
                    backgroundImage:
                      "repeating-linear-gradient(90deg,#2d2922 0 2px,transparent 2px 4px,#2d2922 4px 5px,transparent 5px 8px)",
                  }}
                />
                <p className="mt-2 font-sans text-xs font-medium text-[#5f574b]">
                  {reviewValues.customerName || "Customer"}
                </p>
              </div>
            </header>

            <section className="px-5 pb-5 sm:px-8">
              <div className="grid gap-4 text-[0.7rem] sm:grid-cols-2">
                <div>
                  <p className="font-bold uppercase tracking-[0.12em] text-[#7a7163]">
                    Handoff date
                  </p>
                  <p className="mt-1.5 font-bold text-[#2d2922]">
                    {formatReviewDate(reviewValues.preferredDate)}
                  </p>
                  <p className="mt-1 text-[#6f675b]">
                    {selectedTimeWindow?.shortName ?? "Time to be confirmed"}
                  </p>
                </div>
                <div className="sm:text-right">
                  <p className="font-bold uppercase tracking-[0.12em] text-[#7a7163]">
                    Handoff
                  </p>
                  <p className="mt-1.5 font-bold text-[#2d2922]">
                    {handoff === "pickup_return"
                      ? "Pickup + return"
                      : "Customer drop-off + return"}
                  </p>
                  <p className="mt-1 text-[#6f675b]">
                    {handoff === "pickup_return"
                      ? reviewValues.pickupArea || "Pinned pickup location"
                      : `${ORB_WEAVER_MEETUP.name} · ${ORB_WEAVER_MEETUP.label}`}
                  </p>
                </div>
              </div>
            </section>

            <section className="border-t-2 border-dashed border-[#a99f8d] px-5 py-5 sm:px-8">
              <div className="flex items-center justify-between text-[0.64rem] font-bold uppercase tracking-[0.14em] text-[#746b5d]">
                <span>Description</span>
                <span>Amount</span>
              </div>
              <div className="mt-4 space-y-3 text-xs">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-bold text-[#2d2922]">
                      {selectedServiceDetails?.name ?? "Helmet cleaning"}
                    </p>
                    <p className="mt-0.5 text-[0.66rem] text-[#746b5d]">
                      {helmetCount}{" "}
                      {helmetCount === 1 ? "helmet" : "helmets"}
                      {selectedServiceDetails &&
                        ` @ ${formatPeso(selectedServiceDetails.price)}`}
                    </p>
                  </div>
                  <p className="shrink-0 font-bold text-[#2d2922]">
                    {selectedServiceDetails
                      ? formatPeso(selectedServiceDetails.price * helmetCount)
                      : "—"}
                  </p>
                </div>

                {ORB_WEAVER_ADD_ONS.filter((addOn) =>
                  selectedAddOns.includes(addOn.id)
                ).map((addOn) => {
                  const quantity = addOn.perBooking ? 1 : helmetCount;

                  return (
                    <div
                      key={addOn.id}
                      className="flex items-start justify-between gap-4"
                    >
                      <span className="text-[#5f574b]">
                        {addOn.name}
                        {quantity > 1 && ` × ${quantity}`}
                      </span>
                      <span className="shrink-0 text-[#3d382f]">
                        {formatPeso(addOn.price * quantity)}
                      </span>
                    </div>
                  );
                })}

                <div className="flex items-center justify-between gap-4 border-t border-dotted border-[#aaa08e] pt-3">
                  <span className="text-[#746b5d]">Delivery</span>
                  <span className="font-bold text-[#5f574b]">
                    Pending distance check
                  </span>
                </div>
                <div className="flex items-end justify-between gap-4 border-t-2 border-[#4d463b] pt-4">
                  <div>
                    <p className="font-black uppercase tracking-[0.1em] text-[#2d2922]">
                      Current subtotal
                    </p>
                    <p className="mt-1 text-[0.62rem] text-[#746b5d]">
                      Final total updates on your ticket
                    </p>
                  </div>
                  <p className="shrink-0 text-2xl font-black text-[#171511]">
                    {formatPeso(estimatedSubtotal)}
                  </p>
                </div>
              </div>
            </section>

            <footer className="border-t-2 border-dashed border-[#a99f8d] px-5 py-5 text-center sm:px-8">
              <p className="font-sans text-xs font-semibold leading-5 text-[#514b41]">
                Keep this receipt. Use the reference and your mobile number to
                check, edit, or cancel while the order is pending.
              </p>
              <p className="mt-3 text-[0.58rem] uppercase tracking-[0.16em] text-[#857b6b]">
                Thank you for riding fresh
              </p>
            </footer>
          </article>
          <div
            aria-hidden="true"
            className="h-3 rotate-180"
            style={{
              backgroundImage:
                "linear-gradient(135deg, transparent 50%, #f4eddd 50%), linear-gradient(45deg, #f4eddd 50%, transparent 50%)",
              backgroundPosition: "0 0, 8px 0",
              backgroundSize: "16px 16px",
            }}
          />
        </div>

        <p className="mx-auto mt-5 max-w-md text-center text-sm leading-6 text-stone-400">
          {formState.message}
        </p>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:justify-center">
          <PendingNavigationLink
            href={`/vroombroom/orders?reference=${formState.reference}`}
            pendingLabel="Opening order…"
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-amber-400 px-5 py-2.5 text-sm font-semibold text-black transition hover:bg-amber-300"
          >
            <FaReceipt aria-hidden="true" />
            Check my order
          </PendingNavigationLink>
          <PendingNavigationLink
            href="/vroombroom"
            pendingLabel="Returning…"
            className="inline-flex min-h-11 items-center justify-center rounded-xl border border-white/10 px-5 py-2.5 text-sm font-semibold text-white transition hover:border-amber-300/40"
          >
            Back to VroomBroom
          </PendingNavigationLink>
          <button
            type="button"
            onClick={startOver}
            className="inline-flex min-h-11 items-center justify-center rounded-xl border border-amber-300/25 bg-amber-300/[0.07] px-5 py-2.5 text-sm font-semibold text-amber-200 transition hover:bg-amber-300/15"
          >
            Make another request
          </button>
        </div>
      </div>
    );
  }

  return (
    <form
      ref={formRef}
      onSubmit={handleSubmit}
      noValidate
      className="overflow-hidden rounded-[1.75rem] border border-amber-300/15 bg-[#10110f]/95 shadow-[0_24px_80px_rgba(0,0,0,0.4)]"
    >
      <div className="border-b border-white/[0.08] px-5 py-4 sm:px-6">
        <div className="mb-3 flex items-center justify-between gap-4">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-300">
            {steps[currentStep].label}
          </p>
          <p className="text-xs text-stone-500">
            {Math.round(((currentStep + 1) / steps.length) * 100)}% complete
          </p>
        </div>
        <ol aria-label="Booking progress" className="grid grid-cols-4 gap-2">
          {steps.map((step, index) => {
            const isComplete = index < currentStep;
            const isCurrent = index === currentStep;

            return (
              <li key={step.label}>
                <button
                  type="button"
                  onClick={() => {
                    if (index < currentStep) {
                      setCurrentStep(index);
                    }
                  }}
                  disabled={index > currentStep}
                  aria-current={isCurrent ? "step" : undefined}
                  className={`w-full text-left ${
                    index < currentStep ? "cursor-pointer" : "cursor-default"
                  }`}
                >
                  <span
                    className={`block h-1.5 rounded-full transition ${
                      isComplete || isCurrent
                        ? "bg-amber-400"
                        : "bg-white/10"
                    }`}
                  />
                  <span
                    className={`mt-1.5 hidden text-[0.65rem] sm:block ${
                      isCurrent
                        ? "font-semibold text-amber-200"
                        : isComplete
                        ? "text-stone-300"
                        : "text-stone-600"
                    }`}
                  >
                    {step.label}
                  </span>
                </button>
              </li>
            );
          })}
        </ol>
      </div>

      <div className="px-5 pb-2 pt-5 sm:px-6">
        <h2
          ref={stepHeadingRef}
          tabIndex={-1}
          className="text-xl font-semibold text-white outline-none sm:text-2xl"
        >
          {steps[currentStep].title}
        </h2>
        <p className="mt-1.5 text-sm leading-6 text-stone-400">
          {steps[currentStep].description}
        </p>
      </div>

      <div className="px-5 pb-6 pt-4 sm:px-6">
        <div data-form-step="0" hidden={currentStep !== 0}>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label htmlFor="orb-name" className={labelClasses}>
                Your name
              </label>
              <input
                id="orb-name"
                name="customerName"
                type="text"
                minLength={2}
                maxLength={100}
                autoComplete="name"
                required
                placeholder="Juan Dela Cruz"
                className={inputClasses}
              />
            </div>

            <div>
              <label htmlFor="orb-phone" className={labelClasses}>
                Mobile number
              </label>
              <input
                id="orb-phone"
                name="phone"
                type="tel"
                minLength={7}
                maxLength={40}
                autoComplete="tel"
                required
                placeholder="+63 9XX XXX XXXX"
                className={inputClasses}
              />
            </div>

            <div>
              <label htmlFor="orb-email" className={labelClasses}>
                Email <span className="text-stone-500">(optional)</span>
              </label>
              <input
                id="orb-email"
                name="email"
                type="email"
                maxLength={160}
                autoComplete="email"
                placeholder="you@example.com"
                className={inputClasses}
              />
            </div>
          </div>
        </div>

        <div data-form-step="1" hidden={currentStep !== 1}>
          <fieldset>
            <legend className={labelClasses}>Choose your clean</legend>
            <div className="grid items-start gap-2.5 sm:grid-cols-2">
              {ORB_WEAVER_SERVICES.map((service) => {
                const isSelected = selectedService === service.id;

                return (
                  <div
                    key={service.id}
                    className={`relative h-fit overflow-hidden rounded-xl border transition ${
                      isSelected
                        ? "border-amber-300 bg-amber-300/10 ring-2 ring-amber-300/15"
                        : !service.available
                        ? "border-white/[0.07] bg-white/[0.02] opacity-70"
                        : "border-white/10 bg-black/20 hover:border-amber-300/35"
                    }`}
                  >
                    <label
                      className={`block p-3 ${
                        service.available
                          ? "cursor-pointer"
                          : "cursor-not-allowed"
                      }`}
                    >
                      <input
                        type="radio"
                        name="service"
                        value={service.id}
                        checked={isSelected}
                        required
                        disabled={!service.available}
                        onChange={() => selectService(service.id)}
                        className="sr-only"
                      />
                      <span className="flex items-start justify-between gap-3">
                        <span>
                          <span className="flex flex-wrap items-center gap-1.5">
                            <span className="text-sm font-semibold text-white">
                              {service.name}
                            </span>
                            {service.popular && (
                              <span className="rounded-full bg-amber-400 px-1.5 py-0.5 text-[0.5rem] font-bold uppercase tracking-wide text-black">
                                Popular
                              </span>
                            )}
                            {!service.available && (
                              <span className="rounded-full border border-white/10 bg-white/[0.06] px-1.5 py-0.5 text-[0.5rem] font-bold uppercase tracking-wide text-stone-300">
                                Coming soon
                              </span>
                            )}
                          </span>
                          <span className="mt-0.5 block text-[0.7rem] leading-4 text-stone-500">
                            {service.shortDescription}
                          </span>
                        </span>
                        <span className="flex shrink-0 items-center gap-2 text-right text-sm font-semibold text-amber-200">
                          <span>₱{service.price}</span>
                          {isSelected && (
                            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-400 text-[0.55rem] text-black">
                              <FaCheck aria-hidden="true" />
                            </span>
                          )}
                        </span>
                      </span>
                    </label>

                    <details className="group border-t border-white/[0.08]">
                      <summary className="flex min-h-10 cursor-pointer list-none items-center justify-between gap-3 px-3 py-2 text-[0.68rem] font-semibold uppercase tracking-wide text-amber-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-amber-300 [&::-webkit-details-marker]:hidden">
                        What&apos;s included
                        <FaChevronDown
                          aria-hidden="true"
                          className="shrink-0 transition-transform duration-200 group-open:rotate-180"
                        />
                      </summary>
                      <ul className="space-y-2 border-t border-white/[0.06] px-3 py-3 text-xs leading-5 text-stone-400">
                        {service.inclusions.map((inclusion) => (
                          <li
                            key={inclusion}
                            className="flex items-start gap-2"
                          >
                            <span
                              aria-hidden="true"
                              className="mt-0.5 shrink-0 text-amber-300"
                            >
                              ✓
                            </span>
                            {inclusion}
                          </li>
                        ))}
                      </ul>
                    </details>
                  </div>
                );
              })}
            </div>
          </fieldset>

          {selectedService === "multiple_helmets" ? (
            <div className="mt-4">
              <label htmlFor="orb-count" className={labelClasses}>
                Number of helmets
              </label>
              <input
                id="orb-count"
                name="helmetCount"
                type="number"
                min={2}
                max={10}
                value={helmetCount}
                onChange={(event) =>
                  setHelmetCount(
                    Math.min(10, Math.max(2, Number(event.target.value) || 2))
                  )
                }
                required
                inputMode="numeric"
                className={inputClasses}
              />
            </div>
          ) : (
            <input type="hidden" name="helmetCount" value="1" />
          )}

          <fieldset className="mt-4">
            <legend className={labelClasses}>
              Add-ons <span className="text-stone-500">(optional)</span>
            </legend>
            <div className="grid gap-2 sm:grid-cols-2">
              {ORB_WEAVER_ADD_ONS.map((addOn) => {
                const isSelected = selectedAddOns.includes(addOn.id);
                const isIncluded = isAddOnIncluded(addOn, selectedService);

                return (
                  <label
                    key={addOn.id}
                    className={`flex items-center justify-between gap-3 rounded-xl border px-3 py-2.5 text-xs transition ${
                      isIncluded
                        ? "cursor-default border-emerald-300/20 bg-emerald-300/[0.06] text-stone-400"
                        : isSelected
                        ? "border-amber-300/50 bg-amber-300/10 text-white"
                        : "cursor-pointer border-white/10 bg-black/20 text-stone-300 hover:border-amber-300/30"
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        name="addOns"
                        value={addOn.id}
                        checked={isSelected}
                        disabled={isIncluded}
                        onChange={() => toggleAddOn(addOn.id)}
                        className="h-4 w-4 rounded border-white/20 bg-black accent-amber-400"
                      />
                      {addOn.name}
                    </span>
                    <span
                      className={`shrink-0 font-semibold ${
                        isIncluded ? "text-emerald-300" : "text-amber-200"
                      }`}
                    >
                      {isIncluded ? "Included" : `+₱${addOn.price}`}
                    </span>
                  </label>
                );
              })}
            </div>
          </fieldset>
        </div>

        <div data-form-step="2" hidden={currentStep !== 2}>
          <fieldset>
            <legend className={labelClasses}>Handoff method</legend>
            <div className="grid gap-2.5 sm:grid-cols-2">
              <label
                className={`cursor-pointer rounded-xl border p-3 transition ${
                  handoff === "drop_off"
                    ? "border-amber-300 bg-amber-300/10"
                    : "border-white/10 bg-black/20 hover:border-amber-300/35"
                }`}
              >
                <input
                  type="radio"
                  name="handoff"
                  value="drop_off"
                  checked={handoff === "drop_off"}
                  onChange={() => {
                    setHandoff("drop_off");
                    setPickupLocation(null);
                    setPickupLocationError("");
                  }}
                  className="sr-only"
                />
                <span className="flex items-start gap-2.5">
                  <FaStore
                    aria-hidden="true"
                    className="mt-0.5 shrink-0 text-amber-300"
                  />
                  <span>
                    <span className="block text-sm font-semibold text-white">
                      I&apos;ll drop it off
                    </span>
                    <span className="mt-0.5 block text-[0.7rem] leading-4 text-stone-500">
                      Belton Drive · in front of SM Hypermarket Novaliches
                    </span>
                  </span>
                </span>
              </label>

              <label
                className={`cursor-pointer rounded-xl border p-3 transition ${
                  handoff === "pickup_return"
                    ? "border-amber-300 bg-amber-300/10"
                    : "border-white/10 bg-black/20 hover:border-amber-300/35"
                }`}
              >
                <input
                  type="radio"
                  name="handoff"
                  value="pickup_return"
                  checked={handoff === "pickup_return"}
                  onChange={() => {
                    setHandoff("pickup_return");
                    setPickupLocationError("");
                  }}
                  className="sr-only"
                />
                <span className="flex items-start gap-2.5">
                  <FaMotorcycle
                    aria-hidden="true"
                    className="mt-0.5 shrink-0 text-amber-300"
                  />
                  <span>
                    <span className="block text-sm font-semibold text-white">
                      Pickup + return
                    </span>
                    <span className="mt-0.5 block text-[0.7rem] leading-4 text-stone-500">
                      From ₱30; free for 2+ helmets within 10 km
                    </span>
                  </span>
                </span>
              </label>
            </div>
          </fieldset>

          <div id="orb-booking-schedule" tabIndex={-1}>
            <BookingSchedulePicker
              error={scheduleError}
              handoffMethod={handoff}
              minimumDate={minimumDate}
              selectedDate={preferredDate}
              selectedWindow={preferredWindow}
              onDateChange={(value) => {
                setPreferredDate(value);
                setScheduleError("");
              }}
              onWindowChange={(value) => {
                setPreferredWindow(value);
                setScheduleError("");
              }}
            />
          </div>

          {handoff === "pickup_return" && currentStep >= 2 && (
            <div className="mt-4">
              <CustomerLocationPicker
                compact
                value={pickupLocation}
                error={pickupLocationError}
                onChange={(location) => {
                  setPickupLocation(location);
                  setPickupLocationError("");
                }}
              />

              <div className="mt-4">
                <label htmlFor="orb-pickup-area" className={labelClasses}>
                  Address or nearby landmark{" "}
                  <span className="text-stone-500">(optional)</span>
                </label>
                <input
                  id="orb-pickup-area"
                  name="pickupArea"
                  type="text"
                  maxLength={180}
                  autoComplete="street-address"
                  placeholder="House/building, street, barangay, or landmark"
                  className={inputClasses}
                />
              </div>
            </div>
          )}
        </div>

        <div data-form-step="3" hidden={currentStep !== 3}>
          <div className="space-y-3">
            <section className="rounded-xl border border-white/10 bg-black/20 p-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-stone-500">
                    Contact
                  </p>
                  <p className="mt-1.5 text-sm font-semibold text-white">
                    {reviewValues.customerName || "Not provided"}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setCurrentStep(0)}
                  className="inline-flex min-h-9 items-center gap-1.5 rounded-lg px-2 text-xs font-semibold text-amber-200 transition hover:bg-amber-300/10"
                >
                  <FaEdit aria-hidden="true" />
                  Edit
                </button>
              </div>
              <div className="mt-3 grid gap-2 text-xs text-stone-400 sm:grid-cols-2">
                <p className="flex items-center gap-2">
                  <FaPhoneAlt
                    aria-hidden="true"
                    className="shrink-0 text-amber-300"
                  />
                  {reviewValues.phone || "No mobile number"}
                </p>
                <p className="flex min-w-0 items-center gap-2">
                  <FaEnvelope
                    aria-hidden="true"
                    className="shrink-0 text-amber-300"
                  />
                  <span className="truncate">
                    {reviewValues.email || "No email provided"}
                  </span>
                </p>
              </div>
            </section>

            <section className="rounded-xl border border-white/10 bg-black/20 p-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-stone-500">
                    Cleaning
                  </p>
                  <p className="mt-1.5 text-sm font-semibold text-white">
                    {selectedServiceDetails?.name ?? "Not selected"}
                    {` · ${helmetCount} ${
                      helmetCount === 1 ? "helmet" : "helmets"
                    }`}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setCurrentStep(1)}
                  className="inline-flex min-h-9 items-center gap-1.5 rounded-lg px-2 text-xs font-semibold text-amber-200 transition hover:bg-amber-300/10"
                >
                  <FaEdit aria-hidden="true" />
                  Edit
                </button>
              </div>

              <div className="mt-3 space-y-2 border-t border-white/[0.07] pt-3 text-xs">
                <div className="flex items-start justify-between gap-4">
                  <span className="text-stone-400">
                    {selectedServiceDetails?.name ?? "Cleaning service"}
                    {selectedServiceDetails &&
                      ` · ${helmetCount} × ${formatPeso(
                        selectedServiceDetails.price
                      )}`}
                  </span>
                  <span className="shrink-0 text-stone-200">
                    {selectedServiceDetails
                      ? formatPeso(selectedServiceDetails.price * helmetCount)
                      : "—"}
                  </span>
                </div>
                {ORB_WEAVER_ADD_ONS.filter(
                  (addOn) =>
                    selectedAddOns.includes(addOn.id) &&
                    !isAddOnIncluded(addOn, selectedService)
                ).map((addOn) => {
                  const quantity = addOn.perBooking ? 1 : helmetCount;

                  return (
                    <div
                      key={addOn.id}
                      className="flex items-start justify-between gap-4"
                    >
                      <span className="text-stone-400">
                        {addOn.name}
                        {quantity > 1 &&
                          ` · ${quantity} × ${formatPeso(addOn.price)}`}
                      </span>
                      <span className="shrink-0 text-stone-200">
                        {formatPeso(addOn.price * quantity)}
                      </span>
                    </div>
                  );
                })}
                {selectedAddOns.length === 0 && (
                  <p className="text-stone-600">No paid add-ons selected.</p>
                )}
              </div>
            </section>

            <section className="rounded-xl border border-white/10 bg-black/20 p-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-stone-500">
                    Schedule + handoff
                  </p>
                  <p className="mt-1.5 text-sm font-semibold text-white">
                    {formatReviewDate(reviewValues.preferredDate)}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setCurrentStep(2)}
                  className="inline-flex min-h-9 items-center gap-1.5 rounded-lg px-2 text-xs font-semibold text-amber-200 transition hover:bg-amber-300/10"
                >
                  <FaEdit aria-hidden="true" />
                  Edit
                </button>
              </div>

              <dl className="mt-3 space-y-2 border-t border-white/[0.07] pt-3 text-xs">
                <div className="flex justify-between gap-4">
                  <dt className="text-stone-500">
                    {handoff === "pickup_return" ? "Pickup" : "Drop-off"}
                  </dt>
                  <dd className="text-right text-stone-300">
                    {selectedTimeWindow?.shortName ?? "No time selected"}
                  </dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-stone-500">
                    {handoff === "pickup_return" ? "Return" : "Claim"}
                  </dt>
                  <dd className="text-right text-stone-300">
                    {selectedTimeWindow?.completionTime ?? "Not available"}
                  </dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-stone-500">Method</dt>
                  <dd className="text-right text-stone-300">
                    {handoff === "pickup_return"
                      ? "Pickup + return"
                      : "Customer drop-off + return"}
                  </dd>
                </div>
              </dl>

              {handoff === "pickup_return" && (
                <div className="mt-3 flex items-start gap-2 border-t border-white/[0.07] pt-3 text-xs leading-5 text-stone-400">
                  <FaMapMarkerAlt
                    aria-hidden="true"
                    className="mt-0.5 shrink-0 text-amber-300"
                  />
                  <div>
                    <p>
                      {reviewValues.pickupArea ||
                        "Pinned pickup location saved with this request"}
                    </p>
                    {pickupLocation && (
                      <a
                        href={getOrbWeaverPickupMapUrl(pickupLocation)}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-1.5 inline-flex items-center gap-1.5 font-semibold text-amber-200 hover:text-amber-300"
                      >
                        <FaExternalLinkAlt aria-hidden="true" />
                        Check your pickup pin
                      </a>
                    )}
                  </div>
                </div>
              )}
              {handoff === "drop_off" && (
                <div className="mt-3 flex items-start gap-2 border-t border-white/[0.07] pt-3 text-xs leading-5 text-stone-400">
                  <FaMapMarkerAlt
                    aria-hidden="true"
                    className="mt-0.5 shrink-0 text-amber-300"
                  />
                  <p>
                    {ORB_WEAVER_MEETUP.name} · {ORB_WEAVER_MEETUP.label}
                  </p>
                </div>
              )}
            </section>
          </div>

          <div className="mt-4">
            <label htmlFor="orb-notes" className={labelClasses}>
              Notes <span className="text-stone-500">(optional)</span>
            </label>
            <textarea
              id="orb-notes"
              name="notes"
              rows={3}
              maxLength={700}
              placeholder="Helmet model, condition, or anything we should know."
              className={`${inputClasses} resize-y`}
            />
          </div>

          <div className="mt-4 rounded-xl border border-amber-300/20 bg-amber-300/[0.07] p-4">
            <div className="flex items-center gap-2 text-amber-300">
              <FaReceipt aria-hidden="true" />
              <p className="text-xs font-semibold uppercase tracking-[0.17em]">
                Price review
              </p>
            </div>
            <div className="mt-3 space-y-2 text-xs">
              <div className="flex items-center justify-between gap-4 text-stone-400">
                <span>Cleaning + add-ons</span>
                <span className="font-medium text-stone-200">
                  {selectedServiceDetails
                    ? formatPeso(estimatedSubtotal)
                    : "Not available"}
                </span>
              </div>
              <div className="flex items-start justify-between gap-4 text-stone-400">
                <div>
                  <span>Delivery</span>
                  <p className="mt-0.5 max-w-md text-[0.68rem] leading-4 text-stone-600">
                    VroomBroom measures the one-way Google Maps route after
                    submission: ₱30 up to 5 km or ₱50 over 5–10 km for one
                    helmet pickup + return; free for customer drop-off or 2+
                    helmets within 10 km.
                  </p>
                </div>
                <span className="shrink-0 font-medium text-stone-300">
                  Pending
                </span>
              </div>
            </div>
            <div className="mt-3 flex items-end justify-between gap-4 border-t border-amber-300/20 pt-3">
              <div>
                <p className="text-xs font-semibold text-amber-200">
                  Current subtotal
                </p>
                <p className="mt-0.5 text-[0.68rem] text-stone-500">
                  Your ticket updates when distance is confirmed.
                </p>
              </div>
              <p className="shrink-0 text-2xl font-semibold text-white">
                {selectedServiceDetails
                  ? formatPeso(estimatedSubtotal)
                  : "Not available"}
              </p>
            </div>
          </div>

          <label className="mt-4 flex cursor-pointer items-start gap-3 text-xs leading-5 text-stone-400">
            <input
              type="checkbox"
              name="contactConsent"
              required
              className="mt-0.5 h-4 w-4 shrink-0 rounded border-white/20 bg-black accent-amber-400"
            />
            <span>
              I confirm these details are correct and agree to be contacted
              about this request. No payment is collected here. A pickup pin
              and shared Google Maps route are used only to coordinate and
              price this booking.
            </span>
          </label>
        </div>

        {pickupLocation && (
          <>
            <input
              type="hidden"
              name="pickupLatitude"
              value={pickupLocation.latitude}
            />
            <input
              type="hidden"
              name="pickupLongitude"
              value={pickupLocation.longitude}
            />
          </>
        )}

        {formState.status === "error" && (
          <div
            ref={feedbackRef}
            tabIndex={-1}
            role="alert"
            className="mt-4 rounded-xl border border-red-400/25 bg-red-400/10 p-3.5 text-sm text-red-100 outline-none"
          >
            {formState.message}
          </div>
        )}
      </div>

      <div className="flex items-center justify-between gap-3 border-t border-white/[0.08] bg-black/15 px-5 py-4 sm:px-6">
        {currentStep === 0 ? (
          <PendingNavigationLink
            href="/vroombroom"
            pendingLabel="Returning…"
            className="inline-flex min-h-11 items-center gap-2 rounded-xl px-2 text-sm font-semibold text-stone-400 transition hover:text-white"
          >
            <FaArrowLeft aria-hidden="true" className="text-xs" />
            Exit
          </PendingNavigationLink>
        ) : (
          <button
            type="button"
            onClick={goToPreviousStep}
            className="inline-flex min-h-11 items-center gap-2 rounded-xl px-2 text-sm font-semibold text-stone-300 transition hover:text-white"
          >
            <FaArrowLeft aria-hidden="true" className="text-xs" />
            Back
          </button>
        )}

        {currentStep < steps.length - 1 ? (
          <button
            type="button"
            onClick={goToNextStep}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-amber-400 px-5 py-2.5 text-sm font-semibold text-black transition hover:bg-amber-300"
          >
            Continue
            <FaArrowRight aria-hidden="true" className="text-xs" />
          </button>
        ) : (
          <button
            type="submit"
            disabled={formState.status === "submitting"}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-amber-400 px-5 py-2.5 text-sm font-semibold text-black transition hover:bg-amber-300 disabled:cursor-wait disabled:opacity-60"
          >
            {formState.status === "submitting"
              ? "Sending…"
              : "Request appointment"}
          </button>
        )}
      </div>
    </form>
  );
}

"use client";

import {
  type FormEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  ORB_WEAVER_ADD_ONS,
  ORB_WEAVER_SERVICES,
  ORB_WEAVER_TIME_WINDOWS,
  type OrbWeaverServiceId,
  type OrbWeaverTimeWindow,
} from "@/types/orb-weaver";
import {
  calculateAddOnSubtotal,
  calculateDeliveryPricing,
} from "@/lib/orb-weaver/delivery-pricing";
import type { OrbWeaverGeoPoint } from "@/lib/orb-weaver/location";
import {
  BOOKING_STEPS,
  type FormState,
  isAddOnIncluded,
  type ReviewValues,
} from "./types";

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

export interface UseBookingFormOptions {
  initialServiceId?: OrbWeaverServiceId;
}

export function useBookingForm({ initialServiceId }: UseBookingFormOptions = {}) {
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

  const selectedServiceDetails = useMemo(
    () => ORB_WEAVER_SERVICES.find((service) => service.id === selectedService),
    [selectedService]
  );

  const selectedTimeWindow = useMemo(
    () =>
      ORB_WEAVER_TIME_WINDOWS.find(
        (window) => window.id === reviewValues.preferredWindow
      ),
    [reviewValues.preferredWindow]
  );

  const addOnSubtotal = useMemo(
    () =>
      calculateAddOnSubtotal(
        selectedAddOns,
        helmetCount,
        selectedService || undefined
      ),
    [selectedAddOns, helmetCount, selectedService]
  );

  const estimatedSubtotal = useMemo(
    () =>
      selectedServiceDetails
        ? selectedServiceDetails.price * helmetCount + addOnSubtotal
        : 0,
    [selectedServiceDetails, helmetCount, addOnSubtotal]
  );

  const calculatePricingQuote = useCallback(
    (distanceKm: number) => {
      return calculateDeliveryPricing({
        distanceKm,
        handoffMethod: handoff,
        helmetCount,
        addOnIds: selectedAddOns,
        serviceId: selectedService || undefined,
      });
    },
    [handoff, helmetCount, selectedAddOns, selectedService]
  );

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

  const selectService = useCallback((serviceId: OrbWeaverServiceId) => {
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
  }, []);

  const toggleAddOn = useCallback((addOnId: string) => {
    setSelectedAddOns((current) =>
      current.includes(addOnId)
        ? current.filter((id) => id !== addOnId)
        : [...current, addOnId]
    );
  }, []);

  const validateStep = useCallback(
    (stepIndex: number) => {
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
    },
    [handoff, pickupLocation, preferredDate, preferredWindow]
  );

  const captureReviewValues = useCallback(() => {
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
  }, []);

  const goToNextStep = useCallback(() => {
    if (!validateStep(currentStep)) {
      return;
    }

    if (currentStep === BOOKING_STEPS.length - 2) {
      captureReviewValues();
    }

    setCurrentStep((step) => Math.min(step + 1, BOOKING_STEPS.length - 1));
  }, [captureReviewValues, currentStep, validateStep]);

  const goToPreviousStep = useCallback(() => {
    setFormState({ status: "idle" });
    setCurrentStep((step) => Math.max(step - 1, 0));
  }, []);

  const startOver = useCallback(() => {
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
  }, [initialServiceId]);

  const handleSubmit = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();

      if (currentStep < BOOKING_STEPS.length - 1) {
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
    },
    [currentStep, goToNextStep, handoff, pickupLocation, validateStep]
  );

  const handleHandoffChange = useCallback(
    (nextHandoff: "drop_off" | "pickup_return") => {
      setHandoff(nextHandoff);
      if (nextHandoff === "drop_off") {
        setPickupLocation(null);
      }
      setPickupLocationError("");
    },
    []
  );

  const handleDateChange = useCallback((date: string) => {
    setPreferredDate(date);
    setScheduleError("");
  }, []);

  const handleWindowChange = useCallback((win: OrbWeaverTimeWindow | "") => {
    setPreferredWindow(win);
    setScheduleError("");
  }, []);

  const handlePickupLocationChange = useCallback(
    (loc: OrbWeaverGeoPoint | null) => {
      setPickupLocation(loc);
      setPickupLocationError("");
    },
    []
  );

  return {
    steps: BOOKING_STEPS,
    currentStep,
    setCurrentStep,
    formState,
    setFormState,
    selectedService,
    setSelectedService,
    helmetCount,
    setHelmetCount,
    selectedAddOns,
    setSelectedAddOns,
    handoff,
    setHandoff,
    pickupLocation,
    setPickupLocation,
    pickupLocationError,
    setPickupLocationError,
    preferredDate,
    setPreferredDate,
    preferredWindow,
    setPreferredWindow,
    scheduleError,
    setScheduleError,
    reviewValues,
    minimumDate,
    selectedServiceDetails,
    selectedTimeWindow,
    addOnSubtotal,
    estimatedSubtotal,
    calculatePricingQuote,
    selectService,
    toggleAddOn,
    isAddOnIncluded,
    handleHandoffChange,
    handleDateChange,
    handleWindowChange,
    handlePickupLocationChange,
    validateStep,
    captureReviewValues,
    goToNextStep,
    goToPreviousStep,
    startOver,
    handleSubmit,
    formRef,
    stepHeadingRef,
    feedbackRef,
  };
}

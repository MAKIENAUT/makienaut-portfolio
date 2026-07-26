"use client";

import {
  type FormEvent,
  useMemo,
  useRef,
  useState,
} from "react";
import { FaCalendarCheck, FaCheckCircle } from "react-icons/fa";
import {
  ORB_WEAVER_SERVICES,
  ORB_WEAVER_TIME_WINDOWS,
} from "@/types/orb-weaver";

type FormState =
  | { status: "idle"; message?: undefined; reference?: undefined }
  | { status: "submitting"; message?: undefined; reference?: undefined }
  | { status: "success"; message: string; reference?: string }
  | { status: "error"; message: string; reference?: undefined };

const inputClasses =
  "min-h-12 w-full rounded-xl border border-white/10 bg-black/35 px-4 py-3 text-white outline-none transition placeholder:text-stone-500 focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20";
const labelClasses = "mb-2 block text-sm font-medium text-stone-200";

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

export function AppointmentForm() {
  const [formState, setFormState] = useState<FormState>({ status: "idle" });
  const feedbackRef = useRef<HTMLDivElement>(null);
  const minimumDate = useMemo(getManilaToday, []);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);

    setFormState({ status: "submitting" });

    try {
      const response = await fetch("/api/orb-weaver/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(Object.fromEntries(formData.entries())),
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

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-[2rem] border border-amber-300/15 bg-[#10110f]/95 p-5 shadow-[0_24px_80px_rgba(0,0,0,0.4)] sm:p-8"
    >
      <div className="mb-8 flex items-start gap-4">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-amber-400 text-xl text-black">
          <FaCalendarCheck aria-hidden="true" />
        </span>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-amber-300">
            Appointment request
          </p>
          <h3 className="mt-1 text-2xl font-semibold text-white">
            Pick what works for you
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-stone-400">
            Send your preferred schedule. It becomes final after VroomBroom
            contacts you to confirm.
          </p>
        </div>
      </div>

      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-[-10000px] top-auto h-px w-px overflow-hidden"
      >
        <label htmlFor="orb-website">Website</label>
        <input
          id="orb-website"
          name="website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
        />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
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

        <div className="sm:col-span-2">
          <label htmlFor="orb-service" className={labelClasses}>
            Cleaning service
          </label>
          <select
            id="orb-service"
            name="service"
            required
            defaultValue=""
            className={inputClasses}
          >
            <option value="" disabled>
              Choose a service
            </option>
            {ORB_WEAVER_SERVICES.map((service) => (
              <option key={service.id} value={service.id}>
                {service.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="orb-count" className={labelClasses}>
            Number of helmets
          </label>
          <input
            id="orb-count"
            name="helmetCount"
            type="number"
            min={1}
            max={10}
            defaultValue={1}
            required
            inputMode="numeric"
            className={inputClasses}
          />
        </div>

        <div>
          <label htmlFor="orb-date" className={labelClasses}>
            Preferred date
          </label>
          <input
            id="orb-date"
            name="preferredDate"
            type="date"
            min={minimumDate}
            required
            className={`${inputClasses} [color-scheme:dark]`}
          />
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="orb-window" className={labelClasses}>
            Preferred time
          </label>
          <select
            id="orb-window"
            name="preferredWindow"
            required
            defaultValue=""
            className={inputClasses}
          >
            <option value="" disabled>
              Choose a time window
            </option>
            {ORB_WEAVER_TIME_WINDOWS.map((window) => (
              <option key={window.id} value={window.id}>
                {window.name}
              </option>
            ))}
          </select>
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="orb-notes" className={labelClasses}>
            Notes <span className="text-stone-500">(optional)</span>
          </label>
          <textarea
            id="orb-notes"
            name="notes"
            rows={4}
            maxLength={1000}
            placeholder="Helmet model, condition, or anything we should know."
            className={`${inputClasses} resize-y`}
          />
        </div>
      </div>

      <label className="mt-5 flex cursor-pointer items-start gap-3 text-sm leading-relaxed text-stone-400">
        <input
          type="checkbox"
          required
          className="mt-1 h-4 w-4 rounded border-white/20 bg-black text-amber-400 accent-amber-400"
        />
        <span>
          I agree to be contacted about this appointment request. No payment is
          collected through this form.
        </span>
      </label>

      <button
        type="submit"
        disabled={formState.status === "submitting"}
        className="mt-7 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-amber-400 px-6 py-3 font-semibold text-black transition hover:bg-amber-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300 focus-visible:ring-offset-4 focus-visible:ring-offset-[#10110f] disabled:cursor-wait disabled:opacity-60"
      >
        {formState.status === "submitting"
          ? "Sending request…"
          : "Request appointment"}
      </button>

      {formState.status !== "idle" &&
        formState.status !== "submitting" && (
          <div
            ref={feedbackRef}
            tabIndex={-1}
            role={formState.status === "error" ? "alert" : "status"}
            className={`mt-5 rounded-xl border p-4 text-sm outline-none ${
              formState.status === "success"
                ? "border-emerald-400/25 bg-emerald-400/10 text-emerald-100"
                : "border-red-400/25 bg-red-400/10 text-red-100"
            }`}
          >
            <div className="flex items-start gap-3">
              {formState.status === "success" && (
                <FaCheckCircle
                  className="mt-0.5 shrink-0 text-emerald-300"
                  aria-hidden="true"
                />
              )}
              <p>
                {formState.message}
                {formState.reference && (
                  <span className="mt-1 block font-semibold">
                    Reference: {formState.reference}
                  </span>
                )}
              </p>
            </div>
          </div>
        )}
    </form>
  );
}

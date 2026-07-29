"use client";

import { type FormEvent, useMemo, useState } from "react";
import {
  FaCrosshairs,
  FaEdit,
  FaMapMarkerAlt,
  FaSave,
  FaTimes,
} from "react-icons/fa";
import {
  ORB_WEAVER_ADD_ONS,
  ORB_WEAVER_SERVICES,
  ORB_WEAVER_TIME_WINDOWS,
  type OrbWeaverAppointmentRecord,
  type OrbWeaverEditableAppointmentDetails,
  type OrbWeaverOrderTicket,
  type OrbWeaverServiceId,
  type OrbWeaverTimeWindow,
} from "@/types/orb-weaver";

interface OrderDetailsEditorProps {
  appointment: OrbWeaverAppointmentRecord | OrbWeaverOrderTicket;
  mode: "backoffice" | "customer";
  onSave: (details: OrbWeaverEditableAppointmentDetails) => Promise<void>;
}

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

const getAvailability = (date: string) => {
  const parsed = new Date(`${date}T00:00:00.000Z`);
  const day = parsed.getUTCDay();
  return day === 0 || day === 6 ? "weekend" : "weekday";
};

export function OrderDetailsEditor({
  appointment,
  mode,
  onSave,
}: OrderDetailsEditorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [error, setError] = useState("");
  const [customerName, setCustomerName] = useState(appointment.customerName);
  const [email, setEmail] = useState(appointment.email);
  const [phone, setPhone] = useState(appointment.phone);
  const [service, setService] = useState<OrbWeaverServiceId>(
    appointment.service
  );
  const [helmetCount, setHelmetCount] = useState(appointment.helmetCount);
  const [addOnIds, setAddOnIds] = useState(
    appointment.requestedAddOns.map((addOn) => addOn.id)
  );
  const [preferredDate, setPreferredDate] = useState(
    appointment.preferredDate
  );
  const [preferredWindow, setPreferredWindow] =
    useState<OrbWeaverTimeWindow>(appointment.preferredWindow);
  const [handoffMethod, setHandoffMethod] = useState<
    "drop_off" | "pickup_return"
  >(appointment.handoffMethod ?? "drop_off");
  const [pickupArea, setPickupArea] = useState(appointment.pickupArea ?? "");
  const [pickupLatitude, setPickupLatitude] = useState(
    appointment.pickupLatitude?.toString() ?? ""
  );
  const [pickupLongitude, setPickupLongitude] = useState(
    appointment.pickupLongitude?.toString() ?? ""
  );
  const [notes, setNotes] = useState(appointment.notes ?? "");
  const isCustomerTicket = mode === "customer";
  const inputClasses = isCustomerTicket
    ? "min-h-10 w-full rounded-none border border-[#a99f8d] bg-[#fffaf0]/55 px-3 py-2 text-sm text-[#2d2922] outline-none placeholder:text-[#9a9080] focus:border-[#8a4f1f] focus:ring-2 focus:ring-[#b96f2e]/15"
    : "min-h-10 w-full rounded-lg border border-white/10 bg-black/35 px-3 py-2 text-sm text-white outline-none placeholder:text-stone-600 focus:border-amber-300 focus:ring-2 focus:ring-amber-300/20";
  const labelClasses = isCustomerTicket
    ? "mb-1.5 block font-sans text-xs font-semibold text-[#6b6255]"
    : "mb-1.5 block text-xs font-medium text-stone-400";
  const sectionClasses = isCustomerTicket
    ? "mt-5 border-t-2 border-dashed border-[#b8ad9a] pt-4"
    : "mt-5 border-t border-white/[0.07] pt-4";
  const legendClasses = isCustomerTicket
    ? "font-sans text-xs font-black uppercase tracking-[0.13em] text-[#3f392f]"
    : "text-xs font-semibold uppercase tracking-[0.13em] text-stone-300";
  const selectedService = ORB_WEAVER_SERVICES.find(
    (option) => option.id === service
  );
  const availableWindows = useMemo(
    () =>
      preferredDate
        ? ORB_WEAVER_TIME_WINDOWS.filter(
            (window) => window.availability === getAvailability(preferredDate)
          )
        : [],
    [preferredDate]
  );
  const previewSubtotal =
    (selectedService?.price ?? 0) * helmetCount +
    ORB_WEAVER_ADD_ONS.reduce((total, addOn) => {
      if (!addOnIds.includes(addOn.id)) {
        return total;
      }

      return total + addOn.price * (addOn.perBooking ? 1 : helmetCount);
    }, 0);

  const changeDate = (date: string) => {
    setPreferredDate(date);
    const windows = ORB_WEAVER_TIME_WINDOWS.filter(
      (window) => window.availability === getAvailability(date)
    );

    if (!windows.some((window) => window.id === preferredWindow)) {
      setPreferredWindow(windows[0]?.id ?? "weekday_evening");
    }
  };

  const useCurrentLocation = () => {
    if (!navigator.geolocation) {
      setError("Location access is unavailable in this browser.");
      return;
    }

    setIsLocating(true);
    setError("");
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        setPickupLatitude(coords.latitude.toFixed(6));
        setPickupLongitude(coords.longitude.toFixed(6));
        setIsLocating(false);
      },
      () => {
        setError(
          "Location could not be read. Allow access or enter the coordinates manually."
        );
        setIsLocating(false);
      },
      { enableHighAccuracy: true, timeout: 12_000, maximumAge: 30_000 }
    );
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSaving(true);
    setError("");

    try {
      await onSave({
        customerName,
        email,
        phone,
        service,
        helmetCount,
        preferredDate,
        preferredWindow,
        handoffMethod,
        pickupArea,
        pickupLatitude:
          handoffMethod === "pickup_return" ? Number(pickupLatitude) : null,
        pickupLongitude:
          handoffMethod === "pickup_return" ? Number(pickupLongitude) : null,
        addOnIds,
        notes,
      });
      setIsOpen(false);
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : "Order details could not be saved."
      );
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) {
    return (
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className={`inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border px-4 py-2 text-xs font-semibold transition ${
          mode === "customer"
            ? "rounded-none border-2 border-[#5e574c] bg-transparent font-sans font-bold text-[#3f392f] hover:bg-[#3f392f] hover:text-[#f4eddd]"
            : "w-full border-white/10 bg-white/[0.04] text-stone-300 hover:border-amber-300/30 hover:text-amber-200"
        }`}
      >
        <FaEdit aria-hidden="true" />
        Edit order details
      </button>
    );
  }

  return (
    <form
      onSubmit={submit}
      className={
        isCustomerTicket
          ? "mt-5 border-2 border-dashed border-[#a99f8d] bg-[#eee4d1]/70 p-4 font-mono text-[#2d2922] sm:p-5"
          : "mt-3 rounded-2xl border border-amber-300/20 bg-[#11120f] p-4"
      }
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p
            className={
              isCustomerTicket
                ? "font-sans text-xs font-black uppercase tracking-[0.15em] text-[#8a4f1f]"
                : "text-xs font-semibold uppercase tracking-[0.15em] text-amber-300"
            }
          >
            Edit order
          </p>
          <p
            className={`mt-1 text-xs leading-5 ${
              isCustomerTicket ? "font-sans text-[#746b5d]" : "text-stone-500"
            }`}
          >
            {mode === "customer"
              ? "Changes are available only while this order is pending."
              : "Saved changes immediately update the customer ticket."}
          </p>
        </div>
        <button
          type="button"
          aria-label="Close order editor"
          onClick={() => {
            setIsOpen(false);
            setError("");
          }}
          className={`flex h-9 w-9 shrink-0 items-center justify-center transition ${
            isCustomerTicket
              ? "text-[#746b5d] hover:bg-[#3f392f] hover:text-[#f4eddd]"
              : "rounded-lg text-stone-500 hover:bg-white/[0.06] hover:text-white"
          }`}
        >
          <FaTimes aria-hidden="true" />
        </button>
      </div>

      <fieldset className="mt-4">
        <legend className={legendClasses}>Customer</legend>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={labelClasses} htmlFor={`edit-name-${appointment.reference}`}>
              Name
            </label>
            <input
              id={`edit-name-${appointment.reference}`}
              value={customerName}
              onChange={(event) => setCustomerName(event.target.value)}
              required
              minLength={2}
              maxLength={100}
              className={inputClasses}
            />
          </div>
          <div>
            <label className={labelClasses} htmlFor={`edit-phone-${appointment.reference}`}>
              Mobile number
            </label>
            <input
              id={`edit-phone-${appointment.reference}`}
              type="tel"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              required
              minLength={7}
              maxLength={40}
              className={inputClasses}
            />
          </div>
          <div>
            <label className={labelClasses} htmlFor={`edit-email-${appointment.reference}`}>
              Email
            </label>
            <input
              id={`edit-email-${appointment.reference}`}
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              maxLength={160}
              className={inputClasses}
            />
          </div>
        </div>
      </fieldset>

      <fieldset className={sectionClasses}>
        <legend className={legendClasses}>Cleaning</legend>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <div>
            <label className={labelClasses} htmlFor={`edit-service-${appointment.reference}`}>
              Service
            </label>
            <select
              id={`edit-service-${appointment.reference}`}
              value={service}
              onChange={(event) => {
                const value = event.target.value as OrbWeaverServiceId;
                setService(value);
                setHelmetCount(value === "multiple_helmets" ? 2 : 1);
              }}
              className={inputClasses}
            >
              {ORB_WEAVER_SERVICES.filter((option) => option.available).map(
                (option) => (
                  <option key={option.id} value={option.id}>
                    {option.name} · ₱{option.price}
                  </option>
                )
              )}
            </select>
          </div>
          <div>
            <label className={labelClasses} htmlFor={`edit-count-${appointment.reference}`}>
              Helmet count
            </label>
            <input
              id={`edit-count-${appointment.reference}`}
              type="number"
              value={helmetCount}
              onChange={(event) => setHelmetCount(Number(event.target.value))}
              min={service === "multiple_helmets" ? 2 : 1}
              max={service === "multiple_helmets" ? 10 : 1}
              required
              className={inputClasses}
            />
          </div>
        </div>

        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {ORB_WEAVER_ADD_ONS.map((addOn) => (
            <label
              key={addOn.id}
              className={`flex cursor-pointer items-center justify-between gap-3 rounded-lg border px-3 py-2 text-xs ${
                isCustomerTicket
                  ? addOnIds.includes(addOn.id)
                    ? "rounded-none border-[#8a4f1f] bg-[#b96f2e]/10 text-[#3f392f]"
                    : "rounded-none border-[#b8ad9a] bg-[#fffaf0]/30 text-[#746b5d]"
                  : addOnIds.includes(addOn.id)
                    ? "border-amber-300/30 bg-amber-300/[0.08] text-stone-200"
                    : "border-white/[0.08] bg-black/20 text-stone-400"
              }`}
            >
              <span className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={addOnIds.includes(addOn.id)}
                  onChange={() =>
                    setAddOnIds((current) =>
                      current.includes(addOn.id)
                        ? current.filter((id) => id !== addOn.id)
                        : [...current, addOn.id]
                    )
                  }
                  className="accent-amber-400"
                />
                {addOn.name}
              </span>
              <span
                className={`shrink-0 ${
                  isCustomerTicket ? "font-bold text-[#8a4f1f]" : "text-amber-200"
                }`}
              >
                +₱{addOn.price}
              </span>
            </label>
          ))}
        </div>
        <p
          className={`mt-3 text-right text-xs font-semibold ${
            isCustomerTicket ? "font-sans text-[#8a4f1f]" : "text-amber-200"
          }`}
        >
          New cleaning subtotal: ₱{previewSubtotal}
        </p>
      </fieldset>

      <fieldset className={sectionClasses}>
        <legend className={legendClasses}>Schedule + handoff</legend>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <div>
            <label className={labelClasses} htmlFor={`edit-date-${appointment.reference}`}>
              Preferred date
            </label>
            <input
              id={`edit-date-${appointment.reference}`}
              type="date"
              value={preferredDate}
              min={mode === "customer" ? getManilaToday() : undefined}
              onChange={(event) => changeDate(event.target.value)}
              required
              className={inputClasses}
            />
          </div>
          <div>
            <label className={labelClasses} htmlFor={`edit-window-${appointment.reference}`}>
              Handoff window
            </label>
            <select
              id={`edit-window-${appointment.reference}`}
              value={preferredWindow}
              onChange={(event) =>
                setPreferredWindow(event.target.value as OrbWeaverTimeWindow)
              }
              className={inputClasses}
            >
              {availableWindows.map((window) => (
                <option key={window.id} value={window.id}>
                  {window.shortName} · return {window.completionTime}
                </option>
              ))}
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className={labelClasses} htmlFor={`edit-handoff-${appointment.reference}`}>
              Handoff method
            </label>
            <select
              id={`edit-handoff-${appointment.reference}`}
              value={handoffMethod}
              onChange={(event) =>
                setHandoffMethod(
                  event.target.value as "drop_off" | "pickup_return"
                )
              }
              className={inputClasses}
            >
              <option value="drop_off">Customer drop-off + return</option>
              <option value="pickup_return">Pickup + return</option>
            </select>
          </div>
        </div>

        {handoffMethod === "pickup_return" && (
          <div
            className={`mt-3 border p-3 ${
              isCustomerTicket
                ? "border-[#b8ad9a] bg-[#fffaf0]/30"
                : "rounded-xl border-white/[0.08] bg-black/20"
            }`}
          >
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <p
                className={`flex items-center gap-2 text-xs font-medium ${
                  isCustomerTicket
                    ? "font-sans font-bold text-[#3f392f]"
                    : "text-stone-300"
                }`}
              >
                <FaMapMarkerAlt
                  aria-hidden="true"
                  className={
                    isCustomerTicket ? "text-[#8a4f1f]" : "text-amber-300"
                  }
                />
                Pickup location
              </p>
              <button
                type="button"
                disabled={isLocating}
                onClick={useCurrentLocation}
                className={`inline-flex min-h-9 items-center justify-center gap-2 px-3 py-1.5 text-xs font-semibold disabled:cursor-wait disabled:opacity-60 ${
                  isCustomerTicket
                    ? "border-2 border-[#5e574c] bg-transparent font-sans text-[#3f392f] hover:bg-[#3f392f] hover:text-[#f4eddd]"
                    : "rounded-lg bg-amber-400 text-black"
                }`}
              >
                <FaCrosshairs aria-hidden="true" />
                {isLocating ? "Locating…" : "Use current location"}
              </button>
            </div>
            <div className="mt-3">
              <label className={labelClasses} htmlFor={`edit-area-${appointment.reference}`}>
                Address or landmark
              </label>
              <input
                id={`edit-area-${appointment.reference}`}
                value={pickupArea}
                onChange={(event) => setPickupArea(event.target.value)}
                maxLength={180}
                className={inputClasses}
              />
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <div>
                <label className={labelClasses} htmlFor={`edit-lat-${appointment.reference}`}>
                  Latitude
                </label>
                <input
                  id={`edit-lat-${appointment.reference}`}
                  type="number"
                  value={pickupLatitude}
                  onChange={(event) => setPickupLatitude(event.target.value)}
                  min="-90"
                  max="90"
                  step="0.000001"
                  required
                  className={inputClasses}
                />
              </div>
              <div>
                <label className={labelClasses} htmlFor={`edit-lng-${appointment.reference}`}>
                  Longitude
                </label>
                <input
                  id={`edit-lng-${appointment.reference}`}
                  type="number"
                  value={pickupLongitude}
                  onChange={(event) => setPickupLongitude(event.target.value)}
                  min="-180"
                  max="180"
                  step="0.000001"
                  required
                  className={inputClasses}
                />
              </div>
            </div>
          </div>
        )}
      </fieldset>

      <div className={sectionClasses}>
        <label className={labelClasses} htmlFor={`edit-notes-${appointment.reference}`}>
          Notes
        </label>
        <textarea
          id={`edit-notes-${appointment.reference}`}
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
          rows={3}
          maxLength={700}
          className={`${inputClasses} resize-y`}
        />
      </div>

      {error && (
        <p
          role="alert"
          className={`mt-3 border p-3 text-xs leading-5 ${
            isCustomerTicket
              ? "border-[#9b3b31]/40 bg-[#9b3b31]/[0.06] font-sans text-[#7d3028]"
              : "rounded-lg border-red-300/20 bg-red-300/[0.08] text-red-100"
          }`}
        >
          {error}
        </p>
      )}

      <div className="mt-4 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={() => setIsOpen(false)}
          className={`inline-flex min-h-10 items-center justify-center border px-4 py-2 text-xs font-semibold ${
            isCustomerTicket
              ? "border-[#a99f8d] font-sans text-[#5f574b] hover:border-[#5e574c]"
              : "rounded-lg border-white/10 text-stone-300"
          }`}
        >
          Keep current details
        </button>
        <button
          type="submit"
          disabled={isSaving}
          className={`inline-flex min-h-10 items-center justify-center gap-2 px-4 py-2 text-xs font-semibold transition disabled:cursor-wait disabled:opacity-60 ${
            isCustomerTicket
              ? "border-2 border-[#3f392f] bg-[#3f392f] font-sans text-[#f4eddd] hover:bg-[#201d18]"
              : "rounded-lg bg-amber-400 text-black hover:bg-amber-300"
          }`}
        >
          <FaSave aria-hidden="true" />
          {isSaving ? "Saving changes…" : "Save order changes"}
        </button>
      </div>
    </form>
  );
}

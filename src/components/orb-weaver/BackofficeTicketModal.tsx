"use client";

import { type FormEvent, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  FaCalendarAlt,
  FaEdit,
  FaEnvelope,
  FaExternalLinkAlt,
  FaMapMarkerAlt,
  FaPhoneAlt,
  FaReceipt,
  FaSave,
  FaTimes,
} from "react-icons/fa";
import { DeliveryPricingEditor } from "@/components/orb-weaver/DeliveryPricingEditor";
import {
  getOrbWeaverPickupDirectionsUrl,
  getOrbWeaverPickupMapUrl,
  ORB_WEAVER_MEETUP,
} from "@/lib/orb-weaver/location";
import {
  ORB_WEAVER_ADD_ONS,
  ORB_WEAVER_LEGACY_SERVICE_NAMES,
  ORB_WEAVER_LEGACY_TIME_WINDOW_NAMES,
  ORB_WEAVER_SERVICES,
  ORB_WEAVER_STATUSES,
  ORB_WEAVER_TIME_WINDOWS,
  type OrbWeaverAppointmentRecord,
  type OrbWeaverAppointmentStatus,
  type OrbWeaverEditableAppointmentDetails,
  type OrbWeaverServiceId,
  type OrbWeaverTimeWindow,
} from "@/types/orb-weaver";

interface BackofficeTicketModalProps {
  appointment: OrbWeaverAppointmentRecord;
  isUpdatingStatus: boolean;
  onClose: () => void;
  onStatusChange: (status: OrbWeaverAppointmentStatus) => Promise<void>;
  onAppointmentSaved: (appointment: OrbWeaverAppointmentRecord) => void;
  onDetailsSave: (
    details: OrbWeaverEditableAppointmentDetails
  ) => Promise<void>;
}

const statusLabels: Record<OrbWeaverAppointmentStatus, string> = {
  PENDING: "Pending",
  CONFIRMED: "Confirmed",
  IN_PROGRESS: "In progress",
  READY: "Ready",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
};

const statusStampClasses: Record<OrbWeaverAppointmentStatus, string> = {
  PENDING: "border-[#9a5b24] text-[#8a4f1f]",
  CONFIRMED: "border-[#376483] text-[#315b77]",
  IN_PROGRESS: "border-[#694d83] text-[#5f4677]",
  READY: "border-[#2f6b4e] text-[#2f6b4e]",
  COMPLETED: "border-[#5e574c] text-[#514b41]",
  CANCELLED: "border-[#9b3b31] text-[#8b342b]",
};

type EditableSection = "customer" | "schedule" | "order" | "notes";

const editorInputClasses =
  "min-h-11 w-full rounded-xl border border-white/10 bg-black/35 px-3 py-2 text-sm text-white outline-none placeholder:text-stone-600 focus:border-amber-300 focus:ring-2 focus:ring-amber-300/20";
const editorLabelClasses =
  "mb-1.5 block text-xs font-medium text-stone-400";

const getAvailability = (date: string) => {
  const parsed = new Date(`${date}T00:00:00.000Z`);
  const day = parsed.getUTCDay();
  return day === 0 || day === 6 ? "weekend" : "weekday";
};

const getEditableDetails = (
  appointment: OrbWeaverAppointmentRecord
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

const formatPeso = (amount: number) =>
  new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    maximumFractionDigits: 0,
  }).format(amount);

const formatDate = (date: string) =>
  new Intl.DateTimeFormat("en-PH", {
    timeZone: "UTC",
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date(`${date}T00:00:00.000Z`));

const formatDateTime = (date: string) =>
  new Intl.DateTimeFormat("en-PH", {
    timeZone: "Asia/Manila",
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(date));

const serviceName = (serviceId: string) =>
  ORB_WEAVER_SERVICES.find((service) => service.id === serviceId)?.name ??
  ORB_WEAVER_LEGACY_SERVICE_NAMES[serviceId] ??
  serviceId;

const timeWindowName = (windowId: string) =>
  ORB_WEAVER_TIME_WINDOWS.find((window) => window.id === windowId)?.name ??
  ORB_WEAVER_LEGACY_TIME_WINDOW_NAMES[windowId] ??
  windowId;

export function BackofficeTicketModal({
  appointment,
  isUpdatingStatus,
  onClose,
  onStatusChange,
  onAppointmentSaved,
  onDetailsSave,
}: BackofficeTicketModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const [statusError, setStatusError] = useState("");
  const [editingSection, setEditingSection] =
    useState<EditableSection | null>(null);
  const [editableDetails, setEditableDetails] = useState(() =>
    getEditableDetails(appointment)
  );
  const [isSavingDetails, setIsSavingDetails] = useState(false);
  const [detailsError, setDetailsError] = useState("");
  const pickupPoint =
    appointment.pickupLatitude !== null &&
    appointment.pickupLongitude !== null
      ? {
          latitude: appointment.pickupLatitude,
          longitude: appointment.pickupLongitude,
        }
      : null;
  const displayedTotal =
    appointment.finalTotal ?? appointment.estimatedSubtotal;
  const handoffLabel =
    appointment.handoffMethod === "pickup_return" ? "Pickup" : "Drop-off";
  const completionLabel =
    appointment.handoffMethod === "pickup_return" ? "Return" : "Claim";
  const availableWindows = ORB_WEAVER_TIME_WINDOWS.filter(
    (window) =>
      window.availability === getAvailability(editableDetails.preferredDate)
  );
  const editableService = ORB_WEAVER_SERVICES.find(
    (service) => service.id === editableDetails.service
  );
  const editableSubtotal =
    (editableService?.price ?? 0) * editableDetails.helmetCount +
    ORB_WEAVER_ADD_ONS.reduce((total, addOn) => {
      if (!editableDetails.addOnIds.includes(addOn.id)) {
        return total;
      }

      return (
        total +
        addOn.price *
          (addOn.perBooking ? 1 : editableDetails.helmetCount)
      );
    }, 0);

  useEffect(() => {
    if (!editingSection) {
      setEditableDetails(getEditableDetails(appointment));
    }
  }, [appointment, editingSection]);

  useEffect(() => {
    const previousActiveElement = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    dialogRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }

      if (event.key !== "Tab" || !dialogRef.current) {
        return;
      }

      const focusable = Array.from(
        dialogRef.current.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
        )
      );
      const first = focusable[0];
      const last = focusable.at(-1);

      if (!first || !last) {
        return;
      }

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
      previousActiveElement?.focus();
    };
  }, [onClose]);

  const changeStatus = async (status: OrbWeaverAppointmentStatus) => {
    setStatusError("");

    try {
      await onStatusChange(status);
    } catch (error) {
      setStatusError(
        error instanceof Error ? error.message : "Status could not be updated."
      );
    }
  };

  const beginEditing = (section: EditableSection) => {
    setEditableDetails(getEditableDetails(appointment));
    setDetailsError("");
    setEditingSection(section);
  };

  const cancelEditing = () => {
    setEditableDetails(getEditableDetails(appointment));
    setDetailsError("");
    setEditingSection(null);
  };

  const saveDetails = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSavingDetails(true);
    setDetailsError("");

    try {
      await onDetailsSave(editableDetails);
      setEditingSection(null);
    } catch (error) {
      setDetailsError(
        error instanceof Error
          ? error.message
          : "Order details could not be updated."
      );
    } finally {
      setIsSavingDetails(false);
    }
  };

  const changePreferredDate = (date: string) => {
    const windows = ORB_WEAVER_TIME_WINDOWS.filter(
      (window) => window.availability === getAvailability(date)
    );
    const preferredWindow = windows.some(
      (window) => window.id === editableDetails.preferredWindow
    )
      ? editableDetails.preferredWindow
      : (windows[0]?.id ?? "weekday_evening");

    setEditableDetails((current) => ({
      ...current,
      preferredDate: date,
      preferredWindow,
    }));
  };

  const renderEditButton = (
    section: EditableSection,
    label: string
  ) => (
    <button
      type="button"
      disabled={editingSection !== null && editingSection !== section}
      onClick={() => beginEditing(section)}
      className="inline-flex min-h-9 shrink-0 items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/[0.035] px-3 text-xs font-semibold text-stone-300 transition hover:border-amber-300/30 hover:text-amber-200 disabled:cursor-not-allowed disabled:opacity-35"
    >
      <FaEdit aria-hidden="true" />
      {label}
    </button>
  );

  const renderEditorActions = () => (
    <>
      {detailsError && (
        <p
          role="alert"
          className="mt-3 rounded-lg border border-red-300/20 bg-red-300/[0.07] p-3 text-xs leading-5 text-red-200"
        >
          {detailsError}
        </p>
      )}
      <div className="mt-4 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <button
          type="button"
          disabled={isSavingDetails}
          onClick={cancelEditing}
          className="inline-flex min-h-10 items-center justify-center rounded-lg border border-white/10 px-4 text-xs font-semibold text-stone-300 transition hover:border-white/20 hover:text-white disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSavingDetails}
          className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg bg-amber-400 px-4 text-xs font-semibold text-black transition hover:bg-amber-300 disabled:cursor-wait disabled:opacity-60"
        >
          <FaSave aria-hidden="true" />
          {isSavingDetails ? "Saving…" : "Save changes"}
        </button>
      </div>
    </>
  );

  return createPortal(
    <div
      className="fixed inset-0 z-[80] flex items-end justify-center bg-black/80 p-0 backdrop-blur-sm sm:items-center sm:p-5"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        ref={dialogRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby="backoffice-ticket-title"
        className="flex max-h-svh w-full max-w-6xl flex-col overflow-hidden bg-[#10110f] shadow-[0_30px_100px_rgba(0,0,0,0.65)] outline-none sm:max-h-[92svh] sm:rounded-[1.5rem] sm:border sm:border-white/10"
      >
        <header className="flex shrink-0 items-start justify-between gap-4 border-b border-white/[0.08] bg-[#0b0c0a] px-5 py-4 sm:px-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-300">
              Backoffice work ticket
            </p>
            <h2
              id="backoffice-ticket-title"
              className="mt-1 text-xl font-semibold text-white"
            >
              Order {appointment.reference}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close ticket details"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 text-stone-400 transition hover:border-amber-300/30 hover:text-white"
          >
            <FaTimes aria-hidden="true" />
          </button>
        </header>

        <div className="orb-weaver-ticket-scrollbar min-h-0 flex-1 overflow-y-auto overscroll-contain">
          <section
            className="bg-[#f4eddd] px-5 py-5 font-mono text-[#2d2922] sm:px-7"
            style={{
              backgroundImage:
                "radial-gradient(rgba(91,76,48,0.09) 0.7px, transparent 0.7px)",
              backgroundSize: "5px 5px",
            }}
          >
            <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <div className="flex items-center gap-2 text-[#6f5638]">
                  <FaReceipt aria-hidden="true" />
                  <p className="text-[0.7rem] font-bold uppercase tracking-[0.16em]">
                    VroomBroom service order
                  </p>
                </div>
                <p className="mt-3 text-3xl font-black tracking-[0.13em] text-[#171511]">
                  {appointment.reference}
                </p>
                <p className="mt-2 font-sans text-base font-black text-[#2d2922]">
                  {appointment.customerName}
                </p>
                <p className="mt-1 font-sans text-xs text-[#746b5d]">
                  Created {formatDateTime(appointment.createdAt)} · Updated{" "}
                  {formatDateTime(appointment.updatedAt)}
                </p>
              </div>
              <div className="flex flex-row items-end justify-between gap-5 sm:flex-col sm:items-end">
                <span
                  className={`-rotate-2 border-2 px-3 py-1 font-sans text-[0.7rem] font-black uppercase tracking-[0.12em] ${statusStampClasses[appointment.status]}`}
                >
                  {statusLabels[appointment.status]}
                </span>
                <div className="text-right">
                  <p className="text-[0.68rem] font-bold uppercase tracking-[0.12em] text-[#746b5d]">
                    {appointment.finalTotal === null
                      ? "Current subtotal"
                      : "Confirmed total"}
                  </p>
                  <p className="mt-1 text-2xl font-black text-[#171511]">
                    {displayedTotal === null
                      ? "—"
                      : formatPeso(displayedTotal)}
                  </p>
                </div>
              </div>
            </div>
          </section>

          <div className="grid gap-5 p-5 sm:p-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(19rem,0.8fr)]">
            <div className="space-y-5">
              <section className="rounded-2xl border border-white/[0.08] bg-white/[0.025] p-4 sm:p-5">
                <div className="flex items-center justify-between gap-4">
                  <h3 className="text-xs font-semibold uppercase tracking-[0.15em] text-amber-300">
                    Customer + contact
                  </h3>
                  {editingSection !== "customer" &&
                    renderEditButton("customer", "Edit")}
                </div>
                {editingSection === "customer" ? (
                  <form onSubmit={saveDetails} className="mt-4">
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="sm:col-span-2">
                        <label
                          className={editorLabelClasses}
                          htmlFor={`inline-name-${appointment.id}`}
                        >
                          Customer name
                        </label>
                        <input
                          id={`inline-name-${appointment.id}`}
                          value={editableDetails.customerName}
                          onChange={(event) =>
                            setEditableDetails((current) => ({
                              ...current,
                              customerName: event.target.value,
                            }))
                          }
                          required
                          minLength={2}
                          maxLength={100}
                          className={editorInputClasses}
                        />
                      </div>
                      <div>
                        <label
                          className={editorLabelClasses}
                          htmlFor={`inline-phone-${appointment.id}`}
                        >
                          Mobile number
                        </label>
                        <input
                          id={`inline-phone-${appointment.id}`}
                          type="tel"
                          value={editableDetails.phone}
                          onChange={(event) =>
                            setEditableDetails((current) => ({
                              ...current,
                              phone: event.target.value,
                            }))
                          }
                          required
                          minLength={7}
                          maxLength={40}
                          className={editorInputClasses}
                        />
                      </div>
                      <div>
                        <label
                          className={editorLabelClasses}
                          htmlFor={`inline-email-${appointment.id}`}
                        >
                          Email
                        </label>
                        <input
                          id={`inline-email-${appointment.id}`}
                          type="email"
                          value={editableDetails.email}
                          onChange={(event) =>
                            setEditableDetails((current) => ({
                              ...current,
                              email: event.target.value,
                            }))
                          }
                          maxLength={160}
                          className={editorInputClasses}
                        />
                      </div>
                    </div>
                    {renderEditorActions()}
                  </form>
                ) : (
                  <div className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
                    <a
                      href={`tel:${appointment.phone}`}
                      className="flex min-h-11 items-center gap-3 rounded-xl border border-white/[0.08] bg-black/20 px-3 text-stone-300 transition hover:border-amber-300/25 hover:text-amber-200"
                    >
                      <FaPhoneAlt
                        aria-hidden="true"
                        className="shrink-0 text-amber-300"
                      />
                      {appointment.phone}
                    </a>
                    {appointment.email ? (
                      <a
                        href={`mailto:${appointment.email}`}
                        className="flex min-h-11 min-w-0 items-center gap-3 rounded-xl border border-white/[0.08] bg-black/20 px-3 text-stone-300 transition hover:border-amber-300/25 hover:text-amber-200"
                      >
                        <FaEnvelope
                          aria-hidden="true"
                          className="shrink-0 text-amber-300"
                        />
                        <span className="truncate">{appointment.email}</span>
                      </a>
                    ) : (
                      <p className="flex min-h-11 items-center rounded-xl border border-white/[0.08] bg-black/20 px-3 text-stone-600">
                        No email provided
                      </p>
                    )}
                  </div>
                )}
              </section>

              <section className="rounded-2xl border border-white/[0.08] bg-white/[0.025] p-4 sm:p-5">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2 text-amber-300">
                    <FaCalendarAlt aria-hidden="true" />
                    <h3 className="text-xs font-semibold uppercase tracking-[0.15em]">
                      Schedule + handoff
                    </h3>
                  </div>
                  {editingSection !== "schedule" &&
                    renderEditButton("schedule", "Edit")}
                </div>
                {editingSection === "schedule" ? (
                  <form onSubmit={saveDetails} className="mt-4">
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div>
                        <label
                          className={editorLabelClasses}
                          htmlFor={`inline-date-${appointment.id}`}
                        >
                          Preferred date
                        </label>
                        <input
                          id={`inline-date-${appointment.id}`}
                          type="date"
                          value={editableDetails.preferredDate}
                          onChange={(event) =>
                            changePreferredDate(event.target.value)
                          }
                          required
                          className={editorInputClasses}
                        />
                      </div>
                      <div>
                        <label
                          className={editorLabelClasses}
                          htmlFor={`inline-window-${appointment.id}`}
                        >
                          Handoff window
                        </label>
                        <select
                          id={`inline-window-${appointment.id}`}
                          value={editableDetails.preferredWindow}
                          onChange={(event) =>
                            setEditableDetails((current) => ({
                              ...current,
                              preferredWindow: event.target
                                .value as OrbWeaverTimeWindow,
                            }))
                          }
                          className={editorInputClasses}
                        >
                          {availableWindows.map((window) => (
                            <option key={window.id} value={window.id}>
                              {window.shortName} · return{" "}
                              {window.completionTime}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="sm:col-span-2">
                        <label
                          className={editorLabelClasses}
                          htmlFor={`inline-handoff-${appointment.id}`}
                        >
                          Handoff method
                        </label>
                        <select
                          id={`inline-handoff-${appointment.id}`}
                          value={editableDetails.handoffMethod}
                          onChange={(event) =>
                            setEditableDetails((current) => ({
                              ...current,
                              handoffMethod: event.target.value as
                                | "drop_off"
                                | "pickup_return",
                            }))
                          }
                          className={editorInputClasses}
                        >
                          <option value="drop_off">
                            Customer drop-off + return
                          </option>
                          <option value="pickup_return">
                            Pickup + return
                          </option>
                        </select>
                      </div>
                    </div>

                    {editableDetails.handoffMethod === "pickup_return" && (
                      <div className="mt-3 rounded-xl border border-white/[0.08] bg-black/20 p-3">
                        <label
                          className={editorLabelClasses}
                          htmlFor={`inline-area-${appointment.id}`}
                        >
                          Pickup address or landmark
                        </label>
                        <input
                          id={`inline-area-${appointment.id}`}
                          value={editableDetails.pickupArea}
                          onChange={(event) =>
                            setEditableDetails((current) => ({
                              ...current,
                              pickupArea: event.target.value,
                            }))
                          }
                          maxLength={180}
                          className={editorInputClasses}
                        />
                        <div className="mt-3 grid grid-cols-2 gap-2">
                          <div>
                            <label
                              className={editorLabelClasses}
                              htmlFor={`inline-latitude-${appointment.id}`}
                            >
                              Latitude
                            </label>
                            <input
                              id={`inline-latitude-${appointment.id}`}
                              type="number"
                              value={editableDetails.pickupLatitude ?? ""}
                              onChange={(event) =>
                                setEditableDetails((current) => ({
                                  ...current,
                                  pickupLatitude: event.target.value
                                    ? Number(event.target.value)
                                    : null,
                                }))
                              }
                              min="-90"
                              max="90"
                              step="0.000001"
                              required
                              className={editorInputClasses}
                            />
                          </div>
                          <div>
                            <label
                              className={editorLabelClasses}
                              htmlFor={`inline-longitude-${appointment.id}`}
                            >
                              Longitude
                            </label>
                            <input
                              id={`inline-longitude-${appointment.id}`}
                              type="number"
                              value={editableDetails.pickupLongitude ?? ""}
                              onChange={(event) =>
                                setEditableDetails((current) => ({
                                  ...current,
                                  pickupLongitude: event.target.value
                                    ? Number(event.target.value)
                                    : null,
                                }))
                              }
                              min="-180"
                              max="180"
                              step="0.000001"
                              required
                              className={editorInputClasses}
                            />
                          </div>
                        </div>
                      </div>
                    )}
                    {renderEditorActions()}
                  </form>
                ) : (
                  <>
                    <p className="mt-4 font-semibold text-white">
                      {formatDate(appointment.preferredDate)}
                    </p>
                    <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
                      <div className="rounded-xl border border-white/[0.07] bg-black/20 p-3">
                        <dt className="text-xs text-stone-500">
                          {handoffLabel}
                        </dt>
                        <dd className="mt-1 font-medium text-stone-200">
                          {appointment.handoffWindow ??
                            timeWindowName(appointment.preferredWindow)}
                        </dd>
                      </div>
                      <div className="rounded-xl border border-white/[0.07] bg-black/20 p-3">
                        <dt className="text-xs text-stone-500">
                          {completionLabel}
                        </dt>
                        <dd className="mt-1 font-medium text-stone-200">
                          {appointment.completionWindow || "Not recorded"}
                        </dd>
                      </div>
                    </dl>
                    <div className="mt-3 rounded-xl border border-white/[0.07] bg-black/20 p-3">
                      <p className="flex items-start gap-2 text-sm font-medium text-stone-300">
                        <FaMapMarkerAlt
                          aria-hidden="true"
                          className="mt-0.5 shrink-0 text-amber-300"
                        />
                        {appointment.handoffMethod === "pickup_return"
                          ? "Pickup + return"
                          : appointment.handoffMethod === "drop_off"
                            ? `Customer drop-off at ${ORB_WEAVER_MEETUP.name}`
                            : "Handoff not recorded"}
                      </p>
                      {appointment.handoffMethod === "drop_off" && (
                        <p className="mt-2 pl-5 text-xs leading-5 text-stone-500">
                          {ORB_WEAVER_MEETUP.label}
                        </p>
                      )}
                      {appointment.pickupArea && (
                        <p className="mt-2 pl-5 text-xs leading-5 text-stone-500">
                          {appointment.pickupArea}
                        </p>
                      )}
                      {pickupPoint && (
                        <div className="mt-3 flex flex-wrap gap-2 pl-5">
                          <a
                            href={getOrbWeaverPickupMapUrl(pickupPoint)}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex min-h-9 items-center gap-2 rounded-lg border border-amber-300/20 bg-amber-300/[0.07] px-3 py-1.5 text-xs font-semibold text-amber-200 transition hover:bg-amber-400 hover:text-black"
                          >
                            <FaMapMarkerAlt aria-hidden="true" />
                            View pickup pin
                          </a>
                          <a
                            href={getOrbWeaverPickupDirectionsUrl(pickupPoint)}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex min-h-9 items-center gap-2 rounded-lg border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-semibold text-stone-300 transition hover:border-amber-300/30 hover:text-amber-200"
                          >
                            <FaExternalLinkAlt aria-hidden="true" />
                            Directions
                          </a>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </section>

              <section className="rounded-2xl border border-white/[0.08] bg-white/[0.025] p-4 sm:p-5">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2 text-amber-300">
                    <FaReceipt aria-hidden="true" />
                    <h3 className="text-xs font-semibold uppercase tracking-[0.15em]">
                      Order receipt
                    </h3>
                  </div>
                  {editingSection !== "order" &&
                    renderEditButton("order", "Edit")}
                </div>
                {editingSection === "order" ? (
                  <form onSubmit={saveDetails} className="mt-4">
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div>
                        <label
                          className={editorLabelClasses}
                          htmlFor={`inline-service-${appointment.id}`}
                        >
                          Cleaning service
                        </label>
                        <select
                          id={`inline-service-${appointment.id}`}
                          value={editableDetails.service}
                          onChange={(event) => {
                            const service = event.target
                              .value as OrbWeaverServiceId;
                            setEditableDetails((current) => ({
                              ...current,
                              service,
                              helmetCount:
                                service === "multiple_helmets" ? 2 : 1,
                            }));
                          }}
                          className={editorInputClasses}
                        >
                          {ORB_WEAVER_SERVICES.filter(
                            (service) => service.available
                          ).map((service) => (
                            <option key={service.id} value={service.id}>
                              {service.name} · ₱{service.price}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label
                          className={editorLabelClasses}
                          htmlFor={`inline-helmet-count-${appointment.id}`}
                        >
                          Helmet count
                        </label>
                        <input
                          id={`inline-helmet-count-${appointment.id}`}
                          type="number"
                          value={editableDetails.helmetCount}
                          onChange={(event) =>
                            setEditableDetails((current) => ({
                              ...current,
                              helmetCount: Number(event.target.value),
                            }))
                          }
                          min={
                            editableDetails.service === "multiple_helmets"
                              ? 2
                              : 1
                          }
                          max={
                            editableDetails.service === "multiple_helmets"
                              ? 10
                              : 1
                          }
                          required
                          className={editorInputClasses}
                        />
                      </div>
                    </div>
                    <fieldset className="mt-4 border-t border-white/[0.08] pt-4">
                      <legend className="text-xs font-semibold uppercase tracking-[0.12em] text-stone-300">
                        Add-ons
                      </legend>
                      <div className="mt-3 grid gap-2 sm:grid-cols-2">
                        {ORB_WEAVER_ADD_ONS.map((addOn) => {
                          const isSelected =
                            editableDetails.addOnIds.includes(addOn.id);

                          return (
                            <label
                              key={addOn.id}
                              className={`flex cursor-pointer items-center justify-between gap-3 rounded-lg border px-3 py-2 text-xs ${
                                isSelected
                                  ? "border-amber-300/30 bg-amber-300/[0.08] text-stone-200"
                                  : "border-white/[0.08] bg-black/20 text-stone-400"
                              }`}
                            >
                              <span className="flex items-center gap-2">
                                <input
                                  type="checkbox"
                                  checked={isSelected}
                                  onChange={() =>
                                    setEditableDetails((current) => ({
                                      ...current,
                                      addOnIds: isSelected
                                        ? current.addOnIds.filter(
                                            (id) => id !== addOn.id
                                          )
                                        : [...current.addOnIds, addOn.id],
                                    }))
                                  }
                                  className="accent-amber-400"
                                />
                                {addOn.name}
                              </span>
                              <span className="shrink-0 text-amber-200">
                                +₱{addOn.price}
                              </span>
                            </label>
                          );
                        })}
                      </div>
                    </fieldset>
                    <div className="mt-4 flex items-center justify-between gap-4 border-t border-white/[0.08] pt-4 text-sm">
                      <div>
                        <p className="font-medium text-stone-300">
                          Updated cleaning subtotal
                        </p>
                        <p className="mt-1 text-xs text-stone-600">
                          Delivery pricing remains in its own panel.
                        </p>
                      </div>
                      <p className="text-xl font-semibold text-amber-200">
                        {formatPeso(editableSubtotal)}
                      </p>
                    </div>
                    {renderEditorActions()}
                  </form>
                ) : (
                  <div className="mt-4 space-y-3 text-sm">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="font-medium text-stone-200">
                          {serviceName(appointment.service)}
                        </p>
                        <p className="mt-0.5 text-xs text-stone-500">
                          {appointment.helmetCount}{" "}
                          {appointment.helmetCount === 1
                            ? "helmet"
                            : "helmets"}
                          {appointment.serviceUnitPrice !== null &&
                            ` × ${formatPeso(appointment.serviceUnitPrice)}`}
                        </p>
                      </div>
                      <p className="shrink-0 text-stone-200">
                        {appointment.serviceUnitPrice === null
                          ? "—"
                          : formatPeso(
                              appointment.serviceUnitPrice *
                                appointment.helmetCount
                            )}
                      </p>
                    </div>
                    {appointment.requestedAddOns.map((addOn) => (
                      <div
                        key={addOn.id}
                        className="flex items-start justify-between gap-4 text-stone-400"
                      >
                        <span>
                          {addOn.name}
                          {addOn.quantity > 1 && ` × ${addOn.quantity}`}
                        </span>
                        <span className="shrink-0">
                          {formatPeso(addOn.subtotal)}
                        </span>
                      </div>
                    ))}
                    <div className="space-y-2 border-t border-white/[0.08] pt-3">
                      <div className="flex justify-between gap-4 text-stone-400">
                        <span>Cleaning subtotal</span>
                        <span>
                          {appointment.estimatedSubtotal === null
                            ? "—"
                            : formatPeso(appointment.estimatedSubtotal)}
                        </span>
                      </div>
                      <div className="flex justify-between gap-4 text-stone-400">
                        <span>
                          Delivery
                          {appointment.deliveryDistanceKm !== null && (
                            <span className="ml-1 text-xs text-stone-600">
                              ({appointment.deliveryDistanceKm.toFixed(2)} km)
                            </span>
                          )}
                        </span>
                        <span>
                          {appointment.deliveryFee === null
                            ? "Pending"
                            : appointment.deliveryFee === 0
                              ? "Free"
                              : formatPeso(appointment.deliveryFee)}
                        </span>
                      </div>
                      <div className="flex items-end justify-between gap-4 border-t border-amber-300/15 pt-3">
                        <span className="font-semibold text-amber-200">
                          {appointment.finalTotal === null
                            ? "Current subtotal"
                            : "Final total"}
                        </span>
                        <span className="text-2xl font-semibold text-white">
                          {displayedTotal === null
                            ? "—"
                            : formatPeso(displayedTotal)}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </section>

              <section className="rounded-2xl border border-white/[0.08] bg-white/[0.025] p-4 sm:p-5">
                <div className="flex items-center justify-between gap-4">
                  <h3 className="text-xs font-semibold uppercase tracking-[0.15em] text-amber-300">
                    Customer note
                  </h3>
                  {editingSection !== "notes" &&
                    renderEditButton("notes", "Edit")}
                </div>
                {editingSection === "notes" ? (
                  <form onSubmit={saveDetails} className="mt-4">
                    <label
                      className={editorLabelClasses}
                      htmlFor={`inline-notes-${appointment.id}`}
                    >
                      Notes
                    </label>
                    <textarea
                      id={`inline-notes-${appointment.id}`}
                      value={editableDetails.notes}
                      onChange={(event) =>
                        setEditableDetails((current) => ({
                          ...current,
                          notes: event.target.value,
                        }))
                      }
                      rows={5}
                      maxLength={700}
                      placeholder="Add handling notes, customer requests, or reminders."
                      className={`${editorInputClasses} resize-y`}
                    />
                    {renderEditorActions()}
                  </form>
                ) : (
                  <p
                    className={`mt-3 whitespace-pre-wrap text-sm leading-6 ${
                      appointment.notes ? "text-stone-400" : "text-stone-600"
                    }`}
                  >
                    {appointment.notes || "No customer note added."}
                  </p>
                )}
              </section>
            </div>

            <aside className="space-y-4 lg:sticky lg:top-0 lg:self-start">
              <section className="rounded-2xl border border-amber-300/15 bg-amber-300/[0.04] p-4">
                <label
                  htmlFor={`modal-status-${appointment.id}`}
                  className="mb-2 block text-xs font-semibold uppercase tracking-[0.14em] text-amber-300"
                >
                  Update order status
                </label>
                <select
                  id={`modal-status-${appointment.id}`}
                  value={appointment.status}
                  disabled={isUpdatingStatus}
                  onChange={(event) =>
                    void changeStatus(
                      event.target.value as OrbWeaverAppointmentStatus
                    )
                  }
                  className="min-h-11 w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm text-stone-200 outline-none focus:border-amber-300 focus:ring-2 focus:ring-amber-300/20 disabled:cursor-wait disabled:opacity-60"
                >
                  {ORB_WEAVER_STATUSES.map((status) => (
                    <option key={status} value={status}>
                      {statusLabels[status]}
                    </option>
                  ))}
                </select>
                {statusError && (
                  <p
                    role="alert"
                    className="mt-2 text-xs leading-5 text-red-300"
                  >
                    {statusError}
                  </p>
                )}
              </section>

              <DeliveryPricingEditor
                key={`pricing-${appointment.id}-${appointment.updatedAt}`}
                appointment={appointment}
                onSaved={onAppointmentSaved}
              />
            </aside>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}

"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  FaCalendarCheck,
  FaCheckCircle,
  FaClock,
  FaEnvelope,
  FaExternalLinkAlt,
  FaMapMarkerAlt,
  FaMotorcycle,
  FaPhoneAlt,
  FaSearch,
  FaSyncAlt,
} from "react-icons/fa";
import {
  ORB_WEAVER_LEGACY_SERVICE_NAMES,
  ORB_WEAVER_LEGACY_TIME_WINDOW_NAMES,
  ORB_WEAVER_SERVICES,
  ORB_WEAVER_STATUSES,
  ORB_WEAVER_TIME_WINDOWS,
  type OrbWeaverAppointmentRecord,
  type OrbWeaverAppointmentStatus,
} from "@/types/orb-weaver";
import {
  getOrbWeaverPickupDirectionsUrl,
  getOrbWeaverPickupMapUrl,
} from "@/lib/orb-weaver/location";

interface AppointmentsDashboardProps {
  initialAppointments: OrbWeaverAppointmentRecord[];
}

const statusLabels: Record<OrbWeaverAppointmentStatus, string> = {
  PENDING: "Pending",
  CONFIRMED: "Confirmed",
  IN_PROGRESS: "In progress",
  READY: "Ready",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
};

const statusClasses: Record<OrbWeaverAppointmentStatus, string> = {
  PENDING: "border-amber-300/20 bg-amber-300/10 text-amber-200",
  CONFIRMED: "border-sky-300/20 bg-sky-300/10 text-sky-200",
  IN_PROGRESS: "border-violet-300/20 bg-violet-300/10 text-violet-200",
  READY: "border-emerald-300/20 bg-emerald-300/10 text-emerald-200",
  COMPLETED: "border-stone-300/20 bg-stone-300/10 text-stone-300",
  CANCELLED: "border-red-300/20 bg-red-300/10 text-red-200",
};

const formatDate = (date: string) =>
  new Intl.DateTimeFormat("en-PH", {
    timeZone: "UTC",
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(`${date}T00:00:00.000Z`));

const serviceName = (serviceId: string) =>
  ORB_WEAVER_SERVICES.find((service) => service.id === serviceId)?.name ??
  ORB_WEAVER_LEGACY_SERVICE_NAMES[serviceId] ??
  serviceId;

const timeWindowName = (windowId: string) =>
  ORB_WEAVER_TIME_WINDOWS.find((window) => window.id === windowId)?.name ??
  ORB_WEAVER_LEGACY_TIME_WINDOW_NAMES[windowId] ??
  windowId;

const formatPeso = (amount: number) =>
  new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    maximumFractionDigits: 0,
  }).format(amount);

export function AppointmentsDashboard({
  initialAppointments,
}: AppointmentsDashboardProps) {
  const [appointments, setAppointments] = useState(initialAppointments);
  const [filter, setFilter] = useState<OrbWeaverAppointmentStatus | "ALL">(
    "ALL"
  );
  const [query, setQuery] = useState("");
  const [updatingId, setUpdatingId] = useState<string>();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState("");

  const refreshAppointments = useCallback(async (silent = false) => {
    if (!silent) {
      setIsRefreshing(true);
      setError("");
    }

    try {
      const response = await fetch("/api/orb-weaver/backoffice/appointments", {
        cache: "no-store",
      });
      const result = (await response.json()) as {
        appointments?: OrbWeaverAppointmentRecord[];
        message?: string;
      };

      if (!response.ok || !result.appointments) {
        throw new Error(result.message || "Appointments could not be refreshed.");
      }

      setAppointments(result.appointments);
    } catch (refreshError) {
      if (!silent) {
        setError(
          refreshError instanceof Error
            ? refreshError.message
            : "Appointments could not be refreshed."
        );
      }
    } finally {
      if (!silent) {
        setIsRefreshing(false);
      }
    }
  }, []);

  useEffect(() => {
    const refreshIfVisible = () => {
      if (document.visibilityState === "visible") {
        void refreshAppointments(true);
      }
    };
    const intervalId = window.setInterval(refreshIfVisible, 30_000);

    window.addEventListener("focus", refreshIfVisible);
    document.addEventListener("visibilitychange", refreshIfVisible);

    return () => {
      window.clearInterval(intervalId);
      window.removeEventListener("focus", refreshIfVisible);
      document.removeEventListener("visibilitychange", refreshIfVisible);
    };
  }, [refreshAppointments]);

  const filteredAppointments = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return appointments.filter((appointment) => {
      const matchesStatus = filter === "ALL" || appointment.status === filter;
      const matchesQuery =
        !normalizedQuery ||
        appointment.reference.toLowerCase().includes(normalizedQuery) ||
        appointment.customerName.toLowerCase().includes(normalizedQuery) ||
        appointment.phone.toLowerCase().includes(normalizedQuery) ||
        appointment.email.toLowerCase().includes(normalizedQuery) ||
        appointment.pickupArea?.toLowerCase().includes(normalizedQuery) ||
        serviceName(appointment.service)
          .toLowerCase()
          .includes(normalizedQuery) ||
        appointment.requestedAddOns.some((addOn) =>
          addOn.name.toLowerCase().includes(normalizedQuery)
        );

      return matchesStatus && matchesQuery;
    });
  }, [appointments, filter, query]);

  const counts = useMemo(
    () => ({
      pending: appointments.filter(
        (appointment) => appointment.status === "PENDING"
      ).length,
      active: appointments.filter((appointment) =>
        ["CONFIRMED", "IN_PROGRESS", "READY"].includes(appointment.status)
      ).length,
      completed: appointments.filter(
        (appointment) => appointment.status === "COMPLETED"
      ).length,
    }),
    [appointments]
  );

  const updateStatus = async (
    appointmentId: string,
    status: OrbWeaverAppointmentStatus
  ) => {
    setUpdatingId(appointmentId);
    setError("");

    try {
      const response = await fetch(
        `/api/orb-weaver/backoffice/appointments/${appointmentId}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status }),
        }
      );
      const result = (await response.json()) as {
        appointment?: OrbWeaverAppointmentRecord;
        message?: string;
      };

      if (!response.ok || !result.appointment) {
        throw new Error(result.message || "Status could not be updated.");
      }

      setAppointments((current) =>
        current.map((appointment) =>
          appointment.id === appointmentId
            ? result.appointment!
            : appointment
        )
      );
    } catch (updateError) {
      setError(
        updateError instanceof Error
          ? updateError.message
          : "Status could not be updated."
      );
    } finally {
      setUpdatingId(undefined);
    }
  };

  return (
    <>
      <section
        aria-label="Appointment summary"
        className="grid gap-4 sm:grid-cols-3"
      >
        {[
          {
            label: "New requests",
            value: counts.pending,
            icon: FaClock,
            accent: "text-amber-300",
          },
          {
            label: "Active bookings",
            value: counts.active,
            icon: FaCalendarCheck,
            accent: "text-sky-300",
          },
          {
            label: "Completed",
            value: counts.completed,
            icon: FaCheckCircle,
            accent: "text-emerald-300",
          },
        ].map((card) => {
          const Icon = card.icon;

          return (
            <article
              key={card.label}
              className="rounded-2xl border border-white/[0.08] bg-white/[0.035] p-5"
            >
              <div className="flex items-center justify-between">
                <p className="text-sm text-stone-400">{card.label}</p>
                <Icon aria-hidden="true" className={card.accent} />
              </div>
              <p className="mt-4 text-3xl font-semibold text-white">
                {card.value}
              </p>
            </article>
          );
        })}
      </section>

      <section className="mt-8 overflow-hidden rounded-2xl border border-white/[0.08] bg-[#11120f]">
        <div className="border-b border-white/[0.08] p-5 sm:p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-xl font-semibold text-white">
                Appointment requests
              </h2>
              <p className="mt-1 text-sm text-stone-500">
                {filteredAppointments.length} of {appointments.length} shown
              </p>
            </div>

            <div className="flex w-full gap-2 lg:max-w-md">
              <div className="relative min-w-0 flex-1">
                <FaSearch
                  aria-hidden="true"
                  className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-stone-600"
                />
                <label htmlFor="appointment-search" className="sr-only">
                  Search appointments
                </label>
                <input
                  id="appointment-search"
                  type="search"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search reference, name, or contact"
                  className="min-h-11 w-full rounded-xl border border-white/10 bg-black/30 py-2 pl-11 pr-4 text-sm text-white outline-none placeholder:text-stone-600 focus:border-amber-300 focus:ring-2 focus:ring-amber-300/20"
                />
              </div>
              <button
                type="button"
                disabled={isRefreshing}
                onClick={() => void refreshAppointments()}
                className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 text-sm font-semibold text-stone-300 transition hover:border-amber-300/30 hover:text-amber-200 disabled:cursor-wait disabled:opacity-60"
              >
                <FaSyncAlt
                  aria-hidden="true"
                  className={isRefreshing ? "animate-spin" : ""}
                />
                <span className="sr-only sm:not-sr-only">Refresh</span>
              </button>
            </div>
          </div>

          <div className="mt-5 flex gap-2 overflow-x-auto pb-1">
            {(["ALL", ...ORB_WEAVER_STATUSES] as const).map((status) => (
              <button
                key={status}
                type="button"
                onClick={() => setFilter(status)}
                className={`min-h-10 shrink-0 rounded-full border px-4 py-2 text-xs font-semibold transition ${
                  filter === status
                    ? "border-amber-300 bg-amber-400 text-black"
                    : "border-white/10 bg-white/[0.03] text-stone-400 hover:border-amber-300/30 hover:text-amber-200"
                }`}
              >
                {status === "ALL" ? "All" : statusLabels[status]}
              </button>
            ))}
          </div>

          {error && (
            <p
              role="alert"
              className="mt-4 rounded-xl border border-red-400/20 bg-red-400/10 p-3 text-sm text-red-100"
            >
              {error}
            </p>
          )}
        </div>

        {filteredAppointments.length === 0 ? (
          <div className="px-5 py-16 text-center">
            <FaMotorcycle
              aria-hidden="true"
              className="mx-auto text-4xl text-stone-700"
            />
            <p className="mt-4 font-medium text-stone-300">
              No appointments match this view.
            </p>
            <p className="mt-1 text-sm text-stone-600">
              New appointment requests will appear here.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-white/[0.07]">
            {filteredAppointments.map((appointment) => {
              const pickupPoint =
                appointment.pickupLatitude !== null &&
                appointment.pickupLongitude !== null
                  ? {
                      latitude: appointment.pickupLatitude,
                      longitude: appointment.pickupLongitude,
                    }
                  : null;
              const handoffLabel =
                appointment.handoffMethod === "pickup_return"
                  ? "Pickup"
                  : "Drop-off";
              const completionLabel =
                appointment.handoffMethod === "pickup_return"
                  ? "Return"
                  : "Claim";

              return (
                <article
                  key={appointment.id}
                  className="grid gap-5 p-5 transition hover:bg-white/[0.02] sm:p-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,0.8fr)_minmax(0,1.1fr)_auto] xl:items-center"
                >
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-semibold text-white">
                        {appointment.customerName}
                      </h3>
                      <span
                        className={`rounded-full border px-2.5 py-1 text-[0.68rem] font-semibold ${statusClasses[appointment.status]}`}
                      >
                        {statusLabels[appointment.status]}
                      </span>
                    </div>
                    <p className="mt-2 font-mono text-xs font-semibold tracking-wider text-amber-300">
                      Ref: {appointment.reference}
                    </p>
                    <div className="mt-3 flex flex-col gap-2 text-sm text-stone-400">
                      <a
                        href={`tel:${appointment.phone}`}
                        className="inline-flex items-center gap-2 hover:text-amber-300"
                      >
                        <FaPhoneAlt aria-hidden="true" className="text-xs" />
                        {appointment.phone}
                      </a>
                      {appointment.email && (
                        <a
                          href={`mailto:${appointment.email}`}
                          className="inline-flex items-center gap-2 break-all hover:text-amber-300"
                        >
                          <FaEnvelope aria-hidden="true" className="text-xs" />
                          {appointment.email}
                        </a>
                      )}
                    </div>
                  </div>

                  <div className="text-sm">
                    <p className="font-medium text-stone-200">
                      {serviceName(appointment.service)}
                    </p>
                    <p className="mt-1 text-stone-500">
                      {appointment.helmetCount}{" "}
                      {appointment.helmetCount === 1 ? "helmet" : "helmets"}
                      {appointment.serviceUnitPrice !== null &&
                        ` · ${formatPeso(appointment.serviceUnitPrice)} each`}
                    </p>
                    {appointment.requestedAddOns.length > 0 && (
                      <div className="mt-3 border-t border-white/[0.07] pt-3">
                        <p className="text-xs font-semibold uppercase tracking-wider text-stone-500">
                          Add-ons
                        </p>
                        <ul className="mt-2 space-y-1.5 text-xs text-stone-400">
                          {appointment.requestedAddOns.map((addOn) => (
                            <li
                              key={addOn.id}
                              className="flex items-start justify-between gap-3"
                            >
                              <span>
                                {addOn.name}
                                {addOn.quantity > 1 && ` × ${addOn.quantity}`}
                              </span>
                              <span className="shrink-0 text-stone-300">
                                {formatPeso(addOn.subtotal)}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {appointment.estimatedSubtotal !== null && (
                      <p className="mt-3 flex items-center justify-between gap-3 border-t border-white/[0.07] pt-3 font-semibold text-amber-300">
                        <span>Estimated subtotal</span>
                        <span>{formatPeso(appointment.estimatedSubtotal)}</span>
                      </p>
                    )}
                  </div>

                  <div className="text-sm">
                    <p className="font-medium text-stone-200">
                      {formatDate(appointment.preferredDate)}
                    </p>
                    <p className="mt-1 text-stone-400">
                      <span className="text-stone-500">{handoffLabel}:</span>{" "}
                      {appointment.handoffWindow ??
                        timeWindowName(appointment.preferredWindow)}
                    </p>
                    {appointment.completionWindow && (
                      <p className="mt-1 text-stone-400">
                        <span className="text-stone-500">
                          {completionLabel}:
                        </span>{" "}
                        {appointment.completionWindow}
                      </p>
                    )}
                    <div className="mt-3 border-t border-white/[0.07] pt-3">
                      <p className="flex items-start gap-2 font-medium text-stone-300">
                        <FaMapMarkerAlt
                          aria-hidden="true"
                          className="mt-0.5 shrink-0 text-amber-300"
                        />
                        {appointment.handoffMethod === "pickup_return"
                          ? "Pickup + return"
                          : appointment.handoffMethod === "drop_off"
                          ? "Customer drop-off at meetup"
                          : "Handoff not recorded"}
                      </p>
                      {appointment.pickupArea && (
                        <p className="mt-1 pl-5 text-xs leading-5 text-stone-500">
                          {appointment.pickupArea}
                        </p>
                      )}
                      {pickupPoint && (
                        <div className="mt-2 flex flex-wrap gap-2 pl-5">
                          <a
                            href={getOrbWeaverPickupMapUrl(pickupPoint)}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex min-h-9 items-center gap-1.5 rounded-lg border border-amber-300/20 bg-amber-300/[0.07] px-3 py-1.5 text-xs font-semibold text-amber-200 transition hover:bg-amber-400 hover:text-black"
                          >
                            <FaMapMarkerAlt aria-hidden="true" />
                            View pin
                          </a>
                          <a
                            href={getOrbWeaverPickupDirectionsUrl(pickupPoint)}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex min-h-9 items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-semibold text-stone-300 transition hover:border-amber-300/30 hover:text-amber-200"
                          >
                            <FaExternalLinkAlt aria-hidden="true" />
                            Directions
                          </a>
                        </div>
                      )}
                    </div>
                    {appointment.notes && (
                      <details className="mt-2">
                        <summary className="cursor-pointer text-xs text-amber-300">
                          Customer note
                        </summary>
                        <p className="mt-2 max-w-md whitespace-pre-wrap text-xs leading-5 text-stone-400">
                          {appointment.notes}
                        </p>
                      </details>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor={`status-${appointment.id}`}
                      className="mb-1.5 block text-xs text-stone-500"
                    >
                      Update status
                    </label>
                    <select
                      id={`status-${appointment.id}`}
                      value={appointment.status}
                      disabled={updatingId === appointment.id}
                      onChange={(event) =>
                        updateStatus(
                          appointment.id,
                          event.target.value as OrbWeaverAppointmentStatus
                        )
                      }
                      className="min-h-11 rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm text-stone-200 outline-none focus:border-amber-300 focus:ring-2 focus:ring-amber-300/20 disabled:cursor-wait disabled:opacity-60"
                    >
                      {ORB_WEAVER_STATUSES.map((status) => (
                        <option key={status} value={status}>
                          {statusLabels[status]}
                        </option>
                      ))}
                    </select>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </>
  );
}

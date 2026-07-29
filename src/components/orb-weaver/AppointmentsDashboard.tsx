"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  FaCalendarCheck,
  FaCheckCircle,
  FaChevronLeft,
  FaChevronRight,
  FaClock,
  FaEye,
  FaMotorcycle,
  FaReceipt,
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
  type OrbWeaverEditableAppointmentDetails,
} from "@/types/orb-weaver";
import { BackofficeTicketModal } from "@/components/orb-weaver/BackofficeTicketModal";

interface AppointmentsDashboardProps {
  initialAppointments: OrbWeaverAppointmentRecord[];
}

const TICKETS_PER_PAGE = 6;

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

const paperEdgeStyle = {
  backgroundImage:
    "linear-gradient(135deg, transparent 50%, #f4eddd 50%), linear-gradient(45deg, #f4eddd 50%, transparent 50%)",
  backgroundPosition: "0 0, 8px 0",
  backgroundSize: "16px 16px",
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
  const [selectedAppointmentId, setSelectedAppointmentId] = useState<
    string | null
  >(null);
  const [page, setPage] = useState(1);
  const closeTicket = useCallback(() => setSelectedAppointmentId(null), []);

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
  const totalPages = Math.max(
    1,
    Math.ceil(filteredAppointments.length / TICKETS_PER_PAGE)
  );
  const currentPage = Math.min(page, totalPages);
  const pageStart =
    filteredAppointments.length === 0
      ? 0
      : (currentPage - 1) * TICKETS_PER_PAGE + 1;
  const pageEnd = Math.min(
    currentPage * TICKETS_PER_PAGE,
    filteredAppointments.length
  );
  const paginatedAppointments = filteredAppointments.slice(
    (currentPage - 1) * TICKETS_PER_PAGE,
    currentPage * TICKETS_PER_PAGE
  );

  useEffect(() => {
    setPage(1);
  }, [filter, query]);

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

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
  const selectedAppointment =
    appointments.find(
      (appointment) => appointment.id === selectedAppointmentId
    ) ?? null;

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
      const message =
        updateError instanceof Error
          ? updateError.message
          : "Status could not be updated.";
      setError(message);
      throw new Error(message);
    } finally {
      setUpdatingId(undefined);
    }
  };

  const replaceAppointment = (updated: OrbWeaverAppointmentRecord) => {
    setAppointments((current) =>
      current.map((appointment) =>
        appointment.id === updated.id ? updated : appointment
      )
    );
  };

  const updateOrderDetails = async (
    appointmentId: string,
    details: OrbWeaverEditableAppointmentDetails
  ) => {
    const response = await fetch(
      `/api/orb-weaver/backoffice/appointments/${appointmentId}`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ details }),
      }
    );
    const result = (await response.json()) as {
      appointment?: OrbWeaverAppointmentRecord;
      message?: string;
    };

    if (!response.ok || !result.appointment) {
      throw new Error(result.message || "Order details could not be updated.");
    }

    replaceAppointment(result.appointment);
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
                Work tickets
              </h2>
              <p
                aria-live="polite"
                className="mt-1 text-sm text-stone-500"
              >
                Showing {pageStart}–{pageEnd} of {filteredAppointments.length}{" "}
                matching orders
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
          <>
            <div className="grid gap-6 p-5 md:grid-cols-2 xl:grid-cols-3 sm:p-6">
              {paginatedAppointments.map((appointment) => {
              const displayedTotal =
                appointment.finalTotal ?? appointment.estimatedSubtotal;
              const handoffMethod =
                appointment.handoffMethod === "pickup_return"
                  ? "Pickup + return"
                  : appointment.handoffMethod === "drop_off"
                    ? "Customer drop-off"
                    : "Handoff pending";
              const handoffWindow =
                appointment.handoffWindow ??
                timeWindowName(appointment.preferredWindow);

                return (
                  <div
                    key={appointment.id}
                    className="flex min-w-0 flex-col drop-shadow-[0_18px_28px_rgba(0,0,0,0.34)]"
                  >
                  <div
                    aria-hidden="true"
                    className="h-3 shrink-0"
                    style={paperEdgeStyle}
                  />
                  <article
                    className="flex h-full flex-1 flex-col bg-[#f4eddd] font-mono text-[#2d2922] transition duration-200 hover:-translate-y-0.5"
                    style={{
                      backgroundImage:
                        "radial-gradient(rgba(91,76,48,0.09) 0.7px, transparent 0.7px)",
                      backgroundSize: "5px 5px",
                    }}
                  >
                    <header className="flex items-start justify-between gap-3 px-5 pb-4 pt-5">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 text-[#6f5638]">
                          <FaReceipt aria-hidden="true" />
                          <p className="text-[0.68rem] font-bold uppercase tracking-[0.15em]">
                            Work order
                          </p>
                        </div>
                        <p className="mt-2 text-xl font-black tracking-[0.12em] text-[#171511]">
                          {appointment.reference}
                        </p>
                      </div>
                      <span
                        className={`-rotate-2 border-2 px-2 py-1 font-sans text-[0.64rem] font-black uppercase tracking-[0.1em] ${statusStampClasses[appointment.status]}`}
                      >
                        {statusLabels[appointment.status]}
                      </span>
                    </header>

                    <section className="border-y-2 border-dashed border-[#a99f8d] px-5 py-4">
                      <h3 className="truncate font-sans text-lg font-black text-[#2d2922]">
                        {appointment.customerName}
                      </h3>
                      <p className="mt-1 font-sans text-sm font-semibold text-[#5f574b]">
                        {serviceName(appointment.service)}
                      </p>
                      <p className="mt-1 font-sans text-xs text-[#7a7163]">
                        {appointment.helmetCount}{" "}
                        {appointment.helmetCount === 1
                          ? "helmet"
                          : "helmets"}
                        {appointment.requestedAddOns.length > 0 &&
                          ` · ${appointment.requestedAddOns.length} ${
                            appointment.requestedAddOns.length === 1
                              ? "add-on"
                              : "add-ons"
                          }`}
                      </p>
                    </section>

                    <div className="flex-1 px-5 py-4">
                      <dl className="space-y-3 font-sans text-xs">
                        <div className="flex items-start gap-3">
                          <FaCalendarCheck
                            aria-hidden="true"
                            className="mt-0.5 shrink-0 text-[#8a4f1f]"
                          />
                          <div>
                            <dt className="font-bold uppercase tracking-[0.08em] text-[#7a7163]">
                              Handoff schedule
                            </dt>
                            <dd className="mt-1 font-semibold text-[#3f392f]">
                              {formatDate(appointment.preferredDate)}
                            </dd>
                            <dd className="mt-0.5 text-[#746b5d]">
                              {handoffWindow}
                            </dd>
                          </div>
                        </div>
                        <div className="flex items-start gap-3 border-t border-dotted border-[#bbb09e] pt-3">
                          <FaMotorcycle
                            aria-hidden="true"
                            className="mt-0.5 shrink-0 text-[#8a4f1f]"
                          />
                          <div>
                            <dt className="font-bold uppercase tracking-[0.08em] text-[#7a7163]">
                              Handoff
                            </dt>
                            <dd className="mt-1 font-semibold text-[#3f392f]">
                              {handoffMethod}
                            </dd>
                          </div>
                        </div>
                      </dl>

                      <div className="mt-4 flex items-end justify-between gap-4 border-t-2 border-[#4d463b] pt-4">
                        <div>
                          <p className="font-sans text-[0.68rem] font-black uppercase tracking-[0.1em] text-[#5f574b]">
                            {appointment.finalTotal === null
                              ? "Current subtotal"
                              : "Final total"}
                          </p>
                          <p className="mt-1 font-sans text-[0.7rem] text-[#857b6b]">
                            {appointment.deliveryDistanceKm === null
                              ? "Delivery distance pending"
                              : `${appointment.deliveryDistanceKm.toFixed(
                                  2
                                )} km delivery route`}
                          </p>
                        </div>
                        <p className="shrink-0 text-2xl font-black text-[#171511]">
                          {displayedTotal === null
                            ? "—"
                            : formatPeso(displayedTotal)}
                        </p>
                      </div>
                    </div>

                    <footer className="border-t-2 border-dashed border-[#a99f8d] px-5 py-4">
                      <button
                        type="button"
                        aria-haspopup="dialog"
                        onClick={() =>
                          setSelectedAppointmentId(appointment.id)
                        }
                        className="inline-flex min-h-11 w-full items-center justify-center gap-2 border-2 border-[#3f392f] bg-[#3f392f] px-4 py-2 font-sans text-sm font-black text-[#f4eddd] transition hover:bg-[#201d18] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#b96f2e]/20"
                      >
                        <FaEye aria-hidden="true" />
                        View details + manage
                      </button>
                    </footer>
                  </article>
                  <div
                    aria-hidden="true"
                    className="h-3 shrink-0 rotate-180"
                    style={paperEdgeStyle}
                  />
                  </div>
                );
              })}
            </div>

            <nav
              aria-label="Work ticket pages"
              className="flex flex-col gap-3 border-t border-white/[0.08] px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6"
            >
              <p className="text-sm text-stone-500">
                Page{" "}
                <span className="font-semibold text-stone-300">
                  {currentPage}
                </span>{" "}
                of{" "}
                <span className="font-semibold text-stone-300">
                  {totalPages}
                </span>
              </p>
              <div className="grid grid-cols-2 gap-2 sm:flex">
                <button
                  type="button"
                  disabled={currentPage === 1}
                  onClick={() =>
                    setPage((current) => Math.max(1, current - 1))
                  }
                  className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.035] px-4 text-sm font-semibold text-stone-300 transition hover:border-amber-300/30 hover:text-amber-200 disabled:cursor-not-allowed disabled:opacity-35"
                >
                  <FaChevronLeft aria-hidden="true" className="text-xs" />
                  Previous
                </button>
                <button
                  type="button"
                  disabled={currentPage === totalPages}
                  onClick={() =>
                    setPage((current) => Math.min(totalPages, current + 1))
                  }
                  className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.035] px-4 text-sm font-semibold text-stone-300 transition hover:border-amber-300/30 hover:text-amber-200 disabled:cursor-not-allowed disabled:opacity-35"
                >
                  Next
                  <FaChevronRight aria-hidden="true" className="text-xs" />
                </button>
              </div>
            </nav>
          </>
        )}
      </section>

      {selectedAppointment && (
        <BackofficeTicketModal
          appointment={selectedAppointment}
          isUpdatingStatus={updatingId === selectedAppointment.id}
          onClose={closeTicket}
          onStatusChange={(status) =>
            updateStatus(selectedAppointment.id, status)
          }
          onAppointmentSaved={replaceAppointment}
          onDetailsSave={(details) =>
            updateOrderDetails(selectedAppointment.id, details)
          }
        />
      )}
    </>
  );
}

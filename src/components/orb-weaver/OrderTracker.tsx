"use client";

import { type FormEvent, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  FaCalendarAlt,
  FaCheck,
  FaExternalLinkAlt,
  FaMapMarkedAlt,
  FaReceipt,
  FaSearch,
  FaSyncAlt,
  FaTimesCircle,
  FaTrashAlt,
} from "react-icons/fa";
import { OrderDetailsEditor } from "@/components/orb-weaver/OrderDetailsEditor";
import { ORB_WEAVER_MEETUP } from "@/lib/orb-weaver/location";
import {
  ORB_WEAVER_LEGACY_SERVICE_NAMES,
  ORB_WEAVER_SERVICES,
  ORB_WEAVER_TIME_WINDOWS,
  type OrbWeaverAppointmentStatus,
  type OrbWeaverEditableAppointmentDetails,
  type OrbWeaverOrderTicket,
} from "@/types/orb-weaver";

const statusOrder: Exclude<OrbWeaverAppointmentStatus, "CANCELLED">[] = [
  "PENDING",
  "CONFIRMED",
  "IN_PROGRESS",
  "READY",
  "COMPLETED",
];

const statusCopy: Record<
  OrbWeaverAppointmentStatus,
  { label: string; description: string }
> = {
  PENDING: {
    label: "Request received",
    description: "VroomBroom is reviewing your request.",
  },
  CONFIRMED: {
    label: "Booking confirmed",
    description: "Your schedule and booking details are confirmed.",
  },
  IN_PROGRESS: {
    label: "Cleaning in progress",
    description: "Your helmet is currently receiving its clean.",
  },
  READY: {
    label: "Ready for return",
    description: "Your helmet is clean and ready for its handoff.",
  },
  COMPLETED: {
    label: "Order completed",
    description: "This cleaning order has been completed.",
  },
  CANCELLED: {
    label: "Order cancelled",
    description: "This request is no longer active.",
  },
};

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
  windowId;

export function OrderTracker() {
  const searchParams = useSearchParams();
  const [reference, setReference] = useState(
    (searchParams.get("reference") ?? "").toUpperCase().slice(0, 8)
  );
  const [phone, setPhone] = useState("");
  const [ticket, setTicket] = useState<OrbWeaverOrderTicket | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [error, setError] = useState("");
  const [actionMessage, setActionMessage] = useState("");

  useEffect(() => {
    if (!reference || phone) {
      return;
    }

    try {
      const savedPhone = window.sessionStorage.getItem(
        `vroombroom-order-phone:${reference}`
      );

      if (savedPhone) {
        setPhone(savedPhone);
      }
    } catch {
      // The lookup form remains usable when session storage is unavailable.
    }
  }, [phone, reference]);

  const lookupOrder = async (event?: FormEvent<HTMLFormElement>) => {
    event?.preventDefault();
    setIsLoading(true);
    setError("");
    setActionMessage("");

    try {
      const response = await fetch("/api/orb-weaver/orders/lookup", {
        method: "POST",
        cache: "no-store",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reference, phone }),
      });
      const result = (await response.json()) as {
        ticket?: OrbWeaverOrderTicket;
        message?: string;
      };

      if (!response.ok || !result.ticket) {
        throw new Error(result.message || "Your order could not be loaded.");
      }

      setTicket(result.ticket);
    } catch (lookupError) {
      setTicket(null);
      setError(
        lookupError instanceof Error
          ? lookupError.message
          : "Your order could not be loaded."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const updatePendingOrder = async (
    details: OrbWeaverEditableAppointmentDetails
  ) => {
    const response = await fetch("/api/orb-weaver/orders/lookup", {
      method: "PATCH",
      cache: "no-store",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        reference,
        phone,
        action: "edit",
        details,
      }),
    });
    const result = (await response.json()) as {
      ticket?: OrbWeaverOrderTicket;
      message?: string;
    };

    if (!response.ok || !result.ticket) {
      throw new Error(result.message || "Your order could not be updated.");
    }

    setTicket(result.ticket);
    setPhone(result.ticket.phone);
    try {
      window.sessionStorage.setItem(
        `vroombroom-order-phone:${reference}`,
        result.ticket.phone
      );
    } catch {
      // The updated phone remains available for this rendered ticket.
    }
    setActionMessage("Your pending order details have been updated.");
  };

  const cancelPendingOrder = async () => {
    if (
      !window.confirm(
        "Cancel this pending order? VroomBroom will see it as cancelled immediately."
      )
    ) {
      return;
    }

    setIsCancelling(true);
    setError("");
    setActionMessage("");

    try {
      const response = await fetch("/api/orb-weaver/orders/lookup", {
        method: "PATCH",
        cache: "no-store",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reference, phone, action: "cancel" }),
      });
      const result = (await response.json()) as {
        ticket?: OrbWeaverOrderTicket;
        message?: string;
      };

      if (!response.ok || !result.ticket) {
        throw new Error(result.message || "Your order could not be cancelled.");
      }

      setTicket(result.ticket);
      setActionMessage("Your order has been cancelled.");
    } catch (cancelError) {
      setError(
        cancelError instanceof Error
          ? cancelError.message
          : "Your order could not be cancelled."
      );
    } finally {
      setIsCancelling(false);
    }
  };

  const activeStatusIndex =
    ticket && ticket.status !== "CANCELLED"
      ? statusOrder.indexOf(ticket.status)
      : -1;
  const selectedWindow = ticket
    ? ticket.handoffWindow ?? timeWindowName(ticket.preferredWindow)
    : "";

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mx-auto max-w-3xl drop-shadow-[0_24px_42px_rgba(0,0,0,0.4)]">
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
        <form
          onSubmit={lookupOrder}
          className="relative bg-[#f4eddd] font-mono text-[#2d2922]"
          style={{
            backgroundImage:
              "radial-gradient(rgba(91,76,48,0.09) 0.7px, transparent 0.7px)",
            backgroundSize: "5px 5px",
          }}
        >
          <header className="flex flex-col gap-4 px-5 pb-5 pt-6 sm:flex-row sm:items-start sm:justify-between sm:px-7">
            <div className="flex items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center border-2 border-[#5e574c] text-[#5e574c]">
                <FaReceipt aria-hidden="true" />
              </span>
              <div>
                <p className="font-sans text-[0.7rem] font-black uppercase tracking-[0.18em] text-[#8a4f1f]">
                  VroomBroom order lookup
                </p>
                <h2 className="mt-1 font-sans text-lg font-black text-[#201d18]">
                  Retrieve your cleaning ticket
                </h2>
                <p className="mt-1 font-sans text-xs leading-5 text-[#746b5d]">
                  Enter the same details printed on your booking receipt.
                </p>
              </div>
            </div>
            <span className="self-start border-2 border-[#9a5b24] px-2.5 py-1 font-sans text-[0.66rem] font-black uppercase tracking-[0.12em] text-[#8a4f1f] sm:-rotate-2">
              Customer claim
            </span>
          </header>

          <div className="border-y-2 border-dashed border-[#a99f8d] px-5 py-5 sm:px-7 sm:py-6">
            <div className="grid gap-4 sm:grid-cols-[0.8fr_1.2fr_auto] sm:items-end">
              <div>
                <label
                  htmlFor="order-reference"
                  className="mb-2 block font-sans text-xs font-black uppercase tracking-[0.1em] text-[#5f574b]"
                >
                  Order reference
                </label>
                <input
                  id="order-reference"
                  value={reference}
                  onChange={(event) =>
                    setReference(
                      event.target.value
                        .replace(/[^a-fA-F0-9]/g, "")
                        .toUpperCase()
                        .slice(0, 8)
                    )
                  }
                  required
                  minLength={8}
                  maxLength={8}
                  autoComplete="off"
                  placeholder="A1B2C3D4"
                  aria-describedby="order-reference-hint"
                  className="min-h-12 w-full border-2 border-[#a99f8d] bg-[#fffaf0]/65 px-3.5 py-2.5 text-base font-black uppercase tracking-[0.16em] text-[#201d18] outline-none transition placeholder:text-[#a09584] focus:border-[#8a4f1f] focus:ring-4 focus:ring-[#b96f2e]/10"
                />
                <p
                  id="order-reference-hint"
                  className="mt-1.5 font-sans text-[0.7rem] text-[#857b6b]"
                >
                  8-character receipt code
                </p>
              </div>
              <div>
                <label
                  htmlFor="order-phone"
                  className="mb-2 block font-sans text-xs font-black uppercase tracking-[0.1em] text-[#5f574b]"
                >
                  Mobile number
                </label>
                <input
                  id="order-phone"
                  type="tel"
                  value={phone}
                  onChange={(event) => setPhone(event.target.value)}
                  required
                  minLength={7}
                  maxLength={40}
                  autoComplete="tel"
                  placeholder="+63 9XX XXX XXXX"
                  aria-describedby="order-phone-hint"
                  className="min-h-12 w-full border-2 border-[#a99f8d] bg-[#fffaf0]/65 px-3.5 py-2.5 font-sans text-sm font-semibold text-[#201d18] outline-none transition placeholder:text-[#a09584] focus:border-[#8a4f1f] focus:ring-4 focus:ring-[#b96f2e]/10"
                />
                <p
                  id="order-phone-hint"
                  className="mt-1.5 font-sans text-[0.7rem] text-[#857b6b]"
                >
                  Same number used when booking
                </p>
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="inline-flex min-h-12 items-center justify-center gap-2 border-2 border-[#2d2922] bg-[#2d2922] px-5 py-2.5 font-sans text-sm font-black text-[#f4eddd] transition hover:border-[#8a4f1f] hover:bg-[#8a4f1f] disabled:cursor-wait disabled:opacity-60 sm:mb-[1.65rem]"
              >
                {isLoading ? (
                  <FaSyncAlt aria-hidden="true" className="animate-spin" />
                ) : (
                  <FaSearch aria-hidden="true" />
                )}
                {isLoading ? "Retrieving…" : "Retrieve ticket"}
              </button>
            </div>

            {error && (
              <p
                role="alert"
                className="mt-4 border-l-4 border-[#9b3b31] bg-[#9b3b31]/[0.07] px-4 py-3 font-sans text-sm font-semibold text-[#7d3028]"
              >
                {error}
              </p>
            )}
          </div>

          <footer className="flex flex-col gap-2 px-5 py-4 font-sans text-[0.7rem] text-[#746b5d] sm:flex-row sm:items-center sm:justify-between sm:px-7">
            <p>Both details must exactly match your booking.</p>
            <p className="uppercase tracking-[0.13em] text-[#918675]">
              Private lookup · Customer copy
            </p>
          </footer>
        </form>
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

      {ticket && (
        <>
          <div
            aria-live="polite"
            className="mx-auto mt-9 max-w-4xl drop-shadow-[0_32px_48px_rgba(0,0,0,0.48)]"
          >
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
              className="relative bg-[#f4eddd] font-mono text-[#2d2922]"
              style={{
                backgroundImage:
                  "radial-gradient(rgba(91,76,48,0.09) 0.7px, transparent 0.7px)",
                backgroundSize: "5px 5px",
              }}
            >
              <header className="px-5 pb-5 pt-6 sm:px-8 sm:pt-8">
                <div className="flex flex-col items-center text-center">
                  <div>
                    <p className="font-sans text-lg font-black uppercase tracking-[0.16em] text-[#201d18] sm:text-xl">
                      VroomBroom
                    </p>
                    <p className="mt-0.5 text-[0.66rem] uppercase tracking-[0.2em] text-[#746b5d]">
                      Live helmet care ticket
                    </p>
                  </div>
                  <span
                    className={`mt-3 inline-flex max-w-[13rem] -rotate-1 items-center justify-center border-2 px-4 py-1.5 text-center font-sans text-[0.68rem] font-black uppercase leading-4 tracking-[0.12em] sm:text-[0.72rem] ${
                      ticket.status === "CANCELLED"
                        ? "border-[#9b3b31] text-[#9b3b31]"
                        : ticket.status === "COMPLETED"
                          ? "border-[#2f6b4e] text-[#2f6b4e]"
                          : "border-[#9a5b24] text-[#8a4f1f]"
                    }`}
                  >
                    {statusCopy[ticket.status].label}
                  </span>
                </div>

                <div className="mt-6 border-y-2 border-dashed border-[#a99f8d] py-5 text-center">
                  <div className="flex flex-col items-center">
                    <p className="text-[0.68rem] font-bold uppercase tracking-[0.18em] text-[#746b5d]">
                      Order reference
                    </p>
                    <p className="mt-2 text-3xl font-black tracking-[0.16em] text-[#171511] sm:text-4xl">
                      {ticket.reference}
                    </p>
                    <p className="mt-2 font-sans text-sm font-bold text-[#3f392f]">
                      {ticket.customerName}
                    </p>
                    <div
                      aria-hidden="true"
                      className="mt-4 h-12 w-full max-w-[14rem] opacity-75"
                      style={{
                        backgroundImage:
                          "repeating-linear-gradient(90deg,#2d2922 0 2px,transparent 2px 4px,#2d2922 4px 5px,transparent 5px 8px,#2d2922 8px 11px,transparent 11px 13px)",
                      }}
                    />
                  </div>
                </div>

                <div className="mt-5 flex flex-col gap-3 font-sans sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <p className="text-[0.7rem] font-bold uppercase tracking-[0.14em] text-[#7a7163]">
                      Current status
                    </p>
                    <h2 className="mt-1 text-xl font-black text-[#26221c] sm:text-2xl">
                      {statusCopy[ticket.status].label}
                    </h2>
                    <p className="mt-1 max-w-xl text-xs leading-5 text-[#6b6255]">
                      {statusCopy[ticket.status].description}
                    </p>
                  </div>
                  <div className="shrink-0 text-left text-[0.7rem] leading-5 text-[#746b5d] sm:text-right">
                    <p>Issued {formatDateTime(ticket.createdAt)}</p>
                    <p>Updated {formatDateTime(ticket.updatedAt)}</p>
                  </div>
                </div>
              </header>

              <section
                aria-label="Order progress"
                className="border-t-2 border-dashed border-[#a99f8d] px-5 py-6 sm:px-8"
              >
                {ticket.status === "CANCELLED" ? (
                  <div className="flex items-start gap-3 border-2 border-[#a34a3d]/40 bg-[#a34a3d]/[0.06] p-4 font-sans">
                    <FaTimesCircle
                      aria-hidden="true"
                      className="mt-0.5 shrink-0 text-[#9b3b31]"
                    />
                    <div>
                      <p className="font-bold text-[#7d3028]">
                        This ticket has been cancelled
                      </p>
                      <p className="mt-1 text-xs leading-5 text-[#746b5d]">
                        Contact VroomBroom if you need help or submit a new
                        cleaning request.
                      </p>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="mb-5 flex items-center justify-between gap-4">
                      <p className="text-[0.7rem] font-bold uppercase tracking-[0.16em] text-[#746b5d]">
                        Cleaning journey
                      </p>
                      <p className="text-[0.68rem] font-bold text-[#8a4f1f]">
                        Step {activeStatusIndex + 1} of {statusOrder.length}
                      </p>
                    </div>
                    <ol className="relative grid grid-cols-5 gap-1">
                      <span
                        aria-hidden="true"
                        className="absolute left-[10%] right-[10%] top-3.5 h-px bg-[#c7bcaa]"
                      />
                      {statusOrder.map((status, index) => {
                        const isComplete = index < activeStatusIndex;
                        const isCurrent = index === activeStatusIndex;

                        return (
                          <li
                            key={status}
                            className="relative min-w-0 text-center"
                          >
                            <span
                              className={`relative z-10 mx-auto flex h-7 w-7 items-center justify-center rounded-full border-2 text-[0.7rem] font-black ${
                                isComplete
                                  ? "border-[#2f6b4e] bg-[#2f6b4e] text-[#f4eddd]"
                                  : isCurrent
                                    ? "border-[#8a4f1f] bg-[#f4eddd] text-[#8a4f1f] ring-4 ring-[#b96f2e]/15"
                                    : "border-[#b8ad9a] bg-[#f4eddd] text-[#a09584]"
                              }`}
                            >
                              {isComplete ? (
                                <FaCheck aria-hidden="true" />
                              ) : (
                                index + 1
                              )}
                            </span>
                            <span
                              className={`mx-auto mt-2 block max-w-[6rem] font-sans text-[0.64rem] font-bold leading-4 sm:text-[0.7rem] ${
                                isComplete || isCurrent
                                  ? "text-[#3f392f]"
                                  : "text-[#9a9080]"
                              }`}
                            >
                              {statusCopy[status].label}
                            </span>
                          </li>
                        );
                      })}
                    </ol>
                  </>
                )}
              </section>

              <div className="grid border-t-2 border-dashed border-[#a99f8d] lg:grid-cols-[0.9fr_1.1fr]">
                <div className="px-5 py-6 sm:px-8 lg:border-r-2 lg:border-dashed lg:border-[#a99f8d]">
                  <div className="flex items-center gap-2 text-[#6f5638]">
                    <FaCalendarAlt aria-hidden="true" />
                    <h3 className="text-[0.72rem] font-bold uppercase tracking-[0.15em]">
                      Handoff details
                    </h3>
                  </div>
                  <p className="mt-4 font-sans text-base font-black text-[#2d2922]">
                    {formatDate(ticket.preferredDate)}
                  </p>
                  <dl className="mt-4 space-y-2.5 text-[0.75rem]">
                    <div className="flex justify-between gap-4 border-b border-dotted border-[#c8bdab] pb-2">
                      <dt className="text-[#7a7163]">
                        {ticket.handoffMethod === "pickup_return"
                          ? "Pickup"
                          : "Drop-off"}
                      </dt>
                      <dd className="text-right font-bold text-[#3f392f]">
                        {selectedWindow}
                      </dd>
                    </div>
                    {ticket.completionWindow && (
                      <div className="flex justify-between gap-4 border-b border-dotted border-[#c8bdab] pb-2">
                        <dt className="text-[#7a7163]">
                          {ticket.handoffMethod === "pickup_return"
                            ? "Return"
                            : "Claim"}
                        </dt>
                        <dd className="text-right font-bold text-[#3f392f]">
                          {ticket.completionWindow}
                        </dd>
                      </div>
                    )}
                    <div className="flex justify-between gap-4">
                      <dt className="text-[#7a7163]">Method</dt>
                      <dd className="max-w-[13rem] text-right font-bold text-[#3f392f]">
                        {ticket.handoffMethod === "pickup_return"
                          ? "Pickup + return"
                          : "Customer drop-off + return"}
                      </dd>
                    </div>
                  </dl>
                  {ticket.pickupArea && (
                    <p className="mt-4 border-l-2 border-[#a99f8d] pl-3 font-sans text-[0.75rem] leading-5 text-[#6b6255]">
                      {ticket.pickupArea}
                    </p>
                  )}
                  {ticket.handoffMethod === "drop_off" && (
                    <p className="mt-4 border-l-2 border-[#a99f8d] pl-3 font-sans text-[0.75rem] leading-5 text-[#6b6255]">
                      {ORB_WEAVER_MEETUP.name} · {ORB_WEAVER_MEETUP.label}
                    </p>
                  )}

                  <div className="mt-7 border-t-2 border-dashed border-[#a99f8d] pt-5">
                    <div className="flex items-center gap-2 text-[#6f5638]">
                      <FaMapMarkedAlt aria-hidden="true" />
                      <h3 className="text-[0.72rem] font-bold uppercase tracking-[0.15em]">
                        Delivery distance
                      </h3>
                    </div>
                    {ticket.deliveryDistanceKm !== null ? (
                      <>
                        <div className="mt-4 flex items-end justify-between gap-4">
                          <p className="font-sans text-2xl font-black text-[#2d2922]">
                            {ticket.deliveryDistanceKm.toFixed(2)} km
                          </p>
                          <span className="text-[0.66rem] uppercase tracking-[0.1em] text-[#7a7163]">
                            One-way route
                          </span>
                        </div>
                        {ticket.deliveryProofUrl && (
                          <a
                            href={ticket.deliveryProofUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="mt-4 inline-flex min-h-10 w-full items-center justify-center gap-2 border-2 border-[#5e574c] px-3 py-2 font-sans text-[0.75rem] font-bold text-[#3f392f] transition hover:bg-[#3f392f] hover:text-[#f4eddd]"
                          >
                            <FaExternalLinkAlt aria-hidden="true" />
                            View Google Maps route proof
                          </a>
                        )}
                      </>
                    ) : (
                      <>
                        <p className="mt-4 font-sans text-sm font-bold text-[#3f392f]">
                          Awaiting route confirmation
                        </p>
                        <p className="mt-1 font-sans text-[0.75rem] leading-5 text-[#746b5d]">
                          Distance and delivery pricing will appear here after
                          VroomBroom checks the route.
                        </p>
                      </>
                    )}
                  </div>
                </div>

                <section className="border-t-2 border-dashed border-[#a99f8d] px-5 py-6 sm:px-8 lg:border-t-0">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-2 text-[#6f5638]">
                      <FaReceipt aria-hidden="true" />
                      <h3 className="text-[0.72rem] font-bold uppercase tracking-[0.15em]">
                        Order receipt
                      </h3>
                    </div>
                    <span className="text-[0.66rem] uppercase tracking-[0.12em] text-[#897f6e]">
                      Amount
                    </span>
                  </div>

                  <div className="mt-5 space-y-3 text-xs">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="font-bold text-[#2d2922]">
                          {serviceName(ticket.service)}
                        </p>
                        <p className="mt-0.5 text-[0.72rem] text-[#746b5d]">
                          {ticket.helmetCount}{" "}
                          {ticket.helmetCount === 1 ? "helmet" : "helmets"}
                          {ticket.serviceUnitPrice !== null &&
                            ` @ ${formatPeso(ticket.serviceUnitPrice)}`}
                        </p>
                      </div>
                      <p className="shrink-0 font-bold text-[#2d2922]">
                        {ticket.serviceUnitPrice !== null
                          ? formatPeso(
                              ticket.serviceUnitPrice * ticket.helmetCount
                            )
                          : "—"}
                      </p>
                    </div>

                    {ticket.requestedAddOns.map((addOn) => (
                      <div
                        key={addOn.id}
                        className="flex items-start justify-between gap-4"
                      >
                        <div>
                          <p className="text-[#5f574b]">{addOn.name}</p>
                          {addOn.quantity > 1 && (
                            <p className="mt-0.5 text-[0.7rem] text-[#8a8172]">
                              {addOn.quantity} ×{" "}
                              {formatPeso(addOn.unitPrice)}
                            </p>
                          )}
                        </div>
                        <p className="shrink-0 text-[#3d382f]">
                          {formatPeso(addOn.subtotal)}
                        </p>
                      </div>
                    ))}

                    <div className="flex items-center justify-between gap-4 border-t border-dotted border-[#aaa08e] pt-3">
                      <p className="text-[#746b5d]">Cleaning subtotal</p>
                      <p className="font-bold text-[#3d382f]">
                        {ticket.estimatedSubtotal !== null
                          ? formatPeso(ticket.estimatedSubtotal)
                          : "—"}
                      </p>
                    </div>
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-[#746b5d]">Delivery</p>
                        <p className="mt-0.5 text-[0.7rem] text-[#8a8172]">
                          {ticket.deliveryDistanceKm !== null
                            ? `${ticket.deliveryDistanceKm.toFixed(2)} km route`
                            : "Distance not confirmed"}
                        </p>
                      </div>
                      <p className="font-bold text-[#3d382f]">
                        {ticket.deliveryFee !== null
                          ? ticket.deliveryFee === 0
                            ? "Free"
                            : formatPeso(ticket.deliveryFee)
                          : "Pending"}
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 border-y-2 border-[#4d463b] py-4">
                    <div className="flex items-end justify-between gap-4">
                      <div>
                        <p className="font-sans text-[0.75rem] font-black uppercase tracking-[0.1em] text-[#2d2922]">
                          {ticket.finalTotal !== null
                            ? "Confirmed total"
                            : "Current subtotal"}
                        </p>
                        <p className="mt-1 max-w-[14rem] font-sans text-[0.7rem] leading-5 text-[#746b5d]">
                          {ticket.finalTotal !== null
                            ? "Delivery is included in this final amount."
                            : "Final total updates after the route check."}
                        </p>
                      </div>
                      <p className="shrink-0 text-2xl font-black text-[#171511] sm:text-3xl">
                        {ticket.finalTotal !== null
                          ? formatPeso(ticket.finalTotal)
                          : ticket.estimatedSubtotal !== null
                            ? formatPeso(ticket.estimatedSubtotal)
                            : "—"}
                      </p>
                    </div>
                  </div>

                  {ticket.notes && (
                    <div className="mt-5">
                      <p className="text-[0.68rem] font-bold uppercase tracking-[0.13em] text-[#7a7163]">
                        Customer note
                      </p>
                      <p className="mt-2 whitespace-pre-wrap font-sans text-[0.75rem] leading-5 text-[#5f574b]">
                        {ticket.notes}
                      </p>
                    </div>
                  )}
                </section>
              </div>

              {ticket.status === "PENDING" && (
                <section className="border-t-2 border-dashed border-[#a99f8d] px-5 py-6 sm:px-8">
                  <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                    <div className="font-sans">
                      <div className="flex items-center gap-2">
                        <span className="border-2 border-[#9a5b24] px-2 py-0.5 text-[0.66rem] font-black uppercase tracking-[0.12em] text-[#8a4f1f]">
                          Changes allowed
                        </span>
                        <span className="text-[0.66rem] uppercase tracking-[0.12em] text-[#8a8172]">
                          While pending
                        </span>
                      </div>
                      <h3 className="mt-3 text-base font-black text-[#2d2922]">
                        Need to update this ticket?
                      </h3>
                      <p className="mt-1 max-w-xl text-[0.75rem] leading-5 text-[#746b5d]">
                        Edit your contact, service, schedule, handoff, or notes.
                        This section locks automatically once VroomBroom
                        confirms the order.
                      </p>
                    </div>
                    <div className="flex shrink-0 flex-col gap-2 sm:min-w-44">
                      <OrderDetailsEditor
                        key={ticket.updatedAt}
                        appointment={ticket}
                        mode="customer"
                        onSave={updatePendingOrder}
                      />
                      <button
                        type="button"
                        disabled={isCancelling}
                        onClick={() => void cancelPendingOrder()}
                        className="inline-flex min-h-10 items-center justify-center gap-2 border-2 border-[#9b3b31] px-4 py-2 font-sans text-xs font-bold text-[#8b342b] transition hover:bg-[#9b3b31] hover:text-[#f4eddd] disabled:cursor-wait disabled:opacity-60"
                      >
                        <FaTrashAlt aria-hidden="true" />
                        {isCancelling ? "Cancelling…" : "Cancel order"}
                      </button>
                    </div>
                  </div>
                  {actionMessage && (
                    <p
                      role="status"
                      className="mt-5 border-l-4 border-[#2f6b4e] bg-[#2f6b4e]/[0.07] px-4 py-3 font-sans text-xs font-semibold text-[#2f6b4e]"
                    >
                      {actionMessage}
                    </p>
                  )}
                </section>
              )}

              <footer className="border-t-2 border-dashed border-[#a99f8d] px-5 py-5 sm:px-8">
                <div className="flex flex-col gap-4 font-sans sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-xs font-bold text-[#514b41]">
                      Keep this ticket for your records.
                    </p>
                    <p className="mt-1 text-[0.7rem] leading-5 text-[#857b6b]">
                      Your mobile number remains private and is used only to
                      retrieve this order.
                    </p>
                  </div>
                  <button
                    type="button"
                    disabled={isLoading}
                    onClick={() => void lookupOrder()}
                    className="inline-flex min-h-10 shrink-0 items-center justify-center gap-2 border-2 border-[#5e574c] px-4 py-2 text-xs font-bold text-[#3f392f] transition hover:bg-[#3f392f] hover:text-[#f4eddd] disabled:cursor-wait disabled:opacity-60"
                  >
                    <FaSyncAlt
                      aria-hidden="true"
                      className={isLoading ? "animate-spin" : ""}
                    />
                    Refresh ticket
                  </button>
                </div>
                <p className="mt-5 text-center text-[0.64rem] uppercase tracking-[0.18em] text-[#918675]">
                  Thank you for riding fresh · Customer copy
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

          {actionMessage && ticket.status !== "PENDING" && (
            <p
              role="status"
              className="mx-auto mt-5 max-w-4xl rounded-xl border border-emerald-300/15 bg-emerald-300/[0.06] px-5 py-3 text-sm text-emerald-200"
            >
              {actionMessage}
            </p>
          )}
        </>
      )}
    </div>
  );
}

import type { RefObject } from "react";
import { FaCheckCircle, FaReceipt } from "react-icons/fa";
import { PendingNavigationLink } from "@/components/orb-weaver/PendingNavigationLink";
import { formatCurrency } from "@/lib/common/formatters";
import { ORB_WEAVER_MEETUP } from "@/lib/orb-weaver/location";
import {
  ORB_WEAVER_ADD_ONS,
  type OrbWeaverTimeWindow,
  type ORB_WEAVER_SERVICES,
} from "@/types/orb-weaver";
import { formatReviewDate, type ReviewValues } from "./types";

interface BookingReceiptProps {
  reference: string;
  message: string;
  reviewValues: ReviewValues;
  selectedServiceDetails: (typeof ORB_WEAVER_SERVICES)[number] | undefined;
  helmetCount: number;
  selectedAddOns: string[];
  selectedTimeWindow:
    | {
        id: OrbWeaverTimeWindow;
        shortName: string;
      }
    | undefined;
  handoff: "drop_off" | "pickup_return";
  estimatedSubtotal: number;
  onStartOver: () => void;
  feedbackRef: RefObject<HTMLDivElement | null>;
}

export function BookingReceipt({
  reference,
  message,
  reviewValues,
  selectedServiceDetails,
  helmetCount,
  selectedAddOns,
  selectedTimeWindow,
  handoff,
  estimatedSubtotal,
  onStartOver,
  feedbackRef,
}: BookingReceiptProps) {
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
                {reference}
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
                      ` @ ${formatCurrency(selectedServiceDetails.price)}`}
                  </p>
                </div>
                <p className="shrink-0 font-bold text-[#2d2922]">
                  {selectedServiceDetails
                    ? formatCurrency(selectedServiceDetails.price * helmetCount)
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
                      {formatCurrency(addOn.price * quantity)}
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
                  {formatCurrency(estimatedSubtotal)}
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
        {message}
      </p>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:justify-center">
        <PendingNavigationLink
          href={`/vroombroom/orders?reference=${reference}`}
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
          onClick={onStartOver}
          className="inline-flex min-h-11 items-center justify-center rounded-xl border border-amber-300/25 bg-amber-300/[0.07] px-5 py-2.5 text-sm font-semibold text-amber-200 transition hover:bg-amber-300/15"
        >
          Make another request
        </button>
      </div>
    </div>
  );
}

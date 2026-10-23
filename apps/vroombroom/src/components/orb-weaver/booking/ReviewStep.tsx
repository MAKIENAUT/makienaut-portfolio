import {
  FaEdit,
  FaEnvelope,
  FaExternalLinkAlt,
  FaMapMarkerAlt,
  FaPhoneAlt,
  FaReceipt,
} from "react-icons/fa";
import {
  ORB_WEAVER_ADD_ONS,
  type OrbWeaverServiceId,
  type OrbWeaverTimeWindow,
  type ORB_WEAVER_SERVICES,
} from "@/types/orb-weaver";
import { formatCurrency } from "@/lib/common/formatters";
import {
  getOrbWeaverPickupMapUrl,
  ORB_WEAVER_MEETUP,
  type OrbWeaverGeoPoint,
} from "@/lib/orb-weaver/location";
import {
  formatReviewDate,
  inputClasses,
  labelClasses,
  type ReviewValues,
} from "./types";

interface ReviewStepProps {
  hidden: boolean;
  reviewValues: ReviewValues;
  selectedService: OrbWeaverServiceId | "";
  selectedServiceDetails: (typeof ORB_WEAVER_SERVICES)[number] | undefined;
  helmetCount: number;
  selectedAddOns: string[];
  selectedTimeWindow:
    | {
        id: OrbWeaverTimeWindow;
        shortName: string;
        completionTime: string;
      }
    | undefined;
  handoff: "drop_off" | "pickup_return";
  pickupLocation: OrbWeaverGeoPoint | null;
  estimatedSubtotal: number;
  onGoToStep: (stepIndex: number) => void;
  isAddOnIncluded: (
    addOn: (typeof ORB_WEAVER_ADD_ONS)[number],
    serviceId: OrbWeaverServiceId | ""
  ) => boolean;
}

export function ReviewStep({
  hidden,
  reviewValues,
  selectedService,
  selectedServiceDetails,
  helmetCount,
  selectedAddOns,
  selectedTimeWindow,
  handoff,
  pickupLocation,
  estimatedSubtotal,
  onGoToStep,
  isAddOnIncluded,
}: ReviewStepProps) {
  return (
    <div data-form-step="3" hidden={hidden}>
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
              onClick={() => onGoToStep(0)}
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
              onClick={() => onGoToStep(1)}
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
                  ` · ${helmetCount} × ${formatCurrency(
                    selectedServiceDetails.price
                  )}`}
              </span>
              <span className="shrink-0 text-stone-200">
                {selectedServiceDetails
                  ? formatCurrency(selectedServiceDetails.price * helmetCount)
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
                      ` · ${quantity} × ${formatCurrency(addOn.price)}`}
                  </span>
                  <span className="shrink-0 text-stone-200">
                    {formatCurrency(addOn.price * quantity)}
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
              onClick={() => onGoToStep(2)}
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
                ? formatCurrency(estimatedSubtotal)
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
              ? formatCurrency(estimatedSubtotal)
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
  );
}

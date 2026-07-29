"use client";

import { type FormEvent, useMemo, useState } from "react";
import {
  FaCalculator,
  FaCheckCircle,
  FaExternalLinkAlt,
  FaMapMarkedAlt,
} from "react-icons/fa";
import {
  getOrbWeaverDeliveryQuote,
  ORB_WEAVER_EXCESS_DELIVERY_RATE_PER_KM,
  ORB_WEAVER_INCLUDED_DELIVERY_DISTANCE_KM,
  ORB_WEAVER_MAX_DELIVERY_DISTANCE_KM,
} from "@/lib/orb-weaver/delivery-pricing";
import type { OrbWeaverAppointmentRecord } from "@/types/orb-weaver";

interface DeliveryPricingEditorProps {
  appointment: OrbWeaverAppointmentRecord;
  onSaved: (appointment: OrbWeaverAppointmentRecord) => void;
}

const formatPeso = (amount: number) =>
  new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    maximumFractionDigits: 0,
  }).format(amount);

export function DeliveryPricingEditor({
  appointment,
  onSaved,
}: DeliveryPricingEditorProps) {
  const [distanceKm, setDistanceKm] = useState(
    appointment.deliveryDistanceKm?.toString() ?? ""
  );
  const [proofUrl, setProofUrl] = useState(
    appointment.deliveryProofUrl ?? ""
  );
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [isSaved, setIsSaved] = useState(false);
  const numericDistance = Number(distanceKm);
  const quote = useMemo(
    () =>
      getOrbWeaverDeliveryQuote({
        distanceKm: numericDistance,
        handoffMethod: appointment.handoffMethod,
        helmetCount: appointment.helmetCount,
      }),
    [appointment.handoffMethod, appointment.helmetCount, numericDistance]
  );
  const quotedTotal =
    quote && appointment.estimatedSubtotal !== null
      ? appointment.estimatedSubtotal + quote.fee
      : null;

  const savePricing = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSaving(true);
    setError("");
    setIsSaved(false);

    try {
      const response = await fetch(
        `/api/orb-weaver/backoffice/appointments/${appointment.id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            deliveryDistanceKm: numericDistance,
            deliveryProofUrl: proofUrl,
          }),
        }
      );
      const result = (await response.json()) as {
        appointment?: OrbWeaverAppointmentRecord;
        message?: string;
      };

      if (!response.ok || !result.appointment) {
        throw new Error(result.message || "Delivery pricing could not be saved.");
      }

      onSaved(result.appointment);
      setDistanceKm(result.appointment.deliveryDistanceKm?.toString() ?? "");
      setProofUrl(result.appointment.deliveryProofUrl ?? "");
      setIsSaved(true);
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : "Delivery pricing could not be saved."
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form
      onSubmit={savePricing}
      className="rounded-xl border border-white/[0.08] bg-black/20 p-3.5"
    >
      <div className="flex items-center gap-2">
        <FaCalculator aria-hidden="true" className="text-amber-300" />
        <h4 className="text-xs font-semibold uppercase tracking-[0.14em] text-stone-300">
          Delivery pricing
        </h4>
      </div>

      <div className="mt-3">
        <label
          htmlFor={`distance-${appointment.id}`}
          className="mb-1.5 block text-xs text-stone-500"
        >
          One-way Google Maps distance
        </label>
        <div className="relative">
          <input
            id={`distance-${appointment.id}`}
            type="number"
            value={distanceKm}
            onChange={(event) => {
              setDistanceKm(event.target.value);
              setIsSaved(false);
            }}
            required
            min="0.01"
            max={ORB_WEAVER_MAX_DELIVERY_DISTANCE_KM}
            step="0.01"
            inputMode="decimal"
            placeholder="e.g. 4.80"
            className="min-h-10 w-full rounded-lg border border-white/10 bg-black/40 py-2 pl-3 pr-11 text-sm text-white outline-none placeholder:text-stone-700 focus:border-amber-300 focus:ring-2 focus:ring-amber-300/20"
          />
          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-stone-500">
            km
          </span>
        </div>
      </div>

      <div className="mt-3">
        <label
          htmlFor={`proof-${appointment.id}`}
          className="mb-1.5 block text-xs text-stone-500"
        >
          Google Maps route proof
        </label>
        <input
          id={`proof-${appointment.id}`}
          type="url"
          value={proofUrl}
          onChange={(event) => {
            setProofUrl(event.target.value);
            setIsSaved(false);
          }}
          required
          maxLength={600}
          placeholder="https://maps.app.goo.gl/…"
          className="min-h-10 w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-xs text-white outline-none placeholder:text-stone-700 focus:border-amber-300 focus:ring-2 focus:ring-amber-300/20"
        />
      </div>

      <div className="mt-3 rounded-lg border border-white/[0.07] bg-white/[0.025] p-3 text-xs">
        {quote ? (
          <>
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-medium text-stone-200">{quote.label}</p>
                <p className="mt-0.5 text-[11px] leading-4 text-stone-500">
                  {quote.distanceKm.toFixed(2)} km one-way route
                </p>
              </div>
              <span className="rounded-full border border-amber-300/20 bg-amber-300/10 px-2 py-1 text-[11px] font-semibold text-amber-200">
                Calculated
              </span>
            </div>
            <div className="mt-3 flex items-center justify-between gap-3 text-stone-400">
              <span>Base delivery tier</span>
              <span className="font-medium text-stone-200">
                {quote.baseFee === 0 ? "Free" : formatPeso(quote.baseFee)}
              </span>
            </div>
            {quote.excessDistanceKm > 0 && (
              <div className="mt-1.5 flex items-start justify-between gap-3 text-stone-400">
                <span>
                  {quote.excessDistanceKm.toFixed(2)} km beyond{" "}
                  {ORB_WEAVER_INCLUDED_DELIVERY_DISTANCE_KM} km
                  <span className="block text-[11px] text-stone-600">
                    × {formatPeso(ORB_WEAVER_EXCESS_DELIVERY_RATE_PER_KM)}/km
                  </span>
                </span>
                <span className="font-medium text-stone-200">
                  {formatPeso(quote.excessFee)}
                </span>
              </div>
            )}
            <div className="mt-2 flex items-center justify-between gap-3 border-t border-dashed border-white/10 pt-2 text-stone-400">
              <span>Delivery fee</span>
              <span className="font-semibold text-amber-200">
                {quote.fee === 0 ? "Free" : formatPeso(quote.fee)}
              </span>
            </div>
            <div className="mt-1.5 flex items-center justify-between gap-3 text-stone-400">
              <span>Final total</span>
              <span className="font-semibold text-white">
                {quotedTotal === null
                  ? "Base price unavailable"
                  : formatPeso(quotedTotal)}
              </span>
            </div>
          </>
        ) : (
          <p className="leading-5 text-stone-600">
            Enter the one-way Google Maps distance to calculate the fee.
            Distances beyond {ORB_WEAVER_INCLUDED_DELIVERY_DISTANCE_KM} km add
            ₱{ORB_WEAVER_EXCESS_DELIVERY_RATE_PER_KM} per excess kilometer.
          </p>
        )}
      </div>

      {error && (
        <p role="alert" className="mt-3 text-xs leading-5 text-red-300">
          {error}
        </p>
      )}

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <button
          type="submit"
          disabled={isSaving || !quote}
          className="inline-flex min-h-10 flex-1 items-center justify-center gap-2 rounded-lg bg-amber-400 px-3 py-2 text-xs font-semibold text-black transition hover:bg-amber-300 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSaving ? (
            <span
              aria-hidden="true"
              className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-black border-r-transparent"
            />
          ) : (
            <FaMapMarkedAlt aria-hidden="true" />
          )}
          {isSaving ? "Saving…" : "Save distance + total"}
        </button>
        {appointment.deliveryProofUrl && (
          <a
            href={appointment.deliveryProofUrl}
            target="_blank"
            rel="noreferrer"
            aria-label="Open saved Google Maps route proof"
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 text-stone-400 transition hover:border-amber-300/30 hover:text-amber-200"
          >
            <FaExternalLinkAlt aria-hidden="true" />
          </a>
        )}
      </div>

      {isSaved && (
        <p
          role="status"
          className="mt-2 flex items-center gap-1.5 text-xs text-emerald-300"
        >
          <FaCheckCircle aria-hidden="true" />
          Customer ticket updated
        </p>
      )}
    </form>
  );
}

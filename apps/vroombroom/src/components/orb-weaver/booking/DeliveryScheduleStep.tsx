"use client";

import dynamic from "next/dynamic";
import { FaMotorcycle, FaStore } from "react-icons/fa";
import { BookingSchedulePicker } from "@/components/orb-weaver/BookingSchedulePicker";
import type { OrbWeaverGeoPoint } from "@/lib/orb-weaver/location";
import type { OrbWeaverTimeWindow } from "@/types/orb-weaver";
import { inputClasses, labelClasses } from "./types";

const CustomerLocationPicker = dynamic(
  () =>
    import("@/components/orb-weaver/CustomerLocationPicker").then(
      (module) => module.CustomerLocationPicker
    ),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-48 items-center justify-center rounded-2xl border border-white/10 bg-black/20 text-sm text-stone-500 sm:h-56">
        Loading pickup map…
      </div>
    ),
  }
);

interface DeliveryScheduleStepProps {
  hidden: boolean;
  handoff: "drop_off" | "pickup_return";
  onHandoffChange: (handoff: "drop_off" | "pickup_return") => void;
  preferredDate: string;
  onPreferredDateChange: (date: string) => void;
  preferredWindow: OrbWeaverTimeWindow | "";
  onPreferredWindowChange: (window: OrbWeaverTimeWindow | "") => void;
  scheduleError: string;
  minimumDate: string;
  pickupLocation: OrbWeaverGeoPoint | null;
  onPickupLocationChange: (location: OrbWeaverGeoPoint | null) => void;
  pickupLocationError: string;
  currentStep: number;
}

export function DeliveryScheduleStep({
  hidden,
  handoff,
  onHandoffChange,
  preferredDate,
  onPreferredDateChange,
  preferredWindow,
  onPreferredWindowChange,
  scheduleError,
  minimumDate,
  pickupLocation,
  onPickupLocationChange,
  pickupLocationError,
  currentStep,
}: DeliveryScheduleStepProps) {
  return (
    <div data-form-step="2" hidden={hidden}>
      <fieldset>
        <legend className={labelClasses}>Handoff method</legend>
        <div className="grid gap-2.5 sm:grid-cols-2">
          <label
            className={`cursor-pointer rounded-xl border p-3 transition ${
              handoff === "drop_off"
                ? "border-amber-300 bg-amber-300/10"
                : "border-white/10 bg-black/20 hover:border-amber-300/35"
            }`}
          >
            <input
              type="radio"
              name="handoff"
              value="drop_off"
              checked={handoff === "drop_off"}
              onChange={() => onHandoffChange("drop_off")}
              className="sr-only"
            />
            <span className="flex items-start gap-2.5">
              <FaStore
                aria-hidden="true"
                className="mt-0.5 shrink-0 text-amber-300"
              />
              <span>
                <span className="block text-sm font-semibold text-white">
                  I&apos;ll drop it off
                </span>
                <span className="mt-0.5 block text-[0.7rem] leading-4 text-stone-500">
                  Belton Drive · in front of SM Hypermarket Novaliches
                </span>
              </span>
            </span>
          </label>

          <label
            className={`cursor-pointer rounded-xl border p-3 transition ${
              handoff === "pickup_return"
                ? "border-amber-300 bg-amber-300/10"
                : "border-white/10 bg-black/20 hover:border-amber-300/35"
            }`}
          >
            <input
              type="radio"
              name="handoff"
              value="pickup_return"
              checked={handoff === "pickup_return"}
              onChange={() => onHandoffChange("pickup_return")}
              className="sr-only"
            />
            <span className="flex items-start gap-2.5">
              <FaMotorcycle
                aria-hidden="true"
                className="mt-0.5 shrink-0 text-amber-300"
              />
              <span>
                <span className="block text-sm font-semibold text-white">
                  Pickup + return
                </span>
                <span className="mt-0.5 block text-[0.7rem] leading-4 text-stone-500">
                  From ₱30; free for 2+ helmets within 10 km
                </span>
              </span>
            </span>
          </label>
        </div>
      </fieldset>

      <div id="orb-booking-schedule" tabIndex={-1}>
        <BookingSchedulePicker
          error={scheduleError}
          handoffMethod={handoff}
          minimumDate={minimumDate}
          selectedDate={preferredDate}
          selectedWindow={preferredWindow}
          onDateChange={onPreferredDateChange}
          onWindowChange={onPreferredWindowChange}
        />
      </div>

      {handoff === "pickup_return" && currentStep >= 2 && (
        <div className="mt-4">
          <CustomerLocationPicker
            compact
            value={pickupLocation}
            error={pickupLocationError}
            onChange={onPickupLocationChange}
          />

          <div className="mt-4">
            <label htmlFor="orb-pickup-area" className={labelClasses}>
              Address or nearby landmark{" "}
              <span className="text-stone-500">(optional)</span>
            </label>
            <input
              id="orb-pickup-area"
              name="pickupArea"
              type="text"
              maxLength={180}
              autoComplete="street-address"
              placeholder="House/building, street, barangay, or landmark"
              className={inputClasses}
            />
          </div>
        </div>
      )}
    </div>
  );
}

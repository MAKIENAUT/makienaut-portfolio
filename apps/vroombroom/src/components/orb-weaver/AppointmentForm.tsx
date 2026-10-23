"use client";

import { FaArrowLeft, FaArrowRight } from "react-icons/fa";
import { PendingNavigationLink } from "@/components/orb-weaver/PendingNavigationLink";
import { CustomerStep } from "@/components/orb-weaver/booking/CustomerStep";
import { ServiceStep } from "@/components/orb-weaver/booking/ServiceStep";
import { DeliveryScheduleStep } from "@/components/orb-weaver/booking/DeliveryScheduleStep";
import { ReviewStep } from "@/components/orb-weaver/booking/ReviewStep";
import { BookingReceipt } from "@/components/orb-weaver/booking/BookingReceipt";
import { BookingProgressBar } from "@/components/orb-weaver/booking/BookingProgressBar";
import { useBookingForm } from "@/components/orb-weaver/booking/useBookingForm";
import type { AppointmentFormProps } from "@/components/orb-weaver/booking/types";

export function AppointmentForm({ initialServiceId }: AppointmentFormProps) {
  const {
    steps,
    currentStep,
    setCurrentStep,
    formState,
    selectedService,
    helmetCount,
    setHelmetCount,
    selectedAddOns,
    handoff,
    pickupLocation,
    pickupLocationError,
    preferredDate,
    preferredWindow,
    scheduleError,
    reviewValues,
    minimumDate,
    selectedServiceDetails,
    selectedTimeWindow,
    estimatedSubtotal,
    selectService,
    toggleAddOn,
    isAddOnIncluded,
    handleHandoffChange,
    handleDateChange,
    handleWindowChange,
    handlePickupLocationChange,
    goToNextStep,
    goToPreviousStep,
    startOver,
    handleSubmit,
    formRef,
    stepHeadingRef,
    feedbackRef,
  } = useBookingForm({ initialServiceId });

  if (formState.status === "success") {
    return (
      <BookingReceipt
        reference={formState.reference}
        message={formState.message}
        reviewValues={reviewValues}
        selectedServiceDetails={selectedServiceDetails}
        helmetCount={helmetCount}
        selectedAddOns={selectedAddOns}
        selectedTimeWindow={selectedTimeWindow}
        handoff={handoff}
        estimatedSubtotal={estimatedSubtotal}
        onStartOver={startOver}
        feedbackRef={feedbackRef}
      />
    );
  }

  return (
    <form
      ref={formRef}
      onSubmit={handleSubmit}
      noValidate
      className="overflow-hidden rounded-[1.75rem] border border-amber-300/15 bg-[#10110f]/95 shadow-[0_24px_80px_rgba(0,0,0,0.4)]"
    >
      <BookingProgressBar
        steps={steps}
        currentStep={currentStep}
        onStepClick={(index) => index < currentStep && setCurrentStep(index)}
      />

      <div className="px-5 pb-2 pt-5 sm:px-6">
        <h2
          ref={stepHeadingRef}
          tabIndex={-1}
          className="text-xl font-semibold text-white outline-none sm:text-2xl"
        >
          {steps[currentStep].title}
        </h2>
        <p className="mt-1.5 text-sm leading-6 text-stone-400">
          {steps[currentStep].description}
        </p>
      </div>

      <div className="px-5 pb-6 pt-4 sm:px-6">
        <CustomerStep hidden={currentStep !== 0} />

        <ServiceStep
          hidden={currentStep !== 1}
          selectedService={selectedService}
          helmetCount={helmetCount}
          selectedAddOns={selectedAddOns}
          onSelectService={selectService}
          onHelmetCountChange={setHelmetCount}
          onToggleAddOn={toggleAddOn}
          isAddOnIncluded={isAddOnIncluded}
        />

        <DeliveryScheduleStep
          hidden={currentStep !== 2}
          handoff={handoff}
          onHandoffChange={handleHandoffChange}
          preferredDate={preferredDate}
          onPreferredDateChange={handleDateChange}
          preferredWindow={preferredWindow}
          onPreferredWindowChange={handleWindowChange}
          scheduleError={scheduleError}
          minimumDate={minimumDate}
          pickupLocation={pickupLocation}
          onPickupLocationChange={handlePickupLocationChange}
          pickupLocationError={pickupLocationError}
          currentStep={currentStep}
        />

        <ReviewStep
          hidden={currentStep !== 3}
          reviewValues={reviewValues}
          selectedService={selectedService}
          selectedServiceDetails={selectedServiceDetails}
          helmetCount={helmetCount}
          selectedAddOns={selectedAddOns}
          selectedTimeWindow={selectedTimeWindow}
          handoff={handoff}
          pickupLocation={pickupLocation}
          estimatedSubtotal={estimatedSubtotal}
          onGoToStep={setCurrentStep}
          isAddOnIncluded={isAddOnIncluded}
        />

        {pickupLocation && (
          <>
            <input
              type="hidden"
              name="pickupLatitude"
              value={pickupLocation.latitude}
            />
            <input
              type="hidden"
              name="pickupLongitude"
              value={pickupLocation.longitude}
            />
          </>
        )}

        {formState.status === "error" && (
          <div
            ref={feedbackRef}
            tabIndex={-1}
            role="alert"
            className="mt-4 rounded-xl border border-red-400/25 bg-red-400/10 p-3.5 text-sm text-red-100 outline-none"
          >
            {formState.message}
          </div>
        )}
      </div>

      <div className="flex items-center justify-between gap-3 border-t border-white/[0.08] bg-black/15 px-5 py-4 sm:px-6">
        {currentStep === 0 ? (
          <PendingNavigationLink
            href="/vroombroom"
            pendingLabel="Returning…"
            className="inline-flex min-h-11 items-center gap-2 rounded-xl px-2 text-sm font-semibold text-stone-400 transition hover:text-white"
          >
            <FaArrowLeft aria-hidden="true" className="text-xs" />
            Exit
          </PendingNavigationLink>
        ) : (
          <button
            type="button"
            onClick={goToPreviousStep}
            className="inline-flex min-h-11 items-center gap-2 rounded-xl px-2 text-sm font-semibold text-stone-300 transition hover:text-white"
          >
            <FaArrowLeft aria-hidden="true" className="text-xs" />
            Back
          </button>
        )}

        {currentStep < steps.length - 1 ? (
          <button
            type="button"
            onClick={goToNextStep}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-amber-400 px-5 py-2.5 text-sm font-semibold text-black transition hover:bg-amber-300"
          >
            Continue
            <FaArrowRight aria-hidden="true" className="text-xs" />
          </button>
        ) : (
          <button
            type="submit"
            disabled={formState.status === "submitting"}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-amber-400 px-5 py-2.5 text-sm font-semibold text-black transition hover:bg-amber-300 disabled:cursor-wait disabled:opacity-60"
          >
            {formState.status === "submitting"
              ? "Sending…"
              : "Request appointment"}
          </button>
        )}
      </div>
    </form>
  );
}

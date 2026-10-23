import type { BookingStep } from "./types";

interface BookingProgressBarProps {
  steps: readonly BookingStep[];
  currentStep: number;
  onStepClick: (stepIndex: number) => void;
}

export function BookingProgressBar({
  steps,
  currentStep,
  onStepClick,
}: BookingProgressBarProps) {
  return (
    <div className="border-b border-white/[0.08] px-5 py-4 sm:px-6">
      <div className="mb-3 flex items-center justify-between gap-4">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-300">
          {steps[currentStep].label}
        </p>
        <p className="text-xs text-stone-500">
          {Math.round(((currentStep + 1) / steps.length) * 100)}% complete
        </p>
      </div>
      <ol aria-label="Booking progress" className="grid grid-cols-4 gap-2">
        {steps.map((step, index) => {
          const isComplete = index < currentStep;
          const isCurrent = index === currentStep;

          return (
            <li key={step.label}>
              <button
                type="button"
                onClick={() => onStepClick(index)}
                disabled={index > currentStep}
                aria-current={isCurrent ? "step" : undefined}
                className={`w-full text-left ${
                  index < currentStep ? "cursor-pointer" : "cursor-default"
                }`}
              >
                <span
                  className={`block h-1.5 rounded-full transition ${
                    isComplete || isCurrent ? "bg-amber-400" : "bg-white/10"
                  }`}
                />
                <span
                  className={`mt-1.5 hidden text-[0.65rem] sm:block ${
                    isCurrent
                      ? "font-semibold text-amber-200"
                      : isComplete
                      ? "text-stone-300"
                      : "text-stone-600"
                  }`}
                >
                  {step.label}
                </span>
              </button>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

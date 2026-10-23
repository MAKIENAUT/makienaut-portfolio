"use client";

import { useRef } from "react";
import { FaCheck, FaChevronDown } from "react-icons/fa";
import {
  BANGUS_PAYMENT_METHODS,
  type BangusPaymentMethod,
} from "@/types/bangus";

const paymentLabels: Record<BangusPaymentMethod, string> = {
  GCASH: "GCash",
  CASH: "Cash",
  BANK: "Bank",
};

interface PaymentMethodPickerProps {
  value: BangusPaymentMethod | null;
  onChange: (value: BangusPaymentMethod | null) => void;
  disabled?: boolean;
  label?: string;
  compact?: boolean;
}

export function PaymentMethodPicker({
  value,
  onChange,
  disabled = false,
  label = "Payment method",
  compact = false,
}: PaymentMethodPickerProps) {
  const detailsRef = useRef<HTMLDetailsElement>(null);
  const options: Array<{
    value: BangusPaymentMethod | null;
    label: string;
  }> = [
    { value: null, label: "Not set" },
    ...BANGUS_PAYMENT_METHODS.map((method) => ({
      value: method,
      label: paymentLabels[method],
    })),
  ];

  return (
    <details
      ref={detailsRef}
      name="bangus-payment-method"
      className="group relative min-w-0"
    >
      <summary
        aria-label={`${label}: ${value ? paymentLabels[value] : "Not set"}`}
        aria-disabled={disabled}
        onClick={(event) => {
          if (disabled) event.preventDefault();
        }}
        className={`flex cursor-pointer list-none items-center justify-between gap-2 border border-white/10 bg-[#0b0e0d] text-stone-200 outline-none transition hover:border-cyan-300/40 focus-visible:border-cyan-300 group-open:border-cyan-300 ${
          compact
            ? "min-h-10 rounded-lg px-2 text-[0.7rem]"
            : "min-h-10 rounded-lg px-3 text-sm"
        } ${disabled ? "cursor-not-allowed opacity-50" : ""} [&::-webkit-details-marker]:hidden`}
      >
        <span className="truncate">
          {value ? paymentLabels[value] : "Not set"}
        </span>
        <FaChevronDown
          aria-hidden="true"
          className="shrink-0 text-[0.65rem] text-stone-500 transition group-open:rotate-180"
        />
      </summary>

      <div className="absolute right-0 top-[calc(100%+0.3rem)] z-50 min-w-full overflow-hidden rounded-lg border border-white/10 bg-[#171c1a] p-1 shadow-[0_16px_40px_rgba(0,0,0,0.65)]">
        {options.map((option) => {
          const isSelected = option.value === value;
          return (
            <button
              key={option.value ?? "NONE"}
              type="button"
              onClick={() => {
                onChange(option.value);
                detailsRef.current?.removeAttribute("open");
              }}
              className={`flex min-h-9 w-full items-center justify-between gap-3 rounded-md px-2.5 text-left text-xs transition ${
                isSelected
                  ? "bg-cyan-300/10 text-cyan-100"
                  : "text-stone-300 hover:bg-white/[0.05] hover:text-white"
              }`}
            >
              {option.label}
              {isSelected && <FaCheck aria-hidden="true" className="text-[0.65rem] text-cyan-300" />}
            </button>
          );
        })}
      </div>
    </details>
  );
}

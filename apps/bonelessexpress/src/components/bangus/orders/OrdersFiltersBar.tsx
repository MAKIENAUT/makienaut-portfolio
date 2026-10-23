"use client";

import { FaSearch } from "react-icons/fa";
import type {
  PaymentStatusFilter,
  ReceiptStatusFilter,
  ShortageStatusFilter,
} from "./types";

interface OrdersFiltersBarProps {
  isSupplier: boolean;
  orderQuery: string;
  paymentStatusFilter: PaymentStatusFilter;
  receiptStatusFilter: ReceiptStatusFilter;
  shortageStatusFilter: ShortageStatusFilter;
  filteredCount: number;
  totalCount: number;
  onOrderQueryChange: (query: string) => void;
  onPaymentStatusFilterChange: (filter: PaymentStatusFilter) => void;
  onReceiptStatusFilterChange: (filter: ReceiptStatusFilter) => void;
  onShortageStatusFilterChange: (filter: ShortageStatusFilter) => void;
}

export function OrdersFiltersBar({
  isSupplier,
  orderQuery,
  paymentStatusFilter,
  receiptStatusFilter,
  shortageStatusFilter,
  filteredCount,
  totalCount,
  onOrderQueryChange,
  onPaymentStatusFilterChange,
  onReceiptStatusFilterChange,
  onShortageStatusFilterChange,
}: OrdersFiltersBarProps) {
  const isFiltering =
    Boolean(orderQuery) ||
    (!isSupplier && paymentStatusFilter !== "ALL") ||
    receiptStatusFilter !== "ALL" ||
    shortageStatusFilter !== "ALL";

  return (
    <div
      className={`mt-3 grid gap-2 sm:mt-5 sm:items-center ${
        isSupplier
          ? "sm:grid-cols-[minmax(0,1fr)_auto_auto]"
          : "sm:grid-cols-[minmax(0,1fr)_auto_auto_auto]"
      }`}
    >
      <label className="block">
        <span className="sr-only">Search orders in this table</span>
        <div className="relative">
          <FaSearch
            aria-hidden="true"
            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-stone-600"
          />
          <input
            type="search"
            value={orderQuery}
            onChange={(event) => onOrderQueryChange(event.target.value)}
            placeholder="Search customer, item, or status…"
            className="min-h-10 w-full rounded-lg border border-white/10 bg-black/30 py-2 pl-11 pr-4 text-sm text-white outline-none placeholder:text-stone-600 focus:border-cyan-300 focus:ring-2 focus:ring-cyan-300/15 sm:min-h-11 sm:rounded-xl"
          />
        </div>
      </label>

      {!isSupplier && (
        <label>
          <span className="sr-only">Filter by payment status</span>
          <select
            value={paymentStatusFilter}
            onChange={(event) =>
              onPaymentStatusFilterChange(
                event.target.value as PaymentStatusFilter
              )
            }
            className="min-h-10 w-full rounded-lg border border-white/10 bg-[#0b0e0d] px-3 text-sm text-stone-200 outline-none focus:border-cyan-300 sm:min-h-11 sm:w-36 sm:rounded-xl"
          >
            <option value="ALL">All payments</option>
            <option value="PAID">Paid</option>
            <option value="UNPAID">Unpaid</option>
          </select>
        </label>
      )}

      <label>
        <span className="sr-only">Filter by receipt status</span>
        <select
          value={receiptStatusFilter}
          onChange={(event) =>
            onReceiptStatusFilterChange(
              event.target.value as ReceiptStatusFilter
            )
          }
          className="min-h-10 w-full rounded-lg border border-white/10 bg-[#0b0e0d] px-3 text-sm text-stone-200 outline-none focus:border-cyan-300 sm:min-h-11 sm:w-40 sm:rounded-xl"
        >
          <option value="ALL">All receipts</option>
          <option value="RECEIVED">Received</option>
          <option value="NOT_RECEIVED">Not received</option>
        </select>
      </label>

      <label>
        <span className="sr-only">Filter by shortage status</span>
        <select
          value={shortageStatusFilter}
          onChange={(event) =>
            onShortageStatusFilterChange(
              event.target.value as ShortageStatusFilter
            )
          }
          className="min-h-10 w-full rounded-lg border border-white/10 bg-[#0b0e0d] px-3 text-sm text-stone-200 outline-none focus:border-rose-300 sm:min-h-11 sm:w-40 sm:rounded-xl"
        >
          <option value="ALL">All shortages</option>
          <option value="SHORTED">Shorted</option>
          <option value="NO_SHORTAGES">No shortages</option>
        </select>
      </label>

      {isFiltering && (
        <p className="text-xs text-stone-500 sm:col-span-full">
          {filteredCount} of {totalCount} orders shown
        </p>
      )}
    </div>
  );
}

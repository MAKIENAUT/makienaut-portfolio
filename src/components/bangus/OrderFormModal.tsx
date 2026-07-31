"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { FaFish, FaSave, FaSearch, FaTimes } from "react-icons/fa";
import { PaymentMethodPicker } from "@/components/bangus/PaymentMethodPicker";
import {
  getBangusProductAbbreviation,
  getBangusProductFullLabel,
} from "@/lib/bangus/product-label";
import {
  type BangusOrderInput,
  type BangusOrderRecord,
  type BangusPaymentMethod,
  type BangusProductRecord,
} from "@/types/bangus";

interface OrderFormModalProps {
  deliveryDate: string;
  order: BangusOrderRecord | null;
  products: BangusProductRecord[];
  onClose: () => void;
  onSave: (order: BangusOrderInput) => Promise<void>;
}

const formatPeso = (value: number) =>
  new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    maximumFractionDigits: 0,
  }).format(value);

const formatDeliveryDate = (value: string) =>
  new Intl.DateTimeFormat("en-PH", {
    timeZone: "UTC",
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date(`${value}T00:00:00.000Z`));

export function OrderFormModal({
  deliveryDate,
  order,
  products,
  onClose,
  onSave,
}: OrderFormModalProps) {
  const initialQuantities = Object.fromEntries(
    order?.items.map((item) => [item.productId, item.quantity]) ?? []
  );
  const [customerName, setCustomerName] = useState(order?.customerName ?? "");
  const [received, setReceived] = useState(order?.received ?? false);
  const [paid, setPaid] = useState(order?.paid ?? false);
  const [paymentMethod, setPaymentMethod] =
    useState<BangusPaymentMethod | null>(order?.paymentMethod ?? null);
  const [quantities, setQuantities] =
    useState<Record<string, number>>(initialQuantities);
  const [query, setQuery] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !isSaving) onClose();
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [isSaving, onClose]);

  const availableProducts = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return products.filter(
      (product) =>
        (product.isActive || (quantities[product.id] ?? 0) > 0) &&
        (!normalizedQuery ||
          getBangusProductFullLabel(product)
            .toLowerCase()
            .includes(normalizedQuery))
    );
  }, [products, quantities, query]);

  const totals = useMemo(
    () =>
      products.reduce(
        (current, product) => {
          const quantity = quantities[product.id] ?? 0;
          return {
            itemCount: current.itemCount + quantity,
            supplier: current.supplier + quantity * product.supplierPrice,
            retail: current.retail + quantity * product.retailPrice,
          };
        },
        { itemCount: 0, supplier: 0, retail: 0 }
      ),
    [products, quantities]
  );

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setIsSaving(true);

    try {
      await onSave({
        customerName,
        received,
        paid,
        paymentMethod,
        quantities,
      });
      onClose();
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : "The order could not be saved."
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/75 p-0 backdrop-blur-sm sm:items-center sm:p-6"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !isSaving) onClose();
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="bangus-order-form-title"
        className="flex max-h-[98svh] w-full flex-col overflow-hidden rounded-t-2xl border border-white/10 bg-[#111615] shadow-2xl sm:max-h-[95svh] sm:max-w-4xl sm:rounded-3xl"
      >
        <header className="flex shrink-0 items-center justify-between gap-3 border-b border-white/[0.08] px-4 py-3 sm:items-start sm:px-6 sm:py-5">
          <div className="min-w-0">
            <p className="truncate text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-cyan-300 sm:text-xs sm:tracking-[0.18em]">
              {formatDeliveryDate(deliveryDate)}
            </p>
            <h2
              id="bangus-order-form-title"
              className="text-base font-semibold text-white sm:mt-1 sm:text-xl"
            >
              {order ? "Edit customer order" : "Add customer order"}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isSaving}
            aria-label="Close order form"
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 text-stone-400 transition hover:border-white/20 hover:text-white disabled:opacity-50"
          >
            <FaTimes aria-hidden="true" />
          </button>
        </header>

        <form
          onSubmit={handleSubmit}
          className="bangus-sheet-scroll min-h-0 flex-1 overflow-y-auto"
        >
          <div className="space-y-4 p-3 sm:space-y-6 sm:p-6">
            <label className="block">
              <span className="text-sm font-medium text-stone-300">
                Name of person ordering
              </span>
              <input
                autoFocus
                required
                maxLength={120}
                value={customerName}
                onChange={(event) => setCustomerName(event.target.value)}
                placeholder="Customer name"
                className="mt-1 min-h-10 w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-white outline-none placeholder:text-stone-600 focus:border-cyan-300 focus:ring-2 focus:ring-cyan-300/15 sm:mt-2 sm:min-h-11 sm:rounded-xl sm:py-2.5"
              />
            </label>

            <section>
              <div className="flex items-center gap-2 sm:items-end sm:justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-white sm:text-base">Products</h3>
                  <p className="mt-1 hidden text-sm text-stone-500 sm:block">
                    Enter the quantity for each item in this order.
                  </p>
                </div>
                <div className="relative min-w-0 flex-1 sm:w-72 sm:flex-none">
                  <FaSearch
                    aria-hidden="true"
                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-stone-600"
                  />
                  <input
                    type="search"
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="Find a product…"
                    aria-label="Find a product"
                    className="min-h-10 w-full rounded-lg border border-white/10 bg-black/30 py-2 pl-9 pr-3 text-sm text-white outline-none placeholder:text-stone-600 focus:border-cyan-300 sm:rounded-xl sm:pl-10"
                  />
                </div>
              </div>

              <div className="mt-2 grid min-w-0 grid-cols-[minmax(0,1fr)] gap-1.5 sm:mt-4 sm:grid-cols-2 sm:gap-3">
                {availableProducts.map((product) => {
                  const quantity = quantities[product.id] ?? 0;
                  return (
                    <label
                      key={product.id}
                      className={`flex min-w-0 items-center gap-2 rounded-lg border p-2 transition sm:gap-3 sm:rounded-xl sm:p-3 ${
                        quantity > 0
                          ? "border-cyan-300/30 bg-cyan-300/[0.06]"
                          : "border-white/[0.08] bg-black/15"
                      }`}
                    >
                      <span className="hidden h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-cyan-300/10 text-cyan-300 sm:inline-flex">
                        <FaFish aria-hidden="true" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-xs font-medium text-stone-100 sm:text-sm">
                          {getBangusProductAbbreviation(product)}
                        </span>
                        <span
                          className="mt-0.5 block truncate text-xs text-stone-500"
                          title={getBangusProductFullLabel(product)}
                        >
                          {getBangusProductFullLabel(product)}
                        </span>
                        <span className="mt-0.5 block text-[0.65rem] text-stone-500 sm:mt-1 sm:text-xs sm:text-stone-600">
                          {formatPeso(product.retailPrice)} retail
                        </span>
                      </span>
                      <input
                        type="number"
                        inputMode="numeric"
                        min="0"
                        max="10000"
                        step="1"
                        value={quantity || ""}
                        onChange={(event) => {
                          const nextQuantity = Math.max(
                            0,
                            Number.parseInt(event.target.value || "0", 10) || 0
                          );
                          setQuantities((current) => ({
                            ...current,
                            [product.id]: nextQuantity,
                          }));
                        }}
                        aria-label={`${getBangusProductFullLabel(product)} quantity`}
                        placeholder="0"
                        className="h-10 w-16 rounded-lg border border-white/10 bg-black/30 px-1 text-center text-base font-semibold tabular-nums text-white outline-none focus:border-cyan-300 sm:w-20 sm:px-2 sm:text-sm"
                      />
                    </label>
                  );
                })}
              </div>
            </section>

            <section className="grid grid-cols-[0.8fr_0.7fr_1.3fr] gap-1.5 rounded-lg border border-white/[0.08] bg-black/20 p-2 sm:grid-cols-3 sm:gap-4 sm:rounded-2xl sm:p-4">
              <label className={`flex min-h-10 cursor-pointer items-center justify-center gap-1.5 rounded-lg border px-2 ${received ? "border-violet-300/30 bg-violet-300/10" : "border-white/10"} sm:justify-start sm:border-0 sm:bg-transparent sm:px-0`}>
                <input
                  type="checkbox"
                  checked={received}
                  onChange={(event) => setReceived(event.target.checked)}
                  className="h-3.5 w-3.5 accent-violet-300 sm:h-4 sm:w-4"
                />
                <span className="text-[0.7rem] font-medium text-stone-200 sm:text-sm">
                  Received
                </span>
              </label>
              <label className={`flex min-h-10 cursor-pointer items-center justify-center gap-1.5 rounded-lg border px-2 ${paid ? "border-cyan-300/30 bg-cyan-300/10" : "border-white/10"} sm:justify-start sm:border-0 sm:bg-transparent sm:px-0`}>
                <input
                  type="checkbox"
                  checked={paid}
                  onChange={(event) => setPaid(event.target.checked)}
                  className="h-3.5 w-3.5 accent-cyan-300 sm:h-4 sm:w-4"
                />
                <span className="text-[0.7rem] font-medium text-stone-200 sm:text-sm">Paid</span>
              </label>
              <div>
                <span className="sr-only sm:not-sr-only sm:text-xs sm:text-stone-500">Payment method</span>
                <PaymentMethodPicker
                  value={paymentMethod}
                  onChange={(method) => {
                    setPaymentMethod(method);
                    if (method) setPaid(true);
                  }}
                  compact
                />
              </div>
            </section>

            {error && (
              <p
                role="alert"
                className="rounded-xl border border-red-400/20 bg-red-400/10 p-3 text-sm text-red-100"
              >
                {error}
              </p>
            )}
          </div>

          <footer className="sticky bottom-0 flex gap-3 border-t border-white/[0.08] bg-[#111615]/95 px-3 py-3 backdrop-blur-xl sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:py-4">
            <div className="grid min-w-0 flex-1 grid-cols-3 gap-2 text-sm sm:flex sm:gap-6">
              <div>
                <p className="text-xs text-stone-500">Items</p>
                <p className="font-semibold text-white sm:mt-1">
                  {totals.itemCount}
                </p>
              </div>
              <div>
                <p className="text-xs text-stone-500">Supplier</p>
                <p className="truncate font-semibold text-stone-300 sm:mt-1">
                  {formatPeso(totals.supplier)}
                </p>
              </div>
              <div>
                <p className="text-xs text-stone-500">Retail</p>
                <p className="truncate font-semibold text-emerald-300 sm:mt-1">
                  {formatPeso(totals.retail)}
                </p>
              </div>
            </div>
            <div className="flex shrink-0 gap-2">
              <button
                type="button"
                onClick={onClose}
                disabled={isSaving}
                className="hidden min-h-11 items-center justify-center rounded-xl border border-white/10 px-5 text-sm font-semibold text-stone-300 transition hover:border-white/20 hover:text-white disabled:opacity-50 sm:inline-flex"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-cyan-300 px-4 text-sm font-bold text-[#071211] transition hover:bg-cyan-200 disabled:cursor-wait disabled:opacity-60 sm:px-5"
              >
                <FaSave aria-hidden="true" />
                <span className="sm:hidden">{isSaving ? "Saving…" : "Save"}</span>
                <span className="hidden sm:inline">{isSaving ? "Saving…" : order ? "Save changes" : "Add order"}</span>
              </button>
            </div>
          </footer>
        </form>
      </section>
    </div>
  );
}

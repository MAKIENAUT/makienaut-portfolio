"use client";

import { useEffect } from "react";
import {
  FaCheckCircle,
  FaEdit,
  FaFish,
  FaTimes,
  FaTimesCircle,
} from "react-icons/fa";
import {
  getBangusProductAbbreviation,
  getBangusProductFullLabel,
} from "@/lib/bangus/product-label";
import type {
  BangusOrderRecord,
  BangusPaymentMethod,
  BangusProductRecord,
} from "@/types/bangus";

interface OrderDetailsModalProps {
  deliveryDate: string;
  order: BangusOrderRecord;
  products: BangusProductRecord[];
  showSupplierPrices: boolean;
  onClose: () => void;
  onEdit: () => void;
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

const paymentLabels: Record<BangusPaymentMethod, string> = {
  GCASH: "GCash",
  CASH: "Cash",
  BANK: "Bank",
};

export function OrderDetailsModal({
  deliveryDate,
  order,
  products,
  showSupplierPrices,
  onClose,
  onEdit,
}: OrderDetailsModalProps) {
  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [onClose]);

  const productById = new Map(
    products.map((product) => [product.id, product])
  );
  const orderedItems = order.items
    .map((item) => ({
      ...item,
      product: productById.get(item.productId),
    }))
    .filter(
      (
        item
      ): item is typeof item & {
        product: BangusProductRecord;
      } => !!item.product
    );
  const totalQuantity = orderedItems.reduce(
    (total, item) => total + item.quantity,
    0
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/75 p-0 backdrop-blur-sm sm:items-center sm:p-6"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="bangus-order-details-title"
        className="max-h-[94svh] w-full overflow-y-auto rounded-t-3xl border border-white/10 bg-[#111615] shadow-2xl sm:max-w-3xl sm:rounded-3xl"
      >
        <header className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-white/[0.08] bg-[#111615]/95 px-5 py-5 backdrop-blur-xl sm:px-6">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-300">
              {formatDeliveryDate(deliveryDate)}
            </p>
            <h2
              id="bangus-order-details-title"
              className="mt-1 truncate text-2xl font-semibold text-white"
            >
              {order.customerName}
            </h2>
            <p className="mt-1 text-sm text-stone-500">
              {totalQuantity} {totalQuantity === 1 ? "item" : "items"} across{" "}
              {orderedItems.length}{" "}
              {orderedItems.length === 1 ? "product" : "products"}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close order details"
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 text-stone-400 transition hover:border-white/20 hover:text-white"
          >
            <FaTimes aria-hidden="true" />
          </button>
        </header>

        <div className="p-5 sm:p-6">
          <section
            className={`grid gap-3 ${
              showSupplierPrices ? "sm:grid-cols-3" : "sm:grid-cols-1"
            }`}
          >
            <article className="rounded-2xl border border-white/[0.08] bg-black/20 p-4">
              <p className="text-xs text-stone-500">Retail total</p>
              <p className="mt-2 text-xl font-semibold text-emerald-300">
                {formatPeso(order.retailTotal)}
              </p>
            </article>
            {showSupplierPrices && (
              <>
                <article className="rounded-2xl border border-white/[0.08] bg-black/20 p-4">
                  <p className="text-xs text-stone-500">Supplier total</p>
                  <p className="mt-2 text-xl font-semibold text-stone-200">
                    {formatPeso(order.supplierTotal)}
                  </p>
                </article>
                <article className="rounded-2xl border border-white/[0.08] bg-black/20 p-4">
                  <p className="text-xs text-stone-500">Markup</p>
                  <p className="mt-2 text-xl font-semibold text-cyan-300">
                    {formatPeso(order.retailTotal - order.supplierTotal)}
                  </p>
                </article>
              </>
            )}
          </section>

          <section className="mt-5 grid gap-3 rounded-2xl border border-white/[0.08] p-4 sm:grid-cols-3">
            {[
              { label: "Received", value: order.received },
              { label: "Paid", value: order.paid },
            ].map((status) => {
              const Icon = status.value ? FaCheckCircle : FaTimesCircle;
              return (
                <div key={status.label} className="flex items-center gap-3">
                  <Icon
                    aria-hidden="true"
                    className={
                      status.value ? "text-emerald-300" : "text-stone-600"
                    }
                  />
                  <div>
                    <p className="text-xs text-stone-500">{status.label}</p>
                    <p className="mt-0.5 text-sm font-medium text-stone-200">
                      {status.value ? "Yes" : "No"}
                    </p>
                  </div>
                </div>
              );
            })}
            <div>
              <p className="text-xs text-stone-500">Payment method</p>
              <p className="mt-1 text-sm font-medium text-stone-200">
                {order.paymentMethod
                  ? paymentLabels[order.paymentMethod]
                  : "Not set"}
              </p>
            </div>
          </section>

          <section className="mt-5 overflow-hidden rounded-2xl border border-white/[0.08]">
            <header className="border-b border-white/[0.08] bg-black/20 px-4 py-3">
              <h3 className="font-semibold text-white">Ordered products</h3>
            </header>
            <div className="divide-y divide-white/[0.06]">
              {orderedItems.map((item) => (
                <article
                  key={item.productId}
                  className="grid gap-3 px-4 py-4 sm:grid-cols-[minmax(0,1fr)_auto_auto]"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-cyan-300/10 text-cyan-300">
                      <FaFish aria-hidden="true" />
                    </span>
                    <div className="min-w-0">
                      <p className="font-medium text-stone-100">
                        {getBangusProductAbbreviation(item.product)}
                      </p>
                      <p className="mt-0.5 truncate text-xs text-stone-500">
                        {getBangusProductFullLabel(item.product)}
                      </p>
                    </div>
                  </div>
                  <div className="sm:text-right">
                    <p className="text-xs text-stone-500">Quantity</p>
                    <p className="mt-1 font-semibold text-white">
                      {item.quantity}
                    </p>
                  </div>
                  <div className="min-w-28 sm:text-right">
                    <p className="text-xs text-stone-500">Retail subtotal</p>
                    <p className="mt-1 font-semibold text-emerald-300">
                      {formatPeso(item.quantity * item.retailUnitPrice)}
                    </p>
                    <p className="mt-0.5 text-xs text-stone-600">
                      {formatPeso(item.retailUnitPrice)} each
                    </p>
                  </div>
                </article>
              ))}
            </div>
          </section>
        </div>

        <footer className="sticky bottom-0 flex flex-col-reverse gap-2 border-t border-white/[0.08] bg-[#111615]/95 px-5 py-4 backdrop-blur-xl sm:flex-row sm:justify-end sm:px-6">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex min-h-11 items-center justify-center rounded-xl border border-white/10 px-5 text-sm font-semibold text-stone-300 transition hover:border-white/20 hover:text-white"
          >
            Close
          </button>
          <button
            type="button"
            onClick={onEdit}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-cyan-300 px-5 text-sm font-bold text-[#071211] transition hover:bg-cyan-200"
          >
            <FaEdit aria-hidden="true" />
            Edit order
          </button>
        </footer>
      </section>
    </div>
  );
}

"use client";

import { useEffect, useMemo } from "react";
import { FaBoxOpen, FaTimes } from "react-icons/fa";
import { getBangusProductFullLabel } from "@/lib/bangus/product-label";
import type {
  BangusProductMetric,
  BangusProductRecord,
} from "@/types/bangus";

interface ProductMetricsModalProps {
  products: BangusProductRecord[];
  metrics: BangusProductMetric[];
  tableName: string;
  onClose: () => void;
}

export function ProductMetricsModal({
  products,
  metrics,
  tableName,
  onClose,
}: ProductMetricsModalProps) {
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

  const rows = useMemo(() => {
    const productById = new Map(products.map((product) => [product.id, product]));

    return metrics
      .map((metric) => {
        return {
          ...metric,
          product: productById.get(metric.productId),
        };
      })
      .sort((a, b) =>
        (a.product ? getBangusProductFullLabel(a.product) : a.productId).localeCompare(
          b.product ? getBangusProductFullLabel(b.product) : b.productId
        )
      );
  }, [metrics, products]);

  const totals = rows.reduce(
    (current, row) => ({
      ordered: current.ordered + row.orderedQuantity,
      received: current.received + row.receivedQuantity,
      repacked: current.repacked + row.repackedQuantity,
      onHand: current.onHand + row.onHandQuantity,
      short: current.short + row.shortQuantity,
    }),
    { ordered: 0, received: 0, repacked: 0, onHand: 0, short: 0 }
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
        aria-labelledby="bangus-product-metrics-title"
        className="flex max-h-[98svh] w-full max-w-6xl flex-col overflow-hidden rounded-t-2xl border border-white/10 bg-[#111615] shadow-2xl sm:max-h-[90svh] sm:rounded-3xl"
      >
        <header className="flex shrink-0 items-start justify-between gap-3 border-b border-white/[0.08] px-4 py-4 sm:px-6 sm:py-5">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-amber-300">
              Supplier stock
            </p>
            <h2
              id="bangus-product-metrics-title"
              className="mt-1 truncate text-lg font-semibold text-white sm:text-xl"
            >
              Product metrics · {tableName}
            </h2>
            <p className="mt-1 text-sm text-stone-500">
              Missing quantities are recorded on each customer order and totalled here.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close product metrics"
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 text-stone-400 transition hover:border-white/20 hover:text-white"
          >
            <FaTimes aria-hidden="true" />
          </button>
        </header>

        <div className="min-h-0 flex-1 overflow-auto">
          {rows.length === 0 ? (
            <div className="px-5 py-16 text-center">
              <FaBoxOpen aria-hidden="true" className="mx-auto text-4xl text-stone-700" />
              <p className="mt-4 font-medium text-stone-300">No products in this table yet.</p>
            </div>
          ) : (
            <table className="w-full min-w-[50rem] border-collapse text-left text-sm">
              <thead className="sticky top-0 z-10 bg-[#151a18] text-xs uppercase tracking-[0.08em] text-stone-500">
                <tr>
                  <th className="px-4 py-3 font-semibold sm:px-6">Product</th>
                  <th className="px-3 py-3 text-center font-semibold">Ordered</th>
                  <th className="px-3 py-3 text-center font-semibold">Received</th>
                  <th className="px-3 py-3 text-center font-semibold">Repacked</th>
                  <th className="px-3 py-3 text-center font-semibold">On hand</th>
                  <th className="px-3 py-3 text-center font-semibold text-amber-200">Short</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.06]">
                {rows.map((row) => (
                  <tr key={row.productId}>
                    <td className="px-4 py-3 text-sm font-medium text-stone-100 sm:px-6">
                      {row.product
                        ? getBangusProductFullLabel(row.product)
                        : "Unavailable product"}
                    </td>
                    <td className="px-3 py-3 text-center tabular-nums text-stone-300">
                      {row.orderedQuantity}
                    </td>
                    <td className="px-3 py-3 text-center tabular-nums text-emerald-300">
                      {row.receivedQuantity}
                    </td>
                    <td className="px-3 py-3 text-center tabular-nums text-cyan-200">
                      {row.repackedQuantity}
                    </td>
                    <td className="px-3 py-3 text-center font-semibold tabular-nums text-white">
                      {row.onHandQuantity}
                    </td>
                    <td className="px-3 py-3 text-center font-semibold tabular-nums text-amber-200">
                      {row.shortQuantity}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="border-t border-white/[0.1] bg-black/20 font-semibold">
                <tr>
                  <th className="px-4 py-3 text-xs uppercase tracking-[0.08em] text-stone-400 sm:px-6">Total</th>
                  <td className="px-3 py-3 text-center tabular-nums text-stone-200">{totals.ordered}</td>
                  <td className="px-3 py-3 text-center tabular-nums text-emerald-300">{totals.received}</td>
                  <td className="px-3 py-3 text-center tabular-nums text-cyan-200">{totals.repacked}</td>
                  <td className="px-3 py-3 text-center tabular-nums text-white">{totals.onHand}</td>
                  <td className="px-3 py-3 text-center tabular-nums text-amber-200">{totals.short}</td>
                </tr>
              </tfoot>
            </table>
          )}
        </div>

        <footer className="flex shrink-0 justify-end gap-3 border-t border-white/[0.08] px-4 py-3 sm:px-6 sm:py-4">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex min-h-11 items-center justify-center rounded-xl border border-white/10 px-5 text-sm font-semibold text-stone-300 transition hover:border-white/20 hover:text-white"
          >
            Close
          </button>
        </footer>
      </section>
    </div>
  );
}

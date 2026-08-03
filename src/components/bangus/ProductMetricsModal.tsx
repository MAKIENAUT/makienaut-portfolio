"use client";

import { useEffect, useMemo, useState } from "react";
import { FaBoxOpen, FaSave, FaTimes } from "react-icons/fa";
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
  onSave: (shortQuantities: Record<string, number>) => Promise<void>;
}

export function ProductMetricsModal({
  products,
  metrics,
  tableName,
  onClose,
  onSave,
}: ProductMetricsModalProps) {
  const [shortQuantities, setShortQuantities] = useState<Record<string, number>>(
    () => Object.fromEntries(metrics.map((metric) => [metric.productId, metric.shortQuantity]))
  );
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

  const rows = useMemo(() => {
    const productById = new Map(products.map((product) => [product.id, product]));

    return metrics
      .map((metric) => {
        const shortQuantity = Math.min(
          Math.max(shortQuantities[metric.productId] ?? 0, 0),
          metric.orderedQuantity
        );
        const receivedQuantity = metric.orderedQuantity - shortQuantity;

        return {
          ...metric,
          product: productById.get(metric.productId),
          shortQuantity,
          receivedQuantity,
          onHandQuantity: Math.max(receivedQuantity - metric.repackedQuantity, 0),
        };
      })
      .sort((a, b) =>
        (a.product ? getBangusProductFullLabel(a.product) : a.productId).localeCompare(
          b.product ? getBangusProductFullLabel(b.product) : b.productId
        )
      );
  }, [metrics, products, shortQuantities]);

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

  const save = async () => {
    setIsSaving(true);
    setError("");

    try {
      await onSave(shortQuantities);
      onClose();
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : "Product metrics could not be saved."
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
              Set a supplier short quantity to calculate received stock and on hand.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isSaving}
            aria-label="Close product metrics"
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 text-stone-400 transition hover:border-white/20 hover:text-white disabled:opacity-50"
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
                    <td className="px-3 py-3 text-center">
                      <input
                        type="number"
                        inputMode="numeric"
                        min="0"
                        max={row.orderedQuantity}
                        value={row.shortQuantity || ""}
                        onChange={(event) => {
                          const nextValue = Math.min(
                            Math.max(
                              Number.parseInt(event.target.value || "0", 10) || 0,
                              0
                            ),
                            row.orderedQuantity
                          );
                          setShortQuantities((current) => ({
                            ...current,
                            [row.productId]: nextValue,
                          }));
                        }}
                        aria-label={`Supplier short quantity for ${
                          row.product
                            ? getBangusProductFullLabel(row.product)
                            : "product"
                        }`}
                        className="h-9 w-16 rounded-lg border border-amber-300/20 bg-amber-300/[0.06] px-1 text-center font-semibold tabular-nums text-amber-100 outline-none focus:border-amber-300"
                      />
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

        {error && (
          <p role="alert" className="mx-4 mt-3 rounded-xl border border-red-400/20 bg-red-400/10 p-3 text-sm text-red-100 sm:mx-6">
            {error}
          </p>
        )}

        <footer className="flex shrink-0 justify-end gap-3 border-t border-white/[0.08] px-4 py-3 sm:px-6 sm:py-4">
          <button
            type="button"
            onClick={onClose}
            disabled={isSaving}
            className="inline-flex min-h-11 items-center justify-center rounded-xl px-4 text-sm font-semibold text-stone-400 transition hover:text-white disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => void save()}
            disabled={isSaving || rows.length === 0}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-amber-300 px-5 text-sm font-bold text-[#151008] transition hover:bg-amber-200 disabled:cursor-wait disabled:opacity-60"
          >
            <FaSave aria-hidden="true" />
            {isSaving ? "Saving…" : "Save shortages"}
          </button>
        </footer>
      </section>
    </div>
  );
}

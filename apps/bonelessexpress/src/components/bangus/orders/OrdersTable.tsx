"use client";

import {
  FaChevronDown,
  FaChevronUp,
  FaEdit,
  FaPlus,
  FaSearch,
  FaTrash,
  FaTruck,
} from "react-icons/fa";
import { PaymentMethodPicker } from "@/components/bangus/PaymentMethodPicker";
import { formatCurrency } from "@/lib/common/formatters";
import {
  getBangusProductAbbreviation,
  getBangusProductFullLabel,
} from "@/lib/bangus/product-label";
import type {
  BangusOrderRecord,
  BangusProductRecord,
} from "@/types/bangus";
import {
  getFlavorAccentClasses,
  getFlavorClasses,
  hasOrderShortage,
  type TableTotals,
} from "./types";

interface OrdersTableProps {
  products: BangusProductRecord[];
  orders: BangusOrderRecord[];
  filteredOrders: BangusOrderRecord[];
  tableTotals: TableTotals;
  isSupplier: boolean;
  showSupplierPrices: boolean;
  busyOrderId?: string;
  expandedMobileOrderIds: Set<string>;
  onToggleMobileOrderExpanded: (orderId: string) => void;
  onViewOrder: (orderId: string) => void;
  onEditOrder: (order: BangusOrderRecord) => void;
  onDeleteOrder: (order: BangusOrderRecord) => void;
  onUpdateStatus: (
    order: BangusOrderRecord,
    changes: Partial<
      Pick<
        BangusOrderRecord,
        "repacked" | "received" | "paid" | "paymentMethod"
      >
    >
  ) => void;
  onOpenNewOrder: () => void;
  onClearFilters: () => void;
  onDeleteDeliveryTable: () => void;
}

export function OrdersTable({
  products,
  orders,
  filteredOrders,
  tableTotals,
  isSupplier,
  showSupplierPrices,
  busyOrderId,
  expandedMobileOrderIds,
  onToggleMobileOrderExpanded,
  onViewOrder,
  onEditOrder,
  onDeleteOrder,
  onUpdateStatus,
  onOpenNewOrder,
  onClearFilters,
  onDeleteDeliveryTable,
}: OrdersTableProps) {
  if (orders.length === 0) {
    return (
      <div className="px-5 py-16 text-center">
        <FaTruck
          aria-hidden="true"
          className="mx-auto text-4xl text-stone-700"
        />
        <p className="mt-4 font-medium text-stone-300">
          This delivery table has no orders.
        </p>
        {!isSupplier && (
          <button
            type="button"
            onClick={onOpenNewOrder}
            className="mt-5 inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-cyan-300 px-5 text-sm font-bold text-[#071211] transition hover:bg-cyan-200"
          >
            <FaPlus aria-hidden="true" />
            Add the first order
          </button>
        )}
      </div>
    );
  }

  if (filteredOrders.length === 0) {
    return (
      <div className="px-5 py-16 text-center">
        <FaSearch
          aria-hidden="true"
          className="mx-auto text-4xl text-stone-700"
        />
        <p className="mt-4 font-medium text-stone-300">
          No orders match these filters.
        </p>
        <button
          type="button"
          onClick={onClearFilters}
          className="mt-4 text-sm font-semibold text-cyan-200 transition hover:text-cyan-100"
        >
          Clear filters
        </button>
      </div>
    );
  }

  return (
    <>
      {/* Mobile view */}
      <div className="space-y-2 p-2 md:hidden">
        {filteredOrders.map((order) => {
          const isBusy = busyOrderId === order.id;
          const hasShortage = hasOrderShortage(order);
          const isExpanded = expandedMobileOrderIds.has(order.id);
          const orderedItems = order.items.filter(
            (item) => item.quantity > 0
          );
          const itemCount = orderedItems.reduce(
            (total, item) => total + item.quantity,
            0
          );

          return (
            <article
              key={order.id}
              className={`rounded-xl border p-3 transition ${
                isExpanded
                  ? "border-cyan-300/20 bg-cyan-300/[0.035]"
                  : "border-white/[0.08] bg-black/10"
              }`}
            >
              <div className="flex items-start gap-2">
                <button
                  type="button"
                  aria-expanded={isExpanded}
                  aria-controls={`mobile-order-${order.id}`}
                  onClick={() => onToggleMobileOrderExpanded(order.id)}
                  className="flex min-w-0 flex-1 items-center gap-2 rounded-lg text-left transition hover:text-cyan-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/40"
                >
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold text-white">
                      {order.customerName}
                    </span>
                    <span className="mt-0.5 block text-[0.65rem] text-stone-500">
                      {itemCount} item{itemCount === 1 ? "" : "s"} ·{" "}
                      {isExpanded ? "Tap to collapse" : "Tap to expand"}
                    </span>
                  </span>
                  {isExpanded ? (
                    <FaChevronUp
                      aria-hidden="true"
                      className="shrink-0 text-cyan-300"
                    />
                  ) : (
                    <FaChevronDown
                      aria-hidden="true"
                      className="shrink-0 text-stone-500"
                    />
                  )}
                </button>
                <div className="shrink-0 text-right">
                  {!isSupplier && (
                    <p className="text-sm font-semibold tabular-nums text-emerald-300">
                      {formatCurrency(order.retailTotal)}
                    </p>
                  )}
                  {showSupplierPrices && (
                    <p
                      className={`${
                        isSupplier
                          ? "text-sm font-semibold text-stone-300"
                          : "text-[0.65rem] text-stone-500"
                      } tabular-nums`}
                    >
                      {formatCurrency(order.supplierTotal)}
                      {!isSupplier && " cost"}
                    </p>
                  )}
                </div>
                {!isSupplier && (
                  <div className="flex shrink-0">
                    <button
                      type="button"
                      disabled={isBusy}
                      onClick={() => onEditOrder(order)}
                      aria-label={`Edit ${order.customerName}'s order`}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-stone-500 transition hover:bg-cyan-300/10 hover:text-cyan-200 disabled:opacity-40"
                    >
                      <FaEdit aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      disabled={isBusy}
                      onClick={() => onDeleteOrder(order)}
                      aria-label={`Remove ${order.customerName}'s order`}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-stone-600 transition hover:bg-red-300/10 hover:text-red-200 disabled:opacity-40"
                    >
                      <FaTrash aria-hidden="true" />
                    </button>
                  </div>
                )}
              </div>

              {!isExpanded && orderedItems.length > 0 && (
                <div className="bangus-chip-scroll mt-2 flex gap-1.5 overflow-x-auto">
                  {orderedItems.map((item) => {
                    const product = products.find(
                      (candidate) => candidate.id === item.productId
                    );

                    return (
                      <span
                        key={item.productId}
                        className={`shrink-0 rounded-md border px-2 py-1 text-[0.65rem] ${
                          item.shortQuantity > 0
                            ? "border-rose-300/30 bg-rose-300/10 text-rose-100"
                            : getFlavorClasses(product?.flavor)
                        }`}
                      >
                        {item.quantity} ×{" "}
                        {product
                          ? getBangusProductAbbreviation(product)
                          : "Unavailable product"}
                        {item.shortQuantity > 0 &&
                          ` · ${item.shortQuantity} short`}
                      </span>
                    );
                  })}
                </div>
              )}

              {isExpanded && (
                <div
                  id={`mobile-order-${order.id}`}
                  className="mt-3 space-y-3"
                >
                  <div className="grid grid-cols-2 gap-2">
                    <label
                      className={`flex min-h-11 cursor-pointer items-center gap-2 rounded-lg border px-3 text-xs font-medium ${
                        order.repacked && hasShortage
                          ? "border-rose-300/35 bg-rose-300/[0.08] text-rose-100"
                          : order.repacked
                          ? "border-amber-300/30 bg-amber-300/[0.07] text-amber-100"
                          : "border-white/10 bg-black/10 text-stone-400"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={order.repacked}
                        disabled={isBusy || isSupplier}
                        onChange={(event) =>
                          onUpdateStatus(order, {
                            repacked: event.target.checked,
                          })
                        }
                        className={`h-3.5 w-3.5 ${
                          order.repacked && hasShortage
                            ? "accent-rose-300"
                            : "accent-amber-300"
                        }`}
                      />
                      <span>Repacked</span>
                      {order.repacked && hasShortage && (
                        <span className="ml-auto rounded-full bg-rose-300/15 px-1.5 py-0.5 text-[0.58rem] font-bold uppercase tracking-wide text-rose-200">
                          Short
                        </span>
                      )}
                    </label>
                    <label
                      className={`flex min-h-11 cursor-pointer items-center gap-2 rounded-lg border px-3 text-xs font-medium ${
                        order.received
                          ? "border-violet-300/30 bg-violet-300/[0.07] text-violet-100"
                          : "border-white/10 bg-black/10 text-stone-400"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={order.received}
                        disabled={isBusy || isSupplier}
                        onChange={(event) =>
                          onUpdateStatus(order, {
                            received: event.target.checked,
                          })
                        }
                        className="h-3.5 w-3.5 accent-violet-300"
                      />
                      Received
                    </label>
                    {!isSupplier && (
                      <label
                        className={`flex min-h-11 cursor-pointer items-center gap-2 rounded-lg border px-3 text-xs font-medium ${
                          order.paid
                            ? "border-cyan-300/30 bg-cyan-300/[0.07] text-cyan-100"
                            : "border-white/10 bg-black/10 text-stone-400"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={order.paid}
                          disabled={isBusy}
                          onChange={(event) =>
                            onUpdateStatus(order, {
                              paid: event.target.checked,
                            })
                          }
                          className="h-3.5 w-3.5 accent-cyan-300"
                        />
                        Paid
                      </label>
                    )}
                    {!isSupplier && (
                      <PaymentMethodPicker
                        value={order.paymentMethod}
                        disabled={isBusy}
                        onChange={(paymentMethod) =>
                          onUpdateStatus(order, { paymentMethod })
                        }
                        label={`${order.customerName} payment method`}
                        compact
                      />
                    )}
                  </div>

                  <div className="overflow-hidden rounded-xl border border-white/[0.08] bg-black/15">
                    {orderedItems.map((item) => {
                      const product = products.find(
                        (candidate) => candidate.id === item.productId
                      );

                      return (
                        <div
                          key={item.productId}
                          className={`flex items-center justify-between gap-3 border-b border-l-2 border-b-white/[0.06] px-3 py-3 last:border-b-0 ${getFlavorAccentClasses(
                            product?.flavor
                          )}`}
                        >
                          <div className="min-w-0">
                            <p className="break-words text-sm font-semibold leading-5 text-stone-100">
                              {product?.name ?? "Unavailable product"}
                            </p>
                            {product && (
                              <div className="mt-1 flex flex-wrap items-center gap-1.5 text-[0.65rem] text-stone-500">
                                <span>{product.sizePack}</span>
                                {product.flavor && (
                                  <span
                                    className={`inline-flex rounded-full border px-2 py-0.5 font-bold uppercase tracking-wide ${getFlavorClasses(
                                      product.flavor
                                    )}`}
                                  >
                                    {product.flavor}
                                  </span>
                                )}
                                {product.pieces && (
                                  <span>· {product.pieces}</span>
                                )}
                              </div>
                            )}
                          </div>
                          <div className="shrink-0 text-right tabular-nums">
                            <p className="text-base font-bold text-white">
                              ×{item.quantity}
                            </p>
                            <p className="text-[0.6rem] uppercase tracking-wide text-stone-600">
                              ordered
                            </p>
                            {item.shortQuantity > 0 && (
                              <p className="mt-1 text-[0.68rem] font-bold text-rose-300">
                                {item.shortQuantity} short
                              </p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => onViewOrder(order.id)}
                      className="inline-flex min-h-9 items-center justify-center rounded-lg px-2 text-xs font-semibold text-cyan-200 transition hover:bg-cyan-300/10 hover:text-cyan-100"
                    >
                      View details
                    </button>
                  </div>
                </div>
              )}
            </article>
          );
        })}
      </div>

      {/* Desktop view */}
      <div className="bangus-order-grid hidden max-h-[65svh] max-w-full overflow-auto overscroll-contain md:block">
        <table className="w-max min-w-full border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-white/[0.08] bg-black/25 text-[0.68rem] uppercase tracking-[0.07em] text-stone-500">
              <th className="sticky left-0 top-0 z-30 min-w-56 border-r border-white/[0.08] bg-[#0d100f] px-5 py-4 font-semibold">
                Orders
              </th>
              {!isSupplier && (
                <th className="sticky top-0 z-20 min-w-32 bg-[#0d100f] px-4 py-4 text-right font-semibold">
                  Retail price
                </th>
              )}
              {showSupplierPrices && (
                <th className="sticky top-0 z-20 min-w-32 bg-[#0d100f] px-4 py-4 text-right font-semibold">
                  Supplier price
                </th>
              )}
              <th className="sticky top-0 z-20 min-w-24 bg-[#0d100f] px-4 py-4 text-center font-semibold">
                Repacked
              </th>
              <th className="sticky top-0 z-20 min-w-24 bg-[#0d100f] px-4 py-4 text-center font-semibold">
                Received
              </th>
              {!isSupplier && (
                <th className="sticky top-0 z-20 min-w-20 bg-[#0d100f] px-4 py-4 text-center font-semibold">
                  Paid
                </th>
              )}
              {!isSupplier && (
                <th className="sticky top-0 z-20 min-w-36 border-r border-white/[0.08] bg-[#0d100f] px-4 py-4 font-semibold">
                  Payment method
                </th>
              )}
              {products.map((product) => (
                <th
                  key={product.id}
                  title={getBangusProductFullLabel(product)}
                  className="sticky top-0 z-20 min-w-24 border-r border-white/[0.06] bg-[#0d100f] px-2 py-4 text-center font-semibold text-cyan-200"
                >
                  {getBangusProductAbbreviation(product)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.06]">
            {filteredOrders.map((order) => {
              const itemByProductId = new Map(
                order.items.map((item) => [item.productId, item])
              );
              const isBusy = busyOrderId === order.id;
              const hasShortage = hasOrderShortage(order);

              return (
                <tr
                  key={order.id}
                  className="transition hover:bg-white/[0.025]"
                >
                  <td className="sticky left-0 z-10 border-r border-white/[0.08] bg-[#111615] px-5 py-3">
                    <div className="flex items-center justify-between gap-3">
                      <button
                        type="button"
                        onClick={() => onViewOrder(order.id)}
                        className="min-w-0 text-left font-medium text-stone-100 underline-offset-4 transition hover:text-cyan-200 hover:underline focus-visible:text-cyan-200"
                      >
                        {order.customerName}
                      </button>
                      {!isSupplier && (
                        <div className="flex shrink-0">
                          <button
                            type="button"
                            disabled={isBusy}
                            onClick={() => onEditOrder(order)}
                            aria-label={`Edit ${order.customerName}'s order`}
                            className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-stone-500 transition hover:bg-cyan-300/10 hover:text-cyan-200 disabled:opacity-40"
                          >
                            <FaEdit aria-hidden="true" />
                          </button>
                          <button
                            type="button"
                            disabled={isBusy}
                            onClick={() => onDeleteOrder(order)}
                            aria-label={`Remove ${order.customerName}'s order`}
                            className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-stone-600 transition hover:bg-red-300/10 hover:text-red-200 disabled:opacity-40"
                          >
                            <FaTrash aria-hidden="true" />
                          </button>
                        </div>
                      )}
                    </div>
                  </td>
                  {!isSupplier && (
                    <td className="px-4 py-3 text-right font-semibold tabular-nums text-emerald-300">
                      {formatCurrency(order.retailTotal)}
                    </td>
                  )}
                  {showSupplierPrices && (
                    <td className="px-4 py-3 text-right tabular-nums text-stone-400">
                      {formatCurrency(order.supplierTotal)}
                    </td>
                  )}
                  <td className="px-4 py-3 text-center">
                    <label className="inline-flex cursor-pointer items-center">
                      <span className="sr-only">
                        {order.customerName} repacked
                      </span>
                      <input
                        type="checkbox"
                        checked={order.repacked}
                        disabled={isBusy || isSupplier}
                        onChange={(event) =>
                          onUpdateStatus(order, {
                            repacked: event.target.checked,
                          })
                        }
                        title={
                          order.repacked && hasShortage
                            ? "Repacked with short or missing products"
                            : undefined
                        }
                        className={`h-4 w-4 ${
                          order.repacked && hasShortage
                            ? "accent-rose-300"
                            : "accent-amber-300"
                        }`}
                      />
                    </label>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <label className="inline-flex cursor-pointer items-center">
                      <span className="sr-only">
                        {order.customerName} received
                      </span>
                      <input
                        type="checkbox"
                        checked={order.received}
                        disabled={isBusy || isSupplier}
                        onChange={(event) =>
                          onUpdateStatus(order, {
                            received: event.target.checked,
                          })
                        }
                        className="h-4 w-4 accent-cyan-300"
                      />
                    </label>
                  </td>
                  {!isSupplier && (
                    <td className="px-4 py-3 text-center">
                      <label className="inline-flex cursor-pointer items-center">
                        <span className="sr-only">
                          {order.customerName} paid
                        </span>
                        <input
                          type="checkbox"
                          checked={order.paid}
                          disabled={isBusy}
                          onChange={(event) =>
                            onUpdateStatus(order, {
                              paid: event.target.checked,
                            })
                          }
                          className="h-4 w-4 accent-cyan-300"
                        />
                      </label>
                    </td>
                  )}
                  {!isSupplier && (
                    <td className="border-r border-white/[0.08] px-4 py-3">
                      <PaymentMethodPicker
                        value={order.paymentMethod}
                        disabled={isBusy}
                        onChange={(paymentMethod) =>
                          onUpdateStatus(order, {
                            paymentMethod,
                          })
                        }
                        label={`${order.customerName} payment method`}
                        compact
                      />
                    </td>
                  )}
                  {products.map((product) => {
                    const item = itemByProductId.get(product.id);
                    const isShort = (item?.shortQuantity ?? 0) > 0;

                    return (
                      <td
                        key={product.id}
                        title={
                          isShort
                            ? `${item!.shortQuantity} short or missing`
                            : undefined
                        }
                        className={`border-r border-white/[0.05] px-3 py-3 text-center font-medium tabular-nums ${
                          isShort
                            ? "bg-rose-300/[0.08] text-rose-100"
                            : "text-stone-300"
                        }`}
                      >
                        <span className="block">{item?.quantity || "—"}</span>
                        {isShort && (
                          <span className="mt-0.5 block text-[0.62rem] font-semibold uppercase tracking-wide text-rose-300">
                            {item!.shortQuantity} short
                          </span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr className="border-t border-white/[0.1] bg-black/20 font-semibold">
              <th className="sticky left-0 z-10 border-r border-white/[0.08] bg-[#0d100f] px-5 py-4 text-xs uppercase tracking-[0.08em] text-stone-400">
                Totals
              </th>
              {!isSupplier && (
                <td className="px-4 py-4 text-right tabular-nums text-emerald-300">
                  {formatCurrency(tableTotals.retail)}
                </td>
              )}
              {showSupplierPrices && (
                <td className="px-4 py-4 text-right tabular-nums text-stone-300">
                  {formatCurrency(tableTotals.supplier)}
                </td>
              )}
              <td className="px-4 py-4 text-center text-amber-200">
                {tableTotals.repacked}
              </td>
              <td className="px-4 py-4 text-center text-cyan-200">
                {tableTotals.received}
              </td>
              {!isSupplier && (
                <td className="px-4 py-4 text-center text-cyan-200">
                  {tableTotals.paid}
                </td>
              )}
              {!isSupplier && (
                <td className="border-r border-white/[0.08] px-4 py-4 text-stone-600">
                  —
                </td>
              )}
              {products.map((product) => {
                const productTotals = filteredOrders.reduce(
                  (totals, order) => {
                    const item = order.items.find(
                      (candidate) => candidate.productId === product.id
                    );
                    return {
                      quantity: totals.quantity + (item?.quantity ?? 0),
                      shortQuantity:
                        totals.shortQuantity + (item?.shortQuantity ?? 0),
                    };
                  },
                  { quantity: 0, shortQuantity: 0 }
                );

                return (
                  <td
                    key={product.id}
                    className={`border-r border-white/[0.05] px-3 py-4 text-center tabular-nums ${
                      productTotals.shortQuantity > 0
                        ? "bg-rose-300/[0.08] text-rose-100"
                        : "text-cyan-200"
                    }`}
                  >
                    <span className="block">{productTotals.quantity}</span>
                    {productTotals.shortQuantity > 0 && (
                      <span className="mt-0.5 block text-[0.62rem] font-semibold uppercase tracking-wide text-rose-300">
                        {productTotals.shortQuantity} short
                      </span>
                    )}
                  </td>
                );
              })}
            </tr>
          </tfoot>
        </table>
      </div>

      <footer className="flex items-center justify-end border-t border-white/[0.08] px-3 py-2 sm:justify-between sm:px-6 sm:py-4">
        <p className="hidden text-xs text-stone-600 sm:block">
          Product headings are abbreviated. Hover over one to see its
          full catalog name.
        </p>
        {!isSupplier && (
          <button
            type="button"
            onClick={onDeleteDeliveryTable}
            className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl px-3 text-xs font-semibold text-stone-600 transition hover:bg-red-300/10 hover:text-red-200"
          >
            <FaTrash aria-hidden="true" />
            Delete this date table
          </button>
        )}
      </footer>
    </>
  );
}

"use client";

import { useMemo, useState } from "react";
import { FaBoxOpen, FaTruck } from "react-icons/fa";
import { getBangusProductFullLabel } from "@/lib/bangus/product-label";
import type {
  BangusSupplierDeliveryTableRecord,
  BangusSupplierProductRecord,
} from "@/types/bangus";

interface SupplierOrdersDashboardProps {
  deliveryTables: BangusSupplierDeliveryTableRecord[];
  products: BangusSupplierProductRecord[];
}

const formatDeliveryDate = (value: string) =>
  new Intl.DateTimeFormat("en-PH", {
    timeZone: "UTC",
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date(`${value}T00:00:00.000Z`));

export function SupplierOrdersDashboard({
  deliveryTables,
  products,
}: SupplierOrdersDashboardProps) {
  const [selectedTableId, setSelectedTableId] = useState(
    deliveryTables[0]?.id ?? ""
  );
  const selectedTable =
    deliveryTables.find((table) => table.id === selectedTableId) ??
    deliveryTables[0] ??
    null;
  const productById = useMemo(
    () => new Map(products.map((product) => [product.id, product])),
    [products]
  );

  return (
    <section className="overflow-hidden rounded-2xl border border-white/[0.08] bg-[#111615]">
      <header className="border-b border-white/[0.08] p-4 sm:p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-amber-300">
          Supplier view
        </p>
        <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-white">
              {selectedTable?.name || "No order table yet"}
            </h2>
            {selectedTable && (
              <p className="mt-1 text-sm text-stone-500">
                {formatDeliveryDate(selectedTable.deliveryDate)} · {selectedTable.orders.length} customer orders
              </p>
            )}
          </div>
          {deliveryTables.length > 0 && (
            <label>
              <span className="sr-only">Choose delivery table</span>
              <select
                value={selectedTable?.id ?? ""}
                onChange={(event) => setSelectedTableId(event.target.value)}
                className="min-h-11 w-full rounded-xl border border-white/10 bg-[#0b0e0d] px-3 text-sm text-stone-200 outline-none focus:border-amber-300 sm:w-72"
              >
                {deliveryTables.map((table) => (
                  <option key={table.id} value={table.id}>
                    {table.name} · {formatDeliveryDate(table.deliveryDate)}
                  </option>
                ))}
              </select>
            </label>
          )}
        </div>
      </header>

      {!selectedTable ? (
        <div className="px-5 py-16 text-center">
          <FaTruck aria-hidden="true" className="mx-auto text-4xl text-stone-700" />
          <p className="mt-4 font-medium text-stone-300">No orders are available yet.</p>
        </div>
      ) : selectedTable.orders.length === 0 ? (
        <div className="px-5 py-16 text-center">
          <FaBoxOpen aria-hidden="true" className="mx-auto text-4xl text-stone-700" />
          <p className="mt-4 font-medium text-stone-300">This delivery table has no orders yet.</p>
        </div>
      ) : (
        <div className="divide-y divide-white/[0.08]">
          {selectedTable.orders.map((order) => (
            <article key={order.id} className="p-4 sm:px-6">
              <div className="flex items-center justify-between gap-3">
                <h3 className="font-semibold text-white">{order.customerName}</h3>
                <span
                  className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${
                    order.repacked
                      ? "border-amber-300/30 bg-amber-300/10 text-amber-100"
                      : "border-white/10 text-stone-500"
                  }`}
                >
                  {order.repacked ? "Repacked" : "For repacking"}
                </span>
              </div>
              <ul className="mt-3 flex flex-wrap gap-2">
                {order.items
                  .filter((item) => item.quantity > 0)
                  .map((item) => {
                    const product = productById.get(item.productId);
                    return (
                      <li
                        key={item.productId}
                        className="rounded-lg border border-white/[0.08] bg-black/20 px-3 py-2 text-sm text-stone-200"
                      >
                        <span className="font-semibold text-amber-200">{item.quantity}×</span>{" "}
                        {product
                          ? getBangusProductFullLabel(product)
                          : "Unavailable product"}
                      </li>
                    );
                  })}
              </ul>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

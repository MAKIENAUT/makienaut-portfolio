"use client";

import { type FormEvent } from "react";
import {
  FaCalendarAlt,
  FaChartBar,
  FaEye,
  FaEyeSlash,
  FaFileDownload,
  FaPlus,
  FaSyncAlt,
} from "react-icons/fa";
import { formatCurrency } from "@/lib/common/formatters";
import type { BangusDeliveryTableRecord } from "@/types/bangus";
import {
  formatDeliveryDate,
  formatTableLabel,
  type TableTotals,
} from "./types";

interface OrdersTableHeaderProps {
  selectedTable: BangusDeliveryTableRecord | null;
  deliveryTables: BangusDeliveryTableRecord[];
  isSupplier: boolean;
  showSupplierPrices: boolean;
  isRefreshing: boolean;
  isLoadingMetrics: boolean;
  showDateForm: boolean;
  newTableName: string;
  newDeliveryDate: string;
  isCreatingTable: boolean;
  onSelectTable: (tableId: string) => void;
  onOpenNewOrder: () => void;
  onToggleSupplierPrices: () => void;
  onOpenProductMetrics: () => void;
  onToggleDateForm: () => void;
  onRefreshTables: () => void;
  onExportSupplierOrder: () => void;
  onCreateDeliveryTable: (event: FormEvent<HTMLFormElement>) => void;
  onNewTableNameChange: (name: string) => void;
  onNewDeliveryDateChange: (date: string) => void;
  onCloseDateForm: () => void;
}

export function OrdersTableHeader({
  selectedTable,
  deliveryTables,
  isSupplier,
  showSupplierPrices,
  isRefreshing,
  isLoadingMetrics,
  showDateForm,
  newTableName,
  newDeliveryDate,
  isCreatingTable,
  onSelectTable,
  onOpenNewOrder,
  onToggleSupplierPrices,
  onOpenProductMetrics,
  onToggleDateForm,
  onRefreshTables,
  onExportSupplierOrder,
  onCreateDeliveryTable,
  onNewTableNameChange,
  onNewDeliveryDateChange,
  onCloseDateForm,
}: OrdersTableHeaderProps) {
  return (
    <>
      <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <div className="min-w-0">
          <p className="hidden text-xs font-semibold uppercase tracking-[0.16em] text-cyan-300 sm:block">
            Delivery tables
          </p>
          <h2 className="truncate text-base font-semibold text-white sm:mt-2 sm:text-xl">
            {selectedTable
              ? selectedTable.name
              : "Create your first order table"}
          </h2>
          <p className="mt-0.5 text-xs text-stone-500 sm:mt-1 sm:text-sm">
            {selectedTable
              ? `${formatDeliveryDate(selectedTable.deliveryDate)} · ${
                  selectedTable.orders.length
                } customer ${
                  selectedTable.orders.length === 1 ? "order" : "orders"
                }`
              : "Give each order table a name and delivery date."}
          </p>
        </div>

        <div className="flex flex-wrap gap-2 sm:flex-nowrap">
          {deliveryTables.length > 0 && (
            <label className="min-w-0 basis-full sm:flex-1 sm:basis-auto">
              <span className="sr-only">Choose delivery table</span>
              <select
                value={selectedTable?.id ?? ""}
                onChange={(event) => onSelectTable(event.target.value)}
                className="min-h-10 w-full rounded-lg border border-white/10 bg-[#0b0e0d] px-3 text-sm text-stone-200 outline-none focus:border-cyan-300 sm:min-h-11 sm:w-64 sm:rounded-xl"
              >
                {deliveryTables.map((table) => (
                  <option key={table.id} value={table.id}>
                    {formatTableLabel(table)}
                  </option>
                ))}
              </select>
            </label>
          )}
          {selectedTable && !isSupplier && (
            <button
              type="button"
              onClick={onOpenNewOrder}
              className="inline-flex min-h-10 flex-1 items-center justify-center gap-2 rounded-lg bg-cyan-300 px-4 text-sm font-bold text-[#071211] transition hover:bg-cyan-200 sm:min-h-11 sm:flex-none sm:rounded-xl"
            >
              <FaPlus aria-hidden="true" />
              Add order
            </button>
          )}
          {selectedTable && !isSupplier && (
            <button
              type="button"
              onClick={onToggleSupplierPrices}
              aria-pressed={showSupplierPrices}
              aria-label={
                showSupplierPrices
                  ? "Hide supplier prices"
                  : "Show supplier prices"
              }
              className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-white/10 text-sm text-stone-300 transition hover:border-cyan-300/30 hover:text-cyan-200 sm:min-h-11 sm:w-auto sm:gap-2 sm:rounded-xl sm:px-4"
            >
              {showSupplierPrices ? (
                <FaEyeSlash aria-hidden="true" />
              ) : (
                <FaEye aria-hidden="true" />
              )}
              <span className="sr-only sm:not-sr-only">
                {showSupplierPrices ? "Hide supplier" : "Show supplier"}
              </span>
            </button>
          )}
          {selectedTable && !isSupplier && (
            <button
              type="button"
              onClick={onOpenProductMetrics}
              disabled={isLoadingMetrics}
              title="Product metrics"
              className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-amber-300/30 text-sm text-amber-200 transition hover:bg-amber-300/10 disabled:cursor-wait disabled:opacity-60 sm:min-h-11 sm:w-auto sm:gap-2 sm:rounded-xl sm:px-4"
            >
              <FaChartBar aria-hidden="true" />
              <span className="sr-only sm:not-sr-only">
                {isLoadingMetrics ? "Loading…" : "Product metrics"}
              </span>
            </button>
          )}
          {!isSupplier && (
            <button
              type="button"
              onClick={onToggleDateForm}
              aria-label="Create a new order table"
              title="New order table"
              className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-cyan-300/30 text-sm text-cyan-200 transition hover:bg-cyan-300/10 sm:min-h-11 sm:w-auto sm:gap-2 sm:rounded-xl sm:px-4"
            >
              <FaCalendarAlt aria-hidden="true" />
              <span className="sr-only sm:not-sr-only">New table</span>
            </button>
          )}
          {!isSupplier && (
            <button
              type="button"
              disabled={isRefreshing}
              onClick={onRefreshTables}
              aria-label="Refresh delivery tables"
              className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-white/10 text-sm text-stone-300 transition hover:border-cyan-300/30 hover:text-cyan-200 disabled:cursor-wait disabled:opacity-60 sm:min-h-11 sm:w-auto sm:gap-2 sm:rounded-xl sm:px-4"
            >
              <FaSyncAlt
                aria-hidden="true"
                className={isRefreshing ? "animate-spin" : ""}
              />
              <span className="sr-only sm:not-sr-only">Refresh</span>
            </button>
          )}
          {selectedTable && (
            <button
              type="button"
              disabled={selectedTable.orders.length === 0}
              onClick={onExportSupplierOrder}
              title="Download the supplier order as Markdown"
              className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-emerald-300/30 text-sm text-emerald-200 transition hover:bg-emerald-300/10 disabled:cursor-not-allowed disabled:opacity-40 sm:min-h-11 sm:w-auto sm:gap-2 sm:rounded-xl sm:px-4"
            >
              <FaFileDownload aria-hidden="true" />
              <span className="sr-only sm:not-sr-only">Supplier order</span>
            </button>
          )}
        </div>
      </div>

      {!isSupplier && showDateForm && (
        <form
          onSubmit={onCreateDeliveryTable}
          className="mt-3 grid gap-2 rounded-lg border border-cyan-300/15 bg-cyan-300/[0.04] p-3 sm:mt-5 sm:grid-cols-[minmax(0,1fr)_auto_auto] sm:items-end sm:gap-3 sm:rounded-xl sm:p-4"
        >
          <label className="sm:col-span-3">
            <span className="text-sm font-medium text-stone-300">
              Order table name
            </span>
            <input
              required
              maxLength={120}
              value={newTableName}
              onChange={(event) => onNewTableNameChange(event.target.value)}
              placeholder="e.g. August 3 pickup orders"
              className="mt-1 min-h-10 w-full rounded-lg border border-white/10 bg-[#0b0e0d] px-3 text-sm text-white outline-none placeholder:text-stone-600 focus:border-cyan-300 sm:mt-2 sm:min-h-11 sm:rounded-xl"
            />
          </label>
          <label className="flex-1">
            <span className="text-sm font-medium text-stone-300">
              Delivery date
            </span>
            <input
              required
              type="date"
              value={newDeliveryDate}
              onChange={(event) => onNewDeliveryDateChange(event.target.value)}
              className="mt-1 min-h-10 w-full rounded-lg border border-white/10 bg-[#0b0e0d] px-3 text-sm text-white outline-none focus:border-cyan-300 sm:mt-2 sm:min-h-11 sm:rounded-xl"
            />
          </label>
          {!isSupplier && (
            <button
              type="submit"
              disabled={isCreatingTable}
              className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg bg-cyan-300 px-5 text-sm font-bold text-[#071211] transition hover:bg-cyan-200 disabled:cursor-wait disabled:opacity-60 sm:min-h-11 sm:rounded-xl"
            >
              <FaPlus aria-hidden="true" />
              {isCreatingTable ? "Creating…" : "Create table"}
            </button>
          )}
          {deliveryTables.length > 0 && (
            <button
              type="button"
              onClick={onCloseDateForm}
              className="inline-flex min-h-11 items-center justify-center rounded-xl px-4 text-sm font-semibold text-stone-400 transition hover:text-white"
            >
              Cancel
            </button>
          )}
        </form>
      )}
    </>
  );
}

interface OrdersTableMetricsProps {
  isSupplier: boolean;
  showSupplierPrices: boolean;
  tableTotals: TableTotals;
  filteredOrdersCount: number;
}

export function OrdersTableMetrics({
  isSupplier,
  showSupplierPrices,
  tableTotals,
  filteredOrdersCount,
}: OrdersTableMetricsProps) {
  const metricItems = [
    ...(!isSupplier
      ? [
          {
            label: "Retail total",
            value: formatCurrency(tableTotals.retail),
            classes: "text-emerald-300",
          },
        ]
      : []),
    {
      label: "Supplier total",
      value: showSupplierPrices
        ? formatCurrency(tableTotals.supplier)
        : "Hidden",
      classes: "text-stone-200",
    },
    ...(!isSupplier
      ? [
          {
            label: "Paid",
            value: `${tableTotals.paid}/${filteredOrdersCount}`,
            classes: "text-cyan-300",
          },
        ]
      : []),
    {
      label: "Repacked",
      value: `${tableTotals.repacked}/${filteredOrdersCount}`,
      classes: "text-amber-300",
    },
    {
      label: "Received",
      value: `${tableTotals.received}/${filteredOrdersCount}`,
      classes: "text-violet-300",
    },
  ];

  return (
    <section
      aria-label="Delivery table summary"
      className={`grid gap-px border-b border-white/[0.08] bg-white/[0.08] ${
        isSupplier ? "grid-cols-3" : "grid-cols-5"
      }`}
    >
      {metricItems.map((item) => (
        <article
          key={item.label}
          className="min-w-0 bg-[#101412] px-2 py-2.5 sm:p-4 sm:px-6"
        >
          <p className="truncate text-[0.62rem] text-stone-500 sm:text-xs">
            {item.label}
          </p>
          <p
            className={`mt-0.5 truncate text-sm font-semibold tabular-nums sm:mt-1 sm:text-xl ${item.classes}`}
          >
            {item.value}
          </p>
        </article>
      ))}
    </section>
  );
}

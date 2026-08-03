"use client";

import { FormEvent, useCallback, useMemo, useState } from "react";
import {
  FaCalendarAlt,
  FaEdit,
  FaEllipsisH,
  FaEye,
  FaEyeSlash,
  FaFileDownload,
  FaPlus,
  FaSearch,
  FaSyncAlt,
  FaTrash,
  FaTruck,
} from "react-icons/fa";
import { OrderDetailsModal } from "@/components/bangus/OrderDetailsModal";
import { OrderFormModal } from "@/components/bangus/OrderFormModal";
import { PaymentMethodPicker } from "@/components/bangus/PaymentMethodPicker";
import {
  getBangusProductAbbreviation,
  getBangusProductFullLabel,
} from "@/lib/bangus/product-label";
import { generateBangusSupplierOrderMarkdown } from "@/lib/bangus/supplier-order-markdown";
import {
  type BangusDeliveryTableRecord,
  type BangusOrderInput,
  type BangusOrderRecord,
  type BangusPaymentMethod,
  type BangusProductRecord,
} from "@/types/bangus";

interface OrdersTabProps {
  products: BangusProductRecord[];
  initialDeliveryTables: BangusDeliveryTableRecord[];
}

type PaymentStatusFilter = "ALL" | "PAID" | "UNPAID";
type ReceiptStatusFilter = "ALL" | "RECEIVED" | "NOT_RECEIVED";

const paymentLabels: Record<BangusPaymentMethod, string> = {
  GCASH: "GCash",
  CASH: "Cash",
  BANK: "Bank",
};

const formatPeso = (value: number) =>
  new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    maximumFractionDigits: 0,
  }).format(value);

const formatDeliveryDate = (value: string, includeWeekday = true) =>
  new Intl.DateTimeFormat("en-PH", {
    timeZone: "UTC",
    ...(includeWeekday ? { weekday: "long" as const } : {}),
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date(`${value}T00:00:00.000Z`));

const formatTableLabel = (table: BangusDeliveryTableRecord) =>
  `${table.name} · ${formatDeliveryDate(table.deliveryDate, false)}`;

const getManilaDate = () => {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Manila",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());
  const getPart = (type: string) =>
    parts.find((part) => part.type === type)?.value ?? "";
  return `${getPart("year")}-${getPart("month")}-${getPart("day")}`;
};

export function OrdersTab({
  products,
  initialDeliveryTables,
}: OrdersTabProps) {
  const [deliveryTables, setDeliveryTables] = useState(initialDeliveryTables);
  const [selectedTableId, setSelectedTableId] = useState(
    initialDeliveryTables[0]?.id ?? ""
  );
  const [newDeliveryDate, setNewDeliveryDate] = useState(getManilaDate);
  const [newTableName, setNewTableName] = useState("");
  const [showDateForm, setShowDateForm] = useState(
    initialDeliveryTables.length === 0
  );
  const [isCreatingTable, setIsCreatingTable] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [busyOrderId, setBusyOrderId] = useState<string>();
  const [error, setError] = useState("");
  const [isOrderFormOpen, setIsOrderFormOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState<BangusOrderRecord | null>(
    null
  );
  const [viewingOrderId, setViewingOrderId] = useState<string | null>(null);
  const [orderQuery, setOrderQuery] = useState("");
  const [paymentStatusFilter, setPaymentStatusFilter] =
    useState<PaymentStatusFilter>("ALL");
  const [receiptStatusFilter, setReceiptStatusFilter] =
    useState<ReceiptStatusFilter>("ALL");
  const [showSupplierPrices, setShowSupplierPrices] = useState(true);

  const selectedTable =
    deliveryTables.find((table) => table.id === selectedTableId) ??
    deliveryTables[0] ??
    null;
  const viewingOrder =
    selectedTable?.orders.find((order) => order.id === viewingOrderId) ?? null;

  const productColumns = products;

  const filteredOrders = useMemo(() => {
    const normalizedQuery = orderQuery.trim().toLowerCase();
    if (!selectedTable) return [];

    return selectedTable.orders.filter((order) => {
      const matchesQuery =
        !normalizedQuery ||
        [
          order.customerName,
          order.paymentMethod ? paymentLabels[order.paymentMethod] : "",
          order.paid ? "paid" : "unpaid",
          order.repacked ? "repacked" : "not repacked",
          order.received ? "received" : "not received",
          ...order.items.map((item) => {
            const product = productColumns.find(
              (candidate) => candidate.id === item.productId
            );
            return product ? getBangusProductFullLabel(product) : "";
          }),
        ].some((value) => value.toLowerCase().includes(normalizedQuery));
      const matchesPayment =
        paymentStatusFilter === "ALL" ||
        (paymentStatusFilter === "PAID" && order.paid) ||
        (paymentStatusFilter === "UNPAID" && !order.paid);
      const matchesReceipt =
        receiptStatusFilter === "ALL" ||
        (receiptStatusFilter === "RECEIVED" && order.received) ||
        (receiptStatusFilter === "NOT_RECEIVED" && !order.received);

      return matchesQuery && matchesPayment && matchesReceipt;
    });
  }, [
    orderQuery,
    paymentStatusFilter,
    productColumns,
    receiptStatusFilter,
    selectedTable,
  ]);

  const tableTotals = useMemo(() => {
    const orders = filteredOrders;
    return {
      retail: orders.reduce((total, order) => total + order.retailTotal, 0),
      supplier: orders.reduce((total, order) => total + order.supplierTotal, 0),
      paid: orders.filter((order) => order.paid).length,
      repacked: orders.filter((order) => order.repacked).length,
      received: orders.filter((order) => order.received).length,
    };
  }, [filteredOrders]);

  const replaceOrder = useCallback(
    (updatedOrder: BangusOrderRecord) => {
      if (!selectedTable) return;
      setDeliveryTables((current) =>
        current.map((table) =>
          table.id === selectedTable.id
            ? {
                ...table,
                orders: table.orders.map((order) =>
                  order.id === updatedOrder.id ? updatedOrder : order
                ),
              }
            : table
        )
      );
    },
    [selectedTable]
  );

  const refreshTables = useCallback(async () => {
    setIsRefreshing(true);
    setError("");

    try {
      const response = await fetch(
        "/api/bangus/backoffice/delivery-tables",
        { cache: "no-store" }
      );
      const result = (await response.json()) as {
        deliveryTables?: BangusDeliveryTableRecord[];
        message?: string;
      };
      if (!response.ok || !result.deliveryTables) {
        throw new Error(
          result.message || "Delivery tables could not be refreshed."
        );
      }

      setDeliveryTables(result.deliveryTables);
      setSelectedTableId((current) =>
        result.deliveryTables!.some((table) => table.id === current)
          ? current
          : result.deliveryTables![0]?.id ?? ""
      );
    } catch (refreshError) {
      setError(
        refreshError instanceof Error
          ? refreshError.message
          : "Delivery tables could not be refreshed."
      );
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  const createDeliveryTable = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsCreatingTable(true);
    setError("");

    try {
      const response = await fetch(
        "/api/bangus/backoffice/delivery-tables",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: newTableName,
            deliveryDate: newDeliveryDate,
          }),
        }
      );
      const result = (await response.json()) as {
        deliveryTable?: BangusDeliveryTableRecord;
        message?: string;
      };
      if (!response.ok || !result.deliveryTable) {
        throw new Error(result.message || "Delivery table could not be created.");
      }

      setDeliveryTables((current) =>
        [...current, result.deliveryTable!].sort((a, b) =>
          b.deliveryDate.localeCompare(a.deliveryDate)
        )
      );
      setSelectedTableId(result.deliveryTable.id);
      setNewTableName("");
      setShowDateForm(false);
    } catch (createError) {
      setError(
        createError instanceof Error
          ? createError.message
          : "Delivery table could not be created."
      );
    } finally {
      setIsCreatingTable(false);
    }
  };

  const deleteDeliveryTable = async () => {
    if (
      !selectedTable ||
      !window.confirm(
        `Remove “${selectedTable.name}” and all ${selectedTable.orders.length} orders in it?`
      )
    ) {
      return;
    }

    setError("");
    try {
      const response = await fetch(
        `/api/bangus/backoffice/delivery-tables/${selectedTable.id}`,
        { method: "DELETE" }
      );
      if (!response.ok) {
        const result = (await response.json().catch(() => null)) as {
          message?: string;
        } | null;
        throw new Error(result?.message || "Delivery table could not be removed.");
      }

      setDeliveryTables((current) => {
        const next = current.filter((table) => table.id !== selectedTable.id);
        setSelectedTableId(next[0]?.id ?? "");
        return next;
      });
    } catch (deleteError) {
      setError(
        deleteError instanceof Error
          ? deleteError.message
          : "Delivery table could not be removed."
      );
    }
  };

  const saveOrder = async (input: BangusOrderInput) => {
    if (!selectedTable) throw new Error("Choose a delivery table first.");

    const endpoint = editingOrder
      ? `/api/bangus/backoffice/orders/${editingOrder.id}`
      : `/api/bangus/backoffice/delivery-tables/${selectedTable.id}/orders`;
    const response = await fetch(endpoint, {
      method: editingOrder ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    const result = (await response.json()) as {
      order?: BangusOrderRecord;
      message?: string;
    };
    if (!response.ok || !result.order) {
      throw new Error(result.message || "Order could not be saved.");
    }

    setDeliveryTables((current) =>
      current.map((table) =>
        table.id === selectedTable.id
          ? {
              ...table,
              orders: editingOrder
                ? table.orders.map((order) =>
                    order.id === result.order!.id ? result.order! : order
                  )
                : [...table.orders, result.order!],
            }
          : table
      )
    );
  };

  const updateStatus = async (
    order: BangusOrderRecord,
    changes: Partial<
      Pick<
        BangusOrderRecord,
        "repacked" | "received" | "paid" | "paymentMethod"
      >
    >
  ) => {
    setBusyOrderId(order.id);
    setError("");

    const paymentMethod =
      changes.paymentMethod === undefined
        ? order.paymentMethod
        : changes.paymentMethod;
    const paid =
      changes.paymentMethod === undefined
        ? (changes.paid ?? order.paid)
        : paymentMethod !== null;

    try {
      const response = await fetch(
        `/api/bangus/backoffice/orders/${order.id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            repacked: changes.repacked ?? order.repacked,
            received: changes.received ?? order.received,
            paid,
            paymentMethod,
          }),
        }
      );
      const result = (await response.json()) as {
        order?: BangusOrderRecord;
        message?: string;
      };
      if (!response.ok || !result.order) {
        throw new Error(result.message || "Order status could not be updated.");
      }
      replaceOrder(result.order);
    } catch (updateError) {
      setError(
        updateError instanceof Error
          ? updateError.message
          : "Order status could not be updated."
      );
    } finally {
      setBusyOrderId(undefined);
    }
  };

  const deleteOrder = async (order: BangusOrderRecord) => {
    if (!selectedTable || !window.confirm(`Remove ${order.customerName}'s order?`)) {
      return;
    }
    setBusyOrderId(order.id);
    setError("");

    try {
      const response = await fetch(
        `/api/bangus/backoffice/orders/${order.id}`,
        { method: "DELETE" }
      );
      if (!response.ok) {
        const result = (await response.json().catch(() => null)) as {
          message?: string;
        } | null;
        throw new Error(result?.message || "Order could not be removed.");
      }
      setDeliveryTables((current) =>
        current.map((table) =>
          table.id === selectedTable.id
            ? {
                ...table,
                orders: table.orders.filter((item) => item.id !== order.id),
              }
            : table
        )
      );
      if (viewingOrderId === order.id) setViewingOrderId(null);
    } catch (deleteError) {
      setError(
        deleteError instanceof Error
          ? deleteError.message
          : "Order could not be removed."
      );
    } finally {
      setBusyOrderId(undefined);
    }
  };

  const openNewOrder = () => {
    setEditingOrder(null);
    setIsOrderFormOpen(true);
  };

  const openEditOrder = (order: BangusOrderRecord) => {
    setEditingOrder(order);
    setIsOrderFormOpen(true);
  };

  const exportSupplierOrder = () => {
    if (!selectedTable || selectedTable.orders.length === 0) return;

    const markdown = generateBangusSupplierOrderMarkdown(
      selectedTable,
      products
    );
    const file = new Blob([markdown], {
      type: "text/markdown;charset=utf-8",
    });
    const url = URL.createObjectURL(file);
    const link = document.createElement("a");
    link.href = url;
    link.download = `bangus-supplier-order-${selectedTable.deliveryDate}.md`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1_000);
  };

  return (
    <>
      <section className="min-w-0 overflow-hidden rounded-xl border border-white/[0.08] bg-[#111615] sm:rounded-2xl">
        <header className="border-b border-white/[0.08] p-3 sm:p-6">
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
                    onChange={(event) => {
                      setSelectedTableId(event.target.value);
                      setViewingOrderId(null);
                    }}
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
              {selectedTable && (
                <button
                  type="button"
                  onClick={openNewOrder}
                  className="inline-flex min-h-10 flex-1 items-center justify-center gap-2 rounded-lg bg-cyan-300 px-4 text-sm font-bold text-[#071211] transition hover:bg-cyan-200 sm:min-h-11 sm:flex-none sm:rounded-xl"
                >
                  <FaPlus aria-hidden="true" />
                  Add order
                </button>
              )}
              <button
                type="button"
                onClick={() => setShowDateForm((current) => !current)}
                aria-label="Create a new order table"
                title="New order table"
                className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-cyan-300/30 text-sm text-cyan-200 transition hover:bg-cyan-300/10 sm:min-h-11 sm:w-auto sm:gap-2 sm:rounded-xl sm:px-4"
              >
                <FaCalendarAlt aria-hidden="true" />
                <span className="sr-only sm:not-sr-only">New table</span>
              </button>
              <details className="group relative shrink-0">
                <summary
                  aria-label="More table actions"
                  className="flex h-10 w-10 cursor-pointer list-none items-center justify-center rounded-lg border border-white/10 text-stone-300 transition hover:border-cyan-300/30 hover:text-cyan-200 sm:hidden [&::-webkit-details-marker]:hidden"
                >
                  <FaEllipsisH aria-hidden="true" />
                </summary>
                <div className="absolute right-0 top-12 z-30 grid w-56 gap-1 rounded-xl border border-white/10 bg-[#171c1a] p-2 shadow-2xl sm:static sm:flex sm:w-auto sm:bg-transparent sm:p-0 sm:shadow-none">
                  <button
                    type="button"
                    disabled={isRefreshing}
                    onClick={() => void refreshTables()}
                    className="inline-flex min-h-10 items-center gap-3 rounded-lg px-3 text-left text-sm font-semibold text-stone-300 transition hover:bg-white/[0.05] hover:text-cyan-200 disabled:cursor-wait disabled:opacity-60 sm:min-h-11 sm:justify-center sm:gap-2 sm:rounded-xl sm:border sm:border-white/10"
                  >
                    <FaSyncAlt aria-hidden="true" className={isRefreshing ? "animate-spin" : ""} />
                    Refresh
                  </button>
                  {selectedTable && (
                    <>
                      <button
                        type="button"
                        onClick={() => setShowSupplierPrices((current) => !current)}
                        className="inline-flex min-h-10 items-center gap-3 rounded-lg px-3 text-left text-sm font-semibold text-stone-300 transition hover:bg-white/[0.05] hover:text-cyan-200 sm:min-h-11 sm:justify-center sm:gap-2 sm:rounded-xl sm:border sm:border-white/10"
                        aria-pressed={showSupplierPrices}
                      >
                        {showSupplierPrices ? <FaEyeSlash aria-hidden="true" /> : <FaEye aria-hidden="true" />}
                        {showSupplierPrices ? "Hide supplier" : "Show supplier"}
                      </button>
                      <button
                        type="button"
                        disabled={selectedTable.orders.length === 0}
                        onClick={exportSupplierOrder}
                        title="Download the supplier order as Markdown"
                        className="inline-flex min-h-10 items-center gap-3 rounded-lg px-3 text-left text-sm font-semibold text-emerald-200 transition hover:bg-emerald-300/10 disabled:cursor-not-allowed disabled:opacity-40 sm:min-h-11 sm:justify-center sm:gap-2 sm:rounded-xl sm:border sm:border-emerald-300/30"
                      >
                        <FaFileDownload aria-hidden="true" />
                        Supplier order
                      </button>
                    </>
                  )}
                </div>
              </details>
            </div>
          </div>

          {showDateForm && (
            <form
              onSubmit={createDeliveryTable}
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
                  onChange={(event) => setNewTableName(event.target.value)}
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
                  onChange={(event) => setNewDeliveryDate(event.target.value)}
                  className="mt-1 min-h-10 w-full rounded-lg border border-white/10 bg-[#0b0e0d] px-3 text-sm text-white outline-none focus:border-cyan-300 sm:mt-2 sm:min-h-11 sm:rounded-xl"
                />
              </label>
              <button
                type="submit"
                disabled={isCreatingTable}
                  className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg bg-cyan-300 px-5 text-sm font-bold text-[#071211] transition hover:bg-cyan-200 disabled:cursor-wait disabled:opacity-60 sm:min-h-11 sm:rounded-xl"
              >
                <FaPlus aria-hidden="true" />
                {isCreatingTable ? "Creating…" : "Create table"}
              </button>
              {deliveryTables.length > 0 && (
                <button
                  type="button"
                  onClick={() => setShowDateForm(false)}
                  className="inline-flex min-h-11 items-center justify-center rounded-xl px-4 text-sm font-semibold text-stone-400 transition hover:text-white"
                >
                  Cancel
                </button>
              )}
            </form>
          )}

          {selectedTable && selectedTable.orders.length > 0 && (
            <div className="mt-3 grid gap-2 sm:mt-5 sm:grid-cols-[minmax(0,1fr)_auto_auto] sm:items-center">
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
                    onChange={(event) => setOrderQuery(event.target.value)}
                    placeholder="Search customer, item, or status…"
                    className="min-h-10 w-full rounded-lg border border-white/10 bg-black/30 py-2 pl-11 pr-4 text-sm text-white outline-none placeholder:text-stone-600 focus:border-cyan-300 focus:ring-2 focus:ring-cyan-300/15 sm:min-h-11 sm:rounded-xl"
                  />
                </div>
              </label>
              <label>
                <span className="sr-only">Filter by payment status</span>
                <select
                  value={paymentStatusFilter}
                  onChange={(event) =>
                    setPaymentStatusFilter(
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
              <label>
                <span className="sr-only">Filter by receipt status</span>
                <select
                  value={receiptStatusFilter}
                  onChange={(event) =>
                    setReceiptStatusFilter(
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
              {(orderQuery ||
                paymentStatusFilter !== "ALL" ||
                receiptStatusFilter !== "ALL") && (
                <p className="text-xs text-stone-500 sm:col-span-3">
                  {filteredOrders.length} of {selectedTable.orders.length} orders shown
                </p>
              )}
            </div>
          )}

          {error && (
            <p
              role="alert"
              className="mt-4 rounded-xl border border-red-400/20 bg-red-400/10 p-3 text-sm text-red-100"
            >
              {error}
            </p>
          )}
        </header>

        {!selectedTable ? (
          <div className="px-5 py-16 text-center">
            <FaTruck
              aria-hidden="true"
              className="mx-auto text-4xl text-stone-700"
            />
            <p className="mt-4 font-medium text-stone-300">
              No delivery tables yet.
            </p>
            <p className="mt-1 text-sm text-stone-600">
              Pick a delivery date above to start taking orders.
            </p>
          </div>
        ) : (
          <>
            <section
              aria-label="Delivery table summary"
              className="grid grid-cols-5 gap-px border-b border-white/[0.08] bg-white/[0.08]"
            >
              {[
                {
                  label: "Retail total",
                  value: formatPeso(tableTotals.retail),
                  classes: "text-emerald-300",
                },
                {
                  label: "Supplier total",
                  value: showSupplierPrices
                    ? formatPeso(tableTotals.supplier)
                    : "Hidden",
                  classes: "text-stone-200",
                },
                {
                  label: "Paid",
                  value: `${tableTotals.paid}/${filteredOrders.length}`,
                  classes: "text-cyan-300",
                },
                {
                  label: "Repacked",
                  value: `${tableTotals.repacked}/${filteredOrders.length}`,
                  classes: "text-amber-300",
                },
                {
                  label: "Received",
                  value: `${tableTotals.received}/${filteredOrders.length}`,
                  classes: "text-violet-300",
                },
              ].map((item) => (
                <article key={item.label} className="min-w-0 bg-[#101412] px-2 py-2.5 sm:p-4 sm:px-6">
                  <p className="truncate text-[0.62rem] text-stone-500 sm:text-xs">{item.label}</p>
                  <p className={`mt-0.5 truncate text-sm font-semibold tabular-nums sm:mt-1 sm:text-xl ${item.classes}`}>
                    {item.value}
                  </p>
                </article>
              ))}
            </section>

            {selectedTable.orders.length === 0 ? (
              <div className="px-5 py-16 text-center">
                <FaTruck
                  aria-hidden="true"
                  className="mx-auto text-4xl text-stone-700"
                />
                <p className="mt-4 font-medium text-stone-300">
                  This delivery table has no orders.
                </p>
                <button
                  type="button"
                  onClick={openNewOrder}
                  className="mt-5 inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-cyan-300 px-5 text-sm font-bold text-[#071211] transition hover:bg-cyan-200"
                >
                  <FaPlus aria-hidden="true" />
                  Add the first order
                </button>
              </div>
            ) : filteredOrders.length === 0 ? (
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
                  onClick={() => {
                    setOrderQuery("");
                    setPaymentStatusFilter("ALL");
                    setReceiptStatusFilter("ALL");
                  }}
                  className="mt-4 text-sm font-semibold text-cyan-200 transition hover:text-cyan-100"
                >
                  Clear filters
                </button>
              </div>
            ) : (
              <>
              <div className="divide-y divide-white/[0.08] md:hidden">
                {filteredOrders.map((order) => {
                  const isBusy = busyOrderId === order.id;
                  const orderedItems = order.items.filter(
                    (item) => item.quantity > 0
                  );

                  return (
                    <article key={order.id} className="p-3">
                      <div className="flex items-start gap-2">
                        <button
                          type="button"
                          onClick={() => setViewingOrderId(order.id)}
                          className="min-w-0 flex-1 text-left underline-offset-4 transition hover:text-cyan-200 hover:underline focus-visible:text-cyan-200"
                        >
                          <span className="block truncate text-sm font-semibold text-white">
                            {order.customerName}
                          </span>
                          <span className="mt-0.5 block text-[0.65rem] text-stone-500">
                            {orderedItems.reduce((total, item) => total + item.quantity, 0)} item{orderedItems.reduce((total, item) => total + item.quantity, 0) === 1 ? "" : "s"} · Tap for details
                          </span>
                        </button>
                        <div className="shrink-0 text-right">
                          <p className="text-sm font-semibold tabular-nums text-emerald-300">
                            {formatPeso(order.retailTotal)}
                          </p>
                          {showSupplierPrices && (
                            <p className="text-[0.65rem] tabular-nums text-stone-500">
                              {formatPeso(order.supplierTotal)} cost
                            </p>
                          )}
                        </div>
                        <div className="flex shrink-0">
                          <button
                            type="button"
                            disabled={isBusy}
                            onClick={() => openEditOrder(order)}
                            aria-label={`Edit ${order.customerName}'s order`}
                            className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-stone-400 transition hover:bg-cyan-300/10 hover:text-cyan-200 disabled:opacity-40"
                          >
                            <FaEdit aria-hidden="true" />
                          </button>
                          <button
                            type="button"
                            disabled={isBusy}
                            onClick={() => void deleteOrder(order)}
                            aria-label={`Remove ${order.customerName}'s order`}
                            className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-stone-600 transition hover:bg-red-300/10 hover:text-red-200 disabled:opacity-40"
                          >
                            <FaTrash aria-hidden="true" />
                          </button>
                        </div>
                      </div>

                      <div className="mt-2 grid grid-cols-[1fr_1fr_1fr_minmax(0,1.15fr)] gap-1.5">
                        <label className={`flex min-h-10 cursor-pointer items-center justify-center gap-1.5 rounded-lg border px-2 text-[0.7rem] font-medium ${order.repacked ? "border-amber-300/30 bg-amber-300/10 text-amber-100" : "border-white/10 text-stone-400"}`}>
                          <input
                            type="checkbox"
                            checked={order.repacked}
                            disabled={isBusy}
                            onChange={(event) =>
                              void updateStatus(order, {
                                repacked: event.target.checked,
                              })
                            }
                            className="h-3.5 w-3.5 accent-amber-300"
                          />
                          Repacked
                        </label>
                        <label className={`flex min-h-10 cursor-pointer items-center justify-center gap-1.5 rounded-lg border px-2 text-[0.7rem] font-medium ${order.received ? "border-violet-300/30 bg-violet-300/10 text-violet-100" : "border-white/10 text-stone-400"}`}>
                          <input
                            type="checkbox"
                            checked={order.received}
                            disabled={isBusy}
                            onChange={(event) =>
                              void updateStatus(order, {
                                received: event.target.checked,
                              })
                            }
                            className="h-3.5 w-3.5 accent-violet-300"
                          />
                          Received
                        </label>
                        <label className={`flex min-h-10 cursor-pointer items-center justify-center gap-1.5 rounded-lg border px-2 text-[0.7rem] font-medium ${order.paid ? "border-cyan-300/30 bg-cyan-300/10 text-cyan-100" : "border-white/10 text-stone-400"}`}>
                          <input
                            type="checkbox"
                            checked={order.paid}
                            disabled={isBusy}
                            onChange={(event) =>
                              void updateStatus(order, { paid: event.target.checked })
                            }
                            className="h-3.5 w-3.5 accent-cyan-300"
                          />
                          Paid
                        </label>
                        <PaymentMethodPicker
                          value={order.paymentMethod}
                          disabled={isBusy}
                          onChange={(paymentMethod) =>
                            void updateStatus(order, {
                              paymentMethod,
                            })
                          }
                          label={`${order.customerName} payment method`}
                          compact
                        />
                      </div>

                      <div className="mt-2 min-w-0">
                        {orderedItems.length > 0 ? (
                          <div className="bangus-chip-scroll flex gap-1.5 overflow-x-auto">
                            {orderedItems.map((item) => {
                              const product = productColumns.find(
                                (candidate) => candidate.id === item.productId
                              );

                              return (
                                <span
                                  key={item.productId}
                                  title={product ? getBangusProductFullLabel(product) : "Unavailable product"}
                                  className="shrink-0 rounded-md border border-cyan-300/15 bg-cyan-300/[0.06] px-2 py-1 text-[0.65rem] text-cyan-100"
                                >
                                  {item.quantity} × {product
                                    ? getBangusProductAbbreviation(product)
                                    : "Unavailable product"}
                                </span>
                              );
                            })}
                          </div>
                        ) : (
                          <p className="text-xs text-stone-500">No items added.</p>
                        )}
                      </div>
                    </article>
                  );
                })}
              </div>

              <div className="bangus-order-grid hidden max-h-[65svh] max-w-full overflow-auto overscroll-contain md:block">
                <table className="w-max min-w-full border-collapse text-left text-sm">
                  <thead>
                    <tr className="border-b border-white/[0.08] bg-black/25 text-[0.68rem] uppercase tracking-[0.07em] text-stone-500">
                      <th className="sticky left-0 top-0 z-30 min-w-56 border-r border-white/[0.08] bg-[#0d100f] px-5 py-4 font-semibold">
                        Orders
                      </th>
                      <th className="sticky top-0 z-20 min-w-32 bg-[#0d100f] px-4 py-4 text-right font-semibold">
                        Retail price
                      </th>
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
                      <th className="sticky top-0 z-20 min-w-20 bg-[#0d100f] px-4 py-4 text-center font-semibold">
                        Paid
                      </th>
                      <th className="sticky top-0 z-20 min-w-36 border-r border-white/[0.08] bg-[#0d100f] px-4 py-4 font-semibold">
                        Payment method
                      </th>
                      {productColumns.map((product) => (
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

                      return (
                        <tr
                          key={order.id}
                          className="transition hover:bg-white/[0.025]"
                        >
                          <td className="sticky left-0 z-10 border-r border-white/[0.08] bg-[#111615] px-5 py-3">
                            <div className="flex items-center justify-between gap-3">
                              <button
                                type="button"
                                onClick={() => setViewingOrderId(order.id)}
                                className="min-w-0 text-left font-medium text-stone-100 underline-offset-4 transition hover:text-cyan-200 hover:underline focus-visible:text-cyan-200"
                              >
                                {order.customerName}
                              </button>
                              <div className="flex shrink-0">
                                <button
                                  type="button"
                                  disabled={isBusy}
                                  onClick={() => openEditOrder(order)}
                                  aria-label={`Edit ${order.customerName}'s order`}
                                  className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-stone-500 transition hover:bg-cyan-300/10 hover:text-cyan-200 disabled:opacity-40"
                                >
                                  <FaEdit aria-hidden="true" />
                                </button>
                                <button
                                  type="button"
                                  disabled={isBusy}
                                  onClick={() => void deleteOrder(order)}
                                  aria-label={`Remove ${order.customerName}'s order`}
                                  className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-stone-600 transition hover:bg-red-300/10 hover:text-red-200 disabled:opacity-40"
                                >
                                  <FaTrash aria-hidden="true" />
                                </button>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-right font-semibold tabular-nums text-emerald-300">
                            {formatPeso(order.retailTotal)}
                          </td>
                          {showSupplierPrices && (
                            <td className="px-4 py-3 text-right tabular-nums text-stone-400">
                              {formatPeso(order.supplierTotal)}
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
                                disabled={isBusy}
                                onChange={(event) =>
                                  void updateStatus(order, {
                                    repacked: event.target.checked,
                                  })
                                }
                                className="h-4 w-4 accent-amber-300"
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
                                disabled={isBusy}
                                onChange={(event) =>
                                  void updateStatus(order, {
                                    received: event.target.checked,
                                  })
                                }
                                className="h-4 w-4 accent-cyan-300"
                              />
                            </label>
                          </td>
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
                                  void updateStatus(order, {
                                    paid: event.target.checked,
                                  })
                                }
                                className="h-4 w-4 accent-cyan-300"
                              />
                            </label>
                          </td>
                          <td className="border-r border-white/[0.08] px-4 py-3">
                            <PaymentMethodPicker
                              value={order.paymentMethod}
                              disabled={isBusy}
                              onChange={(paymentMethod) =>
                                void updateStatus(order, {
                                  paymentMethod,
                                })
                              }
                              label={`${order.customerName} payment method`}
                              compact
                            />
                          </td>
                          {productColumns.map((product) => (
                            <td
                              key={product.id}
                              className="border-r border-white/[0.05] px-3 py-3 text-center font-medium tabular-nums text-stone-300"
                            >
                              {itemByProductId.get(product.id)?.quantity || "—"}
                            </td>
                          ))}
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot>
                    <tr className="border-t border-white/[0.1] bg-black/20 font-semibold">
                      <th className="sticky left-0 z-10 border-r border-white/[0.08] bg-[#0d100f] px-5 py-4 text-xs uppercase tracking-[0.08em] text-stone-400">
                        Totals
                      </th>
                      <td className="px-4 py-4 text-right tabular-nums text-emerald-300">
                        {formatPeso(tableTotals.retail)}
                      </td>
                      {showSupplierPrices && (
                        <td className="px-4 py-4 text-right tabular-nums text-stone-300">
                          {formatPeso(tableTotals.supplier)}
                        </td>
                      )}
                      <td className="px-4 py-4 text-center text-amber-200">
                        {tableTotals.repacked}
                      </td>
                      <td className="px-4 py-4 text-center text-cyan-200">
                        {tableTotals.received}
                      </td>
                      <td className="px-4 py-4 text-center text-cyan-200">
                        {tableTotals.paid}
                      </td>
                      <td className="border-r border-white/[0.08] px-4 py-4 text-stone-600">
                        —
                      </td>
                      {productColumns.map((product) => (
                        <td
                          key={product.id}
                          className="border-r border-white/[0.05] px-3 py-4 text-center tabular-nums text-cyan-200"
                        >
                          {filteredOrders.reduce(
                            (total, order) =>
                              total +
                              (order.items.find(
                                (item) => item.productId === product.id
                              )?.quantity ?? 0),
                            0
                          )}
                        </td>
                      ))}
                    </tr>
                  </tfoot>
                </table>
              </div>
              </>
            )}

            <footer className="flex items-center justify-end border-t border-white/[0.08] px-3 py-2 sm:justify-between sm:px-6 sm:py-4">
              <p className="hidden text-xs text-stone-600 sm:block">
                Product headings are abbreviated. Hover over one to see its
                full catalog name.
              </p>
              <button
                type="button"
                onClick={() => void deleteDeliveryTable()}
                className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl px-3 text-xs font-semibold text-stone-600 transition hover:bg-red-300/10 hover:text-red-200"
              >
                <FaTrash aria-hidden="true" />
                Delete this date table
              </button>
            </footer>
          </>
        )}
      </section>

      {selectedTable && (
        <button
          type="button"
          onClick={openNewOrder}
          className="fixed bottom-[max(1rem,env(safe-area-inset-bottom))] right-4 z-30 inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-cyan-300 px-5 text-sm font-bold text-[#071211] shadow-[0_12px_36px_rgba(0,0,0,0.55)] transition hover:bg-cyan-200 md:hidden"
        >
          <FaPlus aria-hidden="true" />
          Add order
        </button>
      )}

      {viewingOrder && selectedTable && (
        <OrderDetailsModal
          deliveryDate={selectedTable.deliveryDate}
          order={viewingOrder}
          products={products}
          showSupplierPrices={showSupplierPrices}
          onClose={() => setViewingOrderId(null)}
          onEdit={() => {
            setViewingOrderId(null);
            openEditOrder(viewingOrder);
          }}
        />
      )}

      {isOrderFormOpen && selectedTable && (
        <OrderFormModal
          deliveryDate={selectedTable.deliveryDate}
          order={editingOrder}
          products={products}
          onClose={() => setIsOrderFormOpen(false)}
          onSave={saveOrder}
        />
      )}
    </>
  );
}

"use client";

import {
  type FormEvent,
  useCallback,
  useMemo,
  useState,
} from "react";
import { getBangusProductFullLabel } from "@/lib/bangus/product-label";
import { generateBangusSupplierOrderMarkdown } from "@/lib/bangus/supplier-order-markdown";
import type {
  BangusDeliveryTableRecord,
  BangusOrderInput,
  BangusOrderRecord,
  BangusProductMetric,
  BangusProductRecord,
} from "@/types/bangus";
import {
  getManilaDate,
  hasOrderShortage,
  paymentLabels,
  type PaymentStatusFilter,
  type ReceiptStatusFilter,
  type ShortageStatusFilter,
  type TableTotals,
} from "./types";

interface UseOrdersTabOptions {
  products: BangusProductRecord[];
  initialDeliveryTables: BangusDeliveryTableRecord[];
  accessMode?: "admin" | "supplier";
}

export function useOrdersTab({
  products,
  initialDeliveryTables,
  accessMode = "admin",
}: UseOrdersTabOptions) {
  const isSupplier = accessMode === "supplier";
  const [deliveryTables, setDeliveryTables] = useState(initialDeliveryTables);
  const [selectedTableId, setSelectedTableId] = useState(
    initialDeliveryTables[0]?.id ?? ""
  );
  const [newDeliveryDate, setNewDeliveryDate] = useState(getManilaDate);
  const [newTableName, setNewTableName] = useState("");
  const [showDateForm, setShowDateForm] = useState(
    !isSupplier && initialDeliveryTables.length === 0
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
  const [expandedMobileOrderIds, setExpandedMobileOrderIds] = useState<
    Set<string>
  >(() => new Set());
  const [orderQuery, setOrderQuery] = useState("");
  const [paymentStatusFilter, setPaymentStatusFilter] =
    useState<PaymentStatusFilter>("ALL");
  const [receiptStatusFilter, setReceiptStatusFilter] =
    useState<ReceiptStatusFilter>("ALL");
  const [shortageStatusFilter, setShortageStatusFilter] =
    useState<ShortageStatusFilter>("ALL");
  const [showSupplierPrices, setShowSupplierPrices] = useState(true);
  const [productMetrics, setProductMetrics] = useState<
    BangusProductMetric[] | null
  >(null);
  const [isLoadingMetrics, setIsLoadingMetrics] = useState(false);

  const selectedTable = useMemo(
    () =>
      deliveryTables.find((table) => table.id === selectedTableId) ??
      deliveryTables[0] ??
      null,
    [deliveryTables, selectedTableId]
  );

  const viewingOrder = useMemo(
    () =>
      selectedTable?.orders.find((order) => order.id === viewingOrderId) ??
      null,
    [selectedTable, viewingOrderId]
  );

  const filteredOrders = useMemo(() => {
    const normalizedQuery = orderQuery.trim().toLowerCase();
    if (!selectedTable) return [];

    return selectedTable.orders.filter((order) => {
      const matchesQuery =
        !normalizedQuery ||
        [
          order.customerName,
          ...(!isSupplier
            ? [
                order.paymentMethod ? paymentLabels[order.paymentMethod] : "",
                order.paid ? "paid" : "unpaid",
              ]
            : []),
          order.repacked ? "repacked" : "not repacked",
          order.received ? "received" : "not received",
          ...order.items.map((item) => {
            const product = products.find(
              (candidate) => candidate.id === item.productId
            );
            return product ? getBangusProductFullLabel(product) : "";
          }),
        ].some((value) => value.toLowerCase().includes(normalizedQuery));
      const matchesPayment =
        isSupplier ||
        paymentStatusFilter === "ALL" ||
        (paymentStatusFilter === "PAID" && order.paid) ||
        (paymentStatusFilter === "UNPAID" && !order.paid);
      const matchesReceipt =
        receiptStatusFilter === "ALL" ||
        (receiptStatusFilter === "RECEIVED" && order.received) ||
        (receiptStatusFilter === "NOT_RECEIVED" && !order.received);
      const matchesShortage =
        shortageStatusFilter === "ALL" ||
        (shortageStatusFilter === "SHORTED" && hasOrderShortage(order)) ||
        (shortageStatusFilter === "NO_SHORTAGES" && !hasOrderShortage(order));

      return (
        matchesQuery && matchesPayment && matchesReceipt && matchesShortage
      );
    });
  }, [
    isSupplier,
    orderQuery,
    paymentStatusFilter,
    products,
    receiptStatusFilter,
    selectedTable,
    shortageStatusFilter,
  ]);

  const tableTotals: TableTotals = useMemo(() => {
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

  const createDeliveryTable = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
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
          throw new Error(
            result.message || "Delivery table could not be created."
          );
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
    },
    [newDeliveryDate, newTableName]
  );

  const deleteDeliveryTable = useCallback(async () => {
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
        throw new Error(
          result?.message || "Delivery table could not be removed."
        );
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
  }, [selectedTable]);

  const saveOrder = useCallback(
    async (input: BangusOrderInput) => {
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
    },
    [editingOrder, selectedTable]
  );

  const updateStatus = useCallback(
    async (
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
      const optimisticOrder: BangusOrderRecord = {
        ...order,
        repacked: changes.repacked ?? order.repacked,
        received: changes.received ?? order.received,
        paid,
        paymentMethod,
      };

      try {
        replaceOrder(optimisticOrder);

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
          order?: Pick<
            BangusOrderRecord,
            "id" | "repacked" | "received" | "paid" | "paymentMethod"
          >;
          message?: string;
        };
        if (!response.ok || !result.order) {
          throw new Error(result.message || "Order status could not be updated.");
        }
        replaceOrder({ ...optimisticOrder, ...result.order });
      } catch (updateError) {
        replaceOrder(order);
        setError(
          updateError instanceof Error
            ? updateError.message
            : "Order status could not be updated."
        );
      } finally {
        setBusyOrderId(undefined);
      }
    },
    [replaceOrder]
  );

  const deleteOrder = useCallback(
    async (order: BangusOrderRecord) => {
      if (
        !selectedTable ||
        !window.confirm(`Remove ${order.customerName}'s order?`)
      ) {
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
    },
    [selectedTable, viewingOrderId]
  );

  const openNewOrder = useCallback(() => {
    setEditingOrder(null);
    setIsOrderFormOpen(true);
  }, []);

  const openEditOrder = useCallback((order: BangusOrderRecord) => {
    setEditingOrder(order);
    setIsOrderFormOpen(true);
  }, []);

  const openProductMetrics = useCallback(async () => {
    if (!selectedTable) return;

    setIsLoadingMetrics(true);
    setError("");

    try {
      const response = await fetch(
        `/api/bangus/backoffice/delivery-tables/${selectedTable.id}/metrics`,
        { cache: "no-store" }
      );
      const result = (await response.json()) as {
        metrics?: BangusProductMetric[];
        message?: string;
      };

      if (!response.ok || !result.metrics) {
        throw new Error(result.message || "Product metrics could not be loaded.");
      }

      setProductMetrics(result.metrics);
    } catch (metricsError) {
      setError(
        metricsError instanceof Error
          ? metricsError.message
          : "Product metrics could not be loaded."
      );
    } finally {
      setIsLoadingMetrics(false);
    }
  }, [selectedTable]);

  const exportSupplierOrder = useCallback(() => {
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
  }, [products, selectedTable]);

  const toggleMobileOrderExpanded = useCallback((orderId: string) => {
    setExpandedMobileOrderIds((current) => {
      const next = new Set(current);
      if (next.has(orderId)) next.delete(orderId);
      else next.add(orderId);
      return next;
    });
  }, []);

  const selectTable = useCallback((tableId: string) => {
    setSelectedTableId(tableId);
    setViewingOrderId(null);
    setExpandedMobileOrderIds(new Set());
  }, []);

  const clearFilters = useCallback(() => {
    setOrderQuery("");
    setPaymentStatusFilter("ALL");
    setReceiptStatusFilter("ALL");
    setShortageStatusFilter("ALL");
  }, []);

  return {
    isSupplier,
    deliveryTables,
    setDeliveryTables,
    selectedTableId,
    selectedTable,
    selectTable,
    newDeliveryDate,
    setNewDeliveryDate,
    newTableName,
    setNewTableName,
    showDateForm,
    setShowDateForm,
    isCreatingTable,
    isRefreshing,
    busyOrderId,
    error,
    setError,
    isOrderFormOpen,
    setIsOrderFormOpen,
    editingOrder,
    setEditingOrder,
    viewingOrderId,
    setViewingOrderId,
    viewingOrder,
    expandedMobileOrderIds,
    toggleMobileOrderExpanded,
    orderQuery,
    setOrderQuery,
    paymentStatusFilter,
    setPaymentStatusFilter,
    receiptStatusFilter,
    setReceiptStatusFilter,
    shortageStatusFilter,
    setShortageStatusFilter,
    showSupplierPrices,
    setShowSupplierPrices,
    productMetrics,
    setProductMetrics,
    isLoadingMetrics,
    filteredOrders,
    tableTotals,
    replaceOrder,
    refreshTables,
    createDeliveryTable,
    deleteDeliveryTable,
    saveOrder,
    updateStatus,
    deleteOrder,
    openNewOrder,
    openEditOrder,
    openProductMetrics,
    exportSupplierOrder,
    clearFilters,
  };
}

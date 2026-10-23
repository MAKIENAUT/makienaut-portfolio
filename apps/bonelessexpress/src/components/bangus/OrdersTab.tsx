"use client";

import dynamic from "next/dynamic";
import { FaPlus, FaTruck } from "react-icons/fa";
import {
  OrdersTableHeader,
  OrdersTableMetrics,
} from "@/components/bangus/orders/OrdersTableHeader";
import { OrdersFiltersBar } from "@/components/bangus/orders/OrdersFiltersBar";
import { OrdersTable } from "@/components/bangus/orders/OrdersTable";
import { useOrdersTab } from "@/components/bangus/orders/useOrdersTab";
import type { OrdersTabProps } from "@/components/bangus/orders/types";

const OrderDetailsModal = dynamic(
  () =>
    import("@/components/bangus/OrderDetailsModal").then(
      (mod) => mod.OrderDetailsModal
    ),
  { ssr: false }
);

const OrderFormModal = dynamic(
  () =>
    import("@/components/bangus/OrderFormModal").then(
      (mod) => mod.OrderFormModal
    ),
  { ssr: false }
);

const ProductMetricsModal = dynamic(
  () =>
    import("@/components/bangus/ProductMetricsModal").then(
      (mod) => mod.ProductMetricsModal
    ),
  { ssr: false }
);

export function OrdersTab({
  products,
  initialDeliveryTables,
  accessMode = "admin",
}: OrdersTabProps) {
  const {
    isSupplier,
    deliveryTables,
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
    isOrderFormOpen,
    setIsOrderFormOpen,
    editingOrder,
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
  } = useOrdersTab({ products, initialDeliveryTables, accessMode });

  return (
    <>
      <section className="min-w-0 overflow-hidden rounded-xl border border-white/[0.08] bg-[#111615] sm:rounded-2xl">
        <header className="border-b border-white/[0.08] p-3 sm:p-6">
          <OrdersTableHeader
            selectedTable={selectedTable}
            deliveryTables={deliveryTables}
            isSupplier={isSupplier}
            showSupplierPrices={showSupplierPrices}
            isRefreshing={isRefreshing}
            isLoadingMetrics={isLoadingMetrics}
            showDateForm={showDateForm}
            newTableName={newTableName}
            newDeliveryDate={newDeliveryDate}
            isCreatingTable={isCreatingTable}
            onSelectTable={selectTable}
            onOpenNewOrder={openNewOrder}
            onToggleSupplierPrices={() =>
              setShowSupplierPrices((current) => !current)
            }
            onOpenProductMetrics={() => void openProductMetrics()}
            onToggleDateForm={() => setShowDateForm((current) => !current)}
            onRefreshTables={() => void refreshTables()}
            onExportSupplierOrder={exportSupplierOrder}
            onCreateDeliveryTable={createDeliveryTable}
            onNewTableNameChange={setNewTableName}
            onNewDeliveryDateChange={setNewDeliveryDate}
            onCloseDateForm={() => setShowDateForm(false)}
          />

          {selectedTable && selectedTable.orders.length > 0 && (
            <OrdersFiltersBar
              isSupplier={isSupplier}
              orderQuery={orderQuery}
              paymentStatusFilter={paymentStatusFilter}
              receiptStatusFilter={receiptStatusFilter}
              shortageStatusFilter={shortageStatusFilter}
              filteredCount={filteredOrders.length}
              totalCount={selectedTable.orders.length}
              onOrderQueryChange={setOrderQuery}
              onPaymentStatusFilterChange={setPaymentStatusFilter}
              onReceiptStatusFilterChange={setReceiptStatusFilter}
              onShortageStatusFilterChange={setShortageStatusFilter}
            />
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
            <OrdersTableMetrics
              isSupplier={isSupplier}
              showSupplierPrices={showSupplierPrices}
              tableTotals={tableTotals}
              filteredOrdersCount={filteredOrders.length}
            />

            <OrdersTable
              products={products}
              orders={selectedTable.orders}
              filteredOrders={filteredOrders}
              tableTotals={tableTotals}
              isSupplier={isSupplier}
              showSupplierPrices={showSupplierPrices}
              busyOrderId={busyOrderId}
              expandedMobileOrderIds={expandedMobileOrderIds}
              onToggleMobileOrderExpanded={toggleMobileOrderExpanded}
              onViewOrder={setViewingOrderId}
              onEditOrder={openEditOrder}
              onDeleteOrder={(order) => void deleteOrder(order)}
              onUpdateStatus={(order, changes) =>
                void updateStatus(order, changes)
              }
              onOpenNewOrder={openNewOrder}
              onClearFilters={clearFilters}
              onDeleteDeliveryTable={() => void deleteDeliveryTable()}
            />
          </>
        )}
      </section>

      {selectedTable && !isSupplier && (
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
          accessMode={accessMode}
          onClose={() => setViewingOrderId(null)}
          onEdit={() => {
            setViewingOrderId(null);
            openEditOrder(viewingOrder);
          }}
        />
      )}

      {!isSupplier && isOrderFormOpen && selectedTable && (
        <OrderFormModal
          deliveryDate={selectedTable.deliveryDate}
          order={editingOrder}
          products={products}
          onClose={() => setIsOrderFormOpen(false)}
          onSave={saveOrder}
        />
      )}

      {productMetrics && selectedTable && (
        <ProductMetricsModal
          products={products}
          metrics={productMetrics}
          tableName={selectedTable.name}
          onClose={() => setProductMetrics(null)}
        />
      )}
    </>
  );
}

"use client";

import { useCallback, useMemo, useState } from "react";
import {
  FaBoxOpen,
  FaChartLine,
  FaClipboardList,
  FaEdit,
  FaFish,
  FaPlus,
  FaSearch,
  FaSyncAlt,
  FaTags,
  FaTrash,
} from "react-icons/fa";
import { OrdersTab } from "@/components/bangus/OrdersTab";
import { ProductFormModal } from "@/components/bangus/ProductFormModal";
import type {
  BangusCatalogRecord,
  BangusDeliveryTableRecord,
  BangusProductInput,
  BangusProductRecord,
} from "@/types/bangus";

interface BangusDashboardProps {
  initialCatalog: BangusCatalogRecord;
  initialDeliveryTables: BangusDeliveryTableRecord[];
}

type CatalogStatusFilter = "ALL" | "ACTIVE" | "INACTIVE";
type BangusTab = "orders" | "products";

const formatPeso = (value: number) =>
  new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    maximumFractionDigits: 0,
  }).format(value);

const categoryClasses: Record<string, string> = {
  "Relleno & Prepared": "border-violet-300/20 bg-violet-300/10 text-violet-200",
  "Add-ons": "border-emerald-300/20 bg-emerald-300/10 text-emerald-200",
  "Marinated Boneless Bangus": "border-sky-300/20 bg-sky-300/10 text-sky-200",
  "Bangus Belly": "border-blue-300/20 bg-blue-300/10 text-blue-200",
  Tinapa: "border-orange-300/20 bg-orange-300/10 text-orange-200",
};

const productToInput = (product: BangusProductRecord): BangusProductInput => ({
  name: product.name,
  supplierPrice: product.supplierPrice,
  retailPrice: product.retailPrice,
  category: product.category,
  sizePack: product.sizePack,
  flavor: product.flavor ?? "",
  pieces: product.pieces ?? "",
  isActive: product.isActive,
});

export function BangusDashboard({
  initialCatalog,
  initialDeliveryTables,
}: BangusDashboardProps) {
  const [activeTab, setActiveTab] = useState<BangusTab>("orders");
  const [products, setProducts] = useState(initialCatalog.products);
  const [categories, setCategories] = useState(initialCatalog.categories);
  const [query, setQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] =
    useState<CatalogStatusFilter>("ALL");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [busyProductId, setBusyProductId] = useState<string>();
  const [error, setError] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] =
    useState<BangusProductRecord | null>(null);

  const activeProducts = products.filter((product) => product.isActive);
  const averageMarkup =
    products.length === 0
      ? 0
      : Math.round(
          products.reduce((total, product) => total + product.markup, 0) /
            products.length
        );

  const filteredProducts = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return products.filter((product) => {
      const matchesQuery =
        !normalizedQuery ||
        [
          product.name,
          product.category,
          product.sizePack,
          product.flavor,
          product.pieces,
        ].some((value) => value?.toLowerCase().includes(normalizedQuery));
      const matchesCategory =
        categoryFilter === "ALL" || product.category === categoryFilter;
      const matchesStatus =
        statusFilter === "ALL" ||
        (statusFilter === "ACTIVE" && product.isActive) ||
        (statusFilter === "INACTIVE" && !product.isActive);

      return matchesQuery && matchesCategory && matchesStatus;
    });
  }, [categoryFilter, products, query, statusFilter]);

  const refreshCatalog = useCallback(async () => {
    setIsRefreshing(true);
    setError("");

    try {
      const response = await fetch("/api/bangus/backoffice/products", {
        cache: "no-store",
      });
      const result = (await response.json()) as Partial<BangusCatalogRecord> & {
        message?: string;
      };

      if (!response.ok || !result.products || !result.categories) {
        throw new Error(result.message || "Products could not be refreshed.");
      }

      setProducts(result.products);
      setCategories(result.categories);
    } catch (refreshError) {
      setError(
        refreshError instanceof Error
          ? refreshError.message
          : "Products could not be refreshed."
      );
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  const saveProduct = async (input: BangusProductInput) => {
    const endpoint = editingProduct
      ? `/api/bangus/backoffice/products/${editingProduct.id}`
      : "/api/bangus/backoffice/products";
    const response = await fetch(endpoint, {
      method: editingProduct ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    const result = (await response.json()) as {
      product?: BangusProductRecord;
      message?: string;
    };

    if (!response.ok || !result.product) {
      throw new Error(result.message || "Product could not be saved.");
    }

    setProducts((current) =>
      editingProduct
        ? current.map((product) =>
            product.id === result.product!.id ? result.product! : product
          )
        : [...current, result.product!]
    );
    setCategories((current) =>
      current.includes(result.product!.category)
        ? current
        : [...current, result.product!.category]
    );
  };

  const toggleProduct = async (product: BangusProductRecord) => {
    setBusyProductId(product.id);
    setError("");

    try {
      const response = await fetch(
        `/api/bangus/backoffice/products/${product.id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...productToInput(product),
            isActive: !product.isActive,
          }),
        }
      );
      const result = (await response.json()) as {
        product?: BangusProductRecord;
        message?: string;
      };

      if (!response.ok || !result.product) {
        throw new Error(result.message || "Product status could not be changed.");
      }

      setProducts((current) =>
        current.map((item) =>
          item.id === product.id ? result.product! : item
        )
      );
    } catch (toggleError) {
      setError(
        toggleError instanceof Error
          ? toggleError.message
          : "Product status could not be changed."
      );
    } finally {
      setBusyProductId(undefined);
    }
  };

  const removeProduct = async (product: BangusProductRecord) => {
    if (
      !window.confirm(
        `Remove “${product.name}” (${product.sizePack}) from the catalog?`
      )
    ) {
      return;
    }

    setBusyProductId(product.id);
    setError("");

    try {
      const response = await fetch(
        `/api/bangus/backoffice/products/${product.id}`,
        { method: "DELETE" }
      );

      if (!response.ok) {
        const result = (await response.json().catch(() => null)) as {
          message?: string;
        } | null;
        throw new Error(result?.message || "Product could not be removed.");
      }

      setProducts((current) =>
        current.filter((item) => item.id !== product.id)
      );
    } catch (deleteError) {
      setError(
        deleteError instanceof Error
          ? deleteError.message
          : "Product could not be removed."
      );
    } finally {
      setBusyProductId(undefined);
    }
  };

  const openNewProduct = () => {
    setEditingProduct(null);
    setIsFormOpen(true);
  };

  const openEditProduct = (product: BangusProductRecord) => {
    setEditingProduct(product);
    setIsFormOpen(true);
  };

  return (
    <>
      <nav
        aria-label="Bangus business sections"
        className="mb-3 flex gap-1 rounded-xl border border-white/[0.08] bg-white/[0.035] p-1 sm:mb-8 sm:w-fit sm:rounded-2xl sm:p-1.5"
      >
        {[
          { id: "orders" as const, label: "Orders", icon: FaClipboardList },
          { id: "products" as const, label: "Products", icon: FaFish },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`inline-flex min-h-10 flex-1 items-center justify-center gap-2 rounded-lg px-4 text-sm font-semibold transition sm:min-h-11 sm:flex-none sm:rounded-xl ${
                isActive
                  ? "bg-cyan-300 text-[#071211]"
                  : "text-stone-400 hover:bg-white/[0.04] hover:text-white"
              }`}
            >
              <Icon aria-hidden="true" />
              {tab.label}
            </button>
          );
        })}
      </nav>

      {activeTab === "orders" ? (
        <OrdersTab
          products={products}
          initialDeliveryTables={initialDeliveryTables}
        />
      ) : (
        <>
          <section
            aria-label="Catalog summary"
            className="grid grid-cols-3 gap-2 sm:gap-4"
          >
            {[
              {
                label: "Active products",
                value: activeProducts.length,
                detail: `${products.length} total`,
                icon: FaBoxOpen,
                accent: "text-cyan-300",
              },
              {
                label: "Categories",
                value: categories.length,
                detail: "Catalog groups",
                icon: FaTags,
                accent: "text-violet-300",
              },
              {
                label: "Average markup",
                value: formatPeso(averageMarkup),
                detail: "Per item / pack",
                icon: FaChartLine,
                accent: "text-emerald-300",
              },
            ].map((card) => {
              const Icon = card.icon;
              return (
                <article
                  key={card.label}
                  className="rounded-xl border border-white/[0.08] bg-white/[0.035] p-3 sm:rounded-2xl sm:p-5"
                >
                  <div className="flex items-center justify-between">
                    <p className="text-[0.65rem] leading-tight text-stone-400 sm:text-sm">{card.label}</p>
                    <Icon aria-hidden="true" className={`hidden sm:block ${card.accent}`} />
                  </div>
                  <p className="mt-2 text-lg font-semibold text-white sm:mt-4 sm:text-3xl">
                    {card.value}
                  </p>
                  <p className="mt-0.5 hidden text-xs text-stone-600 sm:block">{card.detail}</p>
                </article>
              );
            })}
          </section>

          <section className="mt-3 overflow-hidden rounded-xl border border-white/[0.08] bg-[#111615] sm:mt-8 sm:rounded-2xl">
            <header className="border-b border-white/[0.08] p-3 sm:p-6">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <h2 className="text-base font-semibold text-white sm:text-xl">
                    Product catalog
                  </h2>
                  <p className="mt-0.5 text-xs text-stone-500 sm:mt-1 sm:text-sm">
                    {filteredProducts.length} of {products.length} products
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    disabled={isRefreshing}
                    onClick={() => void refreshCatalog()}
                    className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-white/10 px-4 text-sm font-semibold text-stone-300 transition hover:border-cyan-300/30 hover:text-cyan-200 disabled:cursor-wait disabled:opacity-60"
                  >
                    <FaSyncAlt
                      aria-hidden="true"
                      className={isRefreshing ? "animate-spin" : ""}
                    />
                    <span className="sr-only sm:not-sr-only">Refresh</span>
                  </button>
                  <button
                    type="button"
                    onClick={openNewProduct}
                    className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-cyan-300 px-4 text-sm font-bold text-[#071211] transition hover:bg-cyan-200 sm:flex-none"
                  >
                    <FaPlus aria-hidden="true" />
                    Add product
                  </button>
                </div>
              </div>

              <div className="mt-3 grid grid-cols-2 gap-2 sm:mt-5 sm:gap-3 md:grid-cols-[minmax(16rem,1fr)_auto_auto]">
                <div className="relative col-span-2 md:col-span-1">
                  <FaSearch
                    aria-hidden="true"
                    className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-stone-600"
                  />
                  <label htmlFor="bangus-product-search" className="sr-only">
                    Search products
                  </label>
                  <input
                    id="bangus-product-search"
                    type="search"
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="Search product, size, flavor…"
                    className="min-h-10 w-full rounded-lg border border-white/10 bg-black/30 py-2 pl-11 pr-4 text-sm text-white outline-none placeholder:text-stone-600 focus:border-cyan-300 focus:ring-2 focus:ring-cyan-300/15 sm:min-h-11 sm:rounded-xl"
                  />
                </div>

                <label>
                  <span className="sr-only">Filter by category</span>
                  <select
                    value={categoryFilter}
                    onChange={(event) => setCategoryFilter(event.target.value)}
                    className="min-h-10 w-full rounded-lg border border-white/10 bg-[#0b0e0d] px-2 text-xs text-stone-300 outline-none focus:border-cyan-300 sm:min-h-11 sm:rounded-xl sm:px-3 sm:text-sm md:w-56"
                  >
                    <option value="ALL">All categories</option>
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </label>

                <label>
                  <span className="sr-only">Filter by status</span>
                  <select
                    value={statusFilter}
                    onChange={(event) =>
                      setStatusFilter(
                        event.target.value as CatalogStatusFilter
                      )
                    }
                    className="min-h-10 w-full rounded-lg border border-white/10 bg-[#0b0e0d] px-2 text-xs text-stone-300 outline-none focus:border-cyan-300 sm:min-h-11 sm:rounded-xl sm:px-3 sm:text-sm md:w-36"
                  >
                    <option value="ALL">All statuses</option>
                    <option value="ACTIVE">Active</option>
                    <option value="INACTIVE">Inactive</option>
                  </select>
                </label>
              </div>

              {error && (
                <p
                  role="alert"
                  className="mt-4 rounded-xl border border-red-400/20 bg-red-400/10 p-3 text-sm text-red-100"
                >
                  {error}
                </p>
              )}
            </header>

            {filteredProducts.length === 0 ? (
              <div className="px-5 py-16 text-center">
                <FaFish
                  aria-hidden="true"
                  className="mx-auto text-4xl text-stone-700"
                />
                <p className="mt-4 font-medium text-stone-300">
                  No products match this view.
                </p>
                <p className="mt-1 text-sm text-stone-600">
                  Try another search or add a new product.
                </p>
              </div>
            ) : (
              <>
              <div className="divide-y divide-white/[0.06] md:hidden">
                {filteredProducts.map((product) => {
                  const isBusy = busyProductId === product.id;
                  const pricing =
                    product.markup > 0
                      ? {
                          label: "Marked up",
                          classes:
                            "border-emerald-300/20 bg-emerald-300/10 text-emerald-200",
                        }
                      : product.markup === 0
                        ? {
                            label: "At cost",
                            classes:
                              "border-amber-300/20 bg-amber-300/10 text-amber-200",
                          }
                        : {
                            label: "Below cost",
                            classes:
                              "border-red-300/20 bg-red-300/10 text-red-200",
                          };

                  return (
                    <article
                      key={product.id}
                      className={`p-3 ${product.isActive ? "" : "opacity-55"}`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex min-w-0 items-start gap-2">
                          <div className="min-w-0">
                            <p className="text-sm font-medium leading-tight text-stone-100">{product.name}</p>
                            <p className="mt-0.5 text-xs text-stone-400">
                              {product.sizePack}
                              {product.flavor ? ` · ${product.flavor}` : ""}
                              {product.pieces ? ` · ${product.pieces}` : ""}
                            </p>
                          </div>
                        </div>
                        <div className="flex shrink-0 gap-1">
                          <button
                            type="button"
                            disabled={isBusy}
                            onClick={() => openEditProduct(product)}
                            aria-label={`Edit ${product.name} ${product.sizePack}`}
                            className="inline-flex h-10 w-10 items-center justify-center rounded-xl text-stone-400 transition hover:bg-cyan-300/10 hover:text-cyan-200 disabled:opacity-40"
                          >
                            <FaEdit aria-hidden="true" />
                          </button>
                          <button
                            type="button"
                            disabled={isBusy}
                            onClick={() => void removeProduct(product)}
                            aria-label={`Remove ${product.name} ${product.sizePack}`}
                            className="inline-flex h-10 w-10 items-center justify-center rounded-xl text-stone-500 transition hover:bg-red-300/10 hover:text-red-200 disabled:opacity-40"
                          >
                            <FaTrash aria-hidden="true" />
                          </button>
                        </div>
                      </div>

                      <div className="mt-2 flex flex-wrap items-center gap-1.5">
                        <span
                          className={`inline-flex rounded-md border px-1.5 py-0.5 text-[0.65rem] ${
                            categoryClasses[product.category] ??
                            "border-stone-300/20 bg-stone-300/10 text-stone-300"
                          }`}
                        >
                          {product.category}
                        </span>
                        <span className={`inline-flex rounded-md border px-1.5 py-0.5 text-[0.65rem] ${pricing.classes}`}>
                          {pricing.label}
                        </span>
                        <button
                          type="button"
                          disabled={isBusy}
                          onClick={() => void toggleProduct(product)}
                          className={`text-[0.65rem] font-medium transition hover:underline ${
                            product.isActive ? "text-emerald-300" : "text-stone-500"
                          }`}
                        >
                          {product.isActive ? "Active" : "Inactive"}
                        </button>
                      </div>

                      <dl className="mt-2 grid grid-cols-3 gap-2 rounded-lg bg-black/20 p-2 text-xs">
                        <div>
                          <dt className="text-[0.65rem] text-stone-500">Supplier</dt>
                          <dd className="font-medium tabular-nums text-stone-300">
                            {formatPeso(product.supplierPrice)}
                          </dd>
                        </div>
                        <div>
                          <dt className="text-[0.65rem] text-stone-500">Retail</dt>
                          <dd className="font-medium tabular-nums text-white">
                            {formatPeso(product.retailPrice)}
                          </dd>
                        </div>
                        <div>
                          <dt className="text-[0.65rem] text-stone-500">Markup</dt>
                          <dd className={`font-medium tabular-nums ${product.markup < 0 ? "text-red-300" : "text-emerald-300"}`}>
                            {product.markup < 0 ? "−" : "+"}
                            {formatPeso(Math.abs(product.markup))}
                          </dd>
                        </div>
                      </dl>
                    </article>
                  );
                })}
              </div>

              <div className="hidden overflow-x-auto md:block">
                <table className="w-full min-w-[72rem] border-collapse text-left text-sm">
                  <thead>
                    <tr className="border-b border-white/[0.08] bg-black/20 text-xs uppercase tracking-[0.08em] text-stone-500">
                      <th className="px-5 py-4 font-semibold sm:px-6">
                        Product
                      </th>
                      <th className="px-4 py-4 text-right font-semibold">
                        Supplier
                      </th>
                      <th className="px-4 py-4 text-right font-semibold">
                        Retail
                      </th>
                      <th className="px-4 py-4 font-semibold">Category</th>
                      <th className="px-4 py-4 font-semibold">Size / pack</th>
                      <th className="px-4 py-4 font-semibold">Flavor</th>
                      <th className="px-4 py-4 font-semibold">Pieces</th>
                      <th className="px-4 py-4 text-right font-semibold">
                        Markup
                      </th>
                      <th className="px-4 py-4 font-semibold">Pricing</th>
                      <th className="px-5 py-4 text-right font-semibold sm:px-6">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.06]">
                    {filteredProducts.map((product) => {
                      const isBusy = busyProductId === product.id;
                      const pricing =
                        product.markup > 0
                          ? {
                              label: "Marked up",
                              classes:
                                "border-emerald-300/20 bg-emerald-300/10 text-emerald-200",
                            }
                          : product.markup === 0
                            ? {
                                label: "At cost",
                                classes:
                                  "border-amber-300/20 bg-amber-300/10 text-amber-200",
                              }
                            : {
                                label: "Below cost",
                                classes:
                                  "border-red-300/20 bg-red-300/10 text-red-200",
                              };

                      return (
                        <tr
                          key={product.id}
                          className={`transition hover:bg-white/[0.025] ${
                            product.isActive ? "" : "opacity-55"
                          }`}
                        >
                          <td className="px-5 py-4 sm:px-6">
                            <div className="flex items-center gap-3">
                              <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-cyan-300/10 text-cyan-300">
                                <FaFish aria-hidden="true" />
                              </span>
                              <div>
                                <p className="font-medium text-stone-100">
                                  {product.name}
                                </p>
                                <button
                                  type="button"
                                  disabled={isBusy}
                                  onClick={() => void toggleProduct(product)}
                                  className={`mt-1 text-xs font-medium transition hover:underline ${
                                    product.isActive
                                      ? "text-emerald-300"
                                      : "text-stone-500"
                                  }`}
                                >
                                  {product.isActive ? "Active" : "Inactive"}
                                </button>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-4 text-right tabular-nums text-stone-400">
                            {formatPeso(product.supplierPrice)}
                          </td>
                          <td className="px-4 py-4 text-right font-medium tabular-nums text-white">
                            {formatPeso(product.retailPrice)}
                          </td>
                          <td className="px-4 py-4">
                            <span
                              className={`inline-flex rounded-md border px-2 py-1 text-xs ${
                                categoryClasses[product.category] ??
                                "border-stone-300/20 bg-stone-300/10 text-stone-300"
                              }`}
                            >
                              {product.category}
                            </span>
                          </td>
                          <td className="px-4 py-4 text-stone-300">
                            {product.sizePack}
                          </td>
                          <td className="px-4 py-4 text-stone-400">
                            {product.flavor ?? "—"}
                          </td>
                          <td className="px-4 py-4 text-stone-400">
                            {product.pieces ?? "—"}
                          </td>
                          <td
                            className={`px-4 py-4 text-right font-medium tabular-nums ${
                              product.markup < 0
                                ? "text-red-300"
                                : "text-emerald-300"
                            }`}
                          >
                            {product.markup < 0 ? "−" : "+"}
                            {formatPeso(Math.abs(product.markup))}
                          </td>
                          <td className="px-4 py-4">
                            <span
                              className={`inline-flex rounded-md border px-2 py-1 text-xs ${pricing.classes}`}
                            >
                              {pricing.label}
                            </span>
                          </td>
                          <td className="px-5 py-4 sm:px-6">
                            <div className="flex justify-end gap-1">
                              <button
                                type="button"
                                disabled={isBusy}
                                onClick={() => openEditProduct(product)}
                                aria-label={`Edit ${product.name} ${product.sizePack}`}
                                className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-stone-400 transition hover:bg-cyan-300/10 hover:text-cyan-200 disabled:opacity-40"
                              >
                                <FaEdit aria-hidden="true" />
                              </button>
                              <button
                                type="button"
                                disabled={isBusy}
                                onClick={() => void removeProduct(product)}
                                aria-label={`Remove ${product.name} ${product.sizePack}`}
                                className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-stone-500 transition hover:bg-red-300/10 hover:text-red-200 disabled:opacity-40"
                              >
                                <FaTrash aria-hidden="true" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              </>
            )}
          </section>
        </>
      )}

      {isFormOpen && (
        <ProductFormModal
          categories={categories}
          product={editingProduct}
          onClose={() => setIsFormOpen(false)}
          onSave={saveProduct}
        />
      )}
    </>
  );
}

"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { FaSave, FaTimes } from "react-icons/fa";
import type {
  BangusProductInput,
  BangusProductRecord,
} from "@/types/bangus";

interface ProductFormModalProps {
  categories: string[];
  product: BangusProductRecord | null;
  onClose: () => void;
  onSave: (product: BangusProductInput) => Promise<void>;
}

interface ProductFormState {
  name: string;
  supplierPrice: string;
  retailPrice: string;
  category: string;
  sizePack: string;
  flavor: string;
  pieces: string;
  isActive: boolean;
}

const fieldClassName =
  "mt-2 min-h-11 w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2.5 text-sm text-white outline-none placeholder:text-stone-600 focus:border-cyan-300 focus:ring-2 focus:ring-cyan-300/15";

const createInitialState = (
  product: BangusProductRecord | null,
  categories: string[]
): ProductFormState => ({
  name: product?.name ?? "",
  supplierPrice: product ? String(product.supplierPrice) : "",
  retailPrice: product ? String(product.retailPrice) : "",
  category: product?.category ?? categories[0] ?? "",
  sizePack: product?.sizePack ?? "Standard",
  flavor: product?.flavor ?? "",
  pieces: product?.pieces ?? "",
  isActive: product?.isActive ?? true,
});

export function ProductFormModal({
  categories,
  product,
  onClose,
  onSave,
}: ProductFormModalProps) {
  const [form, setForm] = useState(() =>
    createInitialState(product, categories)
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

  const markup = useMemo(() => {
    const supplier = Number(form.supplierPrice);
    const retail = Number(form.retailPrice);
    return Number.isFinite(supplier) && Number.isFinite(retail)
      ? retail - supplier
      : 0;
  }, [form.retailPrice, form.supplierPrice]);

  const updateField = <Key extends keyof ProductFormState>(
    key: Key,
    value: ProductFormState[Key]
  ) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setIsSaving(true);

    try {
      await onSave({
        name: form.name,
        supplierPrice: Number(form.supplierPrice),
        retailPrice: Number(form.retailPrice),
        category: form.category,
        sizePack: form.sizePack,
        flavor: form.flavor,
        pieces: form.pieces,
        isActive: form.isActive,
      });
      onClose();
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : "The product could not be saved."
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
        aria-labelledby="bangus-product-form-title"
        className="max-h-[94svh] w-full overflow-y-auto rounded-t-3xl border border-white/10 bg-[#111615] shadow-2xl sm:max-w-2xl sm:rounded-3xl"
      >
        <header className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-white/[0.08] bg-[#111615]/95 px-5 py-5 backdrop-blur-xl sm:px-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-300">
              Product details
            </p>
            <h2
              id="bangus-product-form-title"
              className="mt-1 text-xl font-semibold text-white"
            >
              {product ? "Edit product" : "Add a product"}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isSaving}
            aria-label="Close product form"
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 text-stone-400 transition hover:border-white/20 hover:text-white disabled:opacity-50"
          >
            <FaTimes aria-hidden="true" />
          </button>
        </header>

        <form onSubmit={handleSubmit} className="p-5 sm:p-6">
          <div className="grid gap-5 sm:grid-cols-2">
            <label className="sm:col-span-2">
              <span className="text-sm font-medium text-stone-300">
                Product name
              </span>
              <input
                autoFocus
                required
                maxLength={120}
                value={form.name}
                onChange={(event) => updateField("name", event.target.value)}
                placeholder="e.g. Marinated Boneless Bangus"
                className={fieldClassName}
              />
            </label>

            <label>
              <span className="text-sm font-medium text-stone-300">
                Supplier price (₱)
              </span>
              <input
                required
                type="number"
                min="0"
                max="1000000"
                step="1"
                value={form.supplierPrice}
                onChange={(event) =>
                  updateField("supplierPrice", event.target.value)
                }
                placeholder="0"
                className={fieldClassName}
              />
            </label>

            <label>
              <span className="text-sm font-medium text-stone-300">
                Retail price (₱)
              </span>
              <input
                required
                type="number"
                min="0"
                max="1000000"
                step="1"
                value={form.retailPrice}
                onChange={(event) =>
                  updateField("retailPrice", event.target.value)
                }
                placeholder="0"
                className={fieldClassName}
              />
            </label>

            <label>
              <span className="text-sm font-medium text-stone-300">
                Category
              </span>
              <input
                required
                list="bangus-category-options"
                maxLength={80}
                value={form.category}
                onChange={(event) =>
                  updateField("category", event.target.value)
                }
                placeholder="Choose or type a category"
                className={fieldClassName}
              />
              <datalist id="bangus-category-options">
                {categories.map((category) => (
                  <option key={category} value={category} />
                ))}
              </datalist>
            </label>

            <label>
              <span className="text-sm font-medium text-stone-300">
                Size / pack
              </span>
              <input
                required
                maxLength={60}
                value={form.sizePack}
                onChange={(event) =>
                  updateField("sizePack", event.target.value)
                }
                placeholder="e.g. Standard, XL, Small tub"
                className={fieldClassName}
              />
            </label>

            <label>
              <span className="text-sm font-medium text-stone-300">
                Flavor <span className="text-stone-600">(optional)</span>
              </span>
              <input
                maxLength={60}
                value={form.flavor}
                onChange={(event) => updateField("flavor", event.target.value)}
                placeholder="e.g. Regular, Spicy"
                className={fieldClassName}
              />
            </label>

            <label>
              <span className="text-sm font-medium text-stone-300">
                Pieces <span className="text-stone-600">(optional)</span>
              </span>
              <input
                maxLength={60}
                value={form.pieces}
                onChange={(event) => updateField("pieces", event.target.value)}
                placeholder="e.g. 2 pcs, 1 dozen"
                className={fieldClassName}
              />
            </label>
          </div>

          <div className="mt-5 flex flex-col gap-4 rounded-2xl border border-white/[0.08] bg-black/20 p-4 sm:flex-row sm:items-center sm:justify-between">
            <label className="flex cursor-pointer items-center gap-3">
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={(event) =>
                  updateField("isActive", event.target.checked)
                }
                className="h-4 w-4 accent-cyan-300"
              />
              <span>
                <span className="block text-sm font-medium text-stone-200">
                  Active product
                </span>
                <span className="block text-xs text-stone-500">
                  Available for future orders
                </span>
              </span>
            </label>

            <div className="sm:text-right">
              <p className="text-xs uppercase tracking-[0.12em] text-stone-500">
                Markup
              </p>
              <p
                className={`mt-1 text-lg font-semibold ${
                  markup < 0 ? "text-red-300" : "text-emerald-300"
                }`}
              >
                {markup < 0 ? "−" : "+"}₱{Math.abs(markup).toLocaleString()}
              </p>
            </div>
          </div>

          {error && (
            <p
              role="alert"
              className="mt-5 rounded-xl border border-red-400/20 bg-red-400/10 p-3 text-sm text-red-100"
            >
              {error}
            </p>
          )}

          <footer className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="inline-flex min-h-11 items-center justify-center rounded-xl border border-white/10 px-5 text-sm font-semibold text-stone-300 transition hover:border-white/20 hover:text-white disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-cyan-300 px-5 text-sm font-bold text-[#071211] transition hover:bg-cyan-200 disabled:cursor-wait disabled:opacity-60"
            >
              <FaSave aria-hidden="true" />
              {isSaving ? "Saving…" : product ? "Save changes" : "Add product"}
            </button>
          </footer>
        </form>
      </section>
    </div>
  );
}

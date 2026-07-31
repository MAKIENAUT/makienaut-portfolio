import type { BangusProductInput } from "@/types/bangus";

interface ValidationResult {
  ok: true;
  product: BangusProductInput;
}

interface ValidationError {
  ok: false;
  message: string;
}

const cleanText = (value: unknown) =>
  typeof value === "string" ? value.trim().replace(/\s+/g, " ") : "";

const parseWholePeso = (value: unknown) => {
  if (typeof value === "number") return value;
  if (typeof value === "string" && /^\d+$/.test(value.trim())) {
    return Number(value);
  }
  return Number.NaN;
};

export const validateBangusProduct = (
  value: unknown
): ValidationResult | ValidationError => {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return { ok: false, message: "Enter the product details." };
  }

  const body = value as Record<string, unknown>;
  const name = cleanText(body.name);
  const category = cleanText(body.category);
  const sizePack = cleanText(body.sizePack);
  const flavor = cleanText(body.flavor);
  const pieces = cleanText(body.pieces);
  const supplierPrice = parseWholePeso(body.supplierPrice);
  const retailPrice = parseWholePeso(body.retailPrice);

  if (!name || name.length > 120) {
    return {
      ok: false,
      message: "Product name is required and must be 120 characters or less.",
    };
  }

  if (!category || category.length > 80) {
    return {
      ok: false,
      message: "Category is required and must be 80 characters or less.",
    };
  }

  if (!sizePack || sizePack.length > 60) {
    return {
      ok: false,
      message: "Size / pack is required and must be 60 characters or less.",
    };
  }

  if (flavor.length > 60 || pieces.length > 60) {
    return {
      ok: false,
      message: "Flavor and pieces must each be 60 characters or less.",
    };
  }

  if (
    !Number.isInteger(supplierPrice) ||
    supplierPrice < 0 ||
    supplierPrice > 1_000_000 ||
    !Number.isInteger(retailPrice) ||
    retailPrice < 0 ||
    retailPrice > 1_000_000
  ) {
    return {
      ok: false,
      message: "Supplier and retail prices must be whole peso amounts.",
    };
  }

  return {
    ok: true,
    product: {
      name,
      supplierPrice,
      retailPrice,
      category,
      sizePack,
      flavor,
      pieces,
      isActive: body.isActive !== false,
    },
  };
};

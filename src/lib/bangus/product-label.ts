import type { BangusProductRecord } from "@/types/bangus";

const initials = (value: string) =>
  value
    .split(/\s+/)
    .filter((word) => word.toLowerCase() !== "ng")
    .map((word) => word[0])
    .join("")
    .toUpperCase();

const abbreviatePieces = (value: string) =>
  value
    .toUpperCase()
    .replace(/\s+/g, "")
    .replace(/PIECES|PCS|PC/g, "P")
    .replace(/DOZEN/g, "DZ");

export const getBangusProductAbbreviation = (
  product: BangusProductRecord
) => {
  const parts = [initials(product.name)];

  if (product.sizePack.toLowerCase() !== "standard") {
    parts.push(initials(product.sizePack));
  }
  if (product.flavor) parts.push(initials(product.flavor));
  if (product.pieces) parts.push(abbreviatePieces(product.pieces));

  return parts.join(" · ");
};

export const getBangusProductFullLabel = (product: BangusProductRecord) =>
  [
    product.name,
    product.sizePack,
    product.flavor,
    product.pieces,
  ]
    .filter(Boolean)
    .join(" · ");

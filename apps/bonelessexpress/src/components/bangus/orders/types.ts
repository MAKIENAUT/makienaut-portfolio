import type {
  BangusDeliveryTableRecord,
  BangusOrderRecord,
  BangusPaymentMethod,
  BangusProductRecord,
} from "@/types/bangus";

export type PaymentStatusFilter = "ALL" | "PAID" | "UNPAID";
export type ReceiptStatusFilter = "ALL" | "RECEIVED" | "NOT_RECEIVED";
export type ShortageStatusFilter = "ALL" | "SHORTED" | "NO_SHORTAGES";

export interface OrdersTabProps {
  products: BangusProductRecord[];
  initialDeliveryTables: BangusDeliveryTableRecord[];
  accessMode?: "admin" | "supplier";
}

export interface TableTotals {
  retail: number;
  supplier: number;
  paid: number;
  repacked: number;
  received: number;
}

export const paymentLabels: Record<BangusPaymentMethod, string> = {
  GCASH: "GCash",
  CASH: "Cash",
  BANK: "Bank",
};

export const formatDeliveryDate = (value: string, includeWeekday = true) =>
  new Intl.DateTimeFormat("en-PH", {
    timeZone: "UTC",
    ...(includeWeekday ? { weekday: "long" as const } : {}),
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date(`${value}T00:00:00.000Z`));

export const formatTableLabel = (table: BangusDeliveryTableRecord) =>
  `${table.name} · ${formatDeliveryDate(table.deliveryDate, false)}`;

export const hasOrderShortage = (order: BangusOrderRecord) =>
  order.items.some((item) => item.shortQuantity > 0);

export const getFlavorClasses = (flavor: string | null | undefined) => {
  const normalizedFlavor = flavor?.trim().toLowerCase() ?? "";

  if (normalizedFlavor.includes("spicy")) {
    return "border-red-400/30 bg-red-400/10 text-red-100";
  }
  if (normalizedFlavor.includes("regular")) {
    return "border-blue-400/30 bg-blue-400/10 text-blue-100";
  }
  if (normalizedFlavor.includes("sweet")) {
    return "border-amber-300/30 bg-amber-300/10 text-amber-100";
  }
  if (normalizedFlavor.includes("garlic")) {
    return "border-violet-300/30 bg-violet-300/10 text-violet-100";
  }
  if (
    normalizedFlavor.includes("original") ||
    normalizedFlavor.includes("plain")
  ) {
    return "border-emerald-300/30 bg-emerald-300/10 text-emerald-100";
  }

  return "border-white/10 bg-white/[0.03] text-stone-200";
};

export const getFlavorAccentClasses = (flavor: string | null | undefined) => {
  const normalizedFlavor = flavor?.trim().toLowerCase() ?? "";

  if (normalizedFlavor.includes("spicy")) return "border-l-red-400";
  if (normalizedFlavor.includes("regular")) return "border-l-blue-400";
  if (normalizedFlavor.includes("sweet")) return "border-l-amber-300";
  if (normalizedFlavor.includes("garlic")) return "border-l-violet-300";
  if (
    normalizedFlavor.includes("original") ||
    normalizedFlavor.includes("plain")
  ) {
    return "border-l-emerald-300";
  }

  return "border-l-stone-600";
};

export const getManilaDate = () => {
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

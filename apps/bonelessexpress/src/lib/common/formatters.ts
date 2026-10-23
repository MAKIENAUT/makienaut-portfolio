export type DateFormatStyle = "short" | "medium" | "long";

const DATE_FORMAT_OPTIONS: Record<
  DateFormatStyle,
  Intl.DateTimeFormatOptions
> = {
  short: {
    timeZone: "UTC",
    month: "short",
    day: "numeric",
    year: "numeric",
  },
  medium: {
    timeZone: "UTC",
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  },
  long: {
    timeZone: "UTC",
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  },
};

const parseDateValue = (
  date: string | Date | null | undefined
): Date | null => {
  if (date === null || date === undefined) {
    return null;
  }

  if (date instanceof Date) {
    return Number.isNaN(date.getTime()) ? null : date;
  }

  if (typeof date === "string") {
    const trimmed = date.trim();
    if (!trimmed) {
      return null;
    }

    const isDateOnly = /^\d{4}-\d{2}-\d{2}$/.test(trimmed);
    const parsed = new Date(isDateOnly ? `${trimmed}T00:00:00.000Z` : trimmed);

    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }

  return null;
};

/**
 * Formats a numeric amount as Philippine Peso (PHP), e.g. ₱1,250.
 * Falls back to the specified string (defaulting to "—") if amount is null, undefined, or non-finite.
 */
export const formatCurrency = (
  amount: number | null | undefined,
  fallback = "—"
): string => {
  if (amount === null || amount === undefined || !Number.isFinite(amount)) {
    return fallback;
  }

  const fractionDigits = Number.isInteger(amount) ? 0 : 2;

  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(amount);
};

/**
 * Formats a date string or Date object in en-PH locale (UTC timezone).
 * - "short": "Oct 25, 2026"
 * - "medium": "Sun, Oct 25, 2026"
 * - "long": "Sunday, October 25, 2026"
 */
export const formatDate = (
  date: string | Date | null | undefined,
  style: DateFormatStyle = "medium"
): string => {
  const parsed = parseDateValue(date);
  if (!parsed) {
    return "—";
  }

  const options = DATE_FORMAT_OPTIONS[style] ?? DATE_FORMAT_OPTIONS.medium;
  return new Intl.DateTimeFormat("en-PH", options).format(parsed);
};

/**
 * Formats a distance in kilometers with 2 decimal precision (e.g. "10.00 km").
 * Returns "—" for null, undefined, non-finite, or negative numbers.
 */
export const formatDistance = (km: number | null | undefined): string => {
  if (km === null || km === undefined || !Number.isFinite(km) || km < 0) {
    return "—";
  }

  return `${km.toFixed(2)} km`;
};

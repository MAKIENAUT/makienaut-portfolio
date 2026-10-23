import { describe, expect, it } from "vitest";
import {
  formatCurrency,
  formatDate,
  formatDistance,
} from "./formatters";

describe("formatCurrency", () => {
  it("formats integer amounts as Philippine Peso with no decimal places", () => {
    expect(formatCurrency(1250)).toBe("₱1,250");
    expect(formatCurrency(0)).toBe("₱0");
    expect(formatCurrency(25)).toBe("₱25");
    expect(formatCurrency(1_000_000)).toBe("₱1,000,000");
  });

  it("formats amounts with centavos to 2 decimal places", () => {
    expect(formatCurrency(1250.5)).toBe("₱1,250.50");
    expect(formatCurrency(1250.75)).toBe("₱1,250.75");
    expect(formatCurrency(0.99)).toBe("₱0.99");
  });

  it("formats negative numbers correctly", () => {
    expect(formatCurrency(-50)).toBe("-₱50");
    expect(formatCurrency(-1250.5)).toBe("-₱1,250.50");
  });

  it("returns default fallback for null, undefined, and non-finite values", () => {
    expect(formatCurrency(null)).toBe("—");
    expect(formatCurrency(undefined)).toBe("—");
    expect(formatCurrency(Number.NaN)).toBe("—");
    expect(formatCurrency(Number.POSITIVE_INFINITY)).toBe("—");
    expect(formatCurrency(Number.NEGATIVE_INFINITY)).toBe("—");
  });

  it("returns custom fallback when specified", () => {
    expect(formatCurrency(null, "Free")).toBe("Free");
    expect(formatCurrency(undefined, "")).toBe("");
    expect(formatCurrency(Number.NaN, "N/A")).toBe("N/A");
  });
});

describe("formatDate", () => {
  it("defaults to medium style (e.g. 'Sun, Oct 25, 2026')", () => {
    expect(formatDate("2026-10-25")).toBe("Sun, Oct 25, 2026");
  });

  it("formats with short style (e.g. 'Oct 25, 2026')", () => {
    expect(formatDate("2026-10-25", "short")).toBe("Oct 25, 2026");
  });

  it("formats with long style (e.g. 'Sunday, October 25, 2026')", () => {
    expect(formatDate("2026-10-25", "long")).toBe("Sunday, October 25, 2026");
  });

  it("handles Date objects correctly in UTC", () => {
    const date = new Date(Date.UTC(2026, 9, 25, 12, 0, 0));
    expect(formatDate(date, "short")).toBe("Oct 25, 2026");
    expect(formatDate(date, "medium")).toBe("Sun, Oct 25, 2026");
    expect(formatDate(date, "long")).toBe("Sunday, October 25, 2026");
  });

  it("handles ISO strings correctly", () => {
    expect(formatDate("2026-10-25T14:30:00.000Z", "long")).toBe(
      "Sunday, October 25, 2026"
    );
  });

  it("handles leap year dates", () => {
    expect(formatDate("2024-02-29", "short")).toBe("Feb 29, 2024");
    expect(formatDate("2024-02-29", "long")).toBe("Thursday, February 29, 2024");
  });

  it("returns fallback for null, undefined, empty, and invalid dates", () => {
    expect(formatDate(null)).toBe("—");
    expect(formatDate(undefined)).toBe("—");
    expect(formatDate("")).toBe("—");
    expect(formatDate("   ")).toBe("—");
    expect(formatDate("not-a-date")).toBe("—");
    expect(formatDate(new Date("invalid"))).toBe("—");
  });
});

describe("formatDistance", () => {
  it("formats distances with two decimal places", () => {
    expect(formatDistance(10)).toBe("10.00 km");
    expect(formatDistance(12.5)).toBe("12.50 km");
    expect(formatDistance(3.14159)).toBe("3.14 km");
    expect(formatDistance(0)).toBe("0.00 km");
    expect(formatDistance(0.01)).toBe("0.01 km");
    expect(formatDistance(999.99)).toBe("999.99 km");
  });

  it("returns fallback for null, undefined, and non-finite values", () => {
    expect(formatDistance(null)).toBe("—");
    expect(formatDistance(undefined)).toBe("—");
    expect(formatDistance(Number.NaN)).toBe("—");
    expect(formatDistance(Number.POSITIVE_INFINITY)).toBe("—");
  });

  it("returns fallback for negative distances", () => {
    expect(formatDistance(-1)).toBe("—");
    expect(formatDistance(-0.01)).toBe("—");
  });
});

import { describe, it, expect } from "vitest";
import {
  isBangusUuid,
  validateBangusDeliveryDate,
  validateBangusDeliveryTable,
  validateBangusOrder,
  validateOrderInput,
  validateBangusOrderStatus,
} from "./order-validation";

const VALID_UUID_1 = "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11";
const VALID_UUID_2 = "b2c3d4e5-f6a7-4b8c-9d0e-1f2a3b4c5d6e";

describe("order-validation", () => {
  describe("isBangusUuid", () => {
    it("returns true for valid standard UUIDs (v1-v5)", () => {
      expect(isBangusUuid(VALID_UUID_1)).toBe(true);
      expect(isBangusUuid(VALID_UUID_2)).toBe(true);
      expect(isBangusUuid("123e4567-e89b-12d3-a456-426614174000")).toBe(true);
    });

    it("returns false for invalid UUID strings", () => {
      expect(isBangusUuid("")).toBe(false);
      expect(isBangusUuid("not-a-uuid")).toBe(false);
      expect(isBangusUuid("12345678-1234-1234-1234-12345678901")).toBe(false); // short
      expect(isBangusUuid("g0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11")).toBe(false); // non-hex
    });
  });

  describe("validateBangusDeliveryDate", () => {
    it("validates correct YYYY-MM-DD dates", () => {
      expect(validateBangusDeliveryDate("2026-10-22")).toBe("2026-10-22");
      expect(validateBangusDeliveryDate("2024-02-29")).toBe("2024-02-29"); // leap year
    });

    it("returns null for non-string inputs", () => {
      expect(validateBangusDeliveryDate(null)).toBeNull();
      expect(validateBangusDeliveryDate(undefined)).toBeNull();
      expect(validateBangusDeliveryDate(12345)).toBeNull();
      expect(validateBangusDeliveryDate({})).toBeNull();
    });

    it("returns null for invalid formats or impossible dates", () => {
      expect(validateBangusDeliveryDate("2026/10/22")).toBeNull();
      expect(validateBangusDeliveryDate("10-22-2026")).toBeNull();
      expect(validateBangusDeliveryDate("2026-02-29")).toBeNull(); // not a leap year
      expect(validateBangusDeliveryDate("2026-13-01")).toBeNull(); // month 13
      expect(validateBangusDeliveryDate("2026-00-10")).toBeNull(); // month 00
      expect(validateBangusDeliveryDate("2026-04-31")).toBeNull(); // April has 30 days
    });
  });

  describe("validateBangusDeliveryTable", () => {
    it("validates a proper delivery table payload", () => {
      const result = validateBangusDeliveryTable({
        name: "  Route A Morning Delivery  ",
        deliveryDate: "2026-10-25",
      });

      expect(result).toEqual({
        name: "Route A Morning Delivery",
        deliveryDate: "2026-10-25",
      });
    });

    it("returns null for non-object, null, or array inputs", () => {
      expect(validateBangusDeliveryTable(null)).toBeNull();
      expect(validateBangusDeliveryTable("table")).toBeNull();
      expect(validateBangusDeliveryTable([])).toBeNull();
    });

    it("returns null if name is empty or exceeding 120 chars", () => {
      expect(
        validateBangusDeliveryTable({
          name: "   ",
          deliveryDate: "2026-10-25",
        })
      ).toBeNull();

      expect(
        validateBangusDeliveryTable({
          name: "a".repeat(121),
          deliveryDate: "2026-10-25",
        })
      ).toBeNull();
    });

    it("returns null if deliveryDate is invalid", () => {
      expect(
        validateBangusDeliveryTable({
          name: "Route B",
          deliveryDate: "invalid-date",
        })
      ).toBeNull();
    });
  });

  describe("validateOrderInput & validateBangusOrder", () => {
    it("validateOrderInput and validateBangusOrder reference the same function", () => {
      expect(validateOrderInput).toBe(validateBangusOrder);
    });

    describe("input structure edge cases", () => {
      it("fails when payload is not an object, null, or array", () => {
        expect(validateOrderInput(null)).toEqual({
          ok: false,
          message: "Enter the order details.",
        });

        expect(validateOrderInput(undefined)).toEqual({
          ok: false,
          message: "Enter the order details.",
        });

        expect(validateOrderInput("order-string")).toEqual({
          ok: false,
          message: "Enter the order details.",
        });

        expect(validateOrderInput([1, 2, 3])).toEqual({
          ok: false,
          message: "Enter the order details.",
        });
      });
    });

    describe("customer name validation", () => {
      it("fails if customerName is missing, empty, or whitespace only", () => {
        const basePayload = {
          paymentMethod: "CASH",
          quantities: { [VALID_UUID_1]: 5 },
        };

        expect(
          validateOrderInput({ ...basePayload, customerName: "" })
        ).toEqual({
          ok: false,
          message:
            "Customer name is required and must be 120 characters or less.",
        });

        expect(
          validateOrderInput({ ...basePayload, customerName: "   " })
        ).toEqual({
          ok: false,
          message:
            "Customer name is required and must be 120 characters or less.",
        });

        expect(
          validateOrderInput({ ...basePayload, customerName: undefined })
        ).toEqual({
          ok: false,
          message:
            "Customer name is required and must be 120 characters or less.",
        });
      });

      it("fails if customerName exceeds 120 characters", () => {
        const basePayload = {
          customerName: "A".repeat(121),
          paymentMethod: "CASH",
          quantities: { [VALID_UUID_1]: 5 },
        };

        expect(validateOrderInput(basePayload)).toEqual({
          ok: false,
          message:
            "Customer name is required and must be 120 characters or less.",
        });
      });

      it("normalizes consecutive whitespaces in customerName", () => {
        const payload = {
          customerName: "  Juan   Dela   Cruz  ",
          paymentMethod: "CASH",
          quantities: { [VALID_UUID_1]: 5 },
        };

        const result = validateOrderInput(payload);
        expect(result.ok).toBe(true);
        if (result.ok) {
          expect(result.order.customerName).toBe("Juan Dela Cruz");
        }
      });
    });

    describe("payment method validation", () => {
      it("accepts valid payment methods CASH, GCASH, BANK", () => {
        for (const method of ["CASH", "GCASH", "BANK"]) {
          const result = validateOrderInput({
            customerName: "Maria Santos",
            paymentMethod: method,
            quantities: { [VALID_UUID_1]: 2 },
          });

          expect(result.ok).toBe(true);
          if (result.ok) {
            expect(result.order.paymentMethod).toBe(method);
            expect(result.order.paid).toBe(true); // Automatically true when paymentMethod is set
          }
        }
      });

      it("accepts null or empty string as unpaid payment method", () => {
        const resultNull = validateOrderInput({
          customerName: "Maria Santos",
          paymentMethod: null,
          paid: false,
          quantities: { [VALID_UUID_1]: 2 },
        });

        expect(resultNull.ok).toBe(true);
        if (resultNull.ok) {
          expect(resultNull.order.paymentMethod).toBeNull();
          expect(resultNull.order.paid).toBe(false);
        }

        const resultEmpty = validateOrderInput({
          customerName: "Maria Santos",
          paymentMethod: "",
          paid: false,
          quantities: { [VALID_UUID_1]: 2 },
        });

        expect(resultEmpty.ok).toBe(true);
        if (resultEmpty.ok) {
          expect(resultEmpty.order.paymentMethod).toBeNull();
          expect(resultEmpty.order.paid).toBe(false);
        }
      });

      it("fails for invalid payment method string", () => {
        const result = validateOrderInput({
          customerName: "Maria Santos",
          paymentMethod: "BITCOIN",
          quantities: { [VALID_UUID_1]: 2 },
        });

        expect(result).toEqual({
          ok: false,
          message: "Choose a valid payment method.",
        });
      });
    });

    describe("quantities validation edge cases", () => {
      const baseValid = {
        customerName: "Pedro Penduko",
        paymentMethod: "CASH",
      };

      it("fails if quantities is missing, null, or not an object", () => {
        expect(validateOrderInput({ ...baseValid })).toEqual({
          ok: false,
          message: "Add at least one product to the order.",
        });

        expect(
          validateOrderInput({ ...baseValid, quantities: null })
        ).toEqual({
          ok: false,
          message: "Add at least one product to the order.",
        });

        expect(validateOrderInput({ ...baseValid, quantities: [] })).toEqual({
          ok: false,
          message: "Add at least one product to the order.",
        });
      });

      it("fails if product ID is not a valid UUID", () => {
        expect(
          validateOrderInput({
            ...baseValid,
            quantities: { "not-a-uuid": 5 },
          })
        ).toEqual({
          ok: false,
          message: "Enter valid whole-number quantities.",
        });
      });

      it("fails if quantity is negative, non-integer, or exceeds 10,000", () => {
        expect(
          validateOrderInput({
            ...baseValid,
            quantities: { [VALID_UUID_1]: -1 },
          })
        ).toEqual({
          ok: false,
          message: "Enter valid whole-number quantities.",
        });

        expect(
          validateOrderInput({
            ...baseValid,
            quantities: { [VALID_UUID_1]: 2.5 },
          })
        ).toEqual({
          ok: false,
          message: "Enter valid whole-number quantities.",
        });

        expect(
          validateOrderInput({
            ...baseValid,
            quantities: { [VALID_UUID_1]: 10001 },
          })
        ).toEqual({
          ok: false,
          message: "Enter valid whole-number quantities.",
        });
      });

      it("filters out 0 quantities and fails if no positive quantity remains", () => {
        expect(
          validateOrderInput({
            ...baseValid,
            quantities: { [VALID_UUID_1]: 0 },
          })
        ).toEqual({
          ok: false,
          message: "Add at least one product to the order.",
        });
      });

      it("preserves positive quantities and filters 0 quantities when mixed", () => {
        const result = validateOrderInput({
          ...baseValid,
          quantities: {
            [VALID_UUID_1]: 10,
            [VALID_UUID_2]: 0,
          },
        });

        expect(result.ok).toBe(true);
        if (result.ok) {
          expect(result.order.quantities).toEqual({
            [VALID_UUID_1]: 10,
          });
        }
      });
    });

    describe("shortQuantities validation edge cases", () => {
      const baseValid = {
        customerName: "Pedro Penduko",
        paymentMethod: "CASH",
        quantities: { [VALID_UUID_1]: 10 },
      };

      it("defaults shortQuantities to empty object when omitted", () => {
        const result = validateOrderInput(baseValid);
        expect(result.ok).toBe(true);
        if (result.ok) {
          expect(result.order.shortQuantities).toEqual({});
        }
      });

      it("fails if shortQuantities is not an object or is an array/string/number", () => {
        expect(
          validateOrderInput({ ...baseValid, shortQuantities: [1, 2] })
        ).toEqual({
          ok: false,
          message: "Enter valid short quantities.",
        });

        expect(
          validateOrderInput({ ...baseValid, shortQuantities: "invalid" })
        ).toEqual({
          ok: false,
          message: "Enter valid short quantities.",
        });

        expect(
          validateOrderInput({ ...baseValid, shortQuantities: 42 })
        ).toEqual({
          ok: false,
          message: "Enter valid short quantities.",
        });
      });

      it("handles null or omitted shortQuantities as empty object", () => {
        const result = validateOrderInput({ ...baseValid, shortQuantities: null });
        expect(result.ok).toBe(true);
        if (result.ok) {
          expect(result.order.shortQuantities).toEqual({});
        }
      });

      it("fails if shortQuantities includes product not in ordered quantities", () => {
        expect(
          validateOrderInput({
            ...baseValid,
            shortQuantities: { [VALID_UUID_2]: 2 },
          })
        ).toEqual({
          ok: false,
          message:
            "A missing quantity must be a whole number up to the quantity ordered.",
        });
      });

      it("fails if shortQuantity is negative, fractional, or exceeds ordered quantity", () => {
        expect(
          validateOrderInput({
            ...baseValid,
            shortQuantities: { [VALID_UUID_1]: -1 },
          })
        ).toEqual({
          ok: false,
          message:
            "A missing quantity must be a whole number up to the quantity ordered.",
        });

        expect(
          validateOrderInput({
            ...baseValid,
            shortQuantities: { [VALID_UUID_1]: 1.5 },
          })
        ).toEqual({
          ok: false,
          message:
            "A missing quantity must be a whole number up to the quantity ordered.",
        });

        expect(
          validateOrderInput({
            ...baseValid,
            shortQuantities: { [VALID_UUID_1]: 11 }, // Ordered was 10
          })
        ).toEqual({
          ok: false,
          message:
            "A missing quantity must be a whole number up to the quantity ordered.",
        });
      });

      it("filters out 0 shortQuantities and keeps positive ones", () => {
        const result = validateOrderInput({
          ...baseValid,
          quantities: {
            [VALID_UUID_1]: 10,
            [VALID_UUID_2]: 5,
          },
          shortQuantities: {
            [VALID_UUID_1]: 3,
            [VALID_UUID_2]: 0,
          },
        });

        expect(result.ok).toBe(true);
        if (result.ok) {
          expect(result.order.shortQuantities).toEqual({
            [VALID_UUID_1]: 3,
          });
        }
      });
    });

    describe("status flags (repacked, received, paid)", () => {
      it("correctly casts boolean flags", () => {
        const result = validateOrderInput({
          customerName: "Ana Reyes",
          paymentMethod: null,
          repacked: true,
          received: true,
          paid: false,
          quantities: { [VALID_UUID_1]: 4 },
        });

        expect(result.ok).toBe(true);
        if (result.ok) {
          expect(result.order.repacked).toBe(true);
          expect(result.order.received).toBe(true);
          expect(result.order.paid).toBe(false);
        }
      });

      it("sets defaults for missing status flags", () => {
        const result = validateOrderInput({
          customerName: "Ana Reyes",
          paymentMethod: null,
          quantities: { [VALID_UUID_1]: 4 },
        });

        expect(result.ok).toBe(true);
        if (result.ok) {
          expect(result.order.repacked).toBe(false);
          expect(result.order.received).toBe(false);
          expect(result.order.paid).toBe(false);
        }
      });
    });
  });

  describe("validateBangusOrderStatus", () => {
    it("validates valid order status payload", () => {
      const result = validateBangusOrderStatus({
        repacked: true,
        received: false,
        paid: true,
        paymentMethod: "GCASH",
      });

      expect(result).toEqual({
        ok: true,
        status: {
          repacked: true,
          received: false,
          paid: true,
          paymentMethod: "GCASH",
        },
      });
    });

    it("fails for missing or non-boolean status fields", () => {
      expect(
        validateBangusOrderStatus({
          repacked: "yes",
          received: false,
          paid: false,
          paymentMethod: null,
        })
      ).toEqual({
        ok: false,
        message: "Choose valid order statuses.",
      });
    });

    it("fails for non-object status payload", () => {
      expect(validateBangusOrderStatus(null)).toEqual({
        ok: false,
        message: "Choose valid order statuses.",
      });
    });
  });
});

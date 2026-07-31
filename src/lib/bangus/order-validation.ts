import {
  BANGUS_PAYMENT_METHODS,
  type BangusOrderInput,
  type BangusPaymentMethod,
} from "@/types/bangus";

const uuidPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export const isBangusUuid = (value: string) => uuidPattern.test(value);

export const validateBangusDeliveryDate = (value: unknown) => {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return null;
  }

  const date = new Date(`${value}T00:00:00.000Z`);
  return Number.isNaN(date.getTime()) ||
    date.toISOString().slice(0, 10) !== value
    ? null
    : value;
};

const validatePaymentMethod = (
  value: unknown
): BangusPaymentMethod | null | undefined => {
  if (value === null || value === "") return null;
  return typeof value === "string" &&
    BANGUS_PAYMENT_METHODS.includes(value as BangusPaymentMethod)
    ? (value as BangusPaymentMethod)
    : undefined;
};

export const validateBangusOrder = (
  value: unknown
):
  | { ok: true; order: BangusOrderInput }
  | { ok: false; message: string } => {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return { ok: false, message: "Enter the order details." };
  }

  const body = value as Record<string, unknown>;
  const customerName =
    typeof body.customerName === "string"
      ? body.customerName.trim().replace(/\s+/g, " ")
      : "";
  const paymentMethod = validatePaymentMethod(body.paymentMethod);

  if (!customerName || customerName.length > 120) {
    return {
      ok: false,
      message: "Customer name is required and must be 120 characters or less.",
    };
  }

  if (paymentMethod === undefined) {
    return { ok: false, message: "Choose a valid payment method." };
  }

  if (
    !body.quantities ||
    typeof body.quantities !== "object" ||
    Array.isArray(body.quantities)
  ) {
    return { ok: false, message: "Add at least one product to the order." };
  }

  const quantities: Record<string, number> = {};
  for (const [productId, rawQuantity] of Object.entries(
    body.quantities as Record<string, unknown>
  )) {
    const quantity = Number(rawQuantity);
    if (
      !isBangusUuid(productId) ||
      !Number.isInteger(quantity) ||
      quantity < 0 ||
      quantity > 10_000
    ) {
      return { ok: false, message: "Enter valid whole-number quantities." };
    }
    if (quantity > 0) quantities[productId] = quantity;
  }

  if (Object.keys(quantities).length === 0) {
    return { ok: false, message: "Add at least one product to the order." };
  }

  return {
    ok: true,
    order: {
      customerName,
      received: body.received === true,
      paid: body.paid === true,
      paymentMethod,
      quantities,
    },
  };
};

export const validateBangusOrderStatus = (
  value: unknown
):
  | {
      ok: true;
      status: {
        received: boolean;
        paid: boolean;
        paymentMethod: BangusPaymentMethod | null;
      };
    }
  | { ok: false; message: string } => {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return { ok: false, message: "Choose valid order statuses." };
  }

  const body = value as Record<string, unknown>;
  const paymentMethod = validatePaymentMethod(body.paymentMethod);
  if (
    typeof body.received !== "boolean" ||
    typeof body.paid !== "boolean" ||
    paymentMethod === undefined
  ) {
    return { ok: false, message: "Choose valid order statuses." };
  }

  return {
    ok: true,
    status: {
      received: body.received,
      paid: body.paid,
      paymentMethod,
    },
  };
};

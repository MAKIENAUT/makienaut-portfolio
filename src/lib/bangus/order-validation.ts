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

export const validateBangusDeliveryTable = (value: unknown) => {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }

  const body = value as Record<string, unknown>;
  const name =
    typeof body.name === "string"
      ? body.name.trim().replace(/\s+/g, " ")
      : "";
  const deliveryDate = validateBangusDeliveryDate(body.deliveryDate);

  return name && name.length <= 120 && deliveryDate
    ? { name, deliveryDate }
    : null;
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

  const rawShortQuantities = body.shortQuantities ?? {};
  if (
    typeof rawShortQuantities !== "object" ||
    rawShortQuantities === null ||
    Array.isArray(rawShortQuantities)
  ) {
    return { ok: false, message: "Enter valid short quantities." };
  }

  const shortQuantities: Record<string, number> = {};
  for (const [productId, rawShortQuantity] of Object.entries(
    rawShortQuantities as Record<string, unknown>
  )) {
    const shortQuantity = Number(rawShortQuantity);
    const orderedQuantity = quantities[productId];
    if (
      !isBangusUuid(productId) ||
      orderedQuantity === undefined ||
      !Number.isInteger(shortQuantity) ||
      shortQuantity < 0 ||
      shortQuantity > orderedQuantity
    ) {
      return {
        ok: false,
        message: "A missing quantity must be a whole number up to the quantity ordered.",
      };
    }
    if (shortQuantity > 0) shortQuantities[productId] = shortQuantity;
  }

  return {
    ok: true,
    order: {
      customerName,
      repacked: body.repacked === true,
      received: body.received === true,
      paid: paymentMethod ? true : body.paid === true,
      paymentMethod,
      quantities,
      shortQuantities,
    },
  };
};

export const validateBangusOrderStatus = (
  value: unknown
):
  | {
      ok: true;
      status: {
        repacked: boolean;
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
    typeof body.repacked !== "boolean" ||
    typeof body.received !== "boolean" ||
    typeof body.paid !== "boolean" ||
    paymentMethod === undefined
  ) {
    return { ok: false, message: "Choose valid order statuses." };
  }

  return {
    ok: true,
    status: {
      repacked: body.repacked,
      received: body.received,
      paid: paymentMethod ? true : body.paid,
      paymentMethod,
    },
  };
};

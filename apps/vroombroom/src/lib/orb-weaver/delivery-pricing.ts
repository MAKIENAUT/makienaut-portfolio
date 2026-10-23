import {
  ORB_WEAVER_ADD_ONS,
  type OrbWeaverHandoffMethod,
  type OrbWeaverServiceId,
} from "@/types/orb-weaver";

export const ORB_WEAVER_INCLUDED_DELIVERY_DISTANCE_KM = 10;
export const ORB_WEAVER_EXCESS_DELIVERY_RATE_PER_KM = 10;
// The database stores the route distance as Decimal(5, 2). This is a
// technical validation limit, not the boundary of the delivery area.
export const ORB_WEAVER_MAX_DELIVERY_DISTANCE_KM = 999.99;

export interface OrbWeaverDeliveryQuote {
  distanceKm: number;
  baseFee: number;
  excessDistanceKm: number;
  excessFee: number;
  fee: number;
  label: string;
}

export const getOrbWeaverDeliveryQuote = ({
  distanceKm,
  handoffMethod,
  helmetCount,
}: {
  distanceKm: number;
  handoffMethod: OrbWeaverHandoffMethod | null;
  helmetCount: number;
}): OrbWeaverDeliveryQuote | null => {
  if (
    !Number.isFinite(distanceKm) ||
    distanceKm <= 0 ||
    distanceKm > ORB_WEAVER_MAX_DELIVERY_DISTANCE_KM
  ) {
    return null;
  }

  const normalizedDistance = Number(distanceKm.toFixed(2));
  const distanceHundredths = Math.round(normalizedDistance * 100);
  const includedDistanceHundredths =
    ORB_WEAVER_INCLUDED_DELIVERY_DISTANCE_KM * 100;
  const excessDistanceHundredths = Math.max(
    0,
    distanceHundredths - includedDistanceHundredths
  );
  const excessDistanceKm = excessDistanceHundredths / 100;
  // Delivery fees are stored as whole pesos, so partial-peso results round up.
  const excessFee = Math.ceil(
    (excessDistanceHundredths *
      ORB_WEAVER_EXCESS_DELIVERY_RATE_PER_KM) /
      100
  );
  let baseFee: number;
  let label: string;

  if (handoffMethod === "drop_off") {
    baseFee = 0;
    label = "Customer drop-off + return";
  } else if (handoffMethod === "pickup_return" && helmetCount >= 2) {
    baseFee = 0;
    label = "Pickup + return for 2+ helmets";
  } else if (
    handoffMethod === "pickup_return" &&
    normalizedDistance <= 5
  ) {
    baseFee = 30;
    label = "Pickup + return · up to 5 km";
  } else if (handoffMethod === "pickup_return") {
    baseFee = 50;
    label = "Pickup + return · over 5 km";
  } else {
    return null;
  }

  return {
    distanceKm: normalizedDistance,
    baseFee,
    excessDistanceKm,
    excessFee,
    fee: baseFee + excessFee,
    label,
  };
};

export const isOrbWeaverGoogleMapsUrl = (value: string) => {
  try {
    const url = new URL(value);

    if (url.protocol !== "https:") {
      return false;
    }

    if (url.hostname === "maps.app.goo.gl" || url.hostname === "goo.gl") {
      return true;
    }

    return (
      ["google.com", "www.google.com", "maps.google.com"].includes(
        url.hostname
      ) && url.pathname.startsWith("/maps")
    );
  } catch {
    return false;
  }
};

export const calculateAddOnSubtotal = (
  addOnIds: string[],
  helmetCount: number = 1,
  serviceId?: OrbWeaverServiceId
): number => {
  return addOnIds.reduce((total, id) => {
    const addOn = ORB_WEAVER_ADD_ONS.find((a) => a.id === id);
    if (!addOn) return total;
    if (
      serviceId &&
      (addOn.includedIn as readonly string[]).includes(serviceId)
    ) {
      return total;
    }
    const quantity = addOn.perBooking ? 1 : helmetCount;
    return total + addOn.price * quantity;
  }, 0);
};

export interface DeliveryPricingParams {
  distanceKm: number;
  handoffMethod: OrbWeaverHandoffMethod | null;
  helmetCount: number;
  addOnIds?: string[];
  serviceId?: OrbWeaverServiceId;
}

export interface OrbWeaverDeliveryPricingDetails extends OrbWeaverDeliveryQuote {
  addOnSubtotal: number;
  totalDeliveryWithAddOns: number;
}

export const calculateDeliveryPricing = (
  params: DeliveryPricingParams
): OrbWeaverDeliveryPricingDetails | null => {
  const quote = getOrbWeaverDeliveryQuote({
    distanceKm: params.distanceKm,
    handoffMethod: params.handoffMethod,
    helmetCount: params.helmetCount,
  });

  if (!quote) {
    return null;
  }

  const addOnSubtotal = params.addOnIds
    ? calculateAddOnSubtotal(
        params.addOnIds,
        params.helmetCount,
        params.serviceId
      )
    : 0;

  return {
    ...quote,
    addOnSubtotal,
    totalDeliveryWithAddOns: quote.fee + addOnSubtotal,
  };
};


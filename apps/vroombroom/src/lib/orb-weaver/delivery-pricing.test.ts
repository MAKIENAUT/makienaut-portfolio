import { describe, it, expect } from "vitest";
import {
  ORB_WEAVER_INCLUDED_DELIVERY_DISTANCE_KM,
  ORB_WEAVER_EXCESS_DELIVERY_RATE_PER_KM,
  ORB_WEAVER_MAX_DELIVERY_DISTANCE_KM,
  getOrbWeaverDeliveryQuote,
  calculateDeliveryPricing,
  calculateAddOnSubtotal,
  isOrbWeaverGoogleMapsUrl,
} from "./delivery-pricing";

describe("delivery-pricing", () => {
  describe("constants", () => {
    it("exports correct pricing constants", () => {
      expect(ORB_WEAVER_INCLUDED_DELIVERY_DISTANCE_KM).toBe(10);
      expect(ORB_WEAVER_EXCESS_DELIVERY_RATE_PER_KM).toBe(10);
      expect(ORB_WEAVER_MAX_DELIVERY_DISTANCE_KM).toBe(999.99);
    });
  });

  describe("getOrbWeaverDeliveryQuote & calculateDeliveryPricing base calculation", () => {
    describe("input validation & edge cases", () => {
      it("returns null for non-finite distances", () => {
        expect(
          calculateDeliveryPricing({
            distanceKm: NaN,
            handoffMethod: "pickup_return",
            helmetCount: 1,
          })
        ).toBeNull();

        expect(
          calculateDeliveryPricing({
            distanceKm: Infinity,
            handoffMethod: "pickup_return",
            helmetCount: 1,
          })
        ).toBeNull();

        expect(
          calculateDeliveryPricing({
            distanceKm: -Infinity,
            handoffMethod: "pickup_return",
            helmetCount: 1,
          })
        ).toBeNull();
      });

      it("returns null for distance <= 0", () => {
        expect(
          calculateDeliveryPricing({
            distanceKm: 0,
            handoffMethod: "pickup_return",
            helmetCount: 1,
          })
        ).toBeNull();

        expect(
          calculateDeliveryPricing({
            distanceKm: -5,
            handoffMethod: "pickup_return",
            helmetCount: 1,
          })
        ).toBeNull();
      });

      it("returns null for distance exceeding maximum technical distance", () => {
        expect(
          calculateDeliveryPricing({
            distanceKm: 1000,
            handoffMethod: "pickup_return",
            helmetCount: 1,
          })
        ).toBeNull();

        expect(
          calculateDeliveryPricing({
            distanceKm: 999.991,
            handoffMethod: "pickup_return",
            helmetCount: 1,
          })
        ).toBeNull();
      });

      it("accepts distance exactly at maximum boundary 999.99", () => {
        const quote = calculateDeliveryPricing({
          distanceKm: 999.99,
          handoffMethod: "drop_off",
          helmetCount: 1,
        });
        expect(quote).not.toBeNull();
        expect(quote?.distanceKm).toBe(999.99);
      });

      it("returns null for invalid or null handoff method", () => {
        expect(
          calculateDeliveryPricing({
            distanceKm: 5,
            handoffMethod: null,
            helmetCount: 1,
          })
        ).toBeNull();

        expect(
          calculateDeliveryPricing({
            distanceKm: 5,
            handoffMethod: "invalid_method" as any,
            helmetCount: 1,
          })
        ).toBeNull();
      });
    });

    describe("distance thresholds", () => {
      it("calculates 30 base fee for pickup_return within 5 km", () => {
        const quoteAt1Km = calculateDeliveryPricing({
          distanceKm: 1,
          handoffMethod: "pickup_return",
          helmetCount: 1,
        });
        expect(quoteAt1Km).toEqual(
          expect.objectContaining({
            distanceKm: 1,
            baseFee: 30,
            excessDistanceKm: 0,
            excessFee: 0,
            fee: 30,
            label: "Pickup + return · up to 5 km",
          })
        );

        const quoteAt5Km = calculateDeliveryPricing({
          distanceKm: 5,
          handoffMethod: "pickup_return",
          helmetCount: 1,
        });
        expect(quoteAt5Km?.baseFee).toBe(30);
        expect(quoteAt5Km?.fee).toBe(30);
        expect(quoteAt5Km?.label).toBe("Pickup + return · up to 5 km");
      });

      it("calculates 50 base fee for pickup_return between 5.01 km and 10 km", () => {
        const quoteAt5_1Km = calculateDeliveryPricing({
          distanceKm: 5.01,
          handoffMethod: "pickup_return",
          helmetCount: 1,
        });
        expect(quoteAt5_1Km).toEqual(
          expect.objectContaining({
            distanceKm: 5.01,
            baseFee: 50,
            excessDistanceKm: 0,
            excessFee: 0,
            fee: 50,
            label: "Pickup + return · over 5 km",
          })
        );

        const quoteAt10Km = calculateDeliveryPricing({
          distanceKm: 10,
          handoffMethod: "pickup_return",
          helmetCount: 1,
        });
        expect(quoteAt10Km?.baseFee).toBe(50);
        expect(quoteAt10Km?.excessDistanceKm).toBe(0);
        expect(quoteAt10Km?.excessFee).toBe(0);
        expect(quoteAt10Km?.fee).toBe(50);
      });

      it("calculates excess fee for pickup_return beyond 10 km", () => {
        const quoteAt12Km = calculateDeliveryPricing({
          distanceKm: 12,
          handoffMethod: "pickup_return",
          helmetCount: 1,
        });
        expect(quoteAt12Km).toEqual(
          expect.objectContaining({
            distanceKm: 12,
            baseFee: 50,
            excessDistanceKm: 2,
            excessFee: 20, // 2 km * 10
            fee: 70, // 50 base + 20 excess
            label: "Pickup + return · over 5 km",
          })
        );
      });

      it("rounds up partial-peso excess distance fees correctly", () => {
        // 10.05 km -> 0.05 km excess -> 0.05 * 10 = 0.50 pesos -> rounds up to 1 peso
        const quote = calculateDeliveryPricing({
          distanceKm: 10.05,
          handoffMethod: "pickup_return",
          helmetCount: 1,
        });
        expect(quote?.excessDistanceKm).toBe(0.05);
        expect(quote?.excessFee).toBe(1);
        expect(quote?.fee).toBe(51);
      });
    });

    describe("free tiers", () => {
      it("charges 0 base fee for drop_off regardless of helmet count", () => {
        const quoteDropOff = calculateDeliveryPricing({
          distanceKm: 4.5,
          handoffMethod: "drop_off",
          helmetCount: 1,
        });
        expect(quoteDropOff).toEqual(
          expect.objectContaining({
            distanceKm: 4.5,
            baseFee: 0,
            excessDistanceKm: 0,
            excessFee: 0,
            fee: 0,
            label: "Customer drop-off + return",
          })
        );
      });

      it("charges excess fee for drop_off only if exceeding included 10 km", () => {
        const quoteDropOffFar = calculateDeliveryPricing({
          distanceKm: 15,
          handoffMethod: "drop_off",
          helmetCount: 1,
        });
        expect(quoteDropOffFar).toEqual(
          expect.objectContaining({
            distanceKm: 15,
            baseFee: 0,
            excessDistanceKm: 5,
            excessFee: 50,
            fee: 50,
            label: "Customer drop-off + return",
          })
        );
      });

      it("charges 0 base fee for pickup_return with 2 or more helmets (free pickup tier)", () => {
        const quote2Helmets = calculateDeliveryPricing({
          distanceKm: 8,
          handoffMethod: "pickup_return",
          helmetCount: 2,
        });
        expect(quote2Helmets).toEqual(
          expect.objectContaining({
            distanceKm: 8,
            baseFee: 0,
            excessDistanceKm: 0,
            excessFee: 0,
            fee: 0,
            label: "Pickup + return for 2+ helmets",
          })
        );

        const quote3Helmets = calculateDeliveryPricing({
          distanceKm: 3,
          handoffMethod: "pickup_return",
          helmetCount: 3,
        });
        expect(quote3Helmets?.baseFee).toBe(0);
        expect(quote3Helmets?.fee).toBe(0);
        expect(quote3Helmets?.label).toBe("Pickup + return for 2+ helmets");
      });

      it("charges only excess distance fee for pickup_return with 2+ helmets over 10 km", () => {
        const quote2HelmetsFar = calculateDeliveryPricing({
          distanceKm: 14.2,
          handoffMethod: "pickup_return",
          helmetCount: 2,
        });
        expect(quote2HelmetsFar).toEqual(
          expect.objectContaining({
            distanceKm: 14.2,
            baseFee: 0,
            excessDistanceKm: 4.2,
            excessFee: 42,
            fee: 42,
            label: "Pickup + return for 2+ helmets",
          })
        );
      });
    });

    describe("add-ons calculation", () => {
      it("calculates calculateAddOnSubtotal for per-booking add-ons (rush_service)", () => {
        // rush_service is 75 per booking, does not multiply with helmetCount
        const subtotal1 = calculateAddOnSubtotal(["rush_service"], 1);
        expect(subtotal1).toBe(75);

        const subtotal3 = calculateAddOnSubtotal(["rush_service"], 3);
        expect(subtotal3).toBe(75);
      });

      it("calculates calculateAddOnSubtotal for per-helmet add-ons", () => {
        // visor_waterproof_coating is 20 per helmet
        const subtotal1 = calculateAddOnSubtotal(["visor_waterproof_coating"], 1);
        expect(subtotal1).toBe(20);

        const subtotal3 = calculateAddOnSubtotal(["visor_waterproof_coating"], 3);
        expect(subtotal3).toBe(60);
      });

      it("calculates calculateAddOnSubtotal for combined add-ons", () => {
        // rush_service (75) + helmet_bag (20 * 2) = 115
        const subtotal = calculateAddOnSubtotal(
          ["rush_service", "helmet_bag"],
          2
        );
        expect(subtotal).toBe(115);
      });

      it("ignores unrecognized add-on ids", () => {
        const subtotal = calculateAddOnSubtotal(["non_existent_addon"], 2);
        expect(subtotal).toBe(0);
      });

      it("calculates total delivery and add-on pricing via calculateDeliveryPricing", () => {
        const result = calculateDeliveryPricing({
          distanceKm: 4,
          handoffMethod: "pickup_return",
          helmetCount: 2,
          addOnIds: ["rush_service", "helmet_bag"],
        });

        expect(result).not.toBeNull();
        expect(result?.fee).toBe(0); // Free base delivery for 2 helmets
        expect(result?.addOnSubtotal).toBe(115);
        expect(result?.totalDeliveryWithAddOns).toBe(115);
      });

      it("adds delivery fee and add-ons correctly when delivery is not free", () => {
        const result = calculateDeliveryPricing({
          distanceKm: 12,
          handoffMethod: "pickup_return",
          helmetCount: 1,
          addOnIds: ["visor_waterproof_coating"],
        });

        expect(result).not.toBeNull();
        // 50 base + 20 excess = 70 delivery fee
        expect(result?.fee).toBe(70);
        // 20 add-on
        expect(result?.addOnSubtotal).toBe(20);
        // 70 + 20 = 90
        expect(result?.totalDeliveryWithAddOns).toBe(90);
      });
    });

    describe("getOrbWeaverDeliveryQuote direct verification", () => {
      it("works identically for core delivery fields", () => {
        const directQuote = getOrbWeaverDeliveryQuote({
          distanceKm: 5,
          handoffMethod: "pickup_return",
          helmetCount: 1,
        });

        const calculated = calculateDeliveryPricing({
          distanceKm: 5,
          handoffMethod: "pickup_return",
          helmetCount: 1,
        });

        expect(directQuote?.fee).toBe(calculated?.fee);
        expect(directQuote?.baseFee).toBe(calculated?.baseFee);
        expect(directQuote?.excessFee).toBe(calculated?.excessFee);
        expect(directQuote?.label).toBe(calculated?.label);
      });
    });
  });

  describe("isOrbWeaverGoogleMapsUrl", () => {
    it("recognizes valid Google Maps URLs", () => {
      expect(isOrbWeaverGoogleMapsUrl("https://maps.app.goo.gl/abcdef123")).toBe(
        true
      );
      expect(isOrbWeaverGoogleMapsUrl("https://goo.gl/maps/xyz")).toBe(true);
      expect(
        isOrbWeaverGoogleMapsUrl("https://www.google.com/maps/place/Manila")
      ).toBe(true);
      expect(
        isOrbWeaverGoogleMapsUrl("https://maps.google.com/maps?q=14.5995,120.9842")
      ).toBe(true);
    });

    it("rejects non-https URLs", () => {
      expect(isOrbWeaverGoogleMapsUrl("http://maps.app.goo.gl/xyz")).toBe(false);
      expect(isOrbWeaverGoogleMapsUrl("ftp://google.com/maps")).toBe(false);
    });

    it("rejects non-Google URLs and invalid strings", () => {
      expect(isOrbWeaverGoogleMapsUrl("https://example.com/maps")).toBe(false);
      expect(isOrbWeaverGoogleMapsUrl("not-a-valid-url")).toBe(false);
      expect(isOrbWeaverGoogleMapsUrl("")).toBe(false);
      expect(isOrbWeaverGoogleMapsUrl("https://google.com/search?q=maps")).toBe(
        false
      );
    });
  });
});

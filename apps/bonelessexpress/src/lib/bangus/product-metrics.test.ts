import { describe, it, expect } from "vitest";
import { calculateMetrics, type MetricTable } from "./product-metrics";

describe("product-metrics", () => {
  describe("calculateMetrics", () => {
    it("returns empty array for table with no orders", () => {
      const table: MetricTable = { orders: [] };
      const metrics = calculateMetrics(table);
      expect(metrics).toEqual([]);
    });

    it("returns empty array for orders with empty items", () => {
      const table: MetricTable = {
        orders: [
          { repacked: false, items: [] },
          { repacked: true, items: [] },
        ],
      };
      const metrics = calculateMetrics(table);
      expect(metrics).toEqual([]);
    });

    it("calculates metrics accurately for a single unrepacked order without shortage", () => {
      const table: MetricTable = {
        orders: [
          {
            repacked: false,
            items: [
              { productId: "prod-1", quantity: 10, shortQuantity: 0 },
              { productId: "prod-2", quantity: 5, shortQuantity: 0 },
            ],
          },
        ],
      };

      const metrics = calculateMetrics(table);
      expect(metrics).toHaveLength(2);

      const prod1 = metrics.find((m) => m.productId === "prod-1");
      expect(prod1).toEqual({
        productId: "prod-1",
        orderedQuantity: 10,
        shortQuantity: 0,
        receivedQuantity: 10,
        repackedQuantity: 0,
        onHandQuantity: 10,
      });

      const prod2 = metrics.find((m) => m.productId === "prod-2");
      expect(prod2).toEqual({
        productId: "prod-2",
        orderedQuantity: 5,
        shortQuantity: 0,
        receivedQuantity: 5,
        repackedQuantity: 0,
        onHandQuantity: 5,
      });
    });

    it("calculates repackedQuantity when order is marked repacked", () => {
      const table: MetricTable = {
        orders: [
          {
            repacked: true,
            items: [{ productId: "prod-1", quantity: 8, shortQuantity: 0 }],
          },
        ],
      };

      const metrics = calculateMetrics(table);
      expect(metrics).toEqual([
        {
          productId: "prod-1",
          orderedQuantity: 8,
          shortQuantity: 0,
          receivedQuantity: 8,
          repackedQuantity: 8,
          onHandQuantity: 0, // 8 received - 8 repacked = 0
        },
      ]);
    });

    it("aggregates multiple orders for the same product", () => {
      const table: MetricTable = {
        orders: [
          {
            repacked: false,
            items: [{ productId: "prod-1", quantity: 15, shortQuantity: 0 }],
          },
          {
            repacked: true,
            items: [{ productId: "prod-1", quantity: 10, shortQuantity: 0 }],
          },
          {
            repacked: false,
            items: [{ productId: "prod-1", quantity: 5, shortQuantity: 0 }],
          },
        ],
      };

      const metrics = calculateMetrics(table);
      expect(metrics).toEqual([
        {
          productId: "prod-1",
          orderedQuantity: 30, // 15 + 10 + 5
          shortQuantity: 0,
          receivedQuantity: 30,
          repackedQuantity: 10, // only middle order repacked
          onHandQuantity: 20, // 30 - 10
        },
      ]);
    });

    it("calculates shortages and deducts from receivedQuantity", () => {
      const table: MetricTable = {
        orders: [
          {
            repacked: false,
            items: [{ productId: "prod-1", quantity: 20, shortQuantity: 5 }],
          },
          {
            repacked: true,
            items: [{ productId: "prod-1", quantity: 10, shortQuantity: 2 }],
          },
        ],
      };

      const metrics = calculateMetrics(table);
      expect(metrics).toEqual([
        {
          productId: "prod-1",
          orderedQuantity: 30, // 20 + 10
          shortQuantity: 7, // 5 + 2
          receivedQuantity: 23, // 30 - 7
          repackedQuantity: 10, // from order 2
          onHandQuantity: 13, // 23 - 10
        },
      ]);
    });

    it("caps shortQuantity at orderedQuantity if shortage exceeds ordered quantity", () => {
      const table: MetricTable = {
        orders: [
          {
            repacked: false,
            items: [{ productId: "prod-1", quantity: 10, shortQuantity: 25 }],
          },
        ],
      };

      const metrics = calculateMetrics(table);
      expect(metrics).toEqual([
        {
          productId: "prod-1",
          orderedQuantity: 10,
          shortQuantity: 10, // capped at orderedQuantity 10
          receivedQuantity: 0,
          repackedQuantity: 0,
          onHandQuantity: 0,
        },
      ]);
    });

    it("clamps onHandQuantity to zero if repacked exceeds received due to shortage", () => {
      const table: MetricTable = {
        orders: [
          {
            repacked: true, // Entire order is marked repacked
            items: [{ productId: "prod-1", quantity: 10, shortQuantity: 5 }],
          },
        ],
      };

      const metrics = calculateMetrics(table);
      expect(metrics).toEqual([
        {
          productId: "prod-1",
          orderedQuantity: 10,
          shortQuantity: 5,
          receivedQuantity: 5,
          repackedQuantity: 10, // all 10 were marked repacked on the order level
          onHandQuantity: 0, // Math.max(5 - 10, 0) => 0
        },
      ]);
    });

    it("processes complex tables with multiple products and mixed states", () => {
      const table: MetricTable = {
        orders: [
          {
            repacked: true,
            items: [
              { productId: "p-milkfish", quantity: 50, shortQuantity: 5 },
              { productId: "p-tilapia", quantity: 30, shortQuantity: 0 },
            ],
          },
          {
            repacked: false,
            items: [
              { productId: "p-milkfish", quantity: 25, shortQuantity: 10 },
              { productId: "p-shrimp", quantity: 12, shortQuantity: 2 },
            ],
          },
        ],
      };

      const metrics = calculateMetrics(table);
      expect(metrics).toHaveLength(3);

      const milkfish = metrics.find((m) => m.productId === "p-milkfish");
      expect(milkfish).toEqual({
        productId: "p-milkfish",
        orderedQuantity: 75,
        shortQuantity: 15,
        receivedQuantity: 60,
        repackedQuantity: 50,
        onHandQuantity: 10,
      });

      const tilapia = metrics.find((m) => m.productId === "p-tilapia");
      expect(tilapia).toEqual({
        productId: "p-tilapia",
        orderedQuantity: 30,
        shortQuantity: 0,
        receivedQuantity: 30,
        repackedQuantity: 30,
        onHandQuantity: 0,
      });

      const shrimp = metrics.find((m) => m.productId === "p-shrimp");
      expect(shrimp).toEqual({
        productId: "p-shrimp",
        orderedQuantity: 12,
        shortQuantity: 2,
        receivedQuantity: 10,
        repackedQuantity: 0,
        onHandQuantity: 10,
      });
    });
  });
});

import { getBangusDatabase } from "@/lib/orb-weaver/database";
import type { BangusProductMetric } from "@/types/bangus";

type MetricTable = {
  orders: Array<{
    repacked: boolean;
    items: Array<{
      productId: string;
      quantity: number;
      shortQuantity: number;
    }>;
  }>;
};

const getMetricTable = async (deliveryTableId: string) => {
  const database = getBangusDatabase();

  return database.bangusDeliveryTable.findUnique({
    where: { id: deliveryTableId },
    select: {
      orders: {
        select: {
          repacked: true,
          items: {
            select: { productId: true, quantity: true, shortQuantity: true },
          },
        },
      },
    },
  });
};

const calculateMetrics = (table: MetricTable): BangusProductMetric[] => {
  const orderedByProduct = new Map<string, number>();
  const repackedByProduct = new Map<string, number>();
  const shortageByProduct = new Map<string, number>();

  for (const order of table.orders) {
    for (const item of order.items) {
      orderedByProduct.set(
        item.productId,
        (orderedByProduct.get(item.productId) ?? 0) + item.quantity
      );

      shortageByProduct.set(
        item.productId,
        (shortageByProduct.get(item.productId) ?? 0) + item.shortQuantity
      );

      if (order.repacked) {
        repackedByProduct.set(
          item.productId,
          (repackedByProduct.get(item.productId) ?? 0) + item.quantity
        );
      }
    }
  }

  return [...orderedByProduct.entries()].map(([productId, orderedQuantity]) => {
    const shortQuantity = Math.min(
      shortageByProduct.get(productId) ?? 0,
      orderedQuantity
    );
    const receivedQuantity = orderedQuantity - shortQuantity;
    const repackedQuantity = repackedByProduct.get(productId) ?? 0;

    return {
      productId,
      orderedQuantity,
      shortQuantity,
      receivedQuantity,
      repackedQuantity,
      onHandQuantity: Math.max(receivedQuantity - repackedQuantity, 0),
    };
  });
};

export const listBangusProductMetrics = async (deliveryTableId: string) => {
  const table = await getMetricTable(deliveryTableId);

  return table ? calculateMetrics(table) : null;
};

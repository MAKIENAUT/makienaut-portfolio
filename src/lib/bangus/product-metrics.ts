import { getBangusDatabase } from "@/lib/orb-weaver/database";
import type { BangusProductMetric } from "@/types/bangus";

type MetricTable = {
  orders: Array<{
    repacked: boolean;
    items: Array<{ productId: string; quantity: number }>;
  }>;
  shortages: Array<{ productId: string; shortQuantity: number }>;
};

const getMetricTable = async (deliveryTableId: string) => {
  const database = getBangusDatabase();

  return database.bangusDeliveryTable.findUnique({
    where: { id: deliveryTableId },
    select: {
      orders: {
        select: {
          repacked: true,
          items: { select: { productId: true, quantity: true } },
        },
      },
      shortages: { select: { productId: true, shortQuantity: true } },
    },
  });
};

const calculateMetrics = (table: MetricTable): BangusProductMetric[] => {
  const orderedByProduct = new Map<string, number>();
  const repackedByProduct = new Map<string, number>();
  const shortageByProduct = new Map(
    table.shortages.map((shortage) => [
      shortage.productId,
      shortage.shortQuantity,
    ])
  );

  for (const order of table.orders) {
    for (const item of order.items) {
      orderedByProduct.set(
        item.productId,
        (orderedByProduct.get(item.productId) ?? 0) + item.quantity
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

export const updateBangusProductShortages = async (
  deliveryTableId: string,
  shortQuantities: Record<string, number>
) => {
  const database = getBangusDatabase();
  const table = await getMetricTable(deliveryTableId);

  if (!table) return null;

  const metrics = calculateMetrics(table);
  const orderedByProduct = new Map(
    metrics.map((metric) => [metric.productId, metric.orderedQuantity])
  );

  for (const [productId, shortQuantity] of Object.entries(shortQuantities)) {
    const orderedQuantity = orderedByProduct.get(productId);
    if (
      orderedQuantity === undefined ||
      !Number.isInteger(shortQuantity) ||
      shortQuantity < 0 ||
      shortQuantity > orderedQuantity
    ) {
      throw new Error("INVALID_SHORTAGE");
    }
  }

  await database.$transaction(
    Object.entries(shortQuantities).map(([productId, shortQuantity]) =>
      shortQuantity === 0
        ? database.bangusProductShortage.deleteMany({
            where: { deliveryTableId, productId },
          })
        : database.bangusProductShortage.upsert({
            where: {
              deliveryTableId_productId: { deliveryTableId, productId },
            },
            create: { deliveryTableId, productId, shortQuantity },
            update: { shortQuantity },
          })
    )
  );

  return listBangusProductMetrics(deliveryTableId);
};

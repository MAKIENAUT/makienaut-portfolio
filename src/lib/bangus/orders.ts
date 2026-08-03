import { getBangusDatabase } from "@/lib/orb-weaver/database";
import type {
  BangusDeliveryTableRecord,
  BangusOrderInput,
  BangusOrderItemRecord,
  BangusOrderRecord,
  BangusPaymentMethod,
  BangusSupplierDeliveryTableRecord,
} from "@/types/bangus";

const orderInclude = {
  items: {
    orderBy: { createdAt: "asc" as const },
  },
};

const deliveryTableInclude = {
  orders: {
    include: orderInclude,
    orderBy: [{ sortOrder: "asc" as const }, { createdAt: "asc" as const }],
  },
};

interface StoredOrderItem {
  productId: string;
  quantity: number;
  shortQuantity: number;
  supplierUnitPrice: number;
  retailUnitPrice: number;
}

interface StoredOrder {
  id: string;
  customerName: string;
  repacked: boolean;
  received: boolean;
  paid: boolean;
  paymentMethod: BangusPaymentMethod | null;
  items: StoredOrderItem[];
  createdAt: Date;
  updatedAt: Date;
}

interface StoredDeliveryTable {
  id: string;
  name: string;
  deliveryDate: Date;
  orders: StoredOrder[];
  createdAt: Date;
  updatedAt: Date;
}

const serializeOrder = (order: StoredOrder): BangusOrderRecord => {
  const items: BangusOrderItemRecord[] = order.items.map((item) => ({
    productId: item.productId,
    quantity: item.quantity,
    shortQuantity: item.shortQuantity,
    supplierUnitPrice: item.supplierUnitPrice,
    retailUnitPrice: item.retailUnitPrice,
  }));

  return {
    id: order.id,
    customerName: order.customerName,
    repacked: order.repacked,
    received: order.received,
    paid: order.paid,
    paymentMethod: order.paymentMethod,
    items,
    supplierTotal: items.reduce(
      (total, item) => total + item.quantity * item.supplierUnitPrice,
      0
    ),
    retailTotal: items.reduce(
      (total, item) => total + item.quantity * item.retailUnitPrice,
      0
    ),
    createdAt: order.createdAt.toISOString(),
    updatedAt: order.updatedAt.toISOString(),
  };
};

const serializeDeliveryTable = (
  table: StoredDeliveryTable
): BangusDeliveryTableRecord => ({
  id: table.id,
  name: table.name,
  deliveryDate: table.deliveryDate.toISOString().slice(0, 10),
  orders: table.orders.map(serializeOrder),
  createdAt: table.createdAt.toISOString(),
  updatedAt: table.updatedAt.toISOString(),
});

const buildOrderItems = async (
  quantities: Record<string, number>,
  shortQuantities: Record<string, number>,
  database = getBangusDatabase()
) => {
  const selectedQuantities = Object.entries(quantities).filter(
    ([, quantity]) => quantity > 0
  );
  const productIds = selectedQuantities.map(([productId]) => productId);
  const products = await database.bangusProduct.findMany({
    where: { id: { in: productIds } },
    select: {
      id: true,
      supplierPrice: true,
      retailPrice: true,
    },
  });

  if (products.length !== productIds.length) {
    throw new Error("INVALID_PRODUCTS");
  }

  const productById = new Map(
    products.map((product) => [product.id, product])
  );

  return selectedQuantities.map(([productId, quantity]) => {
    const product = productById.get(productId);
    if (!product) throw new Error("INVALID_PRODUCTS");

    return {
      productId,
      quantity,
      shortQuantity: shortQuantities[productId] ?? 0,
      supplierUnitPrice: product.supplierPrice,
      retailUnitPrice: product.retailPrice,
    };
  });
};

export const listBangusDeliveryTables = async () => {
  const database = getBangusDatabase();
  const tables = await database.bangusDeliveryTable.findMany({
    include: deliveryTableInclude,
    orderBy: [{ deliveryDate: "desc" }, { name: "asc" }],
  });

  return tables.map((table) =>
    serializeDeliveryTable(table as unknown as StoredDeliveryTable)
  );
};

export const listBangusSupplierDeliveryTables = async (): Promise<
  BangusSupplierDeliveryTableRecord[]
> => {
  const database = getBangusDatabase();
  const tables = await database.bangusDeliveryTable.findMany({
    select: {
      id: true,
      name: true,
      deliveryDate: true,
      orders: {
        select: {
          id: true,
          customerName: true,
          repacked: true,
          items: { select: { productId: true, quantity: true } },
        },
        orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
      },
    },
    orderBy: [{ deliveryDate: "desc" }, { name: "asc" }],
  });

  return tables.map((table) => ({
    ...table,
    deliveryDate: table.deliveryDate.toISOString().slice(0, 10),
  }));
};

export const listBangusSupplierOrderView = async (): Promise<
  BangusDeliveryTableRecord[]
> => {
  const database = getBangusDatabase();
  const tables = await database.bangusDeliveryTable.findMany({
    select: {
      id: true,
      name: true,
      deliveryDate: true,
      createdAt: true,
      updatedAt: true,
      orders: {
        select: {
          id: true,
          customerName: true,
          repacked: true,
          received: true,
          createdAt: true,
          updatedAt: true,
          items: {
            select: {
              productId: true,
              quantity: true,
              shortQuantity: true,
              supplierUnitPrice: true,
            },
            orderBy: { createdAt: "asc" },
          },
        },
        orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
      },
    },
    orderBy: [{ deliveryDate: "desc" }, { name: "asc" }],
  });

  return tables.map((table) => ({
    id: table.id,
    name: table.name,
    deliveryDate: table.deliveryDate.toISOString().slice(0, 10),
    orders: table.orders.map((order) => ({
      id: order.id,
      customerName: order.customerName,
      repacked: order.repacked,
      received: order.received,
      paid: false,
      paymentMethod: null,
      items: order.items.map((item) => ({
        ...item,
        retailUnitPrice: 0,
      })),
      supplierTotal: order.items.reduce(
        (total, item) => total + item.quantity * item.supplierUnitPrice,
        0
      ),
      retailTotal: 0,
      createdAt: order.createdAt.toISOString(),
      updatedAt: order.updatedAt.toISOString(),
    })),
    createdAt: table.createdAt.toISOString(),
    updatedAt: table.updatedAt.toISOString(),
  }));
};

export const createBangusDeliveryTable = async (
  name: string,
  deliveryDate: string
) => {
  const database = getBangusDatabase();
  const table = await database.bangusDeliveryTable.create({
    data: {
      name,
      deliveryDate: new Date(`${deliveryDate}T00:00:00.000Z`),
    },
    include: deliveryTableInclude,
  });

  return serializeDeliveryTable(table as unknown as StoredDeliveryTable);
};

export const deleteBangusDeliveryTable = async (id: string) => {
  const database = getBangusDatabase();
  await database.bangusDeliveryTable.delete({ where: { id } });
};

export const createBangusOrder = async (
  deliveryTableId: string,
  input: BangusOrderInput
) => {
  const database = getBangusDatabase();

  const order = await database.$transaction(async (transaction) => {
    const [items, lastOrder] = await Promise.all([
      buildOrderItems(
        input.quantities,
        input.shortQuantities,
        transaction as typeof database
      ),
      transaction.bangusOrder.findFirst({
        where: { deliveryTableId },
        orderBy: { sortOrder: "desc" },
        select: { sortOrder: true },
      }),
    ]);

    return transaction.bangusOrder.create({
      data: {
        deliveryTableId,
        customerName: input.customerName,
        repacked: input.repacked,
        received: input.received,
        paid: input.paid,
        paymentMethod: input.paymentMethod,
        sortOrder: (lastOrder?.sortOrder ?? 0) + 10,
        items: {
          create: items,
        },
      },
      include: orderInclude,
    });
  });

  return serializeOrder(order as unknown as StoredOrder);
};

export const updateBangusOrder = async (
  id: string,
  input: BangusOrderInput
) => {
  const database = getBangusDatabase();

  const order = await database.$transaction(async (transaction) => {
    const items = await buildOrderItems(
      input.quantities,
      input.shortQuantities,
      transaction as typeof database
    );

    await transaction.bangusOrderItem.deleteMany({ where: { orderId: id } });

    return transaction.bangusOrder.update({
      where: { id },
      data: {
        customerName: input.customerName,
        repacked: input.repacked,
        received: input.received,
        paid: input.paid,
        paymentMethod: input.paymentMethod,
        items: {
          create: items,
        },
      },
      include: orderInclude,
    });
  });

  return serializeOrder(order as unknown as StoredOrder);
};

export const updateBangusOrderStatus = async (
  id: string,
  status: {
    repacked: boolean;
    received: boolean;
    paid: boolean;
    paymentMethod: BangusPaymentMethod | null;
  }
) => {
  const database = getBangusDatabase();
  return database.bangusOrder.update({
    where: { id },
    data: status,
    select: {
      id: true,
      repacked: true,
      received: true,
      paid: true,
      paymentMethod: true,
    },
  });
};

export const deleteBangusOrder = async (id: string) => {
  const database = getBangusDatabase();
  await database.bangusOrder.delete({ where: { id } });
};

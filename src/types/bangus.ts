export interface BangusProductRecord {
  id: string;
  name: string;
  supplierPrice: number;
  retailPrice: number;
  markup: number;
  category: string;
  sizePack: string;
  flavor: string | null;
  pieces: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface BangusProductInput {
  name: string;
  supplierPrice: number;
  retailPrice: number;
  category: string;
  sizePack: string;
  flavor: string;
  pieces: string;
  isActive: boolean;
}

export interface BangusCatalogRecord {
  products: BangusProductRecord[];
  categories: string[];
}

export const BANGUS_PAYMENT_METHODS = ["GCASH", "CASH", "BANK"] as const;

export type BangusPaymentMethod = (typeof BANGUS_PAYMENT_METHODS)[number];

export interface BangusOrderItemRecord {
  productId: string;
  quantity: number;
  supplierUnitPrice: number;
  retailUnitPrice: number;
}

export interface BangusOrderRecord {
  id: string;
  customerName: string;
  received: boolean;
  paid: boolean;
  paymentMethod: BangusPaymentMethod | null;
  items: BangusOrderItemRecord[];
  supplierTotal: number;
  retailTotal: number;
  createdAt: string;
  updatedAt: string;
}

export interface BangusOrderInput {
  customerName: string;
  received: boolean;
  paid: boolean;
  paymentMethod: BangusPaymentMethod | null;
  quantities: Record<string, number>;
}

export interface BangusDeliveryTableRecord {
  id: string;
  deliveryDate: string;
  orders: BangusOrderRecord[];
  createdAt: string;
  updatedAt: string;
}

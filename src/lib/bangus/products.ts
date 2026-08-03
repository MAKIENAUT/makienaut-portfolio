import { getBangusDatabase } from "@/lib/orb-weaver/database";
import type {
  BangusCatalogRecord,
  BangusProductInput,
  BangusProductRecord,
  BangusSupplierProductRecord,
} from "@/types/bangus";

const productInclude = {
  category: {
    select: {
      name: true,
    },
  },
} as const;

type StoredBangusProduct = Awaited<
  ReturnType<
    ReturnType<typeof getBangusDatabase>["bangusProduct"]["findFirstOrThrow"]
  >
> & {
  category: { name: string };
};

const serializeProduct = (
  product: StoredBangusProduct
): BangusProductRecord => ({
  id: product.id,
  name: product.name,
  supplierPrice: product.supplierPrice,
  retailPrice: product.retailPrice,
  markup: product.retailPrice - product.supplierPrice,
  category: product.category.name,
  sizePack: product.sizePack,
  flavor: product.flavor,
  pieces: product.pieces,
  isActive: product.isActive,
  createdAt: product.createdAt.toISOString(),
  updatedAt: product.updatedAt.toISOString(),
});

const normalizeOptionalText = (value: string) => {
  const normalized = value.trim();
  return normalized || null;
};

const findOrCreateCategory = async (
  categoryName: string,
  database = getBangusDatabase()
) =>
  database.bangusProductCategory.upsert({
    where: { name: categoryName },
    create: {
      name: categoryName,
      sortOrder: 999,
    },
    update: {},
  });

export const listBangusCatalog = async (): Promise<BangusCatalogRecord> => {
  const database = getBangusDatabase();
  const [products, categories] = await Promise.all([
    database.bangusProduct.findMany({
      include: productInclude,
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    }),
    database.bangusProductCategory.findMany({
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      select: { name: true },
    }),
  ]);

  return {
    products: products.map((product) =>
      serializeProduct(product as StoredBangusProduct)
    ),
    categories: categories.map((category) => category.name),
  };
};

export const listBangusSupplierProducts = async (): Promise<
  BangusSupplierProductRecord[]
> => {
  const database = getBangusDatabase();
  return database.bangusProduct.findMany({
    select: { id: true, name: true, sizePack: true, flavor: true, pieces: true },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
  });
};

export const createBangusProduct = async (
  input: BangusProductInput
): Promise<BangusProductRecord> => {
  const database = getBangusDatabase();
  const [category, lastProduct] = await Promise.all([
    findOrCreateCategory(input.category, database),
    database.bangusProduct.findFirst({
      orderBy: { sortOrder: "desc" },
      select: { sortOrder: true },
    }),
  ]);
  const product = await database.bangusProduct.create({
    data: {
      name: input.name,
      supplierPrice: input.supplierPrice,
      retailPrice: input.retailPrice,
      categoryId: category.id,
      sizePack: input.sizePack,
      flavor: normalizeOptionalText(input.flavor),
      pieces: normalizeOptionalText(input.pieces),
      isActive: input.isActive,
      sortOrder: (lastProduct?.sortOrder ?? 0) + 10,
    },
    include: productInclude,
  });

  return serializeProduct(product as StoredBangusProduct);
};

export const updateBangusProduct = async (
  id: string,
  input: BangusProductInput
): Promise<BangusProductRecord> => {
  const database = getBangusDatabase();
  const category = await findOrCreateCategory(input.category, database);
  const product = await database.bangusProduct.update({
    where: { id },
    data: {
      name: input.name,
      supplierPrice: input.supplierPrice,
      retailPrice: input.retailPrice,
      categoryId: category.id,
      sizePack: input.sizePack,
      flavor: normalizeOptionalText(input.flavor),
      pieces: normalizeOptionalText(input.pieces),
      isActive: input.isActive,
    },
    include: productInclude,
  });

  return serializeProduct(product as StoredBangusProduct);
};

export const deleteBangusProduct = async (id: string) => {
  const database = getBangusDatabase();
  await database.bangusProduct.delete({ where: { id } });
};

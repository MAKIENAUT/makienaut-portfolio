import type {
  BangusDeliveryTableRecord,
  BangusProductRecord,
} from "@/types/bangus";

interface SupplierOrderLine {
  product: BangusProductRecord;
  quantity: number;
  shortQuantity: number;
  supplierUnitPrice: number;
}

const formatPeso = (value: number) => `₱${value.toLocaleString("en-PH")}`;

const formatDeliveryDate = (value: string) =>
  new Intl.DateTimeFormat("en-PH", {
    timeZone: "UTC",
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date(`${value}T00:00:00.000Z`));

const escapeMarkdown = (value: string) =>
  value.replace(/([\\`*_[\]<>])/g, "\\$1");

const formatPieces = (pieces: string | null) =>
  pieces ? ` (${escapeMarkdown(pieces)})` : "";

const formatFlatProduct = (product: BangusProductRecord) => {
  const size =
    product.sizePack.toLowerCase() === "standard"
      ? ""
      : ` — ${escapeMarkdown(product.sizePack)}`;

  return `${escapeMarkdown(product.name)}${size}${formatPieces(
    product.pieces
  )}`;
};

const formatFlavorVariant = (product: BangusProductRecord) =>
  `${escapeMarkdown(product.sizePack)} — ${escapeMarkdown(
    product.flavor ?? "Other"
  )}${formatPieces(product.pieces)}`;

const formatFlavorGroup = (category: string, flavor: string) =>
  category === "Bangus Belly" && flavor.toLowerCase() === "regular"
    ? "Regular / Marinated"
    : flavor;

const formatCategoryHeading = (category: string) =>
  category === "Tinapa" ? "Tinapa Bangus" : category;

const formatOrderLine = (
  line: SupplierOrderLine,
  useFlavorVariant: boolean
) => {
  const description = useFlavorVariant
    ? formatFlavorVariant(line.product)
    : formatFlatProduct(line.product);
  const price = formatPeso(line.supplierUnitPrice);
  const shortage =
    line.shortQuantity > 0
      ? ` — **⚠ SHORT / MISSING: ${line.shortQuantity}**`
      : "";

  if (line.quantity === 1) {
    return `- [ ] **1 × ${description}** — ${price}${shortage}`;
  }

  return `- [ ] **${line.quantity} × ${description}** — ${price} each = **${formatPeso(
    line.quantity * line.supplierUnitPrice
  )}**${shortage}`;
};

export const generateBangusSupplierOrderMarkdown = (
  deliveryTable: BangusDeliveryTableRecord,
  products: BangusProductRecord[]
) => {
  const quantityByProductAndPrice = new Map<
    string,
    Map<number, { quantity: number; shortQuantity: number }>
  >();

  deliveryTable.orders.forEach((order) => {
    order.items.forEach((item) => {
      const quantitiesByPrice =
        quantityByProductAndPrice.get(item.productId) ??
        new Map<number, { quantity: number; shortQuantity: number }>();
      const current = quantitiesByPrice.get(item.supplierUnitPrice) ?? {
        quantity: 0,
        shortQuantity: 0,
      };
      quantitiesByPrice.set(
        item.supplierUnitPrice,
        {
          quantity: current.quantity + item.quantity,
          shortQuantity: current.shortQuantity + item.shortQuantity,
        }
      );
      quantityByProductAndPrice.set(item.productId, quantitiesByPrice);
    });
  });

  const linesByCategory = new Map<string, SupplierOrderLine[]>();

  products.forEach((product) => {
    const quantitiesByPrice = quantityByProductAndPrice.get(product.id);
    if (!quantitiesByPrice) return;

    const categoryLines = linesByCategory.get(product.category) ?? [];
    quantitiesByPrice.forEach((quantities, supplierUnitPrice) => {
      categoryLines.push({ product, ...quantities, supplierUnitPrice });
    });
    linesByCategory.set(product.category, categoryLines);
  });

  const markdown: string[] = [
    "# Bangus Supplier Order",
    "",
    `**Delivery Date:** ${formatDeliveryDate(deliveryTable.deliveryDate)}`,
    "",
  ];

  let productVariants = 0;
  let totalOrderUnits = 0;
  let totalShortUnits = 0;
  let expectedSupplierTotal = 0;

  const categoryOrder = Array.from(
    new Set(products.map((product) => product.category))
  );

  categoryOrder.forEach((category) => {
    const categoryLines = linesByCategory.get(category);
    if (!categoryLines) return;

    markdown.push(
      `## ${escapeMarkdown(formatCategoryHeading(category))}`,
      ""
    );

    const usesFlavorGroups = categoryLines.some((line) => line.product.flavor);

    if (usesFlavorGroups) {
      const linesByFlavor = new Map<string, SupplierOrderLine[]>();
      categoryLines.forEach((line) => {
        const flavor = line.product.flavor ?? "Other";
        const flavorLines = linesByFlavor.get(flavor) ?? [];
        flavorLines.push(line);
        linesByFlavor.set(flavor, flavorLines);
      });

      linesByFlavor.forEach((flavorLines, flavor) => {
        markdown.push(
          `- **${escapeMarkdown(formatFlavorGroup(category, flavor))}**`
        );
        flavorLines.forEach((line) => {
          markdown.push(`  ${formatOrderLine(line, true)}`);
        });
      });
    } else {
      categoryLines.forEach((line) => {
        markdown.push(formatOrderLine(line, false));
      });
    }

    categoryLines.forEach((line) => {
      productVariants += 1;
      totalOrderUnits += line.quantity;
      totalShortUnits += line.shortQuantity;
      expectedSupplierTotal += line.quantity * line.supplierUnitPrice;
    });
    markdown.push("");
  });

  markdown.push(
    "---",
    "",
    `**Product Variants:** ${productVariants}  `,
    `**Total Order Units:** ${totalOrderUnits}  `,
    `**Short / Missing Units:** ${totalShortUnits}  `,
    `**Received Units:** ${Math.max(totalOrderUnits - totalShortUnits, 0)}  `,
    `**Expected Supplier Total:** **${formatPeso(expectedSupplierTotal)}**`,
    "",
    "Please confirm product availability and final total.",
    ""
  );

  return markdown.join("\n");
};

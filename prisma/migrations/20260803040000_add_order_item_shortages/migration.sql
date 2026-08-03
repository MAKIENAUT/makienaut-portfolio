ALTER TABLE "bangus_order_items"
ADD COLUMN "shortQuantity" INTEGER NOT NULL DEFAULT 0;

-- Preserve shortages that were previously recorded against the delivery table.
-- They are assigned in order, without allowing any order line to exceed its quantity.
WITH allocated_shortages AS (
  SELECT
    item."id",
    LEAST(
      item."quantity",
      GREATEST(
        shortage."shortQuantity" - COALESCE(
          SUM(item."quantity") OVER (
            PARTITION BY shortage."id"
            ORDER BY order_record."sortOrder", order_record."createdAt", item."createdAt", item."id"
            ROWS BETWEEN UNBOUNDED PRECEDING AND 1 PRECEDING
          ),
          0
        ),
        0
      )
    ) AS "shortQuantity"
  FROM "bangus_product_shortages" AS shortage
  INNER JOIN "bangus_orders" AS order_record
    ON order_record."deliveryTableId" = shortage."deliveryTableId"
  INNER JOIN "bangus_order_items" AS item
    ON item."orderId" = order_record."id"
    AND item."productId" = shortage."productId"
)
UPDATE "bangus_order_items" AS item
SET "shortQuantity" = allocated_shortages."shortQuantity"
FROM allocated_shortages
WHERE item."id" = allocated_shortages."id";

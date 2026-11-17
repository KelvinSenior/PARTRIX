WITH active_booking_quantities AS (
  SELECT
    item."organizationId",
    item."inventoryItemId",
    SUM(GREATEST(item."quantity" - item."returnedQuantity", 0)) AS "reservedQuantity",
    SUM(
      CASE
        WHEN delivery."status" = 'COMPLETED' THEN 0
        WHEN booking."status" = 'IN_PROGRESS'
          OR delivery."status" IN ('IN_TRANSIT', 'DELIVERED')
        THEN GREATEST(item."quantity" - item."returnedQuantity", 0)
        ELSE 0
      END
    ) AS "physicallyOutQuantity"
  FROM "BookingItem" AS item
  INNER JOIN "Booking" AS booking
    ON booking."id" = item."bookingId"
    AND booking."organizationId" = item."organizationId"
  LEFT JOIN "Delivery" AS delivery
    ON delivery."bookingId" = booking."id"
    AND delivery."organizationId" = booking."organizationId"
  WHERE booking."status" IN ('PENDING', 'CONFIRMED', 'IN_PROGRESS')
  GROUP BY item."organizationId", item."inventoryItemId"
),
normalized AS (
  SELECT
    inventory."id",
    LEAST(
      GREATEST(
        0,
        inventory."rentedQuantity"
          - COALESCE(active."reservedQuantity", 0)
          + COALESCE(active."physicallyOutQuantity", 0)
      ),
      GREATEST(0, inventory."totalQuantity" - inventory."damagedQuantity")
    ) AS "rentedQuantity"
  FROM "InventoryItem" AS inventory
  LEFT JOIN active_booking_quantities AS active
    ON active."organizationId" = inventory."organizationId"
    AND active."inventoryItemId" = inventory."id"
)
UPDATE "InventoryItem" AS inventory
SET
  "rentedQuantity" = normalized."rentedQuantity",
  "availableQuantity" = GREATEST(
    0,
    inventory."totalQuantity"
      - inventory."damagedQuantity"
      - normalized."rentedQuantity"
  )
FROM normalized
WHERE normalized."id" = inventory."id";

UPDATE "BookingItem" AS item
SET "returnedQuantity" = item."quantity"
FROM "Booking" AS booking
INNER JOIN "Delivery" AS delivery
  ON delivery."bookingId" = booking."id"
  AND delivery."organizationId" = booking."organizationId"
WHERE item."bookingId" = booking."id"
  AND item."organizationId" = booking."organizationId"
  AND booking."status" IN ('PENDING', 'CONFIRMED', 'IN_PROGRESS')
  AND delivery."status" = 'COMPLETED'
  AND item."returnedQuantity" < item."quantity";

UPDATE "Booking" AS booking
SET "status" = 'COMPLETED'
FROM "Delivery" AS delivery
WHERE delivery."bookingId" = booking."id"
  AND delivery."organizationId" = booking."organizationId"
  AND booking."status" IN ('PENDING', 'CONFIRMED', 'IN_PROGRESS')
  AND delivery."status" = 'COMPLETED';

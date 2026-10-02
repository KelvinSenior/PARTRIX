DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM "Payment" p
    JOIN "Booking" b ON b."id" = p."bookingId"
    WHERE p."organizationId" <> b."organizationId"
  ) OR EXISTS (
    SELECT 1 FROM "Expense" e
    JOIN "Booking" b ON b."id" = e."bookingId"
    WHERE e."organizationId" <> b."organizationId"
  ) THEN
    RAISE EXCEPTION 'Cross-organization financial booking references must be repaired before this migration.';
  END IF;
END $$;

CREATE UNIQUE INDEX "Booking_id_organizationId_key"
  ON "Booking"("id", "organizationId");

ALTER TABLE "Payment" DROP CONSTRAINT "Payment_bookingId_fkey";
ALTER TABLE "Expense" DROP CONSTRAINT "Expense_bookingId_fkey";

ALTER TABLE "Payment"
  ADD CONSTRAINT "Payment_bookingId_organizationId_fkey"
  FOREIGN KEY ("bookingId", "organizationId")
  REFERENCES "Booking"("id", "organizationId")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Expense"
  ADD CONSTRAINT "Expense_bookingId_organizationId_fkey"
  FOREIGN KEY ("bookingId", "organizationId")
  REFERENCES "Booking"("id", "organizationId")
  ON DELETE CASCADE ON UPDATE CASCADE;
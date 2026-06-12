-- Safe tenant backfill for existing data.
-- This migration creates the default organization, backfills legacy rows,
-- and then enforces the tenant relationships required by the multi-tenant schema.

-- Ensure the default workspace exists with a deterministic UUID so legacy rows can be backfilled.
INSERT INTO "Organization" ("id", "name", "slug", "createdAt", "updatedAt")
VALUES (
  '11111111-1111-1111-1111-111111111111',
  'Default Workspace',
  'default-workspace',
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
)
ON CONFLICT ("slug") DO NOTHING;

-- Add any missing organization columns on existing tables.
ALTER TABLE "ActivityLog" ADD COLUMN IF NOT EXISTS "organizationId" UUID;
ALTER TABLE "Booking" ADD COLUMN IF NOT EXISTS "organizationId" UUID;
ALTER TABLE "BookingItem" ADD COLUMN IF NOT EXISTS "organizationId" UUID;
ALTER TABLE "Customer" ADD COLUMN IF NOT EXISTS "organizationId" UUID;
ALTER TABLE "DamageReport" ADD COLUMN IF NOT EXISTS "organizationId" UUID;
ALTER TABLE "Delivery" ADD COLUMN IF NOT EXISTS "organizationId" UUID;
ALTER TABLE "Expense" ADD COLUMN IF NOT EXISTS "organizationId" UUID;
ALTER TABLE "InventoryItem" ADD COLUMN IF NOT EXISTS "organizationId" UUID;
ALTER TABLE "Payment" ADD COLUMN IF NOT EXISTS "organizationId" UUID;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "organizationId" UUID;

-- Backfill existing records to the default tenant so the new required tenant scope is valid.
UPDATE "User"
SET "organizationId" = '11111111-1111-1111-1111-111111111111'
WHERE "organizationId" IS NULL;

UPDATE "Customer"
SET "organizationId" = '11111111-1111-1111-1111-111111111111'
WHERE "organizationId" IS NULL;

UPDATE "InventoryItem"
SET "organizationId" = '11111111-1111-1111-1111-111111111111'
WHERE "organizationId" IS NULL;

UPDATE "Booking"
SET "organizationId" = '11111111-1111-1111-1111-111111111111'
WHERE "organizationId" IS NULL;

UPDATE "BookingItem"
SET "organizationId" = '11111111-1111-1111-1111-111111111111'
WHERE "organizationId" IS NULL;

UPDATE "Payment"
SET "organizationId" = '11111111-1111-1111-1111-111111111111'
WHERE "organizationId" IS NULL;

UPDATE "Expense"
SET "organizationId" = '11111111-1111-1111-1111-111111111111'
WHERE "organizationId" IS NULL;

UPDATE "Delivery"
SET "organizationId" = '11111111-1111-1111-1111-111111111111'
WHERE "organizationId" IS NULL;

UPDATE "DamageReport"
SET "organizationId" = '11111111-1111-1111-1111-111111111111'
WHERE "organizationId" IS NULL;

UPDATE "ActivityLog"
SET "organizationId" = '11111111-1111-1111-1111-111111111111'
WHERE "organizationId" IS NULL;

-- Enforce the tenant columns for existing data.
ALTER TABLE "ActivityLog" ALTER COLUMN "organizationId" SET NOT NULL;
ALTER TABLE "Booking" ALTER COLUMN "organizationId" SET NOT NULL;
ALTER TABLE "BookingItem" ALTER COLUMN "organizationId" SET NOT NULL;
ALTER TABLE "Customer" ALTER COLUMN "organizationId" SET NOT NULL;
ALTER TABLE "DamageReport" ALTER COLUMN "organizationId" SET NOT NULL;
ALTER TABLE "Delivery" ALTER COLUMN "organizationId" SET NOT NULL;
ALTER TABLE "Expense" ALTER COLUMN "organizationId" SET NOT NULL;
ALTER TABLE "InventoryItem" ALTER COLUMN "organizationId" SET NOT NULL;
ALTER TABLE "Payment" ALTER COLUMN "organizationId" SET NOT NULL;

-- Create tenant indexes if they are missing.
CREATE INDEX IF NOT EXISTS "ActivityLog_organizationId_idx" ON "ActivityLog" ("organizationId");
CREATE INDEX IF NOT EXISTS "Booking_organizationId_idx" ON "Booking" ("organizationId");
CREATE INDEX IF NOT EXISTS "BookingItem_organizationId_idx" ON "BookingItem" ("organizationId");
CREATE INDEX IF NOT EXISTS "Customer_organizationId_idx" ON "Customer" ("organizationId");
CREATE INDEX IF NOT EXISTS "DamageReport_organizationId_idx" ON "DamageReport" ("organizationId");
CREATE INDEX IF NOT EXISTS "Delivery_organizationId_idx" ON "Delivery" ("organizationId");
CREATE INDEX IF NOT EXISTS "Expense_organizationId_idx" ON "Expense" ("organizationId");
CREATE INDEX IF NOT EXISTS "InventoryItem_organizationId_idx" ON "InventoryItem" ("organizationId");
CREATE INDEX IF NOT EXISTS "Payment_organizationId_idx" ON "Payment" ("organizationId");
CREATE INDEX IF NOT EXISTS "User_organizationId_idx" ON "User" ("organizationId");

-- Add the foreign keys needed by the tenant model.
ALTER TABLE "User"
  ADD CONSTRAINT "User_organizationId_fkey"
  FOREIGN KEY ("organizationId") REFERENCES "Organization"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "Customer"
  ADD CONSTRAINT "Customer_organizationId_fkey"
  FOREIGN KEY ("organizationId") REFERENCES "Organization"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "InventoryItem"
  ADD CONSTRAINT "InventoryItem_organizationId_fkey"
  FOREIGN KEY ("organizationId") REFERENCES "Organization"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Booking"
  ADD CONSTRAINT "Booking_organizationId_fkey"
  FOREIGN KEY ("organizationId") REFERENCES "Organization"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "BookingItem"
  ADD CONSTRAINT "BookingItem_organizationId_fkey"
  FOREIGN KEY ("organizationId") REFERENCES "Organization"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Payment"
  ADD CONSTRAINT "Payment_organizationId_fkey"
  FOREIGN KEY ("organizationId") REFERENCES "Organization"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Expense"
  ADD CONSTRAINT "Expense_organizationId_fkey"
  FOREIGN KEY ("organizationId") REFERENCES "Organization"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Delivery"
  ADD CONSTRAINT "Delivery_organizationId_fkey"
  FOREIGN KEY ("organizationId") REFERENCES "Organization"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "DamageReport"
  ADD CONSTRAINT "DamageReport_organizationId_fkey"
  FOREIGN KEY ("organizationId") REFERENCES "Organization"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "ActivityLog"
  ADD CONSTRAINT "ActivityLog_organizationId_fkey"
  FOREIGN KEY ("organizationId") REFERENCES "Organization"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

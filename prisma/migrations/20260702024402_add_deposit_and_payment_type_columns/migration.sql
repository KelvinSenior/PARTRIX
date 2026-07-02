/*
  Warnings:

  - A unique constraint covering the columns `[organizationId,bookingNumber]` on the table `Booking` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[organizationId,sku]` on the table `InventoryItem` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[organizationId,transactionReference]` on the table `Payment` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "DepositStatus" AS ENUM ('PENDING', 'PAID', 'HELD', 'REFUNDED', 'PARTIALLY_REFUNDED', 'FORFEITED');

-- CreateEnum
CREATE TYPE "RefundStatus" AS ENUM ('NONE', 'REQUESTED', 'APPROVED', 'PARTIAL', 'FORFEITED');

-- CreateEnum
CREATE TYPE "PaymentType" AS ENUM ('RENTAL', 'SECURITY_DEPOSIT', 'REFUND');

-- DropIndex
DROP INDEX "Booking_bookingNumber_key";

-- DropIndex
DROP INDEX "Customer_email_key";

-- DropIndex
DROP INDEX "InventoryItem_sku_key";

-- DropIndex
DROP INDEX "Payment_transactionReference_key";

-- AlterTable
ALTER TABLE "Booking" ADD COLUMN     "depositPaid" DECIMAL(12,2) NOT NULL DEFAULT 0,
ADD COLUMN     "depositRefunded" DECIMAL(12,2) NOT NULL DEFAULT 0,
ADD COLUMN     "depositStatus" "DepositStatus" NOT NULL DEFAULT 'PENDING',
ADD COLUMN     "refundStatus" "RefundStatus" NOT NULL DEFAULT 'NONE';

-- AlterTable
ALTER TABLE "Organization" ADD COLUMN     "settings" JSONB;

-- AlterTable
ALTER TABLE "Payment" ADD COLUMN     "type" "PaymentType" NOT NULL DEFAULT 'RENTAL';

-- CreateIndex
CREATE UNIQUE INDEX "Booking_organizationId_bookingNumber_key" ON "Booking"("organizationId", "bookingNumber");

-- CreateIndex
CREATE UNIQUE INDEX "InventoryItem_organizationId_sku_key" ON "InventoryItem"("organizationId", "sku");

-- CreateIndex
CREATE INDEX "Payment_type_idx" ON "Payment"("type");

-- CreateIndex
CREATE UNIQUE INDEX "Payment_organizationId_transactionReference_key" ON "Payment"("organizationId", "transactionReference");

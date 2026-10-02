ALTER TABLE "Notification" ADD COLUMN "dedupeKey" TEXT;

CREATE UNIQUE INDEX "Notification_organizationId_userId_dedupeKey_key"
  ON "Notification"("organizationId", "userId", "dedupeKey");
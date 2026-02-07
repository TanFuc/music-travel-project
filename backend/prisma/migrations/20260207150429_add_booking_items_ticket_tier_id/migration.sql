/*
  Warnings:

  - You are about to drop the column `user_max_quantity` on the `ticket_tiers` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[show_id,queue_number]` on the table `performance_registrations` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "ShowActivityType" AS ENUM ('REGISTRATION', 'CANCELLATION', 'STATUS_CHANGE', 'TICKET_VERIFICATION', 'ADMIN_ACTION', 'QUEUE_REORDER', 'CHECK_IN');

-- CreateEnum
CREATE TYPE "VerificationMethod" AS ENUM ('QR_SCAN', 'MANUAL_ENTRY');

-- AlterTable
ALTER TABLE "performance_registrations" ADD COLUMN     "cancelled_at" TIMESTAMP(3),
ADD COLUMN     "performed_at" TIMESTAMP(3),
ADD COLUMN     "queue_number" INTEGER;

-- AlterTable
ALTER TABLE "shows" ADD COLUMN     "current_attendance" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "max_capacity" INTEGER,
ADD COLUMN     "performance_registration_enabled" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "registration_deadline" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "ticket_tiers" DROP COLUMN "user_max_quantity",
ADD COLUMN     "created_by" INTEGER,
ADD COLUMN     "group_size" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "max_per_order" INTEGER NOT NULL DEFAULT 10,
ADD COLUMN     "name_en" VARCHAR(100),
ADD COLUMN     "sold_count" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "target_audience" VARCHAR(255),
ADD COLUMN     "total_quantity" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "updated_by" INTEGER;

-- CreateTable
CREATE TABLE "show_activity_logs" (
    "id" BIGSERIAL NOT NULL,
    "show_id" INTEGER NOT NULL,
    "activity_type" "ShowActivityType" NOT NULL,
    "actor_id" INTEGER,
    "target_id" INTEGER,
    "target_type" VARCHAR(50),
    "description" TEXT NOT NULL,
    "metadata" JSONB,
    "ip_address" VARCHAR(45),
    "user_agent" VARCHAR(500),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "show_activity_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ticket_verifications" (
    "id" SERIAL NOT NULL,
    "show_id" INTEGER NOT NULL,
    "ticket_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    "verified_by" INTEGER NOT NULL,
    "verification_method" "VerificationMethod" NOT NULL,
    "is_re_entry" BOOLEAN NOT NULL DEFAULT false,
    "verified_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "device_info" VARCHAR(255),
    "notes" TEXT,
    "is_successful" BOOLEAN NOT NULL DEFAULT true,
    "failure_reason" VARCHAR(255),

    CONSTRAINT "ticket_verifications_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "show_activity_logs_show_id_created_at_idx" ON "show_activity_logs"("show_id", "created_at");

-- CreateIndex
CREATE INDEX "show_activity_logs_activity_type_idx" ON "show_activity_logs"("activity_type");

-- CreateIndex
CREATE INDEX "show_activity_logs_actor_id_idx" ON "show_activity_logs"("actor_id");

-- CreateIndex
CREATE INDEX "ticket_verifications_show_id_verified_at_idx" ON "ticket_verifications"("show_id", "verified_at");

-- CreateIndex
CREATE INDEX "ticket_verifications_ticket_id_idx" ON "ticket_verifications"("ticket_id");

-- CreateIndex
CREATE INDEX "ticket_verifications_user_id_idx" ON "ticket_verifications"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "ticket_verifications_ticket_id_show_id_key" ON "ticket_verifications"("ticket_id", "show_id");

-- CreateIndex
CREATE UNIQUE INDEX "performance_registrations_show_id_queue_number_key" ON "performance_registrations"("show_id", "queue_number");

-- RenameForeignKey: only if old constraint exists and new one does not
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'booking_items_ticketTierId_fkey')
     AND NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'booking_items_ticket_tier_id_fkey') THEN
    ALTER TABLE "booking_items" RENAME CONSTRAINT "booking_items_ticketTierId_fkey" TO "booking_items_ticket_tier_id_fkey";
  END IF;
END $$;

-- AddForeignKey
ALTER TABLE "show_activity_logs" ADD CONSTRAINT "show_activity_logs_show_id_fkey" FOREIGN KEY ("show_id") REFERENCES "shows"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "show_activity_logs" ADD CONSTRAINT "show_activity_logs_actor_id_fkey" FOREIGN KEY ("actor_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ticket_verifications" ADD CONSTRAINT "ticket_verifications_show_id_fkey" FOREIGN KEY ("show_id") REFERENCES "shows"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ticket_verifications" ADD CONSTRAINT "ticket_verifications_ticket_id_fkey" FOREIGN KEY ("ticket_id") REFERENCES "tickets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ticket_verifications" ADD CONSTRAINT "ticket_verifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ticket_verifications" ADD CONSTRAINT "ticket_verifications_verified_by_fkey" FOREIGN KEY ("verified_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

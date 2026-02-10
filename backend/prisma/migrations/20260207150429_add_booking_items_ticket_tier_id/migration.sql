/*
  Warnings:

  - You are about to drop the column `user_max_quantity` on the `ticket_tiers` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[show_id,queue_number]` on the table `performance_registrations` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum (idempotent)
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'ShowActivityType') THEN
    CREATE TYPE "ShowActivityType" AS ENUM ('REGISTRATION', 'CANCELLATION', 'STATUS_CHANGE', 'TICKET_VERIFICATION', 'ADMIN_ACTION', 'QUEUE_REORDER', 'CHECK_IN');
  END IF;
END $$;

-- CreateEnum (idempotent)
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'VerificationMethod') THEN
    CREATE TYPE "VerificationMethod" AS ENUM ('QR_SCAN', 'MANUAL_ENTRY');
  END IF;
END $$;

-- AlterTable performance_registrations (idempotent)
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'performance_registrations' AND column_name = 'cancelled_at') THEN
    ALTER TABLE "performance_registrations" ADD COLUMN "cancelled_at" TIMESTAMP(3);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'performance_registrations' AND column_name = 'performed_at') THEN
    ALTER TABLE "performance_registrations" ADD COLUMN "performed_at" TIMESTAMP(3);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'performance_registrations' AND column_name = 'queue_number') THEN
    ALTER TABLE "performance_registrations" ADD COLUMN "queue_number" INTEGER;
  END IF;
END $$;

-- AlterTable shows (idempotent)
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'shows' AND column_name = 'current_attendance') THEN
    ALTER TABLE "shows" ADD COLUMN "current_attendance" INTEGER NOT NULL DEFAULT 0;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'shows' AND column_name = 'max_capacity') THEN
    ALTER TABLE "shows" ADD COLUMN "max_capacity" INTEGER;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'shows' AND column_name = 'performance_registration_enabled') THEN
    ALTER TABLE "shows" ADD COLUMN "performance_registration_enabled" BOOLEAN NOT NULL DEFAULT true;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'shows' AND column_name = 'registration_deadline') THEN
    ALTER TABLE "shows" ADD COLUMN "registration_deadline" TIMESTAMP(3);
  END IF;
END $$;

-- AlterTable ticket_tiers (idempotent)
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ticket_tiers' AND column_name = 'user_max_quantity') THEN
    ALTER TABLE "ticket_tiers" DROP COLUMN "user_max_quantity";
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ticket_tiers' AND column_name = 'created_by') THEN
    ALTER TABLE "ticket_tiers" ADD COLUMN "created_by" INTEGER;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ticket_tiers' AND column_name = 'group_size') THEN
    ALTER TABLE "ticket_tiers" ADD COLUMN "group_size" INTEGER NOT NULL DEFAULT 1;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ticket_tiers' AND column_name = 'max_per_order') THEN
    ALTER TABLE "ticket_tiers" ADD COLUMN "max_per_order" INTEGER NOT NULL DEFAULT 10;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ticket_tiers' AND column_name = 'name_en') THEN
    ALTER TABLE "ticket_tiers" ADD COLUMN "name_en" VARCHAR(100);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ticket_tiers' AND column_name = 'sold_count') THEN
    ALTER TABLE "ticket_tiers" ADD COLUMN "sold_count" INTEGER NOT NULL DEFAULT 0;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ticket_tiers' AND column_name = 'target_audience') THEN
    ALTER TABLE "ticket_tiers" ADD COLUMN "target_audience" VARCHAR(255);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ticket_tiers' AND column_name = 'total_quantity') THEN
    ALTER TABLE "ticket_tiers" ADD COLUMN "total_quantity" INTEGER NOT NULL DEFAULT 0;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ticket_tiers' AND column_name = 'updated_by') THEN
    ALTER TABLE "ticket_tiers" ADD COLUMN "updated_by" INTEGER;
  END IF;
END $$;

-- CreateTable show_activity_logs (idempotent)
CREATE TABLE IF NOT EXISTS "show_activity_logs" (
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

-- CreateTable ticket_verifications (idempotent)
CREATE TABLE IF NOT EXISTS "ticket_verifications" (
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

-- CreateIndex (idempotent)
CREATE INDEX IF NOT EXISTS "show_activity_logs_show_id_created_at_idx" ON "show_activity_logs"("show_id", "created_at");
CREATE INDEX IF NOT EXISTS "show_activity_logs_activity_type_idx" ON "show_activity_logs"("activity_type");
CREATE INDEX IF NOT EXISTS "show_activity_logs_actor_id_idx" ON "show_activity_logs"("actor_id");
CREATE INDEX IF NOT EXISTS "ticket_verifications_show_id_verified_at_idx" ON "ticket_verifications"("show_id", "verified_at");
CREATE INDEX IF NOT EXISTS "ticket_verifications_ticket_id_idx" ON "ticket_verifications"("ticket_id");
CREATE INDEX IF NOT EXISTS "ticket_verifications_user_id_idx" ON "ticket_verifications"("user_id");

-- CreateUniqueIndex (idempotent)
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'ticket_verifications_ticket_id_show_id_key') THEN
    CREATE UNIQUE INDEX "ticket_verifications_ticket_id_show_id_key" ON "ticket_verifications"("ticket_id", "show_id");
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'performance_registrations_show_id_queue_number_key') THEN
    CREATE UNIQUE INDEX "performance_registrations_show_id_queue_number_key" ON "performance_registrations"("show_id", "queue_number");
  END IF;
END $$;

-- RenameForeignKey: only if old constraint exists and new one does not
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'booking_items_ticketTierId_fkey')
     AND NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'booking_items_ticket_tier_id_fkey') THEN
    ALTER TABLE "booking_items" RENAME CONSTRAINT "booking_items_ticketTierId_fkey" TO "booking_items_ticket_tier_id_fkey";
  END IF;
END $$;

-- AddForeignKey (idempotent)
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'show_activity_logs_show_id_fkey') THEN
    ALTER TABLE "show_activity_logs" ADD CONSTRAINT "show_activity_logs_show_id_fkey" FOREIGN KEY ("show_id") REFERENCES "shows"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'show_activity_logs_actor_id_fkey') THEN
    ALTER TABLE "show_activity_logs" ADD CONSTRAINT "show_activity_logs_actor_id_fkey" FOREIGN KEY ("actor_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ticket_verifications_show_id_fkey') THEN
    ALTER TABLE "ticket_verifications" ADD CONSTRAINT "ticket_verifications_show_id_fkey" FOREIGN KEY ("show_id") REFERENCES "shows"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ticket_verifications_ticket_id_fkey') THEN
    ALTER TABLE "ticket_verifications" ADD CONSTRAINT "ticket_verifications_ticket_id_fkey" FOREIGN KEY ("ticket_id") REFERENCES "tickets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ticket_verifications_user_id_fkey') THEN
    ALTER TABLE "ticket_verifications" ADD CONSTRAINT "ticket_verifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ticket_verifications_verified_by_fkey') THEN
    ALTER TABLE "ticket_verifications" ADD CONSTRAINT "ticket_verifications_verified_by_fkey" FOREIGN KEY ("verified_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
  END IF;
END $$;

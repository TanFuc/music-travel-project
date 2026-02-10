-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "TicketStatus" ADD VALUE 'USED';
ALTER TYPE "TicketStatus" ADD VALUE 'CANCELLED';

-- DropForeignKey
ALTER TABLE "tickets" DROP CONSTRAINT "tickets_show_id_fkey";

-- DropForeignKey
ALTER TABLE "tickets" DROP CONSTRAINT "tickets_ticket_class_id_fkey";

-- AlterTable
ALTER TABLE "booking_items" ADD COLUMN     "ticketTierId" INTEGER;

-- AlterTable
ALTER TABLE "cart_items" ADD COLUMN     "ticketTierId" INTEGER;

-- AlterTable
ALTER TABLE "stages" ADD COLUMN     "branch_id" INTEGER;

-- AlterTable
ALTER TABLE "tickets" ADD COLUMN     "redeemed_show_id" INTEGER,
ADD COLUMN     "ticket_tier_id" INTEGER,
ALTER COLUMN "show_id" DROP NOT NULL,
ALTER COLUMN "ticket_class_id" DROP NOT NULL;

-- CreateTable
CREATE TABLE "ticket_tiers" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "price" DECIMAL(15,2) NOT NULL,
    "description" TEXT,
    "benefits" TEXT,
    "color_code" VARCHAR(10),
    "priority" INTEGER NOT NULL DEFAULT 0,
    "user_max_quantity" INTEGER NOT NULL DEFAULT 10,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ticket_tiers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "home_stages" (
    "id" SERIAL NOT NULL,
    "title" VARCHAR(150) NOT NULL,
    "image_url" VARCHAR(500) NOT NULL,
    "description" TEXT,
    "location" VARCHAR(100),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "display_order" INTEGER NOT NULL DEFAULT 0,
    "created_by" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "home_stages_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "stages" ADD CONSTRAINT "stages_branch_id_fkey" FOREIGN KEY ("branch_id") REFERENCES "branches"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tickets" ADD CONSTRAINT "tickets_show_id_fkey" FOREIGN KEY ("show_id") REFERENCES "shows"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tickets" ADD CONSTRAINT "tickets_ticket_class_id_fkey" FOREIGN KEY ("ticket_class_id") REFERENCES "ticket_classes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tickets" ADD CONSTRAINT "tickets_ticket_tier_id_fkey" FOREIGN KEY ("ticket_tier_id") REFERENCES "ticket_tiers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tickets" ADD CONSTRAINT "tickets_redeemed_show_id_fkey" FOREIGN KEY ("redeemed_show_id") REFERENCES "shows"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cart_items" ADD CONSTRAINT "cart_items_ticketTierId_fkey" FOREIGN KEY ("ticketTierId") REFERENCES "ticket_tiers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "booking_items" ADD CONSTRAINT "booking_items_ticketTierId_fkey" FOREIGN KEY ("ticketTierId") REFERENCES "ticket_tiers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

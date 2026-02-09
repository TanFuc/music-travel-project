-- AlterEnum
ALTER TYPE "BookingItemType" ADD VALUE 'SINGER_PACKAGE';

-- AlterTable
ALTER TABLE "booking_items" ADD COLUMN     "singer_package_id" TEXT;

-- AddForeignKey
ALTER TABLE "booking_items" ADD CONSTRAINT "booking_items_singer_package_id_fkey" FOREIGN KEY ("singer_package_id") REFERENCES "singer_package_templates"("id") ON DELETE SET NULL ON UPDATE CASCADE;

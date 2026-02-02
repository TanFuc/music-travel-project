-- CreateEnum
CREATE TYPE "TransactionType" AS ENUM ('PAYMENT', 'REFUND');

-- AlterEnum
ALTER TYPE "BookingStatus" ADD VALUE 'MANUAL_REVIEW';

-- AlterEnum
ALTER TYPE "PaymentMethod" ADD VALUE 'PAYOS';

-- AlterTable
ALTER TABLE "transactions" ADD COLUMN     "external_status" VARCHAR(50),
ADD COLUMN     "type" "TransactionType" NOT NULL DEFAULT 'PAYMENT';

-- CreateIndex
CREATE INDEX "transactions_status_type_created_at_idx" ON "transactions"("status", "type", "created_at");

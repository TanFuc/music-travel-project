-- AlterTable
ALTER TABLE "singer_package_templates" ADD COLUMN     "original_price" DECIMAL(15,2);

-- AlterTable
ALTER TABLE "ticket_tiers" ADD COLUMN     "original_price" DECIMAL(15,2);

-- CreateTable
CREATE TABLE "payment_method_configs" (
    "id" SERIAL NOT NULL,
    "method" "PaymentMethod" NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "discount_percentage" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payment_method_configs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "payment_method_configs_method_key" ON "payment_method_configs"("method");

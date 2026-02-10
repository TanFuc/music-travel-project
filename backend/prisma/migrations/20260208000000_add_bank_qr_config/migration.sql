-- CreateTable
CREATE TABLE "bank_qr_config" (
    "id" SERIAL NOT NULL,
    "bank_bin" VARCHAR(10) NOT NULL,
    "account_number" VARCHAR(20) NOT NULL,
    "account_name" VARCHAR(100) NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "bank_qr_config_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contact_channels" (
    "id" SERIAL NOT NULL,
    "type" VARCHAR(20) NOT NULL,
    "label" VARCHAR(100) NOT NULL,
    "value" VARCHAR(255) NOT NULL,
    "icon" VARCHAR(50),
    "color_code" VARCHAR(10),
    "display_order" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "contact_channels_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "contact_channels_is_active_idx" ON "contact_channels"("is_active");

-- CreateIndex
CREATE INDEX "contact_channels_display_order_idx" ON "contact_channels"("display_order");

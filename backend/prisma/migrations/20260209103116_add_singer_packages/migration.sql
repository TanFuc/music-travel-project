-- AlterTable
ALTER TABLE "singer_registrations" ADD COLUMN     "package_template_id" TEXT,
ADD COLUMN     "user_id" INTEGER,
ALTER COLUMN "package" DROP NOT NULL;

-- CreateTable
CREATE TABLE "singer_package_templates" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "name_en" VARCHAR(100),
    "price" DECIMAL(15,2) NOT NULL,
    "description" TEXT,
    "benefits" JSONB,
    "color_code" VARCHAR(10),
    "icon" VARCHAR(50),
    "display_order" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "max_registrations" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" INTEGER,
    "updated_by" INTEGER,

    CONSTRAINT "singer_package_templates_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "singer_registrations_package_template_id_idx" ON "singer_registrations"("package_template_id");

-- CreateIndex
CREATE INDEX "singer_registrations_user_id_idx" ON "singer_registrations"("user_id");

-- AddForeignKey
ALTER TABLE "singer_registrations" ADD CONSTRAINT "singer_registrations_package_template_id_fkey" FOREIGN KEY ("package_template_id") REFERENCES "singer_package_templates"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "singer_registrations" ADD CONSTRAINT "singer_registrations_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

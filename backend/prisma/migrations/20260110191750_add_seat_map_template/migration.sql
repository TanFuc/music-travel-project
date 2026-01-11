-- AlterTable
ALTER TABLE "stages" ADD COLUMN     "seat_map_config" JSONB,
ADD COLUMN     "seat_map_template" INTEGER;

-- CreateTable
CREATE TABLE "seat_map_templates" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "description" TEXT,
    "config" JSONB NOT NULL,
    "thumbnail" VARCHAR(500),
    "is_public" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" INTEGER,

    CONSTRAINT "seat_map_templates_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "stages" ADD CONSTRAINT "stages_seat_map_template_fkey" FOREIGN KEY ("seat_map_template") REFERENCES "seat_map_templates"("id") ON DELETE SET NULL ON UPDATE CASCADE;

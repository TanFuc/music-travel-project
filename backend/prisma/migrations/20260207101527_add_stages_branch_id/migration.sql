-- AlterTable: add branch_id only if not exists (20260130040805 may have already added it)
ALTER TABLE "stages" ADD COLUMN IF NOT EXISTS "branch_id" INTEGER;

-- CreateTable: create home_stages only if not exists
CREATE TABLE IF NOT EXISTS "home_stages" (
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

-- AddForeignKey: add only if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'stages_branch_id_fkey'
  ) THEN
    ALTER TABLE "stages" ADD CONSTRAINT "stages_branch_id_fkey"
    FOREIGN KEY ("branch_id") REFERENCES "branches"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;

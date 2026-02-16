-- AlterTable
ALTER TABLE "users" ADD COLUMN "referral_code" VARCHAR(20);
ALTER TABLE "users" ADD COLUMN "is_collaborator" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "users" ADD COLUMN "referred_by_code" VARCHAR(20);

-- CreateIndex
CREATE UNIQUE INDEX "users_referral_code_key" ON "users"("referral_code");

-- CreateIndex
CREATE INDEX "users_referral_code_idx" ON "users"("referral_code");

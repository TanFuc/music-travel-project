-- CreateEnum
CREATE TYPE "SingingExperience" AS ENUM ('NONE', 'HOBBY', 'SEMI_PROFESSIONAL', 'PROFESSIONAL');

-- CreateEnum
CREATE TYPE "SingerPackage" AS ENUM ('BM_V1', 'BM_V2');

-- CreateEnum
CREATE TYPE "SingerRegistrationStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'CANCELLED');

-- CreateTable
CREATE TABLE "singer_registrations" (
    "id" TEXT NOT NULL,
    "full_name" VARCHAR(100) NOT NULL,
    "phone_number" VARCHAR(15) NOT NULL,
    "email" VARCHAR(100) NOT NULL,
    "age" INTEGER NOT NULL,
    "gender" VARCHAR(10) NOT NULL,
    "address" VARCHAR(255) NOT NULL,
    "singing_experience" "SingingExperience" NOT NULL,
    "favorite_genre" VARCHAR(100) NOT NULL,
    "package" "SingerPackage" NOT NULL,
    "introduction" TEXT,
    "voice_sample_url" VARCHAR(500),
    "status" "SingerRegistrationStatus" NOT NULL DEFAULT 'PENDING',
    "admin_notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "singer_registrations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "singer_registrations_phone_number_idx" ON "singer_registrations"("phone_number");

-- CreateIndex
CREATE INDEX "singer_registrations_email_idx" ON "singer_registrations"("email");

-- CreateIndex
CREATE INDEX "singer_registrations_status_idx" ON "singer_registrations"("status");

-- CreateIndex
CREATE INDEX "singer_registrations_package_idx" ON "singer_registrations"("package");

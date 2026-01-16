-- CreateEnum
CREATE TYPE "PerformanceType" AS ENUM ('SINGING', 'DANCING', 'INSTRUMENT', 'MAGIC', 'COMEDY', 'OTHER');

-- CreateEnum
CREATE TYPE "RegistrationStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'CANCELLED', 'PERFORMED');

-- CreateTable
CREATE TABLE "performance_qr_codes" (
    "id" SERIAL NOT NULL,
    "code" VARCHAR(100) NOT NULL,
    "qr_image_url" VARCHAR(500),
    "show_id" INTEGER NOT NULL,
    "stage_id" INTEGER NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "max_registrations" INTEGER,
    "registration_deadline" TIMESTAMP(3),
    "scan_count" INTEGER NOT NULL DEFAULT 0,
    "registration_count" INTEGER NOT NULL DEFAULT 0,
    "created_by" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "performance_qr_codes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "performance_registrations" (
    "id" SERIAL NOT NULL,
    "show_id" INTEGER NOT NULL,
    "stage_id" INTEGER NOT NULL,
    "qr_code_id" INTEGER NOT NULL,
    "user_id" INTEGER,
    "guest_name" VARCHAR(100),
    "guest_email" VARCHAR(100),
    "guest_phone" VARCHAR(20),
    "performance_type" "PerformanceType" NOT NULL,
    "song_title" VARCHAR(200),
    "artist_name" VARCHAR(100),
    "duration" INTEGER,
    "description" TEXT,
    "audio_url" VARCHAR(500),
    "video_url" VARCHAR(500),
    "status" "RegistrationStatus" NOT NULL DEFAULT 'PENDING',
    "registered_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reviewed_by" INTEGER,
    "reviewed_at" TIMESTAMP(3),
    "review_note" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "performance_registrations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "performance_slots" (
    "id" SERIAL NOT NULL,
    "registration_id" INTEGER NOT NULL,
    "show_id" INTEGER NOT NULL,
    "stage_id" INTEGER NOT NULL,
    "start_time" TIMESTAMP(3) NOT NULL,
    "end_time" TIMESTAMP(3) NOT NULL,
    "slot_order" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "performance_slots_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "performance_qr_codes_code_key" ON "performance_qr_codes"("code");

-- CreateIndex
CREATE UNIQUE INDEX "performance_qr_codes_show_id_stage_id_key" ON "performance_qr_codes"("show_id", "stage_id");

-- CreateIndex
CREATE INDEX "performance_registrations_show_id_stage_id_idx" ON "performance_registrations"("show_id", "stage_id");

-- CreateIndex
CREATE INDEX "performance_registrations_status_idx" ON "performance_registrations"("status");

-- CreateIndex
CREATE INDEX "performance_registrations_qr_code_id_idx" ON "performance_registrations"("qr_code_id");

-- CreateIndex
CREATE UNIQUE INDEX "performance_slots_registration_id_key" ON "performance_slots"("registration_id");

-- CreateIndex
CREATE INDEX "performance_slots_show_id_stage_id_idx" ON "performance_slots"("show_id", "stage_id");

-- AddForeignKey
ALTER TABLE "performance_qr_codes" ADD CONSTRAINT "performance_qr_codes_show_id_fkey" FOREIGN KEY ("show_id") REFERENCES "shows"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "performance_qr_codes" ADD CONSTRAINT "performance_qr_codes_stage_id_fkey" FOREIGN KEY ("stage_id") REFERENCES "stages"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "performance_registrations" ADD CONSTRAINT "performance_registrations_show_id_fkey" FOREIGN KEY ("show_id") REFERENCES "shows"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "performance_registrations" ADD CONSTRAINT "performance_registrations_stage_id_fkey" FOREIGN KEY ("stage_id") REFERENCES "stages"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "performance_registrations" ADD CONSTRAINT "performance_registrations_qr_code_id_fkey" FOREIGN KEY ("qr_code_id") REFERENCES "performance_qr_codes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "performance_slots" ADD CONSTRAINT "performance_slots_registration_id_fkey" FOREIGN KEY ("registration_id") REFERENCES "performance_registrations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "performance_slots" ADD CONSTRAINT "performance_slots_show_id_fkey" FOREIGN KEY ("show_id") REFERENCES "shows"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "performance_slots" ADD CONSTRAINT "performance_slots_stage_id_fkey" FOREIGN KEY ("stage_id") REFERENCES "stages"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

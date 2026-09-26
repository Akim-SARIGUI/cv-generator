-- AlterTable
ALTER TABLE "personal_infos" ADD COLUMN "objective" TEXT;

-- AlterTable
ALTER TABLE "resumes" ADD COLUMN "sections" JSONB NOT NULL DEFAULT '{"profile":true,"objective":false,"experience":true,"education":true,"skills":true,"certifications":false,"awards":false,"projects":false,"interests":false,"references":false}';

-- CreateEnum
CREATE TYPE "ExtraKind" AS ENUM ('CERTIFICATION', 'AWARD', 'PROJECT', 'INTEREST', 'REFERENCE');

-- CreateTable
CREATE TABLE "extra_entries" (
    "id" TEXT NOT NULL,
    "resume_id" TEXT NOT NULL,
    "kind" "ExtraKind" NOT NULL,
    "title" TEXT NOT NULL,
    "subtitle" TEXT,
    "date_label" TEXT,
    "description" TEXT,
    "url" TEXT,
    "sort_order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "extra_entries_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "extra_entries_resume_id_idx" ON "extra_entries"("resume_id");

-- CreateIndex
CREATE INDEX "extra_entries_resume_id_kind_idx" ON "extra_entries"("resume_id", "kind");

-- AddForeignKey
ALTER TABLE "extra_entries" ADD CONSTRAINT "extra_entries_resume_id_fkey" FOREIGN KEY ("resume_id") REFERENCES "resumes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AlterTable
ALTER TABLE "resumes" ADD COLUMN "locale" TEXT NOT NULL DEFAULT 'fr';

-- Update defaults / legacy template id
ALTER TABLE "resumes" ALTER COLUMN "template" SET DEFAULT 'eu';
UPDATE "resumes" SET "template" = 'eu' WHERE "template" = 'classic';

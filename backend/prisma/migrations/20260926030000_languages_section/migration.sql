-- AlterEnum
ALTER TYPE "ExtraKind" ADD VALUE 'LANGUAGE';

-- Update default for new rows (existing rows keep their JSON; app normalizes missing keys)
ALTER TABLE "resumes" ALTER COLUMN "sections" SET DEFAULT '{"profile":true,"objective":false,"experience":true,"education":true,"skills":true,"languages":true,"certifications":false,"awards":false,"projects":false,"interests":false,"references":false}';

-- Enable languages section on existing resumes when key absent
UPDATE "resumes"
SET "sections" = COALESCE("sections", '{}'::jsonb) || '{"languages":true}'::jsonb
WHERE NOT ("sections" ? 'languages');

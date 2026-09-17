ALTER TABLE "job" ALTER COLUMN "minimum_experience" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "job" ALTER COLUMN "maximum_experience" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "job" DROP COLUMN "experience_level";--> statement-breakpoint
DROP TYPE "public"."experience_level";
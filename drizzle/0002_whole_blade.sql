CREATE TYPE "public"."employment_type" AS ENUM('FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERNSHIP');--> statement-breakpoint
CREATE TYPE "public"."experience_level" AS ENUM('ENTRY', 'MID', 'SENIOR', 'LEAD');--> statement-breakpoint
CREATE TYPE "public"."job_status" AS ENUM('DRAFT', 'PUBLISHED', 'CLOSED');--> statement-breakpoint
CREATE TYPE "public"."workplace_type" AS ENUM('ONSITE', 'REMOTE', 'HYBRID');--> statement-breakpoint
CREATE TABLE "job" (
	"id" text PRIMARY KEY NOT NULL,
	"employer_id" text NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"location" text,
	"employment_type" "employment_type" DEFAULT 'FULL_TIME' NOT NULL,
	"workplace_type" "workplace_type" DEFAULT 'ONSITE' NOT NULL,
	"experience_level" "experience_level" DEFAULT 'ENTRY' NOT NULL,
	"minimum_salary" integer,
	"maximum_salary" integer,
	"currency" text DEFAULT 'INR' NOT NULL,
	"openings" integer DEFAULT 1 NOT NULL,
	"skills" text[] DEFAULT '{}' NOT NULL,
	"status" "job_status" DEFAULT 'DRAFT' NOT NULL,
	"published_at" timestamp,
	"expires_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "job" ADD CONSTRAINT "job_employer_id_user_id_fk" FOREIGN KEY ("employer_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "job_employer_id_idx" ON "job" USING btree ("employer_id");--> statement-breakpoint
CREATE INDEX "job_status_created_at_idx" ON "job" USING btree ("status","created_at");
CREATE TYPE "public"."application_status" AS ENUM('SUBMITTED', 'SHORTLISTED', 'REJECTED', 'WITHDRAWN');--> statement-breakpoint
CREATE TABLE "application" (
	"id" text PRIMARY KEY NOT NULL,
	"job_id" text NOT NULL,
	"job_seeker_id" text NOT NULL,
	"status" "application_status" DEFAULT 'SUBMITTED' NOT NULL,
	"cover_letter" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "application" ADD CONSTRAINT "application_job_id_job_id_fk" FOREIGN KEY ("job_id") REFERENCES "public"."job"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "application" ADD CONSTRAINT "application_job_seeker_id_user_id_fk" FOREIGN KEY ("job_seeker_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "application_job_seeker_unique" ON "application" USING btree ("job_id","job_seeker_id");--> statement-breakpoint
CREATE INDEX "application_job_status_created_at_idx" ON "application" USING btree ("job_id","status","created_at");--> statement-breakpoint
CREATE INDEX "application_seeker_created_at_idx" ON "application" USING btree ("job_seeker_id","created_at");
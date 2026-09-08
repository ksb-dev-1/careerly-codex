CREATE TABLE "employer_profile" (
	"user_id" text PRIMARY KEY NOT NULL,
	"company_name" text,
	"logo_url" text,
	"industry" text,
	"location" text,
	"about" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "job_seeker_profile" (
	"user_id" text PRIMARY KEY NOT NULL,
	"headline" text,
	"experience" text,
	"skills" text[] DEFAULT '{}' NOT NULL,
	"location" text,
	"about" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "employer_profile" ADD CONSTRAINT "employer_profile_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "job_seeker_profile" ADD CONSTRAINT "job_seeker_profile_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;
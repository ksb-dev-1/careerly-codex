CREATE TYPE "public"."notification_type" AS ENUM('APPLICATION_SUBMITTED', 'NEW_APPLICATION', 'APPLICATION_SHORTLISTED', 'APPLICATION_REJECTED');--> statement-breakpoint
CREATE TABLE "mutation_rate_limit" (
	"user_id" text NOT NULL,
	"action" text NOT NULL,
	"window_start" timestamp NOT NULL,
	"request_count" integer DEFAULT 1 NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "mutation_rate_limit_user_id_action_window_start_pk" PRIMARY KEY("user_id","action","window_start")
);
--> statement-breakpoint
CREATE TABLE "notification" (
	"id" text PRIMARY KEY NOT NULL,
	"recipient_user_id" text NOT NULL,
	"type" "notification_type" NOT NULL,
	"title" text NOT NULL,
	"message" text NOT NULL,
	"href" text,
	"read_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "mutation_rate_limit" ADD CONSTRAINT "mutation_rate_limit_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notification" ADD CONSTRAINT "notification_recipient_user_id_user_id_fk" FOREIGN KEY ("recipient_user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "notification_recipient_created_at_idx" ON "notification" USING btree ("recipient_user_id","created_at");
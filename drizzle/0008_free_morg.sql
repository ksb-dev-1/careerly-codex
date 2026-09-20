CREATE TYPE "public"."membership_plan" AS ENUM('FREE', 'PREMIUM');--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "membership_plan" "membership_plan" DEFAULT 'FREE' NOT NULL;
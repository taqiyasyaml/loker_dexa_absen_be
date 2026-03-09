CREATE TABLE "mst_user" (
	"id" text PRIMARY KEY,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp,
	"username" text NOT NULL UNIQUE,
	"password" text NOT NULL,
	"name" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "mst_site" (
	"id" text PRIMARY KEY,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp,
	"created_by" text,
	"updated_by" text,
	"name" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "mst_site_user" (
	"id" text PRIMARY KEY,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp,
	"created_by" text,
	"updated_by" text,
	"user_id" text NOT NULL,
	"site_id" text NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"is_admin" boolean DEFAULT false NOT NULL,
	CONSTRAINT "mst_site_user_site_user_idx" UNIQUE("site_id","user_id")
);
--> statement-breakpoint
CREATE TABLE "trx_attendance" (
	"id" text PRIMARY KEY,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp,
	"created_by" text,
	"updated_by" text,
	"user_id" text NOT NULL,
	"site_id" text NOT NULL,
	"is_attendance_active" boolean DEFAULT true NOT NULL,
	"is_check_in" boolean DEFAULT false NOT NULL,
	"check_in_at" timestamp,
	"is_check_out" boolean DEFAULT false NOT NULL,
	"check_out_at" timestamp,
	"is_finalized" boolean DEFAULT false NOT NULL,
	"final_check_in_at" timestamp,
	"final_checkout_at" timestamp,
	"final_ms" integer DEFAULT 0 NOT NULL,
	"final_penalty_ms" integer DEFAULT 0 NOT NULL,
	"final_overtime_ms" integer DEFAULT 0 NOT NULL,
	"final_notes" text,
	"final_at" timestamp,
	"final_by" text,
	"deleted_at" timestamp,
	"deleted_by" text
);
--> statement-breakpoint
CREATE TABLE "log_attendance" (
	"id" text PRIMARY KEY,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp,
	"created_by" text,
	"updated_by" text,
	"trx_attendance_id" text NOT NULL,
	"notes" text NOT NULL,
	"photo_path" text,
	"latitude" double precision,
	"longitude" double precision
);
--> statement-breakpoint
CREATE UNIQUE INDEX "trx_attendance_active_idx" ON "trx_attendance" ("user_id","site_id") WHERE "is_attendance_active" = true;
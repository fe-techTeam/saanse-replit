CREATE TABLE "admin_users" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"display_name" text,
	"role" text DEFAULT 'admin' NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"last_login_at" timestamp,
	CONSTRAINT "admin_users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "otp_verifications" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"mobile_number" text NOT NULL,
	"otp" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"is_used" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"used_at" timestamp,
	"user_id" text
);
--> statement-breakpoint
CREATE TABLE "playlists" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"name" text NOT NULL,
	"type" text NOT NULL,
	"video_ids" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "series" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"category" text NOT NULL,
	"thumbnail_url" text NOT NULL,
	"banner_url" text,
	"total_episodes" integer DEFAULT 0 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text,
	"display_name" text,
	"photo_url" text,
	"supabase_uid" text NOT NULL,
	"mobile" text,
	"mobile_number" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email"),
	CONSTRAINT "users_supabase_uid_unique" UNIQUE("supabase_uid"),
	CONSTRAINT "users_mobile_unique" UNIQUE("mobile"),
	CONSTRAINT "users_mobile_number_unique" UNIQUE("mobile_number")
);
--> statement-breakpoint
CREATE TABLE "videos" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"category" text NOT NULL,
	"duration" numeric(10, 6) NOT NULL,
	"thumbnail_url" text NOT NULL,
	"video_url" text NOT NULL,
	"likes" integer DEFAULT 0 NOT NULL,
	"views" integer DEFAULT 0 NOT NULL,
	"tags" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"content_type" text DEFAULT 'standalone' NOT NULL,
	"series_id" text,
	"episode_number" integer,
	"cloudinary_public_id" text,
	"streaming_urls" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "view_history" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"video_id" text NOT NULL,
	"watched_at" timestamp DEFAULT now() NOT NULL,
	"progress" numeric(10, 6) DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "watch_later" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"video_id" text NOT NULL,
	"added_at" timestamp DEFAULT now() NOT NULL,
	"priority" integer DEFAULT 0 NOT NULL,
	"notes" text,
	"is_watched" boolean DEFAULT false NOT NULL,
	"watched_at" timestamp,
	"progress" numeric(10, 6) DEFAULT 0 NOT NULL,
	CONSTRAINT "user_video_unique" UNIQUE("user_id","video_id")
);
--> statement-breakpoint
CREATE INDEX "otp_mobile_number_idx" ON "otp_verifications" USING btree ("mobile_number");--> statement-breakpoint
CREATE INDEX "otp_otp_idx" ON "otp_verifications" USING btree ("otp");--> statement-breakpoint
CREATE INDEX "otp_expires_at_idx" ON "otp_verifications" USING btree ("expires_at");--> statement-breakpoint
CREATE INDEX "users_mobile_idx" ON "users" USING btree ("mobile");--> statement-breakpoint
CREATE INDEX "watch_later_user_id_idx" ON "watch_later" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "watch_later_video_id_idx" ON "watch_later" USING btree ("video_id");--> statement-breakpoint
CREATE INDEX "watch_later_added_at_idx" ON "watch_later" USING btree ("added_at");--> statement-breakpoint
CREATE INDEX "watch_later_priority_idx" ON "watch_later" USING btree ("priority");
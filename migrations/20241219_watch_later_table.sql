-- Migration: Create watch_later table
-- Description: Add dedicated watch_later table to replace playlist-based watch later functionality
-- Date: 2024-12-19

-- Create the watch_later table
CREATE TABLE IF NOT EXISTS "watch_later" (
  "id" varchar PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_id" text NOT NULL,
  "video_id" text NOT NULL,
  "added_at" timestamp DEFAULT now() NOT NULL,
  "priority" integer DEFAULT 0 NOT NULL,
  "notes" text,
  "is_watched" boolean DEFAULT false NOT NULL,
  "watched_at" timestamp,
  "progress" numeric(10,6) DEFAULT 0 NOT NULL,
  CONSTRAINT "user_video_unique" UNIQUE("user_id", "video_id")
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS "watch_later_user_id_idx" ON "watch_later" ("user_id");
CREATE INDEX IF NOT EXISTS "watch_later_video_id_idx" ON "watch_later" ("video_id");
CREATE INDEX IF NOT EXISTS "watch_later_added_at_idx" ON "watch_later" ("added_at");
CREATE INDEX IF NOT EXISTS "watch_later_priority_idx" ON "watch_later" ("priority");

-- Add foreign key constraints for data integrity
ALTER TABLE "watch_later" ADD CONSTRAINT "watch_later_user_id_fkey" 
  FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;

ALTER TABLE "watch_later" ADD CONSTRAINT "watch_later_video_id_fkey" 
  FOREIGN KEY ("video_id") REFERENCES "videos"("id") ON DELETE CASCADE;

-- Add comments for documentation
COMMENT ON TABLE "watch_later" IS 'User watch later list with priority and progress tracking';
COMMENT ON COLUMN "watch_later"."priority" IS 'Higher number = higher priority for sorting';
COMMENT ON COLUMN "watch_later"."progress" IS 'Last watched position in seconds';
COMMENT ON COLUMN "watch_later"."notes" IS 'Optional user notes about the video';
COMMENT ON COLUMN "watch_later"."is_watched" IS 'Whether the video has been fully watched';
COMMENT ON COLUMN "watch_later"."watched_at" IS 'When the video was actually watched';

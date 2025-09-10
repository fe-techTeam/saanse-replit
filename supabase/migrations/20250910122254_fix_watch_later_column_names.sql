-- Migration: Fix watch_later column names to match Drizzle schema
-- Description: Rename snake_case columns to camelCase to match Drizzle schema
-- Date: 2025-01-09

-- Drop the existing table and recreate with correct column names
DROP TABLE IF EXISTS "watch_later" CASCADE;

-- Recreate the watch_later table with camelCase column names
CREATE TABLE "watch_later" (
  "id" varchar PRIMARY KEY DEFAULT gen_random_uuid(),
  "userId" text NOT NULL,
  "videoId" text NOT NULL,
  "addedAt" timestamp DEFAULT now() NOT NULL,
  "priority" integer DEFAULT 0 NOT NULL,
  "notes" text,
  "isWatched" boolean DEFAULT false NOT NULL,
  "watchedAt" timestamp,
  "progress" numeric(10,6) DEFAULT 0 NOT NULL,
  CONSTRAINT "user_video_unique" UNIQUE("userId", "videoId")
);

-- Create indexes for better performance
CREATE INDEX "watch_later_user_id_idx" ON "watch_later" ("userId");
CREATE INDEX "watch_later_video_id_idx" ON "watch_later" ("videoId");
CREATE INDEX "watch_later_added_at_idx" ON "watch_later" ("addedAt");
CREATE INDEX "watch_later_priority_idx" ON "watch_later" ("priority");

-- Add foreign key constraints for data integrity
ALTER TABLE "watch_later" ADD CONSTRAINT "watch_later_user_id_fkey" 
  FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE;

ALTER TABLE "watch_later" ADD CONSTRAINT "watch_later_video_id_fkey" 
  FOREIGN KEY ("videoId") REFERENCES "videos"("id") ON DELETE CASCADE;

-- Add comments for documentation
COMMENT ON TABLE "watch_later" IS 'User watch later list with priority and progress tracking';
COMMENT ON COLUMN "watch_later"."priority" IS 'Higher number = higher priority for sorting';
COMMENT ON COLUMN "watch_later"."progress" IS 'Last watched position in seconds';
COMMENT ON COLUMN "watch_later"."notes" IS 'Optional user notes about the video';
COMMENT ON COLUMN "watch_later"."isWatched" IS 'Whether the video has been fully watched';
COMMENT ON COLUMN "watch_later"."watchedAt" IS 'When the video was actually watched';

-- Fix episode unique constraint to only apply to active videos
-- This allows inactive videos to be replaced with new videos using the same episode number

-- Drop the existing unique constraint
DROP INDEX IF EXISTS videos_series_episode_idx;

-- Create a new partial unique index that only applies to active videos
CREATE UNIQUE INDEX videos_series_episode_active_idx 
ON videos(series_id, episode_number) 
WHERE is_active = true;

-- This allows:
-- 1. Multiple inactive videos with the same episode number in a series
-- 2. Only one active video per episode number per series
-- 3. New videos can reuse episode numbers from inactive videos

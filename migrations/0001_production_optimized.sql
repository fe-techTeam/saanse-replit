-- SAANSE Production Migration
-- Optimized for Supabase with RLS, indexes, and constraints
-- Generated for production use

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- For better text search performance

-- Create optimized indexes for performance
-- Users table indexes
CREATE INDEX IF NOT EXISTS "idx_users_supabase_uid" ON "users" ("supabase_uid");
CREATE INDEX IF NOT EXISTS "idx_users_email" ON "users" ("email");
CREATE INDEX IF NOT EXISTS "idx_users_created_at" ON "users" ("created_at" DESC);

-- Videos table indexes (most critical for performance)
CREATE INDEX IF NOT EXISTS "idx_videos_category" ON "videos" ("category");
CREATE INDEX IF NOT EXISTS "idx_videos_is_active" ON "videos" ("is_active");
CREATE INDEX IF NOT EXISTS "idx_videos_content_type" ON "videos" ("content_type");
CREATE INDEX IF NOT EXISTS "idx_videos_series_id" ON "videos" ("series_id");
CREATE INDEX IF NOT EXISTS "idx_videos_episode_number" ON "videos" ("episode_number");
CREATE INDEX IF NOT EXISTS "idx_videos_created_at" ON "videos" ("created_at" DESC);
CREATE INDEX IF NOT EXISTS "idx_videos_views_desc" ON "videos" ("views" DESC);
CREATE INDEX IF NOT EXISTS "idx_videos_likes_desc" ON "videos" ("likes" DESC);
CREATE INDEX IF NOT EXISTS "idx_videos_category_active" ON "videos" ("category", "is_active");
CREATE INDEX IF NOT EXISTS "idx_videos_series_episode" ON "videos" ("series_id", "episode_number");

-- Text search indexes for videos
CREATE INDEX IF NOT EXISTS "idx_videos_title_search" ON "videos" USING gin (to_tsvector('english', "title"));
CREATE INDEX IF NOT EXISTS "idx_videos_description_search" ON "videos" USING gin (to_tsvector('english', coalesce("description", '')));
CREATE INDEX IF NOT EXISTS "idx_videos_tags_gin" ON "videos" USING gin ("tags");

-- Series table indexes
CREATE INDEX IF NOT EXISTS "idx_series_category" ON "series" ("category");
CREATE INDEX IF NOT EXISTS "idx_series_is_active" ON "series" ("is_active");
CREATE INDEX IF NOT EXISTS "idx_series_created_at" ON "series" ("created_at" DESC);
CREATE INDEX IF NOT EXISTS "idx_series_category_active" ON "series" ("category", "is_active");

-- Playlists table indexes
CREATE INDEX IF NOT EXISTS "idx_playlists_user_id" ON "playlists" ("user_id");
CREATE INDEX IF NOT EXISTS "idx_playlists_type" ON "playlists" ("type");
CREATE INDEX IF NOT EXISTS "idx_playlists_user_type" ON "playlists" ("user_id", "type");
CREATE INDEX IF NOT EXISTS "idx_playlists_created_at" ON "playlists" ("created_at" DESC);

-- View history table indexes
CREATE INDEX IF NOT EXISTS "idx_view_history_user_id" ON "view_history" ("user_id");
CREATE INDEX IF NOT EXISTS "idx_view_history_video_id" ON "view_history" ("video_id");
CREATE INDEX IF NOT EXISTS "idx_view_history_watched_at" ON "view_history" ("watched_at" DESC);
CREATE INDEX IF NOT EXISTS "idx_view_history_user_video" ON "view_history" ("user_id", "video_id");
CREATE INDEX IF NOT EXISTS "idx_view_history_user_watched" ON "view_history" ("user_id", "watched_at" DESC);

-- Admin users table indexes
CREATE INDEX IF NOT EXISTS "idx_admin_users_email" ON "admin_users" ("email");
CREATE INDEX IF NOT EXISTS "idx_admin_users_role" ON "admin_users" ("role");
CREATE INDEX IF NOT EXISTS "idx_admin_users_is_active" ON "admin_users" ("is_active");
CREATE INDEX IF NOT EXISTS "idx_admin_users_role_active" ON "admin_users" ("role", "is_active");

-- Add foreign key constraints for data integrity
-- Note: These are soft references since we're using text fields
-- Videos -> Series relationship
CREATE INDEX IF NOT EXISTS "idx_videos_series_fk" ON "videos" ("series_id") WHERE "series_id" IS NOT NULL;

-- Playlists -> Users relationship
CREATE INDEX IF NOT EXISTS "idx_playlists_user_fk" ON "playlists" ("user_id");

-- View History relationships
CREATE INDEX IF NOT EXISTS "idx_view_history_user_fk" ON "view_history" ("user_id");
CREATE INDEX IF NOT EXISTS "idx_view_history_video_fk" ON "view_history" ("video_id");

-- Enable Row Level Security (RLS) for Supabase
ALTER TABLE "users" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "videos" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "series" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "playlists" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "view_history" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "admin_users" ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users table
CREATE POLICY "Users can view their own profile" ON "users"
  FOR SELECT USING (auth.uid()::text = supabase_uid);

CREATE POLICY "Users can update their own profile" ON "users"
  FOR UPDATE USING (auth.uid()::text = supabase_uid);

CREATE POLICY "Allow user registration" ON "users"
  FOR INSERT WITH CHECK (auth.uid()::text = supabase_uid);

-- RLS Policies for videos table (public read, admin write)
CREATE POLICY "Anyone can view active videos" ON "videos"
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage videos" ON "videos"
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE email = auth.jwt() ->> 'email' 
      AND is_active = true
    )
  );

-- RLS Policies for series table (public read, admin write)
CREATE POLICY "Anyone can view active series" ON "series"
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage series" ON "series"
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE email = auth.jwt() ->> 'email' 
      AND is_active = true
    )
  );

-- RLS Policies for playlists table
CREATE POLICY "Users can view their own playlists" ON "playlists"
  FOR SELECT USING (
    user_id IN (
      SELECT id FROM users WHERE supabase_uid = auth.uid()::text
    )
  );

CREATE POLICY "Users can manage their own playlists" ON "playlists"
  FOR ALL USING (
    user_id IN (
      SELECT id FROM users WHERE supabase_uid = auth.uid()::text
    )
  );

-- RLS Policies for view_history table
CREATE POLICY "Users can view their own history" ON "view_history"
  FOR SELECT USING (
    user_id IN (
      SELECT id FROM users WHERE supabase_uid = auth.uid()::text
    )
  );

CREATE POLICY "Users can manage their own history" ON "view_history"
  FOR ALL USING (
    user_id IN (
      SELECT id FROM users WHERE supabase_uid = auth.uid()::text
    )
  );

-- RLS Policies for admin_users table (admin only)
CREATE POLICY "Admins can view admin users" ON "admin_users"
  FOR SELECT USING (
    email = auth.jwt() ->> 'email' AND is_active = true
  );

CREATE POLICY "Super admins can manage admin users" ON "admin_users"
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE email = auth.jwt() ->> 'email' 
      AND role = 'super_admin' 
      AND is_active = true
    )
  );

-- Create useful database functions
-- Function to increment video views
CREATE OR REPLACE FUNCTION increment_video_views(video_id_param text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE videos 
  SET views = views + 1 
  WHERE id = video_id_param AND is_active = true;
END;
$$;

-- Function to increment video likes
CREATE OR REPLACE FUNCTION increment_video_likes(video_id_param text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE videos 
  SET likes = likes + 1 
  WHERE id = video_id_param AND is_active = true;
END;
$$;

-- Function to get user's watch progress for a video
CREATE OR REPLACE FUNCTION get_user_video_progress(user_id_param text, video_id_param text)
RETURNS numeric
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_progress numeric := 0;
BEGIN
  SELECT progress INTO user_progress
  FROM view_history 
  WHERE user_id = user_id_param AND video_id = video_id_param
  ORDER BY watched_at DESC
  LIMIT 1;
  
  RETURN COALESCE(user_progress, 0);
END;
$$;

-- Function to search videos with full-text search
CREATE OR REPLACE FUNCTION search_videos(search_query text, category_filter text DEFAULT NULL)
RETURNS TABLE (
  id varchar,
  title text,
  description text,
  category text,
  duration numeric,
  thumbnail_url text,
  video_url text,
  likes integer,
  views integer,
  tags jsonb,
  content_type text,
  series_id text,
  episode_number integer,
  created_at timestamp,
  rank real
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    v.id,
    v.title,
    v.description,
    v.category,
    v.duration,
    v.thumbnail_url,
    v.video_url,
    v.likes,
    v.views,
    v.tags,
    v.content_type,
    v.series_id,
    v.episode_number,
    v.created_at,
    ts_rank(
      to_tsvector('english', v.title || ' ' || COALESCE(v.description, '')),
      plainto_tsquery('english', search_query)
    ) as rank
  FROM videos v
  WHERE 
    v.is_active = true
    AND (category_filter IS NULL OR v.category = category_filter)
    AND (
      to_tsvector('english', v.title || ' ' || COALESCE(v.description, '')) @@ plainto_tsquery('english', search_query)
      OR v.tags::text ILIKE '%' || search_query || '%'
    )
  ORDER BY rank DESC, v.views DESC, v.created_at DESC;
END;
$$;

-- Create triggers for automatic series episode counting
CREATE OR REPLACE FUNCTION update_series_episode_count()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  -- Update total episodes count when videos are added/removed/updated
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    IF NEW.series_id IS NOT NULL AND NEW.content_type = 'series' THEN
      UPDATE series 
      SET total_episodes = (
        SELECT COUNT(*) 
        FROM videos 
        WHERE series_id = NEW.series_id 
        AND content_type = 'series' 
        AND is_active = true
      )
      WHERE id = NEW.series_id;
    END IF;
  END IF;
  
  IF TG_OP = 'DELETE' OR TG_OP = 'UPDATE' THEN
    IF OLD.series_id IS NOT NULL AND OLD.content_type = 'series' THEN
      UPDATE series 
      SET total_episodes = (
        SELECT COUNT(*) 
        FROM videos 
        WHERE series_id = OLD.series_id 
        AND content_type = 'series' 
        AND is_active = true
      )
      WHERE id = OLD.series_id;
    END IF;
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Create the trigger
CREATE TRIGGER update_series_episode_count_trigger
  AFTER INSERT OR UPDATE OR DELETE ON videos
  FOR EACH ROW
  EXECUTE FUNCTION update_series_episode_count();

-- Add check constraints for data validation
ALTER TABLE "videos" ADD CONSTRAINT "check_duration_positive" CHECK (duration > 0);
ALTER TABLE "videos" ADD CONSTRAINT "check_likes_non_negative" CHECK (likes >= 0);
ALTER TABLE "videos" ADD CONSTRAINT "check_views_non_negative" CHECK (views >= 0);
ALTER TABLE "videos" ADD CONSTRAINT "check_content_type" CHECK (content_type IN ('standalone', 'series'));
ALTER TABLE "videos" ADD CONSTRAINT "check_series_episode_logic" 
  CHECK (
    (content_type = 'standalone' AND series_id IS NULL AND episode_number IS NULL) OR
    (content_type = 'series' AND series_id IS NOT NULL AND episode_number IS NOT NULL)
  );

ALTER TABLE "series" ADD CONSTRAINT "check_total_episodes_non_negative" CHECK (total_episodes >= 0);

ALTER TABLE "playlists" ADD CONSTRAINT "check_playlist_type" 
  CHECK (type IN ('favorites', 'watchLater', 'custom'));

ALTER TABLE "view_history" ADD CONSTRAINT "check_progress_non_negative" CHECK (progress >= 0);

ALTER TABLE "admin_users" ADD CONSTRAINT "check_admin_role" 
  CHECK (role IN ('admin', 'super_admin'));

-- Create composite unique constraints
ALTER TABLE "view_history" ADD CONSTRAINT "unique_user_video_timestamp" 
  UNIQUE ("user_id", "video_id", "watched_at");

-- Add comments for documentation
COMMENT ON TABLE "users" IS 'User profiles linked to Supabase authentication';
COMMENT ON TABLE "videos" IS 'Video content with metadata, views, and likes';
COMMENT ON TABLE "series" IS 'Episodic content collections (Ramayana, Krishna, etc.)';
COMMENT ON TABLE "playlists" IS 'User-created video collections';
COMMENT ON TABLE "view_history" IS 'User watch history and progress tracking';
COMMENT ON TABLE "admin_users" IS 'CMS admin accounts with role-based access';

-- Grant necessary permissions for Supabase
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres, service_role;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO postgres, authenticated, service_role;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO postgres, anon, authenticated, service_role;

-- Refresh the schema cache
NOTIFY pgrst, 'reload schema';

-- Final optimization: Update table statistics
ANALYZE "users";
ANALYZE "videos";
ANALYZE "series";
ANALYZE "playlists";
ANALYZE "view_history";
ANALYZE "admin_users";
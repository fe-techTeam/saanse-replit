#!/usr/bin/env node

console.log('🗄️ SAANSE Platform - Database Setup SQL Commands');
console.log('================================================\n');

console.log('📋 Copy and paste these SQL commands into your Supabase SQL Editor:\n');

const sqlCommands = `
-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  display_name TEXT,
  photo_url TEXT,
  supabase_uid TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Create series table
CREATE TABLE IF NOT EXISTS series (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  thumbnail_url TEXT NOT NULL,
  banner_url TEXT,
  total_episodes INTEGER DEFAULT 0 NOT NULL,
  is_active BOOLEAN DEFAULT true NOT NULL,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Create videos table
CREATE TABLE IF NOT EXISTS videos (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  duration INTEGER NOT NULL,
  thumbnail_url TEXT NOT NULL,
  video_url TEXT NOT NULL,
  likes INTEGER DEFAULT 0 NOT NULL,
  views INTEGER DEFAULT 0 NOT NULL,
  tags JSONB DEFAULT '[]' NOT NULL,
  is_active BOOLEAN DEFAULT true NOT NULL,
  content_type TEXT NOT NULL DEFAULT 'standalone',
  series_id TEXT REFERENCES series(id),
  episode_number INTEGER,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Create playlists table
CREATE TABLE IF NOT EXISTS playlists (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  video_ids JSONB DEFAULT '[]' NOT NULL,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

       -- Create view_history table
       CREATE TABLE IF NOT EXISTS view_history (
         id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
         user_id TEXT NOT NULL,
         video_id TEXT NOT NULL,
         watched_at TIMESTAMP DEFAULT NOW() NOT NULL,
         progress INTEGER DEFAULT 0 NOT NULL
       );
       
       -- Create admin_users table
       CREATE TABLE IF NOT EXISTS admin_users (
         id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
         email TEXT NOT NULL UNIQUE,
         display_name TEXT,
         role TEXT NOT NULL DEFAULT 'admin',
         is_active BOOLEAN DEFAULT true NOT NULL,
         created_at TIMESTAMP DEFAULT NOW() NOT NULL,
         last_login_at TIMESTAMP
       );

-- Function to increment video views
CREATE OR REPLACE FUNCTION increment_video_views(video_id TEXT)
RETURNS void AS $$
BEGIN
  UPDATE videos 
  SET views = views + 1 
  WHERE id = video_id;
END;
$$ LANGUAGE plpgsql;

-- Function to increment video likes
CREATE OR REPLACE FUNCTION increment_video_likes(video_id TEXT)
RETURNS void AS $$
BEGIN
  UPDATE videos 
  SET likes = likes + 1 
  WHERE id = video_id;
END;
$$ LANGUAGE plpgsql;

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE series ENABLE ROW LEVEL SECURITY;
ALTER TABLE playlists ENABLE ROW LEVEL SECURITY;
       ALTER TABLE view_history ENABLE ROW LEVEL SECURITY;
       ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access
DROP POLICY IF EXISTS "Public read access for videos" ON videos;
CREATE POLICY "Public read access for videos" ON videos
  FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "Public read access for series" ON series;
CREATE POLICY "Public read access for series" ON series
  FOR SELECT USING (is_active = true);

-- Create policies for authenticated users
DROP POLICY IF EXISTS "Users can manage their own playlists" ON playlists;
CREATE POLICY "Users can manage their own playlists" ON playlists
  FOR ALL USING (auth.uid()::text = user_id);

DROP POLICY IF EXISTS "Users can manage their own view history" ON view_history;
CREATE POLICY "Users can manage their own view history" ON view_history
  FOR ALL USING (auth.uid()::text = user_id);

DROP POLICY IF EXISTS "Users can manage their own profile" ON users;
CREATE POLICY "Users can manage their own profile" ON users
  FOR ALL USING (auth.uid()::text = supabase_uid);

-- Create policies for admin_users
DROP POLICY IF EXISTS "Admins can view all admin users" ON admin_users;
CREATE POLICY "Admins can view all admin users" ON admin_users
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Super admins can insert admin users" ON admin_users;
CREATE POLICY "Super admins can insert admin users" ON admin_users
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Super admins can update admin users" ON admin_users;
CREATE POLICY "Super admins can update admin users" ON admin_users
  FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Super admins can delete admin users" ON admin_users;
CREATE POLICY "Super admins can delete admin users" ON admin_users
  FOR DELETE USING (true);
`;

console.log(sqlCommands);

       console.log('\n📝 Instructions:');
       console.log('1. Go to your Supabase Dashboard');
       console.log('2. Navigate to SQL Editor');
       console.log('3. Copy and paste the above SQL commands');
       console.log('4. Click "Run" to execute the commands');
       console.log('5. After tables are created, run: npm run db:seed:direct');
       console.log('6. Run: npm run setup:admin to create admin user');
       console.log('\n✨ Once the tables are created, your SAANSE platform will be ready!');

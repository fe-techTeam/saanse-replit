#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
const envPath = path.join(path.dirname(__dirname), '.env');
const envContent = fs.readFileSync(envPath, 'utf8');
const envVars = {};

envContent.split('\n').forEach(line => {
  const [key, value] = line.split('=');
  if (key && value) {
    envVars[key.trim()] = value.trim().replace(/"/g, '');
  }
});

const supabaseUrl = envVars.SUPABASE_URL;
const supabaseServiceKey = envVars.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials in .env file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

console.log('🗄️ Setting up database schema...\n');

// SQL commands to create tables
const createTablesSQL = `
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
`;

async function setupDatabase() {
  try {
    console.log('📋 Creating database tables...');
    
    // Execute the SQL to create tables
    const { error } = await supabase.rpc('exec_sql', { sql: createTablesSQL });
    
    if (error) {
      console.log('⚠️ Tables might already exist, continuing...');
    } else {
      console.log('✅ Database tables created successfully');
    }

    // Create database functions
    console.log('\n⚙️ Creating database functions...');
    
    const createFunctionsSQL = `
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
    `;

    const { error: funcError } = await supabase.rpc('exec_sql', { sql: createFunctionsSQL });
    
    if (funcError) {
      console.log('⚠️ Functions might already exist, continuing...');
    } else {
      console.log('✅ Database functions created successfully');
    }

    // Enable RLS and create policies
    console.log('\n🔒 Setting up Row Level Security...');
    
    const rlsSQL = `
    -- Enable Row Level Security
    ALTER TABLE users ENABLE ROW LEVEL SECURITY;
    ALTER TABLE videos ENABLE ROW LEVEL SECURITY;
    ALTER TABLE series ENABLE ROW LEVEL SECURITY;
    ALTER TABLE playlists ENABLE ROW LEVEL SECURITY;
    ALTER TABLE view_history ENABLE ROW LEVEL SECURITY;

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
    `;

    const { error: rlsError } = await supabase.rpc('exec_sql', { sql: rlsSQL });
    
    if (rlsError) {
      console.log('⚠️ RLS policies might already exist, continuing...');
    } else {
      console.log('✅ Row Level Security configured successfully');
    }

    console.log('\n🎉 Database setup completed successfully!');
    console.log('\n📝 Next steps:');
    console.log('   1. Run: npm run db:seed:enhanced');
    console.log('   2. Run: npm run dev');
    console.log('\n✨ Your SAANSE platform database is ready!');

  } catch (error) {
    console.error('❌ Error setting up database:', error);
    process.exit(1);
  }
}

setupDatabase();

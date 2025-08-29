# 🚀 SAANSE Platform - Complete Setup Guide

## Overview
This guide will help you set up the SAANSE platform with Supabase, resolve all linter errors, and seed the database with comprehensive content.

## Prerequisites
- Node.js 18+ installed
- npm or yarn package manager
- A Supabase account (free tier works)

## Step 1: Install Dependencies

First, install all required dependencies:

```bash
npm install
```

This will install the Supabase client and resolve the import errors.

## Step 2: Create Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Sign up/Login and create a new project
3. Wait for the project to be created (takes 1-2 minutes)
4. Note down your project URL and API keys

## Step 3: Configure Environment Variables

Create a `.env` file in the root directory:

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY=your-anon-key-here

# Server-side Supabase (for database operations)
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# Server Configuration
PORT=3000
NODE_ENV=development
```

**Important**: Replace the placeholder values with your actual Supabase credentials.

## Step 4: Set Up Database Schema

Push the database schema to Supabase:

```bash
npm run db:push
```

## Step 5: Create Database Functions

Run these SQL commands in your Supabase SQL Editor:

```sql
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

-- Enable Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE series ENABLE ROW LEVEL SECURITY;
ALTER TABLE playlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE view_history ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access
CREATE POLICY "Public read access for videos" ON videos
  FOR SELECT USING (is_active = true);

CREATE POLICY "Public read access for series" ON series
  FOR SELECT USING (is_active = true);

-- Create policies for authenticated users
CREATE POLICY "Users can manage their own playlists" ON playlists
  FOR ALL USING (auth.uid()::text = user_id);

CREATE POLICY "Users can manage their own view history" ON view_history
  FOR ALL USING (auth.uid()::text = user_id);

CREATE POLICY "Users can manage their own profile" ON users
  FOR ALL USING (auth.uid()::text = supabase_uid);
```

## Step 6: Seed Database with Content

Choose one of the seeding options:

### Option A: Basic Seeding (Recommended for first time)
```bash
npm run db:seed
```

### Option B: Enhanced Seeding (All content from removed files)
```bash
npm run db:seed:enhanced
```

The enhanced seeding includes:
- **7 Complete Series**: Ramayana, Krishna, Mahabharata, Shiva, Hanuman, Ganesha, Devi
- **50+ Videos**: Mix of series episodes and standalone content
- **Categories**: Festivals, Bhajans, Explained content

## Step 7: Configure Authentication

1. Go to your Supabase Dashboard → Authentication → Settings
2. Enable Google OAuth provider
3. Add your Google OAuth credentials:
   - Client ID: Your Google OAuth client ID
   - Client Secret: Your Google OAuth client secret
4. Set redirect URL to: `http://localhost:3000/auth/callback` (for development)

## Step 8: Start Development Server

```bash
npm run dev
```

The application should now be running at `http://localhost:3000`

## Troubleshooting

### Common Issues and Solutions

#### 1. Supabase Import Errors
**Error**: `Cannot find module '@supabase/supabase-js'`

**Solution**: 
```bash
npm install @supabase/supabase-js
```

#### 2. Database Connection Errors
**Error**: `Failed to connect to database`

**Solution**:
- Verify your Supabase credentials in `.env`
- Check if your Supabase project is active
- Ensure the database schema is pushed: `npm run db:push`

#### 3. Authentication Errors
**Error**: `OAuth configuration error`

**Solution**:
- Verify Google OAuth credentials in Supabase dashboard
- Check redirect URL configuration
- Ensure OAuth provider is enabled

#### 4. Seeding Errors
**Error**: `Failed to seed database`

**Solution**:
- Check if database schema is properly set up
- Verify Supabase service role key has write permissions
- Try running `npm run db:push` first

#### 5. TypeScript Errors
**Error**: Various TypeScript compilation errors

**Solution**:
```bash
npm run check
```
Then fix any remaining type issues.

## Content Structure

### Series Content
- **Ramayana Series**: 10 episodes covering Rama's complete life
- **Krishna Leela Series**: 10 episodes covering Krishna's divine pastimes  
- **Mahabharata Series**: 5 episodes covering key events
- **Shiva Series**: 3 episodes covering Shiva's stories
- **Hanuman Series**: 3 episodes covering Hanuman's devotion
- **Ganesha Series**: 2 episodes covering Ganesha's stories
- **Devi Series**: 2 episodes covering divine mother's forms

### Standalone Content
- **Festivals**: Diwali, Holi, Janmashtami, Ganesha Chaturthi, Dussehra
- **Bhajans**: Hare Krishna, Ram Dhun, Hanuman Chalisa, Shiva Stotram, Gayatri Mantra
- **Explained**: Karma, Dharma, Moksha, Four Ages, Soul concepts

## API Endpoints

### Series
- `GET /api/series` - Get all series
- `GET /api/series/:id` - Get specific series
- `GET /api/series/:id/videos` - Get videos in a series

### Videos
- `GET /api/videos` - Get all videos
- `GET /api/videos/category/:category` - Get videos by category
- `GET /api/videos/search/:query` - Search videos

### Users
- `POST /api/users` - Create user
- `GET /api/users/supabase/:supabaseUid` - Get user by Supabase UID

## Development Commands

```bash
npm run dev              # Start development server
npm run build            # Build for production
npm run check            # Type checking
npm run db:push          # Push database schema
npm run db:seed          # Basic seeding
npm run db:seed:enhanced # Enhanced seeding
```

## Next Steps

1. **Frontend Development**: Update components to handle series/standalone content
2. **CMS Integration**: Add content management features
3. **Mobile App**: Extend to React Native
4. **Analytics**: Add user engagement tracking
5. **Performance**: Implement caching and optimization

## Support

If you encounter any issues:
1. Check the troubleshooting section above
2. Verify your Supabase configuration
3. Check the console for detailed error messages
4. Refer to the Supabase documentation: https://supabase.com/docs

## Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase Dashboard](https://app.supabase.com)
- [Migration Guide](README-SUPABASE-SETUP.md)
- [Cursor Rules](README-CURSOR-RULES.md)

---

**🎉 Congratulations! Your SAANSE platform is now ready to use with Supabase!**

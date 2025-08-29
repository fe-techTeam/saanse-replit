# SAANSE Platform - Supabase Migration Guide

## Overview

This guide covers the migration from Firebase Auth and in-memory storage to Supabase for both authentication and database operations.

## Changes Made

### 1. Authentication Migration
- **From**: Firebase Auth with Google OAuth
- **To**: Supabase Auth with Google OAuth
- **Files Updated**:
  - `client/src/lib/supabase.ts` (new)
  - `client/src/hooks/useAuth.ts`
  - Removed: `client/src/lib/firebase.ts`

### 2. Database Migration
- **From**: In-memory storage with static data
- **To**: Supabase PostgreSQL database
- **Files Updated**:
  - `server/storage.ts` (completely rewritten)
  - `shared/schema.ts` (added series support)
  - `server/routes.ts` (updated endpoints)
  - `server/content-data.ts` (new - structured content)
  - `server/seed-database.ts` (new - database seeding)

### 3. Content Structure
- **Series Content**: Episodic content like Ramayana, Krishna Leela, etc.
- **Standalone Content**: Individual videos like festivals, bhajans, etc.
- **Removed**: All Netflix references, renamed to SAANSE

## Setup Instructions

### 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Note down your project URL and API keys

### 2. Environment Variables

Create a `.env` file in the root directory:

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY=your-anon-key

# Server-side Supabase (for database operations)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Database Configuration (if using separate database)
DATABASE_URL=postgresql://username:password@host:port/database

# Server Configuration
PORT=3000
NODE_ENV=development
```

### 3. Database Schema Setup

1. Run database migrations:
```bash
npm run db:generate
npm run db:push
```

2. Seed the database with content:
```bash
npm run db:seed
```

### 4. Supabase Configuration

#### Authentication Setup
1. Go to Authentication > Settings in your Supabase dashboard
2. Enable Google OAuth provider
3. Add your Google OAuth credentials
4. Set redirect URL to: `https://your-domain.com/auth/callback`

#### Database Functions
Create these PostgreSQL functions in your Supabase SQL editor:

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
```

### 5. Install Dependencies

```bash
npm install
```

### 6. Start Development

```bash
npm run dev
```

## API Endpoints

### Series Endpoints
- `GET /api/series` - Get all series
- `GET /api/series/category/:category` - Get series by category
- `GET /api/series/:id` - Get specific series
- `GET /api/series/:id/videos` - Get videos in a series
- `POST /api/series` - Create new series
- `PATCH /api/series/:id` - Update series
- `DELETE /api/series/:id` - Delete series

### Video Endpoints
- `GET /api/videos` - Get all videos
- `GET /api/videos/category/:category` - Get videos by category
- `GET /api/videos/:id` - Get specific video
- `GET /api/videos/search/:query` - Search videos
- `POST /api/videos` - Create new video
- `PATCH /api/videos/:id` - Update video
- `DELETE /api/videos/:id` - Delete video
- `POST /api/videos/:id/views` - Increment view count
- `POST /api/videos/:id/likes` - Increment like count

### User Endpoints
- `POST /api/users` - Create user
- `GET /api/users/supabase/:supabaseUid` - Get user by Supabase UID

### Playlist Endpoints
- `GET /api/users/:userId/playlists` - Get user playlists
- `GET /api/playlists/:id` - Get specific playlist
- `POST /api/playlists` - Create playlist
- `PATCH /api/playlists/:id` - Update playlist
- `DELETE /api/playlists/:id` - Delete playlist

### View History Endpoints
- `GET /api/users/:userId/history` - Get user view history
- `POST /api/history` - Create view history
- `PATCH /api/history/:id` - Update view history
- `DELETE /api/history/:id` - Delete view history

## Content Structure

### Series Content
- **Ramayana Series**: 10 episodes covering Rama's complete life
- **Krishna Leela Series**: 10 episodes covering Krishna's divine pastimes
- **Mahabharata Series**: 10 episodes covering the great epic
- **Shiva Series**: 8 episodes covering Shiva's stories
- **Hanuman Series**: 8 episodes covering Hanuman's devotion
- **Ganesha Series**: 6 episodes covering Ganesha's stories
- **Devi Series**: 8 episodes covering divine mother's forms

### Standalone Content
- **Festivals**: Diwali, Holi, Janmashtami, etc.
- **Bhajans**: Devotional songs and chants
- **Explained**: Philosophical concepts and teachings

## Database Schema

### Tables
1. **users**: User authentication and profile data
2. **videos**: Video content with series/standalone classification
3. **series**: Series metadata and information
4. **playlists**: User-created video collections
5. **view_history**: User viewing history and progress

### Key Features
- **Content Type**: Videos can be 'standalone' or part of a 'series'
- **Episode Numbers**: Series videos have episode numbers for ordering
- **Series Relationships**: Videos link to series via seriesId
- **Soft Deletes**: Content is marked inactive rather than deleted

## Migration Notes

### Breaking Changes
1. **Authentication**: Firebase UID replaced with Supabase UID
2. **API Endpoints**: Updated to use Supabase UID instead of Firebase UID
3. **Content Structure**: Videos now support series/standalone classification
4. **Database**: All data now stored in PostgreSQL via Supabase

### Backward Compatibility
- User data needs to be migrated from Firebase to Supabase
- Existing playlists and view history need to be updated with new user IDs
- Content structure changes require frontend updates

## Troubleshooting

### Common Issues
1. **Authentication Errors**: Check Supabase OAuth configuration
2. **Database Connection**: Verify environment variables
3. **Content Not Loading**: Ensure database is seeded
4. **API Errors**: Check Supabase service role key permissions

### Debug Commands
```bash
# Check database connection
npm run db:push

# Seed database
npm run db:seed

# View database logs
# Check Supabase dashboard > Logs
```

## Next Steps

1. **Frontend Updates**: Update components to handle series/standalone content
2. **CMS Integration**: Add series management to admin panel
3. **Performance**: Implement caching and optimization
4. **Analytics**: Add user engagement tracking
5. **Mobile App**: Extend to React Native with Supabase

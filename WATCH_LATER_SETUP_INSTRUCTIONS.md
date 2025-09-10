# Watch Later Feature - Setup Instructions

## ✅ What's Been Implemented

I've successfully implemented the complete watch later feature with:

1. **Database Schema**: `watch_later` table with all necessary fields
2. **Backend API**: 7 REST endpoints for all watch later operations
3. **Frontend Components**: 
   - `WatchLaterButton` component (replaces "My List" buttons)
   - Updated Library page with watch later tab as default
   - Integration in NetflixHero, FeaturedBanner, NetflixRow, and VideoPlayer
4. **Custom Hook**: `useWatchLater` for state management
5. **Type Safety**: Complete TypeScript support

## 🔧 Setup Required

### Step 1: Run Database Migration

**You need to run this SQL in your Supabase dashboard:**

1. Go to your Supabase project dashboard
2. Navigate to the SQL Editor
3. Run the following SQL:

```sql
-- Migration: Create watch_later table
-- This table will replace the playlist-based watch later functionality with a dedicated, optimized table

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
```

### Step 2: Test the Feature

After running the migration:

1. **Start your development server**: `npm run dev`
2. **Navigate to the Library page**: Click the "Library" tab in the bottom navigation
3. **The "Watch Later" tab should be selected by default**
4. **Add videos to watch later**:
   - Go to the Home page
   - Hover over any video in the NetflixRow
   - Click the "Watch Later" button (clock icon)
   - Or click the "Watch Later" button in the hero section
5. **View your watch later list**:
   - Go to Library page
   - Click on "Watch Later" tab
   - You should see all your saved videos

## 🎯 Where to Find Watch Later Buttons

### 1. **Home Page Hero Section**
- Large "Watch Later" button next to "Play" and "More Info"

### 2. **Video Rows (NetflixRow)**
- Hover over any video card
- Click the clock icon button in the overlay

### 3. **Video Player**
- Click the clock icon in the top-right corner of the video player

### 4. **Library Page**
- Default tab is now "Watch Later"
- Shows all your saved videos with rich UI

## 🔍 Features You Can Test

### Adding Videos
1. Go to Home page
2. Hover over any video in the rows
3. Click the "Watch Later" button
4. Button should change to show "Added" with a checkmark

### Viewing Watch Later List
1. Go to Library page (bottom navigation)
2. "Watch Later" tab should be selected by default
3. See all your saved videos with:
   - Thumbnails
   - Titles and descriptions
   - Priority indicators (if set)
   - Notes (if added)
   - Action buttons (Play, Mark as Watched, Remove)

### Managing Videos
- **Play**: Click the "Play" button to watch
- **Mark as Watched**: Click the checkmark button
- **Remove**: Click the trash button
- **Priority**: Videos with higher priority appear first

## 🐛 Troubleshooting

### If Watch Later Tab is Empty
- Make sure you've run the database migration
- Check browser console for any errors
- Verify you're logged in

### If Buttons Don't Work
- Check if the database migration was successful
- Verify the API endpoints are working
- Check browser network tab for API errors

### If You See "My List" Instead of "Watch Later"
- Clear browser cache
- Restart the development server
- The changes should be visible immediately

## 📱 Mobile Testing

The watch later feature is fully responsive and works on:
- Mobile phones
- Tablets
- Desktop computers

## 🎉 Success Indicators

You'll know the feature is working when:
1. ✅ "Watch Later" buttons appear on videos
2. ✅ Clicking them adds videos to your list
3. ✅ Library page shows "Watch Later" tab by default
4. ✅ Your saved videos appear in the watch later list
5. ✅ You can play, mark as watched, and remove videos

## 📞 Need Help?

If you encounter any issues:
1. Check the browser console for errors
2. Verify the database migration was successful
3. Make sure you're logged in to the app
4. Check that the development server is running

The watch later feature is now fully implemented and ready to use! 🚀

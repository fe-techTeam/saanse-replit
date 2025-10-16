import { Express } from "express";
import { storage } from "./storage";
import { insertVideoSchema, insertUserSchema, insertPlaylistSchema, insertViewHistorySchema, insertSeriesSchema, insertWatchLaterSchema } from "@shared/schema";
import { z } from "zod";
import { registerAdminRoutes } from "./admin/admin-routes";
import { authenticateJWT, optionalAuth, requireDbUser, getDbUserId, getSupabaseUserId, AuthenticatedRequest } from "./middleware/auth";
import { whatsappOtpService } from "./services/whatsapp-otp";
import { reorderEpisodes } from "./services/series";
import { createClient } from '@supabase/supabase-js';

// Get configuration from environment variables
const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const supabase = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

// Helper function to get frontend URL with path
function getFrontendUrl(path: string = ''): string {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${BASE_URL}${cleanPath}`;
}

export async function registerRoutes(app: Express): Promise<void> {
  // Videos
  app.get("/api/videos", async (req, res) => {
    try {
      const videos = await storage.getVideos();
      res.json(videos);
    } catch (error) {
      console.error("Error fetching videos:", error);
      res.status(500).json({ 
        error: "Failed to fetch videos", 
        details: error instanceof Error ? error.message : String(error),
        stack: process.env.NODE_ENV === 'development' && error instanceof Error ? error.stack : undefined
      });
    }
  });

  app.get("/api/videos/category/:category", async (req, res) => {
    try {
      const { category } = req.params;
      const videos = await storage.getVideosByCategory(category);
      res.json(videos);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch videos by category" });
    }
  });

  app.get("/api/videos/search/:query", async (req, res) => {
    try {
      const { query } = req.params;
      const videos = await storage.searchVideos(query);
      res.json(videos);
    } catch (error) {
      res.status(500).json({ error: "Failed to search videos" });
    }
  });

  app.get("/api/videos/related", async (req, res) => {
    try {
      const { category, tags, exclude, limit } = req.query;
      
      console.log('Related videos API called with params:', { category, tags, exclude, limit });
      
      if (!category) {
        return res.status(400).json({ error: "Category parameter is required" });
      }
      
      const tagsArray = tags ? (tags as string).split(',').map(t => t.trim()).filter(t => t) : [];
      const excludeId = exclude as string;
      const limitNum = parseInt(limit as string) || 20;
      
      try {
        const relatedVideos = await storage.getRelatedVideos({
          category: category as string,
          tags: tagsArray,
          excludeId,
          limit: limitNum
        });
        
        console.log('Returning related videos:', relatedVideos.length);
        res.json(relatedVideos);
      } catch (relatedError) {
        console.error("Error in getRelatedVideos, falling back to all videos:", relatedError);
        
        // Fallback: just get any videos excluding the current one
        try {
          const allVideos = await storage.getVideos();
          const filteredVideos = allVideos
            .filter(video => video.id !== excludeId)
            .slice(0, limitNum);
          
          console.log('Fallback: returning', filteredVideos.length, 'videos');
          res.json(filteredVideos);
        } catch (fallbackError) {
          console.error("Fallback also failed:", fallbackError);
          res.json([]); // Return empty array as last resort
        }
      }
    } catch (error) {
      console.error("Error in related videos endpoint:", error);
      res.status(500).json({ 
        error: "Failed to fetch related videos",
        details: error instanceof Error ? error.message : String(error)
      });
    }
  });

  app.get("/api/videos/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const video = await storage.getVideoById(id);
      if (!video) {
        return res.status(404).json({ error: "Video not found" });
      }
      res.json(video);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch video" });
    }
  });

  // Helper to normalize field names to camelCase for validation
  function normalizeVideoFields(data: any) {
    return {
      ...data,
      // Convert snake_case to camelCase for validation
      thumbnailUrl: data.thumbnailUrl || data.thumbnail_url,
      videoUrl: data.videoUrl || data.video_url,
      seriesId: data.seriesId || data.series_id,
      episodeNumber: data.episodeNumber || data.episode_number,
      isActive: data.isActive !== undefined ? data.isActive : data.is_active
    };
  }

  app.post("/api/videos", async (req, res) => {
    try {
      // Normalize field names before validation
      const normalizedData = normalizeVideoFields(req.body);
      const videoData = insertVideoSchema.parse(normalizedData);
      const video = await storage.createVideo(videoData);
      res.status(201).json(video);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to create video" });
    }
  });

  app.patch("/api/videos/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const videoData = insertVideoSchema.partial().parse(req.body);
      const video = await storage.updateVideo(id, videoData);
      if (!video) {
        return res.status(404).json({ error: "Video not found" });
      }
      res.json(video);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to update video" });
    }
  });

  app.delete("/api/videos/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const success = await storage.deleteVideo(id);
      if (!success) {
        return res.status(404).json({ error: "Video not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete video" });
    }
  });

  app.post("/api/videos/:id/views", async (req, res) => {
    try {
      const { id } = req.params;
      await storage.incrementVideoViews(id);
      res.status(200).json({ message: "View count incremented" });
    } catch (error) {
      res.status(500).json({ error: "Failed to increment view count" });
    }
  });

  app.post("/api/videos/:id/likes", async (req, res) => {
    try {
      const { id } = req.params;
      await storage.incrementVideoLikes(id);
      res.status(200).json({ message: "Like count incremented" });
    } catch (error) {
      res.status(500).json({ error: "Failed to increment like count" });
    }
  });

  // Series
  app.get("/api/series", async (req, res) => {
    try {
      const series = await storage.getSeries();
      res.json(series);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch series" });
    }
  });

  app.get("/api/series/category/:category", async (req, res) => {
    try {
      const { category } = req.params;
      const series = await storage.getSeriesByCategory(category);
      res.json(series);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch series by category" });
    }
  });

  app.get("/api/series/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const series = await storage.getSeriesById(id);
      if (!series) {
        return res.status(404).json({ error: "Series not found" });
      }
      res.json(series);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch series" });
    }
  });

  app.get("/api/series/:id/videos", async (req, res) => {
    try {
      const { id } = req.params;
      const videos = await storage.getVideosBySeries(id);
      res.json(videos);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch series videos" });
    }
  });

  // Reorder episodes within a series
  app.patch("/api/series/:id/videos/reorder", async (req, res) => {
    console.log("=== REORDER ENDPOINT HIT ===");
    try {
      const { id } = req.params;
      const mappings = req.body as { videoId: string; episodeNumber: number }[];
      
      console.log("Reorder request received:", { id, mappings, timestamp: new Date().toISOString() });

      if (!Array.isArray(mappings)) {
        console.log("Invalid mappings - not an array");
        return res.status(400).json({ error: "Body must be array of {videoId, episodeNumber}" });
      }

      console.log("About to call reorderEpisodes...");
      const updated = await reorderEpisodes(id, mappings);
      console.log("Reorder completed successfully:", updated.length, "videos");
      res.json(updated);
    } catch (error: any) {
      console.error("=== REORDER ERROR ===", error);
      res.status(500).json({ 
        error: "Failed to reorder episodes", 
        details: error?.message || String(error),
        stack: error?.stack 
      });
    }
  });

  app.post("/api/series", async (req, res) => {
    try {
      const seriesData = insertSeriesSchema.parse(req.body);
      const series = await storage.createSeries(seriesData);
      res.status(201).json(series);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to create series" });
    }
  });

  app.patch("/api/series/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const seriesData = insertSeriesSchema.partial().parse(req.body);
      const series = await storage.updateSeries(id, seriesData);
      if (!series) {
        return res.status(404).json({ error: "Series not found" });
      }
      res.json(series);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to update series" });
    }
  });

  app.delete("/api/series/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const success = await storage.deleteSeries(id);
      if (!success) {
        return res.status(404).json({ error: "Series not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete series" });
    }
  });

  // Update episode counts for all series
  app.post("/api/series/update-counts", async (req, res) => {
    try {
      await storage.updateAllSeriesEpisodeCounts();
      res.json({ message: "Episode counts updated successfully" });
    } catch (error) {
      res.status(500).json({ error: "Failed to update episode counts" });
    }
  });

  // Update episode count for a specific series
  app.post("/api/series/:id/update-count", async (req, res) => {
    try {
      const { id } = req.params;
      await storage.updateSeriesEpisodeCount(id);
      res.json({ message: "Episode count updated successfully" });
    } catch (error) {
      res.status(500).json({ error: "Failed to update episode count" });
    }
  });

  // Users
  app.get("/api/users", authenticateJWT, async (req: AuthenticatedRequest, res) => {
    try {
      const users = await storage.getUsers();
      res.json(users);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch users" });
    }
  });

  app.post("/api/users", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(userData.email || '');
      if (existingUser) {
        return res.json(existingUser);
      }

      const user = await storage.createUser(userData);
      
      // Create default playlists
      await storage.createPlaylist({
        userId: user.id,
        name: "Favorites",
        type: "favorites",
        videoIds: []
      });
      
      await storage.createPlaylist({
        userId: user.id,
        name: "Watch Later",
        type: "watchLater", 
        videoIds: []
      });

      res.json(user);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      console.error("Error creating user:", error);
      res.status(500).json({ 
        error: "Failed to create user",
        details: error instanceof Error ? error.message : String(error)
      });
    }
  });

  // Public endpoint for checking if user exists (used during auth flow)
  app.get("/api/users/supabase/:supabaseUid", async (req, res) => {
    try {
      const { supabaseUid } = req.params;
      const user = await storage.getUserBySupabaseUid(supabaseUid);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch user" });
    }
  });

  // Protected endpoint for getting user profile (requires auth)
  app.get("/api/users/profile", authenticateJWT, requireDbUser, async (req: AuthenticatedRequest, res) => {
    try {
      const dbUser = req.dbUser;
      
      if (!dbUser) {
        return res.status(500).json({ error: "User context not available" });
      }
      
      res.json(dbUser);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch user" });
    }
  });

  // Playlists
  app.get("/api/users/:userId/playlists", authenticateJWT, requireDbUser, async (req: AuthenticatedRequest, res) => {
    try {
      const dbUserId = getDbUserId(req);
      
      if (!dbUserId) {
        return res.status(500).json({ error: "User context not available" });
      }
      
      // Use the authenticated user's database ID directly
      const playlists = await storage.getPlaylistsByUserId(dbUserId);
      res.json(playlists);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch playlists" });
    }
  });

  app.get("/api/playlists/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const playlist = await storage.getPlaylistById(id);
      if (!playlist) {
        return res.status(404).json({ error: "Playlist not found" });
      }
      res.json(playlist);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch playlist" });
    }
  });

  app.post("/api/playlists", async (req, res) => {
    try {
      const playlistData = insertPlaylistSchema.parse(req.body);
      const playlist = await storage.createPlaylist(playlistData);
      res.status(201).json(playlist);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to create playlist" });
    }
  });

  app.patch("/api/playlists/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const playlistData = insertPlaylistSchema.partial().parse(req.body);
      const playlist = await storage.updatePlaylist(id, playlistData);
      if (!playlist) {
        return res.status(404).json({ error: "Playlist not found" });
      }
      res.json(playlist);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to update playlist" });
    }
  });

  app.delete("/api/playlists/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const success = await storage.deletePlaylist(id);
      if (!success) {
        return res.status(404).json({ error: "Playlist not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete playlist" });
    }
  });

  // View History
  app.get("/api/users/:userId/history", authenticateJWT, requireDbUser, async (req: AuthenticatedRequest, res) => {
    try {
      const dbUserId = getDbUserId(req);
      
      if (!dbUserId) {
        return res.status(500).json({ error: "User context not available" });
      }
      
      // Use the authenticated user's database ID directly
      const history = await storage.getViewHistoryByUserId(dbUserId);
      res.json(history);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch view history" });
    }
  });

  app.post("/api/history", async (req, res) => {
    try {
      const historyData = insertViewHistorySchema.parse(req.body);
      const history = await storage.createViewHistory(historyData);
      res.status(201).json(history);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to create view history" });
    }
  });

  app.patch("/api/history/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const historyData = insertViewHistorySchema.partial().parse(req.body);
      const history = await storage.updateViewHistory(id, historyData);
      if (!history) {
        return res.status(404).json({ error: "View history not found" });
      }
      res.json(history);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to update view history" });
    }
  });

  app.delete("/api/history/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const success = await storage.deleteViewHistory(id);
      if (!success) {
        return res.status(404).json({ error: "View history not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete view history" });
    }
  });

  // Watch Later routes
  app.get("/api/users/:userId/watch-later", authenticateJWT, requireDbUser, async (req: AuthenticatedRequest, res) => {
    try {
      const dbUserId = getDbUserId(req);
      
      if (!dbUserId) {
        return res.status(500).json({ error: "User context not available" });
      }
      
      console.log("Fetching watch later for user:", dbUserId);
      const watchLater = await storage.getWatchLaterWithVideos(dbUserId);
      console.log("Found watch later items:", watchLater.length);
      
      res.json(watchLater);
    } catch (error) {
      console.error("Watch later fetch error:", error);
      res.status(500).json({ error: "Failed to fetch watch later list" });
    }
  });

app.post("/api/watch-later", authenticateJWT, requireDbUser, async (req: AuthenticatedRequest, res) => {
  try {
    const dbUserId = getDbUserId(req);
    
    if (!dbUserId) {
      return res.status(500).json({ error: "User context not available" });
    }

    // Parse the request body and override userId with the database user ID
    const watchLaterData = insertWatchLaterSchema.parse({
      ...req.body,
      userId: dbUserId // Use the database user ID from middleware
    });
    
    // Check if already exists before adding
    const existing = await storage.isInWatchLater(watchLaterData.userId, watchLaterData.videoId);
    if (existing) {
      return res.status(200).json({ 
        message: "Video is already in your Watch Later list",
        alreadyExists: true,
        watchLater: await storage.getWatchLaterByUserId(watchLaterData.userId)
      });
    }
    
    const watchLater = await storage.addToWatchLater(watchLaterData);
    res.status(201).json({ 
      message: "Video added to Watch Later list",
      alreadyExists: false,
      watchLater 
    });
  } catch (error) {
    console.error("Watch later error:", error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    if (error instanceof Error && error.message.includes('already in watch later')) {
      return res.status(409).json({ error: error.message });
    }
    res.status(500).json({ error: "Failed to add to watch later" });
  }
});

  app.delete("/api/watch-later/:userId/:videoId", authenticateJWT, requireDbUser, async (req: AuthenticatedRequest, res) => {
    try {
      const { videoId } = req.params;
      const dbUserId = getDbUserId(req);
      
      if (!dbUserId) {
        return res.status(500).json({ error: "User context not available" });
      }
      
      console.log("DELETE watch later request - videoId:", videoId, "dbUserId:", dbUserId);
      
      const success = await storage.removeFromWatchLater(dbUserId, videoId);
      console.log("Remove result:", success);
      
      if (!success) {
        return res.status(404).json({ error: "Video not found in watch later list" });
      }
      res.status(204).send();
    } catch (error) {
      console.error("Remove from watch later error:", error);
      res.status(500).json({ error: "Failed to remove from watch later" });
    }
  });

  app.patch("/api/watch-later/:id", authenticateJWT, async (req: AuthenticatedRequest, res) => {
    try {
      const { id } = req.params;
      const updates = insertWatchLaterSchema.partial().parse(req.body);
      
      const watchLater = await storage.updateWatchLater(id, updates);
      if (!watchLater) {
        return res.status(404).json({ error: "Watch later entry not found" });
      }
      res.json(watchLater);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to update watch later" });
    }
  });

  app.post("/api/watch-later/:userId/:videoId/mark-watched", authenticateJWT, requireDbUser, async (req: AuthenticatedRequest, res) => {
    try {
      const { videoId } = req.params;
      const dbUserId = getDbUserId(req);
      
      if (!dbUserId) {
        return res.status(500).json({ error: "User context not available" });
      }
      
      console.log("POST mark watched request - videoId:", videoId, "dbUserId:", dbUserId);
      
      const watchLater = await storage.markAsWatched(dbUserId, videoId);
      console.log("Mark watched result:", watchLater ? "success" : "not found");
      
      if (!watchLater) {
        return res.status(404).json({ error: "Video not found in watch later list" });
      }
      res.json(watchLater);
    } catch (error) {
      console.error("Mark as watched error:", error);
      res.status(500).json({ error: "Failed to mark as watched" });
    }
  });

  app.patch("/api/watch-later/:userId/:videoId/progress", authenticateJWT, requireDbUser, async (req: AuthenticatedRequest, res) => {
    try {
      const { videoId } = req.params;
      const { progress } = req.body;
      const dbUserId = getDbUserId(req);
      
      if (!dbUserId) {
        return res.status(500).json({ error: "User context not available" });
      }
      
      if (typeof progress !== 'number' || progress < 0) {
        return res.status(400).json({ error: "Invalid progress value" });
      }
      
      const watchLater = await storage.updateWatchProgress(dbUserId, videoId, progress);
      if (!watchLater) {
        return res.status(404).json({ error: "Video not found in watch later list" });
      }
      res.json(watchLater);
    } catch (error) {
      console.error("Update progress error:", error);
      res.status(500).json({ error: "Failed to update progress" });
    }
  });

  app.get("/api/watch-later/:userId/:videoId/status", authenticateJWT, requireDbUser, async (req: AuthenticatedRequest, res) => {
    try {
      const { videoId } = req.params;
      const dbUserId = getDbUserId(req);
      
      if (!dbUserId) {
        return res.status(500).json({ error: "User context not available" });
      }
      
      const isInWatchLater = await storage.isInWatchLater(dbUserId, videoId);
      res.json({ isInWatchLater });
    } catch (error) {
      console.error("Check watch later status error:", error);
      res.status(500).json({ error: "Failed to check watch later status" });
    }
  });

  // WhatsApp OTP Authentication Routes
  app.post("/api/auth/send-otp", async (req, res) => {
    try {
      const { mobileNumber } = req.body;
      
      if (!mobileNumber) {
        return res.status(400).json({ error: "Mobile number is required" });
      }

      const result = await whatsappOtpService.sendOtp(mobileNumber);
      
      if (result.success) {
        res.json({ 
          success: true, 
          message: result.message,
          otpId: result.otpId 
        });
      } else {
        res.status(400).json({ 
          success: false, 
          error: result.message 
        });
      }
    } catch (error) {
      console.error("Send OTP error:", error);
      res.status(500).json({ 
        success: false, 
        error: "Failed to send OTP" 
      });
    }
  });

  app.get("/api/auth/verify-otp", async (req, res) => {
    try {
      const { otp, mobile } = req.query;
      
      console.log('Verify OTP request:', { otp, mobile });
      
      if (!otp || !mobile) {
        console.log('Missing OTP or mobile number');
        return res.status(400).json({ 
          success: false, 
          error: "OTP and mobile number are required" 
        });
      }

      const result = await whatsappOtpService.verifyOtpFromQuery(
        otp as string, 
        mobile as string
      );
      
      console.log('Verification result:', result);
      
      if (result.success) {
        // Redirect to frontend with success token
        const redirectUrl = getFrontendUrl(`/auth/success?token=${result.token}&user=${encodeURIComponent(JSON.stringify(result.user))}`);
        console.log('Redirecting to success:', redirectUrl);
        res.redirect(redirectUrl);
      } else {
        // Redirect to frontend with error
        const redirectUrl = getFrontendUrl(`/auth/error?message=${encodeURIComponent(result.message)}`);
        console.log('Redirecting to error:', redirectUrl);
        res.redirect(redirectUrl);
      }
    } catch (error) {
      console.error("Verify OTP error:", error);
      const redirectUrl = getFrontendUrl(`/auth/error?message=${encodeURIComponent('Failed to verify OTP')}`);
      res.redirect(redirectUrl);
    }
  });

  // Cleanup expired OTPs (can be called by cron job)
  app.post("/api/auth/cleanup-otps", async (req, res) => {
    try {
      await whatsappOtpService.cleanupExpiredOtps();
      res.json({ success: true, message: "Expired OTPs cleaned up" });
    } catch (error) {
      console.error("Cleanup OTPs error:", error);
      res.status(500).json({ 
        success: false, 
        error: "Failed to cleanup OTPs" 
      });
    }
  });

  // Debug endpoint to get latest unused OTP (for testing only)
  app.get("/api/auth/debug/latest-otp", async (req, res) => {
    try {
      // First try to get the latest unused, non-expired OTP
      const now = new Date();
      console.log('Debug endpoint - Current time:', now.toISOString());
      
      const { data: validOtp, error: validError } = await supabase
        .from('otp_verifications')
        .select('*')
        .eq('is_used', false)
        .gt('expires_at', now.toISOString())
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (validOtp && !validError) {
        // Handle timezone properly - ensure we're working with UTC
        const expiresAt = new Date(validOtp.expires_at + (validOtp.expires_at.includes('Z') ? '' : 'Z'));
        const timeLeft = Math.max(0, Math.floor((expiresAt.getTime() - now.getTime()) / 1000));
        
        console.log('Valid OTP found - Current time:', now.toISOString());
        console.log('Valid OTP found - Expires at (raw):', validOtp.expires_at);
        console.log('Valid OTP found - Expires at (parsed):', expiresAt.toISOString());
        console.log('Valid OTP found - Current timestamp:', now.getTime());
        console.log('Valid OTP found - Expires timestamp:', expiresAt.getTime());
        console.log('Valid OTP found - Time difference (ms):', expiresAt.getTime() - now.getTime());
        console.log('Valid OTP found - Time left (seconds):', timeLeft);

        return res.json({ 
          success: true, 
          otp: validOtp.otp,
          mobile: validOtp.mobile_number,
          expires: validOtp.expires_at,
          used: validOtp.is_used,
          expired: false,
          timeLeft
        });
      }

      // If no valid OTP found, get the latest OTP regardless of status
      const { data, error } = await supabase
        .from('otp_verifications')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error) {
        console.error("Debug OTP error:", error);
        return res.status(500).json({ error: "Failed to get latest OTP" });
      }

      const currentTime = new Date();
      const expiresAt = new Date(data.expires_at + (data.expires_at.includes('Z') ? '' : 'Z'));
      const isExpired = currentTime > expiresAt;
      
      console.log('Debug - Current time:', currentTime.toISOString());
      console.log('Debug - Expires at:', expiresAt.toISOString());
      console.log('Debug - Is expired:', isExpired);
      console.log('Debug - Time difference (ms):', expiresAt.getTime() - currentTime.getTime());

      res.json({ 
        success: true, 
        otp: data.otp,
        mobile: data.mobile_number,
        expires: data.expires_at,
        used: data.is_used,
        expired: isExpired,
        timeLeft: isExpired ? 0 : Math.max(0, Math.floor((expiresAt.getTime() - currentTime.getTime()) / 1000))
      });
    } catch (error) {
      console.error("Debug OTP error:", error);
      res.status(500).json({ error: "Failed to get latest OTP" });
    }
  });

  // Register admin routes
  await registerAdminRoutes(app);
}

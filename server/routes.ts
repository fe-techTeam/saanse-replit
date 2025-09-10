import { Express } from "express";
import { storage } from "./storage";
import { insertVideoSchema, insertUserSchema, insertPlaylistSchema, insertViewHistorySchema, insertSeriesSchema } from "@shared/schema";
import { z } from "zod";
import { registerAdminRoutes } from "./admin/admin-routes";
import { authenticateJWT, optionalAuth, AuthenticatedRequest } from "./middleware/auth";

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
      contentType: data.contentType || data.content_type,
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
  app.get("/api/users/profile", authenticateJWT, async (req: AuthenticatedRequest, res) => {
    try {
      const user = await storage.getUserBySupabaseUid(req.user!.id);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch user" });
    }
  });

  // Playlists
  app.get("/api/users/:userId/playlists", authenticateJWT, async (req: AuthenticatedRequest, res) => {
    try {
      const { userId } = req.params;
      
      // Get user by database ID to check against authenticated user
      const requestedUser = await storage.getUserById(userId);
      if (!requestedUser || requestedUser.supabaseUid !== req.user!.id) {
        return res.status(403).json({ error: "Access denied" });
      }
      
      const playlists = await storage.getPlaylistsByUserId(userId);
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
  app.get("/api/users/:userId/history", authenticateJWT, async (req: AuthenticatedRequest, res) => {
    try {
      const { userId } = req.params;
      
      // Get user by database ID to check against authenticated user
      const requestedUser = await storage.getUserById(userId);
      if (!requestedUser || requestedUser.supabaseUid !== req.user!.id) {
        return res.status(403).json({ error: "Access denied" });
      }
      
      const history = await storage.getViewHistoryByUserId(userId);
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

  // Register admin routes
  await registerAdminRoutes(app);
}

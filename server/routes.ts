import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema, insertPlaylistSchema, insertViewHistorySchema, insertVideoSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Videos
  app.get("/api/videos", async (req, res) => {
    try {
      const videos = await storage.getVideos();
      res.json(videos);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch videos" });
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

  app.get("/api/videos/search", async (req, res) => {
    try {
      const { q } = req.query;
      if (!q || typeof q !== 'string') {
        return res.status(400).json({ error: "Query parameter 'q' is required" });
      }
      const videos = await storage.searchVideos(q);
      res.json(videos);
    } catch (error) {
      res.status(500).json({ error: "Failed to search videos" });
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

  app.post("/api/videos/:id/view", async (req, res) => {
    try {
      const { id } = req.params;
      const video = await storage.getVideoById(id);
      if (video) {
        await storage.updateVideo(id, { views: video.views + 1 });
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to increment video views" });
    }
  });

  app.post("/api/videos/:id/like", async (req, res) => {
    try {
      const { id } = req.params;
      const video = await storage.getVideoById(id);
      if (video) {
        await storage.updateVideo(id, { likes: video.likes + 1 });
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to like video" });
    }
  });

  // CMS Video Management Routes
  app.post("/api/videos", async (req, res) => {
    try {
      const validatedData = insertVideoSchema.parse(req.body);
      const video = await storage.createVideo(validatedData);
      res.status(201).json(video);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to create video" });
    }
  });

  app.patch("/api/videos/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const updateVideoSchema = insertVideoSchema.partial();
      const validatedData = updateVideoSchema.parse(req.body);
      const video = await storage.updateVideo(id, validatedData);
      if (!video) {
        return res.status(404).json({ error: "Video not found" });
      }
      res.json(video);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid data", details: error.errors });
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

  // Users
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
      res.status(500).json({ error: "Failed to create user" });
    }
  });

  app.get("/api/users/firebase/:firebaseUid", async (req, res) => {
    try {
      const { firebaseUid } = req.params;
      const user = await storage.getUserById(firebaseUid);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch user" });
    }
  });

  // Playlists
  app.get("/api/users/:userId/playlists", async (req, res) => {
    try {
      const { userId } = req.params;
      const playlists = await storage.getPlaylistsByUserId(userId);
      res.json(playlists);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch playlists" });
    }
  });

  app.post("/api/playlists", async (req, res) => {
    try {
      const playlistData = insertPlaylistSchema.parse(req.body);
      const playlist = await storage.createPlaylist(playlistData);
      res.json(playlist);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to create playlist" });
    }
  });

  app.post("/api/playlists/:playlistId/videos/:videoId", async (req, res) => {
    try {
      const { playlistId, videoId } = req.params;
      const playlist = await storage.getPlaylistById(playlistId);
      if (playlist && !playlist.videoIds.includes(videoId)) {
        await storage.updatePlaylist(playlistId, { 
          videoIds: [...playlist.videoIds, videoId] 
        });
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to add video to playlist" });
    }
  });

  app.delete("/api/playlists/:playlistId/videos/:videoId", async (req, res) => {
    try {
      const { playlistId, videoId } = req.params;
      const playlist = await storage.getPlaylistById(playlistId);
      if (playlist) {
        await storage.updatePlaylist(playlistId, { 
          videoIds: playlist.videoIds.filter(id => id !== videoId) 
        });
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to remove video from playlist" });
    }
  });

  // View History
  app.get("/api/users/:userId/history", async (req, res) => {
    try {
      const { userId } = req.params;
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
      res.json(history);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to add to view history" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

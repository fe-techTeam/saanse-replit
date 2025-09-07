import { Express } from "express";
import { storage } from "../storage";
import { AdminAuthService } from "./admin-auth";
import { z } from "zod";

// Admin authentication middleware
const adminAuthMiddleware = async (req: any, res: any, next: any) => {
  try {
    const adminId = req.headers['x-admin-id'];
    const adminToken = req.headers['x-admin-token'];

    if (!adminId || !adminToken) {
      return res.status(401).json({ error: "Admin authentication required" });
    }

    const admin = await AdminAuthService.getAdminById(adminId);
    if (!admin) {
      return res.status(401).json({ error: "Invalid admin credentials" });
    }

    // Simple token validation (in production, use proper JWT)
    if (adminToken !== `admin-token-${adminId}`) {
      return res.status(401).json({ error: "Invalid admin token" });
    }

    req.admin = admin;
    next();
  } catch (error) {
    res.status(401).json({ error: "Authentication failed" });
  }
};

export async function registerAdminRoutes(app: Express): Promise<void> {
  // Admin authentication
  app.post("/api/admin/login", async (req, res) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ error: "Email and password required" });
      }

      const admin = await AdminAuthService.verifyAdmin(email, password);
      if (!admin) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      // Generate simple token (in production, use JWT)
      const token = `admin-token-${admin.id}`;

      res.json({
        admin: {
          id: admin.id,
          email: admin.email,
          displayName: admin.displayName,
          role: admin.role
        },
        token
      });
    } catch (error) {
      res.status(500).json({ error: "Login failed" });
    }
  });

  // Get admin profile
  app.get("/api/admin/profile", adminAuthMiddleware, async (req, res) => {
    try {
      res.json({ admin: req.admin });
    } catch (error) {
      res.status(500).json({ error: "Failed to get profile" });
    }
  });

  // Admin users management
  app.get("/api/admin/users", adminAuthMiddleware, async (req, res) => {
    try {
      const users = await storage.getUsers();
      res.json(users);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch users" });
    }
  });

  app.post("/api/admin/users", adminAuthMiddleware, async (req, res) => {
    try {
      const userData = req.body;
      const user = await storage.createUser(userData);
      res.status(201).json(user);
    } catch (error) {
      res.status(500).json({ error: "Failed to create user" });
    }
  });

  app.patch("/api/admin/users/:id", adminAuthMiddleware, async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      const user = await storage.updateUser(id, updates);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ error: "Failed to update user" });
    }
  });

  app.delete("/api/admin/users/:id", adminAuthMiddleware, async (req, res) => {
    try {
      const { id } = req.params;
      const success = await storage.deleteUser(id);
      if (!success) {
        return res.status(404).json({ error: "User not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete user" });
    }
  });

  // Admin users management
  app.get("/api/admin/admins", adminAuthMiddleware, async (req, res) => {
    try {
      const admins = await AdminAuthService.getAllAdmins();
      res.json(admins);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch admins" });
    }
  });

  app.post("/api/admin/admins", adminAuthMiddleware, async (req, res) => {
    try {
      // Only super admins can create new admins
      if (req.admin.role !== 'super_admin') {
        return res.status(403).json({ error: "Insufficient permissions" });
      }

      const adminData = req.body;
      const admin = await AdminAuthService.createAdmin(adminData);
      if (!admin) {
        return res.status(500).json({ error: "Failed to create admin" });
      }
      res.status(201).json(admin);
    } catch (error) {
      res.status(500).json({ error: "Failed to create admin" });
    }
  });

  app.patch("/api/admin/admins/:id", adminAuthMiddleware, async (req, res) => {
    try {
      // Only super admins can update admins
      if (req.admin.role !== 'super_admin') {
        return res.status(403).json({ error: "Insufficient permissions" });
      }

      const { id } = req.params;
      const updates = req.body;
      const admin = await AdminAuthService.updateAdmin(id, updates);
      if (!admin) {
        return res.status(404).json({ error: "Admin not found" });
      }
      res.json(admin);
    } catch (error) {
      res.status(500).json({ error: "Failed to update admin" });
    }
  });

  app.delete("/api/admin/admins/:id", adminAuthMiddleware, async (req, res) => {
    try {
      // Only super admins can delete admins
      if (req.admin.role !== 'super_admin') {
        return res.status(403).json({ error: "Insufficient permissions" });
      }

      const { id } = req.params;
      const success = await AdminAuthService.deleteAdmin(id);
      if (!success) {
        return res.status(404).json({ error: "Admin not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete admin" });
    }
  });

  // Enhanced video management
  app.get("/api/admin/videos", adminAuthMiddleware, async (req, res) => {
    try {
      const videos = await storage.getVideos();
      res.json(videos);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch videos" });
    }
  });

  app.post("/api/admin/videos", adminAuthMiddleware, async (req, res) => {
    try {
      const videoData = req.body;
      
      // Use snake_case field names as expected by database
      const transformedData = {
        title: videoData.title,
        description: videoData.description,
        category: videoData.category,
        duration: videoData.duration,
        thumbnail_url: videoData.thumbnail_url,
        video_url: videoData.video_url,
        tags: videoData.tags,
        is_active: videoData.is_active,
        content_type: videoData.content_type,
        series_id: videoData.series_id || null,
        episode_number: videoData.episode_number || null,
      };
      
      const video = await storage.createVideo(transformedData);
      res.status(201).json(video);
    } catch (error) {
      console.error("Video creation error:", error);
      res.status(500).json({ error: "Failed to create video", details: error.message });
    }
  });

  app.patch("/api/admin/videos/:id", adminAuthMiddleware, async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      const video = await storage.updateVideo(id, updates);
      if (!video) {
        return res.status(404).json({ error: "Video not found" });
      }
      res.json(video);
    } catch (error) {
      res.status(500).json({ error: "Failed to update video" });
    }
  });

  app.delete("/api/admin/videos/:id", adminAuthMiddleware, async (req, res) => {
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

  // Series management
  app.get("/api/admin/series", adminAuthMiddleware, async (req, res) => {
    try {
      const series = await storage.getSeries();
      res.json(series);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch series" });
    }
  });

  app.post("/api/admin/series", adminAuthMiddleware, async (req, res) => {
    try {
      const seriesData = req.body;
      const series = await storage.createSeries(seriesData);
      res.status(201).json(series);
    } catch (error) {
      res.status(500).json({ error: "Failed to create series" });
    }
  });

  app.patch("/api/admin/series/:id", adminAuthMiddleware, async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      const series = await storage.updateSeries(id, updates);
      if (!series) {
        return res.status(404).json({ error: "Series not found" });
      }
      res.json(series);
    } catch (error) {
      res.status(500).json({ error: "Failed to update series" });
    }
  });

  app.delete("/api/admin/series/:id", adminAuthMiddleware, async (req, res) => {
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

  // Analytics
  app.get("/api/admin/analytics", adminAuthMiddleware, async (req, res) => {
    try {
      const videos = await storage.getVideos();
      const users = await storage.getUsers();
      const series = await storage.getSeries();

      const analytics = {
        totalVideos: videos.length,
        totalUsers: users.length,
        totalSeries: series.length,
        totalViews: videos.reduce((sum, video) => sum + video.views, 0),
        totalLikes: videos.reduce((sum, video) => sum + video.likes, 0),
        categoryStats: videos.reduce((acc, video) => {
          acc[video.category] = (acc[video.category] || 0) + 1;
          return acc;
        }, {} as Record<string, number>),
        topVideos: [...videos]
          .sort((a, b) => b.views - a.views)
          .slice(0, 10),
        recentVideos: [...videos]
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          .slice(0, 5),
        recentUsers: [...users]
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          .slice(0, 5)
      };

      res.json(analytics);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch analytics" });
    }
  });

  // Dashboard stats
  app.get("/api/admin/dashboard", adminAuthMiddleware, async (req, res) => {
    try {
      const videos = await storage.getVideos();
      const users = await storage.getUsers();
      const series = await storage.getSeries();

      const stats = {
        totalVideos: videos.length,
        totalUsers: users.length,
        totalSeries: series.length,
        totalViews: videos.reduce((sum, video) => sum + video.views, 0),
        totalLikes: videos.reduce((sum, video) => sum + video.likes, 0),
        activeVideos: videos.filter(v => v.isActive).length,
        recentUsers: users.slice(0, 5),
        recentVideos: videos.slice(0, 5)
      };

      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch dashboard stats" });
    }
  });

  // Content Moderation Routes
  app.get("/api/admin/moderation/reports", adminAuthMiddleware, async (req, res) => {
    try {
      // Mock data for now - in real app, this would come from database
      const reports = [
        {
          id: "1",
          contentId: "video-1",
          contentType: "video",
          contentTitle: "Krishna Leela - Part 1",
          contentUrl: "https://example.com/video1",
          reportedBy: "user123",
          reportedAt: "2024-01-15T10:30:00Z",
          reason: "Inappropriate content",
          description: "This video contains content that may not be suitable for all audiences",
          status: "pending"
        }
      ];
      res.json(reports);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch reports" });
    }
  });

  app.post("/api/admin/moderation/:reportId/action", adminAuthMiddleware, async (req, res) => {
    try {
      const { reportId } = req.params;
      const { action, notes } = req.body;

      // Mock action processing - in real app, this would update database
      console.log(`Moderation action: ${action} on report ${reportId}`, { notes });

      res.json({ success: true, message: "Moderation action completed" });
    } catch (error) {
      res.status(500).json({ error: "Failed to process moderation action" });
    }
  });

  // Settings Management
  app.get("/api/admin/settings", adminAuthMiddleware, async (req, res) => {
    try {
      // Mock settings - in real app, this would come from database
      const settings = {
        siteName: "SAANSE",
        siteDescription: "Divine Stories Platform",
        siteUrl: "https://saanse.app",
        contactEmail: "admin@saanse.app",
        maintenanceMode: false,
        allowRegistration: true,
        requireEmailVerification: true,
        maxVideoDuration: 600,
        maxVideoSize: 100,
        allowedVideoFormats: ["mp4", "webm", "avi", "mov"],
        maxUploadsPerDay: 10,
        emailNotifications: true,
        autoApproveVideos: false,
        enableComments: true,
        enableLikes: true,
        enableSharing: true,
        defaultLanguage: "en",
        supportedLanguages: ["en", "hi", "gu", "mr"],
        analyticsEnabled: true,
        backupEnabled: true,
        backupFrequency: "daily"
      };
      res.json(settings);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch settings" });
    }
  });

  app.patch("/api/admin/settings", adminAuthMiddleware, async (req, res) => {
    try {
      const updates = req.body;
      
      // Mock settings update - in real app, this would update database
      console.log("Settings updated:", updates);

      res.json({ success: true, message: "Settings updated successfully" });
    } catch (error) {
      res.status(500).json({ error: "Failed to update settings" });
    }
  });

  // Bulk Operations
  app.post("/api/admin/videos/bulk", adminAuthMiddleware, async (req, res) => {
    try {
      const { action, videoIds } = req.body;

      switch (action) {
        case "activate":
          for (const id of videoIds) {
            await storage.updateVideo(id, { isActive: true });
          }
          break;
        case "deactivate":
          for (const id of videoIds) {
            await storage.updateVideo(id, { isActive: false });
          }
          break;
        case "delete":
          for (const id of videoIds) {
            await storage.deleteVideo(id);
          }
          break;
        default:
          return res.status(400).json({ error: "Invalid action" });
      }

      res.json({ success: true, message: `Bulk ${action} completed` });
    } catch (error) {
      res.status(500).json({ error: "Failed to process bulk operation" });
    }
  });

  // Search and Filter
  app.get("/api/admin/search", adminAuthMiddleware, async (req, res) => {
    try {
      const { q, type, category, status } = req.query;
      
      let results = [];
      
      if (type === "videos" || !type) {
        const videos = await storage.getVideos();
        results = videos.filter(video => {
          const matchesQuery = !q || 
            video.title.toLowerCase().includes(q.toString().toLowerCase()) ||
            video.description?.toLowerCase().includes(q.toString().toLowerCase());
          const matchesCategory = !category || video.category === category;
          const matchesStatus = !status || 
            (status === "active" && video.isActive) ||
            (status === "inactive" && !video.isActive);
          
          return matchesQuery && matchesCategory && matchesStatus;
        });
      }

      res.json(results);
    } catch (error) {
      res.status(500).json({ error: "Failed to search" });
    }
  });

  // Export Data
  app.get("/api/admin/export/:type", adminAuthMiddleware, async (req, res) => {
    try {
      const { type } = req.params;
      
      let data;
      switch (type) {
        case "videos":
          data = await storage.getVideos();
          break;
        case "users":
          data = await storage.getUsers();
          break;
        case "analytics":
          const videos = await storage.getVideos();
          const users = await storage.getUsers();
          data = {
            videos: videos.length,
            users: users.length,
            totalViews: videos.reduce((sum, v) => sum + v.views, 0),
            totalLikes: videos.reduce((sum, v) => sum + v.likes, 0),
            categoryStats: videos.reduce((acc, v) => {
              acc[v.category] = (acc[v.category] || 0) + 1;
              return acc;
            }, {} as Record<string, number>)
          };
          break;
        default:
          return res.status(400).json({ error: "Invalid export type" });
      }

      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename="${type}-export-${new Date().toISOString().split('T')[0]}.json"`);
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: "Failed to export data" });
    }
  });
}

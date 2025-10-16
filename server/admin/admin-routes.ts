import { Express } from "express";
import { storage } from "../storage";
import { AdminAuthService } from "./admin-auth";
import { z } from "zod";
import { upload, uploadVideoToCloudinary, getVideoStreamingUrls, deleteVideoFromCloudinary } from "../cloudinary";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

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

  // Video upload endpoint with Cloudinary integration
  app.post("/api/admin/videos/upload", adminAuthMiddleware, (req, res, next) => {
    // Set timeout for this specific route to 10 minutes
    req.setTimeout(600000);
    res.setTimeout(600000);
    
    // Handle multer upload with custom error handling
    upload.single('video')(req, res, (err) => {
      if (err) {
        console.error('Multer upload error:', err);
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(413).json({ 
            error: 'File too large', 
            details: 'Maximum file size is 500MB' 
          });
        }
        if (err.code === 'INVALID_FILE_TYPE') {
          return res.status(400).json({ 
            error: 'Invalid file type', 
            details: 'Only video files are allowed' 
          });
        }
        return res.status(500).json({ 
          error: 'Upload failed', 
          details: err.message 
        });
      }
      next();
    });
  }, async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No video file provided" });
      }

      const {
        title,
        description,
        category,
        tags,
        series_id,
        episode_number,
        content_type = 'standalone',
        is_active = true,
        format_options = 'all' // 'hls', 'mp4', 'webm', 'all'
      } = req.body;

      // Debug: Log what we received
      console.log('Upload request body:', req.body);
      console.log('Extracted values:', { title, category, series_id, episode_number });

      // Validation
      if (!title) {
        console.log('Validation failed: title missing');
        return res.status(400).json({ error: "Title is required" });
      }
      
      if (!series_id || !episode_number) {
        return res.status(400).json({ error: "Series ID and episode number are required" });
      }

      // Get series to derive category if needed
      let finalCategory = category;
      if (!finalCategory && series_id) {
        try {
          const series = await storage.getSeriesById(series_id);
          if (series && series.category) {
            finalCategory = series.category;
            console.log(`Auto-populated category from series: ${finalCategory}`);
          } else {
            // Default fallback category
            finalCategory = 'general';
            console.log('Using default category: general');
          }
        } catch (error) {
          console.error('Error getting series for category:', error);
          finalCategory = 'general'; // Fallback
        }
      }
      
      // Ensure we always have a category value
      if (!finalCategory) {
        finalCategory = 'general';
        console.log('Using fallback category: general');
      }

      // Enhanced Cloudinary upload configuration with eager transformations
      const uploadOptions: any = {
        folder: 'mythosstream-videos',
        resource_type: 'video',
        // Pre-generate streaming formats during upload
        eager: [
          // HLS streaming formats
          { format: 'm3u8' }, // Generate HLS manifest
          // DASH streaming format
          { format: 'mpd' }, // Generate DASH manifest
          // MP4 variants for fallback
          { 
            width: 1280, 
            height: 720, 
            crop: 'limit', 
            quality: 'auto:good',
            format: 'mp4',
            video_codec: 'h264',
            audio_codec: 'aac'
          },
          { 
            width: 854, 
            height: 480, 
            crop: 'limit', 
            quality: 'auto:good',
            format: 'mp4',
            video_codec: 'h264',
            audio_codec: 'aac'
          },
          { 
            width: 640, 
            height: 360, 
            crop: 'limit', 
            quality: 'auto:good',
            format: 'mp4',
            video_codec: 'h264',
            audio_codec: 'aac'
          },
          // WebM variants for modern browsers
          { 
            width: 1280, 
            height: 720, 
            crop: 'limit', 
            quality: 'auto:good',
            format: 'webm',
            video_codec: 'vp9',
            audio_codec: 'vorbis'
          },
          { 
            width: 854, 
            height: 480, 
            crop: 'limit', 
            quality: 'auto:good',
            format: 'webm',
            video_codec: 'vp9',
            audio_codec: 'vorbis'
          }
        ],
        eager_async: true, // Process transformations asynchronously for faster upload response
        // Webhook URL for transformation completion notifications
        eager_notification_url: `${process.env.BASE_URL || 'http://localhost:5000'}/api/admin/cloudinary/webhook`
      };

      console.log('Starting Cloudinary upload for file:', req.file?.originalname, 'size:', req.file?.size);
      
      // Upload to Cloudinary with timeout handling
      const cloudinaryResult = await Promise.race([
        uploadVideoToCloudinary(req.file, uploadOptions),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Cloudinary upload timeout after 8 minutes')), 480000)
        )
      ]) as any;

      console.log('Cloudinary upload successful:', cloudinaryResult.public_id);

      // Generate streaming URLs (using eager transformations when available)
      const streamingUrls = getVideoStreamingUrls(cloudinaryResult.public_id, cloudinaryResult);

      // Prepare cloudinary metadata
      const cloudinaryMeta = {
        public_id: cloudinaryResult.public_id,
        duration: cloudinaryResult.duration,
        width: cloudinaryResult.width,
        height: cloudinaryResult.height,
        format: cloudinaryResult.format,
        bytes: cloudinaryResult.bytes,
        bit_rate: cloudinaryResult.bit_rate,
        frame_rate: cloudinaryResult.frame_rate,
        video_codec: cloudinaryResult.video_codec,
        audio_codec: cloudinaryResult.audio_codec,
      };

      // Prepare video data for database (using correct field names for current schema)
      const videoData = {
        title,
        description: description || '',
        category: finalCategory, // Include category for database constraint
        duration: cloudinaryResult.duration ? cloudinaryResult.duration : 0,
        thumbnailUrl: streamingUrls.thumbnail || cloudinaryResult.secure_url.replace(/\.(mp4|mov|avi|webm)$/, '.jpg'),
        videoUrl: cloudinaryResult.secure_url,
        tags: tags ? (Array.isArray(tags) ? tags : tags.split(',').map((t: string) => t.trim())) : [],
        isActive: is_active === true || is_active === 'true',
        seriesId: series_id, // Required field
        episodeNumber: parseInt(episode_number), // Required field
        // Store Cloudinary metadata and streaming URLs
        cloudinaryPublicId: cloudinaryResult.public_id,
        streamingUrls: streamingUrls,
        cloudinaryMeta: cloudinaryMeta,
      };

      // Create video in database
      const video = await storage.createVideo(videoData);

      res.status(201).json({
        success: true,
        video,
        cloudinary: {
          public_id: cloudinaryResult.public_id,
          duration: cloudinaryResult.duration,
          width: cloudinaryResult.width,
          height: cloudinaryResult.height,
          format: cloudinaryResult.format,
          bytes: cloudinaryResult.bytes,
          eager_transformations: cloudinaryResult.eager?.length || 0,
        },
        streaming_urls: streamingUrls,
        message: 'Video uploaded successfully. Streaming formats are being generated.',
        info: {
          hls_available: !!streamingUrls.hls,
          dash_available: !!streamingUrls.dash,
          eager_processing: cloudinaryResult.eager?.length > 0 ? 'async' : 'on-demand'
        }
      });

    } catch (error: any) {
      console.error("Video upload error:", error);
      
      // Handle specific error types
      if (error.message?.includes('timeout')) {
        res.status(408).json({ 
          error: "Upload timeout", 
          details: "Video upload took too long. Please try with a smaller file or check your internet connection." 
        });
      } else if (error.message?.includes('File too large')) {
        res.status(413).json({ 
          error: "File too large", 
          details: "Maximum file size is 500MB" 
        });
      } else {
        res.status(500).json({ 
          error: "Failed to upload video", 
          details: error.message 
        });
      }
    }
  });

  app.post("/api/admin/videos", adminAuthMiddleware, async (req, res) => {
    try {
      const videoData = req.body;
      
      // Use correct field names as expected by database schema
      const transformedData = {
        title: videoData.title,
        description: videoData.description,
        category: videoData.category || 'general', // Ensure category is always provided
        duration: videoData.duration,
        thumbnailUrl: videoData.thumbnailUrl,
        videoUrl: videoData.videoUrl,
        tags: videoData.tags,
        isActive: videoData.isActive,
        content_type: videoData.content_type || 'standalone', // Add content_type field
        seriesId: videoData.seriesId || null,
        episodeNumber: videoData.episodeNumber || null,
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
      
      // Get current video to check for series_id changes
      const currentVideo = await storage.getVideoById(id);
      if (!currentVideo) {
        return res.status(404).json({ error: "Video not found" });
      }
      
      const video = await storage.updateVideo(id, updates);
      if (!video) {
        return res.status(404).json({ error: "Video not found" });
      }
      
      res.json(video);
    } catch (error) {
      res.status(500).json({ error: "Failed to update video" });
    }
  });

  // Update video streaming URLs endpoint
  app.patch("/api/admin/videos/:id/streaming", adminAuthMiddleware, async (req, res) => {
    try {
      const { id } = req.params;
      const { streaming_urls, cloudinary_meta, cloudinary_public_id } = req.body;

      // Validate required fields
      if (!streaming_urls) {
        return res.status(400).json({ error: "Streaming URLs are required" });
      }

      // Prepare update data
      const updateData: any = {
        streamingUrls: streaming_urls,
      };

      if (cloudinary_meta) {
        updateData.cloudinaryMeta = cloudinary_meta;
      }

      if (cloudinary_public_id) {
        updateData.cloudinaryPublicId = cloudinary_public_id;
      }

      // Update the video with streaming URLs and metadata
      const video = await storage.updateVideo(id, updateData);
      
      if (!video) {
        return res.status(404).json({ error: "Video not found" });
      }

      console.log(`Successfully updated streaming URLs for video ${id}`);
      
      res.json({ 
        success: true, 
        video,
        message: "Streaming URLs updated successfully" 
      });
    } catch (error) {
      console.error("Failed to update streaming URLs:", error);
      res.status(500).json({ 
        error: "Failed to update streaming URLs",
        details: error.message 
      });
    }
  });

  app.delete("/api/admin/videos/:id", adminAuthMiddleware, async (req, res) => {
    try {
      const { id } = req.params;
      
      // Get video info first to check if it has Cloudinary public_id
      const videos = await storage.getVideos();
      const video = videos.find(v => v.id === id);
      
      if (!video) {
        return res.status(404).json({ error: "Video not found" });
      }

      // Delete from Cloudinary if it has a public_id
      if (video.cloudinaryPublicId) {
        try {
          await deleteVideoFromCloudinary(video.cloudinaryPublicId);
          console.log(`Deleted video from Cloudinary: ${video.cloudinaryPublicId}`);
        } catch (cloudinaryError) {
          console.warn(`Failed to delete from Cloudinary: ${cloudinaryError.message}`);
          // Continue with database deletion even if Cloudinary deletion fails
        }
      }

      // Delete from database (this will automatically update series episode count)
      const success = await storage.deleteVideo(id);
      if (!success) {
        return res.status(404).json({ error: "Video not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      console.error("Video deletion error:", error);
      res.status(500).json({ error: "Failed to delete video" });
    }
  });

  // Series management
  app.get("/api/admin/series", adminAuthMiddleware, async (req, res) => {
    try {
      const series = await storage.getSeries();
      res.json(series);
    } catch (error) {
      console.error('Error fetching series:', error);
      res.status(500).json({ error: "Failed to fetch series" });
    }
  });

  app.post("/api/admin/series", adminAuthMiddleware, async (req, res) => {
    try {
      const { title, description, category, slug, thumbnailUrl, bannerUrl, status } = req.body;

      console.log('Create series request body:', req.body);

      if (!title) {
        return res.status(400).json({ error: 'Title is required' });
      }

      // Transform camelCase to snake_case for storage layer
      const seriesData = {
        itle: title.trim(),
        description: description?.trim() || null,
        category: category?.trim() || 'Ramayana',
        slug: slug?.trim() || title.toLowerCase().replace(/\s+/g, '-'),
        thumbnail_url: thumbnailUrl?.trim() || 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=600&h=400',
        banner_url: bannerUrl?.trim() || null,
        status: status || 'draft'
      };

      console.log('Transformed series data:', seriesData);

      const series = await storage.createSeries(seriesData);
      console.log('Series created successfully:', series);
      res.status(201).json(series);
    } catch (error: any) {
      console.error('Error creating series:', error);
      console.error('Error details:', error.message);
      console.error('Error stack:', error.stack);
      res.status(500).json({ error: "Failed to create series", details: error.message });
    }
  });

  // Test endpoint for debugging body parser
  app.post("/api/admin/test-body", adminAuthMiddleware, async (req, res) => {
    console.log('=== TEST BODY ENDPOINT ===');
    console.log('req.body:', req.body);
    console.log('req.headers:', req.headers);
    res.json({ received: req.body });
  });

  app.patch("/api/admin/series/:id", adminAuthMiddleware, async (req, res) => {
    try {
      console.log('=== RAW REQUEST ===');
      console.log('req.body:', req.body);
      console.log('req.body type:', typeof req.body);
      console.log('req.body keys:', Object.keys(req.body || {}));
      console.log('req.body stringified:', JSON.stringify(req.body));
      console.log('req.headers["content-type"]:', req.headers['content-type']);
      console.log('req.method:', req.method);
      
      const { id } = req.params;
      
      // Access body properties directly
      const bodyTitle = req.body.title || req.body.Title;
      const bodyDescription = req.body.description;
      const bodyCategory = req.body.category;
      const bodySlug = req.body.slug;
      const bodyThumbnailUrl = req.body.thumbnailUrl || req.body.thumbnail_url;
      const bodyBannerUrl = req.body.bannerUrl || req.body.banner_url;
      const bodyStatus = req.body.status;

      console.log('=== EXTRACTED VALUES ===');
      console.log('bodyTitle:', bodyTitle);
      console.log('bodyDescription:', bodyDescription);
      console.log('bodyCategory:', bodyCategory);
      console.log('bodySlug:', bodySlug);
      console.log('bodyThumbnailUrl:', bodyThumbnailUrl);
      console.log('bodyBannerUrl:', bodyBannerUrl);
      console.log('bodyStatus:', bodyStatus);

      if (!bodyTitle) {
        console.log('❌ Validation failed: title is missing');
        return res.status(400).json({ error: 'Title is required' });
      }

      // Transform camelCase to snake_case for storage layer
      const updateData: any = {
        title: bodyTitle.trim(),
        description: bodyDescription?.trim() || null,
        category: bodyCategory?.trim() || 'Ramayana',
        slug: bodySlug?.trim() || bodyTitle.toLowerCase().replace(/\s+/g, '-'),
        thumbnail_url: bodyThumbnailUrl?.trim() || 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=600&h=400',
        status: bodyStatus || 'draft'
      };

      // Only include banner_url if it's provided
      if (bodyBannerUrl !== undefined) {
        updateData.banner_url = bodyBannerUrl?.trim() || null;
      }

      console.log('Transformed update data:', JSON.stringify(updateData, null, 2));

      const series = await storage.updateSeries(id, updateData);
      if (!series) {
        console.log('❌ Series not found in database');
        return res.status(404).json({ error: "Series not found" });
      }
      console.log('✅ Series updated successfully:', series.id);
      res.json(series);
    } catch (error: any) {
      console.error('❌ Error updating series:', error);
      console.error('Error details:', error.message);
      console.error('Error stack:', error.stack);
      res.status(500).json({ error: "Failed to update series", details: error.message });
    }
  });

  app.delete("/api/admin/series/:id", adminAuthMiddleware, async (req, res) => {
    try {
      const { id } = req.params;
      
      // Check if series has any videos
      const videos = await storage.getVideosBySeries(id);
      if (videos.length > 0) {
        return res.status(400).json({ 
          error: 'Cannot delete series with videos. Please remove all videos first.',
          videoCount: videos.length
        });
      }

      const success = await storage.deleteSeries(id);
      if (!success) {
        return res.status(404).json({ error: "Series not found" });
      }
      res.status(204).send();
    } catch (error) {
      console.error('Error deleting series:', error);
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
      
      let results: any[] = [];
      
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

  // Cloudinary webhook for eager transformation completion
  app.post("/api/admin/cloudinary/webhook", async (req, res) => {
    try {
      console.log('📹 Cloudinary webhook received:', req.body);
      
      const { public_id, eager } = req.body;
      
      if (public_id && eager && eager.length > 0) {
        console.log(`✅ Eager transformations completed for: ${public_id}`);
        console.log(`   Generated ${eager.length} transformation(s)`);
        
        // Optional: Update database with completed transformation URLs
        // This could be useful for updating streaming URLs after async processing
        // const updatedStreamingUrls = getVideoStreamingUrls(public_id, req.body);
        // await storage.updateVideoByPublicId(public_id, { streamingUrls: updatedStreamingUrls });
      }
      
      // Always respond with 200 to acknowledge receipt
      res.status(200).json({ success: true });
      
    } catch (error) {
      console.error('Cloudinary webhook error:', error);
      res.status(200).json({ success: true }); // Still acknowledge to prevent retries
    }
  });


}

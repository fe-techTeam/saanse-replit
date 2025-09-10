# Backend Development Rules
# SAANSE - Express.js + TypeScript API Guidelines

## Project Structure

### File Organization
```
server/
├── index.ts              # Server entry point
├── routes.ts             # API route definitions
├── storage.ts            # Data layer implementation
├── middleware/           # Custom middleware
├── controllers/          # Route handlers
├── services/            # Business logic
├── utils/               # Utility functions
└── types/               # TypeScript types
```

## API Design Guidelines

### 1. RESTful Endpoints

#### URL Structure
```
GET    /api/videos              # List all videos
GET    /api/videos/:id          # Get specific video
POST   /api/videos              # Create new video
PATCH  /api/videos/:id          # Update video
DELETE /api/videos/:id          # Delete video

GET    /api/videos/category/:category  # Get videos by category
GET    /api/videos/search?q=query      # Search videos

GET    /api/users/:userId/playlists    # Get user playlists
POST   /api/playlists                  # Create playlist
POST   /api/playlists/:id/videos/:videoId  # Add video to playlist

GET    /api/users/:userId/history      # Get user view history
POST   /api/history                    # Add to view history
```

#### HTTP Methods
- **GET**: Retrieve data (safe, idempotent)
- **POST**: Create new resources
- **PATCH**: Partial updates
- **DELETE**: Remove resources
- **PUT**: Complete replacement (use sparingly)

### 2. Response Format

#### Success Response
```typescript
interface ApiResponse<T> {
  data: T;
  message?: string;
  meta?: {
    total?: number;
    page?: number;
    limit?: number;
  };
}

// Example
{
  "data": [
    {
      "id": "uuid",
      "title": "Video Title",
      "description": "Video description",
      "category": "Ramayana",
      "duration": 180,
      "thumbnailUrl": "https://...",
      "videoUrl": "https://...",
      "views": 1000,
      "likes": 50,
      "tags": ["rama", "devotion"],
      "isActive": true,
      "createdAt": "2024-01-01T00:00:00Z"
    }
  ],
  "message": "Videos retrieved successfully",
  "meta": {
    "total": 100,
    "page": 1,
    "limit": 20
  }
}
```

#### Error Response
```typescript
interface ApiError {
  error: string;
  message: string;
  details?: any;
  statusCode: number;
}

// Example
{
  "error": "VALIDATION_ERROR",
  "message": "Invalid input data",
  "details": [
    {
      "field": "title",
      "message": "Title is required"
    }
  ],
  "statusCode": 400
}
```

### 3. Route Handler Template

```typescript
import { Request, Response } from "express";
import { z } from "zod";
import { storage } from "../storage";
import { insertVideoSchema } from "@shared/schema";

// Validation schema
const createVideoSchema = insertVideoSchema.omit({
  id: true,
  createdAt: true,
});

// Route handler
export async function createVideo(req: Request, res: Response) {
  try {
    // 1. Validate input
    const validatedData = createVideoSchema.parse(req.body);
    
    // 2. Business logic
    const video = await storage.createVideo(validatedData);
    
    // 3. Return response
    res.status(201).json({
      data: video,
      message: "Video created successfully"
    });
    
  } catch (error) {
    // 4. Error handling
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: "VALIDATION_ERROR",
        message: "Invalid input data",
        details: error.errors,
        statusCode: 400
      });
    }
    
    console.error("Error creating video:", error);
    res.status(500).json({
      error: "INTERNAL_ERROR",
      message: "Failed to create video",
      statusCode: 500
    });
  }
}
```

## Data Layer Guidelines

### 1. Storage Interface

```typescript
export interface IStorage {
  // Video operations
  getVideos(): Promise<Video[]>;
  getVideosByCategory(category: string): Promise<Video[]>;
  getVideoById(id: string): Promise<Video | null>;
  searchVideos(query: string): Promise<Video[]>;
  createVideo(video: InsertVideo): Promise<Video>;
  updateVideo(id: string, updates: Partial<InsertVideo>): Promise<Video | null>;
  deleteVideo(id: string): Promise<boolean>;

  // User operations
  getUsers(): Promise<User[]>;
  getUserById(id: string): Promise<User | null>;
  getUserByEmail(email: string): Promise<User | null>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, updates: Partial<InsertUser>): Promise<User | null>;
  deleteUser(id: string): Promise<boolean>;

  // Playlist operations
  getPlaylists(): Promise<Playlist[]>;
  getPlaylistsByUserId(userId: string): Promise<Playlist[]>;
  getPlaylistById(id: string): Promise<Playlist | null>;
  createPlaylist(playlist: InsertPlaylist): Promise<Playlist>;
  updatePlaylist(id: string, updates: Partial<InsertPlaylist>): Promise<Playlist | null>;
  deletePlaylist(id: string): Promise<boolean>;

  // View history operations
  getViewHistory(): Promise<ViewHistory[]>;
  getViewHistoryByUserId(userId: string): Promise<ViewHistory[]>;
  createViewHistory(viewHistory: InsertViewHistory): Promise<ViewHistory>;
  updateViewHistory(id: string, updates: Partial<InsertViewHistory>): Promise<ViewHistory | null>;
  deleteViewHistory(id: string): Promise<boolean>;
}
```

### 2. Storage Implementation

```typescript
export class DatabaseStorage implements IStorage {
  private db: Database;

  constructor(db: Database) {
    this.db = db;
  }

  async getVideos(): Promise<Video[]> {
    try {
      const result = await this.db
        .select()
        .from(videos)
        .where(eq(videos.isActive, true))
        .orderBy(desc(videos.createdAt));
      
      return result;
    } catch (error) {
      console.error("Error fetching videos:", error);
      throw new Error("Failed to fetch videos");
    }
  }

  async getVideoById(id: string): Promise<Video | null> {
    try {
      const result = await this.db
        .select()
        .from(videos)
        .where(and(eq(videos.id, id), eq(videos.isActive, true)))
        .limit(1);
      
      return result[0] || null;
    } catch (error) {
      console.error("Error fetching video:", error);
      throw new Error("Failed to fetch video");
    }
  }

  async createVideo(video: InsertVideo): Promise<Video> {
    try {
      const [result] = await this.db
        .insert(videos)
        .values({
          ...video,
          id: randomUUID(),
          createdAt: new Date(),
        })
        .returning();
      
      return result;
    } catch (error) {
      console.error("Error creating video:", error);
      throw new Error("Failed to create video");
    }
  }

  async updateVideo(id: string, updates: Partial<InsertVideo>): Promise<Video | null> {
    try {
      const [result] = await this.db
        .update(videos)
        .set({
          ...updates,
          updatedAt: new Date(),
        })
        .where(eq(videos.id, id))
        .returning();
      
      return result || null;
    } catch (error) {
      console.error("Error updating video:", error);
      throw new Error("Failed to update video");
    }
  }

  async deleteVideo(id: string): Promise<boolean> {
    try {
      const result = await this.db
        .update(videos)
        .set({ isActive: false })
        .where(eq(videos.id, id));
      
      return result.rowCount > 0;
    } catch (error) {
      console.error("Error deleting video:", error);
      throw new Error("Failed to delete video");
    }
  }

  async searchVideos(query: string): Promise<Video[]> {
    try {
      const searchTerm = `%${query}%`;
      
      const result = await this.db
        .select()
        .from(videos)
        .where(
          and(
            eq(videos.isActive, true),
            or(
              ilike(videos.title, searchTerm),
              ilike(videos.description, searchTerm),
              ilike(videos.category, searchTerm)
            )
          )
        )
        .orderBy(desc(videos.views));
      
      return result;
    } catch (error) {
      console.error("Error searching videos:", error);
      throw new Error("Failed to search videos");
    }
  }
}
```

## Middleware Guidelines

### 1. Authentication Middleware

```typescript
import { Request, Response, NextFunction } from "express";
import { auth } from "../lib/firebase";

interface AuthenticatedRequest extends Request {
  user?: {
    uid: string;
    email: string;
    displayName?: string;
  };
}

export async function authenticateUser(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        error: "UNAUTHORIZED",
        message: "No valid authentication token provided",
        statusCode: 401
      });
    }

    const token = authHeader.split("Bearer ")[1];
    const decodedToken = await auth.verifyIdToken(token);
    
    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email!,
      displayName: decodedToken.name || undefined,
    };
    
    next();
  } catch (error) {
    console.error("Authentication error:", error);
    res.status(401).json({
      error: "UNAUTHORIZED",
      message: "Invalid authentication token",
      statusCode: 401
    });
  }
}
```

### 2. Validation Middleware

```typescript
import { Request, Response, NextFunction } from "express";
import { z, ZodSchema } from "zod";

export function validateRequest(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const validatedData = schema.parse({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      
      req.body = validatedData.body;
      req.query = validatedData.query;
      req.params = validatedData.params;
      
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          error: "VALIDATION_ERROR",
          message: "Invalid input data",
          details: error.errors,
          statusCode: 400
        });
      }
      
      next(error);
    }
  };
}

// Usage
const createVideoSchema = z.object({
  body: insertVideoSchema.omit({ id: true, createdAt: true }),
});

app.post("/api/videos", validateRequest(createVideoSchema), createVideo);
```

### 3. Error Handling Middleware

```typescript
import { Request, Response, NextFunction } from "express";

export function errorHandler(
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
) {
  console.error("Unhandled error:", error);

  // Handle specific error types
  if (error.name === "ValidationError") {
    return res.status(400).json({
      error: "VALIDATION_ERROR",
      message: error.message,
      statusCode: 400
    });
  }

  if (error.name === "NotFoundError") {
    return res.status(404).json({
      error: "NOT_FOUND",
      message: error.message,
      statusCode: 404
    });
  }

  // Default error response
  res.status(500).json({
    error: "INTERNAL_ERROR",
    message: "An unexpected error occurred",
    statusCode: 500
  });
}
```

### 4. Rate Limiting Middleware

```typescript
import rateLimit from "express-rate-limit";

export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    error: "RATE_LIMIT_EXCEEDED",
    message: "Too many requests from this IP, please try again later",
    statusCode: 429
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs
  message: {
    error: "RATE_LIMIT_EXCEEDED",
    message: "Too many authentication attempts, please try again later",
    statusCode: 429
  },
});
```

## Service Layer Guidelines

### 1. Video Service

```typescript
export class VideoService {
  constructor(private storage: IStorage) {}

  async getVideos(filters?: VideoFilters): Promise<Video[]> {
    let videos = await this.storage.getVideos();
    
    if (filters?.category) {
      videos = videos.filter(v => v.category === filters.category);
    }
    
    if (filters?.search) {
      videos = await this.storage.searchVideos(filters.search);
    }
    
    // Sort by views if no specific sort provided
    if (!filters?.sortBy) {
      videos.sort((a, b) => b.views - a.views);
    }
    
    return videos;
  }

  async getVideoById(id: string): Promise<Video | null> {
    const video = await this.storage.getVideoById(id);
    
    if (video) {
      // Increment view count
      await this.storage.updateVideo(id, { 
        views: video.views + 1 
      });
    }
    
    return video;
  }

  async createVideo(videoData: InsertVideo): Promise<Video> {
    // Validate video URL
    if (!this.isValidVideoUrl(videoData.videoUrl)) {
      throw new Error("Invalid video URL");
    }
    
    // Validate thumbnail URL
    if (!this.isValidImageUrl(videoData.thumbnailUrl)) {
      throw new Error("Invalid thumbnail URL");
    }
    
    return await this.storage.createVideo(videoData);
  }

  async updateVideo(id: string, updates: Partial<InsertVideo>): Promise<Video | null> {
    const existingVideo = await this.storage.getVideoById(id);
    
    if (!existingVideo) {
      throw new Error("Video not found");
    }
    
    return await this.storage.updateVideo(id, updates);
  }

  async deleteVideo(id: string): Promise<boolean> {
    const existingVideo = await this.storage.getVideoById(id);
    
    if (!existingVideo) {
      throw new Error("Video not found");
    }
    
    return await this.storage.deleteVideo(id);
  }

  private isValidVideoUrl(url: string): boolean {
    try {
      const urlObj = new URL(url);
      return urlObj.protocol === "https:" && 
             (urlObj.hostname.includes("youtube.com") || 
              urlObj.hostname.includes("vimeo.com") ||
              urlObj.hostname.includes("cloudinary.com"));
    } catch {
      return false;
    }
  }

  private isValidImageUrl(url: string): boolean {
    try {
      const urlObj = new URL(url);
      return urlObj.protocol === "https:" && 
             (urlObj.hostname.includes("unsplash.com") || 
              urlObj.hostname.includes("cloudinary.com"));
    } catch {
      return false;
    }
  }
}
```

### 2. User Service

```typescript
export class UserService {
  constructor(private storage: IStorage) {}

  async createUser(userData: InsertUser): Promise<User> {
    // Check if user already exists
    const existingUser = await this.storage.getUserByEmail(userData.email || '');
    if (existingUser) {
      return existingUser;
    }

    const user = await this.storage.createUser(userData);
    
    // Create default playlists for new user
    await this.createDefaultPlaylists(user.id);
    
    return user;
  }

  async getUserById(id: string): Promise<User | null> {
    return await this.storage.getUserById(id);
  }

  async updateUser(id: string, updates: Partial<InsertUser>): Promise<User | null> {
    const existingUser = await this.storage.getUserById(id);
    
    if (!existingUser) {
      throw new Error("User not found");
    }
    
    return await this.storage.updateUser(id, updates);
  }

  private async createDefaultPlaylists(userId: string): Promise<void> {
    const defaultPlaylists = [
      {
        userId,
        name: "Favorites",
        type: "favorites",
        videoIds: []
      },
      {
        userId,
        name: "Watch Later",
        type: "watchLater",
        videoIds: []
      }
    ];

    for (const playlist of defaultPlaylists) {
      await this.storage.createPlaylist(playlist);
    }
  }
}
```

## Testing Guidelines

### 1. Unit Tests

```typescript
import { describe, it, expect, beforeEach, vi } from "vitest";
import { VideoService } from "../services/VideoService";
import { MockStorage } from "../storage/MockStorage";

describe("VideoService", () => {
  let videoService: VideoService;
  let mockStorage: MockStorage;

  beforeEach(() => {
    mockStorage = new MockStorage();
    videoService = new VideoService(mockStorage);
  });

  describe("getVideos", () => {
    it("should return all videos", async () => {
      const mockVideos = [
        { id: "1", title: "Video 1", category: "Ramayana" },
        { id: "2", title: "Video 2", category: "Krishna" }
      ];
      
      vi.spyOn(mockStorage, "getVideos").mockResolvedValue(mockVideos);
      
      const result = await videoService.getVideos();
      
      expect(result).toEqual(mockVideos);
      expect(mockStorage.getVideos).toHaveBeenCalledOnce();
    });

    it("should filter videos by category", async () => {
      const mockVideos = [
        { id: "1", title: "Video 1", category: "Ramayana" },
        { id: "2", title: "Video 2", category: "Krishna" }
      ];
      
      vi.spyOn(mockStorage, "getVideos").mockResolvedValue(mockVideos);
      
      const result = await videoService.getVideos({ category: "Ramayana" });
      
      expect(result).toHaveLength(1);
      expect(result[0].category).toBe("Ramayana");
    });
  });

  describe("createVideo", () => {
    it("should create video with valid data", async () => {
      const videoData = {
        title: "Test Video",
        description: "Test description",
        category: "Ramayana",
        duration: 120,
        thumbnailUrl: "https://unsplash.com/test.jpg",
        videoUrl: "https://youtube.com/watch?v=test",
        tags: ["test"],
        isActive: true
      };
      
      const mockVideo = { id: "1", ...videoData, createdAt: new Date() };
      vi.spyOn(mockStorage, "createVideo").mockResolvedValue(mockVideo);
      
      const result = await videoService.createVideo(videoData);
      
      expect(result).toEqual(mockVideo);
      expect(mockStorage.createVideo).toHaveBeenCalledWith(videoData);
    });

    it("should throw error for invalid video URL", async () => {
      const videoData = {
        title: "Test Video",
        videoUrl: "invalid-url",
        // ... other required fields
      };
      
      await expect(videoService.createVideo(videoData)).rejects.toThrow("Invalid video URL");
    });
  });
});
```

### 2. Integration Tests

```typescript
import { describe, it, expect, beforeAll, afterAll } from "vitest";
import request from "supertest";
import { app } from "../index";
import { setupTestDatabase, teardownTestDatabase } from "./test-utils";

describe("Video API", () => {
  beforeAll(async () => {
    await setupTestDatabase();
  });

  afterAll(async () => {
    await teardownTestDatabase();
  });

  describe("GET /api/videos", () => {
    it("should return list of videos", async () => {
      const response = await request(app)
        .get("/api/videos")
        .expect(200);

      expect(response.body).toHaveProperty("data");
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it("should filter videos by category", async () => {
      const response = await request(app)
        .get("/api/videos/category/Ramayana")
        .expect(200);

      expect(response.body.data.every((video: any) => video.category === "Ramayana")).toBe(true);
    });
  });

  describe("POST /api/videos", () => {
    it("should create new video", async () => {
      const videoData = {
        title: "Test Video",
        description: "Test description",
        category: "Ramayana",
        duration: 120,
        thumbnailUrl: "https://unsplash.com/test.jpg",
        videoUrl: "https://youtube.com/watch?v=test",
        tags: ["test"]
      };

      const response = await request(app)
        .post("/api/videos")
        .send(videoData)
        .expect(201);

      expect(response.body.data).toMatchObject(videoData);
    });

    it("should return validation error for invalid data", async () => {
      const invalidData = {
        title: "", // Empty title should fail validation
        category: "InvalidCategory"
      };

      const response = await request(app)
        .post("/api/videos")
        .send(invalidData)
        .expect(400);

      expect(response.body.error).toBe("VALIDATION_ERROR");
    });
  });
});
```

## Performance Guidelines

### 1. Database Optimization

```typescript
// Use indexes for frequently queried fields
CREATE INDEX idx_videos_category ON videos(category);
CREATE INDEX idx_videos_views ON videos(views DESC);
CREATE INDEX idx_videos_created_at ON videos(created_at DESC);
CREATE INDEX idx_videos_search ON videos USING gin(to_tsvector('english', title || ' ' || description));

// Use pagination for large datasets
export async function getVideosPaginated(page: number = 1, limit: number = 20) {
  const offset = (page - 1) * limit;
  
  const videos = await db
    .select()
    .from(videos)
    .where(eq(videos.isActive, true))
    .orderBy(desc(videos.createdAt))
    .limit(limit)
    .offset(offset);
  
  const total = await db
    .select({ count: sql<number>`count(*)` })
    .from(videos)
    .where(eq(videos.isActive, true));
  
  return {
    data: videos,
    meta: {
      total: total[0].count,
      page,
      limit,
      totalPages: Math.ceil(total[0].count / limit)
    }
  };
}
```

### 2. Caching Strategy

```typescript
import NodeCache from "node-cache";

const cache = new NodeCache({ stdTTL: 300 }); // 5 minutes default TTL

export class CachedVideoService {
  constructor(private videoService: VideoService) {}

  async getVideos(): Promise<Video[]> {
    const cacheKey = "videos:all";
    let videos = cache.get<Video[]>(cacheKey);
    
    if (!videos) {
      videos = await this.videoService.getVideos();
      cache.set(cacheKey, videos, 300); // Cache for 5 minutes
    }
    
    return videos;
  }

  async getVideoById(id: string): Promise<Video | null> {
    const cacheKey = `video:${id}`;
    let video = cache.get<Video>(cacheKey);
    
    if (!video) {
      video = await this.videoService.getVideoById(id);
      if (video) {
        cache.set(cacheKey, video, 600); // Cache for 10 minutes
      }
    }
    
    return video;
  }

  invalidateCache(pattern: string): void {
    const keys = cache.keys();
    const matchingKeys = keys.filter(key => key.includes(pattern));
    cache.del(matchingKeys);
  }
}
```

## Security Guidelines

### 1. Input Validation

```typescript
// Comprehensive validation schemas
const videoSchema = z.object({
  title: z.string().min(1, "Title is required").max(200, "Title too long"),
  description: z.string().max(1000, "Description too long").optional(),
  category: z.enum(["Ramayana", "Krishna", "Mahabharata", "Shiva", "Hanuman", "Ganesha", "Devi", "Festivals", "Bhajans", "Explained"]),
  duration: z.number().int().positive("Duration must be positive").max(3600, "Video too long"),
  thumbnailUrl: z.string().url("Invalid thumbnail URL"),
  videoUrl: z.string().url("Invalid video URL"),
  tags: z.array(z.string().min(1).max(50)).max(10, "Too many tags"),
  isActive: z.boolean().default(true)
});

// Sanitize user input
export function sanitizeInput(input: string): string {
  return input
    .trim()
    .replace(/[<>]/g, "") // Remove potential HTML tags
    .substring(0, 1000); // Limit length
}
```

### 2. Rate Limiting

```typescript
// Different limits for different endpoints
export const videoUploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // 10 uploads per hour
  message: {
    error: "RATE_LIMIT_EXCEEDED",
    message: "Upload limit exceeded. Please try again later.",
    statusCode: 429
  }
});

export const searchLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 searches per 15 minutes
  message: {
    error: "RATE_LIMIT_EXCEEDED",
    message: "Too many search requests. Please try again later.",
    statusCode: 429
  }
});
```

### 3. CORS Configuration

```typescript
import cors from "cors";

const corsOptions = {
  origin: [
    "http://localhost:3000",
    "https://mythosstream.com",
    "https://www.mythosstream.com"
  ],
  credentials: true,
  methods: ["GET", "POST", "PATCH", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
  exposedHeaders: ["X-Total-Count"]
};

app.use(cors(corsOptions));
```

## Logging Guidelines

### 1. Structured Logging

```typescript
import winston from "winston";

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: "error.log", level: "error" }),
    new winston.transports.File({ filename: "combined.log" })
  ]
});

if (process.env.NODE_ENV !== "production") {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }));
}

// Usage in route handlers
export async function createVideo(req: Request, res: Response) {
  const startTime = Date.now();
  
  try {
    logger.info("Creating video", {
      userId: req.user?.uid,
      videoTitle: req.body.title,
      category: req.body.category
    });
    
    const video = await videoService.createVideo(req.body);
    
    logger.info("Video created successfully", {
      videoId: video.id,
      duration: Date.now() - startTime
    });
    
    res.status(201).json({ data: video });
  } catch (error) {
    logger.error("Failed to create video", {
      error: error.message,
      stack: error.stack,
      duration: Date.now() - startTime
    });
    
    res.status(500).json({ error: "Failed to create video" });
  }
}
```

## Deployment Guidelines

### 1. Environment Configuration

```typescript
// config/environment.ts
export const config = {
  port: parseInt(process.env.PORT || "3000", 10),
  nodeEnv: process.env.NODE_ENV || "development",
  
  database: {
    url: process.env.DATABASE_URL!,
    ssl: process.env.NODE_ENV === "production"
  },
  
  firebase: {
    projectId: process.env.FIREBASE_PROJECT_ID!,
    privateKey: process.env.FIREBASE_PRIVATE_KEY!,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL!
  },
  
  cors: {
    origin: process.env.CORS_ORIGIN?.split(",") || ["http://localhost:3000"]
  },
  
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || "900000", 10),
    max: parseInt(process.env.RATE_LIMIT_MAX || "100", 10)
  }
};

// Validate required environment variables
const requiredEnvVars = [
  "DATABASE_URL",
  "FIREBASE_PROJECT_ID",
  "FIREBASE_PRIVATE_KEY",
  "FIREBASE_CLIENT_EMAIL"
];

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    throw new Error(`Missing required environment variable: ${envVar}`);
  }
}
```

### 2. Health Check Endpoint

```typescript
app.get("/health", async (req, res) => {
  try {
    // Check database connection
    await db.execute(sql`SELECT 1`);
    
    // Check storage service
    await storage.getVideos();
    
    res.json({
      status: "healthy",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      version: process.env.npm_package_version || "1.0.0"
    });
  } catch (error) {
    res.status(503).json({
      status: "unhealthy",
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});
```

This comprehensive backend development guide should help maintain consistency and quality across the SAANSE API development.

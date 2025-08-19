import { type User, type InsertUser, type Video, type InsertVideo, type Playlist, type InsertPlaylist, type ViewHistory, type InsertViewHistory } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByFirebaseUid(firebaseUid: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Videos
  getVideo(id: string): Promise<Video | undefined>;
  getAllVideos(): Promise<Video[]>;
  getVideosByCategory(category: string): Promise<Video[]>;
  searchVideos(query: string): Promise<Video[]>;
  createVideo(video: InsertVideo): Promise<Video>;
  incrementVideoViews(id: string): Promise<void>;
  incrementVideoLikes(id: string): Promise<void>;

  // Playlists
  getPlaylist(id: string): Promise<Playlist | undefined>;
  getUserPlaylists(userId: string): Promise<Playlist[]>;
  createPlaylist(playlist: InsertPlaylist): Promise<Playlist>;
  addVideoToPlaylist(playlistId: string, videoId: string): Promise<void>;
  removeVideoFromPlaylist(playlistId: string, videoId: string): Promise<void>;

  // View History
  getUserViewHistory(userId: string): Promise<ViewHistory[]>;
  addToViewHistory(viewHistory: InsertViewHistory): Promise<ViewHistory>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private videos: Map<string, Video>;
  private playlists: Map<string, Playlist>;
  private viewHistory: Map<string, ViewHistory>;

  constructor() {
    this.users = new Map();
    this.videos = new Map();
    this.playlists = new Map();
    this.viewHistory = new Map();
    
    // Seed with some devotional videos
    this.seedVideos();
  }

  private seedVideos() {
    const seedVideos: Video[] = [
      {
        id: randomUUID(),
        title: "Rama's Birth",
        description: "The divine birth of Lord Rama in Ayodhya",
        category: "Ramayana",
        duration: 135, // 2:15
        thumbnailUrl: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=225&fit=crop",
        videoUrl: "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4",
        likes: 0,
        views: 0,
        tags: ["rama", "birth", "ayodhya", "divine"],
        isActive: true,
        createdAt: new Date(),
      },
      {
        id: randomUUID(),
        title: "Golden Deer",
        description: "The enchanted golden deer that led to Sita's abduction",
        category: "Ramayana",
        duration: 105, // 1:45
        thumbnailUrl: "https://images.unsplash.com/photo-1544550285-f813152fb2fd?w=400&h=225&fit=crop",
        videoUrl: "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4",
        likes: 0,
        views: 0,
        tags: ["deer", "sita", "forest", "deception"],
        isActive: true,
        createdAt: new Date(),
      },
      {
        id: randomUUID(),
        title: "Krishna's Birth",
        description: "The miraculous birth of Lord Krishna in Mathura",
        category: "Krishna",
        duration: 115, // 1:55
        thumbnailUrl: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=225&fit=crop",
        videoUrl: "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4",
        likes: 0,
        views: 0,
        tags: ["krishna", "birth", "mathura", "divine"],
        isActive: true,
        createdAt: new Date(),
      },
      {
        id: randomUUID(),
        title: "The Divine Flute",
        description: "Krishna's enchanting flute melodies that captivated all",
        category: "Krishna",
        duration: 130, // 2:10
        thumbnailUrl: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=225&fit=crop",
        videoUrl: "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4",
        likes: 0,
        views: 0,
        tags: ["krishna", "flute", "music", "enchanting"],
        isActive: true,
        createdAt: new Date(),
      },
      {
        id: randomUUID(),
        title: "Evening Aarti",
        description: "Traditional evening prayers with divine light",
        category: "Bhajans",
        duration: 200, // 3:20
        thumbnailUrl: "https://images.unsplash.com/photo-1542558138-f3b7d14c7b4c?w=400&h=225&fit=crop",
        videoUrl: "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4",
        likes: 0,
        views: 0,
        tags: ["aarti", "prayers", "evening", "divine"],
        isActive: true,
        createdAt: new Date(),
      },
      {
        id: randomUUID(),
        title: "Shiva Tandava",
        description: "The cosmic dance of Lord Shiva",
        category: "Shiva",
        duration: 170, // 2:50
        thumbnailUrl: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=225&fit=crop",
        videoUrl: "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4",
        likes: 0,
        views: 0,
        tags: ["shiva", "tandava", "dance", "cosmic"],
        isActive: true,
        createdAt: new Date(),
      }
    ];

    seedVideos.forEach(video => {
      this.videos.set(video.id, video);
    });
  }

  // Users
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByFirebaseUid(firebaseUid: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.firebaseUid === firebaseUid,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { 
      ...insertUser, 
      id, 
      createdAt: new Date(),
      displayName: insertUser.displayName || null,
      photoURL: insertUser.photoURL || null
    };
    this.users.set(id, user);
    return user;
  }

  // Videos
  async getVideo(id: string): Promise<Video | undefined> {
    return this.videos.get(id);
  }

  async getAllVideos(): Promise<Video[]> {
    return Array.from(this.videos.values()).filter(v => v.isActive);
  }

  async getVideosByCategory(category: string): Promise<Video[]> {
    return Array.from(this.videos.values()).filter(
      v => v.isActive && v.category.toLowerCase() === category.toLowerCase()
    );
  }

  async searchVideos(query: string): Promise<Video[]> {
    const lowerQuery = query.toLowerCase();
    return Array.from(this.videos.values()).filter(
      v => v.isActive && (
        v.title.toLowerCase().includes(lowerQuery) ||
        v.description?.toLowerCase().includes(lowerQuery) ||
        v.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
      )
    );
  }

  async createVideo(insertVideo: InsertVideo): Promise<Video> {
    const id = randomUUID();
    const video: Video = { 
      ...insertVideo, 
      id, 
      likes: 0, 
      views: 0, 
      createdAt: new Date(),
      description: insertVideo.description || null,
      tags: Array.isArray(insertVideo.tags) ? insertVideo.tags : [],
      isActive: insertVideo.isActive !== undefined ? insertVideo.isActive : true
    };
    this.videos.set(id, video);
    return video;
  }

  async incrementVideoViews(id: string): Promise<void> {
    const video = this.videos.get(id);
    if (video) {
      video.views++;
      this.videos.set(id, video);
    }
  }

  async incrementVideoLikes(id: string): Promise<void> {
    const video = this.videos.get(id);
    if (video) {
      video.likes++;
      this.videos.set(id, video);
    }
  }

  // Playlists
  async getPlaylist(id: string): Promise<Playlist | undefined> {
    return this.playlists.get(id);
  }

  async getUserPlaylists(userId: string): Promise<Playlist[]> {
    return Array.from(this.playlists.values()).filter(p => p.userId === userId);
  }

  async createPlaylist(insertPlaylist: InsertPlaylist): Promise<Playlist> {
    const id = randomUUID();
    const playlist: Playlist = { 
      ...insertPlaylist, 
      id, 
      createdAt: new Date(),
      videoIds: Array.isArray(insertPlaylist.videoIds) ? insertPlaylist.videoIds : []
    };
    this.playlists.set(id, playlist);
    return playlist;
  }

  async addVideoToPlaylist(playlistId: string, videoId: string): Promise<void> {
    const playlist = this.playlists.get(playlistId);
    if (playlist && !playlist.videoIds.includes(videoId)) {
      playlist.videoIds.push(videoId);
      this.playlists.set(playlistId, playlist);
    }
  }

  async removeVideoFromPlaylist(playlistId: string, videoId: string): Promise<void> {
    const playlist = this.playlists.get(playlistId);
    if (playlist) {
      playlist.videoIds = playlist.videoIds.filter(id => id !== videoId);
      this.playlists.set(playlistId, playlist);
    }
  }

  // View History
  async getUserViewHistory(userId: string): Promise<ViewHistory[]> {
    return Array.from(this.viewHistory.values()).filter(vh => vh.userId === userId);
  }

  async addToViewHistory(insertViewHistory: InsertViewHistory): Promise<ViewHistory> {
    const id = randomUUID();
    const viewHistory: ViewHistory = { 
      ...insertViewHistory, 
      id, 
      watchedAt: new Date(),
      progress: insertViewHistory.progress || 0
    };
    this.viewHistory.set(id, viewHistory);
    return viewHistory;
  }
}

export const storage = new MemStorage();

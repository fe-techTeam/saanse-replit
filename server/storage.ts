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
      // Ramayana Stories
      {
        id: randomUUID(),
        title: "Rama's Birth - The Divine Avatar",
        description: "The divine birth of Lord Rama in Ayodhya, foretold by the sages",
        category: "Ramayana",
        duration: 135,
        thumbnailUrl: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=225&fit=crop",
        videoUrl: "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4",
        likes: 847,
        views: 12456,
        tags: ["rama", "birth", "ayodhya", "divine", "avatar"],
        isActive: true,
        createdAt: new Date(),
      },
      {
        id: randomUUID(),
        title: "The Golden Deer - Maya's Deception",
        description: "The enchanted golden deer that led to Sita's abduction by Ravana",
        category: "Ramayana",
        duration: 105,
        thumbnailUrl: "https://images.unsplash.com/photo-1544550285-f813152fb2fd?w=400&h=225&fit=crop",
        videoUrl: "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4",
        likes: 634,
        views: 8923,
        tags: ["deer", "sita", "forest", "deception", "ravana"],
        isActive: true,
        createdAt: new Date(),
      },
      {
        id: randomUUID(),
        title: "Hanuman Meets Rama",
        description: "The first meeting between Hanuman and Lord Rama at Kishkindha",
        category: "Ramayana",
        duration: 142,
        thumbnailUrl: "https://images.unsplash.com/photo-1579952363873-27d3bfad9c0d?w=400&h=225&fit=crop",
        videoUrl: "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4",
        likes: 1203,
        views: 18745,
        tags: ["hanuman", "rama", "kishkindha", "devotion", "meeting"],
        isActive: true,
        createdAt: new Date(),
      },
      {
        id: randomUUID(),
        title: "Lanka Dahan - Hanuman's Courage",
        description: "Hanuman burns Lanka with his tail, showing his divine power",
        category: "Ramayana",
        duration: 178,
        thumbnailUrl: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=225&fit=crop",
        videoUrl: "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4",
        likes: 956,
        views: 14672,
        tags: ["hanuman", "lanka", "fire", "courage", "power"],
        isActive: true,
        createdAt: new Date(),
      },
      {
        id: randomUUID(),
        title: "Ram Rajya - The Perfect Kingdom",
        description: "The golden age of Lord Rama's rule in Ayodhya",
        category: "Ramayana",
        duration: 198,
        thumbnailUrl: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=225&fit=crop",
        videoUrl: "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4",
        likes: 1456,
        views: 23891,
        tags: ["rama", "rajya", "kingdom", "ayodhya", "golden age"],
        isActive: true,
        createdAt: new Date(),
      },

      // Krishna Stories
      {
        id: randomUUID(),
        title: "Krishna's Birth - Divine Miracle",
        description: "The miraculous birth of Lord Krishna in Mathura prison",
        category: "Krishna",
        duration: 115,
        thumbnailUrl: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=225&fit=crop",
        videoUrl: "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4",
        likes: 2134,
        views: 34567,
        tags: ["krishna", "birth", "mathura", "divine", "miracle"],
        isActive: true,
        createdAt: new Date(),
      },
      {
        id: randomUUID(),
        title: "The Divine Flute - Vrindavan Leela",
        description: "Krishna's enchanting flute melodies that captivated all of Vrindavan",
        category: "Krishna",
        duration: 130,
        thumbnailUrl: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=225&fit=crop",
        videoUrl: "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4",
        likes: 1678,
        views: 28934,
        tags: ["krishna", "flute", "music", "vrindavan", "leela"],
        isActive: true,
        createdAt: new Date(),
      },
      {
        id: randomUUID(),
        title: "Govardhan Parvat - Krishna's Protection",
        description: "Young Krishna lifts the Govardhan mountain to protect villagers",
        category: "Krishna",
        duration: 156,
        thumbnailUrl: "https://images.unsplash.com/photo-1544550285-f813152fb2fd?w=400&h=225&fit=crop",
        videoUrl: "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4",
        likes: 1234,
        views: 21456,
        tags: ["krishna", "govardhan", "mountain", "protection", "miracle"],
        isActive: true,
        createdAt: new Date(),
      },
      {
        id: randomUUID(),
        title: "Kaliya Naag - The Serpent's Defeat",
        description: "Krishna tames the poisonous serpent Kaliya in Yamuna river",
        category: "Krishna",
        duration: 123,
        thumbnailUrl: "https://images.unsplash.com/photo-1579952363873-27d3bfad9c0d?w=400&h=225&fit=crop",
        videoUrl: "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4",
        likes: 876,
        views: 15678,
        tags: ["krishna", "kaliya", "serpent", "yamuna", "victory"],
        isActive: true,
        createdAt: new Date(),
      },
      {
        id: randomUUID(),
        title: "Radha Krishna - Divine Love",
        description: "The eternal love story of Radha and Krishna in Vrindavan",
        category: "Krishna",
        duration: 167,
        thumbnailUrl: "https://images.unsplash.com/photo-1542558138-f3b7d14c7b4c?w=400&h=225&fit=crop",
        videoUrl: "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4",
        likes: 2345,
        views: 45678,
        tags: ["radha", "krishna", "love", "vrindavan", "divine"],
        isActive: true,
        createdAt: new Date(),
      },

      // Mahabharata Stories
      {
        id: randomUUID(),
        title: "Bhishma's Vow - The Grand Oath",
        description: "Bhishma's lifetime celibacy vow for his father's happiness",
        category: "Mahabharata",
        duration: 189,
        thumbnailUrl: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=225&fit=crop",
        videoUrl: "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4",
        likes: 756,
        views: 12345,
        tags: ["bhishma", "vow", "sacrifice", "duty", "honor"],
        isActive: true,
        createdAt: new Date(),
      },
      {
        id: randomUUID(),
        title: "Draupadi Swayamvar - The Archery Contest",
        description: "Arjuna wins Draupadi's hand in the great archery competition",
        category: "Mahabharata",
        duration: 145,
        thumbnailUrl: "https://images.unsplash.com/photo-1544550285-f813152fb2fd?w=400&h=225&fit=crop",
        videoUrl: "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4",
        likes: 1123,
        views: 18765,
        tags: ["draupadi", "arjuna", "swayamvar", "archery", "marriage"],
        isActive: true,
        createdAt: new Date(),
      },
      {
        id: randomUUID(),
        title: "Krishna's Diplomacy - Peace Mission",
        description: "Krishna's final attempt to prevent the great war through diplomacy",
        category: "Mahabharata",
        duration: 234,
        thumbnailUrl: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=225&fit=crop",
        videoUrl: "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4",
        likes: 1567,
        views: 25432,
        tags: ["krishna", "diplomacy", "peace", "war", "negotiation"],
        isActive: true,
        createdAt: new Date(),
      },

      // Lord Shiva Stories
      {
        id: randomUUID(),
        title: "Shiva Tandava - The Cosmic Dance",
        description: "The cosmic dance of Lord Shiva that maintains universal balance",
        category: "Shiva",
        duration: 170,
        thumbnailUrl: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=225&fit=crop",
        videoUrl: "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4",
        likes: 1789,
        views: 32145,
        tags: ["shiva", "tandava", "dance", "cosmic", "balance"],
        isActive: true,
        createdAt: new Date(),
      },
      {
        id: randomUUID(),
        title: "Ganga Avatar - The Sacred River",
        description: "How Ganga descended to earth through Shiva's matted locks",
        category: "Shiva",
        duration: 198,
        thumbnailUrl: "https://images.unsplash.com/photo-1579952363873-27d3bfad9c0d?w=400&h=225&fit=crop",
        videoUrl: "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4",
        likes: 1456,
        views: 24678,
        tags: ["ganga", "shiva", "river", "sacred", "descent"],
        isActive: true,
        createdAt: new Date(),
      },
      {
        id: randomUUID(),
        title: "Neelkanth - The Blue-throated Lord",
        description: "Shiva drinks poison to save the world during ocean churning",
        category: "Shiva",
        duration: 143,
        thumbnailUrl: "https://images.unsplash.com/photo-1542558138-f3b7d14c7b4c?w=400&h=225&fit=crop",
        videoUrl: "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4",
        likes: 2134,
        views: 38976,
        tags: ["shiva", "neelkanth", "poison", "sacrifice", "ocean"],
        isActive: true,
        createdAt: new Date(),
      },

      // Bhajans & Aartis
      {
        id: randomUUID(),
        title: "Ganga Aarti - Evening Prayers",
        description: "Traditional evening prayers on the banks of river Ganga",
        category: "Bhajans",
        duration: 200,
        thumbnailUrl: "https://images.unsplash.com/photo-1542558138-f3b7d14c7b4c?w=400&h=225&fit=crop",
        videoUrl: "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4",
        likes: 3456,
        views: 67890,
        tags: ["aarti", "ganga", "evening", "prayers", "divine"],
        isActive: true,
        createdAt: new Date(),
      },
      {
        id: randomUUID(),
        title: "Shree Krishna Bhajan - Govind Bolo",
        description: "Melodious bhajan dedicated to Lord Krishna's divine names",
        category: "Bhajans",
        duration: 245,
        thumbnailUrl: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=225&fit=crop",
        videoUrl: "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4",
        likes: 2789,
        views: 45123,
        tags: ["bhajan", "krishna", "govind", "devotion", "music"],
        isActive: true,
        createdAt: new Date(),
      },
      {
        id: randomUUID(),
        title: "Hanuman Chalisa - Complete Recitation",
        description: "Complete recitation of the powerful Hanuman Chalisa",
        category: "Bhajans",
        duration: 312,
        thumbnailUrl: "https://images.unsplash.com/photo-1579952363873-27d3bfad9c0d?w=400&h=225&fit=crop",
        videoUrl: "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4",
        likes: 4567,
        views: 89123,
        tags: ["hanuman", "chalisa", "prayer", "protection", "strength"],
        isActive: true,
        createdAt: new Date(),
      },
      {
        id: randomUUID(),
        title: "Om Namah Shivaya - Sacred Chant",
        description: "Powerful chanting of the sacred Shiva mantra",
        category: "Bhajans",
        duration: 189,
        thumbnailUrl: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=225&fit=crop",
        videoUrl: "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4",
        likes: 3234,
        views: 56789,
        tags: ["om", "shiva", "mantra", "chant", "meditation"],
        isActive: true,
        createdAt: new Date(),
      },

      // Hanuman Stories
      {
        id: randomUUID(),
        title: "Hanuman's Birth - Son of Wind God",
        description: "The divine birth of Hanuman, son of Vayu (Wind God)",
        category: "Hanuman",
        duration: 156,
        thumbnailUrl: "https://images.unsplash.com/photo-1579952363873-27d3bfad9c0d?w=400&h=225&fit=crop",
        videoUrl: "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4",
        likes: 1678,
        views: 28456,
        tags: ["hanuman", "birth", "vayu", "divine", "strength"],
        isActive: true,
        createdAt: new Date(),
      },
      {
        id: randomUUID(),
        title: "Sanjeevani Booti - Life-saving Herb",
        description: "Hanuman brings the life-saving herb to revive Lakshmana",
        category: "Hanuman",
        duration: 187,
        thumbnailUrl: "https://images.unsplash.com/photo-1544550285-f813152fb2fd?w=400&h=225&fit=crop",
        videoUrl: "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4",
        likes: 2345,
        views: 41234,
        tags: ["hanuman", "sanjeevani", "lakshmana", "mountain", "devotion"],
        isActive: true,
        createdAt: new Date(),
      },

      // Lord Ganesha
      {
        id: randomUUID(),
        title: "Ganesha's Birth - The Elephant God",
        description: "The story of how Ganesha got his elephant head",
        category: "Ganesha",
        duration: 167,
        thumbnailUrl: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=225&fit=crop",
        videoUrl: "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4",
        likes: 1987,
        views: 34567,
        tags: ["ganesha", "birth", "elephant", "parvati", "shiva"],
        isActive: true,
        createdAt: new Date(),
      },
      {
        id: randomUUID(),
        title: "Ganesha and the Moon - Modak Story",
        description: "Why Ganesha cursed the moon and the story of modaks",
        category: "Ganesha",
        duration: 134,
        thumbnailUrl: "https://images.unsplash.com/photo-1542558138-f3b7d14c7b4c?w=400&h=225&fit=crop",
        videoUrl: "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4",
        likes: 1456,
        views: 23789,
        tags: ["ganesha", "moon", "modak", "curse", "wisdom"],
        isActive: true,
        createdAt: new Date(),
      },

      // Divine Mother (Devi)
      {
        id: randomUUID(),
        title: "Durga Mata - The Warrior Goddess",
        description: "The manifestation of Divine Mother as the fierce warrior Durga",
        category: "Devi",
        duration: 198,
        thumbnailUrl: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=225&fit=crop",
        videoUrl: "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4",
        likes: 2678,
        views: 47891,
        tags: ["durga", "devi", "warrior", "goddess", "power"],
        isActive: true,
        createdAt: new Date(),
      },
      {
        id: randomUUID(),
        title: "Lakshmi Mata - Goddess of Prosperity",
        description: "The divine qualities and blessings of Goddess Lakshmi",
        category: "Devi",
        duration: 156,
        thumbnailUrl: "https://images.unsplash.com/photo-1579952363873-27d3bfad9c0d?w=400&h=225&fit=crop",
        videoUrl: "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4",
        likes: 2234,
        views: 39876,
        tags: ["lakshmi", "prosperity", "wealth", "blessing", "abundance"],
        isActive: true,
        createdAt: new Date(),
      },

      // Festivals
      {
        id: randomUUID(),
        title: "Diwali - Festival of Lights",
        description: "The significance and celebration of Diwali across India",
        category: "Festivals",
        duration: 245,
        thumbnailUrl: "https://images.unsplash.com/photo-1542558138-f3b7d14c7b4c?w=400&h=225&fit=crop",
        videoUrl: "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4",
        likes: 3456,
        views: 67234,
        tags: ["diwali", "lights", "festival", "celebration", "rama"],
        isActive: true,
        createdAt: new Date(),
      },
      {
        id: randomUUID(),
        title: "Janmashtami - Krishna's Birthday",
        description: "Celebrating the birth of Lord Krishna with joy and devotion",
        category: "Festivals",
        duration: 234,
        thumbnailUrl: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=225&fit=crop",
        videoUrl: "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4",
        likes: 2987,
        views: 52341,
        tags: ["janmashtami", "krishna", "birthday", "celebration", "devotion"],
        isActive: true,
        createdAt: new Date(),
      },
      {
        id: randomUUID(),
        title: "Navaratri - Nine Divine Nights",
        description: "The nine-night celebration honoring Divine Mother",
        category: "Festivals",
        duration: 278,
        thumbnailUrl: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=225&fit=crop",
        videoUrl: "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4",
        likes: 2567,
        views: 44678,
        tags: ["navaratri", "devi", "nine nights", "durga", "celebration"],
        isActive: true,
        createdAt: new Date(),
      },

      // Explained Series
      {
        id: randomUUID(),
        title: "What is Dharma? - Understanding Righteousness",
        description: "Deep explanation of dharma and its importance in daily life",
        category: "Explained",
        duration: 456,
        thumbnailUrl: "https://images.unsplash.com/photo-1544550285-f813152fb2fd?w=400&h=225&fit=crop",
        videoUrl: "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4",
        likes: 1789,
        views: 31245,
        tags: ["dharma", "righteousness", "philosophy", "explained", "life"],
        isActive: true,
        createdAt: new Date(),
      },
      {
        id: randomUUID(),
        title: "Karma - The Law of Action",
        description: "Understanding karma and its effects on our lives and future births",
        category: "Explained",
        duration: 387,
        thumbnailUrl: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=225&fit=crop",
        videoUrl: "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4",
        likes: 2156,
        views: 38749,
        tags: ["karma", "action", "consequences", "rebirth", "philosophy"],
        isActive: true,
        createdAt: new Date(),
      },
      {
        id: randomUUID(),
        title: "The Four Yugas - Cycles of Time",
        description: "Understanding the four cosmic ages and their characteristics",
        category: "Explained",
        duration: 298,
        thumbnailUrl: "https://images.unsplash.com/photo-1579952363873-27d3bfad9c0d?w=400&h=225&fit=crop",
        videoUrl: "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4",
        likes: 1567,
        views: 27834,
        tags: ["yugas", "time", "cosmic", "ages", "kali yuga"],
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

  // Video management methods for CMS
  async updateVideo(id: string, updates: Partial<InsertVideo>): Promise<Video | null> {
    const existing = this.videos.get(id);
    if (!existing) return null;
    
    const updated = { 
      ...existing, 
      ...updates,
      tags: Array.isArray(updates.tags) ? updates.tags : existing.tags,
    };
    this.videos.set(id, updated);
    return updated;
  }

  async deleteVideo(id: string): Promise<boolean> {
    return this.videos.delete(id);
  }
}

export const storage = new MemStorage();

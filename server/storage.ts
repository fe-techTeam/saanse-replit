import { randomUUID } from "crypto";
import type { Video, User, Playlist, ViewHistory, InsertVideo, InsertUser, InsertPlaylist, InsertViewHistory } from "@shared/schema";
import { insertVideoSchema, insertUserSchema, insertPlaylistSchema, insertViewHistorySchema } from "@shared/schema";

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

export class MemStorage implements IStorage {
  private videos: Video[] = [];
  private users: User[] = [];
  private playlists: Playlist[] = [];
  private viewHistories: ViewHistory[] = [];

  constructor() {
    this.init();
  }

  private async init() {
    // Netflix-quality extensive content library for SAANSE
    const sampleVideos: Omit<Video, 'id' | 'createdAt'>[] = [
      // === RAMAYANA SERIES (10 episodes) ===
      {
        title: "श्रीराम जन्म - The Divine Avatar",
        description: "Experience the divine birth of Lord Rama through stunning visuals and devotional music. A cinematic masterpiece that brings ancient scriptures to life.",
        category: "Ramayana",
        duration: 180,
        thumbnailUrl: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=600&h=400",
        videoUrl: "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4",
        tags: ["rama", "birth", "ayodhya", "divine", "राम", "जन्म"],
        views: 125420,
        likes: 8940,
        isActive: true
      },
      {
        title: "सीता स्वयंवर - The Divine Union",
        description: "Witness the legendary bow-breaking ceremony and the destined union of Rama and Sita in this breathtaking episode.",
        category: "Ramayana", 
        duration: 165,
        thumbnailUrl: "https://images.unsplash.com/photo-1583391733956-6c78276477e5?w=600&h=400",
        videoUrl: "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4",
        tags: ["sita", "swayamvar", "bow", "marriage", "सीता", "स्वयंवर"],
        views: 98920,
        likes: 7650,
        isActive: true
      },
      {
        title: "वन गमन - Forest Exile Begins",
        description: "The noble sacrifice as Rama accepts 14 years of exile with unwavering grace and dharma.",
        category: "Ramayana",
        duration: 142,
        thumbnailUrl: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=600&h=400",
        videoUrl: "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4", 
        tags: ["exile", "forest", "sacrifice", "वन", "गमन"],
        views: 87650,
        likes: 6890,
        isActive: true
      },
      {
        title: "सीता हरण - The Abduction",
        description: "The pivotal moment that changes everything - witness Ravana's treacherous act in this intense episode.",
        category: "Ramayana",
        duration: 198,
        thumbnailUrl: "https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=600&h=400",
        videoUrl: "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4",
        tags: ["sita", "ravana", "abduction", "सीता", "हरण", "रावण"],
        views: 156780,
        likes: 11240,
        isActive: true
      },
      {
        title: "हनुमान मिलन - Meeting Hanuman", 
        description: "The divine encounter between Rama and his greatest devotee, Hanuman, in the Kishkinda forest.",
        category: "Ramayana",
        duration: 156,
        thumbnailUrl: "https://images.unsplash.com/photo-1599839575945-a9e5af0c3fa5?w=600&h=400",
        videoUrl: "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4",
        tags: ["hanuman", "meeting", "devotion", "हनुमान", "मिलन"],
        views: 201250,
        likes: 15680,
        isActive: true
      },
      {
        title: "सुंदरकांड - Hanuman's Lanka Mission",
        description: "Follow Hanuman's epic journey across the ocean to Lanka in search of Sita Mata.",
        category: "Ramayana",
        duration: 189,
        thumbnailUrl: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=600&h=400",
        videoUrl: "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4",
        tags: ["sundarkand", "hanuman", "ocean", "सुंदरकांड", "लंका"],
        views: 178940,
        likes: 13250,
        isActive: true
      },
      {
        title: "लंका दहन - Burning of Lanka",
        description: "Hanuman's heroic mission culminates in the spectacular burning of the golden city of Lanka.",
        category: "Ramayana",
        duration: 173,
        thumbnailUrl: "https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=600&h=400",
        videoUrl: "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4",
        tags: ["lanka", "fire", "hanuman", "लंका", "दहन"],
        views: 145890,
        likes: 10650,
        isActive: true
      },
      {
        title: "सेतु निर्माण - Building the Bridge",
        description: "Witness the miraculous construction of the bridge to Lanka with divine intervention.",
        category: "Ramayana",
        duration: 167,
        thumbnailUrl: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=600&h=400",
        videoUrl: "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4",
        tags: ["bridge", "lanka", "miracle", "सेतु", "निर्माण"],
        views: 134560,
        likes: 9890,
        isActive: true
      },
      {
        title: "राम रावण युद्ध - The Epic Battle",
        description: "The ultimate confrontation between good and evil in this spectacular battle sequence.",
        category: "Ramayana",
        duration: 225,
        thumbnailUrl: "https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=600&h=400",
        videoUrl: "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4",
        tags: ["battle", "rama", "ravana", "युद्ध", "रावण"],
        views: 289420,
        likes: 21320,
        isActive: true
      },
      {
        title: "राज्याभिषेक - The Coronation",
        description: "The glorious return and coronation of Lord Rama as the rightful king of Ayodhya.",
        category: "Ramayana",
        duration: 187,
        thumbnailUrl: "https://images.unsplash.com/photo-1583391733956-6c78276477e5?w=600&h=400",
        videoUrl: "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4",
        tags: ["coronation", "ayodhya", "king", "राज्याभिषेक", "विजय"],
        views: 198540,
        likes: 15890,
        isActive: true
      },

      // === KRISHNA LEELA SERIES (10 episodes) ===
      {
        title: "कृष्ण जन्म - Divine Birth in Prison",
        description: "The miraculous birth of Lord Krishna in Kamsa's prison, illuminating the darkness with divine light.",
        category: "Krishna",
        duration: 172,
        thumbnailUrl: "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=600&h=400",
        videoUrl: "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4",
        tags: ["krishna", "birth", "mathura", "कृष्ण", "जन्म"],
        views: 245670,
        likes: 18940,
        isActive: true
      },
      {
        title: "गोकुल गमन - Journey to Gokul",
        description: "Witness Vasudeva's divine journey through the stormy night to save baby Krishna.",
        category: "Krishna",
        duration: 158,
        thumbnailUrl: "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=600&h=400",
        videoUrl: "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4",
        tags: ["gokul", "vasudeva", "journey", "गोकुल", "गमन"],
        views: 189340,
        likes: 14250,
        isActive: true
      },
      {
        title: "माखन चोर - The Butter Thief",
        description: "Adorable tales of young Krishna's mischievous butter-stealing adventures in Gokul.",
        category: "Krishna",
        duration: 145,
        thumbnailUrl: "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=600&h=400",
        videoUrl: "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4",
        tags: ["butter", "mischief", "childhood", "माखन", "चोर"],
        views: 312450,
        likes: 24890,
        isActive: true
      },
      {
        title: "कालिया दमन - Subduing Kaliya",
        description: "Young Krishna's heroic dance on the venomous serpent Kaliya to save Yamuna river.",
        category: "Krishna",
        duration: 193,
        thumbnailUrl: "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=600&h=400",
        videoUrl: "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4",
        tags: ["kaliya", "yamuna", "dance", "कालिया", "दमन"],
        views: 267890,
        likes: 20140,
        isActive: true
      },
      {
        title: "गोवर्धन उठाना - Lifting Govardhan",
        description: "Krishna lifts the entire Govardhan mountain to protect villagers from Indra's wrath.",
        category: "Krishna",
        duration: 201,
        thumbnailUrl: "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=600&h=400",
        videoUrl: "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4",
        tags: ["govardhan", "mountain", "indra", "गोवर्धन", "उठाना"],
        views: 345120,
        likes: 27650,
        isActive: true
      },
      {
        title: "राधा कृष्ण प्रेम - Divine Love",
        description: "The eternal love story of Radha and Krishna, symbolizing devotion and divine union.",
        category: "Krishna",
        duration: 167,
        thumbnailUrl: "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=600&h=400",
        videoUrl: "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4",
        tags: ["radha", "love", "devotion", "राधा", "प्रेम"],
        views: 456780,
        likes: 35240,
        isActive: true
      },
      {
        title: "रास लीला - The Divine Dance",
        description: "The mystical Raas Leela where Krishna dances with the gopis under the full moon.",
        category: "Krishna",
        duration: 189,
        thumbnailUrl: "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=600&h=400",
        videoUrl: "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4",
        tags: ["raas", "dance", "gopis", "रास", "लीला"],
        views: 378940,
        likes: 29890,
        isActive: true
      },
      {
        title: "द्वारका गमन - Journey to Dwarka",
        description: "Krishna establishes his golden kingdom of Dwarka, the city that rose from the ocean.",
        category: "Krishna",
        duration: 198,
        thumbnailUrl: "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=600&h=400",
        videoUrl: "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4",
        tags: ["dwarka", "kingdom", "ocean", "द्वारका", "गमन"],
        views: 234560,
        likes: 18790,
        isActive: true
      },
      {
        title: "गीता उपदेश - The Divine Sermon",
        description: "Krishna's timeless wisdom delivered to Arjuna on the battlefield of Kurukshetra.",
        category: "Krishna",
        duration: 267,
        thumbnailUrl: "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=600&h=400",
        videoUrl: "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4",
        tags: ["gita", "arjuna", "philosophy", "गीता", "उपदेश"],
        views: 567890,
        likes: 43240,
        isActive: true
      },
      {
        title: "निर्याण लीला - The Final Journey",
        description: "Krishna's divine departure from earthly realm, marking the end of Dwapara Yuga.",
        category: "Krishna",
        duration: 198,
        thumbnailUrl: "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=600&h=400",
        videoUrl: "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4",
        tags: ["departure", "niryan", "leela", "निर्याण", "लीला"],
        views: 289340,
        likes: 22450,
        isActive: true
      },

      // === MAHABHARATA EPIC (10 episodes) ===
      {
        title: "कुरु वंश - The Kuru Dynasty",
        description: "The foundation of the great Kuru dynasty and the birth of legendary princes.",
        category: "Mahabharata",
        duration: 198,
        thumbnailUrl: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=600&h=400",
        videoUrl: "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4",
        tags: ["kuru", "dynasty", "princes", "कुरु", "वंश"],
        views: 187650,
        likes: 14890,
        isActive: true
      },
      {
        title: "पांडव जन्म - Birth of Pandavas",
        description: "The divine birth of the five Pandava brothers and their extraordinary powers.",
        category: "Mahabharata",
        duration: 167,
        thumbnailUrl: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=600&h=400",
        videoUrl: "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4",
        tags: ["pandava", "birth", "divine", "पांडव", "जन्म"],
        views: 156780,
        likes: 12340,
        isActive: true
      },
      {
        title: "द्रौपदी स्वयंवर - Draupadi's Choice",
        description: "The legendary swayamvara where Arjuna wins Draupadi through his archery skills.",
        category: "Mahabharata",
        duration: 189,
        thumbnailUrl: "https://images.unsplash.com/photo-1583391733956-6c78276477e5?w=600&h=400",
        videoUrl: "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4",
        tags: ["draupadi", "swayamvara", "arjuna", "द्रौपदी", "स्वयंवर"],
        views: 234890,
        likes: 18940,
        isActive: true
      },
      {
        title: "राजसूय यज्ञ - The Royal Sacrifice",
        description: "Yudhishthira's grand Rajasuya sacrifice establishing Pandava supremacy.",
        category: "Mahabharata",
        duration: 178,
        thumbnailUrl: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=600&h=400",
        videoUrl: "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4",
        tags: ["rajasuya", "sacrifice", "yudhishthira", "राजसूय", "यज्ञ"],
        views: 145670,
        likes: 11290,
        isActive: true
      },
      {
        title: "चौसर खेल - The Dice Game",
        description: "The fateful dice game that changes everything, leading to the Pandavas' exile.",
        category: "Mahabharata",
        duration: 212,
        thumbnailUrl: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=600&h=400",
        videoUrl: "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4",
        tags: ["dice", "game", "exile", "चौसर", "खेल"],
        views: 298450,
        likes: 23640,
        isActive: true
      },
      {
        title: "वस्त्रहरण - Disrobing of Draupadi", 
        description: "The shameful incident in the royal court and Krishna's divine intervention.",
        category: "Mahabharata",
        duration: 167,
        thumbnailUrl: "https://images.unsplash.com/photo-1583391733956-6c78276477e5?w=600&h=400",
        videoUrl: "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4",
        tags: ["draupadi", "krishna", "intervention", "वस्त्रहरण", "कृष्ण"],
        views: 345120,
        likes: 27890,
        isActive: true
      },
      {
        title: "अज्ञातवास - Year in Hiding",
        description: "The Pandavas' final year of exile spent incognito in King Virata's court.",
        category: "Mahabharata",
        duration: 156,
        thumbnailUrl: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=600&h=400",
        videoUrl: "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4",
        tags: ["hiding", "virata", "incognito", "अज्ञातवास", "छुपना"],
        views: 178920,
        likes: 13450,
        isActive: true
      },
      {
        title: "कुरुक्षेत्र तैयारी - Preparing for War",
        description: "Both armies assemble at Kurukshetra for the greatest war in human history.",
        category: "Mahabharata",
        duration: 189,
        thumbnailUrl: "https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=600&h=400",
        videoUrl: "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4",
        tags: ["kurukshetra", "war", "preparation", "कुरुक्षेत्र", "तैयारी"],
        views: 267840,
        likes: 21340,
        isActive: true
      },
      {
        title: "महाभारत युद्ध - The Great War",
        description: "The 18-day war that destroyed a civilization and established dharma.",
        category: "Mahabharata",
        duration: 298,
        thumbnailUrl: "https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=600&h=400",
        videoUrl: "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4",
        tags: ["war", "battle", "dharma", "महाभारत", "युद्ध"],
        views: 456780,
        likes: 35240,
        isActive: true
      },
      {
        title: "युधिष्ठिर राज्य - Righteous Rule",
        description: "Yudhishthira's coronation and establishment of righteous rule after victory.",
        category: "Mahabharata",
        duration: 167,
        thumbnailUrl: "https://images.unsplash.com/photo-1583391733956-6c78276477e5?w=600&h=400",
        videoUrl: "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4",
        tags: ["yudhishthira", "coronation", "rule", "युधिष्ठिर", "राज्य"],
        views: 198340,
        likes: 15670,
        isActive: true
      },

      // === SHIVA SERIES (8 episodes) ===
      {
        title: "शिव तांडव - The Cosmic Dance",
        description: "Witness Lord Shiva's powerful Tandava, the dance that creates and destroys universes.",
        category: "Shiva",
        duration: 189,
        thumbnailUrl: "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=600&h=400",
        videoUrl: "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4",
        tags: ["tandava", "dance", "cosmic", "शिव", "तांडव"],
        views: 298450,
        likes: 24890,
        isActive: true
      },
      {
        title: "सती दक्ष यज्ञ - Sati's Sacrifice",
        description: "The tragic story of Sati's self-immolation and Shiva's grief.",
        category: "Shiva",
        duration: 167,
        thumbnailUrl: "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=600&h=400",
        videoUrl: "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4",
        tags: ["sati", "sacrifice", "grief", "सती", "दक्ष"],
        views: 234670,
        likes: 18940,
        isActive: true
      },
      {
        title: "पार्वती तपस्या - Parvati's Penance",
        description: "Parvati's intense penance to win Lord Shiva's heart and become his consort.",
        category: "Shiva",
        duration: 178,
        thumbnailUrl: "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=600&h=400",
        videoUrl: "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4",
        tags: ["parvati", "penance", "love", "पार्वती", "तपस्या"],
        views: 267890,
        likes: 21450,
        isActive: true
      },
      {
        title: "गंगा अवतरण - Descent of Ganga",
        description: "How Shiva caught the mighty Ganga in his hair to save the earth.",
        category: "Shiva",
        duration: 156,
        thumbnailUrl: "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=600&h=400",
        videoUrl: "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4",
        tags: ["ganga", "descent", "earth", "गंगा", "अवतरण"],
        views: 189340,
        likes: 15670,
        isActive: true
      },
      {
        title: "समुद्र मंथन - Churning of Ocean",
        description: "Shiva drinks the poison from the churned ocean to save the universe.",
        category: "Shiva", 
        duration: 198,
        thumbnailUrl: "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=600&h=400",
        videoUrl: "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4",
        tags: ["ocean", "churning", "poison", "समुद्र", "मंथन"],
        views: 345120,
        likes: 27890,
        isActive: true
      },
      {
        title: "गणेश जन्म - Birth of Ganesha",
        description: "The unique birth of Ganesha and how he became the elephant-headed god.",
        category: "Shiva",
        duration: 167,
        thumbnailUrl: "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=600&h=400",
        videoUrl: "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4",
        tags: ["ganesha", "birth", "elephant", "गणेश", "जन्म"],
        views: 278940,
        likes: 22340,
        isActive: true
      },
      {
        title: "कार्तिकेय कथा - Story of Kartikeya",
        description: "The birth of Kartikeya (Murugan) and his victory over the demon Tarakasura.",
        category: "Shiva",
        duration: 178,
        thumbnailUrl: "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=600&h=400",
        videoUrl: "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4",
        tags: ["kartikeya", "murugan", "tarakasura", "कार्तिकेय", "कथा"],
        views: 198450,
        likes: 15890,
        isActive: true
      },
      {
        title: "काशी विश्वनाथ - Lord of Kashi",
        description: "Shiva as Vishwanath, the eternal protector of the holy city of Kashi (Varanasi).",
        category: "Shiva",
        duration: 145,
        thumbnailUrl: "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=600&h=400",
        videoUrl: "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4",
        tags: ["kashi", "varanasi", "vishwanath", "काशी", "विश्वनाथ"],
        views: 234560,
        likes: 18790,
        isActive: true
      },

      // === HANUMAN SERIES (8 episodes) ===
      {
        title: "हनुमान जन्म - Birth of Hanuman",
        description: "The divine birth of Hanuman and his childhood adventures with the sun.",
        category: "Hanuman",
        duration: 156,
        thumbnailUrl: "https://images.unsplash.com/photo-1599839575945-a9e5af0c3fa5?w=600&h=400",
        videoUrl: "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4",
        tags: ["hanuman", "birth", "childhood", "हनुमान", "जन्म"],
        views: 198450,
        likes: 16890,
        isActive: true
      },
      {
        title: "शक्ति का आशीर्वाद - Blessed with Powers",
        description: "How young Hanuman received his incredible powers from various gods.",
        category: "Hanuman",
        duration: 167,
        thumbnailUrl: "https://images.unsplash.com/photo-1599839575945-a9e5af0c3fa5?w=600&h=400",
        videoUrl: "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4",
        tags: ["powers", "blessing", "gods", "शक्ति", "आशीर्वाद"],
        views: 234670,
        likes: 19340,
        isActive: true
      },
      {
        title: "राम मिलन - Meeting Lord Rama",
        description: "The destined meeting between Hanuman and Lord Rama that changed everything.",
        category: "Hanuman",
        duration: 178,
        thumbnailUrl: "https://images.unsplash.com/photo-1599839575945-a9e5af0c3fa5?w=600&h=400",
        videoUrl: "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4",
        tags: ["rama", "meeting", "devotion", "राम", "मिलन"],
        views: 345120,
        likes: 28940,
        isActive: true
      },
      {
        title: "समुद्र पार - Crossing the Ocean",
        description: "Hanuman's magnificent leap across the vast ocean to reach Lanka.",
        category: "Hanuman",
        duration: 189,
        thumbnailUrl: "https://images.unsplash.com/photo-1599839575945-a9e5af0c3fa5?w=600&h=400",
        videoUrl: "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4",
        tags: ["ocean", "leap", "lanka", "समुद्र", "पार"],
        views: 278940,
        likes: 23450,
        isActive: true
      },
      {
        title: "सीता खोज - Finding Sita",
        description: "Hanuman's search through Lanka and his emotional meeting with Sita Mata.",
        category: "Hanuman",
        duration: 167,
        thumbnailUrl: "https://images.unsplash.com/photo-1599839575945-a9e5af0c3fa5?w=600&h=400",
        videoUrl: "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4",
        tags: ["sita", "search", "lanka", "सीता", "खोज"],
        views: 267890,
        likes: 22340,
        isActive: true
      },
      {
        title: "अशोक वाटिका - Ashoka Garden",
        description: "Hanuman's encounter with Sita in the beautiful Ashoka garden of Lanka.",
        category: "Hanuman",
        duration: 156,
        thumbnailUrl: "https://images.unsplash.com/photo-1599839575945-a9e5af0c3fa5?w=600&h=400",
        videoUrl: "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4",
        tags: ["ashoka", "garden", "sita", "अशोक", "वाटिका"],
        views: 198450,
        likes: 16780,
        isActive: true
      },
      {
        title: "लंका दहन - Burning Lanka",
        description: "Hanuman's dramatic burning of Lanka as a message to Ravana.",
        category: "Hanuman",
        duration: 198,
        thumbnailUrl: "https://images.unsplash.com/photo-1599839575945-a9e5af0c3fa5?w=600&h=400",
        videoUrl: "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4",
        tags: ["lanka", "burning", "ravana", "लंका", "दहन"],
        views: 356780,
        likes: 29890,
        isActive: true
      },
      {
        title: "संजीवनी बूटी - The Healing Herb",
        description: "Hanuman brings the entire mountain when he cannot identify the Sanjeevani herb.",
        category: "Hanuman",
        duration: 178,
        thumbnailUrl: "https://images.unsplash.com/photo-1599839575945-a9e5af0c3fa5?w=600&h=400",
        videoUrl: "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4",
        tags: ["sanjeevani", "mountain", "healing", "संजीवनी", "बूटी"],
        views: 289450,
        likes: 24670,
        isActive: true
      },

      // === GANESHA SERIES (6 episodes) ===
      {
        title: "गणेश जन्म कथा - Birth Story",
        description: "The unique creation of Ganesha by Goddess Parvati from turmeric paste.",
        category: "Ganesha",
        duration: 145,
        thumbnailUrl: "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=600&h=400",
        videoUrl: "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4",
        tags: ["ganesha", "birth", "parvati", "गणेश", "जन्म"],
        views: 245670,
        likes: 20340,
        isActive: true
      },
      {
        title: "गज मुख कैसे मिला - How He Got Elephant Head",
        description: "The story of how Ganesha received his elephant head after Shiva's intervention.",
        category: "Ganesha",
        duration: 167,
        thumbnailUrl: "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=600&h=400",
        videoUrl: "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4",
        tags: ["elephant", "head", "shiva", "गज", "मुख"],
        views: 298450,
        likes: 24890,
        isActive: true
      },
      {
        title: "मोदक प्रिय - Lover of Sweets",
        description: "Why Ganesha loves modaks and the sweet stories behind this preference.",
        category: "Ganesha",
        duration: 134,
        thumbnailUrl: "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=600&h=400",
        videoUrl: "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4",
        tags: ["modak", "sweets", "food", "मोदक", "प्रिय"],
        views: 189340,
        likes: 15670,
        isActive: true
      },
      {
        title: "प्रथम पूज्य - First to be Worshipped",
        description: "How Ganesha became the deity to be worshipped first before any other god.",
        category: "Ganesha",
        duration: 156,
        thumbnailUrl: "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=600&h=400",
        videoUrl: "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4",
        tags: ["first", "worship", "tradition", "प्रथम", "पूज्य"],
        views: 234560,
        likes: 19450,
        isActive: true
      },
      {
        title: "लेखक गणेश - The Divine Scribe",
        description: "How Ganesha became the scribe for Sage Vyasa while writing the Mahabharata.",
        category: "Ganesha",
        duration: 178,
        thumbnailUrl: "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=600&h=400",
        videoUrl: "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4",
        tags: ["scribe", "vyasa", "mahabharata", "लेखक", "गणेश"],
        views: 167890,
        likes: 13450,
        isActive: true
      },
      {
        title: "गणपति बप्पा मोरया - Festival Celebrations",
        description: "The grand celebration of Ganesha Chaturthi and its cultural significance.",
        category: "Ganesha",
        duration: 189,
        thumbnailUrl: "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=600&h=400",
        videoUrl: "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4",
        tags: ["festival", "chaturthi", "celebration", "गणपति", "बप्पा"],
        views: 378940,
        likes: 31240,
        isActive: true
      },

      // === DEVI SERIES (8 episodes) ===
      {
        title: "दुर्गा अवतार - Durga Avatar",
        description: "The emergence of Goddess Durga to defeat the buffalo demon Mahishasura.",
        category: "Devi",
        duration: 198,
        thumbnailUrl: "https://images.unsplash.com/photo-1583391733956-6c78276477e5?w=600&h=400",
        videoUrl: "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4",
        tags: ["durga", "mahishasura", "demon", "दुर्गा", "अवतार"],
        views: 345120,
        likes: 28940,
        isActive: true
      },
      {
        title: "काली माँ - The Fierce Mother",
        description: "The fierce form of Goddess Kali emerging from Durga's forehead in battle.",
        category: "Devi",
        duration: 167,
        thumbnailUrl: "https://images.unsplash.com/photo-1583391733956-6c78276477e5?w=600&h=400",
        videoUrl: "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4",
        tags: ["kali", "fierce", "battle", "काली", "माँ"],
        views: 267890,
        likes: 22450,
        isActive: true
      },
      {
        title: "सरस्वती वीणा - Goddess of Knowledge",
        description: "Saraswati, the goddess of knowledge, music, and arts, blessing humanity.",
        category: "Devi",
        duration: 156,
        thumbnailUrl: "https://images.unsplash.com/photo-1583391733956-6c78276477e5?w=600&h=400",
        videoUrl: "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4",
        tags: ["saraswati", "knowledge", "music", "सरस्वती", "वीणा"],
        views: 198450,
        likes: 16780,
        isActive: true
      },
      {
        title: "लक्ष्मी कमल - Goddess of Wealth",
        description: "Lakshmi, the goddess of wealth and prosperity, emerging from the ocean.",
        category: "Devi",
        duration: 145,
        thumbnailUrl: "https://images.unsplash.com/photo-1583391733956-6c78276477e5?w=600&h=400",
        videoUrl: "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4",
        tags: ["lakshmi", "wealth", "lotus", "लक्ष्मी", "कमल"],
        views: 234670,
        likes: 19890,
        isActive: true
      },
      {
        title: "पार्वती शक्ति - Divine Power",
        description: "Parvati as the supreme divine feminine energy, the source of all creation.",
        category: "Devi",
        duration: 178,
        thumbnailUrl: "https://images.unsplash.com/photo-1583391733956-6c78276477e5?w=600&h=400",
        videoUrl: "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4",
        tags: ["parvati", "shakti", "feminine", "पार्वती", "शक्ति"],
        views: 289340,
        likes: 24560,
        isActive: true
      },
      {
        title: "राधा प्रेम - Divine Love",
        description: "Radha as the embodiment of pure devotional love and spiritual surrender.",
        category: "Devi",
        duration: 167,
        thumbnailUrl: "https://images.unsplash.com/photo-1583391733956-6c78276477e5?w=600&h=400",
        videoUrl: "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4",
        tags: ["radha", "love", "devotion", "राधा", "प्रेम"],
        views: 356780,
        likes: 30240,
        isActive: true
      },
      {
        title: "सीता आदर्श - Ideal Woman",
        description: "Sita as the ideal of feminine virtue, strength, and devotion.",
        category: "Devi",
        duration: 189,
        thumbnailUrl: "https://images.unsplash.com/photo-1583391733956-6c78276477e5?w=600&h=400",
        videoUrl: "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4",
        tags: ["sita", "ideal", "virtue", "सीता", "आदर्श"],
        views: 267890,
        likes: 22890,
        isActive: true
      },
      {
        title: "नवरात्रि महात्म्य - Nine Nights Glory",
        description: "The significance and celebration of Navratri, honoring the divine feminine.",
        category: "Devi",
        duration: 198,
        thumbnailUrl: "https://images.unsplash.com/photo-1583391733956-6c78276477e5?w=600&h=400",
        videoUrl: "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4",
        tags: ["navratri", "festival", "celebration", "नवरात्रि", "महात्म्य"],
        views: 445120,
        likes: 36890,
        isActive: true
      },

      // === FESTIVALS SERIES (8 episodes) ===
      {
        title: "दिवाली - Festival of Lights",
        description: "The grand celebration of Diwali, commemorating Rama's return to Ayodhya.",
        category: "Festivals",
        duration: 167,
        thumbnailUrl: "https://images.unsplash.com/photo-1570197526038-2086a2750ae3?w=600&h=400",
        videoUrl: "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4",
        tags: ["diwali", "lights", "celebration", "दिवाली", "प्रकाश"],
        views: 567890,
        likes: 45240,
        isActive: true
      },
      {
        title: "होली रंग - Festival of Colors",
        description: "The joyous celebration of Holi and the divine play of Krishna with colors.",
        category: "Festivals",
        duration: 156,
        thumbnailUrl: "https://images.unsplash.com/photo-1583307713403-8e19fe3c9772?w=600&h=400",
        videoUrl: "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4",
        tags: ["holi", "colors", "krishna", "होली", "रंग"],
        views: 456780,
        likes: 38940,
        isActive: true
      },
      {
        title: "जन्माष्टमी - Krishna's Birthday",
        description: "The grand celebration of Lord Krishna's birth with dahi-handi and devotion.",
        category: "Festivals",
        duration: 178,
        thumbnailUrl: "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=600&h=400",
        videoUrl: "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4",
        tags: ["janmashtami", "krishna", "birthday", "जन्माष्टमी", "कृष्ण"],
        views: 378940,
        likes: 31240,
        isActive: true
      },
      {
        title: "गणेश चतुर्थी - Ganesha Festival",
        description: "The elaborate celebration of Ganesha Chaturthi with processions and devotion.",
        category: "Festivals",
        duration: 189,
        thumbnailUrl: "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=600&h=400",
        videoUrl: "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4",
        tags: ["ganesha", "chaturthi", "festival", "गणेश", "चतुर्थी"],
        views: 345120,
        likes: 28940,
        isActive: true
      },
      {
        title: "दशहरा विजय - Victory of Good",
        description: "Dussehra celebration marking Rama's victory over Ravana and good over evil.",
        category: "Festivals",
        duration: 167,
        thumbnailUrl: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=600&h=400",
        videoUrl: "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4",
        tags: ["dussehra", "victory", "rama", "दशहरा", "विजय"],
        views: 289450,
        likes: 24670,
        isActive: true
      },
      {
        title: "कार्तिक पूर्णिमा - Full Moon Festival",
        description: "The sacred festival of Kartik Purnima with its spiritual significance.",
        category: "Festivals",
        duration: 145,
        thumbnailUrl: "https://images.unsplash.com/photo-1570197526038-2086a2750ae3?w=600&h=400",
        videoUrl: "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4",
        tags: ["kartik", "purnima", "fullmoon", "कार्तिक", "पूर्णिमा"],
        views: 198450,
        likes: 16780,
        isActive: true
      },
      {
        title: "मकर संक्रांति - Harvest Festival",
        description: "The celebration of Makar Sankranti marking the sun's northward journey.",
        category: "Festivals",
        duration: 156,
        thumbnailUrl: "https://images.unsplash.com/photo-1570197526038-2086a2750ae3?w=600&h=400",
        videoUrl: "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4",
        tags: ["sankranti", "harvest", "sun", "मकर", "संक्रांति"],
        views: 234560,
        likes: 19890,
        isActive: true
      },
      {
        title: "शिवरात्रि - Night of Shiva",
        description: "The sacred night of Maha Shivratri and its deep spiritual significance.",
        category: "Festivals",
        duration: 178,
        thumbnailUrl: "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=600&h=400",
        videoUrl: "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4",
        tags: ["shivratri", "shiva", "night", "शिवरात्रि", "रात्रि"],
        views: 312450,
        likes: 26890,
        isActive: true
      },

      // === BHAJANS SERIES (12 episodes) ===
      {
        title: "हरे कृष्ण महामंत्र - The Great Mantra",
        description: "The divine Hare Krishna Maha Mantra with beautiful musical arrangement.",
        category: "Bhajans",
        duration: 189,
        thumbnailUrl: "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=600&h=400",
        videoUrl: "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4",
        tags: ["hare", "krishna", "mantra", "हरे", "कृष्ण"],
        views: 645120,
        likes: 52340,
        isActive: true
      },
      {
        title: "राम धुन - Rama's Name",
        description: "Soothing chants of 'राम राम' with traditional musical instruments.",
        category: "Bhajans",
        duration: 167,
        thumbnailUrl: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=600&h=400",
        videoUrl: "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4",
        tags: ["rama", "chant", "devotional", "राम", "धुन"],
        views: 567890,
        likes: 46240,
        isActive: true
      },
      {
        title: "शिव तांडव स्तोत्र - Shiva's Praise",
        description: "The powerful Shiva Tandava Stotram with mesmerizing visuals.",
        category: "Bhajans",
        duration: 198,
        thumbnailUrl: "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=600&h=400",
        videoUrl: "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4",
        tags: ["shiva", "tandava", "stotram", "शिव", "तांडव"],
        views: 456780,
        likes: 38940,
        isActive: true
      },
      {
        title: "हनुमान चालीसा - Hanuman's Forty Verses",
        description: "The complete Hanuman Chalisa with melodious tune and meaning.",
        category: "Bhajans",
        duration: 234,
        thumbnailUrl: "https://images.unsplash.com/photo-1599839575945-a9e5af0c3fa5?w=600&h=400",
        videoUrl: "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4",
        tags: ["hanuman", "chalisa", "verses", "हनुमान", "चालीसा"],
        views: 789450,
        likes: 63240,
        isActive: true
      },
      {
        title: "गायत्री मंत्र - Universal Prayer",
        description: "The sacred Gayatri Mantra with proper pronunciation and meaning.",
        category: "Bhajans",
        duration: 145,
        thumbnailUrl: "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=600&h=400",
        videoUrl: "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4",
        tags: ["gayatri", "mantra", "prayer", "गायत्री", "मंत्र"],
        views: 523670,
        likes: 42890,
        isActive: true
      },
      {
        title: "ॐ नमः शिवाय - Shiva's Sacred Mantra",
        description: "The five-syllable mantra 'Om Namah Shivaya' in various musical forms.",
        category: "Bhajans",
        duration: 178,
        thumbnailUrl: "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=600&h=400",
        videoUrl: "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4",
        tags: ["om", "namah", "shivaya", "ॐ", "नमः"],
        views: 445120,
        likes: 37890,
        isActive: true
      },
      {
        title: "श्री राम जय राम - Victory to Rama",
        description: "Uplifting chants of 'श्री राम जय राम जय जय राम' with divine energy.",
        category: "Bhajans",
        duration: 156,
        thumbnailUrl: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=600&h=400",
        videoUrl: "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4",
        tags: ["sri", "rama", "victory", "श्री", "जय"],
        views: 389450,
        likes: 32670,
        isActive: true
      },
      {
        title: "गोविंद बोलो - Chant Krishna's Name",
        description: "Joyful chanting of Krishna's names with traditional devotional music.",
        category: "Bhajans",
        duration: 167,
        thumbnailUrl: "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=600&h=400",
        videoUrl: "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4",
        tags: ["govinda", "krishna", "chant", "गोविंद", "बोलो"],
        views: 356780,
        likes: 29890,
        isActive: true
      },
      {
        title: "सरस्वती वंदना - Saraswati's Prayer",
        description: "Beautiful prayers to Goddess Saraswati for knowledge and wisdom.",
        category: "Bhajans",
        duration: 145,
        thumbnailUrl: "https://images.unsplash.com/photo-1583391733956-6c78276477e5?w=600&h=400",
        videoUrl: "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4",
        tags: ["saraswati", "prayer", "wisdom", "सरस्वती", "वंदना"],
        views: 267890,
        likes: 22450,
        isActive: true
      },
      {
        title: "गंगा आरती - River Ganga's Prayer",
        description: "The evening aarti of River Ganga with lamps and devotional singing.",
        category: "Bhajans",
        duration: 189,
        thumbnailUrl: "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=600&h=400",
        videoUrl: "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4",
        tags: ["ganga", "aarti", "river", "गंगा", "आरती"],
        views: 298450,
        likes: 25670,
        isActive: true
      },
      {
        title: "महालक्ष्मी स्तुति - Lakshmi's Praise",
        description: "Sacred hymns praising Goddess Lakshmi for prosperity and abundance.",
        category: "Bhajans",
        duration: 156,
        thumbnailUrl: "https://images.unsplash.com/photo-1583391733956-6c78276477e5?w=600&h=400",
        videoUrl: "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4",
        tags: ["lakshmi", "praise", "prosperity", "महालक्ष्मी", "स्तुति"],
        views: 234560,
        likes: 19890,
        isActive: true
      },
      {
        title: "दुर्गे दुर्गे - Divine Mother's Call",
        description: "Powerful invocation of Goddess Durga with traditional drums and chants.",
        category: "Bhajans",
        duration: 178,
        thumbnailUrl: "https://images.unsplash.com/photo-1583391733956-6c78276477e5?w=600&h=400",
        videoUrl: "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4",
        tags: ["durga", "mother", "divine", "दुर्गे", "दुर्गे"],
        views: 378940,
        likes: 31240,
        isActive: true
      },

      // === EXPLAINED SERIES (8 episodes) ===
      {
        title: "कर्म का सिद्धांत - Law of Karma Explained",
        description: "Understanding the fundamental law of karma and its impact on our lives.",
        category: "Explained",
        duration: 189,
        thumbnailUrl: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=600&h=400",
        videoUrl: "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4",
        tags: ["karma", "law", "philosophy", "कर्म", "सिद्धांत"],
        views: 445120,
        likes: 36890,
        isActive: true
      },
      {
        title: "धर्म और अधर्म - Righteousness vs Unrighteousness",
        description: "The eternal conflict between dharma and adharma explained through stories.",
        category: "Explained",
        duration: 167,
        thumbnailUrl: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=600&h=400",
        videoUrl: "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4",
        tags: ["dharma", "righteousness", "morals", "धर्म", "अधर्म"],
        views: 356780,
        likes: 29890,
        isActive: true
      },
      {
        title: "मोक्ष का मार्ग - Path to Liberation",
        description: "The four paths to moksha: karma, bhakti, raja, and gyana yoga explained.",
        category: "Explained",
        duration: 198,
        thumbnailUrl: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=600&h=400",
        videoUrl: "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4",
        tags: ["moksha", "liberation", "yoga", "मोक्ष", "मार्ग"],
        views: 298450,
        likes: 25670,
        isActive: true
      },
      {
        title: "चार युग - The Four Ages",
        description: "Understanding the cycle of Satya, Treta, Dwapara, and Kali Yuga.",
        category: "Explained",
        duration: 178,
        thumbnailUrl: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=600&h=400",
        videoUrl: "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4",
        tags: ["yuga", "ages", "time", "चार", "युग"],
        views: 267890,
        likes: 22450,
        isActive: true
      },
      {
        title: "आत्मा और परमात्मा - Soul and Supreme Soul",
        description: "The relationship between individual soul (Atma) and universal soul (Paramatma).",
        category: "Explained",
        duration: 189,
        thumbnailUrl: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=600&h=400",
        videoUrl: "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4",
        tags: ["atma", "soul", "spiritual", "आत्मा", "परमात्मा"],
        views: 234560,
        likes: 19890,
        isActive: true
      },
      {
        title: "त्रिदेव - The Holy Trinity",
        description: "Understanding Brahma the creator, Vishnu the preserver, and Shiva the destroyer.",
        category: "Explained",
        duration: 156,
        thumbnailUrl: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=600&h=400",
        videoUrl: "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4",
        tags: ["trinity", "brahma", "vishnu", "त्रिदेव", "शिव"],
        views: 345120,
        likes: 28940,
        isActive: true
      },
      {
        title: "मंत्र की शक्ति - Power of Mantras",
        description: "The science and spiritual power behind sacred mantras and their vibrations.",
        category: "Explained",
        duration: 167,
        thumbnailUrl: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=600&h=400",
        videoUrl: "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4",
        tags: ["mantra", "power", "vibration", "मंत्र", "शक्ति"],
        views: 389450,
        likes: 32670,
        isActive: true
      },
      {
        title: "तीर्थ यात्रा का महत्व - Importance of Pilgrimage",
        description: "Why visiting sacred places and pilgrimage holds deep spiritual significance.",
        category: "Explained",
        duration: 178,
        thumbnailUrl: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=600&h=400",
        videoUrl: "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4",
        tags: ["pilgrimage", "sacred", "spiritual", "तीर्थ", "यात्रा"],
        views: 298450,
        likes: 25670,
        isActive: true
      }
    ];

    // Create video entries with IDs and timestamps
    for (const video of sampleVideos) {
      const videoWithId: Video = {
        ...video,
        id: randomUUID(),
        createdAt: new Date()
      };
      this.videos.push(videoWithId);
    }
  }

  // Video operations implementation
  async getVideos(): Promise<Video[]> {
    return this.videos.filter(v => v.isActive);
  }

  async getVideosByCategory(category: string): Promise<Video[]> {
    return this.videos.filter(v => v.isActive && v.category === category);
  }

  async getVideoById(id: string): Promise<Video | null> {
    return this.videos.find(v => v.id === id && v.isActive) || null;
  }

  async searchVideos(query: string): Promise<Video[]> {
    const searchTerm = query.toLowerCase();
    return this.videos.filter(v => 
      v.isActive && (
        v.title.toLowerCase().includes(searchTerm) ||
        v.description.toLowerCase().includes(searchTerm) ||
        v.tags.some(tag => tag.toLowerCase().includes(searchTerm)) ||
        v.category.toLowerCase().includes(searchTerm)
      )
    );
  }

  async createVideo(video: InsertVideo): Promise<Video> {
    const validatedVideo = insertVideoSchema.parse(video);
    const newVideo: Video = {
      ...validatedVideo,
      id: randomUUID(),
      createdAt: new Date()
    };
    this.videos.push(newVideo);
    return newVideo;
  }

  async updateVideo(id: string, updates: Partial<InsertVideo>): Promise<Video | null> {
    const index = this.videos.findIndex(v => v.id === id);
    if (index === -1) return null;
    
    const updatedVideo = { ...this.videos[index], ...updates };
    this.videos[index] = updatedVideo;
    return updatedVideo;
  }

  async deleteVideo(id: string): Promise<boolean> {
    const index = this.videos.findIndex(v => v.id === id);
    if (index === -1) return false;
    
    this.videos[index].isActive = false;
    return true;
  }

  // User operations implementation
  async getUsers(): Promise<User[]> {
    return this.users;
  }

  async getUserById(id: string): Promise<User | null> {
    return this.users.find(u => u.id === id) || null;
  }

  async getUserByEmail(email: string): Promise<User | null> {
    return this.users.find(u => u.email === email) || null;
  }

  async createUser(user: InsertUser): Promise<User> {
    const validatedUser = insertUserSchema.parse(user);
    const newUser: User = {
      ...validatedUser,
      id: randomUUID(),
      createdAt: new Date()
    };
    this.users.push(newUser);
    return newUser;
  }

  async updateUser(id: string, updates: Partial<InsertUser>): Promise<User | null> {
    const index = this.users.findIndex(u => u.id === id);
    if (index === -1) return null;
    
    const updatedUser = { ...this.users[index], ...updates };
    this.users[index] = updatedUser;
    return updatedUser;
  }

  async deleteUser(id: string): Promise<boolean> {
    const index = this.users.findIndex(u => u.id === id);
    if (index === -1) return false;
    
    this.users.splice(index, 1);
    return true;
  }

  // Playlist operations implementation
  async getPlaylists(): Promise<Playlist[]> {
    return this.playlists;
  }

  async getPlaylistsByUserId(userId: string): Promise<Playlist[]> {
    return this.playlists.filter(p => p.userId === userId);
  }

  async getPlaylistById(id: string): Promise<Playlist | null> {
    return this.playlists.find(p => p.id === id) || null;
  }

  async createPlaylist(playlist: InsertPlaylist): Promise<Playlist> {
    const validatedPlaylist = insertPlaylistSchema.parse(playlist);
    const newPlaylist: Playlist = {
      ...validatedPlaylist,
      id: randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.playlists.push(newPlaylist);
    return newPlaylist;
  }

  async updatePlaylist(id: string, updates: Partial<InsertPlaylist>): Promise<Playlist | null> {
    const index = this.playlists.findIndex(p => p.id === id);
    if (index === -1) return null;
    
    const updatedPlaylist = { 
      ...this.playlists[index], 
      ...updates, 
      updatedAt: new Date() 
    };
    this.playlists[index] = updatedPlaylist;
    return updatedPlaylist;
  }

  async deletePlaylist(id: string): Promise<boolean> {
    const index = this.playlists.findIndex(p => p.id === id);
    if (index === -1) return false;
    
    this.playlists.splice(index, 1);
    return true;
  }

  // View history operations implementation
  async getViewHistory(): Promise<ViewHistory[]> {
    return this.viewHistories;
  }

  async getViewHistoryByUserId(userId: string): Promise<ViewHistory[]> {
    return this.viewHistories.filter(vh => vh.userId === userId);
  }

  async createViewHistory(viewHistory: InsertViewHistory): Promise<ViewHistory> {
    const validatedViewHistory = insertViewHistorySchema.parse(viewHistory);
    const newViewHistory: ViewHistory = {
      ...validatedViewHistory,
      id: randomUUID(),
      watchedAt: new Date()
    };
    this.viewHistories.push(newViewHistory);
    return newViewHistory;
  }

  async updateViewHistory(id: string, updates: Partial<InsertViewHistory>): Promise<ViewHistory | null> {
    const index = this.viewHistories.findIndex(vh => vh.id === id);
    if (index === -1) return null;
    
    const updatedViewHistory = { ...this.viewHistories[index], ...updates };
    this.viewHistories[index] = updatedViewHistory;
    return updatedViewHistory;
  }

  async deleteViewHistory(id: string): Promise<boolean> {
    const index = this.viewHistories.findIndex(vh => vh.id === id);
    if (index === -1) return false;
    
    this.viewHistories.splice(index, 1);
    return true;
  }
}

export const storage = new MemStorage();
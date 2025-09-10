import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import type { Video, User, Playlist, ViewHistory, Series, WatchLater, InsertVideo, InsertUser, InsertPlaylist, InsertViewHistory, InsertSeries, InsertWatchLater } from "@shared/schema";
import { insertVideoSchema, insertUserSchema, insertPlaylistSchema, insertViewHistorySchema, insertSeriesSchema, insertWatchLaterSchema } from "@shared/schema";

// Add type for Supabase error
interface SupabaseError {
  code: string;
  message: string;
}

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'your-service-role-key';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export interface IStorage {
  // Video operations
  getVideos(): Promise<Video[]>;
  getVideosByCategory(category: string): Promise<Video[]>;
  getVideoById(id: string): Promise<Video | null>;
  searchVideos(query: string): Promise<Video[]>;
  createVideo(video: InsertVideo): Promise<Video>;
  updateVideo(id: string, updates: Partial<InsertVideo>): Promise<Video | null>;
  deleteVideo(id: string): Promise<boolean>;
  incrementVideoViews(id: string): Promise<void>;
  incrementVideoLikes(id: string): Promise<void>;
  getRelatedVideos(params: { category: string; tags: string[]; excludeId?: string; limit?: number }): Promise<Video[]>;

  // Series operations
  getSeries(): Promise<Series[]>;
  getSeriesByCategory(category: string): Promise<Series[]>;
  getSeriesById(id: string): Promise<Series | null>;
  createSeries(series: InsertSeries): Promise<Series>;
  updateSeries(id: string, updates: Partial<InsertSeries>): Promise<Series | null>;
  deleteSeries(id: string): Promise<boolean>;
  getVideosBySeries(seriesId: string): Promise<Video[]>;

  // User operations
  getUsers(): Promise<User[]>;
  getUserById(id: string): Promise<User | null>;
  getUserByEmail(email: string): Promise<User | null>;
  getUserBySupabaseUid(supabaseUid: string): Promise<User | null>;
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

  // Watch later operations
  getWatchLaterByUserId(userId: string): Promise<WatchLater[]>;
  getWatchLaterWithVideos(userId: string): Promise<(WatchLater & { video: Video })[]>;
  addToWatchLater(watchLater: InsertWatchLater): Promise<WatchLater>;
  removeFromWatchLater(userId: string, videoId: string): Promise<boolean>;
  updateWatchLater(id: string, updates: Partial<InsertWatchLater>): Promise<WatchLater | null>;
  markAsWatched(userId: string, videoId: string): Promise<WatchLater | null>;
  updateWatchProgress(userId: string, videoId: string, progress: number): Promise<WatchLater | null>;
  isInWatchLater(userId: string, videoId: string): Promise<boolean>;
}

export class SupabaseStorage implements IStorage {
  // Video operations implementation
  async getVideos(): Promise<Video[]> {
    const { data, error } = await supabase
      .from('videos')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async getVideosByCategory(category: string): Promise<Video[]> {
    const { data, error } = await supabase
      .from('videos')
      .select('*')
      .eq('category', category)
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async getVideoById(id: string): Promise<Video | null> {
    const { data, error } = await supabase
      .from('videos')
      .select('*')
      .eq('id', id)
      .eq('is_active', true)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; // No rows returned
      throw error;
    }
    return data;
  }

  async searchVideos(query: string): Promise<Video[]> {
    if (!query.trim()) return [];
    
    const searchQuery = query.trim().toLowerCase();
    
    // Enhanced search that includes title, description, category, and tags
    // For tags, we use jsonb_array_elements_text to search within the JSON array
    const { data, error } = await supabase
      .from('videos')
      .select('*')
      .eq('is_active', true)
      .or(`title.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%,category.ilike.%${searchQuery}%`)
      .order('created_at', { ascending: false });

    if (error) throw error;
    
    // Post-process results to also search in tags and rank by relevance
    let results = data || [];
    
    // Filter and rank results for better relevance
    const rankedResults = results.map(video => {
      let relevanceScore = 0;
      const titleMatch = video.title.toLowerCase().includes(searchQuery);
      const descMatch = video.description?.toLowerCase().includes(searchQuery);
      const categoryMatch = video.category.toLowerCase().includes(searchQuery);
      const tagsMatch = video.tags?.some((tag: string) => 
        tag.toLowerCase().includes(searchQuery)
      );
      
      // Give different weights to different types of matches
      if (titleMatch) relevanceScore += 10;
      if (categoryMatch) relevanceScore += 8;
      if (tagsMatch) relevanceScore += 6;
      if (descMatch) relevanceScore += 4;
      
      // Exact matches get higher scores
      if (video.title.toLowerCase() === searchQuery) relevanceScore += 20;
      if (video.category.toLowerCase() === searchQuery) relevanceScore += 15;
      if (video.tags?.some((tag: string) => tag.toLowerCase() === searchQuery)) relevanceScore += 12;
      
      return { ...video, relevanceScore };
    });
    
    // Filter out videos with no relevance and sort by relevance score
    return rankedResults
      .filter(video => 
        video.relevanceScore > 0 || 
        video.tags?.some((tag: string) => 
          tag.toLowerCase().includes(searchQuery)
        )
      )
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .map(({ relevanceScore, ...video }) => video); // Remove relevanceScore from final result
  }

  // Helper function to transform camelCase to snake_case for database fields
  private transformVideoFields(video: any): any {
    return {
      title: video.title?.trim(),
      description: video.description?.trim(),
      category: video.category,
      duration: video.duration,
      // Handle both camelCase and snake_case input
      thumbnail_url: (video.thumbnailUrl || video.thumbnail_url)?.trim(),
      video_url: (video.videoUrl || video.video_url)?.trim(),
      tags: video.tags || [],
      content_type: video.contentType || video.content_type || 'standalone',
      series_id: (video.seriesId || video.series_id) && (video.seriesId || video.series_id).trim() !== '' ? (video.seriesId || video.series_id).trim() : null,
      episode_number: video.episodeNumber || video.episode_number || null,
      is_active: video.isActive !== undefined ? video.isActive : (video.is_active !== undefined ? video.is_active : true)
    };
  }

  async createVideo(video: InsertVideo): Promise<Video> {
    console.log("Storage.createVideo input:", video);
    
    // Transform camelCase fields to snake_case for database
    const transformedVideo = this.transformVideoFields(video);
    console.log("Transformed video data:", transformedVideo);
    
    const { data, error } = await supabase
      .from('videos')
      .insert(transformedVideo)
      .select()
      .single();

    if (error) {
      console.error("Supabase insert error:", error);
      throw error;
    }
    console.log("Video created successfully:", data);
    return data;
  }

  async updateVideo(id: string, updates: Partial<InsertVideo>): Promise<Video | null> {
    const { data, error } = await supabase
      .from('videos')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }
    return data;
  }

  async deleteVideo(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('videos')
      .update({ is_active: false })
      .eq('id', id);

    if (error) throw error;
    return true;
  }

  async incrementVideoViews(id: string): Promise<void> {
    const { error } = await supabase.rpc('increment_video_views', { video_id: id });
    if (error) throw error;
  }

  async incrementVideoLikes(id: string): Promise<void> {
    const { error } = await supabase.rpc('increment_video_likes', { video_id: id });
    if (error) throw error;
  }

  async getRelatedVideos(params: { category: string; tags: string[]; excludeId?: string; limit?: number }): Promise<Video[]> {
    const { category, tags, excludeId, limit = 20 } = params;
    
    console.log('Getting related videos for:', { category, tags, excludeId, limit });
    
    // Start with a simple query to get videos from the same category
    let query = supabase
      .from('videos')
      .select('*')
      .eq('is_active', true)
      .eq('category', category); // Start with same category only
    
    // Exclude the current video if specified
    if (excludeId) {
      query = query.neq('id', excludeId);
    }
    
    // Order by views descending for most popular first
    query = query
      .order('views', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(limit);
    
    const { data: categoryData, error: categoryError } = await query;
    
    if (categoryError) {
      console.error('Category query error:', categoryError);
      throw categoryError;
    }
    
    console.log('Category videos found:', categoryData?.length);
    
    // If we don't have enough videos from the same category, get more from other categories
    let allRelatedVideos = categoryData || [];
    
    if (allRelatedVideos.length < limit) {
      // Get additional videos that share tags or are from any category
      const remainingLimit = limit - allRelatedVideos.length;
      
      let additionalQuery = supabase
        .from('videos')
        .select('*')
        .eq('is_active', true)
        .neq('category', category); // Different category
      
      // Exclude current video and already selected videos
      if (excludeId) {
        additionalQuery = additionalQuery.neq('id', excludeId);
      }
      
      const selectedIds = allRelatedVideos.map(v => v.id);
      if (selectedIds.length > 0) {
        additionalQuery = additionalQuery.not('id', 'in', `(${selectedIds.join(',')})`);
      }
      
      additionalQuery = additionalQuery
        .order('views', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(remainingLimit);
      
      const { data: additionalData, error: additionalError } = await additionalQuery;
      
      if (additionalError) {
        console.error('Additional query error:', additionalError);
        // Don't throw, just use what we have
      } else {
        console.log('Additional videos found:', additionalData?.length);
        allRelatedVideos = [...allRelatedVideos, ...(additionalData || [])];
      }
    }
    
    // Now sort the combined results to prioritize by relevance
    const sortedData = allRelatedVideos.sort((a, b) => {
      let scoreA = 0;
      let scoreB = 0;
      
      // Same category gets highest priority
      if (a.category === category) scoreA += 1000;
      if (b.category === category) scoreB += 1000;
      
      // Count shared tags if available
      if (tags && tags.length > 0) {
        const sharedTagsA = (a.tags || []).filter(tag => tags.includes(tag)).length;
        const sharedTagsB = (b.tags || []).filter(tag => tags.includes(tag)).length;
        scoreA += sharedTagsA * 100;
        scoreB += sharedTagsB * 100;
      }
      
      // Add view count as final tiebreaker
      scoreA += (a.views || 0) / 1000; // Scale down views so they don't override category/tag scoring
      scoreB += (b.views || 0) / 1000;
      
      return scoreB - scoreA;
    });
    
    console.log('Final related videos count:', sortedData.length);
    return sortedData.slice(0, limit);
  }

  // Series operations implementation
  async getSeries(): Promise<Series[]> {
    const { data, error } = await supabase
      .from('series')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async getSeriesByCategory(category: string): Promise<Series[]> {
    const { data, error } = await supabase
      .from('series')
      .select('*')
      .eq('category', category)
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async getSeriesById(id: string): Promise<Series | null> {
    const { data, error } = await supabase
      .from('series')
      .select('*')
      .eq('id', id)
      .eq('is_active', true)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }
    return data;
  }

  async createSeries(series: InsertSeries): Promise<Series> {
    const validatedSeries = insertSeriesSchema.parse(series);
    const { data, error } = await supabase
      .from('series')
      .insert(validatedSeries)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateSeries(id: string, updates: Partial<InsertSeries>): Promise<Series | null> {
    const { data, error } = await supabase
      .from('series')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }
    return data;
  }

  async deleteSeries(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('series')
      .update({ is_active: false })
      .eq('id', id);

    if (error) throw error;
    return true;
  }

  async getVideosBySeries(seriesId: string): Promise<Video[]> {
    const { data, error } = await supabase
      .from('videos')
      .select('*')
      .eq('series_id', seriesId)
      .eq('is_active', true)
      .order('episode_number', { ascending: true });

    if (error) throw error;
    return data || [];
  }

  // User operations implementation
  async getUsers(): Promise<User[]> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async getUserById(id: string): Promise<User | null> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }
    return data;
  }

  async getUserByEmail(email: string): Promise<User | null> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }
    return data;
  }

  async getUserBySupabaseUid(supabaseUid: string): Promise<User | null> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('supabase_uid', supabaseUid)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }
    return data;
  }

  async createUser(user: InsertUser): Promise<User> {
    const validatedUser = insertUserSchema.parse(user);
    
    const { data, error } = await supabase
      .from('users')
      .insert(validatedUser)
      .select()
      .single();

    if (error) {
      console.error("Database error creating user:", error);
      throw error;
    }
    
    return data;
  }

  async updateUser(id: string, updates: Partial<InsertUser>): Promise<User | null> {
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }
    return data;
  }

  async deleteUser(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return true;
  }

  // Playlist operations implementation
  async getPlaylists(): Promise<Playlist[]> {
    const { data, error } = await supabase
      .from('playlists')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async getPlaylistsByUserId(userId: string): Promise<Playlist[]> {
    const { data, error } = await supabase
      .from('playlists')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async getPlaylistById(id: string): Promise<Playlist | null> {
    const { data, error } = await supabase
      .from('playlists')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }
    return data;
  }

  async createPlaylist(playlist: InsertPlaylist): Promise<Playlist> {
    const validatedPlaylist = insertPlaylistSchema.parse(playlist);
    const { data, error } = await supabase
      .from('playlists')
      .insert(validatedPlaylist)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updatePlaylist(id: string, updates: Partial<InsertPlaylist>): Promise<Playlist | null> {
    const { data, error } = await supabase
      .from('playlists')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }
    return data;
  }

  async deletePlaylist(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('playlists')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return true;
  }

  // View history operations implementation
  async getViewHistory(): Promise<ViewHistory[]> {
    const { data, error } = await supabase
      .from('view_history')
      .select('*')
      .order('watched_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async getViewHistoryByUserId(userId: string): Promise<ViewHistory[]> {
    const { data, error } = await supabase
      .from('view_history')
      .select('*')
      .eq('user_id', userId)
      .order('watched_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async createViewHistory(viewHistory: InsertViewHistory): Promise<ViewHistory> {
    const validatedViewHistory = insertViewHistorySchema.parse(viewHistory);
    const { data, error } = await supabase
      .from('view_history')
      .insert(validatedViewHistory)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateViewHistory(id: string, updates: Partial<InsertViewHistory>): Promise<ViewHistory | null> {
    const { data, error } = await supabase
      .from('view_history')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }
    return data;
  }

  async deleteViewHistory(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('view_history')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return true;
  }

  // Watch later operations implementation
  async getWatchLaterByUserId(userId: string): Promise<WatchLater[]> {
    const { data, error } = await supabase
      .from('watch_later')
      .select('*')
      .eq('userId', userId)
      .order('priority', { ascending: false })
      .order('addedAt', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async getWatchLaterWithVideos(userId: string): Promise<(WatchLater & { video: Video })[]> {
    // First get watch later items
    const { data: watchLaterData, error: watchLaterError } = await supabase
      .from('watch_later')
      .select('*')
      .eq('userId', userId)
      .order('priority', { ascending: false })
      .order('addedAt', { ascending: false });

    if (watchLaterError) throw watchLaterError;
    if (!watchLaterData || watchLaterData.length === 0) return [];

    // Get video IDs
    const videoIds = watchLaterData.map(item => item.videoId);

    // Fetch videos
    const { data: videosData, error: videosError } = await supabase
      .from('videos')
      .select('*')
      .in('id', videoIds)
      .eq('is_active', true);

    if (videosError) throw videosError;

    // Combine the data
    const videosMap = new Map(videosData?.map(video => [video.id, video]) || []);
    
    return watchLaterData
      .map(watchLaterItem => ({
        ...watchLaterItem,
        video: videosMap.get(watchLaterItem.videoId)
      }))
      .filter(item => item.video) // Only include items with valid videos
      .map(item => item as WatchLater & { video: Video });
  }

  async addToWatchLater(watchLater: InsertWatchLater): Promise<WatchLater> {
    const validatedWatchLater = insertWatchLaterSchema.parse(watchLater);
    
    // Check if already exists
    const existing = await this.isInWatchLater(validatedWatchLater.userId, validatedWatchLater.videoId);
    if (existing) {
      // Return the existing entry instead of throwing an error
      const { data, error } = await supabase
        .from('watch_later')
        .select('*')
        .eq('userId', validatedWatchLater.userId)
        .eq('videoId', validatedWatchLater.videoId)
        .single();
      
      if (error) throw error;
      return data;
    }

    const { data, error } = await supabase
      .from('watch_later')
      .insert(validatedWatchLater)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async removeFromWatchLater(userId: string, videoId: string): Promise<boolean> {
    const { error } = await supabase
      .from('watch_later')
      .delete()
      .eq('userId', userId)
      .eq('videoId', videoId);

    if (error) throw error;
    return true;
  }

  async updateWatchLater(id: string, updates: Partial<InsertWatchLater>): Promise<WatchLater | null> {
    const { data, error } = await supabase
      .from('watch_later')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }
    return data;
  }

  async markAsWatched(userId: string, videoId: string): Promise<WatchLater | null> {
    const { data, error } = await supabase
      .from('watch_later')
      .update({ 
        isWatched: true, 
        watchedAt: new Date().toISOString() 
      })
      .eq('userId', userId)
      .eq('videoId', videoId)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }
    return data;
  }

  async updateWatchProgress(userId: string, videoId: string, progress: number): Promise<WatchLater | null> {
    const { data, error } = await supabase
      .from('watch_later')
      .update({ progress })
      .eq('userId', userId)
      .eq('videoId', videoId)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }
    return data;
  }

  async isInWatchLater(userId: string, videoId: string): Promise<boolean> {
    const { data, error } = await supabase
      .from('watch_later')
      .select('id')
      .eq('userId', userId)
      .eq('videoId', videoId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return false;
      throw error;
    }
    return !!data;
  }
}

export const storage = new SupabaseStorage();
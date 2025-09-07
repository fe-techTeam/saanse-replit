import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import type { Video, User, Playlist, ViewHistory, Series, InsertVideo, InsertUser, InsertPlaylist, InsertViewHistory, InsertSeries } from "@shared/schema";
import { insertVideoSchema, insertUserSchema, insertPlaylistSchema, insertViewHistorySchema, insertSeriesSchema } from "@shared/schema";

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
    const { data, error } = await supabase
      .from('videos')
      .select('*')
      .eq('is_active', true)
      .or(`title.ilike.%${query}%,description.ilike.%${query}%,category.ilike.%${query}%`)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
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

    if (error) throw error;
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
}

export const storage = new SupabaseStorage();
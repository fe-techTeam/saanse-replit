import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import type { Video, User, Playlist, ViewHistory, Series, WatchLater, InsertVideo, InsertUser, InsertPlaylist, InsertViewHistory, InsertSeries, InsertWatchLater, OtpVerification, InsertOtpVerification } from "@shared/schema";
import { insertVideoSchema, insertUserSchema, insertPlaylistSchema, insertViewHistorySchema, insertSeriesSchema, insertWatchLaterSchema, insertOtpVerificationSchema } from "@shared/schema";

// Add type for Supabase error
interface SupabaseError {
  code: string;
  message: string;
}

const supabase = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

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
  getAllVideosBySeries(seriesId: string): Promise<Video[]>;
  shiftEpisodesForInsert(seriesId: string, insertEpisodeNumber: number): Promise<void>;
  renumberEpisodesAfterDeletion(seriesId: string, deletedEpisodeNumber: number): Promise<void>;

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

  // OTP operations
  createOtpVerification(otp: InsertOtpVerification): Promise<OtpVerification>;
  findValidOtp(otp: string, mobileNumber: string): Promise<OtpVerification | null>;
  markOtpAsUsed(otpId: string): Promise<boolean>;
  getUserByMobileNumber(mobileNumber: string): Promise<User | null>;
  deleteExpiredOtps(): Promise<boolean>;
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
      category: video.category?.trim(),
      duration: video.duration,
      thumbnail_url: (video.thumbnailUrl || video.thumbnail_url)?.trim(),
      video_url: (video.videoUrl || video.video_url)?.trim(),
      tags: video.tags || [],
      series_id: (video.seriesId || video.series_id)?.trim(),
      episode_number: video.episodeNumber ?? video.episode_number,
      is_active: video.isActive !== undefined ? video.isActive : (video.is_active !== undefined ? video.is_active : true),
      content_type: video.content_type || 'standalone', // Add content_type field
      // Handle new streaming fields
      streaming_urls: video.streamingUrls || video.streaming_urls || {},
      cloudinary_meta: video.cloudinaryMeta || video.cloudinary_meta || {},
      cloudinary_public_id: (video.cloudinaryPublicId || video.cloudinary_public_id)?.trim(),
    };
  }

  async createVideo(video: InsertVideo): Promise<Video> {
    console.log("Storage.createVideo input:", video);
    
    // Transform camelCase fields to snake_case for database
    const transformedVideo = this.transformVideoFields(video);
    console.log("Transformed video data:", transformedVideo);
    
    // If this is a series video, handle episode shifting
    if (transformedVideo.series_id && transformedVideo.episode_number) {
      console.log(`Calling shiftEpisodesForInsert for series ${transformedVideo.series_id}, episode ${transformedVideo.episode_number}`);
      try {
        await this.shiftEpisodesForInsert(transformedVideo.series_id, transformedVideo.episode_number);
        console.log("Episode shifting completed successfully");
      } catch (shiftError) {
        console.error("Error during episode shifting:", shiftError);
        throw shiftError;
      }
    } else {
      console.log("No episode shifting needed (not a series video)");
    }
    
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
    
    // Update series episode count if video has a series_id
    if (data.series_id) {
      try {
        await this.updateSeriesEpisodeCount(data.series_id);
        console.log(`Updated episode count for series ${data.series_id}`);
      } catch (countError) {
        console.error("Error updating series episode count:", countError);
        // Don't throw error here as video creation was successful
      }
    }
    
    return data;
  }

  async updateVideo(id: string, updates: Partial<InsertVideo>): Promise<Video | null> {
    console.log('updateVideo called with:', { id, updates });
    
    // Get the current video to check for series_id changes
    const { data: currentVideo, error: fetchError } = await supabase
      .from('videos')
      .select('series_id')
      .eq('id', id)
      .single();
    
    if (fetchError) {
      console.error('Error fetching current video:', fetchError);
    }
    
    const { data, error } = await supabase
      .from('videos')
      .update(updates as any)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('updateVideo error:', error);
      if (error.code === 'PGRST116') return null;
      throw error;
    }
    console.log('updateVideo success:', data);
    
    // Update series episode counts for both old and new series
    const seriesToUpdate = new Set<string>();
    
    // Add old series_id if it exists
    if (currentVideo?.series_id) {
      seriesToUpdate.add(currentVideo.series_id);
    }
    
    // Add new series_id if it exists and is different
    if (data.series_id && data.series_id !== currentVideo?.series_id) {
      seriesToUpdate.add(data.series_id);
    }
    
    // Update episode counts for affected series
    for (const seriesId of seriesToUpdate) {
      try {
        await this.updateSeriesEpisodeCount(seriesId);
        console.log(`Updated episode count for series ${seriesId}`);
      } catch (countError) {
        console.error(`Error updating series episode count for ${seriesId}:`, countError);
        // Don't throw error here as video update was successful
      }
    }
    
    return data;
  }

  async deleteVideo(id: string): Promise<boolean> {
    // Get the current video to find its series_id and episode_number
    const { data: currentVideo, error: fetchError } = await supabase
      .from('videos')
      .select('series_id, episode_number')
      .eq('id', id)
      .single();
    
    if (fetchError) {
      console.error('Error fetching current video for deletion:', fetchError);
    }
    
    const { error } = await supabase
      .from('videos')
      .update({ is_active: false })
      .eq('id', id);

    if (error) throw error;
    
    // If this was a series video, renumber remaining episodes
    if (currentVideo?.series_id && currentVideo?.episode_number) {
      console.log(`Video deletion detected: series_id=${currentVideo.series_id}, episode_number=${currentVideo.episode_number}`);
      try {
        console.log('Calling renumberEpisodesAfterDeletion...');
        await this.renumberEpisodesAfterDeletion(currentVideo.series_id, currentVideo.episode_number);
        console.log(`✅ Renumbered episodes after deletion in series ${currentVideo.series_id}`);
      } catch (renumberError) {
        console.error("❌ Error renumbering episodes after deletion:", renumberError);
        // Don't throw error here as video deletion was successful
      }
    } else {
      console.log('No series video detected, skipping renumbering');
    }
    
    // Update series episode count if video had a series_id
    if (currentVideo?.series_id) {
      try {
        await this.updateSeriesEpisodeCount(currentVideo.series_id);
        console.log(`Updated episode count for series ${currentVideo.series_id} after video deletion`);
      } catch (countError) {
        console.error(`Error updating series episode count for ${currentVideo.series_id}:`, countError);
        // Don't throw error here as video deletion was successful
      }
    }
    
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
    const seriesWithDefaults = {
      ...series,
      thumbnail_url: series.thumbnail_url || 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=600&h=400'
    };
    
    const validatedSeries = insertSeriesSchema.parse(seriesWithDefaults);
    
    const dbSeries = {
      title: validatedSeries.title,
      slug: validatedSeries.slug,
      description: validatedSeries.description,
      category: validatedSeries.category || 'general',
      thumbnail_url: validatedSeries.thumbnail_url || 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=600&h=400',
      banner_url: validatedSeries.banner_url,
      status: validatedSeries.status || 'draft',
    };
    
    const { data, error } = await supabase
      .from('series')
      .insert(dbSeries)
      .select()
      .single();

    if (error) {
      console.error("Error creating series:", error.message);
      throw error;
    }
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

  async getAllVideosBySeries(seriesId: string): Promise<Video[]> {
    const { data, error } = await supabase
      .from('videos')
      .select('*')
      .eq('series_id', seriesId)
      .order('episode_number', { ascending: true });

    if (error) throw error;
    return data || [];
  }

  async shiftEpisodesForInsert(seriesId: string, insertEpisodeNumber: number): Promise<void> {
    console.log(`Shifting episodes for series ${seriesId} to insert at episode ${insertEpisodeNumber}`);
    
    // Get all videos in the series (active and inactive) to check for conflicts
    const { data: allVideos, error: fetchError } = await supabase
      .from('videos')
      .select('id, episode_number, is_active')
      .eq('series_id', seriesId)
      .order('episode_number', { ascending: true });

    if (fetchError) {
      console.error('Error fetching videos for shifting:', fetchError);
      throw fetchError;
    }

    if (!allVideos || allVideos.length === 0) {
      console.log('No videos found, no shifting needed');
      return;
    }

    // Check if the target episode number already exists
    const existingVideo = allVideos.find(v => v.episode_number === insertEpisodeNumber);
    if (existingVideo) {
      console.log(`Episode ${insertEpisodeNumber} already exists, shifting all episodes >= ${insertEpisodeNumber}`);
      
      // Get all videos that need to be shifted (episode_number >= insertEpisodeNumber)
      const videosToShift = allVideos.filter(v => v.episode_number >= insertEpisodeNumber);
      
      if (videosToShift.length === 0) {
        console.log('No videos need to be shifted');
        return;
      }

      console.log(`Found ${videosToShift.length} videos to shift`);

      // Shift videos by incrementing their episode numbers
      // Process in reverse order to avoid conflicts
      for (let i = videosToShift.length - 1; i >= 0; i--) {
        const video = videosToShift[i];
        const newEpisodeNumber = video.episode_number + 1;
        console.log(`Shifting video ${video.id} from episode ${video.episode_number} to ${newEpisodeNumber}`);
        
        const { error: updateError } = await supabase
          .from('videos')
          .update({ episode_number: newEpisodeNumber })
          .eq('id', video.id);

        if (updateError) {
          console.error(`Error shifting video ${video.id}:`, updateError);
          throw updateError;
        }
      }
    } else {
      console.log(`Episode ${insertEpisodeNumber} is available, no shifting needed`);
    }

    console.log('Episode shifting completed successfully');
  }

  async renumberEpisodesAfterDeletion(seriesId: string, deletedEpisodeNumber: number): Promise<void> {
    console.log(`Renumbering episodes for series ${seriesId} after deleting episode ${deletedEpisodeNumber}`);
    
    // Get all active videos in the series, ordered by creation date to maintain proper order
    const { data: activeVideos, error: fetchError } = await supabase
      .from('videos')
      .select('id, title, episode_number, created_at')
      .eq('series_id', seriesId)
      .eq('is_active', true)
      .order('created_at', { ascending: true });

    if (fetchError) {
      console.error('Error fetching active videos for renumbering:', fetchError);
      throw fetchError;
    }

    if (!activeVideos || activeVideos.length === 0) {
      console.log('No active videos found, no renumbering needed');
      return;
    }

    console.log(`Found ${activeVideos.length} active videos to renumber`);

    // Step 1: Move ALL videos in this series to very high temporary positions to avoid conflicts
    console.log('Step 1: Moving ALL videos to temporary positions...');
    
    const { data: allVideosInSeries } = await supabase
      .from('videos')
      .select('id, title, episode_number, is_active')
      .eq('series_id', seriesId)
      .order('episode_number', { ascending: true });

    if (allVideosInSeries && allVideosInSeries.length > 0) {
      console.log(`Found ${allVideosInSeries.length} total videos in series`);
      
      for (let i = 0; i < allVideosInSeries.length; i++) {
        const video = allVideosInSeries[i];
        const tempEpisodeNumber = 80000 + i; // Use very high numbers to avoid conflicts
        
        console.log(`  Moving ${video.title}: Ep ${video.episode_number} -> Ep ${tempEpisodeNumber} (temp)`);
        
        const { error: updateError } = await supabase
          .from('videos')
          .update({ episode_number: tempEpisodeNumber })
          .eq('id', video.id);

        if (updateError) {
          console.error(`    Error moving video ${video.id}:`, updateError);
          throw updateError;
        }
      }
    }

    // Step 2: Move active videos to their final sequential positions (1, 2, 3, etc.)
    console.log('Step 2: Moving active videos to final sequential positions...');
    for (let i = 0; i < activeVideos.length; i++) {
      const video = activeVideos[i];
      const finalEpisodeNumber = i + 1;
      
      console.log(`  Finalizing ${video.title}: Ep ${video.episode_number} -> Ep ${finalEpisodeNumber}`);
      
      const { error: updateError } = await supabase
        .from('videos')
        .update({ episode_number: finalEpisodeNumber })
        .eq('id', video.id);

      if (updateError) {
        console.error(`    Error finalizing video ${video.id}:`, updateError);
        throw updateError;
      }
    }

    console.log('Episode renumbering completed successfully');
  }

  async renumberEpisodesInSeries(seriesId: string): Promise<void> {
    console.log(`Renumbering episodes in series ${seriesId} to be sequential starting from 1`);
    
    // Get all active videos in the series, ordered by creation date
    const { data: videos, error: fetchError } = await supabase
      .from('videos')
      .select('id, title, episode_number, created_at')
      .eq('series_id', seriesId)
      .eq('is_active', true)
      .order('created_at', { ascending: true });

    if (fetchError) {
      console.error('Error fetching videos for renumbering:', fetchError);
      throw fetchError;
    }

    if (!videos || videos.length === 0) {
      console.log('No active videos found, no renumbering needed');
      return;
    }

    console.log(`Found ${videos.length} active videos to renumber`);

    // First, set all episode numbers to temporary negative values to avoid conflicts
    console.log('Setting temporary episode numbers to avoid conflicts...');
    for (let i = 0; i < videos.length; i++) {
      const video = videos[i];
      const tempEpisodeNumber = -(i + 10000); // Use large negative numbers as temp values
      
      const { error: tempError } = await supabase
        .from('videos')
        .update({ episode_number: tempEpisodeNumber })
        .eq('id', video.id);

      if (tempError) {
        console.error(`Error setting temp episode number for video ${video.id}:`, tempError);
        throw tempError;
      }
    }

    // Now set the proper sequential episode numbers
    console.log('Setting proper sequential episode numbers...');
    for (let i = 0; i < videos.length; i++) {
      const video = videos[i];
      const newEpisodeNumber = i + 1;
      
      console.log(`Renumbering video ${video.id} from temp to episode ${newEpisodeNumber}: ${video.title}`);
      
      const { error: updateError } = await supabase
        .from('videos')
        .update({ episode_number: newEpisodeNumber })
        .eq('id', video.id);

      if (updateError) {
        console.error(`Error renumbering video ${video.id}:`, updateError);
        throw updateError;
      }
    }

    console.log(`Successfully renumbered ${videos.length} episodes to be sequential (1, 2, 3, ...)`);
  }

  async updateSeriesEpisodeCount(seriesId: string): Promise<void> {
    const { count } = await supabase
      .from('videos')
      .select('*', { count: 'exact', head: true })
      .eq('series_id', seriesId)
      .eq('is_active', true);
    
    await supabase
      .from('series')
      .update({ total_episodes: count || 0 })
      .eq('id', seriesId);
  }

  async updateAllSeriesEpisodeCounts(): Promise<void> {
    // Update all series episode counts based on actual video count
    const { error } = await supabase.rpc('update_series_episode_counts');
    if (error) {
      // If RPC doesn't exist, do it manually
      const { data: series, error: seriesError } = await supabase
        .from('series')
        .select('id');
      
      if (seriesError) throw seriesError;
      
      for (const s of series || []) {
        await this.updateSeriesEpisodeCount(s.id);
      }
    }
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
    
    // Map camelCase to snake_case for database
    const dbUser = {
      supabase_uid: validatedUser.supabaseUid,
      email: validatedUser.email, // Required until migration is complete
      display_name: validatedUser.displayName,
      photo_url: validatedUser.photoURL,
      mobile_number: validatedUser.mobileNumber || null, // Keep legacy field for compatibility
    };
    
    // Only add mobile field if it's provided and the column exists
    if (validatedUser.mobile) {
      dbUser.mobile = validatedUser.mobile;
    }
    
    const { data, error } = await supabase
      .from('users')
      .insert(dbUser)
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

  // OTP operations implementation
  async createOtpVerification(otp: InsertOtpVerification): Promise<OtpVerification> {
    // Direct mapping from input to database format
    const dbOtp = {
      mobile_number: otp.mobileNumber,
      otp: otp.otp,
      expires_at: otp.expiresAt,
      is_used: otp.isUsed || false,
      user_id: otp.userId || null,
    };
    
    console.log('Creating OTP with data:', dbOtp);
    
    const { data, error } = await supabase
      .from('otp_verifications')
      .insert(dbOtp)
      .select()
      .single();

    if (error) {
      console.error('Error creating OTP:', error);
      throw error;
    }
    return data;
  }

  async findValidOtp(otp: string, mobileNumber: string): Promise<OtpVerification | null> {
    console.log('Searching for OTP:', { otp, mobileNumber });
    
    // First, let's check what OTPs exist for this mobile number
    const { data: allOtps, error: allError } = await supabase
      .from('otp_verifications')
      .select('*')
      .eq('mobile_number', mobileNumber)
      .order('created_at', { ascending: false })
      .limit(5);
    
    console.log('All OTPs for mobile:', allOtps);
    
    // Now search for the specific OTP
    const { data, error } = await supabase
      .from('otp_verifications')
      .select('*')
      .eq('otp', otp)
      .eq('mobile_number', mobileNumber)
      .eq('is_used', false)
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    console.log('OTP search result:', { data, error });

    if (error) {
      if (error.code === 'PGRST116') {
        console.log('No OTP found (PGRST116)');
        return null;
      }
      throw error;
    }
    return data;
  }

  async markOtpAsUsed(otpId: string): Promise<boolean> {
    const { error } = await supabase
      .from('otp_verifications')
      .update({ 
        is_used: true, 
        used_at: new Date().toISOString() 
      })
      .eq('id', otpId);

    if (error) throw error;
    return true;
  }

  async getUserByMobileNumber(mobileNumber: string): Promise<User | null> {
    // First try the new mobile column, then fallback to legacy mobile_number column
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .or(`mobile.eq.${mobileNumber},mobile_number.eq.${mobileNumber}`)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }
    return data;
  }

  async deleteExpiredOtps(): Promise<boolean> {
    const { error } = await supabase
      .from('otp_verifications')
      .delete()
      .lt('expires_at', new Date().toISOString());

    if (error) throw error;
    return true;
  }
}

export const storage = new SupabaseStorage();
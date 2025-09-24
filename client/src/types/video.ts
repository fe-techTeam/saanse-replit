export interface VideoType {
  id: string;
  title: string;
  description?: string;
  category: string;
  duration: number;
  thumbnail_url: string;
  video_url: string;
  likes: number;
  views: number;
  tags: string[];
  is_active: boolean;
  content_type: 'standalone' | 'series';
  series_id?: string;
  episode_number?: number;
  created_at: string;
  subtitleUrl?: string;
  seriesName?: string;
}

export interface SeriesType {
  id: string;
  title: string;
  description?: string;
  category: string;
  thumbnail_url: string;
  banner_url?: string;
  total_episodes: number;
  is_active: boolean;
  created_at: string;
  slug: string;
  status: string;
  updated_at: string;
}

// Alias for consistency with shared schema
export type Series = SeriesType;

export interface PlaylistType {
  id: string;
  userId: string;
  name: string;
  type: 'favorites' | 'watchLater' | 'custom';
  videoIds: string[];
  createdAt: Date;
}

export interface UserType {
  id: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  supabaseUid: string;
  createdAt: Date;
}

export interface ViewHistoryType {
  id: string;
  userId: string;
  videoId: string;
  watchedAt: Date;
  progress: number;
}

export interface WatchLaterType {
  id: string;
  userId: string;
  videoId: string;
  addedAt: Date;
  priority: number;
  notes?: string;
  isWatched: boolean;
  watchedAt?: Date;
  progress: number;
}

export interface WatchLaterWithVideoType extends WatchLaterType {
  video: VideoType;
}

export const VIDEO_CATEGORIES = [
  'Ramayana',
  'Krishna',
  'Mahabharata',
  'Shiva',
  'Hanuman',
  'Ganesha',
  'Devi',
  'Festivals',
  'Bhajans',
  'Explained'
] as const;

export type VideoCategory = typeof VIDEO_CATEGORIES[number];

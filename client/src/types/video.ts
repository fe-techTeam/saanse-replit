export interface VideoType {
  id: string;
  title: string;
  description?: string;
  category: string;
  duration: number;
  thumbnailUrl: string;
  videoUrl: string;
  likes: number;
  views: number;
  tags: string[];
  isActive: boolean;
  contentType: 'standalone' | 'series';
  seriesId?: string;
  episodeNumber?: number;
  createdAt: Date;
}

export interface SeriesType {
  id: string;
  title: string;
  description?: string;
  category: string;
  thumbnailUrl: string;
  bannerUrl?: string;
  totalEpisodes: number;
  isActive: boolean;
  createdAt: Date;
}

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

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
  firebaseUid: string;
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
  'Mahabharata', 
  'Krishna',
  'Shiva',
  'Bhajans',
  'Explained'
] as const;

export type VideoCategory = typeof VIDEO_CATEGORIES[number];

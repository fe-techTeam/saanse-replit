import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, boolean, timestamp, jsonb, numeric, unique, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: text("email").notNull().unique(),
  displayName: text("display_name"),
  photoURL: text("photo_url"),
  supabaseUid: text("supabase_uid").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const videos = pgTable("videos", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  description: text("description"),
  category: text("category").notNull(),
  duration: numeric("duration", { precision: 10, scale: 6 }).notNull(), // in seconds with decimals
  thumbnailUrl: text("thumbnail_url").notNull(),
  videoUrl: text("video_url").notNull(),
  likes: integer("likes").default(0).notNull(),
  views: integer("views").default(0).notNull(),
  tags: jsonb("tags").$type<string[]>().default([]).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  contentType: text("content_type").notNull().default('standalone'), // 'standalone' or 'series'
  seriesId: text("series_id"), // null for standalone content, references series.id for series content
  episodeNumber: integer("episode_number"), // null for standalone, episode number for series
  cloudinaryPublicId: text("cloudinary_public_id"), // Cloudinary public ID for the video
  streamingUrls: jsonb("streaming_urls"), // JSON object containing different format URLs
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const series = pgTable("series", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  description: text("description"),
  category: text("category").notNull(),
  thumbnailUrl: text("thumbnail_url").notNull(),
  bannerUrl: text("banner_url"),
  totalEpisodes: integer("total_episodes").default(0).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const playlists = pgTable("playlists", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: text("user_id").notNull(),
  name: text("name").notNull(),
  type: text("type").notNull(), // 'favorites', 'watchLater', 'custom'
  videoIds: jsonb("video_ids").$type<string[]>().default([]).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const viewHistory = pgTable("view_history", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: text("user_id").notNull(),
  videoId: text("video_id").notNull(),
  watchedAt: timestamp("watched_at").defaultNow().notNull(),
  progress: numeric("progress", { precision: 10, scale: 6 }).default(0).notNull(), // in seconds with decimals
});

export const watchLater = pgTable("watch_later", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: text("user_id").notNull(),
  videoId: text("video_id").notNull(),
  addedAt: timestamp("added_at").defaultNow().notNull(),
  priority: integer("priority").default(0).notNull(), // Higher number = higher priority
  notes: text("notes"), // Optional user notes
  isWatched: boolean("is_watched").default(false).notNull(),
  watchedAt: timestamp("watched_at"), // When the video was actually watched
  progress: numeric("progress", { precision: 10, scale: 6 }).default(0).notNull(), // Last watched position
}, (table) => ({
  // Composite unique constraint to prevent duplicate entries
  userVideoUnique: unique("user_video_unique").on(table.userId, table.videoId),
  // Indexes for better performance
  userIdIdx: index("watch_later_user_id_idx").on(table.userId),
  videoIdIdx: index("watch_later_video_id_idx").on(table.videoId),
  addedAtIdx: index("watch_later_added_at_idx").on(table.addedAt),
  priorityIdx: index("watch_later_priority_idx").on(table.priority),
}));

export const adminUsers = pgTable("admin_users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: text("email").notNull().unique(),
  displayName: text("display_name"),
  role: text("role").notNull().default('admin'), // 'admin' or 'super_admin'
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  lastLoginAt: timestamp("last_login_at"),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const insertVideoSchema = createInsertSchema(videos).omit({
  id: true,
  likes: true,
  views: true,
  createdAt: true,
});

export const insertSeriesSchema = createInsertSchema(series).omit({
  id: true,
  totalEpisodes: true,
  createdAt: true,
});

export const insertPlaylistSchema = createInsertSchema(playlists).omit({
  id: true,
  createdAt: true,
});

export const insertViewHistorySchema = createInsertSchema(viewHistory).omit({
  id: true,
  watchedAt: true,
});

export const insertWatchLaterSchema = createInsertSchema(watchLater).omit({
  id: true,
  addedAt: true,
  watchedAt: true,
});

export const insertAdminUserSchema = createInsertSchema(adminUsers).omit({
  id: true,
  createdAt: true,
  lastLoginAt: true,
});

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Video = typeof videos.$inferSelect;
export type InsertVideo = z.infer<typeof insertVideoSchema>;
export type Series = typeof series.$inferSelect;
export type InsertSeries = z.infer<typeof insertSeriesSchema>;
export type Playlist = typeof playlists.$inferSelect;
export type InsertPlaylist = z.infer<typeof insertPlaylistSchema>;
export type ViewHistory = typeof viewHistory.$inferSelect;
export type InsertViewHistory = z.infer<typeof insertViewHistorySchema>;
export type WatchLater = typeof watchLater.$inferSelect;
export type InsertWatchLater = z.infer<typeof insertWatchLaterSchema>;
export type AdminUser = typeof adminUsers.$inferSelect;
export type InsertAdminUser = z.infer<typeof insertAdminUserSchema>;

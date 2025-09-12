import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, boolean, timestamp, jsonb, numeric, unique, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: text("email").unique(), // Made nullable - either email or mobile required
  displayName: text("display_name"),
  photoURL: text("photo_url"),
  supabaseUid: text("supabase_uid").notNull().unique(),
  mobile: text("mobile").unique(), // Primary mobile field
  mobileNumber: text("mobile_number").unique(), // Legacy field - will be deprecated
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  // Ensure either email or mobile is present
  emailOrMobileCheck: sql`CHECK (("email" IS NOT NULL) OR ("mobile" IS NOT NULL))`,
  mobileIdx: index("users_mobile_idx").on(table.mobile),
}));

// VIDEOS are now strictly part of a Series. Stand-alone videos & category/contentType are removed.
export const videos = pgTable("videos", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  description: text("description"),
  duration: numeric("duration", { precision: 10, scale: 6 }).notNull(), // seconds
  thumbnailUrl: text("thumbnail_url").notNull(),
  videoUrl: text("video_url").notNull(),
  likes: integer("likes").default(0).notNull(),
  views: integer("views").default(0).notNull(),
  tags: jsonb("tags").$type<string[]>().default([]).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  // Foreign key – enforced in DB migration; kept as plain text here
  seriesId: text("series_id").notNull(),
  // Episode number must be unique within a series (index handled at DB level)
  episodeNumber: integer("episode_number").notNull(),
  cloudinaryPublicId: text("cloudinary_public_id"),
  streamingUrls: jsonb("streaming_urls"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const series = pgTable("series", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description"),
  // Category is retained in DB but optional & hidden from UI
  category: text("category"),
  thumbnailUrl: text("thumbnail_url").notNull(),
  bannerUrl: text("banner_url"),
  status: text("status").notNull().default('draft'), // draft | published | archived
  totalEpisodes: integer("total_episodes").default(0).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
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
  progress: numeric("progress", { precision: 10, scale: 6 }).default(sql`0`).notNull(), // in seconds with decimals
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
  progress: numeric("progress", { precision: 10, scale: 6 }).default(sql`0`).notNull(), // Last watched position
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

export const otpVerifications = pgTable("otp_verifications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  mobileNumber: text("mobile_number").notNull(),
  otp: text("otp").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  isUsed: boolean("is_used").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  usedAt: timestamp("used_at"),
  userId: text("user_id"), // Link to user if verification successful
}, (table) => ({
  mobileNumberIdx: index("otp_mobile_number_idx").on(table.mobileNumber),
  otpIdx: index("otp_otp_idx").on(table.otp),
  expiresAtIdx: index("otp_expires_at_idx").on(table.expiresAt),
}));

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const insertVideoSchema = createInsertSchema(videos).omit({
  id: true,
  likes: true,
  views: true,
  createdAt: true,
}); // episodeNumber & seriesId are required now

export const insertSeriesSchema = createInsertSchema(series).omit({
  id: true,
  totalEpisodes: true,
  createdAt: true,
  updatedAt: true,
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

export const insertOtpVerificationSchema = createInsertSchema(otpVerifications).omit({
  id: true,
  createdAt: true,
  usedAt: true,
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
export type OtpVerification = typeof otpVerifications.$inferSelect;
export type InsertOtpVerification = z.infer<typeof insertOtpVerificationSchema>;

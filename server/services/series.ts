// server/services/series.ts
import { storage } from "../storage";
import type { InsertSeries, Series, Video } from "@shared/schema";

export async function reorderEpisodes(
  seriesId: string,
  mappings: { videoId: string; episodeNumber: number }[],
): Promise<Video[]> {
  // Validate input quickly
  if (!seriesId) throw new Error("seriesId is required");
  if (!Array.isArray(mappings) || mappings.length === 0) {
    return storage.getVideosBySeries(seriesId);
  }

  console.log("Reordering episodes:", { seriesId, mappings });

  // First pass: Set temporary episode numbers to avoid constraint conflicts
  // Use negative numbers to avoid conflicts with positive episode numbers
  for (let i = 0; i < mappings.length; i++) {
    const { videoId } = mappings[i];
    const tempEpisodeNumber = -(1000 + i); // Use negative numbers
    console.log(`Step 1: Setting video ${videoId} to temp episode ${tempEpisodeNumber}`);
    await storage.updateVideo(videoId, { episode_number: tempEpisodeNumber } as any);
  }

  // Second pass: Set final episode numbers
  for (const { videoId, episodeNumber } of mappings) {
    console.log(`Step 2: Setting video ${videoId} to final episode ${episodeNumber}`);
    await storage.updateVideo(videoId, { episode_number: episodeNumber } as any);
  }

  // Update the series episode count
  await storage.updateSeriesEpisodeCount(seriesId);

  return storage.getVideosBySeries(seriesId);
}

export async function createSeries(data: InsertSeries): Promise<Series> {
  return storage.createSeries(data);
}

export async function updateSeries(
  id: string,
  data: Partial<InsertSeries>,
): Promise<Series | null> {
  return storage.updateSeries(id, data);
}

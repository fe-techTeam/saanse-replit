import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import type { VideoType } from "@/types/video";

export function useAllSeriesVideos(seriesId: string, enabled = true) {
  return useQuery<VideoType[]>({
    queryKey: ["/api/series", seriesId, "videos", "all"],
    queryFn: async () => {
      try {
        // Try the new endpoint first
        const response = await fetch(`/api/series/${seriesId}/videos/all`);
        if (response.ok) {
          const data = await response.json();
          return Array.isArray(data) ? data : [];
        } else {
          // Fallback to regular endpoint if new one fails
          console.warn('All videos endpoint failed, falling back to active videos only');
          return apiClient.get<VideoType[]>(`/api/series/${seriesId}/videos`);
        }
      } catch (error) {
        console.warn('Error fetching all videos, falling back to active videos only:', error);
        // Fallback to regular endpoint
        return apiClient.get<VideoType[]>(`/api/series/${seriesId}/videos`);
      }
    },
    enabled,
    staleTime: 10_000, // 10 seconds
    retry: 1,
  });
}
